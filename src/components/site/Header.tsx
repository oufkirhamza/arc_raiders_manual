"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, Search, X } from "lucide-react";
import { SideNav } from "./SideNav";

export function Logo() {
  return (
    <Link href="/" className="group flex items-center gap-2.5" aria-label="ARC Field Manual — home">
      <span className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-sm bg-accent text-accent-ink" aria-hidden="true">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round">
          <path d="M12 3 3 20h4l5-9.5 5 9.5h4L12 3Z" />
        </svg>
      </span>
      <span className="leading-none">
        <span className="block font-display text-lg font-bold uppercase tracking-wider text-ink">ARC Field Manual</span>
        <span className="block font-mono text-[0.6rem] uppercase tracking-[0.2em] text-muted">Raider knowledge base</span>
      </span>
    </Link>
  );
}

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // "/" focuses search, like most wikis.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName) && !t.isContentEditable) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur supports-[backdrop-filter]:bg-bg/70">
        <div className="hazard-stripe h-0.5 opacity-70" aria-hidden="true" />
        <div className="flex h-14 items-center gap-3 px-4 lg:px-6">
          <button
            type="button"
            className="-ml-1 rounded p-2 text-ink-2 hover:bg-panel hover:text-ink lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open navigation"
            aria-expanded={open}
            aria-controls="mobile-nav"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="lg:hidden"><Logo /></div>
          <form
            role="search"
            className="ml-auto w-full max-w-md"
            onSubmit={(e) => {
              e.preventDefault();
              router.push(`/search${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ""}`);
            }}
          >
            <label htmlFor="global-search" className="sr-only">Search items, ARC, quests and guides</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
              <input
                ref={inputRef}
                id="global-search"
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search items, ARC, quests, guides…"
                className="h-9 w-full rounded border border-line bg-bg-2 pl-9 pr-10 text-sm text-ink placeholder:text-muted focus:border-accent/60 focus:outline-none"
              />
              <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 rounded border border-line-2 px-1.5 font-mono text-[0.65rem] text-muted sm:block">/</kbd>
            </div>
          </form>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" id="mobile-nav" role="dialog" aria-modal="true" aria-label="Navigation">
          <button className="absolute inset-0 bg-black/70" aria-label="Close navigation" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-[min(20rem,85vw)] flex-col overflow-y-auto border-r border-line bg-bg-2 p-4">
            <div className="mb-6 flex items-center justify-between">
              <Logo />
              <button type="button" onClick={() => setOpen(false)} className="rounded p-2 text-ink-2 hover:bg-panel" aria-label="Close navigation">
                <X className="h-5 w-5" />
              </button>
            </div>
            <SideNav onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
