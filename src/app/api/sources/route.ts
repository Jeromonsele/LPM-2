import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";

export const runtime = "nodejs";

export async function GET() {
  const cookieStore = await cookies();
  const currentOrgId = cookieStore.get("currentOrgId")?.value || undefined;
  const sources = await prisma.source.findMany({
    where: currentOrgId ? { orgId: currentOrgId } : {},
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json({ sources });
}


