// Sistema de Lead Score — espinha dorsal do motor comercial bidirecional
import type { LeadAtribuido, Touchpoint } from "./mockMarketing";

export type SinalTipo =
  | "email_open" | "email_click" | "lookbook_view" | "lookbook_product_click"
  | "ad_click" | "site_visit_2x" | "whatsapp_reply" | "proposta_open"
  | "inativo_7d" | "inativo_15d";

export interface SinalLead {
  id: string;
  tipo: SinalTipo;
  pts: number;
  data: string; // ISO
  meta?: { lookbookSlug?: string; lookbookNome?: string; emailAssunto?: string; campanhaId?: string };
}

export interface LeadScore {
  leadId: string;
  score: number;
  classificacao: "quente" | "morno" | "frio";
  tendencia: "subindo" | "estavel" | "caindo";
  sinais: SinalLead[];
  breakdown: { tipo: SinalTipo; pts: number; count: number }[];
  ultimoSinal: { label: string; dataRelativa: string } | null;
  sugestaoAbordagem: string;
}

export const PONTOS: Record<SinalTipo, number> = {
  email_open: 5,
  email_click: 10,
  lookbook_view: 15,
  lookbook_product_click: 20,
  ad_click: 10,
  site_visit_2x: 15,
  whatsapp_reply: 25,
  proposta_open: 30,
  inativo_7d: -10,
  inativo_15d: -20,
};

export const SINAL_LABELS: Record<SinalTipo, string> = {
  email_open: "Abriu email",
  email_click: "Clicou no email",
  lookbook_view: "Visitou lookbook",
  lookbook_product_click: "Clicou em produto",
  ad_click: "Clicou no anúncio",
  site_visit_2x: "Visitou site 2x na semana",
  whatsapp_reply: "Respondeu WhatsApp",
  proposta_open: "Abriu proposta/grade",
  inativo_7d: "Inativo há 7 dias",
  inativo_15d: "Inativo há 15 dias",
};

export function classificar(score: number): "quente" | "morno" | "frio" {
  if (score >= 70) return "quente";
  if (score >= 40) return "morno";
  return "frio";
}

export function calcularScore(sinais: SinalLead[]): number {
  const total = sinais.reduce((s, x) => s + x.pts, 0);
  return Math.max(0, Math.min(100, total));
}

export function dataRelativa(iso: string, agora = new Date()): string {
  const d = new Date(iso);
  const diffMin = Math.floor((agora.getTime() - d.getTime()) / 60000);
  if (diffMin < 1) return "agora";
  if (diffMin < 60) return `há ${diffMin}min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `há ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `há ${diffD}d`;
  return `há ${Math.floor(diffD / 7)}sem`;
}

function tendenciaCalc(sinais: SinalLead[]): "subindo" | "estavel" | "caindo" {
  if (sinais.length < 3) return "estavel";
  const ord = [...sinais].sort((a, b) => +new Date(a.data) - +new Date(b.data));
  const meio = Math.floor(ord.length / 2);
  const old = ord.slice(0, meio).reduce((s, x) => s + x.pts, 0);
  const recent = ord.slice(meio).reduce((s, x) => s + x.pts, 0);
  if (recent > old + 5) return "subindo";
  if (recent < old - 5) return "caindo";
  return "estavel";
}

/**
 * Sugestão de abordagem determinística — ordem de prioridade:
 * 1. Visitou lookbook ≤48h
 * 2. Abriu email sem clicar
 * 3. Tendência subindo + sem contato
 * 4. Tendência caindo + última compra >90d
 * 5. Fallback
 */
export function gerarSugestaoAbordagem(
  sinais: SinalLead[],
  tendencia: "subindo" | "estavel" | "caindo",
  ctx: { temContatoRegistrado?: boolean; diasUltimaCompra?: number } = {}
): string {
  const agora = Date.now();
  const recentes = sinais.filter(s => agora - +new Date(s.data) <= 48 * 3600 * 1000);

  // 1
  const lkb = recentes.filter(s => s.tipo === "lookbook_view" && s.meta?.lookbookNome);
  if (lkb.length > 0) {
    const nome = lkb[0].meta!.lookbookNome!;
    return `Mencione "${nome}" — lojista visualizou ${lkb.length === 1 ? "1 vez" : `${lkb.length} vezes`}`;
  }

  // 2
  const aberturas = sinais.filter(s => s.tipo === "email_open");
  const cliques = sinais.filter(s => s.tipo === "email_click");
  if (aberturas.length > 0 && cliques.length === 0) {
    const assunto = aberturas[0].meta?.emailAssunto || "última campanha";
    return `Reforce o assunto "${assunto}" com abordagem direta`;
  }

  // 3
  if (tendencia === "subindo" && !ctx.temContatoRegistrado) {
    return "Momento ideal: entre em contato hoje";
  }

  // 4
  if (tendencia === "caindo" && (ctx.diasUltimaCompra ?? 0) > 90) {
    return "Ofereça condição especial de reativação";
  }

  return "Iniciar abordagem comercial padrão";
}

