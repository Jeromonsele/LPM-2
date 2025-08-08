"use client";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function Home() {
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
    <main className="mx-auto max-w-4xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Alex — SOP Expert System</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-3">
            <label className="block text-sm font-medium">Upload assets</label>
            <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            <button onClick={onUpload} className="rounded border px-3 py-1">Analyze</button>
            {jobId && (
              <div className="text-sm">
                <div className="h-2 bg-gray-200 rounded">
                  <div className="h-2 bg-black rounded" style={{ width: `${jobProgress}%` }} />
                </div>
                <p className="mt-1">{jobStatus ?? "Analyzing..."}</p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded border p-2"
              placeholder="SOP title"
            />
          </div>
          <div className="space-y-3">
            <label className="block text-sm font-medium">Audience (optional)</label>
            <input
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="w-full rounded border p-2"
              placeholder="e.g., SDRs, Customer Success, On-call Engineers"
            />
          </div>
          <div className="space-y-3">
            <label className="block text-sm font-medium">Transcript / Notes</label>
            <textarea
              value={transcriptText}
              onChange={(e) => setTranscriptText(e.target.value)}
              className="w-full rounded border p-2 h-48"
              placeholder="Paste meeting transcript, bullet notes, or raw steps..."
            />
          </div>
          <button
            onClick={generate}
            disabled={loading || !transcriptText}
            className="rounded bg-black text-white px-4 py-2 disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate SOP"}
          </button>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          {sopId && (
            <div className="border-t pt-4">
              <a
                className="text-blue-600 underline"
                href={`/sop/${sopId}`}
              >
                View SOP →
              </a>
            </div>
          )}
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Live Preview</h2>
            {sopId && <a className="text-sm underline" href={`/sop/${sopId}`}>Open Editor</a>}
          </div>
          <div className="border rounded p-4 prose max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{preview || "Generated SOP preview will appear here."}</ReactMarkdown>
          </div>
        </div>
      </div>
    </main>
  );
}
