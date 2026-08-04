// Tempo por etapa do funil e análise de descartes.
import { useMemo } from "react";
import { useCockpit } from "../../contexts/CockpitContext";
import { repIdsNoEscopo } from "../../lib/escopo";
import { temposPorEtapa, cicloTotalMedio, descartesPorMotivo } from "../../lib/funilTempo";
import { fmtBRLc, fmtDias, fmtNum, fmtPct } from "../../styles/tokens";
import { SectionCard } from "../SectionCard";
import { ExecTile } from "../ExecTiles";
import { cn } from "@/lib/utils";

export function FunilTempoBloco() {
  const { seed, escopo } = useCockpit();

  const ops = useMemo(() => {
    const ids = repIdsNoEscopo(seed, escopo);
    return seed.oportunidades.filter(o => ids.has(o.repId));
  }, [seed, escopo]);

  const etapas = useMemo(() => temposPorEtapa(ops), [ops]);
  const ciclo = cicloTotalMedio(etapas);
  const descartes = useMemo(() => descartesPorMotivo(ops), [ops]);
  const gargalo = etapas.find(e => e.gargalo);
  const perdidas = ops.filter(o => o.etapa === "perdida");
  const fechadas = ops.filter(o => o.etapa === "ganha" || o.etapa === "perdida");
  const maiorEtapa = Math.max(1, ...etapas.map(e => e.mediaDias));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <ExecTile
          label="Ciclo médio de venda"
          value={fmtDias(ciclo)}
          sub="Soma do tempo médio em cada etapa, do primeiro contato até o fechamento."
        />
        <ExecTile
          label="Maior gargalo"
          value={gargalo ? fmtDias(gargalo.mediaDias) : "—"}
          tone="risk"
          sub={gargalo ? `A etapa "${gargalo.label}" é onde as negociações mais param.` : "Sem dados suficientes."}
        />
        <ExecTile
          label="Taxa de perda"
          value={fechadas.length ? fmtPct((perdidas.length / fechadas.length) * 100, 0) : "—"}
          invert
          sub={`${fmtNum(perdidas.length)} negociações perdidas de ${fmtNum(fechadas.length)} fechadas.`}
        />
        <ExecTile
          label="Valor descartado"
          value={fmtBRLc(perdidas.reduce((s, o) => s + o.valor, 0))}
          tone="risk"
          sub="Soma do valor das oportunidades marcadas como perdidas."
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Quanto tempo cada etapa consome" subtitle="Média e mediana em dias">
          <div className="space-y-3">
            {etapas.map(e => (
              <div key={e.etapa}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className={cn("nx-text", e.gargalo && "font-semibold text-rose-600")}>
                    {e.label}{e.gargalo && " · gargalo"}
                  </span>
                  <span className="nx-num nx-muted">
                    média {fmtDias(e.mediaDias)} · mediana {fmtDias(e.medianaDias)}
                  </span>
                </div>
                <div className="h-2.5 rounded bg-[#F1F3F8] overflow-hidden">
                  <div
                    className={cn("h-full rounded", e.gargalo ? "bg-rose-400" : "bg-[#363BB4]")}
                    style={{ width: `${Math.max(3, (e.mediaDias / maiorEtapa) * 100)}%` }}
                  />
                </div>
                <p className="text-[10px] nx-muted mt-0.5">{fmtNum(e.amostra)} negociações passaram por aqui</p>
              </div>
            ))}
            {!etapas.length && <p className="text-xs nx-muted py-6 text-center">Sem histórico de etapas registrado.</p>}
          </div>
        </SectionCard>

        <SectionCard title="Por que perdemos" subtitle="Motivos informados no descarte">
          <table className="w-full text-xs">
            <thead className="text-[10px] uppercase nx-muted border-b border-[#E7E9EE]">
              <tr>
                <th className="text-left py-2">Motivo</th>
                <th className="text-left">Etapa típica</th>
                <th className="text-right">Qtd</th>
                <th className="text-right">Share</th>
                <th className="text-right">Valor</th>
              </tr>
            </thead>
            <tbody>
              {descartes.map(d => (
                <tr key={d.motivo} className="border-b border-[#F1F3F8]">
                  <td className="py-2 nx-text truncate max-w-[150px]">{d.motivo}</td>
                  <td className="nx-muted">{d.etapaMedia}</td>
                  <td className="text-right nx-num nx-muted">{d.qtd}</td>
                  <td className="text-right nx-num nx-text">{fmtPct(d.share, 0)}</td>
                  <td className="text-right nx-num nx-muted">{fmtBRLc(d.valor)}</td>
                </tr>
              ))}
              {!descartes.length && <tr><td colSpan={5} className="py-6 text-center nx-muted">Nenhuma perda registrada.</td></tr>}
            </tbody>
          </table>
        </SectionCard>
      </div>
    </div>
  );
}
