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

export interface SubBrand {
  id: string;
  name: string;
  logo: string;
  /** Conceptual/editorial images for the vitrine */
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
      {
        id: "sb1",
        name: "BGR",
        logo: brandBrandili,
        vitrineImages: [concept1, concept2, concept3, concept5, concept6, concept4, concept7, concept8],
      },
      {
        id: "sb2",
        name: "GLINNY",
        logo: brandKyly,
        vitrineImages: [concept7, concept8, concept6, concept2, concept3],
      },
      {
        id: "sb3",
        name: "PINK SODA",
        logo: brandHering,
        vitrineImages: [concept4, concept3, concept5, concept1, concept8],
      },
      {
        id: "sb4",
        name: "BOCA GRANDE",
        logo: brandMalwee,
        vitrineImages: [concept2, concept6, concept1, concept7, concept4],
      },
    ],
    products: [
      {
        id: "p1",
        ref: "56934",
        subBrandId: "sb1",
        name: "Camiseta Meia Malha | Essencial para transição e conforto leve",
        description: "Disponível nos tamanhos 12 ao 20, esta camiseta de manga longa é uma peça de alta rotatividade para a meia estação. É confeccionada em Meia Malha, oferecendo um toque macio, leveza e excelente respirabilidade, ideal para o uso diário.",
        price: 70.90,
        sizes: ["12", "14", "16", "18", "20"],
        variants: [
          { color: "Branco", colorHex: "#F5F5F5", images: [concept5, concept6, concept7, concept8] },
          { color: "Cinza", colorHex: "#6B7280", images: [concept5, concept6] },
          { color: "Preto", colorHex: "#1F2937", images: [concept5, concept7] },
        ],
        likes: 0,
        comments: 0,
      },
      {
        id: "p2",
        ref: "56935",
        subBrandId: "sb1",
        name: "Calça Jogging Moletom Felpado | Aconchego, estilo e versatilidade",
        description: "Calça jogging em moletom felpado, confortável e moderna para o dia a dia.",
        price: 126.90,
        sizes: ["12", "14", "16", "18", "20"],
        variants: [
          { color: "Cinza", colorHex: "#6B7280", images: [concept2, concept3] },
          { color: "Preto", colorHex: "#1F2937", images: [concept2] },
        ],
        likes: 0,
        comments: 0,
      },
      {
        id: "p3",
        ref: "56936",
        subBrandId: "sb1",
        name: "Blusão Moletom Felpado | Conforto oversized e bolso canguru",
        description: "Blusão oversized em moletom felpado com bolso canguru funcional.",
        price: 121.90,
        sizes: ["12", "14", "16", "18", "20"],
        variants: [
          { color: "Bege", colorHex: "#D4B896", images: [concept3, concept4] },
          { color: "Marrom", colorHex: "#8B6F47", images: [concept3] },
        ],
        likes: 0,
        comments: 0,
      },
      {
        id: "p4",
        ref: "56937",
        subBrandId: "sb1",
        name: "Jaqueta Moletom Felpado | Design Color Block e Detalhe Moderno",
        description: "Jaqueta em moletom felpado com design color block contemporâneo.",
        price: 175.90,
        sizes: ["12", "14", "16", "18", "20"],
        variants: [
          { color: "Preto/Laranja", colorHex: "#1F2937", images: [concept4, concept1] },
        ],
        likes: 0,
        comments: 0,
      },
      {
        id: "p5",
        ref: "56938",
        subBrandId: "sb1",
        name: "Conj. Moletom Felpado | Conforto Inverno e Estampa",
        description: "Conjunto moletom felpado para o inverno com estampa exclusiva.",
        price: 189.90,
        sizes: ["12", "14", "16", "18", "20"],
        variants: [
          { color: "Chumbo", colorHex: "#4B5563", images: [concept6, concept7] },
        ],
        likes: 0,
        comments: 0,
      },
      {
        id: "p6",
        ref: "56939",
        subBrandId: "sb1",
        name: "Camiseta Suedine Juvenil | Toque aveludado e confortável",
        description: "Camiseta em suedine com toque aveludado premium para uso diário.",
        price: 65.90,
        sizes: ["12", "14", "16", "18", "20"],
        variants: [
          { color: "Azul Marinho", colorHex: "#1E3A5F", images: [concept1, concept2] },
          { color: "Branco", colorHex: "#F5F5F5", images: [concept1] },
        ],
        likes: 0,
        comments: 0,
      },
      {
        id: "p7",
        ref: "56941",
        subBrandId: "sb2",
        name: "Vestido Florido | Charme e delicadeza para meninas",
        description: "Vestido com estampa floral delicada para ocasiões especiais.",
        price: 89.90,
        sizes: ["4", "6", "8", "10", "12"],
        variants: [
          { color: "Rosa", colorHex: "#F9A8D4", images: [concept7, concept8] },
        ],
        likes: 0,
        comments: 0,
      },
      {
        id: "p8",
        ref: "56942",
        subBrandId: "sb2",
        name: "Conjunto Malha | Conforto diário com estilo",
        description: "Conjunto em malha confortável para o dia a dia das meninas.",
        price: 115.90,
        sizes: ["4", "6", "8", "10", "12"],
        variants: [
          { color: "Lilás", colorHex: "#C4B5FD", images: [concept8, concept6] },
          { color: "Rosa", colorHex: "#F9A8D4", images: [concept8] },
        ],
        likes: 0,
        comments: 0,
      },
    ],
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
