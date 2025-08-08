import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import openai from "@/lib/openai";

export const runtime = "nodejs";

const bodySchema = z.object({
  sourceId: z.string().optional(),
  transcriptText: z.string().optional(),
  title: z.string().min(3).max(140).optional(),
  audience: z.string().optional(),
});

function sopSystemPrompt(audience?: string) {
  return `You are Alex, an SOP expert. Convert the provided knowledge into a clear, actionable SOP in Markdown. Use numbered steps, prerequisites, tools, decision points, and quality checks. ${audience ? `Tailor for: ${audience}.` : ""}`;
}

function sopUserPrompt(transcript: string, title?: string) {
  return `Input Knowledge${title ? ` (Title: ${title})` : ""}:
\n\n${transcript}\n\nOutput a professional SOP in Markdown with sections: Title, Purpose, Prerequisites, Roles, Tools, Step-by-step Procedure, Quality Checks, FAQs.`;
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const input = bodySchema.parse(json);

    let transcript = input.transcriptText ?? "";
    let sourceId: string | undefined = input.sourceId;
    if (!transcript && sourceId) {
      const src = await prisma.source.findUnique({ where: { id: sourceId } });
      if (!src) return NextResponse.json({ error: "Source not found" }, { status: 404 });
      transcript = src.transcriptText ?? "";
    }
    if (!transcript) {
      return NextResponse.json({ error: "Missing transcriptText or sourceId" }, { status: 400 });
    }

    const system = sopSystemPrompt(input.audience);
    const user = sopUserPrompt(transcript, input.title);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.3,
    });

    const content = completion.choices[0]?.message?.content ?? "";
    const sop = await prisma.sop.create({
      data: {
        title: input.title ?? "Standard Operating Procedure",
        audience: input.audience,
        contentMd: content,
        status: "DRAFT",
        sourceId,
      },
    });

    return NextResponse.json(sop);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}


