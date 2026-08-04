// Margem de contribuição comercial — derivada do custo cadastrado no produto.
// Não é resultado financeiro/DRE: é receita − custo da mercadoria vendida.
import type { Pedido, Seed } from "../data/seed";
import type { DateRange } from "./range";
import type { WaterfallPonto } from "./movimento";


export interface ResumoMargem {
  receita: number;
  custo: number;
  margem: number;
  margemPct: number;
  coberturaCusto: number;   // % da receita com custo cadastrado
  receitaSemCusto: number;
}

const noRange = (pedidos: Pedido[], r: DateRange) =>
  pedidos.filter(p => p.data >= r.from && p.data <= r.to);

export function resumoMargem(pedidos: Pedido[], range: DateRange): ResumoMargem {
  const lista = noRange(pedidos, range);
  const receita = lista.reduce((s, p) => s + p.valor, 0);
  const comCusto = lista.filter(p => p.custo > 0);
  const receitaComCusto = comCusto.reduce((s, p) => s + p.valor, 0);
  const custo = comCusto.reduce((s, p) => s + p.custo, 0);
  const margem = receitaComCusto - custo;
  return {
    receita,
    custo,
    margem,
    margemPct: receitaComCusto ? (margem / receitaComCusto) * 100 : 0,
    coberturaCusto: receita ? (receitaComCusto / receita) * 100 : 0,
    receitaSemCusto: receita - receitaComCusto,
  };
}

export interface LinhaMargem {
  id: string;
  nome: string;
  receita: number;
  custo: number;
  margem: number;
  margemPct: number;
  share: number;
  deltaMargemPct: number;   // pp vs período anterior
}

function agrupar(
  lista: Pedido[],
  chave: (p: Pedido) => string,
): Map<string, { receita: number; custo: number }> {
  const map = new Map<string, { receita: number; custo: number }>();
  lista.forEach(p => {
    if (p.custo <= 0) return;
    const k = chave(p);
    const cur = map.get(k) ?? { receita: 0, custo: 0 };
    cur.receita += p.valor;
    cur.custo += p.custo;
    map.set(k, cur);
  });
  return map;
}

export function margemPorMarca(seed: Seed, pedidos: Pedido[], range: DateRange, prev: DateRange): LinhaMargem[] {
  const atual = agrupar(noRange(pedidos, range), p => p.marcaId);
  const anterior = agrupar(noRange(pedidos, prev), p => p.marcaId);
  const totalMargem = [...atual.values()].reduce((s, v) => s + (v.receita - v.custo), 0);
  return seed.marcas
    .map(m => {
      const a = atual.get(m.id) ?? { receita: 0, custo: 0 };
      const b = anterior.get(m.id) ?? { receita: 0, custo: 0 };
      const margem = a.receita - a.custo;
      const pct = a.receita ? (margem / a.receita) * 100 : 0;
      const pctPrev = b.receita ? ((b.receita - b.custo) / b.receita) * 100 : 0;
      return {
        id: m.id, nome: m.nome,
        receita: a.receita, custo: a.custo, margem,
        margemPct: pct,
        share: totalMargem ? (margem / totalMargem) * 100 : 0,
        deltaMargemPct: pct - pctPrev,
      };
    })
    .filter(l => l.receita > 0)
    .sort((a, b) => b.margem - a.margem);
}

export function margemPorProduto(seed: Seed, pedidos: Pedido[], range: DateRange): LinhaMargem[] {
  const atual = agrupar(noRange(pedidos, range), p => p.produtoId);
  const totalMargem = [...atual.values()].reduce((s, v) => s + (v.receita - v.custo), 0);
  return [...atual.entries()]
    .map(([id, v]) => {
      const prod = seed.produtos.find(p => p.id === id);
      const margem = v.receita - v.custo;
      return {
        id,
        nome: prod?.nome ?? id.toUpperCase(),
        receita: v.receita, custo: v.custo, margem,
        margemPct: v.receita ? (margem / v.receita) * 100 : 0,
        share: totalMargem ? (margem / totalMargem) * 100 : 0,
        deltaMargemPct: 0,
      };
    })
    .sort((a, b) => b.margem - a.margem);
}

export function margemPorRep(seed: Seed, pedidos: Pedido[], range: DateRange): LinhaMargem[] {
  const atual = agrupar(noRange(pedidos, range), p => p.repId);
  const totalMargem = [...atual.values()].reduce((s, v) => s + (v.receita - v.custo), 0);
  return seed.representantes
    .map(r => {
      const a = atual.get(r.id) ?? { receita: 0, custo: 0 };
      const margem = a.receita - a.custo;
      return {
        id: r.id, nome: r.nome,
        receita: a.receita, custo: a.custo, margem,
        margemPct: a.receita ? (margem / a.receita) * 100 : 0,
        share: totalMargem ? (margem / totalMargem) * 100 : 0,
        deltaMargemPct: 0,
      };
    })
    .filter(l => l.receita > 0)
    .sort((a, b) => b.margem - a.margem);
}

export function margemPorCliente(seed: Seed, pedidos: Pedido[], range: DateRange, limite = 15): LinhaMargem[] {
  const atual = agrupar(noRange(pedidos, range), p => p.contaId);
  const totalMargem = [...atual.values()].reduce((s, v) => s + (v.receita - v.custo), 0);
  return [...atual.entries()]
    .map(([id, v]) => {
      const margem = v.receita - v.custo;
      return {
        id,
        nome: seed.contas.find(c => c.id === id)?.razao ?? id,
        receita: v.receita, custo: v.custo, margem,
        margemPct: v.receita ? (margem / v.receita) * 100 : 0,
        share: totalMargem ? (margem / totalMargem) * 100 : 0,
        deltaMargemPct: 0,
      };
    })
    .sort((a, b) => b.margem - a.margem)
    .slice(0, limite);
}

/** Ponte de margem: quanto cada marca explicou da variação total de margem. */
export function ponteMargem(seed: Seed, pedidos: Pedido[], range: DateRange, prev: DateRange) {
  const a = agrupar(noRange(pedidos, range), p => p.marcaId);
  const b = agrupar(noRange(pedidos, prev), p => p.marcaId);
  const base = [...b.values()].reduce((s, v) => s + (v.receita - v.custo), 0);
  const linhas = seed.marcas
    .map(m => {
      const x = a.get(m.id) ?? { receita: 0, custo: 0 };
      const y = b.get(m.id) ?? { receita: 0, custo: 0 };
      return { label: m.nome, valor: (x.receita - x.custo) - (y.receita - y.custo) };
    })
    .filter(l => Math.abs(l.valor) > 1)
    .sort((x, y) => Math.abs(y.valor) - Math.abs(x.valor))
    .slice(0, 6);
  const atual = [...a.values()].reduce((s, v) => s + (v.receita - v.custo), 0);
  let acc = base;
  const meio: WaterfallPonto[] = linhas.map(l => {
    acc += l.valor;
    return {
      label: l.label,
      valor: l.valor,
      tipo: l.valor >= 0 ? ("positivo" as const) : ("negativo" as const),
      acumulado: acc,
    };
  });
  return [
    { label: "Período anterior", valor: base, tipo: "total" as const, acumulado: base },
    ...meio,
    { label: "Período atual", valor: atual, tipo: "total" as const, acumulado: atual },
  ] satisfies WaterfallPonto[];
}

