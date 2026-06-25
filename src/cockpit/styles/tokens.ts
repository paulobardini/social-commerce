// Cockpit Comercial Nextil — design tokens fixos da identidade
export const NX = {
  appBg: "#F6F7F9",
  card: "#FFFFFF",
  border: "#E7E9EE",
  text: "#0F172A",
  muted: "#64748B",
  primary: "#2D3A8C",
  primarySoft: "#E8EAF6",
  accent: "#F26B21",
} as const;

export const STATUS_COLORS = {
  ativo: "#16A34A",
  inativo: "#F59E0B",
  perdido: "#DC2626",
  lead: "#64748B",
  reativado: "#0D9488",
} as const;

export type Status = keyof typeof STATUS_COLORS;

export const STATUS_LABEL: Record<Status, string> = {
  ativo: "Ativo",
  inativo: "Inativo",
  perdido: "Perdido",
  lead: "Lead",
  reativado: "Reativado",
};

// Cores secundárias para charts (nichos, marcas, etapas)
export const CHART_PALETTE = [
  "#2D3A8C", "#F26B21", "#0D9488", "#9333EA", "#0EA5E9",
  "#65A30D", "#DB2777", "#CA8A04", "#475569", "#7C3AED",
];

export const fmtBRL = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export const fmtBRLc = (n: number) => {
  if (Math.abs(n) >= 1e6) return `R$ ${(n / 1e6).toFixed(1).replace(".", ",")}M`;
  if (Math.abs(n) >= 1e3) return `R$ ${(n / 1e3).toFixed(0)}k`;
  return fmtBRL(n);
};

export const fmtPct = (n: number, d = 1) => `${n.toFixed(d).replace(".", ",")}%`;
export const fmtNum = (n: number) => n.toLocaleString("pt-BR");
export const fmtDias = (n: number) => `${Math.round(n)} ${Math.round(n) === 1 ? "dia" : "dias"}`;

export const deltaColor = (d: number, invert = false) =>
  (invert ? -d : d) >= 0 ? "text-emerald-600" : "text-rose-600";

export const deltaArrow = (d: number) => (d > 0 ? "▲" : d < 0 ? "▼" : "—");
