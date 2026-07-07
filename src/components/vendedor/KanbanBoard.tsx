import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OportunidadeBadges } from "./OportunidadeBadges";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { GripVertical, User, Zap, AlertTriangle, MessageCircle, ShoppingBag, Reply, FileText, RotateCcw, PackageCheck } from "lucide-react";
import {
  mockOportunidades,
  etapasCanonicas,
  etapaToCanonica,
  canonicaToBase,
  motivosPerda,
  type EtapaCanonica,
  type Oportunidade,
} from "@/data/mockCRM";
import { mockOrcamentos } from "@/data/mockVendedor";
import { useAutomacoes } from "@/contexts/AutomacoesContext";
import { AplicarAutomacaoModal } from "./AplicarAutomacaoModal";
import { toast } from "sonner";
import type { Automacao } from "@/data/mockAutomacoes";

interface KanbanBoardProps {
  searchQuery?: string;
  filterTags?: string[];
  filterPrioridade?: string;
}

const orcStatusChip: Record<string, { label: string; cls: string }> = {
  ativo: { label: "rascunho", cls: "bg-slate-100 text-slate-600 border-slate-200" },
  revisao_lojista: { label: "visualizado", cls: "bg-blue-100 text-blue-700 border-blue-200" },
  revisao_comercial: { label: "contraproposta", cls: "bg-amber-100 text-amber-700 border-amber-200" },
  aprovado_parcial: { label: "aprov. parcial", cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  aprovado: { label: "aprovado", cls: "bg-green-100 text-green-700 border-green-200" },
  recusado: { label: "recusado", cls: "bg-red-100 text-red-700 border-red-200" },
};

function idadeLabel(dias: number): string {
  if (dias <= 0) return "hoje";
  if (dias === 1) return "há 1d";
  return `há ${dias}d`;
}

function acaoContextual(op: Oportunidade, canon: EtapaCanonica) {
  if (canon === "ganha") return { label: "Abrir pedido", icon: PackageCheck, kind: "pedido" as const };
  if (canon === "perdida") return { label: "Reabrir demanda", icon: RotateCcw, kind: "reabrir" as const };

  const orcs = mockOrcamentos.filter(o => op.orcamentoIds.includes(o.id));
  if (canon === "novo_lead" || canon === "qualificando" || orcs.length === 0) {
    return { label: "Montar cesta", icon: ShoppingBag, kind: "cesta" as const };
  }
  const contra = orcs.find(o => o.status === "revisao_comercial");
  if (contra) return { label: "Responder", icon: Reply, kind: "responder" as const, orcId: contra.id };
  const parada = orcs.find(o => o.status === "revisao_lojista");
  if (parada) return { label: "Cobrar no Whats", icon: MessageCircle, kind: "cobrar" as const };
  return { label: "Abrir orçamento", icon: FileText, kind: "abrir" as const, orcId: orcs[0].id };
}

export function KanbanBoard({ searchQuery = "", filterTags = [], filterPrioridade }: KanbanBoardProps) {
  const navigate = useNavigate();
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [oportunidades, setOportunidades] = useState(mockOportunidades);
  const [perdaOpen, setPerdaOpen] = useState<{ opId: string } | null>(null);
  const [motivo, setMotivo] = useState<string>("Preço");
  const [obsPerda, setObsPerda] = useState("");

  const { getAutomacoesParaEtapa, getPosVenda, cancelarTarefasPendentes, aplicarAutomacao } = useAutomacoes();
  const [pendingApply, setPendingApply] = useState<{ opId: string; automacoes: Automacao[] } | null>(null);

  const filtered = oportunidades.filter(o => {
    if (searchQuery && !o.nome.toLowerCase().includes(searchQuery.toLowerCase()) && !o.clienteNome.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterTags.length > 0 && !filterTags.some(t => o.tags.includes(t as any))) return false;
    if (filterPrioridade && o.prioridade !== filterPrioridade) return false;
    return true;
  });

  const handleDragStart = (id: string) => setDraggedId(id);

  const commitMove = (opId: string, canon: EtapaCanonica, extra?: Partial<Oportunidade>) => {
    const op = oportunidades.find(o => o.id === opId);
    if (!op) return;
    const newBase = canonicaToBase[canon];
    setOportunidades(prev => prev.map(o => o.id === opId ? { ...o, etapa: newBase, ...extra } : o));

    const canceladas = cancelarTarefasPendentes(opId);
    if (canceladas > 0) toast.info(`${canceladas} tarefa(s) da automação anterior foram encerradas.`);

    if (canon === "ganha") {
      const posVenda = getPosVenda();
      if (posVenda) {
        const todayISO = new Date().toISOString().slice(0, 10);
        aplicarAutomacao(opId, posVenda.id, todayISO);
        toast.success(`Automação de pós-venda "${posVenda.nome}" aplicada.`);
      }
      return;
    }
    if (canon === "perdida") return;

    const automacoes = getAutomacoesParaEtapa(newBase);
    if (automacoes.length === 0) return;
    setPendingApply({ opId, automacoes });
  };

  const handleDrop = (canon: EtapaCanonica) => {
    if (!draggedId) return;
    const opId = draggedId;
    setDraggedId(null);
    const op = oportunidades.find(o => o.id === opId);
    if (!op) return;
    const currentCanon = etapaToCanonica[op.etapa];
    if (currentCanon === canon) return;

    if (canon === "perdida") {
      setMotivo("Preço"); setObsPerda("");
      setPerdaOpen({ opId });
      return;
    }
    commitMove(opId, canon);
  };

  const prioridadeDot: Record<string, string> = {
    alta: "bg-red-500", media: "bg-yellow-500", baixa: "bg-green-500",
  };

  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-4 min-h-[calc(100vh-220px)] snap-x">
        {etapasCanonicas.map(etapa => {
          const columnOps = filtered.filter(o => etapaToCanonica[o.etapa] === etapa.id);
          const somaValor = columnOps.reduce((s, o) => s + o.valorEstimado, 0);
          const isFecho = etapa.id === "ganha" || etapa.id === "perdida";

          return (
            <div
              key={etapa.id}
              className={`flex flex-col shrink-0 snap-start bg-secondary/70 rounded-xl border border-border/50 overflow-hidden ${
                isFecho ? "w-[220px] min-w-[220px]" : "w-[280px] min-w-[280px]"
              }`}
              onDragOver={e => e.preventDefault()}
              onDrop={() => handleDrop(etapa.id)}
            >
              <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/50 bg-secondary">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: etapa.cor }} />
                  <span className="text-sm font-semibold text-foreground truncate">{etapa.nome}</span>
                  <Badge variant="secondary" className="text-[10px] px-1.5 h-5 bg-background/80">{columnOps.length}</Badge>
                </div>
                {!isFecho && (
                  <span className="text-[11px] text-muted-foreground font-medium">
                    R$ {(somaValor / 1000).toFixed(0)}k
                  </span>
                )}
              </div>

              <div className="flex-1 space-y-2 p-2 min-h-[200px]">
                {columnOps.length === 0 && (
                  <div className="flex items-center justify-center h-24 text-xs text-muted-foreground border-2 border-dashed border-border rounded-lg">
                    Vazio
                  </div>
                )}
                {columnOps.map(op => {
                  const orcs = mockOrcamentos.filter(o => op.orcamentoIds.includes(o.id));
                  const acao = acaoContextual(op, etapa.id);
                  const AcaoIcon = acao.icon;
                  const parado = (op.diasNaEtapa ?? 0) > etapa.limiteDias;
                  const briefingResumo = op.briefing
                    ? [
                        op.briefing.categorias?.join("/"),
                        op.briefing.faixaMin && op.briefing.faixaMax
                          ? `R$ ${op.briefing.faixaMin}–${op.briefing.faixaMax}/pç`
                          : undefined,
                      ].filter(Boolean).join(" · ")
                    : op.observacoes.slice(0, 60);

                  return (
                    <Card
                      key={op.id}
                      draggable
                      onDragStart={() => handleDragStart(op.id)}
                      onClick={() => navigate(`/vendedor/oportunidades/${op.id}`)}
                      className={`p-3 cursor-pointer border hover:shadow-md transition-all group ${
                        draggedId === op.id ? "opacity-50" : ""
                      } ${parado ? "border-orange-300 ring-1 ring-orange-200" : "border-border hover:border-accent/40"}`}
                    >
                      <div className="flex items-start justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-2 h-2 rounded-full ${prioridadeDot[op.prioridade]}`} />
                          <span className="text-[10px] text-muted-foreground">{op.clienteNome}</span>
                        </div>
                        {parado ? (
                          <AlertTriangle className="h-3 w-3 text-orange-500" />
                        ) : (
                          <GripVertical className="h-3 w-3 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                      <p className="text-sm font-medium text-foreground leading-snug mb-1 line-clamp-2">{op.nome}</p>
                      {briefingResumo && (
                        <p className="text-[11px] text-muted-foreground line-clamp-1 mb-1.5">{briefingResumo}</p>
                      )}
                      <div className="mb-1.5">
                        <OportunidadeBadges
                          temperatura={op.temperatura}
                          segmento={op.segmento}
                          urgente={op.urgente}
                          size="sm"
                        />
                      </div>
                      {orcs.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-1.5">
                          {orcs.slice(0, 3).map(orc => {
                            const chip = orcStatusChip[orc.status] || { label: orc.status, cls: "bg-muted text-muted-foreground border-border" };
                            return (
                              <span key={orc.id} className={`text-[9px] px-1.5 py-0.5 rounded border ${chip.cls}`}>
                                #{orc.id} {chip.label}
                              </span>
                            );
                          })}
                          {orcs.length > 3 && <span className="text-[9px] text-muted-foreground">+{orcs.length - 3}</span>}
                        </div>
                      )}
                      <div className="flex items-center justify-between text-[11px] mb-2">
                        <span className="font-semibold text-foreground">R$ {op.valorEstimado.toLocaleString("pt-BR")}</span>
                        <span className="text-muted-foreground">{idadeDemanda(op)}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground truncate mb-2">→ {op.proximaAcao}</p>

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full h-7 text-[11px]"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (acao.kind === "cesta") {
                            navigate(`/vendedor/catalogo?cliente=${encodeURIComponent(op.clienteNome)}&oportunidade=${op.id}`);
                          } else if (acao.kind === "cobrar") {
                            navigate(`/vendedor/whatsapp?cliente=${encodeURIComponent(op.clienteNome)}&template=cobranca`);
                          } else if (acao.kind === "responder" && acao.orcId) {
                            navigate(`/vendedor/orcamento/${acao.orcId}`);
                          } else if (acao.kind === "abrir" && acao.orcId) {
                            navigate(`/vendedor/orcamento/${acao.orcId}`);
                          }
                        }}
                      >
                        <AcaoIcon className="h-3 w-3 mr-1" /> {acao.label}
                      </Button>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {pendingApply && (
        <AplicarAutomacaoModal
          open={!!pendingApply}
          onOpenChange={o => !o && setPendingApply(null)}
          automacoes={pendingApply.automacoes}
          onConfirm={(automacaoId, dataInicialISO) => {
            aplicarAutomacao(pendingApply.opId, automacaoId, dataInicialISO);
            const auto = pendingApply.automacoes.find(a => a.id === automacaoId);
            toast.success(`Automação "${auto?.nome}" aplicada (${auto?.tarefas.length} tarefas criadas).`);
            setPendingApply(null);
          }}
        />
      )}

      {perdaOpen && (
        <Popover open={true} onOpenChange={(o) => !o && setPerdaOpen(null)}>
          <PopoverTrigger asChild><span className="sr-only" /></PopoverTrigger>
          <PopoverContent
            className="w-80 z-[200]"
            align="center"
            side="top"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold">Marcar como Perdida</p>
                <p className="text-xs text-muted-foreground">Informe o motivo para alimentar Relatórios.</p>
              </div>
              <div>
                <label className="text-xs font-medium">Motivo</label>
                <Select value={motivo} onValueChange={setMotivo}>
                  <SelectTrigger className="mt-1 h-8"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {motivosPerda.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium">Observação (opcional)</label>
                <Textarea value={obsPerda} onChange={e => setObsPerda(e.target.value)} rows={2} className="mt-1 text-xs" />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setPerdaOpen(null)}>Cancelar</Button>
                <Button size="sm" onClick={() => {
                  commitMove(perdaOpen.opId, "perdida", { motivoPerda: motivo });
                  toast.success(`Oportunidade marcada como perdida (${motivo}).`);
                  setPerdaOpen(null);
                }}>Confirmar perda</Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </>
  );
}
