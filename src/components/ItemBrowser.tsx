"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { RotateCcw, SlidersHorizontal } from "lucide-react";
import { Coins, ItemImage, RarityBadge, cx } from "./primitives";
import type { Rarity } from "@/lib/types";

export interface BrowserItem {
  slug: string;
  name: string;
  type: string;
  rarity: Rarity;
  value: number;
  image?: string;
  roi: number | null;
  craftable: boolean;
  recyclable: boolean;
  needed: boolean;
  sold: boolean;
  quest: boolean;
}

const RARITIES: Rarity[] = ["Common", "Uncommon", "Rare", "Epic", "Legendary"];
const PURPOSES = [
  { id: "craftable", label: "Craftable" },
  { id: "recyclable", label: "Recyclable" },
  { id: "needed", label: "Needed for upgrades / quests / projects" },
  { id: "sold", label: "Sold by traders" },
] as const;
const SORTS = [
  { id: "name", label: "Name (A–Z)" },
  { id: "value-desc", label: "Sell value (high → low)" },
  { id: "value-asc", label: "Sell value (low → high)" },
  { id: "rarity-desc", label: "Rarity (high → low)" },
  { id: "roi-desc", label: "Recycle ROI (best first)" },
] as const;
const PAGE = 48;

export function ItemBrowser({ items, groups }: { items: BrowserItem[]; groups: Record<string, string[]> }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [q, setQ] = useState(params.get("q") ?? "");
  const [group, setGroup] = useState(params.get("group") ?? "");
  const [type, setType] = useState(params.get("type") ?? "");
  const [rarity, setRarity] = useState<string[]>(params.get("rarity")?.split(",").filter(Boolean) ?? []);
  const [purpose, setPurpose] = useState(params.get("purpose") ?? "");
  const [sort, setSort] = useState(params.get("sort") ?? "name");
  const [limit, setLimit] = useState(PAGE);

  // keep URL in sync so filtered views are shareable
  useEffect(() => {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (group) sp.set("group", group);
    if (type) sp.set("type", type);
    if (rarity.length) sp.set("rarity", rarity.join(","));
    if (purpose) sp.set("purpose", purpose);
    if (sort !== "name") sp.set("sort", sort);
    const next = sp.toString();
    if (next !== params.toString()) router.replace(`${pathname}${next ? `?${next}` : ""}`, { scroll: false });
    setLimit(PAGE);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, group, type, rarity, purpose, sort]);

  const typeOptions = group ? groups[group] ?? [] : Object.values(groups).flat().sort();

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const groupTypes = group ? new Set(groups[group]) : null;
    const out = items.filter(
      (i) =>
        (!needle || i.name.toLowerCase().includes(needle) || i.type.toLowerCase().includes(needle)) &&
        (!groupTypes || groupTypes.has(i.type)) &&
        (!type || i.type === type) &&
        (!rarity.length || rarity.includes(i.rarity)) &&
        (!purpose || i[purpose as keyof BrowserItem] === true),
    );
    const r = (x: Rarity) => RARITIES.indexOf(x);
    out.sort((a, b) => {
      switch (sort) {
        case "value-desc": return b.value - a.value || a.name.localeCompare(b.name);
        case "value-asc": return a.value - b.value || a.name.localeCompare(b.name);
        case "rarity-desc": return r(b.rarity) - r(a.rarity) || a.name.localeCompare(b.name);
        case "roi-desc": return (b.roi ?? -Infinity) - (a.roi ?? -Infinity) || a.name.localeCompare(b.name);
        default: return a.name.localeCompare(b.name);
      }
    });
    return out;
  }, [items, q, group, type, rarity, purpose, sort, groups]);

  const active = q || group || type || rarity.length || purpose || sort !== "name";
  const reset = () => { setQ(""); setGroup(""); setType(""); setRarity([]); setPurpose(""); setSort("name"); };

  const field = "h-9 rounded border border-line bg-bg-2 px-2.5 text-sm text-ink focus:border-accent/60 focus:outline-none";

  return (
    <div>
      <div className="panel mb-6 p-4">
        <div className="mb-3 flex items-center gap-2 text-sm text-ink-2">
          <SlidersHorizontal className="h-4 w-4 text-accent" aria-hidden="true" />
          <span className="font-display uppercase tracking-wide">Filters</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2">
            <label htmlFor="f-q" className="eyebrow mb-1 block">Name</label>
            <input id="f-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. Durable Cloth" className={cx(field, "w-full")} />
          </div>
          <div>
            <label htmlFor="f-group" className="eyebrow mb-1 block">Category</label>
            <select id="f-group" value={group} onChange={(e) => { setGroup(e.target.value); setType(""); }} className={cx(field, "w-full")}>
              <option value="">All categories</option>
              {Object.keys(groups).map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="f-type" className="eyebrow mb-1 block">Type</label>
            <select id="f-type" value={type} onChange={(e) => setType(e.target.value)} className={cx(field, "w-full")}>
              <option value="">All types</option>
              {typeOptions.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="f-purpose" className="eyebrow mb-1 block">Purpose</label>
            <select id="f-purpose" value={purpose} onChange={(e) => setPurpose(e.target.value)} className={cx(field, "w-full")}>
              <option value="">Any</option>
              {PURPOSES.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="f-sort" className="eyebrow mb-1 block">Sort by</label>
            <select id="f-sort" value={sort} onChange={(e) => setSort(e.target.value)} className={cx(field, "w-full")}>
              {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>
          <fieldset className="sm:col-span-2">
            <legend className="eyebrow mb-1">Rarity</legend>
            <div className="flex flex-wrap gap-1.5">
              {RARITIES.map((r) => {
                const on = rarity.includes(r);
                return (
                  <button
                    key={r}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setRarity(on ? rarity.filter((x) => x !== r) : [...rarity, r])}
                    className={cx("rounded border px-2 py-1.5 transition-colors", on ? "border-accent bg-accent/10" : "border-line bg-bg-2 hover:border-line-2")}
                  >
                    <RarityBadge rarity={r} />
                  </button>
                );
              })}
            </div>
          </fieldset>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-sm">
          <p className="text-muted" aria-live="polite"><span className="num text-ink">{filtered.length}</span> of {items.length} items</p>
          {active ? (
            <button type="button" onClick={reset} className="inline-flex items-center gap-1.5 text-ink-2 hover:text-accent">
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Reset filters
            </button>
          ) : null}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="panel px-6 py-12 text-center">
          <p className="font-display text-xl uppercase tracking-wide">No items match</p>
          <p className="mt-2 text-sm text-muted">Try a shorter name, another category, or <button type="button" onClick={reset} className="link">reset all filters</button>.</p>
        </div>
      ) : (
        <>
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.slice(0, limit).map((i) => (
              <li key={i.slug} className="min-w-0">
                <Link href={`/items/${i.slug}`} className="panel group flex h-full items-center gap-3 p-3 transition-colors hover:border-accent/50">
                  <ItemImage src={i.image} alt="" size={56} rarity={i.rarity} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-ink group-hover:text-accent">{i.name}</p>
                    <p className="truncate text-xs text-muted">{i.type}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <RarityBadge rarity={i.rarity} />
                      <Coins value={i.value} className="text-xs text-ink-2" />
                      {i.roi != null && sort === "roi-desc" && (
                        <span className={cx("num text-xs", i.roi >= 0 ? "text-ok" : "text-bad")}>{i.roi > 0 ? "+" : ""}{i.roi}%</span>
                      )}
                    </div>
                  </div>
                  {i.needed && <span className="rounded border border-accent/40 px-1.5 py-0.5 font-mono text-[0.6rem] uppercase text-accent" title="Needed for upgrades, quests or projects">Keep</span>}
                </Link>
              </li>
            ))}
          </ul>
          {limit < filtered.length && (
            <div className="mt-6 text-center">
              <button type="button" onClick={() => setLimit(limit + PAGE)} className="rounded border border-line bg-panel px-4 py-2 text-sm text-ink hover:border-accent/60">
                Show more ({filtered.length - limit} remaining)
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
