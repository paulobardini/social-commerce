// Mock Meta Ads — contas, campanhas, conjuntos, anúncios
export type MetaObjective = "leads" | "conversions" | "traffic" | "awareness" | "engagement";
export type MetaStatus = "active" | "paused" | "ended";

export interface MetaAccount {
  id: string;
  name: string;
  business: string;
  currency: "BRL";
  pixelId: string;
  spent: number;
  status: MetaStatus;
}

export interface MetaCampaign {
  id: string;
  accountId: string;
  name: string;
  objective: MetaObjective;
  status: MetaStatus;
  startDate: string; // ISO
  endDate?: string;
  budgetDaily: number;
  spent: number;
  impressions: number;
  reach: number;
  clicks: number;
  ctr: number; // %
  cpc: number;
  leads: number;
  cpl: number;
  // Atribuição cruzada com CRM
  oportunidadeIds: string[]; // referencia mockCRM.mockOportunidades
  receitaAtribuida: number;
  roas: number;
  // Métricas bidirecionais (calculadas no contexto a partir de leads)
  leadsQuentes?: number;
  receitaCrmConfirmada?: number;
}

export interface MetaAdSet {
  id: string;
  campaignId: string;
  name: string;
  audience: string;
  placements: string[];
  budgetDaily: number;
  spent: number;
  impressions: number;
  clicks: number;
  leads: number;
  cpl: number;
  receitaAtribuida: number;
  roas: number;
}

export interface MetaAd {
  id: string;
  adSetId: string;
  name: string;
  creativeUrl: string; // imagem/thumbnail
  format: "image" | "video" | "carousel";
  headline: string;
  primaryText: string;
  cta: string;
  spent: number;
  impressions: number;
  clicks: number;
  ctr: number;
  leads: number;
  cpl: number;
  receitaAtribuida: number;
  roas: number;
  isWinner?: boolean;
}

export const objectiveLabels: Record<MetaObjective, string> = {
  leads: "Cadastros",
  conversions: "Conversões",
  traffic: "Tráfego",
  awareness: "Reconhecimento",
  engagement: "Engajamento",
};

export const statusLabels: Record<MetaStatus, string> = {
  active: "Ativa",
  paused: "Pausada",
  ended: "Encerrada",
};

// =========================================================================
// Mock data
// =========================================================================

export const mockMetaAccounts: MetaAccount[] = [
  { id: "act_001", name: "Brandili — Principal", business: "Brandili Têxtil S/A", currency: "BRL", pixelId: "PX-7842913", spent: 184230, status: "active" },
  { id: "act_002", name: "Brandili — Coleções Especiais", business: "Brandili Têxtil S/A", currency: "BRL", pixelId: "PX-7842914", spent: 62100, status: "active" },
  { id: "act_003", name: "Brandili — Outlet & Liquida", business: "Brandili Têxtil S/A", currency: "BRL", pixelId: "PX-7842915", spent: 18450, status: "paused" },
];

