"use client";
import { useEffect, useState } from "react";

type Org = { id: string; name: string };

export default function OrgSwitcher() {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [current, setCurrent] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/orgs");
        if (!res.ok) return;
        const data = await res.json();
        setOrgs(data.orgs || []);
        setCurrent(data.currentOrgId || data.orgs?.[0]?.id || "");
      } catch {}
    })();
  }, []);

  async function onChange(id: string) {
    setCurrent(id);
    await fetch("/api/orgs/select", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orgId: id }) });
    window.location.reload();
  }

  if (!orgs.length) return null;
  return (
    <div className="inline-flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-sm">
      <span className="hidden sm:inline">Org:</span>
      <select value={current} onChange={(e) => onChange(e.target.value)} className="bg-transparent outline-none">
        {orgs.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
      </select>
    </div>
  );
}


