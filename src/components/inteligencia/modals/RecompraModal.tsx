import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  produto?: string;
  estoque?: number;
}

export function RecompraModal({ open, onOpenChange, produto = "Jaqueta Infantil Soft Touch", estoque = 148 }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle>Marcar para recompra</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto space-y-3 py-2">
          <div><Label className="text-xs">Produto</Label><Input defaultValue={produto} readOnly /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Estoque atual</Label><Input defaultValue={`${estoque} un`} readOnly /></div>
            <div><Label className="text-xs">Venda média semanal</Label><Input defaultValue="168 un" readOnly /></div>
            <div><Label className="text-xs">Cobertura estimada</Label><Input defaultValue="0,9 semanas" readOnly /></div>
            <div><Label className="text-xs">Quantidade sugerida</Label><Input defaultValue="700" /></div>
          </div>
          <div><Label className="text-xs">Fornecedor recomendado</Label><Input defaultValue="Têxtil Aurora" /></div>
        </div>
        <DialogFooter className="shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={() => { toast.success("Sugestão enviada para Compras"); onOpenChange(false); }}>Enviar para compras</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
