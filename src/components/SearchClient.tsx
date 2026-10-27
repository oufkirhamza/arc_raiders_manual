"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Fuse from "fuse.js";
import { Search } from "lucide-react";
import { ItemImage, cx } from "./primitives";
import type { DocType, SearchDoc } from "@/lib/search-index";

const TYPES: DocType[] = ["Item", "Weapon", "ARC", "Quest", "Guide", "Map", "Trader", "Project", "Station", "Page"];
const SUGGESTIONS = ["Durable Cloth", "Bastion", "Raider Hatch Key", "Wasp Driver", "Anvil", "Extraction", "Stella Montis", "Expedition"];
const MAX = 60;

export function SearchClient() {
  const params = useSearchParams();
  const router = useRouter();
  const [docs, setDocs] = useState<SearchDoc[] | null>(null);
  const [error, setError] = useState(false);
  const [q, setQ] = useState(params.get("q") ?? "");
  const [type, setType] = useState<DocType | "">((params.get("type") as DocType) ?? "");

  useEffect(() => {
    let alive = true;
    fetch("/search-index.json")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d: SearchDoc[]) => alive && setDocs(d))
      .catch(() => alive && setError(true));
    return () => { alive = false; };
  }, []);

  // reflect the header search box (which navigates here with ?q=)
  useEffect(() => { setQ(params.get("q") ?? ""); }, [params]);

  useEffect(() => {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (type) sp.set("type", type);
    const s = sp.toString();
    if (s !== params.toString()) router.replace(`/search${s ? `?${s}` : ""}`, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, type]);

  const fuse = useMemo(
    () => docs && new Fuse(docs, {
      keys: [{ name: "title", weight: 3 }, { name: "k", weight: 1 }, { name: "desc", weight: 0.6 }],
      threshold: 0.34,
      ignoreLocation: true,
      minMatchCharLength: 2,
    }),
    [docs],
  );

  const results = useMemo(() => {
    if (!fuse || q.trim().length < 2) return [];
    return fuse.search(q.trim(), { limit: 300 }).map((r) => r.item);
  }, [fuse, q]);
  const counts = useMemo(() => {
    const c: Partial<Record<DocType, number>> = {};
    results.forEach((r) => (c[r.type] = (c[r.type] ?? 0) + 1));
    return c;
  }, [results]);
  const shown = (type ? results.filter((r) => r.type === type) : results).slice(0, MAX);

  return (
    <div>
      <form role="search" onSubmit={(e) => e.preventDefault()} className="relative mb-4">
        <label htmlFor="search-page-q" className="sr-only">Search the knowledge base</label>
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" aria-hidden="true" />
        <input
          id="search-page-q"
          type="search"
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search items, weapons, ARC, quests, maps, guides…"
          className="h-14 w-full rounded-md border border-line-2 bg-bg-2 pl-12 pr-4 text-lg text-ink placeholder:text-muted focus:border-accent focus:outline-none"
        />
      </form>

      {q.trim().length >= 2 && results.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Filter by content type">
          <button type="button" aria-pressed={!type} onClick={() => setType("")} className={cx("rounded border px-2.5 py-1 text-sm", !type ? "border-accent bg-accent/10 text-ink" : "border-line text-ink-2 hover:border-line-2")}>
            All <span className="num text-muted">{results.length}</span>
          </button>
          {TYPES.filter((t) => counts[t]).map((t) => (
            <button key={t} type="button" aria-pressed={type === t} onClick={() => setType(type === t ? "" : t)} className={cx("rounded border px-2.5 py-1 text-sm", type === t ? "border-accent bg-accent/10 text-ink" : "border-line text-ink-2 hover:border-line-2")}>
              {t} <span className="num text-muted">{counts[t]}</span>
            </button>
          ))}
        </div>
      )}

      <div aria-live="polite">
        {error ? (
          <p className="panel p-6 text-ink-2">The search index could not be loaded. Try reloading the page, or browse the <Link className="link" href="/items">item database</Link>.</p>
        ) : !docs ? (
          <p className="text-muted" role="status">Loading search index…</p>
        ) : q.trim().length < 2 ? (
          <div>
            <p className="eyebrow mb-3">Try searching for</p>
            <ul className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => <li key={s}><button type="button" onClick={() => setQ(s)} className="rounded border border-line bg-bg-2 px-3 py-1.5 text-sm text-ink-2 hover:border-accent/60 hover:text-ink">{s}</button></li>)}
            </ul>
            <p className="mt-6 text-sm text-muted">{docs.length.toLocaleString("en-US")} entries indexed. Search tolerates small typos.</p>
          </div>
        ) : shown.length === 0 ? (
          <div className="panel px-6 py-10 text-center">
            <p className="font-display text-xl uppercase tracking-wide">No results for “{q}”</p>
            <p className="mt-2 text-sm text-muted">Check the spelling, try a shorter term, or browse <Link className="link" href="/items">items</Link>, <Link className="link" href="/enemies">ARC</Link> or <Link className="link" href="/guides">guides</Link>.</p>
          </div>
        ) : (
          <ul className="divide-y divide-line overflow-hidden rounded-md border border-line">
            {shown.map((r) => (
              <li key={r.href}>
                <Link href={r.href} className="group flex items-center gap-3 bg-panel/40 px-4 py-3 hover:bg-panel-2">
                  {r.img ? <ItemImage src={r.img} alt="" size={40} /> : <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded border border-line font-mono text-[0.6rem] uppercase text-muted">{r.type.slice(0, 3)}</span>}
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate font-medium text-ink group-hover:text-accent">{r.title}</span>
                      <span className="shrink-0 rounded border border-line-2 px-1.5 font-mono text-[0.6rem] uppercase text-muted">{r.type}</span>
                    </span>
                    <span className="block truncate text-sm text-muted">{r.desc}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
