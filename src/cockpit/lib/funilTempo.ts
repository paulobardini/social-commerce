// Tempo médio em cada etapa do funil + análise de descartes.
import type { Etapa, Oportunidade } from "../data/seed";

export const ETAPA_LABEL: Record<string, string> = {
  novo_lead: "Novo lead",
  em_negociacao: "Em negociação",
  proposta_enviada: "Proposta enviada",
  orcamento_aprovado: "Orçamento aprovado",
  ganha: "Ganha",
  perdida: "Perdida",
};

export interface TempoEtapa {
  etapa: Etapa;
  label: string;
  mediaDias: number;
  medianaDias: number;
  amostra: number;
  gargalo: boolean;
}

export function temposPorEtapa(ops: Oportunidade[]): TempoEtapa[] {
  const buckets = new Map<string, number[]>();
  ops.forEach(o => {
    (o.temposEtapa ?? []).forEach(t => {
      const arr = buckets.get(t.etapa) ?? [];
      arr.push(t.dias);
      buckets.set(t.etapa, arr);
    });
  });
  const linhas = [...buckets.entries()].map(([etapa, dias]) => {
    const ord = [...dias].sort((a, b) => a - b);
    return {
      etapa: etapa as Etapa,
      label: ETAPA_LABEL[etapa] ?? etapa,
      mediaDias: dias.reduce((s, d) => s + d, 0) / dias.length,
      medianaDias: ord[Math.floor(ord.length / 2)] ?? 0,
      amostra: dias.length,
      gargalo: false,
    };
  });
  const ordem: Etapa[] = ["novo_lead", "em_negociacao", "proposta_enviada", "orcamento_aprovado"];
  linhas.sort((a, b) => ordem.indexOf(a.etapa) - ordem.indexOf(b.etapa));
  const pior = [...linhas].sort((a, b) => b.mediaDias - a.mediaDias)[0];
  return linhas.map(l => ({ ...l, gargalo: pior ? l.etapa === pior.etapa : false }));
}

export function cicloTotalMedio(linhas: TempoEtapa[]) {
  return linhas.reduce((s, l) => s + l.mediaDias, 0);
}

export interface Descarte {
  motivo: string;
  qtd: number;
  valor: number;
  share: number;
  etapaMedia: string;
}

export function descartesPorMotivo(ops: Oportunidade[]): Descarte[] {
  const perdidas = ops.filter(o => o.etapa === "perdida");
  const total = perdidas.length || 1;
  const m = new Map<string, { qtd: number; valor: number; etapas: number[] }>();
  perdidas.forEach(o => {
    const k = o.motivoPerda ?? "Não informado";
    const cur = m.get(k) ?? { qtd: 0, valor: 0, etapas: [] };
    cur.qtd += 1;
    cur.valor += o.valor;
    cur.etapas.push((o.temposEtapa ?? []).length);
    m.set(k, cur);
  });
  const ordem = ["novo_lead", "em_negociacao", "proposta_enviada", "orcamento_aprovado"];
  return [...m.entries()]
    .map(([motivo, v]) => {
      const idx = Math.round(v.etapas.reduce((s, x) => s + x, 0) / v.etapas.length) - 1;
      return {
        motivo,
        qtd: v.qtd,
        valor: v.valor,
        share: (v.qtd / total) * 100,
        etapaMedia: ETAPA_LABEL[ordem[Math.max(0, Math.min(ordem.length - 1, idx))]] ?? "—",
      };
    })
    .sort((a, b) => b.qtd - a.qtd);
}
