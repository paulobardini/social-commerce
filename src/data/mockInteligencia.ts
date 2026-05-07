// Mock data for Nextil Inteligência de Mercado module
export type StatusInteligente =
  | "Produto estrela"
  | "Alto giro"
  | "Recompra sugerida"
  | "Risco de ruptura"
  | "Estoque parado"
  | "Margem em atenção"
  | "Boa margem"
  | "Performance neutra";

export type AcaoRecomendada =
  | "Recomprar"
  | "Recomprar urgente"
  | "Liquidar"
  | "Revisar preço"
  | "Reduzir desconto"
  | "Criar campanha"
  | "Monitorar";

export interface ProdutoIM {
  sku: string;
  nome: string;
  marca: string;
  colecao: string;
  categoria: string;
  fornecedor: string;
  imagem: string;
  precoCompra: number;
  precoVenda: number;
  markupSimples: number;
  markupCompleto: number;
  margem: number;
  comprado: number;
  vendido: number;
  estoque: number;
  sellThrough: number;
  diasEmEstoque: number;
  receita: number;
  lucroBruto: number;
  status: StatusInteligente;
  acao: AcaoRecomendada;
  score: number;
}

export const produtosIM: ProdutoIM[] = [
  {
    sku: "JQT-INF-042",
    nome: "Jaqueta Infantil Soft Touch",
    marca: "Brandili",
    colecao: "Inverno 2026",
    categoria: "Infantil",
    fornecedor: "Têxtil Aurora",
    imagem: "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=400",
    precoCompra: 58.9,
    precoVenda: 139.9,
    markupSimples: 2.37,
    markupCompleto: 1.91,
    margem: 47.6,
    comprado: 820,
    vendido: 672,
    estoque: 148,
    sellThrough: 82,
    diasEmEstoque: 21,
    receita: 94012,
    lucroBruto: 44750,
    status: "Produto estrela",
    acao: "Recomprar",
    score: 91,
  },
  {
    sku: "CAL-ADT-118",
    nome: "Calça Sarja Slim Adulto",
    marca: "Hering",
    colecao: "Essentials",
    categoria: "Adulto",
    fornecedor: "Cotton Prime",
    imagem: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400",
    precoCompra: 72.0,
    precoVenda: 149.9,
    markupSimples: 2.08,
    markupCompleto: 1.62,
    margem: 38.4,
    comprado: 600,
    vendido: 108,
    estoque: 492,
    sellThrough: 18,
    diasEmEstoque: 126,
    receita: 16189,
    lucroBruto: 6217,
    status: "Estoque parado",
    acao: "Liquidar",
    score: 38,
  },
  {
    sku: "VES-FEM-077",
    nome: "Vestido Floral Midi",
    marca: "Lunender",
    colecao: "Verão 2026",
    categoria: "Moda feminina",
    fornecedor: "Floratta Confecções",
    imagem: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400",
    precoCompra: 64.5,
    precoVenda: 169.9,
    markupSimples: 2.63,
    markupCompleto: 2.04,
    margem: 51.1,
    comprado: 420,
    vendido: 351,
    estoque: 69,
    sellThrough: 83.5,
    diasEmEstoque: 34,
    receita: 59634,
    lucroBruto: 30474,
    status: "Alto giro",
    acao: "Revisar preço",
    score: 88,
  },
  {
    sku: "MOL-INF-203",
    nome: "Moletom College Infantil",
    marca: "Kyly",
    colecao: "Inverno 2026",
    categoria: "Infantil",
    fornecedor: "Kids Wear Supply",
    imagem: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400",
    precoCompra: 49.9,
    precoVenda: 119.9,
    markupSimples: 2.4,
    markupCompleto: 1.78,
    margem: 28.4,
    comprado: 1200,
    vendido: 894,
    estoque: 306,
    sellThrough: 74.5,
    diasEmEstoque: 39,
    receita: 107190,
    lucroBruto: 30441,
    status: "Margem em atenção",
    acao: "Reduzir desconto",
    score: 64,
  },
  {
    sku: "CAM-MAS-088",
    nome: "Camisa Linho Resort",
    marca: "Malwee",
    colecao: "Alto Verão",
    categoria: "Casual",
    fornecedor: "Linho Brasil",
    imagem: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400",
    precoCompra: 82.0,
    precoVenda: 219.9,
    markupSimples: 2.68,
    markupCompleto: 2.12,
    margem: 53.8,
    comprado: 360,
    vendido: 214,
    estoque: 146,
    sellThrough: 59.4,
    diasEmEstoque: 48,
    receita: 47058,
    lucroBruto: 25317,
    status: "Boa margem",
    acao: "Criar campanha",
    score: 76,
  },
  {
    sku: "FIT-FEM-312",
    nome: "Conjunto Fitness Seamless",
    marca: "Colorittá",
    colecao: "Fitness 2026",
    categoria: "Fitness",
    fornecedor: "ActiveWear Pro",
    imagem: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=400",
    precoCompra: 96.0,
    precoVenda: 239.9,
    markupSimples: 2.49,
    markupCompleto: 1.97,
    margem: 49.2,
    comprado: 500,
    vendido: 462,
    estoque: 38,
    sellThrough: 92.4,
    diasEmEstoque: 18,
    receita: 110836,
    lucroBruto: 54531,
    status: "Risco de ruptura",
    acao: "Recomprar urgente",
    score: 94,
  },
  {
    sku: "BLZ-ADT-054",
    nome: "Blazer Alfaiataria Moderna",
    marca: "Hering",
    colecao: "Executivo 2026",
    categoria: "Alfaiataria",
    fornecedor: "Tailor Group",
    imagem: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400",
    precoCompra: 138.0,
    precoVenda: 329.9,
    markupSimples: 2.39,
    markupCompleto: 1.83,
    margem: 44.1,
    comprado: 280,
    vendido: 126,
    estoque: 154,
    sellThrough: 45,
    diasEmEstoque: 71,
    receita: 41567,
    lucroBruto: 18331,
    status: "Performance neutra",
    acao: "Monitorar",
    score: 58,
  },
  {
    sku: "TRI-FEM-166",
    nome: "Blusa Tricot Premium",
    marca: "Elian",
    colecao: "Inverno 2026",
    categoria: "Moda feminina",
    fornecedor: "Tricot Sul",
    imagem: "https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?w=400",
    precoCompra: 74.9,
    precoVenda: 189.9,
    markupSimples: 2.53,
    markupCompleto: 1.96,
    margem: 50.2,
    comprado: 700,
    vendido: 602,
    estoque: 98,
    sellThrough: 86,
    diasEmEstoque: 29,
    receita: 114319,
    lucroBruto: 57368,
    status: "Recompra sugerida",
    acao: "Recomprar",
    score: 89,
  },
];

