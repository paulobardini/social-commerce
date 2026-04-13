// Mock data for the Vendedor (Seller) module

export interface Orcamento {
  id: string;
  nome: string;
  lojista: string | null;
  marcas: string[];
  dataCriacao: string;
  valorTotal: number | null;
  status: "ativo" | "revisao_lojista" | "revisao_comercial" | "aprovado_parcial" | "aprovado" | "recusado";
}

export interface OrcamentoProduto {
  id: string;
  ref: string;
  nome: string;
  marca: string;
  image: string;
  categoria: string;
  genero: string;
  preco: number;
  pecas: number;
  tamanhos: string[];
  grade: "Fechada" | "Aberta";
  valorTotal: number;
  quantidadeGrades: number;
}

export interface ClienteCarteira {
  id: string;
  nome: string;
  documento: string;
  cidade: string;
  tipo: "Lojista" | "Atacadista" | "Representante";
}

export const mockOrcamentos: Orcamento[] = [
  { id: "1", nome: "Orçamento 09/04/2026 15:36", lojista: null, marcas: [], dataCriacao: "09/04/2026", valorTotal: null, status: "ativo" },
  { id: "2", nome: "Orçamento 09/04/2026 15:36", lojista: null, marcas: [], dataCriacao: "09/04/2026", valorTotal: null, status: "ativo" },
  { id: "3", nome: "Orçamento 09/04/2026 15:17", lojista: "Boutique da Thay", marcas: [], dataCriacao: "09/04/2026", valorTotal: null, status: "ativo" },
  { id: "4", nome: "Orçamento 09/04/2026 13:42", lojista: null, marcas: ["BRANDILI", "MUNDI"], dataCriacao: "09/04/2026", valorTotal: 8457.50, status: "ativo" },
  { id: "5", nome: "Orçamento 09/04/2026 13:38", lojista: null, marcas: [], dataCriacao: "09/04/2026", valorTotal: null, status: "ativo" },
  { id: "6", nome: "Orçamento 09/04/2026 10:19", lojista: null, marcas: [], dataCriacao: "09/04/2026", valorTotal: null, status: "ativo" },
  { id: "7", nome: "Orçamento 07/04/2026 14:34", lojista: "Boutique da Thay", marcas: ["BRANDILI"], dataCriacao: "07/04/2026", valorTotal: 11610.60, status: "ativo" },
  { id: "8", nome: "Orçamento 07/04/2026 14:29", lojista: null, marcas: [], dataCriacao: "07/04/2026", valorTotal: null, status: "ativo" },
  { id: "9", nome: "Orçamento 07/04/2026 13:15", lojista: "Loja - Super preço", marcas: ["BRANDILI", "MUNDI"], dataCriacao: "07/04/2026", valorTotal: 1369.71, status: "ativo" },
  { id: "10", nome: "Orçamento 02/04/2026 14:06", lojista: null, marcas: [], dataCriacao: "02/04/2026", valorTotal: null, status: "ativo" },
  { id: "11", nome: "Orçamento 01/04/2026 09:12", lojista: "Milykids", marcas: ["BRANDILI"], dataCriacao: "01/04/2026", valorTotal: 5230.00, status: "revisao_lojista" },
  { id: "12", nome: "Orçamento 28/03/2026 16:45", lojista: "Alemão Vestuário", marcas: ["BRANDILI", "MUNDI"], dataCriacao: "28/03/2026", valorTotal: 15420.30, status: "revisao_comercial" },
  { id: "13", nome: "Orçamento 25/03/2026 11:30", lojista: "CJD Pozza", marcas: ["BRANDILI"], dataCriacao: "25/03/2026", valorTotal: 8900.00, status: "aprovado" },
  { id: "14", nome: "Orçamento 20/03/2026 14:00", lojista: "DBN OUTLET", marcas: ["MUNDI"], dataCriacao: "20/03/2026", valorTotal: 3200.00, status: "recusado" },
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
