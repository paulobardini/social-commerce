// Motor de INSIGHTS do Painel Gestor (por pilar).
// Regras puras a partir dos mesmos selectors já usados pelo painel.
// Cada insight tem severidade + texto de 1 frase + 1 ação.
import type { Seed, Representante } from "../data/seed";
import type { Escopo } from "./escopo";
import { repIdsNoEscopo, repsNoEscopo } from "./escopo";
import { classificarTudo, type ContaClassificada } from "./classificar";
import { curvaAbc } from "./abc";
import { negociosGrandesParados } from "./decisoes";
import type { DateRange } from "./range";

export type Severidade = "critico" | "atencao" | "oportunidade";
export type DrawerKey = "clientes_risco" | "negocios_parados";

export interface Insight {
  id: string;
  severidade: Severidade;
  texto: string;
  acao: { label: string; href?: string; drawer?: DrawerKey; hash?: string };
  valorRef?: number; // usado para ordenar por valor em jogo
}

const ordemSev: Record<Severidade, number> = { critico: 0, atencao: 1, oportunidade: 2 };
function ordena(a: Insight, b: Insight) {
  const s = ordemSev[a.severidade] - ordemSev[b.severidade];
  if (s !== 0) return s;
  return (b.valorRef ?? 0) - (a.valorRef ?? 0);
}
function limitar(arr: Insight[], n = 4): Insight[] {
  return arr.slice().sort(ordena).slice(0, n);
}

// ========================================================
// CARTEIRA
// ========================================================
export function insightsCarteira(
  seed: Seed,
  escopo: Escopo,
  range: DateRange,
  diasAtivo: number,
  diasPerdido: number,
): Insight[] {
  const repIds = repIdsNoEscopo(seed, escopo);
  const contas = seed.contas.filter(c => repIds.has(c.repId));
  const pedidos = seed.pedidos.filter(p => repIds.has(p.repId));
  const classificadas = classificarTudo(contas, pedidos, range, diasAtivo, diasPerdido, seed.hoje);

  const out: Insight[] = [];

  // Clientes grandes escorregando (inativos ou aging alto entre A/B)
  const abc = curvaAbc(classificadas.filter(c => c.valor12m > 0).map(c => ({ item: c, valor: c.valor12m })));
  const idsGrandes = new Set(abc.filter(r => r.classe === "A" || r.classe === "B").map(r => (r.item as ContaClassificada).conta.id));
  const escorregando = classificadas.filter(c => idsGrandes.has(c.conta.id) && (c.status === "inativo" || c.recencia > diasAtivo));
  const valorEscorregando = escorregando.reduce((s, c) => s + c.valor12m, 0);
  if (escorregando.length > 0) {
    out.push({
      id: "carteira-grandes-escorregando",
      severidade: valorEscorregando > 5_000_000 ? "critico" : "atencao",
      texto: `R$ ${formatCurto(valorEscorregando)} em clientes grandes escorregando (${escorregando.length} clientes)`,
      acao: { label: "Ver no mapa", hash: "#mapa-carteira" },
      valorRef: valorEscorregando,
    });
  }

  // Classe A a menos de 15 dias de virar perdido
  const idsA = new Set(abc.filter(r => r.classe === "A").map(r => (r.item as ContaClassificada).conta.id));
  const aRisco = classificadas.filter(c => idsA.has(c.conta.id) && c.status === "inativo" && (diasPerdido - c.recencia) <= 15 && (diasPerdido - c.recencia) >= 0);
  if (aRisco.length > 0) {
    out.push({
      id: "carteira-classea-perdendo",
      severidade: "critico",
      texto: `${aRisco.length} clientes classe A a menos de 15d de virar perdidos`,
      acao: { label: "Ver lista e cobrar planos", drawer: "clientes_risco" },
      valorRef: aRisco.reduce((s, c) => s + c.valor12m, 0),
    });
  }

  // Carteira inativa estrutural (≥60% dos reps com >30% inatividade)
  const reps = Array.from(repIds);
  const pcts = reps.map(rid => {
    const arr = classificadas.filter(c => c.conta.repId === rid && c.status !== "lead");
    const inat = arr.filter(c => c.status === "inativo").length;
    return arr.length ? (inat / arr.length) * 100 : 0;
  });
  const altos = pcts.filter(p => p > 30).length;
  if (reps.length > 0 && altos / reps.length >= 0.6) {
    const media = Math.round(pcts.reduce((s, x) => s + x, 0) / pcts.length);
    out.push({
      id: "carteira-inativa-estrutural",
      severidade: "atencao",
      texto: `Carteira parada média do time em ${media}% — problema estrutural`,
      acao: { label: "Ver por representante", href: "/vendedor/representantes" },
    });
  }

  // Recuperados no período (positivo)
  const recuperados = classificadas.filter(c => c.reativadoNoPeriodo).length;
  if (recuperados > 0) {
    out.push({
      id: "carteira-recuperados",
      severidade: "oportunidade",
      texto: `${recuperados} clientes recuperados no período ▲`,
      acao: { label: "Ver movimentação", hash: "#movimentacao" },
    });
  }

  return limitar(out);
}

