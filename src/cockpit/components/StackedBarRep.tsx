import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend as RLegend } from "recharts";
import { STATUS_COLORS, fmtNum, NX } from "../styles/tokens";

interface Row { rep: string; ativo: number; inativo: number; perdido: number; }

export function StackedBarRep({ data, height = 260 }: { data: Row[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
        <XAxis dataKey="rep" tick={{ fontSize: 10, fill: NX.text }} interval={0} angle={-15} textAnchor="end" height={50} />
        <YAxis tick={{ fontSize: 10, fill: NX.muted }} tickFormatter={fmtNum} />
        <Tooltip contentStyle={{ background: "#fff", border: "1px solid #E7E9EE", borderRadius: 8, fontSize: 12 }} />
        <RLegend wrapperStyle={{ fontSize: 11 }} />
        <Bar dataKey="ativo"   stackId="a" name="Ativos"   fill={STATUS_COLORS.ativo}   radius={[0, 0, 0, 0]} />
        <Bar dataKey="inativo" stackId="a" name="Inativos" fill={STATUS_COLORS.inativo} radius={[0, 0, 0, 0]} />
        <Bar dataKey="perdido" stackId="a" name="Perdidos" fill={STATUS_COLORS.perdido} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
