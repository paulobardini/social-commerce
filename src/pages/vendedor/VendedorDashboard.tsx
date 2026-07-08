import { useMemo, useState, useRef, useEffect } from "react";
import { useCockpit } from "@/cockpit/contexts/CockpitContext";
import { CockpitTopbar } from "@/cockpit/components/CockpitTopbar";
import { SaudeCarteiraBar } from "@/cockpit/components/SaudeCarteiraBar";
import { SectionCard } from "@/cockpit/components/SectionCard";
import { KpiCard } from "@/cockpit/components/KpiCard";
import { AgingBars } from "@/cockpit/components/AgingBars";
import { Gauge } from "@/cockpit/components/Gauge";
import { ProgressBar } from "@/cockpit/components/ProgressBar";
import { FunnelChart } from "@/cockpit/components/FunnelChart";
import { EmptyState } from "@/cockpit/components/EmptyState";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { kpisCarteira, kpisMetas } from "@/cockpit/lib/kpis";
import { classificarTudo } from "@/cockpit/lib/classificar";
import { agingCarteira } from "@/cockpit/lib/aging";
import { filaAcaoVendedor, type FilaItem } from "@/cockpit/lib/fila";
import { funilOportunidades, oportunidadesEstagnadas, ETAPAS_FUNIL, ETAPA_LABEL, cicloDiasMedio, winRateGlobal } from "@/cockpit/lib/funis";
import { serieMensal } from "@/cockpit/lib/series";
import { STATUS_COLORS, fmtBRL, fmtBRLc, fmtNum, fmtPct, fmtDias, NX } from "@/cockpit/styles/tokens";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip as ReTooltip, CartesianGrid, ReferenceLine } from "recharts";
import { AlertTriangle, Flame, MessageCircle, ChevronDown, ChevronRight, Phone, ArrowRight, Search, CheckCircle2, Target, TrendingUp, Activity, Info, Sparkles, Calendar as CalIcon, Plus, FileText, Clock } from "lucide-react";
import { toast } from "sonner";
import { useVendedorPerfil, podeRedistribuir } from "@/hooks/useVendedorPerfil";
import { useTarefas, type TarefaExt } from "@/contexts/TarefasContext";
import { ResponderPlanoModal } from "@/components/vendedor/ResponderPlanoModal";
import { usePlanos } from "@/contexts/PlanosContext";
import type { Oportunidade } from "@/cockpit/data/seed";

// ============ HELPERS ============
function busDaysUntil(target: Date, hoje: Date) {
  let count = 0;
  const d = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const end = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  while (d <= end) {
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) count++;
    d.setDate(d.getDate() + 1);
  }
  return count;
}
function busDaysInMonth(hoje: Date) {
  const first = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const last = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
  let count = 0;
  const d = new Date(first);
  while (d <= last) {
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) count++;
    d.setDate(d.getDate() + 1);
  }
  return count;
}

// KPI helper: hide delta when zero or when comparar off
function deltaProp(pct: number, comparar: boolean, invert?: boolean) {
  if (!comparar) return undefined;
  if (Math.abs(pct) < 0.05) return undefined;
  return { pct, invert };
}

