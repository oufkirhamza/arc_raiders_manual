import Link from "next/link";
import { Breadcrumbs, ChipList, ConfidenceBadge, PageHeader, Section } from "@/components/ui";
import { GuideCard } from "@/components/GuideCard";
import { GuideBlocks } from "@/components/GuideBlocks";
import { guides } from "@/content/guides";
import { getStation } from "@/lib/data";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "Getting started in ARC Raiders",
  description: "New to ARC Raiders? The core gameplay loop, essential mechanics, a first-raid checklist and the mistakes to avoid.",
  path: "/getting-started",
});

export default function GettingStartedPage() {
  const intro = guides.find((g) => g.slug === "beginners-guide")!;
  const loop = intro.sections.find((s) => s.id === "core-loop")!;
  const firstUpgrades = ["weapon_bench", "equipment_bench", "med_station"].map((id) => getStation(id)!);
  return (
    <>
      <Breadcrumbs trail={[{ label: "Getting Started" }]} />
      <PageHeader eyebrow="New Raiders" title="Getting Started">
        <p>Everything a new Raider needs before the first trip Topside. Start with the core loop, run the checklist, then dive into the full guides.</p>
      </PageHeader>

      <Section id="loop" title="The core loop" action={<ConfidenceBadge level={loop.confidence} />}>
        <GuideBlocks blocks={loop.blocks} />
      </Section>

      <Section id="mechanics" title="Essential mechanics">
        <dl className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {[
            ["Extraction", "Leave through a public extract (loud, timed) or a Raider Hatch (quiet, needs a key).", "/guides/extraction-and-death"],
            ["Death", "You lose what you carry, except your safe pocket. Free loadouts are always available.", "/guides/extraction-and-death#death"],
            ["Recycling", "Break items into materials. Usually worth less than selling — recycle with a purpose.", "/recycling"],
            ["Workshop", "Upgrade stations with specific items to unlock better crafts.", "/workshop"],
            ["Quests", "Traders hand out quests that reward materials, gear and blueprints.", "/quests"],
            ["ARC", "Machines rated Low to Extreme threat. They drop the parts upgrades need.", "/enemies"],
          ].map(([t, d, href]) => (
            <div key={t} className="panel p-4">
              <dt className="font-display text-lg uppercase tracking-wide text-ink">{t}</dt>
              <dd className="mt-1 text-sm text-ink-2">{d} <Link className="link" href={href}>More</Link></dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section id="first-upgrades" title="Your first upgrades" action={<ConfidenceBadge level="strategy" />}>
        <p className="mb-4 text-sm text-muted">Level-2 costs for the three stations most players upgrade first (dataset values).</p>
        <div className="grid gap-3 lg:grid-cols-3">
          {firstUpgrades.map((s) => (
            <div key={s.id} className="panel p-4">
              <h3 className="mb-3 font-display text-lg uppercase tracking-wide">{s.name} · L2</h3>
              <ChipList list={s.levels.find((l) => l.level === 2)?.requirements} />
            </div>
          ))}
        </div>
      </Section>

      <Section id="guides" title="Start here">
        <ul className="grid gap-3 md:grid-cols-2">
          {["beginners-guide", "first-raid-checklist", "extraction-and-death", "beginner-mistakes"].map((s) => <li key={s}><GuideCard slug={s} /></li>)}
        </ul>
      </Section>
    </>
  );
}
