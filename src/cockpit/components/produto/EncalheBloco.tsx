// Encalhe comercial: o que não vendeu no período + mix por estação/categoria.
import { useMemo, useState } from "react";
import { useCockpit } from "../../contexts/CockpitContext";
import { repIdsNoEscopo } from "../../lib/escopo";
import { produtosSemVenda, velocidadeProdutos, receitaPorDimensao } from "../../lib/semVenda";
import { fmtBRLc, fmtNum, fmtPct, CHART_PALETTE } from "../../styles/tokens";
import { SectionCard } from "../SectionCard";
import { ExecTile } from "../ExecTiles";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function EncalheBloco() {
  const { seed, range, previousRange, escopo } = useCockpit();
  const [dim, setDim] = useState<"estacao" | "categoria">("estacao");

  const pedidos = useMemo(() => {
    const ids = repIdsNoEscopo(seed, escopo);
    return seed.pedidos.filter(p => ids.has(p.repId));
  }, [seed, escopo]);

  const semVenda = useMemo(() => produtosSemVenda(seed, pedidos, range), [seed, pedidos, range]);
  const velocidade = useMemo(() => velocidadeProdutos(seed, pedidos, range), [seed, pedidos, range]);
  const mix = useMemo(() => receitaPorDimensao(pedidos, range, previousRange, dim), [pedidos, range, previousRange, dim]);

  const nunca = semVenda.filter(p => p.ultimaVendaDias === null).length;
  const parado180 = semVenda.filter(p => (p.ultimaVendaDias ?? 9999) > 180).length;
  const receitaEmRisco = semVenda.reduce((s, p) => s + p.receita12m, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <ExecTile
          label="Produtos sem venda"
          value={fmtNum(semVenda.length)}
          tone={semVenda.length > seed.produtos.length * 0.3 ? "risk" : "neutral"}
          sub={`De ${fmtNum(seed.produtos.length)} produtos ativos, estes não tiveram nenhum pedido no período selecionado.`}
        />
        <ExecTile
          label="Parados há mais de 180 dias"
          value={fmtNum(parado180)}
          tone={parado180 > 0 ? "risk" : "good"}
          sub="Candidatos naturais a ação de queima, kit ou descontinuação."
        />
        <ExecTile
          label="Nunca venderam"
          value={fmtNum(nunca)}
          sub="Cadastrados mas sem histórico de pedido — revisar cadastro, foto e oferta."
        />
        <ExecTile
          label="Receita 12m parada"
          value={fmtBRLc(receitaEmRisco)}
          sub="Quanto esses produtos já faturaram nos últimos 12 meses e deixaram de faturar no período."
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Sem giro no período" subtitle="Ordenado pelo tempo desde a última venda">
          <div className="max-h-[320px] overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="text-[10px] uppercase nx-muted border-b border-[#E7E9EE] sticky top-0 bg-white">
                <tr>
                  <th className="text-left py-2">Produto</th>
                  <th className="text-left">Marca</th>
                  <th className="text-left">Estação</th>
                  <th className="text-right">Última venda</th>
                  <th className="text-right">Receita 12m</th>
                </tr>
              </thead>
              <tbody>
                {semVenda.slice(0, 60).map(p => (
                  <tr key={p.id} className="border-b border-[#F1F3F8]">
                    <td className="py-2 nx-text truncate max-w-[150px]">{p.nome}</td>
                    <td className="nx-muted">{p.marca}</td>
                    <td className="nx-muted">{p.estacao}</td>
                    <td className="text-right nx-num">
                      {p.ultimaVendaDias === null
                        ? <Badge variant="outline" className="text-[10px] border-rose-200 text-rose-600">nunca</Badge>
                        : `${p.ultimaVendaDias}d`}
                    </td>
                    <td className="text-right nx-num nx-muted">{fmtBRLc(p.receita12m)}</td>
                  </tr>
                ))}
                {!semVenda.length && <tr><td colSpan={5} className="py-6 text-center nx-muted">Todos os produtos giraram no período.</td></tr>}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <div className="space-y-4">
          <SectionCard
            title="Mix de receita"
            subtitle="Participação e variação vs período anterior"
            action={
              <div className="flex gap-1">
                {(["estacao", "categoria"] as const).map(k => (
                  <button
                    key={k}
                    onClick={() => setDim(k)}
                    className={cn(
                      "text-[11px] px-2 py-1 rounded border transition-colors",
                      dim === k ? "bg-[#080846] text-white border-[#080846]" : "nx-muted border-[#E7E9EE] hover:bg-[#F6F7F9]",
                    )}
                  >
                    {k === "estacao" ? "Estação" : "Categoria"}
                  </button>
                ))}
              </div>
            }
          >
            <div className="space-y-2">
              {mix.map((m, i) => (
                <div key={m.label}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="nx-text">{m.label}</span>
                    <span className="nx-num nx-muted">
                      {fmtBRLc(m.valor)} · {fmtPct(m.share, 0)}
                      <span className={m.delta >= 0 ? "text-emerald-600 ml-1.5" : "text-rose-600 ml-1.5"}>
                        {m.delta >= 0 ? "▲" : "▼"} {fmtPct(Math.abs(m.delta), 0)}
                      </span>
                    </span>
                  </div>
                  <div className="h-2 rounded bg-[#F1F3F8] overflow-hidden">
                    <div className="h-full rounded" style={{ width: `${Math.max(2, m.share)}%`, background: CHART_PALETTE[i % CHART_PALETTE.length] }} />
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Giro mais rápido" subtitle="Peças por semana no período">
            <table className="w-full text-xs">
              <thead className="text-[10px] uppercase nx-muted border-b border-[#E7E9EE]">
                <tr>
                  <th className="text-left py-1.5">Produto</th>
                  <th className="text-right">Clientes</th>
                  <th className="text-right">Peças/sem</th>
                  <th className="text-right">Receita</th>
                </tr>
              </thead>
              <tbody>
                {velocidade.slice(0, 8).map(v => (
                  <tr key={v.id} className="border-b border-[#F1F3F8]">
                    <td className="py-1.5 nx-text truncate max-w-[150px]">{v.nome}</td>
                    <td className="text-right nx-num nx-muted">{v.clientes}</td>
                    <td className="text-right nx-num nx-text">{v.pecasPorSemana.toFixed(1).replace(".", ",")}</td>
                    <td className="text-right nx-num nx-muted">{fmtBRLc(v.receita)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