export const fornecedoresIM = [
  {
    nome: "Têxtil Aurora",
    receita: 248000,
    comprado: 1620,
    vendido: 1310,
    sellThrough: 81,
    margem: 47.2,
    markupSimples: 2.37,
    markupCompleto: 1.89,
    diasEmEstoque: 26,
    estrelas: 3,
    parados: 0,
    status: "Forte desempenho",
    recomendacao: "Ampliar compra",
  },
  {
    nome: "Cotton Prime",
    receita: 138000,
    comprado: 980,
    vendido: 333,
    sellThrough: 34,
    margem: 35.8,
    markupSimples: 2.08,
    markupCompleto: 1.55,
    diasEmEstoque: 118,
    estrelas: 0,
    parados: 4,
    status: "Atenção",
    recomendacao: "Renegociar custo",
  },
  {
    nome: "ActiveWear Pro",
    receita: 312000,
    comprado: 980,
    vendido: 862,
    sellThrough: 88,
    margem: 49.7,
    markupSimples: 2.49,
    markupCompleto: 1.97,
    diasEmEstoque: 22,
    estrelas: 4,
    parados: 0,
    status: "Alta performance",
    recomendacao: "Recomprar",
  },
  {
    nome: "Tricot Sul",
    receita: 226000,
    comprado: 1340,
    vendido: 1058,
    sellThrough: 79,
    margem: 50.2,
    markupSimples: 2.53,
    markupCompleto: 1.96,
    diasEmEstoque: 31,
    estrelas: 2,
    parados: 1,
    status: "Boa rentabilidade",
    recomendacao: "Manter fornecedor",
  },
  {
    nome: "Floratta Confecções",
    receita: 168000,
    comprado: 720,
    vendido: 612,
    sellThrough: 85,
    margem: 51.1,
    markupSimples: 2.63,
    markupCompleto: 2.04,
    diasEmEstoque: 28,
    estrelas: 2,
    parados: 0,
    status: "Forte desempenho",
    recomendacao: "Ampliar compra",
  },
  {
    nome: "Linho Brasil",
    receita: 92000,
    comprado: 540,
    vendido: 318,
    sellThrough: 59,
    margem: 53.8,
    markupSimples: 2.68,
    markupCompleto: 2.12,
    diasEmEstoque: 52,
    estrelas: 1,
    parados: 1,
    status: "Boa margem",
    recomendacao: "Criar campanha",
  },
];

