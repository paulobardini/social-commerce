import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { NX, fmtNum } from "../styles/tokens";

export function AgingBars({ data, color = NX.primary, height = 200 }: { data: { label: string; value: number }[]; color?: string; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
        <XAxis type="number" tick={{ fontSize: 10, fill: NX.muted }} />
        <YAxis type="category" dataKey="label" tick={{ fontSize: 11, fill: NX.text }} width={90} />
        <Tooltip
          contentStyle={{ background: "#fff", border: "1px solid #E7E9EE", borderRadius: 8, fontSize: 12 }}
          formatter={(v: number) => [fmtNum(v), "Clientes"]}
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
          {data.map((_, i) => <Cell key={i} fill={color} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
