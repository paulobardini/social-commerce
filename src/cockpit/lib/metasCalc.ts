// ============================================================================
// METAS V2 · Cálculos
// ----------------------------------------------------------------------------
// Realizado por dimensão, histórico 12m, veredito por ritmo diário útil.
// Regra de precedência: se existe MetaV2 (dimensao === "geral") publicada
// para o mês, ELA é a fonte para o mês. Fallback ao array antigo só quando
// nenhuma metaV2 geral existir para aquele período.
// ============================================================================
import type { Seed, Pedido, Marca } from "../data/seed";
import type { MetaV2, DimensaoMeta } from "../data/metasV2";
import { mesKey } from "../data/metasV2";
import { repIdsNoEscopo, type Escopo } from "./escopo";

// -------------------- filtros de pedidos por dimensão --------------------
function nomeMarca(marcas: Marca[], marcaId: string): string {
  return marcas.find(m => m.id === marcaId)?.nome ?? marcaId;
}

/** Pedidos que aderem a uma dimensão/alvo. */
export function pedidosDaDimensao(
  seed: Seed,
  dimensao: DimensaoMeta,
  alvoId: string | null,
): Pedido[] {
  if (dimensao === "geral") return seed.pedidos;
  if (dimensao === "marca") {
    return seed.pedidos.filter(p => nomeMarca(seed.marcas, p.marcaId) === alvoId);
  }
  if (dimensao === "colecao") {
    return seed.pedidos.filter(p => p.colecao === alvoId);
  }
  if (dimensao === "nicho") {
    const contasDoNicho = new Set(seed.contas.filter(c => c.nicho === alvoId).map(c => c.id));
    return seed.pedidos.filter(p => contasDoNicho.has(p.contaId));
  }
  return [];
}

/** Realizado no MÊS de uma meta, filtrado por escopo e opcionalmente por rep. */
export function realizadoMeta(
  seed: Seed,
  meta: MetaV2,
  escopo: Escopo,
  repId?: string,
): number {
  const reps = repIdsNoEscopo(seed, escopo);
  const [y, m] = meta.periodo.split("-").map(Number);
  const inicio = new Date(y, m - 1, 1);
  const fim = new Date(y, m, 1);

  return pedidosDaDimensao(seed, meta.dimensao, meta.alvoId)
    .filter(p => p.data >= inicio && p.data < fim)
    .filter(p => reps.has(p.repId))
    .filter(p => (repId ? p.repId === repId : true))
    .reduce((s, p) => s + p.valor, 0);
}

/** Histórico 12m (ordenado do mais antigo pro mais recente) de uma dimensão/alvo. */
export function historico12m(
  seed: Seed,
  dimensao: DimensaoMeta,
  alvoId: string | null,
  hoje: Date,
): { periodo: string; valor: number }[] {
  const pedidos = pedidosDaDimensao(seed, dimensao, alvoId);
  const out: { periodo: string; valor: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const dt = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    const dtFim = new Date(hoje.getFullYear(), hoje.getMonth() - i + 1, 1);
    const total = pedidos
      .filter(p => p.data >= dt && p.data < dtFim)
      .reduce((s, p) => s + p.valor, 0);
    out.push({ periodo: mesKey(dt), valor: total });
  }
  return out;
}

/** Peso proporcional de cada rep NAQUELA dimensão (últimos 12m). */
export function pesosPorRep12m(
  seed: Seed,
  dimensao: DimensaoMeta,
  alvoId: string | null,
  hoje: Date,
): Map<string, number> {
  const inicio = new Date(hoje.getFullYear(), hoje.getMonth() - 12, 1);
  const pedidos = pedidosDaDimensao(seed, dimensao, alvoId).filter(p => p.data >= inicio);
  const m = new Map<string, number>();
  for (const p of pedidos) m.set(p.repId, (m.get(p.repId) ?? 0) + p.valor);
  return m;
}

