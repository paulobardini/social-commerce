import { useEffect, useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Lock, Paperclip, X, MessageCircle, Link2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  type Ticket, type Setor, type TicketTipo, type TicketPrioridade,
  setorLabels, tipoLabels, prioridadeLabels, mockAtendentes, loadFunis,
  loadTickets, saveTickets, getCurrentAtendente, visibleSetores,
} from "@/data/mockAtendimento";
import { mockClientes360 } from "@/data/mockCRM360";
import { mockOportunidades } from "@/data/mockCRM";

interface TicketDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticket: Ticket | null;
  defaultClienteId?: string;
  onSaved?: () => void;
}

const emptyTicket = (clienteId?: string): Ticket => {
  const cliente = clienteId ? mockClientes360.find(c => c.id === clienteId) : undefined;
  return {
    id: `t-${Date.now()}`,
    setor: "sac",
    statusColunaId: "sac-aberto",
    clienteId: cliente?.id || "",
    clienteNome: cliente?.nomeFantasia || "",
    empresa: cliente?.nomeFantasia || "",
    whatsapp: cliente?.whatsapp || "",
    tipo: "duvida",
    prioridade: "normal",
    origem: "manual",
    responsavelId: getCurrentAtendente().id,
    dataAbertura: new Date().toLocaleDateString("pt-BR") + " " + new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    ultimaAtividade: "agora",
    proximaAcao: "",
    descricao: "",
    historicoCompras: [],
    mensagensWhatsApp: [],
    anexos: [],
  };
};

