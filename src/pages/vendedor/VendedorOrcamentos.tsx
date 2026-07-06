import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Plus, Search, LayoutGrid, List as ListIcon, Send, MessageCircle,
  GitCompare, GitBranch, AlertTriangle, CheckCircle2, Clock, Zap,
  Package, ArrowRight, Eye, User as UserIcon, Factory, Store, Shield,
  ExternalLink, ChevronDown, ChevronRight,
} from "lucide-react";
import { mockOrcamentos, nomeAuto, type Orcamento, type OrcEtapa, type BolaCom } from "@/data/mockVendedor";
import { toast } from "sonner";

// ─── Configuração das colunas ─────────────────────────────────────────
const COLUNAS: { key: OrcEtapa; label: string; recolhida?: boolean; accent?: string }[] = [
  { key: "rascunho", label: "Rascunho" },
  { key: "aguardando_lojista", label: "Aguardando lojista" },
  { key: "em_revisao", label: "Em revisão" },
  
  { key: "analise_comercial", label: "Análise comercial" },
  { key: "virou_pedido", label: "Virou pedido", accent: "bg-emerald-500/10 border-emerald-500/30" },
  { key: "recusado", label: "Recusado", recolhida: true },
];

const bolaMeta: Record<BolaCom, { label: string; icon: React.ElementType; cls: string }> = {
  vendedor:  { label: "Com você",     icon: UserIcon, cls: "bg-primary/10 text-primary" },
  lojista:   { label: "Com lojista",  icon: Store,    cls: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  comercial: { label: "Com comercial", icon: Shield,   cls: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  industria: { label: "Com indústria", icon: Factory,  cls: "bg-purple-500/10 text-purple-600 dark:text-purple-400" },
};

function subestadoBadge(o: Orcamento) {
  const t = o.linkEventoTipo;
  if (!t) return null;
  const base = "text-[10px] px-1.5 py-0.5 rounded font-medium inline-flex items-center gap-1";
  if (t === "nao_aberto")
    return <span className={`${base} bg-orange-500/15 text-orange-600 dark:text-orange-400`}><AlertTriangle className="h-2.5 w-2.5" />{o.linkEventoLabel}</span>;
  if (t === "editando")
    return <span className={`${base} bg-blue-500/15 text-blue-600 dark:text-blue-400`}><span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />{o.linkEventoLabel}</span>;
  if (t === "visualizado")
    return <span className={`${base} bg-muted text-muted-foreground`}><Eye className="h-2.5 w-2.5" />{o.linkEventoLabel}</span>;
  if (t === "aprovado_total")
    return <span className={`${base} bg-emerald-500/15 text-emerald-600 dark:text-emerald-400`}><CheckCircle2 className="h-2.5 w-2.5" />{o.linkEventoLabel}</span>;
  if (t === "aprovado_parcial")
    return <span className={`${base} bg-amber-500/15 text-amber-600 dark:text-amber-400`}>◐ {o.linkEventoLabel}</span>;
  if (t === "recusado")
    return <span className={`${base} bg-destructive/15 text-destructive`}>{o.linkEventoLabel}</span>;
  return null;
}

// Determina ação contextual de 1 clique baseado no estado
function acaoContextual(o: Orcamento): { label: string; icon: React.ElementType; kind: string } | null {
  if (o.etapa === "aguardando_lojista" && o.linkEventoTipo === "nao_aberto")
    return { label: "Reenviar no Whats", icon: Send, kind: "reenviar" };
  if (o.etapa === "aguardando_lojista" && o.linkEventoTipo === "visualizado")
    return { label: "Cobrar no Whats", icon: MessageCircle, kind: "cobrar" };
  if (o.etapa === "aguardando_lojista" && o.linkEventoTipo === "aprovado_parcial")
    return { label: "Renegociar no Whats", icon: MessageCircle, kind: "renegociar" };
  if (o.etapa === "em_revisao")
    return { label: "Ver alterações", icon: GitCompare, kind: "diff" };
  if (o.etapa === "virou_pedido" && o.pedidoNumero)
    return { label: `Pedido ${o.pedidoNumero}`, icon: ExternalLink, kind: "pedido" };
  if (o.etapa === "rascunho")
    return { label: "Continuar & enviar", icon: ArrowRight, kind: "continuar" };
  return null;
}

const fmt = (v: number | null | undefined) =>
  v == null ? "—" : `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

// ─── Card ──────────────────────────────────────────────────────────────
function OrcCard({
  o, filhosCount = 0, onOpen, onDiff, onDesdobramento, onAction, onPedido,
}: {
  o: Orcamento;
  filhosCount?: number;
  onOpen: () => void;
  onDiff: () => void;
  onDesdobramento: () => void;
  onAction: (kind: string, o: Orcamento) => void;
  onPedido: () => void;
}) {
  const atrasado = (o.tempoEtapaDias ?? 0) > (o.limiteEtapaDias ?? 999);
  const acao = acaoContextual(o);
  const Bola = o.bola ? bolaMeta[o.bola] : null;
  const isPaiComFilhos = filhosCount > 0;

  return (
    <div
      onClick={onOpen}
      className={`group bg-card rounded-lg border p-3 cursor-pointer hover:shadow-md transition-all space-y-2 ${
        atrasado ? "border-orange-500/50 ring-1 ring-orange-500/20" : "border-border"
      }`}
    >
      {/* Vínculo desdobramento (filho → pai OU pai → filhos) */}
      {o.desdobradoDeId && (
        <button
          onClick={(e) => { e.stopPropagation(); onDesdobramento(); }}
          className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors"
        >
          <GitBranch className="h-2.5 w-2.5" />
          <span className="truncate">{o.desdobradoDeLabel}</span>
        </button>
      )}
      {isPaiComFilhos && (
        <button
          onClick={(e) => { e.stopPropagation(); onDesdobramento(); }}
          className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline"
        >
          <GitBranch className="h-2.5 w-2.5" />
          <span className="truncate">
            {filhosCount} {filhosCount === 1 ? "pedido desdobrado" : "pedidos desdobrados"} → Análise comercial
          </span>
        </button>
      )}


      {/* Header: cliente + valor */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{o.lojista || "Sem cliente"}</p>
          <p className="text-[11px] text-muted-foreground">
            {o.itensCount ?? 0} itens · {fmt(o.valorTotal)}
          </p>
        </div>
        {o.aprovacaoDireta && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge className="shrink-0 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border-0 text-[10px] gap-1">
                <Zap className="h-2.5 w-2.5" />Direto
              </Badge>
            </TooltipTrigger>
            <TooltipContent>Aprovação direta (fast-track)</TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* Chips indústrias c/ tooltip valor */}
      {o.industriaValores && o.industriaValores.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {o.industriaValores.map((iv) => (
            <Tooltip key={iv.marca}>
              <TooltipTrigger asChild>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                    iv.aprovada === true ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" :
                    iv.aprovada === false ? "bg-destructive/15 text-destructive line-through" :
                    "bg-muted text-muted-foreground"
                  }`}
                >
                  {iv.marca}
                </span>
              </TooltipTrigger>
              <TooltipContent>{iv.marca}: {fmt(iv.valor)}</TooltipContent>
            </Tooltip>
          ))}
        </div>
      )}

      {/* Subestado do link */}
      {subestadoBadge(o) && <div>{subestadoBadge(o)}</div>}

      {/* Motivo análise comercial */}
      {o.motivoAnalise && (
        <p className="text-[11px] text-muted-foreground leading-snug border-l-2 border-border pl-2">
          {o.motivoAnalise}
        </p>
      )}

      {/* Footer: bola + tempo + ação */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-2 min-w-0">
          {Bola && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className={`h-5 w-5 rounded-full flex items-center justify-center ${Bola.cls}`}>
                  <Bola.icon className="h-3 w-3" />
                </span>
              </TooltipTrigger>
              <TooltipContent>{Bola.label}</TooltipContent>
            </Tooltip>
          )}
          <span className={`text-[10px] inline-flex items-center gap-1 ${atrasado ? "text-orange-600 dark:text-orange-400 font-semibold" : "text-muted-foreground"}`}>
            <Clock className="h-2.5 w-2.5" />
            {atrasado ? `parado há ${o.tempoEtapaDias}d` : `${o.tempoEtapaDias ?? 0}d na etapa`}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {isPaiComFilhos && acao?.kind !== "desdobramento" && (
            <button
              onClick={(e) => { e.stopPropagation(); onDesdobramento(); }}
              title="Ver desdobramento"
              className="text-[10px] font-medium h-6 w-6 rounded bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/70 inline-flex items-center justify-center"
            >
              <GitBranch className="h-3 w-3" />
            </button>
          )}
          {acao && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (acao.kind === "diff") onDiff();
                else if (acao.kind === "desdobramento") onDesdobramento();
                else if (acao.kind === "pedido") onPedido();
                else onAction(acao.kind, o);
              }}
              className="text-[10px] font-medium px-2 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors inline-flex items-center gap-1"
            >
              <acao.icon className="h-2.5 w-2.5" />
              <span className="truncate max-w-[110px]">{acao.label}</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

