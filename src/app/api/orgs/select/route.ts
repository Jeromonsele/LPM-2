import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { orgId } = await req.json();
  const res = NextResponse.json({ ok: true });
  res.cookies.set("currentOrgId", orgId, { httpOnly: false, sameSite: "lax", path: "/" });
  return res;
}