export const colecoesIM = [
  {
    nome: "Inverno 2026",
    receita: 1284500,
    comprado: 4200,
    vendido: 2856,
    estoque: 1344,
    sellThrough: 68,
    margem: 42.8,
    markupSimples: 2.34,
    markupCompleto: 1.86,
    diasEmEstoque: 38,
    estrelas: 6,
    criticos: 2,
    status: "Boa performance",
    recomendacao: "Reforçar infantil e tricot",
  },
  {
    nome: "Verão 2026",
    receita: 890000,
    comprado: 3100,
    vendido: 2294,
    estoque: 806,
    sellThrough: 74,
    margem: 45.1,
    markupSimples: 2.47,
    markupCompleto: 1.94,
    diasEmEstoque: 32,
    estrelas: 5,
    criticos: 1,
    status: "Forte giro",
    recomendacao: "Ampliar moda feminina",
  },
  {
    nome: "Essentials",
    receita: 520000,
    comprado: 2800,
    vendido: 1092,
    estoque: 1708,
    sellThrough: 39,
    margem: 36.2,
    markupSimples: 2.08,
    markupCompleto: 1.6,
    diasEmEstoque: 98,
    estrelas: 1,
    criticos: 5,
    status: "Atenção",
    recomendacao: "Revisar mix",
  },
  {
    nome: "Fitness 2026",
    receita: 610000,
    comprado: 1800,
    vendido: 1548,
    estoque: 252,
    sellThrough: 86,
    margem: 49.2,
    markupSimples: 2.49,
    markupCompleto: 1.97,
    diasEmEstoque: 21,
    estrelas: 4,
    criticos: 0,
    status: "Alto potencial",
    recomendacao: "Recomprar",
  },
];

export type TipoRecomendacao =
  | "recompra"
  | "liquidar"
  | "revisar-preco"
  | "atencao-margem"
  | "renegociar"
  | "campanha"
  | "ruptura";

export type Prioridade = "Alta" | "Média" | "Baixa";
export type Confianca = "Alta" | "Média" | "Baixa";

export interface Recomendacao {
  id: string;
  tipo: TipoRecomendacao;
  titulo: string;
  produto: string;
  sku?: string;
  marca?: string;
  prioridade: Prioridade;
  motivo: string;
  evidencias: { label: string; valor: string }[];
  impactoEstimado: string;
  acaoSugerida: string;
  confianca: Confianca;
  baseAnalisada: string;
}

