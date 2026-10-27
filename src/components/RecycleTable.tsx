"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { Coins, ItemImage, RarityBadge, cx } from "./primitives";
import type { Rarity } from "@/lib/types";

export interface RecycleRow {
  slug: string;
  name: string;
  rarity: Rarity;
  image?: string;
  sell: number;
  recycle: number;
  roi: number;
  outputs: string;
  needed: boolean;
}

type Key = "name" | "sell" | "recycle" | "roi";
const PAGE = 60;

export function RecycleTable({ rows }: { rows: RecycleRow[] }) {
  const [sort, setSort] = useState<{ key: Key; dir: 1 | -1 }>({ key: "roi", dir: -1 });
  const [q, setQ] = useState("");
  const [hideNeeded, setHideNeeded] = useState(false);
  const [limit, setLimit] = useState(PAGE);

  const list = useMemo(() => {
    const n = q.trim().toLowerCase();
    return rows
      .filter((r) => (!n || r.name.toLowerCase().includes(n) || r.outputs.toLowerCase().includes(n)) && (!hideNeeded || !r.needed))
      .sort((a, b) => {
        const v = sort.key === "name" ? a.name.localeCompare(b.name) : a[sort.key] - b[sort.key];
        return v * sort.dir || a.name.localeCompare(b.name);
      });
  }, [rows, q, sort, hideNeeded]);

  const head = (key: Key, label: string, right?: boolean) => {
    const active = sort.key === key;
    const Icon = !active ? ArrowUpDown : sort.dir === 1 ? ArrowUp : ArrowDown;
    return (
      <th scope="col" className={right ? "text-right" : undefined} aria-sort={active ? (sort.dir === 1 ? "ascending" : "descending") : "none"}>
        <button
          type="button"
          className={cx("inline-flex items-center gap-1 uppercase", active && "text-accent")}
          onClick={() => setSort({ key, dir: active ? (sort.dir === 1 ? -1 : 1) : key === "name" ? 1 : -1 })}
        >
          {label} <Icon className="h-3 w-3" aria-hidden="true" />
        </button>
      </th>
    );
  };

  return (
    <div>
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="rq" className="eyebrow mb-1 block">Filter by item or output material</label>
          <input id="rq" type="search" value={q} onChange={(e) => { setQ(e.target.value); setLimit(PAGE); }} placeholder="e.g. Wires" className="h-9 w-full rounded border border-line bg-bg-2 px-2.5 text-sm focus:border-accent/60 focus:outline-none" />
        </div>
        <label className="flex items-center gap-2 text-sm text-ink-2">
          <input type="checkbox" checked={hideNeeded} onChange={(e) => setHideNeeded(e.target.checked)} className="h-4 w-4 accent-[var(--color-accent)]" />
          Hide items needed for upgrades/quests
        </label>
      </div>
      <p className="mb-2 text-sm text-muted" aria-live="polite">{list.length} recyclable items</p>
      <div className="panel overflow-x-auto">
        <table className="table-arc">
          <caption className="sr-only">Recycling value compared with sell value; sortable by column</caption>
          <thead>
            <tr>
              {head("name", "Item")}
              <th scope="col">Recycles into</th>
              {head("sell", "Sell", true)}
              {head("recycle", "Recycle", true)}
              {head("roi", "ROI", true)}
            </tr>
          </thead>
          <tbody>
            {list.slice(0, limit).map((r) => (
              <tr key={r.slug}>
                <td className="min-w-52">
                  <Link href={`/items/${r.slug}`} className="group flex items-center gap-2.5">
                    <ItemImage src={r.image} alt="" size={36} rarity={r.rarity} />
                    <span>
                      <span className="block text-ink group-hover:text-accent">{r.name}</span>
                      <span className="flex items-center gap-2"><RarityBadge rarity={r.rarity} compact />{r.needed && <span className="font-mono text-[0.6rem] uppercase text-accent">keep</span>}</span>
                    </span>
                  </Link>
                </td>
                <td className="min-w-48 text-sm">{r.outputs}</td>
                <td className="text-right"><Coins value={r.sell} /></td>
                <td className="text-right"><Coins value={r.recycle} /></td>
                <td className={cx("num text-right font-medium", r.roi > 0 ? "text-ok" : r.roi < 0 ? "text-bad" : "text-ink")}>
                  <span aria-hidden="true">{r.roi > 0 ? "▲ +" : r.roi < 0 ? "▼ " : ""}</span>{r.roi}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {limit < list.length && (
        <div className="mt-4 text-center">
          <button type="button" onClick={() => setLimit(limit + PAGE)} className="rounded border border-line bg-panel px-4 py-2 text-sm hover:border-accent/60">Show more ({list.length - limit} remaining)</button>
        </div>
      )}
    </div>
  );
}
