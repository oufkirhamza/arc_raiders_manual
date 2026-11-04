import Link from "next/link";
import { PinnedMap } from "./PinnedMap";
import { getMap } from "@/lib/data";
import { getData } from "@/lib/live-data";

/** Every pinned key on a map, one image per level. Each pin links to its key. */
export async function MapKeyPins({ slug, sizes }: { slug: string; sizes?: string }) {
  const { pinsForMap } = await getData();
  const map = getMap(slug);
  const pins = pinsForMap(slug).map((p, i) => ({ ...p, n: i + 1 }));
  if (!map?.image || !pins.length) return null;

  return (
    <div className="mb-4 space-y-5">
      {map.image.map((img, index) => {
        const here = pins.filter((p) => (p.pin.image ?? 0) === index);
        if (!here.length) return null;
        return (
          <div key={img.src} className="grid gap-4 lg:grid-cols-[3fr_2fr]">
            <div>
              {img.label && <p className="eyebrow mb-2">{img.label}</p>}
              <PinnedMap
                src={img.src}
                alt={`${img.alt}, with ${here.length} key locations marked`}
                w={img.w}
                h={img.h}
                sizes={sizes}
                pins={here.map((p) => ({ x: p.pin.x, y: p.pin.y, n: p.n, label: `${p.item.name}${p.pin.label ? ` — ${p.pin.label}` : ""}`, href: `/items/${p.item.slug}#location` }))}
              />
            </div>
            <ol className="space-y-1.5 text-sm">
              {here.map((p) => (
                <li key={p.n} className="flex items-start gap-2">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent font-mono text-[0.65rem] text-accent-ink" aria-hidden="true">{p.n}</span>
                  <span>
                    <Link className="link" href={`/items/${p.item.slug}#location`}>{p.item.name}</Link>
                    {p.pin.label && <span className="text-muted"> — {p.pin.label}</span>}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        );
      })}
    </div>
  );
}
