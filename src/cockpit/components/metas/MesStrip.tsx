// MesStrip · seletor horizontal de 12 meses com indicador de status por mês.
// Uso: gestor navega entre meses no wizard e na aba Metas de Representantes.
// LADO DO GESTOR APENAS — vendedor nunca vê ◐ (rascunho).
import { periodosPlanejamento, mesLabelCurto, periodoEhCorrente, mesLabel } from "@/cockpit/data/metasV2";
import type { MetaV2 } from "@/cockpit/data/metasV2";
import { Check, Circle, CircleDashed } from "lucide-react";

interface Props {
  hoje: Date;
  metasV2: MetaV2[];
  escopo: string;
  periodoAtivo: string;
  onEscolher: (periodo: string) => void;
}

function statusDoMes(metasV2: MetaV2[], periodo: string, escopo: string): "publicada" | "rascunho" | "vazio" {
  const doMes = metasV2.filter(m => m.periodo === periodo && m.escopo === escopo);
  if (!doMes.length) return "vazio";
  if (doMes.some(m => m.status === "publicada")) return "publicada";
  return "rascunho";
}

export function MesStrip({ hoje, metasV2, escopo, periodoAtivo, onEscolher }: Props) {
  const periodos = periodosPlanejamento(hoje);
  return (
    <div className="flex items-stretch gap-1 overflow-x-auto pb-1 -mx-1 px-1">
      {periodos.map(p => {
        const status = statusDoMes(metasV2, p, escopo);
        const ativo = p === periodoAtivo;
        const corrente = periodoEhCorrente(p, hoje);
        return (
          <button
            key={p}
            onClick={() => onEscolher(p)}
            title={`${mesLabel(p)} · ${status === "publicada" ? "publicada" : status === "rascunho" ? "rascunho" : "sem meta"}`}
            className={`shrink-0 min-w-[76px] px-2.5 py-2 rounded-lg border text-center transition ${
              ativo
                ? "bg-[#2D3A8C] text-white border-[#2D3A8C]"
                : "bg-white text-foreground border-[#E7E9EE] hover:border-[#2D3A8C]"
            }`}
          >
            <div className="flex items-center justify-center gap-1">
              {status === "publicada" && <Check className={`h-3 w-3 ${ativo ? "text-emerald-300" : "text-emerald-600"}`} />}
              {status === "rascunho"  && <CircleDashed className={`h-3 w-3 ${ativo ? "text-amber-300" : "text-amber-600"}`} />}
              {status === "vazio"     && <Circle className={`h-3 w-3 ${ativo ? "text-white/40" : "text-muted-foreground/40"}`} />}
              <span className="text-[11px] font-semibold">{mesLabelCurto(p)}</span>
            </div>
            {corrente && (
              <span className={`text-[9px] uppercase tracking-wide mt-0.5 block ${ativo ? "text-white/80" : "text-[#2D3A8C]"}`}>
                atual
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
