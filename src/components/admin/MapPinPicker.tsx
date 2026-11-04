"use client";

import Image from "next/image";
import { useState } from "react";
import { Crosshair, Trash2 } from "lucide-react";
import { maps } from "@/content/world";
import { cx } from "../primitives";
import type { MapPin } from "@/lib/types";

const pickable = maps.filter((m) => m.image?.length);
const field = "rounded border border-line bg-bg-2 px-2 py-1.5 text-sm text-ink focus:border-accent/60 focus:outline-none";
const round = (n: number) => Math.round(n * 10000) / 10000;

/**
 * Click the map to add a pin. Select a pin (on the map or in the list) and click again to move it.
 * The value travels with the form as JSON in a hidden input; the server validates it on save.
 */
export function MapPinPicker({ name, initial, error, defaultMap }: { name: string; initial: string; error?: string; defaultMap?: string }) {
  const [pins, setPins] = useState<MapPin[]>(() => {
    try {
      return JSON.parse(initial) as MapPin[];
    } catch {
      return [];
    }
  });
  const start = pins[0]?.map ?? defaultMap ?? pickable[0]?.slug ?? "";
  const [mapSlug, setMapSlug] = useState(start);
  const [level, setLevel] = useState(pins[0]?.image ?? 0);
  const [selected, setSelected] = useState<number | null>(null);

  const map = pickable.find((m) => m.slug === mapSlug);
  const img = map?.image?.[level] ?? map?.image?.[0];
  const update = (i: number, patch: Partial<MapPin>) => setPins((list) => list.map((p, j) => (j === i ? { ...p, ...patch, source: "editor" } : p)));
  const onMap = (p: MapPin) => p.map === mapSlug && (p.image ?? 0) === level;

  const place = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!map) return;
    const box = e.currentTarget.getBoundingClientRect();
    const x = round((e.clientX - box.left) / box.width);
    const y = round((e.clientY - box.top) / box.height);
    if (selected != null) {
      update(selected, { map: map.slug, x, y, ...(map.image!.length > 1 ? { image: level } : { image: undefined }) });
      setSelected(null);
    } else {
      setPins((list) => [...list, { map: map.slug, ...(map.image!.length > 1 ? { image: level } : {}), x, y, source: "editor" }]);
    }
  };
  const showPin = (i: number) => {
    const p = pins[i];
    setMapSlug(p.map);
    setLevel(p.image ?? 0);
    setSelected(selected === i ? null : i);
  };

  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(pins)} />
      <div className="mb-3 flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="pin-map" className="eyebrow mb-1 block">Map</label>
          <select id="pin-map" value={mapSlug} onChange={(e) => { setMapSlug(e.target.value); setLevel(0); setSelected(null); }} className={field}>
            {pickable.map((m) => <option key={m.slug} value={m.slug}>{m.name}</option>)}
          </select>
        </div>
        {(map?.image?.length ?? 0) > 1 && (
          <div>
            <label htmlFor="pin-level" className="eyebrow mb-1 block">Level</label>
            <select id="pin-level" value={level} onChange={(e) => { setLevel(Number(e.target.value)); setSelected(null); }} className={field}>
              {map!.image!.map((im, i) => <option key={im.src} value={i}>{im.label ?? `Level ${i + 1}`}</option>)}
            </select>
          </div>
        )}
        <p className="text-sm text-ink-2" aria-live="polite">
          {selected != null ? <span className="text-accent">Click the map to move pin {selected + 1}.</span> : "Click the map to add a pin."}
        </p>
      </div>

      {img && (
        <div className="relative overflow-hidden rounded border border-line bg-bg" style={{ aspectRatio: `${img.w} / ${img.h}` }}>
          <Image src={img.src} alt={img.alt} fill sizes="(min-width:1024px) 60rem, 100vw" className="object-contain" />
          <button type="button" onClick={place} aria-label="Place a pin on the map" className="absolute inset-0 cursor-crosshair" />
          {pins.map((p, i) => onMap(p) && (
            <button
              key={i}
              type="button"
              onClick={() => showPin(i)}
              aria-label={`Select pin ${i + 1}`}
              aria-pressed={selected === i}
              className={cx("absolute flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 font-mono text-[0.7rem]", selected === i ? "border-accent-ink bg-ok text-accent-ink ring-2 ring-ok" : "border-bg bg-accent text-accent-ink")}
              style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%` }}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {error && <p className="mt-2 text-xs text-bad" role="alert">{error}</p>}

      {pins.length > 0 ? (
        <ol className="mt-3 space-y-2">
          {pins.map((p, i) => (
            <li key={i} className={cx("flex flex-wrap items-center gap-2 rounded border p-2", selected === i ? "border-ok/60" : "border-line")}>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent font-mono text-[0.7rem] text-accent-ink" aria-hidden="true">{i + 1}</span>
              <span className="min-w-32 text-sm text-ink-2">{maps.find((m) => m.slug === p.map)?.name ?? p.map}</span>
              <label className="min-w-40 flex-1">
                <span className="sr-only">Label for pin {i + 1}</span>
                <input value={p.label ?? ""} onChange={(e) => update(i, { label: e.target.value || undefined })} maxLength={60} placeholder="Label, e.g. Town Hall" className={cx(field, "w-full")} />
              </label>
              <span className="num text-xs text-muted">{(p.x * 100).toFixed(1)}%, {(p.y * 100).toFixed(1)}%</span>
              <button type="button" onClick={() => showPin(i)} aria-pressed={selected === i} className="inline-flex items-center gap-1 rounded border border-line px-2 py-1 text-xs hover:border-accent/60">
                <Crosshair className="h-3.5 w-3.5" aria-hidden="true" /> Move
              </button>
              <button
                type="button"
                onClick={() => { setPins((list) => list.filter((_, j) => j !== i)); setSelected(null); }}
                aria-label={`Remove pin ${i + 1}`}
                className="inline-flex items-center gap-1 rounded border border-bad/50 px-2 py-1 text-xs text-bad hover:bg-bad/10"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Remove
              </button>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-3 text-sm text-muted">No pins yet. The item page will say the location isn’t confirmed.</p>
      )}
    </div>
  );
}
