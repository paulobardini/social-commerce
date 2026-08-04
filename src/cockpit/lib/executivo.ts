// Camada executiva da Carteira — leitura de diretoria: receita, risco,
// concentração e a ponte que explica a variação de receita entre períodos.
import { format, startOfMonth, eachMonthOfInterval } from "date-fns";
import type { Seed, Pedido } from "../data/seed";
import type { DateRange } from "./range";
import type { ContaClassificada } from "./classificar";

export interface PonteItem { label: string; valor: number; tipo: "total" | "positivo" | "negativo"; acumulado: number; }

const soma = (ps: Pedido[]) => ps.reduce((s, p) => s + p.valor, 0);

function porConta(pedidos: Pedido[], range: DateRange): Map<string, number> {
  const m = new Map<string, number>();
  for (const p of pedidos) {
    if (p.data < range.from || p.data > range.to) continue;
    m.set(p.contaId, (m.get(p.contaId) ?? 0) + p.valor);
  }
  return m;
}

/** Ponte de receita: explica o delta entre o período anterior e o atual. */
export function ponteReceita(pedidos: Pedido[], range: DateRange, prev: DateRange): PonteItem[] {
  const atual = porConta(pedidos, range);
  const anterior = porConta(pedidos, prev);
  const primeiroPedido = new Map<string, Date>();
  for (const p of pedidos) {
    const cur = primeiroPedido.get(p.contaId);
    if (!cur || p.data < cur) primeiroPedido.set(p.contaId, p.data);
  }

  let novos = 0, recuperados = 0, expansao = 0, contracao = 0, pararam = 0;
  const ids = new Set([...atual.keys(), ...anterior.keys()]);
  for (const id of ids) {
    const a = atual.get(id) ?? 0;
    const b = anterior.get(id) ?? 0;
    if (b === 0 && a > 0) {
      const pf = primeiroPedido.get(id);
      if (pf && pf >= range.from) novos += a; else recuperados += a;
    } else if (a === 0 && b > 0) {
      pararam -= b;
    } else if (a > b) expansao += a - b;
    else if (a < b) contracao -= b - a;
  }

  const base = soma(pedidos.filter(p => p.data >= prev.from && p.data <= prev.to));
  const fim = soma(pedidos.filter(p => p.data >= range.from && p.data <= range.to));
  let acc = base;
  return [
    { label: "Período anterior", valor: base, tipo: "total", acumulado: acc },
    { label: "Novos", valor: novos, tipo: "positivo", acumulado: (acc += novos) },
    { label: "Recuperados", valor: recuperados, tipo: "positivo", acumulado: (acc += recuperados) },
    { label: "Cresceram", valor: expansao, tipo: "positivo", acumulado: (acc += expansao) },
    { label: "Reduziram", valor: contracao, tipo: "negativo", acumulado: (acc += contracao) },
    { label: "Pararam", valor: pararam, tipo: "negativo", acumulado: (acc += pararam) },
    { label: "Período atual", valor: fim, tipo: "total", acumulado: fim },
  ];
}

export interface Concentracao {
  top10Share: number;          // % da receita 12m nos 10 maiores
  clientesMetadeReceita: number; // nº de clientes que somam 50% da receita
  maiorClienteShare: number;
  receita12m: number;
}

export function concentracao(classificadas: ContaClassificada[]): Concentracao {
  const vals = classificadas.map(c => c.valor12m).filter(v => v > 0).sort((a, b) => b - a);
  const total = vals.reduce((s, v) => s + v, 0);
  if (total === 0) return { top10Share: 0, clientesMetadeReceita: 0, maiorClienteShare: 0, receita12m: 0 };
  const top10 = vals.slice(0, 10).reduce((s, v) => s + v, 0);
  let acc = 0, n = 0;
  for (const v of vals) { acc += v; n++; if (acc >= total * 0.5) break; }
  return {
    top10Share: (top10 / total) * 100,
    clientesMetadeReceita: n,
    maiorClienteShare: (vals[0] / total) * 100,
    receita12m: total,
  };
}

export interface RiscoReceita {
  emRisco: number;        // receita 12m de clientes parados
  jaPerdida: number;      // receita 12m de clientes sem comprar há muito
  prestesARisco: number;  // ativos próximos do limite de inatividade
  clientesRisco: number;
  sharePerdida: number;   // % da receita 12m já perdida
}

