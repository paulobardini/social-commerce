import { createContext, useContext, useEffect, useMemo, useState, useCallback, type ReactNode } from "react";
import { buildSeed, type Seed } from "../data/seed";
import { resolveRange, previousOf, type DateRange, type PeriodKey } from "../lib/range";
import type { AprovacaoLog, MetaLog } from "../lib/decisoes";
import type { Escopo } from "../lib/escopo";
import { escopoPermitido } from "../lib/escopo";
import { useVendedorPerfilCtx } from "@/hooks/useVendedorPerfil";
import type { MetaV2, MetaSecundarias, RateioRep } from "../data/metasV2";

interface DuplicarMesArgs {
  origem: string;
  destinos: string[];
  ajustePct: number;
  sobrescreverPublicadas: boolean;
}

interface SalvarMetaArgs {
  id?: string;                    // se vier, atualiza
  periodo: string;
  dimensao: MetaV2["dimensao"];
  alvoId: string | null;
  valorAgregado: number;
  rateio?: RateioRep[];
  metasSecundarias?: MetaSecundarias;
  escopo: string;
  gestorId: string;
  publicar?: boolean;             // publica na mesma operação
}

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

  // Metas V2 (multidimensional + meses futuros) — FONTE PRINCIPAL
  metasV2: MetaV2[];
  salvarMeta: (m: SalvarMetaArgs) => MetaV2;
  publicarMetaV2: (id: string, gestorId: string) => void;
  removerMetaV2: (id: string) => void;
  duplicarMes: (args: DuplicarMesArgs) => void;

  // LEGADO (fallback temporário até 2026-Q3) — só usar via helpers metasCalc
  metasPublicadas: Record<string, number>;
  publicarMetas: (payload: {
    mes: string;
    escopoAlvo: string;
    metaAgregada: number;
    reps: { repId: string; valor: number }[];
    mudancaMesCorrente: boolean;
    gestorId: string;
  }) => void;

  // campanhas de push idempotentes
  campanhasPush: Record<string, { criadaEm: string; texto: string }>;
  registrarCampanhaPush: (chave: string, texto: string) => void;

  // dados
  seed: Seed;
}

const Ctx = createContext<CockpitContextValue | null>(null);

const STORAGE = "cockpit:cfg:v3";
interface StoredCfg {
  diasAtivo?: number;
  diasPerdido?: number;
  aprovacoesLog?: AprovacaoLog[];
  metasLog?: MetaLog[];
  metasPublicadas?: Record<string, number>;
  campanhasPush?: Record<string, { criadaEm: string; texto: string }>;
  metasV2?: MetaV2[];
}

function loadCfg(): StoredCfg {
  try { return JSON.parse(localStorage.getItem(STORAGE) ?? "{}"); } catch { return {}; }
}
function saveCfg(cfg: StoredCfg) {
  try { localStorage.setItem(STORAGE, JSON.stringify(cfg)); } catch { /* noop */ }
}

function ts() { return new Date().toISOString(); }
function newId() { return `mv2-${Date.now()}-${Math.floor(Math.random() * 1e5)}`; }

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
  const [metasV2, setMetasV2] = useState<MetaV2[]>(stored.metasV2 ?? []);

  useEffect(() => {
    saveCfg({ diasAtivo, diasPerdido, aprovacoesLog, metasLog, metasPublicadas, campanhasPush, metasV2 });
  }, [diasAtivo, diasPerdido, aprovacoesLog, metasLog, metasPublicadas, campanhasPush, metasV2]);

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

  // ==== Metas V2 ====
  const salvarMeta = useCallback((args: SalvarMetaArgs): MetaV2 => {
    let saved!: MetaV2;
    setMetasV2(prev => {
      const idx = args.id ? prev.findIndex(m => m.id === args.id) : -1;
      const base: MetaV2 = idx >= 0 ? prev[idx] : {
        id: newId(),
        periodo: args.periodo,
        dimensao: args.dimensao,
        alvoId: args.alvoId,
        valorAgregado: 0,
        status: "rascunho",
        escopo: args.escopo,
        log: [{ ts: ts(), gestorId: args.gestorId, evento: "criada" }],
      };
      const delta = args.valorAgregado - base.valorAgregado;
      const atualizada: MetaV2 = {
        ...base,
        valorAgregado: args.valorAgregado,
        rateio: args.rateio,
        metasSecundarias: args.metasSecundarias,
        alvoId: args.alvoId,
        dimensao: args.dimensao,
        periodo: args.periodo,
        escopo: args.escopo,
        log: [
          ...base.log,
          idx >= 0
            ? { ts: ts(), gestorId: args.gestorId, evento: "atualizada" as const, delta }
            : null,
          args.publicar ? { ts: ts(), gestorId: args.gestorId, evento: "publicada" as const } : null,
        ].filter(Boolean) as MetaV2["log"],
        status: args.publicar ? "publicada" : base.status,
      };
      saved = atualizada;
      const next = prev.slice();
      if (idx >= 0) next[idx] = atualizada; else next.push(atualizada);
      return next;
    });
    return saved;
  }, []);

  const publicarMetaV2 = useCallback((id: string, gestorId: string) => {
    setMetasV2(prev => prev.map(m => m.id === id
      ? { ...m, status: "publicada", log: [...m.log, { ts: ts(), gestorId, evento: "publicada" }] }
      : m,
    ));
  }, []);

  const removerMetaV2 = useCallback((id: string) => {
    setMetasV2(prev => prev.filter(m => m.id !== id));
  }, []);

  const duplicarMes = useCallback((args: DuplicarMesArgs) => {
    const { origem, destinos, ajustePct, sobrescreverPublicadas } = args;
    setMetasV2(prev => {
      const daOrigem = prev.filter(m => m.periodo === origem);
      if (!daOrigem.length) return prev;
      const fator = 1 + (ajustePct / 100);
      const next = prev.slice();
      for (const destino of destinos) {
        for (const src of daOrigem) {
          const doDestinoMesmoAlvo = next.findIndex(m =>
            m.periodo === destino && m.dimensao === src.dimensao && m.alvoId === src.alvoId && m.escopo === src.escopo,
          );
          if (doDestinoMesmoAlvo >= 0 && next[doDestinoMesmoAlvo].status === "publicada" && !sobrescreverPublicadas) {
            continue;
          }
          const novo: MetaV2 = {
            id: newId(),
            periodo: destino,
            dimensao: src.dimensao,
            alvoId: src.alvoId,
            valorAgregado: Math.round(src.valorAgregado * fator),
            rateio: src.rateio?.map(r => ({ repId: r.repId, valor: Math.round(r.valor * fator) })),
            metasSecundarias: src.metasSecundarias,
            status: "rascunho",
            escopo: src.escopo,
            log: [{
              ts: ts(),
              gestorId: "gestor-atual",
              evento: "duplicada_de",
              detalhe: `Duplicada de ${origem} (ajuste ${ajustePct}%)`,
            }],
          };
          if (doDestinoMesmoAlvo >= 0) {
            const antigo = next[doDestinoMesmoAlvo];
            novo.log.push({
              ts: ts(),
              gestorId: "gestor-atual",
              evento: "substituida_via_duplicacao",
              detalhe: `Substituiu meta ${antigo.status} anterior (${antigo.id}) via duplicação de ${origem}`,
            });
            next[doDestinoMesmoAlvo] = novo;
          } else {
            next.push(novo);
          }
        }
      }
      return next;
    });
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
    metasLog,
    metasV2, salvarMeta, publicarMetaV2, removerMetaV2, duplicarMes,
    metasPublicadas, publicarMetas,
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
