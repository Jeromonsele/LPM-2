import prisma from "@/lib/prisma";
import openai from "@/lib/openai";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "nodejs";

export async function POST(req: Request, ctx: { params: any }) {
  try {
    const p = ctx.params;
    const resolved = p && typeof p.then === "function" ? await p : p;
    const sopId: string | undefined = resolved?.id;
    if (!sopId) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    const { content, threadId } = await req.json();
    if (!content) return NextResponse.json({ error: "content required" }, { status: 400 });

    const cookieStore = await cookies();
    const currentOrgId = cookieStore.get("currentOrgId")?.value || undefined;
    const sop = await prisma.sop.findFirst({ where: { id: sopId, ...(currentOrgId ? { orgId: currentOrgId } : {}) } });
    if (!sop) return NextResponse.json({ error: "SOP not found" }, { status: 404 });

    let thread = threadId
      ? await prisma.chatThread.findUnique({ where: { id: threadId } })
      : null;
    if (!thread) {
      thread = await prisma.chatThread.create({ data: { sopId } });
    }

    await prisma.chatMessage.create({
      data: { role: "user", content, threadId: thread.id },
    });

    const system = `You are Alex, an SOP expert. Answer questions strictly based on the SOP content provided.`;
    const userPrompt = `SOP Content (Markdown):\n\n${sop.contentMd}\n\nQuestion: ${content}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.2,
    });
    const answer = completion.choices[0]?.message?.content ?? "";

    const assistant = await prisma.chatMessage.create({
      data: { role: "assistant", content: answer, threadId: thread.id },
    });

    return NextResponse.json({ threadId: thread.id, message: assistant });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}

export async function GET(_: Request, ctx: { params: any }) {
  const p = ctx.params;
  const resolved = p && typeof p.then === "function" ? await p : p;
  const sopId: string | undefined = resolved?.id;
  if (!sopId) return NextResponse.json({ messages: [] });
  const cookieStore = await cookies();
  const currentOrgId = cookieStore.get("currentOrgId")?.value || undefined;
  const thread = await prisma.chatThread.findFirst({ where: { sopId, ...(currentOrgId ? { sop: { orgId: currentOrgId } } : {}) }, orderBy: { createdAt: "desc" } });
  if (!thread) return NextResponse.json({ messages: [] });
  const messages = await prisma.chatMessage.findMany({ where: { threadId: thread.id }, orderBy: { createdAt: "asc" } });
  return NextResponse.json({ threadId: thread.id, messages });
}


