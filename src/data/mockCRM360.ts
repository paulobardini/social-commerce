// Phase 3 CRM Mock Data — Nextil 360
import type { TagCRM } from "./mockCRM";

export type ClienteStatus = "ativo" | "inativo" | "em_risco" | "reativacao" | "novo";
export type Nicho = "infantil" | "adulto" | "fitness" | "multimarcas" | "moda_praia" | "casual";
export type ConversaStatus = "ativa" | "aguardando_resposta" | "nao_lida" | "arquivada";

export interface Cliente360 {
  id: string;
  razaoSocial: string;
  nomeFantasia: string;
  documento: string;
  telefone: string;
  whatsapp: string;
  email: string;
  endereco: string;
  cidade: string;
  estado: string;
  representante: string;
  nicho: Nicho;
  interessePrincipal: string;
  marcasInteresse: string[];
  tags: TagCRM[];
  origem: string;
  status: ClienteStatus;
  dataCadastro: string;
  ultimoContato: string;
  proximaAcao: string;
  oportunidadesAbertas: number;
  orcamentosAtivos: number;
  pedidosRealizados: number;
  temperaturaComercial: "fria" | "morna" | "quente";
}

export interface Mensagem {
  id: string;
  conversaId: string;
  remetente: "cliente" | "vendedor";
  texto: string;
  horario: string;
  data: string;
  lida: boolean;
  tipo?: "texto" | "imagem" | "template" | "audio";
  // Status de entrega (somente mensagens enviadas pelo vendedor).
  // Conforme dados disponíveis na API do WhatsApp integrado.
  status?: "enviado" | "entregue" | "lido";
}

export interface Conversa {
  id: string;
  clienteId: string;
  clienteNome: string;
  clienteAvatar?: string;
  ultimaMensagem: string;
  ultimaHora: string;
  naoLidas: number;
  status: ConversaStatus;
  online?: boolean;
}

export type PedidoStatus = "confirmado" | "em_producao" | "faturado" | "em_transporte" | "entregue" | "cancelado" | "enviado";
export type PedidoOrigem = "orcamento" | "marketplace" | "manual";
export type PagamentoStatus = "pendente" | "pago" | "parcial" | "atrasado";

export interface PedidoItem {
  produtoId: string;
  nome: string;
  sku: string;
  cor: string;
  tamanho: string;
  qtd: number;
  precoUnit: number;
}

export interface PedidoPagamento {
  status: PagamentoStatus;
  metodo?: string;
  linkBoleto?: string;
  linkPagamento?: string;
  notaFiscal?: string;
}

export interface PedidoHistorico {
  status: PedidoStatus;
  data: string;
  autor: string;
}

export interface Pedido {
  id: string;
  clienteId: string;
  numero: string;
  data: string;
  valor: number;
  status: PedidoStatus;
  origem: string;
  observacoes: string;
  // novos campos (opcionais para retrocompat)
  origemTipo?: PedidoOrigem;
  orcamentoId?: string;
  marca?: string;
  pecas?: number;
  previsaoEntrega?: string;
  pagamento?: PedidoPagamento;
  itens?: PedidoItem[];
  historico?: PedidoHistorico[];
}

export interface Nota {
  id: string;
  clienteId: string;
  texto: string;
  data: string;
  autor: string;
  fixada: boolean;
}

export interface Compromisso {
  id: string;
  titulo: string;
  clienteId?: string;
  clienteNome?: string;
  oportunidadeId?: string;
  tipo: "ligacao" | "reuniao" | "visita" | "follow_up" | "retorno_orcamento" | "apresentacao";
  data: string;
  hora: string;
  duracao: string;
  responsavel: string;
  descricao: string;
  status: "agendado" | "concluido" | "cancelado";
}

export interface TarefaCRM360 {
  id: string;
  titulo: string;
  descricao: string;
  tipo: "ligacao" | "follow_up" | "visita" | "reuniao" | "retorno_proposta" | "cobranca_resposta" | "pos_venda";
  clienteId?: string;
  clienteNome?: string;
  oportunidadeId?: string;
  oportunidadeNome?: string;
  prioridade: "alta" | "media" | "baixa";
  vencimento: string;
  hora?: string;
  responsavel: string;
  status: "pendente" | "concluida" | "atrasada" | "cancelada";
  lembrete?: string;
  observacao?: string;
}

