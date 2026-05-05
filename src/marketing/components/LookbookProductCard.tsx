import { brands } from "@/data/mockProducts";

export interface ResolvedLookbookProduct {
  id: string;
  brandSlug: string;
  brandName: string;
  name: string;
  ref: string;
  price: number;
  image: string;
  category: string;
}

/** Resolve composite ID `brandSlug/productId` → produto + marca. Aceita id sem prefixo (busca em qualquer marca). */
export function resolveLookbookProduct(compositeId: string): ResolvedLookbookProduct | null {
  const [a, b] = compositeId.includes("/") ? compositeId.split("/") : [null, compositeId];
  for (const brand of brands) {
    if (a && brand.slug !== a) continue;
    const product = brand.products.find(p => p.id === b);
    if (product) {
      return {
        id: `${brand.slug}/${product.id}`,
        brandSlug: brand.slug,
        brandName: brand.name,
        name: product.name,
        ref: product.ref,
        price: product.price,
        image: product.variants[0]?.images[0] || "",
        category: product.category,
      };
    }
  }
  return null;
}

interface CardProps {
  productId: string;
  size?: "sm" | "md" | "lg";
  showPrice?: boolean;
  paletaPrimaria?: string;
  onClick?: () => void;
}

export function LookbookProductCard({ productId, size = "md", showPrice = true, paletaPrimaria, onClick }: CardProps) {
  const p = resolveLookbookProduct(productId);
  if (!p) {
    return (
      <div className="aspect-[3/4] rounded-lg bg-white/10 flex items-center justify-center text-[10px] opacity-60">
        Produto removido
      </div>
    );
  }
  const titleSize = size === "sm" ? "text-[10px]" : size === "lg" ? "text-[13px]" : "text-[11px]";
  const priceSize = size === "sm" ? "text-[10px]" : size === "lg" ? "text-sm" : "text-[11px]";
  return (
    <button
      onClick={onClick}
      className="group relative aspect-[3/4] rounded-lg overflow-hidden bg-white/10 text-left w-full"
    >
      {p.image ? (
        <img src={p.image} alt={p.name} loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5" />
      )}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent p-2">
        <p className="text-[8px] uppercase tracking-wide text-white/70 truncate">{p.brandName}</p>
        <p className={`${titleSize} font-semibold text-white leading-tight line-clamp-2`}>{p.name}</p>
        {showPrice && (
          <p className={`${priceSize} font-bold text-white tabular-nums mt-0.5`} style={paletaPrimaria ? { color: paletaPrimaria } : undefined}>
            R$ {p.price.toFixed(2).replace(".", ",")}
          </p>
        )}
      </div>
      <span className="absolute top-1.5 left-1.5 text-[8px] uppercase tracking-wide bg-black/60 text-white px-1.5 py-0.5 rounded">
        Ref {p.ref}
      </span>
    </button>
  );
}
