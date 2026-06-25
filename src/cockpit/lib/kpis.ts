import { differenceInDays } from "date-fns";
import type { Seed } from "../data/seed";
import type { DateRange } from "./range";
import { classificarTudo, type ContaClassificada } from "./classificar";
import { winRateGlobal, cicloDiasMedio, ETAPAS_FUNIL, opsAtivasNoRange } from "./funis";

export interface KpiValor { atual: number; anterior: number; delta: number; }

const safeDelta = (atual: number, anterior: number): number => {
  if (anterior === 0) return atual === 0 ? 0 : 100;
  return ((atual - anterior) / Math.abs(anterior)) * 100;
};

function kv(atual: number, anterior: number): KpiValor {
  return { atual, anterior, delta: safeDelta(atual, anterior) };
}

interface Cfg { diasAtivo: number; diasPerdido: number; repId?: string | "todos"; }

function filtrarRep<T extends { repId: string }>(arr: T[], repId?: string | "todos"): T[] {
  if (!repId || repId === "todos") return arr;
  return arr.filter(x => x.repId === repId);
}

export function kpisCarteira(seed: Seed, range: DateRange, prev: DateRange, cfg: Cfg) {
  const contas = cfg.repId && cfg.repId !== "todos" ? seed.contas.filter(c => c.repId === cfg.repId) : seed.contas;
  const pedidos = filtrarRep(seed.pedidos, cfg.repId);
  const atual = classificarTudo(contas, pedidos, range, cfg.diasAtivo, cfg.diasPerdido, seed.hoje);
  const anterior = classificarTudo(contas, pedidos, prev, cfg.diasAtivo, cfg.diasPerdido, seed.hoje);

  const ct = (lista: ContaClassificada[], pred: (c: ContaClassificada) => boolean) => lista.filter(pred).length;

  const totalClientes = ct(atual, c => c.status !== "lead");
  const leads = ct(atual, c => c.status === "lead");
  const ativos = ct(atual, c => c.status === "ativo");
  const inativos = ct(atual, c => c.status === "inativo");
  const perdidos = ct(atual, c => c.status === "perdido");
  const novos = ct(atual, c => c.novoNoPeriodo);
  const reativados = ct(atual, c => c.reativadoNoPeriodo);
  const positivados = ct(atual, c => c.positivadoNoPeriodo);

  const totalClientesPrev = ct(anterior, c => c.status !== "lead");
  const leadsPrev = ct(anterior, c => c.status === "lead");
  const ativosPrev = ct(anterior, c => c.status === "ativo");
  const inativosPrev = ct(anterior, c => c.status === "inativo");
  const perdidosPrev = ct(anterior, c => c.status === "perdido");
  const novosPrev = ct(anterior, c => c.novoNoPeriodo);
  const reativadosPrev = ct(anterior, c => c.reativadoNoPeriodo);
  const positivadosPrev = ct(anterior, c => c.positivadoNoPeriodo);

  const txPos = totalClientes > 0 ? (positivados / totalClientes) * 100 : 0;
  const txPosPrev = totalClientesPrev > 0 ? (positivadosPrev / totalClientesPrev) * 100 : 0;
  const churn = totalClientes > 0 ? (perdidos / totalClientes) * 100 : 0;
  const churnPrev = totalClientesPrev > 0 ? (perdidosPrev / totalClientesPrev) * 100 : 0;
  const txReat = inativos + perdidos > 0 ? (reativados / (inativos + perdidos)) * 100 : 0;
  const txReatPrev = inativosPrev + perdidosPrev > 0 ? (reativadosPrev / (inativosPrev + perdidosPrev)) * 100 : 0;

  const recencias = atual.filter(c => c.recencia < Infinity).map(c => c.recencia);
  const recenciaMedia = recencias.length ? recencias.reduce((s, x) => s + x, 0) / recencias.length : 0;
  const recenciasPrev = anterior.filter(c => c.recencia < Infinity).map(c => c.recencia);
  const recenciaMediaPrev = recenciasPrev.length ? recenciasPrev.reduce((s, x) => s + x, 0) / recenciasPrev.length : 0;

  const valor12mTotal = atual.reduce((s, c) => s + c.valor12m, 0);
  const ticketMedio = totalClientes > 0 ? valor12mTotal / totalClientes : 0;
  const ticketMedioPrev = totalClientesPrev > 0 ? anterior.reduce((s, c) => s + c.valor12m, 0) / totalClientesPrev : 0;
  const freqMedia = totalClientes > 0 ? atual.reduce((s, c) => s + c.freq12m, 0) / totalClientes : 0;
  const freqMediaPrev = totalClientesPrev > 0 ? anterior.reduce((s, c) => s + c.freq12m, 0) / totalClientesPrev : 0;

  return {
    classificadas: atual,
    classificadasPrev: anterior,
    totalClientes: kv(totalClientes, totalClientesPrev),
    leads: kv(leads, leadsPrev),
    ativos: kv(ativos, ativosPrev),
    inativos: kv(inativos, inativosPrev),
    perdidos: kv(perdidos, perdidosPrev),
    novos: kv(novos, novosPrev),
    reativados: kv(reativados, reativadosPrev),
    positivados: kv(positivados, positivadosPrev),
    txPositivacao: kv(txPos, txPosPrev),
    churn: kv(churn, churnPrev),
    txReativacao: kv(txReat, txReatPrev),
    recenciaMedia: kv(recenciaMedia, recenciaMediaPrev),
    ticketMedio: kv(ticketMedio, ticketMedioPrev),
    frequenciaMedia: kv(freqMedia, freqMediaPrev),
  };
}

