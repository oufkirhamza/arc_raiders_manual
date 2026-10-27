import Link from "next/link";
import { Breadcrumbs, Callout, ChipList, ConfidenceBadge, PageHeader, Section, SourcesFooter } from "@/components/ui";
import { pdfAttachments, pdfMagazines } from "@/content/pdf";
import { getItem, getWeaponFamily, items } from "@/lib/data";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "Weapon attachments guide",
  description: "Tested effects of every ARC Raiders attachment: grips, compensators, silencers, extended barrels, stocks and extended magazines.",
  path: "/attachments",
});

const famName = (id: string) => getWeaponFamily(id.replace(/_/g, "-"))?.name ?? id;

export default function AttachmentsPage() {
  const mods = items.filter((i) => i.type === "Modification");
  return (
    <>
      <Breadcrumbs trail={[{ href: "/weapons", label: "Weapons & Gear" }, { label: "Attachments" }]} />
      <PageHeader eyebrow="Weapons & Gear" title="Attachments" aside={<ConfidenceBadge level="pdf" />}>
        <p>What each attachment changes, from the v3.4 cheat sheet’s in-game testing (informed by ModerNik). Recipes and compatibility come from the dataset — open any attachment for its crafting cost.</p>
      </PageHeader>

      <Callout tone="warning" title="Treat timings as directional">
        The sheet’s author notes that frame-by-frame timings (recoil and dispersion recovery) have a margin of error. Where the printed numbers are inconsistent we say so.
      </Callout>

      <nav aria-label="On this page" className="mb-8 flex flex-wrap gap-2 text-sm">
        {pdfAttachments.map((a) => <a key={a.stat} href={`#${a.stat.toLowerCase().replace(/[^a-z]+/g, "-")}`} className="rounded border border-line px-2 py-1 text-ink-2 hover:border-accent/60 hover:text-ink">{a.stat}</a>)}
        <a href="#magazines" className="rounded border border-line px-2 py-1 text-ink-2 hover:border-accent/60 hover:text-ink">Magazine sizes</a>
      </nav>

      <div className="grid gap-x-8 lg:grid-cols-2">
        {pdfAttachments.map((a) => (
          <Section key={a.stat} id={a.stat.toLowerCase().replace(/[^a-z]+/g, "-")} title={a.stat}>
            <div className="panel p-4">
              <p className="text-ink-2">{a.explainer}</p>
              <p className="mt-1 text-sm text-muted">{a.reducedBy && <>Affected by: <span className="text-ink-2">{a.reducedBy}</span></>}{a.baseline && <> · Baseline: <span className="num text-ink-2">{a.baseline}</span></>}</p>
              <table className="table-arc mt-3">
                <thead><tr><th scope="col">Attachment</th><th scope="col" className="text-right">Effect</th>{a.rows.some((r) => r.seconds) && <th scope="col" className="text-right">Time</th>}</tr></thead>
                <tbody>
                  {a.rows.map((r) => {
                    const it = r.id ? getItem(r.id) : undefined;
                    return (
                      <tr key={r.name}>
                        <td>{it ? <Link className="link" href={`/items/${it.slug}`}>{r.name}</Link> : r.name}</td>
                        <td className="num text-right text-ink">{r.value}</td>
                        {a.rows.some((x) => x.seconds) && <td className="num text-right">{r.seconds ?? ""}</td>}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {a.mostEffective && <p className="mt-3 text-sm text-muted">Most effective on: {a.mostEffective.map((id, i) => <span key={id}>{i > 0 && ", "}<Link className="link" href={`/weapons/${id.replace(/_/g, "-")}`}>{famName(id)}</Link></span>)}</p>}
              {a.caveat && <p className="mt-3 border-l-2 border-hazard/60 pl-3 text-sm text-ink-2">{a.caveat}</p>}
            </div>
          </Section>
        ))}
      </div>

      <Section id="magazines" title="Magazine sizes">
        <div className="panel overflow-x-auto">
          <table className="table-arc">
            <caption className="sr-only">Magazine size by weapon and extended magazine tier</caption>
            <thead><tr><th scope="col">Weapon</th><th scope="col">Mag type</th><th scope="col">No ext. mag</th><th scope="col">Extended I</th><th scope="col">Extended II</th><th scope="col">Extended III</th></tr></thead>
            <tbody>
              {pdfMagazines.map((m) => (
                <tr key={m.family}>
                  <td><Link className="link" href={`/weapons/${m.family.replace(/_/g, "-")}`}>{famName(m.family)}</Link></td>
                  <td>{m.ammo}</td>
                  {m.sizes.map((s, i) => <td key={i} className="num text-ink">{s}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="all-mods" title={`All ${mods.length} attachments`}>
        <ChipList list={mods.map((m) => ({ id: m.id }))} />
      </Section>

      <SourcesFooter ids={["pdf", "dataset"]} />
    </>
  );
}
