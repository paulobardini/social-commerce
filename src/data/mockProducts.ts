import concept1 from "@/assets/concept-1.jpg";
import concept2 from "@/assets/concept-2.jpg";
import concept3 from "@/assets/concept-3.jpg";
import concept4 from "@/assets/concept-4.jpg";
import concept5 from "@/assets/concept-5.jpg";
import concept6 from "@/assets/concept-6.jpg";
import concept7 from "@/assets/concept-7.jpg";
import concept8 from "@/assets/concept-8.jpg";

import brandBrandili from "@/assets/brand-brandili.jpg";
import brandKyly from "@/assets/brand-kyly.jpg";
import brandHering from "@/assets/brand-hering.jpg";
import brandMalwee from "@/assets/brand-malwee.jpg";
import brandLunender from "@/assets/brand-lunender.jpg";
import brandMarisol from "@/assets/brand-marisol.jpg";
import brandElian from "@/assets/brand-elian.jpg";
import brandColoritta from "@/assets/brand-coloritta.jpg";

export interface SubBrand {
  id: string;
  name: string;
  logo: string;
  vitrineImages: string[];
}

export interface ProductVariant {
  color: string;
  colorHex: string;
  images: string[];
}

export interface Product {
  id: string;
  ref: string;
  subBrandId: string;
  name: string;
  description: string;
  price: number;
  sizes: string[];
  variants: ProductVariant[];
  likes: number;
  comments: number;
  category: string;
  gender: string;
}

export interface Brand {
  slug: string;
  name: string;
  logo: string;
  banner: string;
  description: string;
  connections: number;
  totalProducts: number;
  subBrands: SubBrand[];
  products: Product[];
}

const imgs = [concept1, concept2, concept3, concept4, concept5, concept6, concept7, concept8];
const pick = (n: number, offset = 0) => Array.from({ length: n }, (_, i) => imgs[(i + offset) % 8]);

const colorOptions: { color: string; colorHex: string }[] = [
  { color: "Branco", colorHex: "#F5F5F5" },
  { color: "Preto", colorHex: "#1F2937" },
  { color: "Cinza", colorHex: "#6B7280" },
  { color: "Azul Marinho", colorHex: "#1E3A5F" },
  { color: "Bege", colorHex: "#D4B896" },
  { color: "Marrom", colorHex: "#8B6F47" },
  { color: "Rosa", colorHex: "#F9A8D4" },
  { color: "Lilás", colorHex: "#C4B5FD" },
  { color: "Verde", colorHex: "#059669" },
  { color: "Vermelho", colorHex: "#DC2626" },
  { color: "Chumbo", colorHex: "#4B5563" },
  { color: "Azul Claro", colorHex: "#93C5FD" },
  { color: "Coral", colorHex: "#F87171" },
  { color: "Mostarda", colorHex: "#D97706" },
  { color: "Off-White", colorHex: "#FAF5EF" },
];

function makeVariants(count: number, offset: number): ProductVariant[] {
  return Array.from({ length: count }, (_, i) => {
    const c = colorOptions[(i + offset) % colorOptions.length];
    return { color: c.color, colorHex: c.colorHex, images: pick(Math.max(2, 4 - i), offset + i * 2) };
  });
}

interface ProductTemplate {
  category: string;
  gender: string;
  namePrefix: string;
  desc: string;
  priceRange: [number, number];
  sizes: string[];
}

