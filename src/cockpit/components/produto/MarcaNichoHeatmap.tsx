// Heatmap MARCA × NICHO (receita no período).
// Linhas = marcas · colunas = nichos com nome completo · escala normalizada POR LINHA
// (contraste real: qual nicho puxa cada marca), com totais e célula clicável.
import { fmtBRLc, fmtNum } from "../../styles/tokens";
import type { Nicho } from "../../data/seed";

interface Cell { nicho: Nicho; valor: number; clientes: number; }
interface Row { marcaId: string; marcaNome: string; cells: Cell[]; total: number; }

interface Props {
  rows: Row[];
  nichos: Nicho[];
  onCellClick?: (marcaId: string, nicho: Nicho) => void;
}

export function MarcaNichoHeatmap({ rows, nichos, onCellClick }: Props) {
  const totalPorNicho = nichos.map(n => rows.reduce((s, r) => s + (r.cells.find(c => c.nicho === n)?.valor ?? 0), 0));
  const totalGeral = totalPorNicho.reduce((s, v) => s + v, 0);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[11px] border-separate border-spacing-1">
        <thead>
          <tr>
            <th className="text-left font-semibold nx-text pr-2 pb-2">Marca</th>
            {nichos.map(n => (
              <th key={n} className="font-semibold nx-text text-center pb-2 px-1 whitespace-nowrap">{n}</th>
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
                {nichos.map(n => {
                  const c = r.cells.find(x => x.nicho === n);
                  const v = c?.valor ?? 0;
                  const intensity = v / maxLinha;
                  const bg = v === 0 ? "#F1F3F8" : `rgba(45, 58, 140, ${0.10 + intensity * 0.85})`;
                  const fg = intensity > 0.55 ? "#fff" : "#0F172A";
                  return (
                    <td key={n} className="p-0">
                      <button
                        type="button"
                        disabled={v === 0}
                        onClick={() => onCellClick?.(r.marcaId, n)}
                        className="w-full h-11 rounded-md text-center flex flex-col items-center justify-center px-1 hover:ring-2 hover:ring-offset-1 hover:ring-[#2D3A8C] transition disabled:cursor-default disabled:hover:ring-0"
                        style={{ background: bg, color: fg }}
                        title={`${r.marcaNome} · ${n}: ${fmtBRLc(v)}${c?.clientes ? ` · ${c.clientes} clientes` : ""}`}
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
            <td className="pr-2 pt-2 text-[10px] uppercase nx-muted font-medium">Total nicho</td>
            {totalPorNicho.map((v, i) => (
              <td key={i} className="text-center pt-2 text-[10px] nx-num nx-muted whitespace-nowrap">{fmtBRLc(v)}</td>
            ))}
            <td className="text-right pt-2 pl-2 text-[10px] nx-num nx-text font-semibold whitespace-nowrap">{fmtBRLc(totalGeral)}</td>
          </tr>
        </tbody>
      </table>
      <p className="text-[10px] nx-muted mt-2">
        Cor mais escura = nicho onde a marca vende mais (escala por linha). Clique numa célula para listar os clientes daquele nicho que compram essa marca.
      </p>
    </div>
  );
}
