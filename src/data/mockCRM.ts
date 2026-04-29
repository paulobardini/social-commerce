// CRM Mock Data for NEXTIL 360 Phase 2

export type OportunidadeEtapa =
  | "novo_lead"
  | "contato_iniciado"
  | "em_qualificacao"
  | "proposta_construcao"
  | "orcamento_enviado"
  | "em_negociacao"
  | "ganho"
  | "perdido";

export type Prioridade = "alta" | "media" | "baixa";
export type TagCRM = "quente" | "recorrente" | "novo_cliente" | "alto_potencial" | "infantil" | "adulto" | "fitness" | "urgente";

// Estrutura nova de classificação de oportunidade (substitui o uso misturado de tags)
export type Temperatura = "quente" | "morno" | "frio";
export type CanalOrigem = "Site" | "WhatsApp" | "Feira" | "Indicação" | "Instagram" | "Cold call" | "E-mail" | "Outro";

export const canaisOrigem: CanalOrigem[] = [
  "Site", "WhatsApp", "Feira", "Indicação", "Instagram", "Cold call", "E-mail", "Outro",
];

export const temperaturaLabels: Record<Temperatura, string> = {
  quente: "Quente", morno: "Morno", frio: "Frio",
};

export const temperaturaColors: Record<Temperatura, string> = {
  quente: "bg-red-100 text-red-700 border-red-200",
  morno: "bg-yellow-100 text-yellow-700 border-yellow-200",
  frio: "bg-blue-100 text-blue-700 border-blue-200",
};

export interface EtapaFunil {
  id: string;
  nome: string;
  cor: string;
  ordem: number;
  tipo: "inicio" | "meio" | "ganho" | "perda";
  ativa: boolean;
}

export interface Oportunidade {
  id: string;
  nome: string;
  clienteId: string;
  clienteNome: string;
  representante: string;
  etapa: OportunidadeEtapa;
  valorEstimado: number;
  prioridade: Prioridade;
  tags: TagCRM[];
  // Classificação estruturada (nova)
  temperatura?: Temperatura;
  segmento?: string;
  urgente?: boolean;
  origem: CanalOrigem | string;
  probabilidade: number;
  dataCriacao: string;
  previsaoFechamento: string;
  ultimaInteracao: string;
  proximaAcao: string;
  observacoes: string;
  orcamentoIds: string[];
}

export interface AtividadeCRM {
  id: string;
  oportunidadeId: string;
  tipo: "ligacao" | "reuniao" | "email" | "follow_up" | "nota" | "mudanca_etapa" | "orcamento_criado" | "tarefa";
  descricao: string;
  data: string;
  autor: string;
  detalhes?: string;
}

export interface TarefaCRM {
  id: string;
  oportunidadeId?: string;
  clienteId?: string;
  titulo: string;
  descricao: string;
  status: "pendente" | "concluida" | "atrasada";
  prioridade: Prioridade;
  vencimento: string;
  responsavel: string;
}

export const etapasFunil: EtapaFunil[] = [
  { id: "e1", nome: "Novo lead", cor: "#94a3b8", ordem: 1, tipo: "inicio", ativa: true },
  { id: "e2", nome: "Contato iniciado", cor: "#60a5fa", ordem: 2, tipo: "meio", ativa: true },
  { id: "e3", nome: "Em qualificação", cor: "#a78bfa", ordem: 3, tipo: "meio", ativa: true },
  { id: "e4", nome: "Proposta em construção", cor: "#f59e0b", ordem: 4, tipo: "meio", ativa: true },
  { id: "e5", nome: "Orçamento enviado", cor: "#fb923c", ordem: 5, tipo: "meio", ativa: true },
  { id: "e6", nome: "Em negociação", cor: "#f97316", ordem: 6, tipo: "meio", ativa: true },
  { id: "e7", nome: "Ganho", cor: "#22c55e", ordem: 7, tipo: "ganho", ativa: true },
  { id: "e8", nome: "Perdido", cor: "#ef4444", ordem: 8, tipo: "perda", ativa: true },
];

