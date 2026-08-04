// Produtos sem venda no período (encalhe comercial) e velocidade de giro.
import type { Pedido, Seed } from "../data/seed";
import type { DateRange } from "./range";

export interface ProdutoSemVenda {
  id: string;
  nome: string;
  marca: string;
  categoria: string;
  estacao: string;
  ultimaVendaDias: number | null;   // null = nunca vendeu
  receita12m: number;
}

export function produtosSemVenda(seed: Seed, pedidos: Pedido[], range: DateRange): ProdutoSemVenda[] {
  const vendidosNoPeriodo = new Set(
    pedidos.filter(p => p.data >= range.from && p.data <= range.to).map(p => p.produtoId),
  );
  const ultimaVenda = new Map<string, Date>();
  const receita12m = new Map<string, number>();
  const limite12m = new Date(seed.hoje.getTime() - 365 * 86400000);
  pedidos.forEach(p => {
    const atual = ultimaVenda.get(p.produtoId);
    if (!atual || p.data > atual) ultimaVenda.set(p.produtoId, p.data);
    if (p.data >= limite12m) receita12m.set(p.produtoId, (receita12m.get(p.produtoId) ?? 0) + p.valor);
  });

  return seed.produtos
    .filter(p => !vendidosNoPeriodo.has(p.id))
    .map(p => {
      const uv = ultimaVenda.get(p.id);
      return {
        id: p.id,
        nome: p.nome,
        marca: seed.marcas.find(m => m.id === p.marcaId)?.nome ?? p.marcaId,
        categoria: p.categoria,
        estacao: p.estacao,
        ultimaVendaDias: uv ? Math.floor((seed.hoje.getTime() - uv.getTime()) / 86400000) : null,
        receita12m: receita12m.get(p.id) ?? 0,
      };
    })
    .sort((a, b) => (b.ultimaVendaDias ?? 9999) - (a.ultimaVendaDias ?? 9999));
}

export interface VelocidadeProduto {
  id: string;
  nome: string;
  marca: string;
  pecas: number;
  pedidos: number;
  clientes: number;
  receita: number;
  pecasPorSemana: number;
}

export function velocidadeProdutos(seed: Seed, pedidos: Pedido[], range: DateRange): VelocidadeProduto[] {
  const semanas = Math.max(1, (range.to.getTime() - range.from.getTime()) / (7 * 86400000));
  const map = new Map<string, { pecas: number; pedidos: number; receita: number; clientes: Set<string> }>();
  pedidos
    .filter(p => p.data >= range.from && p.data <= range.to)
    .forEach(p => {
      const cur = map.get(p.produtoId) ?? { pecas: 0, pedidos: 0, receita: 0, clientes: new Set<string>() };
      cur.pecas += p.itens; cur.pedidos += 1; cur.receita += p.valor; cur.clientes.add(p.contaId);
      map.set(p.produtoId, cur);
    });
  return [...map.entries()]
    .map(([id, v]) => {
      const prod = seed.produtos.find(p => p.id === id);
      return {
        id,
        nome: prod?.nome ?? id,
        marca: seed.marcas.find(m => m.id === prod?.marcaId)?.nome ?? "—",
        pecas: v.pecas,
        pedidos: v.pedidos,
        clientes: v.clientes.size,
        receita: v.receita,
        pecasPorSemana: v.pecas / semanas,
      };
    })
    .sort((a, b) => b.pecasPorSemana - a.pecasPorSemana);
}

/** Receita por estação e por categoria — leitura de mix da carteira. */
export function receitaPorDimensao(pedidos: Pedido[], range: DateRange, prev: DateRange, dim: "estacao" | "categoria") {
  const key = (p: Pedido) => (dim === "estacao" ? p.estacao : p.categoria);
  const acc = (lista: Pedido[]) => {
    const m = new Map<string, number>();
    lista.forEach(p => m.set(key(p), (m.get(key(p)) ?? 0) + p.valor));
    return m;
  };
  const a = acc(pedidos.filter(p => p.data >= range.from && p.data <= range.to));
  const b = acc(pedidos.filter(p => p.data >= prev.from && p.data <= prev.to));
  const total = [...a.values()].reduce((s, v) => s + v, 0);
  return [...a.entries()]
    .map(([label, valor]) => {
      const ant = b.get(label) ?? 0;
      return {
        label, valor,
        share: total ? (valor / total) * 100 : 0,
        delta: ant ? ((valor - ant) / ant) * 100 : 0,
      };
    })
    .sort((x, y) => y.valor - x.valor);
}