// ========================================================
// ATENDIMENTO
// ========================================================
export function insightsAtendimento(
  seed: Seed,
  escopo: Escopo,
  range: DateRange,
): Insight[] {
  const repIds = repIdsNoEscopo(seed, escopo);
  const reps = seed.representantes.filter(r => repIds.has(r.id));
  const out: Insight[] = [];

  // Reps fora do ritmo (pace < 80%)
  const fora = reps.filter(r => r.pace < 80);
  if (fora.length > 0) {
    out.push({
      id: "atend-reps-fora-ritmo",
      severidade: fora.length / Math.max(reps.length, 1) >= 0.5 ? "critico" : "atencao",
      texto: `${fora.length} ${fora.length === 1 ? "representante" : "representantes"} fora do ritmo (pace < 80%)`,
      acao: { label: "Ver time", href: "/vendedor/representantes" },
      valorRef: fora.length,
    });
  }

  // Negócios grandes parados
  const parados = negociosGrandesParados(seed, escopo);
  const valorParado = parados.reduce((s, n) => s + n.op.valor, 0);
  if (parados.length > 0) {
    out.push({
      id: "atend-negocios-parados",
      severidade: valorParado > 500_000 ? "critico" : "atencao",
      texto: `${parados.length} negócios grandes parados · R$ ${formatCurto(valorParado)} sem movimento há 7d+`,
      acao: { label: "Ver negociações", drawer: "negocios_parados" },
      valorRef: valorParado,
    });
  }

  // Cobertura caiu vs anterior (média)
  const deltaMedio = reps.length > 0 ? reps.reduce((s, r) => s + r.coberturaDelta, 0) / reps.length : 0;
  if (deltaMedio <= -5) {
    out.push({
      id: "atend-cobertura-caindo",
      severidade: deltaMedio <= -10 ? "critico" : "atencao",
      texto: `Cobertura do time caiu ${deltaMedio.toFixed(1).replace(".", ",")}pp vs período anterior`,
      acao: { label: "Ver por representante", href: "/vendedor/representantes" },
    });
  }

  return limitar(out);
}

