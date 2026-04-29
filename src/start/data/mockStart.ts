import prod1 from "../assets/prod-1.jpg";
import prod2 from "../assets/prod-2.jpg";
import prod3 from "../assets/prod-3.jpg";
import prod4 from "../assets/prod-4.jpg";
import prod5 from "../assets/prod-5.jpg";
import prod6 from "../assets/prod-6.jpg";
import prod7 from "../assets/prod-7.jpg";
import prod8 from "../assets/prod-8.jpg";

export type StartGradeTipo = "letras" | "numeros" | "infantil" | "unico";

export interface StartProduto {
  id: string;
  nome: string;
  categoria: string;
  preco: number;
  cor?: string;
  estacao: string;
  genero: string;
  descricao?: string;
  pedidoMinimo: number;
  visivel: boolean;
  gradeTipo: StartGradeTipo;
  estoquePorTamanho: Record<string, number>;
  fotoCor?: string; // gradient hex pair (fallback)
  fotoUrl?: string; // imagem real do produto
}

export interface StartComprador {
  id: string;
  loja: string;
  contato: string;
  cidade: string;
  estado: string;
  whatsapp: string;
  ultimoPedido: string | null; // ISO date or null
  observacoes?: string;
}

export type StartPedidoStatus = "novo" | "em_producao" | "pronto" | "entregue" | "cancelado";

export interface StartPedidoItem {
  produtoId: string;
  produtoNome: string;
  tamanho: string;
  quantidade: number;
  precoUnit: number;
}

export interface StartPedido {
  id: string;
  compradorId?: string;
  compradorNome: string; // pode vir de fora da base (vitrine pública)
  compradorCidade?: string;
  compradorEstado?: string;
  compradorWhats?: string;
  total: number;
  pecas: number;
  status: StartPedidoStatus;
  data: string; // ISO
  itens: StartPedidoItem[];
  pagamento?: string;
  prazo?: string;
  observacoes?: string;
  historico: { status: StartPedidoStatus; data: string }[];
}

export interface StartFornecedor {
  nome: string;
  slug: string;
  cidade: string;
  estado: string;
  whatsapp: string;
  iniciais: string;
  plano: "gratis" | "pro";
  produtosUsados: number;
  pedidosMes: number;
  descricao: string;
  corDestaque: string;
  vitrineAtiva: boolean;
}

export const FORNECEDOR_INICIAL: StartFornecedor = {
  nome: "Maria Confecções",
  slug: "maria-confeccoes",
  cidade: "Santa Cruz do Capibaribe",
  estado: "PE",
  whatsapp: "81999990000",
  iniciais: "MC",
  plano: "gratis",
  produtosUsados: 7,
  pedidosMes: 14,
  descricao: "Confecções femininas no atacado. Especialidade em vestidos e conjuntos fitness.",
  corDestaque: "#1D9E75",
  vitrineAtiva: true,
};

const gradients = [
  "linear-gradient(135deg, #FAEEDA, #F4D6A8)",
  "linear-gradient(135deg, #E1F5EE, #9FE1CB)",
  "linear-gradient(135deg, #E6F1FB, #BFD9F1)",
  "linear-gradient(135deg, #FCEBEB, #F7C1C1)",
  "linear-gradient(135deg, #F3E8FF, #D8B4FE)",
  "linear-gradient(135deg, #FFF7CD, #FCE588)",
  "linear-gradient(135deg, #E0F7F5, #A7E0DA)",
  "linear-gradient(135deg, #FFE7D6, #FFB99B)",
];

function gradeLetras(p: number, m: number, g: number, gg = 0): Record<string, number> {
  return { P: p, M: m, G: g, GG: gg };
}
function gradeNumeros(values: Record<string, number>): Record<string, number> {
  return values;
}

