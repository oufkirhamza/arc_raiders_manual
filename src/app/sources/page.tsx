import Link from "next/link";
import { Breadcrumbs, ConfidenceBadge, PageHeader, Section, SourceList, confidenceHelp } from "@/components/ui";
import { allSources } from "@/content/sources";
import { pdfMeta } from "@/content/pdf";
import { conflicts, crosscheckSummary } from "@/lib/crosscheck";
import { datasetMeta } from "@/lib/data";
import { pageMeta } from "@/lib/site";
import type { Confidence } from "@/lib/types";

export const metadata = pageMeta({
  title: "Sources, methodology & data conflicts",
  description: "Where this ARC Raiders knowledge base gets its data, how facts are verified, and every known disagreement between sources.",
  path: "/sources",
});

export default function SourcesPage() {
  return (
    <>
      <Breadcrumbs trail={[{ label: "Sources & Data" }]} />
      <PageHeader eyebrow="Methodology" title="Sources & Data">
        <p>How the information on this site is gathered, how much to trust each piece, and where sources disagree.</p>
      </PageHeader>

      <Section id="pipeline" title="Where the data comes from">
        <ol className="grid gap-3 md:grid-cols-3">
          <li className="panel p-4">
            <p className="eyebrow mb-1">1 · Starting point</p>
            <h3 className="font-display text-lg uppercase tracking-wide">{pdfMeta.title} {pdfMeta.version}</h3>
            <p className="mt-1 text-sm text-ink-2">By {pdfMeta.author}, {pdfMeta.date}. Five pages transcribed:</p>
            <ul className="mt-2 list-disc pl-5 text-sm text-ink-2">{pdfMeta.pages.map((p) => <li key={p}>{p}</li>)}</ul>
          </li>
          <li className="panel p-4">
            <p className="eyebrow mb-1">2 · Structured data</p>
            <h3 className="font-display text-lg uppercase tracking-wide">RaidTheory dataset</h3>
            <p className="mt-1 text-sm text-ink-2">
              {Object.entries(datasetMeta.counts).map(([k, v]) => `${v} ${k}`).join(", ")}. Commit <code className="num text-xs">{datasetMeta.commit.slice(0, 7)}</code> ({datasetMeta.committedAt?.slice(0, 10)}), MIT licence.
              Imported with <code className="text-xs">scripts/import-data.mjs</code>.
            </p>
          </li>
          <li className="panel p-4">
            <p className="eyebrow mb-1">3 · Research</p>
            <h3 className="font-display text-lg uppercase tracking-wide">Wiki, press & guides</h3>
            <p className="mt-1 text-sm text-ink-2">Maps, traders, extraction mechanics and post-dataset updates (Riven Tides, Frozen Trail) from the community wiki and press coverage, accessed 27 Oct 2026.</p>
          </li>
        </ol>
      </Section>

      <Section id="confidence" title="Confidence labels">
        <dl className="grid gap-3 md:grid-cols-2">
          {(Object.keys(confidenceHelp) as Confidence[]).map((c) => (
            <div key={c} className="flex items-start gap-3">
              <dt className="w-28 shrink-0"><ConfidenceBadge level={c} /></dt>
              <dd className="text-sm text-ink-2">{confidenceHelp[c].help}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-sm text-muted">We never fill gaps with invented numbers: missing stats are shown as “—”, and systems newer than the dataset are described only as far as coverage confirms.</p>
      </Section>

      <Section id="crosscheck" title="Cheat sheet vs dataset">
        <p className="mb-4 text-ink-2">
          Every number transcribed from the cheat sheet is compared automatically with the dataset at build time:{" "}
          <strong className="text-ok">{crosscheckSummary.match} match</strong>, <strong className="text-bad">{crosscheckSummary.conflict} conflict</strong>
          {crosscheckSummary.missing ? <>, <strong>{crosscheckSummary.missing} missing</strong></> : null} out of {crosscheckSummary.total} checks.
          Conflicts usually mean a value changed in a patch after one source was written; where we must pick, pages show the dataset value and flag the difference.
        </p>
        <div id="conflicts" className="panel overflow-x-auto">
          <table className="table-arc">
            <caption className="sr-only">Values where the cheat sheet and the dataset disagree</caption>
            <thead><tr><th scope="col">Area</th><th scope="col">Subject</th><th scope="col">Field</th><th scope="col">Cheat sheet (Mar 2026)</th><th scope="col">Dataset (Aug 2026)</th></tr></thead>
            <tbody>
              {conflicts.map((c, i) => (
                <tr key={i}>
                  <td>{c.area}</td>
                  <td>{c.href ? <Link className="link" href={c.href}>{c.subject}</Link> : c.subject}</td>
                  <td>{c.field}</td>
                  <td className="num">{c.pdf}</td>
                  <td className="num text-ink">{c.dataset}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-muted">Note: the cheat sheet prints a ROI for a few base materials (e.g. Metal Parts) that the dataset lists as non-recyclable; those show “—”.</p>
      </Section>

      <Section id="limitations" title="Known limitations">
        <ul className="list-disc space-y-1.5 pl-5 text-ink-2">
          <li>The dataset snapshot predates Frozen Trail (8 Oct 2026): Pendola Pass loot, new ARC (Bully, Skulker, Hydra), Bantam/Stiletto, new gadgets, the reworked skill tree and 22 new quests are not covered in detail.</li>
          <li>The Riven Tides ARC Turbine and the Nomadic Envoys trader are not in the dataset.</li>
          <li>Weapon damage/fire-rate numbers exist for only a few weapon tiers in the dataset, so they are not compared across weapons.</li>
          <li>Attachment timings come from frame-by-frame testing and are directional.</li>
          <li>Extraction details per map are from a November 2025 guide and may have changed.</li>
          <li>Item images are community upscales of in-game icons (© Embark Studios); 25 items have no image.</li>
        </ul>
      </Section>

      <Section id="all" title="All sources">
        <SourceList ids={[]} extra={allSources} />
      </Section>
    </>
  );
}
