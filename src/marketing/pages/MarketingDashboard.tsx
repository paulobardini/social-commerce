import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useMarketing } from "../contexts/MarketingDataContext";
import { KpiCard } from "../components/KpiCard";
import { FunnelChart } from "../components/FunnelChart";
import { DonutChart } from "../components/DonutChart";
import { formatBRL, formatBRLCompact, formatPct, formatRoas, formatNum, channelColors, channelLabels, MktChannel } from "../styles/tokens";
import { DollarSign, TrendingUp, Users, Target, AlertTriangle, ArrowRight, Sparkles, Activity } from "lucide-react";

export default function MarketingDashboard() {
  const { filteredCampanhas, leads, alertas, trend } = useMarketing();

  const kpis = useMemo(() => {
    const investimento = filteredCampanhas.reduce((s, c) => s + c.spent, 0);
    const receita = filteredCampanhas.reduce((s, c) => s + c.receitaAtribuida, 0);
    const totalLeads = filteredCampanhas.reduce((s, c) => s + c.leads, 0);
    const oportunidades = leads.filter(l => l.status === "oportunidade" || l.status === "ganho" || l.status === "perdido").length;
    const ganhos = leads.filter(l => l.status === "ganho").length;
    const totalImpressions = filteredCampanhas.reduce((s, c) => s + c.impressions, 0);
    const totalClicks = filteredCampanhas.reduce((s, c) => s + c.clicks, 0);
    return {
      investimento,
      receita,
      roas: investimento > 0 ? receita / investimento : 0,
      cpl: totalLeads > 0 ? investimento / totalLeads : 0,
      leads: totalLeads,
      oportunidades,
      taxaGanho: oportunidades > 0 ? (ganhos / oportunidades) * 100 : 0,
      ticketMedio: ganhos > 0 ? receita / ganhos : 0,
      impressions: totalImpressions,
      clicks: totalClicks,
    };
  }, [filteredCampanhas, leads]);

  const funnelSteps = useMemo(() => {
    const orcamentos = leads.filter(l => l.oportunidadeId).length;
    return [
      { label: "Impressões", value: kpis.impressions },
      { label: "Cliques", value: kpis.clicks },
      { label: "Leads", value: kpis.leads },
      { label: "Oportunidades", value: kpis.oportunidades, money: leads.filter(l => l.oportunidadeId).reduce((s, l) => s + (l.receita || 0), 0) },
      { label: "Orçamentos enviados", value: orcamentos },
      { label: "Ganhos", value: leads.filter(l => l.status === "ganho").length, money: leads.filter(l => l.status === "ganho").reduce((s, l) => s + l.receita, 0) },
    ];
  }, [kpis, leads]);

  const origemData = useMemo(() => {
    const counts: Record<string, number> = {};
    leads.forEach(l => { counts[l.origem] = (counts[l.origem] || 0) + 1; });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([key, value]) => ({
        label: channelLabels[key as MktChannel],
        value,
        color: channelColors[key as MktChannel],
      }));
  }, [leads]);

  const topCampanhas = useMemo(
    () => [...filteredCampanhas].sort((a, b) => b.roas - a.roas).slice(0, 6),
    [filteredCampanhas]
  );

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">Dashboard de Marketing</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Visão executiva de investimento, ROAS e atribuição end-to-end.</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Investimento" value={formatBRLCompact(kpis.investimento)} icon={<DollarSign className="h-4 w-4" />} accent="primary" delta={{ value: "12%", positive: true }} hint="vs período anterior" />
        <KpiCard label="Receita atribuída" value={formatBRLCompact(kpis.receita)} icon={<TrendingUp className="h-4 w-4" />} accent="success" delta={{ value: "23%", positive: true }} />
        <KpiCard label="ROAS" value={formatRoas(kpis.roas)} icon={<Target className="h-4 w-4" />} accent="accent" delta={{ value: "0,3x", positive: true }} hint="meta: 2,0x" />
        <KpiCard label="CPL" value={formatBRL(kpis.cpl)} icon={<Activity className="h-4 w-4" />} accent="warn" delta={{ value: "8%", positive: false }} />
        <KpiCard label="Leads gerados" value={formatNum(kpis.leads)} icon={<Users className="h-4 w-4" />} accent="primary" />
        <KpiCard label="Oportunidades" value={formatNum(kpis.oportunidades)} icon={<Sparkles className="h-4 w-4" />} accent="accent" />
        <KpiCard label="Taxa lead → ganho" value={formatPct(kpis.taxaGanho)} icon={<TrendingUp className="h-4 w-4" />} accent="success" />
        <KpiCard label="Ticket médio" value={formatBRLCompact(kpis.ticketMedio)} icon={<DollarSign className="h-4 w-4" />} accent="primary" />
      </div>

      {/* Alertas */}
      {alertas.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <h2 className="text-sm font-semibold text-foreground">Alertas inteligentes</h2>
            <span className="text-[10px] bg-amber-500/10 text-amber-700 rounded-full px-2 py-0.5 font-medium">{alertas.length}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {alertas.slice(0, 6).map(a => (
              <div key={a.id} className={`p-2.5 rounded-lg border text-[12px] ${
                a.severity === "danger" ? "bg-rose-500/5 border-rose-500/30" :
                a.severity === "warn" ? "bg-amber-500/5 border-amber-500/30" :
                "bg-blue-500/5 border-blue-500/30"
              }`}>
                <p className="font-medium text-foreground">{a.titulo}</p>
                <p className="text-muted-foreground text-[11px] mt-0.5">{a.descricao}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Funnel + Origem */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground">Funil end-to-end (Marketing → CRM)</h2>
            <Link to="/marketing/atribuicao" className="text-[11px] text-primary hover:underline flex items-center gap-1">
              Ver atribuição completa <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <FunnelChart steps={funnelSteps} formatMoney={formatBRLCompact} />
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <h2 className="text-sm font-semibold text-foreground mb-3">Origem dos leads</h2>
          <DonutChart data={origemData} size={140} />
        </div>
      </div>

      {/* Top campanhas Meta */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Top campanhas por ROAS</h2>
            <p className="text-[11px] text-muted-foreground">Ranqueado por receita atribuída ÷ investimento</p>
          </div>
          <Link to="/marketing/meta-ads" className="text-[11px] text-primary hover:underline flex items-center gap-1">
            Hub Meta Ads <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="overflow-x-auto -mx-4">
          <table className="w-full text-[12px] min-w-[760px]">
            <thead className="text-[10px] uppercase text-muted-foreground border-b border-border">
              <tr>
                <th className="text-left font-medium px-4 py-2">Campanha</th>
                <th className="text-right font-medium px-2 py-2">Gasto</th>
                <th className="text-right font-medium px-2 py-2">Leads</th>
                <th className="text-right font-medium px-2 py-2">CPL</th>
                <th className="text-right font-medium px-2 py-2">Receita</th>
                <th className="text-right font-medium px-4 py-2">ROAS</th>
              </tr>
            </thead>
            <tbody>
              {topCampanhas.map(c => (
                <tr key={c.id} className="border-b border-border/50 hover:bg-muted/40">
                  <td className="px-4 py-2.5">
                    <Link to={`/marketing/meta-ads/${c.id}`} className="font-medium text-foreground hover:text-primary truncate block max-w-[280px]">
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-2 py-2.5 text-right tabular-nums">{formatBRLCompact(c.spent)}</td>
                  <td className="px-2 py-2.5 text-right tabular-nums">{formatNum(c.leads)}</td>
                  <td className="px-2 py-2.5 text-right tabular-nums">{formatBRL(c.cpl)}</td>
                  <td className="px-2 py-2.5 text-right tabular-nums">{formatBRLCompact(c.receitaAtribuida)}</td>
                  <td className="px-4 py-2.5 text-right">
                    <span className={`font-semibold tabular-nums ${
                      c.roas >= 2 ? "text-emerald-600" : c.roas >= 1 ? "text-amber-600" : "text-rose-600"
                    }`}>
                      {formatRoas(c.roas)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tendência mensal */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h2 className="text-sm font-semibold text-foreground mb-4">Tendência (últimos 6 meses)</h2>
        <div className="grid grid-cols-6 gap-2">
          {trend.map(m => {
            const maxR = Math.max(...trend.map(t => t.receita));
            const maxI = Math.max(...trend.map(t => t.investimento));
            return (
              <div key={m.month} className="flex flex-col items-center gap-2">
                <div className="flex items-end gap-1 h-32">
                  <div className="w-3 bg-primary/70 rounded-t" style={{ height: `${(m.investimento / maxI) * 100}%` }} title={`Investimento: ${formatBRLCompact(m.investimento)}`} />
                  <div className="w-3 bg-emerald-500/70 rounded-t" style={{ height: `${(m.receita / maxR) * 100}%` }} title={`Receita: ${formatBRLCompact(m.receita)}`} />
                </div>
                <p className="text-[11px] text-muted-foreground">{m.month}</p>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-4 mt-3 text-[11px]">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 bg-primary/70 rounded-sm" /> Investimento</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 bg-emerald-500/70 rounded-sm" /> Receita atribuída</span>
        </div>
      </div>
    </div>
  );
}
