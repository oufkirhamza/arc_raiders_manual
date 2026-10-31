import Link from "next/link";
import Image from "next/image";
import { Breadcrumbs, ConfidenceBadge, PageHeader, SourcesFooter } from "@/components/ui";
import { traders } from "@/content/world";
import { questsOf, tradesBy } from "@/lib/data";
import { getData } from "@/lib/live-data";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "Characters & traders of Speranza",
  description: "ARC Raiders traders — Celeste, Shani, Tian Wen, Lance, Apollo and more: what they sell, their currencies and their quests.",
  path: "/traders",
});

export default async function TradersPage() {
  const { vendorItemsOf } = await getData();
  return (
    <>
      <Breadcrumbs trail={[{ label: "Characters & Traders" }]} />
      <PageHeader eyebrow="Speranza" title="Characters & Traders">
        <p>The traders of Speranza sell gear, buy your loot and hand out quests. Inventories and quest lines below come from the dataset; roles from the community wiki.</p>
      </PageHeader>
      <ul className="grid gap-4 md:grid-cols-2">
        {traders.map((t) => {
          const q = questsOf(t.name).length;
          const stock = vendorItemsOf(t.name).length + tradesBy(t.name).length;
          return (
            <li key={t.slug}>
              <Link href={`/traders/${t.slug}`} className="panel group flex h-full gap-4 overflow-hidden p-4 transition-colors hover:border-accent/50">
                <div className="relative h-32 w-28 shrink-0 overflow-hidden rounded border border-line bg-bg">
                  {t.image ? <Image src={t.image} alt={`Portrait of ${t.name}`} fill sizes="7rem" className="object-cover object-top" /> : <span className="flex h-full items-center justify-center font-display text-3xl text-muted">{t.name[0]}</span>}
                </div>
                <div className="min-w-0">
                  <p className="eyebrow">{t.role}</p>
                  <h2 className="font-display text-3xl font-bold uppercase tracking-wide group-hover:text-accent">{t.name}</h2>
                  <p className="mt-1 line-clamp-2 text-sm text-ink-2">{t.summary}</p>
                  <p className="mt-2 text-xs text-muted">
                    {t.inDataset ? <>{q} quests · {stock} offers · pays in {t.currency}</> : <ConfidenceBadge level="community" />}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
      <SourcesFooter ids={["wikiTraders", "dataset"]} />
    </>
  );
}
