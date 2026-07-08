// DimensionalCard · card de acompanhamento de uma meta (geral ou dimensional).
import type { MetaV2 } from "@/cockpit/data/metasV2";
import { fmtBRLc, fmtPct } from "@/cockpit/styles/tokens";
import { Badge } from "@/components/ui/badge";
import type { VerditoMeta } from "@/cockpit/lib/metasCalc";

const dimensaoLabel: Record<MetaV2["dimensao"], string> = {
  geral: "Meta geral",
  marca: "Marca",
  colecao: "Coleção",
  nicho: "Nicho",
};
const dimensaoBadge: Record<MetaV2["dimensao"], string> = {
  geral: "bg-[#2D3A8C] text-white border-[#2D3A8C]",
  marca: "bg-sky-100 text-sky-800 border-sky-300",
  colecao: "bg-violet-100 text-violet-800 border-violet-300",
  nicho: "bg-amber-100 text-amber-800 border-amber-300",
};

interface Props {
  meta: MetaV2;
  realizado: number;
  veredito: VerditoMeta;
  breakdownReps?: { repNome: string; alvo: number; realizado: number }[];
}

export function DimensionalCard({ meta, realizado, veredito, breakdownReps }: Props) {
  const pctReal = meta.valorAgregado > 0 ? (realizado / meta.valorAgregado) * 100 : 0;
  const barClass =
    veredito.cor === "emerald" ? "bg-emerald-500"
      : veredito.cor === "amber" ? "bg-amber-500"
        : "bg-rose-500";
  const bannerClass =
    veredito.cor === "emerald" ? "bg-emerald-50 text-emerald-800 border-emerald-200"
      : veredito.cor === "amber" ? "bg-amber-50 text-amber-800 border-amber-200"
        : "bg-rose-50 text-rose-800 border-rose-200";

  return (
    <div className="nx-card p-3 space-y-2">
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className={`text-[10px] ${dimensaoBadge[meta.dimensao]}`}>
            {dimensaoLabel[meta.dimensao]}
          </Badge>
          {meta.alvoId && <span className="text-sm font-semibold nx-text">{meta.alvoId}</span>}
          {meta.status === "rascunho" && (
            <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-300">Rascunho</Badge>
          )}
        </div>
        <span className="text-[11px] nx-muted">
          <span className="nx-num nx-text font-semibold">{fmtBRLc(realizado)}</span> / {fmtBRLc(meta.valorAgregado)}
        </span>
      </div>

      <div className="space-y-1">
        <div className="h-2 rounded-full bg-[#F1F3F8] overflow-hidden">
          <div className={`h-full ${barClass}`} style={{ width: `${Math.min(100, pctReal)}%` }} />
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span className="nx-muted">Realizado {fmtPct(pctReal, 0)}</span>
          <span className={`font-medium ${veredito.cor === "emerald" ? "text-emerald-700" : veredito.cor === "amber" ? "text-amber-700" : "text-rose-700"}`}>
            Pace projetado {fmtPct(veredito.pct, 0)}
          </span>
        </div>
      </div>

      <div className={`text-[11px] px-2 py-1.5 rounded border ${bannerClass}`}>{veredito.texto}</div>

      {breakdownReps && breakdownReps.length > 0 && (
        <div className="pt-1 border-t border-[#F1F3F8] space-y-1">
          <p className="text-[10px] uppercase nx-muted tracking-wide">Rateio · realizado por rep</p>
          {breakdownReps.map(b => {
            const pct = b.alvo > 0 ? (b.realizado / b.alvo) * 100 : 0;
            return (
              <div key={b.repNome} className="flex items-center gap-2 text-[11px]">
                <span className="nx-text flex-1 truncate">{b.repNome}</span>
                <div className="w-20 h-1.5 bg-[#F1F3F8] rounded-full overflow-hidden">
                  <div className={`h-full ${pct >= 100 ? "bg-emerald-500" : pct >= 85 ? "bg-amber-500" : "bg-rose-500"}`} style={{ width: `${Math.min(100, pct)}%` }} />
                </div>
                <span className="nx-num nx-muted w-14 text-right">{fmtBRLc(b.realizado)}</span>
                <span className="nx-num nx-muted w-14 text-right">/ {fmtBRLc(b.alvo)}</span>
                <span className={`w-10 text-right font-medium ${pct >= 100 ? "text-emerald-700" : pct >= 85 ? "text-amber-700" : "text-rose-700"}`}>{fmtPct(pct, 0)}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
