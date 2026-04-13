// Phase 5 — Analytics & Reports mock data

export interface RelatorioSalvo {
  id: string;
  nome: string;
  descricao: string;
  entidade: "clientes" | "oportunidades" | "representantes" | "tarefas" | "orcamentos" | "mensagens" | "pedidos";
  formato: "tabela" | "grafico_barras" | "grafico_linha" | "cards_kpi" | "pizza" | "resumo";
  autor: string;
  dataCriacao: string;
  dataAtualizacao: string;
  favorito: boolean;
  compartilhado: boolean;
  filtrosAplicados: string[];
  agrupamento?: string;
}

export interface VisaoSalva {
  id: string;
  nome: string;
  tipo: "dashboard" | "relatorio";
  filtros: Record<string, string>;
  autor: string;
  dataAtualizacao: string;
  favorito: boolean;
}

export interface InsightGerencial {
  id: string;
  tipo: "alerta" | "oportunidade" | "risco" | "tendencia";
  titulo: string;
  descricao: string;
  severidade: "alta" | "media" | "baixa";
  entidade: string;
  linkTo?: string;
  data: string;
}

export interface RelatorioPronto {
  id: string;
  nome: string;
  descricao: string;
  entidade: string;
  formato: string;
  icone: string;
  categoria: string;
}

// Dashboard KPIs
export const dashboardGerencialKPIs = {
  clientesTotais: 14,
  clientesAtivos: 8,
  clientesEmRisco: 2,
  clientesNovos: 3,
  clientesReativacao: 1,
  clientesSemContato: 3,
  oportunidadesAbertas: 9,
  oportunidadesNegociacao: 4,
  oportunidadesGanhas: 3,
  oportunidadesPerdidas: 1,
  taxaConversao: 32,
  ticketMedio: 14200,
  orcamentosAbertos: 5,
  tarefasVencidas: 4,
  mensagensSemResposta: 3,
  pedidosPeriodo: 6,
  valorPipelineTotal: 187500,
  faturamentoPeriodo: 68900,
};

// Funnel data
export const funnelData = [
  { etapa: "Novo Lead", volume: 12, valor: 45000, taxaAvanco: 75, cor: "#94a3b8" },
  { etapa: "Contato Iniciado", volume: 9, valor: 38000, taxaAvanco: 67, cor: "#60a5fa" },
  { etapa: "Em Qualificação", volume: 6, valor: 32000, taxaAvanco: 83, cor: "#a78bfa" },
  { etapa: "Proposta/Construção", volume: 5, valor: 28500, taxaAvanco: 60, cor: "#fbbf24" },
  { etapa: "Orçamento Enviado", volume: 3, valor: 22000, taxaAvanco: 67, cor: "#f97316" },
  { etapa: "Em Negociação", volume: 2, valor: 18500, taxaAvanco: 50, cor: "#ef4444" },
  { etapa: "Ganho", volume: 3, valor: 42500, taxaAvanco: 100, cor: "#22c55e" },
];

// Carteira por estágio
export const carteiraEstagioData = [
  { estagio: "Novo", quantidade: 3, cor: "#3b82f6" },
  { estagio: "Em ativação", quantidade: 1, cor: "#8b5cf6" },
  { estagio: "Ativo infantil", quantidade: 5, cor: "#10b981" },
  { estagio: "Ativo adulto", quantidade: 1, cor: "#06b6d4" },
  { estagio: "Ativo fitness", quantidade: 1, cor: "#f59e0b" },
  { estagio: "Em risco", quantidade: 1, cor: "#ef4444" },
  { estagio: "Reativação", quantidade: 1, cor: "#f97316" },
  { estagio: "Inativo", quantidade: 1, cor: "#6b7280" },
];

// Performance por representante
export const performanceRepresentantes = [
  { nome: "Paulo Bardini", regiao: "Sul", carteira: 14, ativos: 8, emRisco: 2, oportunidades: 9, conversao: 32, tarefasPendentes: 4, ultimoAcesso: "Hoje" },
  { nome: "Marina Oliveira", regiao: "Sudeste", carteira: 22, ativos: 15, emRisco: 3, oportunidades: 12, conversao: 28, tarefasPendentes: 6, ultimoAcesso: "Hoje" },
  { nome: "Rafael Costa", regiao: "Nordeste", carteira: 18, ativos: 11, emRisco: 4, oportunidades: 7, conversao: 22, tarefasPendentes: 8, ultimoAcesso: "Ontem" },
  { nome: "Camila Santos", regiao: "Centro-Oeste", carteira: 10, ativos: 7, emRisco: 1, oportunidades: 5, conversao: 40, tarefasPendentes: 2, ultimoAcesso: "Hoje" },
  { nome: "Fernando Lima", regiao: "Norte", carteira: 8, ativos: 4, emRisco: 2, oportunidades: 3, conversao: 18, tarefasPendentes: 5, ultimoAcesso: "3 dias atrás" },
];

