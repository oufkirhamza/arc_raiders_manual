# ARC Field Manual — an ARC Raiders knowledge base

An unofficial, statically generated ARC Raiders wiki and guide built with Next.js. It started from the
community **"ARC Raiders Master Cheat Sheet" v3.4** (u/pRoDeeD, 24 Mar 2026) and expands it with a structured
game dataset and current research, labelling every fact by how well it is verified.

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
```

Production:

```bash
npm run build
npm start
```

Quality checks:

```bash
npm run check        # typecheck + lint + data validation
npm run check-links  # run against a started server: crawls the sitemap, verifies every internal link and image
```

Set `NEXT_PUBLIC_SITE_URL` (e.g. `https://example.com`) before building for production so canonical URLs,
Open Graph URLs, `sitemap.xml` and `robots.txt` use the real domain.

### Refreshing game data

The generated data in `src/data/generated/` and the images in `public/img/{items,arc,traders,workshop}` come
from [RaidTheory/arcraiders-data](https://github.com/RaidTheory/arcraiders-data) (MIT). To update:

```bash
git clone --depth 1 https://github.com/RaidTheory/arcraiders-data ../arcraiders-data
npm run import-data -- ../arcraiders-data
npm run validate     # re-runs the cheat-sheet cross-check and reference checks
```

The import script only reads JSON and copies images; it never executes code from the checkout. Map overview
images in `public/img/maps` were stitched once from the dataset's map tiles.

## Community requests & back office

Players can suggest changes at **`/contribute`** (linked from the sidebar, the footer, the items list and a
"Suggest a correction" box on every item page, which pre-fills the item). Three request types:
add a missing item, correct an existing item (which field, current value, proposed value), or report a problem.
Each request gets a reference like `REQ-…`. Spam protection: hidden honeypot field and a limit of 5 requests per
10 minutes per IP.

The editor reviews them in the **back office at `/admin`**:

* list with status tabs (Open, New, In review, Accepted, Done, Rejected, All), type filter and text search;
* request page showing the proposed change next to the item's current data, a link to the item, a copyable summary,
  status workflow with history, private notes, and delete (requires a confirmation tick);
* CSV / JSON export of all requests.

Setup — copy `.env.example` to `.env.local` and set:

```bash
ADMIN_PASSWORD=your-own-password
ADMIN_SESSION_SECRET=a-random-string-of-at-least-32-characters
```

The back office is disabled until both are set. Sign-in uses a signed, HTTP-only, 12-hour session cookie; all
`/admin` routes are protected by middleware and every admin action re-checks the session. Login attempts are
rate-limited. In production the cookie requires HTTPS (set `ADMIN_ALLOW_HTTP=1` only for local testing of a
production build).

### Editing items from the back office

`/admin/items` lists every item. Open one to correct it, or use **New item** to add one the dataset lacks:
name, description, type, rarity, sell value, weight, stack size, crafting recipe, recycles/salvages into
(one `item_id x5` per line, ids are validated), loot areas, tip, **image upload** (PNG/JPEG/WebP, max 2 MB),
and a "hide from site" switch. Fields that differ from the dataset are marked *changed* with the dataset value
shown underneath; **Revert to dataset** undoes all your changes to an item.

On a request page, **Apply in item editor** (corrections) or **Create this item** (new items) opens the editor
pre-filled from the request; saving publishes the change and marks the request **Done**.

Saving publishes immediately — **no file edits, no rebuild**. Edits are stored as a layer on top of the imported
dataset (`src/lib/live-data.ts`): only changed fields are saved, so a future `npm run import-data` keeps your
corrections. Public pages stay statically generated; saving invalidates the cached edits and Next.js
regenerates the affected pages on their next visit. Edited items show an **Editor-verified** badge.

### Storage: Supabase (production) or local files (development)

With `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` set, requests and item edits live in Supabase Postgres
and images in Supabase Storage. Without them, everything is kept in `./storage` (git-ignored) — fine for local
development, **not** for Vercel, whose filesystem is not persistent.

#### One-time setup (free plan)

1. Create a project at [supabase.com](https://supabase.com) (free plan).
2. In the Supabase dashboard open **SQL Editor → New query**, paste [`supabase/schema.sql`](supabase/schema.sql)
   and run it. It creates the `requests` and `item_edits` tables (Row Level Security on, no public access) and
   the public `item-images` storage bucket (2 MB limit, PNG/JPEG/WebP only).
3. In **Project Settings → API** copy the **Project URL** and the **secret / service_role key**.
4. In Vercel → your project → **Settings → Environment Variables**, add:

   | Name | Value |
   |---|---|
   | `SUPABASE_URL` | Project URL |
   | `SUPABASE_SERVICE_ROLE_KEY` | secret / service_role key — server-side only, never expose it |
   | `ADMIN_PASSWORD` | your back-office password |
   | `ADMIN_SESSION_SECRET` | 32+ random characters |
   | `NEXT_PUBLIC_SITE_URL` | your site URL, e.g. `https://your-site.vercel.app` |

5. Redeploy. For local development against the same database, put the same values in `.env.local`
   (or run `vercel env pull .env.local`).

Free-plan notes: Supabase pauses free projects after a period of inactivity (unpause from the dashboard);
the site build reads item edits, so a paused project makes deploys fail until it is resumed. Free storage is
plenty for item icons (~20 KB each).

## What's in it

| Route | Content |
|---|---|
| `/` | Hero, latest update, quick access, featured guides, high-demand components, biggest threats, maps |
| `/getting-started` | Core loop, essential mechanics, first upgrades, starter guides |
| `/items`, `/items/[slug]` | 581 items: searchable/filterable/sortable browser (category, type, rarity, purpose); detail pages with crafting, recycling vs salvage, ROI, donors, ARC drops, trader offers, quest rewards, and every use (recipes, workshop, quests, projects, upgrades) |
| `/weapons`, `/weapons/[slug]` | 24 weapon families compared; tier/upgrade path, attachment slots, magazine sizes |
| `/attachments` | Tested attachment effects and magazine sizes from the cheat sheet |
| `/enemies`, `/enemies/[slug]` | 17 ARC with threat, weakness, drops, maps, related quests; newer ARC as clearly-labelled stubs |
| `/traders`, `/traders/[slug]` | Traders with shop inventory, barter offers and quest lines |
| `/maps`, `/maps/[slug]`, `/keys` | 7 maps: overview renders, difficulty/unlock, conditions, POIs, keys, ARC, quests; keycards by map |
| `/quests`, `/quests/[slug]` | 100 quests: objectives, hand-ins (copyable), rewards, chain navigation |
| `/workshop`, `/projects`, `/skills` | Station upgrade costs, Expedition/projects (with source conflicts), skill tree (flagged pre-rework) |
| `/recycling` | Recycling Value Index for every recyclable item (sortable), best donors per component, keep-for-quests |
| `/guides`, `/guides/[slug]` | 13 guides with table of contents, per-section confidence labels and sources |
| `/search` | Global, typo-tolerant search (Fuse.js) across all content with type filters |
| `/updates`, `/sources` | Update timeline; sources, methodology, automatic cheat-sheet-vs-dataset conflict table |

All ~780 pages are statically generated. Client JavaScript is limited to the header/search box, mobile nav,
the item browser, recycling table, search page and copy buttons; game data is never shipped to the browser
except as the slim lists those components need (search loads `/search-index.json` lazily).

## Architecture

```
scripts/
  import-data.mjs      dataset → compact English JSON + images
  validate-data.ts     reference integrity + PDF cross-check (npm run validate)
  check-links.mjs      crawler for broken links/images
src/
  app/                 routes (server components by default)
  components/          ui.tsx (server building blocks), primitives.tsx (client-safe), site shell, browsers
  content/             hand-authored, sourced content
    pdf.ts             every number transcribed from the v3.4 cheat sheet (by dataset id)
    world.ts           maps, traders, update timeline, post-dataset ARC
    guides.ts          guides as typed blocks with confidence labels
    sources.ts         source registry (URLs, publishers, dates)
  data/generated/      imported dataset (do not edit by hand)
  lib/
    data.ts            indexes and relationships (used-in, recycled-from, needed-for, dropped-by, sold-by), ROI, weapon families
    crosscheck.ts      PDF vs dataset comparison used by pages and /sources
    search-index.ts    search documents
```

Relationships are derived from the data model (recipes, `recyclesInto`/`salvagesInto`, workshop levels,
quest hand-ins and rewards, project phases, ARC drops, vendors/trades) rather than hard-coded per page, so
crafting inputs, recycling outputs, upgrade costs and quest requirements are kept distinct.

## Data sources and verification

* **Cheat sheet v3.4** (starting point): Expedition Projects 1–3, Recycling Value Index, workshop upgrade
  costs, keep-for-quests list, best donors, keycards by map (with POI names), attachment effects, magazine sizes.
* **RaidTheory/arcraiders-data** (MIT, commit `2a4abeb`, 18 Aug 2026): items, quests, workshop, projects, ARC, trades, skills.
* **Research (accessed 27 Oct 2026)**: arcraiders.wiki (Maps, Traders), press coverage of Riven Tides and
  Frozen Trail, an extraction guide. Each page lists its sources.

Every cheat-sheet number is compared with the dataset at build time: **232 of 251 match; 19 conflict**
(e.g. Expedition 1 Load Stage 750k vs 830k total, Expedition 2 Rubber vs Plastic Parts ×200, Expedition 3
Battery ×35 vs ×25, several donor yields). Conflicts are shown on the affected pages and listed on `/sources`.

Confidence labels: **Verified**, **Dataset**, **Cheat sheet**, **Community**, **Conflict**, **Strategy** (our recommendation).

## Known limitations

* The dataset predates **Frozen Trail** (8 Oct 2026): Pendola Pass loot/POIs, Bully/Skulker/Hydra, Bantam/Stiletto,
  new gadgets, 22 new quests and the reworked skill tree are only summarised from launch coverage. The skill tree page is marked as likely outdated.
* The Riven Tides ARC Turbine and the Nomadic Envoys trader have no dataset entries.
* Weapon damage/fire-rate numbers exist only for a few tiers, so weapons are compared on verified fields only.
* Attachment timings are frame-by-frame measurements the author marks as directional; inconsistent printed values are flagged.
* Per-map extraction types come from a November 2025 guide.
* 25 items have no image (a placeholder is shown).
* `npm audit` reports advisories in Next's bundled PostCSS (build-time only); a fix requires a major Next upgrade.

## Legal

ARC Raiders and all related names, images and game content are © Embark Studios AB. This is an unofficial fan
project, not affiliated with or endorsed by Embark Studios. Item, ARC, trader and map images come from the
RaidTheory community dataset.
