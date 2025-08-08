"use client";
import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { diffLines } from "diff";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/Dialog";
import Skeleton from "@/components/ui/Skeleton";

type Sop = {
  id: string;
  title: string;
  contentMd: string;
  audience?: string | null;
  status: "DRAFT" | "PUBLISHED";
};

export default function Editor({ id }: { id: string }) {
  const [sop, setSop] = useState<Sop | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [versions, setVersions] = useState<Array<{ id: string; version: number; title: string; contentMd: string; audience?: string | null }>>([]);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<Array<{ id: string; role: "user" | "assistant"; content: string }>>([]);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/sop/${id}`);
      const data = await res.json();
      if (res.ok) setSop(data);
      const vRes = await fetch(`/api/sop/${id}/versions`);
      const v = await vRes.json();
      if (vRes.ok) setVersions(v);
      const cRes = await fetch(`/api/sop/${id}/chat`);
      const c = await cRes.json();
      if (cRes.ok) {
        setThreadId(c.threadId ?? null);
        setMessages(c.messages ?? []);
      }
    }
    load();
  }, [id]);

  async function save() {
    if (!sop) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/sop/${sop.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sop),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  const latestVersion = useMemo(() => versions[0], [versions]);
  const diff = useMemo(() => {
    if (!latestVersion || !sop) return [] as ReturnType<typeof diffLines>;
    return diffLines(latestVersion.contentMd, sop.contentMd);
  }, [latestVersion, sop]);

  async function ask() {
    if (!chatInput.trim()) return;
    const userMsg = { id: `local-${Date.now()}`, role: "user" as const, content: chatInput };
    setMessages((m) => [...m, userMsg]);
    setChatInput("");
    const res = await fetch(`/api/sop/${id}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: userMsg.content, threadId }),
    });
    const data = await res.json();
    if (res.ok) {
      setThreadId(data.threadId);
      setMessages((m) => [...m, data.message]);
    }
  }

  if (!sop) return (
    <main className="p-6 space-y-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-10 w-full" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Skeleton className="h-[60vh] w-full" />
        <Skeleton className="h-[60vh] w-full" />
      </div>
    </main>
  );

  return (
    <main className="mx-auto max-w-5xl p-6 space-y-6">
      <input
        className="w-full text-2xl font-semibold border-b p-2"
        value={sop.title}
        onChange={(e) => setSop({ ...sop, title: e.target.value })}
      />
      <div className="flex gap-3 items-center">
        <label className="text-sm">Audience:</label>
        <input
          className="border rounded p-1"
          value={sop.audience ?? ""}
          onChange={(e) => setSop({ ...sop, audience: e.target.value })}
          placeholder="e.g., SDRs"
        />
        <select
          className="border rounded p-1"
          value={sop.status}
          onChange={(e) => setSop({ ...sop, status: e.target.value as any })}
        >
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
        </select>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <textarea
          className="w-full h-[60vh] border rounded p-3 font-mono"
          value={sop.contentMd}
          onChange={(e) => setSop({ ...sop, contentMd: e.target.value })}
        />
        <div className="border rounded p-3 overflow-auto h-[60vh] prose max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{sop.contentMd}</ReactMarkdown>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="rounded bg-black text-white px-4 py-2 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
        <a
          className="rounded border px-4 py-2"
          href={`/api/export/${sop.id}`}
        >
          Export Markdown
        </a>
        <a
          className="rounded border px-4 py-2"
          href={`/api/export/${sop.id}/pdf`}
        >
          Export PDF
        </a>
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}

      <section className="space-y-2">
        <h3 className="font-semibold">Version history</h3>
        {latestVersion ? (
          <div className="text-sm border rounded p-3 bg-gray-50">
            <p className="mb-2">Latest saved version: v{latestVersion.version}</p>
            <div className="font-mono whitespace-pre-wrap">
              {diff.map((part, idx) => (
                <span key={idx} className={part.added ? "bg-green-100" : part.removed ? "bg-red-100 line-through" : ""}>
                  {part.value}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-600">No versions yet. Save to create v1.</p>
        )}
      </section>

      <section className="space-y-2 lg:hidden">
        <h3 className="font-semibold">Ask Alex about this SOP</h3>
        <div className="border rounded p-3 space-y-3">
          <div className="space-y-2 max-h-64 overflow-auto">
            {messages.map((m) => (
              <div key={m.id} className={m.role === "user" ? "text-right" : "text-left"}>
                <span className="inline-block rounded px-2 py-1 text-sm border">
                  {m.content}
                </span>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input className="flex-1 border rounded p-2" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Ask a question..." />
            <button onClick={ask} className="rounded bg-black text-white px-3 py-2">Send</button>
          </div>
        </div>
      </section>

      <section>
        <Dialog>
          <DialogTrigger className="rounded border px-4 py-2">Preview PDF</DialogTrigger>
          <DialogContent className="bg-white p-0 rounded-lg overflow-hidden">
            <DialogTitle className="sr-only">PDF Preview</DialogTitle>
            <iframe
              title="PDF Preview"
              className="w-[90vw] h-[80vh]"
              src={`/api/export/${sop.id}/pdf`}
            />
          </DialogContent>
        </Dialog>
      </section>
    </main>
  );
}


