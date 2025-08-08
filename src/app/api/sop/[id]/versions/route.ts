import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "nodejs";

export async function GET(_: Request, ctx: { params: any }) {
  try {
    const p = ctx.params;
    const resolved = p && typeof p.then === "function" ? await p : p;
    const id: string | undefined = resolved?.id;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    const cookieStore = await cookies();
    const currentOrgId = cookieStore.get("currentOrgId")?.value || undefined;
    const versions = await prisma.sopVersion.findMany({
      where: { sopId: id, ...(currentOrgId ? { sop: { orgId: currentOrgId } } : {}) },
      orderBy: { version: "desc" },
    });
    return NextResponse.json(versions);
  } catch (err: any) {
    console.error("GET /api/sop/[id]/versions error", err);
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}


