// ============================================================================
// METAS V2 — modelo multidimensional (geral · marca · coleção · nicho)
// ----------------------------------------------------------------------------
// Regra: dimensões são LENTES sobre a mesma receita.
// Um pedido conta em quantas dimensões couber (marca do item + coleção do
// item + nicho do cliente) e SEMPRE na meta geral do período. Não há
// validação cruzada entre dimensões; só há validação de soma dentro do
// rateio de UMA meta.
// ============================================================================
import type { Seed, Representante } from "./seed";

export type DimensaoMeta = "geral" | "marca" | "colecao" | "nicho";
export type StatusMeta = "rascunho" | "publicada";

export interface MetaSecundarias {
  positivacao?: number; // clientes ativos com pedido no mês
  cobertura?: number;   // % de contas ativas atendidas
  novos?: number;       // clientes novos ativados no mês
  reativacao?: number;  // clientes reativados no mês
}

export interface RateioRep {
  repId: string;
  valor: number;
}

export interface MetaLogEntry {
  ts: string;               // ISO
  gestorId: string;
  evento:
    | "criada"
    | "atualizada"
    | "publicada"
    | "duplicada_de"
    | "substituida_via_duplicacao"
    | "convertida_rascunho";
  detalhe?: string;
  delta?: number;
}

export interface MetaV2 {
  id: string;
  periodo: string;              // "2026-08"
  dimensao: DimensaoMeta;
  alvoId: string | null;        // "Brandili" | "Inverno 25" | "Infantil" | null (geral)
  valorAgregado: number;
  rateio?: RateioRep[];         // opcional em dimensionais
  metasSecundarias?: MetaSecundarias; // só na geral
  status: StatusMeta;
  escopo: string;               // "nacional" | região
  log: MetaLogEntry[];
}

// ---- Catálogos derivados do seed ---------------------------------------
export function marcasCatalogo(seed: Seed): { id: string; nome: string }[] {
  return seed.marcas.map(m => ({ id: m.nome, nome: m.nome }));
}

export function colecoesCatalogo(seed: Seed): string[] {
  const set = new Set<string>();
  for (const p of seed.pedidos) if (p.colecao) set.add(p.colecao);
  return Array.from(set).sort();
}

export function nichosCatalogo(seed: Seed): string[] {
  const set = new Set<string>();
  for (const c of seed.contas) if (c.nicho) set.add(c.nicho);
  return Array.from(set).sort();
}

// ---- Helpers de período -------------------------------------------------
export function mesKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function mesLabel(periodo: string): string {
  const [y, m] = periodo.split("-").map(Number);
  const meses = ["janeiro", "fevereiro", "março", "abril", "maio", "junho",
                 "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
  return `${meses[m - 1]} ${y}`;
}

export function mesLabelCurto(periodo: string): string {
  const [y, m] = periodo.split("-").map(Number);
  const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
                 "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  return `${meses[m - 1]}/${String(y).slice(2)}`;
}

/** 12 meses a partir do corrente (inclusive). */
export function periodosPlanejamento(hoje: Date): string[] {
  const out: string[] = [];
  for (let i = 0; i < 12; i++) {
    out.push(mesKey(new Date(hoje.getFullYear(), hoje.getMonth() + i, 1)));
  }
  return out;
}

export function periodoEhFuturo(periodo: string, hoje: Date): boolean {
  return periodo > mesKey(hoje);
}
export function periodoEhCorrente(periodo: string, hoje: Date): boolean {
  return periodo === mesKey(hoje);
}

// ---- Rateio proporcional --------------------------------------------------
/**
 * Distribui `total` entre `reps` proporcionalmente ao peso indicado.
 * Se peso total = 0 ou vazio, distribui igual.
 */
export function rateioProporcional(
  total: number,
  reps: Representante[],
  pesos: Map<string, number>,
): RateioRep[] {
  if (!reps.length) return [];
  const somaPesos = reps.reduce((s, r) => s + (pesos.get(r.id) ?? 0), 0);
  if (somaPesos <= 0) {
    const parte = Math.round(total / reps.length);
    return reps.map(r => ({ repId: r.id, valor: parte }));
  }
  return reps.map(r => ({
    repId: r.id,
    valor: Math.round((pesos.get(r.id) ?? 0) / somaPesos * total),
  }));
}

// ---- Milestone de deprecação do fallback ---------------------------------
// Ver CockpitContext.tsx: se existe MetaV2 (geral) para o mês, ela é a
// única fonte. O array antigo `metas`/`metasPublicadas` é fallback
// temporário e deve ser removido até: 2026-Q3.
export const FALLBACK_METAS_LEGADO_REMOVER_ATE = "2026-Q3";
