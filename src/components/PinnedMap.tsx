import Image from "next/image";
import Link from "next/link";
import { cx } from "./primitives";

export interface PinView {
  x: number;
  y: number;
  n: number;
  label: string;
  href?: string;
}

const PIN = "absolute flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-bg bg-accent font-mono text-[0.7rem] font-medium text-accent-ink shadow-[0_0_0_2px_rgb(255_184_28/0.45)]";

/** A map image with numbered pins. Pins are positioned as percentages, so they scale with the image. */
export function PinnedMap({ src, alt, w, h, pins, sizes, className }: { src: string; alt: string; w: number; h: number; pins: PinView[]; sizes?: string; className?: string }) {
  return (
    <figure className={cx("panel overflow-hidden", className)}>
      <div className="relative" style={{ aspectRatio: `${w} / ${h}` }}>
        <Image src={src} alt={alt} fill sizes={sizes ?? "(min-width:1024px) 60rem, 100vw"} className="object-contain" />
        {pins.map((p) => {
          const style = { left: `${p.x * 100}%`, top: `${p.y * 100}%` };
          return p.href ? (
            <Link key={p.n} href={p.href} title={p.label} aria-label={`${p.n}: ${p.label}`} className={cx(PIN, "transition-transform hover:z-10 hover:scale-125")} style={style}>{p.n}</Link>
          ) : (
            <span key={p.n} title={p.label} className={PIN} style={style}>{p.n}</span>
          );
        })}
      </div>
    </figure>
  );
}

/**
 * Zoomed view of one pin. A background position of p% lines up the image's p% point with the box's
 * p% point, so placing the pin at the same percentage keeps it on target even near the map edges.
 */
export function PinCloseUp({ src, w, h, x, y, n, zoom = 5, label }: { src: string; w: number; h: number; x: number; y: number; n: number; zoom?: number; label: string }) {
  const pos = `${x * 100}% ${y * 100}%`;
  return (
    <div
      role="img"
      aria-label={`Close-up of the map at ${label}`}
      className="relative overflow-hidden rounded border border-line bg-bg"
      style={{ aspectRatio: `${w} / ${h}`, backgroundImage: `url(${src})`, backgroundSize: `${zoom * 100}% auto`, backgroundPosition: pos, backgroundRepeat: "no-repeat" }}
    >
      <span className={PIN} style={{ left: `${x * 100}%`, top: `${y * 100}%` }} aria-hidden="true">{n}</span>
    </div>
  );
}
