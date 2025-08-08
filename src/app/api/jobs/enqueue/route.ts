import { NextResponse } from "next/server";
import { jobsQueue, defaultOpts } from "@/lib/queue";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json();
  const job = await jobsQueue.add("job", body, defaultOpts);
  return NextResponse.json({ id: job.id });
}