export function riscoReceita(classificadas: ContaClassificada[], diasAtivo: number): RiscoReceita {
  const total = classificadas.reduce((s, c) => s + c.valor12m, 0) || 1;
  const emRisco = classificadas.filter(c => c.status === "inativo").reduce((s, c) => s + c.valor12m, 0);
  const jaPerdida = classificadas.filter(c => c.status === "perdido").reduce((s, c) => s + c.valor12m, 0);
  const prestes = classificadas.filter(c => c.status === "ativo" && c.recencia > diasAtivo * 0.7);
  return {
    emRisco,
    jaPerdida,
    prestesARisco: prestes.reduce((s, c) => s + c.valor12m, 0),
    clientesRisco: classificadas.filter(c => c.status === "inativo").length,
    sharePerdida: (jaPerdida / total) * 100,
  };
}

export interface PontoMes { mes: string; receita: number; clientes: number; }

export function serieReceitaMensal(pedidos: Pedido[], hoje: Date, meses = 12): PontoMes[] {
  const start = startOfMonth(new Date(hoje.getFullYear(), hoje.getMonth() - (meses - 1), 1));
  return eachMonthOfInterval({ start, end: hoje }).map(d => {
    const key = format(d, "yyyy-MM");
    const ps = pedidos.filter(p => format(p.data, "yyyy-MM") === key);
    return { mes: format(d, "MMM/yy"), receita: soma(ps), clientes: new Set(ps.map(p => p.contaId)).size };
  });
}

export interface ResumoExec {
  receitaAtual: number;
  receitaAnterior: number;
  deltaReceita: number;
  clientesCompraram: number;
  clientesCompraramPrev: number;
  ticketPedido: number;
  pedidos: number;
  retencaoReceita: number; // % da receita anterior mantida (NRR simplificado)
}

export function resumoExecutivo(pedidos: Pedido[], range: DateRange, prev: DateRange): ResumoExec {
  const atualPs = pedidos.filter(p => p.data >= range.from && p.data <= range.to);
  const prevPs = pedidos.filter(p => p.data >= prev.from && p.data <= prev.to);
  const receitaAtual = soma(atualPs);
  const receitaAnterior = soma(prevPs);
  const mapPrev = porConta(pedidos, prev);
  const mapAtual = porConta(pedidos, range);
  let mantida = 0;
  for (const [id, v] of mapPrev) mantida += Math.min(v, mapAtual.get(id) ?? 0) + Math.max(0, (mapAtual.get(id) ?? 0) - v);
  return {
    receitaAtual,
    receitaAnterior,
    deltaReceita: receitaAnterior === 0 ? 0 : ((receitaAtual - receitaAnterior) / receitaAnterior) * 100,
    clientesCompraram: new Set(atualPs.map(p => p.contaId)).size,
    clientesCompraramPrev: new Set(prevPs.map(p => p.contaId)).size,
    ticketPedido: atualPs.length ? receitaAtual / atualPs.length : 0,
    pedidos: atualPs.length,
    retencaoReceita: receitaAnterior === 0 ? 0 : (mantida / receitaAnterior) * 100,
  };
}

/** Ranking de receita por região no escopo (leitura de diretoria). */
export function receitaPorRegiao(seed: Seed, pedidos: Pedido[], range: DateRange, prev: DateRange) {
  const regiaoDe = new Map(seed.representantes.map(r => [r.id, r.regiao]));
  const acc = new Map<string, { atual: number; anterior: number }>();
  for (const p of pedidos) {
    const reg = regiaoDe.get(p.repId) ?? "—";
    const cur = acc.get(reg) ?? { atual: 0, anterior: 0 };
    if (p.data >= range.from && p.data <= range.to) cur.atual += p.valor;
    if (p.data >= prev.from && p.data <= prev.to) cur.anterior += p.valor;
    acc.set(reg, cur);
  }
  return [...acc.entries()]
    .map(([regiao, v]) => ({
      regiao,
      atual: v.atual,
      anterior: v.anterior,
      delta: v.anterior === 0 ? 0 : ((v.atual - v.anterior) / v.anterior) * 100,
    }))
    .sort((a, b) => b.atual - a.atual);
}
