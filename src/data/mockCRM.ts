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
export type TagCRM = "quente" | "morna" | "fria" | "recorrente" | "novo_cliente" | "alto_potencial" | "infantil" | "adulto" | "fitness" | "urgente";

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

export interface Briefing {
  categorias?: string[];
  faixaMin?: number;
  faixaMax?: number;
  genero?: string;
  quantidade?: number;
  estacao?: string;
  marcasCandidatas?: string[];
  prazoCliente?: string;
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
  briefing?: Briefing;
  motivoPerda?: string;
  diasNaEtapa?: number;
}

// ===== Etapas canônicas (view do vendedor: 6 colunas) =====
export type EtapaCanonica = "novo_lead" | "qualificando" | "em_proposta" | "em_negociacao" | "ganha" | "perdida";

export const etapasCanonicas: { id: EtapaCanonica; nome: string; cor: string; limiteDias: number }[] = [
  { id: "novo_lead", nome: "Novo lead", cor: "#94a3b8", limiteDias: 7 },
  { id: "qualificando", nome: "Qualificando", cor: "#a78bfa", limiteDias: 7 },
  { id: "em_proposta", nome: "Em proposta", cor: "#f59e0b", limiteDias: 10 },
  { id: "em_negociacao", nome: "Em negociação", cor: "#f97316", limiteDias: 5 },
  { id: "ganha", nome: "Ganha", cor: "#22c55e", limiteDias: 9999 },
  { id: "perdida", nome: "Perdida", cor: "#ef4444", limiteDias: 9999 },
];

// Helpers de título de oportunidade
// - getDemanda: apenas a demanda (usar em contextos com cliente visível: kanban, listas com coluna de cliente)
// - getTituloCompleto: "demanda · cliente" (usar em breadcrumb do detalhe, busca global, notificações)
export const getDemanda = (nome: string, clienteNome?: string): string => {
  if (!clienteNome) return nome;
  const escaped = clienteNome.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return nome.replace(new RegExp(`\\s*[–\\-·]\\s*${escaped}\\s*$`), "").trim() || nome;
};
export const getTituloCompleto = (nome: string, clienteNome?: string): string => {
  const demanda = getDemanda(nome, clienteNome);
  return clienteNome ? `${demanda} · ${clienteNome}` : demanda;
};

export const etapaToCanonica: Record<OportunidadeEtapa, EtapaCanonica> = {
  novo_lead: "novo_lead",
  contato_iniciado: "qualificando",
  em_qualificacao: "qualificando",
  proposta_construcao: "em_proposta",
  orcamento_enviado: "em_proposta",
  em_negociacao: "em_negociacao",
  ganho: "ganha",
  perdido: "perdida",
};

export const canonicaToBase: Record<EtapaCanonica, OportunidadeEtapa> = {
  novo_lead: "novo_lead",
  qualificando: "em_qualificacao",
  em_proposta: "proposta_construcao",
  em_negociacao: "em_negociacao",
  ganha: "ganho",
  perdida: "perdido",
};

export const probabilidadeAutoPorCanonica: Record<EtapaCanonica, number> = {
  novo_lead: 10, qualificando: 25, em_proposta: 45, em_negociacao: 70, ganha: 100, perdida: 0,
};

