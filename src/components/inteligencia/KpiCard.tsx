import { ReactNode } from "react";

interface Props {
  label: string;
  value: string;
  hint?: string;
  icon?: ReactNode;
  accent?: "primary" | "success" | "warn" | "danger" | "info";
}

const accentMap = {
  primary: "bg-primary/10 text-primary",
  success: "bg-emerald-500/10 text-emerald-600",
  warn: "bg-amber-500/10 text-amber-600",
  danger: "bg-rose-500/10 text-rose-600",
  info: "bg-sky-500/10 text-sky-600",
};

export function KpiCard({ label, value, hint, icon, accent = "primary" }: Props) {
  return (
    <div className="bg-card border border-border rounded-xl p-3 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium leading-tight">{label}</p>
        {icon && <div className={`h-6 w-6 rounded-lg flex items-center justify-center shrink-0 ${accentMap[accent]}`}>{icon}</div>}
      </div>
      <p className="text-lg md:text-xl font-bold text-foreground tabular-nums leading-tight">{value}</p>
      {hint && <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">{hint}</p>}
    </div>
  );
}
