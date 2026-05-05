// Mocks gerais do módulo Marketing — leads atribuídos, touchpoints, alertas, integrações
import type { MktChannel } from "../styles/tokens";

export interface Touchpoint {
  id: string;
  channel: MktChannel;
  campaignId?: string; // referencia mockMetaCampaigns
  campaignName?: string;
  type: "ad_impression" | "ad_click" | "site_visit" | "lookbook_view" | "email_open" | "whatsapp_msg" | "form_submit" | "purchase";
  date: string; // ISO
  value?: number; // receita se purchase
}

export interface LeadAtribuido {
  id: string;
  clienteId?: string;       // amarra com CRM mockClientes
  clienteNome: string;
  oportunidadeId?: string;  // amarra com mockOportunidades
  utm: { source: string; medium: string; campaign: string; content?: string; };
  fbclid?: string;
  origem: MktChannel;
  primeiroToque: string; // ISO
  ultimoToque: string;   // ISO
  status: "novo" | "qualificado" | "oportunidade" | "ganho" | "perdido";
  receita: number;        // estimada (atribuição)
  receitaCrmConfirmada: number; // pedidos efetivamente fechados no CRM (subset de receita)
  custoAtribuido: number; // share do gasto da campanha
  touchpoints: Touchpoint[];
}

export interface AlertaMkt {
  id: string;
  tipo: "roas_baixo" | "cpl_alto" | "audiencia_saturada" | "budget_acabando" | "conversao_caiu";
  severity: "info" | "warn" | "danger";
  titulo: string;
  descricao: string;
  campaignId?: string;
  data: string;
}

export interface Integracao {
  id: string;
  nome: string;
  descricao: string;
  status: "conectado" | "desconectado" | "erro";
  conta?: string;
  ultimoSync?: string;
  destacar?: boolean;
}

// =====================================================
// Geração de leads cruzados com CRM
// =====================================================
import { mockOportunidades } from "@/data/mockCRM";
import { mockMetaCampaigns } from "./mockMeta";

const channels: MktChannel[] = ["meta_ads", "google_ads", "organic", "whatsapp", "email", "indicacao", "direto"];
const channelWeights: Record<MktChannel, number> = {
  meta_ads: 0.42, google_ads: 0.16, organic: 0.14, whatsapp: 0.10, email: 0.08, indicacao: 0.06, direto: 0.04,
};

function pickWeighted(): MktChannel {
  const r = Math.random();
  let acc = 0;
  for (const ch of channels) {
    acc += channelWeights[ch];
    if (r <= acc) return ch;
  }
  return "direto";
}

const utmCampaigns = ["inverno_2026", "reativacao_q1", "infantil_outono", "fitness_adulto", "alto_verao", "retargeting_lkb", "boas_vindas"];

function genTouchpoints(channel: MktChannel, dataConv: string, campaignId?: string, campaignName?: string, receita = 0): Touchpoint[] {
  const out: Touchpoint[] = [];
  const conv = new Date(dataConv);
  const minus = (days: number) => {
    const d = new Date(conv); d.setDate(d.getDate() - days); return d.toISOString();
  };
  if (channel === "meta_ads") {
    out.push({ id: "tp1", channel, campaignId, campaignName, type: "ad_impression", date: minus(18) });
    out.push({ id: "tp2", channel, campaignId, campaignName, type: "ad_click", date: minus(14) });
    out.push({ id: "tp3", channel, campaignId, campaignName, type: "site_visit", date: minus(13) });
    out.push({ id: "tp4", channel: "email", type: "email_open", date: minus(7) });
    out.push({ id: "tp5", channel: "whatsapp", type: "whatsapp_msg", date: minus(3) });
    out.push({ id: "tp6", channel, campaignId, campaignName, type: "form_submit", date: dataConv });
  } else {
    out.push({ id: "tp1", channel, type: "site_visit", date: minus(8) });
    out.push({ id: "tp2", channel, type: "form_submit", date: dataConv });
  }
  if (receita > 0) {
    out.push({ id: "tp_purchase", channel: "whatsapp", type: "purchase", date: minus(-1), value: receita });
  }
  return out;
}