// ─── Página ────────────────────────────────────────────────────────────
export default function VendedorOrcamentos() {
  const navigate = useNavigate();
  const [orcs, setOrcs] = useState<Orcamento[]>(mockOrcamentos);
  const [view, setView] = useState<"kanban" | "lista">("kanban");
  const [search, setSearch] = useState("");
  const [chipEtapa, setChipEtapa] = useState<OrcEtapa | "todos">("todos");
  const [recusadoAberto, setRecusadoAberto] = useState(false);

  const [diffOrc, setDiffOrc] = useState<Orcamento | null>(null);
  const [desdobrOrc, setDesdobrOrc] = useState<Orcamento | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return orcs.filter((o) => {
      if (!q) return true;
      return (
        (o.lojista || "").toLowerCase().includes(q) ||
        o.marcas.some((m) => m.toLowerCase().includes(q)) ||
        (o.pedidoNumero || "").toLowerCase().includes(q)
      );
    });
  }, [orcs, search]);

  const porEtapa = useMemo(() => {
    const m = new Map<OrcEtapa, Orcamento[]>();
    COLUNAS.forEach((c) => m.set(c.key, []));
    filtered.forEach((o) => {
      const e = o.etapa || "rascunho";
      if (!m.has(e)) m.set(e, []);
      m.get(e)!.push(o);
    });
    return m;
  }, [filtered]);

  const listaFiltrada = useMemo(() => {
    if (chipEtapa === "todos") return filtered;
    return filtered.filter((o) => (o.etapa || "rascunho") === chipEtapa);
  }, [filtered, chipEtapa]);

  const handleAction = (kind: string, o: Orcamento) => {
    if (kind === "reenviar") toast.success(`Mensagem pronta enviada para ${o.lojista} 📲`);
    else if (kind === "cobrar") toast.success(`Cobrança enviada no WhatsApp para ${o.lojista}`);
    else if (kind === "continuar") navigate(`/vendedor/orcamento/${o.id}`);
  };

  const irParaPedido = (o: Orcamento) => {
    toast.info(`Abrindo Pedido ${o.pedidoNumero}…`);
    navigate("/vendedor/360/pedidos");
  };

  const abrirDesdobramento = (o: Orcamento) => {
    // Se for desdobrado, mostrar pai + irmãos; se for pai, mostrar filhos
    const paiId = o.desdobradoDeId || o.id;
    setDesdobrOrc(orcs.find((x) => x.id === paiId) || o);
  };

  const desdobrados = (paiId: string) => orcs.filter((x) => x.desdobradoDeId === paiId);

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground font-heading">Orçamentos</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Pipeline de negociação · eventos ao vivo do link digital</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex bg-muted rounded-lg p-0.5">
            <button
              onClick={() => setView("kanban")}
              className={`h-8 px-3 rounded-md text-xs font-medium inline-flex items-center gap-1.5 transition-colors ${
                view === "kanban" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />Kanban
            </button>
            <button
              onClick={() => setView("lista")}
              className={`h-8 px-3 rounded-md text-xs font-medium inline-flex items-center gap-1.5 transition-colors ${
                view === "lista" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              <ListIcon className="h-3.5 w-3.5" />Lista
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cliente, marca, pedido…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 w-[220px] text-sm"
            />
          </div>
          <Button
            onClick={() => navigate("/vendedor/novo-orcamento")}
            className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground h-9"
          >
            <Plus className="h-4 w-4" />Novo
          </Button>
        </div>
      </div>

      {/* Lista: chips de etapa */}
      {view === "lista" && (
        <div className="flex flex-wrap gap-1.5">
          {[{ key: "todos" as const, label: "Todas" }, ...COLUNAS.map((c) => ({ key: c.key, label: c.label }))].map((c) => (
            <button
              key={c.key}
              onClick={() => setChipEtapa(c.key as OrcEtapa | "todos")}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                chipEtapa === c.key
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:text-foreground"
              }`}
            >
              {c.label}
              <span className="ml-1.5 opacity-70">
                ({c.key === "todos" ? filtered.length : (porEtapa.get(c.key as OrcEtapa)?.length ?? 0)})
              </span>
            </button>
          ))}
        </div>
      )}

      {/* KANBAN */}
      {view === "kanban" && (
        <div className="flex gap-3 overflow-x-auto snap-x pb-3 -mx-4 md:-mx-6 px-4 md:px-6">
          {COLUNAS.filter((c) => !c.recolhida).map((c) => {
            const items = porEtapa.get(c.key) || [];
            const total = items.reduce((acc, i) => acc + (i.valorTotal ?? 0), 0);
            return (
              <div key={c.key} className="w-[300px] shrink-0 snap-start">
                <div className={`rounded-xl border ${c.accent || "bg-muted/40 border-border"} h-full flex flex-col`}>
                  <div className="px-3 py-2.5 border-b border-border flex items-center justify-between shrink-0">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground uppercase tracking-wide">{c.label}</p>
                      <p className="text-[10px] text-muted-foreground">{items.length} · {fmt(total)}</p>
                    </div>
                    <Badge variant="secondary" className="text-[10px]">{items.length}</Badge>
                  </div>
                  <div className="p-2 space-y-2 overflow-y-auto max-h-[calc(100vh-260px)]">
                    {items.length === 0 ? (
                      <p className="text-[11px] text-muted-foreground text-center py-8">Sem orçamentos</p>
                    ) : (
                      items.map((o) => (
                        <OrcCard
                          key={o.id}
                          o={o}
                          onOpen={() => navigate(`/vendedor/orcamento/${o.id}`)}
                          onDiff={() => setDiffOrc(o)}
                          onDesdobramento={() => abrirDesdobramento(o)}
                          onAction={handleAction}
                          onPedido={() => irParaPedido(o)}
                        />
                      ))
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Recusado — coluna recolhida à direita */}
          {(() => {
            const items = porEtapa.get("recusado") || [];
            return (
              <div className={`shrink-0 snap-start ${recusadoAberto ? "w-[300px]" : "w-[52px]"} transition-all`}>
                <div className="rounded-xl border border-border bg-muted/20 h-full flex flex-col">
                  <button
                    onClick={() => setRecusadoAberto((v) => !v)}
                    className="px-2 py-2.5 border-b border-border flex items-center gap-2 hover:bg-muted/40 transition-colors"
                  >
                    {recusadoAberto ? <ChevronRight className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground rotate-[-90deg]" />}
                    {recusadoAberto ? (
                      <>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex-1 text-left">Recusado</p>
                        <Badge variant="secondary" className="text-[10px]">{items.length}</Badge>
                      </>
                    ) : (
                      <span className="text-[10px] text-muted-foreground [writing-mode:vertical-lr] rotate-180 py-2 uppercase tracking-wider">
                        Recusado · {items.length}
                      </span>
                    )}
                  </button>
                  {recusadoAberto && (
                    <div className="p-2 space-y-2 overflow-y-auto max-h-[calc(100vh-260px)]">
                      {items.map((o) => (
                        <OrcCard
                          key={o.id} o={o}
                          onOpen={() => navigate(`/vendedor/orcamento/${o.id}`)}
                          onDiff={() => setDiffOrc(o)}
                          onDesdobramento={() => abrirDesdobramento(o)}
                          onAction={handleAction}
                          onPedido={() => irParaPedido(o)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* LISTA */}
      {view === "lista" && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 font-semibold text-foreground">Cliente / Nome</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Indústrias</th>
                <th className="text-right px-4 py-3 font-semibold text-foreground">Valor</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Etapa</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Subestado do link</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Tempo</th>
                <th className="text-right px-4 py-3 font-semibold text-foreground">Ação</th>
              </tr>
            </thead>
            <tbody>
              {listaFiltrada.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-16 text-center text-muted-foreground">Nenhum orçamento</td></tr>
              ) : listaFiltrada.map((o) => {
                const atrasado = (o.tempoEtapaDias ?? 0) > (o.limiteEtapaDias ?? 999);
                const acao = acaoContextual(o);
                return (
                  <tr
                    key={o.id}
                    onClick={() => navigate(`/vendedor/orcamento/${o.id}`)}
                    className="border-b border-border last:border-0 hover:bg-muted/40 cursor-pointer"
                  >
                    <td className="px-4 py-3">
                      <p className="font-semibold text-foreground">{o.lojista || "Sem cliente"}</p>
                      <p className="text-[11px] text-muted-foreground">{nomeAuto(o)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(o.industriaValores || []).map((iv) => (
                          <span key={iv.marca} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{iv.marca}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">{fmt(o.valorTotal)}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-[10px]">
                        {COLUNAS.find((c) => c.key === o.etapa)?.label || "—"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">{subestadoBadge(o) || <span className="text-muted-foreground text-xs">—</span>}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs inline-flex items-center gap-1 ${atrasado ? "text-orange-600 dark:text-orange-400 font-medium" : "text-muted-foreground"}`}>
                        <Clock className="h-3 w-3" />
                        {atrasado ? `parado há ${o.tempoEtapaDias}d` : `${o.tempoEtapaDias ?? 0}d`}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {acao && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (acao.kind === "diff") setDiffOrc(o);
                            else if (acao.kind === "desdobramento") abrirDesdobramento(o);
                            else if (acao.kind === "pedido") irParaPedido(o);
                            else handleAction(acao.kind, o);
                          }}
                          className="text-[11px] font-medium px-2 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 inline-flex items-center gap-1"
                        >
                          <acao.icon className="h-3 w-3" />{acao.label}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ─── DIFF MODAL ────────────────────────────────────────────── */}
      <Dialog open={!!diffOrc} onOpenChange={(o) => !o && setDiffOrc(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-4 shrink-0 border-b border-border">
            <DialogTitle className="flex items-center gap-2">
              <GitCompare className="h-4 w-4" />
              Alterações do lojista — {diffOrc?.lojista}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {diffOrc?.politicaVigenteEnvio && (
                <>Validado contra: <strong>{diffOrc.politicaVigenteEnvio}</strong> · política nova não retroage.</>
              )}
            </DialogDescription>
          </DialogHeader>

          {diffOrc?.diff && (
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {diffOrc.diff.impactoPolitica && (
                <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 flex gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive font-medium">{diffOrc.diff.impactoPolitica}</p>
                </div>
              )}

              {diffOrc.diff.itensRemovidos.length > 0 && (
                <section>
                  <h4 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">Removidos</h4>
                  <div className="space-y-1">
                    {diffOrc.diff.itensRemovidos.map((i, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm bg-destructive/5 rounded px-3 py-2">
                        <span className="line-through text-muted-foreground">{i.nome}</span>
                        <span className="line-through text-destructive text-xs">{i.qtd}x · {fmt(i.valor)}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {diffOrc.diff.itensAlterados.length > 0 && (
                <section>
                  <h4 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">Quantidades alteradas</h4>
                  <div className="space-y-1">
                    {diffOrc.diff.itensAlterados.map((i, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm bg-amber-500/5 rounded px-3 py-2">
                        <span className="text-foreground">{i.nome}</span>
                        <span className="text-xs">
                          <span className="text-muted-foreground line-through">{i.deQtd}</span>
                          {" → "}
                          <strong className="text-amber-600 dark:text-amber-400">{i.paraQtd}</strong>
                          <span className="ml-2 text-muted-foreground">{fmt(i.deValor)} → <strong className="text-foreground">{fmt(i.paraValor)}</strong></span>
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section className="bg-muted/50 rounded-lg p-4 flex items-center justify-between">
                <span className="text-sm font-medium">Efeito no total</span>
                <span className="text-sm">
                  <span className="text-muted-foreground line-through">{fmt(diffOrc.diff.totalAntes)}</span>
                  {" → "}
                  <strong className="text-foreground">{fmt(diffOrc.diff.totalDepois)}</strong>
                </span>
              </section>
            </div>
          )}

          <DialogFooter className="p-4 border-t border-border shrink-0 flex gap-2 sm:justify-end">
            <Button variant="outline" onClick={() => { toast.info("Cesta reaberta no catálogo"); setDiffOrc(null); }}>
              Propor ajuste
            </Button>
            <Button onClick={() => { toast.success("Alterações aceitas — orçamento avançou"); setDiffOrc(null); }}>
              Aceitar alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── DESDOBRAMENTO MODAL ─────────────────────────────────── */}
      <Dialog open={!!desdobrOrc} onOpenChange={(o) => !o && setDesdobrOrc(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-4 shrink-0 border-b border-border">
            <DialogTitle className="flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              Desdobramento — {desdobrOrc?.lojista}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Aprovação parcial: cada indústria segue de forma independente.
            </DialogDescription>
          </DialogHeader>

          {desdobrOrc && (
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Origem */}
              <div className="bg-muted/40 rounded-lg p-3 border border-border">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold mb-1">Origem</p>
                <p className="text-sm font-semibold">{nomeAuto(desdobrOrc)}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {(desdobrOrc.industriaValores || []).map((iv) => (
                    <span key={iv.marca} className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                      iv.aprovada === true ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" :
                      iv.aprovada === false ? "bg-destructive/15 text-destructive" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {iv.marca} · {fmt(iv.valor)}
                    </span>
                  ))}
                </div>
              </div>

              {/* Filhos */}
              <div>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold mb-2">
                  Cards desdobrados
                </p>
                <div className="space-y-2">
                  {desdobrados(desdobrOrc.id).map((f) => (
                    <button
                      key={f.id}
                      onClick={() => { setDesdobrOrc(null); navigate(`/vendedor/orcamento/${f.id}`); }}
                      className="w-full text-left bg-card border border-border rounded-lg p-3 hover:border-primary transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate">{f.lojista} · {f.marcas.join(", ")} · {fmt(f.valorTotal)}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {COLUNAS.find((c) => c.key === f.etapa)?.label}
                            {f.pedidoNumero && <> · <span className="text-emerald-600 dark:text-emerald-400 font-medium">{f.pedidoNumero}</span></>}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      </div>
                    </button>
                  ))}
                  {desdobrados(desdobrOrc.id).length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">Sem desdobramentos ainda</p>
                  )}
                </div>
              </div>

              {/* Remanescente */}
              {(desdobrOrc.industriaValores || []).some((i) => i.aprovada === false) && (
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Package className="h-4 w-4 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">Itens pendentes / recusados permanecem neste card</p>
                      <p className="text-[11px] text-muted-foreground">
                        Renegocie diretamente com o lojista para não perder a venda.
                      </p>
                    </div>
                    <Button size="sm" variant="outline" className="shrink-0"
                      onClick={() => { toast.success(`Cobrança enviada no WhatsApp para ${desdobrOrc.lojista}`); }}>
                      <MessageCircle className="h-3.5 w-3.5 mr-1" />Renegociar no Whats
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