// ========================================================
// PRODUTO
// ========================================================
export function insightsProduto(
  seed: Seed,
  escopo: Escopo,
  range: DateRange,
  previousRange: DateRange,
): Insight[] {
  const repIds = repIdsNoEscopo(seed, escopo);
  const pedAtual = seed.pedidos.filter(p => repIds.has(p.repId) && p.data >= range.from && p.data <= range.to);
  const pedAnt = seed.pedidos.filter(p => repIds.has(p.repId) && p.data >= previousRange.from && p.data <= previousRange.to);

  const out: Insight[] = [];

  // Queda geral + marcas mais afetadas
  const totAt = pedAtual.reduce((s, p) => s + p.valor, 0);
  const totAn = pedAnt.reduce((s, p) => s + p.valor, 0);
  const delta = totAn > 0 ? ((totAt - totAn) / totAn) * 100 : 0;
  if (delta <= -15) {
    const porMarca = seed.marcas.map(m => {
      const at = pedAtual.filter(p => p.marcaId === m.id).reduce((s, p) => s + p.valor, 0);
      const an = pedAnt.filter(p => p.marcaId === m.id).reduce((s, p) => s + p.valor, 0);
      const d = an > 0 ? ((at - an) / an) * 100 : 0;
      return { nome: m.nome, delta: d, valor: at };
    }).filter(x => x.delta < 0).sort((a, b) => a.delta - b.delta);
    const piores = porMarca.slice(0, 2).map(x => `${x.nome} (${Math.round(x.delta)}%)`).join(" e ");
    out.push({
      id: "produto-queda-faturamento",
      severidade: delta <= -30 ? "critico" : "atencao",
      texto: `Faturamento caiu ${Math.abs(Math.round(delta))}% vs período anterior${piores ? ` — puxado por ${piores}` : ""}`,
      acao: { label: "Ver por marca", hash: "#faturamento-marca" },
      valorRef: Math.abs(totAt - totAn),
    });
  }

  // Concentração (marca líder %)
  if (totAt > 0) {
    const porMarca = seed.marcas.map(m => ({
      nome: m.nome,
      valor: pedAtual.filter(p => p.marcaId === m.id).reduce((s, p) => s + p.valor, 0),
    })).sort((a, b) => b.valor - a.valor);
    const lider = porMarca[0];
    const pct = (lider.valor / totAt) * 100;
    if (pct >= 25) {
      out.push({
        id: "produto-concentracao",
        severidade: pct >= 40 ? "critico" : "atencao",
        texto: `${lider.nome} concentra ${Math.round(pct)}% da receita — dependência alta`,
        acao: { label: "Ver concentração", hash: "#concentracao-produto" },
        valorRef: lider.valor,
      });
    }
  }

  // Multimarcas comprando 1 marca só (potencial cross-sell)
  const contasEsc = seed.contas.filter(c => repIds.has(c.repId) && c.nicho === "Multimarcas");
  const candidatos = contasEsc.filter(c => {
    const marcas = new Set(seed.pedidos.filter(p => p.contaId === c.id).map(p => p.marcaId));
    return marcas.size === 1;
  });
  if (candidatos.length > 0) {
    const potencial = candidatos.reduce((s, c) => {
      const v = seed.pedidos.filter(p => p.contaId === c.id).reduce((a, p) => a + p.valor, 0);
      return s + v * 0.3; // estimativa 30% de expansão
    }, 0);
    out.push({
      id: "produto-cross-sell",
      severidade: "oportunidade",
      texto: `${candidatos.length} clientes multimarcas compram 1 marca só — potencial de expansão R$ ${formatCurto(potencial)}`,
      acao: { label: "Ver candidatos", hash: "#cross-sell" },
      valorRef: potencial,
    });
  }

  // Marca sem giro em N reps
  const reps = repsNoEscopo(seed, escopo);
  for (const m of seed.marcas) {
    const semN = reps.filter(r => !pedAtual.some(p => p.repId === r.id && p.marcaId === m.id)).length;
    if (reps.length > 0 && semN / reps.length >= 0.6) {
      out.push({
        id: `produto-semgiro-${m.id}`,
        severidade: "atencao",
        texto: `${m.nome} sem giro em ${semN} de ${reps.length} representantes`,
        acao: { label: "Criar campanha de push", hash: "#marcas-sem-giro" },
        valorRef: 0,
      });
      break; // 1 insight desse tipo por vez
    }
  }

  return limitar(out);
}

function formatCurto(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1).replace(".", ",")}M`;
  if (v >= 1_000) return `${Math.round(v / 1_000)}k`;
  return Math.round(v).toString();
}
