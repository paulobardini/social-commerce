import { differenceInDays, format, eachDayOfInterval, eachMonthOfInterval, startOfMonth } from "date-fns";
import type { DateRange } from "./range";
import type { Pedido, Atendimento } from "../data/seed";

export interface PontoTempo { data: string; valor: number; }

export function serieDiaria(range: DateRange, pedidos: Pedido[], metric: "valor" | "count" = "valor"): PontoTempo[] {
  const dias = eachDayOfInterval({ start: range.from, end: range.to });
  return dias.map(d => {
    const key = format(d, "yyyy-MM-dd");
    const ps = pedidos.filter(p => format(p.data, "yyyy-MM-dd") === key);
    return { data: key, valor: metric === "valor" ? ps.reduce((s, p) => s + p.valor, 0) : ps.length };
  });
}

export function mediaMovel(series: PontoTempo[], janela = 7): PontoTempo[] {
  return series.map((pt, i) => {
    const slice = series.slice(Math.max(0, i - janela + 1), i + 1);
    const avg = slice.reduce((s, p) => s + p.valor, 0) / slice.length;
    return { data: pt.data, valor: avg };
  });
}

export function serieMensal(meses: number, pedidos: Pedido[], hoje: Date): PontoTempo[] {
  const start = startOfMonth(new Date(hoje.getFullYear(), hoje.getMonth() - (meses - 1), 1));
  const list = eachMonthOfInterval({ start, end: hoje });
  return list.map(d => {
    const key = format(d, "yyyy-MM");
    const ps = pedidos.filter(p => format(p.data, "yyyy-MM") === key);
    return { data: format(d, "MMM/yy"), valor: ps.reduce((s, p) => s + p.valor, 0) };
  });
}

export function serieAtendimentosDiaria(range: DateRange, ats: Atendimento[]): PontoTempo[] {
  const dias = eachDayOfInterval({ start: range.from, end: range.to });
  return dias.map(d => {
    const key = format(d, "yyyy-MM-dd");
    return { data: key, valor: ats.filter(a => format(a.data, "yyyy-MM-dd") === key).length };
  });
}

export function heatmapMesRep(meses: number, pedidos: Pedido[], reps: { id: string; nome: string }[], hoje: Date) {
  const start = startOfMonth(new Date(hoje.getFullYear(), hoje.getMonth() - (meses - 1), 1));
  const list = eachMonthOfInterval({ start, end: hoje });
  return reps.map(r => ({
    rep: r.nome,
    cells: list.map(d => {
      const key = format(d, "yyyy-MM");
      const v = pedidos.filter(p => p.repId === r.id && format(p.data, "yyyy-MM") === key).reduce((s, p) => s + p.valor, 0);
      return { mes: format(d, "MMM"), valor: v };
    }),
  }));
}

export const _df = differenceInDays;
