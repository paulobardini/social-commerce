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
  Search,
  SlidersHorizontal,
  Percent,
  ShoppingBag,
  LayoutGrid,
  PackagePlus,
  X,
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
  const [sideMode, setSideMode] = useState(false);
  const [addAllModal, setAddAllModal] = useState(false);

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

  const defaultGradeSummary = filteredProducts.map((p) => ({
    name: p.name,
    ref: p.ref,
    sizes: p.sizes,
    perSize: 1,
    colors: p.variants.length,
    total: p.sizes.length * p.variants.length,
    price: p.sizes.length * p.variants.length * p.price,
  }));

  const grandTotal = defaultGradeSummary.reduce((a, b) => a + b.total, 0);
  const grandPrice = defaultGradeSummary.reduce((a, b) => a + b.price, 0);

  return (
    <div className="min-h-screen bg-background">
      <NextilHeader />
      <div className="flex">
        <NextilSidebar />
        <div className={`flex-1 min-w-0 pb-16 md:pb-0 transition-all duration-300 ${sideMode && selectedProduct ? 'mr-[380px]' : ''}`}>
          {/* Compact sticky header */}
          <div className="sticky top-14 md:top-16 z-30 bg-card border-b border-border">
            <div className="px-3 md:px-6 py-2 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <button
                  onClick={() => navigate(`/marca/${slug}`)}
                  className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="h-7 w-7 rounded-md object-cover border border-border shrink-0"
                />
                <div className="flex items-center gap-1.5 text-xs min-w-0">
                  <span className="font-semibold text-foreground shrink-0">{brand.name}</span>
                  <span className="text-muted-foreground hidden sm:inline">/</span>
                  <span className="text-muted-foreground hidden sm:inline truncate">Produtos</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="relative flex items-center">
                  <Search className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder={`Buscar em ${brand.name}...`}
                    className="h-8 w-36 md:w-52 rounded-lg border border-border bg-background pl-8 pr-3 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <Button
                  size="sm"
                  onClick={() => setAddAllModal(true)}
                  className="gap-1.5 text-xs h-8 px-3"
                >
                  <PackagePlus className="h-3.5 w-3.5" />
                  <span className="hidden md:inline">Adicionar todos</span>
                  <span className="md:hidden">Todos</span>
                  <span className="bg-primary-foreground/20 text-primary-foreground rounded-full h-4 min-w-4 px-1 flex items-center justify-center text-[9px] font-bold">
                    {filteredProducts.length}
                  </span>
                </Button>
              </div>
            </div>

            {/* Sub-brand tabs + filters */}
            <div className="px-3 md:px-6 py-2 flex items-center justify-between gap-2 bg-background/80">
              <div className="flex gap-3 md:gap-5 overflow-x-auto scrollbar-hide">
                {brand.subBrands.map((sb) => (
                  <button
                    key={sb.id}
                    onClick={() => setActiveSubBrand(sb.id)}
                    className="flex items-center gap-2 group shrink-0"
                  >
                    <div
                      className={`h-8 w-8 rounded-full overflow-hidden border-[2px] transition-all ${
                        activeSubBrand === sb.id
                          ? "border-accent"
                          : "border-border/50 group-hover:border-muted-foreground"
                      }`}
                    >
                      <img src={sb.logo} alt={sb.name} className="h-full w-full object-cover" />
                    </div>
                    <span
                      className={`text-[11px] font-semibold uppercase tracking-wide ${
                        activeSubBrand === sb.id ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {sb.name}
                    </span>
                    {activeSubBrand === sb.id && (
                      <motion.div layoutId="productSubBrand" className="hidden" />
                    )}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <Button variant="outline" size="sm" className="gap-1 text-xs h-7 px-2.5 rounded-md">
                  <Percent className="h-3 w-3" />
                  Off
                </Button>
                <Button variant="outline" size="sm" className="gap-1 text-xs h-7 px-2.5 rounded-md">
                  <SlidersHorizontal className="h-3 w-3" />
                  <span className="bg-accent text-accent-foreground rounded-full h-4 min-w-4 flex items-center justify-center text-[9px] font-bold">
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
                      {/* Quick actions overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity translate-y-1 group-hover:translate-y-0 duration-200">
                        <button
                          onClick={(e) => { e.stopPropagation(); }}
                          className="flex-1 h-7 rounded-md bg-primary text-primary-foreground text-[10px] font-semibold flex items-center justify-center gap-1 hover:bg-primary/90 transition-colors"
                        >
                          <ShoppingBag className="h-3 w-3" />
                          Comprar
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedProduct(p); }}
                          className="h-7 w-7 rounded-md bg-card/90 backdrop-blur-sm border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                          title="Montar Grade"
                        >
                          <LayoutGrid className="h-3 w-3" />
                        </button>
                      </div>
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
                      <p className="text-[9px] text-muted-foreground mt-1">
                        {p.sizes.length} tamanhos · {p.variants.length} {p.variants.length === 1 ? "cor" : "cores"}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
      <MobileNav />

      {/* Product Detail Modal */}
      <AnimatePresence>
         {selectedProduct && (
          <ProductDetailModal
            product={selectedProduct}
            brand={brand}
            onClose={() => { setSelectedProduct(null); setSideMode(false); }}
            onFindSimilar={() => setSideMode(true)}
          />
        )}
      </AnimatePresence>

      {/* Add All Products Modal */}
      <AnimatePresence>
        {addAllModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAddAllModal(false)}
              className="fixed inset-0 z-50 bg-foreground/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed z-50 inset-4 sm:inset-y-6 md:inset-y-8 md:left-[15%] md:right-[15%] lg:left-[20%] lg:right-[20%] bg-card rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
                <div>
                  <h2 className="text-base font-bold text-foreground">Adicionar todos os produtos</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {filteredProducts.length} produtos · Grade padrão (1 peça por tamanho/cor)
                  </p>
                </div>
                <button
                  onClick={() => setAddAllModal(false)}
                  className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Products summary list */}
              <div className="flex-1 overflow-y-auto px-5 py-3">
                <div className="space-y-2">
                  {defaultGradeSummary.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                      <img
                        src={filteredProducts[idx].variants[0]?.images[0]}
                        alt={item.name}
                        className="h-12 w-12 rounded-lg object-cover border border-border shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">{item.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          Ref: {item.ref} · {item.sizes.join(", ")} · {item.colors} {item.colors === 1 ? "cor" : "cores"}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[10px] text-muted-foreground">{item.total} peças</p>
                        <p className="text-xs font-bold text-foreground">
                          R$ {item.price.toFixed(2).replace(".", ",")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="shrink-0 border-t border-border bg-muted/30 px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{filteredProducts.length} produtos · {grandTotal} peças</p>
                  <p className="text-lg font-bold text-foreground">
                    R$ {grandPrice.toFixed(2).replace(".", ",")}
                  </p>
                </div>
                <Button onClick={() => setAddAllModal(false)} className="gap-1.5">
                  <ShoppingBag className="h-4 w-4" />
                  Adicionar à sacola
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProdutoDetalhe;