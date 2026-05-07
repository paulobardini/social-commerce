import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

const STORAGE_KEY = "im:radar:cols:v1";

export const ALL_COLS = [
  "Produto","SKU","Coleção","Categoria","Marca","Fornecedor","Compra média","Venda média","Markup simples","Markup completo",
  "Margem","Comprado","Vendido","Estoque","Sell-through","Dias","Receita","Lucro","Status","Ação"
];

export function getActiveCols(): string[] {
  try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : ALL_COLS; } catch { return ALL_COLS; }
}

export function ColumnsCustomizer({ open, onOpenChange, onChange }: { open: boolean; onOpenChange: (v: boolean) => void; onChange?: () => void }) {
  const [cols, setCols] = useState<string[]>(getActiveCols());
  useEffect(() => { if (open) setCols(getActiveCols()); }, [open]);
  const toggle = (c: string) => setCols((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]));
  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cols));
    toast.success("Colunas atualizadas");
    onChange?.();
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader className="shrink-0"><DialogTitle>Personalizar colunas</DialogTitle></DialogHeader>
        <div className="flex-1 overflow-y-auto py-2 grid grid-cols-2 gap-2">
          {ALL_COLS.map((c) => (
            <label key={c} className="flex items-center gap-2 text-sm py-1 cursor-pointer">
              <Checkbox checked={cols.includes(c)} onCheckedChange={() => toggle(c)} disabled={c === "Produto"} />
              <span>{c}</span>
            </label>
          ))}
        </div>
        <DialogFooter className="shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={save}>Aplicar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
