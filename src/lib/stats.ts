import prisma from "@/lib/prisma";

export type StatsResult = {
  sops: number;
  sources: number;
  jobs: number;
  recent: { id: string; title: string; audience: string | null; status: string; updatedAt: Date }[];
  series: { day: string; count: number }[];
  sopsDeltaPct: number;
  days: 7 | 30 | 90;
};

export async function getStats(days: 7 | 30 | 90): Promise<StatsResult> {
  const [sops, sources, jobs, recent, series] = await Promise.all([
    prisma.sop.count(),
    prisma.source.count(),
    prisma.job.count(),
    prisma.sop.findMany({
      orderBy: { updatedAt: "desc" },
      take: 10,
      select: { id: true, title: true, audience: true, status: true, updatedAt: true },
    }),
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
        const count = await prisma.sop.count({ where: { updatedAt: { gte: start, lt: end } } });
        arr.push({ day: start.toISOString().slice(0, 10), count });
      }
      return arr;
    })(),
  ]);
  const counts = series.map((s) => s.count);
  const split = Math.max(1, Math.floor(counts.length / 2));
  const firstHalf = counts.slice(0, split).reduce((a, b) => a + b, 0) || 1;
  const secondHalf = counts.slice(split).reduce((a, b) => a + b, 0);
  const sopsDeltaPct = ((secondHalf - firstHalf) / firstHalf) * 100;
  return { sops, sources, jobs, recent, series, sopsDeltaPct, days };
}


