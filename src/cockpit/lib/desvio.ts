// Coloração por desvio. Regra: se há alvo definido → cor vs alvo (verdade absoluta);
// se não há alvo → cai para desvio vs. média do time (relativo).
// Motivação: colorir sempre vs. média garante metade do time vermelho mesmo num time bom.

export type DesvioNivel = "otimo" | "bom" | "ok" | "alerta" | "critico";

export interface DesvioCfg {
  target?: number;   // alvo absoluto (ex: 100 para pace, 80 para cobertura)
  media?: number;    // média do grupo — usada só quando target ausente
  invert?: boolean;  // se true, valores MENORES são melhores (ex: % inativos)
}

export function nivelDesvio(valor: number, cfg: DesvioCfg): DesvioNivel {
  if (cfg.target != null) {
    // razão vs alvo
    const r = cfg.invert ? (cfg.target / Math.max(valor, 0.01)) : (valor / cfg.target);
    if (r >= 1.10) return "otimo";
    if (r >= 0.95) return "bom";
    if (r >= 0.80) return "ok";
    if (r >= 0.60) return "alerta";
    return "critico";
  }
  if (cfg.media != null && cfg.media > 0) {
    const d = ((valor - cfg.media) / cfg.media) * 100 * (cfg.invert ? -1 : 1);
    if (d >= 15) return "otimo";
    if (d >= 0) return "bom";
    if (d >= -15) return "ok";
    if (d >= -30) return "alerta";
    return "critico";
  }
  return "ok";
}

export const desvioClasse: Record<DesvioNivel, string> = {
  otimo:   "bg-emerald-50 text-emerald-700 border-emerald-200",
  bom:     "bg-emerald-50/60 text-emerald-700 border-emerald-100",
  ok:      "bg-slate-50 text-slate-600 border-slate-200",
  alerta:  "bg-amber-50 text-amber-700 border-amber-200",
  critico: "bg-rose-50 text-rose-700 border-rose-200",
};

export const desvioDot: Record<DesvioNivel, string> = {
  otimo:   "bg-emerald-500",
  bom:     "bg-emerald-400",
  ok:      "bg-slate-400",
  alerta:  "bg-amber-500",
  critico: "bg-rose-500",
};
