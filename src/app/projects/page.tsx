import Link from "next/link";
import { Breadcrumbs, PageHeader, SourcesFooter } from "@/components/ui";
import { projects } from "@/lib/data";
import { conflicts } from "@/lib/crosscheck";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "Expeditions & projects",
  description: "ARC Raiders Expedition projects and community projects: every phase, required item and Load Stage value.",
  path: "/projects",
});

export default function ProjectsPage() {
  const active = projects.filter((p) => !p.disabled);
  const past = projects.filter((p) => p.disabled);
  const card = (p: (typeof projects)[number]) => {
    const n = conflicts.filter((c) => c.href === `/projects/${p.slug}`).length;
    return (
      <li key={p.id}>
        <Link href={`/projects/${p.slug}`} className="panel group flex h-full flex-col gap-2 p-4 hover:border-accent/50">
          <h3 className="font-display text-xl font-bold uppercase tracking-wide group-hover:text-accent">{p.name}</h3>
          {p.description && <p className="line-clamp-2 text-sm text-ink-2">{p.description}</p>}
          <p className="mt-auto pt-1 text-xs text-muted">
            {p.phases.length} phases · {p.phases.reduce((s, ph) => s + (ph.items?.length ?? 0), 0)} item requirements
            {n > 0 && <span className="ml-2 text-bad">· {n} source conflicts</span>}
          </p>
        </Link>
      </li>
    );
  };
  return (
    <>
      <Breadcrumbs trail={[{ href: "/workshop", label: "Workshop" }, { label: "Expeditions & projects" }]} />
      <PageHeader eyebrow="Progression" title="Expeditions & Projects">
        <p>Multi-phase community projects. Expedition projects end with a Load Stage (turn in items up to a coin value per category) and a Departure phase that tracks ARC damage. <Link href="/guides/expeditions-explained" className="link">How they work</Link></p>
      </PageHeader>
      <h2 className="mb-3 font-display text-2xl uppercase tracking-wide">Listed as active in the dataset</h2>
      <ul className="mb-10 grid gap-3 md:grid-cols-2 lg:grid-cols-3">{active.map(card)}</ul>
      {past.length > 0 && (
        <>
          <h2 className="mb-3 font-display text-2xl uppercase tracking-wide">Disabled / past projects</h2>
          <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">{past.map(card)}</ul>
        </>
      )}
      <SourcesFooter ids={["dataset", "pdf"]} />
    </>
  );
}