// ---- CLIENTES ----
export const mockClientes360: Cliente360[] = [
  { id: "c1", razaoSocial: "Boutique da Thay LTDA", nomeFantasia: "Boutique da Thay", documento: "41.569.299/0001-87", telefone: "(47) 3370-1234", whatsapp: "(47) 99901-1234", email: "thay@boutiquedathay.com.br", endereco: "Rua das Flores, 123", cidade: "Jaraguá do Sul", estado: "SC", representante: "Paulo Bardini", nicho: "infantil", interessePrincipal: "Moda Infantil Inverno", marcasInteresse: ["Brandili", "Kyly", "Mundi"], tags: ["quente", "recorrente"], origem: "Indicação", status: "ativo", dataCadastro: "15/01/2024", ultimoContato: "12/04/2026", proximaAcao: "Enviar contraproposta", oportunidadesAbertas: 2, orcamentosAtivos: 1, pedidosRealizados: 12, temperaturaComercial: "quente" },
  { id: "c2", razaoSocial: "Fashion Kids Store LTDA", nomeFantasia: "Fashion Kids Store", documento: "23.456.789/0001-10", telefone: "(11) 3456-7890", whatsapp: "(11) 99876-5432", email: "contato@fashionkids.com.br", endereco: "Av. Paulista, 1500", cidade: "São Paulo", estado: "SP", representante: "Paulo Bardini", nicho: "infantil", interessePrincipal: "Moda Infantil Premium", marcasInteresse: ["Brandili", "Hering Kids"], tags: ["novo_cliente", "alto_potencial"], origem: "Prospecção ativa", status: "novo", dataCadastro: "05/03/2026", ultimoContato: "10/04/2026", proximaAcao: "Agendar visita presencial", oportunidadesAbertas: 1, orcamentosAtivos: 0, pedidosRealizados: 0, temperaturaComercial: "morna" },
  { id: "c3", razaoSocial: "Alemão Vestuário LTDA", nomeFantasia: "Alemão Vestuário", documento: "00.000.000/0000-00", telefone: "(47) 3370-5678", whatsapp: "(47) 99902-5678", email: "compras@alemaovestuario.com.br", endereco: "Rua Principal, 456", cidade: "Jaraguá do Sul", estado: "SC", representante: "Paulo Bardini", nicho: "multimarcas", interessePrincipal: "Multimarcas Infantil e Adulto", marcasInteresse: ["Brandili", "Mundi", "Hering"], tags: ["recorrente", "infantil"], origem: "Carteira ativa", status: "ativo", dataCadastro: "10/06/2023", ultimoContato: "08/04/2026", proximaAcao: "Aguardar retorno orçamento", oportunidadesAbertas: 1, orcamentosAtivos: 1, pedidosRealizados: 8, temperaturaComercial: "morna" },
  { id: "c4", razaoSocial: "Mega Atacado Infantil LTDA", nomeFantasia: "Mega Atacado Infantil", documento: "34.567.890/0001-20", telefone: "(41) 3222-3456", whatsapp: "(41) 99877-3456", email: "atacado@megainfantil.com.br", endereco: "Rua do Comércio, 789", cidade: "Curitiba", estado: "PR", representante: "Paulo Bardini", nicho: "fitness", interessePrincipal: "Linha Fitness Adulto", marcasInteresse: ["Brandili", "Malwee"], tags: ["alto_potencial", "fitness"], origem: "Feira comercial", status: "ativo", dataCadastro: "10/03/2026", ultimoContato: "11/04/2026", proximaAcao: "Finalizar seleção de produtos", oportunidadesAbertas: 1, orcamentosAtivos: 0, pedidosRealizados: 3, temperaturaComercial: "quente" },
  { id: "c5", razaoSocial: "CJD Pozza Comercio do Vestuário Ltda", nomeFantasia: "CJD Pozza", documento: "05.485.011/0002-03", telefone: "(51) 3344-5566", whatsapp: "(51) 99123-4567", email: "pozza@cjdpozza.com.br", endereco: "Av. Independência, 300", cidade: "Porto Alegre", estado: "RS", representante: "Paulo Bardini", nicho: "infantil", interessePrincipal: "Moda Infantil Básica", marcasInteresse: ["Brandili"], tags: ["recorrente"], origem: "Carteira ativa", status: "ativo", dataCadastro: "20/08/2022", ultimoContato: "10/04/2026", proximaAcao: "Pedido confirmado", oportunidadesAbertas: 0, orcamentosAtivos: 0, pedidosRealizados: 15, temperaturaComercial: "morna" },
  { id: "c6", razaoSocial: "DBN OUTLET LTDA", nomeFantasia: "DBN OUTLET", documento: "054.937.119-23", telefone: "(47) 3370-9999", whatsapp: "(47) 99903-9999", email: "compras@dbnoutlet.com.br", endereco: "Rua das Indústrias, 50", cidade: "Jaraguá do Sul", estado: "SC", representante: "Paulo Bardini", nicho: "adulto", interessePrincipal: "Outlet Adulto", marcasInteresse: ["Mundi"], tags: ["adulto"], origem: "Carteira ativa", status: "inativo", dataCadastro: "15/11/2023", ultimoContato: "05/04/2026", proximaAcao: "Tentar reativação", oportunidadesAbertas: 0, orcamentosAtivos: 0, pedidosRealizados: 2, temperaturaComercial: "fria" },
  { id: "c7", razaoSocial: "Milykids Modas LTDA", nomeFantasia: "Milykids", documento: "59.913.644/0001-13", telefone: "(61) 3333-4444", whatsapp: "(61) 99111-2222", email: "milykids@milykids.com.br", endereco: "QS 5, Loja 22", cidade: "Brasília", estado: "DF", representante: "Paulo Bardini", nicho: "infantil", interessePrincipal: "Moda Infantil Casual", marcasInteresse: ["Brandili"], tags: ["recorrente", "infantil"], origem: "Carteira ativa", status: "ativo", dataCadastro: "01/02/2024", ultimoContato: "07/04/2026", proximaAcao: "Follow-up orçamento", oportunidadesAbertas: 1, orcamentosAtivos: 1, pedidosRealizados: 6, temperaturaComercial: "morna" },
  { id: "c8", razaoSocial: "Pimpolho Modas LTDA", nomeFantasia: "Pimpolho Modas", documento: "45.678.901/0001-30", telefone: "(48) 3222-5555", whatsapp: "(48) 99888-5555", email: "contato@pimpolhomodas.com.br", endereco: "Rua Bocaiúva, 200", cidade: "Florianópolis", estado: "SC", representante: "Paulo Bardini", nicho: "infantil", interessePrincipal: "Moda Infantil", marcasInteresse: ["Brandili", "Kyly"], tags: ["novo_cliente"], origem: "Indicação", status: "novo", dataCadastro: "08/04/2026", ultimoContato: "09/04/2026", proximaAcao: "Enviar catálogo digital", oportunidadesAbertas: 1, orcamentosAtivos: 0, pedidosRealizados: 0, temperaturaComercial: "morna" },
  { id: "c9", razaoSocial: "Rei das Crianças LTDA", nomeFantasia: "Rei das Crianças", documento: "56.789.012/0001-40", telefone: "(31) 3555-6666", whatsapp: "(31) 99777-6666", email: "compras@reidascrianças.com.br", endereco: "Av. Afonso Pena, 1200", cidade: "Belo Horizonte", estado: "MG", representante: "Paulo Bardini", nicho: "infantil", interessePrincipal: "Expansão Linha Infantil", marcasInteresse: ["Brandili", "Hering Kids", "Mundi"], tags: ["alto_potencial", "urgente"], origem: "Site", status: "novo", dataCadastro: "11/04/2026", ultimoContato: "11/04/2026", proximaAcao: "Fazer primeiro contato", oportunidadesAbertas: 1, orcamentosAtivos: 0, pedidosRealizados: 0, temperaturaComercial: "quente" },
  { id: "c10", razaoSocial: "Trendy Kids EIRELI", nomeFantasia: "Trendy Kids", documento: "78.901.234/0001-60", telefone: "(81) 3666-7777", whatsapp: "(81) 99666-7777", email: "trendy@trendykids.com.br", endereco: "Rua da Aurora, 88", cidade: "Recife", estado: "PE", representante: "Paulo Bardini", nicho: "adulto", interessePrincipal: "Moda Adulto Casual", marcasInteresse: ["Hering", "Malwee"], tags: ["adulto", "novo_cliente"], origem: "Prospecção ativa", status: "ativo", dataCadastro: "09/04/2026", ultimoContato: "09/04/2026", proximaAcao: "Enviar apresentação institucional", oportunidadesAbertas: 1, orcamentosAtivos: 0, pedidosRealizados: 0, temperaturaComercial: "fria" },
  { id: "c11", razaoSocial: "Super Baby Store LTDA", nomeFantasia: "Super Baby Store", documento: "67.890.123/0001-50", telefone: "(21) 3888-9999", whatsapp: "(21) 99555-9999", email: "super@babystore.com.br", endereco: "Rua Visconde de Pirajá, 400", cidade: "Rio de Janeiro", estado: "RJ", representante: "Paulo Bardini", nicho: "infantil", interessePrincipal: "Moda Infantil Reposição", marcasInteresse: ["Brandili", "Kyly"], tags: ["recorrente"], origem: "Carteira ativa", status: "ativo", dataCadastro: "20/05/2023", ultimoContato: "12/04/2026", proximaAcao: "Ligar para apresentar coleção", oportunidadesAbertas: 1, orcamentosAtivos: 0, pedidosRealizados: 9, temperaturaComercial: "morna" },
  { id: "c12", razaoSocial: "Universo Infantil LTDA", nomeFantasia: "Universo Infantil", documento: "89.012.345/0001-70", telefone: "(71) 3111-2222", whatsapp: "(71) 99444-2222", email: "contato@universoinfantil.com.br", endereco: "Av. Tancredo Neves, 600", cidade: "Salvador", estado: "BA", representante: "Paulo Bardini", nicho: "infantil", interessePrincipal: "Uniformes e Kits Escolares", marcasInteresse: ["Brandili"], tags: ["infantil"], origem: "Indicação", status: "ativo", dataCadastro: "06/04/2026", ultimoContato: "06/04/2026", proximaAcao: "Mapear necessidades", oportunidadesAbertas: 1, orcamentosAtivos: 0, pedidosRealizados: 1, temperaturaComercial: "fria" },
  { id: "c13", razaoSocial: "Anjus Baby e Kids ME", nomeFantasia: "Anjus Baby e Kids", documento: "087.538.419-64", telefone: "(43) 3222-1111", whatsapp: "(43) 99333-1111", email: "anjus@anjusbaby.com.br", endereco: "Rua Paraná, 150", cidade: "Bandeirantes", estado: "PR", representante: "Paulo Bardini", nicho: "infantil", interessePrincipal: "Moda Bebê", marcasInteresse: ["Brandili"], tags: ["recorrente"], origem: "Carteira ativa", status: "em_risco", dataCadastro: "10/03/2023", ultimoContato: "01/03/2026", proximaAcao: "Reativar contato urgente", oportunidadesAbertas: 0, orcamentosAtivos: 0, pedidosRealizados: 4, temperaturaComercial: "fria" },
  { id: "c14", razaoSocial: "Veste Bem Modas ME", nomeFantasia: "Veste Bem Modas", documento: "90.123.456/0001-80", telefone: "(62) 3444-5555", whatsapp: "(62) 99222-5555", email: "vestebem@vestebem.com.br", endereco: "Rua 4, Qd 10", cidade: "Goiânia", estado: "GO", representante: "Paulo Bardini", nicho: "multimarcas", interessePrincipal: "Multimarcas Infantil", marcasInteresse: ["Brandili", "Mundi", "Hering"], tags: ["recorrente"], origem: "Carteira ativa", status: "reativacao", dataCadastro: "15/09/2022", ultimoContato: "20/02/2026", proximaAcao: "Campanha de reativação", oportunidadesAbertas: 0, orcamentosAtivos: 0, pedidosRealizados: 7, temperaturaComercial: "fria" },
];

