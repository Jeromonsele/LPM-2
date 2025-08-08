import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "nodejs";

export async function GET(_: Request, context: any) {
  const cookieStore = await cookies();
  const currentOrgId = cookieStore.get("currentOrgId")?.value || undefined;
  const job = await prisma.job.findFirst({ where: { id: context.params.id, ...(currentOrgId ? { orgId: currentOrgId } : {}) } });
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(job);
}