export const mockMetaCampaigns: MetaCampaign[] = [
  {
    id: "cmp_001", accountId: "act_001",
    name: "Inverno 2026 — Captação Lojistas SP/RJ",
    objective: "leads", status: "active",
    startDate: "2026-03-01", budgetDaily: 380,
    spent: 42150, impressions: 1_240_000, reach: 380_000, clicks: 18_400, ctr: 1.48, cpc: 2.29,
    leads: 612, cpl: 68.87, oportunidadeIds: ["op1", "op2"], receitaAtribuida: 73000, roas: 1.73,
  },
  {
    id: "cmp_002", accountId: "act_001",
    name: "Reativação — Multimarcas Carteira Fria",
    objective: "conversions", status: "active",
    startDate: "2026-02-15", budgetDaily: 220,
    spent: 28940, impressions: 612_000, reach: 145_000, clicks: 11_200, ctr: 1.83, cpc: 2.58,
    leads: 318, cpl: 91.00, oportunidadeIds: ["op7"], receitaAtribuida: 18000, roas: 0.62,
  },
  {
    id: "cmp_003", accountId: "act_001",
    name: "Linha Infantil — Lookbook Outono",
    objective: "traffic", status: "active",
    startDate: "2026-03-10", budgetDaily: 180,
    spent: 19440, impressions: 980_000, reach: 412_000, clicks: 24_800, ctr: 2.53, cpc: 0.78,
    leads: 412, cpl: 47.18, oportunidadeIds: ["op3"], receitaAtribuida: 15420, roas: 0.79,
  },
  {
    id: "cmp_004", accountId: "act_002",
    name: "Coleção Fitness Adulto — Atacadistas",
    objective: "leads", status: "active",
    startDate: "2026-03-05", budgetDaily: 320,
    spent: 32800, impressions: 720_000, reach: 198_000, clicks: 14_600, ctr: 2.03, cpc: 2.25,
    leads: 421, cpl: 77.90, oportunidadeIds: ["op4"], receitaAtribuida: 62000, roas: 1.89,
  },
  {
    id: "cmp_005", accountId: "act_001",
    name: "Alto Verão — Relacionamento Ganho",
    objective: "conversions", status: "active",
    startDate: "2026-02-20", budgetDaily: 140,
    spent: 14280, impressions: 380_000, reach: 92_000, clicks: 7_200, ctr: 1.89, cpc: 1.98,
    leads: 188, cpl: 75.96, oportunidadeIds: ["op5"], receitaAtribuida: 8900, roas: 0.62,
  },
  {
    id: "cmp_006", accountId: "act_002",
    name: "Fashion Week — Awareness Top of Mind",
    objective: "awareness", status: "active",
    startDate: "2026-03-15", budgetDaily: 500,
    spent: 24000, impressions: 2_840_000, reach: 920_000, clicks: 9_800, ctr: 0.35, cpc: 2.45,
    leads: 84, cpl: 285.71, oportunidadeIds: [], receitaAtribuida: 0, roas: 0,
  },
  {
    id: "cmp_007", accountId: "act_001",
    name: "Retargeting — Visitou Lookbook",
    objective: "conversions", status: "active",
    startDate: "2026-03-12", budgetDaily: 150,
    spent: 12420, impressions: 198_000, reach: 38_000, clicks: 8_900, ctr: 4.49, cpc: 1.40,
    leads: 287, cpl: 43.27, oportunidadeIds: ["op1"], receitaAtribuida: 32400, roas: 2.61,
  },
  {
    id: "cmp_008", accountId: "act_002",
    name: "Pimpolho — Indicação Lojistas Premium",
    objective: "leads", status: "active",
    startDate: "2026-03-20", budgetDaily: 260,
    spent: 5300, impressions: 92_000, reach: 28_000, clicks: 1_900, ctr: 2.07, cpc: 2.79,
    leads: 48, cpl: 110.42, oportunidadeIds: ["op7"], receitaAtribuida: 0, roas: 0,
  },
  {
    id: "cmp_009", accountId: "act_001",
    name: "Boas-vindas — Novos Cadastros",
    objective: "engagement", status: "active",
    startDate: "2026-01-10", budgetDaily: 80,
    spent: 18920, impressions: 442_000, reach: 168_000, clicks: 12_100, ctr: 2.74, cpc: 1.56,
    leads: 392, cpl: 48.27, oportunidadeIds: [], receitaAtribuida: 24800, roas: 1.31,
  },
  {
    id: "cmp_010", accountId: "act_001",
    name: "Black Friday Lojistas — Antecipada",
    objective: "conversions", status: "paused",
    startDate: "2026-02-01", endDate: "2026-02-28", budgetDaily: 600,
    spent: 18200, impressions: 520_000, reach: 178_000, clicks: 11_400, ctr: 2.19, cpc: 1.60,
    leads: 298, cpl: 61.07, oportunidadeIds: [], receitaAtribuida: 41200, roas: 2.26,
  },
  {
    id: "cmp_011", accountId: "act_003",
    name: "Outlet — Limpeza de Estoque Verão",
    objective: "traffic", status: "paused",
    startDate: "2026-01-20", endDate: "2026-02-15", budgetDaily: 120,
    spent: 8900, impressions: 280_000, reach: 92_000, clicks: 5_400, ctr: 1.93, cpc: 1.65,
    leads: 142, cpl: 62.68, oportunidadeIds: [], receitaAtribuida: 9200, roas: 1.03,
  },
  {
    id: "cmp_012", accountId: "act_003",
    name: "Liquida — Lookbook Saldo",
    objective: "conversions", status: "ended",
    startDate: "2026-01-05", endDate: "2026-01-25", budgetDaily: 90,
    spent: 9550, impressions: 198_000, reach: 68_000, clicks: 4_200, ctr: 2.12, cpc: 2.27,
    leads: 89, cpl: 107.30, oportunidadeIds: [], receitaAtribuida: 4800, roas: 0.50,
  },
];

