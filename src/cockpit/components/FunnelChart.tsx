import { fmtNum, fmtPct, NX, fmtBRLc } from "../styles/tokens";

interface Etapa { etapa: string; valor: number; receita?: number; }

export function FunnelChart({ etapas, taxas, money = false, color = NX.primary }: {
  etapas: Etapa[]; taxas?: (number | null)[]; money?: boolean; color?: string;
}) {
  const max = Math.max(1, ...etapas.map(e => e.valor));
  return (
    <div className="space-y-2">
      {etapas.map((e, i) => {
        const w = (e.valor / max) * 100;
        return (
          <div key={e.etapa}>
            {i > 0 && taxas && taxas[i] !== null && taxas[i] !== undefined && (
              <p className="text-[10px] nx-muted mb-0.5 ml-3">↓ Conversão {fmtPct(taxas[i]!, 0)}</p>
            )}
            <div className="relative h-9 bg-[#F1F3F8] rounded-md overflow-hidden">
              <div className="h-full flex items-center px-3 transition-all" style={{ width: `${Math.max(w, 12)}%`, background: color, color: "#fff" }}>
                <span className="text-[11px] font-medium truncate">{e.etapa}</span>
              </div>
              <div className="absolute inset-y-0 right-3 flex items-center gap-3 text-[11px] nx-text">
                {money && e.receita !== undefined && <span className="nx-muted nx-num">{fmtBRLc(e.receita)}</span>}
                <span className="font-semibold nx-num">{fmtNum(e.valor)}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
