import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, Search, LayoutGrid } from "lucide-react";
import { getBrandBySlug } from "@/data/mockProducts";
import concept1 from "@/assets/concept-1.jpg";
import concept2 from "@/assets/concept-2.jpg";
import concept3 from "@/assets/concept-3.jpg";
import concept4 from "@/assets/concept-4.jpg";
import concept5 from "@/assets/concept-5.jpg";
import concept6 from "@/assets/concept-6.jpg";
import concept7 from "@/assets/concept-7.jpg";
import concept8 from "@/assets/concept-8.jpg";

const COLECOES = [
  { slug: "inverno-26", nome: "Inverno 26", tag: "Nova coleção", imgs: [concept1, concept2, concept3], pecas: 128 },
  { slug: "alto-verao-26", nome: "Alto Verão 26", tag: "Em pré-venda", imgs: [concept5, concept6, concept4], pecas: 94 },
  { slug: "primavera-26", nome: "Primavera 26", tag: "Disponível", imgs: [concept7, concept8, concept2], pecas: 76 },
  { slug: "basicos", nome: "Básicos", tag: "Reposição contínua", imgs: [concept3, concept5, concept8], pecas: 42 },
  { slug: "festas-26", nome: "Festas 26", tag: "Cápsula", imgs: [concept6, concept1, concept7], pecas: 31 },
];

const MarcaColecoes = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const brand = getBrandBySlug(slug || "");
  const [busca, setBusca] = useState("");

  const lista = useMemo(
    () => COLECOES.filter((c) => c.nome.toLowerCase().includes(busca.toLowerCase())),
    [busca]
  );

  if (!brand) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Marca não encontrada</p>
      </div>
    );
  }

  const goProdutos = (colecao?: string) =>
    navigate(`/marca/${slug}/produtos${colecao ? `?colecao=${colecao}` : ""}`);

  return (
    <div className="flex-1 min-w-0 pb-16 md:pb-0 bg-background">
      {/* Header minimalista */}
      <div className="border-b border-border/60 bg-background sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center gap-3">
          <button
            onClick={() => navigate(`/marca/${slug}`)}
            className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
            aria-label="Voltar"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <img
            src={brand.logo}
            alt={brand.name}
            className="h-9 w-9 rounded-full object-cover border border-border shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h1 className="text-base md:text-lg font-semibold text-foreground truncate leading-tight">
              {brand.name}
            </h1>
            <p className="text-[11px] md:text-xs text-muted-foreground">
              {COLECOES.length} coleções
            </p>
          </div>

          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar coleção"
              className="h-9 w-56 pl-9 pr-3 rounded-full bg-muted/60 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-background transition"
            />
          </div>

          <button
            onClick={() => goProdutos()}
            className="hidden md:inline-flex text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            Ver todos os produtos
          </button>
        </div>

        {/* Busca mobile */}
        <div className="md:hidden px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar coleção"
              className="h-9 w-full pl-9 pr-3 rounded-full bg-muted/60 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-background transition"
            />
          </div>
        </div>
      </div>

      {/* Grid de boards */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-5 md:py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          {lista.map((c, i) => (
            <BoardCard
              key={c.slug}
              nome={c.nome}
              tag={c.tag}
              pecas={c.pecas}
              imgs={c.imgs}
              delay={i * 0.04}
              onClick={() => goProdutos(c.slug)}
            />
          ))}

          {/* Card "Ver todos" no mesmo formato */}
          <VerTodosCard
            imgs={[concept4, concept7]}
            delay={lista.length * 0.04}
            onClick={() => goProdutos()}
          />
        </div>
      </div>
    </div>
  );
};

/* --- Board card estilo Pinterest --- */
function BoardCard({
  nome,
  tag,
  pecas,
  imgs,
  delay,
  onClick,
}: {
  nome: string;
  tag: string;
  pecas: number;
  imgs: string[];
  delay: number;
  onClick: () => void;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      onClick={onClick}
      className="group text-left focus:outline-none"
    >
      <div className="relative rounded-2xl overflow-hidden bg-muted transition-all duration-300 group-hover:shadow-md group-hover:scale-[1.01]">
        <div className="grid grid-cols-3 gap-[2px] aspect-[3/2]">
          <div className="col-span-2 row-span-2 bg-muted overflow-hidden">
            <img
              src={imgs[0]}
              alt=""
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <div className="bg-muted overflow-hidden">
            <img src={imgs[1]} alt="" className="h-full w-full object-cover" />
          </div>
          <div className="bg-muted overflow-hidden">
            <img src={imgs[2]} alt="" className="h-full w-full object-cover" />
          </div>
        </div>
      </div>

      <div className="pt-2.5 px-0.5">
        <h3 className="text-sm md:text-[15px] font-semibold text-foreground leading-tight truncate">
          {nome}
        </h3>
        <p className="text-[11px] md:text-xs text-muted-foreground mt-0.5">
          {pecas} peças · {tag}
        </p>
      </div>
    </motion.button>
  );
}

/* --- Card "Ver todos" no mesmo formato --- */
function VerTodosCard({
  imgs,
  delay,
  onClick,
}: {
  imgs: string[];
  delay: number;
  onClick: () => void;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      onClick={onClick}
      className="group text-left focus:outline-none"
    >
      <div className="relative rounded-2xl overflow-hidden bg-muted transition-all duration-300 group-hover:shadow-md group-hover:scale-[1.01]">
        <div className="grid grid-cols-3 gap-[2px] aspect-[3/2]">
          <div className="col-span-2 row-span-2 bg-primary/5 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-primary">
              <LayoutGrid className="h-8 w-8" />
              <span className="text-[11px] font-semibold uppercase tracking-wider">
                Tudo
              </span>
            </div>
          </div>
          <div className="bg-muted overflow-hidden">
            <img src={imgs[0]} alt="" className="h-full w-full object-cover" />
          </div>
          <div className="bg-muted overflow-hidden">
            <img src={imgs[1]} alt="" className="h-full w-full object-cover" />
          </div>
        </div>
      </div>

      <div className="pt-2.5 px-0.5">
        <h3 className="text-sm md:text-[15px] font-semibold text-foreground leading-tight truncate">
          Todos os produtos
        </h3>
        <p className="text-[11px] md:text-xs text-muted-foreground mt-0.5">
          Catálogo completo
        </p>
      </div>
    </motion.button>
  );
}

export default MarcaColecoes;
