import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMarketing } from "../contexts/MarketingDataContext";
import { channelColors, channelLabels, formatBRLCompact, formatNum, formatPct, formatRoas, MktChannel } from "../styles/tokens";
import { mockClientes360 } from "@/data/mockCRM360";
import { mockOportunidades } from "@/data/mockCRM";
import { ArrowRight, Sparkles, Briefcase, CheckCircle2, TrendingUp, Zap, Search, ExternalLink } from "lucide-react";

const STATUS_ORDER = ["novo", "qualificado", "oportunidade", "ganho", "perdido"] as const;
type LeadStatus = typeof STATUS_ORDER[number];

const statusLabel: Record<LeadStatus, string> = {
  novo: "Lead novo", qualificado: "Qualificado (CRM)", oportunidade: "Oportunidade aberta", ganho: "Ganho", perdido: "Perdido",
};
const statusColor: Record<LeadStatus, string> = {
  novo: "#94A3B8", qualificado: "#60A5FA", oportunidade: "#F59E0B", ganho: "#22C55E", perdido: "#EF4444",
};

export default function HandoffPage() {
  const { leads } = useMarketing();
  const [busca, setBusca] = useState("");
  const [canalFiltro, setCanalFiltro] = useState<MktChannel | "all">("all");
  const [statusFiltro, setStatusFiltro] = useState<LeadStatus | "all">("all");

  // Funil: contagens por status
  const funil = useMemo(() => {
    const c: Record<LeadStatus, { count: number; receita: number; custo: number }> = {
      novo: { count: 0, receita: 0, custo: 0 }, qualificado: { count: 0, receita: 0, custo: 0 },
      oportunidade: { count: 0, receita: 0, custo: 0 }, ganho: { count: 0, receita: 0, custo: 0 }, perdido: { count: 0, receita: 0, custo: 0 },
    };
    leads.forEach(l => { c[l.status].count++; c[l.status].receita += l.receita; c[l.status].custo += l.custoAtribuido; });
    return c;
  }, [leads]);

  const total = leads.length;
  const totalReceita = leads.reduce((s, l) => s + l.receita, 0);
  const totalCusto = leads.reduce((s, l) => s + l.custoAtribuido, 0);
  const taxaQual = total > 0 ? ((funil.qualificado.count + funil.oportunidade.count + funil.ganho.count + funil.perdido.count) / total) * 100 : 0;
  const taxaOp = total > 0 ? ((funil.oportunidade.count + funil.ganho.count + funil.perdido.count) / total) * 100 : 0;
  const taxaGanho = total > 0 ? (funil.ganho.count / total) * 100 : 0;
  const cac = funil.ganho.count > 0 ? totalCusto / funil.ganho.count : 0;
  const roas = totalCusto > 0 ? totalReceita / totalCusto : 0;

  // Por canal
  const porCanal = useMemo(() => {
    const map: Record<string, { canal: MktChannel; total: number; ganhos: number; receita: number; custo: number }> = {};
    leads.forEach(l => {
      if (!map[l.origem]) map[l.origem] = { canal: l.origem, total: 0, ganhos: 0, receita: 0, custo: 0 };
      map[l.origem].total++;
      if (l.status === "ganho") map[l.origem].ganhos++;
      map[l.origem].receita += l.receita;
      map[l.origem].custo += l.custoAtribuido;
    });
    return Object.values(map).sort((a, b) => b.receita - a.receita);
  }, [leads]);

  const filtrados = useMemo(() => leads.filter(l =>
    (canalFiltro === "all" || l.origem === canalFiltro) &&
    (statusFiltro === "all" || l.status === statusFiltro) &&
    (busca === "" || l.clienteNome.toLowerCase().includes(busca.toLowerCase()))
  ), [leads, canalFiltro, statusFiltro, busca]);

  const maxFunil = Math.max(...STATUS_ORDER.map(s => funil[s].count), 1);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">Conversão Marketing → CRM</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Acompanhamento automático: à medida que os leads avançam no CRM, o status reflete aqui em tempo real.</p>
        </div>
        <div className="inline-flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full">
          <Zap className="h-3.5 w-3.5" /> Sincronização automática ativa
        </div>
      </div>

      {/* Ponte visual */}
      <div className="bg-gradient-to-r from-primary/5 via-accent/5 to-emerald-500/5 border border-border rounded-xl p-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-primary/15 flex items-center justify-center"><Sparkles className="h-6 w-6 text-primary" /></div>
            <div>
              <p className="text-[10px] uppercase text-muted-foreground font-medium">Marketing</p>
              <p className="text-base font-bold">{formatNum(total)} leads atribuídos</p>
            </div>
          </div>
          <ArrowRight className="h-6 w-6 text-muted-foreground" />
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/15 flex items-center justify-center"><Briefcase className="h-6 w-6 text-emerald-600" /></div>
            <div>
              <p className="text-[10px] uppercase text-muted-foreground font-medium">CRM Vendedor</p>
              <p className="text-base font-bold">{formatNum(mockClientes360.length)} clientes · {formatNum(mockOportunidades.length)} oportunidades</p>
            </div>
          </div>
          <div className="flex-1 min-w-[140px]" />
          <div className="text-right">
            <p className="text-[10px] uppercase text-muted-foreground">Lead → Cliente</p>
            <p className="text-2xl font-bold text-emerald-600 tabular-nums">{formatPct(taxaQual)}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase text-muted-foreground">Lead → Ganho</p>
            <p className="text-2xl font-bold text-primary tabular-nums">{formatPct(taxaGanho)}</p>
          </div>
        </div>
      </div>

      {/* KPIs principais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPI label="Receita ganha" value={formatBRLCompact(totalReceita)} icon={<TrendingUp className="h-4 w-4" />} accent="success" hint={`de ${funil.ganho.count} leads ganhos`} />
        <KPI label="CAC médio" value={cac > 0 ? formatBRLCompact(cac) : "—"} icon={<Briefcase className="h-4 w-4" />} accent="primary" hint="custo por cliente ganho" />
        <KPI label="ROAS pipeline" value={roas > 0 ? formatRoas(roas) : "—"} icon={<Zap className="h-4 w-4" />} accent={roas >= 2 ? "success" : roas >= 1 ? "warn" : "danger"} />
        <KPI label="Taxa oportunidade" value={formatPct(taxaOp)} icon={<CheckCircle2 className="h-4 w-4" />} accent="accent" hint={`${funil.oportunidade.count + funil.ganho.count + funil.perdido.count} de ${total}`} />
      </div>

      {/* Funil de conversão */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4">Funil de conversão automática</h2>
        <div className="space-y-2">
          {STATUS_ORDER.map((s, i) => {
            const data = funil[s];
            const pct = total > 0 ? (data.count / total) * 100 : 0;
            const width = maxFunil > 0 ? (data.count / maxFunil) * 100 : 0;
            const prevCount = i > 0 ? funil[STATUS_ORDER[i - 1]].count : data.count;
            const conv = i > 0 && prevCount > 0 ? (data.count / prevCount) * 100 : 100;
            return (
              <button key={s} onClick={() => setStatusFiltro(statusFiltro === s ? "all" : s)} className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-all hover:bg-muted/40 ${statusFiltro === s ? "bg-muted/60 ring-1 ring-primary/30" : ""}`}>
                <span className="h-3 w-3 rounded-sm shrink-0" style={{ background: statusColor[s] }} />
                <div className="w-[180px] text-left shrink-0">
                  <p className="text-[12px] font-medium text-foreground">{statusLabel[s]}</p>
                  <p className="text-[10px] text-muted-foreground tabular-nums">{formatNum(data.count)} leads · {formatPct(pct)}</p>
                </div>
                <div className="flex-1 h-7 bg-muted/40 rounded-md overflow-hidden relative">
                  <div className="h-full transition-all" style={{ width: `${width}%`, background: statusColor[s] + "33", borderRight: `3px solid ${statusColor[s]}` }} />
                  {data.receita > 0 && (
                    <span className="absolute inset-0 flex items-center px-3 text-[11px] font-semibold text-foreground tabular-nums">{formatBRLCompact(data.receita)}</span>
                  )}
                </div>
                {i > 0 && (
                  <span className="text-[11px] text-muted-foreground tabular-nums w-[80px] text-right shrink-0">→ {formatPct(conv)}</span>
                )}
              </button>
            );
          })}
        </div>
        <p className="text-[11px] text-muted-foreground mt-3 italic">Clique em uma etapa para filtrar a lista abaixo. As contagens são alimentadas automaticamente pelo CRM.</p>
      </div>

      {/* Performance por canal */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="text-sm font-semibold text-foreground mb-3">Conversão por canal de origem</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="text-left text-[10px] uppercase text-muted-foreground border-b border-border">
                <th className="px-2 py-2">Canal</th>
                <th className="px-2 py-2 text-right">Leads</th>
                <th className="px-2 py-2 text-right">Ganhos</th>
                <th className="px-2 py-2 text-right">Conv.</th>
                <th className="px-2 py-2 text-right">Custo</th>
                <th className="px-2 py-2 text-right">Receita</th>
                <th className="px-2 py-2 text-right">ROAS</th>
              </tr>
            </thead>
            <tbody>
              {porCanal.map(c => {
                const conv = c.total > 0 ? (c.ganhos / c.total) * 100 : 0;
                const r = c.custo > 0 ? c.receita / c.custo : 0;
                return (
                  <tr key={c.canal} className="border-b border-border hover:bg-muted/40 cursor-pointer" onClick={() => setCanalFiltro(canalFiltro === c.canal ? "all" : c.canal)}>
                    <td className="px-2 py-2 font-medium text-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full" style={{ background: channelColors[c.canal] }} />
                        {channelLabels[c.canal]}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-right tabular-nums">{formatNum(c.total)}</td>
                    <td className="px-2 py-2 text-right tabular-nums text-emerald-600">{c.ganhos}</td>
                    <td className="px-2 py-2 text-right tabular-nums">{formatPct(conv)}</td>
                    <td className="px-2 py-2 text-right tabular-nums">{c.custo > 0 ? formatBRLCompact(c.custo) : "—"}</td>
                    <td className="px-2 py-2 text-right tabular-nums">{c.receita > 0 ? formatBRLCompact(c.receita) : "—"}</td>
                    <td className={`px-2 py-2 text-right tabular-nums font-semibold ${r >= 2 ? "text-emerald-600" : r >= 1 ? "text-amber-600" : r > 0 ? "text-rose-600" : "text-muted-foreground"}`}>{r > 0 ? formatRoas(r) : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Filtros + lista */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-3 border-b border-border flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar lead..." className="w-full pl-8 pr-3 py-1.5 text-[12px] bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-ring" />
          </div>
          <select value={canalFiltro} onChange={e => setCanalFiltro(e.target.value as never)} className="text-[12px] bg-background border border-border rounded-lg px-2.5 py-1.5">
            <option value="all">Todos canais</option>
            {Object.entries(channelLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select value={statusFiltro} onChange={e => setStatusFiltro(e.target.value as never)} className="text-[12px] bg-background border border-border rounded-lg px-2.5 py-1.5">
            <option value="all">Todos status</option>
            {STATUS_ORDER.map(s => <option key={s} value={s}>{statusLabel[s]}</option>)}
          </select>
          <span className="text-[11px] text-muted-foreground ml-auto">{formatNum(filtrados.length)} leads</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead className="bg-muted/30">
              <tr className="text-left text-[10px] uppercase text-muted-foreground">
                <th className="px-3 py-2.5">Lead</th>
                <th className="px-3 py-2.5">Canal</th>
                <th className="px-3 py-2.5">Campanha</th>
                <th className="px-3 py-2.5">Status CRM</th>
                <th className="px-3 py-2.5 text-right">Custo</th>
                <th className="px-3 py-2.5 text-right">Receita</th>
                <th className="px-3 py-2.5 text-right">CRM</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.slice(0, 80).map(l => (
                <tr key={l.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-3 py-2.5">
                    <p className="font-medium text-foreground">{l.clienteNome}</p>
                    <p className="text-[10px] text-muted-foreground">UTM: {l.utm.source}/{l.utm.medium}</p>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full" style={{ background: channelColors[l.origem] }} />
                      {channelLabels[l.origem]}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground truncate max-w-[180px]">{l.utm.campaign}</td>
                  <td className="px-3 py-2.5">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded" style={{ background: statusColor[l.status] + "22", color: statusColor[l.status] }}>
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: statusColor[l.status] }} />
                      {statusLabel[l.status]}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{l.custoAtribuido > 0 ? formatBRLCompact(l.custoAtribuido) : "—"}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-emerald-600 font-medium">{l.receita > 0 ? formatBRLCompact(l.receita) : "—"}</td>
                  <td className="px-3 py-2.5 text-right">
                    {l.clienteId ? (
                      <Link to={`/vendedor/360/${l.clienteId}`} className="text-[11px] text-primary hover:underline inline-flex items-center gap-1">Ficha 360 <ExternalLink className="h-3 w-3" /></Link>
                    ) : (
                      <span className="text-[10px] text-muted-foreground italic">aguardando 1º contato</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtrados.length === 0 && <p className="text-[12px] text-muted-foreground text-center py-10">Nenhum lead nesta visão.</p>}
          {filtrados.length > 80 && <p className="text-[11px] text-muted-foreground text-center py-3">+ {filtrados.length - 80} leads · refine os filtros</p>}
        </div>
      </div>
    </div>
  );
}

function KPI({ label, value, icon, accent, hint }: { label: string; value: string; icon: React.ReactNode; accent: "primary" | "accent" | "success" | "warn" | "danger"; hint?: string }) {
  const cls = { primary: "bg-primary/10 text-primary", accent: "bg-accent/10 text-accent", success: "bg-emerald-500/10 text-emerald-600", warn: "bg-amber-500/10 text-amber-600", danger: "bg-rose-500/10 text-rose-600" }[accent];
  return (
    <div className="bg-card border border-border rounded-xl p-3 md:p-4">
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">{label}</p>
        <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${cls}`}>{icon}</div>
      </div>
      <p className="text-xl md:text-2xl font-bold text-foreground tabular-nums leading-tight">{value}</p>
      {hint && <p className="text-[10px] text-muted-foreground mt-1 truncate">{hint}</p>}
    </div>
  );
}
