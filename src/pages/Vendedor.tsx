import { useState, useMemo } from "react";
import { NextilHeader } from "@/components/NextilHeader";
import { NextilSidebar } from "@/components/NextilSidebar";
import { MobileNav } from "@/components/MobileNav";
import { ProductDetailModal } from "@/components/ProductDetailModal";
import { GradeAbertaModal } from "@/components/GradeAbertaModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { brands, type Product, type Brand, mockOpportunities, type Opportunity } from "@/data/mockProducts";
import {
  ChevronDown, ChevronRight, LayoutGrid, List, Search, SlidersHorizontal,
  Plus, Clock, Flame, Zap, Tag, ArrowUpDown, X, ChevronLeft
} from "lucide-react";

const allProducts = brands.flatMap((b) =>
  b.products.map((p) => ({ ...p, brandName: b.name, brandSlug: b.slug, brandLogo: b.logo }))
);

type EnrichedProduct = (typeof allProducts)[number];

const categories = [...new Set(allProducts.map((p) => p.category))];
const genders = [...new Set(allProducts.map((p) => p.gender))];
const allSizes = [...new Set(allProducts.flatMap((p) => p.sizes))];

function CountdownTimer({ expiresAt }: { expiresAt: string }) {
  const [, setTick] = useState(0);
  const diff = new Date(expiresAt).getTime() - Date.now();
  const hours = Math.max(0, Math.floor(diff / 3600000));
  const mins = Math.max(0, Math.floor((diff % 3600000) / 60000));

  useState(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(id);
  });

  if (diff <= 0) return <span className="text-xs opacity-70">Expirado</span>;
  return (
    <span className="flex items-center gap-1 text-xs font-medium">
      <Clock className="h-3 w-3" />
      {hours}h {mins}min restantes
    </span>
  );
}

const brandColors: Record<string, string> = {
  brandili: "bg-blue-500",
  kyly: "bg-emerald-500",
  hering: "bg-red-500",
  malwee: "bg-amber-500",
  lunender: "bg-purple-500",
  marisol: "bg-pink-500",
  elian: "bg-teal-500",
  "colorittá": "bg-orange-500",
};

