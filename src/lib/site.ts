import type { Metadata } from "next";

export const SITE = {
  name: "ARC Field Manual",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  description:
    "An unofficial ARC Raiders knowledge base: searchable items, crafting and recycling, weapons and attachments, ARC enemies, maps and keycards, quests, workshop upgrades and guides.",
};

/** Consistent per-page metadata with canonical URL and Open Graph. */
export function pageMeta(opts: { title: string; description: string; path: string; image?: string }): Metadata {
  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: opts.path },
    openGraph: {
      title: `${opts.title} · ${SITE.name}`,
      description: opts.description,
      url: opts.path,
      ...(opts.image ? { images: [{ url: opts.image }] } : {}),
    },
  };
}
