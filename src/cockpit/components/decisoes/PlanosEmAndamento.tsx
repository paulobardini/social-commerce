import { useMemo, useState } from "react";
import { usePlanos } from "@/contexts/PlanosContext";
import { compromissosAtrasados, horasDesdePrazo, metricasLoop, type PlanoRecuperacao } from "@/lib/planos";
import { ProgressBar } from "../ProgressBar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, MessageCircle, CheckCircle2, Clock, ClipboardList } from "lucide-react";
import { EncerrarPlanoModal } from "./EncerrarPlanoModal";
import { toast } from "sonner";
import { useTarefas } from "@/contexts/TarefasContext";

const tipoLabel = { cliente_risco: "Cliente em risco", ritmo: "Fora do ritmo" } as const;

function statusBadge(status: PlanoRecuperacao["status"]) {
  const map: Record<PlanoRecuperacao["status"], string> = {
    aguardando_resposta: "bg-amber-100 text-amber-800 border-amber-300",
    ativo: "bg-sky-100 text-sky-800 border-sky-300",
    concluido: "bg-emerald-100 text-emerald-800 border-emerald-300",
    escalado: "bg-rose-100 text-rose-800 border-rose-300",
    cancelado: "bg-slate-100 text-slate-700 border-slate-300",
  };
  const label: Record<PlanoRecuperacao["status"], string> = {
    aguardando_resposta: "Aguardando resposta",
    ativo: "Ativo",
    concluido: "Concluído",
    escalado: "Escalado",
    cancelado: "Cancelado",
  };
  return <Badge variant="outline" className={`text-[10px] border ${map[status]}`}>{label[status]}</Badge>;
}

function PlanoCard({ plano }: { plano: PlanoRecuperacao }) {
  const { getProgresso, getCompromissoProgresso, reforcarPlano } = usePlanos();
  const { tarefas } = useTarefas();
  const [encerrarOpen, setEncerrarOpen] = useState(false);
  const tarefasDoRep = useMemo(() => tarefas.filter(t => t.responsavel === plano.repNome), [tarefas, plano.repNome]);
  const atrasados = compromissosAtrasados(plano, tarefasDoRep);
  const progresso = getProgresso(plano);
  const escalado = plano.status === "escalado";
  const horas = escalado ? horasDesdePrazo(plano) : 0;

  return (
    <div className={`nx-card p-3 ${escalado ? "border-rose-300 bg-rose-50/40" : ""}`}>
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-semibold nx-text">{plano.repNome}</span>
            {statusBadge(plano.status)}
            <Badge variant="outline" className="text-[10px]">{tipoLabel[plano.tipo]}</Badge>
          </div>
          <p className="text-[11px] nx-muted mt-0.5">
            {plano.tipo === "cliente_risco"
              ? `${plano.contexto.clienteNome} · ${plano.contexto.valor ? `R$ ${(plano.contexto.valor/1000).toFixed(0)}k` : ""}`
              : `pace ${plano.contexto.pace ?? "?"}% · cobertura ${plano.contexto.coberturaDelta ?? 0}pp`}
          </p>
        </div>
        {escalado && (
          <div className="text-right shrink-0">
            <div className="flex items-center gap-1 text-rose-600 text-[11px] font-semibold">
              <AlertTriangle className="h-3.5 w-3.5" />
              {plano.repNome.split(" ")[0]} não respondeu · {Math.round(horas/24)}d
            </div>
          </div>
        )}
      </div>

      {plano.status === "aguardando_resposta" && (
        <p className="text-[11px] nx-muted italic mb-2 flex items-center gap-1">
          <Clock className="h-3 w-3" /> Aguardando resposta do rep · prazo até {new Date(plano.prazoResposta).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
        </p>
      )}

      {plano.compromissos.length > 0 && (
        <div className="space-y-2 mb-2">
          {plano.compromissos.map(c => {
            const p = getCompromissoProgresso(plano, c);
            return (
              <div key={c.id}>
                <ProgressBar
                  value={p * 100}
                  label={`${c.descricao} · prazo ${c.prazo}`}
                  suffix={p >= 1 ? "✓" : `${Math.round(p*100)}%`}
                  color={p >= 1 ? "#10b981" : "#363BB4"}
                />
              </div>
            );
          })}
          {atrasados > 0 && plano.status === "ativo" && (
            <p className="text-[11px] text-amber-700 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              {atrasados} de {plano.compromissos.length} compromissos atrasados
            </p>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-1.5 mt-2">
        {escalado ? (
          <>
            <Button size="sm" variant="outline" className="h-7 text-[11px] bg-rose-50" onClick={() => { reforcarPlano(plano.id); window.open("https://wa.me/", "_blank"); }}>
              <MessageCircle className="h-3 w-3 mr-1" /> Chamar no WhatsApp
            </Button>
            {plano.tipo === "cliente_risco" && (
              <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => toast.info("Fluxo de redistribuição — em breve")}>
                Reatribuir cliente
              </Button>
            )}
            <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => setEncerrarOpen(true)}>
              Deixar registrado
            </Button>
          </>
        ) : (
          <>
            <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => { reforcarPlano(plano.id); toast.success("Reforço registrado no log"); window.open("https://wa.me/", "_blank"); }}>
              <MessageCircle className="h-3 w-3 mr-1" /> Reforçar no Whats
            </Button>
            <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => setEncerrarOpen(true)}>
              <CheckCircle2 className="h-3 w-3 mr-1" /> Encerrar
            </Button>
          </>
        )}
      </div>

      <EncerrarPlanoModal plano={plano} open={encerrarOpen} onOpenChange={setEncerrarOpen} />
    </div>
  );
}

export function PlanosEmAndamento() {
  const { planos } = usePlanos();
  const abertos = planos.filter(p => p.status === "aguardando_resposta" || p.status === "ativo" || p.status === "escalado");
  const metricas = useMemo(() => metricasLoop(planos), [planos]);

  return (
    <section>
      <div className="flex items-end justify-between mb-3">
        <div>
          <h2 className="text-sm font-semibold nx-text flex items-center gap-2">
            <span className="text-[#2D3A8C]"><ClipboardList className="h-4 w-4" /></span>
            Planos em andamento
            <span className="text-[11px] font-normal nx-muted">({abertos.length})</span>
          </h2>
          <p className="text-[11px] nx-muted mt-0.5">Progresso alimentado por ações reais do rep — sem autodeclaração.</p>
        </div>
      </div>

      {abertos.length === 0 ? (
        <div className="nx-card p-6 text-center">
          <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
          <p className="text-xs nx-muted">Nenhum plano em andamento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {abertos.map(p => <PlanoCard key={p.id} plano={p} />)}
        </div>
      )}

      {metricas.total > 0 && (
        <p className="text-[11px] nx-muted mt-3">
          {metricas.tempoMedioRespostaHoras !== null
            ? `O time responde em média em ${metricas.tempoMedioRespostaHoras < 1
                ? "menos de 1h"
                : `${Math.round(metricas.tempoMedioRespostaHoras)}h`} · `
            : ""}
          {metricas.cumpridos} de {metricas.total} planos cumpridos.
        </p>
      )}
    </section>
  );
}
