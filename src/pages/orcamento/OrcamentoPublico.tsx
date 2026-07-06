import { useState, useMemo, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import {
  MessageCircle, ChevronDown, ChevronUp, Plus, Minus, CheckCircle2,
  Clock, Truck, Percent, CalendarClock, ZoomIn, ShieldCheck, X, Info,
  Search, Undo2, Send, HandCoins, Sparkles, Pencil, Eye, MessageSquareMore,
} from "lucide-react";
import { mockOrcamentos, mockCatalogoProdutos, type Orcamento, type OrcamentoProduto } from "@/data/mockVendedor";
import { toast } from "sonner";

// ─── Mocks ────────────────────────────────────────────────────────────
const VENDEDOR = {
  nome: "Alexandre Chiste",
  foto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face",
  whats: "5547999998888",
  cnpjRep: "12.345.678/0001-90",
  empresa: "Chiste Representações Ltda",
};

const CONDICOES_POR_MARCA: Record<string, { desconto: number; prazo: string; entrega: string; minimoFreteGratis?: number }> = {
  BRANDILI: { desconto: 32.5, prazo: "30/60/90 dias", entrega: "20/07/2026", minimoFreteGratis: 1800 },
  MUNDI:    { desconto: 25.0, prazo: "à vista + 30", entrega: "25/07/2026", minimoFreteGratis: 1500 },
  KYLY:     { desconto: 20.0, prazo: "30/60 dias",    entrega: "05/08/2026", minimoFreteGratis: 2000 },
  ALAKAZOO: { desconto: 18.0, prazo: "30/60/90 dias", entrega: "10/08/2026" },
  KAMYLUS:  { desconto: 22.0, prazo: "à vista",       entrega: "22/07/2026" },
  POKOTINHA:{ desconto: 15.0, prazo: "30 dias",       entrega: "28/07/2026" },
  "PERFECT BOYS": { desconto: 20.0, prazo: "30/60 dias", entrega: "30/07/2026" },
  HRRADINHOS: { desconto: 15.0, prazo: "à vista",     entrega: "20/07/2026" },
};

type ModoPreco = "peca" | "kit" | "ambos";

interface Item {
  id: string;
  marca: string;
  ref: string;
  nome: string;
  image: string;
  pecas: number;
  precoPeca: number;      // preço original/peça
  qtd: number;            // quantidade de kits
  incluido: boolean;
  ofertaPeca?: number;    // contraproposta por peça (opcional)
  addedByLojista?: boolean;
}

const fmt = (v: number) =>
  `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function calcularValidade(dataCriacao: string) {
  const [d, m, y] = dataCriacao.split("/").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + 15);
  const hoje = new Date();
  const diff = Math.ceil((dt.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
  return { dataFmt: dt.toLocaleDateString("pt-BR"), diasRestantes: diff, expirada: diff < 0 };
}

function gerarItens(orc: Orcamento): Item[] {
  const marcas = orc.industriaValores?.length ? orc.industriaValores.map(i => i.marca) : orc.marcas;
  const items: Item[] = [];
  marcas.forEach((m, mi) => {
    const base = mockCatalogoProdutos.slice(mi * 2, mi * 2 + 3);
    base.forEach((p, i) => {
      items.push({
        id: `${orc.id}-${m}-${i}`,
        marca: m, ref: p.ref, nome: p.nome, image: p.image,
        pecas: p.pecas, precoPeca: p.preco, qtd: 1 + (i % 3), incluido: true,
      });
    });
  });
  return items;
}

// ─── Página ───────────────────────────────────────────────────────────
export default function OrcamentoPublico() {
  const { id } = useParams<{ id: string }>();
  const orc = useMemo(() => mockOrcamentos.find(o => o.id === id) || mockOrcamentos[0], [id]);
  const validade = useMemo(() => calcularValidade(orc.dataCriacao), [orc]);

  // Modo de preço: escolha inicial do vendedor "ambos"; lojista pode alternar (persistido).
  const modoInicial: ModoPreco = "ambos";
  const modoKey = `proposta.modoPreco.${orc.lojista || "anon"}`;
  const [modoPreco, setModoPreco] = useState<ModoPreco>(() => {
    try { return (localStorage.getItem(modoKey) as ModoPreco) || modoInicial; } catch { return modoInicial; }
  });
  useEffect(() => { try { localStorage.setItem(modoKey, modoPreco); } catch {} }, [modoPreco, modoKey]);

  const [itens, setItens] = useState<Item[]>(() => gerarItens(orc));
  const [resumoAberto, setResumoAberto] = useState(false);
  const [colapsadas, setColapsadas] = useState<Set<string>>(new Set());
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [aprovado, setAprovado] = useState<{ tipo: "total" | "marca"; marca?: string; valor: number } | null>(null);

  // Contraproposta por item
  const [ofertaItemAlvo, setOfertaItemAlvo] = useState<Item | null>(null);
  const [ofertaValor, setOfertaValor] = useState("");

  // Contraproposta total
  const [ofertaTotalAberta, setOfertaTotalAberta] = useState(false);
  const [ofertaTotalValor, setOfertaTotalValor] = useState<string>("");
  const [ofertaTotal, setOfertaTotal] = useState<number | null>(null);

  // Adicionar itens
  const [addOpenMarca, setAddOpenMarca] = useState<string | null>(null);
  const [addSearch, setAddSearch] = useState("");

  // Sugerir / recusar
  const [sugerirOpen, setSugerirOpen] = useState(false);
  const [sugerirNota, setSugerirNota] = useState("");
  const [recusarOpen, setRecusarOpen] = useState(false);
  const [recusarMotivo, setRecusarMotivo] = useState<string | null>(null);

  // Modo de edição (contraproposta ativa) — ativado por "Solicitar alterações"
  const [edicaoMode, setEdicaoMode] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, [id]);

  const marcas = useMemo(() => Array.from(new Set(itens.map(i => i.marca))), [itens]);

  const precoEfetivoPeca = (i: Item) => i.ofertaPeca ?? i.precoPeca;
  const subtotalItem = (i: Item) => precoEfetivoPeca(i) * i.pecas * i.qtd;

  const totalPorMarca = (marca: string) =>
    itens.filter(i => i.marca === marca && i.incluido).reduce((a, i) => a + subtotalItem(i), 0);
  const pecasPorMarca = (marca: string) =>
    itens.filter(i => i.marca === marca && i.incluido).reduce((a, i) => a + i.pecas * i.qtd, 0);

  const itensAtivos = itens.filter(i => i.incluido);
  const totalGeral = marcas.reduce((a, m) => a + totalPorMarca(m), 0);
  const pecasTotal = itensAtivos.reduce((a, i) => a + i.pecas * i.qtd, 0);

  const temContraproposta = itens.some(i => i.incluido && i.ofertaPeca != null) || ofertaTotal != null;
  const temAdicoes = itens.some(i => i.addedByLojista && i.incluido);
  const modoContraproposta = temContraproposta || temAdicoes;

  const incentivoFreteMarca = (marca: string): string | null => {
    const cond = CONDICOES_POR_MARCA[marca];
    if (!cond?.minimoFreteGratis) return null;
    const total = totalPorMarca(marca);
    if (total <= 0) return null;
    const falta = cond.minimoFreteGratis - total;
    if (falta > 0 && falta < cond.minimoFreteGratis) {
      return `Adicione ${fmt(falta)} e ganhe frete grátis`;
    }
    if (falta <= 0) return "Você já tem frete grátis nesta indústria";
    return null;
  };

  const toggleColapsada = (m: string) =>
    setColapsadas(prev => { const n = new Set(prev); n.has(m) ? n.delete(m) : n.add(m); return n; });
  const updateQtd = (itemId: string, delta: number) =>
    setItens(prev => prev.map(i => i.id === itemId ? { ...i, qtd: Math.max(1, i.qtd + delta) } : i));
  const toggleIncluido = (itemId: string) =>
    setItens(prev => prev.map(i => i.id === itemId ? { ...i, incluido: !i.incluido } : i));

  const abrirOfertaItem = (i: Item) => {
    setOfertaItemAlvo(i);
    setOfertaValor(String(i.ofertaPeca ?? ""));
  };
  const salvarOfertaItem = () => {
    if (!ofertaItemAlvo) return;
    const v = parseFloat(ofertaValor.replace(",", "."));
    if (!v || v <= 0) { toast.error("Informe um valor válido"); return; }
    // Se lojista digitou por kit, converte para peça
    const perPeca = modoPreco === "kit" ? v / ofertaItemAlvo.pecas : v;
    setItens(prev => prev.map(i => i.id === ofertaItemAlvo.id ? { ...i, ofertaPeca: perPeca } : i));
    setOfertaItemAlvo(null); setOfertaValor("");
    toast.success("Sua oferta foi anotada — envie ao final para o vendedor analisar");
  };
  const desfazerOfertaItem = (itemId: string) =>
    setItens(prev => prev.map(i => i.id === itemId ? { ...i, ofertaPeca: undefined } : i));

  const salvarOfertaTotal = () => {
    const v = parseFloat(ofertaTotalValor.replace(",", "."));
    if (!v || v <= 0) { toast.error("Informe um valor válido"); return; }
    setOfertaTotal(v);
    setOfertaTotalAberta(false);
    toast.success("Oferta de valor total registrada");
  };

  const adicionarProdutoCatalogo = (p: OrcamentoProduto) => {
    setItens(prev => [
      ...prev,
      {
        id: `add-${p.id}-${Date.now()}`,
        marca: p.marca,
        ref: p.ref,
        nome: p.nome,
        image: p.image,
        pecas: p.pecas,
        precoPeca: p.preco,
        qtd: 1,
        incluido: true,
        addedByLojista: true,
      },
    ]);
    toast.success(`${p.nome.slice(0, 24)}… adicionado`);
  };

  const enviarContraproposta = () => {
    const itensOferta = itens.filter(i => i.incluido && i.ofertaPeca != null).length;
    const adicoes = itens.filter(i => i.addedByLojista && i.incluido).length;
    const parts: string[] = [];
    if (itensOferta) parts.push(`${itensOferta} oferta(s) por item`);
    if (ofertaTotal) parts.push(`oferta global ${fmt(ofertaTotal)}`);
    if (adicoes) parts.push(`${adicoes} item(ns) adicionados`);
    toast.success(`Contraproposta enviada ao ${VENDEDOR.nome.split(" ")[0]} · ${parts.join(" · ") || "sem alterações"}`);
    // Não fecha a tela; ela vira o tracking.
  };

  const aprovar = (tipo: "total" | "marca", marca?: string) => {
    const valor = tipo === "total" ? totalGeral : totalPorMarca(marca!);
    setAprovado({ tipo, marca, valor });
  };

  const enviarSugestao = () => {
    toast.success("Alterações enviadas — status: Em revisão");
    setSugerirOpen(false); setSugerirNota("");
  };
  const enviarRecusa = () => {
    if (!recusarMotivo) return;
    toast.success(`Recusa registrada (motivo: ${recusarMotivo})`);
    setRecusarOpen(false); setRecusarMotivo(null);
  };

  const whatsUrl = `https://wa.me/${VENDEDOR.whats}?text=${encodeURIComponent(`Olá ${VENDEDOR.nome}, sobre a proposta ${orc.id}...`)}`;

  // Catálogo de "Adicionar itens" filtrado pela marca da seção
  const catalogoAdd = useMemo(() => {
    if (!addOpenMarca) return [] as OrcamentoProduto[];
    let list = mockCatalogoProdutos.filter(p => p.marca === addOpenMarca);
    if (list.length === 0) list = mockCatalogoProdutos.slice(0, 12); // fallback demo
    if (addSearch.trim()) {
      const q = addSearch.toLowerCase();
      list = list.filter(p => p.nome.toLowerCase().includes(q) || p.ref.toLowerCase().includes(q) || p.categoria.toLowerCase().includes(q));
    }
    return list;
  }, [addOpenMarca, addSearch]);

  // ─── EXPIRADO ──────────────────────────────────────────────────────
  if (validade.expirada) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-card rounded-2xl border border-border p-8 text-center space-y-4">
          <div className="h-14 w-14 rounded-full bg-destructive/10 text-destructive mx-auto flex items-center justify-center">
            <Clock className="h-7 w-7" />
          </div>
          <h1 className="text-lg font-bold text-foreground">Proposta expirada</h1>
          <p className="text-sm text-muted-foreground">
            Esta proposta venceu em {validade.dataFmt}. Peça uma atualização ao {VENDEDOR.nome}.
          </p>
          <a href={whatsUrl} target="_blank" rel="noreferrer">
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
              <MessageCircle className="h-4 w-4" />Pedir atualização no WhatsApp
            </Button>
          </a>
        </div>
      </div>
    );
  }

  // ─── APROVADO / TRACKING ───────────────────────────────────────────
  if (aprovado) {
    return (
      <div className="min-h-screen bg-muted/30 pb-16">
        <div className="max-w-lg mx-auto p-6 space-y-5">
          <div className="bg-card rounded-2xl border border-border p-6 text-center space-y-3">
            <div className="h-14 w-14 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h1 className="text-xl font-bold text-foreground font-heading">Pedido aprovado ✓</h1>
            <p className="text-sm text-muted-foreground">
              {aprovado.tipo === "total"
                ? `Você aprovou a proposta completa (${fmt(aprovado.valor)}).`
                : `Você aprovou ${aprovado.marca} (${fmt(aprovado.valor)}) — as outras indústrias seguem separadas.`}
            </p>
          </div>

          <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Próximos passos</h2>
            <ol className="space-y-3">
              {[
                { i: 1, t: "Análise comercial", d: "Até 2 dias úteis" },
                { i: 2, t: "Faturamento pela indústria", d: "Assim que aprovado" },
                { i: 3, t: "Você recebe NF, boletos e rastreio", d: "Nesta mesma página" },
              ].map(s => (
                <li key={s.i} className="flex gap-3 items-start">
                  <span className="h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">{s.i}</span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{s.t}</p>
                    <p className="text-xs text-muted-foreground">{s.d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center gap-3">
            <Info className="h-4 w-4 text-primary shrink-0" />
            <p className="text-xs text-foreground">Salve este link — ele vira o acompanhamento do seu pedido.</p>
          </div>

          <a href={whatsUrl} target="_blank" rel="noreferrer">
            <Button variant="outline" className="w-full gap-2">
              <MessageCircle className="h-4 w-4" />Falar com {VENDEDOR.nome.split(" ")[0]}
            </Button>
          </a>

          <button onClick={() => setAprovado(null)} className="w-full text-xs text-muted-foreground hover:text-foreground">
            Ver proposta novamente
          </button>
        </div>
      </div>
    );
  }

  // ─── PROPOSTA ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-muted/20 pb-56">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-2xl mx-auto p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Proposta comercial</p>
              <h1 className="text-lg sm:text-xl font-bold text-foreground font-heading leading-tight">
                Para {orc.lojista || "seu negócio"}
              </h1>
            </div>
            <Badge className={`shrink-0 gap-1 ${
              validade.diasRestantes <= 3
                ? "bg-orange-500/15 text-orange-600 dark:text-orange-400"
                : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
            } border-0`}>
              <CalendarClock className="h-3 w-3" />
              válida até {validade.dataFmt}
            </Badge>
          </div>

          <div className="flex items-center gap-2.5 pt-1">
            <img src={VENDEDOR.foto} alt={VENDEDOR.nome} className="h-9 w-9 rounded-full object-cover shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">enviada por</p>
              <p className="text-sm font-semibold text-foreground truncate">{VENDEDOR.nome} · {orc.dataCriacao}</p>
            </div>
            <a href={whatsUrl} target="_blank" rel="noreferrer" className="shrink-0">
              <Button size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white h-9">
                <MessageCircle className="h-3.5 w-3.5" />Whats
              </Button>
            </a>
          </div>

          {/* Resumo simples */}
          <div className="bg-muted/50 rounded-xl p-3 mt-2">
            <div className="flex items-baseline justify-between gap-2">
              <div>
                <p className="text-[11px] text-muted-foreground">Seu pedido</p>
                <p className="text-base font-semibold text-foreground">{itensAtivos.length} itens · {pecasTotal} peças</p>
              </div>
              <p className="text-xl font-bold text-primary">{fmt(totalGeral)}</p>
            </div>

            {/* Modo de exibição de preço */}
            <div className="mt-3 flex items-center gap-1.5 bg-background rounded-lg p-1 border border-border w-fit">
              {(["peca", "kit", "ambos"] as ModoPreco[]).map(m => (
                <button
                  key={m}
                  onClick={() => setModoPreco(m)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                    modoPreco === m ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {m === "peca" ? "Por peça" : m === "kit" ? "Por kit" : "Ambos"}
                </button>
              ))}
            </div>

            <button
              onClick={() => setResumoAberto(v => !v)}
              className="mt-2 text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
              {resumoAberto ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              {resumoAberto ? "Esconder detalhes" : "Ver detalhes por peça"}
            </button>
            {resumoAberto && (
              <div className="mt-2 pt-2 border-t border-border grid grid-cols-3 gap-2 text-center">
                {(() => {
                  const pecas = itensAtivos.map(i => precoEfetivoPeca(i));
                  const min = pecas.length ? Math.min(...pecas) : 0;
                  const max = pecas.length ? Math.max(...pecas) : 0;
                  const med = pecas.length ? pecas.reduce((a, b) => a + b, 0) / pecas.length : 0;
                  return (
                    <>
                      <div><p className="text-[10px] text-muted-foreground">mín/peça</p><p className="text-xs font-semibold">{fmt(min)}</p></div>
                      <div><p className="text-[10px] text-muted-foreground">médio/peça</p><p className="text-xs font-semibold">{fmt(med)}</p></div>
                      <div><p className="text-[10px] text-muted-foreground">máx/peça</p><p className="text-xs font-semibold">{fmt(max)}</p></div>
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Seções por indústria */}
      <main className="max-w-2xl mx-auto p-4 space-y-4">
        {marcas.map((marca) => {
          const cond = CONDICOES_POR_MARCA[marca] || { desconto: 20, prazo: "30/60/90 dias", entrega: "—" };
          const marcaItens = itens.filter(i => i.marca === marca);
          const subtotal = totalPorMarca(marca);
          const pecas = pecasPorMarca(marca);
          const incentivo = incentivoFreteMarca(marca);
          const fechada = colapsadas.has(marca);
          return (
            <section key={marca} className="bg-card rounded-2xl border border-border overflow-hidden">
              <button
                onClick={() => toggleColapsada(marca)}
                className="w-full px-4 py-3 flex items-center justify-between gap-3 hover:bg-muted/40 transition-colors"
              >
                <div className="text-left min-w-0">
                  <p className="text-sm font-bold text-foreground uppercase tracking-wide">{marca}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {marcaItens.filter(i => i.incluido).length} itens · {pecas} peças
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-base font-bold text-foreground">{fmt(subtotal)}</p>
                  {fechada ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronUp className="h-4 w-4 text-muted-foreground" />}
                </div>
              </button>

              {!fechada && (
                <>
                  {/* Condições */}
                  <div className="px-4 py-2.5 bg-muted/30 border-y border-border grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-[10px] text-muted-foreground flex items-center justify-center gap-1"><Percent className="h-2.5 w-2.5" />desconto</div>
                      <p className="text-xs font-semibold">{cond.desconto}%</p>
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground flex items-center justify-center gap-1"><CalendarClock className="h-2.5 w-2.5" />prazo</div>
                      <p className="text-xs font-semibold">{cond.prazo}</p>
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground flex items-center justify-center gap-1"><Truck className="h-2.5 w-2.5" />entrega</div>
                      <p className="text-xs font-semibold">{cond.entrega}</p>
                    </div>
                  </div>

                  {/* Incentivo (verde/neutro) */}
                  {incentivo && (
                    <div className="px-4 py-2 bg-emerald-500/10 border-b border-emerald-500/20 flex gap-2 items-center">
                      <Truck className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                      <p className="text-[12px] text-emerald-800 dark:text-emerald-300 font-medium">🚚 {incentivo}</p>
                    </div>
                  )}

                  {/* Itens */}
                  <ul className="divide-y divide-border">
                    {marcaItens.map((item) => {
                      const oferta = item.ofertaPeca != null;
                      const precoPecaMostrado = precoEfetivoPeca(item);
                      const precoKit = precoPecaMostrado * item.pecas;
                      return (
                        <li key={item.id} className={`p-3 flex gap-3 ${!item.incluido ? "opacity-50" : ""}`}>
                          <button
                            onClick={() => setLightboxImg(item.image)}
                            className="relative shrink-0 h-24 w-24 sm:h-28 sm:w-28 rounded-xl overflow-hidden bg-muted group"
                          >
                            <img src={item.image} alt={item.nome} className="w-full h-full object-cover" />
                            <span className="absolute bottom-1 right-1 bg-black/60 text-white h-6 w-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <ZoomIn className="h-3 w-3" />
                            </span>
                            {item.addedByLojista && (
                              <span className="absolute top-1 left-1 bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                <Sparkles className="h-2.5 w-2.5" />adicionado
                              </span>
                            )}
                          </button>
                          <div className="flex-1 min-w-0 space-y-1.5">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-foreground leading-tight">{item.nome}</p>
                                <p className="text-[11px] text-muted-foreground">Ref: {item.ref} · {item.pecas} peças/kit</p>
                              </div>
                              <Switch checked={item.incluido} onCheckedChange={() => toggleIncluido(item.id)} className="shrink-0" />
                            </div>

                            {/* Preço (com contraproposta) */}
                            <button
                              onClick={() => item.incluido && abrirOfertaItem(item)}
                              disabled={!item.incluido}
                              className="group inline-flex items-center gap-1.5 text-left"
                              title="Toque para propor um preço"
                            >
                              {modoPreco === "peca" && (
                                <>
                                  {oferta && <span className="text-[11px] text-muted-foreground line-through">{fmt(item.precoPeca)}/peça</span>}
                                  <span className={`text-sm font-bold ${oferta ? "text-primary" : "text-foreground"}`}>{fmt(precoPecaMostrado)}/peça</span>
                                  <span className="text-[10px] text-muted-foreground">· kit {fmt(precoKit)}</span>
                                </>
                              )}
                              {modoPreco === "kit" && (
                                <>
                                  {oferta && <span className="text-[11px] text-muted-foreground line-through">{fmt(item.precoPeca * item.pecas)}/kit</span>}
                                  <span className={`text-sm font-bold ${oferta ? "text-primary" : "text-foreground"}`}>{fmt(precoKit)}/kit</span>
                                  <span className="text-[10px] text-muted-foreground">· {fmt(precoPecaMostrado)}/peça</span>
                                </>
                              )}
                              {modoPreco === "ambos" && (
                                <>
                                  <span className={`text-sm font-bold ${oferta ? "text-primary" : "text-foreground"}`}>{fmt(precoPecaMostrado)}/peça</span>
                                  <span className="text-[11px] text-muted-foreground">· kit {fmt(precoKit)}</span>
                                  {oferta && <span className="text-[10px] text-muted-foreground line-through">({fmt(item.precoPeca)}/peça)</span>}
                                </>
                              )}
                              <Pencil className="h-3 w-3 text-muted-foreground/60 group-hover:text-primary transition-colors" />
                              <span className="sr-only">propor outro valor</span>
                            </button>

                            {oferta && (
                              <div className="inline-flex items-center gap-2">
                                <Badge className="bg-primary/15 text-primary border-0 text-[10px]">
                                  sua oferta: {fmt(precoPecaMostrado)}/peça
                                </Badge>
                                <button onClick={() => desfazerOfertaItem(item.id)} className="text-muted-foreground hover:text-foreground" title="Desfazer oferta">
                                  <Undo2 className="h-3 w-3" />
                                </button>
                              </div>
                            )}

                            <div className="flex items-center justify-between pt-1">
                              <div className="inline-flex items-center border border-border rounded-lg overflow-hidden">
                                <button onClick={() => updateQtd(item.id, -1)} disabled={!item.incluido || item.qtd <= 1} className="h-8 w-8 flex items-center justify-center hover:bg-muted disabled:opacity-40">
                                  <Minus className="h-3.5 w-3.5" />
                                </button>
                                <span className="w-9 text-center text-sm font-semibold">{item.qtd}</span>
                                <button onClick={() => updateQtd(item.id, 1)} disabled={!item.incluido} className="h-8 w-8 flex items-center justify-center hover:bg-muted disabled:opacity-40">
                                  <Plus className="h-3.5 w-3.5" />
                                </button>
                              </div>
                              <p className="text-sm font-bold text-foreground">{fmt(subtotalItem(item))}</p>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>

                  {/* Adicionar itens */}
                  <div className="p-3 border-t border-border">
                    <button
                      onClick={() => { setAddOpenMarca(marca); setAddSearch(""); }}
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-dashed border-border text-sm font-medium text-primary hover:bg-primary/5 transition-colors"
                    >
                      <Plus className="h-4 w-4" />Adicionar itens de {marca}
                    </button>
                  </div>

                  {/* Aprovar indústria (quando há mais de uma) */}
                  {marcas.length > 1 && subtotal > 0 && (
                    <div className="p-3 bg-muted/30 border-t border-border">
                      <Button
                        onClick={() => aprovar("marca", marca)}
                        variant="outline"
                        className="w-full gap-1.5 border-primary/40 text-primary hover:bg-primary/10"
                      >
                        <CheckCircle2 className="h-4 w-4" />Aprovar {marca} ({fmt(subtotal)})
                      </Button>
                    </div>
                  )}
                </>
              )}
            </section>
          );
        })}

        {/* Footer confiança */}
        <footer className="pt-4 pb-2 text-center space-y-1">
          <p className="text-[11px] text-muted-foreground">{VENDEDOR.empresa} · CNPJ {VENDEDOR.cnpjRep}</p>
          <p className="text-[10px] text-muted-foreground">powered by <span className="font-semibold text-foreground">Nextil</span></p>
        </footer>
      </main>

      {/* Sticky footer */}
      <div className="fixed bottom-0 inset-x-0 bg-card border-t border-border shadow-2xl z-40">
        <div className="max-w-2xl mx-auto p-3 space-y-2">
          {ofertaTotal != null && (
            <div className="flex items-center justify-between gap-2 bg-primary/10 border border-primary/20 rounded-lg px-3 py-1.5">
              <span className="text-[11px] text-primary font-semibold">Sua oferta global: {fmt(ofertaTotal)}</span>
              <button onClick={() => setOfertaTotal(null)} className="text-primary/70 hover:text-primary">
                <Undo2 className="h-3 w-3" />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {modoContraproposta ? "Total com suas ofertas" : "Total"}
              </p>
              <p className="text-lg font-bold text-foreground">{fmt(totalGeral)}</p>
              {modoContraproposta && (
                <p className="text-[10px] text-muted-foreground">sujeito a confirmação</p>
              )}
            </div>
            {modoContraproposta ? (
              <Button
                onClick={enviarContraproposta}
                disabled={totalGeral === 0}
                className="flex-1 max-w-[280px] gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground h-11 text-sm font-semibold"
              >
                <Send className="h-4 w-4" />Enviar contraproposta
              </Button>
            ) : (
              <Button
                onClick={() => aprovar("total")}
                disabled={totalGeral === 0}
                className="flex-1 max-w-[280px] gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white h-11 text-sm font-semibold"
              >
                <ShieldCheck className="h-4 w-4" />Aprovar ({fmt(totalGeral)})
              </Button>
            )}
          </div>

          <div className="flex items-center justify-center gap-3 text-[11px] flex-wrap">
            <button
              onClick={() => { setOfertaTotalValor(ofertaTotal ? String(ofertaTotal) : ""); setOfertaTotalAberta(true); }}
              className="inline-flex items-center gap-1 text-primary hover:text-primary/80 font-medium"
            >
              <HandCoins className="h-3 w-3" />Propor valor total
            </button>
            <span className="text-border">·</span>
            <button onClick={() => setSugerirOpen(true)} className="text-muted-foreground hover:text-foreground underline underline-offset-2">
              Sugerir alterações
            </button>
            <span className="text-border">·</span>
            <button onClick={() => setRecusarOpen(true)} className="text-muted-foreground hover:text-destructive underline underline-offset-2">
              Recusar
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      <Dialog open={!!lightboxImg} onOpenChange={(o) => !o && setLightboxImg(null)}>
        <DialogContent className="max-w-3xl p-0 bg-transparent border-0 shadow-none">
          <button onClick={() => setLightboxImg(null)} className="absolute top-2 right-2 h-9 w-9 rounded-full bg-black/60 text-white flex items-center justify-center z-10">
            <X className="h-4 w-4" />
          </button>
          {lightboxImg && <img src={lightboxImg} alt="" className="w-full h-auto rounded-lg" />}
        </DialogContent>
      </Dialog>

      {/* Contraproposta por item */}
      <Sheet open={!!ofertaItemAlvo} onOpenChange={(o) => !o && setOfertaItemAlvo(null)}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader className="text-left mb-3">
            <SheetTitle>Quanto você pagaria?</SheetTitle>
            {ofertaItemAlvo && (
              <p className="text-xs text-muted-foreground">
                {ofertaItemAlvo.nome} · atual: {fmt(ofertaItemAlvo.precoPeca)}/peça
                {modoPreco === "kit" && ` (${fmt(ofertaItemAlvo.precoPeca * ofertaItemAlvo.pecas)}/kit)`}
              </p>
            )}
          </SheetHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">
                Seu valor {modoPreco === "kit" ? "por kit" : "por peça"}
              </label>
              <Input
                type="number" inputMode="decimal" step="0.01"
                value={ofertaValor}
                onChange={(e) => setOfertaValor(e.target.value)}
                placeholder="0,00"
                className="mt-1 h-11 text-base"
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setOfertaItemAlvo(null)}>Cancelar</Button>
              <Button className="flex-1" onClick={salvarOfertaItem}>Salvar oferta</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Contraproposta total */}
      <Sheet open={ofertaTotalAberta} onOpenChange={setOfertaTotalAberta}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader className="text-left mb-3">
            <SheetTitle>Propor valor total</SheetTitle>
            <p className="text-xs text-muted-foreground">
              Ofereça um valor fechado para o pedido inteiro. Total atual: {fmt(totalGeral)}.
            </p>
          </SheetHeader>
          <div className="space-y-3">
            <Input
              type="number" inputMode="decimal" step="0.01"
              value={ofertaTotalValor}
              onChange={(e) => setOfertaTotalValor(e.target.value)}
              placeholder="Ex.: 5000,00"
              className="h-11 text-base"
              autoFocus
            />
            <p className="text-[11px] text-muted-foreground">
              A distribuição desse valor entre itens/indústrias fica com o {VENDEDOR.nome.split(" ")[0]} na resposta.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setOfertaTotalAberta(false)}>Cancelar</Button>
              <Button className="flex-1" onClick={salvarOfertaTotal}>Registrar oferta</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Mini-catálogo — Adicionar itens */}
      <Dialog open={!!addOpenMarca} onOpenChange={(o) => !o && setAddOpenMarca(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] p-0 flex flex-col overflow-hidden">
          <DialogHeader className="p-4 pb-3 border-b border-border shrink-0">
            <DialogTitle className="text-base">Adicionar itens · {addOpenMarca}</DialogTitle>
            <DialogDescription className="text-xs">
              Preços já com as condições da sua proposta.
            </DialogDescription>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, referência ou categoria…"
                value={addSearch}
                onChange={(e) => setAddSearch(e.target.value)}
                className="pl-9 h-10"
              />
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {catalogoAdd.map((p) => (
                <div key={p.id} className="bg-card border border-border rounded-xl overflow-hidden flex flex-col">
                  <div className="aspect-square bg-muted overflow-hidden">
                    <img src={p.image} alt={p.nome} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-2 flex-1 flex flex-col gap-1">
                    <p className="text-[11px] font-semibold text-foreground line-clamp-2 leading-tight">{p.nome}</p>
                    <p className="text-[10px] text-muted-foreground">Ref: {p.ref} · {p.pecas} peças</p>
                    <p className="text-xs font-bold text-primary mt-auto">{fmt(p.preco)}/peça</p>
                    <Button size="sm" className="h-7 text-[11px] mt-1" onClick={() => adicionarProdutoCatalogo(p)}>
                      <Plus className="h-3 w-3 mr-1" />Adicionar
                    </Button>
                  </div>
                </div>
              ))}
              {catalogoAdd.length === 0 && (
                <p className="col-span-full text-center text-sm text-muted-foreground py-8">Nenhum produto encontrado.</p>
              )}
            </div>
          </div>
          <DialogFooter className="p-3 border-t border-border shrink-0">
            <Button variant="outline" onClick={() => setAddOpenMarca(null)} className="w-full sm:w-auto">
              Concluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sugerir alterações */}
      <Dialog open={sugerirOpen} onOpenChange={setSugerirOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Sugerir alterações</DialogTitle>
            <DialogDescription className="text-xs">
              Ajuste quantidades ou remova itens acima e envie uma nota para o vendedor.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Ex.: prefiro trocar a bermuda 12-18 por mais camisetas 4-10; posso pagar em 30/60/90?"
            value={sugerirNota}
            onChange={(e) => setSugerirNota(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setSugerirOpen(false)}>Cancelar</Button>
            <Button onClick={enviarSugestao}>Enviar sugestão</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Recusar */}
      <Sheet open={recusarOpen} onOpenChange={setRecusarOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[80vh]">
          <SheetHeader className="text-left mb-4">
            <SheetTitle>Qual foi o motivo?</SheetTitle>
            <p className="text-xs text-muted-foreground">Ajuda o vendedor a voltar com uma proposta melhor.</p>
          </SheetHeader>
          <div className="space-y-2">
            {["Preço", "Prazo de pagamento", "Sortimento / mix", "Outro"].map(m => (
              <button
                key={m}
                onClick={() => setRecusarMotivo(m)}
                className={`w-full text-left px-4 py-3 rounded-xl border transition-colors ${
                  recusarMotivo === m ? "border-primary bg-primary/5 text-foreground font-medium" : "border-border hover:bg-muted"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          <div className="mt-6 flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => { setRecusarOpen(false); setRecusarMotivo(null); }}>
              Cancelar
            </Button>
            <Button className="flex-1" onClick={enviarRecusa} disabled={!recusarMotivo}>
              Enviar recusa
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
