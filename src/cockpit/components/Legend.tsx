interface Item { label: string; color: string; }

export function Legend({ items, className = "" }: { items: Item[]; className?: string }) {
  return (
    <div className={`flex items-center flex-wrap gap-x-3 gap-y-1 text-[11px] ${className}`}>
      {items.map(i => (
        <span key={i.label} className="flex items-center gap-1.5 nx-muted">
          <span className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ background: i.color }} />
          {i.label}
        </span>
      ))}
    </div>
  );
}