// ---- CONVERSAS WHATSAPP ----
export const mockConversas: Conversa[] = [
  { id: "conv1", clienteId: "c1", clienteNome: "Boutique da Thay", ultimaMensagem: "Oi Paulo, recebi a tabela atualizada. Vou analisar e te retorno até amanhã!", ultimaHora: "14:32", naoLidas: 0, status: "ativa", online: true },
  { id: "conv2", clienteId: "c9", clienteNome: "Rei das Crianças", ultimaMensagem: "Bom dia! Vi o catálogo de vocês no site e tenho interesse em conversar sobre a linha infantil.", ultimaHora: "11:45", naoLidas: 2, status: "nao_lida" },
  { id: "conv3", clienteId: "c7", clienteNome: "Milykids", ultimaMensagem: "Paulo, sobre o orçamento que me enviou... o valor ficou um pouco acima do que esperávamos.", ultimaHora: "10:20", naoLidas: 1, status: "nao_lida" },
  { id: "conv4", clienteId: "c4", clienteNome: "Mega Atacado Infantil", ultimaMensagem: "Perfeito! Vamos marcar uma reunião para semana que vem então.", ultimaHora: "09:15", naoLidas: 0, status: "ativa", online: true },
  { id: "conv5", clienteId: "c3", clienteNome: "Alemão Vestuário", ultimaMensagem: "Tudo certo, aguardo o retorno sobre as condições de pagamento.", ultimaHora: "Ontem", naoLidas: 0, status: "aguardando_resposta" },
  { id: "conv6", clienteId: "c8", clienteNome: "Pimpolho Modas", ultimaMensagem: "Boa tarde! Somos uma loja nova em Florianópolis e recebemos indicação de vocês.", ultimaHora: "Ontem", naoLidas: 0, status: "ativa" },
  { id: "conv7", clienteId: "c11", clienteNome: "Super Baby Store", ultimaMensagem: "Pode me enviar o catálogo da nova coleção primavera?", ultimaHora: "11/04", naoLidas: 0, status: "aguardando_resposta" },
  { id: "conv8", clienteId: "c5", clienteNome: "CJD Pozza", ultimaMensagem: "Pedido confirmado! Obrigado Paulo.", ultimaHora: "10/04", naoLidas: 0, status: "ativa" },
  { id: "conv9", clienteId: "c13", clienteNome: "Anjus Baby e Kids", ultimaMensagem: "Olá, faz tempo que não conversamos. Tem novidades?", ultimaHora: "01/03", naoLidas: 0, status: "arquivada" },
];

