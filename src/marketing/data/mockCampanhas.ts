// Mock de campanhas próprias do módulo Marketing (WhatsApp Cloud API + Mailchimp)
// Inclui A/B testing, segmentação e métricas detalhadas por envio.

export type CanalCampanha = "whatsapp" | "email";
export type StatusCampanha = "rascunho" | "agendada" | "enviando" | "concluida" | "pausada" | "erro";
export type ObjetivoCampanha =
  | "lancamento"
  | "reativacao"
  | "promocao"
  | "lookbook"
  | "boas_vindas"
  | "carrinho_abandonado"
  | "pos_venda";

export interface SegmentoAudiencia {
  id: string;
  nome: string;
  descricao: string;
  totalContatos: number;
  filtros: { label: string; value: string }[];
}

export interface VarianteAB {
  id: "A" | "B";
  nome: string;
  assunto?: string;          // email
  preview?: string;          // email
  template?: string;         // whatsapp template name
  conteudo: string;          // corpo
  imagemUrl?: string;
  cta?: string;
  ctaUrl?: string;
  enviados: number;
  entregues: number;
  abertos: number;            // email open / wpp read
  cliques: number;
  respostas: number;          // wpp reply
  conversoes: number;         // leads gerados
  receitaAtribuida: number;   // R$
  optouSair: number;          // unsubscribe / block
}

export interface EnvioRegistro {
  id: string;
  contatoNome: string;
  contatoCanal: string;       // telefone ou email
  variante: "A" | "B";
  status: "entregue" | "lido" | "respondeu" | "clicou" | "converteu" | "erro" | "pendente";
  data: string;
  erro?: string;
}

export interface Campanha {
  id: string;
  nome: string;
  canal: CanalCampanha;
  objetivo: ObjetivoCampanha;
  status: StatusCampanha;
  criadaEm: string;
  agendadaPara?: string;
  enviadaEm?: string;
  segmentoId: string;
  segmentoNome: string;
  totalDestinatarios: number;
  abTeste: boolean;
  divisaoAB?: { A: number; B: number; criterioVencedor: "abertura" | "clique" | "conversao" }; // %
  variantes: VarianteAB[];
  tags: string[];
  responsavel: string;
  custoEstimado: number;     // R$ — apenas WhatsApp tem custo por envio
  integracaoId: "int_wpp" | "int_mailchimp";
}

// ===== Segmentos pré-definidos =====
export const mockSegmentos: SegmentoAudiencia[] = [
  {
    id: "seg_lojistas_sp",
    nome: "Lojistas SP — ativos",
    descricao: "Compraram nos últimos 90 dias na região SP",
    totalContatos: 842,
    filtros: [
      { label: "Estado", value: "SP" },
      { label: "Última compra", value: "≤ 90 dias" },
      { label: "Status", value: "Ativo" },
    ],
  },
  {
    id: "seg_carteira_fria",
    nome: "Carteira fria — sem compra 180d",
    descricao: "Clientes inativos elegíveis para reativação",
    totalContatos: 1276,
    filtros: [
      { label: "Última compra", value: "> 180 dias" },
      { label: "Histórico", value: "≥ 1 pedido" },
    ],
  },
  {
    id: "seg_alto_potencial",
    nome: "Alto potencial — VIP",
    descricao: "Top 20% em ticket médio",
    totalContatos: 184,
    filtros: [
      { label: "Tag", value: "alto_potencial" },
      { label: "Ticket médio", value: "> R$ 8.000" },
    ],
  },
  {
    id: "seg_infantil",
    nome: "Compradores Linha Infantil",
    descricao: "Já compraram pelo menos 1 peça infantil",
    totalContatos: 532,
    filtros: [
      { label: "Categoria", value: "Infantil" },
      { label: "Status", value: "Ativo" },
    ],
  },
  {
    id: "seg_lookbook_outono",
    nome: "Visualizou Lookbook Outono",
    descricao: "Engajou com o lookbook nos últimos 30 dias",
    totalContatos: 318,
    filtros: [
      { label: "Evento", value: "lookbook_view" },
      { label: "Período", value: "≤ 30 dias" },
    ],
  },
  {
    id: "seg_carrinho_abandonado",
    nome: "Grade montada sem fechamento",
    descricao: "Iniciaram montagem de grade e não fecharam pedido em 7 dias",
    totalContatos: 96,
    filtros: [
      { label: "Evento", value: "AddToCart" },
      { label: "Sem Purchase", value: "≥ 7 dias" },
    ],
  },
];