export const etapaMap: Record<OportunidadeEtapa, string> = {
  novo_lead: "Novo lead",
  contato_iniciado: "Contato iniciado",
  em_qualificacao: "Em qualificação",
  proposta_construcao: "Proposta em construção",
  orcamento_enviado: "Orçamento enviado",
  em_negociacao: "Em negociação",
  ganho: "Ganho",
  perdido: "Perdido",
};

export const etapaCorMap: Record<OportunidadeEtapa, string> = {
  novo_lead: "#94a3b8",
  contato_iniciado: "#60a5fa",
  em_qualificacao: "#a78bfa",
  proposta_construcao: "#f59e0b",
  orcamento_enviado: "#fb923c",
  em_negociacao: "#f97316",
  ganho: "#22c55e",
  perdido: "#ef4444",
};

export const tagLabels: Record<TagCRM, string> = {
  quente: "Quente",
  recorrente: "Recorrente",
  novo_cliente: "Novo cliente",
  alto_potencial: "Alto potencial",
  infantil: "Infantil",
  adulto: "Adulto",
  fitness: "Fitness",
  urgente: "Urgente",
};

export const tagColors: Record<TagCRM, string> = {
  quente: "bg-red-100 text-red-700 border-red-200",
  recorrente: "bg-blue-100 text-blue-700 border-blue-200",
  novo_cliente: "bg-green-100 text-green-700 border-green-200",
  alto_potencial: "bg-purple-100 text-purple-700 border-purple-200",
  infantil: "bg-pink-100 text-pink-700 border-pink-200",
  adulto: "bg-slate-100 text-slate-700 border-slate-200",
  fitness: "bg-emerald-100 text-emerald-700 border-emerald-200",
  urgente: "bg-orange-100 text-orange-700 border-orange-200",
};

