import { TicketCard } from "./TicketCard";
import {
  type Ticket, type FunilSetor, type Setor, setorLabels, setorDot,
} from "@/data/mockAtendimento";

interface AtendimentoKanbanProps {
  tickets: Ticket[];
  funis: FunilSetor[];
  setoresVisiveis: Setor[];
  onTicketClick: (ticket: Ticket) => void;
}

export function AtendimentoKanban({ tickets, funis, setoresVisiveis, onTicketClick }: AtendimentoKanbanProps) {
  const setores = setoresVisiveis;
  const showSetor = setores.length > 1;

  return (
    <div className="space-y-5">
      {setores.map(setor => {
        const funil = funis.find(f => f.setor === setor);
        if (!funil) return null;
        const setorTickets = tickets.filter(t => t.setor === setor);
        const colunas = [...funil.colunas].sort((a, b) => a.ordem - b.ordem);

        return (
          <div key={setor} className="space-y-2">
            {showSetor && (
              <div className="flex items-center gap-2 px-1">
                <span className={`h-2.5 w-2.5 rounded-full ${setorDot[setor]}`} />
                <h3 className="text-sm font-heading font-semibold text-foreground">{setorLabels[setor]}</h3>
                <span className="text-[11px] text-muted-foreground">{setorTickets.length} tickets</span>
              </div>
            )}
            <div className="flex gap-3 overflow-x-auto pb-2">
              {colunas.map(col => {
                const colTickets = setorTickets.filter(t => t.statusColunaId === col.id);
                return (
                  <div
                    key={col.id}
                    className="w-[280px] shrink-0 bg-secondary/70 rounded-xl p-2.5 flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between px-1 pb-1 border-b border-border/60">
                      <div className="flex items-center gap-1.5">
                        <span className={`h-2 w-2 rounded-full ${col.cor}`} />
                        <span className="text-xs font-semibold text-foreground">{col.label}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground bg-background px-1.5 py-0.5 rounded-full">
                        {colTickets.length}
                      </span>
                    </div>
                    <div className="flex flex-col gap-2 min-h-[60px]">
                      {colTickets.map(t => (
                        <TicketCard key={t.id} ticket={t} onClick={() => onTicketClick(t)} showSetor={false} />
                      ))}
                      {colTickets.length === 0 && (
                        <p className="text-[10px] text-muted-foreground text-center py-4">Vazio</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
