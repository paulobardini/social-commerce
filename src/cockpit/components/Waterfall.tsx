import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, ReferenceLine } from "recharts";
import { NX, fmtNum } from "../styles/tokens";
import type { WaterfallPonto } from "../lib/movimento";

export function Waterfall({ data, height = 240 }: { data: WaterfallPonto[]; height?: number }) {
  // Para waterfall, usamos um trick: barra base invisível + barra visível
  const bars = data.map((pt, i) => {
    if (pt.tipo === "total") {
      return { ...pt, base: 0, top: pt.acumulado, mostrado: pt.acumulado };
    }
    const acAnterior = i > 0 ? data[i - 1].acumulado : 0;
    const base = pt.valor >= 0 ? acAnterior : acAnterior + pt.valor;
    return { ...pt, base, top: Math.abs(pt.valor), mostrado: pt.valor };
  });

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={bars} margin={{ top: 10, right: 10, left: 0, bottom: 5 }} stackOffset="sign">
        <XAxis dataKey="label" tick={{ fontSize: 10, fill: NX.muted }} />
        <YAxis tick={{ fontSize: 10, fill: NX.muted }} tickFormatter={(v) => fmtNum(v)} />
        <Tooltip
          contentStyle={{ background: "#fff", border: "1px solid #E7E9EE", borderRadius: 8, fontSize: 12 }}
          formatter={(_v: number, _n, p) => [fmtNum(p.payload.mostrado), p.payload.label]}
        />
        <Bar dataKey="base" stackId="a" fill="transparent" />
        <Bar dataKey="top" stackId="a" radius={[3, 3, 0, 0]}>
          {bars.map((b, i) => (
            <Cell key={i} fill={b.tipo === "total" ? "#475569" : b.tipo === "positivo" ? "#16A34A" : "#DC2626"} />
          ))}
        </Bar>
        <ReferenceLine y={0} stroke={NX.muted} />
      </BarChart>
    </ResponsiveContainer>
  );
}
