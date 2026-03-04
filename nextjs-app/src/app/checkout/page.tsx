"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Trash2,
  ShoppingBag,
  Pencil,
  CreditCard,
} from "lucide-react";

import { NextilHeader } from "@/components/NextilHeader";
import { NextilSidebar } from "@/components/NextilSidebar";
import { MobileNav } from "@/components/MobileNav";
import { useCart, type CartItem } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const fmt = (v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`;

interface BrandGroup {
  brandSlug: string;
  brandName: string;
  brandLogo?: string;
  items: CartItem[];
  totalPieces: number;
  totalPrice: number;
}

const prazoOptions = ["30", "30, 40", "30, 40, 60", "30, 45", "30, 45, 60", "30, 45, 60, 75"];

export default function CheckoutPage() {
  const router = useRouter();
  const cart = useCart();
  const [expandedBrands, setExpandedBrands] = useState<Set<string>>(new Set());
  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(new Set());
  const [paymentMethods, setPaymentMethods] = useState<Record<string, string>>({});
  const [prazos, setPrazos] = useState<Record<string, string>>({});

  const brandGroups = useMemo(() => {
    const map = new Map<string, BrandGroup>();
    cart.items.forEach((item) => {
      const existing = map.get(item.brandSlug) || {
        brandSlug: item.brandSlug,
        brandName: item.brandName,
        brandLogo: item.brandLogo,
        items: [] as CartItem[],
        totalPieces: 0,
        totalPrice: 0,
      };
      const pieces = (Object.values(item.quantities) as number[]).reduce((a, b) => a + b, 0) *
        item.selectedColors.length;
      existing.items.push(item);
      existing.totalPieces += pieces;
      existing.totalPrice += pieces * item.product.price;
      map.set(item.brandSlug, existing);
    });
    return Array.from(map.values());
  }, [cart.items]);

  // Auto-expand all brands initially
  useMemo(() => {
    if (expandedBrands.size === 0 && brandGroups.length > 0) {
      setExpandedBrands(new Set(brandGroups.map((g) => g.brandSlug)));
      setSelectedBrands(new Set(brandGroups.map((g) => g.brandSlug)));
    }
  }, [brandGroups]);

  const toggleExpand = (slug: string) => {
    setExpandedBrands((prev) => {
      const next = new Set(prev);
      next.has(slug) ? next.delete(slug) : next.add(slug);
      return next;
    });
  };

  const toggleSelect = (slug: string) => {
    setSelectedBrands((prev) => {
      const next = new Set(prev);
      next.has(slug) ? next.delete(slug) : next.add(slug);
      return next;
    });
  };

  const selectedGroups = brandGroups.filter((g) => selectedBrands.has(g.brandSlug));
  const orderTotal = selectedGroups.reduce((a, g) => a + g.totalPrice, 0);
  const orderPieces = selectedGroups.reduce((a, g) => a + g.totalPieces, 0);

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <NextilHeader />
        <div className="flex">
          <NextilSidebar />
          <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20">
            <ShoppingBag className="h-16 w-16 text-muted-foreground/30" />
            <p className="text-muted-foreground">Sua sacola está vazia</p>
            <Button variant="outline" onClick={() => router.push("/marcas")}>
              Explorar marcas
            </Button>
          </div>
        </div>
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NextilHeader />
      <div className="flex">
        <NextilSidebar />
        <div className="flex-1 min-w-0 pb-16 md:pb-0">
          <div className="max-w-6xl mx-auto px-3 md:px-6 py-4 md:py-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => router.back()}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h1 className="text-xl md:text-2xl font-bold text-foreground">Minha sacola</h1>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
              {/* Left: Brand groups */}
              <div className="flex-1 space-y-4">
                {brandGroups.map((group) => {
                  const isExpanded = expandedBrands.has(group.brandSlug);
                  const isSelected = selectedBrands.has(group.brandSlug);

                  return (
                    <div
                      key={group.brandSlug}
                      className="border border-border rounded-xl bg-card overflow-hidden"
                    >
                      {/* Brand header */}
                      <div className="flex items-center gap-3 px-4 py-3 bg-card">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(group.brandSlug)}
                          className="h-4 w-4 rounded border-border accent-primary"
                        />
                        {group.brandLogo && (
                          <img
                            src={group.brandLogo}
                            alt={group.brandName}
                            className="h-8 w-8 rounded-lg object-cover border border-border"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-foreground">
                            {group.brandName}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Peças: {group.totalPieces}
                        </p>
                        <button
                          onClick={() => toggleExpand(group.brandSlug)}
                          className="p-1 text-muted-foreground hover:text-foreground"
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            {/* Products */}
                            <div className="border-t border-border">
                              {group.items.map((item) => {
                                const pieces = (Object.values(item.quantities) as number[]).reduce(
                                  (a, b) => a + b,
                                  0,
                                ) * item.selectedColors.length;
                                const price = pieces * item.product.price;
                                const sizes = Object.entries(item.quantities)
                                  .filter(([, qty]) => (qty as number) > 0)
                                  .map(([s]) => s);
                                return (
                                  <div
                                    key={item.product.id}
                                    className="flex items-start gap-3 px-4 py-3 border-b border-border last:border-b-0"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      readOnly
                                      className="h-4 w-4 mt-1 rounded border-border accent-primary"
                                    />
                                    <img
                                      src={item.product.variants[0]?.images[0]}
                                      alt={item.product.name}
                                      className="h-14 w-14 rounded-lg object-cover border border-border shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs md:text-sm font-semibold text-foreground line-clamp-1">
                                        {item.product.name}
                                      </p>
                                      <p className="text-[10px] text-muted-foreground mt-0.5">
                                        REF: {item.product.ref}
                                      </p>
                                      <p className="text-[10px] text-muted-foreground">
                                        Variante: {item.selectedColors.join(", ")}
                                      </p>
                                      <p className="text-[10px] text-muted-foreground">
                                        Tamanho: {sizes.join(", ")}
                                      </p>
                                      <p className="text-[10px] text-muted-foreground">
                                        Quantidade de peças: {pieces}
                                      </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                      <p className="text-sm font-bold text-foreground">
                                        {fmt(price)}
                                      </p>
                                    </div>
                                    <div className="flex flex-col gap-1 shrink-0">
                                      <button className="h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                                        <Pencil className="h-3 w-3" />
                                      </button>
                                      <button
                                        onClick={() => cart.removeItem(item.product.id)}
                                        className="h-6 w-6 rounded-md flex items-center justify-center text-destructive hover:bg-destructive/10 transition-colors"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Brand subtotal */}
                            <div className="px-4 py-2.5 bg-muted/30 border-t border-border flex items-center justify-between gap-4 text-xs">
                              <span className="text-muted-foreground">
                                Peças: {group.totalPieces}
                              </span>
                              <span className="text-muted-foreground">
                                Preço médio/peça: {fmt(group.totalPrice / group.totalPieces)}
                              </span>
                              <span className="font-bold text-foreground">
                                Total da marca: {fmt(group.totalPrice)}
                              </span>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

              {/* Right: Summary sidebar */}
              <div className="lg:w-[340px] shrink-0">
                <div className="sticky top-20 space-y-4">
                  {/* Order summary */}
                  <div className="border border-border rounded-xl bg-card p-4 space-y-3">
                    {selectedGroups.map((group) => (
                      <div
                        key={group.brandSlug}
                        className="flex items-center justify-between text-sm"
                      >
                        <div>
                          <p className="font-medium text-foreground">Marca</p>
                          <p className="text-xs text-muted-foreground">Total da marca</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-foreground">
                            {group.brandName.toUpperCase()}
                          </p>
                          <p className="text-xs text-foreground">
                            {fmt(group.totalPrice)}
                          </p>
                        </div>
                      </div>
                    ))}

                    <div className="border-t border-border pt-3 flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">Total do pedido</p>
                      <p className="text-lg font-bold text-foreground">{fmt(orderTotal)}</p>
                    </div>
                  </div>

                  {/* Payment per brand */}
                  <div className="border border-border rounded-xl bg-card p-4 space-y-4">
                    <p className="text-sm font-bold text-foreground">
                      Forma de pagamento (por empresa)
                    </p>

                    {selectedGroups.map((group) => (
                      <div key={group.brandSlug} className="space-y-2">
                        <p className="text-xs font-medium text-foreground">{group.brandName}</p>

                        <div>
                          <label className="text-[10px] text-muted-foreground">
                            Forma de pagamento
                          </label>
                          <Select
                            value={paymentMethods[group.brandSlug] || ""}
                            onValueChange={(v) =>
                              setPaymentMethods((prev) => ({ ...prev, [group.brandSlug]: v }))
                            }
                          >
                            <SelectTrigger className="h-9 text-xs">
                              <SelectValue placeholder="Selecionar" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="boleto">Boleto</SelectItem>
                              <SelectItem value="pix">PIX</SelectItem>
                              <SelectItem value="cartao">Cartão de Crédito</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="text-[10px] text-muted-foreground">Prazo</label>
                          <Select
                            value={prazos[group.brandSlug] || ""}
                            onValueChange={(v) =>
                              setPrazos((prev) => ({ ...prev, [group.brandSlug]: v }))
                            }
                          >
                            <SelectTrigger className="h-9 text-xs">
                              <SelectValue placeholder="Selecionar prazo" />
                            </SelectTrigger>
                            <SelectContent>
                              {prazoOptions.map((p) => (
                                <SelectItem key={p} value={p}>
                                  {p}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {group !== selectedGroups[selectedGroups.length - 1] && (
                          <div className="border-b border-border" />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Confirm button */}
                  <Button className="w-full gap-2" size="lg">
                    <CreditCard className="h-4 w-4" />
                    Confirmar pedido
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <MobileNav />
    </div>
  );
}

