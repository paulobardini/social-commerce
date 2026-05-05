import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMarketing } from "../contexts/MarketingDataContext";
import { KpiCard } from "../components/KpiCard";
import { formatBRL, formatBRLCompact, formatNum, formatRoas } from "../styles/tokens";
import { objectiveLabels, statusLabels } from "../data/mockMeta";
import { Sparkles, DollarSign, Target, Users, RefreshCw, Play, Pause, ChevronRight, Image as ImageIcon } from "lucide-react";

type Tab = "campanhas" | "conjuntos" | "anuncios";

export default function MetaAdsHub() {
  const { filteredCampanhas, adSets, ads, contas, contaId, toggleCampanhaStatus } = useMarketing();
  const [tab, setTab] = useState<Tab>("campanhas");
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [selectedAdSet, setSelectedAdSet] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"roas" | "spent" | "leads" | "cpl">("roas");

  const conta = contas.find(c => c.id === contaId);
  const visibleAdSets = useMemo(() => {
    if (selectedCampaign) return adSets.filter(s => s.campaignId === selectedCampaign);
    return adSets.filter(s => filteredCampanhas.some(c => c.id === s.campaignId));
  }, [adSets, filteredCampanhas, selectedCampaign]);
  const visibleAds = useMemo(() => {
    if (selectedAdSet) return ads.filter(a => a.adSetId === selectedAdSet);
    return ads.filter(a => visibleAdSets.some(s => s.id === a.adSetId));
  }, [ads, visibleAdSets, selectedAdSet]);

  const sortedCampaigns = useMemo(() => {
    return [...filteredCampanhas].sort((a, b) => {
      const A = a[sortBy] as number;
      const B = b[sortBy] as number;
      return sortBy === "cpl" ? A - B : B - A;
    });
  }, [filteredCampanhas, sortBy]);

  const totals = useMemo(() => ({
    spent: filteredCampanhas.reduce((s, c) => s + c.spent, 0),
    leads: filteredCampanhas.reduce((s, c) => s + c.leads, 0),
    receita: filteredCampanhas.reduce((s, c) => s + c.receitaAtribuida, 0),
  }), [filteredCampanhas]);
  const roasGlobal = totals.spent > 0 ? totals.receita / totals.spent : 0;
  const cplGlobal = totals.leads > 0 ? totals.spent / totals.leads : 0;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-[#1877F2]/10 text-[#1877F2] flex items-center justify-center">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-foreground">Meta Ads</h1>
              <p className="text-[12px] text-muted-foreground">
                {conta ? `${conta.name} · Pixel ${conta.pixelId}` : `${contas.length} contas conectadas`}
              </p>
            </div>
          </div>
        </div>
        <button className="text-[12px] inline-flex items-center gap-1.5 bg-card border border-border rounded-lg px-3 py-1.5 hover:bg-muted">
          <RefreshCw className="h-3.5 w-3.5" /> Sincronizar agora
        </button>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Investimento" value={formatBRLCompact(totals.spent)} icon={<DollarSign className="h-4 w-4" />} />
        <KpiCard label="Receita atribuída" value={formatBRLCompact(totals.receita)} icon={<DollarSign className="h-4 w-4" />} accent="success" />
        <KpiCard label="ROAS" value={formatRoas(roasGlobal)} icon={<Target className="h-4 w-4" />} accent="accent" />
        <KpiCard label="CPL médio" value={formatBRL(cplGlobal)} icon={<Users className="h-4 w-4" />} accent="warn" />
      </div>

      {/* Breadcrumb hierárquico */}
      {(selectedCampaign || selectedAdSet) && (
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <button onClick={() => { setSelectedCampaign(null); setSelectedAdSet(null); setTab("campanhas"); }} className="hover:text-foreground">Todas as campanhas</button>
          {selectedCampaign && (
            <>
              <ChevronRight className="h-3 w-3" />
              <button onClick={() => { setSelectedAdSet(null); setTab("conjuntos"); }} className="hover:text-foreground truncate max-w-[200px]">
                {filteredCampanhas.find(c => c.id === selectedCampaign)?.name}
              </button>
            </>
          )}
          {selectedAdSet && (
            <>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground truncate max-w-[200px]">{adSets.find(a => a.id === selectedAdSet)?.name}</span>
            </>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border">
        {(["campanhas", "conjuntos", "anuncios"] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-[12px] font-medium border-b-2 transition-colors ${
              tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "campanhas" ? "Campanhas" : t === "conjuntos" ? "Conjuntos de anúncios" : "Anúncios"}
            <span className="ml-1.5 text-[10px] text-muted-foreground">
              ({t === "campanhas" ? filteredCampanhas.length : t === "conjuntos" ? visibleAdSets.length : visibleAds.length})
            </span>
          </button>
        ))}
      </div>

      {/* Campanhas */}
      {tab === "campanhas" && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[12px] min-w-[960px]">
              <thead className="text-[10px] uppercase text-muted-foreground border-b border-border bg-muted/30">
                <tr>
                  <th className="text-left font-medium px-4 py-2.5 w-8"></th>
                  <th className="text-left font-medium px-2 py-2.5">Campanha</th>
                  <th className="text-left font-medium px-2 py-2.5">Objetivo</th>
                  <th className="text-right font-medium px-2 py-2.5 cursor-pointer" onClick={() => setSortBy("spent")}>Gasto</th>
                  <th className="text-right font-medium px-2 py-2.5">Impressões</th>
                  <th className="text-right font-medium px-2 py-2.5">CPC</th>
                  <th className="text-right font-medium px-2 py-2.5 cursor-pointer" onClick={() => setSortBy("leads")}>Leads</th>
                  <th className="text-right font-medium px-2 py-2.5 cursor-pointer" onClick={() => setSortBy("cpl")}>CPL</th>
                  <th className="text-right font-medium px-2 py-2.5">Receita</th>
                  <th className="text-right font-medium px-4 py-2.5 cursor-pointer" onClick={() => setSortBy("roas")}>ROAS</th>
                </tr>
              </thead>
              <tbody>
                {sortedCampaigns.map(c => (
                  <tr key={c.id} className="border-b border-border/50 hover:bg-muted/30 group">
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleCampanhaStatus(c.id)}
                        className={`h-5 w-9 rounded-full p-0.5 transition-colors ${c.status === "active" ? "bg-emerald-500" : "bg-muted"}`}
                        title={statusLabels[c.status]}
                      >
                        <div className={`h-4 w-4 rounded-full bg-white transition-transform ${c.status === "active" ? "translate-x-4" : ""}`} />
                      </button>
                    </td>
                    <td className="px-2 py-3">
                      <Link to={`/marketing/meta-ads/${c.id}`} className="font-medium text-foreground hover:text-primary truncate block max-w-[280px]">
                        {c.name}
                      </Link>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{statusLabels[c.status]} · desde {new Date(c.startDate).toLocaleDateString("pt-BR")}</p>
                    </td>
                    <td className="px-2 py-3">
                      <span className="text-[11px] bg-muted px-2 py-0.5 rounded-md">{objectiveLabels[c.objective]}</span>
                    </td>
                    <td className="px-2 py-3 text-right tabular-nums">{formatBRLCompact(c.spent)}</td>
                    <td className="px-2 py-3 text-right tabular-nums">{formatNum(c.impressions)}</td>
                    <td className="px-2 py-3 text-right tabular-nums">{formatBRL(c.cpc)}</td>
                    <td className="px-2 py-3 text-right tabular-nums font-medium">{formatNum(c.leads)}</td>
                    <td className="px-2 py-3 text-right tabular-nums">{formatBRL(c.cpl)}</td>
                    <td className="px-2 py-3 text-right tabular-nums">{formatBRLCompact(c.receitaAtribuida)}</td>
                    <td className="px-4 py-3 text-right">
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
      )}

      {/* Conjuntos */}
      {tab === "conjuntos" && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[12px] min-w-[820px]">
              <thead className="text-[10px] uppercase text-muted-foreground border-b border-border bg-muted/30">
                <tr>
                  <th className="text-left font-medium px-4 py-2.5">Conjunto · Audiência</th>
                  <th className="text-left font-medium px-2 py-2.5">Posicionamentos</th>
                  <th className="text-right font-medium px-2 py-2.5">Orçamento/dia</th>
                  <th className="text-right font-medium px-2 py-2.5">Gasto</th>
                  <th className="text-right font-medium px-2 py-2.5">Leads</th>
                  <th className="text-right font-medium px-2 py-2.5">CPL</th>
                  <th className="text-right font-medium px-4 py-2.5">ROAS</th>
                </tr>
              </thead>
              <tbody>
                {visibleAdSets.map(s => (
                  <tr key={s.id} className="border-b border-border/50 hover:bg-muted/30 cursor-pointer" onClick={() => { setSelectedAdSet(s.id); setTab("anuncios"); }}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground truncate max-w-[260px]">{s.name}</p>
                    </td>
                    <td className="px-2 py-3 text-[11px] text-muted-foreground">{s.placements.join(" · ")}</td>
                    <td className="px-2 py-3 text-right tabular-nums">{formatBRL(s.budgetDaily)}</td>
                    <td className="px-2 py-3 text-right tabular-nums">{formatBRLCompact(s.spent)}</td>
                    <td className="px-2 py-3 text-right tabular-nums">{formatNum(s.leads)}</td>
                    <td className="px-2 py-3 text-right tabular-nums">{formatBRL(s.cpl)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-semibold tabular-nums ${
                        s.roas >= 2 ? "text-emerald-600" : s.roas >= 1 ? "text-amber-600" : "text-rose-600"
                      }`}>
                        {formatRoas(s.roas)}
                      </span>
                    </td>
                  </tr>
                ))}
                {visibleAdSets.length === 0 && (
                  <tr><td colSpan={7} className="text-center text-muted-foreground py-8">Nenhum conjunto neste filtro</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Anúncios — grid de criativos */}
      {tab === "anuncios" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {visibleAds.map(a => (
            <div key={a.id} className="bg-card border border-border rounded-xl overflow-hidden group hover:shadow-md transition-shadow">
              <div className="aspect-square bg-muted relative">
                {a.creativeUrl ? (
                  <img src={a.creativeUrl} alt={a.name} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <ImageIcon className="h-8 w-8" />
                  </div>
                )}
                {a.isWinner && (
                  <span className="absolute top-2 left-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">Winner</span>
                )}
                <span className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">{a.format}</span>
              </div>
              <div className="p-3 space-y-1">
                <p className="text-[12px] font-medium text-foreground truncate">{a.headline}</p>
                <p className="text-[11px] text-muted-foreground truncate">{a.name}</p>
                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <span className="text-muted-foreground">CTR <span className="text-foreground font-medium tabular-nums">{a.ctr.toFixed(2)}%</span></span>
                  <span className="text-muted-foreground">CPL <span className="text-foreground font-medium tabular-nums">{formatBRL(a.cpl)}</span></span>
                </div>
                <div className="flex items-center justify-between pt-0.5 text-[11px]">
                  <span className="text-muted-foreground">Leads <span className="text-foreground font-medium tabular-nums">{formatNum(a.leads)}</span></span>
                  <span className={`font-semibold tabular-nums ${a.roas >= 2 ? "text-emerald-600" : a.roas >= 1 ? "text-amber-600" : "text-rose-600"}`}>
                    {formatRoas(a.roas)}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {visibleAds.length === 0 && (
            <div className="col-span-full text-center text-muted-foreground py-12 bg-card border border-border rounded-xl">
              Nenhum anúncio neste filtro
            </div>
          )}
        </div>
      )}
    </div>
  );
}
