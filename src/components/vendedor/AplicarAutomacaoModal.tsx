import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Zap, Calendar as CalIcon, CheckCircle2 } from "lucide-react";
import { type Automacao, automacaoTipoLabels } from "@/data/mockAutomacoes";
import { tipoIcone } from "./AutomacaoFormModal";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  automacoes: Automacao[];      // 1+ automações disponíveis
  onConfirm: (automacaoId: string, dataInicialISO: string) => void;
}

export function AplicarAutomacaoModal({ open, onOpenChange, automacoes, onConfirm }: Props) {
  const [step, setStep] = useState<"escolha" | "previa">("escolha");
  const [selectedId, setSelectedId] = useState<string>("");
  const today = new Date().toISOString().slice(0, 10);
  const [dataInicial, setDataInicial] = useState(today);

  useEffect(() => {
    if (open) {
      setDataInicial(today);
      if (automacoes.length === 1) {
        setSelectedId(automacoes[0].id);
        setStep("previa");
      } else {
        setSelectedId(automacoes[0]?.id ?? "");
        setStep("escolha");
      }
    }
  }, [open, automacoes]);

  const selected = automacoes.find(a => a.id === selectedId);

  const previa = useMemo(() => {
    if (!selected) return [];
    const base = new Date(dataInicial + "T00:00:00");
    let cum = 0;
    return selected.tarefas.map(t => {
      cum += t.intervaloDias;
      const d = new Date(base);
      d.setDate(d.getDate() + cum);
      return { ...t, dataCalc: d };
    });
  }, [selected, dataInicial]);

  const handleConfirm = () => {
    if (!selectedId) return;
    onConfirm(selectedId, dataInicial);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="shrink-0 px-6 pt-5 pb-3 border-b border-border">
          <DialogTitle className="text-base font-heading flex items-center gap-2">
            <Zap className="h-4 w-4 text-accent" />
            {step === "escolha" ? "Escolher automação a aplicar" : "Confirmar criação das tarefas"}
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto px-6 py-5 flex-1">
          {step === "escolha" && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground mb-3">
                Esta etapa possui {automacoes.length} automações disponíveis. Selecione uma para aplicar.
              </p>
              {automacoes.map(a => {
                const active = selectedId === a.id;
                return (
                  <button
                    type="button"
                    key={a.id}
                    onClick={() => setSelectedId(a.id)}
                    className={`w-full text-left rounded-lg border p-3 transition-colors ${
                      active ? "border-accent bg-accent/5" : "border-border hover:border-accent/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground">{a.nome}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{a.descricao}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary" className="text-[10px]">{a.tarefas.length} tarefas</Badge>
                          <span className="text-[11px] text-muted-foreground">
                            Duração: {a.tarefas.reduce((s, t) => s + t.intervaloDias, 0)} dias
                          </span>
                        </div>
                      </div>
                      {active && <CheckCircle2 className="h-4 w-4 text-accent shrink-0 mt-1" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {step === "previa" && selected && (
            <div className="space-y-4">
              <div className="rounded-lg bg-secondary/60 border border-border p-3">
                <p className="text-sm font-semibold text-foreground">{selected.nome}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{selected.descricao}</p>
              </div>

              <div>
                <Label className="text-xs flex items-center gap-1.5">
                  <CalIcon className="h-3.5 w-3.5" /> Data da primeira tarefa
                </Label>
                <Input
                  type="date"
                  value={dataInicial}
                  onChange={e => setDataInicial(e.target.value)}
                  className="mt-1 max-w-[220px]"
                />
              </div>

              <div>
                <Label className="text-xs">Prévia das tarefas que serão criadas</Label>
                <div className="mt-1.5 rounded-lg border border-border overflow-hidden">
                  {previa.map((t, i) => {
                    const Icon = tipoIcone[t.tipo];
                    return (
                      <div key={t.id} className={`flex items-center gap-3 px-3 py-2.5 ${i > 0 ? "border-t border-border" : ""}`}>
                        <div className="h-7 w-7 rounded-md bg-accent/10 flex items-center justify-center shrink-0">
                          <Icon className="h-3.5 w-3.5 text-accent" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground truncate">{t.nome}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {automacaoTipoLabels[t.tipo]} · D+{previa.slice(0, i + 1).reduce((s, x) => s + x.intervaloDias, 0)}
                          </p>
                        </div>
                        <span className="text-xs font-medium text-foreground shrink-0">
                          {t.dataCalc.toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="shrink-0 px-6 py-3 border-t border-border flex justify-between gap-2 bg-background">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <div className="flex gap-2">
            {step === "previa" && automacoes.length > 1 && (
              <Button variant="outline" onClick={() => setStep("escolha")}>
                <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
              </Button>
            )}
            {step === "escolha" && (
              <Button onClick={() => setStep("previa")} disabled={!selectedId}>
                Continuar <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            )}
            {step === "previa" && (
              <Button onClick={handleConfirm}>Confirmar e criar tarefas</Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
