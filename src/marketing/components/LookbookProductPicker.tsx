import { useMemo, useState } from "react";
import { Search, X, Trash2 } from "lucide-react";
import { brands } from "@/data/mockProducts";
import { resolveLookbookProduct } from "./LookbookProductCard";

interface Props {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  max?: number;
}

const allProducts = brands.flatMap(b =>
  b.products.map(p => ({
    compositeId: `${b.slug}/${p.id}`,
    name: p.name,
    ref: p.ref,
    category: p.category,
    price: p.price,
    image: p.variants[0]?.images[0] || "",
    brandSlug: b.slug,
    brandName: b.name,
  }))
);

const allBrands = brands.map(b => ({ slug: b.slug, name: b.name, count: b.products.length }));
const allCategories = Array.from(new Set(allProducts.map(p => p.category))).sort();

/** Seletor de produtos do catálogo Nextil para páginas de Lookbook. */
export function LookbookProductPicker({ selectedIds, onChange, max = 12 }: Props) {
  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState<string>("");
  const [catFilter, setCatFilter] = useState<string>("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allProducts.filter(p => {
      if (brandFilter && p.brandSlug !== brandFilter) return false;
      if (catFilter && p.category !== catFilter) return false;
      if (!q) return true;
      return p.name.toLowerCase().includes(q) || p.ref.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    }).slice(0, 30);
  }, [search, brandFilter, catFilter]);

  const selectedSet = new Set(selectedIds);

  const toggle = (id: string) => {
    if (selectedSet.has(id)) onChange(selectedIds.filter(s => s !== id));
    else if (selectedIds.length < max) onChange([...selectedIds, id]);
  };

  const move = (idx: number, dir: -1 | 1) => {
    const next = [...selectedIds];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  };

  const addAllOfBrand = (slug: string) => {
    const brandIds = allProducts.filter(p => p.brandSlug === slug).slice(0, max).map(p => p.compositeId);
    onChange(brandIds.slice(0, max));
  };
  const addAllOfCategory = (cat: string) => {
    const catIds = allProducts.filter(p => p.category === cat).slice(0, max).map(p => p.compositeId);
    onChange(catIds.slice(0, max));
  };

  return (
    <div className="space-y-2.5">
      {/* Quick fills */}
      <div className="flex flex-wrap gap-1.5">
        <select
          value=""
          onChange={e => e.target.value && addAllOfBrand(e.target.value)}
          className="text-[10px] bg-card border border-border rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">+ Adicionar marca…</option>
          {allBrands.map(b => <option key={b.slug} value={b.slug}>{b.name} ({b.count})</option>)}
        </select>
        <select
          value=""
          onChange={e => e.target.value && addAllOfCategory(e.target.value)}
          className="text-[10px] bg-card border border-border rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">+ Adicionar categoria…</option>
          {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        {selectedIds.length > 0 && (
          <button onClick={() => onChange([])} className="text-[10px] text-rose-600 inline-flex items-center gap-1 px-1.5 py-1 rounded hover:bg-rose-500/10">
            <Trash2 className="h-3 w-3" /> Limpar
          </button>
        )}
      </div>

      {/* Selected list with reorder */}
      {selectedIds.length > 0 && (
        <div className="space-y-1 border border-border rounded-lg p-1.5 bg-muted/30">
          <p className="text-[9px] uppercase tracking-wide text-muted-foreground font-bold px-1">Selecionados ({selectedIds.length}/{max})</p>
          {selectedIds.map((id, i) => {
            const p = resolveLookbookProduct(id);
            return (
              <div key={id} className="flex items-center gap-2 bg-card rounded px-1.5 py-1 text-[11px]">
                <span className="text-muted-foreground tabular-nums w-4 text-center text-[10px]">{i + 1}</span>
                {p?.image && <img src={p.image} alt="" className="h-7 w-7 rounded object-cover shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium text-foreground text-[10px] leading-tight">{p?.name || "Removido"}</p>
                  <p className="text-[9px] text-muted-foreground">{p?.brandName} · R$ {p?.price.toFixed(2)}</p>
                </div>
                <div className="flex flex-col gap-0.5">
                  <button onClick={() => move(i, -1)} disabled={i === 0} className="text-[9px] text-muted-foreground hover:text-foreground disabled:opacity-30 leading-none">▲</button>
                  <button onClick={() => move(i, 1)} disabled={i === selectedIds.length - 1} className="text-[9px] text-muted-foreground hover:text-foreground disabled:opacity-30 leading-none">▼</button>
                </div>
                <button onClick={() => toggle(id)} className="text-rose-600 hover:bg-rose-500/10 rounded p-0.5">
                  <X className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-1.5">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Buscar produto, ref…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-card border border-border rounded pl-6 pr-2 py-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <select value={brandFilter} onChange={e => setBrandFilter(e.target.value)} className="text-[10px] bg-card border border-border rounded px-1 focus:outline-none focus:ring-1 focus:ring-ring max-w-[80px]">
          <option value="">Marcas</option>
          {allBrands.map(b => <option key={b.slug} value={b.slug}>{b.name}</option>)}
        </select>
      </div>

      {/* Catalog grid */}
      <div className="max-h-60 overflow-y-auto grid grid-cols-3 gap-1.5 p-1 border border-border rounded-lg">
        {filtered.map(p => {
          const isSel = selectedSet.has(p.compositeId);
          const disabled = !isSel && selectedIds.length >= max;
          return (
            <button
              key={p.compositeId}
              onClick={() => toggle(p.compositeId)}
              disabled={disabled}
              className={`relative aspect-[3/4] rounded overflow-hidden text-left disabled:opacity-30 disabled:cursor-not-allowed ${isSel ? "ring-2 ring-primary" : "ring-1 ring-border hover:ring-primary/50"}`}
            >
              {p.image ? <img src={p.image} alt={p.name} loading="lazy" className="absolute inset-0 w-full h-full object-cover" /> : <div className="absolute inset-0 bg-muted" />}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-1">
                <p className="text-[8px] text-white truncate leading-tight">{p.name}</p>
                <p className="text-[8px] text-white/80 tabular-nums">R$ {p.price.toFixed(2)}</p>
              </div>
              {isSel && (
                <div className="absolute top-1 right-1 h-4 w-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[8px] font-bold">✓</div>
              )}
            </button>
          );
        })}
        {filtered.length === 0 && <p className="col-span-3 text-center text-[10px] text-muted-foreground py-4">Nenhum produto</p>}
      </div>
    </div>
  );
}
