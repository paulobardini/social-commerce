// MOCK: Modal de novo compromisso com campo de lembrete (item 19)
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTarefas, type CompromissoExt } from "@/contexts/TarefasContext";
import { tipoCompromissoLabels } from "@/data/mockCRM360";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  defaultDate?: string;
}

const lembretesOpcoes = [
  { v: "0", l: "Sem lembrete" },
  { v: "5", l: "5 min antes" },
  { v: "15", l: "15 min antes" },
  { v: "30", l: "30 min antes" },
  { v: "60", l: "1 hora antes" },
];

export function NovoCompromissoModal({ open, onOpenChange, defaultDate }: Props) {
  const { compromissos } = useTarefas();
  // como TarefasContext não expõe addCompromisso, mockamos via push direto no array (estado local não persiste — apenas UI demo)
  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState<keyof typeof tipoCompromissoLabels>("reuniao");
  const [data, setData] = useState(defaultDate || "");
  const [hora, setHora] = useState("");
  const [duracao, setDuracao] = useState("30min");
  const [clienteNome, setClienteNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [lembrete, setLembrete] = useState("15");

  const reset = () => {
    setTitulo(""); setData(defaultDate || ""); setHora(""); setClienteNome(""); setDescricao(""); setLembrete("15");
  };

  const handleSave = () => {
    if (!titulo || !data || !hora) {
      toast.error("Título, data e hora são obrigatórios");
      return;
    }
    const novo: CompromissoExt = {
      id: `c-${Date.now()}`,
      titulo,
      tipo: tipo as CompromissoExt["tipo"],
      data,
      hora,
      duracao,
      responsavel: "Você",
      descricao,
      status: "agendado",
      origem: "manual",
      clienteNome: clienteNome || undefined,
      lembrete: Number(lembrete),
    };
    // Mock: anexa ao array em memória do contexto
    compromissos.push(novo);
    toast.success(
      Number(lembrete) > 0
        ? `Compromisso criado · lembrete ${lembrete} min antes`
        : "Compromisso criado",
    );
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle>Novo compromisso</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto space-y-3 py-2">
          <div>
            <Label className="text-xs">Título *</Label>
            <Input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ex: Reunião com Boutique da Thay" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Tipo</Label>
              <Select value={tipo} onValueChange={v => setTipo(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(tipoCompromissoLabels).map(([k, l]) => (
                    <SelectItem key={k} value={k}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Cliente</Label>
              <Input value={clienteNome} onChange={e => setClienteNome(e.target.value)} placeholder="Nome do cliente" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Data *</Label>
              <Input value={data} onChange={e => setData(e.target.value)} placeholder="DD/MM/AAAA" />
            </div>
            <div>
              <Label className="text-xs">Hora *</Label>
              <Input value={hora} onChange={e => setHora(e.target.value)} placeholder="HH:MM" />
            </div>
            <div>
              <Label className="text-xs">Duração</Label>
              <Input value={duracao} onChange={e => setDuracao(e.target.value)} placeholder="30min" />
            </div>
          </div>
          <div>
            <Label className="text-xs">Lembrete</Label>
            <Select value={lembrete} onValueChange={setLembrete}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {lembretesOpcoes.map(o => (
                  <SelectItem key={o.v} value={o.v}>{o.l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[10px] text-muted-foreground mt-1">
              Notificação aparece como toast no horário definido antes do evento.
            </p>
          </div>
          <div>
            <Label className="text-xs">Descrição</Label>
            <Textarea value={descricao} onChange={e => setDescricao(e.target.value)} rows={2} />
          </div>
        </div>
        <DialogFooter className="shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave}>Criar compromisso</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
