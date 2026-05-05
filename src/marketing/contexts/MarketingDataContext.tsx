import { createContext, useContext, useEffect, useState, ReactNode, useMemo } from "react";
import { mockMetaAccounts, mockMetaCampaigns, mockMetaAdSets, mockMetaAds, MetaAccount, MetaCampaign, MetaAdSet, MetaAd } from "../data/mockMeta";
import { mockLeadsAtribuidos, mockAlertasMkt, mockIntegracoes, mockMonthlyTrend, LeadAtribuido, AlertaMkt, Integracao, MonthlyKpi } from "../data/mockMarketing";
import { mockCampanhas, mockSegmentos, Campanha, SegmentoAudiencia, StatusCampanha } from "../data/mockCampanhas";
import { mockJornadas, Jornada, StatusJornada } from "../data/mockJornadas";
import { mockLookbooks, Lookbook, StatusLookbook } from "../data/mockLookbooks";
import { mockAudiencias, avaliarRegras, Audiencia, RegraAudiencia, AudienciaStatus } from "../data/mockAudiencias";
import { HandoffRecord, HandoffStatus, mockHandoffSeed } from "../data/mockHandoff";

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
  // campanhas próprias
  proprias: Campanha[];
  segmentos: SegmentoAudiencia[];
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
  // mutations de campanhas próprias
  criarCampanha: (c: Omit<Campanha, "id" | "criadaEm">) => string;
  atualizarStatusCampanha: (id: string, status: StatusCampanha) => void;
  duplicarCampanha: (id: string) => void;
  excluirCampanha: (id: string) => void;
  // jornadas
  jornadas: Jornada[];
  atualizarJornada: (j: Jornada) => void;
  criarJornada: (j: Omit<Jornada, "id" | "criadaEm" | "ultimaEdicao">) => string;
  setStatusJornada: (id: string, status: StatusJornada) => void;
  excluirJornada: (id: string) => void;
  duplicarJornada: (id: string) => void;
  // lookbooks
  lookbooks: Lookbook[];
  atualizarLookbook: (l: Lookbook) => void;
  criarLookbook: (l: Omit<Lookbook, "id" | "criadoEm">) => string;
  setStatusLookbook: (id: string, status: StatusLookbook) => void;
  excluirLookbook: (id: string) => void;
  duplicarLookbook: (id: string) => void;
  registrarLookbookView: (slug: string, origem: "whatsapp" | "email" | "direto" | "qr_code") => void;
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

  const [proprias, setProprias] = useState<Campanha[]>(() => {
    try {
      const raw = localStorage.getItem(KEY + "_camps");
      if (raw) return JSON.parse(raw);
    } catch { /* noop */ }
    return mockCampanhas;
  });
  const [segmentos] = useState<SegmentoAudiencia[]>(mockSegmentos);

  useEffect(() => {
    localStorage.setItem(KEY + "_integ", JSON.stringify(integracoes));
  }, [integracoes]);
  useEffect(() => {
    localStorage.setItem(KEY + "_camps", JSON.stringify(proprias));
  }, [proprias]);

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

  const criarCampanha: Ctx["criarCampanha"] = (data) => {
    const id = `camp_${Date.now()}`;
    const today = new Date().toLocaleDateString("pt-BR");
    setProprias(prev => [{ ...data, id, criadaEm: today }, ...prev]);
    return id;
  };
  const atualizarStatusCampanha = (id: string, status: StatusCampanha) => {
    setProprias(prev => prev.map(c => c.id === id ? { ...c, status } : c));
  };
  const duplicarCampanha = (id: string) => {
    setProprias(prev => {
      const orig = prev.find(c => c.id === id);
      if (!orig) return prev;
      const copy: Campanha = { ...orig, id: `camp_${Date.now()}`, nome: `${orig.nome} (cópia)`, status: "rascunho", criadaEm: new Date().toLocaleDateString("pt-BR"), enviadaEm: undefined, agendadaPara: undefined };
      return [copy, ...prev];
    });
  };
  const excluirCampanha = (id: string) => {
    setProprias(prev => prev.filter(c => c.id !== id));
  };

  // ===== Jornadas =====
  const [jornadas, setJornadas] = useState<Jornada[]>(() => {
    try { const raw = localStorage.getItem(KEY + "_jor"); if (raw) return JSON.parse(raw); } catch { /* */ }
    return mockJornadas;
  });
  useEffect(() => { localStorage.setItem(KEY + "_jor", JSON.stringify(jornadas)); }, [jornadas]);
  const today = () => new Date().toLocaleDateString("pt-BR");
  const atualizarJornada = (j: Jornada) => setJornadas(prev => prev.map(x => x.id === j.id ? { ...j, ultimaEdicao: today() } : x));
  const criarJornada: Ctx["criarJornada"] = (data) => {
    const id = `jor_${Date.now()}`;
    setJornadas(prev => [{ ...data, id, criadaEm: today(), ultimaEdicao: today() }, ...prev]);
    return id;
  };
  const setStatusJornada = (id: string, status: StatusJornada) => setJornadas(prev => prev.map(j => j.id === id ? { ...j, status, ultimaEdicao: today() } : j));
  const excluirJornada = (id: string) => setJornadas(prev => prev.filter(j => j.id !== id));
  const duplicarJornada = (id: string) => setJornadas(prev => {
    const o = prev.find(j => j.id === id); if (!o) return prev;
    return [{ ...o, id: `jor_${Date.now()}`, nome: `${o.nome} (cópia)`, status: "rascunho", criadaEm: today(), ultimaEdicao: today(), totalEntraram: 0, ativos: 0, concluiram: 0, conversoes: 0, receitaAtribuida: 0 }, ...prev];
  });

  // ===== Lookbooks =====
  const [lookbooks, setLookbooks] = useState<Lookbook[]>(() => {
    try { const raw = localStorage.getItem(KEY + "_lkb"); if (raw) return JSON.parse(raw); } catch { /* */ }
    return mockLookbooks;
  });
  useEffect(() => { localStorage.setItem(KEY + "_lkb", JSON.stringify(lookbooks)); }, [lookbooks]);
  const atualizarLookbook = (l: Lookbook) => setLookbooks(prev => prev.map(x => x.id === l.id ? l : x));
  const criarLookbook: Ctx["criarLookbook"] = (data) => {
    const id = `lkb_${Date.now()}`;
    setLookbooks(prev => [{ ...data, id, criadoEm: today() }, ...prev]);
    return id;
  };
  const setStatusLookbook = (id: string, status: StatusLookbook) => setLookbooks(prev => prev.map(l => l.id === id ? { ...l, status, publicadoEm: status === "publicado" ? today() : l.publicadoEm } : l));
  const excluirLookbook = (id: string) => setLookbooks(prev => prev.filter(l => l.id !== id));
  const duplicarLookbook = (id: string) => setLookbooks(prev => {
    const o = prev.find(l => l.id === id); if (!o) return prev;
    return [{ ...o, id: `lkb_${Date.now()}`, nome: `${o.nome} (cópia)`, slug: `${o.slug}-${Date.now().toString().slice(-4)}`, status: "rascunho", criadoEm: today(), publicadoEm: undefined, views: 0, visualizadoresUnicos: 0, cliquesProduto: 0, conversoes: 0, receitaAtribuida: 0, logs: [] }, ...prev];
  });
  const registrarLookbookView = (slug: string, origem: "whatsapp" | "email" | "direto" | "qr_code") => {
    setLookbooks(prev => prev.map(l => l.slug === slug ? {
      ...l,
      views: l.views + 1,
      visualizadoresUnicos: l.visualizadoresUnicos + 1,
      logs: [{ id: `log_${Date.now()}`, data: new Date().toLocaleString("pt-BR"), origem, duracaoSeg: 0, paginasVistas: 1, cliquesProduto: 0, converteu: false }, ...l.logs].slice(0, 50),
    } : l));
  };

  const filteredCampanhas = useMemo(() => {
    return campanhas.filter(c => contaId === "all" || c.accountId === contaId);
  }, [campanhas, contaId]);

  return (
    <MarketingCtx.Provider value={{
      contas, campanhas, adSets, ads, leads, alertas, integracoes, trend,
      proprias, segmentos,
      periodo, setPeriodo, contaId, setContaId,
      toggleCampanhaStatus, conectarIntegracao, desconectarIntegracao, syncIntegracao,
      criarCampanha, atualizarStatusCampanha, duplicarCampanha, excluirCampanha,
      jornadas, atualizarJornada, criarJornada, setStatusJornada, excluirJornada, duplicarJornada,
      lookbooks, atualizarLookbook, criarLookbook, setStatusLookbook, excluirLookbook, duplicarLookbook, registrarLookbookView,
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