export const PRODUTOS_INICIAIS: StartProduto[] = [
  {
    id: "prod-1", nome: "Vestido Linho Ombro a Ombro", categoria: "Vestido", preco: 89,
    estacao: "Verão", genero: "Feminino", pedidoMinimo: 6, visivel: true,
    gradeTipo: "letras", estoquePorTamanho: gradeLetras(8, 10, 6, 0),
    descricao: "Vestido de linho leve, perfeito para o verão.", fotoCor: gradients[0], fotoUrl: prod1,
  },
  {
    id: "prod-2", nome: "Camiseta Básica Lisa", categoria: "Camiseta", preco: 32,
    estacao: "Atemporal", genero: "Unissex", pedidoMinimo: 12, visivel: true,
    gradeTipo: "letras", estoquePorTamanho: { P: 15, M: 20, G: 15, GG: 10 },
    fotoCor: gradients[1], fotoUrl: prod2,
  },
  {
    id: "prod-3", nome: "Conjunto Fitness 2 peças", categoria: "Conjunto", preco: 120,
    estacao: "Atemporal", genero: "Feminino", pedidoMinimo: 6, visivel: true,
    gradeTipo: "letras", estoquePorTamanho: gradeLetras(6, 7, 5),
    fotoCor: gradients[2], fotoUrl: prod3,
  },
  {
    id: "prod-4", nome: "Vestido Floral Midi", categoria: "Vestido", preco: 95,
    estacao: "Verão", genero: "Feminino", pedidoMinimo: 6, visivel: true,
    gradeTipo: "letras", estoquePorTamanho: gradeLetras(4, 5, 3),
    fotoCor: gradients[3], fotoUrl: prod4,
  },
  {
    id: "prod-5", nome: "Calça Wide Leg", categoria: "Calça", preco: 78,
    estacao: "Meia estação", genero: "Feminino", pedidoMinimo: 6, visivel: true,
    gradeTipo: "numeros", estoquePorTamanho: gradeNumeros({ "36": 5, "38": 6, "40": 5, "42": 4 }),
    fotoCor: gradients[4], fotoUrl: prod5,
  },
  {
    id: "prod-6", nome: "Blusa Cropped Canelada", categoria: "Blusa", preco: 45,
    estacao: "Atemporal", genero: "Feminino", pedidoMinimo: 12, visivel: true,
    gradeTipo: "letras", estoquePorTamanho: gradeLetras(12, 13, 10),
    fotoCor: gradients[5], fotoUrl: prod6,
  },
  {
    id: "prod-7", nome: "Short Jeans Barra", categoria: "Shorts", preco: 55,
    estacao: "Verão", genero: "Feminino", pedidoMinimo: 6, visivel: true,
    gradeTipo: "numeros", estoquePorTamanho: gradeNumeros({ "36": 7, "38": 8, "40": 7, "42": 6 }),
    fotoCor: gradients[6], fotoUrl: prod7,
  },
  {
    id: "prod-8", nome: "Macacão Liso Manga Curta", categoria: "Macacão", preco: 110,
    estacao: "Verão", genero: "Feminino", pedidoMinimo: 6, visivel: true,
    gradeTipo: "letras", estoquePorTamanho: gradeLetras(3, 3, 2),
    fotoCor: gradients[7], fotoUrl: prod8,
  },
];

const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
};

export const COMPRADORES_INICIAIS: StartComprador[] = [
  { id: "c1", loja: "Boutique da Rosa", contato: "Rosa Lima", cidade: "Recife", estado: "PE", whatsapp: "81988880001", ultimoPedido: daysAgo(3) },
  { id: "c2", loja: "Moda Store Atacado", contato: "Carlos Mendes", cidade: "Fortaleza", estado: "CE", whatsapp: "85977770002", ultimoPedido: daysAgo(10) },
  { id: "c3", loja: "Loja da Mara", contato: "Mara Santos", cidade: "João Pessoa", estado: "PB", whatsapp: "83966660003", ultimoPedido: daysAgo(30) },
  { id: "c4", loja: "Atacado Nordeste", contato: "Fátima Gomes", cidade: "Campina Grande", estado: "PB", whatsapp: "83955550004", ultimoPedido: daysAgo(50) },
  { id: "c5", loja: "Estilo Feminino", contato: "Paula Rocha", cidade: "Natal", estado: "RN", whatsapp: "84944440005", ultimoPedido: null },
];

