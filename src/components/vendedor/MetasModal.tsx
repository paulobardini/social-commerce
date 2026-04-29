import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMetas } from "@/contexts/MetasContext";
import { toast } from "sonner";

interface MetasModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MetasModal({ open, onOpenChange }: MetasModalProps) {
  const { metaMensal, setMetaMensal } = useMetas();
  const [valor, setValor] = useState(String(metaMensal));

  const handleSave = () => {
    const num = Number(valor.replace(/\D/g, ""));
    if (!num || num <= 0) {
      toast.error("Informe um valor de meta válido");
      return;
    }
    setMetaMensal(num);
    toast.success("Meta atualizada");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">Meta de vendas</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          <div>
            <Label className="text-xs">Meta mensal (R$)</Label>
            <Input
              type="number"
              min={0}
              className="mt-1"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="Ex: 80000"
            />
            <p className="text-[11px] text-muted-foreground mt-1.5">
              Valor usado para calcular % de atingimento no Painel.
            </p>
          </div>
        </div>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave}>Salvar meta</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