const infantilMasc: ProductTemplate[] = [
  { category: "Camiseta", gender: "Masculino", namePrefix: "Camiseta Meia Malha", desc: "Camiseta em meia malha confortável para uso diário.", priceRange: [49.9, 79.9], sizes: ["4","6","8","10","12"] },
  { category: "Calça", gender: "Masculino", namePrefix: "Calça Jogging Moletom", desc: "Calça jogging em moletom felpado, confortável e moderna.", priceRange: [89.9, 139.9], sizes: ["4","6","8","10","12"] },
  { category: "Blusão", gender: "Masculino", namePrefix: "Blusão Moletom Felpado", desc: "Blusão oversized em moletom com bolso canguru.", priceRange: [99.9, 149.9], sizes: ["4","6","8","10","12"] },
  { category: "Jaqueta", gender: "Masculino", namePrefix: "Jaqueta Color Block", desc: "Jaqueta com design color block contemporâneo.", priceRange: [139.9, 189.9], sizes: ["4","6","8","10","12"] },
  { category: "Conjunto", gender: "Masculino", namePrefix: "Conjunto Moletom", desc: "Conjunto moletom felpado com estampa exclusiva.", priceRange: [149.9, 199.9], sizes: ["4","6","8","10","12"] },
  { category: "Bermuda", gender: "Masculino", namePrefix: "Bermuda Sarja", desc: "Bermuda em sarja com cós elástico regulável.", priceRange: [59.9, 89.9], sizes: ["4","6","8","10","12"] },
  { category: "Polo", gender: "Masculino", namePrefix: "Polo Piquet", desc: "Camisa polo em piquet com gola em ribana.", priceRange: [59.9, 89.9], sizes: ["4","6","8","10","12"] },
  { category: "Regata", gender: "Masculino", namePrefix: "Regata Dry Fit", desc: "Regata esportiva em tecido dry fit.", priceRange: [39.9, 59.9], sizes: ["4","6","8","10","12"] },
];

const infantilFem: ProductTemplate[] = [
  { category: "Vestido", gender: "Feminino", namePrefix: "Vestido Florido", desc: "Vestido com estampa floral delicada.", priceRange: [69.9, 119.9], sizes: ["4","6","8","10","12"] },
  { category: "Conjunto", gender: "Feminino", namePrefix: "Conjunto Malha", desc: "Conjunto em malha confortável para o dia a dia.", priceRange: [89.9, 139.9], sizes: ["4","6","8","10","12"] },
  { category: "Saia", gender: "Feminino", namePrefix: "Saia Plissada", desc: "Saia plissada com cintura elástica.", priceRange: [49.9, 79.9], sizes: ["4","6","8","10","12"] },
  { category: "Legging", gender: "Feminino", namePrefix: "Legging Cotton", desc: "Legging em algodão com elastano.", priceRange: [39.9, 59.9], sizes: ["4","6","8","10","12"] },
  { category: "Blusa", gender: "Feminino", namePrefix: "Blusa Babado", desc: "Blusa com babado nas mangas e detalhe em laço.", priceRange: [49.9, 79.9], sizes: ["4","6","8","10","12"] },
  { category: "Camiseta", gender: "Feminino", namePrefix: "Camiseta Estampada", desc: "Camiseta em algodão com estampa exclusiva.", priceRange: [39.9, 69.9], sizes: ["4","6","8","10","12"] },
  { category: "Jaqueta", gender: "Feminino", namePrefix: "Jaqueta Bomber", desc: "Jaqueta bomber com forro em fleece.", priceRange: [129.9, 179.9], sizes: ["4","6","8","10","12"] },
  { category: "Calça", gender: "Feminino", namePrefix: "Calça Legging Jeans", desc: "Calça legging em jeans com elastano.", priceRange: [69.9, 99.9], sizes: ["4","6","8","10","12"] },
];

