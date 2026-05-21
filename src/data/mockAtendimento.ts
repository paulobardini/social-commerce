// Mock data for Atendimento (Tickets WhatsApp) module
// 4 setores: SAC, Cobrança, Financeiro, Logística
// Cada setor com funil próprio (colunas configuráveis), supervisor vê tudo,
// atendente vê apenas o(s) setor(es) ao qual está vinculado.

export type Setor = "sac" | "cobranca" | "financeiro" | "logistica";

export const setorLabels: Record<Setor, string> = {
  sac: "SAC",
  cobranca: "Cobrança",
  financeiro: "Financeiro",
  logistica: "Logística",
};

// classes utilitárias (badge bg + texto + borda)
export const setorColors: Record<Setor, string> = {
  sac: "bg-blue-100 text-blue-700 border-blue-200",
  cobranca: "bg-red-100 text-red-700 border-red-200",
  financeiro: "bg-emerald-100 text-emerald-700 border-emerald-200",
  logistica: "bg-purple-100 text-purple-700 border-purple-200",
};

export const setorDot: Record<Setor, string> = {
  sac: "bg-blue-500",
  cobranca: "bg-red-500",
  financeiro: "bg-emerald-500",
  logistica: "bg-purple-500",
};

export type TicketTipo =
  | "financeiro"
  | "pedido"
  | "troca"
  | "reclamacao"
  | "duvida"
  | "cobranca"
  | "outro";

export const tipoLabels: Record<TicketTipo, string> = {
  financeiro: "Financeiro",
  pedido: "Pedido",
  troca: "Troca",
  reclamacao: "Reclamação",
  duvida: "Dúvida",
  cobranca: "Cobrança",
  outro: "Outro",
};

export const tipoColors: Record<TicketTipo, string> = {
  financeiro: "bg-emerald-50 text-emerald-700 border-emerald-200",
  pedido: "bg-indigo-50 text-indigo-700 border-indigo-200",
  troca: "bg-amber-50 text-amber-700 border-amber-200",
  reclamacao: "bg-red-50 text-red-700 border-red-200",
  duvida: "bg-slate-50 text-slate-700 border-slate-200",
  cobranca: "bg-rose-50 text-rose-700 border-rose-200",
  outro: "bg-muted text-foreground border-border",
};

export type TicketPrioridade = "urgente" | "normal" | "baixa";

export const prioridadeLabels: Record<TicketPrioridade, string> = {
  urgente: "Urgente",
  normal: "Normal",
  baixa: "Baixa",
};

export const prioridadeColors: Record<TicketPrioridade, string> = {
  urgente: "bg-red-100 text-red-700 border-red-200",
  normal: "bg-blue-50 text-blue-700 border-blue-200",
  baixa: "bg-slate-50 text-slate-600 border-slate-200",
};

export type TicketOrigem = "whatsapp" | "manual";

export type AtendenteRole = "supervisor" | "atendente";

export interface Atendente {
  id: string;
  nome: string;
  iniciais: string;
  setores: Setor[];
  role: AtendenteRole;
  cor: string; // tailwind bg color para avatar
}

export const mockAtendentes: Atendente[] = [
  { id: "a-sup", nome: "Paulo Bardini", iniciais: "PB", setores: ["sac", "cobranca", "financeiro", "logistica"], role: "supervisor", cor: "bg-indigo-500" },
  { id: "a-sac1", nome: "Marina Costa", iniciais: "MC", setores: ["sac"], role: "atendente", cor: "bg-blue-500" },
  { id: "a-sac2", nome: "Lucas Pereira", iniciais: "LP", setores: ["sac"], role: "atendente", cor: "bg-sky-500" },
  { id: "a-cob1", nome: "Renata Lopes", iniciais: "RL", setores: ["cobranca"], role: "atendente", cor: "bg-red-500" },
  { id: "a-cob2", nome: "Bruno Alves", iniciais: "BA", setores: ["cobranca"], role: "atendente", cor: "bg-rose-500" },
  { id: "a-fin1", nome: "Carla Souza", iniciais: "CS", setores: ["financeiro"], role: "atendente", cor: "bg-emerald-500" },
  { id: "a-log1", nome: "Diego Martins", iniciais: "DM", setores: ["logistica"], role: "atendente", cor: "bg-purple-500" },
  { id: "a-log2", nome: "Patrícia Reis", iniciais: "PR", setores: ["logistica"], role: "atendente", cor: "bg-fuchsia-500" },
];

