import Link from "next/link";
import { ConfidenceBadge, Section } from "./ui";
import { PinCloseUp, PinnedMap } from "./PinnedMap";
import { getMap } from "@/lib/data";
import { getData } from "@/lib/live-data";
import type { Item, MapPin } from "@/lib/types";

const groupKey = (p: MapPin) => `${p.map}:${p.image ?? 0}`;

/** "Where to use it" section on item pages: map(s) with numbered pins and close-ups. */
export async function ItemLocations({ item }: { item: Item }) {
  const { mapOfItem } = await getData();
  const pins = item.locations ?? [];
  const home = mapOfItem(item);
  if (!pins.length && item.type !== "Key") return null;

  if (!pins.length) {
    return (
      <Section id="location" title="Where to use it">
        <div className="panel p-4 text-sm text-ink-2">
          <p className="font-medium text-ink">Location not confirmed yet</p>
          <p className="mt-1">
            {item.description ? `${item.description} ` : ""}We don’t have a verified position for this {item.type === "Key" ? "door" : "location"}.{" "}
            {home && <><Link className="link" href={`/maps/${home.slug}`}>{home.name} map</Link> · </>}
            <Link className="link" href={`/contribute?type=correction&item=${item.slug}`}>Know where it is? Tell us</Link>
          </p>
        </div>
      </Section>
    );
  }

  const groups = [...new Set(pins.map(groupKey))];
  const fromEditor = pins.every((p) => p.source === "editor");
  return (
    <Section id="location" title="Where to use it" action={<ConfidenceBadge level={fromEditor ? "editor" : "pdf"} />}>
      <div className="space-y-6">
        {groups.map((g) => {
          const inGroup = pins.map((pin, i) => ({ pin, n: i + 1 })).filter(({ pin }) => groupKey(pin) === g);
          const first = inGroup[0].pin;
          const map = getMap(first.map);
          const img = map?.image?.[first.image ?? 0];
          if (!map || !img) return null;
          const views = inGroup.map(({ pin, n }) => ({ x: pin.x, y: pin.y, n, label: pin.label ?? map.name }));
          return (
            <div key={g} className="grid gap-4 lg:grid-cols-[3fr_2fr]">
              <div>
                <p className="mb-2 text-sm text-ink-2">
                  <Link className="link" href={`/maps/${map.slug}`}>{map.name}</Link>{img.label ? ` · ${img.label}` : ""}
                </p>
                <PinnedMap src={img.src} alt={`${img.alt}, with ${views.length} marked ${views.length === 1 ? "location" : "locations"}`} w={img.w} h={img.h} pins={views} sizes="(min-width:1024px) 34rem, 100vw" />
              </div>
              <ul className="space-y-3">
                {views.map((v) => (
                  <li key={v.n}>
                    <p className="mb-1 flex items-center gap-2 text-sm text-ink">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent font-mono text-[0.65rem] text-accent-ink" aria-hidden="true">{v.n}</span>
                      {v.label}
                    </p>
                    <PinCloseUp src={img.src} w={img.w} h={img.h} x={v.x} y={v.y} n={v.n} label={v.label} />
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-muted">
        {fromEditor ? "Placed by the site editor." : "Position transferred from the v3.4 cheat sheet’s keycard map; it marks the area of the door, and may be slightly off."}{" "}
        <Link className="link" href={`/contribute?type=correction&item=${item.slug}`}>Report a wrong location</Link>
      </p>
    </Section>
  );
}
