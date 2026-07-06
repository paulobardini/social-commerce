import { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Search, SlidersHorizontal, ShoppingCart, X, Plus, Minus, Lock,
  ChevronDown, ChevronUp, RotateCw, MessageSquare, FileText, Check, Package,
  Pencil, AlertTriangle, Eye, EyeOff, QrCode, LayoutGrid, List, RotateCcw,
  ShieldCheck, Send,
} from "lucide-react";
import { usePresentationMode } from "@/hooks/usePresentationMode";
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
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { brands, Product } from "@/data/mockProducts";
import { mockClientes360 } from "@/data/mockCRM360";
import {
  getPolitica, formatBRL, getUltimoDegrau, saveUltimoDegrau,
  PoliticaIndustria, enquadrarDegrau,
} from "@/lib/politicaComercial";
import { CatalogSecondaryMenu, QRScannerModal, GenericItem } from "@/components/vendedor/catalogo/CatalogoExtras";

// ---------- Flattened catalog ----------
type CatalogItem = Product & {
  brandSlug: string;
  brandName: string;
  image: string;
  estacao: string;
  colecao: string;
  idade: string;
  vendas: number;
  isGeneric?: boolean;
};

const ESTACOES = ["Verão", "Outono", "Inverno", "Primavera"];
const COLECOES = ["Alto Verão 26", "PV 26", "OI 26", "Kids Play"];
const IDADES = ["0-2 anos", "3-6 anos", "7-10 anos", "11-14 anos", "Adulto"];

