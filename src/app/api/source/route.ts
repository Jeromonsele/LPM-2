import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";

export const runtime = "nodejs";

const bodySchema = z.object({
  kind: z.enum(["TEXT", "AUDIO", "VIDEO"]),
  originalName: z.string().optional(),
  mimeType: z.string().optional(),
  sizeBytes: z.number().int().optional(),
  transcriptText: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const input = bodySchema.parse(json);
    const cookieStore = await cookies();
    const currentOrgId = cookieStore.get("currentOrgId")?.value || undefined;
    const created = await prisma.source.create({
      data: {
        kind: input.kind as any,
        originalName: input.originalName,
        mimeType: input.mimeType,
        sizeBytes: input.sizeBytes,
        transcriptText: input.transcriptText,
        notes: input.notes,
        orgId: currentOrgId,
      },
    });
    return NextResponse.json(created);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}


