import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ShieldCheck } from "lucide-react";
import { Confianca } from "@/data/mockInteligencia";

const map: Record<Confianca, { dot: string; text: string; bg: string; explain: string }> = {
  Alta: { dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-500/10", explain: "Base ampla, padrão consistente em múltiplos períodos." },
  Média: { dot: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-500/10", explain: "Base relevante, mas com variabilidade no período analisado." },
  Baixa: { dot: "bg-slate-400", text: "text-slate-600", bg: "bg-slate-500/10", explain: "Base limitada ou histórico curto, recomendação direcional." },
};

export function ConfidenceBadge({ confianca }: { confianca: Confianca }) {
  const c = map[confianca];
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium ${c.bg} ${c.text}`}>
            <ShieldCheck className="h-3 w-3" />
            Confiança {confianca}
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs text-xs">{c.explain}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
