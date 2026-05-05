interface Slice { label: string; value: number; color: string; }
interface Props { data: Slice[]; size?: number; }

export function DonutChart({ data, size = 160 }: Props) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const radius = size / 2 - 12;
  const circumference = 2 * Math.PI * radius;
  let cumulative = 0;
  return (
    <div className="flex items-center gap-4">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth={14} />
        {data.map((d, i) => {
          const dash = (d.value / total) * circumference;
          const offset = (cumulative / total) * circumference;
          cumulative += d.value;
          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={d.color}
              strokeWidth={14}
              strokeDasharray={`${dash} ${circumference}`}
              strokeDashoffset={-offset}
              className="transition-all duration-500"
            />
          );
        })}
      </svg>
      <div className="flex-1 space-y-1.5">
        {data.map((d) => (
          <div key={d.label} className="flex items-center gap-2 text-[12px]">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: d.color }} />
            <span className="flex-1 text-foreground truncate">{d.label}</span>
            <span className="text-muted-foreground tabular-nums">
              {((d.value / total) * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
