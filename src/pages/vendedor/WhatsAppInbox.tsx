import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Search, MessageCircle, Phone, Send, Paperclip, CheckSquare, Target,
  Clock, User, ExternalLink, MapPin, FileText, Calendar, ChevronLeft,
  Zap, Check, CheckCheck, Play, Settings, AlertCircle, Flame,
  Heart, LifeBuoy, ArrowRight, SkipForward, Users, UserX, Store,
  RefreshCcw, Merge, Contact, QrCode, LogOut, Sparkles, Link2,
  Package, TrendingUp, X, Bell,
} from "lucide-react";
import {
  mockConversas, mockMensagens, mockClientes360, type Mensagem, type Conversa,
} from "@/data/mockCRM360";
import { useMessageTemplates, fillTemplate } from "@/contexts/MessageTemplatesContext";
import { SendOrcamentoModal } from "@/components/vendedor/SendOrcamentoModal";
import { useToast } from "@/hooks/use-toast";
import { getConversaSetor, setorDot, setorLabels } from "@/data/mockAtendimento";
import { saudeCliente, valor12m, formatBRL, diasSemContato } from "@/lib/carteiraMetodo";
import { useAtendimentoComercial } from "@/contexts/AtendimentoComercialContext";
import { PainelAtendimentoWpp } from "@/components/atendimentoComercial/PainelAtendimentoWpp";
import type { CardAC } from "@/data/mockAtendimentoComercial";


// MOCK: "agora" para tempo decorrido — usar Date.now() em produção.
const NOW = new Date("2026-04-13T15:00:00");

type TipoConversa = "clientes" | "sem_vinculo" | "grupos" | "outros";
type EstadoFiltro = "todas" | "nao_lida" | "aguardando";
type ViewMode = "metodo" | "recentes";
type BucketId = "voce_deve" | "negociacao" | "resgates" | "em_dia";

const BUCKETS: { id: BucketId; label: string; dot: string; bg: string; icon: any }[] = [
  { id: "voce_deve",  label: "Você deve resposta",  dot: "bg-red-500",    bg: "bg-red-50/60",    icon: AlertCircle },
  { id: "negociacao", label: "Negociação em jogo", dot: "bg-orange-500", bg: "bg-orange-50/60", icon: Flame },
  { id: "resgates",   label: "Resgates do dia",    dot: "bg-yellow-500", bg: "bg-yellow-50/60", icon: LifeBuoy },
  { id: "em_dia",     label: "Em dia",             dot: "bg-emerald-500",bg: "bg-transparent",  icon: Heart },
];