// Distribuição por nicho
export const distribuicaoNicho = [
  { nicho: "Infantil", clientes: 7, percentual: 50, valor: 95000, cor: "#10b981" },
  { nicho: "Adulto", clientes: 2, percentual: 14, valor: 28000, cor: "#3b82f6" },
  { nicho: "Fitness", clientes: 1, percentual: 7, valor: 18500, cor: "#f59e0b" },
  { nicho: "Multimarcas", clientes: 2, percentual: 14, valor: 32000, cor: "#8b5cf6" },
  { nicho: "Outros", clientes: 2, percentual: 14, valor: 14000, cor: "#6b7280" },
];

// Evolução período (últimos 6 meses)
export const evolucaoPeriodo = [
  { mes: "Nov", oportunidadesCriadas: 5, oportunidadesGanhas: 1, clientesAtivados: 2, tarefasConcluidas: 12, pedidos: 3, mensagensRespondidas: 45 },
  { mes: "Dez", oportunidadesCriadas: 3, oportunidadesGanhas: 2, clientesAtivados: 1, tarefasConcluidas: 15, pedidos: 4, mensagensRespondidas: 52 },
  { mes: "Jan", oportunidadesCriadas: 7, oportunidadesGanhas: 1, clientesAtivados: 3, tarefasConcluidas: 18, pedidos: 2, mensagensRespondidas: 38 },
  { mes: "Fev", oportunidadesCriadas: 4, oportunidadesGanhas: 2, clientesAtivados: 1, tarefasConcluidas: 14, pedidos: 3, mensagensRespondidas: 41 },
  { mes: "Mar", oportunidadesCriadas: 8, oportunidadesGanhas: 3, clientesAtivados: 4, tarefasConcluidas: 22, pedidos: 5, mensagensRespondidas: 60 },
  { mes: "Abr", oportunidadesCriadas: 6, oportunidadesGanhas: 2, clientesAtivados: 2, tarefasConcluidas: 10, pedidos: 4, mensagensRespondidas: 48 },
];

// Alertas gerenciais
export const alertasGerenciais: InsightGerencial[] = [
  { id: "ins1", tipo: "risco", titulo: "Anjus Baby e Kids sem contato há 43 dias", descricao: "Cliente recorrente com temperatura fria. Risco de perda.", severidade: "alta", entidade: "cliente", linkTo: "/vendedor/360/c13", data: "13/04/2026" },
  { id: "ins2", tipo: "risco", titulo: "Veste Bem Modas em reativação sem ação", descricao: "Cliente em estágio de reativação sem tarefa futura agendada.", severidade: "alta", entidade: "cliente", linkTo: "/vendedor/360/c14", data: "13/04/2026" },
  { id: "ins3", tipo: "alerta", titulo: "3 oportunidades sem movimentação há 7+ dias", descricao: "Oportunidades paradas podem esfriar. Recomenda-se ação imediata.", severidade: "media", entidade: "oportunidade", linkTo: "/vendedor/oportunidades", data: "13/04/2026" },
  { id: "ins4", tipo: "oportunidade", titulo: "Rei das Crianças com alto potencial", descricao: "Novo cliente com 5 lojas em BH demonstrou interesse forte. Priorizar primeiro contato.", severidade: "media", entidade: "cliente", linkTo: "/vendedor/360/c9", data: "13/04/2026" },
  { id: "ins5", tipo: "alerta", titulo: "4 tarefas vencidas sem reagendamento", descricao: "Tarefas vencidas afetam a saúde da operação comercial.", severidade: "alta", entidade: "tarefa", linkTo: "/vendedor/tarefas", data: "13/04/2026" },
  { id: "ins6", tipo: "tendencia", titulo: "Crescimento de 60% em oportunidades em Mar/26", descricao: "Março registrou pico de criação de oportunidades. Avaliar capacidade de atendimento.", severidade: "baixa", entidade: "oportunidade", data: "13/04/2026" },
  { id: "ins7", tipo: "risco", titulo: "Representante Fernando Lima com baixa atividade", descricao: "Último acesso há 3 dias. Taxa de conversão de apenas 18%. Carteira com 2 clientes em risco.", severidade: "alta", entidade: "representante", linkTo: "/vendedor/representantes", data: "13/04/2026" },
  { id: "ins8", tipo: "oportunidade", titulo: "Clientes infantis concentram 50% da base", descricao: "Oportunidade de diversificação de nicho. Considerar prospecção ativa em adulto e fitness.", severidade: "baixa", entidade: "carteira", linkTo: "/vendedor/carteira", data: "13/04/2026" },
];

