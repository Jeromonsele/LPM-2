import prisma from "@/lib/prisma";
import openai from "@/lib/openai";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { promises as fs } from "fs";
import path from "path";
import { jobsQueue, defaultOpts } from "@/lib/queue";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const uploadsDir = path.join(process.cwd(), "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });
    const safeName = file.name.replace(/[^a-z0-9\-_.]/gi, "_");
    const filePath = path.join(uploadsDir, `${Date.now()}_${safeName}`);
    await fs.writeFile(filePath, buffer);

    const cookieStore = await cookies();
    const currentOrgId = cookieStore.get("currentOrgId")?.value || undefined;
    const source = await prisma.source.create({
      data: {
        kind: "TEXT",
        originalName: file.name,
        mimeType: file.type || undefined,
        sizeBytes: buffer.length,
        filePath,
        orgId: currentOrgId,
      },
    });

    // Create analysis job and perform a simple analysis (if text-based)
    const job = await prisma.job.create({
      data: {
        type: "ANALYZE_SOURCE",
        status: "RUNNING",
        progress: 10,
        message: "Reading file",
        sourceId: source.id,
        orgId: currentOrgId,
      },
    });

    let transcriptText: string | null = null;
    
    // Handle text files
    if ((file.type || "").startsWith("text/") || /\.(md|txt)$/i.test(file.name)) {
      const text = buffer.toString("utf-8");
      transcriptText = text.slice(0, 200_000);
    } 
    // Handle PDF files
    else if (file.type === "application/pdf" || /\.pdf$/i.test(file.name)) {
      await prisma.job.update({ where: { id: job.id }, data: { message: "Extracting PDF text", progress: 20 } });
      try {
        const pdfData = await pdfParse(buffer);
        transcriptText = pdfData.text.slice(0, 200_000);
        await prisma.job.update({ where: { id: job.id }, data: { message: "PDF text extracted", progress: 80 } });
      } catch (e: any) {
        console.error("PDF parsing error:", e);
        await prisma.job.update({ where: { id: job.id }, data: { status: "FAILED", message: "PDF extraction failed" } });
        return NextResponse.json({ error: "PDF extraction failed" }, { status: 500 });
      }
    }
    // Handle DOCX files
    else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || /\.docx$/i.test(file.name)) {
      await prisma.job.update({ where: { id: job.id }, data: { message: "Extracting DOCX text", progress: 20 } });
      try {
        const result = await mammoth.extractRawText({ buffer });
        transcriptText = result.value.slice(0, 200_000);
        await prisma.job.update({ where: { id: job.id }, data: { message: "DOCX text extracted", progress: 80 } });
      } catch (e: any) {
        console.error("DOCX parsing error:", e);
        await prisma.job.update({ where: { id: job.id }, data: { status: "FAILED", message: "DOCX extraction failed" } });
        return NextResponse.json({ error: "DOCX extraction failed" }, { status: 500 });
      }
    }
    // Handle audio/video files
    else if ((file.type || "").startsWith("audio/") || (file.type || "").startsWith("video/") || /\.(mp3|m4a|wav|mp4|mov)$/i.test(file.name)) {
      await prisma.job.update({ where: { id: job.id }, data: { message: "Transcribing", status: "RUNNING", progress: 20 } });
      try {
        const audio = new Blob([buffer], { type: file.type || "audio/mpeg" });
        const transcript = await openai.audio.transcriptions.create({
          model: "whisper-1",
          file: new File([audio], file.name, { type: file.type || "audio/mpeg" }),
        } as any);
        transcriptText = (transcript as any)?.text ?? null;
        await prisma.job.update({ where: { id: job.id }, data: { message: "Transcribed", progress: 80 } });
      } catch (e: any) {
        await prisma.job.update({ where: { id: job.id }, data: { status: "FAILED", message: e.message ?? "Transcription failed" } });
        return NextResponse.json({ error: "Transcription failed" }, { status: 500 });
      }
    }

    await prisma.source.update({
      where: { id: source.id },
      data: { transcriptText },
    });

    await prisma.job.update({
      where: { id: job.id },
      data: { status: "SUCCEEDED", progress: 100, message: "Analysis complete" },
    });

    // Enqueue transcription in worker (for audio/video in production)
    await jobsQueue.add("job", { kind: "TRANSCRIBE", sourceId: source.id, orgId: currentOrgId }, defaultOpts);
    return NextResponse.json({ sourceId: source.id, jobId: job.id });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}


