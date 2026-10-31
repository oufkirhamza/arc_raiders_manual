import { Breadcrumbs, PageHeader } from "@/components/ui";
import { ContributeForm } from "@/components/ContributeForm";
import { getData } from "@/lib/live-data";
import { REQUEST_KINDS, type RequestKind } from "@/lib/requests";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "Suggest an item or correction",
  description: "Report a missing ARC Raiders item, suggest a correction, or report a problem with the knowledge base.",
  path: "/contribute",
});

export default async function ContributePage({ searchParams }: { searchParams: Promise<{ item?: string; type?: string }> }) {
  const { getItemBySlug, items } = await getData();
  const sp = await searchParams;
  const it = sp.item ? getItemBySlug(sp.item) : undefined;
  const kind = sp.type && sp.type in REQUEST_KINDS ? (sp.type as RequestKind) : undefined;
  const options = items.map((i) => ({ id: i.id, name: i.name, slug: i.slug }));

  return (
    <>
      <Breadcrumbs trail={[{ label: "Suggest a change" }]} />
      <PageHeader eyebrow="Contribute" title="Suggest a change">
        <p>Spotted a missing item, a wrong number or a broken page? Send it here. Every request is checked against the game before the site is updated.</p>
      </PageHeader>
      <div className="max-w-3xl">
        <ContributeForm items={options} initialKind={kind} initialItem={it ? { id: it.id, name: it.name, slug: it.slug } : undefined} />
      </div>
    </>
  );
}
