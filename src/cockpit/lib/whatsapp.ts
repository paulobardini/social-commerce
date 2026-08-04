// Analytics de atendimento por WhatsApp (dentro da plataforma).
// Deriva métricas determinísticas a partir dos atendimentos do seed + cards do
// atendimento comercial (kanban), para dar leitura de valor ao gestor.
import type { Seed } from "../data/seed";
import type { DateRange } from "./range";
import { loadCardsAC, type CardAC } from "@/data/mockAtendimentoComercial";

function seedNum(str: string, salt: number): number {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}
const rnd = (str: string, salt: number, min: number, max: number) =>
  min + (seedNum(str, salt) % (max - min + 1));

export interface WppRepStats {
  repId: string;
  rep: string;
  conversas: number;
  mensagensEnviadas: number;
  mensagensRecebidas: number;
  primeiraRespostaMin: number;   // mediana em minutos
  respondidasNoSLA: number;      // % respondidas em até 30 min
  taxaResposta: number;          // % de conversas em que o cliente respondeu
  conversasSemResposta: number;  // aguardando o vendedor há mais de 24h
  conversasComPedido: number;
  conversao: number;             // % conversas que viraram pedido
}

export interface WppResumo {
  conversas: number;
  conversasAtivas: number;
  mensagens: number;
  primeiraRespostaMin: number;
  respondidasNoSLA: number;
  taxaResposta: number;
  aguardandoResposta: number;
  conversao: number;
  porRep: WppRepStats[];
  porHora: { hora: number; qtd: number }[];
  porDiaSemana: { dia: string; qtd: number }[];
  serie: { dia: string; recebidas: number; enviadas: number }[];
  filaSLA: { faixa: string; qtd: number; cor: string }[];
}

const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function analyticsWhatsApp(
  seed: Seed,
  range: DateRange,
  repIds: Set<string>,
): WppResumo {
  const reps = seed.representantes.filter(r => repIds.has(r.id));
  const atends = seed.atendimentos.filter(
    a => repIds.has(a.repId) && a.data >= range.from && a.data <= range.to,
  );

  // conversas de WhatsApp = atendimentos do tipo whatsapp (+ base do kanban)
  const wpp = atends.filter(a => String(a.tipo).toLowerCase().includes("whats"));
  const base = wpp.length > 0 ? wpp : atends;

  let cards: CardAC[] = [];
  try { cards = loadCardsAC(); } catch { cards = []; }

  const porRep: WppRepStats[] = reps.map(r => {
    const meus = base.filter(a => a.repId === r.id);
    const conversas = meus.length + cards.filter(c => c.vendedorNome === r.nome).length;
    const enviadas = conversas * rnd(r.id, 3, 4, 11);
    const recebidas = Math.round(enviadas * (0.55 + rnd(r.id, 5, 0, 35) / 100));
    const primeira = rnd(r.id, 7, 4, 95);
    const sla = Math.max(28, 100 - primeira - rnd(r.id, 9, 0, 15));
    const taxaResposta = 45 + rnd(r.id, 11, 0, 45);
    const comPedido = meus.filter(a => a.resultado === "convertido").length;
    return {
      repId: r.id,
      rep: r.nome,
      conversas,
      mensagensEnviadas: enviadas,
      mensagensRecebidas: recebidas,
      primeiraRespostaMin: primeira,
      respondidasNoSLA: sla,
      taxaResposta,
      conversasSemResposta: rnd(r.id, 13, 0, 7),
      conversasComPedido: comPedido,
      conversao: conversas ? (comPedido / conversas) * 100 : 0,
    };
  }).sort((a, b) => b.conversas - a.conversas);

  const conversas = porRep.reduce((s, r) => s + r.conversas, 0);
  const mensagens = porRep.reduce((s, r) => s + r.mensagensEnviadas + r.mensagensRecebidas, 0);
  const wavg = (get: (r: WppRepStats) => number) =>
    conversas ? porRep.reduce((s, r) => s + get(r) * r.conversas, 0) / conversas : 0;

  // distribuição por hora do dia (pico comercial)
  const porHora = Array.from({ length: 14 }, (_, i) => {
    const hora = i + 7; // 07h → 20h
    const curva = Math.exp(-Math.pow(hora - 11, 2) / 12) + 0.85 * Math.exp(-Math.pow(hora - 16, 2) / 10);
    return { hora, qtd: Math.round(curva * (conversas || 40) * 0.32) + rnd(`h${hora}`, 17, 0, 6) };
  });

  const porDiaSemana = DIAS.map((dia, i) => {
    const peso = i === 0 ? 0.08 : i === 6 ? 0.25 : 1;
    return { dia, qtd: Math.round((conversas || 40) * 0.22 * peso) + rnd(dia, 19, 0, 5) };
  });

  // série diária dos últimos 14 dias
  const serie = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(range.to);
    d.setDate(d.getDate() - (13 - i));
    const key = d.toISOString().slice(0, 10);
    const fds = d.getDay() === 0 || d.getDay() === 6;
    const fator = fds ? 0.25 : 1;
    const recebidas = Math.round((12 + rnd(key, 23, 0, 22)) * fator);
    return {
      dia: `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`,
      recebidas,
      enviadas: Math.round(recebidas * (1.1 + rnd(key, 29, 0, 60) / 100)),
    };
  });

  // fila por tempo de espera (leads aguardando resposta do vendedor)
  const espera = cards.map(c => (Date.now() - new Date(c.ultimaInteracao).getTime()) / 3600000);
  const faixa = (min: number, max: number) => espera.filter(h => h >= min && h < max).length;
  const filaSLA = [
    { faixa: "< 30 min", qtd: espera.filter(h => h < 0.5).length, cor: "#16A34A" },
    { faixa: "30min–2h", qtd: faixa(0.5, 2), cor: "#65A30D" },
    { faixa: "2h–8h", qtd: faixa(2, 8), cor: "#F59E0B" },
    { faixa: "8h–24h", qtd: faixa(8, 24), cor: "#F26B21" },
    { faixa: "> 24h", qtd: espera.filter(h => h >= 24).length, cor: "#DC2626" },
  ];

  return {
    conversas,
    conversasAtivas: cards.filter(c => c.status === "ativo").length,
    mensagens,
    primeiraRespostaMin: wavg(r => r.primeiraRespostaMin),
    respondidasNoSLA: wavg(r => r.respondidasNoSLA),
    taxaResposta: wavg(r => r.taxaResposta),
    aguardandoResposta: porRep.reduce((s, r) => s + r.conversasSemResposta, 0),
    conversao: wavg(r => r.conversao),
    porRep,
    porHora,
    porDiaSemana,
    serie,
    filaSLA,
  };
}

export const fmtMin = (m: number) =>
  m < 60 ? `${Math.round(m)} min` : `${Math.floor(m / 60)}h${String(Math.round(m % 60)).padStart(2, "0")}`;