// ===== Templates pré-aprovados WhatsApp Cloud API =====
export const mockTemplatesWpp = [
  { id: "wpp_lancamento", nome: "lancamento_colecao", categoria: "MARKETING", idiomas: ["pt_BR"], aprovado: true },
  { id: "wpp_reativacao", nome: "reativacao_oferta", categoria: "MARKETING", idiomas: ["pt_BR"], aprovado: true },
  { id: "wpp_lookbook", nome: "lookbook_share", categoria: "MARKETING", idiomas: ["pt_BR"], aprovado: true },
  { id: "wpp_carrinho", nome: "grade_pendente", categoria: "UTILITY", idiomas: ["pt_BR"], aprovado: true },
  { id: "wpp_pos_venda", nome: "pedido_confirmado_v2", categoria: "UTILITY", idiomas: ["pt_BR"], aprovado: true },
];

export const mockTemplatesEmail = [
  { id: "em_news", nome: "Newsletter padrão", thumb: "📰" },
  { id: "em_promo", nome: "Promoção destaque", thumb: "🔥" },
  { id: "em_lookbook", nome: "Lookbook galeria", thumb: "🖼️" },
  { id: "em_lancamento", nome: "Lançamento hero", thumb: "✨" },
];

// ===== Helpers =====
function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function buildVariante(
  canal: CanalCampanha,
  id: "A" | "B",
  conteudo: string,
  enviados: number,
  taxas: { entrega: number; abertura: number; clique: number; resposta: number; conv: number; saida: number },
  ticketMedio = 4500,
  imagemUrl?: string,
  assunto?: string,
  template?: string,
  cta?: string,
): VarianteAB {
  const entregues = Math.round(enviados * taxas.entrega);
  const abertos = Math.round(entregues * taxas.abertura);
  const cliques = Math.round(abertos * taxas.clique);
  const respostas = canal === "whatsapp" ? Math.round(abertos * taxas.resposta) : 0;
  const conversoes = Math.round((cliques + respostas) * taxas.conv);
  const receitaAtribuida = conversoes * ticketMedio;
  const optouSair = Math.round(entregues * taxas.saida);
  return {
    id,
    nome: id === "A" ? "Variante A" : "Variante B",
    assunto, preview: assunto ? assunto.slice(0, 60) : undefined,
    template, conteudo, imagemUrl, cta,
    ctaUrl: cta ? "https://nextil.app/lookbook/outono" : undefined,
    enviados, entregues, abertos, cliques, respostas, conversoes, receitaAtribuida, optouSair,
  };
}

