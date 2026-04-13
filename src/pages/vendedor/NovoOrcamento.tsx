import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Breadcrumbs } from "@/components/vendedor/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LayoutGrid,
  List,
  Search,
  ChevronDown,
  Edit3,
  Eye,
  Layers,
  Upload,
  Settings,
  Diamond,
} from "lucide-react";
import { mockCatalogoProdutos, type OrcamentoProduto } from "@/data/mockVendedor";
import { AddAllProductsModal } from "@/components/vendedor/AddAllProductsModal";

const filterSections = [
  { key: "desconto", label: "Desconto" },
  { key: "marcas", label: "Marcas", count: 2 },
  { key: "marcas_kit", label: "Marcas do kit" },
  { key: "tipo_preco", label: "Tipo e Faixa de preço" },
  { key: "categoria", label: "Categoria" },
  { key: "subcategoria", label: "Subcategoria" },
  { key: "tamanho", label: "Tamanho" },
  { key: "genero", label: "Gênero" },
  { key: "idade", label: "Idade" },
  { key: "estacao", label: "Estação" },
  { key: "temporada", label: "Temporada" },
];

export default function NovoOrcamento() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("az");
  const [searchTerm, setSearchTerm] = useState("");
  const [openFilters, setOpenFilters] = useState<string[]>([]);
  const [showAddAll, setShowAddAll] = useState(false);
  const [lojista, setLojista] = useState("Lojista genérico");

  const totalProdutos = mockCatalogoProdutos.length;

  const filtered = useMemo(() => {
    let list = mockCatalogoProdutos;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (p) =>
          p.nome.toLowerCase().includes(q) ||
          p.ref.toLowerCase().includes(q) ||
          p.marca.toLowerCase().includes(q)
      );
    }
    if (sortBy === "az") list = [...list].sort((a, b) => a.nome.localeCompare(b.nome));
    if (sortBy === "za") list = [...list].sort((a, b) => b.nome.localeCompare(a.nome));
    if (sortBy === "preco-asc") list = [...list].sort((a, b) => a.preco - b.preco);
    if (sortBy === "preco-desc") list = [...list].sort((a, b) => b.preco - a.preco);
    return list;
  }, [searchTerm, sortBy]);

  const toggleFilter = (key: string) => {
    setOpenFilters((prev) =>
      prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key]
    );
  };

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Top breadcrumb bar */}
        <div className="border-b border-border px-6 py-3 flex items-center justify-between shrink-0">
          <Breadcrumbs
            items={[
              { label: "Orçamentos", path: "/vendedor" },
              { label: "Novo Orçamento" },
            ]}
          />
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2 text-sm">
              <Eye className="h-4 w-4" />
              Visualizar orçamento
            </Button>
            <Button size="sm" className="text-sm bg-accent hover:bg-accent/90 text-accent-foreground">
              Montar grade
            </Button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left filter sidebar */}
          <aside className="w-[280px] border-r border-border overflow-y-auto shrink-0 bg-card">
            <div className="p-5 space-y-5">
              {/* Quote name */}
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-foreground flex-1">
                  Orçamento 13/04/2026 09:43
                </h2>
                <button className="text-muted-foreground hover:text-foreground">
                  <Edit3 className="h-4 w-4" />
                </button>
              </div>

              {/* Lojista select */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Lojista</label>
                <Select value={lojista} onValueChange={setLojista}>
                  <SelectTrigger className="h-10 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Lojista genérico">Lojista genérico</SelectItem>
                    <SelectItem value="Boutique da Thay">Boutique da Thay</SelectItem>
                    <SelectItem value="Milykids">Milykids</SelectItem>
                    <SelectItem value="Alemão Vestuário">Alemão Vestuário</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filter accordions */}
              <div className="space-y-0 border-t border-border">
                {filterSections.map((section) => (
                  <div key={section.key} className="border-b border-border">
                    <button
                      onClick={() => toggleFilter(section.key)}
                      className="flex items-center justify-between w-full py-3.5 text-sm font-medium text-foreground hover:text-accent transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span>{section.label}</span>
                        {section.count && (
                          <Badge className="bg-accent text-accent-foreground text-[10px] h-5 w-5 p-0 flex items-center justify-center rounded-full">
                            {section.count}
                          </Badge>
                        )}
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 text-muted-foreground transition-transform ${
                          openFilters.includes(section.key) ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {openFilters.includes(section.key) && (
                      <div className="pb-3 space-y-2">
                        {section.key === "marcas" && (
                          <>
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                              <Checkbox defaultChecked />
                              <span>BRANDILI</span>
                            </label>
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                              <Checkbox defaultChecked />
                              <span>MUNDI</span>
                            </label>
                          </>
                        )}
                        {section.key === "categoria" && (
                          <>
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                              <Checkbox />
                              <span>Bermuda</span>
                            </label>
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                              <Checkbox />
                              <span>Blusa</span>
                            </label>
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                              <Checkbox />
                              <span>Conjunto</span>
                            </label>
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                              <Checkbox />
                              <span>Vestido</span>
                            </label>
                          </>
                        )}
                        {section.key === "genero" && (
                          <>
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                              <Checkbox />
                              <span>Feminino</span>
                            </label>
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                              <Checkbox />
                              <span>Masculino</span>
                            </label>
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                              <Checkbox />
                              <span>Unissex</span>
                            </label>
                          </>
                        )}
                        {!["marcas", "categoria", "genero"].includes(section.key) && (
                          <p className="text-xs text-muted-foreground">Nenhuma opção disponível</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Product catalog area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Toolbar */}
            <div className="border-b border-border px-5 py-3 flex items-center gap-3 shrink-0">
              <div className="flex border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 transition-colors ${
                    viewMode === "grid"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 transition-colors ${
                    viewMode === "list"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-9 w-[80px] text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="az">A-Z</SelectItem>
                  <SelectItem value="za">Z-A</SelectItem>
                  <SelectItem value="preco-asc">Preço ↑</SelectItem>
                  <SelectItem value="preco-desc">Preço ↓</SelectItem>
                </SelectContent>
              </Select>

              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-9 w-[160px] text-sm"
                />
              </div>

              <div className="flex-1" />

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddAll(true)}
                className="gap-2 text-sm"
              >
                <Diamond className="h-4 w-4" />
                Adicionar todos ({filtered.length})
              </Button>

              <button className="h-9 w-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <Eye className="h-4 w-4" />
              </button>
              <button className="h-9 w-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <Upload className="h-4 w-4" />
              </button>
              <button className="h-9 w-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <Settings className="h-4 w-4" />
              </button>
            </div>

            {/* Products count */}
            <div className="px-5 py-3 text-sm text-muted-foreground shrink-0">
              {filtered.length} produtos
            </div>

            {/* Product grid/list */}
            <div className="flex-1 overflow-y-auto px-5 pb-6">
              {viewMode === "grid" ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {filtered.map((product) => (
                    <div
                      key={product.id}
                      className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer group"
                    >
                      <div className="aspect-[3/4] relative overflow-hidden bg-muted">
                        <img
                          src={product.image}
                          alt={product.nome}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-3 space-y-1">
                        <p className="text-xs font-bold text-accent">{product.marca}</p>
                        <p className="text-[10px] text-muted-foreground">Ref: {product.ref}</p>
                        <p className="text-xs text-foreground font-medium line-clamp-2 leading-tight">
                          {product.nome}
                        </p>
                        <p className="text-sm font-bold text-foreground">
                          R$ {product.preco.toFixed(2).replace(".", ",")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {filtered.map((product) => (
                    <div
                      key={product.id}
                      className="bg-card rounded-xl border border-border p-3 flex items-center gap-4 hover:shadow-md transition-all duration-200 cursor-pointer"
                    >
                      <div className="h-16 w-16 rounded-lg overflow-hidden bg-muted shrink-0">
                        <img
                          src={product.image}
                          alt={product.nome}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-accent">{product.marca}</p>
                        <p className="text-sm font-medium text-foreground truncate">{product.nome}</p>
                        <p className="text-xs text-muted-foreground">Ref: {product.ref} · {product.categoria} · {product.genero}</p>
                      </div>
                      <p className="text-sm font-bold text-foreground shrink-0">
                        R$ {product.preco.toFixed(2).replace(".", ",")}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showAddAll && (
        <AddAllProductsModal
          products={filtered}
          onClose={() => setShowAddAll(false)}
        />
      )}
    </>
  );
}
