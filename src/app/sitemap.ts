import type { MetadataRoute } from "next";
import { bots, projects, quests, datasetMeta } from "@/lib/data";
import { getData } from "@/lib/live-data";
import { guides } from "@/content/guides";
import { maps, traders } from "@/content/world";
import { SITE } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { items, weaponFamilies } = await getData();
  const base = SITE.url.replace(/\/$/, "");
  const dataDate = datasetMeta.committedAt ? new Date(datasetMeta.committedAt) : undefined;
  const statics = ["", "/getting-started", "/items", "/weapons", "/attachments", "/enemies", "/traders", "/maps", "/keys", "/quests", "/workshop", "/projects", "/skills", "/recycling", "/guides", "/updates", "/sources"];
  return [
    ...statics.map((p) => ({ url: `${base}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.8 })),
    ...items.map((i) => ({ url: `${base}/items/${i.slug}`, lastModified: i.updatedAt ? new Date(i.updatedAt) : dataDate, priority: 0.6 })),
    ...weaponFamilies.map((f) => ({ url: `${base}/weapons/${f.slug}`, lastModified: dataDate, priority: 0.7 })),
    ...bots.map((b) => ({ url: `${base}/enemies/${b.slug}`, lastModified: dataDate, priority: 0.7 })),
    ...quests.map((q) => ({ url: `${base}/quests/${q.slug}`, lastModified: q.updatedAt ? new Date(q.updatedAt) : dataDate, priority: 0.5 })),
    ...projects.map((p) => ({ url: `${base}/projects/${p.slug}`, lastModified: dataDate, priority: 0.5 })),
    ...maps.map((m) => ({ url: `${base}/maps/${m.slug}`, priority: 0.7 })),
    ...traders.map((t) => ({ url: `${base}/traders/${t.slug}`, priority: 0.6 })),
    ...guides.map((g) => ({ url: `${base}/guides/${g.slug}`, lastModified: new Date(g.updated), priority: 0.8 })),
  ];
}