export const mockOportunidades: Oportunidade[] = [
  {
    id: "op1", nome: "Pedido Inverno 2026 – Multimarcas", clienteId: "c7", clienteNome: "Boutique da Thay",
    representante: "Paulo Bardini", etapa: "em_negociacao", valorEstimado: 45000, prioridade: "alta",
    tags: ["quente", "recorrente", "infantil"], origem: "Indicação", probabilidade: 75,
    dataCriacao: "01/03/2026", previsaoFechamento: "30/04/2026", ultimaInteracao: "12/04/2026",
    proximaAcao: "Enviar contraproposta de preços", observacoes: "Cliente quer exclusividade regional na coleção inverno.",
    orcamentoIds: ["2", "4", "7"],
  },
  {
    id: "op2", nome: "Abertura de conta – Fashion Kids", clienteId: "c11", clienteNome: "Fashion Kids Store",
    representante: "Paulo Bardini", etapa: "em_qualificacao", valorEstimado: 28000, prioridade: "media",
    tags: ["novo_cliente", "alto_potencial", "infantil"], origem: "Prospecção ativa", probabilidade: 40,
    dataCriacao: "05/03/2026", previsaoFechamento: "15/05/2026", ultimaInteracao: "10/04/2026",
    proximaAcao: "Agendar visita presencial", observacoes: "Loja nova com 3 pontos em SP. Potencial alto.",
    orcamentoIds: [],
  },
  {
    id: "op3", nome: "Reposição Verão – Alemão Vestuário", clienteId: "c4", clienteNome: "Alemão Vestuário",
    representante: "Paulo Bardini", etapa: "orcamento_enviado", valorEstimado: 15420, prioridade: "media",
    tags: ["recorrente", "infantil"], origem: "Carteira ativa", probabilidade: 60,
    dataCriacao: "28/03/2026", previsaoFechamento: "20/04/2026", ultimaInteracao: "08/04/2026",
    proximaAcao: "Aguardar retorno do lojista", observacoes: "Orçamento enviado com desconto de 5%.",
    orcamentoIds: ["12"],
  },
  {
    id: "op4", nome: "Coleção Fitness Adulto – Mega Atacado", clienteId: "c12", clienteNome: "Mega Atacado Infantil",
    representante: "Paulo Bardini", etapa: "proposta_construcao", valorEstimado: 62000, prioridade: "alta",
    tags: ["alto_potencial", "fitness", "adulto"], origem: "Feira comercial", probabilidade: 50,
    dataCriacao: "10/03/2026", previsaoFechamento: "30/05/2026", ultimaInteracao: "11/04/2026",
    proximaAcao: "Finalizar seleção de produtos", observacoes: "Interesse em linha fitness adulto + infantil casual.",
    orcamentoIds: [],
  },
  {
    id: "op5", nome: "Pedido Alto Verão – CJD Pozza", clienteId: "c8", clienteNome: "CJD Pozza Comercio do Vestuário Ltda",
    representante: "Paulo Bardini", etapa: "ganho", valorEstimado: 8900, prioridade: "baixa",
    tags: ["recorrente", "infantil"], origem: "Carteira ativa", probabilidade: 100,
    dataCriacao: "25/03/2026", previsaoFechamento: "10/04/2026", ultimaInteracao: "10/04/2026",
    proximaAcao: "Pedido confirmado", observacoes: "Aprovado sem ajustes.",
    orcamentoIds: ["13"],
  },
  {
    id: "op6", nome: "Lote Outlet – DBN OUTLET", clienteId: "c9", clienteNome: "DBN OUTLET",
    representante: "Paulo Bardini", etapa: "perdido", valorEstimado: 3200, prioridade: "baixa",
    tags: ["adulto"], origem: "Carteira ativa", probabilidade: 0,
    dataCriacao: "20/03/2026", previsaoFechamento: "05/04/2026", ultimaInteracao: "05/04/2026",
    proximaAcao: "Encerrado", observacoes: "Cliente optou por concorrente com prazo melhor.",
    orcamentoIds: ["14"],
  },
  {
    id: "op7", nome: "Primeira compra – Pimpolho Modas", clienteId: "c13", clienteNome: "Pimpolho Modas",
    representante: "Paulo Bardini", etapa: "contato_iniciado", valorEstimado: 18000, prioridade: "media",
    tags: ["novo_cliente", "infantil"], origem: "Indicação", probabilidade: 25,
    dataCriacao: "08/04/2026", previsaoFechamento: "30/05/2026", ultimaInteracao: "09/04/2026",
    proximaAcao: "Enviar catálogo digital", observacoes: "Contato feito via WhatsApp.",
    orcamentoIds: [],
  },
  {
    id: "op8", nome: "Expansão Linha Infantil – Rei das Crianças", clienteId: "c14", clienteNome: "Rei das Crianças",
    representante: "Paulo Bardini", etapa: "novo_lead", valorEstimado: 35000, prioridade: "alta",
    tags: ["alto_potencial", "infantil", "urgente"], origem: "Site", probabilidade: 15,
    dataCriacao: "11/04/2026", previsaoFechamento: "30/06/2026", ultimaInteracao: "11/04/2026",
    proximaAcao: "Fazer primeiro contato", observacoes: "Cadastro via site. 5 lojas em BH.",
    orcamentoIds: [],
  },
  {
    id: "op9", nome: "Reposição Primavera – Super Baby", clienteId: "c15", clienteNome: "Super Baby Store",
    representante: "Paulo Bardini", etapa: "novo_lead", valorEstimado: 22000, prioridade: "media",
    tags: ["recorrente", "infantil"], origem: "Carteira ativa", probabilidade: 20,
    dataCriacao: "12/04/2026", previsaoFechamento: "15/06/2026", ultimaInteracao: "12/04/2026",
    proximaAcao: "Ligar para apresentar coleção", observacoes: "Cliente comprou no semestre passado.",
    orcamentoIds: [],
  },
  {
    id: "op10", nome: "Moda Adulta – Trendy Kids", clienteId: "c16", clienteNome: "Trendy Kids",
    representante: "Paulo Bardini", etapa: "contato_iniciado", valorEstimado: 12000, prioridade: "baixa",
    tags: ["adulto", "novo_cliente"], origem: "Prospecção ativa", probabilidade: 20,
    dataCriacao: "09/04/2026", previsaoFechamento: "30/06/2026", ultimaInteracao: "09/04/2026",
    proximaAcao: "Enviar apresentação institucional", observacoes: "Interesse inicial em linha adulto casual.",
    orcamentoIds: [],
  },
  {
    id: "op11", nome: "Pedido Especial – Milykids", clienteId: "c3", clienteNome: "Milykids",
    representante: "Paulo Bardini", etapa: "orcamento_enviado", valorEstimado: 5230, prioridade: "media",
    tags: ["recorrente", "infantil"], origem: "Carteira ativa", probabilidade: 55,
    dataCriacao: "01/04/2026", previsaoFechamento: "25/04/2026", ultimaInteracao: "07/04/2026",
    proximaAcao: "Follow-up sobre orçamento", observacoes: "Em revisão pelo lojista.",
    orcamentoIds: ["11"],
  },
  {
    id: "op12", nome: "Kit Escolar – Universo Infantil", clienteId: "c17", clienteNome: "Universo Infantil",
    representante: "Paulo Bardini", etapa: "em_qualificacao", valorEstimado: 9500, prioridade: "baixa",
    tags: ["infantil"], origem: "Indicação", probabilidade: 30,
    dataCriacao: "06/04/2026", previsaoFechamento: "30/05/2026", ultimaInteracao: "06/04/2026",
    proximaAcao: "Mapear necessidades do cliente", observacoes: "Interesse em uniforms e kits escolares.",
    orcamentoIds: [],
  },
];