export function TicketDrawer({ open, onOpenChange, ticket, defaultClienteId, onSaved }: TicketDrawerProps) {
  const { toast } = useToast();
  const [form, setForm] = useState<Ticket>(emptyTicket());
  const [showHistorico, setShowHistorico] = useState(false);

  const funis = loadFunis();
  const me = getCurrentAtendente();
  const setoresPermitidos = visibleSetores(me);
  const funilAtual = funis.find(f => f.setor === form.setor);
  const oportunidadesCliente = mockOportunidades.filter(o => o.clienteId === form.clienteId);
  const responsaveisDisponiveis = mockAtendentes.filter(
    a => a.role === "supervisor" || a.setores.includes(form.setor),
  );

  useEffect(() => {
    if (open) {
      setForm(ticket ? { ...ticket } : emptyTicket(defaultClienteId));
      setShowHistorico(false);
    }
  }, [open, ticket, defaultClienteId]);

  const isNew = !ticket;

  const handleClienteChange = (clienteId: string) => {
    const c = mockClientes360.find(cl => cl.id === clienteId);
    setForm(f => ({
      ...f,
      clienteId,
      clienteNome: c?.nomeFantasia || "",
      empresa: c?.nomeFantasia || "",
      whatsapp: c?.whatsapp || f.whatsapp,
    }));
  };

  const handleSetorChange = (setor: Setor) => {
    const novoFunil = funis.find(f => f.setor === setor);
    setForm(f => ({
      ...f,
      setor,
      statusColunaId: novoFunil?.colunas[0]?.id || f.statusColunaId,
    }));
  };

  const handleSave = () => {
    if (!form.clienteId) {
      toast({ title: "Selecione um cliente", variant: "destructive" });
      return;
    }
    const tickets = loadTickets();
    const idx = tickets.findIndex(t => t.id === form.id);
    if (idx >= 0) tickets[idx] = form;
    else tickets.unshift(form);
    saveTickets(tickets);
    toast({ title: isNew ? "Ticket criado" : "Ticket atualizado", description: `${form.empresa} · ${setorLabels[form.setor]}` });
    onSaved?.();
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-[520px] p-0 flex flex-col h-full">
        {/* Header */}
        <div className="shrink-0 px-5 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-base font-heading font-bold text-foreground">
              {isNew ? "Novo ticket" : `Ticket ${form.id.toUpperCase()}`}
            </h2>
            <p className="text-xs text-muted-foreground">Setor: {setorLabels[form.setor]}</p>
          </div>
          <button onClick={() => onOpenChange(false)} className="h-8 w-8 rounded-md hover:bg-muted flex items-center justify-center">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Cliente</Label>
            <Select value={form.clienteId} onValueChange={handleClienteChange}>
              <SelectTrigger className="h-9"><SelectValue placeholder="Selecionar cliente..." /></SelectTrigger>
              <SelectContent>
                {mockClientes360.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.nomeFantasia}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Número WhatsApp</Label>
            <Input className="h-9" value={form.whatsapp} onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Setor</Label>
              <Select value={form.setor} onValueChange={(v) => handleSetorChange(v as Setor)}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {setoresPermitidos.map(s => (
                    <SelectItem key={s} value={s}>{setorLabels[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Tipo</Label>
              <Select value={form.tipo} onValueChange={v => setForm(f => ({ ...f, tipo: v as TicketTipo }))}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(tipoLabels).map(([k, l]) => (
                    <SelectItem key={k} value={k}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Status</Label>
              <Select value={form.statusColunaId} onValueChange={v => setForm(f => ({ ...f, statusColunaId: v }))}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {funilAtual?.colunas.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Prioridade</Label>
              <Select value={form.prioridade} onValueChange={v => setForm(f => ({ ...f, prioridade: v as TicketPrioridade }))}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(prioridadeLabels).map(([k, l]) => (
                    <SelectItem key={k} value={k}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Responsável</Label>
            <Select value={form.responsavelId} onValueChange={v => setForm(f => ({ ...f, responsavelId: v }))}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                {responsaveisDisponiveis.map(a => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.nome} {a.role === "supervisor" ? "· Supervisor" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs flex items-center gap-1"><Link2 className="h-3 w-3" /> Vínculo com oportunidade</Label>
            <Select value={form.oportunidadeId || "none"} onValueChange={v => setForm(f => ({ ...f, oportunidadeId: v === "none" ? undefined : v }))}>
              <SelectTrigger className="h-9"><SelectValue placeholder="Nenhuma" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhuma</SelectItem>
                {oportunidadesCliente.map(o => (
                  <SelectItem key={o.id} value={o.id}>{o.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Histórico de compras */}
          <Collapsible open={showHistorico} onOpenChange={setShowHistorico}>
            <CollapsibleTrigger className="w-full flex items-center justify-between text-xs font-medium text-foreground bg-muted/50 px-3 py-2 rounded-md hover:bg-muted">
              <span>Histórico de compras ({form.historicoCompras.length})</span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showHistorico ? "rotate-180" : ""}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 space-y-1.5">
              {form.historicoCompras.length === 0 ? (
                <p className="text-[11px] text-muted-foreground text-center py-2">Sem compras anteriores.</p>
              ) : (
                form.historicoCompras.map((p, i) => (
                  <div key={i} className="flex items-center justify-between text-xs bg-card border border-border rounded-md px-2.5 py-1.5">
                    <div>
                      <p className="font-medium">{p.produto}</p>
                      <p className="text-[10px] text-muted-foreground">{p.data}</p>
                    </div>
                    <span className="font-semibold text-emerald-700">R$ {p.valor.toLocaleString("pt-BR")}</span>
                  </div>
                ))
              )}
            </CollapsibleContent>
          </Collapsible>

          <div className="space-y-1.5">
            <Label className="text-xs">Descrição / observações</Label>
            <Textarea rows={3} value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Próxima ação</Label>
            <Input className="h-9" value={form.proximaAcao} onChange={e => setForm(f => ({ ...f, proximaAcao: e.target.value }))} />
          </div>

          {/* Anexos */}
          <div className="space-y-1.5">
            <Label className="text-xs">Anexos</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-3 flex items-center gap-3">
              <div className="h-12 w-12 rounded-md bg-muted overflow-hidden shrink-0">
                {form.anexos[0]?.thumb ? (
                  <img src={form.anexos[0].thumb} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <Paperclip className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="text-xs text-muted-foreground flex-1">
                {form.anexos.length > 0 ? (
                  <p>{form.anexos.length} anexo(s)</p>
                ) : (
                  <p>Arraste ou clique para anexar imagens e documentos</p>
                )}
              </div>
            </div>
          </div>

          {/* Histórico WhatsApp */}
          <div className="space-y-2">
            <Label className="text-xs flex items-center gap-1">
              <MessageCircle className="h-3 w-3 text-green-600" /> Histórico WhatsApp
            </Label>
            <div className="bg-muted/40 rounded-lg p-2.5 space-y-1.5 max-h-64 overflow-y-auto">
              {form.mensagensWhatsApp.length === 0 ? (
                <p className="text-[11px] text-muted-foreground text-center py-3">Sem mensagens registradas.</p>
              ) : (
                form.mensagensWhatsApp.map((m, i) => (
                  <div key={i} className={`flex ${m.remetente === "cliente" ? "justify-start" : "justify-end"}`}>
                    <div className={`max-w-[80%] text-[11px] px-2.5 py-1.5 rounded-lg ${
                      m.remetente === "cliente"
                        ? "bg-card border border-border text-foreground"
                        : "bg-blue-50 text-blue-900 border border-blue-100"
                    }`}>
                      <p>{m.texto}</p>
                      <p className="text-[9px] text-muted-foreground text-right mt-0.5">{m.horario}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="relative">
              <Input disabled placeholder="Responda diretamente pelo WhatsApp" className="h-9 pl-8 text-xs bg-muted/40" />
              <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 px-5 py-3 border-t border-border flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button size="sm" onClick={handleSave}>Salvar ticket</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
