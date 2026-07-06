// ============================================================================
// MÉTODO DE SAÚDE DO CLIENTE — régua única (por RECÊNCIA DE COMPRA)
// ----------------------------------------------------------------------------
// Regras (globais, configuráveis por indústria no futuro):
//  - NOVO     (azul):     cadastrado há ≤ NOVO_MAX_DIAS e sem primeira compra
//  - ATIVO    (verde):    última compra ≤ ATIVO_MAX_DIAS
//  - EM RISCO (laranja):  ATIVO_MAX_DIAS+1 .. RISCO_MAX_DIAS
//  - INATIVO  (vermelho): RISCO_MAX_DIAS+1 .. INATIVO_MAX_DIAS
//  - PERDIDO  (cinza):    > INATIVO_MAX_DIAS  (ou sem compra + cadastro antigo)
//
// Contato recente NÃO altera saúde (saúde = dinheiro); alimenta apenas o
// indicador separado "cobertura" (atendido ou não no período).
//
// Saúde é calculada POR INDÚSTRIA. A saúde global do cliente = a MELHOR
// (menor recência) entre as indústrias em que existe histórico de compra.
// ============================================================================

import type { Cliente360 } from "@/data/mockCRM360";
import { HOJE_ANCHOR } from "./carteiraMetodo";

export type SaudeStatus = "novo" | "ativo" | "risco" | "inativo" | "perdido";

// Limiares (constantes por enquanto — futura config por indústria).
export const SAUDE_LIMIARES = {
  ATIVO_MAX_DIAS: 60,
  RISCO_MAX_DIAS: 120,
  INATIVO_MAX_DIAS: 180,
  NOVO_MAX_DIAS: 30,
} as const;

export const saudeOrdem: SaudeStatus[] = ["ativo", "risco", "inativo", "perdido", "novo"];

export const saudeLabel: Record<SaudeStatus, string> = {
  novo: "Novo",
  ativo: "Ativo",
  risco: "Em risco",
  inativo: "Inativo",
  perdido: "Perdido",
};

export const saudeColor: Record<SaudeStatus, string> = {
  novo:    "bg-blue-100 text-blue-700 border-blue-200",
  ativo:   "bg-emerald-100 text-emerald-700 border-emerald-200",
  risco:   "bg-orange-100 text-orange-700 border-orange-200",
  inativo: "bg-red-100 text-red-700 border-red-200",
  perdido: "bg-slate-200 text-slate-600 border-slate-300",
};

export const saudeDot: Record<SaudeStatus, string> = {
  novo:    "bg-blue-500",
  ativo:   "bg-emerald-500",
  risco:   "bg-orange-500",
  inativo: "bg-red-500",
  perdido: "bg-slate-400",
};

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function parseBR(date: string): Date | null {
  if (!date) return null;
  const [d, m, y] = date.split("/").map(Number);
  if (!d || !m || !y) return null;
  return new Date(y, m - 1, d);
}

function diffDias(ate: Date, de: Date): number {
  return Math.max(0, Math.floor((ate.getTime() - de.getTime()) / 86400000));
}

