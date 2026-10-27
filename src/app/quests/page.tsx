import Link from "next/link";
import { Breadcrumbs, PageHeader, Section, SourcesFooter } from "@/components/ui";
import { getMap, mapSlugFor, quests, TRADER_SLUGS } from "@/lib/data";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "Quest database",
  description: "All ARC Raiders quests by trader: objectives, required items, rewards, maps and quest chains.",
  path: "/quests",
});

const mapNames = (ids?: string[]) => {
  const names = [...new Set((ids ?? []).map(mapSlugFor).filter(Boolean))].map((s) => getMap(s!)!.name);
  return names.length ? names.join(", ") : "Any map";
};

export default function QuestsPage() {
  const traders = Object.keys(TRADER_SLUGS).filter((t) => quests.some((q) => q.trader === t));
  return (
    <>
      <Breadcrumbs trail={[{ label: "Quests" }]} />
      <PageHeader eyebrow="Progression" title="Quests">
        <p>{quests.length} quests from {traders.length} traders. Each quest page shows objectives, hand-in items, rewards and where it sits in its chain.</p>
      </PageHeader>
      <nav aria-label="Traders" className="mb-8 flex flex-wrap gap-2">
        {traders.map((t) => <a key={t} href={`#${TRADER_SLUGS[t]}`} className="rounded border border-line px-3 py-1.5 text-sm text-ink-2 hover:border-accent/60 hover:text-ink">{t} <span className="num text-muted">{quests.filter((q) => q.trader === t).length}</span></a>)}
      </nav>
      {traders.map((t) => (
        <Section key={t} id={TRADER_SLUGS[t]} title={t} action={<Link href={`/traders/${TRADER_SLUGS[t]}`} className="link text-sm">Trader profile →</Link>}>
          <div className="panel overflow-x-auto">
            <table className="table-arc">
              <thead><tr><th scope="col">Quest</th><th scope="col">Map</th><th scope="col">Objectives</th><th scope="col" className="text-right">Hand-ins</th></tr></thead>
              <tbody>
                {quests.filter((q) => q.trader === t).map((q) => (
                  <tr key={q.id}>
                    <td className="min-w-44"><Link className="link font-medium" href={`/quests/${q.slug}`}>{q.name}</Link></td>
                    <td className="text-sm">{mapNames(q.maps)}</td>
                    <td className="text-sm">{q.objectives[0]}{q.objectives.length > 1 && <span className="text-muted"> +{q.objectives.length - 1} more</span>}</td>
                    <td className="num text-right">{q.requiredItems?.length ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      ))}
      <SourcesFooter ids={["dataset"]} />
    </>
  );
}
