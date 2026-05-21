import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, ArrowUp, ArrowDown, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  type FunilSetor, type Setor, setorLabels, loadFunis, saveFunis, defaultFunis,
} from "@/data/mockAtendimento";

const corPalette = [
  "bg-slate-400", "bg-blue-500", "bg-yellow-500", "bg-green-500", "bg-red-500",
  "bg-orange-500", "bg-purple-500", "bg-emerald-500", "bg-pink-500", "bg-slate-600",
];

interface FunisConfigModalProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSaved?: () => void;
}

export function FunisConfigModal({ open, onOpenChange, onSaved }: FunisConfigModalProps) {
  const { toast } = useToast();
  const [funis, setFunis] = useState<FunilSetor[]>([]);
  const [activeSetor, setActiveSetor] = useState<Setor>("sac");

  useEffect(() => {
    if (open) setFunis(loadFunis());
  }, [open]);

  const updateColuna = (setor: Setor, idx: number, patch: Partial<{ label: string; cor: string }>) => {
    setFunis(prev => prev.map(f => f.setor !== setor ? f : {
      ...f,
      colunas: f.colunas.map((c, i) => i === idx ? { ...c, ...patch } : c),
    }));
  };

  const moveColuna = (setor: Setor, idx: number, dir: -1 | 1) => {
    setFunis(prev => prev.map(f => {
      if (f.setor !== setor) return f;
      const arr = [...f.colunas];
      const target = idx + dir;
      if (target < 0 || target >= arr.length) return f;
      [arr[idx], arr[target]] = [arr[target], arr[idx]];
      return { ...f, colunas: arr.map((c, i) => ({ ...c, ordem: i + 1 })) };
    }));
  };

  const removeColuna = (setor: Setor, idx: number) => {
    setFunis(prev => prev.map(f => f.setor !== setor ? f : {
      ...f,
      colunas: f.colunas.filter((_, i) => i !== idx).map((c, i) => ({ ...c, ordem: i + 1 })),
    }));
  };

  const addColuna = (setor: Setor) => {
    setFunis(prev => prev.map(f => f.setor !== setor ? f : {
      ...f,
      colunas: [...f.colunas, {
        id: `${setor}-${Date.now()}`,
        label: "Nova coluna",
        cor: "bg-slate-400",
        ordem: f.colunas.length + 1,
      }],
    }));
  };

  const handleSave = () => {
    saveFunis(funis);
    toast({ title: "Funis atualizados", description: "Configuração salva localmente." });
    onSaved?.();
    onOpenChange(false);
  };

  const handleReset = () => {
    setFunis(defaultFunis);
    toast({ title: "Funis restaurados ao padrão." });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0">
        <div className="shrink-0 px-5 py-3 border-b border-border flex items-center justify-between">
          <div>
            <DialogTitle className="text-base font-heading">Configurar funis por setor</DialogTitle>
            <DialogDescription className="text-xs">
              Edite as colunas do kanban de cada setor.
            </DialogDescription>
          </div>
          <button onClick={() => onOpenChange(false)} className="h-7 w-7 rounded-md hover:bg-muted flex items-center justify-center">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <Tabs value={activeSetor} onValueChange={(v) => setActiveSetor(v as Setor)}>
            <TabsList className="mb-3">
              {(["sac", "cobranca", "financeiro", "logistica"] as Setor[]).map(s => (
                <TabsTrigger key={s} value={s}>{setorLabels[s]}</TabsTrigger>
              ))}
            </TabsList>
            {funis.map(f => (
              <TabsContent key={f.setor} value={f.setor} className="space-y-2 mt-0">
                {f.colunas.map((c, i) => (
                  <div key={c.id} className="flex items-center gap-2 bg-card border border-border rounded-lg p-2">
                    <div className={`h-4 w-4 rounded-full shrink-0 ${c.cor}`} />
                    <Input
                      value={c.label}
                      onChange={e => updateColuna(f.setor, i, { label: e.target.value })}
                      className="h-8 text-xs"
                    />
                    <select
                      value={c.cor}
                      onChange={e => updateColuna(f.setor, i, { cor: e.target.value })}
                      className="h-8 text-xs border border-border rounded-md px-2 bg-background"
                    >
                      {corPalette.map(cor => (
                        <option key={cor} value={cor}>{cor.replace("bg-", "")}</option>
                      ))}
                    </select>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveColuna(f.setor, i, -1)} disabled={i === 0}>
                      <ArrowUp className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveColuna(f.setor, i, 1)} disabled={i === f.colunas.length - 1}>
                      <ArrowDown className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeColuna(f.setor, i)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full" onClick={() => addColuna(f.setor)}>
                  <Plus className="h-3 w-3 mr-1" /> Adicionar coluna
                </Button>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        <div className="shrink-0 px-5 py-3 border-t border-border flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={handleReset}>Restaurar padrão</Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button size="sm" onClick={handleSave}>Salvar funis</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
