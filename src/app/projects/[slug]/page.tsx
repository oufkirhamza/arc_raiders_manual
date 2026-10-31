import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Breadcrumbs, Callout, ChipList, Coins, ConfidenceBadge, ItemChip, Section, SourcesFooter } from "@/components/ui";
import { CopyButton } from "@/components/CopyButton";
import { getProjectBySlug, projects } from "@/lib/data";
import { getData } from "@/lib/live-data";
import { conflictsFor } from "@/lib/crosscheck";
import { pdfExpeditions } from "@/content/pdf";
import { pageMeta } from "@/lib/site";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = getProjectBySlug((await params).slug);
  if (!p) return {};
  return pageMeta({ title: p.name, description: `${p.name} — every phase, required item and Load Stage value in ARC Raiders.`, path: `/projects/${p.slug}` });
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { getItem, sumValue } = await getData();
  const p = getProjectBySlug((await params).slug);
  if (!p) notFound();
  const conflicts = conflictsFor(`/projects/${p.slug}`);
  const pdf = pdfExpeditions.find((e) => e.projectId === p.id);
  const allItems = p.phases.flatMap((ph) => ph.items ?? []);
  const shopping = allItems.map((r) => `${r.qty}x ${getItem(r.id)?.name ?? r.id}`).join(", ");

  return (
    <article>
      <Breadcrumbs trail={[{ href: "/projects", label: "Expeditions & projects" }, { label: p.name }]} />
      <header className="mb-8">
        <p className="eyebrow mb-1">Project{p.disabled ? " · disabled in dataset" : ""}</p>
        <h1 className="font-display text-4xl font-bold uppercase leading-none tracking-wide md:text-5xl">{p.name}</h1>
        <div className="mt-3 flex flex-wrap gap-2">
          <ConfidenceBadge level={conflicts.length ? "conflict" : pdf ? "verified" : "dataset"} />
          {pdf && <span className="text-sm text-muted">Also covered by the v3.4 cheat sheet as “{pdf.label}”{pdf.note ? ` — ${pdf.note}` : ""}</span>}
        </div>
        {p.description && <p className="mt-3 max-w-3xl text-ink-2">{p.description}</p>}
      </header>

      {conflicts.length > 0 && (
        <Callout tone="warning" title={`${conflicts.length} values differ between sources`}>
          <ul className="list-disc pl-5">
            {conflicts.map((c, i) => <li key={i}>{c.subject.split(" · ")[1]} — {c.field}: cheat sheet <strong>{c.pdf}</strong>, dataset <strong>{c.dataset}</strong></li>)}
          </ul>
          <p className="mt-1">The tables below use dataset values. Check in game before committing rare items.</p>
        </Callout>
      )}

      {allItems.length > 0 && (
        <Section id="totals" title="Shopping list" action={<CopyButton text={`${p.name}: ${shopping}`} label="Copy all items" />}>
          <p className="mb-3 text-sm text-muted">All item requirements across phases (≈ <Coins value={sumValue(allItems)} /> in sell value).</p>
          <ChipList list={allItems} />
        </Section>
      )}

      {p.phases.map((ph) => (
        <Section key={ph.phase} id={`phase-${ph.phase}`} title={`Phase ${ph.phase}: ${ph.name}`}>
          {ph.description && <p className="mb-3 text-sm text-ink-2">{ph.description}</p>}
          {ph.items?.length ? (
            <ul className="grid gap-2 md:grid-cols-2">
              {ph.items.map((it) => (
                <li key={it.id} className="panel flex flex-wrap items-center gap-3 p-3">
                  <ItemChip id={it.id} qty={it.qty} />
                  {it.rewards?.length ? <span className="flex flex-wrap items-center gap-2 text-xs text-muted">Reward: {it.rewards.map((r) => <ItemChip key={r.id} id={r.id} qty={r.qty} />)}</span> : null}
                </li>
              ))}
            </ul>
          ) : null}
          {ph.categories?.length ? (
            <div className="panel overflow-x-auto">
              <table className="table-arc">
                <thead><tr><th scope="col">Category</th><th scope="col" className="text-right">Required</th>{pdf && ph.phase === 5 && <th scope="col" className="text-right">Cheat sheet</th>}</tr></thead>
                <tbody>
                  {ph.categories.map((c) => {
                    const pv = pdf && ph.phase === 5 ? Object.entries(pdf.loadStage).find(([k]) => k.toLowerCase() === c.category.toLowerCase())?.[1] : undefined;
                    return (
                      <tr key={c.category}>
                        <td>{c.kind === "damage_tiers" ? "ARC damage dealt" : c.category}{c.tiers && <span className="block text-xs text-muted">Tiers: {c.tiers.map((t) => t.toLocaleString("en-US")).join(" → ")}</span>}</td>
                        <td className="num text-right text-ink">{c.kind === "damage_tiers" ? c.valueRequired.toLocaleString("en-US") : <Coins value={c.valueRequired} />}</td>
                        {pdf && ph.phase === 5 && <td className={`num text-right ${pv != null && pv !== c.valueRequired ? "text-bad" : ""}`}>{pv != null ? pv.toLocaleString("en-US") : "—"}</td>}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : null}
        </Section>
      ))}

      <p className="mb-6 text-sm text-muted">Need materials? <Link className="link" href="/recycling">Find the best recycling donors</Link>.</p>
      <SourcesFooter ids={pdf ? ["dataset", "pdf"] : ["dataset"]} />
    </article>
  );
}
