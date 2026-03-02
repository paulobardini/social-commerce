import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  X,
  ZoomIn,
  Sparkles,
  Shuffle,
  Check,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Product, Brand } from "@/data/mockProducts";

type ViewMode = "center" | "side";
type Tab = "produto" | "grade";

interface ProductDetailModalProps {
  product: Product | null;
  brand: Brand;
  onClose: () => void;
  onFindSimilar?: (product: Product) => void;
}

export function ProductDetailModal({ product, brand, onClose, onFindSimilar }: ProductDetailModalProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [descOpen, setDescOpen] = useState(false);
  const [specsOpen, setSpecsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("produto");
  const [viewMode, setViewMode] = useState<ViewMode>("center");
  const [zoomed, setZoomed] = useState(false);

  // Grade state
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [distributeValue, setDistributeValue] = useState("");

  // Reset state when product changes
  const initGrade = useCallback((p: Product) => {
    setQuantities(Object.fromEntries(p.sizes.map((s) => [s, 0])));
    setSelectedColors(p.variants.map((v) => v.color));
    setDistributeValue("");
    setSelectedImage(0);
    setActiveTab("produto");
    setDescOpen(false);
    setSpecsOpen(false);
    setZoomed(false);
  }, []);

  // Init on first render or product change
  const [lastProductId, setLastProductId] = useState<string | null>(null);
  if (product && product.id !== lastProductId) {
    setLastProductId(product.id);
    initGrade(product);
  }

  if (!product) return null;

  const currentImages = product.variants[0]?.images || [];

  const totalPieces = Object.values(quantities).reduce((a, b) => a + b, 0);
  const totalPrice = totalPieces * selectedColors.length * product.price;

  const handleDistribute = () => {
    const val = parseInt(distributeValue);
    if (isNaN(val) || val < 0) return;
    const perSize = Math.floor(val / product.sizes.length);
    const remainder = val % product.sizes.length;
    const newQ: Record<string, number> = {};
    product.sizes.forEach((s, i) => {
      newQ[s] = perSize + (i < remainder ? 1 : 0);
    });
    setQuantities(newQ);
  };

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const handleFindSimilar = () => {
    setViewMode("side");
    onFindSimilar?.(product);
  };

  const isSide = viewMode === "side";

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-foreground/50 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div
        layout
        initial={isSide ? { x: "100%" } : { opacity: 0, scale: 0.95 }}
        animate={isSide ? { x: 0 } : { opacity: 1, scale: 1 }}
        exit={isSide ? { x: "100%" } : { opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className={`fixed z-50 bg-card overflow-hidden flex flex-col ${
          isSide
            ? "right-0 top-0 bottom-0 w-full sm:w-[400px] shadow-2xl"
            : "inset-4 sm:inset-8 md:inset-y-6 md:left-[15%] md:right-[15%] lg:left-[20%] lg:right-[20%] rounded-2xl shadow-2xl"
        }`}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Tabs */}
          <div className="flex items-center bg-muted rounded-lg p-0.5">
            <button
              onClick={() => setActiveTab("produto")}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === "produto"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Produto
            </button>
            <button
              onClick={() => setActiveTab("grade")}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === "grade"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Montar Grade
            </button>
          </div>

          <button
            onClick={() => {}}
            className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
          >
            <Heart className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {activeTab === "produto" ? (
              <motion.div
                key="produto"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.15 }}
              >
                {/* Image with zoom */}
                <div
                  className={`relative overflow-hidden bg-muted cursor-zoom-in ${
                    isSide ? "aspect-square" : "aspect-[4/5] md:aspect-[3/4] max-h-[60vh]"
                  }`}
                  onClick={() => setZoomed(!zoomed)}
                >
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={`${selectedImage}-${zoomed}`}
                      src={currentImages[selectedImage]}
                      alt={product.name}
                      className={`h-full w-full transition-transform duration-300 ${
                        zoomed ? "object-contain scale-150 cursor-zoom-out" : "object-cover"
                      }`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    />
                  </AnimatePresence>
                  <div className="absolute bottom-3 right-3 h-7 w-7 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center text-muted-foreground pointer-events-none">
                    <ZoomIn className="h-3.5 w-3.5" />
                  </div>
                </div>

                {/* Thumbnails */}
                <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
                  {currentImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => { setSelectedImage(idx); setZoomed(false); }}
                      className={`h-14 w-14 rounded-lg overflow-hidden shrink-0 border-2 transition-colors ${
                        selectedImage === idx ? "border-accent" : "border-border"
                      }`}
                    >
                      <img src={img} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>

                {/* Product info */}
                <div className="px-4 pb-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] text-muted-foreground">Ref: {product.ref}</p>
                      <h2 className="text-base font-bold text-foreground mt-0.5 leading-snug">
                        {product.name}
                      </h2>
                    </div>
                    <p className="text-xl font-bold text-foreground shrink-0">
                      R$ {product.price.toFixed(2).replace(".", ",")}
                    </p>
                  </div>

                  {/* Description */}
                  <button
                    onClick={() => setDescOpen(!descOpen)}
                    className="flex items-center justify-between w-full py-2.5 mt-3 border-t border-border"
                  >
                    <span className="text-xs font-semibold text-foreground">Descrição</span>
                    {descOpen ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
                  </button>
                  {descOpen && (
                    <div className="pb-2">
                      <p className="text-xs text-muted-foreground leading-relaxed">{product.description}</p>
                    </div>
                  )}

                  {/* Specs */}
                  <button
                    onClick={() => setSpecsOpen(!specsOpen)}
                    className="flex items-center justify-between w-full py-2.5 border-t border-border"
                  >
                    <span className="text-xs font-semibold text-foreground">Especificações</span>
                    {specsOpen ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
                  </button>
                  {specsOpen && (
                    <div className="text-xs text-muted-foreground space-y-1 pb-2">
                      <p>Composição: 100% Algodão</p>
                      <p>Tamanhos: {product.sizes.join(", ")}</p>
                      <p>Cores: {product.variants.map((v) => v.color).join(", ")}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              /* GRADE TAB */
              <motion.div
                key="grade"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.15 }}
                className="px-4 py-4 space-y-4"
              >
                <div>
                  <h3 className="text-sm font-bold text-foreground">Montar grade aberta</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Ajuste os tamanhos, quantidades e variantes
                  </p>
                </div>

                {/* Distribute */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                    Distribuir
                  </span>
                  <Input
                    type="number"
                    min={0}
                    value={distributeValue}
                    onChange={(e) => setDistributeValue(e.target.value)}
                    placeholder="0"
                    className="h-8 text-center text-xs"
                  />
                  <Button variant="outline" size="sm" onClick={handleDistribute} className="gap-1.5 h-8 text-xs shrink-0">
                    <Shuffle className="h-3 w-3" />
                    Distribuir
                  </Button>
                </div>

                {/* Size / Quantity table */}
                <div className="border border-border rounded-lg overflow-hidden">
                  <div className="grid gap-0" style={{ gridTemplateColumns: `auto repeat(${product.sizes.length}, 1fr) auto` }}>
                    <div className="px-2 py-1.5 text-[10px] font-semibold text-muted-foreground bg-muted/50 border-b border-border">Tam.</div>
                    {product.sizes.map((s) => (
                      <div key={s} className="px-1 py-1.5 text-center text-[10px] font-semibold text-muted-foreground bg-muted/50 border-b border-border">{s}</div>
                    ))}
                    <div className="px-2 py-1.5 text-[10px] font-semibold text-muted-foreground bg-muted/50 border-b border-border text-right">Total</div>

                    <div className="px-2 py-1.5 text-xs font-medium text-foreground flex items-center">Qtd</div>
                    {product.sizes.map((s) => (
                      <div key={s} className="px-0.5 py-1.5 flex justify-center">
                        <Input
                          type="number"
                          min={0}
                          value={quantities[s] || 0}
                          onChange={(e) => setQuantities((prev) => ({ ...prev, [s]: Math.max(0, parseInt(e.target.value) || 0) }))}
                          className="h-7 w-12 text-center text-xs"
                        />
                      </div>
                    ))}
                    <div className="px-2 py-1.5 text-xs font-bold text-foreground flex items-center justify-end">{totalPieces}</div>
                  </div>
                </div>

                {/* Total */}
                <div className="flex items-center justify-between py-2 border-t border-border">
                  <span className="text-sm font-bold text-foreground">Total final</span>
                  <span className="text-sm font-bold text-foreground">R$ {totalPrice.toFixed(2).replace(".", ",")}</span>
                </div>

                {/* Colors */}
                <div className="flex gap-2 flex-wrap">
                  {product.variants.map((v) => (
                    <button
                      key={v.color}
                      onClick={() => toggleColor(v.color)}
                      className={`relative flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                        selectedColors.includes(v.color) ? "border-accent bg-accent/5" : "border-border"
                      }`}
                    >
                      <div className="w-6 h-6 rounded border border-border" style={{ backgroundColor: v.colorHex }} />
                      <span className="text-xs text-foreground">{v.color}</span>
                      {selectedColors.includes(v.color) && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent flex items-center justify-center">
                          <Check className="h-2.5 w-2.5 text-accent-foreground" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sticky bottom actions */}
        <div className="shrink-0 border-t border-border bg-card px-4 py-3 flex items-center gap-2">
          {activeTab === "produto" ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleFindSimilar}
                className="gap-1.5 text-xs flex-1"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Peças Similares
              </Button>
              <Button
                size="sm"
                onClick={() => setActiveTab("grade")}
                className="gap-1.5 text-xs flex-1"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                Comprar | Montar Grade
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab("produto")}
                className="text-xs"
              >
                ← Voltar
              </Button>
              <Button
                size="sm"
                onClick={onClose}
                className="gap-1.5 text-xs flex-1"
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                Adicionar à sacola
              </Button>
            </>
          )}
        </div>
      </motion.div>
    </>
  );
}
