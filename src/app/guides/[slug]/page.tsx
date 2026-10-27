import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Breadcrumbs, ConfidenceBadge, SourcesFooter } from "@/components/ui";
import { GuideBlocks } from "@/components/GuideBlocks";
import { GuideCard } from "@/components/GuideCard";
import { guides } from "@/content/guides";
import { pageMeta, SITE } from "@/lib/site";

export function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const slug = (await params).slug;
  const g = guides.find((x) => x.slug === slug);
  if (!g) return {};
  return { ...pageMeta({ title: g.title, description: g.summary, path: `/guides/${g.slug}` }), openGraph: { type: "article", title: g.title, description: g.summary, url: `/guides/${g.slug}`, modifiedTime: g.updated } };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  const g = guides.find((x) => x.slug === slug);
  if (!g) notFound();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: g.title,
    description: g.summary,
    dateModified: g.updated,
    publisher: { "@type": "Organization", name: SITE.name },
    about: { "@type": "VideoGame", name: "ARC Raiders" },
  };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumbs trail={[{ href: "/guides", label: "Guides" }, { label: g.title }]} />
      <div className="lg:grid lg:grid-cols-[1fr_15rem] lg:gap-10">
        <div className="min-w-0">
          <header className="mb-8 border-b border-line pb-6">
            <p className="eyebrow mb-2">{g.category} · updated {g.updated}</p>
            <h1 className="font-display text-4xl font-bold uppercase leading-none tracking-wide md:text-5xl">{g.title}</h1>
            <p className="mt-3 text-lg text-ink-2">{g.summary}</p>
          </header>

          {/* mobile table of contents */}
          {g.sections.length > 2 && (
            <details className="panel mb-8 p-4 lg:hidden">
              <summary className="cursor-pointer font-display uppercase tracking-wide">Contents</summary>
              <ol className="mt-2 space-y-1 text-sm">{g.sections.map((s) => <li key={s.id}><a className="link" href={`#${s.id}`}>{s.heading}</a></li>)}</ol>
            </details>
          )}

          {g.sections.map((s) => (
            <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`} className="mb-10">
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <h2 id={`${s.id}-h`} className="flex items-center gap-2 font-display text-2xl font-semibold uppercase tracking-wide">
                  <span className="h-4 w-1 bg-accent" aria-hidden="true" />{s.heading}
                </h2>
                <ConfidenceBadge level={s.confidence} />
              </div>
              <GuideBlocks blocks={s.blocks} />
            </section>
          ))}

          {g.related?.length ? (
            <section aria-labelledby="related-h" className="mt-12">
              <h2 id="related-h" className="mb-4 font-display text-2xl uppercase tracking-wide">Related guides</h2>
              <ul className="grid gap-3 md:grid-cols-2">{g.related.map((r) => <li key={r}><GuideCard slug={r} /></li>)}</ul>
            </section>
          ) : null}

          {g.sources.length > 0 && <SourcesFooter ids={g.sources} updated={g.updated} />}
        </div>

        <aside className="hidden lg:block">
          <nav aria-label="Table of contents" className="sticky top-20">
            <p className="eyebrow mb-3">On this page</p>
            <ol className="space-y-2 border-l border-line text-sm">
              {g.sections.map((s) => <li key={s.id}><a href={`#${s.id}`} className="-ml-px block border-l border-transparent pl-3 text-ink-2 hover:border-accent hover:text-ink">{s.heading}</a></li>)}
            </ol>
          </nav>
        </aside>
      </div>
    </article>
  );
}
