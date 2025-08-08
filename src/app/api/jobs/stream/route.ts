import { NextResponse } from "next/server";
import { jobsEvents } from "@/lib/queue";

export const runtime = "nodejs";

// Simple SSE stream stub; hook this up to Redis pub/sub in Sprint 2
export async function GET(req: Request) {
  const encoder = new TextEncoder();
  const url = new URL(req.url);
  const targetJobId = url.searchParams.get("jobId");
  const stream = new ReadableStream({
    start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\n` + `data: ${JSON.stringify(data)}\n\n`));
      };
      const onCompleted = ({ jobId, returnvalue }: any) => {
        if (!targetJobId || targetJobId === String(jobId)) send("completed", { jobId, returnvalue });
      };
      const onFailed = ({ jobId, failedReason }: any) => {
        if (!targetJobId || targetJobId === String(jobId)) send("failed", { jobId, failedReason });
      };
      jobsEvents.on("completed", onCompleted);
      jobsEvents.on("failed", onFailed);
    },
  });
  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}


