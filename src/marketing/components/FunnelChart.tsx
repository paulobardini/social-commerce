interface FunnelStep {
  label: string;
  value: number;
  money?: number;
}
interface Props {
  steps: FunnelStep[];
  formatValue?: (v: number) => string;
  formatMoney?: (v: number) => string;
}

export function FunnelChart({ steps, formatValue = (v) => v.toLocaleString("pt-BR"), formatMoney }: Props) {
  const max = Math.max(...steps.map(s => s.value));
  return (
    <div className="space-y-2">
      {steps.map((s, i) => {
        const widthPct = max > 0 ? (s.value / max) * 100 : 0;
        const conv = i > 0 && steps[i - 1].value > 0 ? (s.value / steps[i - 1].value) * 100 : null;
        return (
          <div key={s.label} className="group">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="font-medium text-foreground">{s.label}</span>
              <span className="text-muted-foreground tabular-nums">
                {formatValue(s.value)}
                {formatMoney && s.money !== undefined && (
                  <span className="ml-2 text-foreground/70">· {formatMoney(s.money)}</span>
                )}
                {conv !== null && (
                  <span className="ml-2 text-emerald-600 font-medium">{conv.toFixed(1)}%</span>
                )}
              </span>
            </div>
            <div className="h-7 bg-muted rounded-md overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-accent rounded-md transition-all duration-500"
                style={{ width: `${widthPct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
