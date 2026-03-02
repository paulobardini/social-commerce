import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart, type CartItem } from "@/contexts/CartContext";

const fmt = (v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`;

interface BrandGroup {
  brandSlug: string;
  brandName: string;
  brandLogo?: string;
  items: CartItem[];
  totalPieces: number;
  totalPrice: number;
}

export function CartDrawer() {
  const { items, removeItem, totalPieces, totalPrice, isOpen, setIsOpen } = useCart();
  const navigate = useNavigate();
  const [activeBrand, setActiveBrand] = useState<string | null>(null);

  // Group items by brand
  const brandGroups = useMemo(() => {
    const map = new Map<string, BrandGroup>();
    items.forEach((item) => {
      const existing = map.get(item.brandSlug) || {
        brandSlug: item.brandSlug,
        brandName: item.brandName,
        brandLogo: item.brandLogo,
        items: [] as any[],
        totalPieces: 0,
        totalPrice: 0,
      };
      const pieces = (Object.values(item.quantities) as number[]).reduce((a, b) => a + b, 0) * item.selectedColors.length;
      existing.items.push(item);
      existing.totalPieces += pieces;
      existing.totalPrice += pieces * item.product.price;
      map.set(item.brandSlug, existing);
    });
    return Array.from(map.values());
  }, [items]);

  // Auto-select first brand if none selected or current brand removed
  const selectedBrand = useMemo(() => {
    if (brandGroups.length === 0) return null;
    const found = brandGroups.find((g) => g.brandSlug === activeBrand);
    if (found) return found;
    return brandGroups[0];
  }, [brandGroups, activeBrand]);

  const currentItems = selectedBrand?.items || [];

  const summaryByCategory = useMemo(() => {
    const map = new Map<string, { count: number; totalPieces: number; prices: number[] }>();
    currentItems.forEach((item) => {
      const pieces = (Object.values(item.quantities) as number[]).reduce((a, b) => a + b, 0) * item.selectedColors.length;
      const existing = map.get(item.product.category) || { count: 0, totalPieces: 0, prices: [] };
      existing.count++;
      existing.totalPieces += pieces;
      existing.prices.push(item.product.price);
      map.set(item.product.category, existing);
    });
    return map;
  }, [currentItems]);

  const summaryByGender = useMemo(() => {
    const map = new Map<string, { count: number; totalPieces: number; prices: number[] }>();
    currentItems.forEach((item) => {
      const pieces = (Object.values(item.quantities) as number[]).reduce((a, b) => a + b, 0) * item.selectedColors.length;
      const existing = map.get(item.product.gender) || { count: 0, totalPieces: 0, prices: [] };
      existing.count++;
      existing.totalPieces += pieces;
      existing.prices.push(item.product.price);
      map.set(item.product.gender, existing);
    });
    return map;
  }, [currentItems]);

  const summaryBySize = useMemo(() => {
    const map = new Map<string, number>();
    currentItems.forEach((item) => {
      const colorCount = item.selectedColors.length;
      Object.entries(item.quantities).forEach(([size, qty]) => {
        map.set(size, (map.get(size) || 0) + (qty as number) * colorCount);
      });
    });
    return map;
  }, [currentItems]);

  const brandTotalPieces = selectedBrand?.totalPieces || 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-[440px] bg-card shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 md:px-5 py-3 border-b border-border shrink-0">
              <div>
                <h2 className="text-base font-bold text-foreground">Minha Sacola</h2>
                <p className="text-[10px] md:text-xs text-muted-foreground">
                  {brandGroups.length} {brandGroups.length === 1 ? "indústria" : "indústrias"} · {totalPieces} peças · {fmt(totalPrice)}
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Brand switcher */}
            {brandGroups.length > 0 && (
              <div className="shrink-0 border-b border-border bg-muted/30">
                <div className="flex overflow-x-auto scrollbar-hide gap-1 px-3 py-2">
                  {brandGroups.map((group) => {
                    const isActive = selectedBrand?.brandSlug === group.brandSlug;
                    return (
                      <button
                        key={group.brandSlug}
                        onClick={() => setActiveBrand(group.brandSlug)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium shrink-0 transition-all border ${
                          isActive
                            ? "bg-primary text-primary-foreground border-primary shadow-sm"
                            : "bg-card text-muted-foreground border-border hover:text-foreground hover:border-muted-foreground"
                        }`}
                      >
                        {group.brandLogo && (
                          <img src={group.brandLogo} alt={group.brandName} className="h-5 w-5 rounded object-cover" />
                        )}
                        <span className="truncate max-w-[100px]">{group.brandName}</span>
                        <span className={`rounded-full h-4 min-w-4 px-1 flex items-center justify-center text-[9px] font-bold ${
                          isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
                        }`}>
                          {group.items.length}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
                  <ShoppingBag className="h-12 w-12 opacity-30" />
                  <p className="text-sm">Sua sacola está vazia</p>
                </div>
              ) : selectedBrand ? (
                <>
                  {/* Brand header info */}
                  <div className="px-4 py-3 border-b border-border bg-background/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {selectedBrand.brandLogo && (
                          <img src={selectedBrand.brandLogo} alt={selectedBrand.brandName} className="h-8 w-8 rounded-lg object-cover border border-border" />
                        )}
                        <div>
                          <p className="text-sm font-bold text-foreground">{selectedBrand.brandName}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {selectedBrand.items.length} {selectedBrand.items.length === 1 ? "produto" : "produtos"} · {selectedBrand.totalPieces} peças
                          </p>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-foreground">{fmt(selectedBrand.totalPrice)}</p>
                    </div>
                  </div>

                  {/* Summary tables */}
                  <div className="px-3 md:px-4 py-3 space-y-3 border-b border-border bg-muted/20">
                    {/* By Gender */}
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1.5">Por sexo</p>
                      <div className="border border-border rounded-lg overflow-hidden">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="bg-muted/50 text-[10px] font-semibold text-muted-foreground">
                              <th className="px-2.5 py-1.5 text-left font-semibold">Sexo</th>
                              <th className="px-2 py-1.5 text-center font-semibold w-8">Qtd</th>
                              <th className="px-2 py-1.5 text-center font-semibold w-10">Peças</th>
                              <th className="px-2 py-1.5 text-center font-semibold w-10">%</th>
                              <th className="px-2.5 py-1.5 text-right font-semibold whitespace-nowrap">Preço médio</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Array.from(summaryByGender.entries()).map(([g, data]) => (
                              <tr key={g} className="border-t border-border">
                                <td className="px-2.5 py-1.5 font-medium text-foreground">{g}</td>
                                <td className="px-2 py-1.5 text-center text-muted-foreground">{data.count}</td>
                                <td className="px-2 py-1.5 text-center text-muted-foreground">{data.totalPieces}</td>
                                <td className="px-2 py-1.5 text-center text-muted-foreground">
                                  {brandTotalPieces > 0 ? ((data.totalPieces / brandTotalPieces) * 100).toFixed(1) : 0}%
                                </td>
                                <td className="px-2.5 py-1.5 text-right font-medium text-foreground whitespace-nowrap">
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
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1.5">Por tamanho</p>
                      <div className="border border-border rounded-lg overflow-hidden">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="bg-muted/50 text-[10px] font-semibold text-muted-foreground">
                              <th className="px-2.5 py-1.5 text-left font-semibold">Tamanho</th>
                              <th className="px-2 py-1.5 text-center font-semibold w-12">Peças</th>
                              <th className="px-2.5 py-1.5 text-right font-semibold w-10">%</th>
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
                                  <td className="px-2.5 py-1.5 font-medium text-foreground">{size}</td>
                                  <td className="px-2 py-1.5 text-center text-muted-foreground">{pieces}</td>
                                  <td className="px-2.5 py-1.5 text-right text-muted-foreground">
                                    {brandTotalPieces > 0 ? ((pieces / brandTotalPieces) * 100).toFixed(1) : 0}%
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Items list */}
                  <div className="px-3 md:px-4 py-3">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-2">
                      Produtos ({currentItems.length})
                    </p>
                    <div className="space-y-1.5">
                      {currentItems.map((item) => {
                        const pieces = (Object.values(item.quantities) as number[]).reduce((a, b) => a + b, 0) * item.selectedColors.length;
                        const price = pieces * item.product.price;
                        return (
                          <div key={item.product.id} className="flex items-center gap-2 py-1.5 px-1.5 rounded-lg border border-border">
                            <img
                              src={item.product.variants[0]?.images[0]}
                              alt={item.product.name}
                              className="h-10 w-10 rounded-lg object-cover border border-border shrink-0"
                              loading="lazy"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] md:text-xs font-semibold text-foreground truncate">
                                {item.product.name}
                              </p>
                              <p className="text-[9px] text-muted-foreground">
                                {pieces} pç · {item.selectedColors.length} {item.selectedColors.length === 1 ? "cor" : "cores"}
                              </p>
                            </div>
                            <div className="text-right shrink-0 w-16">
                              <p className="text-[10px] md:text-xs font-bold text-foreground">{fmt(price)}</p>
                            </div>
                            <button
                              onClick={() => removeItem(item.product.id)}
                              className="h-6 w-6 rounded-md flex items-center justify-center shrink-0 bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : null}
            </div>

            {/* Footer - per brand */}
            {selectedBrand && selectedBrand.items.length > 0 && (
              <div className="shrink-0 border-t border-border bg-muted/30 px-4 md:px-5 py-2.5 md:py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] md:text-xs text-muted-foreground">
                      {selectedBrand.items.length} prod · {selectedBrand.totalPieces} peças
                    </p>
                    <p className="text-[10px] md:text-xs text-muted-foreground">
                      Preço médio: {fmt(selectedBrand.totalPieces > 0 ? selectedBrand.totalPrice / selectedBrand.totalPieces : 0)}
                    </p>
                    <p className="text-base md:text-lg font-bold text-foreground">{fmt(selectedBrand.totalPrice)}</p>
                  </div>
                  <Button size="sm" className="gap-1.5 shrink-0" onClick={() => { setIsOpen(false); navigate("/checkout"); }}>
                    <ShoppingBag className="h-3.5 w-3.5" />
                    Finalizar pedido
                  </Button>
                </div>
                {brandGroups.length > 1 && (
                  <p className="text-[9px] text-muted-foreground mt-1.5 text-center">
                    Total geral: {totalPieces} peças · {fmt(totalPrice)} ({brandGroups.length} indústrias)
                  </p>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
