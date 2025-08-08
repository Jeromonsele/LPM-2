import Link from "next/link";
import BrandHeader from "@/components/BrandHeader";

export const dynamic = "force-dynamic";

export default function Landing() {
  return (
    <>
    <BrandHeader />
    <main className="mx-auto max-w-6xl p-6 grid gap-12">
      <section className="grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <h1 className="text-5xl font-extrabold tracking-tight">Turn expert knowledge into SOPs in one session.</h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-300">Upload transcripts, audio, or video and Alex produces a role‑tailored, editable SOP with versioning and exports.</p>
          <div className="flex gap-3">
            <Link href="/signup" className="btn-primary">Try Alex</Link>
            <Link href="/generate" className="btn-outline">Generate demo</Link>
          </div>
        </div>
        <div className="rounded-2xl border h-72 md:h-96 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/10 shadow-sm" />
      </section>
      <section className="grid md:grid-cols-3 gap-6">
        <div className="rounded-2xl border p-5 bg-white dark:bg-neutral-900 shadow-sm"><h3 className="font-medium">Upload</h3><p className="text-sm text-neutral-600 dark:text-neutral-300">Audio, video, text — all supported.</p></div>
        <div className="rounded-2xl border p-5 bg-white dark:bg-neutral-900 shadow-sm"><h3 className="font-medium">Generate</h3><p className="text-sm text-neutral-600 dark:text-neutral-300">AI turns knowledge into a professional SOP.</p></div>
        <div className="rounded-2xl border p-5 bg-white dark:bg-neutral-900 shadow-sm"><h3 className="font-medium">Export</h3><p className="text-sm text-neutral-600 dark:text-neutral-300">PDF/DOCX and share links.</p></div>
      </section>
    </main>
    </>
  );
}


