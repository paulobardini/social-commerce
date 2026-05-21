import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Search, MessageCircle, Phone, Send, Paperclip, CheckSquare, Target,
  Clock, User, ExternalLink, MapPin, FileText, Calendar, ChevronLeft,
  Zap, Check, CheckCheck,
} from "lucide-react";
import {
  mockConversas, mockMensagens, mockClientes360, type Mensagem, type Conversa,
} from "@/data/mockCRM360";
import { useMessageTemplates, fillTemplate } from "@/contexts/MessageTemplatesContext";
import { SendOrcamentoModal } from "@/components/vendedor/SendOrcamentoModal";
import { useToast } from "@/hooks/use-toast";
import { getConversaSetor, setorDot, setorLabels } from "@/data/mockAtendimento";
import type { ReactNode } from "react";

type TabKey = "" | "nao_lida" | "aguardando" | "sem_resposta";

// MOCK: "agora" usado para calcular tempo decorrido sem resposta.
// Em produção, usar Date.now().
const NOW = new Date("2026-04-13T15:00:00");

// Parsea horário "HH:MM" combinado com a data ("DD/MM/YYYY", "Ontem" ou "DD/MM").
function parseMensagemDate(data: string, horario: string): Date {
  const [h, mi] = horario.split(":").map(Number);
  let d = new Date(NOW);
  if (data === "Ontem") {
    d.setDate(d.getDate() - 1);
  } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(data)) {
    const [dd, mm, yy] = data.split("/").map(Number);
    d = new Date(yy, mm - 1, dd);
  } else if (/^\d{2}\/\d{2}$/.test(data)) {
    const [dd, mm] = data.split("/").map(Number);
    d = new Date(NOW.getFullYear(), mm - 1, dd);
  }
  d.setHours(h || 0, mi || 0, 0, 0);
  return d;
}

function formatTempoDecorrido(date: Date): string {
  const diffMs = NOW.getTime() - date.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 1) return "agora";
  if (hours < 24) return `há ${hours}h`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "há 1 dia" : `há ${days} dias`;
}

// Retorna a última mensagem da conversa, se for do cliente e tiver >4h sem resposta.
function semRespostaInfo(conversaId: string): { tempo: string; horas: number } | null {
  const msgs = mockMensagens[conversaId] || [];
  if (msgs.length === 0) return null;
  const last = msgs[msgs.length - 1];
  if (last.remetente !== "cliente") return null;
  const dt = parseMensagemDate(last.data, last.horario);
  const horas = (NOW.getTime() - dt.getTime()) / (1000 * 60 * 60);
  if (horas < 4) return null;
  return { tempo: formatTempoDecorrido(dt), horas };
}

// Indicador de status da mensagem (estilo WhatsApp).
function StatusIcon({ status }: { status?: Mensagem["status"] }) {
  if (!status || status === "enviado") {
    return <Check className="h-3 w-3 inline-block" />;
  }
  if (status === "entregue") {
    return <CheckCheck className="h-3 w-3 inline-block" />;
  }
  // lido — azul (API do WhatsApp pode não retornar; nesse caso usar 'entregue')
  return <CheckCheck className="h-3 w-3 inline-block text-blue-400" />;
}

interface WhatsAppInboxProps {
  /** Filtro extra aplicado ANTES da busca/tabs (ex.: por setor do atendente) */
  conversasFiltro?: (c: Conversa) => boolean;
  /** Conteúdo extra renderizado acima da lista de conversas (perfil bar, chips de setor, etc.) */
  topSlot?: ReactNode;
  /** Título exibido no header da lista (default: "WhatsApp") */
  titulo?: string;
  /** Mostrar o dot colorido do setor em cada conversa */
  mostrarSetor?: boolean;
}

