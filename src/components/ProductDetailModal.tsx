import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  X,
  ZoomIn,
  Sparkles,
  Shuffle,
  Check,
  ShoppingBag,
  LayoutGrid,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Product, Brand } from "@/data/mockProducts";
import { useCart } from "@/contexts/CartContext";
import { PrecoVendaLinha } from "@/components/PrecoVendaLinha";
import { usePrecoVenda } from "@/hooks/usePrecoVenda";
import { loadPrecificacao, savePrecificacao, fmtBRL, type ModoPreco } from "@/lib/precificacao";
import { RotateCcw } from "lucide-react";

interface ProductDetailModalProps {
  product: Product | null;
  brand: Brand;
  onClose: () => void;
  onFindSimilar?: (product: Product) => void;
  openInGrade?: boolean;
}

export function ProductDetailModal({ product, brand, onClose, onFindSimilar, openInGrade = false }: ProductDetailModalProps) {
  const cart = useCart();
  const cartItem = product ? cart.items.find((i) => i.product.id === product.id) : null;
  const cartPieces = cartItem
    ? Object.values(cartItem.quantities).reduce((a, b) => a + b, 0) * cartItem.selectedColors.length
    : 0;
  const [selectedImage, setSelectedImage] = useState(0);
  const [descOpen, setDescOpen] = useState(false);
  const [specsOpen, setSpecsOpen] = useState(false);
  const [gradeOpen, setGradeOpen] = useState(openInGrade);
  const [viewMode, setViewMode] = useState<"center" | "side">("center");
  const [zoomed, setZoomed] = useState(false);

  // Grade state
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [distributeValue, setDistributeValue] = useState("");

  const [lastProductId, setLastProductId] = useState<string | null>(null);
  if (product && product.id !== lastProductId) {
    setLastProductId(product.id);
    // Pre-fill with cart data if product is already in cart
    const existing = cart.items.find((i) => i.product.id === product.id);
    if (existing) {
      setQuantities({ ...existing.quantities });
      setSelectedColors([...existing.selectedColors]);
    } else {
      setQuantities(Object.fromEntries(product.sizes.map((s) => [s, 0])));
      setSelectedColors(product.variants.map((v) => v.color));
    }
    setDistributeValue("");
    setSelectedImage(0);
    setDescOpen(false);
    setSpecsOpen(false);
    setGradeOpen(openInGrade);
    setZoomed(false);
    setViewMode("center");
  }

  // Preço de venda projetado (respeita hierarquia)
  const preco = usePrecoVenda(product?.price ?? 0, brand.slug, product?.id);
  const [editPrecoOpen, setEditPrecoOpen] = useState(false);

  if (!product) return null;

  const currentImages = product.variants[0]?.images || [];
  const totalPieces = Object.values(quantities).reduce((a, b) => a + b, 0);
  const totalPrice = totalPieces * selectedColors.length * product.price;
  const totalVenda = totalPieces * selectedColors.length * preco.precoVenda;
  const totalLucro = totalVenda - totalPrice;

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
      {/* Backdrop — hidden in side mode so user can interact with grid */}
      {!isSide && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 bg-foreground/50 backdrop-blur-sm"
        />
      )}

      {/* Modal */}
      <motion.div
        layout
        initial={isSide ? { x: "100%" } : { opacity: 0, scale: 0.97 }}
        animate={isSide ? { x: 0 } : { opacity: 1, scale: 1 }}
        exit={isSide ? { x: "100%" } : { opacity: 0, scale: 0.97 }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className={`fixed z-50 bg-card flex flex-col ${
          isSide
            ? "right-0 top-0 bottom-0 w-full sm:w-[380px] shadow-2xl"
            : "inset-0 sm:inset-4 md:inset-y-4 md:left-[18%] md:right-[18%] lg:left-[22%] lg:right-[22%] sm:rounded-2xl shadow-2xl"
        }`}
      >
        {/* Top bar — minimal */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border shrink-0">
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          <p className="text-xs text-muted-foreground">Ref: {product.ref}</p>
          <div className="w-8" />
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {!gradeOpen ? (
              <motion.div
                key="produto"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.12 }}
              >
                {/* Image */}
                <div
                  className={`relative overflow-hidden bg-muted cursor-zoom-in ${
                    isSide ? "h-52" : "h-[40vh] md:h-[45vh]"
                  }`}
                  onClick={() => setZoomed(!zoomed)}
                >
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={`${selectedImage}-${zoomed}`}
                      src={currentImages[selectedImage]}
                      alt={product.name}
                      className={`h-full w-full transition-transform duration-300 ${
                        zoomed ? "object-contain scale-[2] cursor-zoom-out" : "object-cover"
                      }`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.12 }}
                    />
                  </AnimatePresence>
                  <div className="absolute bottom-2 right-2 h-6 w-6 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center text-muted-foreground pointer-events-none">
                    <ZoomIn className="h-3 w-3" />
                  </div>
                </div>

                {/* Thumbnails */}
                <div className="flex gap-1.5 px-4 py-2 overflow-x-auto scrollbar-hide border-b border-border">
                  {currentImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => { setSelectedImage(idx); setZoomed(false); }}
                      className={`h-12 w-12 rounded-md overflow-hidden shrink-0 border-2 transition-colors ${
                        selectedImage === idx ? "border-accent" : "border-border"
                      }`}
                    >
                      <img src={img} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>

                {/* Product info */}
                <div className="px-4 py-3">
                  <h2 className="text-sm font-bold text-foreground leading-snug">{product.name}</h2>
                  <div className="flex items-baseline gap-2 mt-1">
                    <p className="text-lg font-bold text-foreground">
                      R$ {product.price.toFixed(2).replace(".", ",")}
                    </p>
                    <span className="text-[10px] text-muted-foreground">atacado</span>
                  </div>

                  {/* Bloco de preço de venda projetado */}
                  {preco.mostrarNoCard && preco.precoVenda > 0 && (
                    <PrecoVendaLinha
                      precoAtacado={product.price}
                      brandSlug={brand.slug}
                      productId={product.id}
                      variant="modal"
                    />
                  )}

                  {/* Ajuste individual do preço de venda */}
                  <button
                    onClick={() => setEditPrecoOpen(!editPrecoOpen)}
                    className="mt-2 text-[11px] text-accent hover:underline inline-flex items-center gap-1"
                  >
                    {editPrecoOpen ? "Fechar" : "Ajustar meu preço de venda para este produto"}
                  </button>
                  {editPrecoOpen && (
                    <PrecoProdutoEditor productId={product.id} brandSlug={brand.slug} />
                  )}

                  <button onClick={() => setDescOpen(!descOpen)} className="flex items-center justify-between w-full py-2 mt-2 border-t border-border">
                    <span className="text-xs font-semibold text-foreground">Descrição</span>
                    {descOpen ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
                  </button>
                  {descOpen && <p className="text-xs text-muted-foreground leading-relaxed pb-2">{product.description}</p>}

                  <button onClick={() => setSpecsOpen(!specsOpen)} className="flex items-center justify-between w-full py-2 border-t border-border">
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
              /* GRADE VIEW — full page inside modal */
              <motion.div
                key="grade"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.12 }}
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
                  <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Distribuir</span>
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

                {/* Size table */}
                <div className="border border-border rounded-lg overflow-hidden">
                  <div className="grid gap-0" style={{ gridTemplateColumns: `auto repeat(${product.sizes.length}, 1fr) auto` }}>
                    <div className="px-2 py-1.5 text-[10px] font-semibold text-muted-foreground bg-muted/50 border-b border-border">Tamanho</div>
                    {product.sizes.map((s) => (
                      <div key={s} className="px-1 py-1.5 text-center text-[10px] font-semibold text-muted-foreground bg-muted/50 border-b border-border">{s}</div>
                    ))}
                    <div className="px-2 py-1.5 text-[10px] font-semibold text-muted-foreground bg-muted/50 border-b border-border text-right">Total peças</div>

                    <div className="px-2 py-1.5 text-xs font-medium text-foreground flex items-center">Quantidade</div>
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
                <div className="py-2 border-t border-border space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-foreground">Total atacado</span>
                    <span className="text-sm font-bold text-foreground">{fmtBRL(totalPrice)}</span>
                  </div>
                  {preco.mostrarNoCard && preco.precoVenda > 0 && totalPieces > 0 && (
                    <>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Venda projetada</span>
                        <span className="font-semibold text-foreground">{fmtBRL(totalVenda)}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Lucro projetado</span>
                        <span className="font-semibold text-accent">{fmtBRL(totalLucro)}</span>
                      </div>
                    </>
                  )}
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

        {/* Cart status banner */}
        {cartItem && !gradeOpen && (
          <div className="shrink-0 border-t border-border bg-accent/10 px-4 py-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <ShoppingBag className="h-4 w-4 text-accent shrink-0" />
              <p className="text-xs font-semibold text-foreground truncate">
                Na sacola: {cartPieces} {cartPieces === 1 ? "peça" : "peças"} · {cartItem.selectedColors.length} {cartItem.selectedColors.length === 1 ? "cor" : "cores"}
              </p>
            </div>
            <button
              onClick={() => cart.removeItem(product.id)}
              className="h-7 w-7 rounded-md flex items-center justify-center shrink-0 bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
              title="Remover da sacola"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Sticky bottom */}
        <div className="shrink-0 border-t border-border bg-card px-4 py-2.5 flex items-center gap-2">
          {!gradeOpen ? (
            <>
              <Button size="sm" onClick={() => setGradeOpen(true)} className="gap-1.5 text-xs flex-1">
                <LayoutGrid className="h-3.5 w-3.5" />
                {cartItem ? "Editar Grade" : "Comprar | Montar Grade"}
              </Button>
              {!isSide && (
                <Button variant="outline" size="sm" onClick={handleFindSimilar} className="gap-1.5 text-xs flex-1">
                  <Sparkles className="h-3.5 w-3.5" />
                  Peças Similares
                </Button>
              )}
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={() => setGradeOpen(false)} className="text-xs">
                ← Voltar
              </Button>
              <Button size="sm" onClick={() => {
                if (!product) return;
                cart.addItem({
                  product,
                  brandSlug: brand.slug,
                  brandName: brand.name,
                  brandLogo: brand.logo,
                  quantities,
                  selectedColors,
                });
                cart.setIsOpen(true);
                onClose();
              }} className="gap-1.5 text-xs flex-1">
                <ShoppingBag className="h-3.5 w-3.5" />
                {cartItem ? "Atualizar sacola" : "Adicionar à sacola"}
              </Button>
            </>
          )}
        </div>
      </motion.div>
    </>
  );
}
