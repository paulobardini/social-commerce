// Consolidação de performance individual da equipe comercial.
import type { Seed } from "../data/seed";
import type { DateRange } from "./range";
import { classificarTudo } from "./classificar";
import { resumoDevolucoes } from "./devolucoes";

export interface LinhaEquipe {
  repId: string;
  nome: string;
  regiao: string;
  receita: number;
  receitaPrev: number;
  delta: number;
  meta: number;
  atingimento: number;
  pace: number;
  margem: number;
  margemPct: number;
  clientesCompraram: number;
  carteira: number;
  cobertura: number;
  atendimentos: number;
  propostas: number;
  ganhas: number;
  winRate: number;
  ticketMedio: number;
  devolucoes: number;
  devolucaoPct: number;
  ultimoAcessoDias: number;
}

function mesKeyOf(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function performanceEquipe(
  seed: Seed,
  repIds: Set<string>,
  range: DateRange,
  prev: DateRange,
  diasAtivo: number,
  diasPerdido: number,
): LinhaEquipe[] {
  const mes = mesKeyOf(seed.hoje);
  const dev = resumoDevolucoes(
    seed,
    seed.devolucoes.filter(d => repIds.has(d.repId)),
    seed.pedidos.filter(p => repIds.has(p.repId)),
    range, prev,
  );

  return seed.representantes
    .filter(r => repIds.has(r.id))
    .map(r => {
      const pedidos = seed.pedidos.filter(p => p.repId === r.id);
      const noPeriodo = pedidos.filter(p => p.data >= range.from && p.data <= range.to);
      const noPrev = pedidos.filter(p => p.data >= prev.from && p.data <= prev.to);
      const receita = noPeriodo.reduce((s, p) => s + p.valor, 0);
      const receitaPrev = noPrev.reduce((s, p) => s + p.valor, 0);
      const comCusto = noPeriodo.filter(p => p.custo > 0);
      const recCusto = comCusto.reduce((s, p) => s + p.valor, 0);
      const margem = recCusto - comCusto.reduce((s, p) => s + p.custo, 0);

      const contas = seed.contas.filter(c => c.repId === r.id);
      const classificadas = classificarTudo(contas, pedidos, range, diasAtivo, diasPerdido, seed.hoje);
      const clientesCompraram = new Set(noPeriodo.map(p => p.contaId)).size;

      // a meta é mensal: comparamos sempre o realizado do mês corrente (até hoje)
      const inicioMes = new Date(seed.hoje.getFullYear(), seed.hoje.getMonth(), 1);
      const receitaMes = pedidos
        .filter(p => p.data >= inicioMes && p.data <= seed.hoje)
        .reduce((s, p) => s + p.valor, 0);
      const meta = seed.metas.find(m => m.repId === r.id && m.tipo === "faturamento" && m.mes === mes)?.valor ?? 0;

      const fechadas = seed.oportunidades.filter(o => o.repId === r.id && (o.etapa === "ganha" || o.etapa === "perdida"));
      const ganhas = fechadas.filter(o => o.etapa === "ganha").length;
      const propostas = seed.oportunidades.filter(o => o.repId === r.id).length;
      const atendimentos = seed.atendimentos.filter(
        a => a.repId === r.id && a.data >= range.from && a.data <= range.to,
      ).length;
      const devRep = dev.porRep.find(x => x.rep === r.nome);

      return {
        repId: r.id,
        nome: r.nome,
        regiao: r.regiao,
        receita,
        receitaPrev,
        delta: receitaPrev ? ((receita - receitaPrev) / receitaPrev) * 100 : 0,
        meta,
        atingimento: meta ? (receitaMes / meta) * 100 : 0,

        pace: r.pace,
        margem,
        margemPct: recCusto ? (margem / recCusto) * 100 : 0,
        clientesCompraram,
        carteira: classificadas.length,
        cobertura: classificadas.length ? (clientesCompraram / classificadas.length) * 100 : 0,
        atendimentos,
        propostas,
        ganhas,
        winRate: fechadas.length ? (ganhas / fechadas.length) * 100 : 0,
        ticketMedio: clientesCompraram ? receita / clientesCompraram : 0,
        devolucoes: devRep?.valor ?? 0,
        devolucaoPct: devRep?.pctReceita ?? 0,
        ultimoAcessoDias: r.ultimoAcessoDias,
      };
    })
    .sort((a, b) => b.receita - a.receita);
}

export function resumoEquipe(linhas: LinhaEquipe[]) {
  const receita = linhas.reduce((s, l) => s + l.receita, 0);
  const receitaPrev = linhas.reduce((s, l) => s + l.receitaPrev, 0);
  const meta = linhas.reduce((s, l) => s + l.meta, 0);
  const acimaDaMeta = linhas.filter(l => l.atingimento >= 100).length;
  const abaixoDe70 = linhas.filter(l => l.meta > 0 && l.atingimento < 70).length;
  return {
    receita,
    receitaPrev,
    delta: receitaPrev ? ((receita - receitaPrev) / receitaPrev) * 100 : 0,
    meta,
    atingimento: meta ? (receita / meta) * 100 : 0,
    acimaDaMeta,
    abaixoDe70,
    time: linhas.length,
    coberturaMedia: linhas.length ? linhas.reduce((s, l) => s + l.cobertura, 0) / linhas.length : 0,
    winRateMedio: linhas.length ? linhas.reduce((s, l) => s + l.winRate, 0) / linhas.length : 0,
    margem: linhas.reduce((s, l) => s + l.margem, 0),
  };
}
