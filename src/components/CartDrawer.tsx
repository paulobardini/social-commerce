import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, ShoppingBag, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";

const fmt = (v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`;

export function CartDrawer() {
  const { items, removeItem, totalPieces, totalPrice, isOpen, setIsOpen } = useCart();

  const summaryByCategory = useMemo(() => {
    const map = new Map<string, { count: number; totalPieces: number; prices: number[] }>();
    items.forEach((item) => {
      const pieces = Object.values(item.quantities).reduce((a, b) => a + b, 0) * item.selectedColors.length;
      const existing = map.get(item.product.category) || { count: 0, totalPieces: 0, prices: [] };
      existing.count++;
      existing.totalPieces += pieces;
      existing.prices.push(item.product.price);
      map.set(item.product.category, existing);
    });
    return map;
  }, [items]);

  const summaryByGender = useMemo(() => {
    const map = new Map<string, { count: number; totalPieces: number; prices: number[] }>();
    items.forEach((item) => {
      const pieces = Object.values(item.quantities).reduce((a, b) => a + b, 0) * item.selectedColors.length;
      const existing = map.get(item.product.gender) || { count: 0, totalPieces: 0, prices: [] };
      existing.count++;
      existing.totalPieces += pieces;
      existing.prices.push(item.product.price);
      map.set(item.product.gender, existing);
    });
    return map;
  }, [items]);

  const summaryBySize = useMemo(() => {
    const map = new Map<string, number>();
    items.forEach((item) => {
      const colorCount = item.selectedColors.length;
      Object.entries(item.quantities).forEach(([size, qty]) => {
        map.set(size, (map.get(size) || 0) + qty * colorCount);
      });
    });
    return map;
  }, [items]);

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
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-[420px] bg-card shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 md:px-5 py-3 md:py-4 border-b border-border shrink-0">
              <div>
                <h2 className="text-base font-bold text-foreground">Sacola</h2>
                <p className="text-[10px] md:text-xs text-muted-foreground">
                  {items.length} {items.length === 1 ? "produto" : "produtos"} · {totalPieces} peças
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
                  <ShoppingBag className="h-12 w-12 opacity-30" />
                  <p className="text-sm">Sua sacola está vazia</p>
                </div>
              ) : (
                <>
                  {/* Summary tables */}
                  <div className="px-3 md:px-5 py-3 md:py-4 space-y-3 border-b border-border bg-muted/20">
                    {/* By Category */}
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1.5">Por tipo</p>
                      <div className="border border-border rounded-lg overflow-hidden">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="bg-muted/50 text-[10px] font-semibold text-muted-foreground">
                              <th className="px-2.5 py-1.5 text-left font-semibold">Tipo</th>
                              <th className="px-2 py-1.5 text-center font-semibold w-8">Qtd</th>
                              <th className="px-2 py-1.5 text-center font-semibold w-10">Peças</th>
                              <th className="px-2 py-1.5 text-center font-semibold w-10">%</th>
                              <th className="px-2.5 py-1.5 text-right font-semibold whitespace-nowrap">Preço médio</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Array.from(summaryByCategory.entries()).map(([cat, data]) => (
                              <tr key={cat} className="border-t border-border">
                                <td className="px-2.5 py-1.5 font-medium text-foreground">{cat}</td>
                                <td className="px-2 py-1.5 text-center text-muted-foreground">{data.count}</td>
                                <td className="px-2 py-1.5 text-center text-muted-foreground">{data.totalPieces}</td>
                                <td className="px-2 py-1.5 text-center text-muted-foreground">
                                  {totalPieces > 0 ? ((data.totalPieces / totalPieces) * 100).toFixed(1) : 0}%
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
                                  {totalPieces > 0 ? ((data.totalPieces / totalPieces) * 100).toFixed(1) : 0}%
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
                                    {totalPieces > 0 ? ((pieces / totalPieces) * 100).toFixed(1) : 0}%
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Items list */}
                  <div className="px-3 md:px-5 py-3">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-2">
                      Produtos ({items.length})
                    </p>
                    <div className="space-y-1.5">
                      {items.map((item) => {
                        const pieces = Object.values(item.quantities).reduce((a, b) => a + b, 0) * item.selectedColors.length;
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
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="shrink-0 border-t border-border bg-muted/30 px-4 md:px-5 py-2.5 md:py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] md:text-xs text-muted-foreground">
                    {items.length} prod · {totalPieces} peças
                  </p>
                  <p className="text-base md:text-lg font-bold text-foreground">{fmt(totalPrice)}</p>
                </div>
                <Button size="sm" className="gap-1.5 shrink-0">
                  <ShoppingBag className="h-3.5 w-3.5" />
                  Finalizar pedido
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