// 220 leads atribuídos
function genLeads(): LeadAtribuido[] {
  const out: LeadAtribuido[] = [];
  // Primeiro: vincular oportunidades reais do CRM
  mockOportunidades.forEach((op, idx) => {
    // Encontrar uma campanha Meta vinculada se existir
    const cmp = mockMetaCampaigns.find(c => c.oportunidadeIds.includes(op.id));
    const channel: MktChannel = cmp ? "meta_ads" : ((idx % 3 === 0 ? "whatsapp" : idx % 3 === 1 ? "indicacao" : "organic") as MktChannel);
    const isGanho = op.etapa === "ganho";
    const isPerdido = op.etapa === "perdido";
    const status: LeadAtribuido["status"] = isGanho ? "ganho" : isPerdido ? "perdido" : "oportunidade";
    const receita = isGanho ? op.valorEstimado : 0;
    const custoAtribuido = cmp ? Math.round(cmp.spent / Math.max(1, cmp.oportunidadeIds.length + cmp.leads / 50)) : 0;
    out.push({
      id: `lead_${op.id}`,
      clienteId: op.clienteId,
      clienteNome: op.clienteNome,
      oportunidadeId: op.id,
      utm: {
        source: (channel as string) === "meta_ads" ? "facebook" : (channel as string) === "google_ads" ? "google" : (channel as string),
        medium: (channel as string) === "meta_ads" || (channel as string) === "google_ads" ? "cpc" : (channel as string) === "organic" ? "organic" : "referral",
        campaign: cmp ? utmCampaigns[idx % utmCampaigns.length] : "direto",
      },
      fbclid: cmp ? `fb.1.${Date.now()}.${idx}` : undefined,
      origem: channel,
      primeiroToque: op.dataCriacao.split("/").reverse().join("-") + "T10:00:00Z",
      ultimoToque: op.ultimaInteracao.split("/").reverse().join("-") + "T15:30:00Z",
      status,
      receita,
      receitaCrmConfirmada: isGanho ? Math.round(receita * 0.7) : 0,
      custoAtribuido,
      touchpoints: genTouchpoints(channel, op.ultimaInteracao.split("/").reverse().join("-"), cmp?.id, cmp?.name, receita),
    });
  });

  // Adicionar 200 leads sintéticos com progressão simulada (CRM "puxa" o status do Marketing)
  const baseDate = new Date("2026-04-01");
  // Distribuição alvo: 55% novo, 22% qualificado, 13% oportunidade, 7% ganho, 3% perdido
  const distribuicao: LeadAtribuido["status"][] = [
    ...Array(110).fill("novo"),
    ...Array(44).fill("qualificado"),
    ...Array(26).fill("oportunidade"),
    ...Array(14).fill("ganho"),
    ...Array(6).fill("perdido"),
  ];
  for (let i = 0; i < 200; i++) {
    const channel = pickWeighted();
    const cmp = channel === "meta_ads"
      ? mockMetaCampaigns[i % mockMetaCampaigns.length]
      : undefined;
    const d = new Date(baseDate);
    d.setDate(d.getDate() - (i % 30));
    const status = distribuicao[i] || "novo";
    const isGanho = status === "ganho";
    const receita = isGanho ? 4500 + (i % 12) * 1200 : 0;
    // Cliente vinculado se já avançou no CRM (qualificado em diante)
    const temCliente = status !== "novo";
    out.push({
      id: `lead_synth_${i}`,
      clienteId: temCliente ? `c_synth_${i}` : undefined,
      clienteNome: `Lead ${1000 + i}`,
      oportunidadeId: status === "oportunidade" || isGanho || status === "perdido" ? `op_synth_${i}` : undefined,
      utm: {
        source: channel === "meta_ads" ? "facebook" : channel === "google_ads" ? "google" : channel,
        medium: channel === "meta_ads" || channel === "google_ads" ? "cpc" : channel === "organic" ? "organic" : "referral",
        campaign: cmp ? utmCampaigns[i % utmCampaigns.length] : "direto",
      },
      fbclid: cmp ? `fb.1.${Date.now()}.${i}` : undefined,
      origem: channel,
      primeiroToque: d.toISOString(),
      ultimoToque: d.toISOString(),
      status,
      receita,
      receitaCrmConfirmada: isGanho ? Math.round(receita * 0.7) : 0,
      custoAtribuido: cmp ? Math.round(cmp.cpl) : Math.round(20 + Math.random() * 60),
      touchpoints: genTouchpoints(channel, d.toISOString(), cmp?.id, cmp?.name, receita),
    });
  }
  return out;
}