export default function VendedorDashboard() {
  const ctx = useCockpit();
  const { seed, range, previousRange, diasAtivo, diasPerdido, repId, comparar } = ctx;
  const perfil = useVendedorPerfil();
  const permiteImpersonar = podeRedistribuir(perfil);

  const [tab, setTab] = useState<"hoje" | "carteira" | "metas" | "funil">("hoje");
  const [carteiraFiltroInicial, setCarteiraFiltroInicial] = useState<string>("todos");
  const listaRef = useRef<HTMLDivElement>(null);

  const repIdEfetivo = repId === "todos" ? seed.representantes[0].id : repId;
  const cfg = { diasAtivo, diasPerdido, repId: repIdEfetivo };

  const kpiC = useMemo(() => kpisCarteira(seed, range, previousRange, cfg), [seed, range, previousRange, cfg]);
  const kpiM = useMemo(() => kpisMetas(seed, range, previousRange, cfg), [seed, range, previousRange, cfg]);

  const fila = useMemo(() => filaAcaoVendedor(seed, repIdEfetivo, diasAtivo, diasPerdido), [seed, repIdEfetivo, diasAtivo, diasPerdido]);
  const aging = useMemo(() => agingCarteira(kpiC.classificadas), [kpiC]);

  const opsRep = useMemo(() => seed.oportunidades.filter(o => o.repId === repIdEfetivo), [seed, repIdEfetivo]);
  const funOp = useMemo(() => funilOportunidades(opsRep), [opsRep]);
  const funCoorte = useMemo(() => taxasCoorte(opsRep), [opsRep]);
  const opsEst = useMemo(() => oportunidadesEstagnadas(opsRep, 7, seed.hoje), [opsRep, seed]);
  const cicloRep = cicloDiasMedio(opsRep, seed.hoje);
  const winRep = winRateGlobal(opsRep);
  const pipelineRep = opsRep.filter(o => ETAPAS_FUNIL.includes(o.etapa)).reduce((s, o) => s + o.valor, 0);

  const hist6m = useMemo(() => {
    const pedidos = seed.pedidos.filter(p => p.repId === repIdEfetivo);
    return serieMensal(6, pedidos, seed.hoje);
  }, [seed, repIdEfetivo]);
  const metaHistorico = kpiM.metaFaturamento;

  const irParaCarteiraStatus = (status: string) => {
    setTab("carteira");
    setCarteiraFiltroInicial(status);
    setTimeout(() => listaRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
  };

  return (
    <div className="nx-shell min-h-screen">
      <CockpitTopbar
        title="Painel comercial · Vendedor"
        showRep={permiteImpersonar}
        showPeriod={tab !== "hoje"}
      />
      <div className="px-4 md:px-6 py-4 space-y-4">
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="space-y-4">
          <div className="sticky top-[52px] md:top-[56px] z-10 -mx-4 md:mx-0 px-4 md:px-0 py-2 bg-[#F6F7F9] overflow-x-auto md:overflow-visible">
            <TabsList className="bg-white border border-[#E7E9EE] p-1 h-auto inline-flex w-max md:w-auto">
              <TabsTrigger value="hoje" className="text-xs data-[state=active]:bg-[#2D3A8C] data-[state=active]:text-white whitespace-nowrap">Hoje · Fila de ação</TabsTrigger>
              <TabsTrigger value="carteira" className="text-xs data-[state=active]:bg-[#2D3A8C] data-[state=active]:text-white whitespace-nowrap">Minha carteira</TabsTrigger>
              <TabsTrigger value="metas" className="text-xs data-[state=active]:bg-[#2D3A8C] data-[state=active]:text-white whitespace-nowrap">Minhas metas</TabsTrigger>
              <TabsTrigger value="funil" className="text-xs data-[state=active]:bg-[#2D3A8C] data-[state=active]:text-white whitespace-nowrap">Meu funil</TabsTrigger>
            </TabsList>
          </div>

          {/* HOJE */}
          <TabsContent value="hoje" className="mt-0">
            <FilaAcao fila={fila} seed={seed} repId={repIdEfetivo} opsRep={opsRep} />
          </TabsContent>

          {/* MINHA CARTEIRA */}
          <TabsContent value="carteira" className="space-y-4 mt-0">
            <AlertaSemAtendimento
              repId={repIdEfetivo}
              onVerClientes={() => irParaCarteiraStatus("inativo")}
            />
            <SaudeCarteiraBar filtroRepId={repIdEfetivo} />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <KpiCard label="Ativos" value={fmtNum(kpiC.ativos.atual)} delta={deltaProp(kpiC.ativos.delta, comparar)} />
              <KpiCard label="Inativos" value={fmtNum(kpiC.inativos.atual)} delta={deltaProp(kpiC.inativos.delta, comparar, true)} />
              <KpiCard label="Perdidos" value={fmtNum(kpiC.perdidos.atual)} delta={deltaProp(kpiC.perdidos.delta, comparar, true)} />
              <KpiCard label="Positivados" value={fmtNum(kpiC.positivados.atual)} delta={deltaProp(kpiC.positivados.delta, comparar)} />
              <KpiCard label="Novos" value={fmtNum(kpiC.novos.atual)} delta={deltaProp(kpiC.novos.delta, comparar)} />
              <KpiCard label="Reativados" value={fmtNum(kpiC.reativados.atual)} delta={deltaProp(kpiC.reativados.delta, comparar)} />
            </div>
            <SectionCard title="Aging da carteira" subtitle="Distribuição por tempo desde a última compra">
              <AgingBars data={aging} />
            </SectionCard>
            <div ref={listaRef}>
              <ListaClientes classificadas={kpiC.classificadas} initialStatus={carteiraFiltroInicial} />
            </div>
          </TabsContent>

          {/* METAS */}
          <TabsContent value="metas" className="space-y-4 mt-0">
            <MetasView kpiM={kpiM} hist6m={hist6m} metaRef={metaHistorico} kpiC={kpiC} />
          </TabsContent>

          {/* FUNIL */}
          <TabsContent value="funil" className="space-y-4 mt-0">
            <TooltipProvider>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <KpiWithTip
                  label="Pipeline R$"
                  value={fmtBRLc(pipelineRep)}
                  icon={<TrendingUp className="h-3.5 w-3.5" />}
                  tip="Soma do valor de todas as oportunidades abertas (novo lead → orçamento aprovado)."
                />
                <KpiWithTip
                  label="Ciclo médio"
                  value={fmtDias(cicloRep)}
                  icon={<Activity className="h-3.5 w-3.5" />}
                  tip="Média de dias entre a abertura da oportunidade e o fechamento (Ganha)."
                />
                <KpiWithTip
                  label="Win rate"
                  value={fmtPct(winRep)}
                  icon={<Target className="h-3.5 w-3.5" />}
                  tip="Ganhas ÷ (Ganhas + Perdidas). Considera apenas oportunidades já fechadas."
                />
              </div>
            </TooltipProvider>
            <SectionCard title="Meu funil de oportunidades" subtitle="Conversão calculada por coorte — % da etapa anterior que avançou">
              <FunnelChart
                etapas={funOp.counts.map(c => ({ etapa: c.etapa, valor: c.valor, receita: c.receita }))}
                taxas={funCoorte}
                money
              />
            </SectionCard>
            <SectionCard title="Minhas oportunidades estagnadas" subtitle="Sem movimento há 7+ dias">
              {opsEst.length === 0 ? <EmptyState message="Nenhuma oportunidade estagnada — bom trabalho!" /> :
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {opsEst.map(o => {
                    const cliente = seed.contas.find(c => c.id === o.contaId);
                    const cta = ctaPorEtapa(o.etapa);
                    return (
                      <div key={o.id} className="flex items-center justify-between bg-[#F6F7F9] rounded-lg p-3 gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold nx-text truncate">{cliente?.razao}</p>
                          <p className="text-[11px] nx-muted">{ETAPA_LABEL[o.etapa]} · {fmtBRLc(o.valor)}</p>
                        </div>
                        <Badge className="bg-rose-100 text-rose-700 shrink-0">{o.diasParada}d parada</Badge>
                        <Button size="sm" variant="outline" className="text-[11px] h-7 shrink-0" onClick={() => toast.success(cta.toast)}>
                          {cta.icon}{cta.label}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              }
            </SectionCard>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ============ COORTE / FUNIL HELPERS ============
function taxasCoorte(ops: Oportunidade[]): (number | null)[] {
  // Aproxima coorte com estados atuais: reached(i) = ops atualmente em etapa >= i, ou ganhas.
  const reachedAt = (i: number) => {
    const etapasAlem = ETAPAS_FUNIL.slice(i);
    return ops.filter(o => etapasAlem.includes(o.etapa) || o.etapa === "ganha").length;
  };
  return ETAPAS_FUNIL.map((_, i) => {
    if (i === 0) return null;
    const denom = reachedAt(i - 1);
    const num = reachedAt(i);
    if (denom < 5) return null;
    return Math.min(100, (num / denom) * 100);
  });
}

function ctaPorEtapa(etapa: Oportunidade["etapa"]) {
  switch (etapa) {
    case "proposta_enviada":
    case "orcamento_aprovado":
      return { label: "Cobrar no Whats", icon: <MessageCircle className="h-3 w-3 mr-1" />, toast: "Conversa aberta com mensagem sugerida" };
    case "em_negociacao":
      return { label: "Agendar contato", icon: <CalIcon className="h-3 w-3 mr-1" />, toast: "Tarefa de agendamento criada" };
    case "novo_lead":
      return { label: "Fazer primeiro contato", icon: <Phone className="h-3 w-3 mr-1" />, toast: "Contato inicial em andamento" };
    default:
      return { label: "Avançar etapa", icon: <ArrowRight className="h-3 w-3 mr-1" />, toast: "Etapa avançada" };
  }
}

function KpiWithTip({ label, value, icon, tip }: { label: string; value: string; icon: React.ReactNode; tip: string }) {
  return (
    <div className="relative">
      <KpiCard label={label} value={value} icon={icon} />
      <Tooltip>
        <TooltipTrigger asChild>
          <button className="absolute top-2 right-2 h-5 w-5 rounded-full bg-white border border-[#E7E9EE] flex items-center justify-center nx-muted hover:nx-text">
            <Info className="h-3 w-3" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[240px] text-xs">{tip}</TooltipContent>
      </Tooltip>
    </div>
  );
}

// ============ FILA UNIFICADA DE AÇÕES ============
// Ancora "hoje" nas datas do mock de tarefas para que os buckets fiquem ricos no demo.
const HOJE_ANCHOR = new Date(2026, 3, 14); // 14/04/2026
const HOJE_ANCHOR_BR = "14/04/2026";

type Grupo = "agendado" | "urgente" | "sugerido";
type Origem = "tarefa" | "tarefa_vencida" | "alerta_inativo" | "alerta_orcamento" | "alerta_cobertura" | "alerta_esfriando";

interface ItemUnificado {
  key: string;
  grupo: Grupo;
  origem: Origem;
  tarefaId?: string;
  contaId?: string;
  oportunidadeId?: string;
  cliente: string;
  inicial: string;
  motivo: string;
  hora?: string;
  metaLinha?: string;
  saudeBadge?: { label: string; classe: string };
  chipUrgencia?: { label: string; classe: string };
  temOrcamento?: boolean;
  planoId?: string;
  solicitadoPor?: string;
  ordem: number;
}

function parseBR(s: string): Date | null {
  const m = s?.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
}
function formatBRDate(d: Date) {
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}
function diasEntre(a: Date, b: Date) {
  return Math.floor((a.getTime() - b.getTime()) / 86400000);
}

function chipParaDiasRest(dias: number) {
  if (dias <= 2) return { label: `Faltam ${dias}d`, classe: "bg-rose-500 text-white" };
  if (dias <= 9) return { label: `Faltam ${dias}d`, classe: "bg-amber-500 text-white" };
  return { label: `Faltam ${dias}d`, classe: "bg-yellow-400 text-yellow-950" };
}

type FiltroFila = "todos" | "agendado" | "urgente" | "sugerido";

function FilaAcao({ fila, seed, repId, opsRep }: {
  fila: ReturnType<typeof filaAcaoVendedor>;
  seed: ReturnType<typeof useCockpit>["seed"];
  repId: string;
  opsRep: Oportunidade[];
}) {
  const { tarefas, addTarefa, toggleConcluida } = useTarefas();
  const { planos } = usePlanos();
  const [openReg, setOpenReg] = useState<{ item: ItemUnificado } | null>(null);
  const [planoResponderId, setPlanoResponderId] = useState<string | null>(null);
  const [openQuick, setOpenQuick] = useState(false);
  const [filtro, setFiltro] = useState<FiltroFila>("todos");
  const [dismissedAlerta, setDismissedAlerta] = useState<Set<string>>(new Set());
  const [contadorReg, setContadorReg] = useState(0);

  const conta = (id?: string) => id ? seed.contas.find(c => c.id === id) : undefined;

  const ultimaCompra = (contaId?: string): string | undefined => {
    if (!contaId) return undefined;
    const p = seed.pedidos.filter(x => x.contaId === contaId).sort((a, b) => b.data.getTime() - a.data.getTime())[0];
    return p ? formatBRDate(p.data) : undefined;
  };

  const buildMeta = (contaId?: string) => {
    const c = conta(contaId);
    if (!c) return undefined;
    const parts: string[] = [];
    const uc = ultimaCompra(contaId);
    if (uc) parts.push(`última compra ${uc}`);
    const p12 = seed.pedidos.filter(x => x.contaId === contaId).reduce((s, x) => s + x.valor, 0);
    if (p12 > 0) parts.push(`${fmtBRLc(p12)} (12m)`);
    if (c.nicho) parts.push(c.nicho);
    return parts.join(" · ");
  };

  const saudeBadge = (contaId?: string): ItemUnificado["saudeBadge"] => {
    const c = conta(contaId);
    if (!c?.nicho) return undefined;
    return { label: c.nicho, classe: "bg-slate-100 text-slate-600" };
  };

  const itens = useMemo<ItemUnificado[]>(() => {
    const lista: ItemUnificado[] = [];

    // ===== AGENDADO PARA HOJE =====
    // tarefas do usuário logado (Paulo Bardini como mock) com vencimento === hoje anchor
    const tarefasHoje = tarefas.filter(t =>
      t.status === "pendente" && t.vencimento === HOJE_ANCHOR_BR
    );
    tarefasHoje
      .sort((a, b) => (a.hora ?? "99").localeCompare(b.hora ?? "99"))
      .forEach((t, idx) => {
        lista.push({
          key: `tar-${t.id}`,
          grupo: t.planoId ? "urgente" : "agendado",
          origem: "tarefa",
          tarefaId: t.id,
          contaId: t.clienteId,
          oportunidadeId: t.oportunidadeId,
          cliente: t.clienteNome || (t.planoId ? "Plano do gestor" : "Cliente"),
          inicial: (t.clienteNome || "G").slice(0, 1).toUpperCase(),
          motivo: `${t.titulo}${t.hora ? ` · ${t.hora}` : ""}`,
          hora: t.hora,
          metaLinha: t.oportunidadeNome ? `Oport.: ${t.oportunidadeNome}` : t.descricao,
          temOrcamento: !!t.oportunidadeId,
          planoId: t.planoId,
          solicitadoPor: t.solicitadoPor,
          chipUrgencia: t.planoId ? { label: "Solicitado pelo gestor", classe: "bg-purple-600 text-white" } : undefined,
          ordem: t.planoId ? -1 : idx,
        });
      });

    // ===== URGENTE =====
    // 1) Tarefas vencidas
    const tarefasVencidas = tarefas.filter(t => {
      if (t.status !== "pendente") return false;
      const d = parseBR(t.vencimento);
      return d ? d < HOJE_ANCHOR : false;
    });
    tarefasVencidas.forEach(t => {
      const d = parseBR(t.vencimento)!;
      const atraso = diasEntre(HOJE_ANCHOR, d);
      lista.push({
        key: `tarv-${t.id}`,
        grupo: "urgente",
        origem: "tarefa_vencida",
        tarefaId: t.id,
        contaId: t.clienteId,
        oportunidadeId: t.oportunidadeId,
        cliente: t.clienteNome || (t.planoId ? "Plano do gestor" : "Cliente"),
        inicial: (t.clienteNome || "G").slice(0, 1).toUpperCase(),
        motivo: `${t.titulo} · vencida há ${atraso}d`,
        metaLinha: t.oportunidadeNome ? `Oport.: ${t.oportunidadeNome}` : t.descricao,
        chipUrgencia: t.planoId
          ? { label: `Solicitado pelo gestor · ${atraso}d`, classe: "bg-purple-700 text-white" }
          : { label: `Vencida ${atraso}d`, classe: "bg-rose-600 text-white" },
        temOrcamento: !!t.oportunidadeId,
        planoId: t.planoId,
        solicitadoPor: t.solicitadoPor,
        ordem: 1000 + atraso,
      });
    });

    // 2) Inativos prestes a virar perdidos
    fila.inativosEmRisco.forEach(i => {
      const key = `ini-${i.contaId}`;
      if (dismissedAlerta.has(key)) return;
      lista.push({
        key,
        grupo: "urgente",
        origem: "alerta_inativo",
        contaId: i.contaId,
        cliente: i.razao,
        inicial: i.razao.slice(0, 1).toUpperCase(),
        motivo: i.diasRestantes !== undefined
          ? `Faltam ${i.diasRestantes}d para virar Perdido · ${i.motivo.toLowerCase()}`
          : i.motivo,
        metaLinha: buildMeta(i.contaId),
        saudeBadge: saudeBadge(i.contaId),
        chipUrgencia: i.diasRestantes !== undefined ? chipParaDiasRest(i.diasRestantes) : undefined,
        ordem: 500 + (i.diasRestantes ?? 0),
      });
    });

    // 3) Orçamentos aguardando (proposta_enviada / orcamento_aprovado parados > 3 dias)
    const orcParados = opsRep
      .filter(o => (o.etapa === "proposta_enviada" || o.etapa === "orcamento_aprovado"))
      .map(o => ({ o, dias: diasEntre(HOJE_ANCHOR, o.ultimaMov) }))
      .filter(x => x.dias > 3);
    orcParados.forEach(({ o, dias }) => {
      const key = `orc-${o.id}`;
      if (dismissedAlerta.has(key)) return;
      const c = seed.contas.find(x => x.id === o.contaId);
      lista.push({
        key,
        grupo: "urgente",
        origem: "alerta_orcamento",
        contaId: o.contaId,
        oportunidadeId: o.id,
        cliente: c?.razao ?? "Cliente",
        inicial: (c?.razao ?? "?").slice(0, 1).toUpperCase(),
        motivo: `Orçamento ${fmtBRLc(o.valor)} parado há ${dias} dias`,
        metaLinha: buildMeta(o.contaId),
        saudeBadge: saudeBadge(o.contaId),
        chipUrgencia: { label: `${dias}d parado`, classe: "bg-orange-500 text-white" },
        temOrcamento: true,
        ordem: 2000 - dias,
      });
    });

    // ===== SUGERIDO =====
    // 1) Ativos sem cobertura no período
    fila.ativosSemCobertura.forEach(i => {
      const key = `cob-${i.contaId}`;
      if (dismissedAlerta.has(key)) return;
      lista.push({
        key,
        grupo: "sugerido",
        origem: "alerta_cobertura",
        contaId: i.contaId,
        cliente: i.razao,
        inicial: i.razao.slice(0, 1).toUpperCase(),
        motivo: i.motivo.replace("Sem contato", "Sem atendimento"),
        metaLinha: buildMeta(i.contaId),
        saudeBadge: saudeBadge(i.contaId),
        ordem: -(i.valor ?? 0),
      });
    });

    // 2) Oportunidades esfriando (novo_lead / em_negociacao paradas)
    const esfriando = opsRep
      .filter(o => (o.etapa === "novo_lead" || o.etapa === "em_negociacao"))
      .map(o => ({ o, dias: diasEntre(HOJE_ANCHOR, o.ultimaMov) }))
      .filter(x => x.dias >= 5);
    esfriando.forEach(({ o, dias }) => {
      const key = `esf-${o.id}`;
      if (dismissedAlerta.has(key)) return;
      const c = seed.contas.find(x => x.id === o.contaId);
      lista.push({
        key,
        grupo: "sugerido",
        origem: "alerta_esfriando",
        contaId: o.contaId,
        oportunidadeId: o.id,
        cliente: c?.razao ?? "Cliente",
        inicial: (c?.razao ?? "?").slice(0, 1).toUpperCase(),
        motivo: `${ETAPA_LABEL[o.etapa]} sem movimento há ${dias} dias · ${fmtBRLc(o.valor)}`,
        metaLinha: buildMeta(o.contaId),
        saudeBadge: saudeBadge(o.contaId),
        ordem: -(o.valor),
      });
    });

    return lista;
  }, [tarefas, fila, opsRep, seed, dismissedAlerta]);

  const agendado = itens.filter(i => i.grupo === "agendado").sort((a, b) => a.ordem - b.ordem);
  const urgente = itens.filter(i => i.grupo === "urgente").sort((a, b) => a.ordem - b.ordem);
  const sugerido = itens.filter(i => i.grupo === "sugerido").sort((a, b) => a.ordem - b.ordem);
  const total = agendado.length + urgente.length + sugerido.length;

  // totais iniciais para mensagem de progresso quando o grupo fica vazio
  const [iniciais] = useState({ agendado: 0, urgente: 0, sugerido: 0 });
  if (iniciais.agendado === 0 && agendado.length > 0) iniciais.agendado = agendado.length;
  if (iniciais.urgente === 0 && urgente.length > 0) iniciais.urgente = urgente.length;
  if (iniciais.sugerido === 0 && sugerido.length > 0) iniciais.sugerido = sugerido.length;

  const mostrar = (g: Grupo) => filtro === "todos" || filtro === g;

  const registrarAcao = (item: ItemUnificado) => {
    if (item.planoId) { setPlanoResponderId(item.planoId); return; }
    setOpenReg({ item });
  };

  const concluirItem = (item: ItemUnificado, proximaData?: string, nota?: string) => {
    if (item.tarefaId) {
      toggleConcluida(item.tarefaId);
    } else {
      setDismissedAlerta(prev => new Set(prev).add(item.key));
    }
    // Cria tarefa de follow-up se informado
    if (proximaData) {
      const [y, m, d] = proximaData.split("-");
      const venc = `${d}/${m}/${y}`;
      addTarefa({
        titulo: `Follow-up · ${item.cliente}`,
        descricao: nota || "Follow-up gerado a partir do painel do vendedor",
        tipo: "follow_up",
        clienteId: item.contaId,
        clienteNome: item.cliente,
        oportunidadeId: item.oportunidadeId,
        prioridade: "media",
        vencimento: venc,
        responsavel: "Paulo Bardini",
        status: "pendente",
      });
    }
    setContadorReg(c => c + 1);
  };

  if (total === 0 && contadorReg === 0) {
    return <FilaZerada seed={seed} repId={repId} atendidos={contadorReg} onNova={() => setOpenQuick(true)} openQuick={openQuick} setOpenQuick={setOpenQuick} />;
  }

  return (
    <div className="space-y-4">
      {/* Barra compacta de indicadores do dia — topo (mobile) */}
      <div className="grid grid-cols-3 gap-2 md:hidden">
        <IndicadorMini label="Atendidos hoje" value={String(4 + contadorReg)} sub="meta: 8" />
        <IndicadorMini label="Positivados" value="2" sub="meta: 5" />
        <IndicadorMini label="Meta do dia" value="50%" sub="R$ 8,5k/17k" />
      </div>

      {/* Banner-resumo com chips filtráveis + botão + Ação */}
      <div className="rounded-xl p-5 text-white shadow-sm" style={{ background: "linear-gradient(135deg, #2D3A8C 0%, #363BB4 100%)" }}>
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-lg font-semibold">Você tem {total} {total === 1 ? "ação" : "ações"} hoje</h2>
            <p className="text-xs opacity-80 mt-1">Tarefas suas e alertas do sistema, na mesma fila. Clique nos chips para filtrar.</p>
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <ChipFiltro ativo={filtro === "todos"} onClick={() => setFiltro("todos")} color="white" label={`Todos ${total}`} />
            <ChipFiltro ativo={filtro === "agendado"} onClick={() => setFiltro("agendado")} color="sky" label={`${agendado.length} agendadas`} />
            <ChipFiltro ativo={filtro === "urgente"} onClick={() => setFiltro("urgente")} color="rose" label={`${urgente.length} urgentes`} />
            <ChipFiltro ativo={filtro === "sugerido"} onClick={() => setFiltro("sugerido")} color="amber" label={`${sugerido.length} sugeridas`} />
            <Button size="sm" onClick={() => setOpenQuick(true)} className="h-8 bg-white text-[#2D3A8C] hover:bg-white/90 ml-1">
              <Plus className="h-3.5 w-3.5 mr-1" /> Ação
            </Button>
          </div>
        </div>
      </div>

      {mostrar("agendado") && (
        <BlocoFila
          grupo="agendado"
          titulo="Agendado para hoje"
          descricao="Tarefas com vencimento hoje — o que você planejou"
          accent="sky"
          icon={<Clock className="h-4 w-4" />}
          itens={agendado}
          totalInicial={iniciais.agendado}
          onAcao={registrarAcao}
        />
      )}
      {mostrar("urgente") && (
        <BlocoFila
          grupo="urgente"
          titulo="Urgente"
          descricao="Tarefas vencidas + risco de churn + orçamentos parados"
          accent="rose"
          icon={<AlertTriangle className="h-4 w-4" />}
          itens={urgente}
          totalInicial={iniciais.urgente}
          onAcao={registrarAcao}
        />
      )}
      {mostrar("sugerido") && (
        <BlocoFila
          grupo="sugerido"
          titulo="Sugerido"
          descricao="Sem cobertura, oportunidades esfriando e candidatos a reativação"
          accent="amber"
          icon={<Flame className="h-4 w-4" />}
          itens={sugerido}
          totalInicial={iniciais.sugerido}
          onAcao={registrarAcao}
        />
      )}

      {/* Rodapé desktop */}
      <div className="hidden md:grid nx-card sticky bottom-2 p-3 grid-cols-3 gap-3">
        <KpiCard label="Atendimentos feitos hoje" value={String(4 + contadorReg)} hint="meta diária: 8" />
        <KpiCard label="Positivados hoje" value="2" hint="meta diária: 5" />
        <div className="nx-card-soft p-3">
          <p className="text-[10px] uppercase tracking-wide nx-muted font-medium mb-1.5">Meta do dia</p>
          <ProgressBar value={50} color="#2D3A8C" suffix="50%" />
          <p className="text-[10px] nx-muted mt-1.5 nx-num">R$ 8.500 / R$ 17.000</p>
        </div>
      </div>

      <RegistrarModal
        open={!!openReg}
        item={openReg?.item}
        onClose={() => setOpenReg(null)}
        onSaved={(item, proxData, nota) => { concluirItem(item, proxData, nota); setOpenReg(null); }}
      />
      <QuickAcaoModal
        open={openQuick}
        onClose={() => setOpenQuick(false)}
        seed={seed}
        repId={repId}
        onCriar={(t) => { addTarefa(t); toast.success("Ação criada"); }}
      />
      <ResponderPlanoModal
        plano={planoResponderId ? planos.find(p => p.id === planoResponderId) ?? null : null}
        open={!!planoResponderId}
        onOpenChange={(b) => { if (!b) setPlanoResponderId(null); }}
      />
    </div>
  );
}

function FilaZerada({ seed, repId, atendidos, onNova, openQuick, setOpenQuick }: {
  seed: ReturnType<typeof useCockpit>["seed"];
  repId: string;
  atendidos: number;
  onNova: () => void;
  openQuick: boolean;
  setOpenQuick: (b: boolean) => void;
}) {
  const { addTarefa } = useTarefas();
  const sugestoes = useMemo(() => {
    const contas = seed.contas.filter(c => c.repId === repId);
    const ultMap = new Map<string, Date>();
    seed.pedidos.filter(p => p.repId === repId).forEach(p => {
      const cur = ultMap.get(p.contaId);
      if (!cur || p.data > cur) ultMap.set(p.contaId, p.data);
    });
    const hoje = seed.hoje;
    return contas
      .map(c => {
        const ult = ultMap.get(c.id);
        const dias = ult ? Math.floor((hoje.getTime() - ult.getTime()) / 86400000) : Infinity;
        return { c, dias };
      })
      .filter(x => x.dias >= 60 && x.dias !== Infinity)
      .sort((a, b) => a.dias - b.dias)
      .slice(0, 5);
  }, [seed, repId]);

  return (
    <div className="space-y-4">
      <div className="rounded-xl p-8 text-center bg-gradient-to-br from-emerald-50 to-white border border-emerald-200">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white mb-3">
          <Sparkles className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-bold text-emerald-900">Fila zerada 🎉</h2>
        <p className="text-sm text-emerald-800/80 mt-1">
          {atendidos > 0 ? `Você concluiu ${atendidos} ${atendidos > 1 ? "ações" : "ação"} agora. ` : ""}
          Tudo em dia por aqui.
        </p>
        <Button size="sm" onClick={onNova} className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white">
          <Plus className="h-3.5 w-3.5 mr-1" /> Criar ação
        </Button>
      </div>
      {sugestoes.length > 0 && (
        <SectionCard title={`${sugestoes.length} clientes não compram há 60+ dias`} subtitle="Quer adiantar contato enquanto está livre?">
          <div className="space-y-2">
            {sugestoes.map(s => (
              <div key={s.c.id} className="flex items-center justify-between bg-[#F6F7F9] rounded-lg p-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold nx-text truncate">{s.c.razao}</p>
                  <p className="text-[11px] nx-muted">{s.c.cidade}/{s.c.uf} · {s.dias}d sem comprar</p>
                </div>
                <div className="flex gap-1.5">
                  <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => toast.success("Abrindo WhatsApp")}>
                    <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => toast.success("Discando…")}>
                    <Phone className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}
      <QuickAcaoModal
        open={openQuick}
        onClose={() => setOpenQuick(false)}
        seed={seed}
        repId={repId}
        onCriar={(t) => { addTarefa(t); toast.success("Ação criada"); }}
      />
    </div>
  );
}

function IndicadorMini({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="bg-white border border-[#E7E9EE] rounded-lg p-2 text-center">
      <p className="text-[9px] uppercase tracking-wide nx-muted font-medium leading-tight">{label}</p>
      <p className="text-base font-bold nx-num nx-text leading-tight">{value}</p>
      <p className="text-[9px] nx-muted nx-num">{sub}</p>
    </div>
  );
}

function ChipFiltro({ ativo, onClick, color, label }: { ativo: boolean; onClick: () => void; color: "rose" | "amber" | "sky" | "white"; label: string }) {
  const base = "text-[11px] px-2.5 py-1 rounded-full border transition cursor-pointer";
  const inactive = {
    rose: "bg-rose-500/20 text-rose-50 border-rose-300/30 hover:bg-rose-500/30",
    amber: "bg-amber-500/20 text-amber-50 border-amber-300/30 hover:bg-amber-500/30",
    sky: "bg-sky-500/20 text-sky-50 border-sky-300/30 hover:bg-sky-500/30",
    white: "bg-white/15 text-white border-white/20 hover:bg-white/25",
  }[color];
  const active = "bg-white text-[#2D3A8C] border-white font-semibold shadow";
  return <button onClick={onClick} className={`${base} ${ativo ? active : inactive}`}>{label}</button>;
}

// ===== Bloco por grupo =====
function BlocoFila({ grupo, titulo, descricao, accent, icon, itens, totalInicial, onAcao }: {
  grupo: Grupo;
  titulo: string; descricao: string; accent: "sky" | "rose" | "amber"; icon: React.ReactNode;
  itens: ItemUnificado[]; totalInicial: number; onAcao: (item: ItemUnificado) => void;
}) {
  const [open, setOpen] = useState(true);
  const [verTodos, setVerTodos] = useState(false);
  const accentMap = {
    sky:   { bar: "bg-sky-500",   bg: "bg-sky-50",   text: "text-sky-800",   border: "border-sky-200" },
    rose:  { bar: "bg-rose-500",  bg: "bg-rose-50",  text: "text-rose-700",  border: "border-rose-200" },
    amber: { bar: "bg-amber-500", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  }[accent];

  const visiveis = verTodos ? itens : itens.slice(0, 5);
  const restantes = itens.length - visiveis.length;
  const grupoConcluido = itens.length === 0 && totalInicial > 0;

  if (grupoConcluido) {
    return (
      <div className={`nx-card overflow-hidden border ${accentMap.border} ${accentMap.bg}`}>
        <div className="flex items-center gap-3 px-4 py-3">
          <div className={`h-7 w-7 rounded-md ${accentMap.bar} text-white flex items-center justify-center`}>
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <p className={`text-sm font-semibold ${accentMap.text}`}>{titulo} · {totalInicial}/{totalInicial} ✓</p>
            <p className="text-[11px] nx-muted">Grupo concluído — bom trabalho!</p>
          </div>
        </div>
      </div>
    );
  }

  if (itens.length === 0) return null;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="nx-card overflow-hidden">
        <CollapsibleTrigger className="w-full">
          <div className={`flex items-center gap-3 px-4 py-3 ${accentMap.bg} border-b ${accentMap.border}`}>
            <div className={`h-7 w-7 rounded-md ${accentMap.bar} text-white flex items-center justify-center`}>{icon}</div>
            <div className="flex-1 text-left">
              <p className={`text-sm font-semibold ${accentMap.text} uppercase tracking-wide text-[11px]`}>{titulo}</p>
              <p className="text-[11px] nx-muted">{descricao}</p>
            </div>
            {totalInicial > 0 && itens.length < totalInicial && (
              <span className="text-[10px] nx-muted mr-1">{totalInicial - itens.length}/{totalInicial} concluídas</span>
            )}
            <Badge className={`${accentMap.bar} text-white`}>{itens.length}</Badge>
            {open ? <ChevronDown className="h-4 w-4 nx-muted" /> : <ChevronRight className="h-4 w-4 nx-muted" />}
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="divide-y divide-[#F1F3F8]">
            {visiveis.map(item => (
              <FilaItemRow key={item.key} item={item} onAcao={onAcao} />
            ))}
          </div>
          {restantes > 0 && (
            <button
              onClick={() => setVerTodos(true)}
              className={`w-full py-2.5 text-xs font-medium ${accentMap.text} hover:${accentMap.bg} border-t ${accentMap.border} transition`}
            >
              Ver todos ({restantes} restantes)
            </button>
          )}
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

// ===== Item unificado =====
function FilaItemRow({ item, onAcao }: { item: ItemUnificado; onAcao: (item: ItemUnificado) => void }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3 hover:bg-[#F6F7F9] animate-in fade-in slide-in-from-left-1 duration-200">
      <div className="h-9 w-9 rounded-full bg-[#E8EAF6] text-[#2D3A8C] flex items-center justify-center text-sm font-semibold shrink-0 mt-0.5">
        {item.inicial}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium nx-text truncate">{item.cliente}</p>
          {item.saudeBadge && <Badge className={`${item.saudeBadge.classe} border-0 text-[10px]`}>{item.saudeBadge.label}</Badge>}
          {item.chipUrgencia && <Badge className={item.chipUrgencia.classe}>{item.chipUrgencia.label}</Badge>}
        </div>
        <p className="text-[12px] nx-text font-medium mt-0.5 leading-snug">
          {item.motivo}
        </p>
        {item.metaLinha && <p className="text-[11px] nx-muted mt-0.5 truncate">{item.metaLinha}</p>}
      </div>
      <div className="flex gap-1 shrink-0 flex-wrap justify-end">
        <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => toast.success("Abrindo WhatsApp")} title="WhatsApp">
          <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
        </Button>
        <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => toast.success("Discando…")} title="Ligar">
          <Phone className="h-3.5 w-3.5" />
        </Button>
        {item.temOrcamento && (
          <Button size="sm" variant="outline" className="h-8 px-2 text-[11px]" onClick={() => toast.success("Abrindo orçamento")} title="Abrir orçamento">
            <FileText className="h-3.5 w-3.5 mr-1" /> Orçamento
          </Button>
        )}
        <Button size="sm" className="h-8 px-2.5 text-[11px] bg-[#2D3A8C] hover:bg-[#363BB4]" onClick={() => onAcao(item)}>
          Registrar
        </Button>
      </div>
    </div>
  );
}

// ===== Modal Registrar (papel central) =====
function RegistrarModal({ open, item, onClose, onSaved }: {
  open: boolean; item?: ItemUnificado; onClose: () => void;
  onSaved: (item: ItemUnificado, proxData?: string, nota?: string) => void;
}) {
  const [resultado, setResultado] = useState("falou");
  const [proxData, setProxData] = useState("");
  const [nota, setNota] = useState("");
  const [confirmarSemFollow, setConfirmarSemFollow] = useState(false);

  const reset = () => { setResultado("falou"); setProxData(""); setNota(""); setConfirmarSemFollow(false); };

  const salvar = () => {
    if (!item) return;
    if (!proxData && !confirmarSemFollow) { setConfirmarSemFollow(true); return; }
    toast.success(proxData
      ? `Atendimento registrado · tarefa criada para ${new Date(proxData).toLocaleDateString("pt-BR")}`
      : "Atendimento registrado sem follow-up");
    onSaved(item, proxData || undefined, nota || undefined);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { onClose(); reset(); } }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar atendimento</DialogTitle>
          {item && <p className="text-xs nx-muted">{item.cliente}</p>}
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-[11px] nx-muted mb-1 block">Resultado</label>
            <Select value={resultado} onValueChange={setResultado}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="falou">Falou</SelectItem>
                <SelectItem value="sem_resposta">Sem resposta</SelectItem>
                <SelectItem value="pediu_orcamento">Pediu orçamento</SelectItem>
                <SelectItem value="sem_interesse">Sem interesse</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-[11px] nx-muted mb-1 block">Próximo passo (cria tarefa no dia escolhido)</label>
            <div className="space-y-2">
              <Input type="date" value={proxData} onChange={(e) => { setProxData(e.target.value); setConfirmarSemFollow(false); }} className="h-9 text-xs" />
              <Textarea value={nota} onChange={(e) => setNota(e.target.value)} rows={2} placeholder="Nota rápida…" className="text-xs" />
            </div>
          </div>
          {confirmarSemFollow && !proxData && (
            <div className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
              Nenhum follow-up definido. Clique em Salvar novamente para confirmar.
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => { onClose(); reset(); }}>Cancelar</Button>
          <Button onClick={salvar} style={{ background: "#2D3A8C" }}>
            {confirmarSemFollow && !proxData ? "Confirmar sem follow-up" : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ===== Modal + Ação rápido =====
function QuickAcaoModal({ open, onClose, seed, repId, onCriar }: {
  open: boolean; onClose: () => void;
  seed: ReturnType<typeof useCockpit>["seed"];
  repId: string;
  onCriar: (t: Omit<TarefaExt, "id">) => void;
}) {
  const [cliente, setCliente] = useState("");
  const [oQue, setOQue] = useState("");
  const [quando, setQuando] = useState("");

  const contasRep = useMemo(() => seed.contas.filter(c => c.repId === repId).slice(0, 200), [seed, repId]);

  const reset = () => { setCliente(""); setOQue(""); setQuando(""); };

  const criar = () => {
    if (!cliente || !oQue || !quando) { toast.error("Preencha cliente, o quê e quando"); return; }
    const [y, m, d] = quando.split("-");
    const venc = `${d}/${m}/${y}`;
    const c = contasRep.find(x => x.id === cliente);
    onCriar({
      titulo: oQue,
      descricao: "",
      tipo: "follow_up",
      clienteId: cliente,
      clienteNome: c?.razao ?? "Cliente",
      prioridade: "media",
      vencimento: venc,
      responsavel: "Paulo Bardini",
      status: "pendente",
    });
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { onClose(); reset(); } }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nova ação rápida</DialogTitle>
          <p className="text-xs nx-muted">Cliente + o quê + quando</p>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-[11px] nx-muted mb-1 block">Cliente</label>
            <Select value={cliente} onValueChange={setCliente}>
              <SelectTrigger><SelectValue placeholder="Selecione…" /></SelectTrigger>
              <SelectContent className="max-h-[280px]">
                {contasRep.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.razao}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-[11px] nx-muted mb-1 block">O quê</label>
            <Input value={oQue} onChange={(e) => setOQue(e.target.value)} placeholder="Ex.: Ligar para apresentar coleção" className="h-9 text-xs" />
          </div>
          <div>
            <label className="text-[11px] nx-muted mb-1 block">Quando</label>
            <Input type="date" value={quando} onChange={(e) => setQuando(e.target.value)} className="h-9 text-xs" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => { onClose(); reset(); }}>Cancelar</Button>
          <Button onClick={criar} style={{ background: "#2D3A8C" }}>Criar ação</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


// ============ METAS ============
function MetasView({ kpiM, hist6m, metaRef, kpiC }: {
  kpiM: ReturnType<typeof kpisMetas>;
  hist6m: { data: string; valor: number }[];
  metaRef: number;
  kpiC: ReturnType<typeof kpisCarteira>;
}) {
  const { seed } = useCockpit();
  const hoje = seed.hoje;
  const diasUteisCorridos = busDaysUntil(hoje, hoje);
  const diasUteisMes = busDaysInMonth(hoje);
  const diasUteisRest = Math.max(1, diasUteisMes - diasUteisCorridos);

  const paceValor = diasUteisCorridos > 0
    ? (kpiM.realizado / diasUteisCorridos) * diasUteisMes
    : 0;
  const paceAtingimento = kpiM.metaFaturamento > 0 ? (paceValor / kpiM.metaFaturamento) * 100 : 0;
  const rsPorDiaUtil = diasUteisRest > 0 ? kpiM.gap / diasUteisRest : kpiM.gap;

  let veredito: { texto: string; cor: string } = { texto: "", cor: "" };
  if (paceAtingimento >= 100) {
    veredito = { texto: "No ritmo para bater a meta ✅", cor: "text-emerald-700 bg-emerald-50 border-emerald-200" };
  } else if (paceAtingimento >= 85) {
    veredito = { texto: `Quase lá — você precisa de ${fmtBRLc(rsPorDiaUtil)} por dia útil ⚠️`, cor: "text-amber-800 bg-amber-50 border-amber-200" };
  } else {
    veredito = { texto: `Ritmo abaixo do necessário — você precisa de ${fmtBRLc(rsPorDiaUtil)} por dia útil ⛔`, cor: "text-rose-800 bg-rose-50 border-rose-200" };
  }

  // Metas secundárias com unidades que faltam (mock proporcional aos totais reais do rep)
  const totalAtivos = kpiC.ativos.atual;
  const metaPos = Math.max(1, Math.round(totalAtivos * 0.6));
  const posAtual = kpiC.positivados.atual;
  const posPct = metaPos > 0 ? Math.min(100, (posAtual / metaPos) * 100) : 0;
  const posFalta = Math.max(0, metaPos - posAtual);

  const metaCob = Math.max(1, Math.round(totalAtivos * 0.7));
  const cobAtual = Math.round(totalAtivos * 0.48);
  const cobPct = metaCob > 0 ? Math.min(100, (cobAtual / metaCob) * 100) : 0;
  const cobFalta = Math.max(0, metaCob - cobAtual);

  const metaNovos = 12;
  const novosAtual = kpiC.novos.atual;
  const novosPct = Math.min(100, (novosAtual / metaNovos) * 100);
  const novosFalta = Math.max(0, metaNovos - novosAtual);

  const metaReat = 8;
  const reatAtual = kpiC.reativados.atual;
  const reatPct = Math.min(100, (reatAtual / metaReat) * 100);
  const reatFalta = Math.max(0, metaReat - reatAtual);

  return (
    <>
      <PreviaProximoMes />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionCard className="lg:col-span-1" title="Minha meta de faturamento" subtitle={`Meta ${fmtBRL(kpiM.metaFaturamento)}`}>
          <Gauge value={kpiM.atingimento} label="Atingimento" size={220} />
          <p className="text-center text-[11px] nx-muted mt-2">Realizado <span className="font-semibold nx-num nx-text">{fmtBRL(kpiM.realizado)}</span></p>
          <div className={`mt-3 rounded-lg border px-3 py-2 text-xs font-medium text-center ${veredito.cor}`}>
            {veredito.texto}
          </div>
        </SectionCard>
        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-3 content-start">
          <KpiCard label="Pace projetado" value={fmtPct(paceAtingimento, 0)} hint={fmtBRLc(paceValor)} />
          <KpiCard label="Quanto falta" value={fmtBRLc(kpiM.gap)} hint="para meta" />
          <KpiCard label="Dias úteis restantes" value={fmtNum(diasUteisRest)} hint={`${diasUteisCorridos}/${diasUteisMes} corridos`} />
          <KpiCard label="R$/dia útil necessário" value={fmtBRLc(rsPorDiaUtil)} />
          <KpiCard label="Positivação" value={fmtPct(posPct, 0)} hint={posFalta > 0 ? `faltam ${posFalta} clientes` : "meta batida"} />
          <KpiCard label="Cobertura" value={fmtPct(cobPct, 0)} hint={cobFalta > 0 ? `faltam ${cobFalta} clientes` : "meta batida"} />
          <KpiCard label="Novos" value={fmtPct(novosPct, 0)} hint={novosFalta > 0 ? `faltam ${novosFalta} clientes` : "meta batida"} />
          <KpiCard label="Reativação" value={fmtPct(reatPct, 0)} hint={reatFalta > 0 ? `faltam ${reatFalta} clientes` : "meta batida"} />
        </div>
      </div>

      <MetasPorDimensao />

      <SectionCard title="Meu histórico" subtitle="Faturamento últimos 6 meses · linha tracejada = meta mensal">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={hist6m}>
            <CartesianGrid stroke="#F1F3F8" vertical={false} />
            <XAxis dataKey="data" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={fmtBRLc} />
            <ReTooltip formatter={(v: number) => fmtBRL(v)} contentStyle={{ background: "#fff", border: "1px solid #E7E9EE", borderRadius: 8, fontSize: 12 }} />
            {metaRef > 0 && <ReferenceLine y={metaRef} stroke={NX.accent} strokeDasharray="4 4" label={{ value: "Meta", fill: NX.accent, fontSize: 10, position: "right" }} />}
            <Bar dataKey="valor" fill={NX.primary} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </SectionCard>
    </>
  );
}

// ============ METAS POR DIMENSÃO (vendedor) ============
// Cards das metas dimensionais publicadas que atingem o rep atual.
// Fonte única: metasV2 (rascunhos NUNCA aparecem para o vendedor).
function MetasPorDimensao() {
  const { seed, escopo, metasV2, repId } = useCockpit();
  const repIdReal = repId === "todos" ? seed.representantes[0]?.id : repId;
  if (!repIdReal) return null;
  const mesAtual = `${seed.hoje.getFullYear()}-${String(seed.hoje.getMonth() + 1).padStart(2, "0")}`;

  const metas = metasV2.filter(m =>
    m.periodo === mesAtual
    && m.status === "publicada"
    && m.escopo === escopo
    && m.dimensao !== "geral"
    && (!m.rateio || m.rateio.some(r => r.repId === repIdReal && r.valor > 0)),
  );

  if (metas.length === 0) return null;

  return (
    <SectionCard title="Metas por dimensão" subtitle="Marca · Coleção · Nicho — mesmas metas do gestor, sua parcela">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {metas.map(m => {
          const alvo = m.rateio?.find(r => r.repId === repIdReal)?.valor ?? m.valorAgregado;
          const [y, mn] = m.periodo.split("-").map(Number);
          const inicio = new Date(y, mn - 1, 1);
          const fim = new Date(y, mn, 1);

          let pedidosFiltrados = seed.pedidos.filter(p => p.repId === repIdReal && p.data >= inicio && p.data < fim);
          if (m.dimensao === "marca") {
            const marca = seed.marcas.find(x => x.nome === m.alvoId);
            if (marca) pedidosFiltrados = pedidosFiltrados.filter(p => p.marcaId === marca.id);
            else pedidosFiltrados = [];
          }
          if (m.dimensao === "colecao") pedidosFiltrados = pedidosFiltrados.filter(p => p.colecao === m.alvoId);
          if (m.dimensao === "nicho") {
            const contasNicho = new Set(seed.contas.filter(c => c.nicho === m.alvoId).map(c => c.id));
            pedidosFiltrados = pedidosFiltrados.filter(p => contasNicho.has(p.contaId));
          }
          const realizado = pedidosFiltrados.reduce((s, p) => s + p.valor, 0);
          const pct = alvo > 0 ? (realizado / alvo) * 100 : 0;

          // Veredito por ritmo diário útil
          const decorridos = Math.max(1, busDaysUntil(seed.hoje, seed.hoje));
          const totalUteis = Math.max(1, busDaysInMonth(seed.hoje));
          const restantes = Math.max(1, totalUteis - decorridos);
          const paceProj = (realizado / decorridos) * totalUteis;
          const pctProj = alvo > 0 ? (paceProj / alvo) * 100 : 0;
          const gap = Math.max(0, alvo - realizado);
          const rsDia = gap / restantes;

          const cor = pctProj >= 100 ? "bg-emerald-500" : pctProj >= 85 ? "bg-amber-500" : "bg-rose-500";
          const corTexto = pctProj >= 100 ? "text-emerald-700 bg-emerald-50 border-emerald-200"
            : pctProj >= 85 ? "text-amber-800 bg-amber-50 border-amber-200"
              : "text-rose-800 bg-rose-50 border-rose-200";
          const dimBadge = m.dimensao === "marca"
            ? "bg-sky-100 text-sky-800 border-sky-300"
            : m.dimensao === "colecao"
              ? "bg-violet-100 text-violet-800 border-violet-300"
              : "bg-amber-100 text-amber-800 border-amber-300";
          const dimLabel = m.dimensao === "marca" ? "Marca" : m.dimensao === "colecao" ? "Coleção" : "Nicho";

          return (
            <div key={m.id} className="nx-card p-3 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className={`text-[10px] ${dimBadge}`}>{dimLabel}</Badge>
                <span className="text-sm font-semibold nx-text">{m.alvoId}</span>
                <span className="text-[11px] nx-muted ml-auto nx-num">{fmtBRLc(realizado)} / {fmtBRLc(alvo)}</span>
              </div>
              <div className="h-2 rounded-full bg-[#F1F3F8] overflow-hidden">
                <div className={`h-full ${cor}`} style={{ width: `${Math.min(100, pct)}%` }} />
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="nx-muted">Realizado {Math.round(pct)}%</span>
                <span className="font-medium nx-text">Pace {Math.round(pctProj)}%</span>
              </div>
              <div className={`text-[11px] px-2 py-1.5 rounded border ${corTexto}`}>
                {pctProj >= 100 ? "No ritmo para bater a meta" : `Precisa de ${fmtBRLc(rsDia)}/dia útil`}
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}

// ============ PRÉVIA DO PRÓXIMO MÊS (publicada apenas) ============
// Rascunhos são invisíveis ao vendedor por regra. Só mostra se já publicou.
function PreviaProximoMes() {
  const { seed, escopo, metasV2, repId } = useCockpit();
  const repIdReal = repId === "todos" ? seed.representantes[0]?.id : repId;
  const [aberto, setAberto] = useState(false);
  if (!repIdReal) return null;
  const proxD = new Date(seed.hoje.getFullYear(), seed.hoje.getMonth() + 1, 1);
  const proxMes = `${proxD.getFullYear()}-${String(proxD.getMonth() + 1).padStart(2, "0")}`;
  const mesAtual = `${seed.hoje.getFullYear()}-${String(seed.hoje.getMonth() + 1).padStart(2, "0")}`;

  const proxGeral = metasV2.find(m => m.periodo === proxMes && m.dimensao === "geral" && m.escopo === escopo && m.status === "publicada");
  if (!proxGeral) return null;
  const parcela = proxGeral.rateio?.find(r => r.repId === repIdReal)?.valor ?? 0;
  if (parcela === 0) return null;
  const parcelaAtual = metasV2.find(m => m.periodo === mesAtual && m.dimensao === "geral" && m.escopo === escopo)?.rateio?.find(r => r.repId === repIdReal)?.valor ?? 0;
  const delta = parcelaAtual > 0 ? Math.round(((parcela - parcelaAtual) / parcelaAtual) * 100) : null;
  const meses = ["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];
  const label = `${meses[proxD.getMonth()]} ${proxD.getFullYear()}`;

  return (
    <Collapsible open={aberto} onOpenChange={setAberto}>
      <div className="nx-card px-3 py-2 flex items-center gap-2 text-xs bg-[#EEF2FF] border-[#C7D2FE]">
        <Sparkles className="h-3.5 w-3.5 text-[#2D3A8C]" />
        <span className="nx-text">
          Meta de <strong>{label}</strong> já publicada: <strong className="nx-num">{fmtBRL(parcela)}</strong>
          {delta !== null && <span className={`ml-1 ${delta > 0 ? "text-emerald-700" : delta < 0 ? "text-rose-700" : "nx-muted"}`}>({delta > 0 ? "+" : ""}{delta}%)</span>}
        </span>
        <CollapsibleTrigger className="ml-auto text-[11px] text-[#2D3A8C] hover:underline">
          {aberto ? "Ocultar" : "Ver detalhes"}
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent>
        <div className="nx-card px-3 py-2 mt-1 text-[11px] nx-muted">
          Planejamento antecipado do gestor. Você começa a ser cobrado por essa meta no dia 1 do próximo mês.
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}


// ============ LISTA DE CLIENTES ============
function ListaClientes({ classificadas, initialStatus }: { classificadas: ReturnType<typeof classificarTudo>; initialStatus?: string }) {
  const [busca, setBusca] = useState("");
  const [statusF, setStatusF] = useState<string>(initialStatus ?? "todos");

  useEffect(() => {
    if (initialStatus) setStatusF(initialStatus);
  }, [initialStatus]);

  const filtradas = useMemo(() => {
    return classificadas.filter(c => {
      if (busca && !c.conta.razao.toLowerCase().includes(busca.toLowerCase())) return false;
      if (statusF !== "todos" && c.status !== statusF) return false;
      return true;
    }).sort((a, b) => b.valor12m - a.valor12m);
  }, [classificadas, busca, statusF]);

  return (
    <SectionCard title="Meus clientes" subtitle={`${filtradas.length} resultados`}>
      <div className="flex gap-2 mb-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 nx-muted" />
          <Input placeholder="Buscar cliente..." value={busca} onChange={(e) => setBusca(e.target.value)} className="pl-8 h-9 text-xs" />
        </div>
        <Select value={statusF} onValueChange={setStatusF}>
          <SelectTrigger className="w-[150px] h-9 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="ativo">Ativos</SelectItem>
            <SelectItem value="inativo">Inativos</SelectItem>
            <SelectItem value="perdido">Perdidos</SelectItem>
            <SelectItem value="lead">Leads</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
        <table className="w-full text-xs">
          <thead className="text-[10px] uppercase nx-muted border-b border-[#E7E9EE] sticky top-0 bg-white">
            <tr><th className="text-left py-2">Cliente</th><th className="text-left">Status</th><th className="text-right">Recência</th><th className="text-right">Valor 12m</th><th className="text-right">Pedidos 12m</th></tr>
          </thead>
          <tbody>
            {filtradas.length === 0 && <tr><td colSpan={5} className="py-6 text-center nx-muted">Nenhum cliente encontrado para os filtros.</td></tr>}
            {filtradas.slice(0, 150).map(c => (
              <tr key={c.conta.id} className="border-b border-[#F1F3F8] hover:bg-[#F6F7F9]">
                <td className="py-2 nx-text font-medium">
                  {c.conta.razao}
                  <span className="ml-1.5 text-[10px] nx-muted">· {c.conta.cidade}/{c.conta.uf}</span>
                </td>
                <td>
                  <Badge style={{ background: STATUS_COLORS[c.status] + "22", color: STATUS_COLORS[c.status] }} className="border-0 text-[10px]">
                    {c.status}
                  </Badge>
                </td>
                <td className="text-right nx-num nx-muted">{c.recencia === Infinity ? "—" : `${c.recencia}d`}</td>
                <td className="text-right nx-num">{fmtBRLc(c.valor12m)}</td>
                <td className="text-right nx-num">{c.freq12m}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}

// ============ ALERTA: TEMPO SEM ATENDIMENTO ============
function AlertaSemAtendimento({ repId, onVerClientes }: { repId: string; onVerClientes?: () => void }) {
  const { seed } = useCockpit();
  const hoje = seed.hoje;

  const dados = useMemo(() => {
    const contas = seed.contas.filter(c => c.repId === repId);
    const ultimoMap = new Map<string, Date>();
    for (const a of seed.atendimentos) {
      if (a.repId !== repId) continue;
      const cur = ultimoMap.get(a.contaId);
      if (!cur || a.data > cur) ultimoMap.set(a.contaId, a.data);
    }
    return contas.map(c => {
      const ult = ultimoMap.get(c.id);
      const dias = ult ? Math.floor((hoje.getTime() - ult.getTime()) / 86400000) : Infinity;
      return { conta: c, dias };
    });
  }, [seed, repId, hoje]);

  const criticos = useMemo(
    () => dados.filter(d => d.dias === Infinity || d.dias > 60),
    [dados]
  );
  const atencao = useMemo(() => dados.filter(d => d.dias !== Infinity && d.dias > 30 && d.dias <= 60).length, [dados]);
  const morno = useMemo(() => dados.filter(d => d.dias !== Infinity && d.dias > 15 && d.dias <= 30).length, [dados]);

  if (criticos.length === 0 && atencao === 0) return null;

  const severidade = criticos.length > 0 ? "critico" : "atencao";
  const cores = severidade === "critico"
    ? { bg: "bg-rose-50",   border: "border-rose-300",   barra: "bg-rose-600",   icon: "text-rose-600",   text: "text-rose-900",   badge: "bg-rose-600" }
    : { bg: "bg-amber-50",  border: "border-amber-300",  barra: "bg-amber-500",  icon: "text-amber-600",  text: "text-amber-900",  badge: "bg-amber-500" };

  return (
    <div className={`relative overflow-hidden rounded-xl border ${cores.border} ${cores.bg} shadow-sm`}>
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${cores.barra}`} />
      <div className="p-4 pl-5">
        <div className="flex items-start gap-3 flex-wrap">
          <div className={`h-10 w-10 rounded-full ${cores.bg} border ${cores.border} flex items-center justify-center shrink-0`}>
            <AlertTriangle className={`h-5 w-5 ${cores.icon} ${severidade === "critico" ? "animate-pulse" : ""}`} />
          </div>
          <div className="flex-1 min-w-[260px]">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded ${cores.badge} text-white`}>
                {severidade === "critico" ? "Alerta crítico" : "Atenção"}
              </span>
              <p className={`text-base md:text-lg font-bold ${cores.text}`}>
                {criticos.length > 0 ? (
                  <><span className="nx-num">{criticos.length}</span> {criticos.length === 1 ? "cliente" : "clientes"} há mais de <span className="nx-num">60</span> dias sem atendimento</>
                ) : (
                  <><span className="nx-num">{atencao}</span> {atencao === 1 ? "cliente" : "clientes"} entre 31 e 60 dias sem contato</>
                )}
              </p>
            </div>
            <p className={`text-xs ${cores.text} opacity-80 mt-1`}>
              {criticos.length > 0
                ? "Esses clientes correm risco real de churn. Priorize um contato hoje."
                : "Janela curta antes de virar crítico. Programe um follow-up nesta semana."}
              {atencao > 0 && criticos.length > 0 && <> · <span className="nx-num">{atencao}</span> entre 31-60d</>}
              {morno > 0 && <> · <span className="nx-num">{morno}</span> entre 16-30d</>}
            </p>
          </div>
          {criticos.length > 0 && onVerClientes && (
            <Button size="sm" onClick={onVerClientes} className={`${cores.badge} hover:opacity-90 text-white h-9 px-3 text-xs shrink-0`}>
              Ver {criticos.length} clientes <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
