import { MessageCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  type Ticket, type FunilSetor, tipoLabels, tipoColors, setorLabels, setorColors,
  prioridadeLabels, prioridadeColors, mockAtendentes,
} from "@/data/mockAtendimento";

interface AtendimentoListaProps {
  tickets: Ticket[];
  funis: FunilSetor[];
  onTicketClick: (ticket: Ticket) => void;
}

export function AtendimentoLista({ tickets, funis, onTicketClick }: AtendimentoListaProps) {
  const colunaLabel = (ticket: Ticket) => {
    const funil = funis.find(f => f.setor === ticket.setor);
    return funil?.colunas.find(c => c.id === ticket.statusColunaId)?.label || "—";
  };

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">Cliente</TableHead>
            <TableHead className="font-semibold">Setor</TableHead>
            <TableHead className="font-semibold">Tipo</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">Prioridade</TableHead>
            <TableHead className="font-semibold">Responsável</TableHead>
            <TableHead className="font-semibold">Abertura</TableHead>
            <TableHead className="font-semibold">Última atividade</TableHead>
            <TableHead className="font-semibold w-8"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.map(t => {
            const responsavel = mockAtendentes.find(a => a.id === t.responsavelId);
            return (
              <TableRow
                key={t.id}
                onClick={() => onTicketClick(t)}
                className="cursor-pointer hover:bg-muted/40 even:bg-muted/20"
              >
                <TableCell>
                  <div>
                    <p className="font-medium text-sm">{t.empresa}</p>
                    <p className="text-[11px] text-muted-foreground">{t.clienteNome}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${setorColors[t.setor]}`}>
                    {setorLabels[t.setor]}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${tipoColors[t.tipo]}`}>
                    {tipoLabels[t.tipo]}
                  </span>
                </TableCell>
                <TableCell className="text-sm">{colunaLabel(t)}</TableCell>
                <TableCell>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${prioridadeColors[t.prioridade]}`}>
                    {prioridadeLabels[t.prioridade]}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    {responsavel && (
                      <div className={`h-5 w-5 rounded-full ${responsavel.cor} flex items-center justify-center`}>
                        <span className="text-[9px] font-bold text-white">{responsavel.iniciais}</span>
                      </div>
                    )}
                    <span className="text-xs">{responsavel?.nome}</span>
                  </div>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{t.dataAbertura}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{t.ultimaAtividade}</TableCell>
                <TableCell>
                  {t.origem === "whatsapp" && <MessageCircle className="h-3.5 w-3.5 text-green-600" />}
                </TableCell>
              </TableRow>
            );
          })}
          {tickets.length === 0 && (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                Nenhum ticket encontrado
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
