"use client";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import BrandHeader from "@/components/BrandHeader";

export default function GeneratePage() {
  const [transcriptText, setTranscriptText] = useState("");
  const [title, setTitle] = useState("Alex SOP Draft");
  const [audience, setAudience] = useState("");
  const [loading, setLoading] = useState(false);
  const [sopId, setSopId] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<string | null>(null);
  const [jobProgress, setJobProgress] = useState<number>(0);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let timer: any;
    if (jobId) {
      timer = setInterval(async () => {
        const res = await fetch(`/api/jobs/${jobId}`);
        const data = await res.json();
        if (res.ok) {
          setJobStatus(`${data.status}${data.message ? `: ${data.message}` : ""}`);
          setJobProgress(data.progress ?? 0);
          if (data.status === "SUCCEEDED" || data.status === "FAILED") {
            clearInterval(timer);
          }
        }
      }, 1000);
    }
    return () => timer && clearInterval(timer);
  }, [jobId]);

  async function onUpload() {
    if (!file) return;
    setError(null);
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: form });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Upload failed");
      return;
    }
    setJobId(data.jobId);
  }

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcriptText, title, audience }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate");
      setSopId(data.id);
      setPreview(data.contentMd || "");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <BrandHeader />
      <main className="mx-auto max-w-6xl p-6 space-y-8">
        <h1 className="text-3xl font-bold tracking-tight">Generate an SOP</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border bg-white dark:bg-neutral-900 shadow-sm p-5 space-y-5">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Upload assets</label>
              <div className="flex items-center gap-2">
                <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="block w-full text-sm" />
                <button onClick={onUpload} className="btn-outline">Analyze</button>
              </div>
              {jobId && (
                <div className="text-sm">
                  <div className="h-2 bg-neutral-200 dark:bg-neutral-800 rounded">
                    <div className="h-2 bg-black dark:bg-white rounded" style={{ width: `${jobProgress}%` }} />
                  </div>
                  <p className="mt-1 text-neutral-600 dark:text-neutral-300">{jobStatus ?? "Analyzing..."}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-md border px-3 py-2"
                placeholder="SOP title"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Audience (optional)</label>
              <input
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="w-full rounded-md border px-3 py-2"
                placeholder="e.g., SDRs, Customer Success, On-call Engineers"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Transcript / Notes</label>
              <textarea
                value={transcriptText}
                onChange={(e) => setTranscriptText(e.target.value)}
                className="w-full rounded-md border px-3 py-2 h-48"
                placeholder="Paste meeting transcript, bullet notes, or raw steps..."
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={generate}
                disabled={loading || !transcriptText}
                className="btn-primary disabled:opacity-50"
              >
                {loading ? "Generating..." : "Generate SOP"}
              </button>
              {sopId && (
                <a className="text-sm underline" href={`/sop/${sopId}`}>Open Editor</a>
              )}
            </div>
            {error && <p className="text-red-600 text-sm">{error}</p>}
          </div>
          <div className="rounded-2xl border bg-white dark:bg-neutral-900 shadow-sm p-5">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">Live Preview</h2>
              {sopId && <a className="text-sm underline" href={`/sop/${sopId}`}>Open Editor</a>}
            </div>
            <div className="prose max-w-none dark:prose-invert">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {preview || "Generated SOP preview will appear here."}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}


