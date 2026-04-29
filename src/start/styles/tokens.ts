export const START_COLORS = {
  primary: "#1D9E75",
  primaryDark: "#0F6E56",
  primaryLight: "#E1F5EE",
  primaryBorder: "#9FE1CB",
  bg: "#FFFFFF",
  surface: "#F8F8F6",
  border: "rgba(0,0,0,0.08)",
  textPrimary: "#1A1A1A",
  textSecondary: "#6B6B6B",
  textTertiary: "#A0A0A0",
  warnBg: "#FAEEDA",
  warnText: "#854F0B",
  warnBorder: "#FAC775",
  errBg: "#FCEBEB",
  errText: "#A32D2D",
  errBorder: "#F7C1C1",
  infoBg: "#E6F1FB",
  infoText: "#185FA5",
} as const;

// Classes Tailwind reutilizáveis (com cores arbitrárias)
export const startClasses = {
  fontFamily: "font-['Inter']",
  btnPrimary:
    "inline-flex items-center justify-center gap-2 bg-[#1D9E75] text-white font-medium rounded-lg px-5 py-3 hover:bg-[#0F6E56] transition-colors disabled:opacity-50 disabled:pointer-events-none text-sm",
  btnSecondary:
    "inline-flex items-center justify-center gap-2 bg-transparent text-[#1D9E75] border border-[#1D9E75] font-medium rounded-lg px-5 py-3 hover:bg-[#E1F5EE] transition-colors text-sm",
  btnGhost:
    "inline-flex items-center justify-center gap-2 bg-transparent text-[#1A1A1A] hover:bg-[#F8F8F6] rounded-lg px-4 py-2 text-sm transition-colors",
  btnDestructive:
    "inline-flex items-center justify-center gap-2 bg-transparent text-[#A32D2D] border border-[#E24B4A] font-medium rounded-lg px-5 py-3 hover:bg-[#FCEBEB] transition-colors text-sm",
  input:
    "w-full bg-white border border-[rgba(0,0,0,0.12)] rounded-lg px-3.5 py-2.5 text-[14px] text-[#1A1A1A] placeholder:text-[#A0A0A0] focus:outline-none focus:border-[#1D9E75] focus:ring-1 focus:ring-[#1D9E75]/30 transition-colors",
  card:
    "bg-white border border-[rgba(0,0,0,0.08)] rounded-xl p-4",
  badgeQuente: "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#E1F5EE] text-[#0F6E56]",
  badgeMorno: "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#FAEEDA] text-[#854F0B]",
  badgeFrio: "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#E6F1FB] text-[#185FA5]",
  badgeNeutral: "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#F8F8F6] text-[#6B6B6B] border border-[rgba(0,0,0,0.06)]",
  label: "block text-[13px] font-medium text-[#1A1A1A] mb-1.5",
  hint: "text-[12px] text-[#6B6B6B] mt-1",
};

export function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatDateRelative(iso: string): string {
  const dias = Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24));
  if (dias === 0) {
    const horas = Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60));
    if (horas <= 0) return "agora há pouco";
    if (horas === 1) return "há 1 hora";
    return `há ${horas} horas`;
  }
  if (dias === 1) return "ontem";
  if (dias < 30) return `há ${dias} dias`;
  if (dias < 60) return "há 1 mês";
  return `há ${Math.floor(dias / 30)} meses`;
}

export function formatDateLong(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

export function formatWhats(num: string): string {
  const digits = num.replace(/\D/g, "");
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return num;
}