// Relatórios salvos
export const relatoriosSalvos: RelatorioSalvo[] = [
  { id: "rel1", nome: "Funil de oportunidades por representante", descricao: "Visão consolidada do pipeline por responsável", entidade: "oportunidades", formato: "grafico_barras", autor: "Paulo Bardini", dataCriacao: "01/04/2026", dataAtualizacao: "13/04/2026", favorito: true, compartilhado: true, filtrosAplicados: ["Período: Abr/2026"], agrupamento: "representante" },
  { id: "rel2", nome: "Clientes sem contato nos últimos 30 dias", descricao: "Lista de clientes que não receberam interação recente", entidade: "clientes", formato: "tabela", autor: "Paulo Bardini", dataCriacao: "05/04/2026", dataAtualizacao: "13/04/2026", favorito: true, compartilhado: false, filtrosAplicados: ["Último contato: > 30 dias"] },
  { id: "rel3", nome: "Carteira por nicho e região", descricao: "Distribuição da base de clientes por segmento e localização", entidade: "clientes", formato: "pizza", autor: "Paulo Bardini", dataCriacao: "10/03/2026", dataAtualizacao: "12/04/2026", favorito: false, compartilhado: true, filtrosAplicados: ["Todos os clientes"], agrupamento: "nicho" },
  { id: "rel4", nome: "Oportunidades sem movimentação", descricao: "Oportunidades paradas há mais de 7 dias", entidade: "oportunidades", formato: "tabela", autor: "Marina Oliveira", dataCriacao: "08/04/2026", dataAtualizacao: "13/04/2026", favorito: false, compartilhado: true, filtrosAplicados: ["Sem movimentação: > 7 dias"] },
  { id: "rel5", nome: "Tarefas vencidas por responsável", descricao: "Pendências operacionais agrupadas por vendedor", entidade: "tarefas", formato: "grafico_barras", autor: "Paulo Bardini", dataCriacao: "12/04/2026", dataAtualizacao: "13/04/2026", favorito: false, compartilhado: false, filtrosAplicados: ["Status: Vencida"] },
  { id: "rel6", nome: "Performance mensal dos representantes", descricao: "Ranking consolidado de desempenho do time comercial", entidade: "representantes", formato: "tabela", autor: "Paulo Bardini", dataCriacao: "01/04/2026", dataAtualizacao: "13/04/2026", favorito: true, compartilhado: true, filtrosAplicados: ["Período: Abr/2026"] },
  { id: "rel7", nome: "Orçamentos em aberto por representante", descricao: "Orçamentos aguardando retorno agrupados por responsável", entidade: "orcamentos", formato: "tabela", autor: "Marina Oliveira", dataCriacao: "09/04/2026", dataAtualizacao: "13/04/2026", favorito: false, compartilhado: false, filtrosAplicados: ["Status: Em aberto"] },
  { id: "rel8", nome: "Mensagens sem resposta por cliente", descricao: "Conversas com tempo de espera acima do aceitável", entidade: "mensagens", formato: "tabela", autor: "Paulo Bardini", dataCriacao: "11/04/2026", dataAtualizacao: "13/04/2026", favorito: false, compartilhado: false, filtrosAplicados: ["Sem resposta: > 24h"] },
];