export const motivosPerda = ["Preço", "Prazo", "Sortimento", "Concorrência", "Outro"] as const;
export type MotivoPerda = typeof motivosPerda[number];

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
  morna: "Morna",
  fria: "Fria",
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
  morna: "bg-amber-100 text-amber-700 border-amber-200",
  fria: "bg-sky-100 text-sky-700 border-sky-200",
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
  // ===== Mais oportunidades para popular kanban e dashboard =====
  {
    id: "op13", nome: "Coleção Inverno Premium – Luna Kids", clienteId: "c18", clienteNome: "Luna Kids Boutique",
    representante: "Paulo Bardini", etapa: "novo_lead", valorEstimado: 41000, prioridade: "alta",
    tags: ["alto_potencial", "infantil", "quente"], origem: "Instagram", probabilidade: 20,
    dataCriacao: "13/04/2026", previsaoFechamento: "20/06/2026", ultimaInteracao: "13/04/2026",
    proximaAcao: "Responder DM e qualificar", observacoes: "Veio via Instagram, 4 lojas no RJ.", orcamentoIds: [],
  },
  {
    id: "op14", nome: "Reposição Linha Bebê – Mundo Encantado", clienteId: "c19", clienteNome: "Mundo Encantado Baby",
    representante: "Paulo Bardini", etapa: "novo_lead", valorEstimado: 17800, prioridade: "media",
    tags: ["recorrente", "infantil"], origem: "Carteira ativa", probabilidade: 25,
    dataCriacao: "13/04/2026", previsaoFechamento: "10/06/2026", ultimaInteracao: "13/04/2026",
    proximaAcao: "Apresentar nova coleção bebê", observacoes: "Comprou no inverno passado.", orcamentoIds: [],
  },
  {
    id: "op15", nome: "Pedido Fitness – Atleta Store", clienteId: "c20", clienteNome: "Atleta Store",
    representante: "Paulo Bardini", etapa: "contato_iniciado", valorEstimado: 26500, prioridade: "alta",
    tags: ["alto_potencial", "fitness", "adulto", "quente"], origem: "Feira", probabilidade: 35,
    dataCriacao: "07/04/2026", previsaoFechamento: "15/05/2026", ultimaInteracao: "12/04/2026",
    proximaAcao: "Enviar tabela fitness adulto", observacoes: "Interesse em linha fitness completa.", orcamentoIds: [],
  },
  {
    id: "op16", nome: "Coleção Adulta Casual – Estilo Urbano", clienteId: "c21", clienteNome: "Estilo Urbano",
    representante: "Paulo Bardini", etapa: "contato_iniciado", valorEstimado: 14200, prioridade: "media",
    tags: ["adulto", "novo_cliente"], origem: "Site", probabilidade: 25,
    dataCriacao: "06/04/2026", previsaoFechamento: "30/05/2026", ultimaInteracao: "11/04/2026",
    proximaAcao: "Marcar call de descoberta", observacoes: "Loja nova, primeira compra.", orcamentoIds: [],
  },
  {
    id: "op17", nome: "Expansão Coleção Infantil – Mini Mundo", clienteId: "c22", clienteNome: "Mini Mundo Modas",
    representante: "Paulo Bardini", etapa: "em_qualificacao", valorEstimado: 32000, prioridade: "alta",
    tags: ["alto_potencial", "infantil"], origem: "Indicação", probabilidade: 45,
    dataCriacao: "02/04/2026", previsaoFechamento: "25/05/2026", ultimaInteracao: "10/04/2026",
    proximaAcao: "Apresentar mix de produtos", observacoes: "Indicação de Boutique da Thay.", orcamentoIds: [],
  },
  {
    id: "op18", nome: "Linha Premium Inverno – Sofisticatto", clienteId: "c23", clienteNome: "Sofisticatto Atacado",
    representante: "Paulo Bardini", etapa: "em_qualificacao", valorEstimado: 56000, prioridade: "alta",
    tags: ["alto_potencial", "quente", "adulto"], origem: "Feira", probabilidade: 50,
    dataCriacao: "29/03/2026", previsaoFechamento: "10/05/2026", ultimaInteracao: "12/04/2026",
    proximaAcao: "Construir proposta personalizada", observacoes: "Grande atacadista da região sul.", orcamentoIds: [],
  },
  {
    id: "op19", nome: "Coleção Verão Antecipada – Praia & Sol", clienteId: "c24", clienteNome: "Praia & Sol Modas",
    representante: "Paulo Bardini", etapa: "proposta_construcao", valorEstimado: 38500, prioridade: "media",
    tags: ["recorrente", "adulto"], origem: "Carteira ativa", probabilidade: 55,
    dataCriacao: "25/03/2026", previsaoFechamento: "30/04/2026", ultimaInteracao: "11/04/2026",
    proximaAcao: "Fechar mix e enviar orçamento", observacoes: "Cliente histórico.", orcamentoIds: [],
  },
  {
    id: "op20", nome: "Kit Maternidade – Bem Nascer", clienteId: "c25", clienteNome: "Bem Nascer Loja",
    representante: "Paulo Bardini", etapa: "proposta_construcao", valorEstimado: 19800, prioridade: "media",
    tags: ["novo_cliente", "infantil"], origem: "Site", probabilidade: 45,
    dataCriacao: "01/04/2026", previsaoFechamento: "05/05/2026", ultimaInteracao: "10/04/2026",
    proximaAcao: "Montar grade enxuta", observacoes: "Foco em recém-nascido e enxoval.", orcamentoIds: [],
  },
  {
    id: "op21", nome: "Reposição Outono – Charme Kids", clienteId: "c26", clienteNome: "Charme Kids",
    representante: "Paulo Bardini", etapa: "orcamento_enviado", valorEstimado: 11200, prioridade: "media",
    tags: ["recorrente", "infantil"], origem: "Carteira ativa", probabilidade: 60,
    dataCriacao: "30/03/2026", previsaoFechamento: "22/04/2026", ultimaInteracao: "09/04/2026",
    proximaAcao: "Follow-up de aprovação", observacoes: "Orçamento entregue com 7% desc.", orcamentoIds: [],
  },
  {
    id: "op22", nome: "Coleção Festa Junina – Arraiá Kids", clienteId: "c27", clienteNome: "Arraiá Kids",
    representante: "Paulo Bardini", etapa: "orcamento_enviado", valorEstimado: 8600, prioridade: "baixa",
    tags: ["urgente", "infantil"], origem: "WhatsApp", probabilidade: 70,
    dataCriacao: "05/04/2026", previsaoFechamento: "20/04/2026", ultimaInteracao: "12/04/2026",
    proximaAcao: "Confirmar fechamento", observacoes: "Demanda sazonal urgente.", orcamentoIds: [],
  },
  {
    id: "op23", nome: "Pedido Black Friday – Mega Sale", clienteId: "c28", clienteNome: "Mega Sale Atacado",
    representante: "Paulo Bardini", etapa: "em_negociacao", valorEstimado: 78000, prioridade: "alta",
    tags: ["alto_potencial", "quente"], origem: "Indicação", probabilidade: 70,
    dataCriacao: "20/03/2026", previsaoFechamento: "30/04/2026", ultimaInteracao: "12/04/2026",
    proximaAcao: "Negociar condição de pagamento", observacoes: "Pedido antecipado para BF 2026.", orcamentoIds: [],
  },
  {
    id: "op24", nome: "Coleção Inverno – Aconchego Modas", clienteId: "c29", clienteNome: "Aconchego Modas",
    representante: "Paulo Bardini", etapa: "em_negociacao", valorEstimado: 33000, prioridade: "media",
    tags: ["recorrente", "infantil", "adulto"], origem: "Carteira ativa", probabilidade: 65,
    dataCriacao: "22/03/2026", previsaoFechamento: "25/04/2026", ultimaInteracao: "11/04/2026",
    proximaAcao: "Revisar prazo de entrega", observacoes: "Cliente quer parcela em 60 dias.", orcamentoIds: [],
  },
  {
    id: "op25", nome: "Pedido Recorrente – Boutique Estilo", clienteId: "c30", clienteNome: "Boutique Estilo",
    representante: "Paulo Bardini", etapa: "ganho", valorEstimado: 14500, prioridade: "media",
    tags: ["recorrente", "adulto"], origem: "Carteira ativa", probabilidade: 100,
    dataCriacao: "20/03/2026", previsaoFechamento: "08/04/2026", ultimaInteracao: "08/04/2026",
    proximaAcao: "Pedido confirmado", observacoes: "Cliente fiel, fechou rápido.", orcamentoIds: [],
  },
  {
    id: "op26", nome: "Mix Inverno – Casa do Bebê", clienteId: "c31", clienteNome: "Casa do Bebê",
    representante: "Paulo Bardini", etapa: "ganho", valorEstimado: 22000, prioridade: "alta",
    tags: ["recorrente", "infantil"], origem: "Carteira ativa", probabilidade: 100,
    dataCriacao: "18/03/2026", previsaoFechamento: "05/04/2026", ultimaInteracao: "05/04/2026",
    proximaAcao: "Pedido faturado", observacoes: "Aprovado e em produção.", orcamentoIds: [],
  },
  {
    id: "op27", nome: "Coleção Fitness Plus – Movimento", clienteId: "c32", clienteNome: "Movimento Fitness",
    representante: "Paulo Bardini", etapa: "perdido", valorEstimado: 18500, prioridade: "media",
    tags: ["fitness", "adulto"], origem: "Prospecção ativa", probabilidade: 0,
    dataCriacao: "15/03/2026", previsaoFechamento: "10/04/2026", ultimaInteracao: "08/04/2026",
    proximaAcao: "Encerrado", observacoes: "Sem orçamento neste semestre.", orcamentoIds: [],
  },
  {
    id: "op28", nome: "Pedido Especial Páscoa – Doce Mel", clienteId: "c33", clienteNome: "Doce Mel Kids",
    representante: "Paulo Bardini", etapa: "novo_lead", valorEstimado: 9200, prioridade: "baixa",
    tags: ["infantil", "novo_cliente"], origem: "Instagram", probabilidade: 15,
    dataCriacao: "13/04/2026", previsaoFechamento: "15/06/2026", ultimaInteracao: "13/04/2026",
    proximaAcao: "Apresentar marca", observacoes: "Veio por anúncio Instagram.", orcamentoIds: [],
  },
  {
    id: "op29", nome: "Reposição Verão – Sol & Lua", clienteId: "c34", clienteNome: "Sol & Lua Modas",
    representante: "Paulo Bardini", etapa: "contato_iniciado", valorEstimado: 16800, prioridade: "media",
    tags: ["recorrente", "adulto"], origem: "WhatsApp", probabilidade: 30,
    dataCriacao: "09/04/2026", previsaoFechamento: "25/05/2026", ultimaInteracao: "12/04/2026",
    proximaAcao: "Enviar fotos da coleção", observacoes: "Cliente do interior, prefere WhatsApp.", orcamentoIds: [],
  },
  {
    id: "op30", nome: "Linha Escolar Plus – Educar Uniformes", clienteId: "c35", clienteNome: "Educar Uniformes",
    representante: "Paulo Bardini", etapa: "em_qualificacao", valorEstimado: 47000, prioridade: "alta",
    tags: ["alto_potencial", "infantil", "urgente"], origem: "E-mail", probabilidade: 40,
    dataCriacao: "03/04/2026", previsaoFechamento: "10/05/2026", ultimaInteracao: "10/04/2026",
    proximaAcao: "Levantar volume por unidade", observacoes: "Demanda volta às aulas semestre 2.", orcamentoIds: [],
  },
  {
    id: "op31", nome: "Pedido Atacado – Distribuidora Sul", clienteId: "c36", clienteNome: "Distribuidora Sul Moda",
    representante: "Paulo Bardini", etapa: "proposta_construcao", valorEstimado: 95000, prioridade: "alta",
    tags: ["alto_potencial", "quente"], origem: "Indicação", probabilidade: 55,
    dataCriacao: "28/03/2026", previsaoFechamento: "20/05/2026", ultimaInteracao: "11/04/2026",
    proximaAcao: "Construir proposta volume", observacoes: "Distribuidor regional, alto ticket.", orcamentoIds: [],
  },
  {
    id: "op32", nome: "Reposição Inverno – Tendência Kids", clienteId: "c37", clienteNome: "Tendência Kids",
    representante: "Paulo Bardini", etapa: "orcamento_enviado", valorEstimado: 13700, prioridade: "media",
    tags: ["recorrente", "infantil"], origem: "Carteira ativa", probabilidade: 60,
    dataCriacao: "01/04/2026", previsaoFechamento: "22/04/2026", ultimaInteracao: "10/04/2026",
    proximaAcao: "Aguardar confirmação", observacoes: "Histórico de fechamento rápido.", orcamentoIds: [],
  },
  {
    id: "op33", nome: "Coleção Adulto Premium – Elegance", clienteId: "c38", clienteNome: "Elegance Store",
    representante: "Paulo Bardini", etapa: "em_negociacao", valorEstimado: 52000, prioridade: "alta",
    tags: ["alto_potencial", "adulto", "quente"], origem: "Feira", probabilidade: 75,
    dataCriacao: "18/03/2026", previsaoFechamento: "28/04/2026", ultimaInteracao: "12/04/2026",
    proximaAcao: "Fechar condição comercial", observacoes: "Final de negociação, ajuste de prazo.", orcamentoIds: [],
  },
  {
    id: "op34", nome: "Pedido Especial – Charm Baby", clienteId: "c39", clienteNome: "Charm Baby",
    representante: "Paulo Bardini", etapa: "ganho", valorEstimado: 7400, prioridade: "baixa",
    tags: ["recorrente", "infantil"], origem: "Carteira ativa", probabilidade: 100,
    dataCriacao: "22/03/2026", previsaoFechamento: "06/04/2026", ultimaInteracao: "06/04/2026",
    proximaAcao: "Faturado", observacoes: "Cliente histórico.", orcamentoIds: [],
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
  if (op.urgente === undefined) op.urgente = op.tags.includes("urgente");

  // Briefing derivado das tags (mock) — apenas se ainda não houver
  if (!op.briefing) {
    const categorias: string[] = [];
    if (op.tags.includes("fitness")) categorias.push("Fitness");
    if (op.tags.includes("infantil")) categorias.push("Conjuntos");
    if (op.tags.includes("adulto")) categorias.push("Vestidos");
    if (categorias.length === 0) categorias.push("Mix");
    const faixaMin = op.prioridade === "alta" ? 40 : 20;
    const faixaMax = op.prioridade === "alta" ? 90 : 55;
    const quantidade = Math.max(20, Math.round(op.valorEstimado / ((faixaMin + faixaMax) / 2)));
    op.briefing = {
      categorias,
      faixaMin,
      faixaMax,
      quantidade,
      genero: op.tags.includes("adulto") ? "Adulto" : op.tags.includes("fitness") ? "Fitness" : "Infantil",
      estacao: "Inverno",
    };
  }

  // dias na etapa (mock) — distribuir 0-12 dias com alguns estourados
  if (op.diasNaEtapa === undefined) {
    const hash = op.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    // maioria em 0-6d, alguns em 8-14d, poucos estourados (>15d) para demonstrar alerta
    const base = hash % 17; // 0..16
    op.diasNaEtapa = base;
  }

  // Consistência: "Em proposta" (proposta_construcao / orcamento_enviado) exige orçamento vinculado.
  const canon = etapaToCanonica[op.etapa];
  if (canon === "em_proposta" && op.orcamentoIds.length === 0) {
    // rebaixa para Qualificando enquanto não houver orçamento
    op.etapa = "em_qualificacao";
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
  { id: "t9", oportunidadeId: "op13", titulo: "Enviar proposta Mega Sale", descricao: "Estruturar proposta com desconto progressivo", status: "pendente", prioridade: "alta", vencimento: "15/04/2026", responsavel: "Paulo Bardini" },
  { id: "t10", oportunidadeId: "op14", titulo: "Reunião comercial Elegance Store", descricao: "Apresentar coleção alto verão", status: "pendente", prioridade: "alta", vencimento: "17/04/2026", responsavel: "Paulo Bardini" },
  { id: "t11", oportunidadeId: "op15", titulo: "Negociar prazo Distribuidora Sul", descricao: "Cliente solicitou prazo de 60 dias", status: "pendente", prioridade: "alta", vencimento: "16/04/2026", responsavel: "Paulo Bardini" },
  { id: "t12", oportunidadeId: "op16", titulo: "Follow-up amostras enviadas", descricao: "Confirmar recebimento e feedback", status: "atrasada", prioridade: "media", vencimento: "11/04/2026", responsavel: "Paulo Bardini" },
  { id: "t13", oportunidadeId: "op17", titulo: "Validar pedido Tropical Modas", descricao: "Conferir grades antes do faturamento", status: "pendente", prioridade: "media", vencimento: "14/04/2026", responsavel: "Paulo Bardini" },
  { id: "t14", oportunidadeId: "op18", titulo: "Enviar contrato de parceria", descricao: "Revisar cláusulas comerciais", status: "pendente", prioridade: "alta", vencimento: "18/04/2026", responsavel: "Paulo Bardini" },
  { id: "t15", oportunidadeId: "op19", titulo: "Ligar para Casa do Vestuário", descricao: "Apresentar campanha de inverno", status: "pendente", prioridade: "media", vencimento: "15/04/2026", responsavel: "Paulo Bardini" },
  { id: "t16", clienteId: "c18", titulo: "Reativar cliente inativo", descricao: "Sem contato há 60 dias", status: "pendente", prioridade: "baixa", vencimento: "20/04/2026", responsavel: "Paulo Bardini" },
  { id: "t17", oportunidadeId: "op20", titulo: "Enviar tabela de preços 2026", descricao: "Versão atualizada com reajustes", status: "pendente", prioridade: "media", vencimento: "16/04/2026", responsavel: "Paulo Bardini" },
  { id: "t18", oportunidadeId: "op21", titulo: "Agendar showroom virtual", descricao: "Demonstrar nova coleção via call", status: "pendente", prioridade: "media", vencimento: "17/04/2026", responsavel: "Paulo Bardini" },
  { id: "t19", oportunidadeId: "op22", titulo: "Negociar desconto adicional", descricao: "Cliente pediu 3% extra no fechamento", status: "atrasada", prioridade: "alta", vencimento: "10/04/2026", responsavel: "Paulo Bardini" },
  { id: "t20", oportunidadeId: "op23", titulo: "Confirmar entrega expressa", descricao: "Validar prazo com logística", status: "pendente", prioridade: "alta", vencimento: "14/04/2026", responsavel: "Paulo Bardini" },
  { id: "t21", clienteId: "c22", titulo: "Visita técnica loja física", descricao: "Avaliar exposição dos produtos", status: "pendente", prioridade: "baixa", vencimento: "22/04/2026", responsavel: "Paulo Bardini" },
  { id: "t22", oportunidadeId: "op24", titulo: "Revisar mix de produtos", descricao: "Ajustar curva de tamanhos solicitada", status: "pendente", prioridade: "media", vencimento: "15/04/2026", responsavel: "Paulo Bardini" },
  { id: "t23", oportunidadeId: "op25", titulo: "Enviar mostruário Outono", descricao: "Despachar caixa de amostras", status: "pendente", prioridade: "media", vencimento: "16/04/2026", responsavel: "Paulo Bardini" },
  { id: "t24", oportunidadeId: "op26", titulo: "Reunião pós-venda", descricao: "Coletar feedback do primeiro pedido", status: "pendente", prioridade: "baixa", vencimento: "19/04/2026", responsavel: "Paulo Bardini" },
  { id: "t25", oportunidadeId: "op27", titulo: "Enviar NF complementar", descricao: "Pendente desde a última entrega", status: "atrasada", prioridade: "media", vencimento: "09/04/2026", responsavel: "Paulo Bardini" },
  { id: "t26", oportunidadeId: "op28", titulo: "Apresentar linha Premium", descricao: "Material institucional + lookbook", status: "pendente", prioridade: "alta", vencimento: "17/04/2026", responsavel: "Paulo Bardini" },
  { id: "t27", clienteId: "c30", titulo: "Atualizar cadastro fiscal", descricao: "Cliente trocou regime tributário", status: "pendente", prioridade: "baixa", vencimento: "25/04/2026", responsavel: "Paulo Bardini" },
  { id: "t28", oportunidadeId: "op29", titulo: "Confirmar agenda feira SP", descricao: "Reunião marcada na feira de moda", status: "pendente", prioridade: "alta", vencimento: "20/04/2026", responsavel: "Paulo Bardini" },
  { id: "t29", oportunidadeId: "op30", titulo: "Enviar contrato de exclusividade", descricao: "Revisar prazos com jurídico", status: "pendente", prioridade: "alta", vencimento: "18/04/2026", responsavel: "Paulo Bardini" },
  { id: "t30", oportunidadeId: "op31", titulo: "Cobrar retorno proposta", descricao: "Enviada há 8 dias sem resposta", status: "atrasada", prioridade: "media", vencimento: "08/04/2026", responsavel: "Paulo Bardini" },
];

// Dashboard KPIs
export const dashboardKPIs = {
  oportunidadesAbertas: 28,
  emNegociacao: 4,
  orcamentosEnviados: 5,
  tarefasPendentes: 24,
  tarefasAtrasadas: 5,
  clientesSemRetorno: 6,
  taxaConversao: 18.2,
  valorPipeline: 862450,
  valorMesAtual: 52800,
  ticketMedio: 30802,
};

export const compromissos = [
  { id: "comp1", titulo: "Reunião com Boutique da Thay", data: "14/04/2026 10:00", tipo: "reuniao" as const, oportunidadeId: "op1" },
  { id: "comp2", titulo: "Ligação Fashion Kids Store", data: "14/04/2026 14:00", tipo: "ligacao" as const, oportunidadeId: "op2" },
  { id: "comp3", titulo: "Follow-up Alemão Vestuário", data: "15/04/2026 09:00", tipo: "follow_up" as const, oportunidadeId: "op3" },
  { id: "comp4", titulo: "Visita Mega Atacado Infantil", data: "16/04/2026 11:00", tipo: "reuniao" as const, oportunidadeId: "op4" },
];
