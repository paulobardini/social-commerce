import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shuffle, Check } from "lucide-react";
import type { Product } from "@/data/mockProducts";

interface GradeAbertaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
}

export function GradeAbertaModal({ open, onOpenChange, product }: GradeAbertaModalProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>(
    Object.fromEntries(product.sizes.map((s) => [s, 0]))
  );
  const [selectedColors, setSelectedColors] = useState<string[]>(
    product.variants.map((v) => v.color)
  );
  const [distributeValue, setDistributeValue] = useState("");

  const totalPieces = useMemo(
    () => Object.values(quantities).reduce((a, b) => a + b, 0),
    [quantities]
  );

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-lg font-semibold">Montar grade aberta</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Nesse estilo de grade você pode{" "}
            <strong>ajustar os tamanhos, quantidades e variantes</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 space-y-4">
          {/* Distribute row */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
              Faça a distribuição
            </span>
            <Input
              type="number"
              min={0}
              value={distributeValue}
              onChange={(e) => setDistributeValue(e.target.value)}
              placeholder="0"
              className="h-9 text-center"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleDistribute}
              className="gap-2 shrink-0"
            >
              <Shuffle className="h-4 w-4" />
              Distribuir
            </Button>
          </div>

          {/* Size / Quantity table */}
          <div className="border border-border rounded-lg overflow-hidden">
            <div className="grid gap-0" style={{ gridTemplateColumns: `auto repeat(${product.sizes.length}, 1fr) auto` }}>
              {/* Header */}
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground bg-muted/50 border-b border-border">
                Tamanho
              </div>
              {product.sizes.map((s) => (
                <div key={s} className="px-2 py-2 text-center text-xs font-semibold text-muted-foreground bg-muted/50 border-b border-border">
                  {s}
                </div>
              ))}
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground bg-muted/50 border-b border-border text-right">
                Total peças
              </div>

              {/* Quantity row */}
              <div className="px-3 py-2 text-sm font-medium text-foreground flex items-center">
                Quantidade
              </div>
              {product.sizes.map((s) => (
                <div key={s} className="px-1 py-2 flex justify-center">
                  <Input
                    type="number"
                    min={0}
                    value={quantities[s] || 0}
                    onChange={(e) =>
                      setQuantities((prev) => ({
                        ...prev,
                        [s]: Math.max(0, parseInt(e.target.value) || 0),
                      }))
                    }
                    className="h-8 w-14 text-center text-sm"
                  />
                </div>
              ))}
              <div className="px-3 py-2 text-sm font-semibold text-foreground flex items-center justify-end">
                {totalPieces}
              </div>
            </div>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">Total final</span>
            <span className="text-sm font-semibold text-foreground">
              R$ {totalPrice.toFixed(2).replace(".", ",")}
            </span>
          </div>

          {/* Color variants */}
          <div className="flex gap-3 flex-wrap">
            {product.variants.map((v) => (
              <button
                key={v.color}
                onClick={() => toggleColor(v.color)}
                className={`relative flex items-center gap-2 px-4 py-3 rounded-lg border transition-colors ${
                  selectedColors.includes(v.color)
                    ? "border-accent bg-accent/5"
                    : "border-border bg-card"
                }`}
              >
                <div
                  className="w-8 h-8 rounded border border-border"
                  style={{ backgroundColor: v.colorHex }}
                />
                <span className="text-sm text-foreground">{v.color}</span>
                {selectedColors.includes(v.color) && (
                  <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                    <Check className="h-3 w-3 text-accent-foreground" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-4 flex justify-end">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => onOpenChange(false)}
          >
            Adicionar à sacola
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