export const mockMensagens: Record<string, Mensagem[]> = {
  conv1: [
    { id: "m1", conversaId: "conv1", remetente: "vendedor", texto: "Bom dia Thay! Tudo bem? Seguindo nossa conversa de ontem, estou enviando a tabela de preços atualizada da coleção inverno 2026.", horario: "09:30", data: "12/04/2026", lida: true },
    { id: "m2", conversaId: "conv1", remetente: "vendedor", texto: "Inclui os itens que conversamos na reunião, com o desconto especial de 5% para pedido antecipado.", horario: "09:31", data: "12/04/2026", lida: true },
    { id: "m3", conversaId: "conv1", remetente: "cliente", texto: "Oi Paulo! Bom dia! Obrigada por enviar tão rápido.", horario: "10:15", data: "12/04/2026", lida: true },
    { id: "m4", conversaId: "conv1", remetente: "cliente", texto: "Vou olhar com calma e te dou um retorno. Uma dúvida: vocês mantêm a exclusividade regional que conversamos?", horario: "10:16", data: "12/04/2026", lida: true },
    { id: "m5", conversaId: "conv1", remetente: "vendedor", texto: "Sim! Mantemos a exclusividade no raio de 50km para a coleção principal, conforme combinamos. 😊", horario: "10:22", data: "12/04/2026", lida: true },
    { id: "m6", conversaId: "conv1", remetente: "vendedor", texto: "Se precisar ajustar qualquer quantidade ou incluir novos itens, é só me chamar!", horario: "10:23", data: "12/04/2026", lida: true },
    { id: "m7", conversaId: "conv1", remetente: "cliente", texto: "Oi Paulo, recebi a tabela atualizada. Vou analisar e te retorno até amanhã!", horario: "14:32", data: "12/04/2026", lida: true },
  ],
  conv2: [
    { id: "m20", conversaId: "conv2", remetente: "cliente", texto: "Bom dia! Vi o catálogo de vocês no site e tenho interesse em conversar sobre a linha infantil.", horario: "11:45", data: "13/04/2026", lida: false },
    { id: "m21", conversaId: "conv2", remetente: "cliente", texto: "Temos 5 lojas em Belo Horizonte e região e estamos buscando novos fornecedores para a próxima temporada.", horario: "11:46", data: "13/04/2026", lida: false },
  ],
  conv3: [
    { id: "m30", conversaId: "conv3", remetente: "vendedor", texto: "Bom dia! Estou enviando o orçamento que montamos para vocês. Qualquer dúvida estou à disposição.", horario: "15:00", data: "07/04/2026", lida: true },
    { id: "m31", conversaId: "conv3", remetente: "cliente", texto: "Obrigada Paulo, vou analisar!", horario: "16:30", data: "07/04/2026", lida: true },
    { id: "m32", conversaId: "conv3", remetente: "cliente", texto: "Paulo, sobre o orçamento que me enviou... o valor ficou um pouco acima do que esperávamos.", horario: "10:20", data: "13/04/2026", lida: false },
  ],
  conv4: [
    { id: "m40", conversaId: "conv4", remetente: "vendedor", texto: "Boa tarde! Como estão as coisas por aí? Gostaria de apresentar nossa nova linha fitness adulto.", horario: "14:00", data: "11/04/2026", lida: true },
    { id: "m41", conversaId: "conv4", remetente: "cliente", texto: "Oi Paulo! Tudo ótimo. Temos muito interesse nessa linha. Quando podemos conversar?", horario: "15:30", data: "11/04/2026", lida: true },
    { id: "m42", conversaId: "conv4", remetente: "vendedor", texto: "Que tal uma reunião na semana que vem? Posso ir até Curitiba.", horario: "08:45", data: "13/04/2026", lida: true },
    { id: "m43", conversaId: "conv4", remetente: "cliente", texto: "Perfeito! Vamos marcar uma reunião para semana que vem então.", horario: "09:15", data: "13/04/2026", lida: true },
  ],
};

