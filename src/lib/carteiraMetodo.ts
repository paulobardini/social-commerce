// Método de gestão de carteira — utilitários derivados de Cliente360.
import type { Cliente360 } from "@/data/mockCRM360";

export type Saude = "ativo" | "risco" | "inativo" | "perdido";
export type EstagioFunil = "novo" | "em_ativacao" | "ativo" | "em_risco" | "reativacao" | "perdido";

// Âncora de "hoje" fixa para consistência do mock.
export const HOJE_ANCHOR = new Date(2026, 3, 14); // 14/04/2026

function parseBR(date: string): Date | null {
  if (!date) return null;
  const [d, m, y] = date.split("/").map(Number);
  if (!d || !m || !y) return null;
  return new Date(y, m - 1, d);
}

export function diasSemContato(ultimoContato: string, hoje: Date = HOJE_ANCHOR): number {
  const dt = parseBR(ultimoContato);
  if (!dt) return 999;
  return Math.max(0, Math.floor((hoje.getTime() - dt.getTime()) / 86400000));
}

/** Saúde calculada (nunca editável). Baseada em recência de contato/compra. */
export function saudeCliente(c: Cliente360, hoje: Date = HOJE_ANCHOR): Saude {
  const dias = diasSemContato(c.ultimoContato, hoje);
  if (dias > 120) return "perdido";
  if (dias > 60) return "inativo";
  if (dias > 30) return "risco";
  return "ativo";
}

export const saudeLabel: Record<Saude, string> = {
  ativo: "Ativo",
  risco: "Em risco",
  inativo: "Inativo",
  perdido: "Perdido",
};

export const saudeColor: Record<Saude, string> = {
  ativo: "bg-emerald-100 text-emerald-700 border-emerald-200",
  risco: "bg-orange-100 text-orange-700 border-orange-200",
  inativo: "bg-red-100 text-red-700 border-red-200",
  perdido: "bg-slate-200 text-slate-600 border-slate-300",
};

export const saudeDot: Record<Saude, string> = {
  ativo: "bg-emerald-500",
  risco: "bg-orange-500",
  inativo: "bg-red-500",
  perdido: "bg-slate-400",
};

