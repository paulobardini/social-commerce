// Condições comerciais: mix de pagamento, prazo médio, preço por peça e por quilo.
import { useMemo } from "react";
import { useCockpit } from "../../contexts/CockpitContext";
import { repIdsNoEscopo } from "../../lib/escopo";
import { condicoesComerciais, serieCondicoes, FORMA_COR } from "../../lib/condicoesComerciais";
import { fmtBRL, fmtBRLc, fmtNum, fmtPct, fmtDias } from "../../styles/tokens";
import { SectionCard } from "../SectionCard";
import { ExecTile } from "../ExecTiles";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
  LineChart, Line,
} from "recharts";

export function CondicoesComerciaisBloco() {
  const { seed, range, previousRange, escopo } = useCockpit();

  const pedidos = useMemo(() => {
    const ids = repIdsNoEscopo(seed, escopo);
    return seed.pedidos.filter(p => ids.has(p.repId));
  }, [seed, escopo]);

  const c = useMemo(() => condicoesComerciais(pedidos, range, previousRange), [pedidos, range, previousRange]);
  const serie = useMemo(() => serieCondicoes(pedidos, seed.hoje), [pedidos, seed.hoje]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <ExecTile
          label="Prazo médio de pagamento"
          value={fmtDias(c.prazoMedio)}
          delta={c.prazoMedioPrev ? ((c.prazoMedio - c.prazoMedioPrev) / c.prazoMedioPrev) * 100 : 0}
          invert
          sub="Média ponderada pelo valor dos pedidos. Prazo maior significa mais capital de giro comprometido."
        />
        <ExecTile
          label="Preço médio por peça"
          value={fmtBRL(c.precoPeca)}
          delta={c.precoPecaPrev ? ((c.precoPeca - c.precoPecaPrev) / c.precoPecaPrev) * 100 : 0}
          sub={`${fmtNum(c.pecas)} peças faturadas no período.`}
        />
        <ExecTile
          label="Preço médio por quilo"
          value={fmtBRL(c.precoQuilo)}
          delta={c.precoQuiloPrev ? ((c.precoQuilo - c.precoQuiloPrev) / c.precoQuiloPrev) * 100 : 0}
          sub={`${fmtNum(Math.round(c.pesoKg))} kg faturados. Depende do peso cadastrado no produto.`}
        />
        <ExecTile
          label="Desconto médio"
          value={fmtPct(c.descontoMedio)}
          delta={c.descontoMedio - c.descontoMedioPrev}
          invert
          tone={c.descontoMedio > 8 ? "risk" : "neutral"}
          sub="Percentual médio de desconto concedido, ponderado pelo valor dos pedidos."
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Como os clientes estão pagando" subtitle="Participação de cada forma de pagamento na receita">
          <div className="space-y-2.5">
            {c.mix.map(m => (
              <div key={m.forma}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="nx-text">{m.label}</span>
                  <span className="nx-num nx-muted">
                    {fmtBRLc(m.valor)} · {fmtPct(m.share, 0)}
                    <span className={m.share - m.sharePrev >= 0 ? "text-emerald-600 ml-1.5" : "text-rose-600 ml-1.5"}>
                      {m.share - m.sharePrev >= 0 ? "▲" : "▼"} {fmtPct(Math.abs(m.share - m.sharePrev), 1)}
                    </span>
                  </span>
                </div>
                <div className="h-2.5 rounded bg-[#F1F3F8] overflow-hidden">
                  <div className="h-full rounded" style={{ width: `${Math.max(1, m.share)}%`, background: FORMA_COR[m.forma] }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={serie} margin={{ top: 4, right: 8, left: -20, bottom: 0 }} stackOffset="expand">
                <CartesianGrid stroke="#F1F3F8" vertical={false} />
                <XAxis dataKey="mes" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${Math.round(v * 100)}%`} />
                <Tooltip formatter={(v: number) => fmtPct(v)} contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #E7E9EE" }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="boleto" name="Boleto" stackId="a" fill={FORMA_COR.boleto} />
                <Bar dataKey="faturado" name="Faturado" stackId="a" fill={FORMA_COR.faturado} />
                <Bar dataKey="cartao" name="Cartão" stackId="a" fill={FORMA_COR.cartao} />
                <Bar dataKey="pix" name="Pix" stackId="a" fill={FORMA_COR.pix} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Prazo médio e preço por peça" subtitle="Últimos 12 meses">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={serie} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid stroke="#F1F3F8" vertical={false} />
              <XAxis dataKey="mes" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="l" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${Math.round(v)}d`} />
              <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => fmtBRL(v)} />
              <Tooltip
                formatter={(v: number, n) => (n === "Prazo médio" ? fmtDias(v) : fmtBRL(v))}
                contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #E7E9EE" }}
              />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Line yAxisId="l" dataKey="prazo" name="Prazo médio" stroke="#363BB4" strokeWidth={2} dot={false} />
              <Line yAxisId="r" dataKey="precoPeca" name="Preço/peça" stroke="#0EA5E9" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>
    </div>
  );
}
