import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { STATUS_COLORS, STATUS_LABEL, fmtNum, type Status } from "../styles/tokens";

interface Props {
  data: { status: Status; valor: number }[];
  size?: number;
  inner?: number;
}

export function StatusDonut({ data, size = 200, inner = 60 }: Props) {
  const total = data.reduce((s, d) => s + d.valor, 0);
  return (
    <div className="relative" style={{ height: size }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="valor" nameKey="status" innerRadius={inner} outerRadius={inner + 30} strokeWidth={0}>
            {data.map(d => <Cell key={d.status} fill={STATUS_COLORS[d.status]} />)}
          </Pie>
          <Tooltip
            contentStyle={{ background: "#fff", border: "1px solid #E7E9EE", borderRadius: 8, fontSize: 12 }}
            formatter={(v: number, _n, p) => [`${fmtNum(v)} (${total > 0 ? ((v/total)*100).toFixed(1) : 0}%)`, STATUS_LABEL[p.payload.status as Status]]}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <p className="text-2xl font-semibold nx-num nx-text">{fmtNum(total)}</p>
        <p className="text-[10px] nx-muted uppercase tracking-wide">Clientes</p>
      </div>
    </div>
  );
}
