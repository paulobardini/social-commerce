import { NX, fmtPct } from "../styles/tokens";

export function ProgressBar({ value, label, color = NX.primary, suffix }: { value: number; label?: string; color?: string; suffix?: string }) {
  const clamped = Math.min(Math.max(value, 0), 100);
  return (
    <div className="w-full">
      {label && (
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] nx-muted">{label}</span>
          <span className="text-[11px] font-semibold nx-num nx-text">{suffix ?? fmtPct(value, 0)}</span>
        </div>
      )}
      <div className="h-1.5 w-full bg-[#F1F3F8] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${clamped}%`, background: color }} />
      </div>
    </div>
  );
}
