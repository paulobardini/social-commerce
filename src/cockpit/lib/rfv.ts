import type { ContaClassificada } from "./classificar";

export type RfvSegmento = "Campeões" | "Fiéis" | "Em risco" | "Hibernando" | "Novos" | "Regulares";

function quintil(values: number[], v: number, asc = true): number {
  const sorted = [...values].sort((a, b) => a - b);
  const idx = sorted.findIndex(x => x >= v);
  const pos = idx < 0 ? sorted.length - 1 : idx;
  const q = Math.min(5, Math.max(1, Math.ceil(((pos + 1) / sorted.length) * 5)));
  return asc ? q : 6 - q;
}

export interface RfvCell { conta: string; r: number; f: number; v: number; segmento: RfvSegmento; valor: number; }

export function classificarRfv(classificadas: ContaClassificada[]): RfvCell[] {
  const ativos = classificadas.filter(c => c.status !== "lead" && c.ultimoPedido);
  if (ativos.length === 0) return [];
  const recencias = ativos.map(c => c.recencia);
  const freqs     = ativos.map(c => c.freq12m);
  const valores   = ativos.map(c => c.valor12m);

  return ativos.map(c => {
    // R: menor recência = maior score
    const r = quintil(recencias, c.recencia, false);
    const f = quintil(freqs, c.freq12m, true);
    const v = quintil(valores, c.valor12m, true);
    let segmento: RfvSegmento = "Regulares";
    if (r >= 4 && f >= 4 && v >= 4) segmento = "Campeões";
    else if (r >= 4 && f >= 4) segmento = "Fiéis";
    else if (r <= 2 && f >= 3) segmento = "Em risco";
    else if (r <= 2 && f <= 2) segmento = "Hibernando";
    else if (r === 5 && f === 1) segmento = "Novos";
    return { conta: c.conta.id, r, f, v, segmento, valor: c.valor12m };
  });
}

export const SEGMENTO_COLORS: Record<RfvSegmento, string> = {
  "Campeões":   "#16A34A",
  "Fiéis":      "#0D9488",
  "Em risco":   "#F59E0B",
  "Hibernando": "#DC2626",
  "Novos":      "#2D3A8C",
  "Regulares":  "#94A3B8",
};