// ===== Campanhas =====
export const mockCampanhas: Campanha[] = [
  {
    id: "camp_001",
    nome: "Lançamento Outono Inverno 2026",
    canal: "whatsapp",
    objetivo: "lancamento",
    status: "concluida",
    criadaEm: "01/04/2026",
    enviadaEm: "05/04/2026 09:00",
    segmentoId: "seg_lojistas_sp",
    segmentoNome: "Lojistas SP — ativos",
    totalDestinatarios: 842,
    abTeste: true,
    divisaoAB: { A: 50, B: 50, criterioVencedor: "conversao" },
    variantes: [
      buildVariante("whatsapp", "A",
        "Olá {{nome}}! 🍂 Acabou de chegar a coleção Outono Inverno 2026. Conheça as novidades antes de todos.",
        421, { entrega: 0.97, abertura: 0.82, clique: 0.31, resposta: 0.18, conv: 0.22, saida: 0.005 },
        4800, undefined, undefined, "lancamento_colecao", "Ver coleção"),
      buildVariante("whatsapp", "B",
        "{{nome}}, sua nova coleção chegou! 🔥 Tons quentes, alfaiataria leve e os hits do inverno aguardam você.",
        421, { entrega: 0.97, abertura: 0.85, clique: 0.36, resposta: 0.21, conv: 0.27, saida: 0.004 },
        4800, undefined, undefined, "lancamento_colecao", "Ver coleção"),
    ],
    tags: ["lançamento", "alta prioridade"],
    responsavel: "Ana Marketing",
    custoEstimado: 50.52,
    integracaoId: "int_wpp",
  },
  {
    id: "camp_002",
    nome: "Reativação Carteira Fria — Q2",
    canal: "email",
    objetivo: "reativacao",
    status: "concluida",
    criadaEm: "20/03/2026",
    enviadaEm: "02/04/2026 14:00",
    segmentoId: "seg_carteira_fria",
    segmentoNome: "Carteira fria — sem compra 180d",
    totalDestinatarios: 1276,
    abTeste: true,
    divisaoAB: { A: 50, B: 50, criterioVencedor: "abertura" },
    variantes: [
      buildVariante("email", "A",
        "Sentimos sua falta. Veja o que preparamos: peças exclusivas com condições especiais para parceiros antigos.",
        638, { entrega: 0.95, abertura: 0.24, clique: 0.18, resposta: 0, conv: 0.08, saida: 0.012 },
        3800, undefined, "Há 6 meses sem novidades suas..."),
      buildVariante("email", "B",
        "10% extra na primeira compra de retorno + frete grátis. Apenas até domingo.",
        638, { entrega: 0.95, abertura: 0.31, clique: 0.22, resposta: 0, conv: 0.11, saida: 0.018 },
        3800, undefined, "🎁 Voltou? Ganhe 10% extra agora"),
    ],
    tags: ["reativação", "promocional"],
    responsavel: "Bruno CRM",
    custoEstimado: 0,
    integracaoId: "int_mailchimp",
  },
  {
    id: "camp_003",
    nome: "Lookbook Outono — VIPs",
    canal: "whatsapp",
    objetivo: "lookbook",
    status: "enviando",
    criadaEm: "10/04/2026",
    enviadaEm: "14/04/2026 11:30",
    segmentoId: "seg_alto_potencial",
    segmentoNome: "Alto potencial — VIP",
    totalDestinatarios: 184,
    abTeste: false,
    variantes: [
      buildVariante("whatsapp", "A",
        "{{nome}}, separei pessoalmente este lookbook para você. Confira em primeira mão 👇",
        128, { entrega: 0.98, abertura: 0.91, clique: 0.48, resposta: 0.32, conv: 0.34, saida: 0.0 },
        9200, undefined, undefined, "lookbook_share", "Abrir lookbook"),
    ],
    tags: ["VIP", "lookbook"],
    responsavel: "Ana Marketing",
    custoEstimado: 11.04,
    integracaoId: "int_wpp",
  },
  {
    id: "camp_004",
    nome: "Recuperação Grade Pendente",
    canal: "whatsapp",
    objetivo: "carrinho_abandonado",
    status: "agendada",
    criadaEm: "12/04/2026",
    agendadaPara: "16/04/2026 10:00",
    segmentoId: "seg_carrinho_abandonado",
    segmentoNome: "Grade montada sem fechamento",
    totalDestinatarios: 96,
    abTeste: true,
    divisaoAB: { A: 50, B: 50, criterioVencedor: "conversao" },
    variantes: [
      buildVariante("whatsapp", "A",
        "Vi que você montou uma grade e ela está te esperando. Posso ajudar a fechar?",
        0, { entrega: 0, abertura: 0, clique: 0, resposta: 0, conv: 0, saida: 0 }, 5200,
        undefined, undefined, "grade_pendente", "Retomar grade"),
      buildVariante("whatsapp", "B",
        "Sua grade ficou guardada! Posso travar o estoque + 5% off se fechar até amanhã 😉",
        0, { entrega: 0, abertura: 0, clique: 0, resposta: 0, conv: 0, saida: 0 }, 5200,
        undefined, undefined, "grade_pendente", "Fechar com desconto"),
    ],
    tags: ["recuperação", "automação"],
    responsavel: "Ana Marketing",
    custoEstimado: 5.76,
    integracaoId: "int_wpp",
  },
  {
    id: "camp_005",
    nome: "Newsletter — Linha Infantil Abril",
    canal: "email",
    objetivo: "promocao",
    status: "concluida",
    criadaEm: "28/03/2026",
    enviadaEm: "01/04/2026 09:00",
    segmentoId: "seg_infantil",
    segmentoNome: "Compradores Linha Infantil",
    totalDestinatarios: 532,
    abTeste: false,
    variantes: [
      buildVariante("email", "A",
        "Confira os 12 modelos mais vendidos da Linha Infantil neste mês, com grade ágil para o Dia das Mães.",
        532, { entrega: 0.96, abertura: 0.28, clique: 0.19, resposta: 0, conv: 0.09, saida: 0.008 },
        3200, undefined, "Top 12 da Linha Infantil em Abril"),
    ],
    tags: ["newsletter", "infantil"],
    responsavel: "Bruno CRM",
    custoEstimado: 0,
    integracaoId: "int_mailchimp",
  },
  {
    id: "camp_006",
    nome: "Pré-cadastro Fashion Week",
    canal: "whatsapp",
    objetivo: "lancamento",
    status: "rascunho",
    criadaEm: "13/04/2026",
    segmentoId: "seg_alto_potencial",
    segmentoNome: "Alto potencial — VIP",
    totalDestinatarios: 184,
    abTeste: false,
    variantes: [
      buildVariante("whatsapp", "A",
        "Convite exclusivo para o pré-show da nossa Fashion Week 2026. Garante a sua poltrona?",
        0, { entrega: 0, abertura: 0, clique: 0, resposta: 0, conv: 0, saida: 0 }, 0,
        undefined, undefined, "lancamento_colecao", "Reservar poltrona"),
    ],
    tags: ["evento", "VIP"],
    responsavel: "Ana Marketing",
    custoEstimado: 11.04,
    integracaoId: "int_wpp",
  },
  {
    id: "camp_007",
    nome: "Pós-venda — NPS Outono",
    canal: "email",
    objetivo: "pos_venda",
    status: "concluida",
    criadaEm: "10/03/2026",
    enviadaEm: "15/03/2026 10:00",
    segmentoId: "seg_lojistas_sp",
    segmentoNome: "Lojistas SP — ativos",
    totalDestinatarios: 412,
    abTeste: false,
    variantes: [
      buildVariante("email", "A",
        "Sua opinião vale muito! Avalie sua última compra em 30 segundos.",
        412, { entrega: 0.97, abertura: 0.42, clique: 0.31, resposta: 0, conv: 0, saida: 0.003 },
        0, undefined, "Como foi sua experiência com a coleção?"),
    ],
    tags: ["NPS", "relacionamento"],
    responsavel: "Bruno CRM",
    custoEstimado: 0,
    integracaoId: "int_mailchimp",
  },
];

