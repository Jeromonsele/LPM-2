import { Worker } from "bullmq";
import IORedis from "ioredis";
import prisma from "@/lib/prisma";
import openai from "@/lib/openai";

const connection = new IORedis(process.env.REDIS_URL || "redis://localhost:6379");

new Worker(
  "jobs",
  async (job) => {
    const data: any = job.data;
    if (data.kind === "TRANSCRIBE") {
      const src = await prisma.source.findUnique({ where: { id: data.sourceId } });
      if (!src) throw new Error("Source not found");
      // In production, stream from Supabase Storage and call Whisper; here we no-op
      await prisma.source.update({ where: { id: src.id }, data: { transcriptText: src.transcriptText ?? "" } });
      return { ok: true };
    }
    if (data.kind === "EXPORT_DOCX") {
      return { ok: true };
    }
    return { ok: false };
  },
  { connection }
);

console.log("Worker started");


