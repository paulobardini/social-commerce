// Detalhamento de leads: para quem cada lead foi distribuído, status e conversão.
// Sem dados reais de roteamento, a distribuição é derivada de forma determinística
// a partir do id do lead (mesma amarração em toda a sessão).
import { mockLeadsAtribuidos, type LeadAtribuido } from "@/marketing/data/mockMarketing";
import { channelLabels } from "@/marketing/styles/tokens";

export const VENDEDORES = [
  { id: "r1", nome: "André Lima", regiao: "Sudeste" },
  { id: "r2", nome: "Alexandre Souza", regiao: "Sul" },
  { id: "r3", nome: "Carla Mendes", regiao: "Sudeste" },
  { id: "r4", nome: "Daniel Rocha", regiao: "Nordeste" },
  { id: "r5", nome: "Giovanna Pires", regiao: "Sul" },
  { id: "r6", nome: "Sérgio Tavares", regiao: "Centro-Oeste" },
];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export type StatusLead = LeadAtribuido["status"];

export interface LeadDetalhe {
  id: string;
  cliente: string;
  origem: string;
  origemLabel: string;
  campanha: string;
  status: StatusLead;
  vendedorId: string | null;
  vendedor: string;
  regiao: string;
  distribuidoEm: string;   // ISO
  primeiroToque: string;   // ISO
  respostaHoras: number | null; // null = ainda sem resposta
  receita: number;
  custo: number;
}

export const statusLabel: Record<StatusLead, string> = {
  novo: "Novo",
  qualificado: "Qualificado",
  oportunidade: "Oportunidade",
  ganho: "Virou pedido",
  perdido: "Perdido",
};

export const statusColor: Record<StatusLead, string> = {
  novo: "#94A3B8",
  qualificado: "#363BB4",
  oportunidade: "#0EA5E9",
  ganho: "#0D9488",
  perdido: "#F43F5E",
};

export function leadsDetalhados(): LeadDetalhe[] {
  return mockLeadsAtribuidos.map((l) => {
    const h = hash(l.id);
    // ~8% dos leads novos ainda não foram distribuídos (ficam na fila do marketing)
    const naFila = l.status === "novo" && h % 12 === 0;
    const rep = VENDEDORES[h % VENDEDORES.length];
    const distribuido = new Date(l.primeiroToque);
    distribuido.setMinutes(distribuido.getMinutes() + (h % 90));
    // sem resposta se ainda está novo e caiu no bucket "sem toque"
    const semResposta = naFila || (l.status === "novo" && h % 5 === 0);
    const respostaHoras = semResposta ? null : ((h % 47) + 1) / 2;

    return {
      id: l.id,
      cliente: l.clienteNome,
      origem: l.origem,
      origemLabel: channelLabels[l.origem] ?? l.origem,
      campanha: l.utm.campaign || "—",
      status: l.status,
      vendedorId: naFila ? null : rep.id,
      vendedor: naFila ? "Não distribuído" : rep.nome,
      regiao: naFila ? "—" : rep.regiao,
      distribuidoEm: distribuido.toISOString(),
      primeiroToque: l.primeiroToque,
      respostaHoras,
      receita: l.receitaCrmConfirmada,
      custo: l.custoAtribuido,
    };
  }).sort((a, b) => (a.distribuidoEm < b.distribuidoEm ? 1 : -1));
}

export interface LinhaVendedorLead {
  vendedorId: string | null;
  vendedor: string;
  regiao: string;
  recebidos: number;
  semResposta: number;
  qualificados: number;
  oportunidades: number;
  ganhos: number;
  perdidos: number;
  receita: number;
  convQualificacao: number; // recebidos -> qualificado+
  convPedido: number;       // recebidos -> ganho
  tempoRespostaMedio: number; // horas
}

