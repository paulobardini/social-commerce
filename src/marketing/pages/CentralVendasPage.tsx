import { useEffect, useMemo, useState } from "react";
import { useMarketing } from "../contexts/MarketingDataContext";
import { useNotifications } from "../contexts/MarketingNotificationsContext";
import { LeadFilaCard } from "../components/LeadFilaCard";
import { LeadDetailSheet } from "../components/LeadDetailSheet";
import { formatBRLCompact, formatNum, formatPct, channelLabels, channelColors, MktChannel } from "../styles/tokens";
import { Flame, Snowflake, Sparkles, TrendingUp, Search, Filter, Briefcase, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function CentralVendasPage() {
  const { leads, leadScores, leadsQuentes, leadsAquecendo, leadsEmRiscoEsfriar, receitaCrmTotal } = useMarketing();
  const { filaNaoVisualizada, marcarVisualizado, setAbrirLeadAcao } = useNotifications();
  const [aba, setAba] = useState<"quentes" | "aquecendo" | "esfriar">("quentes");
  const [busca, setBusca] = useState("");
  const [canalFiltro, setCanalFiltro] = useState<MktChannel | "all">("all");
  const [leadOpen, setLeadOpen] = useState<string | null>(null);

  // Registrar ação para abrir lead via toast
  useEffect(() => {
    setAbrirLeadAcao(() => (id: string) => { setLeadOpen(id); marcarVisualizado(id); setAba("quentes"); });
    return () => setAbrirLeadAcao(null);
  }, [setAbrirLeadAcao, marcarVisualizado]);

  const lista = useMemo(() => {
    const base = aba === "quentes" ? leadsQuentes : aba === "aquecendo" ? leadsAquecendo : leadsEmRiscoEsfriar;
    return base
      .filter(l => canalFiltro === "all" || l.origem === canalFiltro)
      .filter(l => busca === "" || l.clienteNome.toLowerCase().includes(busca.toLowerCase()))
      .map(l => ({ lead: l, score: leadScores.get(l.id)! }))
      .filter(x => x.score)
      .sort((a, b) => b.score.score - a.score.score);
  }, [aba, leadsQuentes, leadsAquecendo, leadsEmRiscoEsfriar, leadScores, canalFiltro, busca]);

  const totalGanhos = leads.filter(l => l.status === "ganho").length;
  const taxaConversaoCrm = leads.length > 0 ? (totalGanhos / leads.length) * 100 : 0;

  const handleAbrir = (id: string) => { setLeadOpen(id); marcarVisualizado(id); };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
            <Flame className="h-6 w-6 text-orange-500" />
            Central de Vendas
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Fila inteligente de leads quentes priorizados pelo motor comercial bidirecional.</p>
        </div>
        <Link to="/marketing/handoff" className="text-[12px] text-primary hover:underline inline-flex items-center gap-1">
          Ver funil completo Marketing→CRM <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* KPIs Temperatura */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiTemp label="Leads quentes" value={leadsQuentes.length} accent="orange" icon={<Flame className="h-4 w-4" />} hint="score ≥ 70" highlight />
        <KpiTemp label="Aquecendo" value={leadsAquecendo.length} accent="amber" icon={<Sparkles className="h-4 w-4" />} hint="2+ sinais em 3d" />
        <KpiTemp label="Em risco de esfriar" value={leadsEmRiscoEsfriar.length} accent="rose" icon={<Snowflake className="h-4 w-4" />} hint="sem sinal há 7d+" />
        <KpiTemp label="Receita confirmada CRM" value={formatBRLCompact(receitaCrmTotal)} accent="emerald" icon={<TrendingUp className="h-4 w-4" />} hint={`${formatPct(taxaConversaoCrm)} conversão`} isCurrency />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border">
        {[
          { k: "quentes" as const, label: "🔥 Fila quente", count: leadsQuentes.length },
          { k: "aquecendo" as const, label: "✨ Aquecendo", count: leadsAquecendo.length },
          { k: "esfriar" as const, label: "❄️ Em risco", count: leadsEmRiscoEsfriar.length },
        ].map(t => (
          <button
            key={t.k}
            onClick={() => setAba(t.k)}
            className={`px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors ${
              aba === t.k ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label} <span className="text-[11px] opacity-70">({t.count})</span>
          </button>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-[320px]">
          <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar lead..." className="w-full pl-8 pr-3 py-1.5 text-[12px] bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-ring" />
        </div>
        <select value={canalFiltro} onChange={e => setCanalFiltro(e.target.value as never)} className="text-[12px] bg-background border border-border rounded-lg px-2.5 py-1.5">
          <option value="all">Todos canais</option>
          {Object.entries(channelLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <span className="text-[11px] text-muted-foreground ml-auto inline-flex items-center gap-1.5">
          <Filter className="h-3 w-3" /> {formatNum(lista.length)} leads
        </span>
      </div>

      {/* Grid de cards */}
      {lista.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-xl p-10 text-center">
          <Briefcase className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-sm text-muted-foreground">Nenhum lead nesta visão no momento.</p>
          <p className="text-[11px] text-muted-foreground mt-1">A fila se atualiza automaticamente conforme leads ganham temperatura.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {lista.slice(0, 60).map(({ lead, score }) => (
            <LeadFilaCard
              key={lead.id}
              lead={lead}
              score={score}
              destaque={filaNaoVisualizada.has(lead.id)}
              onAbrir={() => handleAbrir(lead.id)}
            />
          ))}
        </div>
      )}
      {lista.length > 60 && <p className="text-[11px] text-muted-foreground text-center">+ {lista.length - 60} leads · refine os filtros</p>}

      <LeadDetailSheet leadId={leadOpen} open={!!leadOpen} onOpenChange={o => !o && setLeadOpen(null)} />
    </div>
  );
}

function KpiTemp({ label, value, accent, icon, hint, highlight, isCurrency }: { label: string; value: number | string; accent: "orange" | "amber" | "rose" | "emerald"; icon: React.ReactNode; hint?: string; highlight?: boolean; isCurrency?: boolean }) {
  const cls = {
    orange: "bg-orange-500/10 text-orange-600 border-orange-500/30",
    amber: "bg-amber-500/10 text-amber-600 border-amber-500/30",
    rose: "bg-rose-500/10 text-rose-600 border-rose-500/30",
    emerald: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  }[accent];
  return (
    <div className={`bg-card border rounded-xl p-3 md:p-4 ${highlight ? "border-orange-500/40 ring-1 ring-orange-500/20" : "border-border"}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">{label}</p>
        <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${cls}`}>{icon}</div>
      </div>
      <p className="text-xl md:text-2xl font-bold text-foreground tabular-nums leading-tight">{isCurrency ? value : typeof value === "number" ? formatNum(value) : value}</p>
      {hint && <p className="text-[10px] text-muted-foreground mt-1 truncate">{hint}</p>}
    </div>
  );
}
