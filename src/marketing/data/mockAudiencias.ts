// Audiências do módulo Marketing — segmentos baseados em CRM + audiências importadas do Meta
import { mockClientes360, type ClienteStatus, type Nicho } from "@/data/mockCRM360";

export type AudienciaOrigem = "manual" | "regra_crm" | "importada_meta" | "lookalike" | "lookbook" | "campanha" | "score_based";
export type AudienciaStatus = "ativa" | "rascunho" | "arquivada" | "sincronizando";
export type ScoreFaixa = "quente" | "morno" | "frio";

export type RegraOperador = "in" | "not_in" | "gte" | "lte" | "eq" | "between";
export type RegraCampo =
  | "status"
  | "nicho"
  | "estado"
  | "tag"
  | "ultima_compra_dias"
  | "pedidos_realizados"
  | "temperatura"
  | "origem";

export interface RegraAudiencia {
  id: string;
  campo: RegraCampo;
  operador: RegraOperador;
  valor: string | string[] | number | [number, number];
}

export interface UsoAudiencia {
  id: string;
  data: string;
  contexto: "campanha" | "jornada" | "lookbook" | "ads_meta";
  refId: string;
  refNome: string;
}

export interface Audiencia {
  id: string;
  nome: string;
  descricao: string;
  origem: AudienciaOrigem;
  status: AudienciaStatus;
  // se origem = regra_crm, regras são processadas para gerar membros dinâmicos
  regras?: RegraAudiencia[];
  matchAll?: boolean; // AND vs OR
  // membros explícitos (importados/manual) ou cache
  membrosClienteIds: string[];
  totalMembros: number;
  // sync com Meta
  syncMeta?: { contaId?: string; audienceMetaId?: string; ultimoSync?: string; status?: "ok" | "pendente" | "erro" };
  // métricas
  conversoes: number;
  receitaAtribuida: number;
  cpaMedio: number;
  // metadata
  criadaEm: string;
  ultimaAtualizacao: string;
  criadaPor: string;
  cor: string;
  icone: "Users" | "Star" | "Flame" | "AlertTriangle" | "Sparkles" | "RotateCw";
  historicoUso: UsoAudiencia[];
}

// ===== Helper: aplicar regras sobre clientes do CRM =====
function diasDesde(dataBR: string): number {
  const [d, m, y] = dataBR.split("/").map(Number);
  if (!d || !m || !y) return 999;
  const dt = new Date(y, m - 1, d);
  return Math.floor((Date.now() - dt.getTime()) / (1000 * 60 * 60 * 24));
}

export function avaliarRegras(regras: RegraAudiencia[], matchAll = true): string[] {
  if (!regras || regras.length === 0) return mockClientes360.map(c => c.id);
  const checa = (c: typeof mockClientes360[number], r: RegraAudiencia): boolean => {
    let val: string | number | undefined;
    switch (r.campo) {
      case "status": val = c.status; break;
      case "nicho": val = c.nicho; break;
      case "estado": val = c.estado; break;
      case "tag": return Array.isArray(r.valor) ? (r.valor as string[]).some(t => c.tags.includes(t as never)) : c.tags.includes(r.valor as never);
      case "ultima_compra_dias": val = diasDesde(c.ultimoContato); break;
      case "pedidos_realizados": val = c.pedidosRealizados; break;
      case "temperatura": val = c.temperaturaComercial; break;
      case "origem": val = c.origem; break;
    }
    switch (r.operador) {
      case "in": return Array.isArray(r.valor) && (r.valor as (string | number)[]).includes(val as never);
      case "not_in": return Array.isArray(r.valor) && !(r.valor as (string | number)[]).includes(val as never);
      case "eq": return val === r.valor;
      case "gte": return typeof val === "number" && val >= (r.valor as number);
      case "lte": return typeof val === "number" && val <= (r.valor as number);
      case "between": return typeof val === "number" && Array.isArray(r.valor) && val >= (r.valor as [number, number])[0] && val <= (r.valor as [number, number])[1];
    }
    return false;
  };
  return mockClientes360
    .filter(c => matchAll ? regras.every(r => checa(c, r)) : regras.some(r => checa(c, r)))
    .map(c => c.id);
}

// ===== Mocks iniciais =====
const today = "13/04/2026";

