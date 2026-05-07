import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScoreBreakdownData } from "@/data/mockInteligencia";

const items: { key: keyof ScoreBreakdownData; label: string; hint: string }[] = [
  { key: "giro", label: "Giro", hint: "Velocidade de saída do produto." },
  { key: "margem", label: "Margem", hint: "Rentabilidade após custos diretos." },
  { key: "sellThrough", label: "Sell-through", hint: "% vendido sobre comprado." },
  { key: "estoque", label: "Estoque", hint: "Saúde da cobertura atual (menor é melhor para parados)." },
  { key: "recorrencia", label: "Recorrência", hint: "Recompra por clientes ativos." },
  { key: "risco", label: "Risco (inv.)", hint: "Inverso do risco de ruptura ou parada." },
];

const colorFor = (v: number) =>
  v >= 80 ? "bg-emerald-500" : v >= 60 ? "bg-amber-500" : "bg-rose-500";

export function ScoreBreakdown({ data, score }: { data: ScoreBreakdownData; score: number }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-baseline justify-between mb-3">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Score de Performance</p>
          <p className="text-3xl font-bold text-primary tabular-nums">{score}<span className="text-base text-muted-foreground">/100</span></p>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="text-[11px] text-primary hover:underline">Como calculamos</button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs text-xs">
              Média ponderada de giro, margem, sell-through, saúde de estoque, recorrência e risco. Pesos calibrados para moda B2B.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="space-y-2">
        {items.map((it) => {
          const v = data[it.key];
          return (
            <TooltipProvider key={it.key}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-foreground w-28 shrink-0">{it.label}</span>
                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                      <div className={`h-full ${colorFor(v)} transition-all`} style={{ width: `${v}%` }} />
                    </div>
                    <span className="text-xs font-semibold tabular-nums w-8 text-right">{v}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="text-xs">{it.hint}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
    </div>
  );
}
