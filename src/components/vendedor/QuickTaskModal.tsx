import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface QuickTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // pré-preenchimento
  defaultClienteNome?: string;
  defaultTipo?: string; // Reativação, Followup, etc.
  defaultTitulo?: string;
}

const tipos = [
  { value: "ligacao", label: "Ligação" },
  { value: "reuniao", label: "Reunião" },
  { value: "follow_up", label: "Follow-up" },
  { value: "reativacao", label: "Reativação" },
  { value: "visita", label: "Visita" },
  { value: "outro", label: "Outro" },
];

export function QuickTaskModal({
  open, onOpenChange, defaultClienteNome = "", defaultTipo = "follow_up", defaultTitulo = "",
}: QuickTaskModalProps) {
  const [titulo, setTitulo] = useState(defaultTitulo);
  const [cliente, setCliente] = useState(defaultClienteNome);
  const [tipo, setTipo] = useState(defaultTipo);
  const [data, setData] = useState("");
  const [obs, setObs] = useState("");

  useEffect(() => {
    if (open) {
      setTitulo(defaultTitulo || (defaultTipo === "reativacao" ? `Reativação — ${defaultClienteNome}` : ""));
      setCliente(defaultClienteNome);
      setTipo(defaultTipo);
      setData("");
      setObs("");
    }
  }, [open, defaultClienteNome, defaultTipo, defaultTitulo]);

  const handleSubmit = () => {
    if (!titulo.trim()) {
      toast.error("Informe um título para a tarefa");
      return;
    }
    // mock: futura integração com backend de tarefas
    toast.success("Tarefa criada com sucesso");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading">Nova tarefa</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          <div>
            <Label className="text-xs">Título *</Label>
            <Input className="mt-1" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex: Reativação — Cliente X" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Cliente</Label>
              <Input className="mt-1" value={cliente} onChange={(e) => setCliente(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Tipo</Label>
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {tipos.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-xs">Data de vencimento</Label>
            <Input type="date" className="mt-1" value={data} onChange={(e) => setData(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Observação</Label>
            <Textarea rows={2} className="mt-1" value={obs} onChange={(e) => setObs(e.target.value)} />
          </div>
        </div>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit}>Criar tarefa</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
