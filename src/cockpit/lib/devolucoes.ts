// Devoluções — o registro nasce no SAC (ticket de devolução) e aponta
// para o pedido de origem. Aqui só agregamos para leitura gerencial.
import type { Devolucao, Pedido, Seed } from "../data/seed";
import type { DateRange } from "./range";

export interface ResumoDevolucoes {
  valor: number;
  valorPrev: number;
  qtd: number;
  qtdPrev: number;
  pecas: number;
  pctReceita: number;
  pctReceitaPrev: number;
  ticketMedio: number;
  porMotivo: { motivo: string; valor: number; qtd: number; share: number }[];
  porMarca: { marca: string; valor: number; qtd: number }[];
  porRep: { rep: string; valor: number; qtd: number; pctReceita: number }[];
  topClientes: { cliente: string; valor: number; qtd: number }[];
  serie: { mes: string; valor: number; pct: number }[];
}

const noRange = <T extends { data: Date }>(arr: T[], r: DateRange) =>
  arr.filter(x => x.data >= r.from && x.data <= r.to);

export function resumoDevolucoes(
  seed: Seed,
  devolucoes: Devolucao[],
  pedidos: Pedido[],
  range: DateRange,
  prev: DateRange,
): ResumoDevolucoes {
  const atual = noRange(devolucoes, range);
  const anterior = noRange(devolucoes, prev);
  const receita = noRange(pedidos, range).reduce((s, p) => s + p.valor, 0);
  const receitaPrev = noRange(pedidos, prev).reduce((s, p) => s + p.valor, 0);

  const valor = atual.reduce((s, d) => s + d.valor, 0);
  const valorPrev = anterior.reduce((s, d) => s + d.valor, 0);

  const grupo = <K extends string>(chave: (d: Devolucao) => K) => {
    const m = new Map<K, { valor: number; qtd: number }>();
    atual.forEach(d => {
      const k = chave(d);
      const cur = m.get(k) ?? { valor: 0, qtd: 0 };
      cur.valor += d.valor; cur.qtd += 1;
      m.set(k, cur);
    });
    return m;
  };

  const porMotivo = [...grupo(d => d.motivo).entries()]
    .map(([motivo, v]) => ({ motivo, valor: v.valor, qtd: v.qtd, share: valor ? (v.valor / valor) * 100 : 0 }))
    .sort((a, b) => b.valor - a.valor);

  const porMarca = [...grupo(d => d.marcaId).entries()]
    .map(([id, v]) => ({ marca: seed.marcas.find(m => m.id === id)?.nome ?? id, valor: v.valor, qtd: v.qtd }))
    .sort((a, b) => b.valor - a.valor);

  const porRep = [...grupo(d => d.repId).entries()]
    .map(([id, v]) => {
      const recRep = noRange(pedidos.filter(p => p.repId === id), range).reduce((s, p) => s + p.valor, 0);
      return {
        rep: seed.representantes.find(r => r.id === id)?.nome ?? id,
        valor: v.valor, qtd: v.qtd,
        pctReceita: recRep ? (v.valor / recRep) * 100 : 0,
      };
    })
    .sort((a, b) => b.valor - a.valor);

  const topClientes = [...grupo(d => d.contaId).entries()]
    .map(([id, v]) => ({ cliente: seed.contas.find(c => c.id === id)?.razao ?? id, valor: v.valor, qtd: v.qtd }))
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 8);

  const serie: { mes: string; valor: number; pct: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const ini = new Date(seed.hoje.getFullYear(), seed.hoje.getMonth() - i, 1);
    const fim = new Date(seed.hoje.getFullYear(), seed.hoje.getMonth() - i + 1, 0, 23, 59, 59);
    const v = devolucoes.filter(d => d.data >= ini && d.data <= fim).reduce((s, d) => s + d.valor, 0);
    const r = pedidos.filter(p => p.data >= ini && p.data <= fim).reduce((s, p) => s + p.valor, 0);
    serie.push({
      mes: ini.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""),
      valor: v,
      pct: r ? (v / r) * 100 : 0,
    });
  }

  return {
    valor, valorPrev,
    qtd: atual.length, qtdPrev: anterior.length,
    pecas: atual.reduce((s, d) => s + d.pecas, 0),
    pctReceita: receita ? (valor / receita) * 100 : 0,
    pctReceitaPrev: receitaPrev ? (valorPrev / receitaPrev) * 100 : 0,
    ticketMedio: atual.length ? valor / atual.length : 0,
    porMotivo, porMarca, porRep, topClientes, serie,
  };
}
