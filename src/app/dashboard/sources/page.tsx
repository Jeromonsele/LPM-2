import prisma from "@/lib/prisma";
import { cookies } from "next/headers";

export const runtime = "nodejs";

export default async function SourcesPage() {
  const cookieStore = await cookies();
  const currentOrgId = cookieStore.get("currentOrgId")?.value || undefined;
  const sources = await prisma.source.findMany({ where: currentOrgId ? { orgId: currentOrgId } : {}, orderBy: { createdAt: "desc" } });
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Sources</h1>
      <div className="rounded-2xl border bg-white dark:bg-neutral-900 dark:border-neutral-800 divide-y">
        {sources.map((s) => (
          <div key={s.id} className="p-4 flex items-center justify-between hover:bg-neutral-50">
            <div>
              <div className="text-sm font-medium">{s.originalName ?? s.kind}</div>
              <div className="text-xs text-gray-500">{s.mimeType ?? "unknown"} • {s.sizeBytes ?? 0} bytes</div>
            </div>
            <a href={`/api/source/${s.id}`} className="text-xs underline" title="View JSON">Inspect</a>
          </div>
        ))}
        {sources.length === 0 && <div className="p-6 text-sm text-gray-500 text-center">No sources yet. Upload from the home page or create a source via API.</div>}
      </div>
    </div>
  );
}


