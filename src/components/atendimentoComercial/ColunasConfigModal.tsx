import { useState, useEffect } from "react";
import { X, Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { useAtendimentoComercial } from "@/contexts/AtendimentoComercialContext";
import { ColunaAC } from "@/data/mockAtendimentoComercial";

const palette = ["bg-slate-400", "bg-blue-500", "bg-indigo-500", "bg-violet-500", "bg-fuchsia-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500", "bg-sky-500"];

export function ColunasConfigModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { colunas, setColunas } = useAtendimentoComercial();
  const [local, setLocal] = useState<ColunaAC[]>([]);
  useEffect(() => { if (open) setLocal([...colunas].sort((a, b) => a.ordem - b.ordem)); }, [open, colunas]);

  const update = (idx: number, patch: Partial<ColunaAC>) => setLocal(prev => prev.map((c, i) => i === idx ? { ...c, ...patch } : c));
  const move = (idx: number, dir: -1 | 1) => setLocal(prev => {
    const arr = [...prev];
    const t = idx + dir;
    if (t < 0 || t >= arr.length) return prev;
    [arr[idx], arr[t]] = [arr[t], arr[idx]];
    return arr.map((c, i) => ({ ...c, ordem: i + 1 }));
  });
  const remove = (idx: number) => setLocal(prev => prev.filter((_, i) => i !== idx).map((c, i) => ({ ...c, ordem: i + 1 })));
  const add = () => setLocal(prev => [...prev, { id: `col-${Date.now()}`, label: "Nova coluna", cor: "bg-slate-400", ordem: prev.length + 1 }]);
  const save = () => { setColunas(local); onClose(); };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-xl border border-border w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="shrink-0 px-4 py-3 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Configurar colunas do Kanban</h3>
            <p className="text-[11px] text-muted-foreground">Renomear ou adicionar etapas. Etapas do sistema podem ser renomeadas mas não removidas.</p>
          </div>
          <button onClick={onClose} className="h-7 w-7 rounded-md hover:bg-muted flex items-center justify-center"><X className="h-4 w-4" /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {local.map((c, i) => (
            <div key={c.id} className="flex items-center gap-2 bg-card border border-border rounded-lg p-2">
              <div className={`h-4 w-4 rounded-full shrink-0 ${c.cor}`} />
              <input value={c.label} onChange={e => update(i, { label: e.target.value })} className="flex-1 h-8 px-2 text-[12px] border border-border rounded" />
              <select value={c.cor} onChange={e => update(i, { cor: e.target.value })} className="h-8 text-[11px] border border-border rounded px-1 bg-background">
                {palette.map(p => <option key={p} value={p}>{p.replace("bg-", "")}</option>)}
              </select>
              <button onClick={() => move(i, -1)} disabled={i === 0} className="h-7 w-7 rounded hover:bg-muted disabled:opacity-30 flex items-center justify-center"><ArrowUp className="h-3 w-3" /></button>
              <button onClick={() => move(i, 1)} disabled={i === local.length - 1} className="h-7 w-7 rounded hover:bg-muted disabled:opacity-30 flex items-center justify-center"><ArrowDown className="h-3 w-3" /></button>
              <button onClick={() => remove(i)} disabled={c.sistema} title={c.sistema ? "Etapa do sistema" : "Remover"} className="h-7 w-7 rounded hover:bg-muted text-destructive disabled:opacity-30 flex items-center justify-center"><Trash2 className="h-3 w-3" /></button>
            </div>
          ))}
          <button onClick={add} className="w-full text-[12px] inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg border border-dashed border-border hover:bg-muted">
            <Plus className="h-3 w-3" /> Adicionar coluna
          </button>
        </div>
        <div className="shrink-0 px-4 py-3 border-t border-border flex items-center justify-end gap-2">
          <button onClick={onClose} className="text-[12px] px-3 py-1.5 rounded-lg hover:bg-muted text-muted-foreground">Cancelar</button>
          <button onClick={save} className="text-[12px] font-medium px-4 py-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90">Salvar</button>
        </div>
      </div>
    </div>
  );
}
