import { useMemo, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Breadcrumbs } from "@/components/vendedor/Breadcrumbs";
import { TagBadge } from "@/components/vendedor/TagBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Building, MapPin, User, Calendar, Phone, Mail, MessageCircle, Target,
  FileText, CheckSquare, Clock, Plus, ArrowRight, Send, Paperclip,
  Star, ShoppingBag, TrendingUp, Eye, Copy, Sparkles,
  Zap, StickyNote, Package, Factory, PhoneCall,
} from "lucide-react";
import { toast } from "sonner";
import {
  mockClientes360, mockConversas, mockMensagens, mockPedidos, mockNotas,
  mockHistorico, mockTarefas360, mockCompromissos, nichoLabels,
  tipoTarefaLabels, type Cliente360, type Nicho, type HistoricoEvento,
} from "@/data/mockCRM360";
import { mockOportunidades, etapaMap, etapaCorMap } from "@/data/mockCRM";
import { mockOrcamentos } from "@/data/mockVendedor";
import {
  calcularSaude, saudeLabel, saudeColor, saudeDot, type SaudeStatus,
  SAUDE_LIMIARES,
} from "@/lib/saudeCliente";
import {
  ESTAGIOS, valor12m, formatBRL, estagioAtual, loadOverrides,
} from "@/lib/carteiraMetodo";

// Universo de indústrias do vendedor (mock fixo — no real, viria do perfil).
const INDUSTRIAS_VENDEDOR = ["Brandili", "Kyly", "Mundi", "Hering", "Hering Kids", "Malwee"];

// ---------- helpers ----------
const pedidoStatusColors: Record<string, string> = {
  confirmado: "bg-blue-100 text-blue-700",
  em_producao: "bg-yellow-100 text-yellow-700",
  enviado: "bg-purple-100 text-purple-700",
  entregue: "bg-green-100 text-green-700",
  cancelado: "bg-red-100 text-red-700",
  faturado: "bg-indigo-100 text-indigo-700",
  em_transporte: "bg-purple-100 text-purple-700",
};

