import { Suspense } from "react";
import { Breadcrumbs, PageHeader } from "@/components/ui";
import { SearchClient } from "@/components/SearchClient";
import { pageMeta } from "@/lib/site";

export const metadata = { ...pageMeta({ title: "Search", description: "Search every item, weapon, ARC enemy, quest, map, trader and guide.", path: "/search" }), robots: { index: false } };

export default function SearchPage() {
  return (
    <>
      <Breadcrumbs trail={[{ label: "Search" }]} />
      <PageHeader eyebrow="Search" title="Search the manual" />
      <Suspense fallback={<p className="text-muted" role="status">Loading search…</p>}>
        <SearchClient />
      </Suspense>
    </>
  );
}