export const mockLeadsAtribuidos: LeadAtribuido[] = genLeads();

export const mockAlertasMkt: AlertaMkt[] = [
  { id: "al1", tipo: "roas_baixo", severity: "danger", titulo: "ROAS abaixo da meta", descricao: "Reativação Carteira Fria está com ROAS 0,62x (meta 1,5x)", campaignId: "cmp_002", data: "14/04/2026" },
  { id: "al2", tipo: "cpl_alto", severity: "warn", titulo: "CPL acima do benchmark", descricao: "Fashion Week — Awareness com CPL R$ 285 (média da conta R$ 78)", campaignId: "cmp_006", data: "13/04/2026" },
  { id: "al3", tipo: "audiencia_saturada", severity: "warn", titulo: "Audiência saturando", descricao: "Frequência média de 6,2 em Lojistas SP — considere refresh de criativo", campaignId: "cmp_001", data: "12/04/2026" },
  { id: "al4", tipo: "budget_acabando", severity: "info", titulo: "Budget mensal em 78%", descricao: "Conta principal a 12 dias do fim do mês com 22% restante", data: "13/04/2026" },
  { id: "al5", tipo: "conversao_caiu", severity: "warn", titulo: "Taxa de conversão caiu 18%", descricao: "Linha Infantil — Lookbook Outono perdeu performance nos últimos 7 dias", campaignId: "cmp_003", data: "14/04/2026" },
];

export const mockIntegracoes: Integracao[] = [
  { id: "int_meta", nome: "Meta Ads", descricao: "Sincronize campanhas, conjuntos, anúncios e Conversion API", status: "conectado", conta: "Brandili Têxtil S/A · 3 contas", ultimoSync: "Hoje, 14:32", destacar: true },
  { id: "int_wpp", nome: "WhatsApp Cloud API", descricao: "Disparos oficiais via API Meta para WhatsApp Business", status: "desconectado" },
  { id: "int_mailchimp", nome: "Mailchimp", descricao: "Disparo de e-mail marketing e sincronização de audiências", status: "desconectado" },
  { id: "int_ga4", nome: "Google Analytics 4", descricao: "Eventos de conversão e atribuição multi-canal", status: "desconectado" },
  { id: "int_gads", nome: "Google Ads", descricao: "Campanhas de busca, Performance Max e remarketing", status: "desconectado" },
];

// Série de tendência mensal (últimos 6 meses) usada no dashboard
export interface MonthlyKpi { month: string; investimento: number; leads: number; receita: number; }
export const mockMonthlyTrend: MonthlyKpi[] = [
  { month: "Nov", investimento: 38000, leads: 580, receita: 62000 },
  { month: "Dez", investimento: 52000, leads: 720, receita: 88000 },
  { month: "Jan", investimento: 48000, leads: 690, receita: 81000 },
  { month: "Fev", investimento: 61000, leads: 920, receita: 124000 },
  { month: "Mar", investimento: 78000, leads: 1180, receita: 162000 },
  { month: "Abr", investimento: 84000, leads: 1340, receita: 198000 },
];
