"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Share2, Eye, FileDown } from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";

type Row = { id: string; title: string; audience?: string | null; status: string; updatedAt: string; owner?: string | null; tags?: string[] };

export default function RecentTable({ rows }: { rows: Row[] }) {
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    let filteredRows = rows;
    if (statusFilter) filteredRows = filteredRows.filter((r) => r.status === statusFilter);
    if (!t) return filteredRows;
    return filteredRows.filter((r) =>
      [r.title, r.audience ?? "", r.status].some((x) => x?.toLowerCase().includes(t))
    );
  }, [q, rows, statusFilter]);

  return (
    <div className="rounded-2xl border bg-white dark:bg-neutral-900 dark:border-neutral-800 overflow-hidden">
      <div className="p-3 border-b flex items-center gap-2 flex-wrap">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search recent SOPs..."
          className="w-full rounded-md border px-3 py-2 text-sm"
        />
        <div className="flex items-center gap-2 text-xs">
          <button onClick={() => setStatusFilter(null)} className={`px-2 py-1 rounded border ${statusFilter===null ? 'bg-neutral-100 dark:bg-neutral-800' : ''}`}>All</button>
          <button onClick={() => setStatusFilter('DRAFT')} className={`px-2 py-1 rounded border ${statusFilter==='DRAFT' ? 'bg-neutral-100 dark:bg-neutral-800' : ''}`}>Draft</button>
          <button onClick={() => setStatusFilter('PUBLISHED')} className={`px-2 py-1 rounded border ${statusFilter==='PUBLISHED' ? 'bg-neutral-100 dark:bg-neutral-800' : ''}`}>Published</button>
        </div>
      </div>
      <div className="divide-y">
        {filtered.length === 0 && (
          <div className="p-8 text-center text-sm text-neutral-500">No SOPs match your filters yet. Create one with the <span className="font-medium">New SOP</span> button.</div>
        )}
        {filtered.map((s) => (
          <div key={s.id} className="flex items-center justify-between p-4 hover:bg-neutral-50">
            <div className="min-w-0">
              <Link href={`/sop/${s.id}`} className="font-medium truncate block">{s.title}</Link>
              <div className="text-xs text-neutral-500 flex items-center gap-2">
                <span>{s.audience ?? "General"}</span>
                <span className="h-1 w-1 rounded-full bg-neutral-400 inline-block" />
                <span>{new Date(s.updatedAt).toLocaleString()}</span>
                {s.owner && (<><span className="h-1 w-1 rounded-full bg-neutral-400 inline-block" /><span>{s.owner}</span></>)}
                {s.tags && s.tags.length > 0 && (
                  <span className="flex flex-wrap gap-1">
                    {s.tags.slice(0,3).map((t) => (
                      <span key={t} className="rounded bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 text-[10px]">{t}</span>
                    ))}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] rounded px-2 py-1 border">{s.status}</span>
              <Tooltip.Provider>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <Link href={`/sop/${s.id}`} className="p-1.5 rounded border hover:bg-neutral-50 dark:hover:bg-neutral-800">
                      <Eye size={14} />
                    </Link>
                  </Tooltip.Trigger>
                  <Tooltip.Content side="top" className="rounded bg-black text-white text-xs px-2 py-1">Preview</Tooltip.Content>
                </Tooltip.Root>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <a href={`/api/export/${s.id}`} target="_blank" className="p-1.5 rounded border hover:bg-neutral-50 dark:hover:bg-neutral-800" rel="noreferrer">
                      <FileDown size={14} />
                    </a>
                  </Tooltip.Trigger>
                  <Tooltip.Content side="top" className="rounded bg-black text-white text-xs px-2 py-1">Export Markdown</Tooltip.Content>
                </Tooltip.Root>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <button className="p-1.5 rounded border hover:bg-neutral-50 dark:hover:bg-neutral-800">
                      <Share2 size={14} />
                    </button>
                  </Tooltip.Trigger>
                  <Tooltip.Content side="top" className="rounded bg-black text-white text-xs px-2 py-1">Share link</Tooltip.Content>
                </Tooltip.Root>
              </Tooltip.Provider>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="p-4 text-sm text-neutral-500">No results</div>
        )}
      </div>
    </div>
  );
}