export interface FunilColuna {
  id: string;
  label: string;
  cor: string; // tailwind dot color
  ordem: number;
}

export interface FunilSetor {
  setor: Setor;
  colunas: FunilColuna[];
}

export const defaultFunis: FunilSetor[] = [
  {
    setor: "sac",
    colunas: [
      { id: "sac-aberto", label: "Aberto", cor: "bg-slate-400", ordem: 1 },
      { id: "sac-atend", label: "Em atendimento", cor: "bg-blue-500", ordem: 2 },
      { id: "sac-aguard", label: "Aguardando cliente", cor: "bg-yellow-500", ordem: 3 },
      { id: "sac-resol", label: "Resolvido", cor: "bg-green-500", ordem: 4 },
      { id: "sac-enc", label: "Encerrado", cor: "bg-slate-600", ordem: 5 },
    ],
  },
  {
    setor: "cobranca",
    colunas: [
      { id: "cob-aberto", label: "Em aberto", cor: "bg-slate-400", ordem: 1 },
      { id: "cob-negoc", label: "Em negociação", cor: "bg-orange-500", ordem: 2 },
      { id: "cob-comp", label: "Aguardando comprovante", cor: "bg-yellow-500", ordem: 3 },
      { id: "cob-pago", label: "Pago", cor: "bg-green-500", ordem: 4 },
      { id: "cob-perd", label: "Perdido", cor: "bg-red-500", ordem: 5 },
    ],
  },
  {
    setor: "financeiro",
    colunas: [
      { id: "fin-pend", label: "Pendente", cor: "bg-slate-400", ordem: 1 },
      { id: "fin-anal", label: "Em análise", cor: "bg-blue-500", ordem: 2 },
      { id: "fin-nf", label: "Aguardando NF", cor: "bg-yellow-500", ordem: 3 },
      { id: "fin-conc", label: "Conciliado", cor: "bg-green-500", ordem: 4 },
      { id: "fin-enc", label: "Encerrado", cor: "bg-slate-600", ordem: 5 },
    ],
  },
  {
    setor: "logistica",
    colunas: [
      { id: "log-rec", label: "Recebido", cor: "bg-slate-400", ordem: 1 },
      { id: "log-sep", label: "Em separação", cor: "bg-blue-500", ordem: 2 },
      { id: "log-rast", label: "Aguardando rastreio", cor: "bg-yellow-500", ordem: 3 },
      { id: "log-entr", label: "Entregue", cor: "bg-green-500", ordem: 4 },
      { id: "log-dev", label: "Devolvido", cor: "bg-red-500", ordem: 5 },
    ],
  },
];

export interface MensagemWA {
  remetente: "cliente" | "atendente";
  texto: string;
  horario: string;
}

export interface PedidoResumo {
  data: string;
  valor: number;
  produto: string;
}

export interface AnexoTicket {
  nome: string;
  tipo: "imagem" | "documento";
  thumb?: string;
}

export interface Ticket {
  id: string;
  setor: Setor;
  statusColunaId: string;
  clienteId: string;
  clienteNome: string;
  empresa: string;
  whatsapp: string;
  tipo: TicketTipo;
  prioridade: TicketPrioridade;
  origem: TicketOrigem;
  responsavelId: string;
  dataAbertura: string;
  ultimaAtividade: string;
  proximaAcao: string;
  descricao: string;
  oportunidadeId?: string;
  historicoCompras: PedidoResumo[];
  mensagensWhatsApp: MensagemWA[];
  anexos: AnexoTicket[];
}

const historicoFashion: PedidoResumo[] = [
  { data: "12/03/2026", valor: 18420, produto: "Coleção Inverno Infantil" },
  { data: "20/01/2026", valor: 9650, produto: "Reposição básicos verão" },
  { data: "02/11/2025", valor: 12300, produto: "Linha festas fim de ano" },
];