export const mockAudiencias: Audiencia[] = [
  {
    id: "aud_clientes_ativos", nome: "Clientes ativos", descricao: "Lojistas que compraram nos últimos 90 dias.",
    origem: "regra_crm", status: "ativa", matchAll: true,
    regras: [{ id: "r1", campo: "status", operador: "in", valor: ["ativo"] }],
    membrosClienteIds: [], totalMembros: 0,
    conversoes: 38, receitaAtribuida: 184500, cpaMedio: 92,
    criadaEm: "10/02/2026", ultimaAtualizacao: today, criadaPor: "Camila Marketing",
    cor: "#22C55E", icone: "Users",
    historicoUso: [
      { id: "u1", data: "10/04/2026", contexto: "campanha", refId: "camp_001", refNome: "Lançamento Inverno 2026" },
      { id: "u2", data: "01/04/2026", contexto: "jornada", refId: "jor_002", refNome: "Boas-vindas pós primeira compra" },
    ],
  },
  {
    id: "aud_alto_potencial", nome: "Alto potencial", descricao: "Lojistas marcados como quentes ou com alto potencial.",
    origem: "regra_crm", status: "ativa", matchAll: false,
    regras: [
      { id: "r1", campo: "tag", operador: "in", valor: ["alto_potencial", "quente"] },
      { id: "r2", campo: "temperatura", operador: "in", valor: ["quente"] },
    ],
    membrosClienteIds: [], totalMembros: 0,
    conversoes: 14, receitaAtribuida: 98200, cpaMedio: 156,
    criadaEm: "12/02/2026", ultimaAtualizacao: today, criadaPor: "Camila Marketing",
    cor: "#F59E0B", icone: "Flame",
    historicoUso: [{ id: "u1", data: "08/04/2026", contexto: "ads_meta", refId: "cmp_001", refNome: "Lojistas SP — Awareness" }],
  },
  {
    id: "aud_em_risco", nome: "Carteira em risco", descricao: "Sem compra há mais de 60 dias ou status em risco.",
    origem: "regra_crm", status: "ativa", matchAll: false,
    regras: [
      { id: "r1", campo: "status", operador: "in", valor: ["em_risco"] },
      { id: "r2", campo: "ultima_compra_dias", operador: "gte", valor: 60 },
    ],
    membrosClienteIds: [], totalMembros: 0,
    conversoes: 6, receitaAtribuida: 22400, cpaMedio: 280,
    criadaEm: "01/03/2026", ultimaAtualizacao: today, criadaPor: "Camila Marketing",
    cor: "#EF4444", icone: "AlertTriangle",
    historicoUso: [{ id: "u1", data: "02/04/2026", contexto: "campanha", refId: "camp_002", refNome: "Reativação Carteira Fria" }],
  },
  {
    id: "aud_novos_90d", nome: "Novos clientes (90 dias)", descricao: "Cadastrados nos últimos 90 dias.",
    origem: "regra_crm", status: "ativa", matchAll: true,
    regras: [{ id: "r1", campo: "status", operador: "in", valor: ["novo"] }],
    membrosClienteIds: [], totalMembros: 0,
    conversoes: 22, receitaAtribuida: 64100, cpaMedio: 68,
    criadaEm: "15/02/2026", ultimaAtualizacao: today, criadaPor: "Camila Marketing",
    cor: "#00CFFF", icone: "Sparkles",
    historicoUso: [],
  },
  {
    id: "aud_reativacao", nome: "Para reativação", descricao: "Inativos com pelo menos 1 pedido histórico.",
    origem: "regra_crm", status: "ativa", matchAll: true,
    regras: [
      { id: "r1", campo: "status", operador: "in", valor: ["inativo", "reativacao"] },
      { id: "r2", campo: "pedidos_realizados", operador: "gte", valor: 1 },
    ],
    membrosClienteIds: [], totalMembros: 0,
    conversoes: 4, receitaAtribuida: 18900, cpaMedio: 320,
    criadaEm: "20/02/2026", ultimaAtualizacao: today, criadaPor: "Camila Marketing",
    cor: "#A855F7", icone: "RotateCw",
    historicoUso: [],
  },
  {
    id: "aud_meta_lookalike_compradores", nome: "Lookalike 1% — Compradores", descricao: "Audiência semelhante criada a partir dos compradores no Meta Ads.",
    origem: "lookalike", status: "ativa",
    membrosClienteIds: [], totalMembros: 215000,
    syncMeta: { contaId: "act_brandili_main", audienceMetaId: "23843123456", ultimoSync: "Hoje, 09:12", status: "ok" },
    conversoes: 0, receitaAtribuida: 0, cpaMedio: 0,
    criadaEm: "20/03/2026", ultimaAtualizacao: today, criadaPor: "Sync Meta",
    cor: "#1877F2", icone: "Star",
    historicoUso: [{ id: "u1", data: "01/04/2026", contexto: "ads_meta", refId: "cmp_006", refNome: "Fashion Week — Awareness" }],
  },
  {
    id: "aud_meta_visitantes_site", nome: "Visitantes do site (30d)", descricao: "Pixel da Brandili — sessões nos últimos 30 dias.",
    origem: "importada_meta", status: "sincronizando",
    membrosClienteIds: [], totalMembros: 18430,
    syncMeta: { contaId: "act_brandili_main", audienceMetaId: "23843987654", ultimoSync: "Há 2 horas", status: "pendente" },
    conversoes: 0, receitaAtribuida: 0, cpaMedio: 0,
    criadaEm: "05/03/2026", ultimaAtualizacao: today, criadaPor: "Sync Meta",
    cor: "#1877F2", icone: "Users",
    historicoUso: [],
  },
];

