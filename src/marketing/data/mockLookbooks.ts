// Mock de Lookbooks digitais — catálogos enviáveis com tracking público.
import { brands } from "@/data/mockProducts";

export type StatusLookbook = "publicado" | "rascunho" | "arquivado";

/** Layouts visuais para páginas de produtos. */
export type LookbookLayout = "grid-2" | "grid-3" | "lista" | "split-imagem" | "destaque-1";

export interface LookbookPagina {
  id: string;
  tipo: "capa" | "produtos" | "imagem" | "texto";
  titulo?: string;
  subtitulo?: string;
  imagemUrl?: string;
  produtoIds?: string[];   // referências a mockProducts no formato "brandSlug/productId"
  texto?: string;
  layout?: LookbookLayout; // usado quando tipo = "produtos" ou "split-imagem"
}

/** Catálogo de templates pré-prontos para acelerar a criação de páginas. */
export interface LookbookTemplate {
  id: string;
  label: string;
  descricao: string;
  icon: "capa" | "grid-2" | "grid-3" | "lista" | "split" | "texto" | "imagem";
  build: () => Omit<LookbookPagina, "id">;
}

export const lookbookTemplates: LookbookTemplate[] = [
  {
    id: "tpl-capa",
    label: "Capa hero",
    descricao: "Imagem fullbleed com título e subtítulo",
    icon: "capa",
    build: () => ({ tipo: "capa", titulo: "Nova coleção", subtitulo: "Edição limitada", imagemUrl: "/src/assets/concept-1.jpg" }),
  },
  {
    id: "tpl-grid-2",
    label: "Destaques 2x2",
    descricao: "4 produtos em grade grande",
    icon: "grid-2",
    build: () => ({ tipo: "produtos", titulo: "Destaques da coleção", layout: "grid-2", produtoIds: [] }),
  },
  {
    id: "tpl-grid-3",
    label: "Catálogo 3x3",
    descricao: "9 produtos em grade compacta",
    icon: "grid-3",
    build: () => ({ tipo: "produtos", titulo: "Catálogo completo", layout: "grid-3", produtoIds: [] }),
  },
  {
    id: "tpl-lista",
    label: "Vitrine vertical",
    descricao: "Lista 1 produto por linha",
    icon: "lista",
    build: () => ({ tipo: "produtos", titulo: "Top picks", layout: "lista", produtoIds: [] }),
  },
  {
    id: "tpl-split",
    label: "Editorial + 2 produtos",
    descricao: "Imagem grande + 2 produtos abaixo",
    icon: "split",
    build: () => ({ tipo: "produtos", titulo: "Editorial", layout: "split-imagem", imagemUrl: "/src/assets/concept-2.jpg", produtoIds: [] }),
  },
  {
    id: "tpl-destaque",
    label: "Produto em destaque",
    descricao: "1 produto hero com descrição",
    icon: "imagem",
    build: () => ({ tipo: "produtos", titulo: "Peça-chave", layout: "destaque-1", produtoIds: [] }),
  },
  {
    id: "tpl-texto",
    label: "Manifesto / Texto",
    descricao: "Página de texto livre",
    icon: "texto",
    build: () => ({ tipo: "texto", titulo: "Sobre a coleção", texto: "Conte aqui o conceito da coleção..." }),
  },
  {
    id: "tpl-imagem",
    label: "Editorial puro",
    descricao: "Apenas imagem fullbleed",
    icon: "imagem",
    build: () => ({ tipo: "imagem", titulo: "", imagemUrl: "/src/assets/concept-3.jpg" }),
  },
];

export interface LookbookViewLog {
  id: string;
  data: string;
  origem: "whatsapp" | "email" | "direto" | "qr_code";
  contato?: string;
  duracaoSeg: number;
  paginasVistas: number;
  cliquesProduto: number;
  converteu: boolean;
}

