import Link from "next/link";
import type { Metadata } from "next";
import { AdminBar, StatusBadge } from "@/components/admin/AdminBar";
import { ItemImage, cx } from "@/components/ui";
import { getData } from "@/lib/live-data";
import { REQUEST_KINDS, REQUEST_STATUSES, type RequestKind, type RequestStatus } from "@/lib/requests";
import { listRequests } from "@/lib/requests-store";
import { setStatus } from "./actions";

export const metadata: Metadata = { title: "Requests · Back office", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type SP = { status?: string; kind?: string; q?: string; deleted?: string };

export default async function AdminPage({ searchParams }: { searchParams: Promise<SP> }) {
  const { getItem } = await getData();
  const sp = await searchParams;
  const all = await listRequests();
  const status = sp.status && (sp.status in REQUEST_STATUSES || sp.status === "all") ? sp.status : "open";
  const kind = sp.kind && sp.kind in REQUEST_KINDS ? (sp.kind as RequestKind) : undefined;
  const q = sp.q?.trim().toLowerCase();

  const counts = Object.fromEntries(Object.keys(REQUEST_STATUSES).map((s) => [s, all.filter((r) => r.status === s).length])) as Record<RequestStatus, number>;
  const open = counts.new + counts.in_review + counts.accepted;

  const list = all.filter((r) => {
    if (status === "open" && !["new", "in_review", "accepted"].includes(r.status)) return false;
    if (status !== "open" && status !== "all" && r.status !== status) return false;
    if (kind && r.kind !== kind) return false;
    if (q) {
      const hay = [r.id, r.itemName, r.itemId && getItem(r.itemId)?.name, r.field, r.proposedValue, r.details, r.contact].join(" ").toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const tab = (value: string, label: string, n: number) => {
    const params = new URLSearchParams({ ...(value !== "open" ? { status: value } : {}), ...(kind ? { kind } : {}), ...(sp.q ? { q: sp.q } : {}) });
    return (
      <Link key={value} href={`/admin${params.size ? `?${params}` : ""}`} aria-current={status === value ? "page" : undefined}
        className={cx("rounded border px-3 py-1.5 text-sm", status === value ? "border-accent bg-accent/10 text-ink" : "border-line text-ink-2 hover:border-line-2")}>
        {label} <span className="num text-muted">{n}</span>
      </Link>
    );
  };

  return (
    <>
      <AdminBar />
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold uppercase tracking-wide">Requests</h1>
          <p className="text-ink-2">{open} open · {all.length} total</p>
        </div>
        <form method="get" className="flex flex-wrap items-end gap-2" role="search">
          {status !== "open" && <input type="hidden" name="status" value={status} />}
          <div>
            <label htmlFor="kind" className="eyebrow mb-1 block">Type</label>
            <select id="kind" name="kind" defaultValue={kind ?? ""} className="h-9 rounded border border-line bg-bg-2 px-2 text-sm">
              <option value="">All types</option>
              {Object.entries(REQUEST_KINDS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="q" className="eyebrow mb-1 block">Search</label>
            <input id="q" name="q" type="search" defaultValue={sp.q} placeholder="ID, item, text, contact" className="h-9 w-56 rounded border border-line bg-bg-2 px-2 text-sm" />
          </div>
          <button type="submit" className="h-9 rounded border border-line px-3 text-sm hover:border-accent/60">Apply</button>
        </form>
      </header>

      {sp.deleted && <p className="mb-4 rounded border border-ok/40 bg-ok/10 px-3 py-2 text-sm" role="status">Request deleted.</p>}

      <nav aria-label="Status" className="mb-4 flex flex-wrap gap-2">
        {tab("open", "Open", open)}
        {(Object.keys(REQUEST_STATUSES) as RequestStatus[]).map((s) => tab(s, REQUEST_STATUSES[s], counts[s]))}
        {tab("all", "All", all.length)}
      </nav>

      {list.length === 0 ? (
        <div className="panel px-6 py-12 text-center">
          <p className="font-display text-xl uppercase tracking-wide">{all.length ? "Nothing matches these filters" : "No requests yet"}</p>
          <p className="mt-2 text-sm text-muted">{all.length ? <Link className="link" href="/admin">Clear filters</Link> : <>Requests sent through <Link className="link" href="/contribute">/contribute</Link> will appear here.</>}</p>
        </div>
      ) : (
        <div className="panel overflow-x-auto">
          <table className="table-arc">
            <thead><tr><th scope="col">Request</th><th scope="col">Subject</th><th scope="col">Status</th><th scope="col">Received</th><th scope="col"><span className="sr-only">Quick actions</span></th></tr></thead>
            <tbody>
              {list.map((r) => {
                const item = r.itemId ? getItem(r.itemId) : undefined;
                return (
                  <tr key={r.id}>
                    <td className="min-w-40">
                      <Link href={`/admin/requests/${r.id}`} className="link num">{r.id}</Link>
                      <span className="block text-xs text-muted">{REQUEST_KINDS[r.kind]}</span>
                    </td>
                    <td className="min-w-64">
                      <div className="flex items-start gap-2">
                        {item && <ItemImage src={item.image} alt="" size={32} rarity={item.rarity} />}
                        <div className="min-w-0">
                          <p className="text-ink">{item?.name ?? r.itemName ?? "General report"}{r.field && <span className="text-muted"> · {r.field}</span>}</p>
                          <p className="line-clamp-1 text-xs text-muted">{r.proposedValue ? `→ ${r.proposedValue}` : r.details}</p>
                        </div>
                      </div>
                    </td>
                    <td><StatusBadge status={r.status} label={REQUEST_STATUSES[r.status]} /></td>
                    <td className="num whitespace-nowrap text-xs">{r.createdAt.slice(0, 16).replace("T", " ")}</td>
                    <td>
                      {r.status === "new" && (
                        <form action={setStatus}>
                          <input type="hidden" name="id" value={r.id} />
                          <input type="hidden" name="status" value="in_review" />
                          <button type="submit" className="whitespace-nowrap rounded border border-line px-2 py-1 text-xs hover:border-accent/60">Start review</button>
                        </form>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
