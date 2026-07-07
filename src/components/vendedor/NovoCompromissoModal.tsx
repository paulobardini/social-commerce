// MOCK: "Nova Ação com hora" — antes chamado "Novo compromisso".
// Sob a unificação Tarefas/Agenda, TODA entrada da Agenda é uma Ação.
// Este modal apenas atalho para criar Ação com HORA obrigatória (mesma entidade).
import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTarefas } from "@/contexts/TarefasContext";
import { tipoAcaoLabels, mockClientes360 } from "@/data/mockCRM360";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  defaultDate?: string;
  defaultHora?: string;
  defaultClienteId?: string;
  defaultTipo?: string;
  defaultTitulo?: string;
}

const lembretesOpcoes = [
  { v: "0", l: "Sem lembrete" },
  { v: "5", l: "5 min antes" },
  { v: "15", l: "15 min antes" },
  { v: "30", l: "30 min antes" },
  { v: "60", l: "1 hora antes" },
];

export function NovoCompromissoModal({
  open, onOpenChange, defaultDate, defaultHora, defaultClienteId, defaultTipo, defaultTitulo,
}: Props) {
  const { addTarefa } = useTarefas();

  const [titulo, setTitulo] = useState(defaultTitulo || "");
  const [tipo, setTipo] = useState<string>(defaultTipo || "reuniao");
  const [data, setData] = useState(defaultDate || "");
  const [hora, setHora] = useState(defaultHora || "");
  const [duracao, setDuracao] = useState("30min");
  const [clienteId, setClienteId] = useState<string>(defaultClienteId || "");
  const [descricao, setDescricao] = useState("");
  const [lembrete, setLembrete] = useState("15");

  const horaRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTitulo(defaultTitulo || "");
      setTipo(defaultTipo || "reuniao");
      setData(defaultDate || "");
      setHora(defaultHora || "");
      setClienteId(defaultClienteId || "");
      setDescricao(""); setLembrete("15"); setDuracao("30min");
      // Foco na hora — item 4 do briefing (hora pré-focada)
      setTimeout(() => horaRef.current?.focus(), 60);
    }
  }, [open, defaultDate, defaultHora, defaultClienteId, defaultTipo, defaultTitulo]);

  const handleSave = () => {
    if (!titulo || !data || !hora) {
      toast.error("Título, data e hora são obrigatórios");
      return;
    }
    const cliente = mockClientes360.find(c => c.id === clienteId);
    addTarefa({
      titulo,
      descricao,
      tipo,
      clienteId: clienteId || undefined,
      clienteNome: cliente?.nomeFantasia,
      prioridade: "media",
      vencimento: data,
      hora,
      responsavel: "Paulo Bardini",
      status: "pendente",
      origem: "vendedor",
      recorrencia: "nenhuma",
    });
    toast.success(
      Number(lembrete) > 0
        ? `Ação criada · lembrete ${lembrete} min antes`
        : "Ação criada",
    );
    void duracao; // duração é meta visual da agenda; tarefa não persiste
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle>Nova ação com hora</DialogTitle>
          <p className="text-[11px] text-muted-foreground">
            Toda entrada da Agenda é uma <strong>ação</strong>. Aparece também em Tarefas e no Painel.
          </p>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto space-y-3 py-2">
          <div>
            <Label className="text-xs">Título *</Label>
            <Input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ex: Reunião com Boutique da Thay" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Tipo</Label>
              <Select value={tipo} onValueChange={v => setTipo(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(tipoAcaoLabels).map(([k, l]) => (
                    <SelectItem key={k} value={k}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Cliente</Label>
              <Select value={clienteId} onValueChange={setClienteId}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {mockClientes360.map(c => <SelectItem key={c.id} value={c.id}>{c.nomeFantasia}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Data *</Label>
              <Input value={data} onChange={e => setData(e.target.value)} placeholder="DD/MM/AAAA" />
            </div>
            <div>
              <Label className="text-xs">Hora *</Label>
              <Input ref={horaRef} value={hora} onChange={e => setHora(e.target.value)} placeholder="HH:MM" />
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
                {lembretesOpcoes.map(o => <SelectItem key={o.v} value={o.v}>{o.l}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Descrição</Label>
            <Textarea value={descricao} onChange={e => setDescricao(e.target.value)} rows={2} />
          </div>
        </div>
        <DialogFooter className="shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave}>Criar ação</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