const historicoRei: PedidoResumo[] = [
  { data: "01/04/2026", valor: 24800, produto: "Pedido expansão linha kids" },
  { data: "10/02/2026", valor: 7400, produto: "Mostruário coleção" },
  { data: "05/12/2025", valor: 15200, produto: "Reposição inverno" },
];

const historicoMily: PedidoResumo[] = [
  { data: "07/04/2026", valor: 8900, produto: "Casual infantil verão" },
  { data: "15/01/2026", valor: 4200, produto: "Grade mostruário" },
  { data: "20/10/2025", valor: 6100, produto: "Reposição básicos" },
];

const historicoAlemao: PedidoResumo[] = [
  { data: "08/04/2026", valor: 11200, produto: "Multimarcas adulto" },
  { data: "20/02/2026", valor: 5800, produto: "Reposição infantil" },
  { data: "10/12/2025", valor: 8400, produto: "Festas e presentes" },
];

const historicoMega: PedidoResumo[] = [
  { data: "30/03/2026", valor: 32100, produto: "Linha Fitness Adulto" },
  { data: "15/02/2026", valor: 14700, produto: "Mostruário fitness" },
  { data: "10/11/2025", valor: 19800, produto: "Verão fitness" },
];

const historicoSuper: PedidoResumo[] = [
  { data: "02/04/2026", valor: 9300, produto: "Reposição infantil" },
  { data: "10/02/2026", valor: 4100, produto: "Coleção bebês" },
  { data: "12/12/2025", valor: 7200, produto: "Festas fim de ano" },
];

