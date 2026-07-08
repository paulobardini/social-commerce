import { useMemo, useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Plus, X } from "lucide-react";
import { usePlanos } from "@/contexts/PlanosContext";
import { sugerirCompromissos, type Compromisso, type CompromissoTipo, type PlanoRecuperacao } from "@/lib/planos";
import { toast } from "sonner";

const tipoLabel: Record<CompromissoTipo, string> = {
  cobrir_clientes: "Cobrir N clientes",
  resgatar_cliente: "Resgatar cliente",
  enviar_proposta: "Enviar proposta",
  visita: "Visitar",
};

interface Draft {
  tipo: CompromissoTipo;
  descricao: string;
  alvo?: number;
  clienteId?: string;
  clienteNome?: string;
  prazo: string;
}

export function ResponderPlanoModal({ plano, open, onOpenChange }: {
  plano: PlanoRecuperacao | null; open: boolean; onOpenChange: (b: boolean) => void;
}) {
  const { responderPlano } = usePlanos();
  const [diagnostico, setDiagnostico] = useState("");
  const [drafts, setDrafts] = useState<Draft[]>([]);

  const sugestoes = useMemo(() => plano ? sugerirCompromissos(plano) : [], [plano]);

  useEffect(() => {
    if (open && plano) {
      setDiagnostico("");
      setDrafts(sugestoes.map(s => ({
        tipo: s.tipo, descricao: s.descricao, alvo: s.alvo,
        clienteId: s.clienteId, clienteNome: s.clienteNome, prazo: s.prazo,
      })));
    }
  }, [open, plano, sugestoes]);

  const addDraft = () => {
    if (drafts.length >= 3) return;
    const hoje = new Date(); hoje.setDate(hoje.getDate() + 3);
    const prazo = `${String(hoje.getDate()).padStart(2, "0")}/${String(hoje.getMonth() + 1).padStart(2, "0")}/${hoje.getFullYear()}`;
    setDrafts(d => [...d, { tipo: "cobrir_clientes", descricao: "Cobrir 10 clientes", alvo: 10, prazo }]);
  };

  const remove = (i: number) => setDrafts(d => d.filter((_, idx) => idx !== i));
  const update = (i: number, patch: Partial<Draft>) => setDrafts(d => d.map((x, idx) => idx === i ? { ...x, ...patch } : x));

  const salvar = () => {
    if (!plano) return;
    if (!diagnostico.trim()) { toast.error("Escreva o diagnóstico (1 linha)"); return; }
    if (drafts.length === 0) { toast.error("Adicione ao menos 1 compromisso"); return; }
    responderPlano(plano.id, { diagnostico: diagnostico.trim(), compromissos: drafts.map(d => ({
      tipo: d.tipo, descricao: d.descricao, alvo: d.alvo, clienteId: d.clienteId, clienteNome: d.clienteNome, prazo: d.prazo,
    })) });
    toast.success("Plano enviado ao gestor — compromissos viraram ações na sua fila");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-5 pt-5 pb-3 shrink-0 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-500" /> Responder plano solicitado pelo gestor
          </DialogTitle>
          {plano && (
            <DialogDescription>
              {plano.tipo === "cliente_risco"
                ? `${plano.contexto.clienteNome} · valor 12m ${plano.contexto.valor ? `R$ ${(plano.contexto.valor/1000).toFixed(0)}k` : "—"}`
                : `Recuperação de ritmo · pace ${plano.contexto.pace}% · cobertura ${plano.contexto.coberturaDelta ?? 0}pp`}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {plano?.notaGestor && (
            <div className="rounded bg-purple-50 border border-purple-200 p-2 text-[11px] text-purple-900">
              <strong>Gestor:</strong> {plano.notaGestor}
            </div>
          )}

          <div>
            <label className="text-xs font-medium">Diagnóstico (1 linha)</label>
            <Input value={diagnostico} onChange={(e) => setDiagnostico(e.target.value)} placeholder="Ex: perdemos a compradora principal, retomar via nova compradora" className="mt-1 h-9 text-xs" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium">Compromissos ({drafts.length}/3)</label>
              {drafts.length < 3 && (
                <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={addDraft}>
                  <Plus className="h-3 w-3 mr-1" /> Adicionar
                </Button>
              )}
            </div>
            {drafts.map((d, i) => (
              <div key={i} className="border border-border rounded p-2 space-y-2 relative">
                <button className="absolute top-1 right-1 text-muted-foreground hover:text-rose-500" onClick={() => remove(i)}>
                  <X className="h-3 w-3" />
                </button>
                <Select value={d.tipo} onValueChange={(v) => update(i, { tipo: v as CompromissoTipo })}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(tipoLabel).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input value={d.descricao} onChange={(e) => update(i, { descricao: e.target.value })} className="h-8 text-xs" placeholder="Descrição" />
                <div className="flex gap-2">
                  {d.tipo === "cobrir_clientes" && (
                    <Input type="number" value={d.alvo ?? ""} onChange={(e) => update(i, { alvo: Number(e.target.value) })} className="h-8 text-xs w-20" placeholder="N" />
                  )}
                  <Input value={d.prazo} onChange={(e) => update(i, { prazo: e.target.value })} className="h-8 text-xs flex-1" placeholder="DD/MM/AAAA" />
                </div>
              </div>
            ))}
            {drafts.length === 0 && (
              <p className="text-[11px] text-muted-foreground text-center py-3">Adicione 1 a 3 compromissos.</p>
            )}
          </div>
        </div>

        <DialogFooter className="px-5 py-3 border-t shrink-0 bg-background">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={salvar}>Enviar plano ao gestor</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Helper para o painel do rep abrir o modal quando a Ação está vinculada a um plano.
export function usePlanoDaTarefa(planoId?: string) {
  const { planos } = usePlanos();
  return planoId ? planos.find(p => p.id === planoId) ?? null : null;
}
