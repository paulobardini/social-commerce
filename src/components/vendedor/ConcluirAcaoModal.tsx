// MOCK: Modal "Concluir Ação" — loop do método (resultado + próximo passo).
// Se a ação é RECORRENTE, não sugere criar follow-up: mostra "próxima ocorrência: DD/MM"
// (a nova ocorrência é gerada automaticamente por toggleConcluida/concluirAcao).
import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { CheckSquare, ArrowRight, RefreshCw } from "lucide-react";
import { tipoAcaoLabels } from "@/data/mockCRM360";
import { useTarefas } from "@/contexts/TarefasContext";
import { addDaysBR, HOJE_ANCHOR_BR } from "@/lib/acoes";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  acaoId: string | null;
}

function proximaOcorrencia(base: string, rec: string, custom?: number): string | null {
  const m = base?.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  switch (rec) {
    case "diaria": d.setDate(d.getDate() + 1); break;
    case "semanal": d.setDate(d.getDate() + 7); break;
    case "mensal": d.setMonth(d.getMonth() + 1); break;
    case "personalizada": d.setDate(d.getDate() + (custom || 1)); break;
    default: return null;
  }
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

export function ConcluirAcaoModal({ open, onOpenChange, acaoId }: Props) {
  const { tarefas, concluirAcao, toggleConcluida } = useTarefas();
  const acao = tarefas.find(t => t.id === acaoId);
  const ehRecorrente = !!(acao?.recorrencia && acao.recorrencia !== "nenhuma");
  const proximaData = useMemo(() => {
    if (!acao || !ehRecorrente) return null;
    return proximaOcorrencia(acao.vencimento, acao.recorrencia!, acao.recorrenciaIntervaloDias);
  }, [acao, ehRecorrente]);

  const [resultado, setResultado] = useState("");
  const [criarProxima, setCriarProxima] = useState(true);
  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState<string>("follow_up");
  const [vencimento, setVencimento] = useState<string>("");
  const [hora, setHora] = useState<string>("");

  useEffect(() => {
    if (!open || !acao) return;
    setResultado("");
    setCriarProxima(!ehRecorrente); // evita duplicar com recorrência automática
    setTitulo(`Follow-up · ${acao.clienteNome ?? ""}`.trim());
    setTipo("follow_up");
    setVencimento(addDaysBR(HOJE_ANCHOR_BR, 3));
    setHora("");
  }, [open, acao, ehRecorrente]);

  if (!acao) return null;

  const handleConcluir = () => {
    if (ehRecorrente) {
      toggleConcluida(acao.id);
      toast.success(proximaData ? `Ação concluída · próxima em ${proximaData}` : "Ação concluída");
    } else {
      concluirAcao(acao.id, {
        resultado: resultado.trim() || undefined,
        proximo: criarProxima && titulo.trim() ? {
          titulo: titulo.trim(),
          tipo: tipo as any,
          vencimento: vencimento || undefined,
          hora: hora || undefined,
        } : undefined,
      });
      toast.success(criarProxima && titulo.trim() ? "Ação concluída · próxima ação criada" : "Ação concluída");
    }
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

          {ehRecorrente ? (
            <div className="rounded-lg border border-accent/40 bg-accent/5 p-3 flex items-start gap-2">
              <RefreshCw className="h-4 w-4 text-accent mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium">Ação recorrente</p>
                <p className="text-[11px] text-muted-foreground">
                  Próxima ocorrência: <strong>{proximaData ?? "—"}</strong> (gerada automaticamente).
                </p>
              </div>
            </div>
          ) : (
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
                          {Object.entries(tipoAcaoLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
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
          )}
        </div>

        <DialogFooter className="shrink-0 p-4 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleConcluir}>Concluir</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
