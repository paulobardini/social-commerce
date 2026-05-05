import { createContext, useContext, useEffect, useState, ReactNode, useMemo } from "react";
import { mockMetaAccounts, mockMetaCampaigns, mockMetaAdSets, mockMetaAds, MetaAccount, MetaCampaign, MetaAdSet, MetaAd } from "../data/mockMeta";
import { mockLeadsAtribuidos, mockAlertasMkt, mockIntegracoes, mockMonthlyTrend, LeadAtribuido, AlertaMkt, Integracao, MonthlyKpi } from "../data/mockMarketing";
import { mockCampanhas, mockSegmentos, Campanha, SegmentoAudiencia, StatusCampanha } from "../data/mockCampanhas";

type Periodo = "7d" | "30d" | "90d" | "ytd";

interface Ctx {
  // dados
  contas: MetaAccount[];
  campanhas: MetaCampaign[];
  adSets: MetaAdSet[];
  ads: MetaAd[];
  leads: LeadAtribuido[];
  alertas: AlertaMkt[];
  integracoes: Integracao[];
  trend: MonthlyKpi[];
  // filtros globais
  periodo: Periodo;
  setPeriodo: (p: Periodo) => void;
  contaId: string | "all";
  setContaId: (id: string | "all") => void;
  // mutations
  toggleCampanhaStatus: (id: string) => void;
  conectarIntegracao: (id: string, conta: string) => void;
  desconectarIntegracao: (id: string) => void;
  syncIntegracao: (id: string) => void;
  // helpers
  filteredCampanhas: MetaCampaign[];
}

const MarketingCtx = createContext<Ctx | null>(null);
const KEY = "nextil_mkt_state_v1";

export function MarketingDataProvider({ children }: { children: ReactNode }) {
  const [contas] = useState<MetaAccount[]>(mockMetaAccounts);
  const [campanhas, setCampanhas] = useState<MetaCampaign[]>(mockMetaCampaigns);
  const [adSets] = useState<MetaAdSet[]>(mockMetaAdSets);
  const [ads] = useState<MetaAd[]>(mockMetaAds);
  const [leads] = useState<LeadAtribuido[]>(mockLeadsAtribuidos);
  const [alertas] = useState<AlertaMkt[]>(mockAlertasMkt);
  const [trend] = useState<MonthlyKpi[]>(mockMonthlyTrend);

  const [integracoes, setIntegracoes] = useState<Integracao[]>(() => {
    try {
      const raw = localStorage.getItem(KEY + "_integ");
      if (raw) return JSON.parse(raw);
    } catch { /* noop */ }
    return mockIntegracoes;
  });
  const [periodo, setPeriodo] = useState<Periodo>("30d");
  const [contaId, setContaId] = useState<string | "all">("all");

  useEffect(() => {
    localStorage.setItem(KEY + "_integ", JSON.stringify(integracoes));
  }, [integracoes]);

  const toggleCampanhaStatus = (id: string) => {
    setCampanhas(prev => prev.map(c => c.id === id ? { ...c, status: c.status === "active" ? "paused" : "active" } : c));
  };

  const conectarIntegracao = (id: string, conta: string) => {
    setIntegracoes(prev => prev.map(i => i.id === id ? { ...i, status: "conectado", conta, ultimoSync: "Agora há pouco" } : i));
  };
  const desconectarIntegracao = (id: string) => {
    setIntegracoes(prev => prev.map(i => i.id === id ? { ...i, status: "desconectado", conta: undefined, ultimoSync: undefined } : i));
  };
  const syncIntegracao = (id: string) => {
    setIntegracoes(prev => prev.map(i => i.id === id ? { ...i, ultimoSync: "Agora há pouco" } : i));
  };

  const filteredCampanhas = useMemo(() => {
    return campanhas.filter(c => contaId === "all" || c.accountId === contaId);
  }, [campanhas, contaId]);

  return (
    <MarketingCtx.Provider value={{
      contas, campanhas, adSets, ads, leads, alertas, integracoes, trend,
      periodo, setPeriodo, contaId, setContaId,
      toggleCampanhaStatus, conectarIntegracao, desconectarIntegracao, syncIntegracao,
      filteredCampanhas,
    }}>
      {children}
    </MarketingCtx.Provider>
  );
}

export function useMarketing() {
  const ctx = useContext(MarketingCtx);
  if (!ctx) throw new Error("useMarketing must be used within MarketingDataProvider");
  return ctx;
}