export const mockTickets: Ticket[] = [
  // ===== Fashion Kids Store (c2) — 3 tickets para popular timeline =====
  {
    id: "t-001",
    setor: "sac",
    statusColunaId: "sac-atend",
    clienteId: "c2",
    clienteNome: "Camila Fernandes",
    empresa: "Fashion Kids Store",
    whatsapp: "(11) 99876-5432",
    tipo: "duvida",
    prioridade: "normal",
    origem: "whatsapp",
    responsavelId: "a-sac1",
    dataAbertura: "12/04/2026 09:18",
    ultimaAtividade: "há 12 min",
    proximaAcao: "Enviar tabela de grades",
    descricao: "Cliente quer entender as opções de grade da nova coleção inverno antes de fechar pedido.",
    oportunidadeId: undefined,
    historicoCompras: historicoFashion,
    mensagensWhatsApp: [
      { remetente: "cliente", texto: "Oi! Vocês têm grade fechada para a coleção inverno?", horario: "09:18" },
      { remetente: "atendente", texto: "Olá Camila! Sim, temos. Vou te enviar a tabela completa em instantes.", horario: "09:22" },
      { remetente: "cliente", texto: "Perfeito, obrigada!", horario: "09:23" },
      { remetente: "atendente", texto: "Segue em anexo. Qualquer dúvida me avise por aqui.", horario: "09:31" },
    ],
    anexos: [],
  },
  {
    id: "t-002",
    setor: "cobranca",
    statusColunaId: "cob-comp",
    clienteId: "c2",
    clienteNome: "Camila Fernandes",
    empresa: "Fashion Kids Store",
    whatsapp: "(11) 99876-5432",
    tipo: "cobranca",
    prioridade: "urgente",
    origem: "whatsapp",
    responsavelId: "a-cob1",
    dataAbertura: "10/04/2026 14:02",
    ultimaAtividade: "há 2 h",
    proximaAcao: "Aguardando comprovante PIX",
    descricao: "Boleto da NF 18420 venceu em 08/04. Cliente confirmou pagamento por PIX, falta enviar comprovante.",
    historicoCompras: historicoFashion,
    mensagensWhatsApp: [
      { remetente: "atendente", texto: "Camila, identificamos o vencimento do boleto da NF 18420. Posso te ajudar?", horario: "14:02" },
      { remetente: "cliente", texto: "Oi Renata, já fiz o PIX hoje cedo!", horario: "14:25" },
      { remetente: "atendente", texto: "Ótimo! Pode me mandar o comprovante para baixarmos?", horario: "14:26" },
      { remetente: "cliente", texto: "Mando até o fim do dia, ok?", horario: "14:40" },
    ],
    anexos: [{ nome: "boleto-18420.pdf", tipo: "documento" }],
  },
  {
    id: "t-003",
    setor: "logistica",
    statusColunaId: "log-rast",
    clienteId: "c2",
    clienteNome: "Camila Fernandes",
    empresa: "Fashion Kids Store",
    whatsapp: "(11) 99876-5432",
    tipo: "pedido",
    prioridade: "normal",
    origem: "manual",
    responsavelId: "a-log1",
    dataAbertura: "08/04/2026 11:30",
    ultimaAtividade: "ontem",
    proximaAcao: "Atualizar rastreio com a transportadora",
    descricao: "Cliente solicitou status do pedido #18420. Transportadora ainda não atualizou código de rastreio.",
    historicoCompras: historicoFashion,
    mensagensWhatsApp: [
      { remetente: "cliente", texto: "Bom dia, conseguem me passar o rastreio do meu pedido?", horario: "11:30" },
      { remetente: "atendente", texto: "Bom dia! Estou verificando com a transportadora agora.", horario: "11:42" },
      { remetente: "atendente", texto: "Ainda não atualizaram aqui, peço só mais algumas horas.", horario: "15:10" },
    ],
    anexos: [{ nome: "etiqueta-envio.jpg", tipo: "imagem", thumb: "https://images.unsplash.com/photo-1530686577708-c08fb1bba0e5?w=400" }],
  },

  // ===== Rei das Crianças (c9) =====
  {
    id: "t-004",
    setor: "sac",
    statusColunaId: "sac-aberto",
    clienteId: "c9",
    clienteNome: "André Tavares",
    empresa: "Rei das Crianças",
    whatsapp: "(31) 99777-6666",
    tipo: "reclamacao",
    prioridade: "urgente",
    origem: "whatsapp",
    responsavelId: "a-sac2",
    dataAbertura: "12/04/2026 08:05",
    ultimaAtividade: "há 5 min",
    proximaAcao: "Responder mensagem inicial",
    descricao: "Cliente recebeu peças com etiqueta trocada na grade infantil.",
    oportunidadeId: "op1",
    historicoCompras: historicoRei,
    mensagensWhatsApp: [
      { remetente: "cliente", texto: "Bom dia, recebi o pedido e tem peças com etiqueta trocada.", horario: "08:05" },
      { remetente: "cliente", texto: "Preciso de uma solução urgente, vamos abrir a loja segunda.", horario: "08:07" },
    ],
    anexos: [{ nome: "foto-etiqueta.jpg", tipo: "imagem", thumb: "https://images.unsplash.com/photo-1521334884684-d80222895322?w=400" }],
  },
  {
    id: "t-005",
    setor: "logistica",
    statusColunaId: "log-entr",
    clienteId: "c9",
    clienteNome: "André Tavares",
    empresa: "Rei das Crianças",
    whatsapp: "(31) 99777-6666",
    tipo: "pedido",
    prioridade: "normal",
    origem: "whatsapp",
    responsavelId: "a-log2",
    dataAbertura: "05/04/2026 17:22",
    ultimaAtividade: "há 2 dias",
    proximaAcao: "Coletar feedback de entrega",
    descricao: "Pedido entregue com sucesso. Aguardando feedback do cliente para fechar ticket.",
    historicoCompras: historicoRei,
    mensagensWhatsApp: [
      { remetente: "atendente", texto: "Olá! Seu pedido foi entregue hoje. Tudo certo?", horario: "17:22" },
      { remetente: "cliente", texto: "Recebi sim, obrigado!", horario: "18:10" },
    ],
    anexos: [],
  },

  // ===== Milykids (c7) =====
  {
    id: "t-006",
    setor: "sac",
    statusColunaId: "sac-aguard",
    clienteId: "c7",
    clienteNome: "Patrícia Lima",
    empresa: "Milykids",
    whatsapp: "(61) 99111-2222",
    tipo: "troca",
    prioridade: "normal",
    origem: "whatsapp",
    responsavelId: "a-sac1",
    dataAbertura: "09/04/2026 10:15",
    ultimaAtividade: "ontem",
    proximaAcao: "Aguardando envio das peças para troca",
    descricao: "Cliente solicitou troca de 6 peças por defeito de costura. Aguardando postagem.",
    historicoCompras: historicoMily,
    mensagensWhatsApp: [
      { remetente: "cliente", texto: "Oi! Tem como trocar 6 peças que vieram com defeito?", horario: "10:15" },
      { remetente: "atendente", texto: "Claro Patrícia! Vou te passar o endereço para envio.", horario: "10:30" },
      { remetente: "cliente", texto: "Posto amanhã então.", horario: "10:33" },
    ],
    anexos: [],
  },
  {
    id: "t-007",
    setor: "financeiro",
    statusColunaId: "fin-nf",
    clienteId: "c7",
    clienteNome: "Patrícia Lima",
    empresa: "Milykids",
    whatsapp: "(61) 99111-2222",
    tipo: "financeiro",
    prioridade: "normal",
    origem: "manual",
    responsavelId: "a-fin1",
    dataAbertura: "07/04/2026 16:00",
    ultimaAtividade: "há 2 dias",
    proximaAcao: "Emitir NF de reposição",
    descricao: "Cliente pediu emissão de NF separada para reposição. Falta dado fiscal atualizado.",
    historicoCompras: historicoMily,
    mensagensWhatsApp: [
      { remetente: "atendente", texto: "Patrícia, vou precisar dos dados fiscais atualizados para emitir.", horario: "16:00" },
      { remetente: "cliente", texto: "Te mando amanhã.", horario: "16:42" },
    ],
    anexos: [],
  },

  // ===== Alemão Vestuário (c3) =====
  {
    id: "t-008",
    setor: "cobranca",
    statusColunaId: "cob-negoc",
    clienteId: "c3",
    clienteNome: "Roberto Schmidt",
    empresa: "Alemão Vestuário",
    whatsapp: "(47) 99902-5678",
    tipo: "cobranca",
    prioridade: "normal",
    origem: "manual",
    responsavelId: "a-cob2",
    dataAbertura: "06/04/2026 13:40",
    ultimaAtividade: "há 3 dias",
    proximaAcao: "Negociar parcelamento em 3x",
    descricao: "Cliente solicitou parcelar duplicata de R$ 8.400 em 3x. Aguardando aprovação interna.",
    historicoCompras: historicoAlemao,
    mensagensWhatsApp: [
      { remetente: "cliente", texto: "Pessoal, dá para parcelar a duplicata de abril em 3x?", horario: "13:40" },
      { remetente: "atendente", texto: "Vou checar com o financeiro e te retorno hoje.", horario: "13:50" },
      { remetente: "atendente", texto: "Aprovado! Vou preparar o aditivo.", horario: "16:20" },
    ],
    anexos: [],
  },

  // ===== Mega Atacado Infantil (c4) =====
  {
    id: "t-009",
    setor: "sac",
    statusColunaId: "sac-resol",
    clienteId: "c4",
    clienteNome: "Eduardo Nunes",
    empresa: "Mega Atacado Infantil",
    whatsapp: "(41) 99877-3456",
    tipo: "duvida",
    prioridade: "baixa",
    origem: "whatsapp",
    responsavelId: "a-sac2",
    dataAbertura: "04/04/2026 11:00",
    ultimaAtividade: "há 5 dias",
    proximaAcao: "Encerrar ticket",
    descricao: "Cliente perguntou sobre prazos de produção da linha fitness — respondido e finalizado.",
    historicoCompras: historicoMega,
    mensagensWhatsApp: [
      { remetente: "cliente", texto: "Qual o lead time atual da linha fitness?", horario: "11:00" },
      { remetente: "atendente", texto: "Hoje estamos com 18 dias úteis para essa linha.", horario: "11:10" },
      { remetente: "cliente", texto: "Show, obrigado!", horario: "11:11" },
    ],
    anexos: [],
  },
  {
    id: "t-010",
    setor: "financeiro",
    statusColunaId: "fin-conc",
    clienteId: "c4",
    clienteNome: "Eduardo Nunes",
    empresa: "Mega Atacado Infantil",
    whatsapp: "(41) 99877-3456",
    tipo: "financeiro",
    prioridade: "normal",
    origem: "manual",
    responsavelId: "a-fin1",
    dataAbertura: "01/04/2026 09:30",
    ultimaAtividade: "há 1 semana",
    proximaAcao: "Encerrar conciliação",
    descricao: "Conciliação financeira de pedido grande de março finalizada com sucesso.",
    historicoCompras: historicoMega,
    mensagensWhatsApp: [
      { remetente: "atendente", texto: "Eduardo, conciliei o lote de março, tudo batendo.", horario: "09:30" },
      { remetente: "cliente", texto: "Perfeito, obrigado pelo cuidado!", horario: "10:05" },
    ],
    anexos: [],
  },

  // ===== Super Baby Store (c11) =====
  {
    id: "t-011",
    setor: "logistica",
    statusColunaId: "log-sep",
    clienteId: "c11",
    clienteNome: "Juliana Mendes",
    empresa: "Super Baby Store",
    whatsapp: "(21) 99555-9999",
    tipo: "pedido",
    prioridade: "urgente",
    origem: "whatsapp",
    responsavelId: "a-log2",
    dataAbertura: "11/04/2026 15:20",
    ultimaAtividade: "há 6 h",
    proximaAcao: "Acelerar separação no CD",
    descricao: "Cliente pediu antecipação da entrega para garantir loja aberta no feriado.",
    historicoCompras: historicoSuper,
    mensagensWhatsApp: [
      { remetente: "cliente", texto: "Consegue antecipar a entrega para quinta? Temos feriado.", horario: "15:20" },
      { remetente: "atendente", texto: "Vou priorizar a separação aqui no CD.", horario: "15:35" },
    ],
    anexos: [],
  },
  {
    id: "t-012",
    setor: "cobranca",
    statusColunaId: "cob-pago",
    clienteId: "c11",
    clienteNome: "Juliana Mendes",
    empresa: "Super Baby Store",
    whatsapp: "(21) 99555-9999",
    tipo: "cobranca",
    prioridade: "baixa",
    origem: "manual",
    responsavelId: "a-cob1",
    dataAbertura: "30/03/2026 10:00",
    ultimaAtividade: "há 2 semanas",
    proximaAcao: "Arquivar ticket",
    descricao: "Duplicata quitada normalmente.",
    historicoCompras: historicoSuper,
    mensagensWhatsApp: [
      { remetente: "atendente", texto: "Confirmamos o pagamento, obrigado!", horario: "10:00" },
    ],
    anexos: [],
  },

  // ===== Pimpolho Modas (c8) =====
  {
    id: "t-013",
    setor: "sac",
    statusColunaId: "sac-atend",
    clienteId: "c8",
    clienteNome: "Sandra Oliveira",
    empresa: "Pimpolho Modas",
    whatsapp: "(48) 99888-5555",
    tipo: "duvida",
    prioridade: "normal",
    origem: "whatsapp",
    responsavelId: "a-sac1",
    dataAbertura: "11/04/2026 17:40",
    ultimaAtividade: "há 1 dia",
    proximaAcao: "Enviar catálogo digital",
    descricao: "Cliente nova quer entender mix de produtos antes do primeiro pedido.",
    historicoCompras: [],
    mensagensWhatsApp: [
      { remetente: "cliente", texto: "Oi! Vocês têm catálogo digital pra eu olhar com calma?", horario: "17:40" },
      { remetente: "atendente", texto: "Tenho sim Sandra! Já te envio.", horario: "17:55" },
    ],
    anexos: [],
  },

  // ===== Boutique da Thay (c1) =====
  {
    id: "t-014",
    setor: "financeiro",
    statusColunaId: "fin-anal",
    clienteId: "c1",
    clienteNome: "Thay Almeida",
    empresa: "Boutique da Thay",
    whatsapp: "(47) 99901-1234",
    tipo: "financeiro",
    prioridade: "normal",
    origem: "whatsapp",
    responsavelId: "a-fin1",
    dataAbertura: "10/04/2026 14:00",
    ultimaAtividade: "há 2 dias",
    proximaAcao: "Analisar limite de crédito",
    descricao: "Cliente solicitou aumento de limite para fechar pedido maior.",
    historicoCompras: [
      { data: "05/04/2026", valor: 21500, produto: "Coleção inverno" },
      { data: "10/02/2026", valor: 16800, produto: "Reposição básicos" },
      { data: "20/12/2025", valor: 9400, produto: "Festas fim de ano" },
    ],
    mensagensWhatsApp: [
      { remetente: "cliente", texto: "Bom dia! Consigo aumentar meu limite para R$ 40k?", horario: "14:00" },
      { remetente: "atendente", texto: "Vou analisar com a credit aqui e te respondo.", horario: "14:15" },
    ],
    anexos: [],
  },
  {
    id: "t-015",
    setor: "logistica",
    statusColunaId: "log-dev",
    clienteId: "c1",
    clienteNome: "Thay Almeida",
    empresa: "Boutique da Thay",
    whatsapp: "(47) 99901-1234",
    tipo: "troca",
    prioridade: "urgente",
    origem: "whatsapp",
    responsavelId: "a-log1",
    dataAbertura: "09/04/2026 09:50",
    ultimaAtividade: "ontem",
    proximaAcao: "Confirmar retirada da devolução",
    descricao: "Cliente devolveu lote por divergência na grade. Aguardando coleta da transportadora.",
    historicoCompras: [
      { data: "05/04/2026", valor: 21500, produto: "Coleção inverno" },
    ],
    mensagensWhatsApp: [
      { remetente: "cliente", texto: "Veio fora da grade combinada, vou devolver.", horario: "09:50" },
      { remetente: "atendente", texto: "Sinto muito Thay! Já agendei a coleta.", horario: "10:20" },
    ],
    anexos: [],
  },

  // ===== DBN Outlet (c6) =====
  {
    id: "t-016",
    setor: "cobranca",
    statusColunaId: "cob-perd",
    clienteId: "c6",
    clienteNome: "Marcos Brandt",
    empresa: "DBN OUTLET",
    whatsapp: "(47) 99903-9999",
    tipo: "cobranca",
    prioridade: "baixa",
    origem: "manual",
    responsavelId: "a-cob2",
    dataAbertura: "20/03/2026 08:30",
    ultimaAtividade: "há 3 semanas",
    proximaAcao: "Encaminhar para jurídico",
    descricao: "Cliente não responde tentativas de negociação. Encerrando como perda.",
    historicoCompras: [
      { data: "10/01/2026", valor: 4200, produto: "Outlet adulto" },
    ],
    mensagensWhatsApp: [
      { remetente: "atendente", texto: "Marcos, conseguimos conversar sobre a duplicata?", horario: "08:30" },
    ],
    anexos: [],
  },
];

