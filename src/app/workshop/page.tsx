import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs, Callout, ChipList, Coins, PageHeader, Section, SourcesFooter } from "@/components/ui";
import { CopyButton } from "@/components/CopyButton";
import { workshop } from "@/lib/data";
import { getData } from "@/lib/live-data";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "Workshop station upgrades",
  description: "Every ARC Raiders workshop station upgrade cost — Gunsmith, Gear Bench, Medical Lab, Explosives Station, Utility Station, Refiner and Scrappy.",
  path: "/workshop",
});

const ICON: Record<string, string> = {
  weapon_bench: "/img/workshop/gunsmith.png",
  equipment_bench: "/img/workshop/gearbench.png",
  med_station: "/img/workshop/medicallab.png",
  explosives_bench: "/img/workshop/explosivesstation.png",
  utility_bench: "/img/workshop/utilitystation.png",
  refiner: "/img/workshop/refiner.png",
};
const ORDER = ["weapon_bench", "equipment_bench", "med_station", "refiner", "explosives_bench", "utility_bench", "scrappy", "workbench", "stash"];

export default async function WorkshopPage() {
  const { getItem, items, sumValue } = await getData();
  const stations = workshop.slice().sort((a, b) => ORDER.indexOf(a.id) - ORDER.indexOf(b.id));
  const craftCount = (id: string) => items.filter((i) => i.craftBench?.includes(id)).length;
  return (
    <>
      <Breadcrumbs trail={[{ label: "Workshop" }]} />
      <PageHeader eyebrow="Progression" title="Workshop">
        <p>Upgrade costs for every station in Speranza. Higher levels unlock higher-tier recipes. Costs are from the dataset and cross-checked against the v3.4 cheat sheet.</p>
      </PageHeader>
      <Callout tone="tip" title="Plan ahead">ARC parts (drivers, cells, cores) gate most level-2 and level-3 upgrades. Open any item to see which ARC drop it. <Link className="link" href="/guides/workshop-upgrade-priority">Suggested upgrade order</Link></Callout>
      <nav aria-label="Stations" className="mb-8 flex flex-wrap gap-2">
        {stations.map((s) => <a key={s.id} href={`#${s.id}`} className="rounded border border-line px-3 py-1.5 text-sm text-ink-2 hover:border-accent/60 hover:text-ink">{s.name}</a>)}
      </nav>
      {stations.map((s) => (
        <Section
          key={s.id}
          id={s.id}
          title={s.name}
          action={<span className="text-sm text-muted">{craftCount(s.id) ? <>{craftCount(s.id)} recipes · </> : null}max level {s.maxLevel}</span>}
        >
          <div className="flex flex-col gap-4 md:flex-row">
            {ICON[s.id] && (
              <div className="relative hidden h-24 w-24 shrink-0 md:block">
                <Image src={ICON[s.id]} alt="" fill sizes="6rem" className="object-contain" />
              </div>
            )}
            <ol className="grid flex-1 gap-3 lg:grid-cols-2">
              {s.levels.map((l) => {
                const text = l.requirements.map((r) => `${r.qty}x ${getItem(r.id)?.name ?? r.id}`).join(", ");
                return (
                  <li key={l.level} className="panel p-4">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <h3 className="font-display text-lg uppercase tracking-wide">Level {l.level}</h3>
                      <div className="flex items-center gap-3">
                        {l.requirements.length > 0 && <span className="text-xs text-muted">≈ <Coins value={sumValue(l.requirements)} /></span>}
                        {text && <CopyButton text={`${s.name} L${l.level}: ${text}`} />}
                      </div>
                    </div>
                    <ChipList list={l.requirements} empty="No item cost." />
                  </li>
                );
              })}
            </ol>
          </div>
        </Section>
      ))}
      <SourcesFooter ids={["dataset", "pdf"]} />
    </>
  );
}