const baseItems: CatalogItem[] = brands.flatMap((b) =>
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
interface CartLine { itemId: string; qty: number; precoNegociado?: number; }
type CartByBrand = Record<string, CartLine[]>;
type DegrauByBrand = Record<string, number>;
type PrazoByBrand = Record<string, number>;

// ---------- Filters ----------
interface Filters {
  marcas: string[]; categorias: string[]; subcategorias: string[]; tamanhos: string[];
  generos: string[]; idades: string[]; estacoes: string[]; colecoes: string[];
  precoMin: number; precoMax: number;
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
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showOnlyAdded, setShowOnlyAdded] = useState(false);
  const [cartByBrand, setCartByBrand] = useState<CartByBrand>({});
  const [degrauByBrand, setDegrauByBrand] = useState<DegrauByBrand>({});
  const [prazoByBrand, setPrazoByBrand] = useState<PrazoByBrand>({});
  const [genericItems, setGenericItems] = useState<CatalogItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [addAllConfirm, setAddAllConfirm] = useState(false);
  const [showCommission, setShowCommission] = useState(false);
  const [acordoOpen, setAcordoOpen] = useState(false);
  const [acordoJustificativa, setAcordoJustificativa] = useState("");
  const [acordoUrgente, setAcordoUrgente] = useState(false);


  const allItems = useMemo(() => [...baseItems, ...genericItems], [genericItems]);

  const { on: presentation, toggle: togglePresentation } = usePresentationMode();
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (e.shiftKey && (e.key === "P" || e.key === "p")) { e.preventDefault(); togglePresentation(); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [togglePresentation]);

  const perfilChip = cliente?.interessePrincipal?.split(" ")[1] || cliente?.nicho;

  // ---------- Filter ----------
  const addedItemIds = useMemo(() => {
    const s = new Set<string>();
    Object.values(cartByBrand).forEach((lines) => lines.forEach((l) => s.add(l.itemId)));
    return s;
  }, [cartByBrand]);

  const filtered = useMemo(() => {
    let list = allItems;
    if (showOnlyAdded) list = list.filter((p) => addedItemIds.has(p.id));
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
    if (order === "az") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    if (order === "menor") list = [...list].sort((a, b) => a.price - b.price);
    if (order === "maior") list = [...list].sort((a, b) => b.price - a.price);
    if (order === "vendas") list = [...list].sort((a, b) => b.vendas - a.vendas);
    return list;
  }, [search, filters, order, perfilChip, showOnlyAdded, addedItemIds, allItems]);

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
  }, [cartByBrand, allItems]);
  const totalItens = cartItemsFlat.reduce((s, x) => s + x.qty, 0);
  const addedCount = addedItemIds.size;

  // ---------- Session condition ----------
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

  useEffect(() => {
    activeBrandSlugs.forEach((slug) => ensureCondition(slug));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBrandSlugs.join(",")]);

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
    if (qty > 0) ensureCondition(item.brandSlug);
    setCartByBrand((prev) => {
      const lines = [...(prev[item.brandSlug] || [])];
      const idx = lines.findIndex((l) => l.itemId === item.id);
      if (qty <= 0) { if (idx >= 0) lines.splice(idx, 1); }
      else if (idx >= 0) lines[idx] = { ...lines[idx], qty };
      else lines.push({ itemId: item.id, qty });
      const next = { ...prev };
      if (lines.length) next[item.brandSlug] = lines; else delete next[item.brandSlug];
      return next;
    });
  }

  function setPrecoNegociado(brandSlug: string, itemId: string, valor: number | undefined) {
    setCartByBrand((prev) => {
      const lines = (prev[brandSlug] || []).map((l) =>
        l.itemId === itemId ? { ...l, precoNegociado: valor } : l
      );
      return { ...prev, [brandSlug]: lines };
    });
  }

  function addGenericItem(g: GenericItem) {
    const id = `gen-${Date.now()}`;
    const brand = brands.find((b) => b.slug === g.brandSlug);
    const item: CatalogItem = {
      id, ref: g.ref, name: g.name, price: g.price,
      brandSlug: g.brandSlug, brandName: brand?.name || g.brandSlug,
      variants: [], sizes: [], category: "Genérico", gender: "Unissex",
      image: "", estacao: "-", colecao: "-", idade: "-", vendas: 0,
      isGeneric: true,
    } as CatalogItem;
    setGenericItems((prev) => [...prev, item]);
    setTimeout(() => setQty(item, 1), 0);
  }

  function handleQRScan(ref: string) {
    const item = allItems.find((i) => i.ref === ref);
    if (item) {
      setQty(item, getQty(item.id, item.brandSlug) + 1);
      toast({ title: "Adicionado", description: `${item.name} (ref ${ref})` });
    }
  }

  function addAllFiltered() {
    filtered.forEach((it) => { if (getQty(it.id, it.brandSlug) === 0) setQty(it, 1); });
    toast({ title: "Adicionados", description: `${filtered.length} produtos adicionados à cesta.` });
  }
  function onAddAllClick() {
    if (filtered.length > 30) setAddAllConfirm(true);
    else addAllFiltered();
  }

  // ---------- Compute per-brand ----------
  function computeGroup(slug: string) {
    const pol = getPolitica(slug);
    const lines = cartByBrand[slug] || [];
    const items = lines.map((l) => ({ ...l, item: allItems.find((x) => x.id === l.itemId)! })).filter((l) => l.item);
    const degrauIdx = degrauByBrand[slug] ?? 0;
    const degrauSessao = pol?.degraus[degrauIdx];
    const descontoSessao = degrauSessao?.desconto ?? 0;
    const prazo = prazoByBrand[slug] ?? pol?.prazoMedio ?? 30;
    const bonus = pol ? Math.max(0, Math.floor((pol.prazoMedio - prazo) / 15)) * pol.bonusComissaoPor15Dias : 0;

    // Preço unitário efetivo por linha
    const linhas = items.map((l) => {
      const precoTabela = l.item.price;
      const precoDefault = precoTabela * (1 - descontoSessao / 100);
      const precoUnit = l.precoNegociado ?? precoDefault;
      const descontoItem = precoTabela > 0 ? (1 - precoUnit / precoTabela) * 100 : 0;
      return { ...l, precoTabela, precoDefault, precoUnit, descontoItem, negociado: l.precoNegociado !== undefined };
    });

    const subtotalBruto = linhas.reduce((s, l) => s + l.precoTabela * l.qty, 0);
    const subtotalLiquido = linhas.reduce((s, l) => s + l.precoUnit * l.qty, 0);
    const descontoMedio = subtotalBruto > 0 ? (1 - subtotalLiquido / subtotalBruto) * 100 : 0;

    // Enquadramento pela política
    const enquadrado = pol ? enquadrarDegrau(pol, descontoMedio) : null;
    const maxDegrau = pol ? pol.degraus.reduce((a, b) => a.desconto > b.desconto ? a : b) : null;
    const foraPorMedia = !!(pol && descontoMedio > 0 && !enquadrado);

    // Regra por indústria
    const regra = pol?.regraNegociado || "media";
    const maxDescontoItem = maxDegrau?.desconto ?? 100;
    const itemForaLimite = regra === "porItem"
      ? linhas.filter((l) => l.descontoItem > maxDescontoItem + 1e-6)
      : [];
    const foraPorItem = itemForaLimite.length > 0;

    // Comissão calculada pelo degrau ENQUADRADO
    const degrauComissao = enquadrado?.degrau ?? degrauSessao;
    const comissaoPct = (degrauComissao?.comissao ?? 0) + bonus;
    const comissaoRS = enquadrado || regra === "desabilitado" ? (subtotalLiquido * comissaoPct) / 100 : 0;

    const politicaInativa = !!(pol && !pol.ativa);
    const minEnquadrado = enquadrado?.degrau.minimoPedido ?? 0;
    const faltaMinDegrau = minEnquadrado ? Math.max(0, minEnquadrado - subtotalLiquido) : 0;
    const abaixoDegrau = faltaMinDegrau > 0;

    const minDuplicata = pol?.minimoDuplicata ?? 0;
    const faltaDuplicata = minDuplicata ? Math.max(0, minDuplicata - subtotalLiquido) : 0;
    const minFrete = pol?.minimoFreteCIF ?? 0;
    const faltaFrete = minFrete ? Math.max(0, minFrete - subtotalLiquido) : 0;

    const pendencias: Array<{ tipo: "bloqueio" | "aviso"; msg: string }> = [];
    if (politicaInativa) pendencias.push({ tipo: "bloqueio", msg: "política vencida" });
    if (foraPorMedia && pol && maxDegrau) {
      const excesso = descontoMedio - maxDegrau.desconto;
      const ajusteRS = (excesso / 100) * subtotalBruto;
      pendencias.push({
        tipo: "bloqueio",
        msg: `média ${descontoMedio.toFixed(1)}% acima do teto ${maxDegrau.desconto}% — reduza ${formatBRL(ajusteRS)} em descontos`,
      });
    }
    if (foraPorItem) {
      pendencias.push({ tipo: "bloqueio", msg: `${itemForaLimite.length} item(ns) acima do teto por item (${maxDescontoItem}%)` });
    }
    if (abaixoDegrau && enquadrado) {
      pendencias.push({ tipo: "bloqueio", msg: `faltam ${formatBRL(faltaMinDegrau)} para o degrau enquadrado ${enquadrado.degrau.desconto}%` });
    }
    if (faltaDuplicata > 0) pendencias.push({ tipo: "aviso", msg: `faltam ${formatBRL(faltaDuplicata)} para a duplicata mínima` });
    if (faltaFrete > 0) pendencias.push({ tipo: "aviso", msg: `faltam ${formatBRL(faltaFrete)} para frete CIF` });

    const bloqueado = politicaInativa || foraPorMedia || foraPorItem || abaixoDegrau;

    return {
      pol, linhas, subtotalBruto, subtotalLiquido, descontoMedio,
      degrauSessao, degrauIdx, descontoSessao, prazo,
      enquadrado, foraPorMedia, foraPorItem, regra, maxDescontoItem,
      comissaoPct, comissaoRS, bloqueado, faltaMin: faltaMinDegrau,
      faltaDuplicata, faltaFrete, pendencias, politicaInativa,
    };
  }

  const groups = useMemo(
    () => Object.keys(cartByBrand).map((slug) => ({ slug, ...computeGroup(slug) })),
    [cartByBrand, degrauByBrand, prazoByBrand, allItems]
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

  function updateDegrau(slug: string, idx: number) { setDegrauByBrand((p) => ({ ...p, [slug]: idx })); }
  function updatePrazo(slug: string, p: number) { setPrazoByBrand((prev) => ({ ...prev, [slug]: p })); }

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

  function recomprarUltimo() {
    const items = baseItems.filter((p) => p.brandSlug === "brandili").slice(0, 5);
    items.forEach((it) => setQty(it, 4));
    toast({ title: "Itens adicionados", description: `${items.length} itens do último pedido do cliente foram adicionados à cesta.` });
  }

  function gerarOrcamento() {
    const alvo = okGroups;
    alvo.forEach((g) => saveUltimoDegrau(clienteId, g.slug, g.degrauIdx));
    setConfirmOpen(false);
    setCartOpen(false);
    const itens = alvo.reduce((s, g) => s + g.linhas.reduce((a, i) => a + i.qty, 0), 0);
    const total = alvo.reduce((s, g) => s + g.subtotalLiquido, 0);
    toast({
      title: `Orçamento gerado · ${alvo.length} pedido${alvo.length > 1 ? "s" : ""}`,
      description: `${cliente?.nomeFantasia || "Sem cliente"} · ${itens} itens · ${formatBRL(total)}${blockedGroups.length ? ` (${blockedGroups.length} indústria(s) ficou de fora)` : ""}`,
    });
    setTimeout(() => navigate("/vendedor"), 400);
  }

  function enviarPreviaWhats() {
    toast({ title: "Prévia enviada", description: `Resumo da cesta enviado no WhatsApp de ${cliente?.nomeFantasia || "cliente"}.` });
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className={`min-h-[calc(100vh-4rem)] bg-background ${presentation ? "ring-2 ring-primary/40 ring-offset-0" : ""}`}>
        {/* TOPO */}
        <div className={`sticky top-0 z-20 bg-background/95 backdrop-blur border-b ${presentation ? "border-t-2 border-t-primary" : ""}`}>
          {/* LINHA 1: cliente · busca(QR) · view · order · filtrar · apresentação · ⋯ */}
          <div className="px-4 md:px-6 py-3 flex flex-col md:flex-row gap-2 md:gap-3 md:items-center">
            <ClienteSelector cliente={cliente} clienteId={clienteId} onChange={setClienteId} />
            <div className="relative flex-1 md:mx-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar produto, referência ou marca"
                value={search} onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-10 h-10"
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setQrOpen(true)}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 w-7 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
                    aria-label="Escanear QR"
                  >
                    <QrCode className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Escanear etiqueta (showroom)</TooltipContent>
              </Tooltip>
            </div>
            <div className="flex items-center border rounded-md h-10 shrink-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button onClick={() => setViewMode("grid")} className={`h-full w-9 flex items-center justify-center ${viewMode === "grid" ? "bg-muted" : ""}`} aria-label="Grid"><LayoutGrid className="h-4 w-4" /></button>
                </TooltipTrigger><TooltipContent>Grade</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button onClick={() => setViewMode("list")} className={`h-full w-9 flex items-center justify-center ${viewMode === "list" ? "bg-muted" : ""}`} aria-label="Lista"><List className="h-4 w-4" /></button>
                </TooltipTrigger><TooltipContent>Lista</TooltipContent>
              </Tooltip>
            </div>
            <Select value={order} onValueChange={(v: any) => setOrder(v)}>
              <SelectTrigger className="w-[150px] h-10 shrink-0"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="az">A-Z</SelectItem>
                <SelectItem value="menor">Menor preço</SelectItem>
                <SelectItem value="maior">Maior preço</SelectItem>
                <SelectItem value="vendas">Mais vendidos</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => setFiltersOpen(true)} className="h-10 shrink-0 gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Filtrar {activeFilterCount > 0 && <Badge variant="secondary" className="ml-1">{activeFilterCount}</Badge>}
            </Button>
            <Button
              variant="outline"
              onClick={onAddAllClick}
              disabled={filtered.length === 0}
              className="h-10 shrink-0 gap-2"
            >
              <Plus className="h-4 w-4" /> Adicionar todos{filtered.length > 0 ? ` (${filtered.length})` : ""}
            </Button>
            <CatalogSecondaryMenu
              activeBrandSlugs={activeBrandSlugs}
              onAddGeneric={addGenericItem}
              presentation={presentation}
              onTogglePresentation={togglePresentation}
            />
          </div>
          {presentation && (
            <div className="bg-primary text-primary-foreground text-[11px] font-semibold text-center py-0.5 flex items-center justify-center gap-1.5">
              <Eye className="h-3 w-3" /> Modo apresentação ativo
              <button onClick={togglePresentation} className="underline underline-offset-2 opacity-90 hover:opacity-100 ml-2">desligar</button>
            </div>
          )}
          {/* LINHA 2: chips de contexto/condição em uma linha com scroll horizontal */}
          <div className="px-4 md:px-6 pb-3 pt-1 flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {perfilChip && (
              <Badge
                variant="outline"
                className="shrink-0 bg-primary/10 text-primary border-primary/30 gap-1 cursor-pointer"
                onClick={() => { /* limpar perfil visual (não altera filtros) */ }}
              >
                Perfil: {perfilChip}
              </Badge>
            )}
            {addedCount > 0 && (
              <button
                onClick={() => setShowOnlyAdded((v) => !v)}
                className={`shrink-0 text-xs px-2.5 py-1 rounded-full border transition inline-flex items-center gap-1 ${
                  showOnlyAdded ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:border-primary/50"
                }`}
              >
                <ShoppingCart className="h-3 w-3" /> Só adicionados ({addedCount})
              </button>
            )}
            {chips.map((c) => (
              <Badge key={`${c.kind}-${c.value}`} variant="secondary" className="shrink-0 gap-1 cursor-pointer" onClick={() => removeChip(c.kind as any, c.value)}>
                {c.label} <X className="h-3 w-3" />
              </Badge>
            ))}
            {chips.length > 0 && (
              <button onClick={clearAllFilters} className="shrink-0 text-xs text-muted-foreground hover:text-foreground underline underline-offset-2">Limpar</button>
            )}

            {/* Chips de condição da sessão (mesma linha) */}
            <SessionConditionChips
              slugs={activeBrandSlugs}
              degrauByBrand={degrauByBrand} prazoByBrand={prazoByBrand}
              cartByBrand={cartByBrand} allItems={allItems}
              presentation={presentation}
              onChangeDegrau={updateDegrau} onChangePrazo={updatePrazo}
              onAddBrand={(slug) => {
                setFilters((f) => f.marcas.includes(slug) ? f : { ...f, marcas: [...f.marcas, slug] });
                ensureCondition(slug);
              }}
            />

            <div className="ml-auto text-xs text-muted-foreground shrink-0 pl-2">
              {filtered.length} produtos{showOnlyAdded && " (só adicionados)"}
            </div>
          </div>
        </div>

        {/* CENTRO */}
        <div className="px-4 md:px-6 py-4">
          {cliente && (
            <div className="flex items-center justify-end mb-3">
              <Button variant="ghost" size="sm" onClick={recomprarUltimo} className="gap-2 text-primary">
                <RotateCw className="h-4 w-4" /> Recomprar itens do último pedido
              </Button>
            </div>
          )}
          {filtered.length === 0 ? (
            <div className="text-center py-20 border rounded-lg">
              <Package className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <div className="text-base font-medium mb-1">Nenhum produto com esses filtros</div>
              <Button variant="outline" onClick={() => { clearAllFilters(); setShowOnlyAdded(false); }}>Limpar filtros</Button>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
              {filtered.slice(0, 60).map((p) => {
                const qty = getQty(p.id, p.brandSlug);
                const cond = sessionConditionFor(p.brandSlug);
                const precoFinal = cond?.desconto ? p.price * (1 - cond.desconto / 100) : null;
                const pol = getPolitica(p.brandSlug);
                const conditionHint = !cond && pol ? (
                  <ConditionPopover
                    slug={p.brandSlug} pol={pol} subtotalBruto={0}
                    degrauIdx={degrauByBrand[p.brandSlug] ?? Math.min(2, pol.degraus.length - 1)}
                    prazo={prazoByBrand[p.brandSlug] ?? pol.prazoMedio}
                    onChangeDegrau={(i) => updateDegrau(p.brandSlug, i)}
                    onChangePrazo={(pr) => updatePrazo(p.brandSlug, pr)}
                    trigger={
                      <button className="text-[10px] text-primary hover:underline inline-flex items-center gap-1">
                        <Pencil className="h-2.5 w-2.5" /> definir condição {p.brandName}
                      </button>
                    }
                  />
                ) : null;
                return (
                  <ProductCard key={p.id} p={p} qty={qty}
                    onAdd={() => setQty(p, 1)} onInc={() => setQty(p, qty + 1)} onDec={() => setQty(p, qty - 1)}
                    onAddWithPrice={(v) => { setQty(p, 1); setPrecoNegociado(p.brandSlug, p.id, v); }}
                    precoFinal={precoFinal} conditionHint={conditionHint}
                  />
                );
              })}
            </div>
          ) : (
            <div className="border rounded-lg divide-y overflow-hidden">
              {filtered.slice(0, 100).map((p) => {
                const qty = getQty(p.id, p.brandSlug);
                const cond = sessionConditionFor(p.brandSlug);
                const precoFinal = cond?.desconto ? p.price * (1 - cond.desconto / 100) : null;
                return (
                  <div key={p.id} className="flex items-center gap-3 p-3">
                    <div className="w-12 h-12 rounded bg-muted shrink-0 overflow-hidden">
                      {p.image && <img src={p.image} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-medium text-primary uppercase truncate">{p.brandName}</div>
                      <div className="text-sm font-medium truncate">{p.name}</div>
                      <div className="text-[11px] text-muted-foreground">Ref {p.ref}</div>
                    </div>
                    <div className="text-sm font-semibold shrink-0 text-right">
                      {precoFinal ? <><span className="line-through text-muted-foreground text-xs mr-1">{formatBRL(p.price)}</span><span className="text-emerald-600">{formatBRL(precoFinal)}</span></> : formatBRL(p.price)}
                    </div>
                    {qty === 0 ? (
                      <div className="flex items-center gap-1">
                        <AddWithPricePopover
                          precoTabela={p.price}
                          precoSugerido={precoFinal ?? p.price}
                          onConfirm={(v) => { setQty(p, 1); setPrecoNegociado(p.brandSlug, p.id, v); }}
                          trigger={
                            <Button size="sm" variant="outline" className="gap-1" aria-label="Adicionar com preço negociado">
                              <Pencil className="h-3 w-3" /> R$
                            </Button>
                          }
                        />
                        <Button size="sm" onClick={() => setQty(p, 1)} className="gap-1"><Plus className="h-3 w-3" /> Add</Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 border rounded-md">
                        <button onClick={() => setQty(p, qty - 1)} className="h-8 w-8 flex items-center justify-center"><Minus className="h-3 w-3" /></button>
                        <span className="text-sm w-8 text-center">{qty}</span>
                        <button onClick={() => setQty(p, qty + 1)} className="h-8 w-8 flex items-center justify-center"><Plus className="h-3 w-3" /></button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Rodapé cesta — comissão sempre oculta aqui */}
        {totalItens > 0 && !cartOpen && (
          <div className="fixed bottom-0 left-0 right-0 z-30 border-t bg-background shadow-lg">
            <div className="max-w-full px-4 md:px-6 py-3 flex items-center gap-3">
              <ShoppingCart className="h-5 w-5 text-primary" />
              <div className="flex-1 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm">
                <span className="font-semibold">{totalItens} itens</span>
                <span className="text-muted-foreground">Total <b className="text-foreground">{formatBRL(totalGeral)}</b></span>
              </div>
              <Button onClick={() => setCartOpen(true)}>Ver cesta</Button>
            </div>
          </div>
        )}

        <FiltersDrawer open={filtersOpen} onClose={() => setFiltersOpen(false)} filters={filters} setFilters={setFilters} resultCount={filtered.length} />

        {/* Painel cesta */}
        <Sheet open={cartOpen} onOpenChange={setCartOpen}>
          <SheetContent side="right" className="w-full sm:max-w-2xl flex flex-col p-0">
            <SheetHeader className="p-4 border-b shrink-0 flex-row items-center justify-between space-y-0">
              <SheetTitle>Cesta · {cliente?.nomeFantasia || "Sem cliente"}</SheetTitle>
              {!presentation && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setShowCommission((v) => !v)}
                      className={`text-xs inline-flex items-center gap-1 px-2 py-1 rounded-md border transition ${
                        showCommission ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700" : "text-muted-foreground hover:border-primary/40"
                      }`}
                      aria-pressed={showCommission}
                    >
                      {showCommission ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                      {showCommission ? "ocultar comissão" : "mostrar comissão"}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>{showCommission ? "Comissão visível — clique para ocultar" : "Revelar comissões por grupo e total"}</TooltipContent>
                </Tooltip>
              )}
            </SheetHeader>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {groups.length === 0 && <div className="text-center text-muted-foreground py-10">Cesta vazia.</div>}
              {groups.map((g) => (
                <BrandCockpit
                  key={g.slug} group={g} presentation={presentation} showCommission={showCommission && !presentation}
                  onChangeQty={(itemId, q) => { const it = allItems.find((x) => x.id === itemId); if (it) setQty(it, q); }}
                  onChangeDegrau={(idx) => updateDegrau(g.slug, idx)}
                  onChangePrazo={(p) => updatePrazo(g.slug, p)}
                  onSetPrecoNegociado={(itemId, v) => setPrecoNegociado(g.slug, itemId, v)}
                />
              ))}
            </div>
            <div className="border-t p-4 shrink-0 flex flex-col gap-3 items-stretch w-full">
              {groups.length > 0 && (
                <>
                  {/* Linha 1: total + desconto médio */}
                  <div className="w-full flex items-baseline justify-between gap-4">
                    <div>
                      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Total da cesta</div>
                      <div className="text-xl font-bold">{formatBRL(totalGeral)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Desc. médio pond.</div>
                      <div className="text-sm font-semibold">{descontoMedio.toFixed(1)}%</div>
                    </div>
                    {showCommission && !presentation && (
                      <div className="text-right">
                        <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Sua comissão</div>
                        <div className="text-sm font-semibold text-emerald-600">{formatBRL(comissaoTotal)}</div>
                      </div>
                    )}
                  </div>

                  {/* Linha 2: pendências por indústria, banners largura total */}
                  <div className="space-y-1.5 w-full">
                    {groups.map((g) => {
                      if (g.pendencias.length === 0) return null;
                      const isBlock = g.bloqueado;
                      return (
                        <div
                          key={g.slug}
                          className={`w-full text-xs rounded-md border px-3 py-2 flex items-start gap-2 ${
                            isBlock
                              ? "border-destructive/30 bg-destructive/10 text-destructive"
                              : "border-amber-500/30 bg-amber-500/10 text-amber-700"
                          }`}
                        >
                          <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <b className="capitalize">{g.slug}</b>: {g.pendencias.map((p) => p.msg).join(" · ")}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Linha 3: CTAs lado a lado */}
                  <div className="flex gap-2 w-full">
                    <Button variant="outline" className="flex-1 gap-2" onClick={enviarPreviaWhats} disabled={!cliente}>
                      <MessageSquare className="h-4 w-4" /> Enviar prévia no Whats
                    </Button>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex-1">
                          <Button className="w-full gap-2" disabled={!canGenerate} onClick={() => setConfirmOpen(true)}>
                            <FileText className="h-4 w-4" />
                            {partial ? `Gerar só com ${okGroups.map((g) => g.slug).join(", ")}` : "Gerar orçamento"}
                          </Button>
                        </div>
                      </TooltipTrigger>
                      {partial && (
                        <TooltipContent>
                          {blockedGroups.length} indústria(s) fora — ajuste {blockedGroups.map((g) => g.slug).join(", ")} para incluir.
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </div>

                  {/* Fora da política → pedido de acordo comercial ao supervisor */}
                  {(blockedGroups.length > 0 || !canGenerate) && (
                    <div className="w-full rounded-md border border-primary/30 bg-primary/5 p-3 flex items-start gap-3">
                      <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="text-xs">
                          <b>Fora da política</b> em {blockedGroups.length} indústria{blockedGroups.length > 1 ? "s" : ""} ({blockedGroups.map((g) => g.slug).join(", ")}).
                          Peça um <b>acordo comercial</b> ao supervisor para liberar a exceção.
                        </div>
                        <Button size="sm" variant="secondary" className="gap-2 w-full sm:w-auto" onClick={() => setAcordoOpen(true)} disabled={!cliente}>
                          <Send className="h-3.5 w-3.5" />
                          Enviar pedido de acordo comercial
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>


        {/* Confirmação orçamento */}
        <Sheet open={confirmOpen} onOpenChange={setConfirmOpen}>
          <SheetContent side="bottom" className="max-w-lg mx-auto rounded-t-xl">
            <SheetHeader><SheetTitle>Confirmar orçamento</SheetTitle></SheetHeader>
            <div className="py-4 space-y-3 text-sm">
              <div>Este orçamento gerará <b>{okGroups.length} pedido{okGroups.length > 1 ? "s" : ""}</b> na aprovação — pedidos por indústria faturam separado:</div>
              <div className="space-y-1">
                {okGroups.map((g) => (
                  <div key={g.slug} className="flex justify-between border rounded px-3 py-2">
                    <span className="capitalize">{g.slug}</span>
                    <span className="font-medium">{formatBRL(g.subtotalLiquido)}</span>
                  </div>
                ))}
              </div>
              {blockedGroups.length > 0 && (
                <div className="text-xs text-amber-700 bg-amber-500/10 border border-amber-500/30 rounded px-3 py-2">
                  <b>Fora deste orçamento</b> ({blockedGroups.length}): {blockedGroups.map((g) => `${g.slug} — ${g.pendencias.filter((p) => p.tipo === "bloqueio").map((p) => p.msg).join(", ")}`).join(" · ")}. Ajuste e gere depois.
                </div>
              )}
              <div className="text-muted-foreground text-xs">
                Nome sugerido: {cliente?.nomeFantasia || "Sem cliente"} · {okGroups.reduce((s, g) => s + g.linhas.reduce((a, i) => a + i.qty, 0), 0)} itens · {formatBRL(totalOk)}{!presentation && ` · comissão ${formatBRL(comissaoOk)}`}
              </div>
            </div>
            <SheetFooter className="flex-row gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setConfirmOpen(false)}>Cancelar</Button>
              <Button className="flex-1" onClick={gerarOrcamento}>Confirmar</Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        {/* Pedido de acordo comercial → supervisor */}
        <Sheet open={acordoOpen} onOpenChange={setAcordoOpen}>
          <SheetContent side="bottom" className="max-w-lg mx-auto rounded-t-xl max-h-[90vh] flex flex-col">
            <SheetHeader className="shrink-0">
              <SheetTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Pedido de acordo comercial
              </SheetTitle>
            </SheetHeader>
            <div className="py-4 space-y-3 text-sm overflow-y-auto flex-1">
              <div className="text-muted-foreground text-xs">
                O supervisor recebe as exceções abaixo para autorizar ou recusar. Você é notificado no CRM assim que houver decisão.
              </div>
              <div className="rounded-md border bg-muted/30 p-3 space-y-1.5">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Cliente</div>
                <div className="text-sm">{cliente?.nomeFantasia || "Sem cliente"}</div>
              </div>
              <div className="rounded-md border p-3 space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Exceções pedidas</div>
                {blockedGroups.length === 0 && (
                  <div className="text-xs text-muted-foreground">Nenhuma indústria fora da política.</div>
                )}
                {blockedGroups.map((g) => (
                  <div key={g.slug} className="text-xs border-l-2 border-destructive/50 pl-2">
                    <div className="capitalize font-medium">{g.slug} — {formatBRL(g.subtotalLiquido)}</div>
                    <div className="text-destructive">
                      {g.pendencias.filter((p: any) => p.tipo === "bloqueio").map((p: any) => p.msg).join(" · ") || "Fora da política vigente"}
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Justificativa comercial</label>
                <Textarea
                  value={acordoJustificativa}
                  onChange={(e) => setAcordoJustificativa(e.target.value)}
                  placeholder="Ex.: cliente estratégico, primeiro pedido, mix agressivo para reposição, contrapartida em volume…"
                  rows={4}
                />
              </div>
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <Checkbox checked={acordoUrgente} onCheckedChange={(v) => setAcordoUrgente(!!v)} />
                Marcar como urgente (notifica supervisor no Whats)
              </label>
            </div>
            <SheetFooter className="flex-row gap-2 shrink-0">
              <Button variant="outline" className="flex-1" onClick={() => setAcordoOpen(false)}>Cancelar</Button>
              <Button
                className="flex-1 gap-2"
                disabled={acordoJustificativa.trim().length < 10}
                onClick={() => {
                  toast({
                    title: "Pedido enviado ao supervisor",
                    description: `${blockedGroups.length} exceção(ões) aguardando aprovação${acordoUrgente ? " · marcado como urgente" : ""}.`,
                  });
                  setAcordoOpen(false);
                  setAcordoJustificativa("");
                  setAcordoUrgente(false);
                }}
              >
                <Send className="h-4 w-4" /> Enviar ao supervisor
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        <QRScannerModal open={qrOpen} onOpenChange={setQrOpen} onScan={handleQRScan} availableRefs={allItems.map((i) => i.ref)} />


        <AlertDialog open={addAllConfirm} onOpenChange={setAddAllConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Adicionar {filtered.length} produtos à cesta?</AlertDialogTitle>
              <AlertDialogDescription>
                Você vai adicionar todos os itens filtrados de uma vez. Você pode ajustar quantidades depois.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={addAllFiltered}>Adicionar todos</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
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
function AddWithPricePopover({ precoTabela, precoSugerido, onConfirm, trigger }: {
  precoTabela: number; precoSugerido: number; onConfirm: (v: number) => void; trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [valor, setValor] = useState(precoSugerido.toFixed(2));
  useEffect(() => { if (open) setValor(precoSugerido.toFixed(2)); }, [open, precoSugerido]);
  const parsed = parseFloat(valor.replace(",", "."));
  const valid = !isNaN(parsed) && parsed > 0;
  const desconto = valid ? ((1 - parsed / precoTabela) * 100) : 0;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>{trigger}</PopoverTrigger>
      <PopoverContent className="w-64 p-3 space-y-2" onClick={(e) => e.stopPropagation()}>
        <div className="text-xs font-semibold">Adicionar com preço negociado</div>
        <div className="text-[11px] text-muted-foreground">Tabela: <b>{formatBRL(precoTabela)}</b></div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">R$</span>
          <Input value={valor} onChange={(e) => setValor(e.target.value)} className="h-8 text-sm" autoFocus />
        </div>
        {valid && (
          <div className={`text-[11px] ${desconto >= 0 ? "text-emerald-600" : "text-amber-600"}`}>
            {desconto >= 0 ? `${desconto.toFixed(1)}% off` : `+${Math.abs(desconto).toFixed(1)}% acima da tabela`}
          </div>
        )}
        <div className="flex gap-2 pt-1">
          <Button size="sm" variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button size="sm" className="flex-1" disabled={!valid} onClick={() => { onConfirm(parsed); setOpen(false); }}>Adicionar</Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ProductCard({ p, qty, onAdd, onInc, onDec, onAddWithPrice, precoFinal, conditionHint }: {
  p: CatalogItem; qty: number; onAdd: () => void; onInc: () => void; onDec: () => void; onAddWithPrice?: (v: number) => void; precoFinal: number | null; conditionHint?: React.ReactNode;
}) {
  return (
    <div className="group relative rounded-lg overflow-hidden bg-card border hover:shadow-md transition">
      <div className="aspect-[3/4] bg-muted overflow-hidden">
        {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" loading="lazy" /> :
          <div className="w-full h-full flex items-center justify-center text-muted-foreground"><Package className="h-8 w-8" /></div>
        }
      </div>
      <div className="absolute top-2 right-2 flex items-center gap-1">
        {qty === 0 ? (
          <>
            {onAddWithPrice && (
              <AddWithPricePopover
                precoTabela={p.price}
                precoSugerido={precoFinal ?? p.price}
                onConfirm={onAddWithPrice}
                trigger={
                  <button className="opacity-0 group-hover:opacity-100 focus:opacity-100 md:opacity-0 opacity-100 transition bg-background border rounded-full h-9 px-2 text-[11px] font-semibold flex items-center gap-1 shadow" aria-label="Adicionar com preço negociado">
                    <Pencil className="h-3 w-3" /> R$
                  </button>
                }
              />
            )}
            <button onClick={onAdd} className="opacity-0 group-hover:opacity-100 focus:opacity-100 md:opacity-0 opacity-100 transition bg-primary text-primary-foreground rounded-full h-9 w-9 flex items-center justify-center shadow" aria-label="Adicionar">
              <Plus className="h-4 w-4" />
            </button>
          </>
        ) : (
          <div className="flex items-center gap-1 bg-primary text-primary-foreground rounded-full px-1 shadow">
            <button onClick={onDec} className="h-7 w-7 flex items-center justify-center hover:bg-primary-foreground/10 rounded-full"><Minus className="h-3.5 w-3.5" /></button>
            <span className="text-xs font-semibold w-6 text-center">{qty}</span>
            <button onClick={onInc} className="h-7 w-7 flex items-center justify-center hover:bg-primary-foreground/10 rounded-full"><Plus className="h-3.5 w-3.5" /></button>
          </div>
        )}
      </div>
      <div className="p-3 space-y-0.5">
        <div className="text-[10px] font-medium text-primary uppercase tracking-wide truncate">{p.brandName}{p.isGeneric && " · genérico"}</div>
        <div className="text-xs font-medium truncate">{p.name}</div>
        <div className="text-[10px] text-muted-foreground">Ref {p.ref}</div>
        <div className="text-sm font-semibold pt-1">
          {precoFinal ? <span className="text-muted-foreground line-through mr-1 text-xs">{formatBRL(p.price)}</span> : null}
          {precoFinal ? <span className="text-emerald-600">{formatBRL(precoFinal)}</span> : formatBRL(p.price)}
        </div>
        {conditionHint && <div className="pt-0.5">{conditionHint}</div>}
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
  const allCategorias = Array.from(new Set(baseItems.map((p) => p.category))).sort();
  const allGeneros = Array.from(new Set(baseItems.map((p) => p.gender))).sort();
  const allTamanhos = Array.from(new Set(baseItems.flatMap((p) => p.sizes))).sort();
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
              <Slider min={0} max={500} step={10} value={[local.precoMin, local.precoMax]} onValueChange={(v) => setLocal((f) => ({ ...f, precoMin: v[0], precoMax: v[1] }))} />
            </div>
          </FilterGroup>
        </div>
        <SheetFooter className="border-t p-4 shrink-0 flex-row gap-2">
          <Button variant="outline" className="flex-1" onClick={() => setLocal(emptyFilters)}>Limpar</Button>
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

// ---------- Brand Cockpit (cesta) ----------
type Group = ReturnType<CatalogoVendedor_ComputeGroup>;
type CatalogoVendedor_ComputeGroup = () => any;

function BrandCockpit({ group, presentation, showCommission, onChangeQty, onChangeDegrau, onChangePrazo, onSetPrecoNegociado }: {
  group: any; presentation?: boolean; showCommission?: boolean;
  onChangeQty: (itemId: string, q: number) => void;
  onChangeDegrau: (idx: number) => void;
  onChangePrazo: (p: number) => void;
  onSetPrecoNegociado: (itemId: string, v: number | undefined) => void;
}) {
  const g = group;
  const pol: PoliticaIndustria | undefined = g.pol;
  if (!pol) return null;
  const regra = g.regra as "media" | "porItem" | "desabilitado";
  const enquadrado = g.enquadrado as { degrau: any; idx: number } | null;
  const enquadradoNoAtual = enquadrado && enquadrado.idx === g.degrauIdx;

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-muted/50 px-4 py-2 flex items-center justify-between">
        <div>
          <div className="font-semibold capitalize">{g.slug}</div>
          <div className="text-[11px] text-muted-foreground">{pol.nomeTabela}{!pol.ativa && !presentation && " · POLÍTICA VENCIDA"}</div>
        </div>
        {showCommission && (
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Sua comissão</div>
            <div className="font-semibold text-emerald-600">{formatBRL(g.comissaoRS)}</div>
          </div>
        )}
      </div>

      {!pol.ativa && !presentation && (
        <div className="bg-destructive/10 text-destructive text-xs px-4 py-2">Política vencida — simulação bloqueada.</div>
      )}

      {/* Condição herdada */}
      <div className="px-4 py-2 border-b bg-background flex items-center justify-between gap-2 text-xs flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-muted-foreground">Condição sessão:</span>
          <b>{g.descontoSessao}% desc</b>
          <span className="text-muted-foreground">·</span>
          <b>{g.prazo}d</b>
          {!presentation && enquadrado && !enquadradoNoAtual && (
            <span className="text-[11px] text-amber-700 bg-amber-500/10 border border-amber-500/30 rounded-full px-2 py-0.5">
              → enquadrado {enquadrado.degrau.desconto}%{showCommission ? ` · com ${enquadrado.degrau.comissao}%` : ""}
            </span>
          )}
        </div>
        <ConditionPopover slug={g.slug} pol={pol} subtotalBruto={g.subtotalBruto}
          degrauIdx={g.degrauIdx} prazo={g.prazo} presentation={presentation}
          onChangeDegrau={onChangeDegrau} onChangePrazo={onChangePrazo}
          trigger={<button className="text-primary hover:underline text-xs gap-1 inline-flex items-center"><Pencil className="h-3 w-3" /> alterar</button>}
        />
      </div>

      {/* Itens */}
      <div className="divide-y">
        {g.linhas.map((l: any) => (
          <CartLineRow key={l.itemId} l={l} pol={pol} regra={regra} presentation={presentation}
            onChangeQty={onChangeQty} onSetPreco={onSetPrecoNegociado}
          />
        ))}
      </div>

      <div className="p-3 border-t bg-background space-y-2">
        <div className="flex justify-between text-sm">
          <div className="text-muted-foreground">Subtotal líquido</div>
          <div className="font-semibold">{formatBRL(g.subtotalLiquido)}</div>
        </div>
        <div className="flex justify-between text-xs">
          <div className="text-muted-foreground">Desconto médio ponderado</div>
          <div>
            {g.descontoMedio.toFixed(1)}%
            {!presentation && enquadrado && (
              <span className="text-muted-foreground">
                {" "}→ degrau {enquadrado.degrau.desconto}%{showCommission ? ` · com ${enquadrado.degrau.comissao}%` : ""}
              </span>
            )}
          </div>
        </div>
        {g.pendencias.length > 0 && !presentation && (
          <div className="space-y-1 pt-1 border-t">
            {g.pendencias.map((p: any, i: number) => (
              <div key={i} className={`text-xs flex items-start gap-1.5 ${p.tipo === "bloqueio" ? "text-destructive" : "text-amber-600"}`}>
                <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
                <span>{p.msg}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


function CartLineRow({ l, pol, regra, presentation, onChangeQty, onSetPreco }: {
  l: any; pol: PoliticaIndustria; regra: "media" | "porItem" | "desabilitado"; presentation?: boolean;
  onChangeQty: (itemId: string, q: number) => void;
  onSetPreco: (itemId: string, v: number | undefined) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState<string>(l.precoUnit.toFixed(2));
  useEffect(() => { setVal(l.precoUnit.toFixed(2)); }, [l.precoUnit]);
  const maxDegrau = pol.degraus.reduce((a, b) => a.desconto > b.desconto ? a : b);
  const minPrecoPorItem = l.precoTabela * (1 - maxDegrau.desconto / 100);
  const foraLimite = regra === "porItem" && l.precoUnit < minPrecoPorItem - 1e-6;
  const disabled = regra === "desabilitado";

  function commit(v: number) {
    if (!Number.isFinite(v) || v <= 0) return;
    if (regra === "porItem" && v < minPrecoPorItem) v = minPrecoPorItem;
    onSetPreco(l.itemId, Math.abs(v - l.precoDefault) < 1e-6 ? undefined : v);
    setEditing(false);
  }

  return (
    <div className="flex items-center gap-3 p-3">
      <img src={l.item.image} alt="" className="h-14 w-14 rounded object-cover bg-muted" />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate flex items-center gap-2">
          {l.item.name}
          {l.negociado && <Badge variant="outline" className="text-[9px] py-0 border-amber-500/40 text-amber-700 bg-amber-500/10">negociado</Badge>}
        </div>
        <div className="text-xs text-muted-foreground">Ref {l.item.ref} · tabela {formatBRL(l.precoTabela)}</div>
        {pol.gradeFechada && <Badge variant="secondary" className="mt-1 text-[10px]">grade fechada</Badge>}

        <div className="mt-1 flex items-center gap-2 text-xs">
          {editing && !disabled ? (
            <>
              <Input
                autoFocus type="number" step={0.01} value={val}
                onChange={(e) => setVal(e.target.value)}
                onBlur={() => commit(Number(val))}
                onKeyDown={(e) => { if (e.key === "Enter") commit(Number(val)); if (e.key === "Escape") setEditing(false); }}
                className="h-7 w-24 text-xs"
              />
              <span className="text-muted-foreground text-[10px]">
                {regra === "porItem" && `mínimo ${formatBRL(minPrecoPorItem)} · ${maxDegrau.desconto}%`}
              </span>
            </>
          ) : (
            <button
              onClick={() => !disabled && setEditing(true)}
              disabled={disabled}
              className={`inline-flex items-center gap-1 font-semibold ${disabled ? "cursor-not-allowed opacity-70" : "hover:text-primary"}`}
              title={disabled ? "Negociação por item não permitida pela política" : "Clique para editar o preço"}
            >
              {formatBRL(l.precoUnit)}
              {!disabled && <Pencil className="h-3 w-3 opacity-60" />}
            </button>
          )}
          <span className={`text-[10px] ${foraLimite ? "text-amber-600" : "text-muted-foreground"}`}>
            = {l.descontoItem.toFixed(1)}% off
            {foraLimite && ` · acima do teto ${maxDegrau.desconto}%`}
          </span>
          {l.negociado && (
            <button onClick={() => onSetPreco(l.itemId, undefined)} className="text-muted-foreground hover:text-primary inline-flex items-center gap-1 text-[10px]">
              <RotateCcw className="h-3 w-3" /> restaurar
            </button>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 border rounded-md">
        <button onClick={() => onChangeQty(l.itemId, l.qty - 1)} className="h-7 w-7 flex items-center justify-center hover:bg-muted"><Minus className="h-3 w-3" /></button>
        <span className="text-sm w-8 text-center">{l.qty}</span>
        <button onClick={() => onChangeQty(l.itemId, l.qty + 1)} className="h-7 w-7 flex items-center justify-center hover:bg-muted"><Plus className="h-3 w-3" /></button>
      </div>
    </div>
  );
}

// ---------- Condition Popover ----------
function ConditionPopover({
  slug, pol, subtotalBruto, degrauIdx, prazo, presentation, onChangeDegrau, onChangePrazo, trigger,
}: {
  slug: string; pol: PoliticaIndustria; subtotalBruto: number;
  degrauIdx: number; prazo: number; presentation?: boolean;
  onChangeDegrau: (idx: number) => void; onChangePrazo: (p: number) => void;
  trigger: React.ReactNode;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent align="end" className="w-[340px] p-3 space-y-3">
        <div>
          <div className="text-xs font-semibold capitalize">{slug}</div>
          <div className="text-[11px] text-muted-foreground">{pol.nomeTabela}{!pol.ativa && !presentation && " · POLÍTICA VENCIDA"}</div>
        </div>
        <div>
          <div className="text-xs font-medium mb-1.5">{presentation ? "Desconto" : "Degrau desconto ↔ comissão"}</div>
          <div className="grid grid-cols-3 gap-1.5">
            {pol.degraus.map((d, i) => {
              const liq = subtotalBruto * (1 - d.desconto / 100);
              const locked = d.minimoPedido && subtotalBruto > 0 && liq < d.minimoPedido;
              const active = i === degrauIdx;
              return (
                <Tooltip key={i}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => onChangeDegrau(i)} disabled={!pol.ativa}
                      className={`text-[11px] px-2 py-2 rounded border text-center transition ${
                        active ? "border-primary bg-primary text-primary-foreground"
                              : "border-border hover:border-primary/50 bg-card"
                      } ${!pol.ativa ? "opacity-40 cursor-not-allowed" : ""}`}
                    >
                      <div className="font-semibold">{d.desconto}%</div>
                      {!presentation && <div className="text-[10px] opacity-80">com {d.comissao}%</div>}
                      {locked && <Lock className="h-2.5 w-2.5 inline mt-0.5" />}
                    </button>
                  </TooltipTrigger>
                  {locked && d.minimoPedido && (
                    <TooltipContent>Mínimo {formatBRL(d.minimoPedido)} — faltam {formatBRL(d.minimoPedido - liq)}.</TooltipContent>
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
          {!presentation && (
            <div className="text-[10px] text-muted-foreground mt-1">
              +{pol.bonusComissaoPor15Dias}% de comissão a cada 15d abaixo do prazo médio ({pol.prazoMedio}d).
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ---------- Session Condition Bar ----------
function SessionConditionChips({
  slugs, degrauByBrand, prazoByBrand, cartByBrand, allItems, presentation,
  onChangeDegrau, onChangePrazo,
}: {
  slugs: string[];
  degrauByBrand: Record<string, number>;
  prazoByBrand: Record<string, number>;
  cartByBrand: Record<string, Array<{ itemId: string; qty: number }>>;
  allItems: CatalogItem[];
  presentation?: boolean;
  onChangeDegrau: (slug: string, idx: number) => void;
  onChangePrazo: (slug: string, p: number) => void;
  onAddBrand: (slug: string) => void;
}) {
  return (
    <>
      {slugs.length === 0 && (
        <span className="text-xs text-muted-foreground italic shrink-0">Nenhuma indústria ativa — filtre por marca ou adicione um produto.</span>
      )}
      {slugs.map((slug) => {
        const pol = getPolitica(slug);
        if (!pol) return null;
        const idx = degrauByBrand[slug] ?? 0;
        const degrau = pol.degraus[idx];
        const prazo = prazoByBrand[slug] ?? pol.prazoMedio;
        const subtotalBruto = (cartByBrand[slug] || []).reduce((s, l) => {
          const it = allItems.find((x) => x.id === l.itemId);
          return s + (it ? it.price * l.qty : 0);
        }, 0);
        const liq = subtotalBruto * (1 - (degrau?.desconto ?? 0) / 100);
        const abaixoMin = !!(degrau?.minimoPedido && subtotalBruto > 0 && liq < degrau.minimoPedido);
        return (
          <ConditionPopover key={slug} slug={slug} pol={pol} subtotalBruto={subtotalBruto}
            degrauIdx={idx} prazo={prazo} presentation={presentation}
            onChangeDegrau={(i) => onChangeDegrau(slug, i)}
            onChangePrazo={(p) => onChangePrazo(slug, p)}
            trigger={
              <button className={`shrink-0 inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition ${
                abaixoMin ? "border-amber-500/60 bg-amber-500/10 text-amber-700 hover:bg-amber-500/15"
                          : "border-primary/30 bg-primary/5 text-foreground hover:bg-primary/10"
              }`}>
                <b className="capitalize">{slug}</b>
                <span>{degrau?.desconto ?? 0}%</span>
                <span className="text-muted-foreground">·</span>
                <span>{prazo}d</span>
                {abaixoMin && <AlertTriangle className="h-3 w-3 text-amber-600" />}
                <Pencil className="h-3 w-3 opacity-60" />
              </button>
            }
          />
        );
      })}
    </>
  );
}

