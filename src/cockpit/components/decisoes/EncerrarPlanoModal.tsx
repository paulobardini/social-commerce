import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { usePlanos } from "@/contexts/PlanosContext";
import { toast } from "sonner";
import type { PlanoRecuperacao } from "@/lib/planos";

export function EncerrarPlanoModal({ plano, open, onOpenChange }: { plano: PlanoRecuperacao | null; open: boolean; onOpenChange: (b: boolean) => void }) {
  const { encerrarPlano } = usePlanos();
  const [nota, setNota] = useState("");

  const confirm = () => {
    if (!plano) return;
    if (!nota.trim()) { toast.error("Nota obrigatória para encerramento manual"); return; }
    encerrarPlano(plano.id, nota.trim(), "manual");
    toast.success("Plano encerrado");
    setNota("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Encerrar plano</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            {plano?.repNome} · {plano?.tipo === "cliente_risco" ? plano.contexto.clienteNome : "recuperação de ritmo"}
          </p>
          <label className="text-xs font-medium">Motivo do encerramento</label>
          <Textarea rows={3} value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Ex: cliente voltou a comprar / não faz mais sentido / etc" />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={confirm}>Encerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