export const recomendacoesIM: Recomendacao[] = [
  {
    id: "rec-001",
    tipo: "recompra",
    titulo: "Recompra recomendada",
    produto: "Jaqueta Infantil Soft Touch",
    sku: "JQT-INF-042",
    marca: "Brandili",
    prioridade: "Alta",
    motivo:
      "Vendeu 82% do estoque em 21 dias, mantém markup simples de 2,4x e possui apenas 148 unidades disponíveis.",
    evidencias: [
      { label: "Sell-through", valor: "82%" },
      { label: "Markup simples", valor: "2,37x" },
      { label: "Estoque atual", valor: "148 un" },
      { label: "Dias em estoque", valor: "21d" },
    ],
    impactoEstimado: "Risco de perda de R$ 42.000 em vendas se não houver reposição.",
    acaoSugerida: "Recomprar entre 600 e 750 unidades.",
    confianca: "Alta",
    baseAnalisada: "820 unidades compradas, 672 vendidas, 21 dias de histórico.",
  },
  {
    id: "rec-002",
    tipo: "liquidar",
    titulo: "Liquidação recomendada",
    produto: "Calça Sarja Slim Adulto",
    sku: "CAL-ADT-118",
    marca: "Hering",
    prioridade: "Alta",
    motivo:
      "Produto está há 126 dias em estoque, com apenas 18% de sell-through e R$ 35.424 em capital parado.",
    evidencias: [
      { label: "Sell-through", valor: "18%" },
      { label: "Dias em estoque", valor: "126d" },
      { label: "Capital parado", valor: "R$ 35,4k" },
      { label: "Estoque atual", valor: "492 un" },
    ],
    impactoEstimado: "Redução potencial de estoque parado em até 42% com ação promocional.",
    acaoSugerida: "Criar campanha com desconto progressivo de 20% a 35%.",
    confianca: "Alta",
    baseAnalisada: "600 unidades compradas, 108 vendidas, 126 dias de histórico.",
  },
  {
    id: "rec-003",
    tipo: "revisar-preco",
    titulo: "Ajuste de preço sugerido",
    produto: "Vestido Floral Midi",
    sku: "VES-FEM-077",
    marca: "Lunender",
    prioridade: "Média",
    motivo:
      "Produto com 83,5% de sell-through em 34 dias, estoque baixo e margem 51,1% acima da média da categoria.",
    evidencias: [
      { label: "Sell-through", valor: "83,5%" },
      { label: "Estoque atual", valor: "69 un" },
      { label: "Margem", valor: "51,1%" },
    ],
    impactoEstimado: "Aumento estimado de 8,5% na margem com reajuste controlado de 6%.",
    acaoSugerida: "Simular novo preço de R$ 179,90.",
    confianca: "Média",
    baseAnalisada: "420 unidades compradas, 351 vendidas, 34 dias de histórico.",
  },
  {
    id: "rec-004",
    tipo: "atencao-margem",
    titulo: "Atenção à margem",
    produto: "Moletom College Infantil",
    sku: "MOL-INF-203",
    marca: "Kyly",
    prioridade: "Média",
    motivo:
      "Vendeu 894 de 1.200 unidades, mas o desconto médio aplicado reduziu a margem para 28,4%, abaixo do mínimo da categoria (38%).",
    evidencias: [
      { label: "Margem atual", valor: "28,4%" },
      { label: "Desconto médio", valor: "12,4%" },
      { label: "Vendido", valor: "894 un" },
    ],
    impactoEstimado: "Recuperação potencial de R$ 18.700 em margem.",
    acaoSugerida: "Reduzir desconto máximo permitido para 7%.",
    confianca: "Alta",
    baseAnalisada: "1.200 unidades compradas, 894 vendidas, 39 dias de histórico.",
  },
  {
    id: "rec-005",
    tipo: "renegociar",
    titulo: "Renegociar fornecedor",
    produto: "Cotton Prime",
    prioridade: "Alta",
    motivo:
      "Fornecedor com sell-through médio de 34% e custo de compra 12% acima de fornecedores similares para a mesma categoria.",
    evidencias: [
      { label: "Sell-through médio", valor: "34%" },
      { label: "Variação custo", valor: "+12%" },
      { label: "Produtos parados", valor: "4" },
    ],
    impactoEstimado: "Economia potencial de R$ 31.000 na próxima coleção.",
    acaoSugerida: "Abrir negociação de custo e revisar mix de SKUs.",
    confianca: "Média",
    baseAnalisada: "980 unidades compradas, 333 vendidas em 6 SKUs ativos.",
  },
  {
    id: "rec-006",
    tipo: "ruptura",
    titulo: "Risco de ruptura",
    produto: "Conjunto Fitness Seamless",
    sku: "FIT-FEM-312",
    marca: "Colorittá",
    prioridade: "Alta",
    motivo:
      "Sell-through de 92,4%, margem de 49,2% e apenas 38 unidades em estoque com venda média de 23 un/dia.",
    evidencias: [
      { label: "Sell-through", valor: "92,4%" },
      { label: "Estoque atual", valor: "38 un" },
      { label: "Cobertura", valor: "1,6 dias" },
    ],
    impactoEstimado: "Potencial de perda de R$ 54.000 em vendas em 7 dias.",
    acaoSugerida: "Recompra urgente de 500 a 700 unidades.",
    confianca: "Alta",
    baseAnalisada: "500 unidades compradas, 462 vendidas, 18 dias de histórico.",
  },
  {
    id: "rec-007",
    tipo: "campanha",
    titulo: "Oportunidade de campanha",
    produto: "Camisa Linho Resort",
    sku: "CAM-MAS-088",
    marca: "Malwee",
    prioridade: "Média",
    motivo:
      "Margem de 53,8% e estoque de 146 un permite ação promocional sem comprometer rentabilidade alvo.",
    evidencias: [
      { label: "Margem", valor: "53,8%" },
      { label: "Estoque", valor: "146 un" },
      { label: "Sell-through", valor: "59,4%" },
    ],
    impactoEstimado: "Potencial de R$ 28.700 em receita adicional com campanha de 15 dias.",
    acaoSugerida: "Criar campanha segmentada para Sudeste e Sul.",
    confianca: "Média",
    baseAnalisada: "360 unidades compradas, 214 vendidas, 48 dias de histórico.",
  },
];

