import { MessageCircle, HelpCircle, ShoppingCart, RefreshCcw, AlertTriangle, DollarSign, FileText } from "lucide-react";
import {
  type Ticket, type FunilSetor, type TicketTipo, tipoLabels, tipoColors,
  setorLabels, setorColors, mockAtendentes,
} from "@/data/mockAtendimento";

const tipoIcons: Record<TicketTipo, any> = {
  financeiro: DollarSign,
  pedido: ShoppingCart,
  troca: RefreshCcw,
  reclamacao: AlertTriangle,
  duvida: HelpCircle,
  cobranca: DollarSign,
  outro: FileText,
};

interface AtendimentoTimelineProps {
  tickets: Ticket[];
  funis: FunilSetor[];
  onTicketClick: (ticket: Ticket) => void;
  compact?: boolean;
}

function parseDataAbertura(s: string): number {
  // formato "dd/mm/yyyy hh:mm" -> timestamp
  const [d, t = "00:00"] = s.split(" ");
  const [dd, mm, yy] = d.split("/").map(Number);
  const [hh, mi] = t.split(":").map(Number);
  return new Date(yy, mm - 1, dd, hh, mi).getTime();
}

export function AtendimentoTimeline({ tickets, funis, onTicketClick, compact }: AtendimentoTimelineProps) {
  const sorted = [...tickets].sort((a, b) => parseDataAbertura(b.dataAbertura) - parseDataAbertura(a.dataAbertura));

  return (
    <div className="relative pl-6">
      <div className="absolute left-2 top-2 bottom-2 w-px bg-border" />
      <div className="space-y-3">
        {sorted.map(t => {
          const responsavel = mockAtendentes.find(a => a.id === t.responsavelId);
          const status = funis.find(f => f.setor === t.setor)?.colunas.find(c => c.id === t.statusColunaId);
          const Icon = tipoIcons[t.tipo];
          const ultimaMsg = t.mensagensWhatsApp[t.mensagensWhatsApp.length - 1];

          return (
            <button
              key={t.id}
              onClick={() => onTicketClick(t)}
              className="relative w-full text-left bg-card border border-border rounded-xl p-3 shadow-sm hover:shadow-md hover:border-primary/30 transition-all"
            >
              <span className={`absolute -left-[18px] top-3 h-5 w-5 rounded-full flex items-center justify-center bg-background border-2 ${setorColors[t.setor].replace("bg-", "border-").split(" ")[0]}`}>
                <Icon className="h-2.5 w-2.5" />
              </span>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold">{t.empresa}</span>
                    {!compact && (
                      <span className="text-[10px] text-muted-foreground">· {t.clienteNome}</span>
                    )}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${setorColors[t.setor]}`}>
                      {setorLabels[t.setor]}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${tipoColors[t.tipo]}`}>
                      {tipoLabels[t.tipo]}
                    </span>
                    {status && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                        {status.label}
                      </span>
                    )}
                  </div>
                  {ultimaMsg && (
                    <p className="mt-1 text-[11px] text-muted-foreground truncate flex items-center gap-1">
                      <MessageCircle className="h-3 w-3 text-green-600 shrink-0" />
                      <span className="font-medium">{ultimaMsg.remetente === "cliente" ? "Cliente" : "Atendente"}:</span>
                      {ultimaMsg.texto}
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] text-muted-foreground">{t.dataAbertura}</p>
                  {responsavel && (
                    <div className="flex items-center gap-1 justify-end mt-1">
                      <div className={`h-4 w-4 rounded-full ${responsavel.cor} flex items-center justify-center`}>
                        <span className="text-[8px] font-bold text-white">{responsavel.iniciais}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{responsavel.iniciais}</span>
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
        {sorted.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-12">Nenhum ticket nesta timeline.</p>
        )}
      </div>
    </div>
  );
}