const juvenilMasc: ProductTemplate[] = [
  { category: "Camiseta", gender: "Masculino", namePrefix: "Camiseta Meia Malha", desc: "Camiseta essencial em meia malha.", priceRange: [59.9, 89.9], sizes: ["12","14","16","18","20"] },
  { category: "Calça", gender: "Masculino", namePrefix: "Calça Jogging", desc: "Calça jogging em moletom felpado.", priceRange: [109.9, 149.9], sizes: ["12","14","16","18","20"] },
  { category: "Blusão", gender: "Masculino", namePrefix: "Blusão Oversized", desc: "Blusão oversized com bolso canguru.", priceRange: [109.9, 159.9], sizes: ["12","14","16","18","20"] },
  { category: "Jaqueta", gender: "Masculino", namePrefix: "Jaqueta Moletom", desc: "Jaqueta em moletom com zíper.", priceRange: [149.9, 199.9], sizes: ["12","14","16","18","20"] },
  { category: "Conjunto", gender: "Masculino", namePrefix: "Conjunto Inverno", desc: "Conjunto para inverno com estampa.", priceRange: [159.9, 219.9], sizes: ["12","14","16","18","20"] },
  { category: "Bermuda", gender: "Masculino", namePrefix: "Bermuda Tactel", desc: "Bermuda em tactel com bolsos laterais.", priceRange: [59.9, 89.9], sizes: ["12","14","16","18","20"] },
  { category: "Polo", gender: "Masculino", namePrefix: "Polo Listrada", desc: "Camisa polo listrada em piquet premium.", priceRange: [69.9, 99.9], sizes: ["12","14","16","18","20"] },
  { category: "Regata", gender: "Masculino", namePrefix: "Regata Estampada", desc: "Regata em algodão com estampa.", priceRange: [39.9, 59.9], sizes: ["12","14","16","18","20"] },
];

const adultoFem: ProductTemplate[] = [
  { category: "Vestido", gender: "Feminino", namePrefix: "Vestido Midi", desc: "Vestido midi em viscose com caimento fluido.", priceRange: [129.9, 219.9], sizes: ["P","M","G","GG"] },
  { category: "Blusa", gender: "Feminino", namePrefix: "Blusa Crepe", desc: "Blusa em crepe com manga bufante.", priceRange: [79.9, 139.9], sizes: ["P","M","G","GG"] },
  { category: "Calça", gender: "Feminino", namePrefix: "Calça Pantalona", desc: "Calça pantalona em alfaiataria leve.", priceRange: [139.9, 199.9], sizes: ["P","M","G","GG"] },
  { category: "Saia", gender: "Feminino", namePrefix: "Saia Midi", desc: "Saia midi plissada em tecido fluido.", priceRange: [99.9, 159.9], sizes: ["P","M","G","GG"] },
  { category: "Jaqueta", gender: "Feminino", namePrefix: "Jaqueta Alfaiataria", desc: "Jaqueta em alfaiataria com abotoamento duplo.", priceRange: [199.9, 299.9], sizes: ["P","M","G","GG"] },
  { category: "Conjunto", gender: "Feminino", namePrefix: "Conjunto Linho", desc: "Conjunto em linho com blusa e calça.", priceRange: [189.9, 279.9], sizes: ["P","M","G","GG"] },
  { category: "Camiseta", gender: "Feminino", namePrefix: "T-Shirt Oversized", desc: "Camiseta oversized em algodão premium.", priceRange: [69.9, 109.9], sizes: ["P","M","G","GG"] },
  { category: "Cardigan", gender: "Feminino", namePrefix: "Cardigan Tricô", desc: "Cardigan em tricô com botões.", priceRange: [149.9, 229.9], sizes: ["P","M","G","GG"] },
];

const adultoMasc: ProductTemplate[] = [
  { category: "Camiseta", gender: "Masculino", namePrefix: "Camiseta Básica", desc: "Camiseta básica em algodão penteado.", priceRange: [49.9, 79.9], sizes: ["P","M","G","GG","XG"] },
  { category: "Calça", gender: "Masculino", namePrefix: "Calça Chino", desc: "Calça chino em sarja com corte slim.", priceRange: [129.9, 179.9], sizes: ["P","M","G","GG","XG"] },
  { category: "Polo", gender: "Masculino", namePrefix: "Polo Básica", desc: "Camisa polo em piquet de algodão.", priceRange: [79.9, 119.9], sizes: ["P","M","G","GG","XG"] },
  { category: "Jaqueta", gender: "Masculino", namePrefix: "Jaqueta Corta-Vento", desc: "Jaqueta corta-vento com capuz.", priceRange: [169.9, 249.9], sizes: ["P","M","G","GG","XG"] },
  { category: "Bermuda", gender: "Masculino", namePrefix: "Bermuda Sarja", desc: "Bermuda em sarja com bolsos cargo.", priceRange: [89.9, 129.9], sizes: ["P","M","G","GG","XG"] },
  { category: "Blusão", gender: "Masculino", namePrefix: "Moletom Canguru", desc: "Blusão em moletom com capuz e bolso canguru.", priceRange: [129.9, 189.9], sizes: ["P","M","G","GG","XG"] },
  { category: "Camisa", gender: "Masculino", namePrefix: "Camisa Social Slim", desc: "Camisa social em algodão com corte slim.", priceRange: [119.9, 169.9], sizes: ["P","M","G","GG","XG"] },
  { category: "Conjunto", gender: "Masculino", namePrefix: "Conjunto Moletom", desc: "Conjunto em moletom com calça e blusão.", priceRange: [199.9, 289.9], sizes: ["P","M","G","GG","XG"] },
];