export function kpisAtendimento(seed: Seed, range: DateRange, prev: DateRange, cfg: Cfg) {
  const contas = cfg.repId && cfg.repId !== "todos" ? seed.contas.filter(c => c.repId === cfg.repId) : seed.contas;
  const ats = filtrarRep(seed.atendimentos, cfg.repId);
  const ops = filtrarRep(seed.oportunidades, cfg.repId);

  const noPer = ats.filter(a => a.data >= range.from && a.data <= range.to);
  const noPrev = ats.filter(a => a.data >= prev.from && a.data <= prev.to);
  const cobertos = new Set(noPer.map(a => a.contaId)).size;
  const cobertosPrev = new Set(noPrev.map(a => a.contaId)).size;
  const cobertura = contas.length > 0 ? (cobertos / contas.length) * 100 : 0;
  const coberturaPrev = contas.length > 0 ? (cobertosPrev / contas.length) * 100 : 0;

  const aLeads = noPer.filter(a => a.leadOuCliente === "lead").length;
  const aClientes = noPer.filter(a => a.leadOuCliente === "cliente").length;
  const aLeadsPrev = noPrev.filter(a => a.leadOuCliente === "lead").length;
  const aClientesPrev = noPrev.filter(a => a.leadOuCliente === "cliente").length;

  const convertidos = noPer.filter(a => a.leadOuCliente === "lead" && a.resultado === "convertido").length;
  const txConv = aLeads > 0 ? (convertidos / aLeads) * 100 : 0;
  const convertidosPrev = noPrev.filter(a => a.leadOuCliente === "lead" && a.resultado === "convertido").length;
  const txConvPrev = aLeadsPrev > 0 ? (convertidosPrev / aLeadsPrev) * 100 : 0;

  const ciclo = cicloDiasMedio(ops, seed.hoje);
  const win = winRateGlobal(ops);
  const ganhas = ops.filter(o => o.etapa === "ganha");
  const ticketOp = ganhas.length > 0 ? ganhas.reduce((s, o) => s + o.valor, 0) / ganhas.length : 0;
  const opsAbertas = ops.filter(o => ETAPAS_FUNIL.includes(o.etapa));
  const pipelineRS = opsAbertas.reduce((s, o) => s + o.valor, 0);
  const tempoMedioEtapa = opsAbertas.length > 0
    ? opsAbertas.reduce((s, o) => s + differenceInDays(seed.hoje, o.ultimaMov), 0) / opsAbertas.length
    : 0;

  return {
    cobertura: kv(cobertura, coberturaPrev),
    nAtendimentos: kv(noPer.length, noPrev.length),
    aLeads: kv(aLeads, aLeadsPrev),
    aClientes: kv(aClientes, aClientesPrev),
    txConversao: kv(txConv, txConvPrev),
    ciclo: kv(ciclo, ciclo),
    winRate: kv(win, win),
    ticketOportunidade: kv(ticketOp, ticketOp),
    opsAbertas: kv(opsAbertas.length, opsAbertas.length),
    pipelineRS: kv(pipelineRS, pipelineRS),
    tempoMedioEtapa: kv(tempoMedioEtapa, tempoMedioEtapa),
    atendimentosNoPeriodo: noPer,
    opsNoPeriodo: opsAtivasNoRange(ops, range),
  };
}

