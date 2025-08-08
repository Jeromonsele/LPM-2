import Link from "next/link";

export default function BrandHeader({ cta }: { cta?: boolean }) {
  return (
    <header className="sticky top-0 z-20 border-b bg-white/70 dark:bg-neutral-950/70 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-semibold tracking-tight">Alex</Link>
        <nav className="hidden sm:flex items-center gap-6 text-sm text-neutral-600 dark:text-neutral-300">
          <Link href="/pricing" className="hover:underline">Pricing</Link>
          <Link href="/about" className="hover:underline">About</Link>
          <Link href="/contact" className="hover:underline">Contact</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login" className="btn-outline">Log in</Link>
          {cta !== false && <Link href="/signup" className="btn-primary">Try Alex</Link>}
        </div>
      </div>
    </header>
  );
}


