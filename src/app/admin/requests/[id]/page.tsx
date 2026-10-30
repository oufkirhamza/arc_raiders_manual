import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { AdminBar, StatusBadge } from "@/components/admin/AdminBar";
import { ItemImage, RarityBadge, Coins } from "@/components/ui";
import { CopyButton } from "@/components/CopyButton";
import { getItem } from "@/lib/data";
import { REQUEST_KINDS, REQUEST_STATUSES } from "@/lib/requests";
import { getRequest } from "@/lib/requests-store";
import { removeRequest, saveRequest } from "../../actions";

export const metadata: Metadata = { title: "Request · Back office", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const fmt = (iso: string) => iso.slice(0, 16).replace("T", " ") + " UTC";

export default async function RequestPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; confirm?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const r = await getRequest(decodeURIComponent(id));
  if (!r) notFound();
  const item = r.itemId ? getItem(r.itemId) : undefined;
  const summary = [
    `${r.id} — ${REQUEST_KINDS[r.kind]}`,
    item ? `Item: ${item.name} (${item.id})` : r.itemName ? `New item: ${r.itemName}` : null,
    r.field ? `Field: ${r.field}` : null,
    r.currentValue ? `Shown: ${r.currentValue}` : null,
    r.proposedValue ? `Proposed: ${r.proposedValue}` : null,
    `Details: ${r.details}`,
    r.sourceUrl ? `Source: ${r.sourceUrl}` : null,
  ].filter(Boolean).join("\n");

  return (
    <>
      <AdminBar />
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted"><Link href="/admin" className="hover:text-ink">Requests</Link> / <span className="num text-ink-2">{r.id}</span></nav>

      {sp.saved && <p className="mb-4 rounded border border-ok/40 bg-ok/10 px-3 py-2 text-sm" role="status">Saved.</p>}

      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow mb-1">{REQUEST_KINDS[r.kind]}</p>
          <h1 className="font-display text-4xl font-bold uppercase tracking-wide">{item?.name ?? r.itemName ?? "General report"}</h1>
          <p className="mt-1 text-sm text-muted">Received {fmt(r.createdAt)} · updated {fmt(r.updatedAt)}</p>
        </div>
        <div className="flex items-center gap-3"><StatusBadge status={r.status} label={REQUEST_STATUSES[r.status]} /><CopyButton text={summary} label="Copy summary" /></div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-4">
          {r.kind === "correction" && (
            <section className="panel p-4" aria-labelledby="change-h">
              <h2 id="change-h" className="eyebrow mb-3">Proposed change · {r.field}</h2>
              <dl className="grid gap-3 sm:grid-cols-2">
                <div className="rounded border border-line p-3"><dt className="eyebrow mb-1">Reporter says the site shows</dt><dd className="whitespace-pre-wrap text-ink-2">{r.currentValue ?? "—"}</dd></div>
                <div className="rounded border border-accent/50 p-3"><dt className="eyebrow mb-1">Proposed value</dt><dd className="whitespace-pre-wrap text-ink">{r.proposedValue}</dd></div>
              </dl>
            </section>
          )}
          <section className="panel p-4" aria-labelledby="details-h">
            <h2 id="details-h" className="eyebrow mb-2">Details</h2>
            <p className="whitespace-pre-wrap text-ink-2">{r.details}</p>
            {r.sourceUrl && (
              <p className="mt-3 text-sm">Source: <a href={r.sourceUrl} target="_blank" rel="noopener noreferrer nofollow" className="link inline-flex items-center gap-1 break-all">{r.sourceUrl}<ExternalLink className="h-3 w-3" aria-hidden="true" /></a></p>
            )}
            <p className="mt-2 text-sm text-muted">Contact: {r.contact ?? "not provided"}</p>
          </section>

          {item && (
            <section className="panel flex flex-wrap items-center gap-4 p-4" aria-labelledby="item-h">
              <ItemImage src={item.image} alt="" size={64} rarity={item.rarity} />
              <div className="flex-1">
                <h2 id="item-h" className="font-medium text-ink">Current data for {item.name}</h2>
                <p className="mt-1 flex flex-wrap items-center gap-3 text-sm text-ink-2">
                  <RarityBadge rarity={item.rarity} /> {item.type} · <Coins value={item.value} /> · {item.weightKg ?? "—"} kg · stack {item.stackSize ?? "—"}
                </p>
                <p className="mt-1 text-xs text-muted">Dataset id <code>{item.id}</code> · last updated {item.updatedAt ?? "—"}. Edit <code>src/data/generated/items.json</code> or <code>src/content/</code>, or fix upstream and re-import.</p>
              </div>
              <Link href={`/items/${item.slug}`} target="_blank" className="rounded border border-line px-3 py-1.5 text-sm hover:border-accent/60">Open item page</Link>
            </section>
          )}

          <section className="panel p-4" aria-labelledby="history-h">
            <h2 id="history-h" className="eyebrow mb-2">History</h2>
            <ol className="space-y-1 text-sm">
              {r.history.map((h, i) => <li key={i} className="flex items-center gap-3"><span className="num text-xs text-muted">{fmt(h.at)}</span><StatusBadge status={h.status} label={REQUEST_STATUSES[h.status]} /></li>)}
            </ol>
          </section>
        </div>

        <aside className="space-y-4">
          <form action={saveRequest} className="panel space-y-4 p-4">
            <input type="hidden" name="id" value={r.id} />
            <div>
              <label htmlFor="status" className="eyebrow mb-1 block">Status</label>
              <select id="status" name="status" defaultValue={r.status} className="w-full rounded border border-line bg-bg-2 px-2 py-2 text-sm">
                {Object.entries(REQUEST_STATUSES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="adminNotes" className="eyebrow mb-1 block">Internal notes</label>
              <textarea id="adminNotes" name="adminNotes" rows={6} defaultValue={r.adminNotes} placeholder="What you changed, or why you rejected it" className="w-full rounded border border-line bg-bg-2 px-2 py-2 text-sm" />
            </div>
            <button type="submit" className="w-full rounded bg-accent px-4 py-2 font-medium text-accent-ink hover:brightness-110">Save</button>
          </form>

          <form action={removeRequest} className="panel space-y-3 border-bad/40 p-4">
            <input type="hidden" name="id" value={r.id} />
            <p className="eyebrow">Danger zone</p>
            {sp.confirm && <p className="text-sm text-bad" role="alert">Tick the box to confirm deletion.</p>}
            <label className="flex items-center gap-2 text-sm text-ink-2">
              <input type="checkbox" name="confirm" value="yes" className="h-4 w-4" /> Permanently delete this request
            </label>
            <button type="submit" className="w-full rounded border border-bad/60 px-4 py-2 text-sm text-bad hover:bg-bad/10">Delete</button>
          </form>
        </aside>
      </div>
    </>
  );
}
