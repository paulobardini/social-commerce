// Faixa executiva de Produto — leitura de diretoria (faturamento, marcas, ofertas).
import { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Cell, ReferenceLine, ResponsiveContainer, Tooltip as RechartsTooltip,
} from "recharts";
import { useCockpit } from "../../contexts/CockpitContext";
import { repIdsNoEscopo } from "../../lib/escopo";
import { NX, fmtBRLc, fmtNum, fmtPct } from "../../styles/tokens";
import { SectionCard } from "../SectionCard";
import { ExecTile, ExecHero, ExecBarRow } from "../ExecTiles";
import type { OfertaResumo } from "../../lib/ofertas";

interface KpiP {
  faturamento: { atual: number; anterior: number; delta: number };
  marcasAtivas: { atual: number; anterior: number; delta: number };
  crossSell: { atual: number };
  concentracaoTop: { atual: number; delta: number };
  itensPorPedido: { atual: number };
  marcaLider: string;
  maiorCrescimento: string;
  maiorQueda: string;
  pedidosPeriodo: { valor: number }[];
}

export function PainelExecutivoProduto({ kpiP, resumoOferta }: { kpiP: KpiP; resumoOferta: OfertaResumo }) {
  const { seed, escopo, range, previousRange } = useCockpit();

  const marcas = useMemo(() => {
    const ids = repIdsNoEscopo(seed, escopo);
    const soma = (from: Date, to: Date) => {
      const m = new Map<string, number>();
      seed.pedidos
        .filter(p => ids.has(p.repId) && p.data >= from && p.data <= to)
        .forEach(p => m.set(p.marcaId, (m.get(p.marcaId) ?? 0) + p.valor));
      return m;
    };
    const cur = soma(range.from, range.to);
    const pre = soma(previousRange.from, previousRange.to);
    return seed.marcas
      .map(m => {
        const atual = cur.get(m.id) ?? 0;
        const anterior = pre.get(m.id) ?? 0;
        return {
          nome: m.nome,
          atual,
          anterior,
          variacao: atual - anterior,
          delta: anterior > 0 ? ((atual - anterior) / anterior) * 100 : atual > 0 ? 100 : 0,
        };
      })
      .filter(m => m.atual > 0 || m.anterior > 0)
      .sort((a, b) => b.atual - a.atual);
  }, [seed, escopo, range, previousRange]);

  const movimento = useMemo(
    () => [...marcas].sort((a, b) => Math.abs(b.variacao) - Math.abs(a.variacao)).slice(0, 8),
    [marcas],
  );

  const maxMarca = marcas[0]?.atual || 1;
  const ticketPedido = kpiP.pedidosPeriodo.length ? kpiP.faturamento.atual / kpiP.pedidosPeriodo.length : 0;
  const maiorMov = movimento[0];

  const narrativa = maiorMov
    ? `Marca líder: ${kpiP.marcaLider}. O maior movimento do período veio de ${maiorMov.nome} (${maiorMov.variacao >= 0 ? "+" : "−"}${fmtBRLc(Math.abs(maiorMov.variacao))}). Maior queda: ${kpiP.maiorQueda}.`
    : `Marca líder: ${kpiP.marcaLider}.`;

  return (
    <div className="space-y-4">
      <div className="nx-card p-4">
        <div className="flex flex-col lg:flex-row lg:items-stretch gap-4">
          <div className="lg:w-[260px] shrink-0">
            <ExecHero
              label="Faturamento no período"
              value={fmtBRLc(kpiP.faturamento.atual)}
              delta={kpiP.faturamento.delta}
              detalhe={`vs ${fmtBRLc(kpiP.faturamento.anterior)} no período anterior · ${fmtNum(kpiP.pedidosPeriodo.length)} pedidos · ticket ${fmtBRLc(ticketPedido)}`}
              narrativa={narrativa}
            />
          </div>

          <div className="flex-1 grid grid-cols-2 xl:grid-cols-4 gap-2.5">
            <ExecTile
              label="Marcas com venda"
              value={fmtNum(kpiP.marcasAtivas.atual)}
              sub={`de ${fmtNum(seed.marcas.length)} marcas do portfólio · ${fmtPct(Math.abs(kpiP.marcasAtivas.delta), 0)} de variação vs período anterior`}
              tone={kpiP.marcasAtivas.delta < 0 ? "risk" : "neutral"}
            />
            <ExecTile
              label="Concentração na marca líder"
              value={fmtPct(kpiP.concentracaoTop.atual, 0)}
              sub={`do faturamento vem de ${kpiP.marcaLider} · maior crescimento: ${kpiP.maiorCrescimento}`}
              tone={kpiP.concentracaoTop.atual > 40 ? "risk" : "neutral"}
            />
            <ExecTile
              label="Marcas por cliente"
              value={kpiP.crossSell.atual.toFixed(1)}
              sub={`média de marcas distintas compradas por cliente · ${kpiP.itensPorPedido.atual.toFixed(1)} itens por pedido`}
              tone={kpiP.crossSell.atual < 1.5 ? "risk" : "good"}
            />
            <ExecTile
              label="Conversão das ofertas"
              value={fmtPct(resumoOferta.conversaoMedia, 0)}
              sub={`${fmtNum(resumoOferta.totalEnvios)} produtos enviados · ${fmtPct(resumoOferta.taxaAbertura, 0)} de abertura · ${fmtNum(resumoOferta.totalPedidos)} viraram pedido`}
              tone={resumoOferta.conversaoMedia < 8 ? "risk" : "good"}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionCard className="lg:col-span-2" title="O que explica a variação de faturamento"
          subtitle="Ganho e perda de receita por marca vs período anterior">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={movimento} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
              <XAxis dataKey="nome" tick={{ fontSize: 10, fill: NX.muted }} interval={0} />
              <YAxis tick={{ fontSize: 10, fill: NX.muted }} tickFormatter={(v) => fmtBRLc(v)} width={58} />
              <RechartsTooltip
                contentStyle={{ background: "#fff", border: "1px solid #E7E9EE", borderRadius: 8, fontSize: 12 }}
                formatter={(v: number) => [fmtBRLc(v), "Variação"]}
              />
              <Bar dataKey="variacao" radius={[3, 3, 0, 0]}>
                {movimento.map((m, i) => (
                  <Cell key={i} fill={m.variacao >= 0 ? "#16A34A" : "#DC2626"} />
                ))}
              </Bar>
              <ReferenceLine y={0} stroke={NX.muted} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Faturamento por marca" subtitle="Top marcas no escopo e variação do período">
          <div className="space-y-1.5">
            {marcas.slice(0, 8).map(m => (
              <ExecBarRow key={m.nome} label={m.nome} valor={m.atual} max={maxMarca} valorFmt={fmtBRLc(m.atual)} delta={m.delta} />
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
