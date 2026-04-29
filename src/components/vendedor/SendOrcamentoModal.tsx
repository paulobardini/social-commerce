import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { FileText, Send } from "lucide-react";
import { mockOrcamentos } from "@/data/mockVendedor";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clienteNome: string;
  onSend: (orcamento: { id: string; nome: string; valorTotal: number | null; status: string }) => void;
}

const statusLabels: Record<string, string> = {
  ativo: "Ativo",
  revisao_lojista: "Em revisão (lojista)",
  revisao_comercial: "Em revisão (comercial)",
  aprovado_parcial: "Aprovado parcial",
  aprovado: "Aprovado",
  recusado: "Recusado",
};

const statusColors: Record<string, string> = {
  ativo: "bg-blue-100 text-blue-700 border-blue-200",
  revisao_lojista: "bg-yellow-100 text-yellow-700 border-yellow-200",
  revisao_comercial: "bg-orange-100 text-orange-700 border-orange-200",
  aprovado_parcial: "bg-emerald-100 text-emerald-700 border-emerald-200",
  aprovado: "bg-green-100 text-green-700 border-green-200",
  recusado: "bg-red-100 text-red-700 border-red-200",
};

export function SendOrcamentoModal({ open, onOpenChange, clienteNome, onSend }: Props) {
  // Filtra orçamentos vinculados ao cliente (lojista bate com nomeFantasia) e ativos/em revisão
  const orcamentos = useMemo(() => {
    return mockOrcamentos.filter(o =>
      o.lojista && o.lojista.toLowerCase() === clienteNome.toLowerCase() &&
      o.status !== "recusado"
    );
  }, [clienteNome]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4" /> Enviar orçamento
          </DialogTitle>
          <DialogDescription>
            Selecione um orçamento ativo de <b>{clienteNome}</b> para enviar pelo chat.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[400px] overflow-y-auto space-y-2 -mx-1 px-1">
          {orcamentos.length === 0 && (
            <div className="text-center py-10 text-sm text-muted-foreground border border-dashed rounded-lg">
              Nenhum orçamento ativo encontrado para este cliente.
            </div>
          )}
          {orcamentos.map(o => (
            <button
              key={o.id}
              onClick={() => {
                onSend({ id: o.id, nome: o.nome, valorTotal: o.valorTotal, status: o.status });
                onOpenChange(false);
              }}
              className="w-full text-left border border-border hover:border-accent rounded-lg p-3 transition-colors group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{o.nome}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {o.dataCriacao} {o.versao > 1 && `· v${o.versao}`}
                  </p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border shrink-0 ${statusColors[o.status]}`}>
                  {statusLabels[o.status]}
                </span>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/60">
                <span className="text-sm font-semibold">
                  {o.valorTotal != null ? `R$ ${o.valorTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "—"}
                </span>
                <span className="text-xs text-accent flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Send className="h-3 w-3" /> Enviar
                </span>
              </div>
            </button>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
