import { createContext, useContext, useEffect, useMemo, useState, useCallback, type ReactNode } from "react";
import { buildSeed, type Seed } from "../data/seed";
import { resolveRange, previousOf, type DateRange, type PeriodKey } from "../lib/range";
import type { AprovacaoLog, MetaLog } from "../lib/decisoes";
import type { Escopo } from "../lib/escopo";
import { escopoPermitido } from "../lib/escopo";
import { useVendedorPerfilCtx } from "@/hooks/useVendedorPerfil";

interface CockpitContextValue {
  // período
  period: PeriodKey;
  setPeriod: (p: PeriodKey) => void;
  customRange?: DateRange;
  setCustomRange: (r: DateRange | undefined) => void;
  comparar: boolean;
  setComparar: (b: boolean) => void;
  range: DateRange;
  previousRange: DateRange;

  // escopo hierárquico (nacional / regiao)
  escopo: Escopo;
  setEscopo: (e: Escopo) => void;

  // classificação
  diasAtivo: number;
  diasPerdido: number;
  setDiasAtivo: (n: number) => void;
  setDiasPerdido: (n: number) => void;
  resetClassificacao: () => void;

  // representante (para painel vendedor)
  repId: string | "todos";
  setRepId: (id: string | "todos") => void;

  // auditoria e ações do gestor
  aprovacoesLog: AprovacaoLog[];
  registrarAprovacao: (log: Omit<AprovacaoLog, "id" | "timestamp">) => void;
  metasLog: MetaLog[];
  metasPublicadas: Record<string, number>; // key: `${repId}:${mes}`
  publicarMetas: (payload: {
    mes: string;
    escopoAlvo: string;
    metaAgregada: number;
    reps: { repId: string; valor: number }[];
    mudancaMesCorrente: boolean;
    gestorId: string;
  }) => void;

  // campanhas de push idempotentes (chave motivo → última execução)
  campanhasPush: Record<string, { criadaEm: string; texto: string }>;
  registrarCampanhaPush: (chave: string, texto: string) => void;

  // dados
  seed: Seed;
}

const Ctx = createContext<CockpitContextValue | null>(null);

const STORAGE = "cockpit:cfg:v2";
interface StoredCfg {
  diasAtivo?: number;
  diasPerdido?: number;
  aprovacoesLog?: AprovacaoLog[];
  metasLog?: MetaLog[];
  metasPublicadas?: Record<string, number>;
  campanhasPush?: Record<string, { criadaEm: string; texto: string }>;
}

function loadCfg(): StoredCfg {
  try { return JSON.parse(localStorage.getItem(STORAGE) ?? "{}"); } catch { return {}; }
}
function saveCfg(cfg: StoredCfg) {
  try { localStorage.setItem(STORAGE, JSON.stringify(cfg)); } catch { /* noop */ }
}

export function CockpitProvider({ children }: { children: ReactNode }) {
  const seed = useMemo(() => buildSeed(), []);
  const stored = loadCfg();
  const perfil = useVendedorPerfilCtx();

  const [period, setPeriod] = useState<PeriodKey>("30d");
  const [customRange, setCustomRange] = useState<DateRange | undefined>(undefined);
  const [comparar, setComparar] = useState(true);
  const [diasAtivo, setDiasAtivoState] = useState(stored.diasAtivo ?? 60);
  const [diasPerdido, setDiasPerdidoState] = useState(stored.diasPerdido ?? 180);
  const [repId, setRepId] = useState<string | "todos">(seed.representantes[0]?.id ?? "todos");
  const [escopoState, setEscopoState] = useState<Escopo>(perfil.perfil === "gestor_regional" && perfil.regiao ? perfil.regiao : "nacional");
  const [aprovacoesLog, setAprovacoesLog] = useState<AprovacaoLog[]>(stored.aprovacoesLog ?? []);
  const [metasLog, setMetasLog] = useState<MetaLog[]>(stored.metasLog ?? []);
  const [metasPublicadas, setMetasPublicadas] = useState<Record<string, number>>(stored.metasPublicadas ?? {});
  const [campanhasPush, setCampanhasPush] = useState<Record<string, { criadaEm: string; texto: string }>>(stored.campanhasPush ?? {});

  useEffect(() => {
    saveCfg({ diasAtivo, diasPerdido, aprovacoesLog, metasLog, metasPublicadas, campanhasPush });
  }, [diasAtivo, diasPerdido, aprovacoesLog, metasLog, metasPublicadas, campanhasPush]);

  const setEscopo = useCallback((e: Escopo) => setEscopoState(escopoPermitido(perfil, e)), [perfil]);
  const escopo = escopoPermitido(perfil, escopoState);

  const registrarAprovacao = useCallback((log: Omit<AprovacaoLog, "id" | "timestamp">) => {
    setAprovacoesLog(prev => [...prev, { ...log, id: `apv-${Date.now()}`, timestamp: new Date().toISOString() }]);
  }, []);

  const publicarMetas: CockpitContextValue["publicarMetas"] = useCallback((payload) => {
    const patch: Record<string, number> = {};
    payload.reps.forEach(r => { patch[`${r.repId}:${payload.mes}`] = r.valor; });
    setMetasPublicadas(prev => ({ ...prev, ...patch }));
    setMetasLog(prev => [...prev, {
      id: `mlog-${Date.now()}`,
      mes: payload.mes,
      escopo: payload.escopoAlvo,
      totalMeta: payload.metaAgregada,
      gestorId: payload.gestorId,
      timestamp: new Date().toISOString(),
      mudancaMesCorrente: payload.mudancaMesCorrente,
      detalhesReps: payload.reps,
    }]);
  }, []);

  const registrarCampanhaPush = useCallback((chave: string, texto: string) => {
    setCampanhasPush(prev => ({ ...prev, [chave]: { criadaEm: new Date().toISOString(), texto } }));
  }, []);

  const range = useMemo(() => resolveRange(period, customRange, seed.hoje), [period, customRange, seed.hoje]);
  const previousRange = useMemo(() => previousOf(range), [range]);

  const value: CockpitContextValue = {
    period, setPeriod, customRange, setCustomRange,
    comparar, setComparar,
    range, previousRange,
    escopo, setEscopo,
    diasAtivo, diasPerdido,
    setDiasAtivo: (n) => setDiasAtivoState(Math.max(7, Math.min(365, n))),
    setDiasPerdido: (n) => setDiasPerdidoState(Math.max(30, Math.min(730, n))),
    resetClassificacao: () => { setDiasAtivoState(60); setDiasPerdidoState(180); },
    repId, setRepId,
    aprovacoesLog, registrarAprovacao,
    metasLog, metasPublicadas, publicarMetas,
    campanhasPush, registrarCampanhaPush,
    seed,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCockpit() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useCockpit deve ser usado dentro de <CockpitProvider>");
  return v;
}