export function leadsPorVendedor(leads = leadsDetalhados()): LinhaVendedorLead[] {
  const grupos = new Map<string, LeadDetalhe[]>();
  leads.forEach((l) => {
    const k = l.vendedorId ?? "__fila__";
    if (!grupos.has(k)) grupos.set(k, []);
    grupos.get(k)!.push(l);
  });

  return [...grupos.entries()]
    .map(([k, lista]) => {
      const cont = (fn: (l: LeadDetalhe) => boolean) => lista.filter(fn).length;
      const qualificados = cont((l) => ["qualificado", "oportunidade", "ganho"].includes(l.status));
      const ganhos = cont((l) => l.status === "ganho");
      const comResposta = lista.filter((l) => l.respostaHoras !== null);
      return {
        vendedorId: k === "__fila__" ? null : k,
        vendedor: lista[0].vendedor,
        regiao: lista[0].regiao,
        recebidos: lista.length,
        semResposta: cont((l) => l.respostaHoras === null),
        qualificados,
        oportunidades: cont((l) => ["oportunidade", "ganho"].includes(l.status)),
        ganhos,
        perdidos: cont((l) => l.status === "perdido"),
        receita: lista.reduce((s, l) => s + l.receita, 0),
        convQualificacao: lista.length ? (qualificados / lista.length) * 100 : 0,
        convPedido: lista.length ? (ganhos / lista.length) * 100 : 0,
        tempoRespostaMedio: comResposta.length
          ? comResposta.reduce((s, l) => s + (l.respostaHoras ?? 0), 0) / comResposta.length
          : 0,
      };
    })
    .sort((a, b) => b.recebidos - a.recebidos);
}

export interface ResumoLeads {
  total: number;
  distribuidos: number;
  naFila: number;
  semResposta: number;
  tempoRespostaMedio: number;
  convQualificacao: number;
  convOportunidade: number;
  convPedido: number;
  receita: number;
}

export function resumoLeads(leads = leadsDetalhados()): ResumoLeads {
  const total = leads.length;
  const cont = (fn: (l: LeadDetalhe) => boolean) => leads.filter(fn).length;
  const qualificados = cont((l) => ["qualificado", "oportunidade", "ganho"].includes(l.status));
  const oportunidades = cont((l) => ["oportunidade", "ganho"].includes(l.status));
  const ganhos = cont((l) => l.status === "ganho");
  const comResposta = leads.filter((l) => l.respostaHoras !== null);
  return {
    total,
    distribuidos: cont((l) => l.vendedorId !== null),
    naFila: cont((l) => l.vendedorId === null),
    semResposta: cont((l) => l.respostaHoras === null),
    tempoRespostaMedio: comResposta.length
      ? comResposta.reduce((s, l) => s + (l.respostaHoras ?? 0), 0) / comResposta.length
      : 0,
    convQualificacao: total ? (qualificados / total) * 100 : 0,
    convOportunidade: total ? (oportunidades / total) * 100 : 0,
    convPedido: total ? (ganhos / total) * 100 : 0,
    receita: leads.reduce((s, l) => s + l.receita, 0),
  };
}

// Conversão por origem: quantos leads de cada canal chegam a pedido.
export function conversaoPorOrigem(leads = leadsDetalhados()) {
  const grupos = new Map<string, LeadDetalhe[]>();
  leads.forEach((l) => {
    if (!grupos.has(l.origemLabel)) grupos.set(l.origemLabel, []);
    grupos.get(l.origemLabel)!.push(l);
  });
  return [...grupos.entries()]
    .map(([label, lista]) => {
      const ganhos = lista.filter((l) => l.status === "ganho").length;
      const qualificados = lista.filter((l) => ["qualificado", "oportunidade", "ganho"].includes(l.status)).length;
      return {
        origem: label,
        leads: lista.length,
        qualificados,
        ganhos,
        convQualificacao: lista.length ? (qualificados / lista.length) * 100 : 0,
        convPedido: lista.length ? (ganhos / lista.length) * 100 : 0,
        receita: lista.reduce((s, l) => s + l.receita, 0),
      };
    })
    .sort((a, b) => b.leads - a.leads);
}
