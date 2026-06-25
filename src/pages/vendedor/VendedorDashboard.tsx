import { useMemo, useState } from "react";
import { useCockpit } from "@/cockpit/contexts/CockpitContext";
import { CockpitTopbar } from "@/cockpit/components/CockpitTopbar";
import { SaudeCarteiraBar } from "@/cockpit/components/SaudeCarteiraBar";
import { SectionCard } from "@/cockpit/components/SectionCard";
import { KpiCard } from "@/cockpit/components/KpiCard";
import { StatusDonut } from "@/cockpit/components/StatusDonut";
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
import { kpisCarteira, kpisMetas } from "@/cockpit/lib/kpis";
import { classificarTudo } from "@/cockpit/lib/classificar";
import { agingCarteira } from "@/cockpit/lib/aging";
import { filaAcaoVendedor, type FilaItem } from "@/cockpit/lib/fila";
import { funilOportunidades, oportunidadesEstagnadas, ETAPAS_FUNIL, ETAPA_LABEL, cicloDiasMedio, winRateGlobal } from "@/cockpit/lib/funis";
import { serieMensal } from "@/cockpit/lib/series";
import { STATUS_COLORS, fmtBRL, fmtBRLc, fmtNum, fmtPct, fmtDias, NX } from "@/cockpit/styles/tokens";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Cell } from "recharts";
import { AlertTriangle, Flame, MessageCircle, ChevronDown, ChevronRight, Phone, MapPin, ArrowRight, Search, CheckCircle2, Target, TrendingUp, Activity } from "lucide-react";
import { toast } from "sonner";