// Conjuntos por campanha (3 por campanha em média)
function genAdSets(): MetaAdSet[] {
  const out: MetaAdSet[] = [];
  const audiencesByObj: Record<MetaObjective, string[]> = {
    leads: ["Lojistas SP — interesses moda", "Compradores 25-44", "Lookalike base de clientes 1%"],
    conversions: ["Retargeting site 30d", "Visitantes lookbook", "Carrinho abandonado"],
    traffic: ["Interesses moda infantil", "Fashion atacado", "Lojistas 18-54"],
    awareness: ["Brasil amplo 25-54", "Capitais sul/sudeste", "Lookalike eventos top"],
    engagement: ["Engajados Instagram 90d", "Seguidores página", "Lookalike engajamento"],
  };
  const placements = ["Feed IG", "Stories IG", "Reels IG", "Feed FB", "Marketplace"];

  mockMetaCampaigns.forEach(cmp => {
    const auds = audiencesByObj[cmp.objective];
    auds.forEach((aud, i) => {
      const share = i === 0 ? 0.5 : i === 1 ? 0.3 : 0.2;
      out.push({
        id: `${cmp.id}_set_${i + 1}`,
        campaignId: cmp.id,
        name: aud,
        audience: aud,
        placements: i === 0 ? placements.slice(0, 3) : placements.slice(i, i + 3),
        budgetDaily: Math.round(cmp.budgetDaily * share),
        spent: Math.round(cmp.spent * share),
        impressions: Math.round(cmp.impressions * share),
        clicks: Math.round(cmp.clicks * share),
        leads: Math.round(cmp.leads * share),
        cpl: cmp.leads > 0 ? Math.round((cmp.spent * share) / Math.max(1, cmp.leads * share)) : 0,
        receitaAtribuida: Math.round(cmp.receitaAtribuida * share),
        roas: cmp.roas * (0.85 + i * 0.15),
      });
    });
  });
  return out;
}

export const mockMetaAdSets: MetaAdSet[] = genAdSets();

// 3 anúncios por adset
const creativeImages = [
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1485518882345-15568b007407?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1479064555552-3ef4979f8908?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1542060748-10c28b62716f?w=400&h=400&fit=crop",
];

function genAds(): MetaAd[] {
  const out: MetaAd[] = [];
  const ctas = ["Saiba mais", "Cadastre-se", "Comprar agora", "Ver lookbook"];
  const formats: MetaAd["format"][] = ["image", "video", "carousel"];

  mockMetaAdSets.forEach((set, setIdx) => {
    [0, 1, 2].forEach(i => {
      const share = i === 0 ? 0.55 : i === 1 ? 0.3 : 0.15;
      const isWinner = i === 0;
      out.push({
        id: `${set.id}_ad_${i + 1}`,
        adSetId: set.id,
        name: `${set.audience.split(" ").slice(0, 2).join(" ")} v${i + 1}`,
        creativeUrl: creativeImages[(setIdx * 3 + i) % creativeImages.length],
        format: formats[i % 3],
        headline: ["Atacado direto da fábrica", "Cadastre seu CNPJ", "Coleção exclusiva", "Pronta entrega"][i % 4],
        primaryText: "Linha completa para multimarcas com condições especiais.",
        cta: ctas[i % ctas.length],
        spent: Math.round(set.spent * share),
        impressions: Math.round(set.impressions * share),
        clicks: Math.round(set.clicks * share),
        ctr: set.impressions > 0 ? (Math.round(set.clicks * share) / Math.max(1, Math.round(set.impressions * share))) * 100 : 0,
        leads: Math.round(set.leads * share),
        cpl: set.leads > 0 ? Math.round((set.spent * share) / Math.max(1, set.leads * share)) : 0,
        receitaAtribuida: Math.round(set.receitaAtribuida * share),
        roas: set.roas * (isWinner ? 1.2 : i === 1 ? 1 : 0.6),
        isWinner,
      });
    });
  });
  return out;
}

export const mockMetaAds: MetaAd[] = genAds();

// Série diária por campanha (últimos 30 dias)
export interface MetaDailyPoint {
  date: string;
  spent: number;
  leads: number;
  receita: number;
}
export function generateDailySeries(campaign: MetaCampaign, days = 30): MetaDailyPoint[] {
  const out: MetaDailyPoint[] = [];
  const today = new Date("2026-04-15");
  const dailySpent = campaign.spent / 30;
  const dailyLeads = campaign.leads / 30;
  const dailyReceita = campaign.receitaAtribuida / 30;
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const noise = 0.7 + Math.sin(i * 0.6) * 0.3 + (i % 7 === 0 ? -0.3 : 0);
    out.push({
      date: d.toISOString().slice(0, 10),
      spent: Math.max(0, Math.round(dailySpent * noise)),
      leads: Math.max(0, Math.round(dailyLeads * noise)),
      receita: Math.max(0, Math.round(dailyReceita * noise * (0.5 + Math.random() * 0.8))),
    });
  }
  return out;
}