// Deriva campos estruturados (temperatura/segmento/urgente) a partir das tags legadas
// para que mocks antigos exibam corretamente os novos badges.
mockOportunidades.forEach(op => {
  if (!op.temperatura) {
    if (op.tags.includes("quente")) op.temperatura = "quente";
    else if (op.prioridade === "baixa") op.temperatura = "frio";
    else op.temperatura = "morno";
  }
  if (op.segmento === undefined) {
    const seg: string[] = [];
    if (op.tags.includes("infantil")) seg.push("Infantil");
    if (op.tags.includes("adulto")) seg.push("Adulto");
    if (op.tags.includes("fitness")) seg.push("Fitness");
    op.segmento = seg.join(" / ") || "";
  }
  if (op.urgente === undefined) {
    op.urgente = op.tags.includes("urgente");
  }
});

export const mockAtividades: AtividadeCRM[] = [
  { id: "a1", oportunidadeId: "op1", tipo: "ligacao", descricao: "Ligação com Thay para discutir condições", data: "12/04/2026 14:30", autor: "Paulo Bardini", detalhes: "Cliente pediu revisão de preço em 3 itens." },
  { id: "a2", oportunidadeId: "op1", tipo: "email", descricao: "Envio de tabela de preços atualizada", data: "10/04/2026 09:15", autor: "Paulo Bardini" },
  { id: "a3", oportunidadeId: "op1", tipo: "mudanca_etapa", descricao: "Movido de 'Orçamento enviado' para 'Em negociação'", data: "09/04/2026 16:00", autor: "Sistema" },
  { id: "a4", oportunidadeId: "op1", tipo: "orcamento_criado", descricao: "Orçamento #7 criado (R$ 11.610,60)", data: "07/04/2026 14:34", autor: "Paulo Bardini" },
  { id: "a5", oportunidadeId: "op1", tipo: "reuniao", descricao: "Reunião presencial na loja", data: "05/04/2026 10:00", autor: "Paulo Bardini", detalhes: "Apresentação da coleção inverno. Cliente muito interessada." },
  { id: "a6", oportunidadeId: "op1", tipo: "follow_up", descricao: "Follow-up via WhatsApp", data: "02/04/2026 11:20", autor: "Paulo Bardini" },
  { id: "a7", oportunidadeId: "op1", tipo: "nota", descricao: "Cliente quer exclusividade regional", data: "01/03/2026 15:00", autor: "Paulo Bardini", detalhes: "Precisa de exclusividade no raio de 50km para a coleção principal." },
  { id: "a8", oportunidadeId: "op2", tipo: "ligacao", descricao: "Primeiro contato com Fashion Kids", data: "10/04/2026 10:00", autor: "Paulo Bardini" },
  { id: "a9", oportunidadeId: "op2", tipo: "nota", descricao: "Loja tem 3 pontos em São Paulo", data: "05/03/2026 08:30", autor: "Paulo Bardini" },
  { id: "a10", oportunidadeId: "op3", tipo: "orcamento_criado", descricao: "Orçamento #12 enviado (R$ 15.420,30)", data: "28/03/2026 16:45", autor: "Paulo Bardini" },
  { id: "a11", oportunidadeId: "op3", tipo: "email", descricao: "Envio do orçamento por email", data: "28/03/2026 17:00", autor: "Paulo Bardini" },
  { id: "a12", oportunidadeId: "op4", tipo: "reuniao", descricao: "Contato na feira FIT 2026", data: "10/03/2026 14:00", autor: "Paulo Bardini", detalhes: "Grande interesse em fitness adulto e casual infantil." },
  { id: "a13", oportunidadeId: "op4", tipo: "follow_up", descricao: "Follow-up pós-feira", data: "11/04/2026 09:00", autor: "Paulo Bardini" },
];

