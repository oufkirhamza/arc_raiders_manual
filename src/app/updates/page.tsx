import { Breadcrumbs, ConfidenceBadge, PageHeader, SourceList } from "@/components/ui";
import { updates } from "@/content/world";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "Updates & patch timeline",
  description: "ARC Raiders update timeline: Frozen Trail, Riven Tides and recent patches, and what this site's data covers.",
  path: "/updates",
});

export default function UpdatesPage() {
  return (
    <>
      <Breadcrumbs trail={[{ label: "Updates" }]} />
      <PageHeader eyebrow="Timeline" title="Updates">
        <p>Major updates and the data snapshots this site is built on, newest first.</p>
      </PageHeader>
      <ol className="relative space-y-6 border-l border-line pl-6">
        {updates.map((u) => (
          <li key={u.date + u.title} className="relative">
            <span className="absolute -left-[1.85rem] top-1.5 h-3 w-3 rotate-45 border-2 border-accent bg-bg" aria-hidden="true" />
            <article className="panel p-5">
              <div className="flex flex-wrap items-center gap-3">
                <time dateTime={u.date} className="num text-sm text-accent">{u.date}</time>
                {u.version && <span className="rounded border border-line-2 px-1.5 font-mono text-xs text-muted">v{u.version}</span>}
                <ConfidenceBadge level={u.confidence} />
              </div>
              <h2 className="mt-2 font-display text-2xl font-bold uppercase tracking-wide">{u.title}</h2>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-ink-2">{u.points.map((p) => <li key={p}>{p}</li>)}</ul>
              <div className="mt-4 border-t border-line pt-3"><SourceList ids={u.sources} /></div>
            </article>
          </li>
        ))}
      </ol>
    </>
  );
}
