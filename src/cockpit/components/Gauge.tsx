import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from "recharts";
import { fmtPct } from "../styles/tokens";

export function Gauge({ value, label, size = 180, color }: { value: number; label?: string; size?: number; color?: string }) {
  const clamped = Math.min(Math.max(value, 0), 150);
  const auto = clamped >= 100 ? "#16A34A" : clamped >= 75 ? "#0D9488" : clamped >= 50 ? "#F59E0B" : "#DC2626";
  const fill = color ?? auto;
  const data = [{ name: "v", value: clamped, fill }];

  return (
    <div className="relative" style={{ height: size }}>
      <ResponsiveContainer>
        <RadialBarChart innerRadius="70%" outerRadius="100%" startAngle={180} endAngle={0} data={data}>
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar background={{ fill: "#F1F3F8" }} dataKey="value" cornerRadius={10} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-2 pointer-events-none">
        <p className="text-2xl font-semibold nx-num nx-text leading-tight">{fmtPct(value, 0)}</p>
        {label && <p className="text-[10px] nx-muted uppercase tracking-wide">{label}</p>}
      </div>
    </div>
  );
}