export default function VendedorDashboard() {
  const ctx = useCockpit();
  const { seed, range, previousRange, diasAtivo, diasPerdido, repId, comparar } = ctx;

  // Garantir um rep selecionado válido
  const repIdEfetivo = repId === "todos" ? seed.representantes[0].id : repId;
  const cfg = { diasAtivo, diasPerdido, repId: repIdEfetivo };

  const kpiC = useMemo(() => kpisCarteira(seed, range, previousRange, cfg), [seed, range, previousRange, cfg]);
  const kpiM = useMemo(() => kpisMetas(seed, range, previousRange, cfg), [seed, range, previousRange, cfg]);

  // FILA DE AÇÃO
  const fila = useMemo(() => filaAcaoVendedor(seed, repIdEfetivo, diasAtivo, diasPerdido), [seed, repIdEfetivo, diasAtivo, diasPerdido]);

  // Donut + aging
  const donutData = [
    { status: "ativo" as const, valor: kpiC.ativos.atual },
    { status: "inativo" as const, valor: kpiC.inativos.atual },
    { status: "perdido" as const, valor: kpiC.perdidos.atual },
  ];
  const aging = useMemo(() => agingCarteira(kpiC.classificadas), [kpiC]);

  // Funil de oportunidades do rep
  const opsRep = useMemo(() => seed.oportunidades.filter(o => o.repId === repIdEfetivo), [seed, repIdEfetivo]);
  const funOp = useMemo(() => funilOportunidades(opsRep), [opsRep]);
  const opsEst = useMemo(() => oportunidadesEstagnadas(opsRep, 7, seed.hoje), [opsRep, seed]);
  const cicloRep = cicloDiasMedio(opsRep, seed.hoje);
  const winRep = winRateGlobal(opsRep);
  const pipelineRep = opsRep.filter(o => ETAPAS_FUNIL.includes(o.etapa)).reduce((s, o) => s + o.valor, 0);

  // Histórico 6m do rep
  const hist6m = useMemo(() => {
    const pedidos = seed.pedidos.filter(p => p.repId === repIdEfetivo);
    return serieMensal(6, pedidos, seed.hoje);
  }, [seed, repIdEfetivo]);

  return (
    <div className="nx-shell min-h-screen">
      <CockpitTopbar title="Painel comercial · Vendedor" showRep />
      <div className="px-4 md:px-6 py-4 space-y-4">

        <Tabs defaultValue="hoje" className="space-y-4">
          <TabsList className="bg-white border border-[#E7E9EE] p-1 h-auto">
            <TabsTrigger value="hoje" className="text-xs data-[state=active]:bg-[#2D3A8C] data-[state=active]:text-white">Hoje · Fila de ação</TabsTrigger>
            <TabsTrigger value="carteira" className="text-xs data-[state=active]:bg-[#2D3A8C] data-[state=active]:text-white">Minha carteira</TabsTrigger>
            <TabsTrigger value="metas" className="text-xs data-[state=active]:bg-[#2D3A8C] data-[state=active]:text-white">Minhas metas</TabsTrigger>
            <TabsTrigger value="funil" className="text-xs data-[state=active]:bg-[#2D3A8C] data-[state=active]:text-white">Meu funil</TabsTrigger>
          </TabsList>

          {/* HOJE */}
          <TabsContent value="hoje" className="mt-0">
            <FilaAcao fila={fila} />
          </TabsContent>

          {/* MINHA CARTEIRA */}
          <TabsContent value="carteira" className="space-y-4 mt-0">
            <SaudeCarteiraBar filtroRepId={repIdEfetivo} />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <KpiCard label="Ativos" value={fmtNum(kpiC.ativos.atual)} delta={comparar ? { pct: kpiC.ativos.delta } : undefined} />
              <KpiCard label="Inativos" value={fmtNum(kpiC.inativos.atual)} delta={comparar ? { pct: kpiC.inativos.delta, invert: true } : undefined} />
              <KpiCard label="Perdidos" value={fmtNum(kpiC.perdidos.atual)} delta={comparar ? { pct: kpiC.perdidos.delta, invert: true } : undefined} />
              <KpiCard label="Positivados" value={fmtNum(kpiC.positivados.atual)} delta={comparar ? { pct: kpiC.positivados.delta } : undefined} />
              <KpiCard label="Novos" value={fmtNum(kpiC.novos.atual)} delta={comparar ? { pct: kpiC.novos.delta } : undefined} />
              <KpiCard label="Reativados" value={fmtNum(kpiC.reativados.atual)} delta={comparar ? { pct: kpiC.reativados.delta } : undefined} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <SectionCard title="Distribuição por status"><StatusDonut data={donutData} /></SectionCard>
              <SectionCard title="Aging da carteira"><AgingBars data={aging} /></SectionCard>
            </div>
            <ListaClientes classificadas={kpiC.classificadas} />
          </TabsContent>

          {/* METAS */}
          <TabsContent value="metas" className="space-y-4 mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <SectionCard className="lg:col-span-1" title="Minha meta de faturamento" subtitle={`Meta ${fmtBRL(kpiM.metaFaturamento)}`}>
                <Gauge value={kpiM.atingimento} label="Atingimento" size={220} />
                <p className="text-center text-[11px] nx-muted mt-2">Realizado <span className="font-semibold nx-num nx-text">{fmtBRL(kpiM.realizado)}</span></p>
              </SectionCard>
              <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-3 content-start">
                <KpiCard label="Pace projetado" value={fmtPct(kpiM.paceAtingimento, 0)} hint={fmtBRLc(kpiM.projecao)} />
                <KpiCard label="Quanto falta" value={fmtBRLc(kpiM.gap)} hint="para meta" />
                <KpiCard label="Dias restantes" value={fmtNum(kpiM.diasRestantes)} hint="no mês" />
                <KpiCard label="R$/dia necessário" value={fmtBRLc(kpiM.rsPorDia)} />
                <KpiCard label="Meta positivação" value="72%" hint="atingido" />
                <KpiCard label="Meta cobertura" value="68%" hint="atingido" />
                <KpiCard label="Meta novos" value="85%" hint="atingido" />
                <KpiCard label="Meta reativação" value="44%" hint="atingido" />
              </div>
            </div>
            <SectionCard title="Meu histórico" subtitle="Faturamento últimos 6 meses">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={hist6m}>
                  <CartesianGrid stroke="#F1F3F8" vertical={false} />
                  <XAxis dataKey="data" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={fmtBRLc} />
                  <Tooltip formatter={(v: number) => fmtBRL(v)} contentStyle={{ background: "#fff", border: "1px solid #E7E9EE", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="valor" fill={NX.primary} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </SectionCard>
          </TabsContent>

          {/* FUNIL */}
          <TabsContent value="funil" className="space-y-4 mt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <KpiCard label="Pipeline R$" value={fmtBRLc(pipelineRep)} icon={<TrendingUp className="h-3.5 w-3.5" />} />
              <KpiCard label="Ciclo médio" value={fmtDias(cicloRep)} icon={<Activity className="h-3.5 w-3.5" />} />
              <KpiCard label="Win rate" value={fmtPct(winRep)} icon={<Target className="h-3.5 w-3.5" />} />
            </div>
            <SectionCard title="Meu funil de oportunidades">
              <FunnelChart etapas={funOp.counts.map(c => ({ etapa: c.etapa, valor: c.valor, receita: c.receita }))} taxas={funOp.taxas} money />
            </SectionCard>
            <SectionCard title="Minhas oportunidades estagnadas" subtitle="Sem movimento há 7+ dias">
              {opsEst.length === 0 ? <EmptyState message="Nenhuma oportunidade estagnada — bom trabalho!" /> :
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {opsEst.map(o => {
                    const cliente = seed.contas.find(c => c.id === o.contaId);
                    return (
                      <div key={o.id} className="flex items-center justify-between bg-[#F6F7F9] rounded-lg p-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold nx-text truncate">{cliente?.razao}</p>
                          <p className="text-[11px] nx-muted">{ETAPA_LABEL[o.etapa]} · {fmtBRLc(o.valor)}</p>
                        </div>
                        <Badge className="bg-rose-100 text-rose-700 mr-2">{o.diasParada}d parada</Badge>
                        <Button size="sm" variant="outline" className="text-[11px] h-7" onClick={() => toast.success("Etapa avançada (mock)")}>
                          Avançar etapa <ArrowRight className="h-3 w-3 ml-1" />
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

// ============ FILA DE AÇÃO ============
function FilaAcao({ fila }: { fila: ReturnType<typeof filaAcaoVendedor> }) {
  const [openModal, setOpenModal] = useState<{ item: FilaItem } | null>(null);

  return (
    <div className="space-y-4">
      <div className="nx-card p-5 bg-gradient-to-br from-[#2D3A8C] to-[#363BB4] text-white">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-lg font-semibold">Você tem {fila.total} clientes para atender hoje</h2>
            <p className="text-xs opacity-80 mt-1">Priorizado por urgência. Comece pelo bloco vermelho.</p>
          </div>
          <div className="flex gap-2">
            <Chip color="rose"   label={`${fila.inativosEmRisco.length} em risco`} />
            <Chip color="amber"  label={`${fila.leadsQuentesParados.length} oport. paradas`} />
            <Chip color="slate"  label={`${fila.ativosSemCobertura.length} sem cobertura`} />
          </div>
        </div>
      </div>

      <BlocoFila
        titulo="Inativos prestes a virar perdidos"
        descricao="Faltam ≤15 dias para virar Perdido — prioridade máxima"
        accent="rose"
        icon={<AlertTriangle className="h-4 w-4" />}
        itens={fila.inativosEmRisco}
        defaultOpen
        onAcao={(item) => setOpenModal({ item })}
      />
      <BlocoFila
        titulo="Leads / oportunidades quentes paradas"
        descricao="Sem movimento recente — perdendo temperatura"
        accent="amber"
        icon={<Flame className="h-4 w-4" />}
        itens={fila.leadsQuentesParados}
        defaultOpen
        onAcao={(item) => setOpenModal({ item })}
      />
      <BlocoFila
        titulo="Ativos sem cobertura no período"
        descricao="Ativos que ainda não recebeu atendimento neste período"
        accent="slate"
        icon={<MessageCircle className="h-4 w-4" />}
        itens={fila.ativosSemCobertura}
        defaultOpen={false}
        onAcao={(item) => setOpenModal({ item })}
      />

      {/* Rodapé sticky */}
      <div className="nx-card sticky bottom-2 p-3 grid grid-cols-3 gap-3">
        <KpiCard label="Atendimentos feitos hoje" value="4" hint="meta diária: 8" />
        <KpiCard label="Positivados hoje" value="2" hint="meta diária: 5" />
        <div className="nx-card-soft p-3">
          <p className="text-[10px] uppercase tracking-wide nx-muted font-medium mb-1.5">Meta do dia</p>
          <ProgressBar value={50} color="#2D3A8C" suffix="50%" />
          <p className="text-[10px] nx-muted mt-1.5 nx-num">R$ 8.500 / R$ 17.000</p>
        </div>
      </div>

      <RegistrarAtendimentoModal open={!!openModal} item={openModal?.item} onClose={() => setOpenModal(null)} />
    </div>
  );
}

function Chip({ color, label }: { color: "rose" | "amber" | "slate"; label: string }) {
  const cls = {
    rose: "bg-rose-500/20 text-rose-50 border-rose-300/30",
    amber: "bg-amber-500/20 text-amber-50 border-amber-300/30",
    slate: "bg-white/15 text-white border-white/20",
  }[color];
  return <span className={`text-[11px] px-2.5 py-1 rounded-full border ${cls}`}>{label}</span>;
}

function BlocoFila({ titulo, descricao, accent, icon, itens, defaultOpen, onAcao }: {
  titulo: string; descricao: string; accent: "rose" | "amber" | "slate"; icon: React.ReactNode;
  itens: FilaItem[]; defaultOpen: boolean; onAcao: (item: FilaItem) => void;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const accentMap = {
    rose:  { bar: "bg-rose-500",  bg: "bg-rose-50",  text: "text-rose-700",  border: "border-rose-200" },
    amber: { bar: "bg-amber-500", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
    slate: { bar: "bg-slate-400", bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200" },
  }[accent];

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="nx-card overflow-hidden">
        <CollapsibleTrigger className="w-full">
          <div className={`flex items-center gap-3 px-4 py-3 ${accentMap.bg} border-b ${accentMap.border}`}>
            <div className={`h-1 w-1 rounded-full ${accentMap.bar}`} />
            <div className={`h-7 w-7 rounded-md ${accentMap.bar} text-white flex items-center justify-center`}>{icon}</div>
            <div className="flex-1 text-left">
              <p className={`text-sm font-semibold ${accentMap.text}`}>{titulo}</p>
              <p className="text-[11px] nx-muted">{descricao}</p>
            </div>
            <Badge className={`${accentMap.bar} text-white`}>{itens.length}</Badge>
            {open ? <ChevronDown className="h-4 w-4 nx-muted" /> : <ChevronRight className="h-4 w-4 nx-muted" />}
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          {itens.length === 0 ? (
            <EmptyState message="Tudo em dia neste bloco." icon={<CheckCircle2 className="h-5 w-5" />} />
          ) : (
            <div className="divide-y divide-[#F1F3F8] max-h-[480px] overflow-y-auto">
              {itens.map(item => (
                <FilaItemRow key={item.contaId + item.motivo} item={item} accent={accent} onAcao={onAcao} />
              ))}
            </div>
          )}
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

function FilaItemRow({ item, accent, onAcao }: { item: FilaItem; accent: "rose" | "amber" | "slate"; onAcao: (item: FilaItem) => void }) {
  const inicial = item.razao.slice(0, 1).toUpperCase();
  const urgente = item.diasRestantes !== undefined && item.diasRestantes <= 5;
  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-[#F6F7F9]">
      <div className="h-9 w-9 rounded-full bg-[#E8EAF6] text-[#2D3A8C] flex items-center justify-center text-sm font-semibold shrink-0">{inicial}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium nx-text truncate">{item.razao}</p>
          <Badge variant="outline" className="text-[10px]">{item.status}</Badge>
          {item.diasRestantes !== undefined && (
            <Badge className={urgente ? "bg-rose-500 text-white" : "bg-amber-500 text-white"}>
              Faltam {item.diasRestantes}d
            </Badge>
          )}
        </div>
        <p className="text-[11px] nx-muted mt-0.5">
          {item.motivo}{item.valor ? ` · ${fmtBRLc(item.valor)} (12m)` : ""}
        </p>
      </div>
      <div className="flex gap-1.5 shrink-0">
        <Button size="sm" variant="outline" className="h-8 px-2.5 text-[11px]" onClick={() => onAcao(item)}>
          <Phone className="h-3 w-3 mr-1" /> Registrar atendimento
        </Button>
      </div>
    </div>
  );
}

function RegistrarAtendimentoModal({ open, item, onClose }: { open: boolean; item?: FilaItem; onClose: () => void }) {
  const [tipo, setTipo] = useState("whatsapp");
  const [nota, setNota] = useState("");
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar atendimento</DialogTitle>
          {item && <p className="text-xs nx-muted">{item.razao}</p>}
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-[11px] nx-muted mb-1 block">Tipo</label>
            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="visita">Visita</SelectItem>
                <SelectItem value="ligacao">Ligação</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-[11px] nx-muted mb-1 block">Nota</label>
            <Textarea value={nota} onChange={(e) => setNota(e.target.value)} rows={3} placeholder="O que foi conversado, próximos passos..." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => { toast.success("Atendimento registrado"); onClose(); setNota(""); }} style={{ background: "#2D3A8C" }}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============ LISTA DE CLIENTES ============
function ListaClientes({ classificadas }: { classificadas: ReturnType<typeof classificarTudo> }) {
  const [busca, setBusca] = useState("");
  const [statusF, setStatusF] = useState<string>("todos");

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
            {filtradas.slice(0, 100).map(c => (
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
