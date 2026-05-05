import { ReactNode } from "react";

interface KpiCardProps {
  label: string;
  value: string;
  delta?: { value: string; positive?: boolean };
  hint?: string;
  icon?: ReactNode;
  accent?: "primary" | "accent" | "success" | "warn" | "danger";
}

const accentClasses: Record<NonNullable<KpiCardProps["accent"]>, string> = {
  primary: "bg-primary/10 text-primary",
  accent: "bg-accent/10 text-accent",
  success: "bg-emerald-500/10 text-emerald-600",
  warn: "bg-amber-500/10 text-amber-600",
  danger: "bg-rose-500/10 text-rose-600",
};

export function KpiCard({ label, value, delta, hint, icon, accent = "primary" }: KpiCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-3 md:p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">{label}</p>
        {icon && (
          <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${accentClasses[accent]}`}>
            {icon}
          </div>
        )}
      </div>
      <p className="text-xl md:text-2xl font-bold text-foreground tabular-nums leading-tight">{value}</p>
      <div className="flex items-center gap-2 mt-1">
        {delta && (
          <span className={`text-[11px] font-medium ${delta.positive ? "text-emerald-600" : "text-rose-600"}`}>
            {delta.positive ? "▲" : "▼"} {delta.value}
          </span>
        )}
        {hint && <span className="text-[11px] text-muted-foreground truncate">{hint}</span>}
      </div>
    </div>
  );
}
