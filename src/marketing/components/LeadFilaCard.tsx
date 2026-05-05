import { ScoreBadge, ScoreBar } from "./ScoreBadge";
import { channelColors, channelLabels, formatBRLCompact } from "../styles/tokens";
import type { LeadAtribuido } from "../data/mockMarketing";
import type { LeadScore } from "../data/leadScoring";
import { MessageCircle, Sparkles, ExternalLink, Clock } from "lucide-react";

export function LeadFilaCard({
  lead,
  score,
  destaque,
  onAbrir,
}: {
  lead: LeadAtribuido;
  score: LeadScore;
  destaque?: boolean;
  onAbrir: () => void;
}) {
  return (
    <button
      onClick={onAbrir}
      className={`w-full text-left bg-card border rounded-xl p-4 transition-all hover:shadow-md hover:border-primary/40 ${
        destaque ? "border-orange-500/40 ring-1 ring-orange-500/20" : "border-border"
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold text-foreground truncate">{lead.clienteNome}</p>
            {destaque && (
              <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-600">novo</span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: channelColors[lead.origem] }} />
            {channelLabels[lead.origem]} · {lead.utm.campaign}
          </p>
        </div>
        <ScoreBadge score={score.score} tendencia={score.tendencia} />
      </div>

      <ScoreBar score={score.score} className="mb-3" />

      <div className="bg-muted/50 rounded-lg p-2.5 mb-3">
        <p className="text-[10px] uppercase font-semibold text-muted-foreground flex items-center gap-1 mb-1">
          <Sparkles className="h-3 w-3" /> Sugestão de abordagem
        </p>
        <p className="text-[12px] text-foreground leading-snug">{score.sugestaoAbordagem}</p>
      </div>

      <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
        {score.ultimoSinal ? (
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" /> {score.ultimoSinal.label} · {score.ultimoSinal.dataRelativa}
          </span>
        ) : <span />}
        <span className="inline-flex items-center gap-2">
          {lead.receita > 0 && <span className="text-emerald-600 font-medium">{formatBRLCompact(lead.receita)} pot.</span>}
          <ExternalLink className="h-3 w-3" />
        </span>
      </div>

      <div className="mt-3 flex gap-2">
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-500/10 px-2 py-1 rounded">
          <MessageCircle className="h-3 w-3" /> WhatsApp
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary bg-primary/10 px-2 py-1 rounded">
          Abrir lead →
        </span>
      </div>
    </button>
  );
}
