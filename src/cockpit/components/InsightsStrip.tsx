// Faixa horizontal de INSIGHTS acionáveis do gestor.
// 2 a 4 cards por pilar. Estado vazio = "sem pontos críticos".
import { CheckCircle2, AlertTriangle, TrendingUp, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Insight, DrawerKey } from "../lib/insights";

const cores: Record<Insight["severidade"], { border: string; bg: string; text: string; icon: JSX.Element }> = {
  critico: { border: "border-rose-300", bg: "bg-rose-50", text: "text-rose-900", icon: <AlertTriangle className="h-4 w-4 text-rose-600" /> },
  atencao: { border: "border-amber-300", bg: "bg-amber-50", text: "text-amber-900", icon: <AlertTriangle className="h-4 w-4 text-amber-600" /> },
  oportunidade: { border: "border-sky-300", bg: "bg-sky-50", text: "text-sky-900", icon: <TrendingUp className="h-4 w-4 text-sky-600" /> },
};

interface Props {
  pilar: string;
  insights: Insight[];
  onOpenDrawer?: (key: DrawerKey) => void;
}

export function InsightsStrip({ pilar, insights, onOpenDrawer }: Props) {
  const navigate = useNavigate();

  if (insights.length === 0) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
        <span className="text-xs font-medium text-emerald-800">Nenhum ponto crítico em {pilar} ✓</span>
      </div>
    );
  }

  const handleAction = (ins: Insight) => {
    if (ins.acao.drawer && onOpenDrawer) { onOpenDrawer(ins.acao.drawer); return; }
    if (ins.acao.href) { navigate(ins.acao.href); return; }
    if (ins.acao.hash) {
      const el = document.querySelector(ins.acao.hash);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
      {insights.map(ins => {
        const c = cores[ins.severidade];
        return (
          <div key={ins.id} className={`rounded-lg border ${c.border} ${c.bg} p-3 flex flex-col gap-2`}>
            <div className="flex items-start gap-2">
              <div className="shrink-0 mt-0.5">{c.icon}</div>
              <p className={`text-[12px] leading-snug font-medium ${c.text}`}>{ins.texto}</p>
            </div>
            <button
              onClick={() => handleAction(ins)}
              className={`text-[11px] font-semibold ${c.text} hover:underline flex items-center gap-1 self-start`}
            >
              {ins.acao.label} <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
