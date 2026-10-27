/** Data-free UI primitives: safe to import from client components. */
import Image from "next/image";
import { ImageOff } from "lucide-react";
import type { Rarity } from "@/lib/types";

export function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

const RARITY_STYLE: Record<Rarity, { text: string; border: string; bg: string; pips: number }> = {
  Common: { text: "text-r-common", border: "border-r-common/50", bg: "bg-r-common", pips: 1 },
  Uncommon: { text: "text-r-uncommon", border: "border-r-uncommon/50", bg: "bg-r-uncommon", pips: 2 },
  Rare: { text: "text-r-rare", border: "border-r-rare/50", bg: "bg-r-rare", pips: 3 },
  Epic: { text: "text-r-epic", border: "border-r-epic/50", bg: "bg-r-epic", pips: 4 },
  Legendary: { text: "text-r-legendary", border: "border-r-legendary/50", bg: "bg-r-legendary", pips: 5 },
};
export const rarityStyle = (r: Rarity) => RARITY_STYLE[r] ?? RARITY_STYLE.Common;

/** Rarity label + pip count, so rarity is never conveyed by colour alone. */
export function RarityBadge({ rarity, compact }: { rarity: Rarity; compact?: boolean }) {
  const s = rarityStyle(rarity);
  return (
    <span className={cx("inline-flex items-center gap-1.5 font-mono text-[0.68rem] uppercase tracking-wider", s.text)}>
      <span className="flex gap-0.5" aria-hidden="true">
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} className={cx("h-2 w-1 rounded-[1px]", i < s.pips ? s.bg : "bg-line-2")} />
        ))}
      </span>
      {compact ? <span className="sr-only">{rarity}</span> : rarity}
    </span>
  );
}

/** Coin amount with an accessible label (the in-game coin glyph is approximated with ⦶). */
export function Coins({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cx("num inline-flex items-center gap-1", className)}>
      <span aria-hidden="true" className="text-accent/80">⦶</span>
      {value.toLocaleString("en-US")}
      <span className="sr-only"> coins</span>
    </span>
  );
}

export function ItemImage({ src, alt, size = 64, rarity, className, priority }: { src?: string; alt: string; size?: number; rarity?: Rarity; className?: string; priority?: boolean }) {
  const s = rarity ? rarityStyle(rarity) : undefined;
  return (
    <div
      className={cx(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded border bg-gradient-to-b from-panel-2 to-bg",
        s?.border ?? "border-line",
        className,
      )}
      style={{ width: size, height: size }}
    >
      {src ? (
        <Image src={src} alt={alt} width={size} height={size} priority={priority} className="h-full w-full object-contain p-1" sizes={`${size}px`} />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-muted" title="No image available">
          <ImageOff className="h-1/3 w-1/3" aria-hidden="true" />
          {alt && <span className="sr-only">{alt} (no image available)</span>}
        </span>
      )}
      {rarity && <span className={cx("absolute inset-x-0 bottom-0 h-0.5", s?.bg)} aria-hidden="true" />}
    </div>
  );
}
