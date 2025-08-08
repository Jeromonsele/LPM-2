import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

// Returns a signed URL to upload to Supabase Storage and creates a Source row
export async function POST(req: Request) {
  const { fileName, contentType, sizeBytes } = await req.json();
  if (!fileName || !contentType) return NextResponse.json({ error: "fileName and contentType required" }, { status: 400 });
  const cookieStore = await cookies();
  const currentOrgId = cookieStore.get("currentOrgId")?.value || undefined;
  const key = `${currentOrgId ?? "public"}/${Date.now()}_${fileName.replace(/[^a-z0-9._-]/gi, "_")}`;

  const { data, error } = await supabaseAdmin.storage.from("uploads").createSignedUploadUrl(key, {
    upsert: false,
    contentType,
  });
  if (error || !data) return NextResponse.json({ error: error?.message || "presign failed" }, { status: 500 });

  const source = await prisma.source.create({
    data: {
      kind: contentType.startsWith("audio/") ? "AUDIO" : contentType.startsWith("video/") ? "VIDEO" : "TEXT",
      originalName: fileName,
      mimeType: contentType,
      sizeBytes: sizeBytes ?? null,
      filePath: key,
      orgId: currentOrgId,
    },
  });

  return NextResponse.json({ uploadUrl: data.signedUrl, path: key, sourceId: source.id });
}


