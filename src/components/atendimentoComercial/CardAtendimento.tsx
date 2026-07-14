import { useState } from "react";
import { CardAC, tagLabels, tagDot, tagBadge, origemLabels, tempoAgo } from "@/data/mockAtendimentoComercial";
import { useAtendimentoComercial } from "@/contexts/AtendimentoComercialContext";
import { AlertTriangle, Clock, MessageCircle, ShieldAlert, DollarSign } from "lucide-react";

export function CardAtendimento({
  card, onClick, draggable = true, onDragStart,
}: {
  card: CardAC;
  onClick: () => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
}) {
  const { slaEstourado, diasParado, estagnado, config } = useAtendimentoComercial();
  const sla = slaEstourado(card);
  const dp = diasParado(card);
  const est = estagnado(card);

  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onClick={onClick}
      className={`bg-card border border-border rounded-lg p-2.5 cursor-pointer hover:border-primary/40 hover:shadow-sm transition-all ${card.status === "conflito" ? "border-amber-400" : ""}`}
    >
      <div className="flex items-start gap-2 mb-1.5">
        <div className={`h-7 w-7 rounded-full ${tagDot[card.tag]} shrink-0 flex items-center justify-center text-white text-[10px] font-bold`}>
          {card.avatarIniciais}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-semibold text-foreground truncate">{card.nome}</p>
          <p className="text-[10px] text-muted-foreground truncate">{card.vendedorNome}</p>
        </div>
        {card.naoLidas > 0 && (
          <span className="h-4 min-w-4 px-1 rounded-full bg-emerald-500 text-white text-[9px] font-bold flex items-center justify-center">{card.naoLidas}</span>
        )}
      </div>

      <div className="flex flex-wrap gap-1 mb-1.5">
        <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border ${tagBadge[card.tag]}`}>{tagLabels[card.tag]}</span>
        <span className="text-[9px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">{origemLabels[card.origem]}</span>
        {card.status === "conflito" && (
          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200 inline-flex items-center gap-0.5"><ShieldAlert className="h-2.5 w-2.5" />Em conflito</span>
        )}
      </div>

      {card.ultimaMensagem && (
        <p className="text-[10px] text-muted-foreground line-clamp-2 mb-1.5">
          <MessageCircle className="inline h-2.5 w-2.5 mr-0.5" />
          {card.ultimaMensagem}
        </p>
      )}

      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span className="inline-flex items-center gap-0.5">
          <Clock className="h-2.5 w-2.5" /> {tempoAgo(card.ultimaInteracao)}
        </span>
        {card.valorEstimado && (
          <span className="inline-flex items-center gap-0.5 text-emerald-700 font-semibold">
            <DollarSign className="h-2.5 w-2.5" />
            {(card.valorEstimado / 1000).toFixed(0)}k
          </span>
        )}
      </div>

      {(sla || est) && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {sla && (
            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 border border-rose-200 inline-flex items-center gap-0.5">
              <AlertTriangle className="h-2.5 w-2.5" /> SLA estourado · {config.slaHoras}h
            </span>
          )}
          {est && (
            <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border inline-flex items-center gap-0.5 ${dp >= 4 ? "bg-rose-100 text-rose-700 border-rose-200" : "bg-amber-100 text-amber-700 border-amber-200"}`}>
              <AlertTriangle className="h-2.5 w-2.5" /> {dp}d parado
            </span>
          )}
        </div>
      )}
    </div>
  );
}
