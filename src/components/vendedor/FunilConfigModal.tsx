import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { GripVertical, Plus, Trash2, Check, X } from "lucide-react";
import { etapasFunil, type EtapaFunil } from "@/data/mockCRM";

interface FunilConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const defaultColors = ["#94a3b8", "#60a5fa", "#a78bfa", "#f59e0b", "#fb923c", "#f97316", "#22c55e", "#ef4444", "#ec4899", "#14b8a6"];

export function FunilConfigModal({ open, onOpenChange }: FunilConfigModalProps) {
  const [etapas, setEtapas] = useState<EtapaFunil[]>(etapasFunil);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const startEdit = (e: EtapaFunil) => { setEditingId(e.id); setEditName(e.nome); };
  const saveEdit = () => {
    if (editingId && editName.trim()) {
      setEtapas(prev => prev.map(e => e.id === editingId ? { ...e, nome: editName.trim() } : e));
    }
    setEditingId(null);
  };

  const addEtapa = () => {
    const newId = `e${Date.now()}`;
    const newOrdem = Math.max(...etapas.filter(e => e.tipo === "meio").map(e => e.ordem)) + 1;
    const ganhoIdx = etapas.findIndex(e => e.tipo === "ganho");
    const newEtapa: EtapaFunil = {
      id: newId, nome: "Nova etapa", cor: defaultColors[etapas.length % defaultColors.length],
      ordem: newOrdem, tipo: "meio", ativa: true,
    };
    const updated = [...etapas];
    updated.splice(ganhoIdx, 0, newEtapa);
    setEtapas(updated.map((e, i) => ({ ...e, ordem: i + 1 })));
    startEdit(newEtapa);
  };

  const removeEtapa = (id: string) => {
    const etapa = etapas.find(e => e.id === id);
    if (etapa?.tipo === "inicio" || etapa?.tipo === "ganho" || etapa?.tipo === "perda") return;
    setEtapas(prev => prev.filter(e => e.id !== id).map((e, i) => ({ ...e, ordem: i + 1 })));
  };

  const toggleAtiva = (id: string) => {
    const etapa = etapas.find(e => e.id === id);
    if (etapa?.tipo === "inicio" || etapa?.tipo === "ganho" || etapa?.tipo === "perda") return;
    setEtapas(prev => prev.map(e => e.id === id ? { ...e, ativa: !e.ativa } : e));
  };

  const tipoLabel: Record<string, string> = { inicio: "Início", meio: "", ganho: "Ganho", perda: "Perda" };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading">Configurar funil de oportunidades</DialogTitle>
          <p className="text-sm text-muted-foreground">Personalize as etapas do seu pipeline. Arraste para reordenar.</p>
        </DialogHeader>

        <div className="space-y-1.5 mt-4 max-h-[400px] overflow-y-auto">
          {etapas.map(etapa => (
            <div
              key={etapa.id}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-colors ${
                !etapa.ativa ? "opacity-40 bg-muted/30" : "bg-card"
              } ${editingId === etapa.id ? "border-accent ring-1 ring-accent/20" : "border-border"}`}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0 cursor-grab" />
              <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: etapa.cor }} />

              {editingId === etapa.id ? (
                <div className="flex items-center gap-1 flex-1">
                  <Input
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="h-7 text-sm"
                    autoFocus
                    onKeyDown={e => e.key === "Enter" && saveEdit()}
                  />
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={saveEdit}><Check className="h-3 w-3" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingId(null)}><X className="h-3 w-3" /></Button>
                </div>
              ) : (
                <button onClick={() => startEdit(etapa)} className="flex-1 text-left text-sm font-medium text-foreground hover:text-accent transition-colors">
                  {etapa.nome}
                </button>
              )}

              {tipoLabel[etapa.tipo] && (
                <Badge variant="secondary" className="text-[10px] shrink-0">{tipoLabel[etapa.tipo]}</Badge>
              )}

              <Switch
                checked={etapa.ativa}
                onCheckedChange={() => toggleAtiva(etapa.id)}
                disabled={etapa.tipo === "inicio" || etapa.tipo === "ganho" || etapa.tipo === "perda"}
                className="shrink-0"
              />

              {etapa.tipo === "meio" && (
                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive" onClick={() => removeEtapa(etapa.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
        </div>

        <Button variant="outline" className="w-full mt-2" onClick={addEtapa}>
          <Plus className="h-4 w-4 mr-1" /> Adicionar etapa
        </Button>

        {/* Preview */}
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground mb-2 font-medium">Preview do funil</p>
          <div className="flex items-center gap-1 overflow-x-auto">
            {etapas.filter(e => e.ativa).map((e, i, arr) => (
              <div key={e.id} className="flex items-center gap-1">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium" style={{ backgroundColor: `${e.cor}20`, color: e.cor }}>
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: e.cor }} />
                  {e.nome}
                </div>
                {i < arr.length - 1 && <span className="text-muted-foreground/30 text-xs">→</span>}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={() => onOpenChange(false)}>Salvar configuração</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