function parseMensagemDate(data: string, horario: string): Date {
  const [h, mi] = horario.split(":").map(Number);
  let d = new Date(NOW);
  if (data === "Ontem") { d.setDate(d.getDate() - 1); }
  else if (/^\d{2}\/\d{2}\/\d{4}$/.test(data)) {
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
  const diff = NOW.getTime() - date.getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "agora";
  if (h < 24) return `há ${h}h`;
  const d = Math.floor(h / 24);
  return d === 1 ? "há 1 dia" : `há ${d} dias`;
}

const conversaIdDoCardAC = (card: CardAC) => card.conversaId || `ac-card-${card.id}`;

const conversaDoCardAC = (card: CardAC): Conversa => ({
  id: conversaIdDoCardAC(card),
  clienteId: card.clienteId || `lead-${card.id}`,
  clienteNome: card.nome || card.telefone,
  ultimaMensagem: card.ultimaMensagem,
  ultimaHora: formatTempoDecorrido(new Date(card.ultimaInteracao)),
  naoLidas: card.naoLidas,
  status: card.naoLidas > 0 ? "nao_lida" : "ativa",
});

function semRespostaInfo(conversaId: string): { tempo: string; horas: number } | null {
  const msgs = mockMensagens[conversaId] || [];
  if (msgs.length === 0) return null;
  const last = msgs[msgs.length - 1];
  if (last.remetente !== "cliente") return null;
  const dt = parseMensagemDate(last.data, last.horario);
  const horas = (NOW.getTime() - dt.getTime()) / 3600000;
  if (horas < 2) return null;
  return { tempo: formatTempoDecorrido(dt), horas };
}

function StatusIcon({ status }: { status?: Mensagem["status"] }) {
  if (!status || status === "enviado") return <Check className="h-3 w-3 inline-block" />;
  if (status === "entregue")           return <CheckCheck className="h-3 w-3 inline-block" />;
  return <CheckCheck className="h-3 w-3 inline-block text-blue-400" />;
}

// Playbook por situação
function sugestaoPlaybook(cliente: any, conv: Conversa): { titulo: string; mensagem: string; icone: any } {
  const nome = cliente?.nomeFantasia || conv.clienteNome;
  const marca = cliente?.marcasInteresse?.[0] || "coleção";
  const saude = cliente ? saudeCliente(cliente) : "ativo";
  const semResp = semRespostaInfo(conv.id);
  if (semResp) return {
    titulo: "Retomar conversa",
    icone: AlertCircle,
    mensagem: `Oi ${nome}, tudo bem? Retomando nossa conversa — consegue me dar um retorno hoje? Posso ajudar em algo?`,
  };
  if (cliente?.orcamentosAtivos > 0) return {
    titulo: "Cobrar proposta parada",
    icone: FileText,
    mensagem: `Oi ${nome}, passando aqui para saber se conseguiu analisar a proposta. Qualquer ajuste posso rodar rapidinho. Segue o link: https://nextil.app/proposta/orc-1`,
  };
  if (saude === "risco") return {
    titulo: "Resgate — em risco",
    icone: LifeBuoy,
    mensagem: `${nome}, faz um tempinho que não conversamos! Acabou de chegar a nova coleção da ${marca}. Quer que eu monte uma sugestão de reposição pra você?`,
  };
  if (cliente?.status === "reativacao" || cliente?.status === "inativo") return {
    titulo: "Reativação",
    icone: Sparkles,
    mensagem: `Oi ${nome}! Nova coleção da ${marca} chegou e lembrei de você. Posso te mandar 3 sugestões que casam com o seu perfil?`,
  };
  if (cliente?.pedidosRealizados === 0) return {
    titulo: "Primeiro contato",
    icone: Users,
    mensagem: `Olá ${nome}! Aqui é o Paulo da NEXTIL. Vi que você tem interesse em ${marca}. Posso te apresentar as condições e a coleção nova?`,
  };
  return {
    titulo: "Follow-up cordial",
    icone: MessageCircle,
    mensagem: `Oi ${nome}, tudo certo por aí? Passando pra saber se posso te ajudar em algo esta semana.`,
  };
}

interface WhatsAppInboxProps {
  conversasFiltro?: (c: Conversa) => boolean;
  topSlot?: ReactNode;
  titulo?: string;
  mostrarSetor?: boolean;
  /** Ativa o modo Método (fila estratégica). Default true. */
  modoMetodo?: boolean;
}

export default function WhatsAppInbox({
  conversasFiltro, topSlot, titulo = "WhatsApp",
  mostrarSetor = false, modoMetodo = true,
}: WhatsAppInboxProps = {}) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { templates } = useMessageTemplates();
  const { cardDaConversa, colunas, registrarEventoConversa, cards } = useAtendimentoComercial();

  const conversasBase = useMemo(
    () => {
      const base = conversasFiltro ? mockConversas.filter(conversasFiltro) : mockConversas;
      const idsBase = new Set(base.map(c => c.id));
      const conversasDosCards = cards
        .filter(card => card.status !== "perdido")
        .filter(card => !idsBase.has(conversaIdDoCardAC(card)))
        .map(conversaDoCardAC);
      return [...base, ...conversasDosCards];
    },
    [conversasFiltro, cards]
  );

  const [searchParams, setSearchParams] = useSearchParams();
  const telefoneParam = searchParams.get("telefone");
  const cardIdParam = searchParams.get("cardId");
  const initialSelectedId = useMemo(() => {
    // 1) cardId → conversaId
    if (cardIdParam) {
      // buscamos no cards do context via helper indireto: cardDaConversa não serve; iteramos conversas
      const cardConv = conversasBase.find(c => {
        const card = cardDaConversa(c.id);
        return card?.id === cardIdParam;
      });
      if (cardConv) return cardConv.id;
    }
    if (telefoneParam) {
      const digits = telefoneParam.replace(/\D/g, "");
      const match = conversasBase.find(c => {
        const cli = mockClientes360.find(x => x.id === c.clienteId);
        const w = (cli?.whatsapp || cli?.telefone || "").replace(/\D/g, "");
        return w && digits && (w === digits || w.endsWith(digits) || digits.endsWith(w));
      });
      if (match) return match.id;
    }
    return conversasBase[0]?.id || "";
  }, [telefoneParam, cardIdParam, conversasBase, cardDaConversa]);
  const [selectedId, setSelectedId] = useState<string>(initialSelectedId);
  useEffect(() => {
    if ((telefoneParam || cardIdParam) && initialSelectedId) {
      setSelectedId(initialSelectedId);
      const next = new URLSearchParams(searchParams);
      next.delete("telefone");
      next.delete("cardId");
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [telefoneParam, cardIdParam, initialSelectedId]);

  const [search, setSearch] = useState("");
  const [msgInput, setMsgInput] = useState("");
  const [msgSuggestion, setMsgSuggestion] = useState<{ titulo: string; original: string } | null>(null);
  const [tipo, setTipo] = useState<TipoConversa>("clientes");
  const [estado, setEstado] = useState<EstadoFiltro>("todas");
  const [viewMode, setViewMode] = useState<ViewMode>("metodo");
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [sendOrcamentoOpen, setSendOrcamentoOpen] = useState(false);
  const [trabalharOpen, setTrabalharOpen] = useState(false);
  const [trabalharIdx, setTrabalharIdx] = useState(0);
  const [filaMode, setFilaMode] = useState(false);
  const [filaQueue, setFilaQueue] = useState<string[]>([]);
  const [filaIdx, setFilaIdx] = useState(0);
  const [gestorVer, setGestorVer] = useState(true);
  const [semVinculoIgnored, setSemVinculoIgnored] = useState(false);

  const [extraMessages, setExtraMessages] = useState<Record<string, Mensagem[]>>({});

  // ---------- Classificação em buckets do método ----------
  function bucketDe(conv: Conversa): BucketId {
    if (semRespostaInfo(conv.id)) return "voce_deve";
    const cli = mockClientes360.find(c => c.id === conv.clienteId);
    if (cli && (cli.orcamentosAtivos > 0 || cli.oportunidadesAbertas > 0)) return "negociacao";
    if (cli && (cli.status === "em_risco" || cli.status === "inativo" || cli.status === "reativacao")) return "resgates";
    return "em_dia";
  }

  function motivoEstrategico(conv: Conversa): string {
    const cli = mockClientes360.find(c => c.id === conv.clienteId);
    const sem = semRespostaInfo(conv.id);
    if (sem) return `aguardando você ${sem.tempo}`;
    if (cli?.orcamentosAtivos && cli.orcamentosAtivos > 0) return `proposta enviada · aguardando retorno`;
    if (cli?.oportunidadesAbertas && cli.oportunidadesAbertas > 0) return `${cli.oportunidadesAbertas} oportunidade${cli.oportunidadesAbertas > 1 ? "s" : ""} em aberto`;
    if (cli?.status === "em_risco") return `sem compra há ${diasSemContato(cli.ultimoContato)}d — resgatar`;
    if (cli?.status === "inativo" || cli?.status === "reativacao") return `reativar — ${diasSemContato(cli.ultimoContato)}d sem compra`;
    return conv.ultimaMensagem;
  }

  // Aplica tipo + estado + busca (usado para métricas base)
  const conversasVisiveis = useMemo(() => {
    if (tipo !== "clientes") return []; // grupos/outros/sem_vinculo — todos mock 0
    return conversasBase.filter(c => {
      if (search && !c.clienteNome.toLowerCase().includes(search.toLowerCase())) return false;
      if (estado === "nao_lida" && c.naoLidas === 0) return false;
      if (estado === "aguardando" && c.status !== "aguardando_resposta") return false;
      return true;
    });
  }, [conversasBase, tipo, estado, search]);

  const grouped = useMemo(() => {
    const g: Record<BucketId, Conversa[]> = { voce_deve: [], negociacao: [], resgates: [], em_dia: [] };
    conversasVisiveis.forEach(c => { g[bucketDe(c)].push(c); });
    // negociação: por valor
    g.negociacao.sort((a, b) => {
      const va = valor12m(mockClientes360.find(x => x.id === a.clienteId)!);
      const vb = valor12m(mockClientes360.find(x => x.id === b.clienteId)!);
      return vb - va;
    });
    return g;
  }, [conversasVisiveis]);

  const filaOrdenada: Conversa[] = useMemo(() => {
    return [...grouped.voce_deve, ...grouped.negociacao, ...grouped.resgates];
  }, [grouped]);

  // ---------- Métricas do dia ----------
  const metricas = useMemo(() => {
    const hojeStr = "13/04/2026";
    // Somente conversas de CLIENTES (grupos/outros/sem_vinculo ficam fora)
    const clientesConvs = conversasBase.filter(c => mockClientes360.some(x => x.id === c.clienteId));
    const cobertosHoje = clientesConvs.filter(c => {
      const msgs = [...(mockMensagens[c.id] || []), ...(extraMessages[c.id] || [])];
      return msgs.some(m => m.remetente === "vendedor" && m.data === hojeStr);
    }).length;
    const propostasCobradas = clientesConvs.filter(c => {
      const cli = mockClientes360.find(x => x.id === c.clienteId);
      return cli && cli.orcamentosAtivos > 0;
    }).length;
    const aguardandoVoce = clientesConvs.filter(c => semRespostaInfo(c.id)).length;
    return { cobertosHoje, propostasCobradas, aguardandoVoce };
  }, [conversasBase, extraMessages]);

  const selected = conversasBase.find(c => c.id === selectedId);
  const selectedCard = selected ? cardDaConversa(selected.id) : undefined;
  const baseMensagens = selected ? mockMensagens[selected.id] || [] : [];
  const cardMensagens: Mensagem[] = selected && selectedCard && baseMensagens.length === 0 ? [{
    id: `m-${selected.id}-lead`,
    conversaId: selected.id,
    remetente: "cliente",
    texto: selectedCard.ultimaMensagem || "Olá, tenho interesse em conhecer o catálogo.",
    horario: new Date(selectedCard.ultimaInteracao).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    data: new Date(selectedCard.ultimaInteracao).toLocaleDateString("pt-BR"),
    lida: selectedCard.naoLidas === 0,
  }] : [];
  const mensagens = selected ? [...baseMensagens, ...cardMensagens, ...(extraMessages[selected.id] || [])] : [];
  // Se o card associado é um lead sem clienteId, não resolvemos cliente do CRM
  // (evita mostrar dados de um cliente existente com mesmo telefone).
  const cliente = selected && !(selectedCard && !selectedCard.clienteId)
    ? mockClientes360.find(c => c.id === selected.clienteId) || null
    : null;

  const totalNaoLidas = conversasBase.reduce((s, c) => s + c.naoLidas, 0);

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
      id: `mlocal_${Date.now()}`, conversaId: selected.id, remetente: "vendedor",
      texto, horario, data, lida: false, status: "enviado",
    };
    setExtraMessages(prev => ({ ...prev, [selected.id]: [...(prev[selected.id] || []), newMsg] }));
    // Fase 7.1 — gatilho de primeira resposta do vendedor
    registrarEventoConversa({ tipo: "primeira_resposta_vendedor", conversaId: selected.id, texto });
  }

  function simularMensagemRecebida() {
    if (!selected) return;
    const cli = mockClientes360.find(c => c.id === selected.clienteId);
    registrarEventoConversa({
      tipo: "mensagem_recebida",
      conversaId: selected.id,
      telefone: cli?.whatsapp || cli?.telefone || selectedCard?.telefone,
      nome: cli?.nomeFantasia || selectedCard?.nome || selected.clienteNome,
      texto: "(simulado) Oi, cheguei aqui pelo WhatsApp!",
    });
    toast({ title: "Evento simulado", description: "Mensagem recebida registrada no context." });
  }

  function handleSendInput() {
    if (!msgInput.trim()) return;
    if (msgSuggestion && msgInput.trim() === msgSuggestion.original.trim()) {
      // MOCK: métrica futura de eficácia do playbook — sugestão enviada sem edição
      toast({ title: "Sugestão do playbook usada", description: msgSuggestion.titulo });
    }
    appendMessage(msgInput.trim());
    setMsgInput("");
    setMsgSuggestion(null);
  }
  function handleApplyTemplate(content: string) {
    const filled = fillTemplate(content, templateVars);
    setMsgInput(prev => (prev ? prev + "\n" : "") + filled);
    setMsgSuggestion(null);
    setTemplatesOpen(false);
  }
  function handleSendOrcamento(o: { id: string; nome: string; valorTotal: number | null; status: string }) {
    const valor = o.valorTotal != null ? `R$ ${o.valorTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "valor a confirmar";
    appendMessage(`Segue o orçamento ${o.nome}:\n📄 Valor total: ${valor}\nStatus: ${o.status}\n🔗 https://nextil.app/proposta/${o.id}`);
    toast({ title: "Orçamento enviado pelo chat" });
  }
  function usarSugestao() {
    if (!selected) return;
    const s = sugestaoPlaybook(cliente, selected);
    setMsgInput(s.mensagem);
    setMsgSuggestion({ titulo: s.titulo, original: s.mensagem });
    toast({ title: `Sugestão aplicada: ${s.titulo}` });
  }
  function cobrarProposta() {
    if (!selected) return;
    const nome = cliente?.nomeFantasia || selectedCard?.nome || selected.clienteNome;
    const texto = `Oi ${nome}, tudo bem? Passando aqui só pra saber se conseguiu dar uma olhada na proposta que te enviei. Qualquer ajuste eu rodo rapidinho por aqui. 🙌`;
    setMsgInput(texto);
    setMsgSuggestion({ titulo: "Cobrar proposta parada", original: texto });
    toast({ title: "Template de cobrança carregado no composer" });
  }

  // ---------- Trabalhar fila ----------
  function abrirFila() {
    if (filaOrdenada.length === 0) { toast({ title: "Fila zerada 🎉", description: "Sem prioridades pendentes." }); return; }
    setTrabalharIdx(0);
    setTrabalharOpen(true);
  }
  function proximo() {
    if (trabalharIdx + 1 >= filaOrdenada.length) {
      setTrabalharOpen(false);
      toast({ title: `Fila zerada 🎉 · ${filaOrdenada.length} clientes cobertos` });
    } else {
      setTrabalharIdx(i => i + 1);
    }
  }
  const filaAtual = trabalharOpen ? filaOrdenada[trabalharIdx] : null;
  const filaAtualCliente = filaAtual ? mockClientes360.find(c => c.id === filaAtual.clienteId) : null;
  const filaAtualSugestao = filaAtual ? sugestaoPlaybook(filaAtualCliente, filaAtual) : null;

  const filaAtualEnviar = () => {
    if (!filaAtual || !filaAtualSugestao) return;
    const now = new Date();
    const horario = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const data = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`;
    setExtraMessages(prev => ({
      ...prev,
      [filaAtual.id]: [...(prev[filaAtual.id] || []), {
        id: `mfila_${Date.now()}`, conversaId: filaAtual.id, remetente: "vendedor",
        texto: filaAtualSugestao.mensagem, horario, data, lida: false, status: "enviado",
      }],
    }));
    toast({ title: `Enviado para ${filaAtual.clienteNome}` });
    proximo();
  };

  // ---------- Render ----------
  const tipoTabs: { id: TipoConversa; label: string; count: number; icon: any }[] = [
    { id: "clientes",    label: "Clientes",     count: conversasBase.length, icon: Users },
    { id: "sem_vinculo", label: "Sem vínculo",  count: semVinculoIgnored ? 0 : 1, icon: UserX },
    { id: "grupos",      label: "Grupos",       count: 0, icon: Store },
    { id: "outros",      label: "Outros",       count: 0, icon: Contact },
  ];

  const renderConversa = (conv: Conversa) => {
    const cardAtivo = cardDaConversa(conv.id);
    const cli = mockClientes360.find(c => c.id === conv.clienteId);
    const saude = cli ? saudeCliente(cli) : null;
    const saudeColor = saude === "risco" ? "bg-red-500" : saude === "inativo" ? "bg-yellow-500" : "bg-emerald-500";
    const colAtiva = cardAtivo ? colunas.find(cx => cx.id === cardAtivo.colunaId) : null;
    const displayName = cardAtivo && !cardAtivo.clienteId ? cardAtivo.telefone : conv.clienteNome;
    const avatarLabel = displayName.replace(/\D/g, "") ? "#" : displayName[0];
    return (
      <button
        key={conv.id}
        onClick={() => setSelectedId(conv.id)}
        className={`w-full flex items-start gap-2.5 p-2.5 text-left transition-colors border-b border-border/50 ${
          selectedId === conv.id ? "bg-accent/5 border-l-2 border-l-accent" : "hover:bg-muted/50"
        }`}
      >
        <div className="relative shrink-0">
          <div className="h-9 w-9 rounded-full bg-green-100 flex items-center justify-center">
            <span className="text-xs font-bold text-green-700">{avatarLabel}</span>
          </div>
          {saude && <div className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ${saudeColor} border-2 border-card`} title={`Saúde: ${saude}`} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-1.5 min-w-0">
              {mostrarSetor && (
                <span title={setorLabels[getConversaSetor(conv.id)]} className={`h-2 w-2 rounded-full shrink-0 ${setorDot[getConversaSetor(conv.id)]}`} />
              )}
              <p className={`text-xs truncate ${conv.naoLidas > 0 ? "font-bold" : "font-medium"}`}>{displayName}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {colAtiva && (
                <span title={`Atendimento: ${colAtiva.label}`} className="text-[9px] font-semibold px-1 rounded bg-muted text-foreground flex items-center gap-0.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${colAtiva.cor}`} />
                  {colAtiva.label.split(" ")[0]}
                </span>
              )}
              <span className="text-[10px] text-muted-foreground">{conv.ultimaHora}</span>
            </div>
          </div>

          <p className="text-[11px] truncate mt-0.5 text-muted-foreground italic">
            {modoMetodo ? motivoEstrategico(conv) : conv.ultimaMensagem}
          </p>
        </div>
        {conv.naoLidas > 0 && (
          <Badge className="h-4 min-w-4 px-1 flex items-center justify-center text-[9px] bg-green-500 shrink-0">{conv.naoLidas}</Badge>
        )}
      </button>
    );
  };

  return (
    <>
      <div className="flex h-[calc(100vh-56px)] overflow-hidden">
        {/* LEFT */}
        <div className={`${selectedId && selected ? "hidden md:flex" : "flex"} w-full md:w-[340px] border-r border-border flex-col bg-card shrink-0`}>
          {topSlot && <div className="border-b border-border">{topSlot}</div>}

          {/* Header + ⚙ */}
          <div className="p-3 border-b border-border space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-heading font-bold flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-green-600" /> {titulo}
                {totalNaoLidas > 0 && <Badge className="h-5 text-[10px]">{totalNaoLidas}</Badge>}
              </h2>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7" title="Ferramentas">
                    <Settings className="h-3.5 w-3.5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-56 p-1">
                  {[
                    { icon: RefreshCcw, label: "Atualizar sincronização" },
                    { icon: Merge, label: "Unificar duplicadas" },
                    { icon: Contact, label: "Carregar contatos" },
                    { icon: QrCode, label: "Conectar via QR" },
                    { icon: LogOut, label: "Sair do WhatsApp" },
                  ].map(a => (
                    <button
                      key={a.label}
                      onClick={() => toast({ title: a.label })}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs hover:bg-muted"
                    >
                      <a.icon className="h-3.5 w-3.5 text-muted-foreground" /> {a.label}
                    </button>
                  ))}
                </PopoverContent>
              </Popover>
            </div>

            {/* Faixa do método */}
            {modoMetodo && (
              <div className="rounded-lg border border-accent/30 bg-gradient-to-br from-accent/5 to-transparent p-2 space-y-1.5">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Hoje via Whats</p>
                <div className="grid grid-cols-3 gap-1 text-center">
                  <button className="p-1 rounded hover:bg-muted transition-colors">
                    <div className="text-sm font-bold font-heading text-emerald-600">{metricas.cobertosHoje}</div>
                    <div className="text-[9px] text-muted-foreground leading-tight">cobertos</div>
                  </button>
                  <button className="p-1 rounded hover:bg-muted transition-colors">
                    <div className="text-sm font-bold font-heading text-orange-600">{metricas.propostasCobradas}</div>
                    <div className="text-[9px] text-muted-foreground leading-tight">propostas ativas</div>
                  </button>
                  <button onClick={() => setEstado("todas")} className="p-1 rounded hover:bg-muted transition-colors">
                    <div className="text-sm font-bold font-heading text-red-600">{metricas.aguardandoVoce}</div>
                    <div className="text-[9px] text-muted-foreground leading-tight">te aguardam</div>
                  </button>
                </div>
                <Button size="sm" className="w-full h-7 text-[11px] gap-1" onClick={abrirFila}>
                  <Play className="h-3 w-3" /> Trabalhar fila ({filaOrdenada.length})
                </Button>
              </div>
            )}

            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input placeholder="Buscar conversa..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-xs" />
            </div>

            {/* Linha 1: Tipos (scroll horizontal, nunca truncar) */}
            <div className="flex gap-1 overflow-x-auto -mx-1 px-1 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {tipoTabs.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTipo(t.id)}
                  className={`shrink-0 text-[10px] px-2 py-1 rounded flex items-center gap-1 whitespace-nowrap transition-colors ${
                    tipo === t.id ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <t.icon className="h-2.5 w-2.5" /> {t.label}
                  {t.count > 0 && <span className={`text-[9px] px-1 rounded-full ${tipo === t.id ? "bg-background/20" : "bg-muted"}`}>{t.count}</span>}
                </button>
              ))}
            </div>

            {/* Linha 2: Estado (esquerda) + toggle Método/Recentes (direita) */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex gap-1 overflow-x-auto -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {([
                  { key: "todas" as EstadoFiltro, label: "Todas" },
                  { key: "nao_lida" as EstadoFiltro, label: "Não lidas" },
                  { key: "aguardando" as EstadoFiltro, label: "Aguardando" },
                ]).map(f => (
                  <button
                    key={f.key}
                    onClick={() => setEstado(f.key)}
                    className={`shrink-0 whitespace-nowrap text-[10px] px-2 py-0.5 rounded border transition-colors ${
                      estado === f.key ? "bg-accent text-accent-foreground border-accent" : "border-border text-muted-foreground hover:border-accent/40"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              {modoMetodo && (
                <div className="flex bg-muted rounded p-0.5 shrink-0">
                  {(["metodo", "recentes"] as ViewMode[]).map(v => (
                    <button
                      key={v}
                      onClick={() => setViewMode(v)}
                      className={`text-[9px] px-1.5 py-0.5 rounded transition-colors whitespace-nowrap ${
                        viewMode === v ? "bg-background text-foreground font-semibold" : "text-muted-foreground"
                      }`}
                    >
                      {v === "metodo" ? "Método" : "Recentes"}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Lista */}
          <div className="flex-1 overflow-y-auto">
            {/* Banner de vinculação (mock) */}
            {tipo === "sem_vinculo" && !semVinculoIgnored && (
              <div className="m-2 p-2.5 rounded-lg border border-orange-200 bg-orange-50/60 space-y-2">
                <div className="flex items-start gap-2">
                  <Link2 className="h-3.5 w-3.5 text-orange-600 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold">Vincular a AGK Atacado?</p>
                    <p className="text-[10px] text-muted-foreground">Telefone (47) 99123-... encontrado no CRM</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" className="h-6 text-[10px] flex-1" onClick={() => { toast({ title: "Vinculado a AGK Atacado" }); setSemVinculoIgnored(true); }}>Vincular</Button>
                  <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => setSemVinculoIgnored(true)}>Não é este</Button>
                  <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => { toast({ title: "Criar cliente" }); setSemVinculoIgnored(true); }}>Criar</Button>
                </div>
                <button className="text-[10px] text-muted-foreground underline w-full text-left" onClick={() => setSemVinculoIgnored(true)}>
                  Marcar como não-CRM
                </button>
              </div>
            )}

            {tipo !== "clientes" && tipo !== "sem_vinculo" && (
              <div className="text-center py-12 px-4 text-xs text-muted-foreground">
                <div className="mx-auto h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-2">
                  <Users className="h-4 w-4 opacity-50" />
                </div>
                {tipo === "grupos" ? "Nenhum grupo — grupos não entram na fila do método." : "Nenhuma conversa não-CRM (fábricas, equipe interna)."}
              </div>
            )}

            {tipo === "clientes" && conversasVisiveis.length === 0 && (
              <div className="text-center py-12 text-xs text-muted-foreground">Nenhuma conversa nesta aba</div>
            )}

            {tipo === "clientes" && viewMode === "metodo" && conversasVisiveis.length > 0 && (
              <>
                {BUCKETS.map(b => {
                  const items = grouped[b.id];
                  if (items.length === 0) return null;
                  return (
                    <div key={b.id} className={b.bg}>
                      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border/60 sticky top-0 bg-inherit backdrop-blur-sm z-10">
                        <span className={`h-1.5 w-1.5 rounded-full ${b.dot}`} />
                        <b.icon className="h-3 w-3 text-muted-foreground" />
                        <p className="text-[10px] font-bold uppercase tracking-wider text-foreground/80 flex-1">{b.label}</p>
                        <span className="text-[10px] font-semibold text-muted-foreground">{items.length}</span>
                      </div>
                      {items.map(renderConversa)}
                    </div>
                  );
                })}
              </>
            )}

            {tipo === "clientes" && viewMode === "recentes" && conversasVisiveis.map(renderConversa)}
          </div>
        </div>

        {/* CENTER */}
        {selected ? (
          <div className={`${!selectedId || !selected ? "hidden md:flex" : "flex"} flex-1 flex-col min-w-0`}>
            <div className="h-14 border-b border-border flex items-center px-4 gap-3 bg-card shrink-0">
              <button onClick={() => setSelectedId("")} className="md:hidden h-8 w-8 flex items-center justify-center rounded-lg hover:bg-muted">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="relative">
                <div className="h-9 w-9 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-sm font-bold text-green-700">{(selectedCard && !selectedCard.clienteId ? selectedCard.telefone : selected.clienteNome).replace(/\D/g, "") ? "#" : selected.clienteNome[0]}</span>
                </div>
                {selected.online && <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-card" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate">{selectedCard && !selectedCard.clienteId ? selectedCard.telefone : selected.clienteNome}</p>
                <p className="text-[10px] text-muted-foreground">{selected.online ? "Online" : "Offline"}{cliente ? ` · ${cliente.cidade}/${cliente.estado}` : selectedCard?.origem ? ` · ${selectedCard.origem.replace("_", " ")}` : ""}</p>
              </div>
              {modoMetodo && cliente && (
                <Button variant="outline" size="sm" className="text-xs gap-1" onClick={usarSugestao}>
                  <Sparkles className="h-3.5 w-3.5 text-accent" /> Sugestão
                </Button>
              )}
              <label className="hidden sm:flex items-center gap-1 text-[10px] text-muted-foreground cursor-pointer">
                <input type="checkbox" checked={gestorVer} onChange={e => setGestorVer(e.target.checked)} className="h-3 w-3" />
                Gestor pode ver
              </label>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[hsl(var(--background))]">
              {mensagens.length > 0 && (
                <div className="flex justify-center"><span className="text-[10px] text-muted-foreground bg-muted px-3 py-1 rounded-full">{mensagens[0]?.data}</span></div>
              )}
              {mensagens.map(m => {
                const isV = m.remetente === "vendedor";
                const status = m.status ?? (isV ? (m.lida ? "lido" : "entregue") : undefined);
                return (
                  <div key={m.id} className={`flex ${isV ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[65%] px-3 py-2 rounded-xl text-sm ${isV ? "bg-accent text-accent-foreground rounded-br-sm" : "bg-card border border-border rounded-bl-sm"}`}>
                      <p className="whitespace-pre-line">{m.texto}</p>
                      <p className={`text-[10px] mt-1 text-right flex items-center justify-end gap-1 ${isV ? "text-accent-foreground/70" : "text-muted-foreground"}`}>
                        <span>{m.horario}</span>
                        {isV && <StatusIcon status={status} />}
                      </p>
                    </div>
                  </div>
                );
              })}
              {/* Chip inline: evento do sistema (mock) */}
              {cliente && cliente.orcamentosAtivos > 0 && (
                <div className="flex justify-center">
                  <span className="text-[10px] bg-orange-50 border border-orange-200 text-orange-700 px-3 py-1 rounded-full flex items-center gap-1.5">
                    <FileText className="h-3 w-3" /> Proposta enviada · 👁 lojista visualizou ontem
                  </span>
                </div>
              )}
            </div>

            <div className="border-t border-border bg-card shrink-0">
              {msgSuggestion && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-accent/10 border-b border-accent/20">
                  <Sparkles className="h-3 w-3 text-accent shrink-0" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-accent">Sugestão do playbook</span>
                  <span className="text-[10px] text-muted-foreground truncate">· {msgSuggestion.titulo}</span>
                  <button
                    onClick={() => { setMsgSuggestion(null); setMsgInput(""); }}
                    className="ml-auto h-5 w-5 rounded flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground"
                    title="Descartar sugestão"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              <div className="min-h-14 flex items-center gap-1.5 px-3 py-2">
                <Button variant="ghost" size="icon" className="h-8 w-8"><Paperclip className="h-4 w-4" /></Button>

                <Popover open={templatesOpen} onOpenChange={setTemplatesOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="Templates de mensagem (/)"><Zap className="h-4 w-4 text-accent" /></Button>
                  </PopoverTrigger>
                  <PopoverContent side="top" align="start" className="w-[340px] p-0">
                    <div className="p-3 border-b border-border flex items-center justify-between">
                      <p className="text-sm font-semibold flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-accent" /> Templates do playbook</p>
                      <Button variant="ghost" size="sm" className="text-[10px] h-6" onClick={() => { setTemplatesOpen(false); navigate("/vendedor/configuracoes/templates"); }}>Gerenciar</Button>
                    </div>
                    <div className="max-h-[320px] overflow-y-auto">
                      {templates.length === 0 && <div className="p-6 text-center text-xs text-muted-foreground">Nenhum template cadastrado.</div>}
                      {templates.map(t => (
                        <button key={t.id} onClick={() => handleApplyTemplate(t.conteudo)} className="w-full text-left p-3 border-b border-border/60 hover:bg-muted/60 transition-colors">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-semibold flex-1 truncate">{t.nome}</p>
                            {t.categoria && <Badge variant="secondary" className="text-[9px]">{t.categoria}</Badge>}
                          </div>
                          <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1">{fillTemplate(t.conteudo, templateVars)}</p>
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>

                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSendOrcamentoOpen(true)} title="Enviar orçamento">
                  <FileText className="h-4 w-4" />
                </Button>

                <Input
                  id="wpp-composer-input"
                  placeholder='Digite "/" para atalhos do playbook...'
                  value={msgInput}
                  onChange={e => setMsgInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "/" && msgInput === "") { e.preventDefault(); setTemplatesOpen(true); return; }
                    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendInput(); }
                  }}
                  className={`h-9 flex-1 ${msgSuggestion ? "bg-accent/5 border-accent/30" : ""}`}
                />
                <Button size="icon" className="h-8 w-8" onClick={handleSendInput}><Send className="h-4 w-4" /></Button>
              </div>
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

        {/* RIGHT — Painel Atendimento + Mini-360 */}
        {selected && (
          <div className="hidden lg:block w-[300px] border-l border-border bg-card overflow-y-auto shrink-0">
            {/* Painel Atendimento Comercial (Fase 6) — sempre exibido, gerencia próprio empty-state */}
            <PainelAtendimentoWpp
              conversaId={selected.id}
              clienteId={cliente?.id}
              clienteNome={cliente?.nomeFantasia || selectedCard?.nome || selected.clienteNome}
              telefone={cliente?.whatsapp || cliente?.telefone || selectedCard?.telefone}
              appendMessage={appendMessage}
              onSimularRecebida={simularMensagemRecebida}
            />

            {cliente && (
              <>
                <div className="p-4 text-center border-b border-border">
                  <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2 relative">
                    <span className="text-2xl font-bold text-green-700">{cliente.nomeFantasia[0]}</span>
                    {(() => {
                      const s = saudeCliente(cliente);
                      const c = s === "risco" ? "bg-red-500" : s === "inativo" ? "bg-yellow-500" : "bg-emerald-500";
                      return <div className={`absolute bottom-0 right-0 h-4 w-4 rounded-full ${c} border-2 border-card`} />;
                    })()}
                  </div>
                  <p className="text-sm font-semibold">{cliente.nomeFantasia}</p>
                  <p className="text-[10px] text-muted-foreground">{cliente.documento}</p>
                  <div className="flex justify-center gap-1 mt-2">
                    <Badge variant="outline" className="text-[9px] capitalize">{cliente.status.replace("_", " ")}</Badge>
                    <Badge variant="secondary" className="text-[9px]">{formatBRL(valor12m(cliente))} · 12m</Badge>
                  </div>
                </div>

                {/* Próxima ação */}
                {modoMetodo && (
                  <div className="p-3 border-b border-border bg-accent/5">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Próxima ação</p>
                    <p className="text-xs font-medium">{cliente.proximaAcao}</p>
                    <Button size="sm" variant="outline" className="w-full h-7 text-[10px] mt-2 gap-1" onClick={usarSugestao}>
                      <Sparkles className="h-3 w-3 text-accent" /> Aplicar sugestão do playbook
                    </Button>
                  </div>
                )}

                <div className="p-3 space-y-2 border-b border-border">
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground"><User className="h-3 w-3 shrink-0" /><span className="truncate">{cliente.representante}</span></div>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground"><Phone className="h-3 w-3 shrink-0" /><span>{cliente.whatsapp}</span></div>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground"><MapPin className="h-3 w-3 shrink-0" /><span>{cliente.cidade}/{cliente.estado}</span></div>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground"><Clock className="h-3 w-3 shrink-0" /><span>Último contato: {cliente.ultimoContato}</span></div>
                </div>

                <div className="p-3 space-y-2 border-b border-border">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Em jogo</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-muted/50 rounded-lg p-2 text-center">
                      <p className="text-lg font-bold font-heading text-purple-600">{cliente.oportunidadesAbertas}</p>
                      <p className="text-[9px] text-muted-foreground">Oportunidades</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2 text-center">
                      <p className="text-lg font-bold font-heading text-orange-600">{cliente.orcamentosAtivos}</p>
                      <p className="text-[9px] text-muted-foreground">Propostas</p>
                    </div>
                  </div>
                  {cliente.orcamentosAtivos > 0 && (
                    <div className="text-[10px] p-2 rounded bg-orange-50 border border-orange-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">Proposta #orc-087</span>
                        <span className="text-orange-700">👁 visualizada</span>
                      </div>
                      <p className="text-muted-foreground">R$ 8.900 · 3 marcas · sem resposta há 2d</p>
                      <button
                        onClick={cobrarProposta}
                        className="w-full mt-1 flex items-center justify-center gap-1 rounded bg-orange-600 text-white text-[10px] font-semibold py-1 hover:bg-orange-700 transition-colors"
                      >
                        <Bell className="h-3 w-3" /> Cobrar agora
                      </button>
                    </div>
                  )}
                </div>

                <div className="p-3 space-y-1.5">
                  <Button variant="default" size="sm" className="w-full text-xs justify-start h-8" onClick={() => setSendOrcamentoOpen(true)}>
                    <FileText className="h-3.5 w-3.5 mr-2" /> Enviar orçamento
                  </Button>
                  <Button variant="outline" size="sm" className="w-full text-xs justify-start h-8">
                    <Package className="h-3.5 w-3.5 mr-2" /> Montar cesta
                  </Button>
                  <Button variant="outline" size="sm" className="w-full text-xs justify-start h-8">
                    <TrendingUp className="h-3.5 w-3.5 mr-2" /> Registrar atendimento
                  </Button>
                  <Button variant="outline" size="sm" className="w-full text-xs justify-start h-8">
                    <Target className="h-3.5 w-3.5 mr-2" /> Criar oportunidade
                  </Button>
                  <Button variant="outline" size="sm" className="w-full text-xs justify-start h-8">
                    <CheckSquare className="h-3.5 w-3.5 mr-2" /> Criar tarefa
                  </Button>
                  <Button variant="outline" size="sm" className="w-full text-xs justify-start h-8">
                    <Calendar className="h-3.5 w-3.5 mr-2" /> Enviar material
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full text-xs justify-start h-8 text-muted-foreground" onClick={() => navigate(`/vendedor/360/${cliente.id}`)}>
                    <ExternalLink className="h-3.5 w-3.5 mr-2" /> Abrir 360 completo
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

      </div>

      {/* Modal: Trabalhar fila */}
      <Dialog open={trabalharOpen} onOpenChange={setTrabalharOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="shrink-0 p-4 border-b border-border">
            <DialogTitle className="flex items-center gap-2 text-base">
              <Play className="h-4 w-4 text-accent" /> Trabalhando a fila
              <Badge variant="secondary" className="ml-auto text-[10px]">{trabalharIdx + 1} de {filaOrdenada.length}</Badge>
            </DialogTitle>
          </DialogHeader>
          {filaAtual && filaAtualCliente && filaAtualSugestao && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="flex items-center gap-3 pb-3 border-b border-border">
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-lg font-bold text-green-700">{filaAtual.clienteNome[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold">{filaAtual.clienteNome}</p>
                  <p className="text-[10px] text-muted-foreground">{filaAtualCliente.cidade}/{filaAtualCliente.estado} · {formatBRL(valor12m(filaAtualCliente))} em 12m</p>
                </div>
                <Badge variant="outline" className="text-[9px] capitalize">{filaAtualCliente.status.replace("_", " ")}</Badge>
              </div>

              <div className="p-3 rounded-lg bg-orange-50 border border-orange-200">
                <p className="text-[10px] font-bold uppercase tracking-wider text-orange-700 mb-1">Motivo</p>
                <p className="text-xs">{motivoEstrategico(filaAtual)}</p>
              </div>

              <div className="p-3 rounded-lg bg-accent/5 border border-accent/30 space-y-2">
                <div className="flex items-center gap-2">
                  <filaAtualSugestao.icone className="h-3.5 w-3.5 text-accent" />
                  <p className="text-[10px] font-bold uppercase tracking-wider text-accent">Playbook · {filaAtualSugestao.titulo}</p>
                </div>
                <textarea
                  key={filaAtual.id}
                  defaultValue={filaAtualSugestao.mensagem}
                  className="w-full text-xs p-2 rounded border border-border bg-background min-h-[100px] resize-none"
                />
              </div>
            </div>
          )}
          <DialogFooter className="shrink-0 p-3 border-t border-border flex-row gap-2">
            <Button variant="ghost" size="sm" onClick={proximo} className="gap-1"><SkipForward className="h-3.5 w-3.5" /> Pular</Button>
            <Button variant="outline" size="sm" onClick={() => { if (filaAtual) { setSelectedId(filaAtual.id); setTrabalharOpen(false); } }}>Abrir conversa</Button>
            <Button size="sm" onClick={filaAtualEnviar} className="ml-auto gap-1">
              Enviar e próxima <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
