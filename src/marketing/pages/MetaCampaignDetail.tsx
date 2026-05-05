import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMarketing } from "../contexts/MarketingDataContext";
import { KpiCard } from "../components/KpiCard";
import { formatBRL, formatBRLCompact, formatNum, formatRoas, formatPct } from "../styles/tokens";
import { objectiveLabels, statusLabels, generateDailySeries } from "../data/mockMeta";
import { ArrowLeft, RefreshCw, DollarSign, Users, Target, TrendingUp, Image as ImageIcon, ExternalLink } from "lucide-react";

export default function MetaCampaignDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { campanhas, adSets, ads, leads } = useMarketing();
  const cmp = campanhas.find(c => c.id === id);

  if (!cmp) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground mb-3">Campanha não encontrada</p>
        <Link to="/marketing/meta-ads" className="text-primary hover:underline text-sm">Voltar para Meta Ads</Link>
      </div>
    );
  }

  const series = useMemo(() => generateDailySeries(cmp), [cmp]);
  const setsList = adSets.filter(s => s.campaignId === cmp.id);
  const adsList = ads.filter(a => setsList.some(s => s.id === a.adSetId));
  const leadsList = leads.filter(l => l.utm.campaign && cmp.oportunidadeIds.includes(l.oportunidadeId || ""));

  const maxSpent = Math.max(...series.map(s => s.spent));
  const maxReceita = Math.max(...series.map(s => s.receita), 1);

  return (
    <div className="space-y-5">
      <button onClick={() => navigate(-1)} className="text-[12px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
        <ArrowLeft className="h-3.5 w-3.5" /> Voltar
      </button>

      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-semibold bg-[#1877F2]/10 text-[#1877F2] px-2 py-0.5 rounded">{objectiveLabels[cmp.objective]}</span>
            <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded ${
              cmp.status === "active" ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"
            }`}>{statusLabels[cmp.status]}</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">{cmp.name}</h1>
          <p className="text-[12px] text-muted-foreground mt-0.5">
            Desde {new Date(cmp.startDate).toLocaleDateString("pt-BR")}
            {cmp.endDate && ` até ${new Date(cmp.endDate).toLocaleDateString("pt-BR")}`}
            {" "}· Orçamento {formatBRL(cmp.budgetDaily)}/dia
          </p>
        </div>
        <button className="text-[12px] inline-flex items-center gap-1.5 bg-card border border-border rounded-lg px-3 py-1.5 hover:bg-muted">
          <RefreshCw className="h-3.5 w-3.5" /> Sincronizar
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <KpiCard label="Investimento" value={formatBRLCompact(cmp.spent)} icon={<DollarSign className="h-4 w-4" />} />
        <KpiCard label="Leads" value={formatNum(cmp.leads)} icon={<Users className="h-4 w-4" />} accent="primary" />
        <KpiCard label="CPL" value={formatBRL(cmp.cpl)} accent="warn" />
        <KpiCard label="Receita" value={formatBRLCompact(cmp.receitaAtribuida)} icon={<TrendingUp className="h-4 w-4" />} accent="success" />
        <KpiCard label="ROAS" value={formatRoas(cmp.roas)} icon={<Target className="h-4 w-4" />} accent="accent" />
      </div>

      {/* Gráfico evolução diária */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h2 className="text-sm font-semibold text-foreground mb-4">Evolução diária — Últimos 30 dias</h2>
        <div className="flex items-end gap-1 h-40">
          {series.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-0.5 group relative" title={`${d.date} · Gasto ${formatBRL(d.spent)} · Receita ${formatBRL(d.receita)} · ${d.leads} leads`}>
              <div className="w-full flex items-end justify-center gap-0.5 h-full">
                <div className="w-1/2 bg-primary/70 rounded-t group-hover:bg-primary" style={{ height: `${(d.spent / maxSpent) * 100}%` }} />
                <div className="w-1/2 bg-emerald-500/70 rounded-t group-hover:bg-emerald-500" style={{ height: `${(d.receita / maxReceita) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-3 text-[11px]">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 bg-primary/70 rounded-sm" /> Gasto diário</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 bg-emerald-500/70 rounded-sm" /> Receita atribuída</span>
        </div>
      </div>

      {/* Leads originados (atribuição) */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h2 className="text-sm font-semibold text-foreground mb-3">Leads originados — Status atual no CRM</h2>
        {leadsList.length === 0 ? (
          <p className="text-[12px] text-muted-foreground py-4 text-center">Nenhum lead amarrado a oportunidade ainda neste recorte.</p>
        ) : (
          <div className="overflow-x-auto -mx-4">
            <table className="w-full text-[12px] min-w-[640px]">
              <thead className="text-[10px] uppercase text-muted-foreground border-b border-border">
                <tr>
                  <th className="text-left font-medium px-4 py-2">Cliente</th>
                  <th className="text-left font-medium px-2 py-2">Status</th>
                  <th className="text-left font-medium px-2 py-2">Origem</th>
                  <th className="text-right font-medium px-2 py-2">Custo</th>
                  <th className="text-right font-medium px-4 py-2">Receita</th>
                </tr>
              </thead>
              <tbody>
                {leadsList.map(l => (
                  <tr key={l.id} className="border-b border-border/50 hover:bg-muted/40">
                    <td className="px-4 py-2.5">
                      <Link to={l.clienteId ? `/vendedor/360/${l.clienteId}` : "#"} className="font-medium text-foreground hover:text-primary inline-flex items-center gap-1">
                        {l.clienteNome} <ExternalLink className="h-3 w-3" />
                      </Link>
                    </td>
                    <td className="px-2 py-2.5">
                      <span className={`text-[10px] uppercase font-medium px-2 py-0.5 rounded ${
                        l.status === "ganho" ? "bg-emerald-500/10 text-emerald-600" :
                        l.status === "perdido" ? "bg-rose-500/10 text-rose-600" :
                        l.status === "oportunidade" ? "bg-amber-500/10 text-amber-700" :
                        "bg-muted text-muted-foreground"
                      }`}>{l.status}</span>
                    </td>
                    <td className="px-2 py-2.5 text-muted-foreground">{l.utm.campaign}</td>
                    <td className="px-2 py-2.5 text-right tabular-nums">{formatBRL(l.custoAtribuido)}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums font-medium text-emerald-600">
                      {l.receita > 0 ? formatBRLCompact(l.receita) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Criativos */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h2 className="text-sm font-semibold text-foreground mb-3">Criativos · {adsList.length} anúncios</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {adsList.map(a => (
            <div key={a.id} className="group">
              <div className="aspect-square bg-muted rounded-lg overflow-hidden relative">
                {a.creativeUrl
                  ? <img src={a.creativeUrl} alt={a.name} className="w-full h-full object-cover" loading="lazy" />
                  : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="h-6 w-6 text-muted-foreground" /></div>
                }
                {a.isWinner && (
                  <span className="absolute top-1.5 left-1.5 bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">Win</span>
                )}
              </div>
              <div className="mt-1.5 space-y-0.5">
                <p className="text-[11px] font-medium text-foreground truncate">{a.headline}</p>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span className="tabular-nums">CTR {formatPct(a.ctr, 1)}</span>
                  <span className={`font-semibold ${a.roas >= 2 ? "text-emerald-600" : a.roas >= 1 ? "text-amber-600" : "text-rose-600"}`}>
                    {formatRoas(a.roas)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