// ---- PEDIDOS ----
export const mockPedidos: Pedido[] = [
  { id: "ped1", clienteId: "c1", numero: "PED-2026-0087", data: "10/04/2026", valor: 8900, status: "confirmado", origem: "Oportunidade #op5", observacoes: "Pedido aprovado sem ajustes" },
  { id: "ped2", clienteId: "c1", numero: "PED-2025-0312", data: "15/11/2025", valor: 12400, status: "entregue", origem: "Carteira ativa", observacoes: "Entrega em 2 lotes" },
  { id: "ped3", clienteId: "c1", numero: "PED-2025-0198", data: "20/07/2025", valor: 6750, status: "entregue", origem: "Carteira ativa", observacoes: "" },
  { id: "ped4", clienteId: "c5", numero: "PED-2026-0092", data: "10/04/2026", valor: 8900, status: "em_producao", origem: "Oportunidade #op5", observacoes: "Aprovado" },
  { id: "ped5", clienteId: "c3", numero: "PED-2025-0255", data: "10/09/2025", valor: 9300, status: "entregue", origem: "Carteira ativa", observacoes: "" },
  { id: "ped6", clienteId: "c7", numero: "PED-2025-0301", data: "05/11/2025", valor: 4100, status: "entregue", origem: "Carteira ativa", observacoes: "" },
  { id: "ped7", clienteId: "c4", numero: "PED-2025-0320", data: "01/12/2025", valor: 18500, status: "entregue", origem: "Feira comercial", observacoes: "Primeiro pedido fitness" },
  { id: "ped8", clienteId: "c11", numero: "PED-2025-0340", data: "20/12/2025", valor: 7200, status: "entregue", origem: "Carteira ativa", observacoes: "" },
];