export interface Lookbook {
  id: string;
  nome: string;
  slug: string;
  descricao: string;
  status: StatusLookbook;
  capaUrl: string;
  paleta: { primaria: string; fundo: string; texto: string };
  paginas: LookbookPagina[];
  criadoEm: string;
  publicadoEm?: string;
  responsavel: string;
  tags: string[];
  // métricas
  views: number;
  visualizadoresUnicos: number;
  cliquesProduto: number;
  conversoes: number;
  receitaAtribuida: number;
  tempoMedioSeg: number;
  shareLinks: { canal: "whatsapp" | "email" | "qr"; copiados: number }[];
  // tracking detalhado
  logs: LookbookViewLog[];
}

const productIds = brands.flatMap(b => (b.products || []).map(p => `${b.slug}/${p.id}`)).slice(0, 12);

function genLogs(views: number): LookbookViewLog[] {
  const out: LookbookViewLog[] = [];
  const origens: LookbookViewLog["origem"][] = ["whatsapp", "email", "whatsapp", "direto", "qr_code", "whatsapp", "email"];
  const sample = Math.min(views, 24);
  for (let i = 0; i < sample; i++) {
    out.push({
      id: `log_${i}`,
      data: `${(i % 14) + 1}/04/2026 ${(8 + (i % 12)).toString().padStart(2, "0")}:${((i * 7) % 60).toString().padStart(2, "0")}`,
      origem: origens[i % origens.length],
      contato: i % 3 === 0 ? `Lojista ${100 + i}` : undefined,
      duracaoSeg: 30 + (i * 13) % 240,
      paginasVistas: 1 + (i % 8),
      cliquesProduto: i % 4,
      converteu: i % 7 === 0,
    });
  }
  return out;
}