// Relatórios pré-construídos (biblioteca)
export const relatoriosProntos: RelatorioPronto[] = [
  { id: "rp1", nome: "Funil de oportunidades por representante", descricao: "Pipeline segmentado por vendedor com volume e valor por etapa", entidade: "Oportunidades", formato: "Gráfico de barras", icone: "BarChart3", categoria: "Pipeline" },
  { id: "rp2", nome: "Clientes sem contato nos últimos 30 dias", descricao: "Identifica clientes que estão sem interação recente", entidade: "Clientes", formato: "Tabela", icone: "UserX", categoria: "Carteira" },
  { id: "rp3", nome: "Clientes em risco com alto potencial", descricao: "Cruza status de risco com potencial comercial estimado", entidade: "Clientes", formato: "Tabela + KPI", icone: "AlertTriangle", categoria: "Carteira" },
  { id: "rp4", nome: "Carteira por nicho e região", descricao: "Mapa de distribuição da base por segmento e localização", entidade: "Clientes", formato: "Pizza + Tabela", icone: "PieChart", categoria: "Carteira" },
  { id: "rp5", nome: "Oportunidades sem movimentação", descricao: "Lista oportunidades paradas há mais de 7 dias no pipeline", entidade: "Oportunidades", formato: "Tabela", icone: "Clock", categoria: "Pipeline" },
  { id: "rp6", nome: "Tarefas vencidas por responsável", descricao: "Pendências operacionais agrupadas por membro do time", entidade: "Tarefas", formato: "Gráfico de barras", icone: "CheckSquare", categoria: "Operação" },
  { id: "rp7", nome: "Tempo médio de avanço por etapa", descricao: "Velocidade de progressão no funil de vendas", entidade: "Oportunidades", formato: "Gráfico de linha", icone: "TrendingUp", categoria: "Pipeline" },
  { id: "rp8", nome: "Mensagens sem resposta por cliente", descricao: "Conversas com tempo de espera acima do SLA", entidade: "Mensagens", formato: "Tabela", icone: "MessageCircle", categoria: "Comunicação" },
  { id: "rp9", nome: "Reativação de clientes por período", descricao: "Histórico de clientes que voltaram a comprar", entidade: "Clientes", formato: "Gráfico de linha", icone: "RefreshCw", categoria: "Carteira" },
  { id: "rp10", nome: "Pedidos por nicho", descricao: "Volume e valor de pedidos segmentados por nicho de mercado", entidade: "Pedidos", formato: "Pizza", icone: "ShoppingBag", categoria: "Vendas" },
  { id: "rp11", nome: "Clientes com interesse em marca específica", descricao: "Filtra base por marca de interesse para ações direcionadas", entidade: "Clientes", formato: "Tabela", icone: "Tag", categoria: "Segmentação" },
  { id: "rp12", nome: "Conversão por representante", descricao: "Ranking de efetividade de fechamento por vendedor", entidade: "Representantes", formato: "Gráfico de barras", icone: "Award", categoria: "Performance" },
];

// Visões salvas
export const visoesSalvas: VisaoSalva[] = [
  { id: "vs1", nome: "Carteira fitness sul", tipo: "dashboard", filtros: { nicho: "fitness", regiao: "Sul" }, autor: "Paulo Bardini", dataAtualizacao: "13/04/2026", favorito: true },
  { id: "vs2", nome: "Clientes infantis em risco", tipo: "relatorio", filtros: { nicho: "infantil", status: "em_risco" }, autor: "Paulo Bardini", dataAtualizacao: "12/04/2026", favorito: true },
  { id: "vs3", nome: "Oportunidades quentes — Paulo", tipo: "dashboard", filtros: { representante: "Paulo Bardini", tags: "quente" }, autor: "Paulo Bardini", dataAtualizacao: "13/04/2026", favorito: false },
  { id: "vs4", nome: "Clientes sem contato — Sudeste", tipo: "relatorio", filtros: { regiao: "Sudeste", ultimoContato: "> 30 dias" }, autor: "Marina Oliveira", dataAtualizacao: "11/04/2026", favorito: false },
  { id: "vs5", nome: "Orçamentos aberto — nicho adulto", tipo: "relatorio", filtros: { nicho: "adulto", orcamento: "em_aberto" }, autor: "Paulo Bardini", dataAtualizacao: "10/04/2026", favorito: true },
];

