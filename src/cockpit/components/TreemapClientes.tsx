import { Treemap, ResponsiveContainer, Tooltip } from "recharts";
import { CHART_PALETTE, fmtBRLc } from "../styles/tokens";

interface Props { data: { name: string; size: number }[]; height?: number; }

export function TreemapClientes({ data, height = 280 }: Props) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <Treemap data={data.slice(0, 30)} dataKey="size" nameKey="name" stroke="#fff" content={<CustomCell />}>
        <Tooltip
          contentStyle={{ background: "#fff", border: "1px solid #E7E9EE", borderRadius: 8, fontSize: 12 }}
          formatter={(v: number) => [fmtBRLc(v), "Valor"]}
        />
      </Treemap>
    </ResponsiveContainer>
  );
}

interface CellProps {
  x?: number; y?: number; width?: number; height?: number; index?: number; name?: string; size?: number;
}
function CustomCell(p: CellProps) {
  const { x = 0, y = 0, width = 0, height = 0, index = 0, name = "", size = 0 } = p;
  const color = CHART_PALETTE[index % CHART_PALETTE.length];
  const show = width > 60 && height > 30;
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={color} stroke="#fff" strokeWidth={2} />
      {show && (
        <>
          <text x={x + 6} y={y + 16} fill="#fff" fontSize={11} fontWeight={600}>{name}</text>
          <text x={x + 6} y={y + 30} fill="#fff" fontSize={10} opacity={0.85}>{fmtBRLc(size)}</text>
        </>
      )}
    </g>
  );
}
