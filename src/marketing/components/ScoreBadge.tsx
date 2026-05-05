import { Badge } from "@/components/ui/badge";
import { scoreCores, classificar } from "../data/leadScoring";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export function ScoreBadge({ score, tendencia, size = "sm" }: { score: number; tendencia?: "subindo" | "estavel" | "caindo"; size?: "xs" | "sm" | "md" }) {
  const cls = classificar(score);
  const c = scoreCores[cls];
  const sz = size === "xs" ? "text-[10px] px-1.5 py-0" : size === "md" ? "text-[13px] px-2.5 py-1" : "text-[11px] px-2 py-0.5";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-semibold tabular-nums ${c.bg} ${c.text} ${sz}`}>
      <span>{c.emoji}</span>
      <span>{score}</span>
      {tendencia === "subindo" && <TrendingUp className="h-3 w-3" />}
      {tendencia === "caindo" && <TrendingDown className="h-3 w-3" />}
      {tendencia === "estavel" && <Minus className="h-3 w-3 opacity-50" />}
    </span>
  );
}

export function ScoreBar({ score, className = "" }: { score: number; className?: string }) {
  const c = scoreCores[classificar(score)];
  return (
    <div className={`relative h-1.5 w-full bg-muted rounded-full overflow-hidden ${className}`}>
      <div className="absolute inset-y-0 left-0 transition-all" style={{ width: `${score}%`, background: c.solid }} />
    </div>
  );
}
