import { ArrowRight, LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Props {
  icon: LucideIcon;
  title: string;
  indicator: string;
  message: string;
  cta: string;
  to: string;
  accent: "primary" | "success" | "warn" | "danger";
}

const accentMap = {
  primary: { bg: "bg-primary/10", text: "text-primary", border: "border-primary/20", value: "text-primary" },
  success: { bg: "bg-emerald-500/10", text: "text-emerald-600", border: "border-emerald-500/20", value: "text-emerald-600" },
  warn: { bg: "bg-amber-500/10", text: "text-amber-600", border: "border-amber-500/30", value: "text-amber-700" },
  danger: { bg: "bg-rose-500/10", text: "text-rose-600", border: "border-rose-500/30", value: "text-rose-600" },
};

export function DecisionCard({ icon: Icon, title, indicator, message, cta, to, accent }: Props) {
  const navigate = useNavigate();
  const c = accentMap[accent];
  return (
    <button
      onClick={() => navigate(to)}
      className={`group text-left bg-card border ${c.border} rounded-xl p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col gap-3`}
    >
      <div className="flex items-center justify-between">
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${c.bg}`}>
          <Icon className={`h-5 w-5 ${c.text}`} />
        </div>
        <ArrowRight className={`h-4 w-4 text-muted-foreground group-hover:translate-x-1 group-hover:${c.text} transition-all`} />
      </div>
      <div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{title}</p>
        <p className={`text-3xl font-bold tabular-nums mt-1 ${c.value}`}>{indicator}</p>
      </div>
      <p className="text-sm text-foreground/80 leading-snug">{message}</p>
      <span className={`text-xs font-semibold ${c.text} mt-auto inline-flex items-center gap-1`}>
        {cta} →
      </span>
    </button>
  );
}
