import { useState, useMemo, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
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
  AlertTriangle, Clock, Truck, Percent, CalendarClock, ZoomIn,
  ArrowRight, ShieldCheck, X, Info,
} from "lucide-react";
import { mockOrcamentos, mockCatalogoProdutos, type Orcamento } from "@/data/mockVendedor";
import { toast } from "sonner";

// ─── Mock vendedor + condições por indústria ─────────────────────────
const VENDEDOR = {
  nome: "Alexandre Chiste",
  foto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face",
  whats: "5547999998888",
  cnpjRep: "12.345.678/0001-90",
  empresa: "Chiste Representações Ltda",
};

const CONDICOES_POR_MARCA: Record<string, { desconto: number; prazo: string; entrega: string; minimoFrete?: number; minimoDesconto?: number }> = {
  BRANDILI: { desconto: 32.5, prazo: "30/60/90 dias", entrega: "20/07/2026", minimoFrete: 1800, minimoDesconto: 15000 },
  MUNDI:    { desconto: 25.0, prazo: "à vista + 30", entrega: "25/07/2026", minimoFrete: 1500 },
  KYLY:     { desconto: 20.0, prazo: "30/60 dias", entrega: "05/08/2026", minimoFrete: 2000 },
  ALAKAZOO: { desconto: 18.0, prazo: "30/60/90 dias", entrega: "10/08/2026" },
  KAMYLUS:  { desconto: 22.0, prazo: "à vista", entrega: "22/07/2026" },
  POKOTINHA:{ desconto: 15.0, prazo: "30 dias", entrega: "28/07/2026" },
  "PERFECT BOYS": { desconto: 20.0, prazo: "30/60 dias", entrega: "30/07/2026" },
  HRRADINHOS: { desconto: 15.0, prazo: "à vista", entrega: "20/07/2026" },
};

// Gera itens fake para um orçamento a partir do mock de catálogo
function gerarItens(orc: Orcamento) {
  const marcas = orc.industriaValores?.length ? orc.industriaValores.map(i => i.marca) : orc.marcas;
  const items: Array<{
    id: string; marca: string; ref: string; nome: string; image: string;
    pecas: number; precoPeca: number; qtd: number; incluido: boolean;
  }> = [];
  marcas.forEach((m, mi) => {
    // Pega 2-3 produtos do catálogo (ou reusa) e força a marca
    const base = mockCatalogoProdutos.slice(mi * 2, mi * 2 + 3);
    base.forEach((p, i) => {
      items.push({
        id: `${orc.id}-${m}-${i}`,
        marca: m,
        ref: p.ref,
        nome: p.nome,
        image: p.image,
        pecas: p.pecas,
        precoPeca: p.preco,
        qtd: 1 + (i % 3),
        incluido: true,
      });
    });
  });
  return items;
}

const fmt = (v: number) => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

