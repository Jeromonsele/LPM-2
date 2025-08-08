import Link from "next/link";
import { ReactNode } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import NavItem from "@/components/NavItem";
import OrgSwitcher from "@/components/OrgSwitcher";
import { FileUp, Mic, Plus, PanelLeft, LayoutList, Database, Repeat } from "lucide-react";

export const runtime = "nodejs";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-[240px_1fr]">
      <aside className="border-r bg-gray-50 dark:bg-neutral-950 hidden md:block">
        <div className="p-4 border-b">
          <Link href="/dashboard" className="font-semibold">Alex Dashboard</Link>
        </div>
        <nav className="p-2 space-y-1 text-sm">
          <NavItem href="/dashboard" icon={<LayoutList size={16} />}>Overview</NavItem>
          <NavItem href="/dashboard/sops" icon={<PanelLeft size={16} />}>SOPs</NavItem>
          <NavItem href="/dashboard/sources" icon={<Database size={16} />}>Sources</NavItem>
          <NavItem href="/dashboard/jobs" icon={<Repeat size={16} />}>Jobs</NavItem>
        </nav>
      </aside>
      <div className="flex flex-col min-h-screen">
        <header className="sticky top-0 z-10 bg-white/70 dark:bg-neutral-950/70 backdrop-blur border-b">
          <div className="mx-auto max-w-6xl p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="font-semibold hidden sm:block">Alex</Link>
            </div>
            <div className="flex items-center gap-2">
              {/* Split primary actions */}
              <Link href="/" className="inline-flex items-center gap-2 rounded-md bg-black text-white px-3 py-1.5 text-sm hover:opacity-90">
                <Plus size={16} /> New SOP
              </Link>
              <Link href="/" className="inline-flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-900" title="Upload file">
                <FileUp size={16} />
              </Link>
              <Link href="/" className="inline-flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-900" title="Record audio">
                <Mic size={16} />
              </Link>
              <OrgSwitcher />
              <ThemeToggle />
              <div className="text-sm text-gray-500 hidden sm:block">Alex</div>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-6xl w-full p-4 md:p-6">{children}</main>
        {/* Mobile bottom nav */}
        <nav className="md:hidden sticky bottom-0 bg-white dark:bg-neutral-950 border-t flex justify-around py-2 text-xs">
          <Link href="/dashboard" className="px-3 py-1 rounded">Overview</Link>
          <Link href="/dashboard/sops" className="px-3 py-1 rounded">SOPs</Link>
          <Link href="/" className="px-3 py-1 rounded">Upload</Link>
          <Link href="/dashboard/jobs" className="px-3 py-1 rounded">Jobs</Link>
        </nav>
      </div>
    </div>
  );
}