// -------------------- veredito em linguagem natural --------------------
export function busDaysInMonth(hoje: Date): number {
  let c = 0;
  const d = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  while (d.getMonth() === hoje.getMonth()) {
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) c++;
    d.setDate(d.getDate() + 1);
  }
  return c;
}

export function busDaysDecorridos(hoje: Date): number {
  let c = 0;
  const d = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const end = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  while (d <= end) {
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) c++;
    d.setDate(d.getDate() + 1);
  }
  return c;
}

export interface VerditoMeta {
  pct: number;
  paceProjetado: number;
  gap: number;
  rsPorDiaUtil: number;
  cor: "emerald" | "amber" | "rose";
  texto: string;
}

export function veredictoMeta(realizado: number, alvo: number, hoje: Date): VerditoMeta {
  const decorridos = Math.max(1, busDaysDecorridos(hoje));
  const totalUteis = Math.max(1, busDaysInMonth(hoje));
  const restantes = Math.max(1, totalUteis - decorridos);
  const paceProjetado = alvo > 0 ? (realizado / decorridos) * totalUteis : 0;
  const pct = alvo > 0 ? (paceProjetado / alvo) * 100 : 0;
  const gap = Math.max(0, alvo - realizado);
  const rsPorDiaUtil = gap / restantes;

  const cor: VerditoMeta["cor"] = pct >= 100 ? "emerald" : pct >= 85 ? "amber" : "rose";
  const texto = pct >= 100
    ? "No ritmo para bater a meta"
    : pct >= 85
      ? `Quase lá — precisa de R$ ${Math.round(rsPorDiaUtil).toLocaleString("pt-BR")}/dia útil`
      : `Ritmo abaixo — precisa de R$ ${Math.round(rsPorDiaUtil).toLocaleString("pt-BR")}/dia útil`;
  return { pct, paceProjetado, gap, rsPorDiaUtil, cor, texto };
}

// -------------------- comparação de RITMO DIÁRIO (corrige ranking evolução) --------------------
/**
 * Compara ritmo diário útil do mês corrente (incompleto) vs mês anterior (completo).
 * Evita distorção de comparar total absoluto quando o mês vigente ainda não fechou.
 */
export function evolucaoRitmoDiario(
  seed: Seed,
  repId: string,
): { atual: number; anterior: number; delta: number; ritmoAtual: number; ritmoAnterior: number } {
  const hoje = seed.hoje;
  const inicioAtual = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const inicioAnterior = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
  const fimAnterior = new Date(hoje.getFullYear(), hoje.getMonth(), 0);

  const atual = seed.pedidos.filter(p => p.repId === repId && p.data >= inicioAtual).reduce((s, p) => s + p.valor, 0);
  const anterior = seed.pedidos.filter(p => p.repId === repId && p.data >= inicioAnterior && p.data <= fimAnterior).reduce((s, p) => s + p.valor, 0);

  const decorridosAtual = Math.max(1, busDaysDecorridos(hoje));
  const totalUteisAnterior = (() => {
    let c = 0;
    const d = new Date(inicioAnterior);
    while (d < inicioAtual) {
      const dow = d.getDay();
      if (dow !== 0 && dow !== 6) c++;
      d.setDate(d.getDate() + 1);
    }
    return Math.max(1, c);
  })();

  const ritmoAtual = atual / decorridosAtual;
  const ritmoAnterior = anterior / totalUteisAnterior;
  const delta = ritmoAnterior > 0 ? ((ritmoAtual - ritmoAnterior) / ritmoAnterior) * 100 : 0;
  return { atual, anterior, delta, ritmoAtual, ritmoAnterior };
}

// -------------------- resolver meta geral do mês com precedência V2 --------------------
/**
 * Regra dura: se existe MetaV2 geral (publicada OU rascunho) para o mês,
 * ela é a única fonte. `metasPublicadas` (legado) só entra como fallback.
 * NÃO somar/misturar.
 */
