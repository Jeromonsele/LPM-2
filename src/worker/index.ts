import { Worker } from "bullmq";
import IORedis from "ioredis";
import prisma from "@/lib/prisma";
import openai from "@/lib/openai";
import { supabaseAdmin } from "@/lib/supabase";

const connection = new IORedis(process.env.REDIS_URL || "redis://localhost:6379");

new Worker(
  "jobs",
  async (job) => {
    const data: any = job.data;
    
    if (data.kind === "PROCESS_SOURCE") {
      const src = await prisma.source.findUnique({ where: { id: data.sourceId } });
      if (!src) throw new Error("Source not found");
      await prisma.job.update({ where: { id: data.jobId }, data: { status: "RUNNING", message: "Processing source", progress: 10 } });
      const isText = (src.mimeType || "").startsWith("text/") || /\.(md|txt)$/i.test(src.originalName || "");
      const isPdf = src.mimeType === "application/pdf" || /\.pdf$/i.test(src.originalName || "");
      const isDocx = src.mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || /\.docx$/i.test(src.originalName || "");
      const isMedia = (src.mimeType || "").startsWith("audio/") || (src.mimeType || "").startsWith("video/") || /\.(mp3|m4a|wav|mp4|mov)$/i.test(src.originalName || "");
      if (isMedia) {
        await prisma.job.update({ where: { id: data.jobId }, data: { message: "Transcribing", progress: 20 } });
        // Reuse TRANSCRIBE path
        await jobsQueue.add("job", { kind: "TRANSCRIBE", sourceId: src.id, jobId: data.jobId }, { attempts: 3, backoff: { type: "exponential", delay: 2000 } });
        return { ok: true, delegated: "TRANSCRIBE" };
      }
      // For text/pdf/docx, we assume inline already handled at upload or future worker extraction
      await prisma.job.update({ where: { id: data.jobId }, data: { status: "SUCCEEDED", message: "Processed", progress: 100 } });
      return { ok: true };
    }

    if (data.kind === "TRANSCRIBE") {
      const src = await prisma.source.findUnique({ where: { id: data.sourceId } });
      if (!src) throw new Error("Source not found");
      
      // Update job status
      const jobRecord = await prisma.job.findFirst({
        where: { sourceId: data.sourceId, type: "ANALYZE_SOURCE" },
        orderBy: { createdAt: "desc" },
      });
      
      if (jobRecord) {
        await prisma.job.update({
          where: { id: jobRecord.id },
          data: { status: "RUNNING", progress: 20, message: "Retrieving file from storage" },
        });
      }

      // Skip if already transcribed or not audio/video
      if (src.transcriptText || !src.filePath) {
        return { ok: true, skipped: true };
      }

      // Check if it's an audio/video file
      const isAudioVideo = src.mimeType && (
        src.mimeType.startsWith("audio/") || 
        src.mimeType.startsWith("video/") ||
        /\.(mp3|m4a|wav|mp4|mov)$/i.test(src.originalName || "")
      );

      if (!isAudioVideo) {
        return { ok: true, skipped: true };
      }

      try {
        // Download file from Supabase Storage
        const { data: fileData, error } = await supabaseAdmin.storage
          .from("uploads")
          .download(src.filePath);
        
        if (error || !fileData) {
          throw new Error(`Failed to download file: ${error?.message || "Unknown error"}`);
        }

        if (jobRecord || data.jobId) {
          await prisma.job.update({
            where: { id: data.jobId || jobRecord!.id },
            data: { status: "RUNNING", progress: 40, message: "Transcribing with Whisper" },
          });
        }

        // Convert Blob to File for Whisper API
        const arrayBuffer = await fileData.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const file = new File([buffer], src.originalName || "audio", { 
          type: src.mimeType || "audio/mpeg" 
        });

        // Call Whisper API
        const transcript = await openai.audio.transcriptions.create({
          model: "whisper-1",
          file: file,
        });

        // Update source with transcript
        await prisma.source.update({
          where: { id: src.id },
          data: { transcriptText: transcript.text },
        });

        if (jobRecord || data.jobId) {
          await prisma.job.update({
            where: { id: data.jobId || jobRecord!.id },
            data: { status: "SUCCEEDED", progress: 100, message: "Transcription complete" },
          });
        }

        return { ok: true, transcript: transcript.text.slice(0, 100) + "..." };
      } catch (error: any) {
        console.error("Transcription error:", error);
        
        if (jobRecord || data.jobId) {
          await prisma.job.update({
            where: { id: data.jobId || jobRecord!.id },
            data: { 
              status: "FAILED", 
              progress: 0, 
              message: `Transcription failed: ${error.message}` 
            },
          });
        }
        
        throw error;
      }
    }
    
    if (data.kind === "EXPORT_DOCX") {
      // TODO: Implement DOCX export
      return { ok: true };
    }
    
    return { ok: false };
  },
  { connection, concurrency: 2 }
);

console.log("Worker started with Supabase Storage integration");


