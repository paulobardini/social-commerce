import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, LayoutGrid, ArrowRight } from "lucide-react";
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
    <div className="flex-1 min-w-0 pb-16 md:pb-0">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate(`/marca/${slug}`)}
            className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
            aria-label="Voltar"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <img src={brand.logo} alt={brand.name} className="h-10 w-10 rounded-lg object-cover border border-border" />
          <div className="min-w-0 flex-1">
            <h1 className="text-lg md:text-xl font-bold text-foreground truncate">{brand.name}</h1>
            <p className="text-xs text-muted-foreground">Escolha uma coleção para explorar</p>
          </div>
          <button
            onClick={() => goProdutos()}
            className="hidden md:inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            Ver todos os produtos <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {COLECOES.map((c, i) => (
            <motion.button
              key={c.slug}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => goProdutos(c.slug)}
              className="group text-left bg-card rounded-2xl overflow-hidden border border-border hover:border-primary hover:shadow-lg transition-all"
            >
              <div className="relative aspect-[4/3] grid grid-cols-3 gap-0.5 bg-muted">
                {c.imgs.map((src, idx) => (
                  <img
                    key={idx}
                    src={src}
                    alt=""
                    className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                      idx === 0 ? "col-span-2 row-span-2" : ""
                    }`}
                  />
                ))}
                <span className="absolute top-3 left-3 text-[10px] font-semibold uppercase tracking-wider bg-background/90 text-foreground px-2 py-1 rounded-full">
                  {c.tag}
                </span>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">{c.nome}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{c.pecas} peças</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </motion.button>
          ))}

          {/* Ver todos */}
          <motion.button
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: COLECOES.length * 0.05 }}
            onClick={() => goProdutos()}
            className="group text-left rounded-2xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-3 p-8 min-h-[220px]"
          >
            <div className="h-14 w-14 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <LayoutGrid className="h-6 w-6" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-foreground">Ver todos os produtos</h3>
              <p className="text-xs text-muted-foreground mt-1">Catálogo completo da {brand.name}</p>
            </div>
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default MarcaColecoes;
