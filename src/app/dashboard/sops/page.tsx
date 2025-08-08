import prisma from "@/lib/prisma";
import Link from "next/link";

export const runtime = "nodejs";

export default async function SopsPage() {
  const sops = await prisma.sop.findMany({ orderBy: { updatedAt: "desc" } });
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">SOPs</h1>
      <div className="rounded border bg-white divide-y">
        {sops.map((s) => (
          <Link key={s.id} href={`/sop/${s.id}`} className="flex items-center justify-between p-3 hover:bg-gray-50">
            <div>
              <div className="font-medium">{s.title}</div>
              <div className="text-xs text-gray-500">{s.audience ?? "General"}</div>
            </div>
            <div className="text-xs rounded px-2 py-1 border">{s.status}</div>
          </Link>
        ))}
        {sops.length === 0 && <div className="p-3 text-sm text-gray-500">No SOPs yet</div>}
      </div>
    </div>
  );
}