export const PEDIDOS_INICIAIS: StartPedido[] = [
  {
    id: "P001", compradorId: "c1", compradorNome: "Boutique da Rosa", compradorCidade: "Recife", compradorEstado: "PE", compradorWhats: "81988880001",
    total: 640, pecas: 8, status: "novo", data: daysAgo(0),
    itens: [
      { produtoId: "prod-1", produtoNome: "Vestido Linho Ombro a Ombro", tamanho: "M", quantidade: 4, precoUnit: 89 },
      { produtoId: "prod-3", produtoNome: "Conjunto Fitness 2 peças", tamanho: "M", quantidade: 4, precoUnit: 71 },
    ],
    pagamento: "Pix", prazo: "A combinar", observacoes: "",
    historico: [{ status: "novo", data: daysAgo(0) }],
  },
  {
    id: "P002", compradorId: "c2", compradorNome: "Moda Store Atacado", compradorCidade: "Fortaleza", compradorEstado: "CE", compradorWhats: "85977770002",
    total: 380, pecas: 5, status: "novo", data: daysAgo(0),
    itens: [{ produtoId: "prod-2", produtoNome: "Camiseta Básica Lisa", tamanho: "G", quantidade: 5, precoUnit: 76 }],
    pagamento: "Pix",
    historico: [{ status: "novo", data: daysAgo(0) }],
  },
  {
    id: "P003", compradorId: "c3", compradorNome: "Loja da Mara", compradorCidade: "João Pessoa", compradorEstado: "PB", compradorWhats: "83966660003",
    total: 540, pecas: 7, status: "em_producao", data: daysAgo(3),
    itens: [{ produtoId: "prod-4", produtoNome: "Vestido Floral Midi", tamanho: "M", quantidade: 7, precoUnit: 77 }],
    pagamento: "Boleto",
    historico: [{ status: "novo", data: daysAgo(4) }, { status: "em_producao", data: daysAgo(3) }],
  },
  {
    id: "P004", compradorId: "c4", compradorNome: "Atacado Nordeste", compradorCidade: "Campina Grande", compradorEstado: "PB", compradorWhats: "83955550004",
    total: 920, pecas: 12, status: "em_producao", data: daysAgo(5),
    itens: [{ produtoId: "prod-5", produtoNome: "Calça Wide Leg", tamanho: "38", quantidade: 12, precoUnit: 77 }],
    pagamento: "Pix",
    historico: [{ status: "novo", data: daysAgo(6) }, { status: "em_producao", data: daysAgo(5) }],
  },
  {
    id: "P005", compradorId: "c1", compradorNome: "Boutique da Rosa", compradorCidade: "Recife", compradorEstado: "PE", compradorWhats: "81988880001",
    total: 210, pecas: 3, status: "entregue", data: daysAgo(10),
    itens: [{ produtoId: "prod-6", produtoNome: "Blusa Cropped Canelada", tamanho: "M", quantidade: 3, precoUnit: 70 }],
    pagamento: "Pix",
    historico: [{ status: "novo", data: daysAgo(12) }, { status: "em_producao", data: daysAgo(11) }, { status: "entregue", data: daysAgo(10) }],
  },
  {
    id: "P006", compradorId: "c2", compradorNome: "Moda Store Atacado", compradorCidade: "Fortaleza", compradorEstado: "CE", compradorWhats: "85977770002",
    total: 780, pecas: 10, status: "entregue", data: daysAgo(15),
    itens: [{ produtoId: "prod-3", produtoNome: "Conjunto Fitness 2 peças", tamanho: "G", quantidade: 10, precoUnit: 78 }],
    pagamento: "Boleto",
    historico: [{ status: "novo", data: daysAgo(18) }, { status: "em_producao", data: daysAgo(17) }, { status: "entregue", data: daysAgo(15) }],
  },
];

export const CATEGORIAS_PRODUTO = [
  "Camiseta", "Vestido", "Calça", "Shorts", "Conjunto",
  "Blusa", "Casaco", "Macacão", "Saia", "Roupa infantil", "Outro",
];

export const ESTACOES = ["Verão", "Inverno", "Meia estação", "Atemporal"];
export const GENEROS = ["Feminino", "Masculino", "Infantil", "Unissex"];

export const UFS = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB",
  "PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

export const TAMANHOS_POR_TIPO: Record<StartGradeTipo, string[]> = {
  letras: ["PP", "P", "M", "G", "GG", "XGG"],
  numeros: ["34", "36", "38", "40", "42", "44"],
  infantil: ["1", "2", "3", "4", "6", "8"],
  unico: ["U"],
};

// IA mockada
export interface AIPhotoResult {
  nome: string;
  categoria: string;
  cor: string;
  estacao: string;
  genero: string;
  descricao: string;
}

export const AI_PHOTO_RESULT: AIPhotoResult = {
  nome: "Vestido Midi Estampado",
  categoria: "Vestido",
  cor: "Rosa",
  estacao: "Verão",
  genero: "Feminino",
  descricao: "Vestido midi com estampa floral, ideal para o verão. Tecido leve e confortável.",
};

export function simulateAIPhotoAnalysis(): Promise<AIPhotoResult> {
  return new Promise(resolve => setTimeout(() => resolve(AI_PHOTO_RESULT), 2000));
}

// Temperatura do comprador
export type Temperatura = "Quente" | "Morno" | "Frio";
export function calcTemperatura(ultimoPedido: string | null): Temperatura {
  if (!ultimoPedido) return "Frio";
  const dias = Math.floor((Date.now() - new Date(ultimoPedido).getTime()) / (1000 * 60 * 60 * 24));
  if (dias <= 15) return "Quente";
  if (dias <= 45) return "Morno";
  return "Frio";
}

export function diasDesde(iso: string | null): number | null {
  if (!iso) return null;
  return Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24));
}
