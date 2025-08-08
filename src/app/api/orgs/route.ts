import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { ensureDefaultOrg } from "@/lib/orgs";
import { cookies } from "next/headers";

export const runtime = "nodejs";

export async function GET() {
  const session = await getServerSession();
  if (!session?.user?.email) return NextResponse.json({ orgs: [] });
  const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } });
  if (!user) return NextResponse.json({ orgs: [] });
  await ensureDefaultOrg(user.id);
  const memberships = await prisma.membership.findMany({ where: { userId: user.id }, include: { org: true } });
  // currentOrgId could come from cookie later; default to first
  const cookieStore = await cookies();
  const cookieOrg = cookieStore.get("currentOrgId")?.value;
  const currentOrgId = cookieOrg || memberships[0]?.orgId;
  const res = NextResponse.json({ orgs: memberships.map(m => ({ id: m.org.id, name: m.org.name })), currentOrgId });
  if (!cookieOrg && currentOrgId) {
    res.cookies.set("currentOrgId", currentOrgId, { httpOnly: false, sameSite: "lax", path: "/" });
  }
  return res;
}


