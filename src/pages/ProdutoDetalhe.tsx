import { useParams, useNavigate } from "react-router-dom";
import { NextilHeader } from "@/components/NextilHeader";
import { NextilSidebar } from "@/components/NextilSidebar";
import { MobileNav } from "@/components/MobileNav";
import { getBrandBySlug, getProductById } from "@/data/mockProducts";
import { GradeAbertaModal } from "@/components/GradeAbertaModal";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  Heart,
  ChevronDown,
  ChevronUp,
  Search,
  SlidersHorizontal,
  MessageCircle,
  LayoutGrid,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const ProdutoDetalhe = () => {
  const { slug, productId } = useParams<{ slug: string; productId: string }>();
  const navigate = useNavigate();
  const brand = getBrandBySlug(slug || "");
  const product = getProductById(slug || "", productId || "");

  const [selectedImage, setSelectedImage] = useState(0);
  const [descOpen, setDescOpen] = useState(true);
  const [specsOpen, setSpecsOpen] = useState(false);
  const [gradeOpen, setGradeOpen] = useState(false);
  const [activeSubBrand, setActiveSubBrand] = useState<string | null>(
    product?.subBrandId || null
  );

  if (!brand || !product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Produto não encontrado</p>
      </div>
    );
  }

  const currentImages = product.variants[0]?.images || [];
  const filteredProducts = activeSubBrand
    ? brand.products.filter((p) => p.subBrandId === activeSubBrand)
    : brand.products;

  return (
    <div className="min-h-screen bg-background">
      <NextilHeader />
      <div className="flex">
        <NextilSidebar />
        <div className="flex-1 min-w-0 pb-16 md:pb-0">
          {/* Top bar */}
          <div className="sticky top-14 md:top-16 z-30 bg-card border-b border-border px-3 md:px-6 py-2 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(`/marca/${slug}`)}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <img
                src={brand.logo}
                alt={brand.name}
                className="h-8 w-8 rounded-full object-cover border border-border"
              />
              <span className="text-sm font-semibold text-foreground">{brand.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative hidden md:flex items-center">
                <Search className="absolute left-3 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Pesquisar"
                  className="h-8 w-40 rounded-lg border border-border bg-background pl-8 pr-3 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              <span className="text-sm font-medium text-muted-foreground hidden md:block">Vitrine</span>
            </div>
          </div>

          {/* Breadcrumb */}
          <div className="px-3 md:px-6 py-2 text-xs text-muted-foreground">
            <span className="cursor-pointer hover:text-foreground" onClick={() => navigate("/")}>
              início
            </span>
            {" / "}
            <span className="cursor-pointer hover:text-foreground" onClick={() => navigate(`/marca/${slug}`)}>
              vitrine
            </span>
            {" / "}
            <span className="text-foreground">Produtos</span>
          </div>

          {/* Sub-brand tabs */}
          <div className="flex justify-center py-4 border-b border-border">
            <div className="flex gap-4 md:gap-8">
              {brand.subBrands.map((sb) => (
                <button
                  key={sb.id}
                  onClick={() => setActiveSubBrand(sb.id)}
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <div
                    className={`h-12 w-12 md:h-16 md:w-16 rounded-full overflow-hidden border-2 transition-colors ${
                      activeSubBrand === sb.id
                        ? "border-accent"
                        : "border-border group-hover:border-muted-foreground"
                    }`}
                  >
                    <img src={sb.logo} alt={sb.name} className="h-full w-full object-cover" />
                  </div>
                  <span
                    className={`text-[10px] md:text-xs font-semibold uppercase tracking-wide ${
                      activeSubBrand === sb.id ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {sb.name}
                  </span>
                  {activeSubBrand === sb.id && (
                    <div className="h-0.5 w-6 bg-accent rounded-full -mt-0.5" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Main content: product grid + detail panel */}
          <div className="flex flex-col lg:flex-row">
            {/* Product grid (left) */}
            <div className="flex-1 min-w-0 px-3 md:px-6 py-4">
              {/* Filter bar */}
              <div className="flex items-center justify-end gap-2 mb-4">
                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                  % Off
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  <span className="bg-accent text-accent-foreground rounded-full h-4 w-4 flex items-center justify-center text-[10px]">
                    1
                  </span>
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredProducts.map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => navigate(`/marca/${slug}/produto/${p.id}`)}
                    className={`bg-card rounded-xl overflow-hidden border cursor-pointer group card-hover ${
                      p.id === product.id ? "border-accent ring-1 ring-accent" : "border-border"
                    }`}
                  >
                    <div className="relative aspect-[3/4] overflow-hidden">
                      <img
                        src={p.variants[0]?.images[0]}
                        alt={p.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="absolute top-2 right-2 h-7 w-7 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Heart className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="p-2.5">
                      <p className="text-[10px] font-bold text-accent uppercase">
                        {brand.subBrands.find((sb) => sb.id === p.subBrandId)?.name}
                      </p>
                      <p className="text-[9px] text-muted-foreground">Ref: {p.ref}</p>
                      <p className="text-[10px] text-foreground mt-0.5 line-clamp-2">{p.name}</p>
                      <p className="text-xs font-bold text-foreground mt-1">
                        R$ {p.price.toFixed(2).replace(".", ",")}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 text-[9px] text-muted-foreground">
                        <span className="flex items-center gap-0.5">
                          <Heart className="h-2.5 w-2.5" /> {p.likes}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <MessageCircle className="h-2.5 w-2.5" /> {p.comments}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Product detail panel (right) */}
            <div className="lg:w-[420px] xl:w-[480px] lg:sticky lg:top-[7.5rem] lg:h-[calc(100vh-7.5rem)] lg:overflow-y-auto border-l border-border bg-card">
              {/* Main image */}
              <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={selectedImage}
                    src={currentImages[selectedImage]}
                    alt={product.name}
                    className="h-full w-full object-cover"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  />
                </AnimatePresence>
                <button
                  className="absolute top-3 right-3 h-9 w-9 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Heart className="h-5 w-5" />
                </button>
              </div>

              {/* Thumbnails */}
              <div className="flex gap-2 p-3 overflow-x-auto scrollbar-hide">
                {currentImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`h-16 w-16 md:h-20 md:w-20 rounded-lg overflow-hidden shrink-0 border-2 transition-colors ${
                      selectedImage === idx ? "border-accent" : "border-border"
                    }`}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>

              {/* Product info */}
              <div className="px-4 md:px-6 pb-6">
                <p className="text-xs text-muted-foreground">Ref: {product.ref}</p>
                <h2 className="text-lg md:text-xl font-bold text-foreground mt-1 leading-tight">
                  {product.name}
                </h2>
                <p className="text-xl md:text-2xl font-bold text-foreground mt-3">
                  R$ {product.price.toFixed(2).replace(".", ",")}
                </p>

                {/* Description accordion */}
                <button
                  onClick={() => setDescOpen(!descOpen)}
                  className="flex items-center justify-between w-full py-3 mt-4 border-t border-border"
                >
                  <span className="text-sm font-semibold text-foreground">Descrição</span>
                  {descOpen ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
                <AnimatePresence>
                  {descOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="text-sm text-muted-foreground leading-relaxed pb-3">
                        {product.description}
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-1 pb-3">
                        <li>- Malha Meia Malha de alta qualidade, garantindo conforto e caimento suave.</li>
                        <li>- Peça essencial de meia estação, com alto potencial de venda.</li>
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Specs accordion */}
                <button
                  onClick={() => setSpecsOpen(!specsOpen)}
                  className="flex items-center justify-between w-full py-3 border-t border-border"
                >
                  <span className="text-sm font-semibold text-foreground">Especificações</span>
                  {specsOpen ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
                <AnimatePresence>
                  {specsOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="text-sm text-muted-foreground space-y-2 pb-3">
                        <p>Composição: 100% Algodão</p>
                        <p>Tamanhos: {product.sizes.join(", ")}</p>
                        <p>Cores: {product.variants.map((v) => v.color).join(", ")}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Buy button */}
                <Button
                  onClick={() => setGradeOpen(true)}
                  className="w-full mt-4 gap-2"
                  size="lg"
                >
                  <LayoutGrid className="h-4 w-4" />
                  Comprar | Montar Grade
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <MobileNav />

      <GradeAbertaModal
        open={gradeOpen}
        onOpenChange={setGradeOpen}
        product={product}
      />
    </div>
  );
};

export default ProdutoDetalhe;