export const kpisVisaoGeral = {
  receita: 1284500,
  margemMedia: 42.8,
  markupSimples: 2.34,
  markupCompleto: 1.86,
  sellThrough: 68,
  giro: 3.2,
  valorParado: 286900,
  recomendacoesAtivas: 37,
};

export const evolucaoReceitaMargem = [
  { mes: "Jan", receita: 184000, margem: 38.2 },
  { mes: "Fev", receita: 196000, margem: 39.5 },
  { mes: "Mar", receita: 210000, margem: 40.8 },
  { mes: "Abr", receita: 228000, margem: 41.6 },
  { mes: "Mai", receita: 246000, margem: 42.4 },
  { mes: "Jun", receita: 268000, margem: 43.1 },
  { mes: "Jul", receita: 284500, margem: 42.8 },
];

export const estoqueParadoTop = [
  { produto: "Calça Sarja Slim", valor: 35424 },
  { produto: "Blazer Alfaiataria", valor: 21252 },
  { produto: "Moletom College", valor: 15269 },
  { produto: "Camisa Linho Resort", valor: 11972 },
  { produto: "Vestido Floral Midi", valor: 4451 },
];

export const receitaPorCanal = [
  { canal: "Representante", valor: 462000 },
  { canal: "Social Commerce", valor: 318000 },
  { canal: "WhatsApp", valor: 246000 },
  { canal: "Marketplace B2B", valor: 168000 },
  { canal: "Pedido Direto", valor: 90500 },
];

export const sellThroughColecao = [
  { colecao: "Fitness 2026", valor: 86 },
  { colecao: "Verão 2026", valor: 74 },
  { colecao: "Inverno 2026", valor: 68 },
  { colecao: "Essentials", valor: 39 },
];

export const margemCategoria = [
  { categoria: "Fitness", valor: 49.2 },
  { categoria: "Moda feminina", valor: 50.7 },
  { categoria: "Casual", valor: 53.8 },
  { categoria: "Infantil", valor: 38.0 },
  { categoria: "Adulto", valor: 38.4 },
  { categoria: "Alfaiataria", valor: 44.1 },
];

export const formatBRL = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export const formatBRLk = (n: number) =>
  n >= 1000 ? `R$ ${(n / 1000).toFixed(1).replace(".", ",")}k` : formatBRL(n);