/**
 * Constrói os sinais de um lead a partir dos touchpoints + estado.
 * Pseudo-aleatório determinístico via hash do leadId.
 */
function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function construirSinaisDoLead(
  lead: LeadAtribuido,
  lookbooksDisponiveis: { slug: string; nome: string }[],
): SinalLead[] {
  const out: SinalLead[] = [];
  const h = hash(lead.id);
  const baseDate = new Date(lead.ultimoToque || lead.primeiroToque);

  const addSinal = (tipo: SinalTipo, daysAgo: number, meta?: SinalLead["meta"]) => {
    const d = new Date(baseDate); d.setDate(d.getDate() - daysAgo);
    out.push({ id: `s_${lead.id}_${out.length}`, tipo, pts: PONTOS[tipo], data: d.toISOString(), meta });
  };

  // Mapear touchpoints existentes
  lead.touchpoints.forEach((t: Touchpoint, idx) => {
    const days = Math.max(0, Math.floor((+new Date(lead.ultimoToque) - +new Date(t.date)) / 86400000));
    if (t.type === "ad_click") addSinal("ad_click", days, { campanhaId: t.campaignId });
    else if (t.type === "ad_impression") { /* sem pontos */ }
    else if (t.type === "email_open") addSinal("email_open", days, { emailAssunto: "Coleção Inverno 2026" });
    else if (t.type === "site_visit" && idx > 0) addSinal("site_visit_2x", days);
    else if (t.type === "whatsapp_msg") addSinal("whatsapp_reply", days);
  });

  // Sinais sintéticos baseados no hash — coerência por lead
  const r = h % 100;
  if (r < 60) {
    const lkb = lookbooksDisponiveis[h % Math.max(1, lookbooksDisponiveis.length)];
    if (lkb) {
      addSinal("lookbook_view", (h % 3), { lookbookSlug: lkb.slug, lookbookNome: lkb.nome });
      if (r < 30) addSinal("lookbook_product_click", (h % 2), { lookbookSlug: lkb.slug, lookbookNome: lkb.nome });
      if (r < 12) addSinal("lookbook_view", 1 + (h % 4), { lookbookSlug: lkb.slug, lookbookNome: lkb.nome });
    }
  }
  if (r < 25) addSinal("email_click", (h % 5), { emailAssunto: "Lookbook OI26 chegou" });
  if (r < 18) addSinal("proposta_open", (h % 6));

  // Penalidade por inatividade
  const diasUltimo = Math.floor((Date.now() - +baseDate) / 86400000);
  if (diasUltimo >= 15) addSinal("inativo_15d", 0);
  else if (diasUltimo >= 7) addSinal("inativo_7d", 0);

  return out;
}

export function calcularLeadScore(
  lead: LeadAtribuido,
  lookbooksDisponiveis: { slug: string; nome: string }[],
  ctx: { temContatoRegistrado?: boolean; diasUltimaCompra?: number } = {}
): LeadScore {
  const sinais = construirSinaisDoLead(lead, lookbooksDisponiveis);
  const score = calcularScore(sinais);
  const tendencia = tendenciaCalc(sinais);
  const ord = [...sinais].sort((a, b) => +new Date(b.data) - +new Date(a.data));
  const ultimo = ord[0];

  // Breakdown agregado
  const map = new Map<SinalTipo, { pts: number; count: number }>();
  sinais.forEach(s => {
    const cur = map.get(s.tipo) || { pts: 0, count: 0 };
    map.set(s.tipo, { pts: cur.pts + s.pts, count: cur.count + 1 });
  });
  const breakdown = Array.from(map.entries()).map(([tipo, v]) => ({ tipo, ...v }));

  return {
    leadId: lead.id,
    score,
    classificacao: classificar(score),
    tendencia,
    sinais: ord,
    breakdown,
    ultimoSinal: ultimo ? { label: SINAL_LABELS[ultimo.tipo], dataRelativa: dataRelativa(ultimo.data) } : null,
    sugestaoAbordagem: gerarSugestaoAbordagem(sinais, tendencia, ctx),
  };
}

export const scoreCores = {
  quente: { text: "text-orange-600", bg: "bg-orange-500/10", border: "border-orange-500/30", solid: "#F97316", emoji: "🔥" },
  morno: { text: "text-amber-600", bg: "bg-amber-500/10", border: "border-amber-500/30", solid: "#F59E0B", emoji: "✨" },
  frio: { text: "text-slate-500", bg: "bg-slate-500/10", border: "border-slate-500/30", solid: "#64748B", emoji: "❄️" },
} as const;
