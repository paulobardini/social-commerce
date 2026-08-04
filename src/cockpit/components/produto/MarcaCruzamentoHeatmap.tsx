// Heatmap MARCA × (dimensão do cliente) — receita no período.
// Linhas = marcas · colunas = dimensão escolhida (curva A/B/C, UF, etc.)
// Escala normalizada POR LINHA: mostra onde cada marca concentra receita.
import { fmtBRLc, fmtNum } from "../../styles/tokens";

export interface HeatCell { coluna: string; valor: number; clientes: number; }
export interface HeatRow { marcaId: string; marcaNome: string; cells: HeatCell[]; total: number; }

interface Props {
  rows: HeatRow[];
  colunas: string[];
  legenda?: string;
  onCellClick?: (marcaId: string, coluna: string) => void;
}

export function MarcaCruzamentoHeatmap({ rows, colunas, legenda, onCellClick }: Props) {
  const totalPorColuna = colunas.map(c => rows.reduce((s, r) => s + (r.cells.find(x => x.coluna === c)?.valor ?? 0), 0));
  const totalGeral = totalPorColuna.reduce((s, v) => s + v, 0);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[11px] border-separate border-spacing-1">
        <thead>
          <tr>
            <th className="text-left font-semibold nx-text pr-2 pb-2">Marca</th>
            {colunas.map(c => (
              <th key={c} className="font-semibold nx-text text-center pb-2 px-1 whitespace-nowrap">{c}</th>
            ))}
            <th className="text-right font-semibold nx-text pl-2 pb-2 whitespace-nowrap">Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => {
            const maxLinha = Math.max(1, ...r.cells.map(c => c.valor));
            return (
              <tr key={r.marcaId}>
                <td className="pr-2 py-1 nx-text font-medium whitespace-nowrap">{r.marcaNome}</td>
                {colunas.map(col => {
                  const c = r.cells.find(x => x.coluna === col);
                  const v = c?.valor ?? 0;
                  const intensity = v / maxLinha;
                  const bg = v === 0 ? "#F1F3F8" : `rgba(45, 58, 140, ${0.10 + intensity * 0.85})`;
                  const fg = intensity > 0.55 ? "#fff" : "#0F172A";
                  return (
                    <td key={col} className="p-0">
                      <button
                        type="button"
                        disabled={v === 0}
                        onClick={() => onCellClick?.(r.marcaId, col)}
                        className="w-full h-11 rounded-md text-center flex flex-col items-center justify-center px-1 hover:ring-2 hover:ring-offset-1 hover:ring-[#2D3A8C] transition disabled:cursor-default disabled:hover:ring-0"
                        style={{ background: bg, color: fg }}
                        title={`${r.marcaNome} · ${col}: ${fmtBRLc(v)}${c?.clientes ? ` · ${c.clientes} clientes` : ""}`}
                      >
                        <span className="text-[11px] font-semibold nx-num leading-none">{v === 0 ? "—" : fmtBRLc(v)}</span>
                        {c && c.clientes > 0 && (
                          <span className="text-[9px] opacity-80 nx-num">{fmtNum(c.clientes)} cli</span>
                        )}
                      </button>
                    </td>
                  );
                })}
                <td className="pl-2 nx-num font-semibold text-right nx-text whitespace-nowrap">{fmtBRLc(r.total)}</td>
              </tr>
            );
          })}
          <tr>
            <td className="pr-2 pt-2 text-[10px] uppercase nx-muted font-medium">Total coluna</td>
            {totalPorColuna.map((v, i) => (
              <td key={i} className="text-center pt-2 text-[10px] nx-num nx-muted whitespace-nowrap">{fmtBRLc(v)}</td>
            ))}
            <td className="text-right pt-2 pl-2 text-[10px] nx-num nx-text font-semibold whitespace-nowrap">{fmtBRLc(totalGeral)}</td>
          </tr>
        </tbody>
      </table>
      {legenda && <p className="text-[10px] nx-muted mt-2">{legenda}</p>}
    </div>
  );
}
