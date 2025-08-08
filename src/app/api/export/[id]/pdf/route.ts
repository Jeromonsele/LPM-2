/** @jsxImportSource react */
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import React from "react";
import { Document, Page, Text, StyleSheet, View, pdf } from "@react-pdf/renderer";

export const runtime = "nodejs";

function PdfDoc({ title, content }: { title: string; content: string }) {
  const styles = StyleSheet.create({
    page: { padding: 24 },
    h1: { fontSize: 20, marginBottom: 8, fontWeight: 700 },
    body: { fontSize: 12, lineHeight: 1.4 },
  });
  return React.createElement(
    Document,
    null,
    React.createElement(
      Page as any,
      { size: "A4", style: styles.page },
      React.createElement(Text as any, { style: styles.h1 }, title),
      React.createElement(
        View as any,
        null,
        React.createElement(Text as any, { style: styles.body }, content)
      )
    )
  );
}

export async function GET(_: Request, ctx: { params: any }) {
  const p = ctx.params;
  const resolved = p && typeof p.then === "function" ? await p : p;
  const id: string | undefined = resolved?.id;
  if (!id) return new NextResponse("Missing id", { status: 400 });
  const sop = await prisma.sop.findUnique({ where: { id } });
  if (!sop) return new NextResponse("Not found", { status: 404 });

  const element = React.createElement(PdfDoc, { title: sop.title, content: sop.contentMd });
  const nodeBuffer: Buffer = await (pdf(element) as any).toBuffer();
  const arrayBuffer = nodeBuffer.buffer.slice(
    nodeBuffer.byteOffset,
    nodeBuffer.byteOffset + nodeBuffer.byteLength
  );
  const filename = `${sop.title.replace(/[^a-z0-9\-\s]/gi, "").replace(/\s+/g, "-") || "sop"}.pdf`;
  return new NextResponse(arrayBuffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}


