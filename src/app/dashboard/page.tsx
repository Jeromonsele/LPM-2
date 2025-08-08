import Link from "next/link";
import StatCard from "@/components/dashboard/StatCard";
import RecentTable from "@/components/dashboard/RecentTable";
import Skeleton from "@/components/ui/Skeleton";
import { BarChart4, Database, Repeat } from "lucide-react";
import { Suspense } from "react";
import { getStats } from "@/lib/stats";

export const runtime = "nodejs";

function TimeframeControls({ current }: { current: '7'|'30'|'90' }) {
  // Server Component buttons that just link to the same page with a query param; the server will honor it
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-neutral-500">Timeframe</span>
      <div className="inline-flex rounded-md border overflow-hidden">
        <a href="/dashboard?days=7" className={`px-3 py-1.5 hover:bg-neutral-50 ${current==='7'?'bg-neutral-50 dark:bg-neutral-900':''}`}>7d</a>
        <a href="/dashboard?days=30" className={`px-3 py-1.5 hover:bg-neutral-50 border-l ${current==='30'?'bg-neutral-50 dark:bg-neutral-900':''}`}>30d</a>
        <a href="/dashboard?days=90" className={`px-3 py-1.5 hover:bg-neutral-50 border-l ${current==='90'?'bg-neutral-50 dark:bg-neutral-900':''}`}>90d</a>
      </div>
    </div>
  );
}

async function Stats({ days }: { days: '7'|'30'|'90' }) {
  const data = await getStats(days as any);
  const sopsCount = data.sops ?? 0;
  const sourcesCount = data.sources ?? 0;
  const jobsCount = data.jobs ?? 0;
  const recentSops = (data.recent ?? []).map(r => ({ ...r, updatedAt: r.updatedAt.toISOString() }));
  const series = (data.series as { day: string; count: number }[]) ?? [];
  const sopsDeltaPct = data.sopsDeltaPct as number | undefined;
  const spark = series.map((s: any) => s.count);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Overview</h1>
        <TimeframeControls current={days} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="SOPs" value={sopsCount} icon={<BarChart4 size={20} />} gradient="bg-gradient-to-br from-violet-500 to-fuchsia-500" deltaPct={typeof sopsDeltaPct === 'number' ? sopsDeltaPct : undefined} sparkline={spark} href="/dashboard/sops" />
        <StatCard label="Sources" value={sourcesCount} icon={<Database size={20} />} gradient="bg-gradient-to-br from-sky-500 to-cyan-400" href="/dashboard/sources" />
        <StatCard label="Jobs" value={jobsCount} icon={<Repeat size={20} />} gradient="bg-gradient-to-br from-emerald-500 to-lime-400" href="/dashboard/jobs" />
      </div>
      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Recent SOPs</h2>
        {/* Preserve filters via URL params in a real implementation */}
        <RecentTable rows={recentSops} />
      </section>
    </div>
  );
}

export default function OverviewPage({ searchParams }: { searchParams: { days?: '7'|'30'|'90' } }) {
  const days = (searchParams?.days ?? '7') as '7'|'30'|'90';
  return (
    <Suspense fallback={<div className="space-y-4"><Skeleton className="h-10 w-40" /><div className="grid grid-cols-1 sm:grid-cols-3 gap-4"><Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" /></div><Skeleton className="h-10 w-48" /><Skeleton className="h-40" /></div>}>
      {/* This is an async Server Component */}
      {/* @ts-ignore */}
      <Stats days={days} />
    </Suspense>
  );
}


