import prisma from "@/lib/prisma";

export async function ensureDefaultOrg(userId: string) {
  const membership = await prisma.membership.findFirst({ where: { userId } });
  if (membership) return membership.orgId;
  const org = await prisma.organization.create({ data: { name: "My Organization" } });
  await prisma.membership.create({ data: { userId, orgId: org.id, role: "OWNER" as any } });
  return org.id;
}


