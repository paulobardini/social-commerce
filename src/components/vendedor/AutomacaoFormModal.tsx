import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, ArrowUp, ArrowDown, Phone, MessageCircle, Mail, MapPin, FileText, Sparkles } from "lucide-react";
import {
  type Automacao, type AutomacaoTarefa, type AutomacaoTipoTarefa,
  automacaoTipoLabels,
} from "@/data/mockAutomacoes";
import { etapaMap, type OportunidadeEtapa } from "@/data/mockCRM";

const etapas: OportunidadeEtapa[] = [
  "novo_lead", "contato_iniciado", "em_qualificacao", "proposta_construcao",
  "orcamento_enviado", "em_negociacao", "ganho", "perdido",
];

const tipos: AutomacaoTipoTarefa[] = ["ligacao", "whatsapp", "email", "visita", "proposta", "personalizado"];

export const tipoIcone: Record<AutomacaoTipoTarefa, any> = {
  ligacao: Phone, whatsapp: MessageCircle, email: Mail,
  visita: MapPin, proposta: FileText, personalizado: Sparkles,
};

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  automacao?: Automacao | null;
  onSave: (a: Automacao) => void;
}

export function AutomacaoFormModal({ open, onOpenChange, automacao, onSave }: Props) {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [etapasVinc, setEtapasVinc] = useState<OportunidadeEtapa[]>([]);
  const [isPosVenda, setIsPosVenda] = useState(false);
  const [tarefas, setTarefas] = useState<AutomacaoTarefa[]>([]);

  useEffect(() => {
    if (open) {
      setNome(automacao?.nome ?? "");
      setDescricao(automacao?.descricao ?? "");
      setEtapasVinc(automacao?.etapasVinculadas ?? []);
      setIsPosVenda(automacao?.isPosVenda ?? false);
      setTarefas(automacao?.tarefas ?? [{ id: `at_${Date.now()}`, nome: "", tipo: "whatsapp", intervaloDias: 0 }]);
    }
  }, [open, automacao]);

  const toggleEtapa = (e: OportunidadeEtapa) => {
    setEtapasVinc(prev => prev.includes(e) ? prev.filter(x => x !== e) : [...prev, e]);
  };

  const addTarefa = () => {
    setTarefas(prev => [...prev, { id: `at_${Date.now()}`, nome: "", tipo: "ligacao", intervaloDias: 1 }]);
  };
  const updTarefa = (idx: number, patch: Partial<AutomacaoTarefa>) => {
    setTarefas(prev => prev.map((t, i) => i === idx ? { ...t, ...patch } : t));
  };
  const removeTarefa = (idx: number) => setTarefas(prev => prev.filter((_, i) => i !== idx));
  const moveTarefa = (idx: number, dir: -1 | 1) => {
    setTarefas(prev => {
      const next = [...prev];
      const j = idx + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[idx], next[j]] = [next[j], next[idx]];
      return next;
    });
  };

  const valid = nome.trim().length > 0 && etapasVinc.length > 0 && tarefas.length > 0 && tarefas.every(t => t.nome.trim());

  const handleSave = () => {
    if (!valid) return;
    const a: Automacao = {
      id: automacao?.id ?? `auto_${Date.now()}`,
      nome: nome.trim(),
      descricao: descricao.trim(),
      etapasVinculadas: etapasVinc,
      isPosVenda,
      tarefas: tarefas.map((t, i) => ({ ...t, id: t.id || `at_${Date.now()}_${i}` })),
      createdAt: automacao?.createdAt ?? new Date().toLocaleDateString("pt-BR"),
    };
    onSave(a);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-[95vw] max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="shrink-0 px-6 pt-5 pb-3 border-b border-border">
          <DialogTitle className="text-base font-heading">
            {automacao ? "Editar automação" : "Nova automação de followup"}
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto px-6 py-5 space-y-6 flex-1">
          {/* Identificação */}
          <div className="grid gap-4">
            <div>
              <Label className="text-xs">Nome da automação *</Label>
              <Input value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Followup Proposta Enviada" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Descrição</Label>
              <Textarea value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Descreva quando essa automação deve ser usada..." className="mt-1 min-h-[60px]" />
            </div>
          </div>

          {/* Etapas vinculadas */}
          <div>
            <Label className="text-xs">Etapas do funil vinculadas *</Label>
            <p className="text-[11px] text-muted-foreground mt-0.5 mb-2">
              A automação será sugerida quando o card for movido para uma destas colunas.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {etapas.map(e => {
                const active = etapasVinc.includes(e);
                return (
                  <button
                    key={e}
                    type="button"
                    onClick={() => toggleEtapa(e)}
                    className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                      active
                        ? "bg-accent text-accent-foreground border-accent"
                        : "bg-background text-foreground border-border hover:border-accent/40"
                    }`}
                  >
                    {etapaMap[e]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pós-venda */}
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <p className="text-sm font-medium text-foreground">Etapa de fechamento (pós-venda)</p>
              <p className="text-[11px] text-muted-foreground">
                Marque para que esta automação seja disparada automaticamente quando uma oportunidade for fechada como Ganho.
              </p>
            </div>
            <Switch checked={isPosVenda} onCheckedChange={setIsPosVenda} />
          </div>

          {/* Sequência de tarefas */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs">Sequência de tarefas *</Label>
              <Button type="button" variant="outline" size="sm" onClick={addTarefa}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar
              </Button>
            </div>
            <div className="space-y-2">
              {tarefas.map((t, idx) => {
                const Icon = tipoIcone[t.tipo];
                return (
                  <div key={t.id} className="grid grid-cols-12 gap-2 items-start rounded-lg border border-border p-3 bg-background">
                    <div className="col-span-12 md:col-span-5">
                      <Label className="text-[10px] text-muted-foreground">Tarefa</Label>
                      <Input value={t.nome} onChange={e => updTarefa(idx, { nome: e.target.value })} placeholder="Nome da tarefa" className="h-8 text-sm" />
                    </div>
                    <div className="col-span-6 md:col-span-3">
                      <Label className="text-[10px] text-muted-foreground">Tipo</Label>
                      <Select value={t.tipo} onValueChange={(v: AutomacaoTipoTarefa) => updTarefa(idx, { tipo: v })}>
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {tipos.map(tp => (
                            <SelectItem key={tp} value={tp}>{automacaoTipoLabels[tp]}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-3 md:col-span-2">
                      <Label className="text-[10px] text-muted-foreground">Dias após anterior</Label>
                      <Input
                        type="number"
                        min={0}
                        value={t.intervaloDias}
                        onChange={e => updTarefa(idx, { intervaloDias: Math.max(0, Number(e.target.value) || 0) })}
                        className="h-8 text-sm"
                        disabled={idx === 0}
                      />
                    </div>
                    <div className="col-span-3 md:col-span-2 flex items-end gap-1 h-full">
                      <Button type="button" size="icon" variant="ghost" className="h-8 w-8" onClick={() => moveTarefa(idx, -1)} disabled={idx === 0}>
                        <ArrowUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button type="button" size="icon" variant="ghost" className="h-8 w-8" onClick={() => moveTarefa(idx, 1)} disabled={idx === tarefas.length - 1}>
                        <ArrowDown className="h-3.5 w-3.5" />
                      </Button>
                      <Button type="button" size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => removeTarefa(idx)} disabled={tarefas.length === 1}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <div className="col-span-12 flex items-center gap-2 -mt-1">
                      <Badge variant="secondary" className="text-[10px] gap-1">
                        <Icon className="h-3 w-3" /> {automacaoTipoLabels[t.tipo]}
                      </Badge>
                      <span className="text-[11px] text-muted-foreground">
                        {idx === 0 ? "D+0 (data inicial)" : `D+${tarefas.slice(0, idx + 1).reduce((s, x) => s + x.intervaloDias, 0)} dias após data inicial`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="shrink-0 px-6 py-3 border-t border-border flex justify-end gap-2 bg-background">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={!valid}>
            {automacao ? "Salvar alterações" : "Criar automação"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
