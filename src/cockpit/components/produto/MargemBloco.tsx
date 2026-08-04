// Margem de contribuição comercial — visão executiva por marca/produto/cliente.
import { useMemo, useState } from "react";
import { useCockpit } from "../../contexts/CockpitContext";
import { repIdsNoEscopo } from "../../lib/escopo";
import {
  resumoMargem, margemPorMarca, margemPorProduto, margemPorCliente, margemPorRep, ponteMargem,
} from "../../lib/margem";
import { fmtBRLc, fmtPct } from "../../styles/tokens";
import { SectionCard } from "../SectionCard";
import { ExecTile } from "../ExecTiles";
import { Waterfall } from "../Waterfall";
import { cn } from "@/lib/utils";

type Dim = "marca" | "produto" | "cliente" | "rep";

const DIMS: { key: Dim; label: string }[] = [
  { key: "marca", label: "Marca" },
  { key: "produto", label: "Produto" },
  { key: "cliente", label: "Cliente" },
  { key: "rep", label: "Representante" },
];

export function MargemBloco() {
  const { seed, range, previousRange, escopo } = useCockpit();
  const [dim, setDim] = useState<Dim>("marca");

  const pedidos = useMemo(() => {
    const ids = repIdsNoEscopo(seed, escopo);
    return seed.pedidos.filter(p => ids.has(p.repId));
  }, [seed, escopo]);

  const resumo = useMemo(() => resumoMargem(pedidos, range), [pedidos, range]);
  const resumoPrev = useMemo(() => resumoMargem(pedidos, previousRange), [pedidos, previousRange]);
  const ponte = useMemo(() => ponteMargem(seed, pedidos, range, previousRange), [seed, pedidos, range, previousRange]);

  const linhas = useMemo(() => {
    if (dim === "marca") return margemPorMarca(seed, pedidos, range, previousRange);
    if (dim === "produto") return margemPorProduto(seed, pedidos, range).slice(0, 15);
    if (dim === "cliente") return margemPorCliente(seed, pedidos, range);
    return margemPorRep(seed, pedidos, range);
  }, [dim, seed, pedidos, range, previousRange]);

  const deltaMargem = resumoPrev.margem ? ((resumo.margem - resumoPrev.margem) / resumoPrev.margem) * 100 : 0;
  const mediaPct = resumo.margemPct;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <ExecTile
          label="Margem de contribuição"
          value={fmtBRLc(resumo.margem)}
          delta={deltaMargem}
          sub="Receita menos o custo da mercadoria vendida. Não inclui despesas fixas nem impostos."
        />
        <ExecTile
          label="Margem %"
          value={fmtPct(resumo.margemPct)}
          delta={resumo.margemPct - resumoPrev.margemPct}
          sub="Percentual sobre a receita dos pedidos que já têm custo cadastrado."
        />
        <ExecTile
          label="Custo da mercadoria"
          value={fmtBRLc(resumo.custo)}
          sub="Soma do custo dos produtos vendidos no período."
        />
        <ExecTile
          label="Cobertura de custo"
          value={fmtPct(resumo.coberturaCusto, 0)}
          tone={resumo.coberturaCusto < 90 ? "risk" : "good"}
          sub={`${fmtBRLc(resumo.receitaSemCusto)} de receita ainda está sem custo cadastrado no produto — essa parte fica de fora do cálculo de margem.`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="O que explicou a variação da margem" subtitle="Contribuição de cada marca vs período anterior">
          <Waterfall data={ponte} />
        </SectionCard>

        <SectionCard
          title="Margem por dimensão"
          subtitle="Ordenado por margem gerada no período"
          action={
            <div className="flex gap-1">
              {DIMS.map(d => (
                <button
                  key={d.key}
                  onClick={() => setDim(d.key)}
                  className={cn(
                    "text-[11px] px-2 py-1 rounded border transition-colors",
                    dim === d.key
                      ? "bg-[#080846] text-white border-[#080846]"
                      : "nx-muted border-[#E7E9EE] hover:bg-[#F6F7F9]",
                  )}
                >
                  {d.label}
                </button>
              ))}
            </div>
          }
        >
          <div className="max-h-[320px] overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="text-[10px] uppercase nx-muted border-b border-[#E7E9EE] sticky top-0 bg-white">
                <tr>
                  <th className="text-left py-2">Nome</th>
                  <th className="text-right">Receita</th>
                  <th className="text-right">Margem R$</th>
                  <th className="text-right">Margem %</th>
                  <th className="text-right">Share</th>
                </tr>
              </thead>
              <tbody>
                {linhas.map(l => (
                  <tr key={l.id} className="border-b border-[#F1F3F8]">
                    <td className="py-2 nx-text truncate max-w-[160px]">{l.nome}</td>
                    <td className="text-right nx-num nx-muted">{fmtBRLc(l.receita)}</td>
                    <td className="text-right nx-num nx-text">{fmtBRLc(l.margem)}</td>
                    <td className={cn(
                      "text-right nx-num font-medium",
                      l.margemPct < mediaPct - 5 ? "text-rose-600" : l.margemPct > mediaPct + 5 ? "text-emerald-600" : "nx-text",
                    )}>
                      {fmtPct(l.margemPct)}
                    </td>
                    <td className="text-right nx-num nx-muted">{fmtPct(l.share, 0)}</td>
                  </tr>
                ))}
                {!linhas.length && (
                  <tr><td colSpan={5} className="py-6 text-center nx-muted">Sem dados de custo no período.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
