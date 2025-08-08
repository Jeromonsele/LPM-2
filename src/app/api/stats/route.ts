import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { z } from "zod";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const daysParam = url.searchParams.get("days") ?? "7";
    const DaysSchema = z.enum(["7", "30", "90"], { required_error: "days required" });
    const daysStr = DaysSchema.safeParse(daysParam).success ? daysParam : "7";
    const days = parseInt(daysStr, 10);
    const cookieStore = await cookies();
    const currentOrgId = cookieStore.get("currentOrgId")?.value || undefined;
    const orgWhere = currentOrgId ? { orgId: currentOrgId } : {};
    const [sops, sources, jobs, recent, series] = await Promise.all([
      prisma.sop.count({ where: orgWhere }),
      prisma.source.count({ where: orgWhere }),
      prisma.job.count({ where: orgWhere }),
      prisma.sop.findMany({ where: orgWhere, orderBy: { updatedAt: "desc" }, take: 10, select: { id: true, title: true, audience: true, status: true, updatedAt: true } }),
      // lightweight time series for last 7 days of SOP updates
      (async () => {
        const today = new Date();
        const points = days === 30 ? 30 : days === 90 ? 90 : 7;
        const arr: { day: string; count: number }[] = [];
        for (let i = points - 1; i >= 0; i--) {
          const start = new Date(today);
          start.setHours(0, 0, 0, 0);
          start.setDate(start.getDate() - i);
          const end = new Date(start);
          end.setDate(end.getDate() + 1);
          const count = await prisma.sop.count({ where: { ...orgWhere, updatedAt: { gte: start, lt: end } } });
          arr.push({ day: start.toISOString().slice(0, 10), count });
        }
        return arr;
      })(),
    ]);
    // compute simple deltas from series
    const counts = series.map((s) => s.count);
    const split = Math.max(1, Math.floor(counts.length / 2));
    const firstHalf = counts.slice(0, split).reduce((a, b) => a + b, 0) || 1;
    const secondHalf = counts.slice(split).reduce((a, b) => a + b, 0);
    const sopsDeltaPct = ((secondHalf - firstHalf) / firstHalf) * 100;
    return NextResponse.json({ sops, sources, jobs, recent, series, sopsDeltaPct, days });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}


