// Adaptador de Marketing para leitura gerencial (Dashboard Marketing do gestor).
// Consome os mocks do módulo /marketing sem duplicar dados.
import { mockMetaCampaigns } from "@/marketing/data/mockMeta";
import { mockLeadsAtribuidos, mockMonthlyTrend } from "@/marketing/data/mockMarketing";
import { channelLabels, channelColors, type MktChannel } from "@/marketing/styles/tokens";

export interface ResumoMarketing {
  investimento: number;
  investimentoPrev: number;
  leads: number;
  leadsPrev: number;
  cpl: number;
  cplPrev: number;
  receitaAtribuida: number;
  receitaConfirmada: number;
  receitaConfirmadaPrev: number;
  roas: number;
  roasPrev: number;
  leadsQualificados: number;
  leadsOportunidade: number;
  leadsGanhos: number;
  leadsPerdidos: number;
  convLeadCliente: number;
  cac: number;
  inbound: number;
  outbound: number;
}

export function resumoMarketing(): ResumoMarketing {
  const trend = mockMonthlyTrend;
  const atualMes = trend[trend.length - 1];
  const prevMes = trend[trend.length - 2] ?? atualMes;

  const investimento = mockMetaCampaigns.reduce((s, c) => s + c.spent, 0);
  const leads = mockLeadsAtribuidos.length;
  const receitaAtribuida = mockLeadsAtribuidos.reduce((s, l) => s + l.receita, 0);
  const receitaConfirmada = mockLeadsAtribuidos.reduce((s, l) => s + l.receitaCrmConfirmada, 0);

  const status = (s: string) => mockLeadsAtribuidos.filter(l => l.status === s).length;
  const ganhos = status("ganho");

  // proporção do mês anterior aplicada ao acumulado, para dar base de comparação
  const fator = atualMes.receita ? prevMes.receita / atualMes.receita : 1;
  const fatorLeads = atualMes.leads ? prevMes.leads / atualMes.leads : 1;
  const investimentoPrev = investimento * (atualMes.investimento ? prevMes.investimento / atualMes.investimento : 1);
  const leadsPrev = leads * fatorLeads;
  const receitaConfirmadaPrev = receitaConfirmada * fator;

  const inbound = mockLeadsAtribuidos.filter(l =>
    ["meta_ads", "google_ads", "organic", "email", "indicacao"].includes(l.origem)).length;

  return {
    investimento,
    investimentoPrev,
    leads,
    leadsPrev,
    cpl: leads ? investimento / leads : 0,
    cplPrev: leadsPrev ? investimentoPrev / leadsPrev : 0,
    receitaAtribuida,
    receitaConfirmada,
    receitaConfirmadaPrev,
    roas: investimento ? receitaConfirmada / investimento : 0,
    roasPrev: investimentoPrev ? receitaConfirmadaPrev / investimentoPrev : 0,
    leadsQualificados: status("qualificado"),
    leadsOportunidade: status("oportunidade"),
    leadsGanhos: ganhos,
    leadsPerdidos: status("perdido"),
    convLeadCliente: leads ? (ganhos / leads) * 100 : 0,
    cac: ganhos ? investimento / ganhos : 0,
    inbound,
    outbound: leads - inbound,
  };
}

export function funilMarketing() {
  const total = mockLeadsAtribuidos.length;
  const qualificados = mockLeadsAtribuidos.filter(l => ["qualificado", "oportunidade", "ganho"].includes(l.status)).length;
  const oportunidades = mockLeadsAtribuidos.filter(l => ["oportunidade", "ganho"].includes(l.status)).length;
  const ganhos = mockLeadsAtribuidos.filter(l => l.status === "ganho").length;
  return [
    { etapa: "Leads gerados", valor: total, receita: 0 },
    { etapa: "Qualificados", valor: qualificados, receita: 0 },
    { etapa: "Viraram oportunidade", valor: oportunidades, receita: 0 },
    { etapa: "Viraram pedido", valor: ganhos, receita: mockLeadsAtribuidos.filter(l => l.status === "ganho").reduce((s, l) => s + l.receitaCrmConfirmada, 0) },
  ];
}

export interface LinhaCanal {
  canal: MktChannel;
  label: string;
  cor: string;
  leads: number;
  custo: number;
  cpl: number;
  receita: number;
  roas: number;
  conversao: number;
}

export function porCanal(): LinhaCanal[] {
  const canais = [...new Set(mockLeadsAtribuidos.map(l => l.origem))] as MktChannel[];
  return canais
    .map(canal => {
      const lista = mockLeadsAtribuidos.filter(l => l.origem === canal);
      const custo = lista.reduce((s, l) => s + l.custoAtribuido, 0);
      const receita = lista.reduce((s, l) => s + l.receitaCrmConfirmada, 0);
      const ganhos = lista.filter(l => l.status === "ganho").length;
      return {
        canal,
        label: channelLabels[canal],
        cor: channelColors[canal],
        leads: lista.length,
        custo,
        cpl: lista.length ? custo / lista.length : 0,
        receita,
        roas: custo ? receita / custo : 0,
        conversao: lista.length ? (ganhos / lista.length) * 100 : 0,
      };
    })
    .sort((a, b) => b.leads - a.leads);
}

export function porCampanha() {
  return mockMetaCampaigns
    .map(c => ({
      id: c.id,
      nome: c.name,
      status: c.status,
      investido: c.spent,
      leads: c.leads,
      cpl: c.cpl,
      receita: c.receitaCrmConfirmada ?? c.receitaAtribuida,
      roas: c.spent ? (c.receitaCrmConfirmada ?? c.receitaAtribuida) / c.spent : 0,
      ctr: c.ctr,
    }))
    .sort((a, b) => b.investido - a.investido);
}

export function serieMarketing() {
  return mockMonthlyTrend.map(m => ({
    mes: m.month,
    investimento: m.investimento,
    leads: m.leads,
    receita: m.receita,
    roas: m.investimento ? m.receita / m.investimento : 0,
  }));
}
