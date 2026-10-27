import { Breadcrumbs, Callout, PageHeader, Section, SourcesFooter, cx } from "@/components/ui";
import { skills } from "@/lib/data";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "Skill tree (pre-Frozen Trail)",
  description: "ARC Raiders skill tree nodes in the Conditioning, Mobility and Survival branches, with max points and prerequisites.",
  path: "/skills",
});

const BRANCH: Record<string, string> = { CONDITIONING: "Conditioning", MOBILITY: "Mobility", SURVIVAL: "Survival" };

export default function SkillsPage() {
  const byId = new Map(skills.map((s) => [s.id, s]));
  return (
    <>
      <Breadcrumbs trail={[{ href: "/workshop", label: "Workshop" }, { label: "Skill tree" }]} />
      <PageHeader eyebrow="Progression" title="Skill tree">
        <p>{skills.length} nodes across three branches. Major nodes are highlighted; each node lists its maximum points and the nodes it requires.</p>
      </PageHeader>
      <Callout tone="warning" title="Likely outdated">
        The Frozen Trail update (8 October 2026) was reported to rework the skill tree. These nodes come from the August 2026 dataset snapshot and describe the tree before that rework.
      </Callout>
      <div className="grid gap-6 lg:grid-cols-3">
        {Object.entries(BRANCH).map(([key, label]) => (
          <Section key={key} id={label.toLowerCase()} title={label}>
            <ol className="space-y-2">
              {skills.filter((s) => s.category === key).sort((a, b) => (b.position?.y ?? 0) - (a.position?.y ?? 0)).map((s) => (
                <li key={s.id} className={cx("panel p-3", s.isMajor && "border-accent/50")}>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className={cx("font-medium", s.isMajor ? "text-accent" : "text-ink")}>{s.name}{s.isMajor && <span className="sr-only"> (major node)</span>}</h3>
                    <span className="num shrink-0 text-xs text-muted">max {s.maxPoints}</span>
                  </div>
                  {s.description && <p className="mt-1 text-sm text-ink-2">{s.description}</p>}
                  {s.prerequisites?.length ? <p className="mt-1 text-xs text-muted">Requires: {s.prerequisites.map((p) => byId.get(p)?.name ?? p).join(", ")}</p> : null}
                </li>
              ))}
            </ol>
          </Section>
        ))}
      </div>
      <SourcesFooter ids={["dataset", "frozenTrailLaunch"]} />
    </>
  );
}