export default function WhatsAppInbox({
  conversasFiltro,
  topSlot,
  titulo = "WhatsApp",
  mostrarSetor = false,
}: WhatsAppInboxProps = {}) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { templates } = useMessageTemplates();

  const conversasBase = useMemo(
    () => (conversasFiltro ? mockConversas.filter(conversasFiltro) : mockConversas),
    [conversasFiltro]
  );

  const [selectedId, setSelectedId] = useState<string>(conversasBase[0]?.id || "");
  const [search, setSearch] = useState("");
  const [msgInput, setMsgInput] = useState("");
  const [tab, setTab] = useState<TabKey>("");
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [sendOrcamentoOpen, setSendOrcamentoOpen] = useState(false);

  // Mensagens locais por conversa (para enviar templates / orçamentos / texto).
  // Mock: persistido só em memória.
  const [extraMessages, setExtraMessages] = useState<Record<string, Mensagem[]>>({});

  const filtered = useMemo(() => conversasBase.filter(c => {
    if (search && !c.clienteNome.toLowerCase().includes(search.toLowerCase())) return false;
    if (tab === "nao_lida" && c.naoLidas === 0) return false;
    if (tab === "aguardando" && c.status !== "aguardando_resposta") return false;
    if (tab === "sem_resposta" && !semRespostaInfo(c.id)) return false;
    return true;
  }), [search, tab, conversasBase]);

  const semRespostaCount = useMemo(
    () => conversasBase.filter(c => semRespostaInfo(c.id)).length,
    [conversasBase]
  );

  const selected = conversasBase.find(c => c.id === selectedId);
  const baseMensagens = selected ? mockMensagens[selected.id] || [] : [];
  const mensagens = selected
    ? [...baseMensagens, ...(extraMessages[selected.id] || [])]
    : [];
  const cliente = selected ? mockClientes360.find(c => c.id === selected.clienteId) : null;

  const totalNaoLidas = conversasBase.reduce((s, c) => s + c.naoLidas, 0);

  // Variáveis disponíveis para templates a partir do cliente selecionado
  const templateVars = {
    nome: cliente?.nomeFantasia || selected?.clienteNome || "",
    produto: cliente?.interessePrincipal || "",
    valor: "",
  };

  function appendMessage(texto: string) {
    if (!selected) return;
    const now = new Date();
    const horario = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const data = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`;
    const newMsg: Mensagem = {
      id: `mlocal_${Date.now()}`,
      conversaId: selected.id,
      remetente: "vendedor",
      texto,
      horario,
      data,
      lida: false,
      status: "enviado",
    };
    setExtraMessages(prev => ({
      ...prev,
      [selected.id]: [...(prev[selected.id] || []), newMsg],
    }));
  }

  function handleSendInput() {
    if (!msgInput.trim()) return;
    appendMessage(msgInput.trim());
    setMsgInput("");
  }

  function handleApplyTemplate(content: string) {
    setMsgInput(prev => (prev ? prev + "\n" : "") + fillTemplate(content, templateVars));
    setTemplatesOpen(false);
  }

  function handleSendOrcamento(o: { id: string; nome: string; valorTotal: number | null; status: string }) {
    const valor = o.valorTotal != null
      ? `R$ ${o.valorTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
      : "valor a confirmar";
    const texto = `Segue o orçamento ${o.nome}:\n📄 Valor total: ${valor}\nStatus: ${o.status}\n🔗 https://nextil.app/orcamento/${o.id}`;
    appendMessage(texto);
    toast({ title: "Orçamento enviado pelo chat" });
  }

  return (
    <>
      <div className="flex h-[calc(100vh-56px)] overflow-hidden">
        {/* Left - Conversations list */}
        <div className={`${selectedId && selected ? "hidden md:flex" : "flex"} w-full md:w-[320px] border-r border-border flex-col bg-card shrink-0`}>
          {topSlot && <div className="border-b border-border">{topSlot}</div>}
          <div className="p-3 border-b border-border space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-heading font-bold flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-green-600" /> {titulo}
                {totalNaoLidas > 0 && <Badge className="h-5 text-[10px]">{totalNaoLidas}</Badge>}
              </h2>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input placeholder="Buscar conversa..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-xs" />
            </div>
            <div className="flex gap-1 flex-wrap">
              {([
                { key: "" as TabKey, label: "Todas" },
                { key: "nao_lida" as TabKey, label: "Não lidas" },
                { key: "aguardando" as TabKey, label: "Aguardando" },
                { key: "sem_resposta" as TabKey, label: "Sem resposta", count: semRespostaCount },
              ]).map(f => (
                <button
                  key={f.key}
                  onClick={() => setTab(f.key)}
                  className={`text-[10px] px-2 py-1 rounded-full border transition-colors flex items-center gap-1 ${tab === f.key ? "bg-accent text-accent-foreground border-accent" : "border-border text-muted-foreground hover:border-accent/40"}`}
                >
                  {f.label}
                  {"count" in f && f.count !== undefined && f.count > 0 && (
                    <span className={`text-[9px] px-1 rounded-full ${tab === f.key ? "bg-accent-foreground/20" : "bg-muted"}`}>{f.count}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 && (
              <div className="text-center py-12 text-xs text-muted-foreground">Nenhuma conversa nesta aba</div>
            )}
            {filtered.map(conv => {
              const semResp = tab === "sem_resposta" ? semRespostaInfo(conv.id) : null;
              return (
                <button
                  key={conv.id}
                  onClick={() => setSelectedId(conv.id)}
                  className={`w-full flex items-start gap-3 p-3 text-left transition-colors border-b border-border/50 ${
                    selectedId === conv.id ? "bg-accent/5 border-l-2 border-l-accent" : "hover:bg-muted/50"
                  }`}
                >
                  <div className="relative shrink-0">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-sm font-bold text-green-700">{conv.clienteNome[0]}</span>
                    </div>
                    {conv.online && <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-card" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {mostrarSetor && (
                          <span
                            title={setorLabels[getConversaSetor(conv.id)]}
                            className={`h-2 w-2 rounded-full shrink-0 ${setorDot[getConversaSetor(conv.id)]}`}
                          />
                        )}
                        <p className={`text-sm truncate ${conv.naoLidas > 0 ? "font-bold" : "font-medium"}`}>{conv.clienteNome}</p>
                      </div>
                      {semResp ? (
                        <span className="text-[10px] text-orange-600 font-medium shrink-0 flex items-center gap-0.5">
                          <Clock className="h-2.5 w-2.5" /> {semResp.tempo}
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground shrink-0 ml-1">{conv.ultimaHora}</span>
                      )}
                    </div>
                    <p className={`text-xs truncate mt-0.5 ${conv.naoLidas > 0 ? "text-foreground font-medium" : "text-muted-foreground"}`}>{conv.ultimaMensagem}</p>
                  </div>
                  {conv.naoLidas > 0 && (
                    <Badge className="h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-green-500 shrink-0">{conv.naoLidas}</Badge>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Center - Chat */}
        {selected ? (
          <div className={`${!selectedId || !selected ? "hidden md:flex" : "flex"} flex-1 flex-col min-w-0`}>
            <div className="h-14 border-b border-border flex items-center px-4 gap-3 bg-card shrink-0">
              <button onClick={() => setSelectedId("")} className="md:hidden h-8 w-8 flex items-center justify-center rounded-lg hover:bg-muted">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="relative">
                <div className="h-9 w-9 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-sm font-bold text-green-700">{selected.clienteNome[0]}</span>
                </div>
                {selected.online && <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-card" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate">{selected.clienteNome}</p>
                <p className="text-[10px] text-muted-foreground">{selected.online ? "Online" : "Offline"}{cliente ? ` · ${cliente.cidade}/${cliente.estado}` : ""}</p>
              </div>
              <div className="hidden sm:flex gap-1 shrink-0">
                <Button variant="ghost" size="sm" className="text-xs"><CheckSquare className="h-3.5 w-3.5 mr-1" /> Tarefa</Button>
                <Button variant="ghost" size="sm" className="text-xs"><Target className="h-3.5 w-3.5 mr-1" /> Oportunidade</Button>
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate(`/vendedor/360/${selected.clienteId}`)}>
                  <ExternalLink className="h-3.5 w-3.5 mr-1" /> 360
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[hsl(var(--background))]">
              {mensagens.length > 0 && (
                <div className="flex justify-center"><span className="text-[10px] text-muted-foreground bg-muted px-3 py-1 rounded-full">{mensagens[0]?.data}</span></div>
              )}
              {mensagens.map(m => {
                const isVendedor = m.remetente === "vendedor";
                // Mock: se backend não informou status, assume 'entregue' para enviadas
                const status = m.status ?? (isVendedor ? (m.lida ? "lido" : "entregue") : undefined);
                return (
                  <div key={m.id} className={`flex ${isVendedor ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[65%] px-3 py-2 rounded-xl text-sm ${
                      isVendedor ? "bg-accent text-accent-foreground rounded-br-sm" : "bg-card border border-border rounded-bl-sm"
                    }`}>
                      <p className="whitespace-pre-line">{m.texto}</p>
                      <p className={`text-[10px] mt-1 text-right flex items-center justify-end gap-1 ${isVendedor ? "text-accent-foreground/70" : "text-muted-foreground"}`}>
                        <span>{m.horario}</span>
                        {isVendedor && <StatusIcon status={status} />}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="min-h-14 border-t border-border flex items-center gap-2 px-3 py-2 bg-card shrink-0">
              <Button variant="ghost" size="icon" className="h-8 w-8"><Paperclip className="h-4 w-4" /></Button>

              {/* Templates ⚡ */}
              <Popover open={templatesOpen} onOpenChange={setTemplatesOpen}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" title="Templates de mensagem">
                    <Zap className="h-4 w-4 text-accent" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent side="top" align="start" className="w-[340px] p-0">
                  <div className="p-3 border-b border-border flex items-center justify-between">
                    <p className="text-sm font-semibold flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-accent" /> Templates</p>
                    <Button variant="ghost" size="sm" className="text-[10px] h-6" onClick={() => { setTemplatesOpen(false); navigate("/vendedor/configuracoes/templates"); }}>
                      Gerenciar
                    </Button>
                  </div>
                  <div className="max-h-[320px] overflow-y-auto">
                    {templates.length === 0 && (
                      <div className="p-6 text-center text-xs text-muted-foreground">Nenhum template cadastrado.</div>
                    )}
                    {templates.map(t => (
                      <button
                        key={t.id}
                        onClick={() => handleApplyTemplate(t.conteudo)}
                        className="w-full text-left p-3 border-b border-border/60 hover:bg-muted/60 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-semibold flex-1 truncate">{t.nome}</p>
                          {t.categoria && <Badge variant="secondary" className="text-[9px]">{t.categoria}</Badge>}
                        </div>
                        <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1">
                          {fillTemplate(t.conteudo, templateVars)}
                        </p>
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              <Input
                placeholder="Digite uma mensagem..."
                value={msgInput}
                onChange={e => setMsgInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendInput(); } }}
                className="h-9 flex-1"
              />
              <Button size="icon" className="h-8 w-8" onClick={handleSendInput}><Send className="h-4 w-4" /></Button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-sm">Selecione uma conversa</p>
            </div>
          </div>
        )}

        {/* Right - Client panel */}
        {selected && cliente && (
          <div className="hidden lg:block w-[280px] border-l border-border bg-card overflow-y-auto shrink-0">
            <div className="p-4 text-center border-b border-border">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl font-bold text-green-700">{cliente.nomeFantasia[0]}</span>
              </div>
              <p className="text-sm font-semibold">{cliente.nomeFantasia}</p>
              <p className="text-[10px] text-muted-foreground">{cliente.documento}</p>
            </div>

            <div className="p-4 space-y-3 border-b border-border">
              <div className="flex items-center gap-2 text-xs text-muted-foreground"><User className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">{cliente.representante}</span></div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground"><Phone className="h-3.5 w-3.5 shrink-0" /> <span>{cliente.whatsapp}</span></div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5 shrink-0" /> <span>{cliente.cidade}/{cliente.estado}</span></div>
            </div>

            <div className="p-4 space-y-2 border-b border-border">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Comercial</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-muted/50 rounded-lg p-2 text-center">
                  <p className="text-lg font-bold font-heading text-purple-600">{cliente.oportunidadesAbertas}</p>
                  <p className="text-[9px] text-muted-foreground">Oportunidades</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-2 text-center">
                  <p className="text-lg font-bold font-heading text-green-600">{cliente.pedidosRealizados}</p>
                  <p className="text-[9px] text-muted-foreground">Pedidos</p>
                </div>
              </div>
              <div className="text-xs space-y-1.5 pt-1">
                <div className="flex justify-between"><span className="text-muted-foreground">Nicho</span><span className="font-medium">{cliente.nicho === "infantil" ? "Infantil" : cliente.nicho === "adulto" ? "Adulto" : cliente.nicho === "fitness" ? "Fitness" : "Multimarcas"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Interesse</span><span className="font-medium truncate ml-2 max-w-[120px] text-right">{cliente.interessePrincipal}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Último contato</span><span className="font-medium">{cliente.ultimoContato}</span></div>
              </div>
            </div>

            <div className="p-4 space-y-1.5">
              <Button variant="default" size="sm" className="w-full text-xs justify-start" onClick={() => setSendOrcamentoOpen(true)}>
                <FileText className="h-3.5 w-3.5 mr-2" /> Enviar orçamento
              </Button>
              <Button variant="outline" size="sm" className="w-full text-xs justify-start" onClick={() => navigate(`/vendedor/360/${cliente.id}`)}>
                <ExternalLink className="h-3.5 w-3.5 mr-2" /> Abrir Nextil 360
              </Button>
              <Button variant="outline" size="sm" className="w-full text-xs justify-start">
                <Target className="h-3.5 w-3.5 mr-2" /> Criar oportunidade
              </Button>
              <Button variant="outline" size="sm" className="w-full text-xs justify-start">
                <CheckSquare className="h-3.5 w-3.5 mr-2" /> Criar tarefa
              </Button>
              <Button variant="outline" size="sm" className="w-full text-xs justify-start">
                <Calendar className="h-3.5 w-3.5 mr-2" /> Agendar compromisso
              </Button>
            </div>
          </div>
        )}
      </div>

      {selected && (
        <SendOrcamentoModal
          open={sendOrcamentoOpen}
          onOpenChange={setSendOrcamentoOpen}
          clienteNome={selected.clienteNome}
          onSend={handleSendOrcamento}
        />
      )}
    </>
  );
}
