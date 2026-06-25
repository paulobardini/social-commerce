import type { Conta, Pedido } from "../data/seed";
import type { Status } from "../styles/tokens";
import type { DateRange } from "./range";
import { differenceInDays } from "date-fns";

export interface ContaClassificada {
  conta: Conta;
  status: Status;
  ultimoPedido?: Date;
  recencia: number;            // dias desde último pedido (Infinity se lead)
  novoNoPeriodo: boolean;
  reativadoNoPeriodo: boolean;
  positivadoNoPeriodo: boolean;
  valor12m: number;
  freq12m: number;
}

/** Status base por recência (independente de período). */
export function statusPorRecencia(recencia: number, diasAtivo: number, diasPerdido: number, isLead: boolean): Status {
  if (isLead) return "lead";
  if (recencia <= diasAtivo) return "ativo";
  if (recencia <= diasPerdido) return "inativo";
  return "perdido";
}

export function classificarTudo(
  contas: Conta[],
  pedidos: Pedido[],
  range: DateRange,
  diasAtivo: number,
  diasPerdido: number,
  hoje: Date
): ContaClassificada[] {
  // Index pedidos por conta
  const byConta = new Map<string, Pedido[]>();
  for (const p of pedidos) {
    const arr = byConta.get(p.contaId) ?? [];
    arr.push(p);
    byConta.set(p.contaId, arr);
  }

  return contas.map(conta => {
    const ps = byConta.get(conta.id) ?? [];
    ps.sort((a, b) => +a.data - +b.data);
    const isLead = ps.length === 0;
    const ultimoPedido = ps.length ? ps[ps.length - 1].data : undefined;
    const primeiroPedido = ps.length ? ps[0].data : undefined;
    const recencia = ultimoPedido ? differenceInDays(hoje, ultimoPedido) : Infinity;
    const status = statusPorRecencia(recencia, diasAtivo, diasPerdido, isLead);

    // Pedidos no período
    const noPeriodo = ps.filter(p => p.data >= range.from && p.data <= range.to);
    const positivadoNoPeriodo = noPeriodo.length > 0;
    const novoNoPeriodo = !!primeiroPedido && primeiroPedido >= range.from && primeiroPedido <= range.to;

    // Reativado: estava inativo/perdido ANTES do período e voltou a comprar DENTRO do período
    let reativadoNoPeriodo = false;
    if (positivadoNoPeriodo && !novoNoPeriodo) {
      const antes = ps.filter(p => p.data < range.from);
      if (antes.length > 0) {
        const ultAntes = antes[antes.length - 1].data;
        const recAntes = differenceInDays(range.from, ultAntes);
        if (recAntes > diasAtivo) reativadoNoPeriodo = true;
      }
    }

    // Janela 12m
    const corte12 = new Date(hoje); corte12.setDate(corte12.getDate() - 365);
    const p12 = ps.filter(p => p.data >= corte12);
    const valor12m = p12.reduce((s, p) => s + p.valor, 0);

    return {
      conta, status, ultimoPedido, recencia,
      novoNoPeriodo, reativadoNoPeriodo, positivadoNoPeriodo,
      valor12m, freq12m: p12.length,
    };
  });
}
