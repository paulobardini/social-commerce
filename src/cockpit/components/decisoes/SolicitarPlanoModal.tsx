import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { usePlanos } from "@/contexts/PlanosContext";
import { toast } from "sonner";
import type { PlanoTipo } from "@/lib/planos";

interface Props {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  tipo: PlanoTipo;
  repId: string;
  repNome: string;
  contexto: {
    clienteId?: string;
    clienteNome?: string;
    valor?: number;
    pace?: number;
    coberturaDelta?: number;
  };
  sugestaoNota?: string;
}

export function SolicitarPlanoModal({ open, onOpenChange, tipo, repId, repNome, contexto, sugestaoNota }: Props) {
  const { criarPlano } = usePlanos();
  const [nota, setNota] = useState("");

  useEffect(() => {
    if (open) setNota(sugestaoNota ?? "");
  }, [open, sugestaoNota]);

  const handleCriar = () => {
    if (!nota.trim()) { toast.error("Escreva uma nota para o rep"); return; }
    criarPlano({ repId, repNome, tipo, contexto, notaGestor: nota.trim() });
    toast.success(`Plano solicitado a ${repNome} · rep tem 24h úteis para responder`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Cobrar plano de {repNome}</DialogTitle>
          <DialogDescription>
            {tipo === "cliente_risco"
              ? "O rep receberá uma ação destacada na fila e tem 24h úteis para responder com o plano."
              : "Solicita ao rep um plano formal de recuperação de ritmo. Coexiste com a cobrança informal por WhatsApp."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <label className="text-xs font-medium">Nota do gestor</label>
          <Textarea rows={4} value={nota} onChange={(e) => setNota(e.target.value)} />
          <p className="text-[10px] text-muted-foreground">Sem resposta em 24h úteis o plano é escalado automaticamente.</p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleCriar}>Solicitar plano</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