const adultoUnissex: ProductTemplate[] = [
  { category: "Camiseta", gender: "Unissex", namePrefix: "Camiseta Orgânica", desc: "Camiseta em algodão orgânico certificado.", priceRange: [69.9, 99.9], sizes: ["PP","P","M","G","GG"] },
  { category: "Blusão", gender: "Unissex", namePrefix: "Moletom Sustentável", desc: "Moletom em algodão reciclado.", priceRange: [149.9, 219.9], sizes: ["PP","P","M","G","GG"] },
  { category: "Calça", gender: "Unissex", namePrefix: "Calça Jogger", desc: "Calça jogger em moletom orgânico.", priceRange: [119.9, 179.9], sizes: ["PP","P","M","G","GG"] },
  { category: "Jaqueta", gender: "Unissex", namePrefix: "Jaqueta Puffer", desc: "Jaqueta puffer leve com enchimento reciclado.", priceRange: [199.9, 299.9], sizes: ["PP","P","M","G","GG"] },
];

function roundPrice(v: number): number {
  return Math.round(v * 100) / 100;
}

function generateProducts(
  templates: ProductTemplate[],
  count: number,
  brandPrefix: string,
  subBrandIds: string[],
  startId: number,
  startRef: number,
): Product[] {
  const products: Product[] = [];
  for (let i = 0; i < count; i++) {
    const t = templates[i % templates.length];
    const variant = Math.floor(i / templates.length);
    const price = roundPrice(t.priceRange[0] + Math.random() * (t.priceRange[1] - t.priceRange[0]));
    const variantCount = 1 + (i % 3); // 1-3 color variants
    const suffixes = [
      "| Conforto e estilo", "| Design moderno", "| Alta qualidade",
      "| Toque premium", "| Coleção nova", "| Edição especial",
      "| Essencial", "| Versátil", "| Tendência", "| Casual chic",
    ];
    products.push({
      id: `${brandPrefix}-p${startId + i}`,
      ref: `${startRef + i}`,
      subBrandId: subBrandIds[i % subBrandIds.length],
      name: `${t.namePrefix} ${suffixes[i % suffixes.length]}`,
      description: t.desc,
      price,
      sizes: t.sizes,
      variants: makeVariants(variantCount, i * 3 + startId),
      likes: Math.floor(Math.random() * 50),
      comments: Math.floor(Math.random() * 15),
      category: t.category,
      gender: t.gender,
    });
  }
  return products;
}

