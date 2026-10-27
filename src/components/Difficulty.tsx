export function Difficulty({ value }: { value?: number }) {
  if (!value) return <span className="text-muted">—</span>;
  return (
    <span className="inline-flex items-center gap-1" title={`Difficulty ${value} of 5`}>
      <span className="flex gap-0.5" aria-hidden="true">
        {Array.from({ length: 5 }, (_, i) => <span key={i} className={i < value ? "h-2.5 w-2.5 rotate-45 bg-accent" : "h-2.5 w-2.5 rotate-45 border border-line-2"} />)}
      </span>
      <span className="sr-only">Difficulty {value} of 5</span>
    </span>
  );
}