// Simula validade: 15 dias após a data
function calcularValidade(dataCriacao: string) {
  const [d, m, y] = dataCriacao.split("/").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + 15);
  const hoje = new Date();
  const diff = Math.ceil((dt.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
  return {
    dataFmt: dt.toLocaleDateString("pt-BR"),
    diasRestantes: diff,
    expirada: diff < 0,
  };
}

// ─── Página ───────────────────────────────────────────────────────────
export default function OrcamentoPublico() {
  const { id } = useParams<{ id: string }>();
  const orc = useMemo(() => mockOrcamentos.find(o => o.id === id) || mockOrcamentos[0], [id]);
  const validade = useMemo(() => calcularValidade(orc.dataCriacao), [orc]);
  const [itens, setItens] = useState(() => gerarItens(orc));
  const [resumoAberto, setResumoAberto] = useState(false);
  const [colapsadas, setColapsadas] = useState<Set<string>>(new Set());
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [confirmacao, setConfirmacao] = useState<{ tipo: "total" | "marca"; marca?: string; valor: number } | null>(null);
  const [sugerirOpen, setSugerirOpen] = useState(false);
  const [sugerirNota, setSugerirNota] = useState("");
  const [recusarOpen, setRecusarOpen] = useState(false);
  const [recusarMotivo, setRecusarMotivo] = useState<string | null>(null);
  const [aprovado, setAprovado] = useState(false);

  // scroll ao topo ao abrir
  useEffect(() => { window.scrollTo(0, 0); }, [id]);

  const marcas = useMemo(() => Array.from(new Set(itens.map(i => i.marca))), [itens]);

  const totalPorMarca = (marca: string) =>
    itens.filter(i => i.marca === marca && i.incluido)
         .reduce((acc, i) => acc + i.precoPeca * i.pecas * i.qtd, 0);

  const pecasPorMarca = (marca: string) =>
    itens.filter(i => i.marca === marca && i.incluido)
         .reduce((acc, i) => acc + i.pecas * i.qtd, 0);

  const itensAtivos = itens.filter(i => i.incluido);
  const totalGeral = marcas.reduce((acc, m) => acc + totalPorMarca(m), 0);
  const pecasTotal = itensAtivos.reduce((acc, i) => acc + i.pecas * i.qtd, 0);

  // Impactos de política em linguagem do lojista
  const alertasPorMarca = (marca: string): string[] => {
    const cond = CONDICOES_POR_MARCA[marca];
    if (!cond) return [];
    const total = totalPorMarca(marca);
    const alertas: string[] = [];
    if (cond.minimoFrete && total > 0 && total < cond.minimoFrete) {
      alertas.push(`Abaixo de ${fmt(cond.minimoFrete)} o frete deixa de ser grátis (faltam ${fmt(cond.minimoFrete - total)})`);
    }
    if (cond.minimoDesconto && total > 0 && total < cond.minimoDesconto) {
      alertas.push(`Abaixo de ${fmt(cond.minimoDesconto)} o pedido perde o desconto de ${cond.desconto}%`);
    }
    return alertas;
  };

  const toggleColapsada = (m: string) => {
    setColapsadas(prev => {
      const n = new Set(prev);
      if (n.has(m)) n.delete(m); else n.add(m);
      return n;
    });
  };

  const updateQtd = (itemId: string, delta: number) => {
    setItens(prev => prev.map(i => i.id === itemId ? { ...i, qtd: Math.max(1, i.qtd + delta) } : i));
  };

  const toggleIncluido = (itemId: string) => {
    setItens(prev => prev.map(i => i.id === itemId ? { ...i, incluido: !i.incluido } : i));
  };

  const aprovar = (tipo: "total" | "marca", marca?: string) => {
    const valor = tipo === "total" ? totalGeral : totalPorMarca(marca!);
    setConfirmacao({ tipo, marca, valor });
    setAprovado(true);
  };

  const enviarSugestao = () => {
    toast.success("Alterações enviadas ao vendedor — status: Em revisão");
    setSugerirOpen(false);
    setSugerirNota("");
  };

  const enviarRecusa = () => {
    if (!recusarMotivo) return;
    toast.success(`Recusa registrada (motivo: ${recusarMotivo})`);
    setRecusarOpen(false);
    setRecusarMotivo(null);
  };

  const whatsUrl = `https://wa.me/${VENDEDOR.whats}?text=${encodeURIComponent(`Olá ${VENDEDOR.nome}, sobre a proposta ${orc.id}...`)}`;

  // ─── EXPIRADO ──────────────────────────────────────────────────
  if (validade.expirada) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-card rounded-2xl border border-border p-8 text-center space-y-4">
          <div className="h-14 w-14 rounded-full bg-destructive/10 text-destructive mx-auto flex items-center justify-center">
            <Clock className="h-7 w-7" />
          </div>
          <h1 className="text-lg font-bold text-foreground">Proposta expirada</h1>
          <p className="text-sm text-muted-foreground">
            Esta proposta venceu em {validade.dataFmt}. Peça uma nova ao {VENDEDOR.nome} para condições atualizadas.
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

  // ─── CONFIRMAÇÃO ───────────────────────────────────────────────
  if (aprovado && confirmacao) {
    return (
      <div className="min-h-screen bg-muted/30 pb-24">
        <div className="max-w-lg mx-auto p-6 space-y-5">
          <div className="bg-card rounded-2xl border border-border p-6 text-center space-y-3">
            <div className="h-14 w-14 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h1 className="text-xl font-bold text-foreground font-heading">Pedido aprovado ✓</h1>
            <p className="text-sm text-muted-foreground">
              {confirmacao.tipo === "total"
                ? `Você aprovou a proposta completa (${fmt(confirmacao.valor)}).`
                : `Você aprovou ${confirmacao.marca} (${fmt(confirmacao.valor)}) — as outras indústrias seguem separadas.`}
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
            <p className="text-xs text-foreground">
              Salve este link — ele vira o acompanhamento do seu pedido.
            </p>
          </div>

          <a href={whatsUrl} target="_blank" rel="noreferrer">
            <Button variant="outline" className="w-full gap-2">
              <MessageCircle className="h-4 w-4" />Falar com {VENDEDOR.nome.split(" ")[0]}
            </Button>
          </a>

          <button
            onClick={() => setAprovado(false)}
            className="w-full text-xs text-muted-foreground hover:text-foreground"
          >
            Ver proposta novamente
          </button>
        </div>
      </div>
    );
  }

  // ─── PROPOSTA ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-muted/20 pb-40">
      {/* Header proposta */}
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
                <MessageCircle className="h-3.5 w-3.5" />
                <span className="hidden xs:inline">Falar no </span>Whats
              </Button>
            </a>
          </div>

          {/* Resumo simples */}
          <div className="bg-muted/50 rounded-xl p-3 mt-2">
            <div className="flex items-baseline justify-between gap-2">
              <div>
                <p className="text-[11px] text-muted-foreground">Seu pedido</p>
                <p className="text-base font-semibold text-foreground">
                  {itensAtivos.length} itens · {pecasTotal} peças
                </p>
              </div>
              <p className="text-xl font-bold text-primary">{fmt(totalGeral)}</p>
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
                  const pecas = itensAtivos.map(i => i.precoPeca);
                  const min = pecas.length ? Math.min(...pecas) : 0;
                  const max = pecas.length ? Math.max(...pecas) : 0;
                  const med = pecas.length ? pecas.reduce((a, b) => a + b, 0) / pecas.length : 0;
                  return (
                    <>
                      <div>
                        <p className="text-[10px] text-muted-foreground">mín/peça</p>
                        <p className="text-xs font-semibold">{fmt(min)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground">médio/peça</p>
                        <p className="text-xs font-semibold">{fmt(med)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground">máx/peça</p>
                        <p className="text-xs font-semibold">{fmt(max)}</p>
                      </div>
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
          const alertas = alertasPorMarca(marca);
          const fechada = colapsadas.has(marca);
          return (
            <section key={marca} className="bg-card rounded-2xl border border-border overflow-hidden">
              {/* Header indústria */}
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

                  {/* Alertas */}
                  {alertas.map((a, i) => (
                    <div key={i} className="px-4 py-2 bg-orange-500/10 border-b border-orange-500/20 flex gap-2 items-start">
                      <AlertTriangle className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
                      <p className="text-[12px] text-foreground leading-snug">{a}</p>
                    </div>
                  ))}

                  {/* Itens */}
                  <ul className="divide-y divide-border">
                    {marcaItens.map((item) => (
                      <li key={item.id} className={`p-3 flex gap-3 ${!item.incluido ? "opacity-50" : ""}`}>
                        <button
                          onClick={() => setLightboxImg(item.image)}
                          className="relative shrink-0 h-24 w-24 sm:h-28 sm:w-28 rounded-xl overflow-hidden bg-muted group"
                        >
                          <img src={item.image} alt={item.nome} className="w-full h-full object-cover" />
                          <span className="absolute bottom-1 right-1 bg-black/60 text-white h-6 w-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <ZoomIn className="h-3 w-3" />
                          </span>
                        </button>
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-foreground leading-tight">{item.nome}</p>
                              <p className="text-[11px] text-muted-foreground">Ref: {item.ref}</p>
                            </div>
                            <Switch
                              checked={item.incluido}
                              onCheckedChange={() => toggleIncluido(item.id)}
                              className="shrink-0"
                            />
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            Kit · {item.pecas} peças · {fmt(item.precoPeca)}/peça
                          </p>
                          <div className="flex items-center justify-between pt-1">
                            <div className="inline-flex items-center border border-border rounded-lg overflow-hidden">
                              <button
                                onClick={() => updateQtd(item.id, -1)}
                                disabled={!item.incluido || item.qtd <= 1}
                                className="h-8 w-8 flex items-center justify-center hover:bg-muted disabled:opacity-40"
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="w-9 text-center text-sm font-semibold">{item.qtd}</span>
                              <button
                                onClick={() => updateQtd(item.id, 1)}
                                disabled={!item.incluido}
                                className="h-8 w-8 flex items-center justify-center hover:bg-muted disabled:opacity-40"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <p className="text-sm font-bold text-foreground">
                              {fmt(item.precoPeca * item.pecas * item.qtd)}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>

                  {/* Aprovar indústria */}
                  {marcas.length > 1 && subtotal > 0 && (
                    <div className="p-3 bg-muted/30 border-t border-border">
                      <Button
                        onClick={() => aprovar("marca", marca)}
                        variant="outline"
                        className="w-full gap-1.5 border-primary/40 text-primary hover:bg-primary/10"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Aprovar {marca} ({fmt(subtotal)})
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
          <p className="text-[11px] text-muted-foreground">
            {VENDEDOR.empresa} · CNPJ {VENDEDOR.cnpjRep}
          </p>
          <p className="text-[10px] text-muted-foreground">
            powered by <span className="font-semibold text-foreground">Nextil</span>
          </p>
        </footer>
      </main>

      {/* Sticky footer */}
      <div className="fixed bottom-0 inset-x-0 bg-card border-t border-border shadow-2xl z-40">
        <div className="max-w-2xl mx-auto p-3 space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total</p>
              <p className="text-lg font-bold text-foreground">{fmt(totalGeral)}</p>
            </div>
            <Button
              onClick={() => aprovar("total")}
              disabled={totalGeral === 0}
              className="flex-1 max-w-[280px] gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white h-11 text-sm font-semibold"
            >
              <ShieldCheck className="h-4 w-4" />
              Aprovar pedido ({fmt(totalGeral)})
            </Button>
          </div>
          <div className="flex items-center justify-center gap-4 text-[11px]">
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
          {lightboxImg && (
            <img src={lightboxImg} alt="" className="w-full h-auto rounded-lg" />
          )}
        </DialogContent>
      </Dialog>

      {/* Sugerir alterações */}
      <Dialog open={sugerirOpen} onOpenChange={setSugerirOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Sugerir alterações</DialogTitle>
            <DialogDescription className="text-xs">
              Ajuste quantidades ou remova itens acima e envie uma nota para o vendedor. Cada alteração fica registrada para ele.
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
                  recusarMotivo === m
                    ? "border-primary bg-primary/5 text-foreground font-medium"
                    : "border-border hover:bg-muted"
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