export const brands: Brand[] = [
  {
    slug: "brandili",
    name: "Brandili",
    logo: brandBrandili,
    banner: concept1,
    description: "Moda infantil completa em todas as fases e idades.",
    connections: 20,
    totalProducts: 501,
    subBrands: [
      { id: "sb1", name: "BGR", logo: brandBrandili, vitrineImages: [concept1, concept2, concept3, concept5, concept6, concept4, concept7, concept8] },
      { id: "sb2", name: "GLINNY", logo: brandKyly, vitrineImages: [concept7, concept8, concept6, concept2, concept3] },
      { id: "sb3", name: "PINK SODA", logo: brandHering, vitrineImages: [concept4, concept3, concept5, concept1, concept8] },
      { id: "sb4", name: "BOCA GRANDE", logo: brandMalwee, vitrineImages: [concept2, concept6, concept1, concept7, concept4] },
    ],
    products: generateProducts([...juvenilMasc, ...infantilFem], 30, "brandili", ["sb1","sb2","sb3","sb4"], 1, 56934),
  },
  {
    slug: "kyly",
    name: "Kyly",
    logo: brandKyly,
    banner: concept3,
    description: "Streetwear infantil moderno e colorido.",
    connections: 15,
    totalProducts: 380,
    subBrands: [
      { id: "ky-sb1", name: "KYLY", logo: brandKyly, vitrineImages: [concept3, concept1, concept5, concept7] },
      { id: "ky-sb2", name: "MILON", logo: brandKyly, vitrineImages: [concept2, concept4, concept6, concept8] },
    ],
    products: generateProducts([...infantilMasc, ...infantilFem], 30, "kyly", ["ky-sb1","ky-sb2"], 1, 60100),
  },
  {
    slug: "hering",
    name: "Hering",
    logo: brandHering,
    banner: concept5,
    description: "Básicos reinventados com alfaiataria moderna.",
    connections: 45,
    totalProducts: 720,
    subBrands: [
      { id: "hr-sb1", name: "HERING", logo: brandHering, vitrineImages: [concept5, concept1, concept3, concept7] },
      { id: "hr-sb2", name: "HERING KIDS", logo: brandHering, vitrineImages: [concept2, concept6, concept4, concept8] },
    ],
    products: generateProducts([...adultoMasc, ...adultoFem], 30, "hering", ["hr-sb1","hr-sb2"], 1, 70200),
  },
  {
    slug: "malwee",
    name: "Malwee",
    logo: brandMalwee,
    banner: concept4,
    description: "Moda sustentável com texturas e tricôs artesanais.",
    connections: 18,
    totalProducts: 450,
    subBrands: [
      { id: "mw-sb1", name: "MALWEE", logo: brandMalwee, vitrineImages: [concept4, concept8, concept5, concept2] },
      { id: "mw-sb2", name: "MALWEE KIDS", logo: brandMalwee, vitrineImages: [concept1, concept3, concept6, concept7] },
    ],
    products: generateProducts([...adultoUnissex, ...adultoFem, ...adultoMasc], 30, "malwee", ["mw-sb1","mw-sb2"], 1, 80300),
  },
  {
    slug: "lunender",
    name: "Lunender",
    logo: brandLunender,
    banner: concept2,
    description: "Elegância contemporânea para mulheres sofisticadas.",
    connections: 22,
    totalProducts: 390,
    subBrands: [
      { id: "ln-sb1", name: "LUNENDER", logo: brandLunender, vitrineImages: [concept2, concept7, concept4, concept6] },
      { id: "ln-sb2", name: "LUNELLI", logo: brandLunender, vitrineImages: [concept1, concept5, concept3, concept8] },
    ],
    products: generateProducts(adultoFem, 30, "lunender", ["ln-sb1","ln-sb2"], 1, 90400),
  },
  {
    slug: "marisol",
    name: "Marisol",
    logo: brandMarisol,
    banner: concept6,
    description: "Candy colors e estampas vibrantes para crianças.",
    connections: 16,
    totalProducts: 340,
    subBrands: [
      { id: "ms-sb1", name: "MARISOL", logo: brandMarisol, vitrineImages: [concept6, concept2, concept8, concept4] },
      { id: "ms-sb2", name: "LILICA RIPILICA", logo: brandMarisol, vitrineImages: [concept7, concept1, concept3, concept5] },
    ],
    products: generateProducts([...infantilFem, ...infantilMasc], 30, "marisol", ["ms-sb1","ms-sb2"], 1, 10500),
  },
  {
    slug: "elian",
    name: "Elian",
    logo: brandElian,
    banner: concept7,
    description: "Paletas earth tones com design atemporal.",
    connections: 8,
    totalProducts: 280,
    subBrands: [
      { id: "el-sb1", name: "ELIAN", logo: brandElian, vitrineImages: [concept7, concept4, concept8, concept2] },
      { id: "el-sb2", name: "COLORITTÁ", logo: brandColoritta, vitrineImages: [concept3, concept5, concept1, concept6] },
    ],
    products: generateProducts([...infantilFem, ...infantilMasc], 30, "elian", ["el-sb1","el-sb2"], 1, 11600),
  },
  {
    slug: "colorittá",
    name: "Colorittá",
    logo: brandColoritta,
    banner: concept8,
    description: "Coleções florais e estampas exclusivas.",
    connections: 7,
    totalProducts: 220,
    subBrands: [
      { id: "ct-sb1", name: "COLORITTÁ", logo: brandColoritta, vitrineImages: [concept8, concept2, concept6, concept4] },
    ],
    products: generateProducts([...infantilFem, ...infantilMasc], 30, "coloritta", ["ct-sb1"], 1, 12700),
  },
];