// ---- NOTAS ----
export const mockNotas: Nota[] = [
  { id: "n1", clienteId: "c1", texto: "Cliente quer exclusividade regional no raio de 50km para a coleção principal de inverno. Validar com comercial.", data: "01/03/2026 15:00", autor: "Paulo Bardini", fixada: true },
  { id: "n2", clienteId: "c1", texto: "Thay mencionou interesse em expandir para linha adulto casual no segundo semestre.", data: "05/04/2026 10:30", autor: "Paulo Bardini", fixada: false },
  { id: "n3", clienteId: "c2", texto: "Loja nova com 3 pontos em São Paulo. Potencial muito alto para Brandili e Hering Kids.", data: "05/03/2026 08:30", autor: "Paulo Bardini", fixada: true },
  { id: "n4", clienteId: "c4", texto: "Grande interesse em fitness adulto demonstrado na feira FIT 2026. Contato quente.", data: "10/03/2026 16:00", autor: "Paulo Bardini", fixada: true },
  { id: "n5", clienteId: "c13", texto: "Cliente sem contato há mais de 45 dias. Verificar se houve problema com último pedido.", data: "01/03/2026 09:00", autor: "Paulo Bardini", fixada: true },
];

// ---- TAREFAS COMPLETAS ----
export const mockTarefas360: TarefaCRM360[] = [
  { id: "t1", titulo: "Enviar contraproposta Boutique da Thay", descricao: "Revisar preços e enviar nova proposta com desconto progressivo", tipo: "retorno_proposta", clienteId: "c1", clienteNome: "Boutique da Thay", oportunidadeId: "op1", oportunidadeNome: "Pedido Inverno 2026 – Multimarcas", prioridade: "alta", vencimento: "14/04/2026", hora: "10:00", responsavel: "Paulo Bardini", status: "pendente" },
  { id: "t2", titulo: "Agendar visita Fashion Kids", descricao: "Marcar visita presencial nas 3 lojas em São Paulo", tipo: "visita", clienteId: "c2", clienteNome: "Fashion Kids Store", oportunidadeId: "op2", oportunidadeNome: "Abertura de conta – Fashion Kids", prioridade: "media", vencimento: "18/04/2026", hora: "14:00", responsavel: "Paulo Bardini", status: "pendente" },
  { id: "t3", titulo: "Follow-up orçamento Alemão Vestuário", descricao: "Ligar para verificar retorno do orçamento enviado", tipo: "follow_up", clienteId: "c3", clienteNome: "Alemão Vestuário", oportunidadeId: "op3", oportunidadeNome: "Reposição Verão – Alemão Vestuário", prioridade: "media", vencimento: "12/04/2026", responsavel: "Paulo Bardini", status: "atrasada" },
  { id: "t4", titulo: "Montar catálogo fitness para Mega Atacado", descricao: "Selecionar produtos fitness adulto e montar apresentação", tipo: "reuniao", clienteId: "c4", clienteNome: "Mega Atacado Infantil", oportunidadeId: "op4", oportunidadeNome: "Coleção Fitness Adulto – Mega Atacado", prioridade: "alta", vencimento: "15/04/2026", hora: "09:00", responsavel: "Paulo Bardini", status: "pendente" },
  { id: "t5", titulo: "Enviar catálogo Pimpolho Modas", descricao: "Enviar catálogo digital via WhatsApp", tipo: "follow_up", clienteId: "c8", clienteNome: "Pimpolho Modas", oportunidadeId: "op7", oportunidadeNome: "Primeira compra – Pimpolho Modas", prioridade: "media", vencimento: "13/04/2026", responsavel: "Paulo Bardini", status: "pendente" },
  { id: "t6", titulo: "Primeiro contato Rei das Crianças", descricao: "Ligar e apresentar Nextil. Cliente com 5 lojas em BH.", tipo: "ligacao", clienteId: "c9", clienteNome: "Rei das Crianças", oportunidadeId: "op8", oportunidadeNome: "Expansão Linha Infantil – Rei das Crianças", prioridade: "alta", vencimento: "14/04/2026", hora: "11:00", responsavel: "Paulo Bardini", status: "pendente" },
  { id: "t7", titulo: "Follow-up orçamento Milykids", descricao: "Verificar retorno sobre orçamento enviado", tipo: "cobranca_resposta", clienteId: "c7", clienteNome: "Milykids", oportunidadeId: "op11", oportunidadeNome: "Pedido Especial – Milykids", prioridade: "media", vencimento: "10/04/2026", responsavel: "Paulo Bardini", status: "atrasada" },
  { id: "t8", titulo: "Reativar Anjus Baby e Kids", descricao: "Sem contato há 45 dias. Verificar se houve problema.", tipo: "ligacao", clienteId: "c13", clienteNome: "Anjus Baby e Kids", prioridade: "baixa", vencimento: "16/04/2026", responsavel: "Paulo Bardini", status: "pendente" },
  { id: "t9", titulo: "Pós-venda CJD Pozza", descricao: "Verificar satisfação com último pedido entregue", tipo: "pos_venda", clienteId: "c5", clienteNome: "CJD Pozza", prioridade: "baixa", vencimento: "17/04/2026", responsavel: "Paulo Bardini", status: "pendente" },
  { id: "t10", titulo: "Enviar apresentação Trendy Kids", descricao: "Montar e enviar apresentação institucional para linha adulto", tipo: "follow_up", clienteId: "c10", clienteNome: "Trendy Kids", oportunidadeId: "op10", oportunidadeNome: "Moda Adulta – Trendy Kids", prioridade: "baixa", vencimento: "15/04/2026", responsavel: "Paulo Bardini", status: "pendente" },
  { id: "t11", titulo: "Campanha reativação Veste Bem", descricao: "Preparar ofertas especiais para reativação do cliente", tipo: "follow_up", clienteId: "c14", clienteNome: "Veste Bem Modas", prioridade: "media", vencimento: "20/04/2026", responsavel: "Paulo Bardini", status: "pendente" },
  { id: "t12", titulo: "Ligar para Super Baby Store", descricao: "Apresentar nova coleção primavera", tipo: "ligacao", clienteId: "c11", clienteNome: "Super Baby Store", oportunidadeId: "op9", oportunidadeNome: "Reposição Primavera – Super Baby", prioridade: "media", vencimento: "14/04/2026", hora: "15:00", responsavel: "Paulo Bardini", status: "pendente" },
];

