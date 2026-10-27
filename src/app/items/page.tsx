import { Suspense } from "react";
import { ItemBrowser, type BrowserItem } from "@/components/ItemBrowser";
import { Breadcrumbs, PageHeader } from "@/components/ui";
import { ITEM_GROUPS, items, recycleRoi, usesOf, datasetMeta } from "@/lib/data";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "Items & Components Database",
  description: "Search and filter every ARC Raiders item by category, rarity and purpose — with sell values, crafting, recycling and what each item is needed for.",
  path: "/items",
});

export default function ItemsPage() {
  const list: BrowserItem[] = items.map((i) => {
    const uses = usesOf(i.id);
    return {
      slug: i.slug,
      name: i.name,
      type: i.type,
      rarity: i.rarity,
      value: i.value,
      image: i.image,
      roi: recycleRoi(i)?.roi ?? null,
      craftable: !!i.recipe?.length,
      recyclable: !!i.recyclesInto?.length,
      needed: uses.some((u) => u.kind === "workshop" || u.kind === "quest" || u.kind === "project"),
      sold: !!i.vendors?.length,
      quest: !!i.questItem,
    };
  });
  return (
    <>
      <Breadcrumbs trail={[{ label: "Items & Components" }]} />
      <PageHeader eyebrow="Database" title="Items & Components">
        <p>
          {items.length} items from the community dataset (snapshot {datasetMeta.committedAt?.slice(0, 10)}). Items marked{" "}
          <span className="rounded border border-accent/40 px-1 font-mono text-[0.65rem] uppercase text-accent">Keep</span> are needed for a
          workshop upgrade, quest or project.
        </p>
      </PageHeader>
      <Suspense fallback={<p className="text-muted" role="status">Loading filters…</p>}>
        <ItemBrowser items={list} groups={ITEM_GROUPS} />
      </Suspense>
    </>
  );
}
