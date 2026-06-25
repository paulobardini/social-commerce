import { subDays, startOfDay, endOfDay, startOfQuarter, endOfQuarter, startOfYear, endOfYear, differenceInDays } from "date-fns";

export type PeriodKey = "hoje" | "7d" | "30d" | "90d" | "trimestre" | "semestre" | "ano" | "custom";

export interface DateRange { from: Date; to: Date; }

export function resolveRange(period: PeriodKey, custom?: DateRange, hoje = new Date()): DateRange {
  const to = endOfDay(hoje);
  switch (period) {
    case "hoje":      return { from: startOfDay(hoje), to };
    case "7d":        return { from: startOfDay(subDays(hoje, 6)), to };
    case "30d":       return { from: startOfDay(subDays(hoje, 29)), to };
    case "90d":       return { from: startOfDay(subDays(hoje, 89)), to };
    case "trimestre": return { from: startOfQuarter(hoje), to: endOfQuarter(hoje) };
    case "semestre": {
      const m = hoje.getMonth();
      const half = m < 6 ? 0 : 6;
      return { from: new Date(hoje.getFullYear(), half, 1), to: new Date(hoje.getFullYear(), half + 6, 0, 23, 59, 59) };
    }
    case "ano":       return { from: startOfYear(hoje), to: endOfYear(hoje) };
    case "custom":    return custom ?? { from: startOfDay(subDays(hoje, 29)), to };
  }
}

export function previousOf(range: DateRange): DateRange {
  const days = differenceInDays(range.to, range.from) + 1;
  return {
    from: startOfDay(subDays(range.from, days)),
    to:   endOfDay(subDays(range.to, days)),
  };
}

export function inRange(d: Date, r: DateRange): boolean {
  return d >= r.from && d <= r.to;
}

export function diasUteisRestantes(hoje = new Date()): number {
  const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
  let n = 0;
  for (let d = new Date(hoje); d <= fimMes; d.setDate(d.getDate() + 1)) {
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) n++;
  }
  return n;
}

export const periodLabel: Record<PeriodKey, string> = {
  hoje: "Hoje", "7d": "7 dias", "30d": "30 dias", "90d": "90 dias",
  trimestre: "Trimestre", semestre: "Semestre", ano: "Ano", custom: "Personalizado",
};
