import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend as RLegend, CartesianGrid } from "recharts";
import { NX, CHART_PALETTE } from "../styles/tokens";

interface Serie { key: string; nome: string; color?: string; }

export function MultiLineSerie({
  data, series, xKey = "data", height = 220, fmtY,
}: {
  data: Record<string, number | string>[]; series: Serie[]; xKey?: string; height?: number; fmtY?: (n: number) => string;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
        <CartesianGrid stroke="#F1F3F8" vertical={false} />
        <XAxis dataKey={xKey} tick={{ fontSize: 10, fill: NX.muted }} />
        <YAxis tick={{ fontSize: 10, fill: NX.muted }} tickFormatter={fmtY} />
        <Tooltip contentStyle={{ background: "#fff", border: "1px solid #E7E9EE", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => fmtY ? fmtY(v) : v} />
        {series.length > 1 && <RLegend wrapperStyle={{ fontSize: 11 }} />}
        {series.map((s, i) => (
          <Line key={s.key} type="monotone" dataKey={s.key} name={s.nome}
                stroke={s.color ?? CHART_PALETTE[i % CHART_PALETTE.length]} strokeWidth={2} dot={false} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
