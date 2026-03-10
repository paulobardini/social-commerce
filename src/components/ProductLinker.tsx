import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { brands, type Product } from "@/data/mockProducts";

interface ProductLinkerProps {
  selected: Product[];
  onChange: (products: Product[]) => void;
  maxItems?: number;
}

const allProducts = brands.flatMap((b) => b.products);

export function ProductLinker({ selected, onChange, maxItems = 10 }: ProductLinkerProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return allProducts.slice(0, 20);
    const q = search.toLowerCase();
    return allProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.ref.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    ).slice(0, 20);
  }, [search]);

  const selectedIds = new Set(selected.map((p) => p.id));

  const toggle = (product: Product) => {
    if (selectedIds.has(product.id)) {
      onChange(selected.filter((p) => p.id !== product.id));
    } else if (selected.length < maxItems) {
      onChange([...selected, product]);
    }
  };

  const remove = (id: string) => {
    onChange(selected.filter((p) => p.id !== id));
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((p) => (
            <span
              key={p.id}
              className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent"
            >
              {p.name}
              <button onClick={() => remove(p.id)} className="hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar produto por nome ou ref..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Product list */}
      <div className="max-h-52 overflow-y-auto space-y-1 rounded-lg border border-border p-1">
        {filtered.map((product) => {
          const isSelected = selectedIds.has(product.id);
          return (
            <button
              key={product.id}
              onClick={() => toggle(product)}
              className={`flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors ${
                isSelected
                  ? "bg-accent/10 ring-1 ring-accent/30"
                  : "hover:bg-muted"
              }`}
            >
              <img
                src={product.variants[0]?.images[0]}
                alt={product.name}
                className="h-10 w-10 rounded-md object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{product.name}</p>
                <p className="text-[10px] text-muted-foreground">
                  Ref: {product.ref} · R$ {product.price.toFixed(2)}
                </p>
              </div>
              {isSelected && (
                <div className="h-5 w-5 rounded-full bg-accent flex items-center justify-center">
                  <span className="text-[10px] text-accent-foreground font-bold">✓</span>
                </div>
              )}
            </button>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-center text-xs text-muted-foreground py-4">Nenhum produto encontrado</p>
        )}
      </div>
    </div>
  );
}
