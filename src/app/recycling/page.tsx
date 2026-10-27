import Link from "next/link";
import { Star } from "lucide-react";
import { Breadcrumbs, Callout, ChipList, ItemChip, PageHeader, Section, SourcesFooter } from "@/components/ui";
import { RecycleTable, type RecycleRow } from "@/components/RecycleTable";
import { getItem, items, recycleRoi, sourcesOf, usesOf } from "@/lib/data";
import { pdfDonors, pdfHighPriority, pdfKeepForQuests } from "@/content/pdf";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "Recycle or sell? Recycling value index",
  description: "Sortable recycling ROI for every recyclable ARC Raiders item, the best donors for each crafting component, and the items worth keeping for quests.",
  path: "/recycling",
});

export default function RecyclingPage() {
  const rows: RecycleRow[] = items.flatMap((i) => {
    const r = recycleRoi(i);
    if (!r) return [];
    return [{
      slug: i.slug,
      name: i.name,
      rarity: i.rarity,
      image: i.image,
      sell: i.value,
      recycle: r.recycle,
      roi: r.roi,
      outputs: i.recyclesInto!.map((o) => `${o.qty}× ${getItem(o.id)?.name ?? o.id}`).join(", "),
      needed: usesOf(i.id).some((u) => u.kind === "workshop" || u.kind === "quest" || u.kind === "project"),
    }];
  });
  const positive = rows.filter((r) => r.roi > 0).length;

  return (
    <>
      <Breadcrumbs trail={[{ label: "Recycle or Sell" }]} />
      <PageHeader eyebrow="Economy" title="Recycle or Sell?">
        <p>
          The Recycling Value Index from the v3.4 cheat sheet, computed for all {rows.length} recyclable items with current dataset values:{" "}
          <span className="num text-ink">ROI = (recycle value − sell value) ÷ sell value × 100</span>. Only {positive} items return more value when recycled.
        </p>
      </PageHeader>

      <Callout tone="info" title="How to read it">
        <span className="text-ok">▲ Positive</span> — recycling returns more coin value than selling. <span className="text-bad">▼ Negative</span> — selling is worth more;
        recycle only when you need the materials. High-priority components tend to carry a −40% to −60% penalty. <Link className="link" href="/guides/recycling-vs-selling">Read the guide</Link>
      </Callout>

      <Section id="table" title="All recyclable items">
        <RecycleTable rows={rows} />
      </Section>

      <Section id="donors" title="Best donors by component">
        <p className="mb-4 text-sm text-muted">
          Where to get each high-priority component. <Star className="inline h-3.5 w-3.5 fill-accent text-accent" aria-label="Star" /> marks the cheat sheet’s “best choice”.
          Yields shown are from the dataset; the cheat sheet’s printed yields are cross-checked on the <Link className="link" href="/sources#conflicts">sources page</Link>.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {pdfDonors.map((c) => {
            const comp = getItem(c.componentId);
            const top = sourcesOf(c.componentId).filter((s) => s.via === "recycle").slice(0, 6);
            const best = new Set(c.donors.filter((d) => d.best).map((d) => d.id));
            const ids = [...new Set([...c.donors.map((d) => d.id), ...top.map((t) => t.item.id)])];
            return (
              <div key={c.componentId} className="panel p-4">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <ItemChip id={c.componentId} />
                  <span className="eyebrow">{c.group}</span>
                </div>
                <ul className="flex flex-wrap gap-2">
                  {ids.map((id) => {
                    const y = getItem(id)?.recyclesInto?.find((r) => r.id === c.componentId)?.qty;
                    return (
                      <li key={id} className="relative">
                        <ItemChip id={id} note={y ? `+${y}` : undefined} />
                        {best.has(id) && <Star className="absolute -right-1 -top-1 h-3.5 w-3.5 fill-accent text-accent" aria-label="Best donor" />}
                      </li>
                    );
                  })}
                </ul>
                {comp && <p className="mt-3 text-xs text-muted"><Link className="link" href={`/items/${comp.slug}#sources`}>All sources of {comp.name}</Link></p>}
              </div>
            );
          })}
        </div>
      </Section>

      <div className="grid gap-x-8 lg:grid-cols-2">
        <Section id="keep" title="Keep for quests">
          <p className="mb-3 text-sm text-muted">The cheat sheet’s list of items to hold on to for quests (printed quantities).</p>
          <ChipList list={pdfKeepForQuests} />
        </Section>
        <Section id="high-priority" title="Other high-priority components">
          <p className="mb-3 text-sm text-muted">Components the cheat sheet flags as high priority even though they have no single best donor.</p>
          <ChipList list={pdfHighPriority.map((id) => ({ id }))} />
        </Section>
      </div>

      <SourcesFooter ids={["pdf", "dataset"]} />
    </>
  );
}