function hashInt(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** Status a partir da recência (dias desde última compra). */
export function statusPorRecencia(diasDesdeUltimaCompra: number): SaudeStatus {
  const { ATIVO_MAX_DIAS, RISCO_MAX_DIAS, INATIVO_MAX_DIAS } = SAUDE_LIMIARES;
  if (diasDesdeUltimaCompra <= ATIVO_MAX_DIAS) return "ativo";
  if (diasDesdeUltimaCompra <= RISCO_MAX_DIAS) return "risco";
  if (diasDesdeUltimaCompra <= INATIVO_MAX_DIAS) return "inativo";
  return "perdido";
}

/** Próximo limiar + status resultante (dias restantes até cruzar). */
export function proximoLimiar(status: SaudeStatus, diasDesdeUltimaCompra: number | null): { proximo: SaudeStatus; faltamDias: number } | null {
  if (diasDesdeUltimaCompra == null) return null;
  const { ATIVO_MAX_DIAS, RISCO_MAX_DIAS, INATIVO_MAX_DIAS } = SAUDE_LIMIARES;
  switch (status) {
    case "ativo":   return { proximo: "risco",   faltamDias: ATIVO_MAX_DIAS   - diasDesdeUltimaCompra };
    case "risco":   return { proximo: "inativo", faltamDias: RISCO_MAX_DIAS   - diasDesdeUltimaCompra };
    case "inativo": return { proximo: "perdido", faltamDias: INATIVO_MAX_DIAS - diasDesdeUltimaCompra };
    default: return null;
  }
}

// -----------------------------------------------------------------------------
// Derivação da última compra POR INDÚSTRIA (mock determinístico).
// Substituir por dado real quando integrado ao backend.
// -----------------------------------------------------------------------------
function diasUltimaCompraPorIndustria(cliente: Cliente360, industria: string, index: number): number | null {
  if (cliente.pedidosRealizados === 0) return null;
  const h = hashInt(cliente.id + "|" + industria);
  // Distribui num range razoável: 1ª indústria costuma ser a mais recente.
  const base = h % 260;
  const skew = index === 0 ? 0 : 40 + (index * 30);
  return Math.min(300, base + skew);
}

// -----------------------------------------------------------------------------
// Saúde por indústria + global
// -----------------------------------------------------------------------------

export interface SaudeIndustria {
  industria: string;
  diasDesdeUltimaCompra: number | null;   // null = sem compra registrada
  status: SaudeStatus;
  proximo: SaudeStatus | null;
  faltamDias: number | null;
  explicacao: string;
}

export interface SaudeDetalhada {
  status: SaudeStatus;                   // saúde global (melhor entre indústrias)
  industrias: SaudeIndustria[];
  industriaOrigem: string | null;        // qual indústria definiu o status global
  diasDesdeUltimaCompra: number | null;
  proximo: SaudeStatus | null;
  faltamDias: number | null;
  explicacao: string;                    // texto do tooltip
}

/** Cálculo completo da saúde do cliente (usar em badges/tooltips). */
export function calcularSaude(cliente: Cliente360, hoje: Date = HOJE_ANCHOR): SaudeDetalhada {
  const industrias = cliente.marcasInteresse ?? [];

  // Caso 1: sem compra alguma
  if (cliente.pedidosRealizados === 0) {
    const cadastro = parseBR(cliente.dataCadastro);
    const diasCadastro = cadastro ? diffDias(hoje, cadastro) : 999;
    if (diasCadastro <= SAUDE_LIMIARES.NOVO_MAX_DIAS) {
      const faltam = SAUDE_LIMIARES.NOVO_MAX_DIAS - diasCadastro;
      return {
        status: "novo",
        industrias: industrias.map(i => ({
          industria: i, diasDesdeUltimaCompra: null, status: "novo",
          proximo: "perdido", faltamDias: faltam,
          explicacao: `Novo: cadastrado há ${diasCadastro}d, ainda sem primeira compra`,
        })),
        industriaOrigem: null,
        diasDesdeUltimaCompra: null,
        proximo: "perdido",
        faltamDias: faltam,
        explicacao: `Novo: cadastrado há ${diasCadastro}d, ainda sem primeira compra · faltam ${Math.max(0, faltam)}d para virar Perdido`,
      };
    }
    // Sem compra + cadastro antigo → Perdido
    return {
      status: "perdido",
      industrias: industrias.map(i => ({
        industria: i, diasDesdeUltimaCompra: null, status: "perdido",
        proximo: null, faltamDias: null,
        explicacao: `Perdido: nunca comprou (cadastro há ${diasCadastro}d)`,
      })),
      industriaOrigem: null,
      diasDesdeUltimaCompra: null,
      proximo: null,
      faltamDias: null,
      explicacao: `Perdido: cliente sem primeira compra há ${diasCadastro}d`,
    };
  }

  // Caso 2: tem histórico de compra — calcula por indústria
  const porIndustria: SaudeIndustria[] = industrias.map((ind, i) => {
    const dias = diasUltimaCompraPorIndustria(cliente, ind, i);
    if (dias == null) {
      return {
        industria: ind, diasDesdeUltimaCompra: null, status: "perdido",
        proximo: null, faltamDias: null,
        explicacao: `Sem compra registrada em ${ind}`,
      };
    }
    const st = statusPorRecencia(dias);
    const prox = proximoLimiar(st, dias);
    return {
      industria: ind,
      diasDesdeUltimaCompra: dias,
      status: st,
      proximo: prox?.proximo ?? null,
      faltamDias: prox ? Math.max(0, prox.faltamDias) : null,
      explicacao: `${saudeLabel[st]}: última compra há ${dias} dias (${ind})`,
    };
  });

  // Global = melhor (menor recência)
  const melhor = [...porIndustria]
    .filter(p => p.diasDesdeUltimaCompra != null)
    .sort((a, b) => (a.diasDesdeUltimaCompra! - b.diasDesdeUltimaCompra!))[0];

  if (!melhor) {
    return {
      status: "perdido", industrias: porIndustria, industriaOrigem: null,
      diasDesdeUltimaCompra: null, proximo: null, faltamDias: null,
      explicacao: "Perdido: sem compras registradas nas indústrias mapeadas",
    };
  }

  const prox = proximoLimiar(melhor.status, melhor.diasDesdeUltimaCompra);
  const partes = porIndustria
    .filter(p => p.industria !== melhor.industria)
    .slice(0, 3)
    .map(p => `${p.industria}: ${p.diasDesdeUltimaCompra ?? "—"}d (${saudeLabel[p.status]})`);
  const cauda = partes.length ? ` · Outras: ${partes.join(" · ")}` : "";
  const countdown = prox ? ` · faltam ${Math.max(0, prox.faltamDias)}d para virar ${saudeLabel[prox.proximo]}` : "";

  return {
    status: melhor.status,
    industrias: porIndustria,
    industriaOrigem: melhor.industria,
    diasDesdeUltimaCompra: melhor.diasDesdeUltimaCompra,
    proximo: prox?.proximo ?? null,
    faltamDias: prox ? Math.max(0, prox.faltamDias) : null,
    explicacao: `${saudeLabel[melhor.status]}: última compra há ${melhor.diasDesdeUltimaCompra} dias (${melhor.industria})${countdown}${cauda}`,
  };
}

/** Compat: retorna só o status global. */
export function calcularSaudeStatus(cliente: Cliente360, hoje: Date = HOJE_ANCHOR): SaudeStatus {
  return calcularSaude(cliente, hoje).status;
}
