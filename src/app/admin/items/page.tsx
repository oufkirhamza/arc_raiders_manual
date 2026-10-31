import Link from "next/link";
import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { AdminBar } from "@/components/admin/AdminBar";
import { ItemImage, RarityBadge, cx } from "@/components/ui";
import { baseData } from "@/lib/data";
import { listEdits } from "@/lib/item-edits";
import { applyEdits } from "@/lib/live-data";
import { baseItems } from "@/lib/data";

export const metadata: Metadata = { title: "Items · Back office", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const PAGE = 60;

export default async function AdminItemsPage({ searchParams }: { searchParams: Promise<{ q?: string; show?: string; removed?: string; page?: string }> }) {
  const sp = await searchParams;
  const edits = await listEdits(); // uncached: the editor always sees the latest state
  const editById = new Map(edits.map((e) => [e.itemId, e]));
  // include hidden items here so they can be un-hidden
  const all = applyEdits(baseItems, edits.map((e) => ({ ...e, data: { ...e.data, hidden: undefined } })));
  const q = sp.q?.trim().toLowerCase();
  const show = sp.show === "edited" || sp.show === "new" ? sp.show : "all";
  const list = all.filter((i) => {
    const e = editById.get(i.id);
    if (show === "edited" && !e) return false;
    if (show === "new" && !e?.isNew) return false;
    return !q || i.name.toLowerCase().includes(q) || i.id.includes(q) || i.type.toLowerCase().includes(q);
  });
  const page = Math.max(1, Number(sp.page) || 1);
  const shown = list.slice(0, page * PAGE);
  const qs = (extra: Record<string, string>) => new URLSearchParams({ ...(sp.q ? { q: sp.q } : {}), ...(show !== "all" ? { show } : {}), ...extra }).toString();

  return (
    <>
      <AdminBar />
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold uppercase tracking-wide">Items</h1>
          <p className="text-ink-2">{baseData.items.length} from the dataset · {edits.filter((e) => !e.isNew).length} corrected · {edits.filter((e) => e.isNew).length} added</p>
        </div>
        <Link href="/admin/items/new" className="inline-flex items-center gap-2 rounded bg-accent px-4 py-2 font-medium text-accent-ink hover:brightness-110">
          <Plus className="h-4 w-4" aria-hidden="true" /> New item
        </Link>
      </header>

      {sp.removed && <p className="mb-4 rounded border border-ok/40 bg-ok/10 px-3 py-2 text-sm" role="status">Item removed.</p>}

      <form method="get" role="search" className="mb-4 flex flex-wrap items-end gap-2">
        <div>
          <label htmlFor="q" className="eyebrow mb-1 block">Search</label>
          <input id="q" name="q" type="search" defaultValue={sp.q} placeholder="Name, id or type" className="h-9 w-64 rounded border border-line bg-bg-2 px-2 text-sm" />
        </div>
        <div>
          <label htmlFor="show" className="eyebrow mb-1 block">Show</label>
          <select id="show" name="show" defaultValue={show} className="h-9 rounded border border-line bg-bg-2 px-2 text-sm">
            <option value="all">All items</option>
            <option value="edited">Edited by me</option>
            <option value="new">Added by me</option>
          </select>
        </div>
        <button type="submit" className="h-9 rounded border border-line px-3 text-sm hover:border-accent/60">Apply</button>
      </form>

      <p className="mb-2 text-sm text-muted">{list.length} items</p>
      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((i) => {
          const e = editById.get(i.id);
          return (
            <li key={i.id} className="min-w-0">
              <Link href={`/admin/items/${i.id}`} className="panel group flex items-center gap-3 p-2.5 hover:border-accent/50">
                <ItemImage src={i.image || undefined} alt="" size={44} rarity={i.rarity} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-ink group-hover:text-accent">{i.name}</span>
                  <span className="flex flex-wrap items-center gap-2 text-xs text-muted"><RarityBadge rarity={i.rarity} compact /> <code>{i.id}</code></span>
                </span>
                {e && (
                  <span className={cx("shrink-0 rounded border px-1.5 py-0.5 font-mono text-[0.6rem] uppercase", e.isNew ? "border-ok/60 text-ok" : e.data.hidden ? "border-line-2 text-muted" : "border-accent/60 text-accent")}>
                    {e.isNew ? "Added" : e.data.hidden ? "Hidden" : "Edited"}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
      {shown.length < list.length && (
        <div className="mt-6 text-center">
          <Link href={`/admin/items?${qs({ page: String(page + 1) })}`} scroll={false} className="rounded border border-line px-4 py-2 text-sm hover:border-accent/60">Show more ({list.length - shown.length} remaining)</Link>
        </div>
      )}
    </>
  );
}
