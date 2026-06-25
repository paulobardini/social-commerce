import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { buildSeed, type Seed } from "../data/seed";
import { resolveRange, previousOf, type DateRange, type PeriodKey } from "../lib/range";

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

  // classificação
  diasAtivo: number;
  diasPerdido: number;
  setDiasAtivo: (n: number) => void;
  setDiasPerdido: (n: number) => void;
  resetClassificacao: () => void;

  // representante (para painel vendedor)
  repId: string | "todos";
  setRepId: (id: string | "todos") => void;

  // dados
  seed: Seed;
}

const Ctx = createContext<CockpitContextValue | null>(null);

const STORAGE = "cockpit:cfg:v1";

interface StoredCfg { diasAtivo?: number; diasPerdido?: number; }

function loadCfg(): StoredCfg {
  try { return JSON.parse(localStorage.getItem(STORAGE) ?? "{}"); } catch { return {}; }
}

function saveCfg(cfg: StoredCfg) {
  try { localStorage.setItem(STORAGE, JSON.stringify(cfg)); } catch { /* noop */ }
}

export function CockpitProvider({ children }: { children: ReactNode }) {
  const seed = useMemo(() => buildSeed(), []);
  const stored = loadCfg();

  const [period, setPeriod] = useState<PeriodKey>("30d");
  const [customRange, setCustomRange] = useState<DateRange | undefined>(undefined);
  const [comparar, setComparar] = useState(true);
  const [diasAtivo, setDiasAtivoState] = useState(stored.diasAtivo ?? 60);
  const [diasPerdido, setDiasPerdidoState] = useState(stored.diasPerdido ?? 180);
  const [repId, setRepId] = useState<string | "todos">(seed.representantes[0]?.id ?? "todos");

  useEffect(() => { saveCfg({ diasAtivo, diasPerdido }); }, [diasAtivo, diasPerdido]);

  const range = useMemo(() => resolveRange(period, customRange, seed.hoje), [period, customRange, seed.hoje]);
  const previousRange = useMemo(() => previousOf(range), [range]);

  const value: CockpitContextValue = {
    period, setPeriod, customRange, setCustomRange,
    comparar, setComparar,
    range, previousRange,
    diasAtivo, diasPerdido,
    setDiasAtivo: (n) => setDiasAtivoState(Math.max(7, Math.min(365, n))),
    setDiasPerdido: (n) => setDiasPerdidoState(Math.max(30, Math.min(730, n))),
    resetClassificacao: () => { setDiasAtivoState(60); setDiasPerdidoState(180); },
    repId, setRepId,
    seed,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCockpit() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useCockpit deve ser usado dentro de <CockpitProvider>");
  return v;
}
