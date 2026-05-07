import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  precoAtual?: number;
  custo?: number;
}

export function SimularPrecoModal({ open, onOpenChange, precoAtual = 139.9, custo = 58.9 }: Props) {
  const [novo, setNovo] = useState(149.9);
  const calc = useMemo(() => {
    const variacao = ((novo - precoAtual) / precoAtual) * 100;
    const margem = ((novo - custo) / novo) * 100;
    const markupSimples = novo / custo;
    const markupCompleto = (novo * 0.78) / custo;
    const impacto = (novo - precoAtual) * 600;
    return { variacao, margem, markupSimples, markupCompleto, impacto };
  }, [novo, precoAtual, custo]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle>Simular preço</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto space-y-3 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Preço atual</Label><Input value={`R$ ${precoAtual.toFixed(2)}`} readOnly /></div>
            <div><Label className="text-xs">Novo preço</Label>
              <Input type="number" step="0.10" value={novo} onChange={(e) => setNovo(Number(e.target.value))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <Stat label="Variação" v={`${calc.variacao.toFixed(1)}%`} />
            <Stat label="Margem estimada" v={`${calc.margem.toFixed(1)}%`} />
            <Stat label="Markup simples" v={`${calc.markupSimples.toFixed(2)}x`} />
            <Stat label="Markup completo" v={`${calc.markupCompleto.toFixed(2)}x`} />
          </div>
          <div className="bg-primary/5 border border-primary/15 rounded-md p-3">
            <p className="text-[10px] uppercase tracking-wide text-primary font-semibold">Impacto estimado na receita</p>
            <p className="text-lg font-bold tabular-nums">R$ {calc.impacto.toFixed(0)}</p>
          </div>
        </div>
        <DialogFooter className="shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={() => { toast.success("Simulação salva"); onOpenChange(false); }}>Salvar simulação</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Stat({ label, v }: { label: string; v: string }) {
  return (
    <div className="bg-secondary/40 border border-border rounded-md p-2">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="font-semibold tabular-nums">{v}</p>
    </div>
  );
}
