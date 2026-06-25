import { differenceInDays } from "date-fns";
import type { ContaClassificada } from "./classificar";
import type { Pedido } from "../data/seed";

export const AGING_BUCKETS = [
  { key: "0-30",   label: "0-30 dias",   min: 0,   max: 30  },
  { key: "31-60",  label: "31-60 dias",  min: 31,  max: 60  },
  { key: "61-90",  label: "61-90 dias",  min: 61,  max: 90  },
  { key: "91-180", label: "91-180 dias", min: 91,  max: 180 },
  { key: "180+",   label: "180+ dias",   min: 181, max: Infinity },
] as const;

export function agingCarteira(classificadas: ContaClassificada[]) {
  return AGING_BUCKETS.map(b => ({
    label: b.label,
    value: classificadas.filter(c => c.recencia >= b.min && c.recencia <= b.max).length,
  }));
}

export function agingOportunidades(opsAbertas: { abertaEm: Date }[], hoje: Date) {
  const buckets = [
    { label: "0-7 dias", min: 0, max: 7 },
    { label: "8-15 dias", min: 8, max: 15 },
    { label: "16-30 dias", min: 16, max: 30 },
    { label: "31-60 dias", min: 31, max: 60 },
    { label: "60+ dias", min: 61, max: Infinity },
  ];
  return buckets.map(b => ({
    label: b.label,
    value: opsAbertas.filter(o => {
      const d = differenceInDays(hoje, o.abertaEm);
      return d >= b.min && d <= b.max;
    }).length,
  }));
}

export function _unused(_p: Pedido) { /* tree-shake */ }
