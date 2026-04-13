import { useParams, useNavigate } from "react-router-dom";
import { getBrandBySlug, mockOpportunities, type Product } from "@/data/mockProducts";
import { OpportunitiesSection } from "@/components/OpportunitiesSection";
import { ProductDetailModal } from "@/components/ProductDetailModal";
import { FilterSheet, defaultFilters, countActiveFilters, type FilterState } from "@/components/FilterSheet";
import { DiscountModal } from "@/components/DiscountModal";
import { useCart } from "@/contexts/CartContext";
import { useState, useMemo } from "react";
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
  Trash2,
  FileText,
} from "lucide-react";
import { CommercialPolicyModal } from "@/components/CommercialPolicyModal";
import { Button } from "@/components/ui/button";

const ProdutoDetalhe = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const brand = getBrandBySlug(slug || "");
  const cart = useCart();

  const [activeSubBrand, setActiveSubBrand] = useState<string | null>(
    brand?.subBrands[0]?.id || null
  );
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [openInGrade, setOpenInGrade] = useState(false);
  const [sideMode, setSideMode] = useState(false);
  const [addAllModal, setAddAllModal] = useState(false);
  const [excludedIds, setExcludedIds] = useState<Set<string>>(new Set());
  const [gradeQty, setGradeQty] = useState<Record<string, number>>({});
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [discountOpen, setDiscountOpen] = useState(false);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [policyModalOpen, setPolicyModalOpen] = useState(false);

  const allBrandProducts = useMemo(
    () => (brand && activeSubBrand ? brand.products.filter((p) => p.subBrandId === activeSubBrand) : brand?.products || []),
    [brand, activeSubBrand]
  );

  const filteredProducts = useMemo(() => {
    let list = allBrandProducts;
    if (filters.categories.length) list = list.filter((p) => filters.categories.includes(p.category));
    if (filters.genders.length) list = list.filter((p) => filters.genders.includes(p.gender));
    if (filters.sizes.length) list = list.filter((p) => p.sizes.some((s) => filters.sizes.includes(s)));
    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split("-").map(Number);
      list = list.filter((p) => {
        if (filters.priceRange === "200+") return p.price >= 200;
        return p.price >= min && p.price <= max;
      });
    } else {
      const min = parseFloat(filters.priceMin);
      const max = parseFloat(filters.priceMax);
      if (!isNaN(min)) list = list.filter((p) => p.price >= min);
      if (!isNaN(max)) list = list.filter((p) => p.price <= max);
    }
    return list;
  }, [allBrandProducts, filters]);

  const activeProducts = useMemo(
    () => filteredProducts.filter((p) => !excludedIds.has(p.id)),
    [filteredProducts, excludedIds]
  );

  const getQty = (id: string) => gradeQty[id] ?? 1;

  const summaryByCategory = useMemo(() => {
    const map = new Map<string, { count: number; totalPieces: number; totalPrice: number; prices: number[] }>();
    activeProducts.forEach((p) => {
      const q = getQty(p.id);
      const pieces = p.sizes.length * p.variants.length * q;
      const existing = map.get(p.category) || { count: 0, totalPieces: 0, totalPrice: 0, prices: [] };
      existing.count++;
      existing.totalPieces += pieces;
      existing.totalPrice += pieces * p.price;
      existing.prices.push(p.price);
      map.set(p.category, existing);
    });
    return map;
  }, [activeProducts, gradeQty]);

  const summaryByGender = useMemo(() => {
    const map = new Map<string, { count: number; totalPieces: number; totalPrice: number; prices: number[] }>();
    activeProducts.forEach((p) => {
      const q = getQty(p.id);
      const pieces = p.sizes.length * p.variants.length * q;
      const existing = map.get(p.gender) || { count: 0, totalPieces: 0, totalPrice: 0, prices: [] };
      existing.count++;
      existing.totalPieces += pieces;
      existing.totalPrice += pieces * p.price;
      existing.prices.push(p.price);
      map.set(p.gender, existing);
    });
    return map;
  }, [activeProducts, gradeQty]);

  const summaryBySize = useMemo(() => {
    const map = new Map<string, number>();
    activeProducts.forEach((p) => {
      const q = getQty(p.id);
      p.sizes.forEach((s) => {
        map.set(s, (map.get(s) || 0) + p.variants.length * q);
      });
    });
    return map;
  }, [activeProducts, gradeQty]);

  const grandTotal = activeProducts.reduce((a, p) => a + p.sizes.length * p.variants.length * getQty(p.id), 0);
  const grandPrice = activeProducts.reduce((a, p) => a + p.sizes.length * p.variants.length * getQty(p.id) * p.price, 0);
  const avgPrice = activeProducts.length > 0 ? grandPrice / grandTotal : 0;

  const toggleExclude = (id: string) => {
    setExcludedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const openAddAllModal = () => {
    setExcludedIds(new Set());
    setGradeQty({});
    setAddAllModal(true);
  };

  if (!brand) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Marca não encontrada</p>
      </div>
    );
  }

  const fmt = (v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`;

  return (
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
                <img src={brand.logo} alt={brand.name} className="h-7 w-7 rounded-md object-cover border border-border shrink-0" />
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
                <Button size="sm" onClick={openAddAllModal} className="gap-1.5 text-xs h-8 px-3">
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
                    <div className={`h-8 w-8 rounded-full overflow-hidden border-[2px] transition-all ${activeSubBrand === sb.id ? "border-accent" : "border-border/50 group-hover:border-muted-foreground"}`}>
                      <img src={sb.logo} alt={sb.name} className="h-full w-full object-cover" />
                    </div>
                    <span className={`text-[11px] font-semibold uppercase tracking-wide ${activeSubBrand === sb.id ? "text-foreground" : "text-muted-foreground"}`}>
                      {sb.name}
                    </span>
                    {activeSubBrand === sb.id && <motion.div layoutId="productSubBrand" className="hidden" />}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Button variant="outline" size="sm" onClick={() => setPolicyModalOpen(true)} className="gap-1 text-xs h-7 px-2.5 rounded-md">
                  <FileText className="h-3 w-3" /> Política
                </Button>
                <Button variant="outline" size="sm" onClick={() => setDiscountOpen(true)} className="gap-1 text-xs h-7 px-2.5 rounded-md">
                  <Percent className="h-3 w-3" /> Off
                </Button>
                <Button variant="outline" size="sm" onClick={() => setFilterOpen(true)} className="gap-1 text-xs h-7 px-2.5 rounded-md">
                  <SlidersHorizontal className="h-3 w-3" />
                  {countActiveFilters(filters) > 0 && (
                    <span className="bg-accent text-accent-foreground rounded-full h-4 min-w-4 flex items-center justify-center text-[9px] font-bold">
                      {countActiveFilters(filters)}
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Oportunidades da marca */}
          {mockOpportunities.some(o => o.brandSlug === slug) && (
            <OpportunitiesSection showConnectionGating />
          )}

          {/* Product grid */}
          <div className="px-3 md:px-6 py-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSubBrand}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 xl:grid-cols-5 md:gap-4"
              >
                {filteredProducts.map((p, i) => {
                  const cartItem = cart.items.find((ci) => ci.product.id === p.id);
                  const cartPieces = cartItem
                    ? Object.values(cartItem.quantities).reduce((a, b) => a + b, 0) * cartItem.selectedColors.length
                    : 0;

                  return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i, 12) * 0.03 }}
                    onClick={() => setSelectedProduct(p)}
                    className="bg-card rounded-xl overflow-hidden border border-border cursor-pointer group card-hover relative"
                  >
                    <div className="relative aspect-[3/4] overflow-hidden">
                      <img src={p.variants[0]?.images[0]} alt={p.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      
                      {/* Cart controls — centered, always visible */}
                      {cartItem && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const totalQty = Object.values(cartItem.quantities).reduce((a, b) => a + b, 0);
                                if (totalQty <= 1) {
                                  cart.removeItem(p.id);
                                } else {
                                  const newQ: Record<string, number> = {};
                                  let reduced = false;
                                  const entries = Object.entries(cartItem.quantities);
                                  for (let idx = entries.length - 1; idx >= 0; idx--) {
                                    const [s, q] = entries[idx];
                                    if (!reduced && (q as number) > 0) {
                                      newQ[s] = (q as number) - 1;
                                      reduced = true;
                                    } else {
                                      newQ[s] = q as number;
                                    }
                                  }
                                  cart.updateItem(p.id, { quantities: newQ });
                                }
                              }}
                              className="h-8 w-8 rounded-full bg-card/95 backdrop-blur-sm border border-border flex items-center justify-center text-foreground hover:bg-destructive/10 hover:text-destructive transition-colors shadow-md"
                            >
                              {Object.values(cartItem.quantities).reduce((a, b) => a + b, 0) <= 1 ? (
                                <Trash2 className="h-3.5 w-3.5" />
                              ) : (
                                <span className="text-sm font-bold leading-none">−</span>
                              )}
                            </button>
                            <span className="h-8 min-w-8 px-2 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shadow-md">
                              {cartPieces}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const newQ: Record<string, number> = {};
                                Object.entries(cartItem.quantities).forEach(([s, q]) => {
                                  newQ[s] = (q as number) + 1;
                                });
                                cart.updateItem(p.id, { quantities: newQ });
                              }}
                              className="h-8 w-8 rounded-full bg-card/95 backdrop-blur-sm border border-border flex items-center justify-center text-foreground hover:bg-accent/10 hover:text-accent transition-colors shadow-md"
                            >
                              <span className="text-sm font-bold leading-none">+</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Buy/Grid buttons — only when not in cart */}
                      {!cartItem && (
                        <div className="absolute bottom-0 left-0 right-0 p-2 flex gap-1.5 md:opacity-0 md:group-hover:opacity-100 md:translate-y-1 md:group-hover:translate-y-0 transition-all duration-200">
                          <button
                            onClick={(e) => { e.stopPropagation(); setOpenInGrade(true); setSelectedProduct(p); }}
                            className="flex-1 h-7 rounded-md bg-primary text-primary-foreground text-[10px] font-semibold flex items-center justify-center gap-1 hover:bg-primary/90 transition-colors"
                          >
                            <ShoppingBag className="h-3 w-3" /> Comprar
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setOpenInGrade(false); setSelectedProduct(p); }}
                            className="h-7 w-7 rounded-md bg-card/90 backdrop-blur-sm border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                            title="Montar Grade"
                          >
                            <LayoutGrid className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="p-2 md:p-3">
                      <p className="text-[9px] md:text-[10px] font-bold text-accent uppercase">
                        {brand.subBrands.find((sb) => sb.id === p.subBrandId)?.name}
                      </p>
                      <p className="text-[8px] md:text-[9px] text-muted-foreground">Ref: {p.ref}</p>
                      <p className="text-[10px] md:text-xs text-foreground mt-0.5 md:mt-1 line-clamp-2 leading-snug">{p.name}</p>
                      <p className="text-xs md:text-sm font-bold text-foreground mt-1">{fmt(p.price)}</p>
                      <div className="flex flex-wrap gap-0.5 mt-1">
                        {p.sizes.map((s) => (
                          <span key={s} className="px-1 py-0.5 rounded bg-muted text-[7px] md:text-[8px] font-medium text-muted-foreground">{s}</span>
                        ))}
                      </div>
                      <p className="text-[8px] md:text-[9px] text-muted-foreground mt-0.5">
                        {p.variants.length} {p.variants.length === 1 ? "cor" : "cores"}
                      </p>
                    </div>
                  </motion.div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <ProductDetailModal
            product={selectedProduct}
            brand={brand}
            onClose={() => { setSelectedProduct(null); setSideMode(false); setOpenInGrade(false); }}
            onFindSimilar={() => setSideMode(true)}
            openInGrade={openInGrade}
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
              className="fixed z-50 inset-2 sm:inset-4 md:inset-y-6 md:left-[10%] md:right-[10%] lg:left-[15%] lg:right-[15%] bg-card rounded-xl md:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
                <div>
                  <h2 className="text-base font-bold text-foreground">Adicionar todos os produtos</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {activeProducts.length} de {filteredProducts.length} produtos · Grade padrão (1 peça por tamanho/cor)
                  </p>
                </div>
                <button
                  onClick={() => setAddAllModal(false)}
                  className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto">
                {/* Summary tables */}
                <div className="px-3 md:px-5 py-3 md:py-4 grid grid-cols-1 gap-3 md:grid-cols-[5fr_5fr_3fr] md:gap-4 border-b border-border bg-muted/20">
                  {/* By Category */}
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-2">Por tipo de produto</p>
                    <div className="border border-border rounded-lg overflow-hidden">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-muted/50 text-[10px] font-semibold text-muted-foreground">
                            <th className="px-3 py-2 text-left font-semibold">Tipo</th>
                            <th className="px-2 py-2 text-center font-semibold w-10">Qtd</th>
                            <th className="px-2 py-2 text-center font-semibold w-12">Peças</th>
                            <th className="px-2 py-2 text-center font-semibold w-12">%</th>
                            <th className="px-3 py-2 text-right font-semibold whitespace-nowrap">Preço médio</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Array.from(summaryByCategory.entries()).map(([cat, data]) => (
                            <tr key={cat} className="border-t border-border">
                              <td className="px-3 py-2 font-medium text-foreground">{cat}</td>
                              <td className="px-2 py-2 text-center text-muted-foreground">{data.count}</td>
                              <td className="px-2 py-2 text-center text-muted-foreground">{data.totalPieces}</td>
                              <td className="px-2 py-2 text-center text-muted-foreground">{grandTotal > 0 ? ((data.totalPieces / grandTotal) * 100).toFixed(1) : 0}%</td>
                              <td className="px-3 py-2 text-right font-medium text-foreground whitespace-nowrap">
                                {fmt(data.prices.reduce((a, b) => a + b, 0) / data.prices.length)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* By Gender */}
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-2">Por sexo</p>
                    <div className="border border-border rounded-lg overflow-hidden">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-muted/50 text-[10px] font-semibold text-muted-foreground">
                            <th className="px-3 py-2 text-left font-semibold">Sexo</th>
                            <th className="px-2 py-2 text-center font-semibold w-10">Qtd</th>
                            <th className="px-2 py-2 text-center font-semibold w-12">Peças</th>
                            <th className="px-2 py-2 text-center font-semibold w-12">%</th>
                            <th className="px-3 py-2 text-right font-semibold whitespace-nowrap">Preço médio</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Array.from(summaryByGender.entries()).map(([g, data]) => (
                            <tr key={g} className="border-t border-border">
                              <td className="px-3 py-2 font-medium text-foreground">{g}</td>
                              <td className="px-2 py-2 text-center text-muted-foreground">{data.count}</td>
                              <td className="px-2 py-2 text-center text-muted-foreground">{data.totalPieces}</td>
                              <td className="px-2 py-2 text-center text-muted-foreground">{grandTotal > 0 ? ((data.totalPieces / grandTotal) * 100).toFixed(1) : 0}%</td>
                              <td className="px-3 py-2 text-right font-medium text-foreground whitespace-nowrap">
                                {fmt(data.prices.reduce((a, b) => a + b, 0) / data.prices.length)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* By Size */}
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-2">Por tamanho</p>
                    <div className="border border-border rounded-lg overflow-hidden">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-muted/50 text-[10px] font-semibold text-muted-foreground">
                            <th className="px-3 py-2 text-left font-semibold">Tamanho</th>
                            <th className="px-2 py-2 text-center font-semibold w-14">Peças</th>
                            <th className="px-3 py-2 text-right font-semibold w-12">%</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Array.from(summaryBySize.entries())
                            .sort(([a], [b]) => {
                              const na = parseInt(a), nb = parseInt(b);
                              if (!isNaN(na) && !isNaN(nb)) return na - nb;
                              return a.localeCompare(b);
                            })
                            .map(([size, pieces]) => (
                              <tr key={size} className="border-t border-border">
                                <td className="px-3 py-2 font-medium text-foreground">{size}</td>
                                <td className="px-2 py-2 text-center text-muted-foreground">{pieces}</td>
                                <td className="px-3 py-2 text-right text-muted-foreground">{grandTotal > 0 ? ((pieces / grandTotal) * 100).toFixed(1) : 0}%</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Products list with exclusion */}
                <div className="px-3 md:px-5 py-3">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-2 md:mb-3">Produtos ({activeProducts.length})</p>
                  <div className="space-y-1">
                    {filteredProducts.map((p) => {
                      const isExcluded = excludedIds.has(p.id);
                      const q = getQty(p.id);
                      const pieces = p.sizes.length * p.variants.length * q;
                      return (
                        <div
                          key={p.id}
                          className={`flex items-center gap-2 md:gap-3 py-1.5 md:py-2 px-1.5 md:px-2 rounded-lg border transition-all ${
                            isExcluded
                              ? "border-border/50 bg-muted/30 opacity-50"
                              : "border-border"
                          }`}
                        >
                          <img
                            src={p.variants[0]?.images[0]}
                            alt={p.name}
                            className="h-9 w-9 md:h-11 md:w-11 rounded-lg object-cover border border-border shrink-0"
                            loading="lazy"
                          />
                          <div className="flex-1 min-w-0">
                            <p className={`text-[10px] md:text-xs font-semibold truncate ${isExcluded ? "text-muted-foreground line-through" : "text-foreground"}`}>
                              {p.name}
                            </p>
                            <p className="text-[9px] md:text-[10px] text-muted-foreground truncate">
                              {p.ref} · {p.category} · {p.gender}
                            </p>
                          </div>
                          {/* Grade quantity controls */}
                          {!isExcluded && (
                            <div className="flex items-center gap-0.5 md:gap-1 shrink-0">
                              <button
                                onClick={() => setGradeQty((prev) => ({ ...prev, [p.id]: Math.max(1, (prev[p.id] ?? 1) - 1) }))}
                                className="h-5 w-5 md:h-6 md:w-6 rounded bg-muted text-foreground text-[10px] md:text-xs font-bold flex items-center justify-center hover:bg-muted/80 transition-colors"
                              >
                                −
                              </button>
                              <span className="w-5 md:w-6 text-center text-[10px] md:text-xs font-bold text-foreground">{q}</span>
                              <button
                                onClick={() => setGradeQty((prev) => ({ ...prev, [p.id]: (prev[p.id] ?? 1) + 1 }))}
                                className="h-5 w-5 md:h-6 md:w-6 rounded bg-muted text-foreground text-[10px] md:text-xs font-bold flex items-center justify-center hover:bg-muted/80 transition-colors"
                              >
                                +
                              </button>
                            </div>
                          )}
                          <div className="text-right shrink-0 w-14 md:w-20">
                            <p className="text-[9px] md:text-[10px] text-muted-foreground">{pieces} pç</p>
                            <p className="text-[10px] md:text-xs font-bold text-foreground">{fmt(pieces * p.price)}</p>
                          </div>
                          <button
                            onClick={() => toggleExclude(p.id)}
                            className={`h-6 w-6 md:h-7 md:w-7 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                              isExcluded
                                ? "bg-accent text-accent-foreground hover:bg-accent/80"
                                : "bg-destructive/10 text-destructive hover:bg-destructive/20"
                            }`}
                            title={isExcluded ? "Incluir de volta" : "Remover"}
                          >
                            {isExcluded ? <PackagePlus className="h-3 w-3" /> : <Trash2 className="h-3 w-3" />}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="shrink-0 border-t border-border bg-muted/30 px-3 md:px-5 py-2.5 md:py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] md:text-xs text-muted-foreground truncate">
                    {activeProducts.length} prod · {grandTotal} pç · Média: {fmt(avgPrice)}
                  </p>
                  <p className="text-base md:text-lg font-bold text-foreground">{fmt(grandPrice)}</p>
                </div>
                <Button size="sm" onClick={() => {
                  activeProducts.forEach((p) => {
                    const q = getQty(p.id);
                    const quantities = Object.fromEntries(p.sizes.map((s) => [s, q]));
                    cart.addItem({
                      product: p,
                      brandSlug: brand.slug,
                      brandName: brand.name,
                      brandLogo: brand.logo,
                      quantities,
                      selectedColors: p.variants.map((v) => v.color),
                    });
                  });
                  setAddAllModal(false);
                  cart.setIsOpen(true);
                }} className="gap-1.5 shrink-0 text-xs md:text-sm" disabled={activeProducts.length === 0}>
                  <ShoppingBag className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  <span className="hidden sm:inline">Adicionar à sacola</span>
                  <span className="sm:hidden">Adicionar</span>
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Filter Sheet */}
      <FilterSheet
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        products={allBrandProducts}
        filters={filters}
        onApply={setFilters}
      />

      {/* Discount Modal */}
      <DiscountModal
        open={discountOpen}
        onClose={() => setDiscountOpen(false)}
        subBrands={brand.subBrands}
        onSave={(_, pct) => setDiscountPercent(pct)}
      />

      {/* Commercial Policy Modal */}
      <CommercialPolicyModal
        open={policyModalOpen}
        onClose={() => setPolicyModalOpen(false)}
      />
    </div>
  );
};

export default ProdutoDetalhe;