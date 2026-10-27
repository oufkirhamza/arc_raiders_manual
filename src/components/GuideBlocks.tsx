import Link from "next/link";
import type { Block } from "@/content/guides";
import { Callout, ChipList } from "./ui";

export function GuideBlocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="prose-arc space-y-4">
      {blocks.map((b, i) => {
        switch (b.type) {
          case "p":
            return <p key={i}>{b.text}</p>;
          case "list": {
            const Tag = b.ordered ? "ol" : "ul";
            return (
              <Tag key={i} className={b.ordered ? "list-decimal space-y-1.5 pl-6 text-ink-2 marker:text-accent" : "list-disc space-y-1.5 pl-6 text-ink-2 marker:text-accent"}>
                {b.items.map((t, j) => <li key={j} className="pl-1 leading-relaxed">{t}</li>)}
              </Tag>
            );
          }
          case "callout":
            return <Callout key={i} tone={b.tone} title={b.title}>{b.text}</Callout>;
          case "table":
            return (
              <div key={i} className="panel overflow-x-auto">
                <table className="table-arc">
                  {b.caption && <caption className="caption-bottom px-3 py-2 text-left text-xs text-muted">{b.caption}</caption>}
                  <thead><tr>{b.head.map((h) => <th key={h} scope="col">{h}</th>)}</tr></thead>
                  <tbody>{b.rows.map((r, j) => <tr key={j}>{r.map((c, k) => <td key={k} className={k === 0 ? "text-ink" : undefined}>{c}</td>)}</tr>)}</tbody>
                </table>
              </div>
            );
          case "items":
            return (
              <div key={i}>
                <ChipList list={b.ids.map((id) => ({ id }))} />
                {b.caption && <p className="mt-2 text-sm text-muted">{b.caption}</p>}
              </div>
            );
          case "links":
            return (
              <ul key={i} className="flex flex-wrap gap-2">
                {b.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="inline-flex flex-col rounded border border-line bg-bg-2 px-3 py-2 text-sm hover:border-accent/60">
                      <span className="text-accent">{l.label} →</span>
                      {l.note && <span className="text-xs text-muted">{l.note}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            );
        }
      })}
    </div>
  );
}
