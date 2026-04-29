import { temperaturaColors, temperaturaLabels, type Temperatura } from "@/data/mockCRM";

interface Props {
  temperatura?: Temperatura;
  segmento?: string;
  urgente?: boolean;
  size?: "sm" | "md";
}

export function OportunidadeBadges({ temperatura, segmento, urgente, size = "sm" }: Props) {
  const sizeCls = size === "sm" ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-0.5";
  const base = "inline-flex items-center rounded-full border font-medium";

  const hasAny = temperatura || (segmento && segmento.trim()) || urgente;
  if (!hasAny) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {temperatura && (
        <span className={`${base} ${sizeCls} ${temperaturaColors[temperatura]}`}>
          {temperaturaLabels[temperatura]}
        </span>
      )}
      {segmento && segmento.trim() && (
        <span className={`${base} ${sizeCls} bg-slate-100 text-slate-700 border-slate-200`}>
          {segmento}
        </span>
      )}
      {urgente && (
        <span className={`${base} ${sizeCls} bg-orange-100 text-orange-700 border-orange-200`}>
          Urgente
        </span>
      )}
    </div>
  );
}