export const mockTarefas: TarefaCRM[] = [
  { id: "t1", oportunidadeId: "op1", titulo: "Enviar contraproposta", descricao: "Revisar preços e enviar nova proposta", status: "pendente", prioridade: "alta", vencimento: "14/04/2026", responsavel: "Paulo Bardini" },
  { id: "t2", oportunidadeId: "op2", titulo: "Agendar visita presencial", descricao: "Marcar visita em São Paulo", status: "pendente", prioridade: "media", vencimento: "18/04/2026", responsavel: "Paulo Bardini" },
  { id: "t3", oportunidadeId: "op3", titulo: "Follow-up orçamento Alemão", descricao: "Ligar para verificar retorno", status: "atrasada", prioridade: "media", vencimento: "12/04/2026", responsavel: "Paulo Bardini" },
  { id: "t4", oportunidadeId: "op4", titulo: "Montar catálogo fitness", descricao: "Selecionar produtos fitness adulto", status: "pendente", prioridade: "alta", vencimento: "15/04/2026", responsavel: "Paulo Bardini" },
  { id: "t5", oportunidadeId: "op7", titulo: "Enviar catálogo Pimpolho", descricao: "Enviar catálogo digital via WhatsApp", status: "pendente", prioridade: "media", vencimento: "13/04/2026", responsavel: "Paulo Bardini" },
  { id: "t6", oportunidadeId: "op8", titulo: "Primeiro contato Rei das Crianças", descricao: "Ligar e apresentar Nextil", status: "pendente", prioridade: "alta", vencimento: "14/04/2026", responsavel: "Paulo Bardini" },
  { id: "t7", oportunidadeId: "op11", titulo: "Follow-up Milykids", descricao: "Verificar retorno sobre orçamento", status: "atrasada", prioridade: "media", vencimento: "10/04/2026", responsavel: "Paulo Bardini" },
  { id: "t8", clienteId: "c5", titulo: "Reativar Anjus baby e kids", descricao: "Sem contato há 45 dias", status: "pendente", prioridade: "baixa", vencimento: "16/04/2026", responsavel: "Paulo Bardini" },
];

// Dashboard KPIs
export const dashboardKPIs = {
  oportunidadesAbertas: 10,
  emNegociacao: 1,
  orcamentosEnviados: 2,
  tarefasPendentes: 6,
  tarefasAtrasadas: 2,
  clientesSemRetorno: 3,
  taxaConversao: 14.3,
  valorPipeline: 252350,
  valorMesAtual: 45000,
  ticketMedio: 25235,
};

export const compromissos = [
  { id: "comp1", titulo: "Reunião com Boutique da Thay", data: "14/04/2026 10:00", tipo: "reuniao" as const, oportunidadeId: "op1" },
  { id: "comp2", titulo: "Ligação Fashion Kids Store", data: "14/04/2026 14:00", tipo: "ligacao" as const, oportunidadeId: "op2" },
  { id: "comp3", titulo: "Follow-up Alemão Vestuário", data: "15/04/2026 09:00", tipo: "follow_up" as const, oportunidadeId: "op3" },
  { id: "comp4", titulo: "Visita Mega Atacado Infantil", data: "16/04/2026 11:00", tipo: "reuniao" as const, oportunidadeId: "op4" },
];
