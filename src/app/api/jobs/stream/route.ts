import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "nodejs";

// Simple SSE stream stub; hook this up to Redis pub/sub in Sprint 2
export async function GET() {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode("event: ping\n" + `data: ${JSON.stringify({ ok: true })}\n\n`));
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


