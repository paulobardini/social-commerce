// Tokens visuais do módulo Marketing (reusa paleta dark navy do Vendedor + acentos próprios)
export const MKT_COLORS = {
  meta: "#1877F2",         // azul Meta
  metaBg: "rgba(24,119,242,0.08)",
  google: "#4285F4",
  whatsapp: "#25D366",
  email: "#A855F7",
  organic: "#10B981",
  paid: "#F59E0B",
  good: "#22C55E",
  warn: "#F59E0B",
  bad: "#EF4444",
} as const;

export function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}
export function formatBRLCompact(value: number): string {
  if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(1).replace(".", ",")}M`;
  if (value >= 1_000) return `R$ ${(value / 1_000).toFixed(1).replace(".", ",")}k`;
  return formatBRL(value);
}
export function formatPct(value: number, digits = 1): string {
  return `${value.toFixed(digits).replace(".", ",")}%`;
}
export function formatNum(value: number): string {
  return value.toLocaleString("pt-BR");
}
export function formatRoas(roas: number): string {
  return `${roas.toFixed(2).replace(".", ",")}x`;
}

export type MktChannel = "meta_ads" | "google_ads" | "organic" | "whatsapp" | "email" | "indicacao" | "direto";

export const channelLabels: Record<MktChannel, string> = {
  meta_ads: "Meta Ads",
  google_ads: "Google Ads",
  organic: "Orgânico",
  whatsapp: "WhatsApp",
  email: "E-mail",
  indicacao: "Indicação",
  direto: "Direto",
};

export const channelColors: Record<MktChannel, string> = {
  meta_ads: MKT_COLORS.meta,
  google_ads: MKT_COLORS.google,
  organic: MKT_COLORS.organic,
  whatsapp: MKT_COLORS.whatsapp,
  email: MKT_COLORS.email,
  indicacao: "#64748B",
  direto: "#94A3B8",
};

// Cores por origem do Atendimento Comercial (usadas na página Leads & Atendimento)
export type OrigemAC = "meta_ads" | "instagram" | "whats_central" | "whats_direto" | "manual";
export const origemACColors: Record<OrigemAC, string> = {
  meta_ads: "#1877F2",       // azul Meta
  instagram: "#C13584",      // rosa/roxo Instagram
  whats_central: "#25D366",  // verde WhatsApp
  whats_direto: "#0EA5A5",   // teal
  manual: "#94A3B8",         // cinza
};
export const origemACLabels: Record<OrigemAC, string> = {
  meta_ads: "Meta Ads",
  instagram: "Instagram",
  whats_central: "Whats central",
  whats_direto: "Whats direto",
  manual: "Manual",
};