export const formatPct = (n: number) => `${n.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;

export interface ScoreBreakdownData {
  giro: number;
  margem: number;
  sellThrough: number;
  estoque: number;
  recorrencia: number;
  risco: number;
}

export const computeScoreBreakdown = (p: ProdutoIM): ScoreBreakdownData => ({
  giro: Math.min(100, Math.round((p.sellThrough / 90) * 100)),
  margem: Math.min(100, Math.round((p.margem / 55) * 100)),
  sellThrough: Math.round(p.sellThrough),
  estoque: Math.max(0, 100 - Math.round((p.diasEmEstoque / 130) * 100)),
  recorrencia: Math.min(100, Math.round(p.score * 0.95)),
  risco: Math.max(0, 100 - Math.round((100 - p.sellThrough) * 0.6)),
});

// Detalhe do produto: histórico
export const historicoComprasDetalhe = [
  { data: "12/01/2026", fornecedor: "Têxtil Aurora", qtd: 420, custoUn: 57.8, total: 24276, prazo: "12 dias", status: "Recebido" },
  { data: "03/02/2026", fornecedor: "Têxtil Aurora", qtd: 400, custoUn: 60.05, total: 24020, prazo: "10 dias", status: "Recebido" },
];

export const historicoVendasDetalhe = [
  { periodo: "Semana 1", canal: "Representantes", qtd: 184, receita: 25742, descontoMedio: 4.2, margem: 48.1, clientes: 38 },
  { periodo: "Semana 2", canal: "Social Commerce", qtd: 212, receita: 29658, descontoMedio: 3.1, margem: 49.3, clientes: 46 },
  { periodo: "Semana 3", canal: "WhatsApp", qtd: 154, receita: 21545, descontoMedio: 5.8, margem: 46.2, clientes: 31 },
  { periodo: "Semana 4", canal: "Pedido direto", qtd: 122, receita: 17067, descontoMedio: 2.9, margem: 47.7, clientes: 26 },
];

export const vendasSemanais = [
  { semana: "S1", vendas: 184 },
  { semana: "S2", vendas: 212 },
  { semana: "S3", vendas: 154 },
  { semana: "S4", vendas: 122 },
];

export const estoqueTempo = [
  { semana: "S1", estoque: 820 },
  { semana: "S2", estoque: 636 },
  { semana: "S3", estoque: 424 },
  { semana: "S4", estoque: 270 },
  { semana: "S5", estoque: 148 },
];

export const vendaPorRegiao = [
  { regiao: "Sudeste", valor: 248 },
  { regiao: "Sul", valor: 196 },
  { regiao: "Centro-Oeste", valor: 102 },
  { regiao: "Nordeste", valor: 86 },
  { regiao: "Norte", valor: 40 },
];

export const vendaPorGrade = [
  { tamanho: "4", vendas: 78, perc: 11.6 },
  { tamanho: "6", vendas: 188, perc: 28.0 },
  { tamanho: "8", vendas: 174, perc: 25.9 },
  { tamanho: "10", vendas: 132, perc: 19.6 },
  { tamanho: "12", vendas: 100, perc: 14.9 },
];

export const estoquePorCor = [
  { cor: "Marinho", estoque: 62 },
  { cor: "Vinho", estoque: 38 },
  { cor: "Camel", estoque: 28 },
  { cor: "Preto", estoque: 20 },
];

export const topClientes = [
  { cliente: "Boutique Aurora", qtd: 84, receita: 11754 },
  { cliente: "Loja Petit Chic", qtd: 62, receita: 8674 },
  { cliente: "Multimarcas Sul", qtd: 54, receita: 7555 },
  { cliente: "Casa Infantil", qtd: 41, receita: 5736 },
];

export const topVendedores = [
  { vendedor: "Paulo Bardini", qtd: 168, receita: 23503 },
  { vendedor: "Marina Costa", qtd: 142, receita: 19868 },
  { vendedor: "Roberto Lima", qtd: 98, receita: 13710 },
];