// ===== Registros simulados de envio (para a aba "Envios" do detalhe) =====
const nomesContato = ["Mariana Silva", "Pedro Costa", "Joana Lima", "Carlos Andrade", "Beatriz Souza", "Rafael Mendes", "Larissa Pinto", "Felipe Oliveira", "Camila Reis", "André Barbosa", "Patrícia Gomes", "Lucas Ferreira"];
const statusList: EnvioRegistro["status"][] = ["entregue", "lido", "lido", "clicou", "respondeu", "converteu", "entregue", "lido", "clicou", "pendente", "erro", "lido"];

export function gerarEnviosMock(campanha: Campanha, qtd = 24): EnvioRegistro[] {
  const out: EnvioRegistro[] = [];
  for (let i = 0; i < qtd; i++) {
    const variante: "A" | "B" = campanha.abTeste ? (i % 2 === 0 ? "A" : "B") : "A";
    const contato = nomesContato[i % nomesContato.length];
    const status = campanha.status === "agendada" || campanha.status === "rascunho" ? "pendente" : statusList[i % statusList.length];
    out.push({
      id: `env_${campanha.id}_${i}`,
      contatoNome: contato,
      contatoCanal: campanha.canal === "whatsapp"
        ? `+55 11 9${rand(1000, 9999)}-${rand(1000, 9999)}`
        : `${contato.toLowerCase().replace(/ /g, ".")}@${["loja", "modas", "boutique"][i % 3]}.com.br`,
      variante,
      status,
      data: campanha.enviadaEm || campanha.agendadaPara || "—",
      erro: status === "erro" ? "Número não encontrado no WhatsApp" : undefined,
    });
  }
  return out;
}

// Agregadores
export function totaisCampanha(c: Campanha) {
  return c.variantes.reduce(
    (acc, v) => ({
      enviados: acc.enviados + v.enviados,
      entregues: acc.entregues + v.entregues,
      abertos: acc.abertos + v.abertos,
      cliques: acc.cliques + v.cliques,
      respostas: acc.respostas + v.respostas,
      conversoes: acc.conversoes + v.conversoes,
      receitaAtribuida: acc.receitaAtribuida + v.receitaAtribuida,
      optouSair: acc.optouSair + v.optouSair,
    }),
    { enviados: 0, entregues: 0, abertos: 0, cliques: 0, respostas: 0, conversoes: 0, receitaAtribuida: 0, optouSair: 0 },
  );
}

export const objetivoLabels: Record<ObjetivoCampanha, string> = {
  lancamento: "Lançamento",
  reativacao: "Reativação",
  promocao: "Promoção",
  lookbook: "Lookbook",
  boas_vindas: "Boas-vindas",
  carrinho_abandonado: "Carrinho abandonado",
  pos_venda: "Pós-venda",
};

export const statusLabels: Record<StatusCampanha, { label: string; color: string }> = {
  rascunho: { label: "Rascunho", color: "bg-muted text-muted-foreground" },
  agendada: { label: "Agendada", color: "bg-sky-500/10 text-sky-600" },
  enviando: { label: "Enviando", color: "bg-amber-500/10 text-amber-600" },
  concluida: { label: "Concluída", color: "bg-emerald-500/10 text-emerald-600" },
  pausada: { label: "Pausada", color: "bg-slate-500/10 text-slate-600" },
  erro: { label: "Erro", color: "bg-rose-500/10 text-rose-600" },
};