// Campos disponíveis por entidade para o Report Builder
export const camposPorEntidade: Record<string, { campo: string; label: string; tipo: "texto" | "numero" | "data" | "status" | "lista" }[]> = {
  clientes: [
    { campo: "nomeFantasia", label: "Nome", tipo: "texto" },
    { campo: "cidade", label: "Cidade/UF", tipo: "texto" },
    { campo: "representante", label: "Representante", tipo: "texto" },
    { campo: "nicho", label: "Nicho", tipo: "texto" },
    { campo: "interessePrincipal", label: "Interesse principal", tipo: "texto" },
    { campo: "marcasInteresse", label: "Marcas de interesse", tipo: "lista" },
    { campo: "status", label: "Status", tipo: "status" },
    { campo: "ultimoContato", label: "Último contato", tipo: "data" },
    { campo: "proximaAcao", label: "Próxima ação", tipo: "texto" },
    { campo: "oportunidadesAbertas", label: "Oportunidades", tipo: "numero" },
    { campo: "pedidosRealizados", label: "Pedidos", tipo: "numero" },
    { campo: "temperaturaComercial", label: "Temperatura", tipo: "status" },
  ],
  oportunidades: [
    { campo: "nome", label: "Nome", tipo: "texto" },
    { campo: "clienteNome", label: "Cliente", tipo: "texto" },
    { campo: "etapa", label: "Etapa", tipo: "status" },
    { campo: "valorEstimado", label: "Valor estimado", tipo: "numero" },
    { campo: "prioridade", label: "Prioridade", tipo: "status" },
    { campo: "representante", label: "Responsável", tipo: "texto" },
    { campo: "dataCriacao", label: "Data de criação", tipo: "data" },
    { campo: "previsaoFechamento", label: "Previsão de fechamento", tipo: "data" },
    { campo: "ultimaInteracao", label: "Última interação", tipo: "data" },
    { campo: "probabilidade", label: "Probabilidade (%)", tipo: "numero" },
  ],
  representantes: [
    { campo: "nome", label: "Nome", tipo: "texto" },
    { campo: "regiao", label: "Região", tipo: "texto" },
    { campo: "carteiraTotal", label: "Carteira", tipo: "numero" },
    { campo: "clientesAtivos", label: "Clientes ativos", tipo: "numero" },
    { campo: "clientesEmRisco", label: "Clientes em risco", tipo: "numero" },
    { campo: "oportunidadesAbertas", label: "Oportunidades", tipo: "numero" },
    { campo: "taxaConversao", label: "Taxa de conversão (%)", tipo: "numero" },
    { campo: "tarefasPendentes", label: "Tarefas pendentes", tipo: "numero" },
    { campo: "ultimoAcesso", label: "Último acesso", tipo: "data" },
  ],
  tarefas: [
    { campo: "titulo", label: "Título", tipo: "texto" },
    { campo: "tipo", label: "Tipo", tipo: "status" },
    { campo: "clienteNome", label: "Cliente", tipo: "texto" },
    { campo: "oportunidadeNome", label: "Oportunidade", tipo: "texto" },
    { campo: "prioridade", label: "Prioridade", tipo: "status" },
    { campo: "vencimento", label: "Vencimento", tipo: "data" },
    { campo: "status", label: "Status", tipo: "status" },
    { campo: "responsavel", label: "Responsável", tipo: "texto" },
  ],
  orcamentos: [
    { campo: "nome", label: "Nome/Número", tipo: "texto" },
    { campo: "cliente", label: "Cliente", tipo: "texto" },
    { campo: "oportunidade", label: "Oportunidade", tipo: "texto" },
    { campo: "data", label: "Data", tipo: "data" },
    { campo: "valor", label: "Valor", tipo: "numero" },
    { campo: "status", label: "Status", tipo: "status" },
  ],
  mensagens: [
    { campo: "clienteNome", label: "Cliente", tipo: "texto" },
    { campo: "representante", label: "Representante", tipo: "texto" },
    { campo: "ultimaMensagem", label: "Última mensagem", tipo: "data" },
    { campo: "naoLidas", label: "Não lidas", tipo: "numero" },
    { campo: "tempoSemResposta", label: "Tempo sem resposta", tipo: "texto" },
  ],
  pedidos: [
    { campo: "numero", label: "Número", tipo: "texto" },
    { campo: "cliente", label: "Cliente", tipo: "texto" },
    { campo: "data", label: "Data", tipo: "data" },
    { campo: "valor", label: "Valor", tipo: "numero" },
    { campo: "status", label: "Status", tipo: "status" },
    { campo: "representante", label: "Representante", tipo: "texto" },
  ],
};
