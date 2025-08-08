import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// SSE stream for real-time job status updates
export async function GET(req: NextRequest) {
  const jobId = req.nextUrl.searchParams.get("jobId");
  if (!jobId) {
    return new Response("Missing jobId parameter", { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (data: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      let previousStatus = "";
      let previousProgress = -1;
      let attempts = 0;
      const maxAttempts = 120; // 2 minutes max

      const interval = setInterval(async () => {
        try {
          attempts++;
          const job = await prisma.job.findUnique({
            where: { id: jobId },
            select: {
              id: true,
              status: true,
              progress: true,
              message: true,
              updatedAt: true,
            },
          });

          if (!job) {
            sendEvent({ error: "Job not found" });
            clearInterval(interval);
            controller.close();
            return;
          }

          // Send update if status or progress changed
          if (job.status !== previousStatus || job.progress !== previousProgress || attempts === 1) {
            sendEvent({
              id: job.id,
              status: job.status,
              progress: job.progress,
              message: job.message,
              updatedAt: job.updatedAt,
            });
            previousStatus = job.status;
            previousProgress = job.progress;
          }

          // Close stream on terminal states
          if (job.status === "SUCCEEDED" || job.status === "FAILED") {
            setTimeout(() => {
              clearInterval(interval);
              controller.close();
            }, 100);
          }

          // Timeout after max attempts
          if (attempts >= maxAttempts) {
            sendEvent({ error: "Stream timeout" });
            clearInterval(interval);
            controller.close();
          }
        } catch (error) {
          console.error("Stream error:", error);
          sendEvent({ error: "Stream error" });
          clearInterval(interval);
          controller.close();
        }
      }, 1000); // Poll every second

      // Cleanup on client disconnect
      req.signal?.addEventListener("abort", () => {
        clearInterval(interval);
        controller.close();
      });
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