export function metaGeralDoMes(
  metasV2: MetaV2[],
  periodo: string,
  escopo: Escopo,
  fallbackConsolidada?: number,
): { valor: number; fonte: "v2_publicada" | "v2_rascunho" | "legado" | "vazio" } {
  const v2 = metasV2.find(
    m => m.periodo === periodo && m.dimensao === "geral" && m.escopo === escopo,
  );
  if (v2) {
    return {
      valor: v2.valorAgregado,
      fonte: v2.status === "publicada" ? "v2_publicada" : "v2_rascunho",
    };
  }
  if (fallbackConsolidada && fallbackConsolidada > 0) {
    return { valor: fallbackConsolidada, fonte: "legado" };
  }
  return { valor: 0, fonte: "vazio" };
}

/** Meta rateada para 1 rep num mês (usa MetaV2 geral se houver; senão legado). */
export function metaDoRepNoMes(
  metasV2: MetaV2[],
  metasPublicadasLegado: Record<string, number>,
  repId: string,
  periodo: string,
  escopo: Escopo,
  fallbackSeed?: number,
): { valor: number; fonte: "v2" | "legado_publicado" | "legado_seed" | "vazio" } {
  const v2 = metasV2.find(
    m => m.periodo === periodo && m.dimensao === "geral" && m.escopo === escopo,
  );
  if (v2) {
    const parcela = v2.rateio?.find(r => r.repId === repId)?.valor ?? 0;
    return { valor: parcela, fonte: "v2" };
  }
  const legado = metasPublicadasLegado[`${repId}:${periodo}`];
  if (legado !== undefined) return { valor: legado, fonte: "legado_publicado" };
  if (fallbackSeed && fallbackSeed > 0) return { valor: fallbackSeed, fonte: "legado_seed" };
  return { valor: 0, fonte: "vazio" };
}

// -------------------- sugestões dimensionais (fila do vendedor) --------------------
/**
 * Para uma meta dimensional atrasada, retorna clientes candidatos a serem
 * empurrados (mesmo motor das sugeridas). A chave inclui alvo (evita colisão
 * entre coleções atrasadas ao mesmo tempo).
 */
export function sugestoesClientesParaMeta(
  seed: Seed,
  meta: MetaV2,
  repId: string,
  limit = 8,
): { chave: string; clienteId: string; clienteNome: string; motivo: string }[] {
  if (meta.dimensao === "geral") return [];
  const hoje = seed.hoje;
  // Clientes do rep no nicho (para dimensao nicho); para marca/colecao, clientes que já
  // compraram algo daquela dimensão nos últimos 12m.
  let candidatos = seed.contas.filter(c => c.repId === repId);
  if (meta.dimensao === "nicho") {
    candidatos = candidatos.filter(c => c.nicho === meta.alvoId);
  } else {
    const pedidosDim = pedidosDaDimensao(seed, meta.dimensao, meta.alvoId);
    const contasComHist = new Set(pedidosDim.map(p => p.contaId));
    candidatos = candidatos.filter(c => contasComHist.has(c.id));
  }
  // Corta os que já compraram DAQUELA dimensão no mês corrente
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const jaCompraram = new Set(
    pedidosDaDimensao(seed, meta.dimensao, meta.alvoId)
      .filter(p => p.data >= inicioMes)
      .map(p => p.contaId),
  );
  candidatos = candidatos.filter(c => !jaCompraram.has(c.id));

  const alvoSlug = (meta.alvoId ?? "").toLowerCase().replace(/\s+/g, "_");
  return candidatos.slice(0, limit).map(c => ({
    chave: `push_${meta.dimensao}_${alvoSlug}_${c.id}`,
    clienteId: c.id,
    clienteNome: c.razao,
    motivo: meta.dimensao === "colecao"
      ? `ainda não viu ${meta.alvoId}`
      : meta.dimensao === "marca"
        ? `costuma comprar ${meta.alvoId} e não pediu este mês`
        : `${meta.alvoId} — sem pedido no mês`,
  }));
}
