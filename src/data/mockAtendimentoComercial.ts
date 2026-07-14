// Mock do módulo Atendimento Comercial — Kanban vinculado ao WhatsApp
// Cards fluem de "Leads" até "Gerou Oportunidade" ou "Perdido".

export type TagCard = "lead" | "reativacao" | "carteira";
export type OrigemLead = "meta_ads" | "instagram" | "whats_central" | "whats_direto" | "manual";
export type StatusCard = "ativo" | "conflito" | "perdido";

export const tagLabels: Record<TagCard, string> = {
  lead: "Lead",
  reativacao: "Reativação",
  carteira: "Carteira",
};

export const tagDot: Record<TagCard, string> = {
  lead: "bg-sky-500",
  reativacao: "bg-amber-500",
  carteira: "bg-emerald-500",
};

export const tagBadge: Record<TagCard, string> = {
  lead: "bg-sky-100 text-sky-700 border-sky-200",
  reativacao: "bg-amber-100 text-amber-700 border-amber-200",
  carteira: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

export const origemLabels: Record<OrigemLead, string> = {
  meta_ads: "Meta Ads",
  instagram: "Instagram",
  whats_central: "Whats central",
  whats_direto: "Whats direto",
  manual: "Manual",
};


export interface ColunaAC {
  id: string;
  label: string;
  cor: string;
  ordem: number;
  // etapas obrigatórias (não podem ser removidas do funil)
  sistema?: boolean;
  // chave lógica (bloqueia pulos manuais)
  key?: "leads" | "fila" | "atendimento" | "cadastro" | "qualificacao" | "oportunidade" | "perdido";
}

export const defaultColunasAC: ColunaAC[] = [
  { id: "col-leads", key: "leads", label: "Leads", cor: "bg-slate-400", ordem: 1, sistema: true },
  { id: "col-fila", key: "fila", label: "Fila de Atendimento", cor: "bg-blue-500", ordem: 2, sistema: true },
  { id: "col-atend", key: "atendimento", label: "Em Atendimento", cor: "bg-indigo-500", ordem: 3, sistema: true },
  { id: "col-cad", key: "cadastro", label: "Em Cadastro", cor: "bg-violet-500", ordem: 4, sistema: true },
  { id: "col-qual", key: "qualificacao", label: "Em Qualificação", cor: "bg-fuchsia-500", ordem: 5, sistema: true },
  { id: "col-op", key: "oportunidade", label: "Gerou Oportunidade", cor: "bg-emerald-500", ordem: 6, sistema: true },
  { id: "col-perd", key: "perdido", label: "Perdido", cor: "bg-rose-500", ordem: 7, sistema: true },
];

export interface CadastroLead {
  nome?: string;
  cnpj?: string;
  cidade?: string;
  uf?: string;
  email?: string;
  instagram?: string;
}

export interface QualificacaoLead {
  nicho?: string;
  marcas?: string[];
  volume?: string;
  frequencia?: string;
  cidadePrincipal?: string;
  sazonalidade?: string;
}

export const motivosPerda = [
  "Sem resposta / sumiu",
  "Preço / condições comerciais",
  "Sem perfil / sem CNPJ",
  "Já compra de concorrente",
  "Pedido mínimo alto",
  "Não trabalha com as marcas do portfólio",
  "Prazo de entrega",
  "Forma de pagamento / crédito negado",
  "Fechou a loja / mudou de ramo",
  "Momento errado (retomar futuramente)",
  "Outros",
];

export interface CardAC {
  id: string;
  colunaId: string;
  nome: string;
  telefone: string;
  avatarIniciais: string;
  tag: TagCard;
  origem: OrigemLead;
  campanha?: string;
  vendedorId: string;
  vendedorNome: string;
  ultimaMensagem: string;
  ultimaInteracao: string; // ISO
  chegouEm: string; // ISO
  entradaColunaEm: string; // ISO
  naoLidas: number;
  valorEstimado?: number;
  conversaId?: string;
  clienteId?: string;
  cadastro: CadastroLead;
  qualificacao: QualificacaoLead;
  status: StatusCard;
  motivoPerda?: string;
  motivoPerdaTexto?: string;
  emConflitoCom?: string; // vendedorId conflitante
  historico: { at: string; msg: string }[];
}

// vendedores ativos (subset de mockAtendentes/mockRepresentantes)
export const mockVendedoresAC = [
  { id: "v-paulo", nome: "Paulo Bardini", iniciais: "PB", cor: "bg-indigo-500", pausado: false },
  { id: "v-marina", nome: "Marina Costa", iniciais: "MC", cor: "bg-blue-500", pausado: false },
  { id: "v-lucas", nome: "Lucas Pereira", iniciais: "LP", cor: "bg-sky-500", pausado: false },
  { id: "v-renata", nome: "Renata Lopes", iniciais: "RL", cor: "bg-rose-500", pausado: true },
];

// util
const iniciais = (nome: string) => nome.split(" ").slice(0, 2).map(n => n[0]?.toUpperCase() ?? "").join("");
const hoursAgo = (h: number) => new Date(Date.now() - h * 3600 * 1000).toISOString();
const daysAgo = (d: number) => new Date(Date.now() - d * 24 * 3600 * 1000).toISOString();

function mkCard(o: Partial<CardAC> & Pick<CardAC, "id" | "colunaId" | "nome" | "telefone" | "tag" | "origem" | "vendedorId">): CardAC {
  const v = mockVendedoresAC.find(x => x.id === o.vendedorId)!;
  return {
    avatarIniciais: iniciais(o.nome),
    vendedorNome: v.nome,
    ultimaMensagem: "",
    ultimaInteracao: hoursAgo(2),
    chegouEm: hoursAgo(2),
    entradaColunaEm: hoursAgo(2),
    naoLidas: 0,
    cadastro: {},
    qualificacao: {},
    status: "ativo",
    historico: [{ at: hoursAgo(2), msg: "Card criado" }],
    ...o,
  } as CardAC;
}

export const mockCardsACSeed: CardAC[] = [
  // Leads (5)
  mkCard({ id: "c1", colunaId: "col-leads", nome: "Loja Vintage Kids", telefone: "+55 11 98122-0011", tag: "lead", origem: "meta_ads", campanha: "OI26 · Prospect Multimarcas", vendedorId: "v-paulo",
    ultimaMensagem: "Vim pelo anúncio, tenho loja em SP", ultimaInteracao: hoursAgo(1), chegouEm: hoursAgo(1), entradaColunaEm: hoursAgo(1), naoLidas: 3 }),
  mkCard({ id: "c2", colunaId: "col-leads", nome: "Baby Chic Boutique", telefone: "+55 21 99880-3311", tag: "lead", origem: "meta_ads", campanha: "OI26 · Prospect Multimarcas", vendedorId: "v-marina",
    ultimaMensagem: "Olá, quero conhecer a linha infantil", ultimaInteracao: hoursAgo(3), chegouEm: hoursAgo(3), entradaColunaEm: hoursAgo(3), naoLidas: 1 }),
  mkCard({ id: "c3", colunaId: "col-leads", nome: "Mania Fashion Kids", telefone: "+55 41 98800-2211", tag: "lead", origem: "instagram", vendedorId: "v-lucas",
    ultimaMensagem: "Achei vocês pelo insta @nextil", ultimaInteracao: hoursAgo(5), chegouEm: hoursAgo(5), entradaColunaEm: hoursAgo(5), naoLidas: 2 }),
  mkCard({ id: "c4", colunaId: "col-leads", nome: "Confeitaria Kids Store", telefone: "+55 31 98800-9911", tag: "lead", origem: "manual", vendedorId: "v-paulo",
    ultimaMensagem: "Indicação — vendedor cadastrou", ultimaInteracao: hoursAgo(6), chegouEm: hoursAgo(6), entradaColunaEm: hoursAgo(6), naoLidas: 0 }),
  mkCard({ id: "c5", colunaId: "col-leads", nome: "Rainha das Crianças", telefone: "+55 62 99991-4400", tag: "lead", origem: "whats_central", vendedorId: "v-marina",
    ultimaMensagem: "Passou pelo whats central", ultimaInteracao: hoursAgo(8), chegouEm: hoursAgo(8), entradaColunaEm: hoursAgo(8), naoLidas: 1 }),

  // Fila (5) — cliente ainda não teve primeira resposta
  mkCard({ id: "c6", colunaId: "col-fila", nome: "Rei das Crianças", telefone: "+55 31 98765-0011", tag: "lead", origem: "meta_ads", campanha: "OI26 · Prospect Multimarcas", vendedorId: "v-paulo",
    ultimaMensagem: "Bom dia! Vi o catálogo…", ultimaInteracao: hoursAgo(6), chegouEm: hoursAgo(6), entradaColunaEm: hoursAgo(6), naoLidas: 2, conversaId: "conv2", clienteId: "c9" }),
  mkCard({ id: "c7", colunaId: "col-fila", nome: "Anjus Baby e Kids", telefone: "+55 31 99987-3300", tag: "reativacao", origem: "whats_central", vendedorId: "v-paulo",
    ultimaMensagem: "Olá, faz tempo que não conversamos. Tem novidades?", ultimaInteracao: hoursAgo(10), chegouEm: hoursAgo(10), entradaColunaEm: hoursAgo(10), naoLidas: 1, conversaId: "conv9", clienteId: "c13" }),
  mkCard({ id: "c8", colunaId: "col-fila", nome: "Boutique da Thay", telefone: "+55 41 99900-1122", tag: "carteira", origem: "whats_central", vendedorId: "v-paulo",
    ultimaMensagem: "Oi Paulo, vou passar novo pedido", ultimaInteracao: hoursAgo(3), chegouEm: hoursAgo(3), entradaColunaEm: hoursAgo(3), naoLidas: 0, conversaId: "conv1", clienteId: "c1" }),
  mkCard({ id: "c9", colunaId: "col-fila", nome: "Sonho de Criança", telefone: "+55 27 98800-1177", tag: "lead", origem: "meta_ads", campanha: "Retargeting Lookalike", vendedorId: "v-marina",
    ultimaMensagem: "Tenho loja há 2 anos, quero atacado", ultimaInteracao: hoursAgo(9), chegouEm: hoursAgo(9), entradaColunaEm: hoursAgo(9), naoLidas: 2 }),
  mkCard({ id: "c10", colunaId: "col-fila", nome: "Mundo Feliz", telefone: "+55 51 99700-2299", tag: "lead", origem: "instagram", vendedorId: "v-lucas",
    ultimaMensagem: "Trabalhar com vocês?", ultimaInteracao: hoursAgo(2), chegouEm: hoursAgo(2), entradaColunaEm: hoursAgo(2), naoLidas: 1 }),

  // Em Atendimento (5)
  mkCard({ id: "c11", colunaId: "col-atend", nome: "Milykids", telefone: "+55 47 98800-4411", tag: "lead", origem: "meta_ads", campanha: "OI26 · Prospect Multimarcas", vendedorId: "v-paulo",
    ultimaMensagem: "Paulo, sobre o orçamento…", ultimaInteracao: hoursAgo(24), chegouEm: daysAgo(3), entradaColunaEm: daysAgo(3), naoLidas: 1, conversaId: "conv3", clienteId: "c7" }),
  mkCard({ id: "c12", colunaId: "col-atend", nome: "Super Baby Store", telefone: "+55 11 97070-4488", tag: "lead", origem: "whats_central", vendedorId: "v-paulo",
    ultimaMensagem: "Pode me enviar o catálogo?", ultimaInteracao: hoursAgo(20), chegouEm: daysAgo(2), entradaColunaEm: daysAgo(2), naoLidas: 0, conversaId: "conv7", clienteId: "c11" }),
  mkCard({ id: "c13", colunaId: "col-atend", nome: "Estilo Kids", telefone: "+55 19 98122-6600", tag: "lead", origem: "meta_ads", campanha: "Coleção Verão · Awareness", vendedorId: "v-marina",
    ultimaMensagem: "Vou pensar e retorno", ultimaInteracao: hoursAgo(50), chegouEm: daysAgo(5), entradaColunaEm: daysAgo(5), naoLidas: 0 }),
  mkCard({ id: "c14", colunaId: "col-atend", nome: "Pimpolho Modas", telefone: "+55 48 98700-4433", tag: "carteira", origem: "whats_central", vendedorId: "v-paulo",
    ultimaMensagem: "Boa tarde! Somos loja nova em Floripa", ultimaInteracao: hoursAgo(15), chegouEm: daysAgo(1), entradaColunaEm: daysAgo(1), naoLidas: 0, conversaId: "conv6", clienteId: "c8" }),
  mkCard({ id: "c15", colunaId: "col-atend", nome: "TotKids Store", telefone: "+55 84 99800-5522", tag: "lead", origem: "instagram", vendedorId: "v-lucas",
    ultimaMensagem: "Vamos conversar", ultimaInteracao: hoursAgo(30), chegouEm: daysAgo(2), entradaColunaEm: daysAgo(2), naoLidas: 0 }),

  // Em Cadastro (4)
  mkCard({ id: "c16", colunaId: "col-cad", nome: "Alemão Vestuário", telefone: "+55 51 98800-7788", tag: "lead", origem: "meta_ads", campanha: "OI26 · Prospect Multimarcas", vendedorId: "v-paulo",
    ultimaMensagem: "Aqui vai meu CNPJ: 22.333.444/0001-55", ultimaInteracao: hoursAgo(4), chegouEm: daysAgo(4), entradaColunaEm: hoursAgo(4), naoLidas: 0, conversaId: "conv5", clienteId: "c3",
    cadastro: { nome: "Alemão Vestuário LTDA", cnpj: "22.333.444/0001-55", cidade: "Porto Alegre", uf: "RS" } }),
  mkCard({ id: "c17", colunaId: "col-cad", nome: "CJD Pozza", telefone: "+55 41 99900-1188", tag: "lead", origem: "whats_central", vendedorId: "v-paulo",
    ultimaMensagem: "Pedido confirmado! Obrigado", ultimaInteracao: hoursAgo(12), chegouEm: daysAgo(6), entradaColunaEm: daysAgo(1), naoLidas: 0, conversaId: "conv8", clienteId: "c5",
    cadastro: { nome: "CJD Pozza ME", cnpj: "11.222.333/0001-44" } }),
  mkCard({ id: "c18", colunaId: "col-cad", nome: "Kids Elegantes", telefone: "+55 71 98800-9922", tag: "lead", origem: "meta_ads", campanha: "Coleção Verão · Awareness", vendedorId: "v-marina",
    ultimaMensagem: "Pode anotar o e-mail", ultimaInteracao: hoursAgo(3), chegouEm: daysAgo(3), entradaColunaEm: hoursAgo(3), naoLidas: 1, cadastro: { nome: "Kids Elegantes", cnpj: "33.444.555/0001-66", cidade: "Salvador", uf: "BA" } }),
  mkCard({ id: "c19", colunaId: "col-cad", nome: "Fofurinhas Baby", telefone: "+55 81 97070-3311", tag: "reativacao", origem: "whats_central", vendedorId: "v-lucas",
    ultimaMensagem: "Voltamos após 8 meses parados", ultimaInteracao: hoursAgo(6), chegouEm: daysAgo(2), entradaColunaEm: hoursAgo(6), naoLidas: 0, cadastro: { nome: "Fofurinhas Baby", cnpj: "44.555.666/0001-77" } }),

  // Em Qualificação (3)
  mkCard({ id: "c20", colunaId: "col-qual", nome: "Mega Atacado Infantil", telefone: "+55 62 98800-4433", tag: "lead", origem: "meta_ads", campanha: "OI26 · Prospect Multimarcas", vendedorId: "v-paulo",
    ultimaMensagem: "Perfeito! Vamos marcar reunião", ultimaInteracao: hoursAgo(6), chegouEm: daysAgo(8), entradaColunaEm: daysAgo(1), naoLidas: 0, valorEstimado: 45000, conversaId: "conv4", clienteId: "c4",
    cadastro: { nome: "Mega Atacado Infantil LTDA", cnpj: "55.666.777/0001-88", cidade: "Goiânia", uf: "GO", email: "compras@megaatacado.com.br", instagram: "@megaatacado" },
    qualificacao: { nicho: "Infantil", marcas: ["Brandili"], volume: "R$ 30k–50k/mês", frequencia: "Mensal" } }),
  mkCard({ id: "c21", colunaId: "col-qual", nome: "Baby Universe", telefone: "+55 21 97088-6633", tag: "lead", origem: "whats_central", vendedorId: "v-marina",
    ultimaMensagem: "Trabalhamos com 3 marcas hoje", ultimaInteracao: hoursAgo(12), chegouEm: daysAgo(6), entradaColunaEm: daysAgo(2), naoLidas: 0, valorEstimado: 22000,
    cadastro: { nome: "Baby Universe RJ", cnpj: "66.777.888/0001-99", cidade: "Rio de Janeiro", uf: "RJ", email: "contato@babyuniverse.com.br", instagram: "@babyuniverserj" },
    qualificacao: { nicho: "Infantil / Bebê", marcas: ["Brandili", "Milon"], volume: "R$ 15k–25k/mês" } }),
  mkCard({ id: "c22", colunaId: "col-qual", nome: "Casinha Fashion", telefone: "+55 85 99800-7722", tag: "carteira", origem: "whats_central", vendedorId: "v-paulo",
    ultimaMensagem: "Quero antecipar Alto Verão", ultimaInteracao: hoursAgo(4), chegouEm: daysAgo(3), entradaColunaEm: hoursAgo(4), naoLidas: 0, valorEstimado: 18500,
    cadastro: { nome: "Casinha Fashion", cnpj: "77.888.999/0001-11", cidade: "Fortaleza", uf: "CE", email: "compras@casinha.com" },
    qualificacao: { nicho: "Infantil", marcas: ["Brandili"], volume: "R$ 15k/mês", frequencia: "Coleção" } }),

  // Gerou Oportunidade (3)
  mkCard({ id: "c23", colunaId: "col-op", nome: "Boutique da Thay", telefone: "+55 41 99900-1122", tag: "carteira", origem: "whats_central", vendedorId: "v-paulo",
    ultimaMensagem: "Fechou! Aguardando NF", ultimaInteracao: hoursAgo(2), chegouEm: daysAgo(12), entradaColunaEm: hoursAgo(6), naoLidas: 0, valorEstimado: 32000, conversaId: "conv1", clienteId: "c1",
    cadastro: { nome: "Boutique da Thay", cnpj: "88.999.000/0001-22" }, qualificacao: { nicho: "Infantil" } }),
  mkCard({ id: "c24", colunaId: "col-op", nome: "Mundo Kids Premium", telefone: "+55 11 98800-5588", tag: "lead", origem: "meta_ads", campanha: "OI26 · Prospect Multimarcas", vendedorId: "v-marina",
    ultimaMensagem: "Grade fechada", ultimaInteracao: daysAgo(1), chegouEm: daysAgo(20), entradaColunaEm: daysAgo(2), naoLidas: 0, valorEstimado: 68000 }),
  mkCard({ id: "c25", colunaId: "col-op", nome: "Encanto Baby", telefone: "+55 51 97070-7799", tag: "lead", origem: "instagram", vendedorId: "v-lucas",
    ultimaMensagem: "Pedido enviado", ultimaInteracao: daysAgo(2), chegouEm: daysAgo(15), entradaColunaEm: daysAgo(3), naoLidas: 0, valorEstimado: 25000 }),

  // Perdido (2)
  mkCard({ id: "c26", colunaId: "col-perd", nome: "Só Baby", telefone: "+55 11 97077-8811", tag: "lead", origem: "meta_ads", vendedorId: "v-paulo",
    ultimaMensagem: "Vamos ficar com concorrente por ora", ultimaInteracao: daysAgo(5), chegouEm: daysAgo(20), entradaColunaEm: daysAgo(5), naoLidas: 0, status: "perdido",
    motivoPerda: "Já compra de concorrente" }),
  mkCard({ id: "c27", colunaId: "col-perd", nome: "Loja Miudinhos", telefone: "+55 31 98800-1120", tag: "lead", origem: "whats_central", vendedorId: "v-marina",
    ultimaMensagem: "Sumiu depois do primeiro contato", ultimaInteracao: daysAgo(10), chegouEm: daysAgo(25), entradaColunaEm: daysAgo(10), naoLidas: 0, status: "perdido",
    motivoPerda: "Sem resposta / sumiu" }),
];

// Inbox whats central — conversas ainda não distribuídas
export interface ConversaCentral {
  id: string;
  nome: string;
  telefone: string;
  origem: OrigemLead;
  campanha?: string;
  ultimaMensagem: string;
  chegouEm: string;
  historico: { at: string; from: "lead" | "central"; msg: string }[];
}

export const mockConversasCentral: ConversaCentral[] = [
  { id: "cc1", nome: "Loja Nova Prospect", telefone: "+55 11 98555-1111", origem: "meta_ads", campanha: "OI26 · Prospect Multimarcas", ultimaMensagem: "Oi! Tenho loja em São Paulo, quero conhecer.", chegouEm: hoursAgo(0.5), historico: [
    { at: hoursAgo(0.5), from: "lead", msg: "Oi! Tenho loja em São Paulo, quero conhecer." },
  ]},
  { id: "cc2", nome: "Menino & Menina Fashion", telefone: "+55 27 97777-2222", origem: "meta_ads", campanha: "Retargeting Lookalike", ultimaMensagem: "Vim pelo anúncio do reels. Faz atacado?", chegouEm: hoursAgo(1.2), historico: [
    { at: hoursAgo(1.2), from: "lead", msg: "Vim pelo anúncio do reels. Faz atacado?" },
    { at: hoursAgo(1.15), from: "central", msg: "Olá! Bem-vindo à Brandili. Vamos te direcionar a um consultor. Qual sua cidade?" },
    { at: hoursAgo(1.1), from: "lead", msg: "Vitória — ES." },
  ]},
  { id: "cc3", nome: "Nininho Kids", telefone: "+55 41 97555-3333", origem: "instagram", ultimaMensagem: "Vim pelo insta @nextil, quero atacado", chegouEm: hoursAgo(2), historico: [
    { at: hoursAgo(2), from: "lead", msg: "Vim pelo insta @nextil, quero atacado" },
  ]},
];

// motivos / perguntas padrão
export const perguntasQualificacaoDefault = [
  { key: "nicho", label: "Nicho" },
  { key: "marcas", label: "Marcas de interesse" },
  { key: "volume", label: "Volume/orçamento por coleção" },
  { key: "frequencia", label: "Frequência de compra" },
  { key: "cidadePrincipal", label: "Cidade principal de atuação" },
  { key: "sazonalidade", label: "Sazonalidade (verão/inverno)" },
];

// Persistência simples via localStorage
const LS_COLUNAS = "atendimento_comercial_colunas_v1";
const LS_CARDS = "atendimento_comercial_cards_v1";
const LS_CONFIG = "atendimento_comercial_config_v1";
const LS_INBOX = "atendimento_comercial_inbox_v1";
const LS_VENDEDORES = "atendimento_comercial_vendedores_v1";

export interface ConfigAtendimento {
  slaHoras: number; // primeira resposta
  diasEstagnado: number; // Em Atendimento
  motivosPerda: string[];
  perguntasQualificacao: { key: string; label: string }[];
}

export const defaultConfigAC: ConfigAtendimento = {
  slaHoras: 4,
  diasEstagnado: 2,
  motivosPerda,
  perguntasQualificacao: perguntasQualificacaoDefault,
};

export const loadColunasAC = (): ColunaAC[] => {
  try { const raw = localStorage.getItem(LS_COLUNAS); if (raw) return JSON.parse(raw); } catch {}
  return defaultColunasAC;
};
export const saveColunasAC = (c: ColunaAC[]) => localStorage.setItem(LS_COLUNAS, JSON.stringify(c));

export const loadCardsAC = (): CardAC[] => {
  try { const raw = localStorage.getItem(LS_CARDS); if (raw) return JSON.parse(raw); } catch {}
  return mockCardsACSeed;
};
export const saveCardsAC = (c: CardAC[]) => localStorage.setItem(LS_CARDS, JSON.stringify(c));

export const loadConfigAC = (): ConfigAtendimento => {
  try { const raw = localStorage.getItem(LS_CONFIG); if (raw) return { ...defaultConfigAC, ...JSON.parse(raw) }; } catch {}
  return defaultConfigAC;
};
export const saveConfigAC = (c: ConfigAtendimento) => localStorage.setItem(LS_CONFIG, JSON.stringify(c));

export const loadInboxAC = (): ConversaCentral[] => {
  try { const raw = localStorage.getItem(LS_INBOX); if (raw) return JSON.parse(raw); } catch {}
  return mockConversasCentral;
};
export const saveInboxAC = (c: ConversaCentral[]) => localStorage.setItem(LS_INBOX, JSON.stringify(c));

export const loadVendedoresAC = () => {
  try { const raw = localStorage.getItem(LS_VENDEDORES); if (raw) return JSON.parse(raw); } catch {}
  return mockVendedoresAC;
};
export const saveVendedoresAC = (v: typeof mockVendedoresAC) => localStorage.setItem(LS_VENDEDORES, JSON.stringify(v));

// utilidades
export function tempoAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = diff / (1000 * 3600);
  if (h < 1) return `${Math.max(1, Math.round(h * 60))}m`;
  if (h < 24) return `${Math.round(h)}h`;
  return `${Math.round(h / 24)}d`;
}

export function horasDesde(iso: string): number {
  return (Date.now() - new Date(iso).getTime()) / (1000 * 3600);
}

// Investimento mensal por campanha (usado para calcular CPL na página Leads & Atendimento).
// Somente campanhas pagas — origens orgânicas (whats_direto, whats_central, manual) ficam sem CPL.
export const investimentoPorCampanha: Record<string, number> = {
  "OI26 · Prospect Multimarcas": 12800,
  "Retargeting Lookalike": 4200,
  "Coleção Verão · Awareness": 6800,
};

// Investimento agregado por origem paga (fallback quando origem é paga mas sem campanha específica).
export const investimentoPorOrigem: Record<string, number> = {
  meta_ads: 23800,   // soma dos anúncios + boost
  instagram: 3200,   // impulsionamentos orgânicos
};

