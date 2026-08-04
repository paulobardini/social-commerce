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

export interface RecordeStatus { n: number; data: Date }
export interface RecordesCarteira { ativo: RecordeStatus; inativo: RecordeStatus; perdido: RecordeStatus }

/**
 * Recordes históricos (máximos) de clientes ativos, inativos e perdidos,
 * avaliando o status da carteira mês a mês desde o primeiro pedido registrado.
 */
export function recordesCarteira(
  contas: Conta[],
  pedidos: Pedido[],
  diasAtivo: number,
  diasPerdido: number,
  hoje: Date
): RecordesCarteira | null {
  if (pedidos.length === 0) return null;

  const byConta = new Map<string, number[]>();
  let minTs = Infinity;
  for (const p of pedidos) {
    const ts = +p.data;
    if (ts < minTs) minTs = ts;
    const arr = byConta.get(p.contaId) ?? [];
    arr.push(ts);
    byConta.set(p.contaId, arr);
  }
  for (const arr of byConta.values()) arr.sort((a, b) => a - b);

  const DIA = 86400000;
  const best: RecordesCarteira = {
    ativo: { n: 0, data: hoje }, inativo: { n: 0, data: hoje }, perdido: { n: 0, data: hoje },
  };

  // snapshots mensais (fim de cada mês) do primeiro pedido até hoje
  const cursor = new Date(minTs);
  cursor.setDate(1);
  while (cursor <= hoje) {
    const fimMes = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0, 23, 59, 59);
    const ref = fimMes > hoje ? hoje : fimMes;
    let ativo = 0, inativo = 0, perdido = 0;
    for (const conta of contas) {
      const arr = byConta.get(conta.id);
      if (!arr || arr.length === 0) continue;
      let ult = -1;
      for (let i = arr.length - 1; i >= 0; i--) { if (arr[i] <= +ref) { ult = arr[i]; break; } }
      if (ult < 0) continue; // ainda não era cliente nessa data
      const rec = Math.floor((+ref - ult) / DIA);
      if (rec <= diasAtivo) ativo++;
      else if (rec <= diasPerdido) inativo++;
      else perdido++;
    }
    if (ativo > best.ativo.n) best.ativo = { n: ativo, data: new Date(ref) };
    if (inativo > best.inativo.n) best.inativo = { n: inativo, data: new Date(ref) };
    if (perdido > best.perdido.n) best.perdido = { n: perdido, data: new Date(ref) };
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return best;
}