export default function Vendedor() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name-asc");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 300]);
  const [discountFilter, setDiscountFilter] = useState<number>(0);
  
  const [selectedProduct, setSelectedProduct] = useState<EnrichedProduct | null>(null);
  const [showGrade, setShowGrade] = useState(false);
  const [mobileFilters, setMobileFilters] = useState(false);

  // Resolve opportunity products
  const oppProducts = useMemo(() => {
    return mockOpportunities.map((opp) => {
      const prod = allProducts.find((p) => p.id === opp.productId);
      return { opp, product: prod };
    }).filter((x) => x.product);
  }, []);

  const filtered = useMemo(() => {
    let list = allProducts;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.ref.includes(q));
    }
    if (selectedBrands.length) list = list.filter((p) => selectedBrands.includes(p.brandSlug));
    if (selectedCategories.length) list = list.filter((p) => selectedCategories.includes(p.category));
    if (selectedGenders.length) list = list.filter((p) => selectedGenders.includes(p.gender));
    if (selectedSizes.length) list = list.filter((p) => p.sizes.some((s) => selectedSizes.includes(s)));
    list = list.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);

    switch (sortBy) {
      case "name-asc": list = [...list].sort((a, b) => a.name.localeCompare(b.name)); break;
      case "name-desc": list = [...list].sort((a, b) => b.name.localeCompare(a.name)); break;
      case "price-asc": list = [...list].sort((a, b) => a.price - b.price); break;
      case "price-desc": list = [...list].sort((a, b) => b.price - a.price); break;
    }
    return list;
  }, [searchTerm, selectedBrands, selectedCategories, selectedGenders, selectedSizes, priceRange, sortBy]);

  const toggleBrand = (slug: string) =>
    setSelectedBrands((prev) => prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]);
  const toggleCategory = (cat: string) =>
    setSelectedCategories((prev) => prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]);
  const toggleGender = (g: string) =>
    setSelectedGenders((prev) => prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]);
  const toggleSize = (s: string) =>
    setSelectedSizes((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);

  const clearFilters = () => {
    setSelectedBrands([]);
    setSelectedCategories([]);
    setSelectedGenders([]);
    setSelectedSizes([]);
    setPriceRange([0, 300]);
    setDiscountFilter(0);
    
  };

  const hasFilters = selectedBrands.length || selectedCategories.length || selectedGenders.length || selectedSizes.length || priceRange[0] > 0 || priceRange[1] < 300;

  const selectedBrand = selectedProduct ? brands.find((b) => b.slug === selectedProduct.brandSlug) : undefined;

  const filterSidebar = (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-1">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm text-foreground">Filtros</h3>
          {hasFilters && (
            <button onClick={clearFilters} className="text-xs text-muted-foreground hover:text-foreground">Limpar</button>
          )}
        </div>

        {/* Marcas */}
        <FilterSection title="Marcas" defaultOpen>
          <div className="space-y-2">
            {brands.map((b) => (
              <label key={b.slug} className="flex items-center gap-2 cursor-pointer text-sm">
                <Checkbox checked={selectedBrands.includes(b.slug)} onCheckedChange={() => toggleBrand(b.slug)} />
                <span className="flex-1">{b.name}</span>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{b.totalProducts}</Badge>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Categoria */}
        <FilterSection title="Categoria">
          <div className="space-y-2">
            {categories.map((c) => (
              <label key={c} className="flex items-center gap-2 cursor-pointer text-sm">
                <Checkbox checked={selectedCategories.includes(c)} onCheckedChange={() => toggleCategory(c)} />
                <span>{c}</span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Gênero */}
        <FilterSection title="Gênero">
          <div className="space-y-2">
            {genders.map((g) => (
              <label key={g} className="flex items-center gap-2 cursor-pointer text-sm">
                <Checkbox checked={selectedGenders.includes(g)} onCheckedChange={() => toggleGender(g)} />
                <span>{g}</span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Faixa de Preço */}
        <FilterSection title="Faixa de Preço">
          <div className="px-1">
            <Slider
              min={0} max={300} step={10}
              value={priceRange}
              onValueChange={(v) => setPriceRange(v as [number, number])}
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>R$ {priceRange[0]}</span>
              <span>R$ {priceRange[1]}</span>
            </div>
          </div>
        </FilterSection>

        {/* Tamanho */}
        <FilterSection title="Tamanho">
          <div className="flex flex-wrap gap-1.5">
            {allSizes.map((s) => (
              <button
                key={s}
                onClick={() => toggleSize(s)}
                className={`px-2 py-1 text-xs rounded-md border transition-colors ${
                  selectedSizes.includes(s)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-foreground border-border hover:border-primary/50"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </FilterSection>
      </div>
    </ScrollArea>
  );

  return (
    <div className="min-h-screen bg-background">
      <NextilHeader />
      <div className="flex">
        <NextilSidebar />
        <main className="flex-1 min-h-[calc(100vh-4rem)]">
          {/* Breadcrumb */}
          <div className="border-b border-border px-4 md:px-6 py-3 flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Orçamentos</span>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-medium text-foreground">Novo Orçamento</span>
          </div>

          {/* Oportunidades — produto individual com countdown */}
          <div className="border-b border-border px-4 md:px-6 py-4">
            <div className="flex items-center gap-2 mb-3">
              <Flame className="h-5 w-5 text-destructive" />
              <h2 className="font-semibold text-foreground">Oportunidades</h2>
              <Badge variant="secondary" className="text-[10px]">{oppProducts.length} ofertas</Badge>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
              {oppProducts.map(({ opp, product }) => {
                if (!product) return null;
                const img = product.variants[0]?.images[0];
                const isUrgent = new Date(opp.expiresAt).getTime() - Date.now() < 86400000;
                return (
                  <button
                    key={opp.id}
                    onClick={() => setSelectedProduct(product)}
                    className="flex-shrink-0 w-[160px] group text-left bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-200 relative"
                  >
                    {/* Discount badge */}
                    <div className="absolute top-2 left-2 z-10">
                      <Badge className={`border-0 text-[10px] font-bold px-1.5 py-0.5 ${isUrgent ? "bg-destructive text-destructive-foreground animate-pulse" : "bg-accent text-accent-foreground"}`}>
                        -{opp.discountPercent}%
                      </Badge>
                    </div>
                    <div className="absolute top-2 right-2 z-10">
                      <Badge variant="secondary" className="text-[9px] px-1 py-0 bg-card/80 backdrop-blur-sm">
                        {opp.badgeText}
                      </Badge>
                    </div>

                    {/* Image */}
                    <div className="aspect-square relative overflow-hidden bg-muted">
                      <img src={img} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>

                    {/* Info */}
                    <div className="p-2.5 space-y-1">
                      <p className="text-[10px] text-muted-foreground">{product.brandName} · Ref. {product.ref}</p>
                      <p className="text-xs font-medium text-foreground line-clamp-2 leading-tight">{product.name}</p>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xs line-through text-muted-foreground">R$ {opp.originalPrice.toFixed(2)}</span>
                        <span className="text-sm font-bold text-destructive">R$ {opp.promoPrice.toFixed(2)}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">{opp.reason}</p>
                      <div className={`flex items-center gap-1 text-[10px] ${isUrgent ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                        <Clock className="h-3 w-3" />
                        <CountdownTimer expiresAt={opp.expiresAt} />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main content area */}
          <div className="flex">
            {/* Filter sidebar - desktop */}
            <aside className="hidden lg:block w-[240px] border-r border-border h-[calc(100vh-16rem)] sticky top-32">
              {filterSidebar}
            </aside>

            {/* Products area */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="border-b border-border px-4 md:px-6 py-3 flex flex-wrap items-center gap-3">
                <Button variant="outline" size="sm" onClick={() => setShowGrade(true)} className="gap-1.5">
                  <SlidersHorizontal className="h-3.5 w-3.5" /> Montar grade
                </Button>

                <div className="flex-1 min-w-0" />

                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  {filtered.length} produtos
                </span>

                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Buscar ref ou nome..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 h-8 w-[180px] text-sm"
                  />
                </div>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-8 w-[140px] text-xs">
                    <ArrowUpDown className="h-3 w-3 mr-1" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name-asc">Nome A–Z</SelectItem>
                    <SelectItem value="name-desc">Nome Z–A</SelectItem>
                    <SelectItem value="price-asc">Menor preço</SelectItem>
                    <SelectItem value="price-desc">Maior preço</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex border border-border rounded-md overflow-hidden">
                  <button onClick={() => setViewMode("grid")} className={`p-1.5 ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>
                    <LayoutGrid className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => setViewMode("list")} className={`p-1.5 ${viewMode === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>
                    <List className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Mobile filter toggle */}
                <Button variant="outline" size="sm" className="lg:hidden gap-1.5" onClick={() => setMobileFilters(!mobileFilters)}>
                  <SlidersHorizontal className="h-3.5 w-3.5" /> Filtros
                </Button>

                <Button size="sm" className="gap-1.5">
                  <Plus className="h-3.5 w-3.5" /> Adicionar todos ({filtered.length})
                </Button>
              </div>

              {/* Mobile filters */}
              {mobileFilters && (
                <div className="lg:hidden border-b border-border max-h-[50vh] overflow-auto">
                  {filterSidebar}
                </div>
              )}

              {/* Product grid */}
              <div className="p-4 md:p-6">
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
                    {filtered.map((product) => (
                      <ProductCard key={product.id} product={product} onClick={() => setSelectedProduct(product)} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filtered.map((product) => (
                      <ProductListItem key={product.id} product={product} onClick={() => setSelectedProduct(product)} />
                    ))}
                  </div>
                )}

                {filtered.length === 0 && (
                  <div className="text-center py-16 text-muted-foreground">
                    <Tag className="h-10 w-10 mx-auto mb-3 opacity-40" />
                    <p className="font-medium">Nenhum produto encontrado</p>
                    <p className="text-sm">Tente ajustar os filtros</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
      <MobileNav />

      {/* Modals */}
      {selectedProduct && selectedBrand && (
        <ProductDetailModal
          product={selectedProduct}
          brand={selectedBrand}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {showGrade && (
        <GradeAbertaModal
          open={showGrade}
          onOpenChange={setShowGrade}
          product={allProducts[0]}
        />
      )}
    </div>
  );
}

/* --- Sub-components --- */

function FilterSection({ title, defaultOpen, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  return (
    <Collapsible defaultOpen={defaultOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full py-2.5 text-sm font-medium text-foreground hover:text-primary transition-colors group">
        {title}
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent className="pb-3">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

function ProductCard({ product, onClick }: { product: EnrichedProduct; onClick: () => void }) {
  const img = product.variants[0]?.images[0];
  return (
    <button onClick={onClick} className="group text-left bg-card rounded-lg border border-border overflow-hidden hover:shadow-md transition-all duration-200">
      <div className="aspect-[3/4] relative overflow-hidden bg-muted">
        <img src={img} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        <Badge className={`absolute top-2 left-2 text-[9px] px-1.5 py-0 text-white border-0 ${brandColors[product.brandSlug] || "bg-primary"}`}>
          {product.brandName}
        </Badge>
      </div>
      <div className="p-2.5">
        <p className="text-[10px] text-muted-foreground mb-0.5">Ref. {product.ref}</p>
        <p className="text-xs font-medium text-foreground line-clamp-2 leading-tight mb-1.5">{product.name}</p>
        <p className="text-sm font-bold text-foreground">R$ {product.price.toFixed(2)}</p>
      </div>
    </button>
  );
}

function ProductListItem({ product, onClick }: { product: EnrichedProduct; onClick: () => void }) {
  const img = product.variants[0]?.images[0];
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 p-3 bg-card rounded-lg border border-border hover:shadow-md transition-all text-left">
      <img src={img} alt={product.name} className="h-16 w-12 rounded object-cover flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <Badge className={`text-[9px] px-1.5 py-0 text-white border-0 ${brandColors[product.brandSlug] || "bg-primary"}`}>
            {product.brandName}
          </Badge>
          <span className="text-[10px] text-muted-foreground">Ref. {product.ref}</span>
        </div>
        <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
      </div>
      <p className="text-sm font-bold text-foreground whitespace-nowrap">R$ {product.price.toFixed(2)}</p>
    </button>
  );
}