export function kpisProduto(seed: Seed, range: DateRange, prev: DateRange, cfg: Cfg) {
  const pedidos = filtrarRep(seed.pedidos, cfg.repId);
  const noPer = pedidos.filter(p => p.data >= range.from && p.data <= range.to);
  const noPrev = pedidos.filter(p => p.data >= prev.from && p.data <= prev.to);

  const faturamento = noPer.reduce((s, p) => s + p.valor, 0);
  const faturamentoPrev = noPrev.reduce((s, p) => s + p.valor, 0);

  const marcasAtivas = new Set(noPer.map(p => p.marcaId)).size;
  const marcasAtivasPrev = new Set(noPrev.map(p => p.marcaId)).size;
  const ticketMarca = marcasAtivas > 0 ? faturamento / marcasAtivas : 0;
  const ticketMarcaPrev = marcasAtivasPrev > 0 ? faturamentoPrev / marcasAtivasPrev : 0;

  // cross-sell: marcas por cliente médio
  const byCliente = new Map<string, Set<string>>();
  noPer.forEach(p => {
    const s = byCliente.get(p.contaId) ?? new Set<string>();
    s.add(p.marcaId);
    byCliente.set(p.contaId, s);
  });
  const crossSell = byCliente.size > 0 ? Array.from(byCliente.values()).reduce((s, x) => s + x.size, 0) / byCliente.size : 0;

  // Marca líder, maior crescimento, maior queda
  const totalPorMarca = (lista: typeof pedidos) => {
    const m = new Map<string, number>();
    lista.forEach(p => m.set(p.marcaId, (m.get(p.marcaId) ?? 0) + p.valor));
    return m;
  };
  const cur = totalPorMarca(noPer);
  const pre = totalPorMarca(noPrev);
  const marcaLiderId = [...cur.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  const marcaLider = seed.marcas.find(m => m.id === marcaLiderId)?.nome ?? "—";

  const deltas = seed.marcas.map(m => {
    const a = cur.get(m.id) ?? 0;
    const p = pre.get(m.id) ?? 0;
    return { nome: m.nome, delta: p > 0 ? ((a - p) / p) * 100 : (a > 0 ? 100 : 0), valor: a };
  });
  const maiorCresc = deltas.filter(d => d.valor > 0).sort((a, b) => b.delta - a.delta)[0]?.nome ?? "—";
  const maiorQueda = deltas.sort((a, b) => a.delta - b.delta)[0]?.nome ?? "—";

  const itensPedido = noPer.length > 0 ? noPer.reduce((s, p) => s + p.itens, 0) / noPer.length : 0;
  const itensPedidoPrev = noPrev.length > 0 ? noPrev.reduce((s, p) => s + p.itens, 0) / noPrev.length : 0;

  const valorTop = cur.get(marcaLiderId ?? "") ?? 0;
  const concentracaoTop = faturamento > 0 ? (valorTop / faturamento) * 100 : 0;
  const valorTopPrev = pre.get(marcaLiderId ?? "") ?? 0;
  const concentracaoTopPrev = faturamentoPrev > 0 ? (valorTopPrev / faturamentoPrev) * 100 : 0;

  return {
    faturamento: kv(faturamento, faturamentoPrev),
    marcasAtivas: kv(marcasAtivas, marcasAtivasPrev),
    ticketMarca: kv(ticketMarca, ticketMarcaPrev),
    crossSell: kv(crossSell, crossSell),
    marcaLider,
    maiorCrescimento: maiorCresc,
    maiorQueda,
    itensPorPedido: kv(itensPedido, itensPedidoPrev),
    concentracaoTop: kv(concentracaoTop, concentracaoTopPrev),
    pedidosPeriodo: noPer,
    pedidosPrev: noPrev,
  };
}

export function kpisMetas(seed: Seed, _range: DateRange, _prev: DateRange, cfg: Cfg) {
  const repId = cfg.repId && cfg.repId !== "todos" ? cfg.repId : "consolidada";
  const mesAtual = `${seed.hoje.getFullYear()}-${String(seed.hoje.getMonth() + 1).padStart(2, "0")}`;
  const metasDoMes = seed.metas.filter(m => m.mes === mesAtual && m.repId === repId);
  const metaFat = metasDoMes.find(m => m.tipo === "faturamento")?.valor ?? 0;

  const pedidos = (cfg.repId && cfg.repId !== "todos")
    ? seed.pedidos.filter(p => p.repId === cfg.repId)
    : seed.pedidos;
  const inicioMes = new Date(seed.hoje.getFullYear(), seed.hoje.getMonth(), 1);
  const realizado = pedidos.filter(p => p.data >= inicioMes && p.data <= seed.hoje).reduce((s, p) => s + p.valor, 0);

  const atingimento = metaFat > 0 ? (realizado / metaFat) * 100 : 0;
  const diaAtual = seed.hoje.getDate();
  const diasNoMes = new Date(seed.hoje.getFullYear(), seed.hoje.getMonth() + 1, 0).getDate();
  const projecao = diaAtual > 0 ? (realizado / diaAtual) * diasNoMes : 0;
  const gap = Math.max(0, metaFat - realizado);
  const diasRestantes = Math.max(0, diasNoMes - diaAtual);
  const rsPorDia = diasRestantes > 0 ? gap / diasRestantes : gap;
  const paceAtingimento = metaFat > 0 ? (projecao / metaFat) * 100 : 0;

  return {
    metaFaturamento: metaFat,
    realizado,
    atingimento,
    paceAtingimento,
    projecao,
    gap,
    diasRestantes,
    rsPorDia,
    todasMetas: metasDoMes,
  };
}