// Pré-resolve membros dinâmicos
mockAudiencias.forEach(a => {
  if (a.origem === "regra_crm" && a.regras) {
    a.membrosClienteIds = avaliarRegras(a.regras, a.matchAll ?? true);
    a.totalMembros = a.membrosClienteIds.length;
  }
});

export const campoLabels: Record<RegraCampo, string> = {
  status: "Status do cliente",
  nicho: "Nicho",
  estado: "Estado (UF)",
  tag: "Tag",
  ultima_compra_dias: "Dias desde último contato",
  pedidos_realizados: "Pedidos realizados",
  temperatura: "Temperatura comercial",
  origem: "Origem",
};

export const campoOpcoes: Record<RegraCampo, { operadores: RegraOperador[]; tipo: "select" | "multiselect" | "number"; opcoes?: { value: string; label: string }[] }> = {
  status: { operadores: ["in", "not_in"], tipo: "multiselect", opcoes: [
    { value: "ativo", label: "Ativo" }, { value: "novo", label: "Novo" }, { value: "em_risco", label: "Em risco" }, { value: "inativo", label: "Inativo" }, { value: "reativacao", label: "Reativação" },
  ]},
  nicho: { operadores: ["in", "not_in"], tipo: "multiselect", opcoes: [
    { value: "infantil", label: "Infantil" }, { value: "adulto", label: "Adulto" }, { value: "fitness", label: "Fitness" }, { value: "multimarcas", label: "Multimarcas" }, { value: "moda_praia", label: "Moda Praia" }, { value: "casual", label: "Casual" },
  ]},
  estado: { operadores: ["in", "not_in"], tipo: "multiselect", opcoes: ["SP","RJ","MG","RS","SC","PR","BA","DF","GO","PE"].map(s => ({ value: s, label: s })) },
  tag: { operadores: ["in"], tipo: "multiselect", opcoes: [
    { value: "quente", label: "Quente" }, { value: "alto_potencial", label: "Alto potencial" }, { value: "recorrente", label: "Recorrente" }, { value: "novo_cliente", label: "Novo cliente" }, { value: "infantil", label: "Infantil" }, { value: "adulto", label: "Adulto" }, { value: "fitness", label: "Fitness" }, { value: "urgente", label: "Urgente" },
  ]},
  ultima_compra_dias: { operadores: ["gte", "lte", "between"], tipo: "number" },
  pedidos_realizados: { operadores: ["gte", "lte", "between"], tipo: "number" },
  temperatura: { operadores: ["in"], tipo: "multiselect", opcoes: [{ value: "quente", label: "Quente" }, { value: "morna", label: "Morna" }, { value: "fria", label: "Fria" }] },
  origem: { operadores: ["in"], tipo: "multiselect", opcoes: ["Indicação","Carteira ativa","Prospecção ativa","Site","Feira comercial"].map(s => ({ value: s, label: s })) },
};

export const operadorLabels: Record<RegraOperador, string> = {
  in: "está em", not_in: "não está em", eq: "igual a", gte: "≥", lte: "≤", between: "entre",
};
