import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export function CriarCampanhaModal({ open, onOpenChange, produto = "" }: { open: boolean; onOpenChange: (v: boolean) => void; produto?: string }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader className="shrink-0"><DialogTitle>Criar campanha comercial</DialogTitle></DialogHeader>
        <div className="flex-1 overflow-y-auto space-y-3 py-2">
          <div><Label className="text-xs">Produto ou grupo</Label><Input defaultValue={produto} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Objetivo</Label>
              <Select defaultValue="liquidar"><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="liquidar">Liquidar estoque</SelectItem>
                  <SelectItem value="margem">Aumentar margem</SelectItem>
                  <SelectItem value="awareness">Awareness</SelectItem>
                  <SelectItem value="recompra">Estimular recompra</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Canal sugerido</Label>
              <Select defaultValue="social"><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="social">Social Commerce</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="rep">Representantes</SelectItem>
                  <SelectItem value="market">Marketplace B2B</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">Público sugerido</Label><Input defaultValue="Lojistas Sudeste e Sul" /></div>
            <div><Label className="text-xs">Desconto máximo</Label><Input defaultValue="20%" /></div>
            <div className="col-span-2"><Label className="text-xs">Período</Label>
              <div className="flex gap-2"><Input type="date" /><Input type="date" /></div>
            </div>
          </div>
        </div>
        <DialogFooter className="shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={() => { toast.success("Campanha enviada para Marketing"); onOpenChange(false); }}>Enviar para marketing</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
