import { ComposedChart, Bar, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, ReferenceLine } from "recharts";
import { NX, fmtBRLc, fmtPct } from "../styles/tokens";
import type { AbcRow } from "../lib/abc";

export function AbcCurve<T>({ data, height = 240, labelKey }: { data: AbcRow<T>[]; height?: number; labelKey: (t: T) => string }) {
  const chartData = data.slice(0, 25).map((r, i) => ({
    nome: labelKey(r.item),
    valor: r.valor,
    pct: r.pct,
    classe: r.classe,
    idx: i + 1,
  }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={chartData} margin={{ top: 10, right: 10, bottom: 5, left: 0 }}>
        <XAxis dataKey="idx" tick={{ fontSize: 10, fill: NX.muted }} />
        <YAxis yAxisId="l" tick={{ fontSize: 10, fill: NX.muted }} tickFormatter={(v) => fmtBRLc(v)} />
        <YAxis yAxisId="r" orientation="right" domain={[0, 100]} tick={{ fontSize: 10, fill: NX.muted }} tickFormatter={(v) => `${v}%`} />
        <Tooltip
          contentStyle={{ background: "#fff", border: "1px solid #E7E9EE", borderRadius: 8, fontSize: 12 }}
          formatter={(v: number, name: string) => name === "pct" ? [fmtPct(v), "Acumulado"] : [fmtBRLc(v), "Valor"]}
          labelFormatter={(i) => chartData[i - 1]?.nome ?? ""}
        />
        <Bar yAxisId="l" dataKey="valor" radius={[2, 2, 0, 0]}>
          {chartData.map((d, i) => (
            <Cell key={i} fill={d.classe === "A" ? "#16A34A" : d.classe === "B" ? "#F59E0B" : "#DC2626"} />
          ))}
        </Bar>
        <Line yAxisId="r" type="monotone" dataKey="pct" stroke={NX.primary} strokeWidth={2} dot={false} />
        <ReferenceLine yAxisId="r" y={80} stroke={NX.muted} strokeDasharray="3 3" />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
