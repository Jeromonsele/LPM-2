import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const [sops, sources, jobs] = await Promise.all([
      prisma.sop.count(),
      prisma.source.count(),
      prisma.job.count(),
    ]);
    return NextResponse.json({ ok: true, sops, sources, jobs });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message, stack: String(err?.stack || "") }, { status: 500 });
  }
}


