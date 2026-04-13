import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useCart, type CartItem } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import CommercialPolicyBar, { type DiscountTier } from "@/components/CommercialPolicyBar";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Trash2,
  ShoppingBag,
  Pencil,
  CreditCard,
  CalendarIcon,
  Tag,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

/* ───── helpers ───── */
const fmt = (v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`;

/* ───── commercial policy mock data ───── */
interface PrazoDiscount {
  prazo: string;
  label: string;
  extraPercent: number;
}

interface CommercialPolicy {
  tiers: DiscountTier[];
  prazoDiscounts: PrazoDiscount[];
}

const defaultPolicy: CommercialPolicy = {
  tiers: [
    { minValue: 5000, discountPercent: 3 },
    { minValue: 10000, discountPercent: 5 },
    { minValue: 25000, discountPercent: 8 },
    { minValue: 50000, discountPercent: 12 },
  ],
  prazoDiscounts: [
    { prazo: "pix", label: "PIX à vista", extraPercent: 3 },
    { prazo: "30", label: "30 dias", extraPercent: 1 },
    { prazo: "30, 40", label: "30, 40 dias", extraPercent: 0.5 },
    { prazo: "30, 40, 60", label: "30, 40, 60 dias", extraPercent: 0 },
    { prazo: "30, 45", label: "30, 45 dias", extraPercent: 0.5 },
    { prazo: "30, 45, 60", label: "30, 45, 60 dias", extraPercent: 0 },
    { prazo: "30, 45, 60, 75", label: "30, 45, 60, 75 dias", extraPercent: 0 },
  ],
};

/* ───── types ───── */
interface BrandGroup {
  brandSlug: string;
  brandName: string;
  brandLogo?: string;
  items: CartItem[];
  totalPieces: number;
  totalPrice: number;
}

/* ───── component ───── */
const Checkout = () => {
  const navigate = useNavigate();
  const cart = useCart();
  const [expandedBrands, setExpandedBrands] = useState<Set<string>>(new Set());
  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(new Set());
  const [paymentMethods, setPaymentMethods] = useState<Record<string, string>>({});
  const [prazos, setPrazos] = useState<Record<string, string>>({});
  const [billingDates, setBillingDates] = useState<Record<string, Date | undefined>>({});

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
      const pieces = (Object.values(item.quantities) as number[]).reduce((a, b) => a + b, 0) * item.selectedColors.length;
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

  /* ───── discount calculations ───── */
  const getVolumeDiscount = (value: number): number => {
    const sorted = [...defaultPolicy.tiers].sort((a, b) => b.minValue - a.minValue);
    for (const tier of sorted) {
      if (value >= tier.minValue) return tier.discountPercent;
    }
    return 0;
  };

  const getPrazoDiscount = (prazo: string): { percent: number; label: string } => {
    const found = defaultPolicy.prazoDiscounts.find((p) => p.prazo === prazo);
    return found ? { percent: found.extraPercent, label: found.label } : { percent: 0, label: "" };
  };

  const selectedGroups = brandGroups.filter((g) => selectedBrands.has(g.brandSlug));

  const groupTotals = useMemo(() => {
    return selectedGroups.map((group) => {
      const volumeDiscount = getVolumeDiscount(group.totalPrice);
      const prazoInfo = getPrazoDiscount(prazos[group.brandSlug] || "");
      const totalDiscount = volumeDiscount + prazoInfo.percent;
      const discountAmount = group.totalPrice * (totalDiscount / 100);
      const netTotal = group.totalPrice - discountAmount;
      return {
        brandSlug: group.brandSlug,
        brandName: group.brandName,
        subtotal: group.totalPrice,
        volumePercent: volumeDiscount,
        volumeAmount: group.totalPrice * (volumeDiscount / 100),
        prazoPercent: prazoInfo.percent,
        prazoAmount: group.totalPrice * (prazoInfo.percent / 100),
        totalDiscount,
        discountAmount,
        netTotal,
        pieces: group.totalPieces,
      };
    });
  }, [selectedGroups, prazos]);

  const orderTotal = groupTotals.reduce((a, g) => a + g.netTotal, 0);
  const orderSubtotal = groupTotals.reduce((a, g) => a + g.subtotal, 0);
  const orderDiscount = groupTotals.reduce((a, g) => a + g.discountAmount, 0);
  const orderPieces = groupTotals.reduce((a, g) => a + g.pieces, 0);

  if (cart.items.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20">
        <ShoppingBag className="h-16 w-16 text-muted-foreground/30" />
        <p className="text-muted-foreground">Sua sacola está vazia</p>
        <Button variant="outline" onClick={() => navigate("/marcas")}>
          Explorar marcas
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 min-w-0 pb-16 md:pb-0">
      <div className="max-w-6xl mx-auto px-3 md:px-6 py-4 md:py-6">
          <div className="max-w-6xl mx-auto px-3 md:px-6 py-4 md:py-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => navigate(-1)}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h1 className="text-xl md:text-2xl font-bold text-foreground">Finalizar pedido</h1>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
              {/* Left: Brand groups */}
              <div className="flex-1 space-y-4">
                {brandGroups.map((group) => {
                  const isExpanded = expandedBrands.has(group.brandSlug);
                  const isSelected = selectedBrands.has(group.brandSlug);
                  const gt = groupTotals.find((g) => g.brandSlug === group.brandSlug);

                  return (
                    <div key={group.brandSlug} className="border border-border rounded-xl bg-card overflow-hidden">
                      {/* Brand header */}
                      <div className="flex items-center gap-3 px-4 py-3 bg-card">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(group.brandSlug)}
                          className="h-4 w-4 rounded border-border accent-primary"
                        />
                        {group.brandLogo && (
                          <img src={group.brandLogo} alt={group.brandName} className="h-8 w-8 rounded-lg object-cover border border-border" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-foreground">{group.brandName}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">{group.totalPieces} peças</p>
                        <button onClick={() => toggleExpand(group.brandSlug)} className="p-1 text-muted-foreground hover:text-foreground">
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                      </div>

                      {/* Commercial policy bar — always visible */}
                      <CommercialPolicyBar tiers={defaultPolicy.tiers} currentValue={group.totalPrice} />

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
                                const pieces = (Object.values(item.quantities) as number[]).reduce((a, b) => a + b, 0) * item.selectedColors.length;
                                const price = pieces * item.product.price;
                                const sizes = Object.entries(item.quantities)
                                  .filter(([, qty]) => (qty as number) > 0)
                                  .map(([s]) => s);
                                return (
                                  <div key={item.product.id} className="flex items-start gap-3 px-4 py-3 border-b border-border last:border-b-0">
                                    <input type="checkbox" checked={isSelected} readOnly className="h-4 w-4 mt-1 rounded border-border accent-primary" />
                                    <img
                                      src={item.product.variants[0]?.images[0]}
                                      alt={item.product.name}
                                      className="h-14 w-14 rounded-lg object-cover border border-border shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs md:text-sm font-semibold text-foreground line-clamp-1">{item.product.name}</p>
                                      <p className="text-[10px] text-muted-foreground mt-0.5">REF: {item.product.ref}</p>
                                      <p className="text-[10px] text-muted-foreground">Cor: {item.selectedColors.join(", ")}</p>
                                      <p className="text-[10px] text-muted-foreground">Tam: {sizes.join(", ")}</p>
                                      <p className="text-[10px] text-muted-foreground">{pieces} peças</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                      <p className="text-sm font-bold text-foreground">{fmt(price)}</p>
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

                            {/* Brand subtotal breakdown */}
                            {gt && (
                              <div className="px-4 py-3 bg-muted/30 border-t border-border space-y-1 text-xs">
                                <div className="flex justify-between text-muted-foreground">
                                  <span>Subtotal bruto ({group.totalPieces} peças)</span>
                                  <span>{fmt(gt.subtotal)}</span>
                                </div>
                                {gt.volumePercent > 0 && (
                                  <div className="flex justify-between text-primary">
                                    <span className="flex items-center gap-1">
                                      <Tag className="h-3 w-3" />
                                      Desc. volume ({gt.volumePercent}%)
                                    </span>
                                    <span>-{fmt(gt.volumeAmount)}</span>
                                  </div>
                                )}
                                {gt.prazoPercent > 0 && (
                                  <div className="flex justify-between text-primary">
                                    <span className="flex items-center gap-1">
                                      <Tag className="h-3 w-3" />
                                      Desc. prazo (+{gt.prazoPercent}%)
                                    </span>
                                    <span>-{fmt(gt.prazoAmount)}</span>
                                  </div>
                                )}
                                <div className="flex justify-between font-bold text-foreground pt-1 border-t border-border">
                                  <span>Total da marca</span>
                                  <span>{fmt(gt.netTotal)}</span>
                                </div>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

              {/* Right: Summary sidebar */}
              <div className="lg:w-[360px] shrink-0">
                <div className="sticky top-20 space-y-4">
                  {/* Payment & billing per brand */}
                  <div className="border border-border rounded-xl bg-card p-4 space-y-4">
                    <p className="text-sm font-bold text-foreground">Pagamento & Faturamento</p>

                    {selectedGroups.map((group, i) => {
                      const prazoInfo = getPrazoDiscount(prazos[group.brandSlug] || "");
                      return (
                        <div key={group.brandSlug} className="space-y-2.5">
                          <p className="text-xs font-bold text-foreground">{group.brandName}</p>

                          {/* Payment method */}
                          <div>
                            <label className="text-[10px] text-muted-foreground">Forma de pagamento</label>
                            <Select
                              value={paymentMethods[group.brandSlug] || ""}
                              onValueChange={(v) => setPaymentMethods((prev) => ({ ...prev, [group.brandSlug]: v }))}
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

                          {/* Prazo */}
                          <div>
                            <label className="text-[10px] text-muted-foreground">Prazo de pagamento</label>
                            <Select
                              value={prazos[group.brandSlug] || ""}
                              onValueChange={(v) => setPrazos((prev) => ({ ...prev, [group.brandSlug]: v }))}
                            >
                              <SelectTrigger className="h-9 text-xs">
                                <SelectValue placeholder="Selecionar prazo" />
                              </SelectTrigger>
                              <SelectContent>
                                {defaultPolicy.prazoDiscounts.map((p) => (
                                  <SelectItem key={p.prazo} value={p.prazo}>
                                    {p.label}
                                    {p.extraPercent > 0 && (
                                      <span className="ml-1 text-primary font-medium">(+{p.extraPercent}% desc.)</span>
                                    )}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {prazoInfo.percent > 0 && (
                              <p className="text-[10px] text-primary mt-1 font-medium">
                                +{prazoInfo.percent}% de desconto por prazo curto
                              </p>
                            )}
                          </div>

                          {/* Billing date */}
                          <div>
                            <label className="text-[10px] text-muted-foreground">Prazo de faturamento</label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full h-9 justify-start text-left text-xs font-normal",
                                    !billingDates[group.brandSlug] && "text-muted-foreground"
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                                  {billingDates[group.brandSlug]
                                    ? format(billingDates[group.brandSlug]!, "dd/MM/yyyy")
                                    : "Selecionar data"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={billingDates[group.brandSlug]}
                                  onSelect={(date) =>
                                    setBillingDates((prev) => ({ ...prev, [group.brandSlug]: date }))
                                  }
                                  disabled={(date) => date < new Date()}
                                  initialFocus
                                  className={cn("p-3 pointer-events-auto")}
                                />
                              </PopoverContent>
                            </Popover>
                          </div>

                          {i < selectedGroups.length - 1 && <div className="border-b border-border" />}
                        </div>
                      );
                    })}
                  </div>

                  {/* Order summary */}
                  <div className="border border-border rounded-xl bg-card p-4 space-y-2">
                    <p className="text-sm font-bold text-foreground mb-3">Resumo do pedido</p>

                    {groupTotals.map((gt) => (
                      <div key={gt.brandSlug} className="space-y-0.5 text-xs">
                        <div className="flex justify-between font-medium text-foreground">
                          <span>{gt.brandName}</span>
                          <span>{fmt(gt.subtotal)}</span>
                        </div>
                        {gt.totalDiscount > 0 && (
                          <div className="flex justify-between text-primary">
                            <span>Descontos ({gt.totalDiscount}%)</span>
                            <span>-{fmt(gt.discountAmount)}</span>
                          </div>
                        )}
                      </div>
                    ))}

                    <div className="border-t border-border pt-2 mt-2 space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Subtotal ({orderPieces} peças)</span>
                        <span>{fmt(orderSubtotal)}</span>
                      </div>
                      {orderDiscount > 0 && (
                        <div className="flex justify-between text-xs text-primary font-medium">
                          <span>Total descontos</span>
                          <span>-{fmt(orderDiscount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-base font-bold text-foreground pt-1">
                        <span>Total do pedido</span>
                        <span>{fmt(orderTotal)}</span>
                      </div>
                    </div>
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
  );
};

export default Checkout;