export interface Opportunity {
  id: string;
  title: string;
  description: string;
  discountPercent: number;
  badgeText: string;
  expiresAt: string;
  productIds: string[];
  brandSlug: string;
  highlightColor: string;
  previewImages: string[];
}

const tomorrow = new Date(Date.now() + 86400000).toISOString();
const in3days = new Date(Date.now() + 86400000 * 3).toISOString();
const in7days = new Date(Date.now() + 86400000 * 7).toISOString();

export const mockOpportunities: Opportunity[] = [
  {
    id: "opp-1",
    title: "Queima de Estoque Inverno",
    description: "Últimas peças da coleção inverno com descontos imperdíveis. Estoque limitado!",
    discountPercent: 40,
    badgeText: "QUEIMA",
    expiresAt: tomorrow,
    productIds: brands[0].products.slice(0, 8).map((p) => p.id),
    brandSlug: "brandili",
    highlightColor: "bg-gradient-to-br from-red-500 to-orange-500",
    previewImages: [concept1, concept2, concept3],
  },
  {
    id: "opp-2",
    title: "Lançamento Exclusivo Verão 25",
    description: "Primeiros lojistas a comprar ganham condições especiais na nova coleção.",
    discountPercent: 15,
    badgeText: "EXCLUSIVO",
    expiresAt: in7days,
    productIds: brands[2].products.slice(0, 10).map((p) => p.id),
    brandSlug: "hering",
    highlightColor: "bg-gradient-to-br from-violet-600 to-indigo-500",
    previewImages: [concept5, concept6, concept7],
  },
  {
    id: "opp-3",
    title: "Compre 5 Leve 7",
    description: "Na compra de 5 peças, ganhe 2 extras. Válido para toda linha kids.",
    discountPercent: 28,
    badgeText: "LEVE MAIS",
    expiresAt: in3days,
    productIds: brands[1].products.slice(0, 12).map((p) => p.id),
    brandSlug: "kyly",
    highlightColor: "bg-gradient-to-br from-emerald-500 to-teal-500",
    previewImages: [concept3, concept4, concept8],
  },
  {
    id: "opp-4",
    title: "Desconto Progressivo",
    description: "10% acima de R$500, 20% acima de R$1000, 30% acima de R$2000.",
    discountPercent: 30,
    badgeText: "PROGRESSIVO",
    expiresAt: in7days,
    productIds: brands[3].products.slice(0, 10).map((p) => p.id),
    brandSlug: "malwee",
    highlightColor: "bg-gradient-to-br from-amber-500 to-yellow-500",
    previewImages: [concept4, concept2, concept6],
  },
];

export function getBrandBySlug(slug: string): Brand | undefined {
  return brands.find((b) => b.slug === slug);
}

export function getProductById(brandSlug: string, productId: string) {
  const brand = getBrandBySlug(brandSlug);
  if (!brand) return undefined;
  return brand.products.find((p) => p.id === productId);
}
  return brands.find((b) => b.slug === slug);
}

export function getProductById(brandSlug: string, productId: string) {
  const brand = getBrandBySlug(brandSlug);
  if (!brand) return undefined;
  return brand.products.find((p) => p.id === productId);
}
