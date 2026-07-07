import { ReactNode } from "react";
import { deltaArrow, deltaColor, fmtPct } from "../styles/tokens";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Props {
  label: string;
  value: ReactNode;
  delta?: { pct: number; invert?: boolean };
  hint?: string;
  icon?: ReactNode;
  size?: "sm" | "md";
  tooltip?: string;
}

export function KpiCard({ label, value, delta, hint, icon, size = "md", tooltip }: Props) {
  return (
    <div className="nx-card p-3">
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1 min-w-0">
          <span className="text-[10px] uppercase tracking-wide nx-muted font-medium leading-tight truncate">{label}</span>
          {tooltip && (
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button" className="shrink-0 text-[#94A3B8] hover:text-[#2D3A8C]" aria-label="Como este número é calculado">
                    <Info className="h-3 w-3" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-[240px] text-[11px] leading-snug">{tooltip}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        {icon && <div className="h-6 w-6 rounded bg-[#E8EAF6] text-[#2D3A8C] flex items-center justify-center shrink-0">{icon}</div>}
      </div>
      <p className={cn("nx-num font-semibold nx-text leading-tight", size === "md" ? "text-xl" : "text-lg")}>
        {value}
      </p>
      <div className="flex items-center justify-between mt-1 min-h-[14px]">
        {delta !== undefined ? (
          <span className={cn("text-[11px] font-medium nx-num", deltaColor(delta.pct, delta.invert))}>
            {deltaArrow(delta.pct)} {fmtPct(Math.abs(delta.pct))}
          </span>
        ) : <span />}
        {hint && <span className="text-[10px] nx-muted truncate ml-1">{hint}</span>}
      </div>
    </div>
  );
}