// ===== localStorage helpers =====

const TICKETS_KEY = "nextil_atendimento_tickets";
const FUNIS_KEY = "nextil_atendimento_funis";
const USER_KEY = "nextil_atendimento_user_id";

export function loadTickets(): Ticket[] {
  if (typeof window === "undefined") return mockTickets;
  try {
    const raw = localStorage.getItem(TICKETS_KEY);
    if (!raw) return mockTickets;
    return JSON.parse(raw) as Ticket[];
  } catch {
    return mockTickets;
  }
}

export function saveTickets(tickets: Ticket[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets));
}

export function loadFunis(): FunilSetor[] {
  if (typeof window === "undefined") return defaultFunis;
  try {
    const raw = localStorage.getItem(FUNIS_KEY);
    if (!raw) return defaultFunis;
    return JSON.parse(raw) as FunilSetor[];
  } catch {
    return defaultFunis;
  }
}

export function saveFunis(funis: FunilSetor[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(FUNIS_KEY, JSON.stringify(funis));
}

export function loadCurrentUserId(): string {
  if (typeof window === "undefined") return "a-sup";
  return localStorage.getItem(USER_KEY) || "a-sup";
}

export function saveCurrentUserId(id: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_KEY, id);
}

export function getCurrentAtendente(): Atendente {
  const id = loadCurrentUserId();
  return mockAtendentes.find(a => a.id === id) || mockAtendentes[0];
}

export function visibleSetores(atendente: Atendente): Setor[] {
  if (atendente.role === "supervisor") return ["sac", "cobranca", "financeiro", "logistica"];
  return atendente.setores;
}
