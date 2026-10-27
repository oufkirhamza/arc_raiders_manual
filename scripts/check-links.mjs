#!/usr/bin/env node
/**
 * Broken-link and missing-image checker. Start the site first (`npm run build && npm start`), then:
 *   npm run check-links [-- http://localhost:3000]
 * Crawls every URL in the sitemap, then verifies every internal href and every /img/ src it finds.
 */
const BASE = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");

const xml = await (await fetch(`${BASE}/sitemap.xml`)).text();
const pages = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
const targets = new Map(); // path -> first page referencing it
const status = new Map();

async function head(path) {
  if (status.has(path)) return status.get(path);
  const res = await fetch(`${BASE}${path}`, { redirect: "manual" });
  status.set(path, res.status);
  return res.status;
}

let i = 0;
const queue = [...pages];
async function worker() {
  while (queue.length) {
    const p = queue.shift();
    const res = await fetch(`${BASE}${p}`);
    status.set(p, res.status);
    const html = await res.text();
    for (const m of html.matchAll(/(?:href|src)="(\/[^"#?]*)(?:[?#][^"]*)?"/g)) {
      const t = m[1].replace(/&amp;/g, "&");
      if (t.startsWith("/_next/")) continue;
      if (!targets.has(t)) targets.set(t, p);
    }
    if (++i % 100 === 0) console.log(`  crawled ${i}/${pages.length}`);
  }
}
await Promise.all(Array.from({ length: 8 }, worker));

const broken = [];
const list = [...targets.keys()];
await Promise.all(Array.from({ length: 8 }, async () => {
  while (list.length) {
    const t = list.shift();
    const s = await head(t);
    if (s >= 400) broken.push(`${s} ${t}  (linked from ${targets.get(t)})`);
  }
}));
const badPages = pages.filter((p) => status.get(p) !== 200);

console.log(`Pages crawled: ${pages.length} · unique internal links/images: ${targets.size}`);
console.log(`Non-200 sitemap pages: ${badPages.length}`);
badPages.forEach((p) => console.log("  ", status.get(p), p));
console.log(`Broken links/images: ${broken.length}`);
broken.slice(0, 50).forEach((b) => console.log("  ", b));
process.exit(badPages.length || broken.length ? 1 : 0);