// Ticket médio pseudo-random estável por id.
function hash(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** Valor comprado nos últimos 12 meses (mock derivado). */
export function valor12m(c: Cliente360): number {
  if (c.pedidosRealizados === 0) return 0;
  const h = hash(c.id);
  const ticket = 3500 + (h % 8500); // 3.5k a 12k
  return c.pedidosRealizados * ticket;
}

export function formatBRL(v: number): string {
  if (v >= 1000) return `R$ ${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k`;
  return `R$ ${v.toFixed(0)}`;
}

// Indústrias/marcas — usamos marcasInteresse como proxy de indústrias.
export function industriasDe(c: Cliente360): string[] {
  return c.marcasInteresse ?? [];
}

/** Estágio canônico derivado (usuário pode sobrescrever via drag-and-drop). */
export function estagioDerivado(c: Cliente360): EstagioFunil {
  const dias = diasSemContato(c.ultimoContato);
  const temOportunidade = c.oportunidadesAbertas > 0 || c.orcamentosAtivos > 0;
  if (c.pedidosRealizados === 0) return temOportunidade ? "em_ativacao" : "novo";
  if (dias > 120) return "perdido";
  if (dias > 60) return "reativacao";
  if (dias > 30) return "em_risco";
  return "ativo";
}

// ---- Storage para overrides de estágio (drag-and-drop) ----
const OVERRIDES_KEY = "carteira:estagio-overrides";

export function loadOverrides(): Record<string, EstagioFunil> {
  try {
    const raw = localStorage.getItem(OVERRIDES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveOverride(clienteId: string, estagio: EstagioFunil) {
  const cur = loadOverrides();
  cur[clienteId] = estagio;
  localStorage.setItem(OVERRIDES_KEY, JSON.stringify(cur));
}

export function estagioAtual(c: Cliente360, overrides: Record<string, EstagioFunil>): EstagioFunil {
  return overrides[c.id] ?? estagioDerivado(c);
}

// ---- Definição dos estágios canônicos do funil ----
export interface EstagioDef {
  id: EstagioFunil;
  nome: string;
  cor: string;      // dot / border
  objetivo: string; // playbook curto
  acaoLabel: string;
  followUpDias?: number;
}

export const ESTAGIOS: EstagioDef[] = [
  { id: "novo",         nome: "Novo",         cor: "#3b82f6", objetivo: "Primeiro contato em até 48h",             acaoLabel: "Primeiro contato",   followUpDias: 2 },
  { id: "em_ativacao",  nome: "Em ativação",  cor: "#8b5cf6", objetivo: "Converter interesse em primeiro pedido",  acaoLabel: "Agendar follow-up",  followUpDias: 3 },
  { id: "ativo",        nome: "Ativo",        cor: "#10b981", objetivo: "Manter cadência e ampliar ticket",        acaoLabel: "Registrar visita" },
  { id: "em_risco",     nome: "Em risco",     cor: "#f97316", objetivo: "Resgate antes que virem perdidos",        acaoLabel: "Resgatar agora",     followUpDias: 2 },
  { id: "reativacao",   nome: "Reativação",   cor: "#eab308", objetivo: "Trazer de volta com oferta específica",   acaoLabel: "Criar orçamento",    followUpDias: 7 },
  { id: "perdido",      nome: "Perdido",      cor: "#94a3b8", objetivo: "Tentar reativar ou arquivar",             acaoLabel: "Tentar reativar",    followUpDias: 14 },
];

// ---- Chips rápidos ----
export type ChipFilter = "todos" | "risco" | "sem_cobertura" | "nunca_compraram" | "top_valor" | "novos_leads";

export interface ChipResult {
  id: ChipFilter;
  label: string;
  count: number;
}

export function contagemChips(clientes: Cliente360[], overrides: Record<string, EstagioFunil>): ChipResult[] {
  const topValorThreshold = [...clientes]
    .map(valor12m)
    .sort((a, b) => b - a)[Math.floor(clientes.length * 0.2)] ?? 0;
  const riscoCount = clientes.filter(c => saudeCliente(c) === "risco").length;
  const semCobertura = clientes.filter(c => diasSemContato(c.ultimoContato) > 30).length;
  const nunca = clientes.filter(c => c.pedidosRealizados === 0).length;
  const top = clientes.filter(c => valor12m(c) >= topValorThreshold && topValorThreshold > 0).length;
  const novos = clientes.filter(c => estagioAtual(c, overrides) === "novo").length;
  return [
    { id: "todos", label: "Todos", count: clientes.length },
    { id: "risco", label: "Em risco", count: riscoCount },
    { id: "sem_cobertura", label: "Sem cobertura 30d", count: semCobertura },
    { id: "nunca_compraram", label: "Nunca compraram", count: nunca },
    { id: "top_valor", label: "Top valor", count: top },
    { id: "novos_leads", label: "Novos leads", count: novos },
  ];
}

export function aplicarChip(clientes: Cliente360[], chip: ChipFilter, overrides: Record<string, EstagioFunil>): Cliente360[] {
  if (chip === "todos") return clientes;
  const topValorThreshold = [...clientes]
    .map(valor12m)
    .sort((a, b) => b - a)[Math.floor(clientes.length * 0.2)] ?? 0;
  return clientes.filter(c => {
    switch (chip) {
      case "risco": return saudeCliente(c) === "risco";
      case "sem_cobertura": return diasSemContato(c.ultimoContato) > 30;
      case "nunca_compraram": return c.pedidosRealizados === 0;
      case "top_valor": return valor12m(c) >= topValorThreshold && topValorThreshold > 0;
      case "novos_leads": return estagioAtual(c, overrides) === "novo";
    }
  });
}

// ---- Faixa "Método" ----
export interface MetodoStats {
  giroPct: number;               // % ativos já atendidos no mês
  atendidosMes: number;
  totalAtivos: number;
  emRiscoResgate: number;
  semCobertura: number;
  reativacoesMes: number;
  metaReativacoes: number;
}

export function calcularMetodo(clientes: Cliente360[]): MetodoStats {
  const ativos = clientes.filter(c => saudeCliente(c) === "ativo");
  const atendidosMes = clientes.filter(c => diasSemContato(c.ultimoContato) <= 30).length;
  const emRiscoResgate = clientes.filter(c => saudeCliente(c) === "risco").length;
  const semCobertura = clientes.filter(c => diasSemContato(c.ultimoContato) > 30 && diasSemContato(c.ultimoContato) <= 60).length;
  const reativacoesMes = clientes.filter(c => c.status === "reativacao" && diasSemContato(c.ultimoContato) <= 30).length;
  return {
    giroPct: ativos.length === 0 ? 0 : Math.round((atendidosMes / Math.max(ativos.length, 1)) * 100),
    atendidosMes,
    totalAtivos: ativos.length,
    emRiscoResgate,
    semCobertura,
    reativacoesMes,
    metaReativacoes: Math.max(5, Math.round(clientes.length * 0.05)),
  };
}
