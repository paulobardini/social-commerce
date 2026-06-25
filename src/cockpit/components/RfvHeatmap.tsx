import { RfvCell, SEGMENTO_COLORS, type RfvSegmento } from "../lib/rfv";
import { fmtNum } from "../styles/tokens";

const SEGMENTOS: RfvSegmento[] = ["Campeões", "Fiéis", "Em risco", "Hibernando", "Novos", "Regulares"];

export function RfvHeatmap({ cells }: { cells: RfvCell[] }) {
  // grid 5×5: linhas = R (5→1 topo→base), colunas = F (1→5 esq→dir)
  const grid: Record<string, RfvCell[]> = {};
  for (let r = 1; r <= 5; r++) for (let f = 1; f <= 5; f++) grid[`${r}-${f}`] = [];
  cells.forEach(c => grid[`${c.r}-${c.f}`].push(c));
  const maxN = Math.max(1, ...Object.values(grid).map(g => g.length));

  // Segmento dominante por célula → cor
  function corCelula(arr: RfvCell[]): { bg: string; n: number } {
    if (arr.length === 0) return { bg: "#F1F3F8", n: 0 };
    const map = new Map<RfvSegmento, number>();
    arr.forEach(c => map.set(c.segmento, (map.get(c.segmento) ?? 0) + 1));
    const top = [...map.entries()].sort((a, b) => b[1] - a[1])[0][0];
    const intensity = 0.35 + (arr.length / maxN) * 0.65;
    return { bg: SEGMENTO_COLORS[top] + Math.round(intensity * 255).toString(16).padStart(2, "0"), n: arr.length };
  }

  // Contagens por segmento
  const contagem = SEGMENTOS.map(s => ({ segmento: s, n: cells.filter(c => c.segmento === s).length }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-4">
      <div>
        <div className="flex">
          <div className="flex flex-col items-center justify-center mr-2">
            <span className="text-[10px] nx-muted -rotate-90 whitespace-nowrap mt-12">Recência →</span>
          </div>
          <div className="flex-1">
            <div className="grid grid-cols-5 gap-1.5">
              {[5,4,3,2,1].map(r =>
                [1,2,3,4,5].map(f => {
                  const cel = corCelula(grid[`${r}-${f}`]);
                  return (
                    <div key={`${r}-${f}`} className="aspect-square rounded-md flex items-center justify-center text-[11px] font-semibold nx-num"
                         style={{ background: cel.bg, color: cel.n > maxN/2 ? "#fff" : "#0F172A" }}
                         title={`R${r} F${f}: ${cel.n} clientes`}>
                      {cel.n > 0 ? cel.n : ""}
                    </div>
                  );
                })
              )}
            </div>
            <div className="grid grid-cols-5 gap-1.5 mt-1.5 text-center text-[10px] nx-muted">
              <span>F1</span><span>F2</span><span>F3</span><span>F4</span><span>F5</span>
            </div>
            <p className="text-center text-[10px] nx-muted mt-0.5">Frequência →</p>
          </div>
        </div>
      </div>
      <div className="space-y-1.5">
        <p className="text-[10px] uppercase tracking-wide nx-muted font-medium mb-1.5">Segmentos</p>
        {contagem.map(({ segmento, n }) => (
          <div key={segmento} className="flex items-center justify-between bg-[#F6F7F9] rounded-md px-2.5 py-1.5">
            <span className="flex items-center gap-1.5 text-xs">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: SEGMENTO_COLORS[segmento] }} />
              {segmento}
            </span>
            <span className="text-xs font-semibold nx-num nx-text">{fmtNum(n)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
