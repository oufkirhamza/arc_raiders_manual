import { Breadcrumbs, PageHeader, Section } from "@/components/ui";
import { GuideCard } from "@/components/GuideCard";
import { guides } from "@/content/guides";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "Guides & strategies",
  description: "ARC Raiders guides for beginners and veterans: extraction, recycling, workshop upgrades, attachments, loadouts, ARC tactics and more.",
  path: "/guides",
});

export default function GuidesPage() {
  const cats = [...new Set(guides.map((g) => g.category))];
  return (
    <>
      <Breadcrumbs trail={[{ label: "Guides & Strategies" }]} />
      <PageHeader eyebrow="Learn" title="Guides & Strategies">
        <p>Every section is labelled: <strong className="text-ink">Verified</strong>, <strong className="text-ink">Dataset</strong> or <strong className="text-ink">Cheat sheet</strong> for facts, <strong className="text-ink">Community</strong> for reported but unconfirmed details, and <strong className="text-ink">Strategy</strong> for our recommendations.</p>
      </PageHeader>
      {cats.map((c) => (
        <Section key={c} id={c.toLowerCase().replace(/[^a-z]+/g, "-")} title={c}>
          <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {guides.filter((g) => g.category === c).map((g) => <li key={g.slug}><GuideCard slug={g.slug} /></li>)}
          </ul>
        </Section>
      ))}
    </>
  );
}
