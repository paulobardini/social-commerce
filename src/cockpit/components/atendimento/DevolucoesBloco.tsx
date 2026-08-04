// Devoluções — origem no SAC, leitura por motivo, marca, representante e cliente.
import { useMemo } from "react";
import { useCockpit } from "../../contexts/CockpitContext";
import { repIdsNoEscopo } from "../../lib/escopo";
import { resumoDevolucoes } from "../../lib/devolucoes";
import { fmtBRLc, fmtNum, fmtPct, CHART_PALETTE } from "../../styles/tokens";
import { SectionCard } from "../SectionCard";
import { ExecTile } from "../ExecTiles";
import {
  ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

export function DevolucoesBloco() {
  const { seed, range, previousRange, escopo } = useCockpit();

  const dados = useMemo(() => {
    const ids = repIdsNoEscopo(seed, escopo);
    return resumoDevolucoes(
      seed,
      seed.devolucoes.filter(d => ids.has(d.repId)),
      seed.pedidos.filter(p => ids.has(p.repId)),
      range, previousRange,
    );
  }, [seed, escopo, range, previousRange]);

  const deltaValor = dados.valorPrev ? ((dados.valor - dados.valorPrev) / dados.valorPrev) * 100 : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <ExecTile
          label="Valor devolvido"
          value={fmtBRLc(dados.valor)}
          delta={deltaValor}
          invert
          tone={deltaValor > 0 ? "risk" : "neutral"}
          sub="Soma das devoluções registradas no SAC dentro do período."
        />
        <ExecTile
          label="% da receita"
          value={fmtPct(dados.pctReceita)}
          delta={dados.pctReceita - dados.pctReceitaPrev}
          invert
          sub="Quanto a devolução representa do faturamento do mesmo período."
        />
        <ExecTile
          label="Ocorrências"
          value={fmtNum(dados.qtd)}
          sub={`${fmtNum(dados.pecas)} peças devolvidas. Ticket médio de ${fmtBRLc(dados.ticketMedio)} por ocorrência.`}
        />
        <ExecTile
          label="Principal motivo"
          value={dados.porMotivo[0] ? fmtPct(dados.porMotivo[0].share, 0) : "—"}
          tone="risk"
          sub={dados.porMotivo[0]
            ? `${dados.porMotivo[0].motivo} — ${fmtBRLc(dados.porMotivo[0].valor)} em ${dados.porMotivo[0].qtd} ocorrências.`
            : "Sem devoluções no período."}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Evolução das devoluções" subtitle="Valor devolvido e % sobre a receita (12 meses)">
          <ResponsiveContainer width="100%" height={240}>
            <ComposedChart data={dados.serie} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid stroke="#F1F3F8" vertical={false} />
              <XAxis dataKey="mes" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="l" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => fmtBRLc(v)} />
              <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v.toFixed(1)}%`} />
              <Tooltip
                formatter={(v: number, n) => (n === "pct" ? fmtPct(v) : fmtBRLc(v))}
                contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #E7E9EE" }}
              />
              <Bar yAxisId="l" dataKey="valor" name="Devolvido" fill="#F1B3B3" radius={[3, 3, 0, 0]} />
              <Line yAxisId="r" dataKey="pct" name="pct" stroke="#E11D48" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Motivos" subtitle="Registrados no atendimento (SAC)">
          <div className="space-y-2">
            {dados.porMotivo.map((m, i) => (
              <div key={m.motivo}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="nx-text truncate">{m.motivo}</span>
                  <span className="nx-num nx-muted">{fmtBRLc(m.valor)} · {fmtPct(m.share, 0)}</span>
                </div>
                <div className="h-2 rounded bg-[#F1F3F8] overflow-hidden">
                  <div
                    className="h-full rounded"
                    style={{ width: `${Math.max(2, m.share)}%`, background: CHART_PALETTE[i % CHART_PALETTE.length] }}
                  />
                </div>
              </div>
            ))}
            {!dados.porMotivo.length && <p className="text-xs nx-muted py-6 text-center">Sem devoluções no período.</p>}
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionCard title="Por marca">
          <table className="w-full text-xs">
            <tbody>
              {dados.porMarca.slice(0, 8).map(m => (
                <tr key={m.marca} className="border-b border-[#F1F3F8]">
                  <td className="py-1.5 nx-text">{m.marca}</td>
                  <td className="text-right nx-num nx-muted">{m.qtd}</td>
                  <td className="text-right nx-num nx-text">{fmtBRLc(m.valor)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </SectionCard>

        <SectionCard title="Por representante" subtitle="% sobre a própria receita">
          <table className="w-full text-xs">
            <tbody>
              {dados.porRep.slice(0, 8).map(r => (
                <tr key={r.rep} className="border-b border-[#F1F3F8]">
                  <td className="py-1.5 nx-text truncate max-w-[130px]">{r.rep}</td>
                  <td className="text-right nx-num nx-text">{fmtBRLc(r.valor)}</td>
                  <td className={`text-right nx-num ${r.pctReceita > 3 ? "text-rose-600" : "nx-muted"}`}>{fmtPct(r.pctReceita)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </SectionCard>

        <SectionCard title="Clientes que mais devolvem">
          <table className="w-full text-xs">
            <tbody>
              {dados.topClientes.map(c => (
                <tr key={c.cliente} className="border-b border-[#F1F3F8]">
                  <td className="py-1.5 nx-text truncate max-w-[150px]">{c.cliente}</td>
                  <td className="text-right nx-num nx-muted">{c.qtd}</td>
                  <td className="text-right nx-num nx-text">{fmtBRLc(c.valor)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </SectionCard>
      </div>
    </div>
  );
}
