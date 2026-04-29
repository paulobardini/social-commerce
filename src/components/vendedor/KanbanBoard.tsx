import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TagBadge } from "./TagBadge";
import { OportunidadeBadges } from "./OportunidadeBadges";
import { GripVertical, User, Zap } from "lucide-react";
import {
  mockOportunidades, etapasFunil, type OportunidadeEtapa,
} from "@/data/mockCRM";
import { useAutomacoes } from "@/contexts/AutomacoesContext";
import { AplicarAutomacaoModal } from "./AplicarAutomacaoModal";
import { toast } from "sonner";
import type { Automacao } from "@/data/mockAutomacoes";

interface KanbanBoardProps {
  searchQuery?: string;
  filterTags?: string[];
  filterPrioridade?: string;
}

export function KanbanBoard({ searchQuery = "", filterTags = [], filterPrioridade }: KanbanBoardProps) {
  const navigate = useNavigate();
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [oportunidades, setOportunidades] = useState(mockOportunidades);

  const { getAutomacoesParaEtapa, getPosVenda, cancelarTarefasPendentes, aplicarAutomacao } = useAutomacoes();

  const [pendingApply, setPendingApply] = useState<{ opId: string; automacoes: Automacao[] } | null>(null);

  const filtered = oportunidades.filter(o => {
    if (searchQuery && !o.nome.toLowerCase().includes(searchQuery.toLowerCase()) && !o.clienteNome.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterTags.length > 0 && !filterTags.some(t => o.tags.includes(t as any))) return false;
    if (filterPrioridade && o.prioridade !== filterPrioridade) return false;
    return true;
  });

  const activeEtapas = etapasFunil.filter(e => e.ativa);

  const etapaKeyMap: Record<string, OportunidadeEtapa> = {
    "e1": "novo_lead", "e2": "contato_iniciado", "e3": "em_qualificacao",
    "e4": "proposta_construcao", "e5": "orcamento_enviado", "e6": "em_negociacao",
    "e7": "ganho", "e8": "perdido",
  };

  const handleDragStart = (id: string) => setDraggedId(id);

  const handleDrop = (etapaId: string) => {
    if (!draggedId) return;
    const newEtapa = etapaKeyMap[etapaId];
    const opId = draggedId;
    setDraggedId(null);
    if (!newEtapa) return;

    const op = oportunidades.find(o => o.id === opId);
    if (!op || op.etapa === newEtapa) return;

    setOportunidades(prev => prev.map(o => o.id === opId ? { ...o, etapa: newEtapa } : o));

    // Encerrar tarefas pendentes vinculadas a automação anterior
    const canceladas = cancelarTarefasPendentes(opId);
    if (canceladas > 0) {
      toast.info(`${canceladas} tarefa(s) da automação anterior foram encerradas.`);
    }

    // Etapa de fechamento (Ganho) → pós-venda automático
    if (newEtapa === "ganho") {
      const posVenda = getPosVenda();
      if (posVenda) {
        const todayISO = new Date().toISOString().slice(0, 10);
        aplicarAutomacao(opId, posVenda.id, todayISO);
        toast.success(`Automação de pós-venda "${posVenda.nome}" aplicada.`);
      }
      return;
    }

    // Buscar automações disponíveis para nova etapa
    const automacoes = getAutomacoesParaEtapa(newEtapa);
    if (automacoes.length === 0) return;

    // Sempre abrir modal (1 → vai direto para prévia internamente; 2+ → escolha)
    setPendingApply({ opId, automacoes });
  };

  const prioridadeDot: Record<string, string> = {
    alta: "bg-red-500", media: "bg-yellow-500", baixa: "bg-green-500",
  };

  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-4 min-h-[calc(100vh-220px)]">
        {activeEtapas.map(etapa => {
          const etapaKey = etapaKeyMap[etapa.id];
          const columnOps = filtered.filter(o => o.etapa === etapaKey);
          const somaValor = columnOps.reduce((s, o) => s + o.valorEstimado, 0);
          const automacoesEtapa = etapaKey ? getAutomacoesParaEtapa(etapaKey).length : 0;

          return (
            <div
              key={etapa.id}
              className="flex flex-col w-[280px] min-w-[280px] shrink-0 bg-secondary/70 rounded-xl border border-border/50 overflow-hidden"
              onDragOver={e => e.preventDefault()}
              onDrop={() => handleDrop(etapa.id)}
            >
              <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/50 bg-secondary">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: etapa.cor }} />
                  <span className="text-sm font-semibold text-foreground">{etapa.nome}</span>
                  <Badge variant="secondary" className="text-[10px] px-1.5 h-5 bg-background/80">{columnOps.length}</Badge>
                  {automacoesEtapa > 0 && (
                    <span title={`${automacoesEtapa} automação(ões) vinculada(s)`} className="text-accent">
                      <Zap className="h-3 w-3" />
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-muted-foreground font-medium">
                  R$ {somaValor.toLocaleString("pt-BR")}
                </span>
              </div>

              <div className="flex-1 space-y-2 p-2 min-h-[200px]">
                {columnOps.length === 0 && (
                  <div className="flex items-center justify-center h-24 text-xs text-muted-foreground border-2 border-dashed border-border rounded-lg">
                    Nenhuma oportunidade
                  </div>
                )}
                {columnOps.map(op => (
                  <Card
                    key={op.id}
                    draggable
                    onDragStart={() => handleDragStart(op.id)}
                    onClick={() => navigate(`/vendedor/oportunidades/${op.id}`)}
                    className={`p-3 cursor-pointer border border-border hover:border-accent/40 hover:shadow-md transition-all group ${
                      draggedId === op.id ? "opacity-50" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${prioridadeDot[op.prioridade]}`} />
                        <span className="text-[10px] text-muted-foreground capitalize">{op.prioridade}</span>
                      </div>
                      <GripVertical className="h-3 w-3 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-sm font-medium text-foreground leading-snug mb-1">{op.nome}</p>
                    <div className="flex items-center gap-1.5 mb-2">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{op.clienteNome}</span>
                    </div>
                    <div className="mb-2">
                      <OportunidadeBadges
                        temperatura={op.temperatura}
                        segmento={op.segmento}
                        urgente={op.urgente}
                        size="sm"
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-foreground">R$ {op.valorEstimado.toLocaleString("pt-BR")}</span>
                      <span className="text-muted-foreground">{op.ultimaInteracao}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1.5 truncate">→ {op.proximaAcao}</p>
                  </Card>
                ))}
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
    </>
  );
}
