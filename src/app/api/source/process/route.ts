import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { jobsQueue, defaultOpts } from "@/lib/queue";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { sourceId } = await req.json();
  if (!sourceId) return NextResponse.json({ error: "sourceId required" }, { status: 400 });

  const source = await prisma.source.findUnique({ where: { id: sourceId } });
  if (!source) return NextResponse.json({ error: "Source not found" }, { status: 404 });

  const job = await prisma.job.create({
    data: {
      type: "ANALYZE_SOURCE",
      status: "QUEUED",
      progress: 0,
      message: "Queued for processing",
      sourceId: source.id,
      orgId: source.orgId ?? undefined,
    },
  });

  await jobsQueue.add(
    "job",
    { kind: "PROCESS_SOURCE", sourceId: source.id, orgId: source.orgId ?? undefined, jobId: job.id },
    defaultOpts
  );

  return NextResponse.json({ jobId: job.id });
}


