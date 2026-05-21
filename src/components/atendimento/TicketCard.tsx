import { MessageCircle, Link2, Clock, ArrowRight } from "lucide-react";
import {
  type Ticket, tipoLabels, tipoColors, prioridadeLabels, prioridadeColors,
  setorLabels, setorColors, mockAtendentes,
} from "@/data/mockAtendimento";

interface TicketCardProps {
  ticket: Ticket;
  onClick: () => void;
  showSetor?: boolean;
}

export function TicketCard({ ticket, onClick, showSetor }: TicketCardProps) {
  const responsavel = mockAtendentes.find(a => a.id === ticket.responsavelId);

  return (
    <div
      onClick={onClick}
      className="group bg-card border border-border rounded-xl p-3 shadow-sm hover:shadow-md hover:border-primary/30 cursor-pointer transition-all space-y-2"
    >
      {/* Header: cliente + ícone WA */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{ticket.empresa}</p>
          <p className="text-[11px] text-muted-foreground truncate">{ticket.clienteNome}</p>
        </div>
        {ticket.origem === "whatsapp" && (
          <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center shrink-0" title="Aberto via WhatsApp">
            <MessageCircle className="h-3 w-3 text-green-600" />
          </div>
        )}
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1">
        {showSetor && (
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${setorColors[ticket.setor]}`}>
            {setorLabels[ticket.setor]}
          </span>
        )}
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${tipoColors[ticket.tipo]}`}>
          {tipoLabels[ticket.tipo]}
        </span>
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${prioridadeColors[ticket.prioridade]}`}>
          {prioridadeLabels[ticket.prioridade]}
        </span>
        <span
          className={`text-[10px] px-1.5 py-0.5 rounded-full border ${
            ticket.origem === "whatsapp"
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-slate-100 text-slate-600 border-slate-200"
          }`}
        >
          {ticket.origem === "whatsapp" ? "Via WhatsApp" : "Manual"}
        </span>
      </div>

      {/* Próxima ação */}
      <div className="flex items-start gap-1 text-[11px] text-muted-foreground">
        <ArrowRight className="h-3 w-3 mt-0.5 shrink-0 text-accent" />
        <span className="line-clamp-2">{ticket.proximaAcao}</span>
      </div>

      {/* Footer: responsável + data + link op */}
      <div className="flex items-center justify-between pt-2 border-t border-border/60">
        <div className="flex items-center gap-1.5 min-w-0">
          {responsavel && (
            <div className={`h-5 w-5 rounded-full ${responsavel.cor} flex items-center justify-center shrink-0`}>
              <span className="text-[9px] font-bold text-white">{responsavel.iniciais}</span>
            </div>
          )}
          <span className="text-[10px] text-muted-foreground truncate">{responsavel?.nome}</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground shrink-0">
          <Clock className="h-3 w-3" />
          {ticket.dataAbertura.split(" ")[0]}
        </div>
      </div>

      {ticket.oportunidadeId && (
        <a
          href={`/vendedor/oportunidades/${ticket.oportunidadeId}`}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1 text-[10px] text-accent hover:underline"
        >
          <Link2 className="h-3 w-3" /> Ver oportunidade
        </a>
      )}
    </div>
  );
}
