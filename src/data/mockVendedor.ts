// Mock data for the Vendedor (Seller) module

export type OrcEtapa =
  | "rascunho"
  | "aguardando_lojista"
  | "em_revisao"
  | "aprovado"
  | "analise_comercial"
  | "virou_pedido"
  | "recusado";

export type LinkEvento =
  | "nao_aberto"
  | "visualizado"
  | "editando"
  | "aprovado_total"
  | "aprovado_parcial"
  | "recusado";

export type BolaCom = "vendedor" | "lojista" | "comercial" | "industria";

export interface IndustriaValor {
  marca: string;
  valor: number;
  aprovada?: boolean;
}

export interface OrcamentoDiff {
  itensRemovidos: { nome: string; qtd: number; valor: number }[];
  itensAlterados: { nome: string; deQtd: number; paraQtd: number; deValor: number; paraValor: number }[];
  totalAntes: number;
  totalDepois: number;
  impactoPolitica?: string;
}

export interface Orcamento {
  id: string;
  nome: string;
  nomeBase?: string;
  versao?: number;
  lojista: string | null;
  marcas: string[];
  dataCriacao: string;
  valorTotal: number | null;
  status: "ativo" | "revisao_lojista" | "revisao_comercial" | "aprovado_parcial" | "aprovado" | "recusado";
  oportunidadeId?: string;
  oportunidadeNome?: string;
  etapa?: OrcEtapa;
  itensCount?: number;
  bola?: BolaCom;
  tempoEtapaDias?: number;
  limiteEtapaDias?: number;
  linkEventoTipo?: LinkEvento;
  linkEventoLabel?: string;
  industriaValores?: IndustriaValor[];
  desdobradoDeId?: string;
  desdobradoDeLabel?: string;
  pedidoNumero?: string;
  pedidoMarca?: string;
  aprovacaoDireta?: boolean;
  motivoAnalise?: string;
  diff?: OrcamentoDiff;
  politicaVigenteEnvio?: string;
}