export const mockLookbooks: Lookbook[] = [
  {
    id: "lkb_001",
    nome: "Coleção Outono Inverno 2026",
    slug: "outono-inverno-2026",
    descricao: "Hero collection com alfaiataria leve e tons quentes",
    status: "publicado",
    capaUrl: "/src/assets/concept-1.jpg",
    paleta: { primaria: "#363BB4", fundo: "#080846", texto: "#FFFFFF" },
    paginas: [
      { id: "p1", tipo: "capa", titulo: "Outono Inverno 2026", subtitulo: "Brandili — coleção exclusiva", imagemUrl: "/src/assets/concept-1.jpg" },
      { id: "p2", tipo: "texto", titulo: "Sobre a coleção", texto: "Inspirada nas paisagens do sul do Brasil, a OI26 une alfaiataria leve, tricôs estruturados e tons terrosos. Curadoria com 42 peças em 18 modelos." },
      { id: "p3", tipo: "produtos", titulo: "Destaques alfaiataria", layout: "grid-2", produtoIds: productIds.slice(0, 4) },
      { id: "p4", tipo: "imagem", imagemUrl: "/src/assets/concept-2.jpg", titulo: "Editorial — Praia de Garopaba" },
      { id: "p5", tipo: "produtos", titulo: "Tricôs e malhas pesadas", layout: "grid-3", produtoIds: productIds.slice(0, 9) },
      { id: "p6", tipo: "imagem", imagemUrl: "/src/assets/concept-3.jpg", titulo: "Editorial — Serra Catarinense" },
      { id: "p7", tipo: "produtos", titulo: "Acessórios e complementos", layout: "lista", produtoIds: productIds.slice(0, 4) },
    ],
    criadoEm: "01/03/2026",
    publicadoEm: "12/03/2026",
    responsavel: "Ana Marketing",
    tags: ["alfaiataria", "outono", "destaque"],
    views: 1842,
    visualizadoresUnicos: 1287,
    cliquesProduto: 612,
    conversoes: 184,
    receitaAtribuida: 412000,
    tempoMedioSeg: 142,
    shareLinks: [{ canal: "whatsapp", copiados: 87 }, { canal: "email", copiados: 34 }, { canal: "qr", copiados: 12 }],
    logs: genLogs(1842),
  },
  {
    id: "lkb_002",
    nome: "Linha Infantil — Dia das Mães",
    slug: "linha-infantil-dia-das-maes",
    descricao: "Curadoria das melhores peças infantis para a campanha de Dia das Mães",
    status: "publicado",
    capaUrl: "/src/assets/concept-4.jpg",
    paleta: { primaria: "#00CFFF", fundo: "#FFFFFF", texto: "#080846" },
    paginas: [
      { id: "p1", tipo: "capa", titulo: "Linha Infantil 2026", subtitulo: "Especial Dia das Mães", imagemUrl: "/src/assets/concept-4.jpg" },
      { id: "p2", tipo: "produtos", titulo: "Vestidos festa", produtoIds: productIds.slice(0, 6) },
      { id: "p3", tipo: "produtos", titulo: "Conjuntos casuais", produtoIds: productIds.slice(6, 12) },
    ],
    criadoEm: "20/03/2026",
    publicadoEm: "28/03/2026",
    responsavel: "Bruno CRM",
    tags: ["infantil", "campanha", "dia das mães"],
    views: 824,
    visualizadoresUnicos: 612,
    cliquesProduto: 298,
    conversoes: 76,
    receitaAtribuida: 184000,
    tempoMedioSeg: 98,
    shareLinks: [{ canal: "whatsapp", copiados: 42 }, { canal: "email", copiados: 18 }, { canal: "qr", copiados: 4 }],
    logs: genLogs(824),
  },
  {
    id: "lkb_003",
    nome: "Pré-lançamento Fashion Week",
    slug: "pre-lancamento-fashion-week",
    descricao: "Sneak peek exclusivo para clientes VIP",
    status: "publicado",
    capaUrl: "/src/assets/concept-5.jpg",
    paleta: { primaria: "#080846", fundo: "#080846", texto: "#FFFFFF" },
    paginas: [
      { id: "p1", tipo: "capa", titulo: "Fashion Week 2026", subtitulo: "Acesso exclusivo VIP", imagemUrl: "/src/assets/concept-5.jpg" },
      { id: "p2", tipo: "texto", titulo: "Convite", texto: "Você está entre os primeiros a conhecer nossa nova coleção. Clique nos produtos para reservar sua grade antes do lançamento oficial." },
      { id: "p3", tipo: "produtos", titulo: "Hero pieces", produtoIds: productIds.slice(0, 4) },
      { id: "p4", tipo: "produtos", titulo: "Limited edition", produtoIds: productIds.slice(4, 8) },
    ],
    criadoEm: "08/04/2026",
    publicadoEm: "10/04/2026",
    responsavel: "Ana Marketing",
    tags: ["VIP", "evento"],
    views: 318,
    visualizadoresUnicos: 184,
    cliquesProduto: 184,
    conversoes: 62,
    receitaAtribuida: 298000,
    tempoMedioSeg: 218,
    shareLinks: [{ canal: "whatsapp", copiados: 28 }, { canal: "qr", copiados: 8 }],
    logs: genLogs(318),
  },
  {
    id: "lkb_004",
    nome: "Catálogo Verão 2026",
    slug: "catalogo-verao-2026",
    descricao: "Catálogo completo da próxima coleção verão",
    status: "rascunho",
    capaUrl: "/src/assets/concept-6.jpg",
    paleta: { primaria: "#00CFFF", fundo: "#FFFFFF", texto: "#080846" },
    paginas: [
      { id: "p1", tipo: "capa", titulo: "Verão 2026", imagemUrl: "/src/assets/concept-6.jpg" },
    ],
    criadoEm: "13/04/2026",
    responsavel: "Ana Marketing",
    tags: ["verão", "WIP"],
    views: 0,
    visualizadoresUnicos: 0,
    cliquesProduto: 0,
    conversoes: 0,
    receitaAtribuida: 0,
    tempoMedioSeg: 0,
    shareLinks: [],
    logs: [],
  },
];

export const statusLookbookCfg: Record<StatusLookbook, { label: string; color: string }> = {
  publicado: { label: "Publicado", color: "bg-emerald-500/10 text-emerald-600" },
  rascunho: { label: "Rascunho", color: "bg-muted text-muted-foreground" },
  arquivado: { label: "Arquivado", color: "bg-slate-500/10 text-slate-600" },
};
