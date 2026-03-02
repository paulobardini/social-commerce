import { useParams, useNavigate } from "react-router-dom";
import { NextilHeader } from "@/components/NextilHeader";
import { NextilSidebar } from "@/components/NextilSidebar";
import { MobileNav } from "@/components/MobileNav";
import { getBrandBySlug, type Product } from "@/data/mockProducts";
import { ProductDetailModal } from "@/components/ProductDetailModal";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  Heart,
  Search,
  SlidersHorizontal,
  MessageCircle,
  Percent,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const ProdutoDetalhe = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const brand = getBrandBySlug(slug || "");

  const [activeSubBrand, setActiveSubBrand] = useState<string | null>(
    brand?.subBrands[0]?.id || null
  );
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  if (!brand) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Marca não encontrada</p>
      </div>
    );
  }

  const filteredProducts = activeSubBrand
    ? brand.products.filter((p) => p.subBrandId === activeSubBrand)
    : brand.products;

  return (
    <div className="min-h-screen bg-background">
      <NextilHeader />
      <div className="flex">
        <NextilSidebar />
        <div className="flex-1 min-w-0 pb-16 md:pb-0">
          {/* Sticky top bar: brand info + search */}
          <div className="sticky top-14 md:top-16 z-30 bg-card border-b border-border">
            <div className="px-3 md:px-6 py-2.5 flex items-center justify-between gap-3">
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
                    className="h-8 w-48 rounded-lg border border-border bg-background pl-8 pr-3 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <span className="text-sm font-medium text-muted-foreground hidden md:block">Vitrine</span>
              </div>
            </div>

            {/* Breadcrumb */}
            <div className="px-3 md:px-6 pb-2 text-xs text-muted-foreground">
              <span className="cursor-pointer hover:text-foreground" onClick={() => navigate("/")}>
                início
              </span>
              {" / "}
              <span className="cursor-pointer hover:text-foreground" onClick={() => navigate(`/marca/${slug}`)}>
                vitrine
              </span>
              {" / "}
              <span className="text-foreground font-medium">Produtos</span>
            </div>
          </div>

          {/* Sticky filters: sub-brand tabs + filter buttons */}
          <div className="sticky top-[7.25rem] md:top-[8rem] z-20 bg-background border-b border-border">
            <div className="flex flex-col items-center px-3 md:px-6 py-3 gap-3">
              {/* Sub-brand tabs — centered */}
              <div className="flex gap-5 md:gap-8 overflow-x-auto scrollbar-hide justify-center">
                {brand.subBrands.map((sb) => (
                  <button
                    key={sb.id}
                    onClick={() => setActiveSubBrand(sb.id)}
                    className="flex flex-col items-center gap-1.5 group shrink-0"
                  >
                    <div
                      className={`h-12 w-12 md:h-14 md:w-14 rounded-full overflow-hidden border-2 transition-all ${
                        activeSubBrand === sb.id
                          ? "border-accent scale-105"
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
                      <motion.div layoutId="productSubBrand" className="h-[2px] w-8 bg-accent rounded-full -mt-0.5" />
                    )}
                  </button>
                ))}
              </div>

              {/* Filter buttons — right-aligned */}
              <div className="flex items-center gap-2 self-end">
                <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
                  <Percent className="h-3 w-3" />
                  Off
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  <span className="bg-accent text-accent-foreground rounded-full h-4 w-4 flex items-center justify-center text-[10px] font-bold">
                    1
                  </span>
                </Button>
              </div>
            </div>
          </div>

          {/* Product grid */}
          <div className="px-3 md:px-6 py-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSubBrand}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4"
              >
                {filteredProducts.map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => setSelectedProduct(p)}
                    className="bg-card rounded-xl overflow-hidden border border-border cursor-pointer group card-hover"
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
                    <div className="p-3">
                      <p className="text-[10px] font-bold text-accent uppercase">
                        {brand.subBrands.find((sb) => sb.id === p.subBrandId)?.name}
                      </p>
                      <p className="text-[9px] text-muted-foreground">Ref: {p.ref}</p>
                      <p className="text-xs text-foreground mt-1 line-clamp-2 leading-relaxed">
                        {p.name}
                      </p>
                      <p className="text-sm font-bold text-foreground mt-1.5">
                        R$ {p.price.toFixed(2).replace(".", ",")}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-[9px] text-muted-foreground">
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
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
      <MobileNav />

      {/* Product Detail Modal (slide-over) */}
      <AnimatePresence>
        {selectedProduct && (
          <ProductDetailModal
            product={selectedProduct}
            brand={brand}
            onClose={() => setSelectedProduct(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProdutoDetalhe;