function whatsappUrl(phone: string, text?: string) {
  const num = phone.replace(/\D/g, "");
  const t = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${num}${t}`;
}

// Próxima ação sugerida pelo motor (mesmo espírito da fila do Painel).
// `modo` define como o botão executa: whatsapp abre conversa; registrar abre modal.
function proximaAcaoSugerida(cliente: Cliente360, saude: SaudeStatus, orcamentosAtivos: number): { titulo: string; motivo: string; modo: "whatsapp" | "registrar" | "orcamento" } {
  if (saude === "novo")    return { titulo: "Fazer primeiro contato via WhatsApp", motivo: "Cliente novo, ainda sem primeira compra", modo: "whatsapp" };
  if (saude === "perdido") return { titulo: "Enviar mensagem de reativação", motivo: `Sem compra há mais de ${SAUDE_LIMIARES.INATIVO_MAX_DIAS} dias`, modo: "whatsapp" };
  if (saude === "inativo") return { titulo: "Enviar mensagem de resgate",     motivo: `Última compra há mais de ${SAUDE_LIMIARES.RISCO_MAX_DIAS} dias`, modo: "whatsapp" };
  if (saude === "risco")   return { titulo: "Enviar oferta específica no WhatsApp", motivo: `Última compra há mais de ${SAUDE_LIMIARES.ATIVO_MAX_DIAS} dias`, modo: "whatsapp" };
  if (orcamentosAtivos > 0) return { titulo: "Cobrar retorno de orçamento", motivo: `${orcamentosAtivos} orçamento(s) em aberto`, modo: "whatsapp" };
  if (cliente.proximaAcao) return { titulo: cliente.proximaAcao, motivo: "Definido pelo vendedor", modo: "registrar" };
  return { titulo: "Registrar visita mensal", motivo: "Manter cadência ativa", modo: "registrar" };
}

// Deriva métricas por indústria (mock determinístico coerente com saúde).
interface IndustriaResumo {
  nome: string;
  vinculada: boolean;
  saude: SaudeStatus;
  valor12m: number;
  ultimaCompra: string | null;
  pedidos: number;
  orcamentoAndamento: { id: string; nome: string; valor: number | null } | null;
  explicacao: string;
}

function resumoPorIndustria(cliente: Cliente360, saudeCompleta: ReturnType<typeof calcularSaude>): IndustriaResumo[] {
  const vinculadas = cliente.marcasInteresse ?? [];
  const totalPedidos = cliente.pedidosRealizados;
  const totalValor = valor12m(cliente);

  const resumo: IndustriaResumo[] = vinculadas.map((nome, i) => {
    const sd = saudeCompleta.industrias.find(s => s.industria === nome);
    const dias = sd?.diasDesdeUltimaCompra ?? null;
    // Distribui pedidos e valor por peso (indústria mais recente pesa mais).
    const peso = dias == null ? 0 : Math.max(0.15, 1 - dias / 260);
    const pedidos = i === 0 ? Math.max(1, Math.round(totalPedidos * peso * 0.6)) : Math.round(totalPedidos * peso * 0.3);
    const valor = Math.round(totalValor * peso * (i === 0 ? 0.55 : 0.35));
    const ultima = dias != null ? `há ${dias}d` : null;
    const orc = mockOrcamentos.find(o => o.lojista === cliente.nomeFantasia && o.marcas.some(m => m.toLowerCase() === nome.toLowerCase()));
    return {
      nome,
      vinculada: true,
      saude: sd?.status ?? "perdido",
      valor12m: valor,
      ultimaCompra: ultima,
      pedidos: totalPedidos === 0 ? 0 : pedidos,
      orcamentoAndamento: orc ? { id: orc.id, nome: orc.nome, valor: orc.valorTotal } : null,
      explicacao: sd?.explicacao ?? "Sem histórico",
    };
  });

  // Fantasmas: indústrias do vendedor não vinculadas ao cliente
  const fantasmas: IndustriaResumo[] = INDUSTRIAS_VENDEDOR
    .filter(n => !vinculadas.includes(n))
    .map(n => ({
      nome: n, vinculada: false, saude: "novo",
      valor12m: 0, ultimaCompra: null, pedidos: 0, orcamentoAndamento: null,
      explicacao: `Nunca comprou ${n}`,
    }));

  return [...resumo, ...fantasmas];
}

// ---------- TIMELINE (unificada) ----------
type TimelineTipo = HistoricoEvento["tipo"] | "atendimento" | "nota" | "tarefa_concluida";
interface TimelineItem {
  id: string;
  tipo: TimelineTipo;
  descricao: string;
  data: string;
  autor?: string;
  detalhes?: string;
}

function iconePorTipo(t: string) {
  if (t.startsWith("mensagem")) return MessageCircle;
  if (t.startsWith("orcamento")) return FileText;
  if (t.startsWith("oportunidade")) return Target;
  if (t.startsWith("pedido")) return ShoppingBag;
  if (t.startsWith("tarefa")) return CheckSquare;
  if (t === "reuniao_agendada") return Calendar;
  if (t === "nota" || t === "nota_adicionada") return StickyNote;
  if (t === "atendimento") return PhoneCall;
  if (t === "cadastro") return Star;
  return Star;
}
function corPorTipo(t: string) {
  if (t.startsWith("mensagem")) return "bg-green-100 text-green-700";
  if (t.startsWith("orcamento")) return "bg-indigo-100 text-indigo-700";
  if (t.startsWith("oportunidade")) return "bg-purple-100 text-purple-700";
  if (t.startsWith("pedido")) return "bg-emerald-100 text-emerald-700";
  if (t.startsWith("tarefa")) return "bg-orange-100 text-orange-700";
  if (t === "reuniao_agendada") return "bg-blue-100 text-blue-700";
  if (t === "nota" || t === "nota_adicionada") return "bg-yellow-100 text-yellow-700";
  if (t === "atendimento") return "bg-cyan-100 text-cyan-700";
  return "bg-slate-100 text-slate-700";
}

// ==============================================================================
// PÁGINA
// ==============================================================================
export default function Cliente360Page() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const cliente = mockClientes360.find(c => c.id === id) || mockClientes360[0];
  const [tab, setTab] = useState<string>("resumo");
  const [industriaFocus, setIndustriaFocus] = useState<string | null>(null);
  const [msgInput, setMsgInput] = useState("");
  const [notaInput, setNotaInput] = useState("");
  const [timelineFilter, setTimelineFilter] = useState<string>("todos");
  const [registrarOpen, setRegistrarOpen] = useState(false);
  const [showFantasmas, setShowFantasmas] = useState(false);
  const [nicho, setNicho] = useState<Nicho | null>(cliente.nicho ?? null);
  const [interesse, setInteresse] = useState(cliente.interessePrincipal ?? "");

  const overrides = useMemo(() => loadOverrides(), []);
  const saudeCompleta = useMemo(() => calcularSaude(cliente), [cliente]);
  const estagio = ESTAGIOS.find(e => e.id === estagioAtual(cliente, overrides))!;
  const industrias = useMemo(() => resumoPorIndustria(cliente, saudeCompleta), [cliente, saudeCompleta]);

  const conversa = mockConversas.find(c => c.clienteId === cliente.id);
  const mensagens = conversa ? mockMensagens[conversa.id] || [] : [];
  const oportunidades = mockOportunidades.filter(o => o.clienteNome === cliente.nomeFantasia || o.clienteId === cliente.id);
  const pedidosAll = mockPedidos.filter(p => p.clienteId === cliente.id);
  const notas = mockNotas.filter(n => n.clienteId === cliente.id);
  const historicoAll = mockHistorico.filter(h => h.clienteId === cliente.id);
  const tarefas = mockTarefas360.filter(t => t.clienteId === cliente.id);
  const orcamentosAll = mockOrcamentos.filter(o => o.lojista === cliente.nomeFantasia);
  const compromissos = mockCompromissos.filter(c => c.clienteId === cliente.id && c.status === "agendado");

  // Filtro por indústria (aplica no que for filtrable por marca)
  const filtroInd = (m?: string) => !industriaFocus || (m && m.toLowerCase() === industriaFocus.toLowerCase());
  const orcamentos = industriaFocus
    ? orcamentosAll.filter(o => o.marcas.some(m => m.toLowerCase() === industriaFocus!.toLowerCase()))
    : orcamentosAll;
  const pedidos = industriaFocus
    ? pedidosAll.filter(p => filtroInd(p.marca))
    : pedidosAll;

  const totalPedidosValor = pedidos.reduce((s, p) => s + p.valor, 0);
  const tarefasPendentes = tarefas.filter(t => t.status !== "concluida" && t.status !== "cancelada");

  // Valor 12m — total DEVE ser exatamente a soma das camadas por indústria (breakdown fonte da verdade).
  const industriasReais = industrias.filter(i => i.vinculada && i.valor12m > 0);
  const somaIndustrias = industriasReais.reduce((s, i) => s + i.valor12m, 0);
  const valorTotal12m = industriaFocus
    ? (industrias.find(i => i.nome === industriaFocus)?.valor12m ?? 0)
    : somaIndustrias;

  // Ticket médio robusto: usa freq real de pedidos ou fallback em pedidosRealizados.
  const freqPedidos = pedidos.length || cliente.pedidosRealizados;
  const ticketMedio = freqPedidos > 0 ? (totalPedidosValor || valorTotal12m) / freqPedidos : 0;

  const orcamentosAbertosValor = orcamentos
    .filter(o => o.status === "ativo" || o.status === "revisao_lojista" || o.status === "revisao_comercial")
    .reduce((s, o) => s + (o.valorTotal ?? 0), 0);

  // Camadas por indústria: reais primeiro (por valor DESC), fantasmas agrupados.
  const industriasVinculadasOrdenadas = industrias
    .filter(i => i.vinculada)
    .sort((a, b) => b.valor12m - a.valor12m);
  const industriasFantasmas = industrias.filter(i => !i.vinculada);

  // Timeline unificada
  const timeline: TimelineItem[] = useMemo(() => {
    const eventos: TimelineItem[] = [...historicoAll];
    notas.forEach(n => eventos.push({ id: `nota-${n.id}`, tipo: "nota", descricao: n.texto, data: n.data, autor: n.autor }));
    tarefas.filter(t => t.status === "concluida").forEach(t => eventos.push({
      id: `tar-${t.id}`, tipo: "tarefa_concluida",
      descricao: `Tarefa concluída: ${t.titulo}`, data: t.vencimento, autor: t.responsavel,
    }));
    return eventos.sort((a, b) => (b.data > a.data ? 1 : -1));
  }, [historicoAll, notas, tarefas]);

  const timelineFiltrada = timeline.filter(e => {
    if (timelineFilter === "todos") return true;
    if (timelineFilter === "mensagens") return e.tipo.startsWith("mensagem");
    if (timelineFilter === "negocios") return e.tipo.startsWith("oportunidade") || e.tipo.startsWith("orcamento") || e.tipo.startsWith("pedido");
    if (timelineFilter === "tarefas") return e.tipo.startsWith("tarefa") || e.tipo === "atendimento";
    if (timelineFilter === "notas") return e.tipo === "nota" || e.tipo === "nota_adicionada";
    return true;
  });

  const proxima = proximaAcaoSugerida(cliente, saudeCompleta.status, cliente.orcamentosAtivos);
  const listaVoltar = (location.state as any)?.from ?? "/vendedor/clientes";

  function abrirWhats(msg?: string) {
    if (conversa) {
      setTab("whatsapp");
    } else {
      // sem vínculo: match automático 1 clique
      if (confirm(`Vincular conversa ao WhatsApp ${cliente.whatsapp}?`)) {
        toast.success("Conversa vinculada");
        setTab("whatsapp");
      } else {
        window.open(whatsappUrl(cliente.whatsapp, msg), "_blank");
      }
    }
  }

  return (
    <TooltipProvider>
      <div className="p-4 md:p-6 max-w-[1280px] mx-auto space-y-4 pb-24 md:pb-6">
        <Breadcrumbs items={[
          { label: "Clientes", path: listaVoltar },
          { label: cliente.nomeFantasia },
        ]} />

        {/* ==================== HEADER ==================== */}
        <Card className="border border-border">
          <CardContent className="p-4 md:p-5">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
              <div className="space-y-2 min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                    <Building className="h-6 w-6 text-accent" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-lg md:text-xl font-heading font-bold text-foreground truncate">{cliente.nomeFantasia}</h1>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className={`inline-flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded-full border cursor-help ${saudeColor[saudeCompleta.status]}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${saudeDot[saudeCompleta.status]}`} />
                            {saudeLabel[saudeCompleta.status]}
                            {saudeCompleta.faltamDias != null && saudeCompleta.faltamDias <= 14 && (
                              <span className="opacity-70">· {saudeCompleta.faltamDias}d</span>
                            )}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs text-xs">{saudeCompleta.explicacao}</TooltipContent>
                      </Tooltip>
                      {estagio.nome.toLowerCase() !== saudeLabel[saudeCompleta.status].toLowerCase() && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: estagio.cor }} />
                          Estágio: <span className="text-foreground font-medium">{estagio.nome}</span>
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">{cliente.razaoSocial} · {cliente.documento}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {cliente.cidade}/{cliente.estado}</span>
                  <span className="flex items-center gap-1"><User className="h-3 w-3" /> {cliente.representante}</span>
                  <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {cliente.whatsapp}</span>
                  <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {cliente.email}</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {nicho ? (
                    <Badge variant="secondary" className="text-[10px]">{nichoLabels[nicho]}</Badge>
                  ) : (
                    <Select onValueChange={v => { setNicho(v as Nicho); toast.success("Nicho definido"); }}>
                      <SelectTrigger className="h-6 w-[130px] text-[10px] border-dashed"><SelectValue placeholder="+ definir nicho" /></SelectTrigger>
                      <SelectContent>{Object.entries(nichoLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                    </Select>
                  )}
                  {interesse ? (
                    <Badge variant="outline" className="text-[10px]">{interesse}</Badge>
                  ) : (
                    <input
                      className="text-[10px] px-2 py-0.5 rounded border border-dashed border-border bg-transparent focus:outline-none focus:border-primary"
                      placeholder="+ definir interesse"
                      onBlur={e => { if (e.target.value) { setInteresse(e.target.value); toast.success("Interesse definido"); } }}
                    />
                  )}
                  {cliente.tags.filter(t => t !== "quente" && t !== "morna" && t !== "fria").map(t => <TagBadge key={t} tag={t} />)}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                <Button size="sm" variant="outline" onClick={() => abrirWhats()}><MessageCircle className="h-4 w-4 mr-1" /> Mensagem</Button>
                <Button size="sm" variant="outline"><Target className="h-4 w-4 mr-1" /> Oportunidade</Button>
                <Button size="sm" variant="outline"><CheckSquare className="h-4 w-4 mr-1" /> Tarefa</Button>
                <Button size="sm" variant="outline"><Calendar className="h-4 w-4 mr-1" /> Agendar</Button>
                <Button size="sm" variant="outline" onClick={() => setRegistrarOpen(true)}>
                  <PhoneCall className="h-4 w-4 mr-1" /> Registrar atendimento
                </Button>
                <Button size="sm"><FileText className="h-4 w-4 mr-1" /> Orçamento</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ==================== CAMADAS POR INDÚSTRIA ==================== */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Factory className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-heading font-semibold">Camadas por indústria</h2>
              {industriaFocus && (
                <button onClick={() => setIndustriaFocus(null)} className="text-[11px] text-primary underline">
                  Visão geral
                </button>
              )}
            </div>
            <span className="text-[11px] text-muted-foreground">Clique num card para filtrar a tela</span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
            {industriasVinculadasOrdenadas.map(ind => {
              const ativo = industriaFocus === ind.nome;
              return (
                <button
                  key={ind.nome}
                  onClick={() => setIndustriaFocus(ativo ? null : ind.nome)}
                  className={`shrink-0 w-[220px] snap-start text-left p-3 rounded-xl border transition-all
                    ${ativo ? "border-primary shadow-sm bg-primary/5" : "border-border bg-card hover:border-primary/40"}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="h-7 w-7 rounded-lg bg-primary/10 grid place-items-center text-primary font-bold text-xs shrink-0">
                        {ind.nome[0]}
                      </div>
                      <span className="text-sm font-semibold truncate">{ind.nome}</span>
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className={`inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full border cursor-help ${saudeColor[ind.saude]}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${saudeDot[ind.saude]}`} />
                          {saudeLabel[ind.saude]}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="text-xs max-w-xs">{ind.explicacao}</TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between"><span className="text-muted-foreground">Valor 12m</span><span className="font-semibold">{ind.valor12m > 0 ? formatBRL(ind.valor12m) : "—"}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Última compra</span><span className="font-medium">{ind.ultimaCompra ?? "—"}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Pedidos</span><span className="font-medium">{ind.pedidos}</span></div>
                    {ind.orcamentoAndamento && (
                      <div className="mt-1.5 pt-1.5 border-t border-border/70 text-primary flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        <span className="truncate">{ind.orcamentoAndamento.nome}</span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}

            {/* Fantasmas agrupados */}
            {industriasFantasmas.length > 0 && !showFantasmas && (
              <button
                onClick={() => setShowFantasmas(true)}
                className="shrink-0 w-[180px] snap-start text-left p-3 rounded-xl border border-dashed border-border bg-muted/30 hover:border-primary/40 transition-all flex flex-col justify-center items-center gap-1"
              >
                <Sparkles className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs font-medium text-center">Expandir para outras indústrias</p>
                <p className="text-[10px] text-muted-foreground">{industriasFantasmas.length} disponíveis</p>
              </button>
            )}
            {showFantasmas && industriasFantasmas.map(ind => (
              <div key={ind.nome} className="shrink-0 w-[200px] snap-start p-3 rounded-xl border border-dashed border-border bg-card">
                <div className="flex items-center gap-2 mb-2 min-w-0">
                  <div className="h-7 w-7 rounded-lg bg-muted grid place-items-center text-muted-foreground font-bold text-xs shrink-0">
                    {ind.nome[0]}
                  </div>
                  <span className="text-sm font-semibold truncate">{ind.nome}</span>
                </div>
                <p className="text-[11px] text-muted-foreground mb-2">Nunca comprou {ind.nome}</p>
                <Button size="sm" variant="outline" className="w-full h-7 text-[10px]" onClick={() => toast.success(`Criando 1ª oportunidade em ${ind.nome}`)}>
                  <Sparkles className="h-3 w-3 mr-1" /> Criar 1ª oportunidade
                </Button>
              </div>
            ))}
            {showFantasmas && (
              <button onClick={() => setShowFantasmas(false)} className="shrink-0 text-[11px] text-primary underline self-center px-2">
                Recolher
              </button>
            )}
          </div>
        </div>

        {/* ==================== TABS ==================== */}
        <Tabs value={tab} onValueChange={setTab} className="space-y-4">
          <TabsList className="bg-muted/50 w-full justify-start overflow-x-auto flex-nowrap sticky top-0 z-10">
            <TabsTrigger value="resumo">Resumo</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
            <TabsTrigger value="negocios">Negócios</TabsTrigger>
            <TabsTrigger value="pedidos">Pedidos</TabsTrigger>
          </TabsList>

          {/* ============ RESUMO ============ */}
          <TabsContent value="resumo" className="space-y-4">
            {/* PRÓXIMA AÇÃO */}
            <Card className="border-primary/40 bg-gradient-to-r from-primary/5 to-transparent">
              <CardContent className="p-4 flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/15 grid place-items-center text-primary shrink-0">
                  <Zap className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase tracking-wide text-primary font-semibold mb-0.5">Próxima ação sugerida</p>
                  <p className="text-sm font-heading font-semibold">{proxima.titulo}</p>
                  <p className="text-[11px] text-muted-foreground">{proxima.motivo}</p>
                </div>
                <div className="shrink-0">
                  <Button
                    size="sm"
                    onClick={() => {
                      if (proxima.modo === "whatsapp") abrirWhats(`Olá ${cliente.nomeFantasia.split(" ")[0]}, tudo bem?`);
                      else if (proxima.modo === "orcamento") toast.success("Abrindo criador de orçamento");
                      else setRegistrarOpen(true);
                    }}
                  >
                    {proxima.modo === "whatsapp" && <MessageCircle className="h-4 w-4 mr-1" />}
                    {proxima.modo === "orcamento" && <FileText className="h-4 w-4 mr-1" />}
                    {proxima.modo === "registrar" && <PhoneCall className="h-4 w-4 mr-1" />}
                    {proxima.titulo}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Compromissos e Tarefas pendentes lado a lado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Card className="border border-border">
                <CardHeader className="pb-2"><CardTitle className="text-sm font-heading flex items-center gap-2"><Calendar className="h-4 w-4 text-blue-500" /> Próximos compromissos</CardTitle></CardHeader>
                <CardContent className="space-y-1.5">
                  {compromissos.length > 0 ? compromissos.slice(0, 3).map(c => (
                    <div key={c.id} className="flex items-center gap-2 p-2 rounded-lg border border-border/60 hover:bg-muted/30 text-xs">
                      <Clock className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{c.titulo}</p>
                        <p className="text-[10px] text-muted-foreground">{c.data} · {c.hora}</p>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-6">
                      <p className="text-xs text-muted-foreground mb-2">Nenhum compromisso agendado</p>
                      <Button size="sm" variant="outline"><Plus className="h-3 w-3 mr-1" /> Agendar visita</Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border border-border">
                <CardHeader className="pb-2"><CardTitle className="text-sm font-heading flex items-center gap-2"><CheckSquare className="h-4 w-4 text-orange-500" /> Tarefas pendentes</CardTitle></CardHeader>
                <CardContent className="space-y-1.5">
                  {tarefasPendentes.length > 0 ? tarefasPendentes.slice(0, 3).map(t => (
                    <div key={t.id} className={`flex items-center gap-2 p-2 rounded-lg border text-xs ${t.status === "atrasada" ? "border-red-200 bg-red-50/40" : "border-border/60"}`}>
                      <CheckSquare className={`h-3.5 w-3.5 shrink-0 ${t.status === "atrasada" ? "text-red-500" : "text-muted-foreground"}`} />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{t.titulo}</p>
                        <p className="text-[10px] text-muted-foreground">{tipoTarefaLabels[t.tipo]} · {t.vencimento}</p>
                      </div>
                      <Badge variant={t.prioridade === "alta" ? "destructive" : "secondary"} className="text-[9px] shrink-0">{t.prioridade}</Badge>
                    </div>
                  )) : (
                    <div className="text-center py-6">
                      <p className="text-xs text-muted-foreground mb-2">Nenhuma tarefa pendente</p>
                      <Button size="sm" variant="outline"><Plus className="h-3 w-3 mr-1" /> Criar tarefa</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* ÚLTIMAS MOVIMENTAÇÕES + NÚMEROS */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
              <Card className="border border-border lg:col-span-3">
                <CardHeader className="pb-2 flex-row items-center justify-between">
                  <CardTitle className="text-sm font-heading">Últimas movimentações</CardTitle>
                  <Button variant="ghost" size="sm" className="text-[11px] h-6" onClick={() => setTab("timeline")}>Ver timeline completa →</Button>
                </CardHeader>
                <CardContent>
                  {timeline.length > 0 ? (
                    <ul className="space-y-1">
                      {timeline.slice(0, 5).map(ev => {
                        const Icon = iconePorTipo(ev.tipo);
                        return (
                          <li key={ev.id} className="flex gap-2.5 items-start p-1.5 rounded hover:bg-muted/30">
                            <div className={`h-6 w-6 rounded-full grid place-items-center shrink-0 ${corPorTipo(ev.tipo)}`}>
                              <Icon className="h-3 w-3" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-medium truncate">{ev.descricao}</p>
                              <p className="text-[10px] text-muted-foreground">{ev.data}{ev.autor ? ` · ${ev.autor}` : ""}</p>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-xs text-muted-foreground mb-2">Nenhum evento registrado</p>
                      <Button size="sm" variant="outline" onClick={() => setRegistrarOpen(true)}>
                        <Plus className="h-3 w-3 mr-1" /> Registrar 1º atendimento
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border border-border lg:col-span-2">
                <CardHeader className="pb-2"><CardTitle className="text-sm font-heading flex items-center gap-2"><TrendingUp className="h-4 w-4 text-emerald-500" /> Números</CardTitle></CardHeader>
                <CardContent>
                  {cliente.pedidosRealizados === 0 ? (
                    <div className="text-center py-6 space-y-2">
                      <p className="text-sm font-medium">Cliente novo · sem histórico ainda</p>
                      <p className="text-[11px] text-muted-foreground">Assim que houver um pedido, o valor 12m, ticket médio e frequência aparecem aqui.</p>
                      <Button size="sm" variant="outline"><FileText className="h-3 w-3 mr-1" /> Montar cesta no catálogo</Button>
                    </div>
                  ) : (
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center pb-1.5 border-b border-border">
                        <span className="text-muted-foreground">Valor 12m {industriaFocus ? `· ${industriaFocus}` : "(total)"}</span>
                        <span className="text-lg font-heading font-bold text-emerald-600">{valorTotal12m > 0 ? formatBRL(valorTotal12m) : "—"}</span>
                      </div>
                      {!industriaFocus && industrias.filter(i => i.vinculada && i.valor12m > 0).map(i => (
                        <div key={i.nome} className="flex justify-between text-[11px] pl-2">
                          <span className="text-muted-foreground">↳ {i.nome}</span>
                          <span className="font-medium">{formatBRL(i.valor12m)}</span>
                        </div>
                      ))}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
                        <div>
                          <p className="text-[10px] text-muted-foreground">Ticket médio</p>
                          <p className="font-semibold">{ticketMedio > 0 ? formatBRL(ticketMedio) : "—"}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground">Frequência</p>
                          <p className="font-semibold">{pedidos.length} pedidos</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground">Orçamentos em aberto</p>
                          <p className="font-semibold">{orcamentosAbertosValor > 0 ? formatBRL(orcamentosAbertosValor) : "—"}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground">Origem</p>
                          <p className="font-semibold truncate">{cliente.origem}</p>
                        </div>
                      </div>
                      <div className="pt-1.5 border-t border-border flex justify-between text-[10px] text-muted-foreground">
                        <span>Cadastro</span><span className="font-medium text-foreground">{cliente.dataCadastro}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ============ TIMELINE ============ */}
          <TabsContent value="timeline" className="space-y-3">
            {/* Composer */}
            <Card className="border border-border">
              <CardContent className="p-3 space-y-2">
                <Textarea
                  placeholder="Adicionar nota rápida sobre este cliente..."
                  value={notaInput}
                  onChange={e => setNotaInput(e.target.value)}
                  className="min-h-[60px] text-sm"
                />
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="outline" onClick={() => setRegistrarOpen(true)}>
                    <PhoneCall className="h-3.5 w-3.5 mr-1" /> Registrar atendimento
                  </Button>
                  <Button size="sm" onClick={() => { if (notaInput) { toast.success("Nota adicionada"); setNotaInput(""); } }}>
                    <StickyNote className="h-3.5 w-3.5 mr-1" /> Adicionar nota
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Filtros */}
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { id: "todos", label: "Tudo" },
                { id: "mensagens", label: "Mensagens" },
                { id: "negocios", label: "Negócios" },
                { id: "tarefas", label: "Tarefas & atendimento" },
                { id: "notas", label: "Notas" },
              ].map(c => (
                <button key={c.id} onClick={() => setTimelineFilter(c.id)}
                  className={`text-xs px-3 py-1 rounded-full border transition-colors ${timelineFilter === c.id ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:bg-muted"}`}>
                  {c.label}
                </button>
              ))}
            </div>

            {/* Feed */}
            <Card className="border border-border">
              <CardContent className="p-4">
                {timelineFiltrada.length > 0 ? (
                  <ol className="space-y-0">
                    {timelineFiltrada.map((ev, i) => {
                      const Icon = iconePorTipo(ev.tipo);
                      return (
                        <li key={ev.id} className="flex gap-3 items-start">
                          <div className="flex flex-col items-center shrink-0">
                            <div className={`h-8 w-8 rounded-full grid place-items-center ${corPorTipo(ev.tipo)}`}>
                              <Icon className="h-3.5 w-3.5" />
                            </div>
                            {i < timelineFiltrada.length - 1 && <div className="w-px flex-1 bg-border mt-1 min-h-[16px]" />}
                          </div>
                          <details className="pb-4 min-w-0 flex-1 group">
                            <summary className="cursor-pointer list-none">
                              <p className="text-sm font-medium truncate group-open:whitespace-normal">{ev.descricao}</p>
                              <p className="text-[10px] text-muted-foreground">{ev.data}{ev.autor ? ` · ${ev.autor}` : ""}</p>
                            </summary>
                            {ev.detalhes && (
                              <p className="text-xs text-muted-foreground italic bg-muted/50 px-2 py-1 rounded mt-2">{ev.detalhes}</p>
                            )}
                          </details>
                        </li>
                      );
                    })}
                  </ol>
                ) : (
                  <div className="text-center py-10 text-muted-foreground text-sm">Nenhum evento neste filtro</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ============ WHATSAPP ============ */}
          <TabsContent value="whatsapp">
            <div className="border border-border rounded-lg overflow-hidden h-[560px] flex flex-col">
              <div className="h-14 border-b border-border flex items-center px-4 gap-3 bg-card shrink-0">
                <div className="h-9 w-9 rounded-full bg-green-100 grid place-items-center">
                  <MessageCircle className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{cliente.nomeFantasia}</p>
                  <p className="text-[10px] text-muted-foreground">{conversa?.online ? "Online" : cliente.whatsapp}</p>
                </div>
                {!conversa && (
                  <Button size="sm" variant="outline" onClick={() => toast.success("Conversa vinculada pelo telefone")}>
                    Vincular conversa
                  </Button>
                )}
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/20">
                {mensagens.length === 0 ? (
                  <div className="grid place-items-center h-full text-center space-y-3">
                    <MessageCircle className="h-10 w-10 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">Nenhuma conversa com este cliente</p>
                    <Button size="sm" variant="outline" onClick={() => window.open(whatsappUrl(cliente.whatsapp, "Olá!"), "_blank")}>
                      Iniciar no WhatsApp Web
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-center"><span className="text-[10px] text-muted-foreground bg-muted px-3 py-1 rounded-full">{mensagens[0]?.data}</span></div>
                    {mensagens.map(m => (
                      <div key={m.id} className={`flex ${m.remetente === "vendedor" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[70%] px-3 py-2 rounded-xl text-sm ${
                          m.remetente === "vendedor" ? "bg-accent text-accent-foreground rounded-br-sm" : "bg-card border border-border rounded-bl-sm"
                        }`}>
                          <p>{m.texto}</p>
                          <p className={`text-[10px] mt-1 text-right ${m.remetente === "vendedor" ? "text-accent-foreground/70" : "text-muted-foreground"}`}>{m.horario}</p>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
              <div className="h-14 border-t border-border flex items-center gap-2 px-3 bg-card shrink-0">
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0"><Paperclip className="h-4 w-4" /></Button>
                <Input placeholder="Digite uma mensagem..." value={msgInput} onChange={e => setMsgInput(e.target.value)} className="h-9 flex-1" />
                <Button size="icon" className="h-8 w-8 shrink-0" onClick={() => { if (msgInput) { toast.success("Mensagem enviada"); setMsgInput(""); } }}><Send className="h-4 w-4" /></Button>
              </div>
            </div>
          </TabsContent>

          {/* ============ NEGÓCIOS (Oport + Orçamentos) ============ */}
          <TabsContent value="negocios" className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {oportunidades.length} oportunidade(s) · {orcamentosAll.length} orçamento(s)
                {industriaFocus && <span className="text-primary"> · filtrado por {industriaFocus}</span>}
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline"><Plus className="h-4 w-4 mr-1" /> Nova oportunidade</Button>
                <Button size="sm"><FileText className="h-4 w-4 mr-1" /> Novo orçamento</Button>
              </div>
            </div>

            {oportunidades.length === 0 && orcamentosAll.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-border rounded-lg space-y-3">
                <Target className="h-10 w-10 mx-auto text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">Nenhum negócio em aberto</p>
                <Button size="sm" variant="outline"><Plus className="h-4 w-4 mr-1" /> Criar primeira oportunidade</Button>
              </div>
            ) : (
              <div className="space-y-3">
                {oportunidades.map(op => {
                  const orcs = orcamentosAll.filter(o => o.oportunidadeId === op.id);
                  return (
                    <div key={op.id} className="border border-border rounded-lg overflow-hidden">
                      <div className="p-3 flex items-center justify-between bg-muted/30 hover:bg-muted/50 cursor-pointer" onClick={() => navigate(`/vendedor/oportunidades/${op.id}`)}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-purple-500 shrink-0" />
                            <p className="text-sm font-medium truncate">{op.nome}</p>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: etapaCorMap[op.etapa] }} />
                            <span>{etapaMap[op.etapa]}</span>
                            <span>·</span><span>{op.probabilidade}% prob.</span>
                            {op.tags.slice(0, 2).map(t => <TagBadge key={t} tag={t} />)}
                          </div>
                        </div>
                        <div className="text-right ml-3 shrink-0">
                          <p className="text-sm font-semibold">R$ {op.valorEstimado.toLocaleString("pt-BR")}</p>
                          <p className="text-[10px] text-muted-foreground">{orcs.length} orç.</p>
                        </div>
                      </div>
                      {orcs.length > 0 && (
                        <div className="divide-y divide-border">
                          {orcs.map(o => (
                            <div key={o.id} className="flex items-center justify-between px-3 py-2 pl-9 text-xs hover:bg-muted/20">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{o.nome}</p>
                                <p className="text-[10px] text-muted-foreground">{o.dataCriacao}{o.marcas.length ? ` · ${o.marcas.join(", ")}` : ""}</p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                {o.valorTotal != null && <span className="font-semibold">R$ {o.valorTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>}
                                <Badge variant="secondary" className="capitalize text-[9px]">{o.status.replace(/_/g, " ")}</Badge>
                                <Button variant="ghost" size="sm" onClick={() => navigate(`/vendedor/orcamento/${o.id}`)}>
                                  <Eye className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
                {/* Orçamentos sem oportunidade */}
                {orcamentos.filter(o => !o.oportunidadeId).map(o => (
                  <div key={o.id} className="border border-dashed border-border rounded-lg p-3 flex items-center justify-between hover:bg-muted/20">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <FileText className="h-4 w-4 text-indigo-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{o.nome}</p>
                        <p className="text-[10px] text-muted-foreground">{o.dataCriacao} · sem oportunidade vinculada</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {o.valorTotal != null && <span className="text-sm font-semibold">R$ {o.valorTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>}
                      <Badge variant="secondary" className="capitalize text-[9px]">{o.status.replace(/_/g, " ")}</Badge>
                      <Button variant="outline" size="sm" onClick={() => navigate(`/vendedor/orcamento/${o.id}`)}>
                        <Eye className="h-3 w-3 mr-1" /> Abrir
                      </Button>
                      <Button variant="ghost" size="sm"><Copy className="h-3 w-3" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ============ PEDIDOS ============ */}
          <TabsContent value="pedidos" className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                {pedidos.length} pedidos · Faturamento: <span className="font-semibold text-foreground">R$ {totalPedidosValor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                {industriaFocus && <span className="text-primary"> · {industriaFocus}</span>}
              </p>
              <button onClick={() => navigate(`/vendedor/360/pedidos?cliente=${cliente.id}`)} className="text-xs text-primary hover:underline font-medium shrink-0">
                Ver no Hub de Pedidos →
              </button>
            </div>
            {pedidos.length > 0 ? (
              <div className="space-y-2">
                {pedidos.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{p.numero}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>{p.data}</span>
                        <span>{p.origem}</span>
                        {p.marca && <Badge variant="outline" className="text-[9px]">{p.marca}</Badge>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm font-semibold">R$ {p.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border capitalize ${pedidoStatusColors[p.status]}`}>{p.status.replace(/_/g, " ")}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 border border-dashed border-border rounded-lg space-y-3">
                <Package className="h-10 w-10 mx-auto text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">Nenhum pedido registrado</p>
                <Button size="sm" variant="outline"><FileText className="h-4 w-4 mr-1" /> Montar cesta no catálogo</Button>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* ==================== BOTTOM BAR MOBILE ==================== */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border p-2 flex gap-2 z-20">
          <Button size="sm" variant="outline" className="flex-1" onClick={() => abrirWhats()}><MessageCircle className="h-4 w-4" /></Button>
          <a href={`tel:${cliente.telefone.replace(/\D/g, "")}`} className="flex-1"><Button size="sm" variant="outline" className="w-full"><Phone className="h-4 w-4" /></Button></a>
          <Button size="sm" variant="outline" className="flex-1" onClick={() => setRegistrarOpen(true)}><PhoneCall className="h-4 w-4" /></Button>
          <Button size="sm" className="flex-1"><FileText className="h-4 w-4" /></Button>
        </div>
      </div>

      {/* ==================== MODAL REGISTRAR ATENDIMENTO ==================== */}
      <RegistrarAtendimentoModal
        open={registrarOpen}
        onOpenChange={setRegistrarOpen}
        clienteNome={cliente.nomeFantasia}
      />
    </TooltipProvider>
  );
}

// ==============================================================================
// MODAL REGISTRAR ATENDIMENTO — 2 campos (resultado + próximo passo)
// ==============================================================================
function RegistrarAtendimentoModal({
  open, onOpenChange, clienteNome,
}: { open: boolean; onOpenChange: (v: boolean) => void; clienteNome: string }) {
  const [resultado, setResultado] = useState("");
  const [proximoPasso, setProximoPasso] = useState("");
  const [prazoDias, setPrazoDias] = useState("3");
  const [semProximoPasso, setSemProximoPasso] = useState(false);

  function salvar() {
    if (!resultado.trim()) { toast.error("Descreva o resultado do atendimento"); return; }
    if (!semProximoPasso && !proximoPasso.trim()) {
      if (!confirm("Registrar sem próximo passo? Recomendado agendar follow-up.")) return;
    }
    toast.success(`Atendimento com ${clienteNome} registrado${!semProximoPasso && proximoPasso ? ` · follow-up em ${prazoDias}d` : ""}`);
    setResultado(""); setProximoPasso(""); setPrazoDias("3"); setSemProximoPasso(false);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-heading">
            <PhoneCall className="h-4 w-4 text-primary" /> Registrar atendimento
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium mb-1 block">Resultado</label>
            <Textarea value={resultado} onChange={e => setResultado(e.target.value)} placeholder="Ex.: Falamos por 10min, mostrou interesse na coleção inverno..." className="min-h-[80px] text-sm" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium">Próximo passo</label>
              <button onClick={() => setSemProximoPasso(!semProximoPasso)} className="text-[10px] text-muted-foreground hover:text-foreground">
                {semProximoPasso ? "adicionar próximo passo" : "sem próximo passo"}
              </button>
            </div>
            {!semProximoPasso && (
              <>
                <Input value={proximoPasso} onChange={e => setProximoPasso(e.target.value)} placeholder="Ex.: Enviar catálogo por WhatsApp" className="text-sm mb-2" />
                <Select value={prazoDias} onValueChange={setPrazoDias}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Amanhã</SelectItem>
                    <SelectItem value="3">Em 3 dias</SelectItem>
                    <SelectItem value="7">Em 1 semana</SelectItem>
                    <SelectItem value="14">Em 2 semanas</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={salvar}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