export function nomeAuto(o: Orcamento): string {
  const cliente = o.lojista || "Sem cliente";
  const itens = o.itensCount != null ? `${o.itensCount} itens` : "—";
  const total = o.valorTotal
    ? `R$ ${o.valorTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
    : "—";
  return `${cliente} · ${itens} · ${total}`;
}

export const mockOrcamentos: Orcamento[] = [
  { id: "1", nome: "Rascunho rápido", lojista: "Boutique da Thay", marcas: ["BRANDILI"], dataCriacao: "06/07/2026", valorTotal: 2340.00, status: "ativo",
    etapa: "rascunho", itensCount: 18, bola: "vendedor", tempoEtapaDias: 1, limiteEtapaDias: 3,
    industriaValores: [{ marca: "BRANDILI", valor: 2340 }] },
  { id: "5", nome: "Catálogo verão — esboço", lojista: "Fashion Kids Store", marcas: ["BRANDILI","MUNDI"], dataCriacao: "05/07/2026", valorTotal: 5800.50, status: "ativo",
    etapa: "rascunho", itensCount: 42, bola: "vendedor", tempoEtapaDias: 2, limiteEtapaDias: 3,
    industriaValores: [{ marca: "BRANDILI", valor: 3200 }, { marca: "MUNDI", valor: 2600.50 }] },

  { id: "2", nome: "auto", lojista: "Boutique da Thay", marcas: ["BRANDILI"], dataCriacao: "03/07/2026", valorTotal: 9800.00, status: "ativo",
    oportunidadeId: "op1", oportunidadeNome: "Pedido Inverno 2026 – Multimarcas",
    etapa: "aguardando_lojista", itensCount: 74, bola: "lojista", tempoEtapaDias: 4, limiteEtapaDias: 3,
    linkEventoTipo: "nao_aberto", linkEventoLabel: "enviado · não aberto há 2d",
    industriaValores: [{ marca: "BRANDILI", valor: 9800 }],
    politicaVigenteEnvio: "Política Inverno 2026 v3 (28/03/2026)" },
  { id: "9", nome: "auto", lojista: "Loja - Super preço", marcas: ["BRANDILI","MUNDI"], dataCriacao: "04/07/2026", valorTotal: 12369.71, status: "ativo",
    etapa: "aguardando_lojista", itensCount: 96, bola: "lojista", tempoEtapaDias: 2, limiteEtapaDias: 3,
    linkEventoTipo: "visualizado", linkEventoLabel: "visualizado ontem",
    industriaValores: [{ marca: "BRANDILI", valor: 7369.71 }, { marca: "MUNDI", valor: 5000 }] },
  { id: "15", nome: "auto", lojista: "APOLO ATACADO", marcas: ["BRANDILI","KYLY"], dataCriacao: "06/07/2026", valorTotal: 24500, status: "ativo",
    etapa: "aguardando_lojista", itensCount: 180, bola: "lojista", tempoEtapaDias: 0, limiteEtapaDias: 3,
    linkEventoTipo: "editando", linkEventoLabel: "editando agora",
    industriaValores: [{ marca: "BRANDILI", valor: 14500 }, { marca: "KYLY", valor: 10000 }] },

  { id: "11", nome: "auto", lojista: "Milykids", marcas: ["BRANDILI"], dataCriacao: "01/07/2026", valorTotal: 5230.00, status: "revisao_lojista",
    oportunidadeId: "op11", oportunidadeNome: "Pedido Especial – Milykids",
    etapa: "em_revisao", itensCount: 38, bola: "vendedor", tempoEtapaDias: 1, limiteEtapaDias: 2,
    linkEventoTipo: "editando", linkEventoLabel: "lojista editou 3 itens",
    industriaValores: [{ marca: "BRANDILI", valor: 5230 }],
    politicaVigenteEnvio: "Política Inverno 2026 v3 (28/03/2026)",
    diff: {
      itensRemovidos: [{ nome: "Bermuda Ciclista 4-10", qtd: 3, valor: 280.10 }],
      itensAlterados: [
        { nome: "Conjunto Moletom 4-10", deQtd: 12, paraQtd: 8, deValor: 1514.16, paraValor: 1009.44 },
        { nome: "Camiseta Básica 1-3", deQtd: 6, paraQtd: 4, deValor: 384.06, paraValor: 256.04 },
      ],
      totalAntes: 6178.32,
      totalDepois: 5230.00,
      impactoPolitica: "Com essa edição o pedido perde o desconto de 32,5% (mínimo R$ 6.000)",
    } },

  { id: "13", nome: "auto", lojista: "CJD Pozza", marcas: ["BRANDILI"], dataCriacao: "25/06/2026", valorTotal: 8900.00, status: "aprovado",
    oportunidadeId: "op5", oportunidadeNome: "Pedido Alto Verão – CJD Pozza",
    etapa: "aprovado", itensCount: 62, bola: "comercial", tempoEtapaDias: 1, limiteEtapaDias: 2,
    linkEventoTipo: "aprovado_total", linkEventoLabel: "aprovado integralmente",
    industriaValores: [{ marca: "BRANDILI", valor: 8900, aprovada: true }] },

  { id: "12", nome: "auto", lojista: "Alemão Vestuário", marcas: ["BRANDILI","MUNDI"], dataCriacao: "28/06/2026", valorTotal: 15420.30, status: "revisao_comercial",
    oportunidadeId: "op3", oportunidadeNome: "Reposição Verão – Alemão Vestuário",
    etapa: "analise_comercial", itensCount: 120, bola: "comercial", tempoEtapaDias: 3, limiteEtapaDias: 2,
    industriaValores: [{ marca: "BRANDILI", valor: 10420.30, aprovada: true }, { marca: "MUNDI", valor: 5000, aprovada: true }],
    motivoAnalise: "Fora da política: desconto 35% sem mínimo — em revisão", aprovacaoDireta: false },
  { id: "16", nome: "auto", lojista: "Rei das Crianças", marcas: ["BRANDILI"], dataCriacao: "02/07/2026", valorTotal: 6300, status: "aprovado",
    etapa: "analise_comercial", itensCount: 44, bola: "industria", tempoEtapaDias: 1, limiteEtapaDias: 2,
    industriaValores: [{ marca: "BRANDILI", valor: 6300, aprovada: true }],
    motivoAnalise: "Dentro da política · cliente ativo · aguardando estoque", aprovacaoDireta: true },

  { id: "20", nome: "auto", lojista: "Trendy Kids", marcas: ["BRANDILI","MUNDI","KYLY"], dataCriacao: "29/06/2026", valorTotal: 900, status: "aprovado_parcial",
    etapa: "aguardando_lojista", itensCount: 12, bola: "lojista", tempoEtapaDias: 2, limiteEtapaDias: 3,
    linkEventoTipo: "aprovado_parcial", linkEventoLabel: "aprovou parcialmente",
    industriaValores: [
      { marca: "BRANDILI", valor: 3200, aprovada: true },
      { marca: "MUNDI", valor: 2100, aprovada: true },
      { marca: "KYLY", valor: 900, aprovada: false },
    ] },
  { id: "20a", nome: "auto", lojista: "Trendy Kids", marcas: ["BRANDILI"], dataCriacao: "29/06/2026", valorTotal: 3200, status: "aprovado",
    etapa: "analise_comercial", itensCount: 24, bola: "comercial", tempoEtapaDias: 1, limiteEtapaDias: 2,
    industriaValores: [{ marca: "BRANDILI", valor: 3200, aprovada: true }],
    motivoAnalise: "Dentro da política · aprovação direta", aprovacaoDireta: true,
    desdobradoDeId: "20", desdobradoDeLabel: "desdobrado de Trendy Kids · 60 itens" },
  { id: "20b", nome: "auto", lojista: "Trendy Kids", marcas: ["MUNDI"], dataCriacao: "29/06/2026", valorTotal: 2100, status: "aprovado",
    etapa: "virou_pedido", itensCount: 18, bola: "industria", tempoEtapaDias: 0, limiteEtapaDias: 5,
    industriaValores: [{ marca: "MUNDI", valor: 2100, aprovada: true }],
    pedidoNumero: "MUNDI #4210", pedidoMarca: "MUNDI",
    desdobradoDeId: "20", desdobradoDeLabel: "desdobrado de Trendy Kids · 60 itens" },

  { id: "21", nome: "auto", lojista: "Universo Infantil", marcas: ["BRANDILI"], dataCriacao: "22/06/2026", valorTotal: 18400, status: "aprovado",
    etapa: "virou_pedido", itensCount: 130, bola: "industria", tempoEtapaDias: 0, limiteEtapaDias: 5,
    industriaValores: [{ marca: "BRANDILI", valor: 18400, aprovada: true }],
    pedidoNumero: "Brandili #1234", pedidoMarca: "BRANDILI" },

  { id: "14", nome: "auto", lojista: "DBN OUTLET", marcas: ["MUNDI"], dataCriacao: "20/06/2026", valorTotal: 3200.00, status: "recusado",
    oportunidadeId: "op6", oportunidadeNome: "Lote Outlet – DBN OUTLET",
    etapa: "recusado", itensCount: 22, bola: "vendedor", tempoEtapaDias: 6, limiteEtapaDias: 3,
    linkEventoTipo: "recusado", linkEventoLabel: "recusado pelo lojista",
    industriaValores: [{ marca: "MUNDI", valor: 3200 }] },
];


export const mockCatalogoProdutos: OrcamentoProduto[] = [
  { id: "cp1", ref: "80075-01", nome: "Bermuda Ciclista Cotton Ajuste Firme 1-3", marca: "BRANDILI", image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=300&h=300&fit=crop", categoria: "SHORTS", genero: "UNISSEX", preco: 19.46, pecas: 3, tamanhos: ["1", "2", "3"], grade: "Fechada", valorTotal: 58.39, quantidadeGrades: 1 },
  { id: "cp2", ref: "80075-02", nome: "Bermuda Ciclista Cotton Conforto Flex 4-10", marca: "BRANDILI", image: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=300&h=300&fit=crop", categoria: "SHORTS", genero: "UNISSEX", preco: 23.36, pecas: 4, tamanhos: ["4", "6", "8", "10"], grade: "Fechada", valorTotal: 93.43, quantidadeGrades: 1 },
  { id: "cp3", ref: "80075-03", nome: "Bermuda Ciclista Cotton Performance 12-18", marca: "BRANDILI", image: "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=300&h=300&fit=crop", categoria: "SHORTS", genero: "UNISSEX", preco: 28.03, pecas: 4, tamanhos: ["12", "14", "16", "18"], grade: "Fechada", valorTotal: 112.12, quantidadeGrades: 1 },
  { id: "cp4", ref: "80181-03", nome: "Bermuda Moletinho Alto Giro 12-18", marca: "BRANDILI", image: "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=300&h=300&fit=crop", categoria: "BERMUDA", genero: "MASCULINO", preco: 47.50, pecas: 4, tamanhos: ["12", "14", "16", "18"], grade: "Fechada", valorTotal: 190.00, quantidadeGrades: 1 },
  { id: "cp5", ref: "42043", nome: "Bermuda Moletinho Caimento Casual 4-10", marca: "BRANDILI", image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=300&h=300&fit=crop", categoria: "BERMUDA", genero: "MASCULINO", preco: 70.09, pecas: 4, tamanhos: ["4", "6", "8", "10"], grade: "Fechada", valorTotal: 280.34, quantidadeGrades: 1 },
  { id: "cp6", ref: "80181-02", nome: "Bermuda Moletinho Giro Garantido 4-10", marca: "BRANDILI", image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=300&h=300&fit=crop", categoria: "BERMUDA", genero: "MASCULINO", preco: 39.71, pecas: 4, tamanhos: ["4", "6", "8", "10"], grade: "Fechada", valorTotal: 158.85, quantidadeGrades: 1 },
  { id: "cp7", ref: "56236", nome: "Bermuda moletinho tricot infantil 4-10", marca: "MUNDI", image: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=300&h=300&fit=crop", categoria: "BERMUDA", genero: "MASCULINO", preco: 93.45, pecas: 4, tamanhos: ["4", "6", "8", "10"], grade: "Fechada", valorTotal: 373.80, quantidadeGrades: 1 },
  { id: "cp8", ref: "80181-01", nome: "Bermuda Moletinho Venda Garantida 1-3", marca: "BRANDILI", image: "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=300&h=300&fit=crop", categoria: "BERMUDA", genero: "MASCULINO", preco: 34.26, pecas: 3, tamanhos: ["1", "2", "3"], grade: "Fechada", valorTotal: 102.78, quantidadeGrades: 1 },
  { id: "cp9", ref: "56463-01", nome: "Blusa Cotton Ajuste Versátil 1-3", marca: "BRANDILI", image: "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=300&h=300&fit=crop", categoria: "BLUSA", genero: "FEMININO", preco: 46.72, pecas: 3, tamanhos: ["1", "2", "3"], grade: "Fechada", valorTotal: 140.16, quantidadeGrades: 1 },
  { id: "cp10", ref: "80503-03", nome: "Blusa Cotton Alto Giro Essencial 12-18", marca: "BRANDILI", image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=300&h=300&fit=crop", categoria: "BLUSA", genero: "FEMININO", preco: 45.94, pecas: 4, tamanhos: ["12", "14", "16", "18"], grade: "Fechada", valorTotal: 183.76, quantidadeGrades: 1 },
  { id: "cp11", ref: "42023", nome: "Vestido meia malha P/M/G", marca: "BRANDILI", image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=300&h=300&fit=crop", categoria: "VESTIDO", genero: "FEMININO", preco: 37.38, pecas: 3, tamanhos: ["P", "M", "G"], grade: "Fechada", valorTotal: 112.13, quantidadeGrades: 1 },
  { id: "cp12", ref: "55120", nome: "Conjunto Moletom Inverno 4-10", marca: "BRANDILI", image: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=300&h=300&fit=crop", categoria: "CONJUNTO", genero: "MASCULINO", preco: 126.18, pecas: 4, tamanhos: ["4", "6", "8", "10"], grade: "Fechada", valorTotal: 504.72, quantidadeGrades: 1 },
  { id: "cp13", ref: "55234", nome: "Camiseta Básica Algodão 1-3", marca: "BRANDILI", image: "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=300&h=300&fit=crop", categoria: "CAMISETA", genero: "UNISSEX", preco: 64.01, pecas: 3, tamanhos: ["1", "2", "3"], grade: "Fechada", valorTotal: 192.03, quantidadeGrades: 1 },
  { id: "cp14", ref: "55345", nome: "Calça Jeans Stretch 4-10", marca: "MUNDI", image: "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=300&h=300&fit=crop", categoria: "CALÇA", genero: "FEMININO", preco: 71.66, pecas: 4, tamanhos: ["4", "6", "8", "10"], grade: "Fechada", valorTotal: 286.64, quantidadeGrades: 1 },
  { id: "cp15", ref: "55456", nome: "Jaqueta Corta Vento 12-18", marca: "BRANDILI", image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=300&h=300&fit=crop", categoria: "JAQUETA", genero: "MASCULINO", preco: 140.60, pecas: 4, tamanhos: ["12", "14", "16", "18"], grade: "Fechada", valorTotal: 562.40, quantidadeGrades: 1 },
  { id: "cp16", ref: "55567", nome: "Pijama Flanela Conforto 1-3", marca: "BRANDILI", image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=300&h=300&fit=crop", categoria: "PIJAMA", genero: "UNISSEX", preco: 96.06, pecas: 3, tamanhos: ["1", "2", "3"], grade: "Fechada", valorTotal: 288.18, quantidadeGrades: 1 },
];

export const mockClientes: ClienteCarteira[] = [
  { id: "c1", nome: "54.510.555 ciro candido gomes", documento: "54.510.555/0001-02", cidade: "Iúna / ES", tipo: "Lojista" },
  { id: "c2", nome: "59.360.721 ALEXANDRE CHISTE", documento: "59.360.721/0001-55", cidade: "Jaraguá do Sul / SC", tipo: "Lojista" },
  { id: "c3", nome: "Milykids", documento: "59.913.644/0001-13", cidade: "Brasília / DF", tipo: "Lojista" },
  { id: "c4", nome: "Alemão Vestuário", documento: "00.000.000/0000-00", cidade: "Jaraguá do Sul / SC", tipo: "Lojista" },
  { id: "c5", nome: "Anjus baby e kids", documento: "087.538.419-64", cidade: "Bandeirantes / PR", tipo: "Lojista" },
  { id: "c6", nome: "APOLO ATACADO", documento: "095.982.209-74", cidade: "Jaraguá do Sul / SC", tipo: "Lojista" },
  { id: "c7", nome: "Boutique da Thay", documento: "41.569.299/0001-87", cidade: "Jaraguá do Sul / SC", tipo: "Lojista" },
  { id: "c8", nome: "CJD Pozza Comercio do Vestuário Ltda", documento: "05.485.011/0002-03", cidade: "Porto Alegre / RS", tipo: "Lojista" },
  { id: "c9", nome: "DBN OUTLET", documento: "054.937.119-23", cidade: "Jaraguá do Sul / SC", tipo: "Atacadista" },
  { id: "c10", nome: "ESTEFANI CARDOSO MODAS", documento: "112.191.529-94", cidade: "Jaraguá do Sul / SC", tipo: "Lojista" },
  { id: "c11", nome: "Fashion Kids Store", documento: "23.456.789/0001-10", cidade: "São Paulo / SP", tipo: "Lojista" },
  { id: "c12", nome: "Mega Atacado Infantil", documento: "34.567.890/0001-20", cidade: "Curitiba / PR", tipo: "Atacadista" },
  { id: "c13", nome: "Pimpolho Modas", documento: "45.678.901/0001-30", cidade: "Florianópolis / SC", tipo: "Lojista" },
  { id: "c14", nome: "Rei das Crianças", documento: "56.789.012/0001-40", cidade: "Belo Horizonte / MG", tipo: "Lojista" },
  { id: "c15", nome: "Super Baby Store", documento: "67.890.123/0001-50", cidade: "Rio de Janeiro / RJ", tipo: "Atacadista" },
  { id: "c16", nome: "Trendy Kids", documento: "78.901.234/0001-60", cidade: "Recife / PE", tipo: "Lojista" },
  { id: "c17", nome: "Universo Infantil", documento: "89.012.345/0001-70", cidade: "Salvador / BA", tipo: "Lojista" },
  { id: "c18", nome: "Veste Bem Modas", documento: "90.123.456/0001-80", cidade: "Goiânia / GO", tipo: "Lojista" },
  { id: "c19", nome: "World Baby Fashion", documento: "01.234.567/0001-90", cidade: "Manaus / AM", tipo: "Representante" },
  { id: "c20", nome: "Zara Kids Outlet", documento: "12.345.678/0001-01", cidade: "Campinas / SP", tipo: "Lojista" },
];

// Summary data for "Adicionar todos os produtos" modal
export const resumoPorTipo = [
  { tipo: "CONJUNTO", qtd: 291, pecas: 989, pct: "40.9%", precoMedio: 126.18 },
  { tipo: "CAMISETA", qtd: 75, pecas: 280, pct: "11.6%", precoMedio: 64.01 },
  { tipo: "CALÇA", qtd: 63, pecas: 235, pct: "9.7%", precoMedio: 71.66 },
  { tipo: "BLUSA", qtd: 60, pecas: 224, pct: "9.3%", precoMedio: 54.88 },
  { tipo: "VESTIDO", qtd: 50, pecas: 171, pct: "7.1%", precoMedio: 80.10 },
  { tipo: "JAQUETA", qtd: 43, pecas: 161, pct: "6.7%", precoMedio: 140.60 },
];

export const resumoPorSexo = [
  { sexo: "F", qtd: 334, pecas: 1188, pct: "49.1%", precoMedio: 105.65 },
  { sexo: "M", qtd: 287, pecas: 1014, pct: "41.9%", precoMedio: 97.93 },
  { sexo: "U", qtd: 57, pecas: 216, pct: "8.9%", precoMedio: 51.33 },
];

export const resumoPorTamanho = [
  { tamanho: "10", pecas: 307, pct: "12.7%" },
  { tamanho: "6", pecas: 284, pct: "11.7%" },
  { tamanho: "8", pecas: 284, pct: "11.7%" },
  { tamanho: "4", pecas: 281, pct: "11.6%" },
  { tamanho: "1", pecas: 173, pct: "7.2%" },
  { tamanho: "2", pecas: 173, pct: "7.2%" },
];
