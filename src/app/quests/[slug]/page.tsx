import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { Breadcrumbs, ChipList, ConfidenceBadge, Section, SourcesFooter } from "@/components/ui";
import { CopyButton } from "@/components/CopyButton";
import { getItem, getMap, getQuest, getQuestBySlug, mapSlugFor, quests, TRADER_SLUGS } from "@/lib/data";
import { pageMeta } from "@/lib/site";

export function generateStaticParams() {
  return quests.map((q) => ({ slug: q.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const q = getQuestBySlug((await params).slug);
  if (!q) return {};
  return pageMeta({ title: `${q.name} (${q.trader} quest)`, description: `${q.name}: ${q.objectives.join("; ")}. Rewards and requirements.`.slice(0, 300), path: `/quests/${q.slug}` });
}

export default async function QuestPage({ params }: { params: Promise<{ slug: string }> }) {
  const q = getQuestBySlug((await params).slug);
  if (!q) notFound();
  const prev = (q.previous ?? []).map(getQuest).filter(Boolean);
  const next = (q.next ?? []).map(getQuest).filter(Boolean);
  const mapList = [...new Set((q.maps ?? []).map(mapSlugFor).filter(Boolean) as string[])].map((s) => getMap(s)!);
  const handIn = q.requiredItems?.map((r) => `${r.qty}x ${getItem(r.id)?.name ?? r.id}`).join(", ");

  return (
    <article>
      <Breadcrumbs trail={[{ href: "/quests", label: "Quests" }, { href: `/quests#${TRADER_SLUGS[q.trader]}`, label: q.trader }, { label: q.name }]} />
      <header className="panel panel-cut mb-8 p-5">
        <p className="eyebrow mb-1">Quest · <Link className="hover:text-ink" href={`/traders/${TRADER_SLUGS[q.trader]}`}>{q.trader}</Link></p>
        <h1 className="font-display text-4xl font-bold uppercase leading-none tracking-wide md:text-5xl">{q.name}</h1>
        <div className="mt-3 flex flex-wrap gap-2">
          <ConfidenceBadge level="dataset" />
          {mapList.length ? mapList.map((m) => <Link key={m.slug} href={`/maps/${m.slug}`} className="rounded border border-line px-2 py-0.5 text-xs text-ink-2 hover:border-accent/60">{m.name}</Link>) : <span className="rounded border border-line px-2 py-0.5 text-xs text-muted">Any map</span>}
        </div>
        {q.description && <blockquote className="mt-4 max-w-3xl whitespace-pre-line border-l-2 border-accent/50 pl-4 italic text-ink-2">{q.description}</blockquote>}
      </header>

      <div className="grid gap-x-8 lg:grid-cols-2">
        <Section id="objectives" title="Objectives">
          <ol className="space-y-2">
            {q.objectives.map((o, i) => (
              <li key={i} className="panel flex gap-3 p-3 text-ink-2"><span className="num text-accent">{String(i + 1).padStart(2, "0")}</span>{o}</li>
            ))}
          </ol>
          {q.objectivesOneRound && <p className="mt-2 text-sm text-hazard">All objectives must be completed in a single round.</p>}
          {q.otherRequirements?.length ? <p className="mt-2 text-sm text-muted">Other requirements: {q.otherRequirements.join("; ")}</p> : null}
        </Section>
        <div>
          <Section id="hand-in" title="Items to hand in" action={handIn ? <CopyButton text={`${q.name}: ${handIn}`} label="Copy list" /> : undefined}>
            <ChipList list={q.requiredItems} empty="No items required." />
          </Section>
          {q.grantedItems?.length ? (
            <Section id="granted" title="Items you are given">
              <ChipList list={q.grantedItems} />
            </Section>
          ) : null}
          <Section id="rewards" title="Rewards">
            <ChipList list={q.rewards} empty="No item rewards listed." />
            {q.xp ? <p className="mt-2 text-sm text-ink-2"><span className="num text-accent">{q.xp.toLocaleString("en-US")}</span> XP</p> : null}
          </Section>
        </div>
      </div>

      <Section id="chain" title="Quest chain">
        <div className="flex flex-col items-stretch gap-3 md:flex-row md:items-center">
          <div className="flex-1 space-y-2">
            <p className="eyebrow">Unlocked by</p>
            {prev.length ? prev.map((p) => <Link key={p!.id} href={`/quests/${p!.slug}`} className="panel block px-3 py-2 text-sm hover:border-accent/50">{p!.name} <span className="text-muted">({p!.trader})</span></Link>) : <p className="text-sm text-muted">Start of chain</p>}
          </div>
          <ArrowRight className="hidden h-5 w-5 text-muted md:block" aria-hidden="true" />
          <div className="panel flex-1 border-accent/60 px-3 py-2 text-sm"><span className="eyebrow block">This quest</span>{q.name}</div>
          <ArrowRight className="hidden h-5 w-5 text-muted md:block" aria-hidden="true" />
          <div className="flex-1 space-y-2">
            <p className="eyebrow">Unlocks</p>
            {next.length ? next.map((p) => <Link key={p!.id} href={`/quests/${p!.slug}`} className="panel block px-3 py-2 text-sm hover:border-accent/50">{p!.name} <span className="text-muted">({p!.trader})</span></Link>) : <p className="text-sm text-muted">End of chain</p>}
          </div>
        </div>
      </Section>

      <SourcesFooter ids={["dataset"]} updated={q.updatedAt} />
    </article>
  );
}
