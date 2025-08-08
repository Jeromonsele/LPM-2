"use client";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

// Simple dark mode toggle that persists to localStorage and toggles the `dark` class on <html>
export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("theme") : null;
    const prefersDark = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = stored ? stored === "dark" : prefersDark;
    setIsDark(initial);
    document.documentElement.classList.toggle("dark", initial);
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {}
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle dark mode"
      className="inline-flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
      title={isDark ? "Switch to light" : "Switch to dark"}
    >
      {isDark ? <Moon size={16} /> : <Sun size={16} />}
      <span className="hidden sm:inline">{isDark ? "Dark" : "Light"}</span>
    </button>
  );
}


