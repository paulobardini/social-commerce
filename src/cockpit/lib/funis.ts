import { differenceInDays } from "date-fns";
import type { Oportunidade, Etapa } from "../data/seed";
import type { DateRange } from "./range";

export const ETAPAS_FUNIL: Etapa[] = ["novo_lead", "em_negociacao", "proposta_enviada", "orcamento_aprovado"];
export const ETAPA_LABEL: Record<Etapa, string> = {
  novo_lead: "Novo lead",
  em_negociacao: "Em negociação",
  proposta_enviada: "Proposta enviada",
  orcamento_aprovado: "Orçamento aprovado",
  ganha: "Ganha",
  perdida: "Perdida",
};

export function funilOportunidades(ops: Oportunidade[]) {
  const counts = ETAPAS_FUNIL.map(e => ({
    etapa: ETAPA_LABEL[e],
    valor: ops.filter(o => o.etapa === e).length,
    receita: ops.filter(o => o.etapa === e).reduce((s, o) => s + o.valor, 0),
  }));
  // taxa entre etapas
  const taxas = counts.map((c, i) => {
    if (i === 0) return null;
    const prev = counts[i - 1].valor;
    return prev > 0 ? (c.valor / prev) * 100 : 0;
  });
  return { counts, taxas };
}

export function pipelinePorEtapa(ops: Oportunidade[]) {
  return ETAPAS_FUNIL.map(e => ({
    etapa: ETAPA_LABEL[e],
    valor: ops.filter(o => o.etapa === e).reduce((s, o) => s + o.valor, 0),
    qtd: ops.filter(o => o.etapa === e).length,
  }));
}

export function oportunidadesEstagnadas(ops: Oportunidade[], diasMin: number, hoje: Date) {
  return ops
    .filter(o => ETAPAS_FUNIL.includes(o.etapa))
    .map(o => ({ ...o, diasParada: differenceInDays(hoje, o.ultimaMov) }))
    .filter(o => o.diasParada > diasMin)
    .sort((a, b) => b.diasParada - a.diasParada);
}

export function motivosPerda(ops: Oportunidade[]) {
  const map = new Map<string, number>();
  ops.filter(o => o.etapa === "perdida" && o.motivoPerda).forEach(o => {
    map.set(o.motivoPerda!, (map.get(o.motivoPerda!) ?? 0) + 1);
  });
  return Array.from(map.entries()).map(([motivo, qtd]) => ({ motivo, qtd })).sort((a, b) => b.qtd - a.qtd);
}

export function winRateGlobal(ops: Oportunidade[]) {
  const fechadas = ops.filter(o => o.etapa === "ganha" || o.etapa === "perdida");
  if (fechadas.length === 0) return 0;
  return (ops.filter(o => o.etapa === "ganha").length / fechadas.length) * 100;
}

export function cicloDiasMedio(ops: Oportunidade[], hoje: Date) {
  const ganhas = ops.filter(o => o.etapa === "ganha");
  if (ganhas.length === 0) return 0;
  return ganhas.reduce((s, o) => s + differenceInDays(hoje, o.abertaEm), 0) / ganhas.length;
}

export function opsAtivasNoRange(ops: Oportunidade[], range: DateRange) {
  return ops.filter(o => o.ultimaMov >= range.from && o.ultimaMov <= range.to);
}
