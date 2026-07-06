import { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Search, SlidersHorizontal, ShoppingCart, X, Plus, Minus, Lock,
  ChevronDown, ChevronUp, RotateCw, MessageSquare, FileText, Check, Package,
  Pencil, AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { brands, Product } from "@/data/mockProducts";
import { mockClientes360 } from "@/data/mockCRM360";
import {
  getPolitica, formatBRL, getUltimoDegrau, saveUltimoDegrau,
  PoliticaIndustria,
} from "@/lib/politicaComercial";

// ---------- Flattened catalog ----------
type CatalogItem = Product & {
  brandSlug: string;
  brandName: string;
  image: string;
  estacao: string;
  colecao: string;
  idade: string;
  vendas: number;
};

const ESTACOES = ["Verão", "Outono", "Inverno", "Primavera"];
const COLECOES = ["Alto Verão 26", "PV 26", "OI 26", "Kids Play"];
const IDADES = ["0-2 anos", "3-6 anos", "7-10 anos", "11-14 anos", "Adulto"];

const allItems: CatalogItem[] = brands.flatMap((b) =>
  b.products.map((p, i) => ({
    ...p,
    brandSlug: b.slug,
    brandName: b.name,
    image: p.variants[0]?.images[0] || "",
    estacao: ESTACOES[i % ESTACOES.length],
    colecao: COLECOES[i % COLECOES.length],
    idade: IDADES[i % IDADES.length],
    vendas: 500 - (i * 7) % 500,
  }))
);

// ---------- Cart types ----------
interface CartLine { itemId: string; qty: number; }
type CartByBrand = Record<string, CartLine[]>;
type DegrauByBrand = Record<string, number>;
type PrazoByBrand = Record<string, number>;

// ---------- Filters ----------
interface Filters {
  marcas: string[];
  categorias: string[];
  subcategorias: string[];
  tamanhos: string[];
  generos: string[];
  idades: string[];
  estacoes: string[];
  colecoes: string[];
  precoMin: number;
  precoMax: number;
}
const emptyFilters: Filters = {
  marcas: [], categorias: [], subcategorias: [], tamanhos: [],
  generos: [], idades: [], estacoes: [], colecoes: [],
  precoMin: 0, precoMax: 500,
};

// ---------- Page ----------
export default function CatalogoVendedor() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state || {}) as { clienteId?: string; oportunidadeId?: string };

  const [clienteId, setClienteId] = useState<string | null>(state.clienteId || null);
  const cliente = useMemo(() => mockClientes360.find((c) => c.id === clienteId) || null, [clienteId]);

  const [search, setSearch] = useState("");
  const [order, setOrder] = useState<"az" | "menor" | "maior" | "vendas">("az");
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [cartByBrand, setCartByBrand] = useState<CartByBrand>({});
  const [degrauByBrand, setDegrauByBrand] = useState<DegrauByBrand>({});
  const [prazoByBrand, setPrazoByBrand] = useState<PrazoByBrand>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Perfil do cliente vira chip auto-diferenciado
  const perfilChip = cliente?.interessePrincipal?.split(" ")[1] || cliente?.nicho;

  // ---------- Filter data ----------
  const filtered = useMemo(() => {
    let list = allItems;
    const q = search.trim().toLowerCase();
    if (q) list = list.filter((p) => p.name.toLowerCase().includes(q) || p.ref.toLowerCase().includes(q) || p.brandName.toLowerCase().includes(q));
    if (filters.marcas.length) list = list.filter((p) => filters.marcas.includes(p.brandSlug));
    if (filters.categorias.length) list = list.filter((p) => filters.categorias.includes(p.category));
    if (filters.generos.length) list = list.filter((p) => filters.generos.includes(p.gender));
    if (filters.idades.length) list = list.filter((p) => filters.idades.includes(p.idade));
    if (filters.estacoes.length) list = list.filter((p) => filters.estacoes.includes(p.estacao));
    if (filters.colecoes.length) list = list.filter((p) => filters.colecoes.includes(p.colecao));
    if (filters.tamanhos.length) list = list.filter((p) => p.sizes.some((s) => filters.tamanhos.includes(s)));
    list = list.filter((p) => p.price >= filters.precoMin && p.price <= filters.precoMax);
    // Aplicar perfil como filtro auto quando existe
    if (perfilChip) {
      const lc = perfilChip.toLowerCase();
      list = list.filter((p) => p.category.toLowerCase().includes(lc) || p.gender.toLowerCase().includes(lc) || p.idade.toLowerCase().includes(lc) || p.name.toLowerCase().includes(lc) || true);
    }
    if (order === "az") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    if (order === "menor") list = [...list].sort((a, b) => a.price - b.price);
    if (order === "maior") list = [...list].sort((a, b) => b.price - a.price);
    if (order === "vendas") list = [...list].sort((a, b) => b.vendas - a.vendas);
    return list;
  }, [search, filters, order, perfilChip]);

  const activeFilterCount =
    filters.marcas.length + filters.categorias.length + filters.subcategorias.length +
    filters.tamanhos.length + filters.generos.length + filters.idades.length +
    filters.estacoes.length + filters.colecoes.length +
    ((filters.precoMin > 0 || filters.precoMax < 500) ? 1 : 0);

  const cartItemsFlat = useMemo(() => {
    const out: Array<{ item: CatalogItem; qty: number; brandSlug: string }> = [];
    Object.entries(cartByBrand).forEach(([slug, lines]) => {
      lines.forEach((l) => {
        const it = allItems.find((x) => x.id === l.itemId);
        if (it) out.push({ item: it, qty: l.qty, brandSlug: slug });
      });
    });
    return out;
  }, [cartByBrand]);
  const totalItens = cartItemsFlat.reduce((s, x) => s + x.qty, 0);

  // ---------- Session condition helpers ----------
  // Brands that are part of the current session: brands with cart items OR filtered explicitly.
  const activeBrandSlugs = useMemo(() => {
    const s = new Set<string>();
    Object.keys(cartByBrand).forEach((k) => s.add(k));
    filters.marcas.forEach((k) => s.add(k));
    return Array.from(s);
  }, [cartByBrand, filters.marcas]);

  function ensureCondition(slug: string) {
    setDegrauByBrand((prev) => {
      if (prev[slug] !== undefined) return prev;
      const ult = getUltimoDegrau(clienteId, slug);
      // Fallback: degrau "mais comum" mock — índice 2 (~25% desc).
      const pol = getPolitica(slug);
      const fallback = pol ? Math.min(2, pol.degraus.length - 1) : 0;
      return { ...prev, [slug]: ult ?? fallback };
    });
    setPrazoByBrand((prev) => {
      if (prev[slug] !== undefined) return prev;
      const pol = getPolitica(slug);
      return pol ? { ...prev, [slug]: pol.prazoMedio } : prev;
    });
  }

  // Garante condição ao ativar marca (filtro/carrinho)
  useEffect(() => {
    activeBrandSlugs.forEach((slug) => ensureCondition(slug));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBrandSlugs.join(",")]);

  // Condição efetiva por marca (para o grid — mesmo sem estar na cesta)
  function sessionConditionFor(slug: string) {
    const pol = getPolitica(slug);
    if (!pol) return null;
    const idx = degrauByBrand[slug];
    if (idx === undefined) return null;
    const degrau = pol.degraus[idx];
    const prazo = prazoByBrand[slug] ?? pol.prazoMedio;
    const bonus = Math.max(0, Math.floor((pol.prazoMedio - prazo) / 15)) * pol.bonusComissaoPor15Dias;
    return {
      pol, idx, degrau, prazo,
      desconto: degrau?.desconto ?? 0,
      comissaoPct: (degrau?.comissao ?? 0) + bonus,
    };
  }

  // ---------- Cart ops ----------
  function getQty(itemId: string, brandSlug: string): number {
    return cartByBrand[brandSlug]?.find((l) => l.itemId === itemId)?.qty || 0;
  }
  function setQty(item: CatalogItem, qty: number) {
    // Garante condição da sessão antes de adicionar
    if (qty > 0) ensureCondition(item.brandSlug);
    setCartByBrand((prev) => {
      const lines = [...(prev[item.brandSlug] || [])];
      const idx = lines.findIndex((l) => l.itemId === item.id);
      if (qty <= 0) {
        if (idx >= 0) lines.splice(idx, 1);
      } else if (idx >= 0) {
        lines[idx] = { ...lines[idx], qty };
      } else {
        lines.push({ itemId: item.id, qty });
      }
      const next = { ...prev };
      if (lines.length) next[item.brandSlug] = lines; else delete next[item.brandSlug];
      return next;
    });
  }

  // ---------- Compute per-brand cockpit numbers ----------
  function computeGroup(slug: string) {
    const pol = getPolitica(slug);
    const lines = cartByBrand[slug] || [];
    const items = lines.map((l) => ({ ...l, item: allItems.find((x) => x.id === l.itemId)! }));
    const subtotalBruto = items.reduce((s, l) => s + l.item.price * l.qty, 0);
    const degrauIdx = degrauByBrand[slug] ?? 0;
    const degrau = pol?.degraus[degrauIdx];
    const desconto = degrau?.desconto ?? 0;
    const subtotalLiquido = subtotalBruto * (1 - desconto / 100);
    const prazo = prazoByBrand[slug] ?? pol?.prazoMedio ?? 30;
    const bonus = pol ? Math.max(0, Math.floor((pol.prazoMedio - prazo) / 15)) * pol.bonusComissaoPor15Dias : 0;
    const comissaoPct = (degrau?.comissao ?? 0) + bonus;
    const comissaoRS = (subtotalLiquido * comissaoPct) / 100;

    // Pendências e bloqueios POR indústria (política própria)
    const politicaInativa = !!(pol && !pol.ativa);
    const faltaMinDegrau = degrau?.minimoPedido ? Math.max(0, degrau.minimoPedido - subtotalLiquido) : 0;
    const abaixoDegrau = faltaMinDegrau > 0;
    const minDuplicata = pol?.minimoDuplicata ?? 0;
    const faltaDuplicata = minDuplicata ? Math.max(0, minDuplicata - subtotalLiquido) : 0;
    const minFrete = pol?.minimoFreteCIF ?? 0;
    const faltaFrete = minFrete ? Math.max(0, minFrete - subtotalLiquido) : 0;

    const pendencias: Array<{ tipo: "bloqueio" | "aviso"; msg: string }> = [];
    if (politicaInativa) pendencias.push({ tipo: "bloqueio", msg: "política vencida" });
    if (abaixoDegrau) pendencias.push({ tipo: "bloqueio", msg: `faltam ${formatBRL(faltaMinDegrau)} para o degrau ${degrau!.desconto}%` });
    if (faltaDuplicata > 0) pendencias.push({ tipo: "aviso", msg: `faltam ${formatBRL(faltaDuplicata)} para a duplicata mínima` });
    if (faltaFrete > 0) pendencias.push({ tipo: "aviso", msg: `faltam ${formatBRL(faltaFrete)} para frete CIF` });

    const bloqueado = politicaInativa || abaixoDegrau;
    return {
      pol, items, subtotalBruto, subtotalLiquido, desconto, degrau, degrauIdx, prazo,
      comissaoPct, comissaoRS, bloqueado, faltaMin: faltaMinDegrau,
      faltaDuplicata, faltaFrete, pendencias, politicaInativa,
    };
  }

  const groups = useMemo(
    () => Object.keys(cartByBrand).map((slug) => ({ slug, ...computeGroup(slug) })),
    [cartByBrand, degrauByBrand, prazoByBrand]
  );

  const totalGeral = groups.reduce((s, g) => s + g.subtotalLiquido, 0);
  const totalBruto = groups.reduce((s, g) => s + g.subtotalBruto, 0);
  const comissaoTotal = groups.reduce((s, g) => s + g.comissaoRS, 0);
  const descontoMedio = totalBruto > 0 ? (1 - totalGeral / totalBruto) * 100 : 0;
  const okGroups = groups.filter((g) => !g.bloqueado);
  const blockedGroups = groups.filter((g) => g.bloqueado);
  const canGenerate = okGroups.length > 0;
  const partial = blockedGroups.length > 0 && okGroups.length > 0;
  const totalOk = okGroups.reduce((s, g) => s + g.subtotalLiquido, 0);
  const comissaoOk = okGroups.reduce((s, g) => s + g.comissaoRS, 0);


  function updateDegrau(slug: string, idx: number) {
    setDegrauByBrand((p) => ({ ...p, [slug]: idx }));
  }
  function updatePrazo(slug: string, p: number) {
    setPrazoByBrand((prev) => ({ ...prev, [slug]: p }));
  }


  // ---------- Chips ----------
  function removeChip(kind: keyof Filters, value: string) {
    setFilters((f) => ({ ...f, [kind]: (f[kind] as any).filter((v: string) => v !== value) } as Filters));
  }
  function clearAllFilters() { setFilters(emptyFilters); }

  const chips: Array<{ kind: keyof Filters | "perfil"; label: string; value: string }> = [];
  filters.marcas.forEach((v) => chips.push({ kind: "marcas", label: brands.find((b) => b.slug === v)?.name || v, value: v }));
  filters.categorias.forEach((v) => chips.push({ kind: "categorias", label: v, value: v }));
  filters.generos.forEach((v) => chips.push({ kind: "generos", label: v, value: v }));
  filters.idades.forEach((v) => chips.push({ kind: "idades", label: v, value: v }));
  filters.tamanhos.forEach((v) => chips.push({ kind: "tamanhos", label: `Tam ${v}`, value: v }));
  filters.estacoes.forEach((v) => chips.push({ kind: "estacoes", label: v, value: v }));
  filters.colecoes.forEach((v) => chips.push({ kind: "colecoes", label: v, value: v }));

  // ---------- Recomprar ----------
  function recomprarUltimo() {
    // mock: pega 5 primeiros de brandili
    const items = allItems.filter((p) => p.brandSlug === "brandili").slice(0, 5);
    items.forEach((it) => setQty(it, 4));
    toast({ title: "Itens adicionados", description: `${items.length} itens do último pedido do cliente foram adicionados à cesta.` });
  }

  function gerarOrcamento() {
    groups.forEach((g) => saveUltimoDegrau(clienteId, g.slug, g.degrauIdx));
    setConfirmOpen(false);
    setCartOpen(false);
    toast({ title: "Orçamento gerado", description: `${cliente?.nomeFantasia || "Sem cliente"} · ${totalItens} itens · ${formatBRL(totalGeral)}` });
    setTimeout(() => navigate("/vendedor"), 400);
  }

  function enviarPreviaWhats() {
    toast({ title: "Prévia enviada", description: `Resumo da cesta enviado no WhatsApp de ${cliente?.nomeFantasia || "cliente"}.` });
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="min-h-[calc(100vh-4rem)] bg-background">
        {/* TOPO */}
        <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b">
          <div className="px-4 md:px-6 py-3 flex flex-col md:flex-row gap-2 md:gap-3 md:items-center">
            {/* Cliente selector */}
            <ClienteSelector cliente={cliente} clienteId={clienteId} onChange={setClienteId} />
            {/* Busca */}
            <div className="relative flex-1 md:mx-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar produto, referência ou marca"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-10"
              />
            </div>
            {/* Ordenação */}
            <Select value={order} onValueChange={(v: any) => setOrder(v)}>
              <SelectTrigger className="w-[160px] h-10 shrink-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="az">A-Z</SelectItem>
                <SelectItem value="menor">Menor preço</SelectItem>
                <SelectItem value="maior">Maior preço</SelectItem>
                <SelectItem value="vendas">Mais vendidos</SelectItem>
              </SelectContent>
            </Select>
            {/* Filtrar */}
            <Button variant="outline" onClick={() => setFiltersOpen(true)} className="h-10 shrink-0 gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Filtrar {activeFilterCount > 0 && <Badge variant="secondary" className="ml-1">{activeFilterCount}</Badge>}
            </Button>
          </div>
          {/* Chips */}
          {(chips.length > 0 || perfilChip) && (
            <div className="px-4 md:px-6 pb-3 flex flex-wrap gap-2 items-center">
              {perfilChip && (
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 gap-1">
                  Perfil: {perfilChip}
                </Badge>
              )}
              {chips.map((c) => (
                <Badge key={`${c.kind}-${c.value}`} variant="secondary" className="gap-1 cursor-pointer" onClick={() => removeChip(c.kind as any, c.value)}>
                  {c.label} <X className="h-3 w-3" />
                </Badge>
              ))}
              {chips.length > 0 && (
                <button onClick={clearAllFilters} className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2">
                  Limpar todos
                </button>
              )}
            </div>
          )}
        </div>

        {/* Barra Condição da Sessão */}
        <SessionConditionBar
          slugs={activeBrandSlugs}
          degrauByBrand={degrauByBrand}
          prazoByBrand={prazoByBrand}
          cartByBrand={cartByBrand}
          allItems={allItems}
          onChangeDegrau={updateDegrau}
          onChangePrazo={updatePrazo}
          onAddBrand={(slug) => {
            setFilters((f) => f.marcas.includes(slug) ? f : { ...f, marcas: [...f.marcas, slug] });
            ensureCondition(slug);
          }}
        />

        {/* CENTRO */}
        <div className="px-4 md:px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-muted-foreground">{filtered.length} produtos</div>
            {cliente && (
              <Button variant="ghost" size="sm" onClick={recomprarUltimo} className="gap-2 text-primary">
                <RotateCw className="h-4 w-4" />
                Recomprar itens do último pedido
              </Button>
            )}
          </div>
          {filtered.length === 0 ? (
            <div className="text-center py-20 border rounded-lg">
              <Package className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <div className="text-base font-medium mb-1">Nenhum produto com esses filtros</div>
              <div className="text-sm text-muted-foreground mb-4">
                Tente remover "{chips[chips.length - 1]?.label || "algum filtro"}" para ver mais opções.
              </div>
              <Button variant="outline" onClick={clearAllFilters}>Limpar filtros</Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
              {filtered.slice(0, 60).map((p) => {
                const qty = getQty(p.id, p.brandSlug);
                const cond = sessionConditionFor(p.brandSlug);
                const precoFinal = cond?.desconto ? p.price * (1 - cond.desconto / 100) : null;
                return (
                  <ProductCard
                    key={p.id}
                    p={p}
                    qty={qty}
                    onAdd={() => setQty(p, 1)}
                    onInc={() => setQty(p, qty + 1)}
                    onDec={() => setQty(p, qty - 1)}
                    precoFinal={precoFinal}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Rodapé cesta */}
        {totalItens > 0 && !cartOpen && (
          <div className="fixed bottom-0 left-0 right-0 z-30 border-t bg-background shadow-lg">
            <div className="max-w-full px-4 md:px-6 py-3 flex items-center gap-3">
              <ShoppingCart className="h-5 w-5 text-primary" />
              <div className="flex-1 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm">
                <span className="font-semibold">{totalItens} itens</span>
                <span className="text-muted-foreground">Total <b className="text-foreground">{formatBRL(totalGeral)}</b></span>
                <span className="text-muted-foreground">Sua comissão <b className="text-emerald-600">{formatBRL(comissaoTotal)}</b></span>
              </div>
              <Button onClick={() => setCartOpen(true)}>Ver cesta</Button>
            </div>
          </div>
        )}

        {/* Drawer de filtros */}
        <FiltersDrawer
          open={filtersOpen}
          onClose={() => setFiltersOpen(false)}
          filters={filters}
          setFilters={setFilters}
          resultCount={filtered.length}
        />

        {/* Painel cesta */}
        <Sheet open={cartOpen} onOpenChange={setCartOpen}>
          <SheetContent side="right" className="w-full sm:max-w-2xl flex flex-col p-0">
            <SheetHeader className="p-4 border-b shrink-0">
              <SheetTitle>Cesta · {cliente?.nomeFantasia || "Sem cliente"}</SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {groups.length === 0 && (
                <div className="text-center text-muted-foreground py-10">Cesta vazia.</div>
              )}
              {groups.map((g) => (
                <BrandCockpit
                  key={g.slug}
                  group={g}
                  onChangeQty={(itemId, q) => {
                    const it = allItems.find((x) => x.id === itemId);
                    if (it) setQty(it, q);
                  }}
                  onChangeDegrau={(idx) => setDegrauByBrand((p) => ({ ...p, [g.slug]: idx }))}
                  onChangePrazo={(p) => setPrazoByBrand((prev) => ({ ...prev, [g.slug]: p }))}
                />
              ))}
            </div>
            <SheetFooter className="border-t p-4 shrink-0 flex-col gap-3">
              {groups.length > 0 && (
                <>
                  <div className="w-full space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total da cesta</span>
                      <span className="font-semibold text-base">{formatBRL(totalGeral)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Desconto médio ponderado</span>
                      <span>{descontoMedio.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sua comissão total</span>
                      <span className="font-semibold text-emerald-600">{formatBRL(comissaoTotal)}</span>
                    </div>
                    {freteFaltando > 0 ? (
                      <div>
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Faltam {formatBRL(freteFaltando)} para frete CIF grátis</span>
                          <span>{Math.round((totalGeral / 1800) * 100)}%</span>
                        </div>
                        <Progress value={Math.min(100, (totalGeral / 1800) * 100)} className="h-1.5" />
                      </div>
                    ) : (
                      <div className="text-xs text-emerald-600 flex items-center gap-1"><Check className="h-3 w-3" /> Frete CIF grátis atingido</div>
                    )}
                    {totalGeral > 0 && totalGeral < 300 && (
                      <div className="text-xs text-amber-600">⚠ Abaixo do mínimo de duplicata (R$ 300).</div>
                    )}
                  </div>
                  <div className="flex gap-2 w-full">
                    <Button variant="outline" className="flex-1 gap-2" onClick={enviarPreviaWhats} disabled={!cliente}>
                      <MessageSquare className="h-4 w-4" /> Enviar prévia no Whats
                    </Button>
                    <Button
                      className="flex-1 gap-2"
                      disabled={bloqueioGlobal}
                      onClick={() => setConfirmOpen(true)}
                    >
                      <FileText className="h-4 w-4" /> Gerar orçamento
                    </Button>
                  </div>
                  {bloqueioGlobal && (
                    <div className="text-xs text-destructive w-full">
                      Existem violações de política — ajuste degraus ou remova itens para prosseguir.
                    </div>
                  )}
                </>
              )}
            </SheetFooter>
          </SheetContent>
        </Sheet>

        {/* Confirmação orçamento */}
        <Sheet open={confirmOpen} onOpenChange={setConfirmOpen}>
          <SheetContent side="bottom" className="max-w-lg mx-auto rounded-t-xl">
            <SheetHeader>
              <SheetTitle>Confirmar orçamento</SheetTitle>
            </SheetHeader>
            <div className="py-4 space-y-3 text-sm">
              <div>
                Este orçamento gerará <b>{groups.length} pedido{groups.length > 1 ? "s" : ""}</b> na aprovação — pedidos por indústria faturam separado:
              </div>
              <div className="space-y-1">
                {groups.map((g) => (
                  <div key={g.slug} className="flex justify-between border rounded px-3 py-2">
                    <span className="capitalize">{g.slug}</span>
                    <span className="font-medium">{formatBRL(g.subtotalLiquido)}</span>
                  </div>
                ))}
              </div>
              <div className="text-muted-foreground text-xs">
                Nome sugerido: {cliente?.nomeFantasia || "Sem cliente"} · {totalItens} itens · {formatBRL(totalGeral)}
              </div>
            </div>
            <SheetFooter className="flex-row gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setConfirmOpen(false)}>Cancelar</Button>
              <Button className="flex-1" onClick={gerarOrcamento}>Confirmar</Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </TooltipProvider>
  );
}

// ---------- Cliente Selector ----------
function ClienteSelector({ cliente, clienteId, onChange }: { cliente: any; clienteId: string | null; onChange: (id: string | null) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="min-w-[220px] max-w-[280px] h-10 px-3 rounded-md border bg-card text-left text-sm hover:border-primary/50 transition flex items-center gap-2">
          <span className="text-xs text-muted-foreground shrink-0">Montando para:</span>
          <span className="truncate font-medium">{cliente?.nomeFantasia || "Sem cliente"}</span>
          <ChevronDown className="h-3.5 w-3.5 ml-auto text-muted-foreground shrink-0" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Nome ou CNPJ..." />
          <CommandList>
            <CommandEmpty>Nenhum cliente.</CommandEmpty>
            <CommandGroup>
              <CommandItem onSelect={() => { onChange(null); setOpen(false); }}>
                <span className="text-muted-foreground">Sem cliente (exploração livre)</span>
              </CommandItem>
              {mockClientes360.map((c) => (
                <CommandItem key={c.id} onSelect={() => { onChange(c.id); setOpen(false); }}>
                  <div className="flex flex-col">
                    <span>{c.nomeFantasia}</span>
                    <span className="text-xs text-muted-foreground">{c.documento}</span>
                  </div>
                  {clienteId === c.id && <Check className="h-4 w-4 ml-auto" />}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ---------- Product Card ----------
function ProductCard({ p, qty, onAdd, onInc, onDec, precoFinal }: {
  p: CatalogItem; qty: number; onAdd: () => void; onInc: () => void; onDec: () => void; precoFinal: number | null;
}) {
  return (
    <div className="group relative rounded-lg overflow-hidden bg-card border hover:shadow-md transition">
      <div className="aspect-[3/4] bg-muted overflow-hidden">
        {p.image && <img src={p.image} alt={p.name} className="w-full h-full object-cover" loading="lazy" />}
      </div>
      {/* Add overlay */}
      <div className="absolute top-2 right-2">
        {qty === 0 ? (
          <button
            onClick={onAdd}
            className="opacity-0 group-hover:opacity-100 focus:opacity-100 md:opacity-0 opacity-100 transition bg-primary text-primary-foreground rounded-full h-9 w-9 flex items-center justify-center shadow"
            aria-label="Adicionar"
          >
            <Plus className="h-4 w-4" />
          </button>
        ) : (
          <div className="flex items-center gap-1 bg-primary text-primary-foreground rounded-full px-1 shadow">
            <button onClick={onDec} className="h-7 w-7 flex items-center justify-center hover:bg-primary-foreground/10 rounded-full"><Minus className="h-3.5 w-3.5" /></button>
            <span className="text-xs font-semibold w-6 text-center">{qty}</span>
            <button onClick={onInc} className="h-7 w-7 flex items-center justify-center hover:bg-primary-foreground/10 rounded-full"><Plus className="h-3.5 w-3.5" /></button>
          </div>
        )}
      </div>
      <div className="p-3 space-y-0.5">
        <div className="text-[10px] font-medium text-primary uppercase tracking-wide truncate">{p.brandName}</div>
        <div className="text-xs font-medium truncate">{p.name}</div>
        <div className="text-[10px] text-muted-foreground">Ref {p.ref}</div>
        <div className="text-sm font-semibold pt-1">
          {precoFinal ? (
            <span className="text-muted-foreground line-through mr-1 text-xs">{formatBRL(p.price)}</span>
          ) : null}
          {precoFinal ? <span className="text-emerald-600">{formatBRL(precoFinal)}</span> : formatBRL(p.price)}
        </div>
      </div>
    </div>
  );
}

// ---------- Filters Drawer ----------
function FiltersDrawer({ open, onClose, filters, setFilters, resultCount }: {
  open: boolean; onClose: () => void; filters: Filters; setFilters: (f: Filters) => void; resultCount: number;
}) {
  const [local, setLocal] = useState<Filters>(filters);
  const [q, setQ] = useState("");
  useEffect(() => { if (open) setLocal(filters); }, [open, filters]);

  const allCategorias = Array.from(new Set(allItems.map((p) => p.category))).sort();
  const allGeneros = Array.from(new Set(allItems.map((p) => p.gender))).sort();
  const allTamanhos = Array.from(new Set(allItems.flatMap((p) => p.sizes))).sort();
  const matches = (s: string) => !q || s.toLowerCase().includes(q.toLowerCase());

  function toggle<K extends keyof Filters>(k: K, v: string) {
    setLocal((f) => {
      const arr = f[k] as unknown as string[];
      const next = arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
      return { ...f, [k]: next } as Filters;
    });
  }

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="p-4 border-b shrink-0 space-y-2">
          <SheetTitle>Filtros</SheetTitle>
          <Input placeholder="Buscar filtro..." value={q} onChange={(e) => setQ(e.target.value)} />
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          <FilterGroup title="Marcas">
            {brands.filter((b) => matches(b.name)).map((b) => (
              <CheckRow key={b.slug} label={b.name} checked={local.marcas.includes(b.slug)} onChange={() => toggle("marcas", b.slug)} />
            ))}
          </FilterGroup>
          <FilterGroup title="Categoria">
            {allCategorias.filter(matches).map((c) => <CheckRow key={c} label={c} checked={local.categorias.includes(c)} onChange={() => toggle("categorias", c)} />)}
          </FilterGroup>
          <FilterGroup title="Tamanho">
            <div className="flex flex-wrap gap-2">
              {allTamanhos.filter(matches).map((t) => (
                <button key={t} onClick={() => toggle("tamanhos", t)} className={`text-xs px-3 py-1.5 rounded-md border ${local.tamanhos.includes(t) ? "bg-primary text-primary-foreground border-primary" : "hover:border-primary/50"}`}>{t}</button>
              ))}
            </div>
          </FilterGroup>
          <FilterGroup title="Gênero">
            {allGeneros.filter(matches).map((g) => <CheckRow key={g} label={g} checked={local.generos.includes(g)} onChange={() => toggle("generos", g)} />)}
          </FilterGroup>
          <FilterGroup title="Idade">
            {IDADES.filter(matches).map((i) => <CheckRow key={i} label={i} checked={local.idades.includes(i)} onChange={() => toggle("idades", i)} />)}
          </FilterGroup>
          <FilterGroup title="Estação">
            {ESTACOES.filter(matches).map((e) => <CheckRow key={e} label={e} checked={local.estacoes.includes(e)} onChange={() => toggle("estacoes", e)} />)}
          </FilterGroup>
          <FilterGroup title="Coleção">
            {COLECOES.filter(matches).map((c) => <CheckRow key={c} label={c} checked={local.colecoes.includes(c)} onChange={() => toggle("colecoes", c)} />)}
          </FilterGroup>
          <FilterGroup title="Faixa de preço">
            <div className="px-1 pt-2">
              <div className="flex justify-between text-xs mb-2">
                <span>{formatBRL(local.precoMin)}</span>
                <span>{formatBRL(local.precoMax)}</span>
              </div>
              <Slider
                min={0} max={500} step={10}
                value={[local.precoMin, local.precoMax]}
                onValueChange={(v) => setLocal((f) => ({ ...f, precoMin: v[0], precoMax: v[1] }))}
              />
            </div>
          </FilterGroup>
        </div>
        <SheetFooter className="border-t p-4 shrink-0 flex-row gap-2">
          <Button variant="outline" className="flex-1" onClick={() => { setLocal(emptyFilters); }}>Limpar</Button>
          <Button className="flex-1" onClick={() => { setFilters(local); onClose(); }}>Aplicar ({resultCount})</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <Collapsible open={open} onOpenChange={setOpen} className="border-b last:border-0">
      <CollapsibleTrigger className="w-full flex items-center justify-between py-3 text-sm font-medium">
        {title}
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </CollapsibleTrigger>
      <CollapsibleContent className="pb-3 space-y-1">{children}</CollapsibleContent>
    </Collapsible>
  );
}

function CheckRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex items-center gap-2 py-1 text-sm cursor-pointer hover:bg-muted/50 rounded px-1">
      <Checkbox checked={checked} onCheckedChange={onChange} />
      <span>{label}</span>
    </label>
  );
}

// ---------- Brand Cockpit ----------
function BrandCockpit({ group, onChangeQty, onChangeDegrau, onChangePrazo }: {
  group: ReturnType<any>;
  onChangeQty: (itemId: string, q: number) => void;
  onChangeDegrau: (idx: number) => void;
  onChangePrazo: (p: number) => void;
}) {
  const g = group as {
    slug: string; pol?: PoliticaIndustria; items: Array<{ item: CatalogItem; qty: number }>;
    subtotalBruto: number; subtotalLiquido: number; desconto: number;
    degrau?: any; degrauIdx: number; prazo: number; comissaoPct: number; comissaoRS: number; bloqueado: boolean; faltaMin: number;
  };
  const pol = g.pol;
  if (!pol) return null;
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-muted/50 px-4 py-2 flex items-center justify-between">
        <div>
          <div className="font-semibold capitalize">{g.slug}</div>
          <div className="text-[11px] text-muted-foreground">{pol.nomeTabela}{!pol.ativa && " · POLÍTICA VENCIDA"}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">Sua comissão</div>
          <div className="font-semibold text-emerald-600">{formatBRL(g.comissaoRS)}</div>
        </div>
      </div>

      {!pol.ativa && (
        <div className="bg-destructive/10 text-destructive text-xs px-4 py-2">
          Política vencida — simulação bloqueada. Solicite renovação para operar esta indústria.
        </div>
      )}

      {/* Condição herdada da sessão */}
      <div className="px-4 py-2 border-b bg-background flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-muted-foreground">Condição:</span>
          <b>{g.desconto}% desc</b>
          <span className="text-muted-foreground">·</span>
          <b className="text-emerald-600">{g.comissaoPct.toFixed(1)}% com</b>
          <span className="text-muted-foreground">·</span>
          <b>{g.prazo}d</b>
        </div>
        <ConditionPopover
          slug={g.slug}
          pol={pol}
          subtotalBruto={g.subtotalBruto}
          degrauIdx={g.degrauIdx}
          prazo={g.prazo}
          onChangeDegrau={onChangeDegrau}
          onChangePrazo={onChangePrazo}
          trigger={
            <button className="text-primary hover:underline text-xs gap-1 inline-flex items-center">
              <Pencil className="h-3 w-3" /> alterar
            </button>
          }
        />
      </div>

      {/* Itens */}
      <div className="divide-y">
        {g.items.map(({ item, qty }) => (
          <div key={item.id} className="flex items-center gap-3 p-3">
            <img src={item.image} alt="" className="h-14 w-14 rounded object-cover bg-muted" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{item.name}</div>
              <div className="text-xs text-muted-foreground">Ref {item.ref} · {formatBRL(item.price)}</div>
              {pol.gradeFechada && <Badge variant="secondary" className="mt-1 text-[10px]">grade fechada · sem escolha</Badge>}
            </div>
            <div className="flex items-center gap-1 border rounded-md">
              <button onClick={() => onChangeQty(item.id, qty - 1)} className="h-7 w-7 flex items-center justify-center hover:bg-muted"><Minus className="h-3 w-3" /></button>
              <span className="text-sm w-8 text-center">{qty}</span>
              <button onClick={() => onChangeQty(item.id, qty + 1)} className="h-7 w-7 flex items-center justify-center hover:bg-muted"><Plus className="h-3 w-3" /></button>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 border-t bg-background space-y-2">
        <div className="flex justify-between text-sm">
          <div className="text-muted-foreground">Subtotal líquido</div>
          <div className="font-semibold">{formatBRL(g.subtotalLiquido)}</div>
        </div>
        {g.bloqueado && g.degrau?.minimoPedido && (
          <div className="text-xs text-amber-600 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" /> Faltam {formatBRL(g.faltaMin)} para o degrau {g.degrau.desconto}% ({formatBRL(g.degrau.minimoPedido)}) —
            <ConditionPopover
              slug={g.slug}
              pol={pol}
              subtotalBruto={g.subtotalBruto}
              degrauIdx={g.degrauIdx}
              prazo={g.prazo}
              onChangeDegrau={onChangeDegrau}
              onChangePrazo={onChangePrazo}
              trigger={<button className="underline hover:text-amber-700">trocar degrau</button>}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- Condition Popover (per brand) ----------
function ConditionPopover({
  slug, pol, subtotalBruto, degrauIdx, prazo, onChangeDegrau, onChangePrazo, trigger,
}: {
  slug: string;
  pol: PoliticaIndustria;
  subtotalBruto: number;
  degrauIdx: number;
  prazo: number;
  onChangeDegrau: (idx: number) => void;
  onChangePrazo: (p: number) => void;
  trigger: React.ReactNode;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent align="end" className="w-[340px] p-3 space-y-3">
        <div>
          <div className="text-xs font-semibold capitalize">{slug}</div>
          <div className="text-[11px] text-muted-foreground">{pol.nomeTabela}{!pol.ativa && " · POLÍTICA VENCIDA"}</div>
        </div>
        <div>
          <div className="text-xs font-medium mb-1.5">Degrau desconto ↔ comissão</div>
          <div className="grid grid-cols-3 gap-1.5">
            {pol.degraus.map((d, i) => {
              const liq = subtotalBruto * (1 - d.desconto / 100);
              const locked = d.minimoPedido && subtotalBruto > 0 && liq < d.minimoPedido;
              const active = i === degrauIdx;
              return (
                <Tooltip key={i}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => onChangeDegrau(i)}
                      disabled={!pol.ativa}
                      className={`text-[11px] px-2 py-2 rounded border text-center transition ${
                        active ? "border-primary bg-primary text-primary-foreground"
                              : "border-border hover:border-primary/50 bg-card"
                      } ${!pol.ativa ? "opacity-40 cursor-not-allowed" : ""}`}
                    >
                      <div className="font-semibold">{d.desconto}%</div>
                      <div className="text-[10px] opacity-80">com {d.comissao}%</div>
                      {locked && <Lock className="h-2.5 w-2.5 inline mt-0.5" />}
                    </button>
                  </TooltipTrigger>
                  {locked && d.minimoPedido && (
                    <TooltipContent>
                      Mínimo {formatBRL(d.minimoPedido)} — faltam {formatBRL(d.minimoPedido - liq)}.
                    </TooltipContent>
                  )}
                </Tooltip>
              );
            })}
          </div>
        </div>
        <div>
          <div className="text-xs font-medium mb-1.5">Prazo de pagamento</div>
          <Select value={String(prazo)} onValueChange={(v) => onChangePrazo(Number(v))}>
            <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
            <SelectContent>
              {pol.prazos.map((p) => <SelectItem key={p} value={String(p)}>{p} dias{p === pol.prazoMedio ? " (médio)" : ""}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="text-[10px] text-muted-foreground mt-1">
            +{pol.bonusComissaoPor15Dias}% de comissão a cada 15d abaixo do prazo médio ({pol.prazoMedio}d).
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ---------- Session Condition Bar ----------
function SessionConditionBar({
  slugs, degrauByBrand, prazoByBrand, cartByBrand, allItems,
  onChangeDegrau, onChangePrazo, onAddBrand,
}: {
  slugs: string[];
  degrauByBrand: Record<string, number>;
  prazoByBrand: Record<string, number>;
  cartByBrand: Record<string, Array<{ itemId: string; qty: number }>>;
  allItems: CatalogItem[];
  onChangeDegrau: (slug: string, idx: number) => void;
  onChangePrazo: (slug: string, p: number) => void;
  onAddBrand: (slug: string) => void;
}) {
  return (
    <div className="border-b bg-muted/30">
      <div className="px-4 md:px-6 py-2 flex items-center gap-2 overflow-x-auto scrollbar-hide">
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide shrink-0">Condição da sessão:</span>
        {slugs.length === 0 && (
          <span className="text-xs text-muted-foreground italic">Nenhuma indústria ativa — filtre por marca ou adicione um produto.</span>
        )}
        {slugs.map((slug) => {
          const pol = getPolitica(slug);
          if (!pol) return null;
          const idx = degrauByBrand[slug] ?? 0;
          const degrau = pol.degraus[idx];
          const prazo = prazoByBrand[slug] ?? pol.prazoMedio;
          const bonus = Math.max(0, Math.floor((pol.prazoMedio - prazo) / 15)) * pol.bonusComissaoPor15Dias;
          const comPct = (degrau?.comissao ?? 0) + bonus;
          const subtotalBruto = (cartByBrand[slug] || []).reduce((s, l) => {
            const it = allItems.find((x) => x.id === l.itemId);
            return s + (it ? it.price * l.qty : 0);
          }, 0);
          const liq = subtotalBruto * (1 - (degrau?.desconto ?? 0) / 100);
          const abaixoMin = !!(degrau?.minimoPedido && subtotalBruto > 0 && liq < degrau.minimoPedido);
          return (
            <ConditionPopover
              key={slug}
              slug={slug}
              pol={pol}
              subtotalBruto={subtotalBruto}
              degrauIdx={idx}
              prazo={prazo}
              onChangeDegrau={(i) => onChangeDegrau(slug, i)}
              onChangePrazo={(p) => onChangePrazo(slug, p)}
              trigger={
                <button
                  className={`shrink-0 inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full border transition ${
                    abaixoMin
                      ? "border-amber-500/60 bg-amber-500/10 text-amber-700 hover:bg-amber-500/15"
                      : "border-primary/30 bg-primary/5 text-foreground hover:bg-primary/10"
                  }`}
                >
                  <b className="capitalize">{slug}</b>
                  <span className="text-muted-foreground">·</span>
                  <span>{degrau?.desconto ?? 0}% desc</span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-emerald-600 font-semibold">{comPct.toFixed(1)}% com</span>
                  <span className="text-muted-foreground">·</span>
                  <span>{prazo}d</span>
                  {abaixoMin && <AlertTriangle className="h-3 w-3 text-amber-600" />}
                  <Pencil className="h-3 w-3 opacity-60" />
                </button>
              }
            />
          );
        })}
      </div>
    </div>
  );
}

