import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export default async function JobsPage() {
  const jobs = await prisma.job.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Jobs</h1>
      <div className="rounded border bg-white divide-y">
        {jobs.map((j) => (
          <div key={j.id} className="p-3 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">{j.type}</div>
              <div className="text-xs text-gray-500">{j.message ?? ""}</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-xs rounded px-2 py-1 border">{j.status}</div>
              <div className="w-32 h-2 bg-gray-200 rounded">
                <div className="h-2 bg-black rounded" style={{ width: `${j.progress}%` }} />
              </div>
            </div>
          </div>
        ))}
        {jobs.length === 0 && <div className="p-3 text-sm text-gray-500">No jobs yet</div>}
      </div>
    </div>
  );
}