// ---- COMPROMISSOS / AGENDA ----
export const mockCompromissos: Compromisso[] = [
  { id: "ag1", titulo: "Reunião com Boutique da Thay", clienteId: "c1", clienteNome: "Boutique da Thay", oportunidadeId: "op1", tipo: "reuniao", data: "14/04/2026", hora: "10:00", duracao: "1h", responsavel: "Paulo Bardini", descricao: "Discutir contraproposta de preços e exclusividade regional", status: "agendado" },
  { id: "ag2", titulo: "Ligação Fashion Kids Store", clienteId: "c2", clienteNome: "Fashion Kids Store", oportunidadeId: "op2", tipo: "ligacao", data: "14/04/2026", hora: "14:00", duracao: "30min", responsavel: "Paulo Bardini", descricao: "Agendar visita presencial em SP", status: "agendado" },
  { id: "ag3", titulo: "Follow-up Alemão Vestuário", clienteId: "c3", clienteNome: "Alemão Vestuário", oportunidadeId: "op3", tipo: "follow_up", data: "15/04/2026", hora: "09:00", duracao: "15min", responsavel: "Paulo Bardini", descricao: "Verificar retorno sobre orçamento", status: "agendado" },
  { id: "ag4", titulo: "Visita Mega Atacado Infantil", clienteId: "c4", clienteNome: "Mega Atacado Infantil", oportunidadeId: "op4", tipo: "visita", data: "16/04/2026", hora: "11:00", duracao: "2h", responsavel: "Paulo Bardini", descricao: "Apresentação da linha fitness adulto em Curitiba", status: "agendado" },
  { id: "ag5", titulo: "Primeiro contato Rei das Crianças", clienteId: "c9", clienteNome: "Rei das Crianças", oportunidadeId: "op8", tipo: "ligacao", data: "14/04/2026", hora: "11:00", duracao: "30min", responsavel: "Paulo Bardini", descricao: "Apresentar Nextil e entender demanda das 5 lojas em BH", status: "agendado" },
  { id: "ag6", titulo: "Apresentação Comercial Super Baby", clienteId: "c11", clienteNome: "Super Baby Store", oportunidadeId: "op9", tipo: "apresentacao", data: "14/04/2026", hora: "15:00", duracao: "45min", responsavel: "Paulo Bardini", descricao: "Apresentar nova coleção primavera", status: "agendado" },
  { id: "ag7", titulo: "Follow-up Milykids", clienteId: "c7", clienteNome: "Milykids", oportunidadeId: "op11", tipo: "follow_up", data: "15/04/2026", hora: "14:00", duracao: "15min", responsavel: "Paulo Bardini", descricao: "Cobrar retorno sobre orçamento", status: "agendado" },
  { id: "ag8", titulo: "Reunião catálogo fitness", clienteId: "c4", clienteNome: "Mega Atacado Infantil", tipo: "reuniao", data: "17/04/2026", hora: "10:00", duracao: "1h", responsavel: "Paulo Bardini", descricao: "Finalizar seleção de produtos", status: "agendado" },
  { id: "ag9", titulo: "Retorno orçamento Boutique da Thay", clienteId: "c1", clienteNome: "Boutique da Thay", oportunidadeId: "op1", tipo: "retorno_orcamento", data: "17/04/2026", hora: "14:00", duracao: "30min", responsavel: "Paulo Bardini", descricao: "Aguardar decisão final sobre proposta", status: "agendado" },
  { id: "ag10", titulo: "Visita Pimpolho Modas", clienteId: "c8", clienteNome: "Pimpolho Modas", oportunidadeId: "op7", tipo: "visita", data: "18/04/2026", hora: "10:00", duracao: "2h", responsavel: "Paulo Bardini", descricao: "Visita à loja nova em Florianópolis", status: "agendado" },
];

// ---- HISTÓRICO DO CLIENTE ----
export interface HistoricoEvento {
  id: string;
  clienteId: string;
  tipo: "cadastro" | "mensagem_recebida" | "mensagem_enviada" | "oportunidade_criada" | "oportunidade_movida" | "orcamento_gerado" | "tarefa_criada" | "tarefa_concluida" | "reuniao_agendada" | "nota_adicionada" | "pedido_registrado" | "atualizacao_cadastral";
  descricao: string;
  data: string;
  autor?: string;
  detalhes?: string;
}

