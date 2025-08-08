import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(_: Request, ctx: { params: any }) {
  try {
    const p = ctx.params;
    const resolved = p && typeof p.then === "function" ? await p : p;
    const id: string | undefined = resolved?.id;
    if (!id) return new Response(JSON.stringify({ error: "Missing id" }), { status: 400, headers: { "Content-Type": "application/json" } });
    const sop = await prisma.sop.findUnique({ where: { id } });
    if (!sop) return new Response(JSON.stringify({ error: "Not found" }), { status: 404, headers: { "Content-Type": "application/json" } });
    const filename = `${sop.title.replace(/[^a-z0-9\-\s]/gi, "").replace(/\s+/g, "-") || "sop"}.md`;
    return new Response(sop.contentMd, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err: any) {
    console.error("GET /api/export/[id] error", err);
    return new Response(JSON.stringify({ error: err.message || "Internal error" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}


