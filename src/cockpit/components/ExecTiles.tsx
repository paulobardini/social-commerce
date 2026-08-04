// Tiles executivos reutilizáveis (Carteira / Atendimento / Produto):
// número grande, rótulo pequeno e detalhes escondidos num ícone "i".
import type { ReactNode } from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { fmtPct, deltaArrow, deltaColor } from "../styles/tokens";

export type ExecTone = "neutral" | "risk" | "good";

const toneClass = (tone: ExecTone) =>
  tone === "risk"
    ? "bg-rose-50/70 border-rose-100"
    : tone === "good"
      ? "bg-emerald-50/70 border-emerald-100"
      : "bg-[#F6F7F9] border-[#E7E9EE]";

export function ExecTile({
  label, value, sub, tone = "neutral",
}: { label: string; value: string; sub?: ReactNode; tone?: ExecTone }) {
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("rounded-lg px-3 py-3 border cursor-help h-full flex flex-col", toneClass(tone))}>
            <div className="flex items-start justify-between gap-2 mb-2">
              <p className="text-[10px] uppercase tracking-wide nx-muted leading-tight">{label}</p>
              {sub && <Info className="w-3.5 h-3.5 nx-muted shrink-0 mt-0.5 opacity-70 hover:opacity-100 transition-opacity" />}
            </div>
            <p className="text-3xl font-semibold nx-num nx-text leading-none mt-auto">{value}</p>
          </div>
        </TooltipTrigger>
        {sub && (
          <TooltipContent side="bottom" align="start" className="max-w-[240px] bg-white border border-[#E7E9EE] shadow-md">
            <p className="text-xs nx-text leading-snug">{sub}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}

export function ExecHero({
  label, value, delta, detalhe, narrativa,
}: { label: string; value: string; delta?: number; detalhe?: ReactNode; narrativa?: ReactNode }) {
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="rounded-lg px-3 py-3 border bg-[#F6F7F9] border-[#E7E9EE] cursor-help h-full flex flex-col">
            <div className="flex items-start justify-between gap-2 mb-2">
              <p className="text-[10px] uppercase tracking-wide nx-muted leading-tight">{label}</p>
              <Info className="w-3.5 h-3.5 nx-muted shrink-0 mt-0.5 opacity-70 hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex items-end gap-2 mt-auto">
              <p className="text-4xl font-semibold nx-num nx-text leading-none">{value}</p>
              {delta !== undefined && (
                <span className={cn("text-sm font-medium nx-num pb-0.5", deltaColor(delta))}>
                  {deltaArrow(delta)} {fmtPct(Math.abs(delta))}
                </span>
              )}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="start" className="max-w-[260px] bg-white border border-[#E7E9EE] shadow-md">
          {detalhe && <p className="text-xs nx-text leading-snug">{detalhe}</p>}
          {narrativa && <p className="text-xs nx-muted leading-snug mt-1.5">{narrativa}</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function ExecBarRow({
  label, valor, max, valorFmt, delta,
}: { label: string; valor: number; max: number; valorFmt: string; delta?: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] nx-text w-24 truncate">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-[#EEF0F4] overflow-hidden">
        <div className="h-full rounded-full bg-[#2D3A8C]" style={{ width: `${max ? (valor / max) * 100 : 0}%` }} />
      </div>
      <span className="text-[11px] nx-num nx-text w-14 text-right">{valorFmt}</span>
      {delta !== undefined && (
        <span className={cn("text-[10px] nx-num w-12 text-right", deltaColor(delta))}>
          {deltaArrow(delta)} {fmtPct(Math.abs(delta), 0)}
        </span>
      )}
    </div>
  );
}
