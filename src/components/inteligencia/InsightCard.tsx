import { useState } from "react";
import { Recomendacao } from "@/data/mockInteligencia";
import { useRecomendacoes } from "@/contexts/RecomendacoesContext";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, RotateCcw, UserPlus, Eye, ListPlus, Database, DollarSign, Megaphone, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CriarTarefaModal } from "./modals/CriarTarefaModal";
import { SimularPrecoModal } from "./modals/SimularPrecoModal";
import { CriarCampanhaModal } from "./modals/CriarCampanhaModal";
import { RecompraModal } from "./modals/RecompraModal";

const tipoLabel: Record<string, string> = {
  recompra: "Recompra",
  liquidar: "Liquidação",
  "revisar-preco": "Revisão de preço",
  "atencao-margem": "Atenção à margem",
  renegociar: "Renegociação",
  campanha: "Campanha",
  ruptura: "Risco de ruptura",
};

const tipoColor: Record<string, string> = {
  recompra: "bg-indigo-500/10 text-indigo-700 border-indigo-500/20",
  liquidar: "bg-rose-500/10 text-rose-700 border-rose-500/20",
  "revisar-preco": "bg-violet-500/10 text-violet-700 border-violet-500/20",
  "atencao-margem": "bg-orange-500/10 text-orange-700 border-orange-500/20",
  renegociar: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  campanha: "bg-accent/10 text-accent border-accent/20",
  ruptura: "bg-rose-500/10 text-rose-700 border-rose-500/30",
};

const prioridadeBorda: Record<string, string> = {
  Alta: "border-l-rose-500",
  Média: "border-l-amber-500",
  Baixa: "border-l-sky-500",
};

const prioridadeBadge: Record<string, string> = {
  Alta: "bg-rose-500/10 text-rose-700",
  Média: "bg-amber-500/10 text-amber-700",
  Baixa: "bg-sky-500/10 text-sky-700",
};

export function InsightCard({ rec }: { rec: Recomendacao }) {
  const navigate = useNavigate();
  const { getStatus, aceitar, ignorar, reabrir, atribuir } = useRecomendacoes();
  const [tarefaOpen, setTarefaOpen] = useState(false);
  const [precoOpen, setPrecoOpen] = useState(false);
  const [campanhaOpen, setCampanhaOpen] = useState(false);
  const [recompraOpen, setRecompraOpen] = useState(false);
  const status = getStatus(rec.id);

  const stateClasses =
    status === "aceita"
      ? "border-emerald-500/40 bg-emerald-500/[0.02]"
      : status === "ignorada"
      ? "opacity-60"
      : "";

  return (
    <>
      <div className={`bg-card border border-border rounded-xl border-l-4 ${prioridadeBorda[rec.prioridade]} p-4 hover:shadow-md transition-all ${stateClasses}`}>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${tipoColor[rec.tipo]}`}>
              {tipoLabel[rec.tipo]}
            </span>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${prioridadeBadge[rec.prioridade]}`}>
              Prioridade {rec.prioridade}
            </span>
            <ConfidenceBadge confianca={rec.confianca} />
            {status === "aceita" && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700">Aceita</span>
            )}
            {status === "ignorada" && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-500/10 text-slate-600">Ignorada</span>
            )}
          </div>
        </div>

        {/* Título e produto */}
        <h3 className="text-base font-bold text-foreground">{rec.titulo}</h3>
        <p className="text-sm text-muted-foreground">
          {rec.produto}
          {rec.sku && <span className="ml-2 text-xs">• {rec.sku}</span>}
          {rec.marca && <span className="ml-2 text-xs">• {rec.marca}</span>}
        </p>

        {/* Motivo */}
        <p className="text-sm text-foreground/85 mt-3 leading-snug">{rec.motivo}</p>

        {/* Evidências */}
        <div className="mt-3 flex flex-wrap gap-2">
          {rec.evidencias.map((e) => (
            <div key={e.label} className="bg-secondary/50 border border-border rounded-md px-2.5 py-1">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{e.label}</p>
              <p className="text-sm font-semibold tabular-nums">{e.valor}</p>
            </div>
          ))}
        </div>

        {/* Impacto + ação */}
        <div className="mt-3 grid md:grid-cols-2 gap-2 text-sm">
          <div className="bg-primary/5 border border-primary/15 rounded-md px-3 py-2">
            <p className="text-[10px] uppercase tracking-wide text-primary font-semibold">Impacto estimado</p>
            <p className="text-foreground font-medium">{rec.impactoEstimado}</p>
          </div>
          <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-md px-3 py-2">
            <p className="text-[10px] uppercase tracking-wide text-emerald-700 font-semibold">Ação sugerida</p>
            <p className="text-foreground font-medium">{rec.acaoSugerida}</p>
          </div>
        </div>

        {/* Base analisada */}
        <p className="text-[11px] text-muted-foreground mt-3 flex items-center gap-1.5">
          <Database className="h-3 w-3" />
          Base analisada: {rec.baseAnalisada}
        </p>

        {/* Botões */}
        <div className="mt-4 flex flex-wrap gap-2">
          {rec.sku && (
            <Button size="sm" variant="outline" onClick={() => navigate(`/inteligencia-mercado/produto/${rec.sku}`)}>
              <Eye className="h-3.5 w-3.5 mr-1" /> Ver detalhe
            </Button>
          )}
          {(rec.tipo === "recompra" || rec.tipo === "ruptura") && (
            <Button size="sm" variant="outline" onClick={() => setRecompraOpen(true)}>
              <ShoppingCart className="h-3.5 w-3.5 mr-1" /> Sugerir recompra
            </Button>
          )}
          {(rec.tipo === "revisar-preco" || rec.tipo === "atencao-margem") && (
            <Button size="sm" variant="outline" onClick={() => setPrecoOpen(true)}>
              <DollarSign className="h-3.5 w-3.5 mr-1" /> Simular preço
            </Button>
          )}
          {(rec.tipo === "liquidar" || rec.tipo === "campanha") && (
            <Button size="sm" variant="outline" onClick={() => setCampanhaOpen(true)}>
              <Megaphone className="h-3.5 w-3.5 mr-1" /> Criar campanha
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={() => setTarefaOpen(true)}>
            <ListPlus className="h-3.5 w-3.5 mr-1" /> Criar tarefa
          </Button>
          {status !== "aceita" ? (
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => aceitar(rec.id)}>
              <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Aceitar
            </Button>
          ) : (
            <Button size="sm" variant="outline" onClick={() => reabrir(rec.id)}>
              <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reabrir
            </Button>
          )}
          {status !== "ignorada" ? (
            <Button size="sm" variant="ghost" onClick={() => ignorar(rec.id)}>
              <XCircle className="h-3.5 w-3.5 mr-1" /> Ignorar
            </Button>
          ) : (
            <Button size="sm" variant="ghost" onClick={() => reabrir(rec.id)}>
              <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reabrir
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => atribuir(rec.id, "Paulo Bardini")}>
            <UserPlus className="h-3.5 w-3.5 mr-1" /> Atribuir
          </Button>
        </div>
      </div>
      <CriarTarefaModal open={tarefaOpen} onOpenChange={setTarefaOpen} produto={rec.produto} />
      <SimularPrecoModal open={precoOpen} onOpenChange={setPrecoOpen} />
      <CriarCampanhaModal open={campanhaOpen} onOpenChange={setCampanhaOpen} produto={rec.produto} />
      <RecompraModal open={recompraOpen} onOpenChange={setRecompraOpen} produto={rec.produto} estoque={0} />
    </>
  );
}
