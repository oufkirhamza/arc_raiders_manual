import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Breadcrumbs, Callout, Coins, ConfidenceBadge, ItemChip, Section, SourcesFooter, cx } from "@/components/ui";
import { traders } from "@/content/world";
import { CURRENCIES, getItem, questsOf, tradesBy, vendorItemsOf } from "@/lib/data";
import { pageMeta } from "@/lib/site";

export function generateStaticParams() {
  return traders.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const slug = (await params).slug;
  const tr = traders.find((x) => x.slug === slug);
  if (!tr) return {};
  return pageMeta({
    title: `${tr.name} — ${tr.role}`,
    description: `${tr.name}, ${tr.role.toLowerCase()} in Speranza. Sells ${tr.sells.join(", ").toLowerCase()}. Full inventory and quest line.`,
    path: `/traders/${tr.slug}`,
    image: tr.image,
  });
}

export default async function TraderPage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  const t = traders.find((x) => x.slug === slug);
  if (!t) notFound();
  const stock = vendorItemsOf(t.name).map((i) => ({ item: i, offer: i.vendors!.find((v) => v.trader === t.name)! }))
    .sort((a, b) => (a.offer.requiredLevel ?? 0) - (b.offer.requiredLevel ?? 0) || a.item.name.localeCompare(b.item.name));
  const barter = tradesBy(t.name);
  const quests = questsOf(t.name);
  // order quests along their chains: roots first
  const ids = new Set(quests.map((q) => q.id));
  const roots = quests.filter((q) => !q.previous?.some((p) => ids.has(p)));

  return (
    <article>
      <Breadcrumbs trail={[{ href: "/traders", label: "Characters & Traders" }, { label: t.name }]} />
      <header className="panel panel-cut mb-8 flex flex-col gap-6 overflow-hidden md:flex-row">
        <div className="relative h-72 w-full shrink-0 bg-bg md:h-auto md:w-64">
          {t.image ? <Image src={t.image} alt={`Portrait of ${t.name}`} fill priority sizes="(min-width:768px) 16rem, 100vw" className="object-cover object-top" /> : null}
        </div>
        <div className="p-5">
          <p className="eyebrow mb-1">{t.role}</p>
          <h1 className="font-display text-5xl font-bold uppercase leading-none tracking-wide">{t.name}</h1>
          <div className="mt-3"><ConfidenceBadge level={t.inDataset ? "verified" : "community"} /></div>
          <p className="mt-4 max-w-2xl text-ink-2">{t.summary}</p>
          <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            <div><dt className="eyebrow">Currency</dt><dd className="text-ink">{t.currency}</dd></div>
            <div><dt className="eyebrow">Sells</dt><dd className="text-ink">{t.sells.join(", ")}</dd></div>
            {t.inDataset && <div><dt className="eyebrow">Quests</dt><dd className="num text-ink">{quests.length}</dd></div>}
          </dl>
        </div>
      </header>

      {!t.inDataset && <Callout tone="info" title="No inventory data">This trader is not covered by the imported dataset yet, so no inventory or quests are listed.</Callout>}

      {stock.length > 0 && (
        <Section id="stock" title="Shop inventory">
          <div className="panel overflow-x-auto">
            <table className="table-arc">
              <thead><tr><th scope="col">Item</th><th scope="col">Price</th><th scope="col">Limit</th><th scope="col">Trader level</th></tr></thead>
              <tbody>
                {stock.map(({ item, offer }) => (
                  <tr key={item.id}>
                    <td><ItemChip id={item.id} /></td>
                    <td>{Object.entries(offer.cost ?? {}).map(([k, v]) => k === "coins" ? <Coins key={k} value={v} /> : <span key={k} className="num">{v.toLocaleString("en-US")} {CURRENCIES[k] ?? getItem(k)?.name ?? k}</span>)}</td>
                    <td className="num">{offer.limit ? `${offer.limit}${offer.refreshSeconds ? ` / ${Math.round(offer.refreshSeconds / 3600)}h` : ""}` : "—"}</td>
                    <td className="num">{offer.requiredLevel ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {barter.length > 0 && (
        <Section id="barter" title="Barter offers">
          <div className="panel overflow-x-auto">
            <table className="table-arc">
              <thead><tr><th scope="col">You get</th><th scope="col">You give</th><th scope="col">Daily limit</th></tr></thead>
              <tbody>
                {barter.map((b, i) => (
                  <tr key={i}>
                    <td><ItemChip id={b.itemId} qty={b.qty} /></td>
                    <td>{b.cost ? <ItemChip id={b.cost.id} qty={b.cost.qty} /> : "—"}</td>
                    <td className="num">{b.dailyLimit ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {quests.length > 0 && (
        <Section id="quests" title={`Quests (${quests.length})`}>
          <p className="mb-3 text-sm text-muted">Quests that start a chain are marked <span className="text-accent">●</span>.</p>
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {quests.map((q) => (
              <li key={q.id}>
                <Link href={`/quests/${q.slug}`} className="panel flex items-center gap-2 px-3 py-2 text-sm hover:border-accent/50">
                  <span className={cx(roots.includes(q) ? "text-accent" : "text-line-2")} aria-hidden="true">●</span>
                  <span className="text-ink">{q.name}</span>
                  {roots.includes(q) && <span className="sr-only">(starts a chain)</span>}
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <SourcesFooter ids={t.sources} />
    </article>
  );
}
