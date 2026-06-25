import { LineChart, Line, ResponsiveContainer } from "recharts";
import { NX } from "../styles/tokens";

export function Sparkline({ data, color = NX.primary, height = 28 }: { data: number[]; color?: string; height?: number }) {
  const series = data.map((v, i) => ({ i, v }));
  return (
    <div style={{ height, width: 80 }}>
      <ResponsiveContainer>
        <LineChart data={series}>
          <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
