// MOCK: Mini gráfico de linha SVG inline com tooltip ao hover
import { useState } from "react";

interface SparklinePoint {
  label: string;
  value: number;
}

interface SparklineProps {
  data: SparklinePoint[];
  width?: number;
  height?: number;
  color?: string;
  className?: string;
}

export function Sparkline({
  data,
  width = 90,
  height = 24,
  color = "hsl(var(--primary))",
  className = "",
}: SparklineProps) {
  const [hover, setHover] = useState<number | null>(null);

  if (!data?.length) return null;

  const values = data.map(d => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const stepX = data.length > 1 ? width / (data.length - 1) : width;

  const points = data.map((d, i) => ({
    x: i * stepX,
    y: height - ((d.value - min) / range) * (height - 4) - 2,
    ...d,
  }));

  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath = `${path} L${points[points.length - 1].x},${height} L0,${height} Z`;

  return (
    <div className={`relative inline-block ${className}`}>
      <svg width={width} height={height} className="overflow-visible">
        <path d={areaPath} fill={color} opacity={0.1} />
        <path d={path} fill="none" stroke={color} strokeWidth={1.5} />
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={hover === i ? 3 : 1.5}
            fill={color}
            className="cursor-pointer transition-all"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          />
        ))}
      </svg>
      {hover !== null && (
        <div
          className="absolute z-10 px-2 py-1 bg-popover border border-border rounded text-[10px] shadow-md whitespace-nowrap pointer-events-none"
          style={{ left: points[hover].x, top: -28, transform: "translateX(-50%)" }}
        >
          <span className="font-medium">{points[hover].label}:</span>{" "}
          <span className="text-muted-foreground">{points[hover].value}</span>
        </div>
      )}
    </div>
  );
}
