// Atendimento: KPIs de execução + tickets por setor.
import { useMemo } from "react";
import { useCockpit } from "../../contexts/CockpitContext";
import { kpisAtendimento } from "../../lib/kpis";
import { funilOportunidades, motivosPerda } from "../../lib/funis";
import { fmtBRLc, fmtNum, fmtPct, fmtDias, NX, CHART_PALETTE, STATUS_COLORS } from "../../styles/tokens";
import { repIdsNoEscopo } from "../../lib/escopo";
import { SectionCard } from "../SectionCard";
import { KpiCard } from "../KpiCard";
import { FunnelChart } from "../FunnelChart";
import { Activity, Target, DollarSign, MessageCircle, AlertCircle } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { mockTickets, setorLabels, type Setor } from "@/data/mockAtendimento";

function parseTicketDate(s: string): Date {
  const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (!m) return new Date();
  return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
}
function agingDays(s: string) {
  return Math.floor((Date.now() - parseTicketDate(s).getTime()) / 86400000);
}

export function AtendimentoTab() {
  const { seed, escopo, range, previousRange, comparar } = useCockpit();
  const navigate = useNavigate();

  const repIds = useMemo(() => repIdsNoEscopo(seed, escopo), [seed, escopo]);
  const kpiA = useMemo(() => kpisAtendimento(seed, range, previousRange, { diasAtivo: 60, diasPerdido: 180, repId: "todos" }), [seed, range, previousRange]);

  const reps = seed.representantes.filter(r => repIds.has(r.id));

  const coberturaRep = useMemo(() => reps.map(r => {
    const contas = seed.contas.filter(c => c.repId === r.id);
    const atendidas = new Set(seed.atendimentos.filter(a => a.repId === r.id && a.data >= range.from && a.data <= range.to).map(a => a.contaId)).size;
    return { rep: r.nome, cobertura: contas.length > 0 ? (atendidas / contas.length) * 100 : 0 };
  }), [reps, seed, range]);

  const winRep = useMemo(() => reps.map(r => {
    const fechadas = seed.oportunidades.filter(o => o.repId === r.id && (o.etapa === "ganha" || o.etapa === "perdida"));
    const ganhas = fechadas.filter(o => o.etapa === "ganha").length;
    return { rep: r.nome, win: fechadas.length > 0 ? (ganhas / fechadas.length) * 100 : 0 };
  }), [reps, seed]);

  const motivos = useMemo(() => motivosPerda(seed.oportunidades.filter(o => repIds.has(o.repId))), [seed, repIds]);
  const funOp = useMemo(() => funilOportunidades(seed.oportunidades.filter(o => repIds.has(o.repId))), [seed, repIds]);

  // Tickets por setor
  const setores: Setor[] = ["sac", "cobranca", "financeiro", "logistica"];
  const setorStats = setores.map(s => {
    const tks = mockTickets.filter(t => t.setor === s);
    const urgentes = tks.filter(t => t.prioridade === "urgente").length;
    const estourados = tks.filter(t => agingDays(t.dataAbertura) > 3).length;
    return { setor: s, total: tks.length, urgentes, estourados };
  });

  const showDelta = (v: number) => comparar && v !== 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3">
        <KpiCard label="Cobertura" value={fmtPct(kpiA.cobertura.atual)} delta={showDelta(kpiA.cobertura.delta) ? { pct: kpiA.cobertura.delta } : undefined} icon={<Activity className="h-3.5 w-3.5" />} />
        <KpiCard label="Atendimentos" value={fmtNum(kpiA.nAtendimentos.atual)} delta={showDelta(kpiA.nAtendimentos.delta) ? { pct: kpiA.nAtendimentos.delta } : undefined} />
        <KpiCard label="Conv. Lead→Cliente" value={fmtPct(kpiA.txConversao.atual)} delta={showDelta(kpiA.txConversao.delta) ? { pct: kpiA.txConversao.delta } : undefined} />
        <KpiCard label="Ciclo de vendas" value={fmtDias(kpiA.ciclo.atual)} />
        <KpiCard label="Win rate" value={fmtPct(kpiA.winRate.atual)} icon={<Target className="h-3.5 w-3.5" />} />
        <KpiCard label="Pipeline R$" value={fmtBRLc(kpiA.pipelineRS.atual)} icon={<DollarSign className="h-3.5 w-3.5" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Funil de oportunidades" subtitle="Taxa de conversão entre etapas">
          <FunnelChart etapas={funOp.counts.map(c => ({ etapa: c.etapa, valor: c.valor, receita: c.receita }))} taxas={funOp.taxas} money />
        </SectionCard>
        <SectionCard title="Motivos de perda" subtitle="Agregado dos motivos estruturados">
          {motivos.length === 0
            ? <p className="text-xs nx-muted py-8 text-center">Sem oportunidades perdidas neste escopo</p>
            : <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={motivos.map(m => ({ nome: m.motivo, valor: m.qtd }))} dataKey="valor" nameKey="nome" outerRadius={80} label={{ fontSize: 10 }}>
                    {motivos.map((_, i) => <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#fff", border: "1px solid #E7E9EE", borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
          }
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Cobertura por representante">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={coberturaRep} layout="vertical">
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
              <YAxis type="category" dataKey="rep" tick={{ fontSize: 10 }} width={100} />
              <Tooltip formatter={(v: number) => fmtPct(v)} contentStyle={{ background: "#fff", border: "1px solid #E7E9EE", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="cobertura" fill={NX.primary} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
        <SectionCard title="Win rate por representante">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={winRep} layout="vertical">
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
              <YAxis type="category" dataKey="rep" tick={{ fontSize: 10 }} width={100} />
              <Tooltip formatter={(v: number) => fmtPct(v)} contentStyle={{ background: "#fff", border: "1px solid #E7E9EE", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="win" fill={STATUS_COLORS.ativo} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      <SectionCard title="Tickets por setor" subtitle="SAC · Cobrança · Financeiro · Logística" action={
        <Button size="sm" variant="ghost" className="h-7 text-[11px] text-[#2D3A8C]" onClick={() => navigate("/vendedor/atendimento")}>
          Ver kanban →
        </Button>
      }>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {setorStats.map(s => (
            <button key={s.setor} onClick={() => navigate("/vendedor/atendimento")} className="text-left p-3 rounded-lg border border-[#E7E9EE] hover:border-[#2D3A8C] transition">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold nx-text">{setorLabels[s.setor]}</p>
                {s.estourados > 0 && <AlertCircle className="h-3.5 w-3.5 text-rose-500" />}
              </div>
              <p className="text-2xl font-bold nx-num nx-text">{s.total}</p>
              <div className="flex gap-1 mt-2 flex-wrap">
                {s.urgentes > 0 && <Badge className="bg-rose-100 text-rose-700 text-[10px]">{s.urgentes} urgente(s)</Badge>}
                {s.estourados > 0 && <Badge className="bg-amber-100 text-amber-700 text-[10px]">{s.estourados} estourado(s)</Badge>}
                {s.urgentes === 0 && s.estourados === 0 && <span className="text-[10px] text-emerald-600">No prazo</span>}
              </div>
            </button>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
