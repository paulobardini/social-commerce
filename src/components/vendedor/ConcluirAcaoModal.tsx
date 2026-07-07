// MOCK: Modal "Concluir Ação" — loop do método (resultado + próximo passo).
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { CheckSquare, ArrowRight } from "lucide-react";
import { tipoTarefaLabels } from "@/data/mockCRM360";
import { useTarefas } from "@/contexts/TarefasContext";
import { addDaysBR, HOJE_ANCHOR_BR } from "@/lib/acoes";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  acaoId: string | null;
}

export function ConcluirAcaoModal({ open, onOpenChange, acaoId }: Props) {
  const { tarefas, concluirAcao } = useTarefas();
  const acao = tarefas.find(t => t.id === acaoId);

  const [resultado, setResultado] = useState("");
  const [criarProxima, setCriarProxima] = useState(true);
  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState<string>("follow_up");
  const [vencimento, setVencimento] = useState<string>("");
  const [hora, setHora] = useState<string>("");

  useEffect(() => {
    if (!open || !acao) return;
    setResultado("");
    setCriarProxima(true);
    setTitulo(`Follow-up · ${acao.clienteNome ?? ""}`.trim());
    setTipo("follow_up");
    setVencimento(addDaysBR(HOJE_ANCHOR_BR, 3));
    setHora("");
  }, [open, acao]);

  if (!acao) return null;

  const handleConcluir = () => {
    concluirAcao(acao.id, {
      resultado: resultado.trim() || undefined,
      proximo: criarProxima && titulo.trim() ? {
        titulo: titulo.trim(),
        tipo: tipo as any,
        vencimento: vencimento || undefined,
        hora: hora || undefined,
      } : undefined,
    });
    toast.success(criarProxima && titulo.trim()
      ? "Ação concluída · próxima ação criada"
      : "Ação concluída");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="shrink-0 p-5 pb-3 border-b border-border">
          <DialogTitle className="flex items-center gap-2 font-heading">
            <CheckSquare className="h-4 w-4 text-green-600" /> Concluir ação
          </DialogTitle>
          <p className="text-xs text-muted-foreground mt-1 truncate">
            {acao.titulo} · <span className="text-accent">{acao.clienteNome}</span>
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div>
            <Label className="text-xs">Resultado</Label>
            <Textarea
              value={resultado}
              onChange={e => setResultado(e.target.value)}
              rows={3}
              placeholder="Ex: falei com a Thay, vai decidir até quarta"
              className="mt-1"
            />
          </div>

          <div className="rounded-lg border border-border p-3 bg-muted/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowRight className="h-3.5 w-3.5 text-accent" />
                <Label className="text-xs font-medium">Criar próxima ação</Label>
              </div>
              <Switch checked={criarProxima} onCheckedChange={setCriarProxima} />
            </div>
            {criarProxima && (
              <div className="space-y-3">
                <div>
                  <Label className="text-[10px]">Título</Label>
                  <Input value={titulo} onChange={e => setTitulo(e.target.value)} className="mt-1 h-9" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-[10px]">Tipo</Label>
                    <Select value={tipo} onValueChange={setTipo}>
                      <SelectTrigger className="mt-1 h-9 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(tipoTarefaLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-[10px]">Vencimento</Label>
                    <Input value={vencimento} onChange={e => setVencimento(e.target.value)} placeholder="DD/MM/AAAA" className="mt-1 h-9" />
                  </div>
                  <div>
                    <Label className="text-[10px]">Hora</Label>
                    <Input value={hora} onChange={e => setHora(e.target.value)} placeholder="HH:MM" className="mt-1 h-9" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="shrink-0 p-4 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleConcluir}>Concluir</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
