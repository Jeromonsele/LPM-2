import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { cookies } from "next/headers";

export const runtime = "nodejs";

export async function GET(_: Request, ctx: { params: any }) {
  try {
    const p = ctx.params;
    const resolved = p && typeof p.then === "function" ? await p : p;
    const id: string | undefined = resolved?.id;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const currentOrgId = cookies().get("currentOrgId")?.value || undefined;
    const sop = await prisma.sop.findFirst({ where: { id, ...(currentOrgId ? { orgId: currentOrgId } : {}) } });
    if (!sop) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(sop);
  } catch (err: any) {
    console.error("GET /api/sop/[id] error", err);
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}

export async function PUT(req: Request, ctx: { params: any }) {
  try {
    const p = ctx.params;
    const resolved = p && typeof p.then === "function" ? await p : p;
    const id: string | undefined = resolved?.id;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const currentOrgId = cookies().get("currentOrgId")?.value || undefined;
    const body = await req.json();
    const sop = await prisma.sop.update({
      where: { id },
      data: {
        title: body.title,
        contentMd: body.contentMd,
        audience: body.audience,
        status: body.status,
        ...(currentOrgId ? { orgId: currentOrgId } : {}),
      },
    });
    const latest = await prisma.sopVersion.findFirst({ where: { sopId: sop.id }, orderBy: { version: "desc" } });
    const nextVersion = (latest?.version ?? 0) + 1;
    await prisma.sopVersion.create({
      data: {
        sopId: sop.id,
        version: nextVersion,
        title: sop.title,
        audience: sop.audience ?? undefined,
        contentMd: sop.contentMd,
      },
    });
    return NextResponse.json(sop);
  } catch (err: any) {
    console.error("PUT /api/sop/[id] error", err);
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}