export const mockHistorico: HistoricoEvento[] = [
  { id: "h1", clienteId: "c1", tipo: "mensagem_recebida", descricao: "Mensagem recebida via WhatsApp", data: "12/04/2026 14:32", detalhes: "\"Vou analisar e te retorno até amanhã!\"" },
  { id: "h2", clienteId: "c1", tipo: "mensagem_enviada", descricao: "Tabela de preços enviada via WhatsApp", data: "12/04/2026 09:30", autor: "Paulo Bardini" },
  { id: "h3", clienteId: "c1", tipo: "oportunidade_movida", descricao: "Oportunidade movida para 'Em negociação'", data: "09/04/2026 16:00", autor: "Sistema", detalhes: "Pedido Inverno 2026 – Multimarcas" },
  { id: "h4", clienteId: "c1", tipo: "orcamento_gerado", descricao: "Orçamento #7 criado (R$ 11.610,60)", data: "07/04/2026 14:34", autor: "Paulo Bardini" },
  { id: "h5", clienteId: "c1", tipo: "reuniao_agendada", descricao: "Reunião presencial na loja agendada", data: "05/04/2026 10:00", autor: "Paulo Bardini" },
  { id: "h6", clienteId: "c1", tipo: "nota_adicionada", descricao: "Nota: Cliente quer exclusividade regional", data: "01/03/2026 15:00", autor: "Paulo Bardini" },
  { id: "h7", clienteId: "c1", tipo: "oportunidade_criada", descricao: "Oportunidade criada: Pedido Inverno 2026 – Multimarcas", data: "01/03/2026 14:00", autor: "Paulo Bardini" },
  { id: "h8", clienteId: "c1", tipo: "pedido_registrado", descricao: "Pedido PED-2025-0312 registrado (R$ 12.400,00)", data: "15/11/2025 10:00", autor: "Sistema" },
  { id: "h9", clienteId: "c1", tipo: "pedido_registrado", descricao: "Pedido PED-2025-0198 registrado (R$ 6.750,00)", data: "20/07/2025 10:00", autor: "Sistema" },
  { id: "h10", clienteId: "c1", tipo: "cadastro", descricao: "Cliente cadastrado no sistema", data: "15/01/2024 09:00", autor: "Paulo Bardini" },
  { id: "h11", clienteId: "c2", tipo: "tarefa_criada", descricao: "Tarefa criada: Agendar visita presencial", data: "10/04/2026 10:30", autor: "Paulo Bardini" },
  { id: "h12", clienteId: "c2", tipo: "oportunidade_criada", descricao: "Oportunidade criada: Abertura de conta – Fashion Kids", data: "05/03/2026 09:00", autor: "Paulo Bardini" },
  { id: "h13", clienteId: "c2", tipo: "cadastro", descricao: "Cliente cadastrado no sistema", data: "05/03/2026 08:30", autor: "Paulo Bardini" },
  { id: "h14", clienteId: "c9", tipo: "mensagem_recebida", descricao: "Mensagem recebida via WhatsApp", data: "13/04/2026 11:45", detalhes: "\"Vi o catálogo de vocês no site...\"" },
  { id: "h15", clienteId: "c9", tipo: "oportunidade_criada", descricao: "Oportunidade criada: Expansão Linha Infantil", data: "11/04/2026 10:00", autor: "Paulo Bardini" },
  { id: "h16", clienteId: "c9", tipo: "cadastro", descricao: "Cliente cadastrado via site", data: "11/04/2026 09:00", autor: "Sistema" },
];

// Helper types for status labels
export const statusLabels: Record<ClienteStatus, string> = {
  ativo: "Ativo", inativo: "Inativo", em_risco: "Em risco", reativacao: "Reativação", novo: "Novo",
};
export const statusColors: Record<ClienteStatus, string> = {
  ativo: "bg-green-100 text-green-700 border-green-200",
  inativo: "bg-slate-100 text-slate-500 border-slate-200",
  em_risco: "bg-red-100 text-red-700 border-red-200",
  reativacao: "bg-yellow-100 text-yellow-700 border-yellow-200",
  novo: "bg-blue-100 text-blue-700 border-blue-200",
};
export const nichoLabels: Record<Nicho, string> = {
  infantil: "Infantil", adulto: "Adulto", fitness: "Fitness", multimarcas: "Multimarcas", moda_praia: "Moda Praia", casual: "Casual",
};
export const temperaturaColors: Record<string, string> = {
  quente: "text-red-500", morna: "text-yellow-500", fria: "text-blue-400",
};
export const tipoTarefaLabels: Record<string, string> = {
  ligacao: "Ligação", follow_up: "Follow-up", visita: "Visita", reuniao: "Reunião", retorno_proposta: "Retorno de proposta", cobranca_resposta: "Cobrança de resposta", pos_venda: "Pós-venda",
};
export const tipoCompromissoLabels: Record<string, string> = {
  ligacao: "Ligação", reuniao: "Reunião", visita: "Visita", follow_up: "Follow-up", retorno_orcamento: "Retorno de orçamento", apresentacao: "Apresentação comercial",
};
