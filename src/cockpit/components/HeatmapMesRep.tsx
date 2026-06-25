import { fmtBRLc } from "../styles/tokens";

interface Row { rep: string; cells: { mes: string; valor: number }[]; }

export function HeatmapMesRep({ data }: { data: Row[] }) {
  const max = Math.max(1, ...data.flatMap(r => r.cells.map(c => c.valor)));
  const meses = data[0]?.cells.map(c => c.mes) ?? [];
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[11px]">
        <thead>
          <tr>
            <th className="text-left font-medium nx-muted pr-2 pb-1.5">Representante</th>
            {meses.map(m => <th key={m} className="font-medium nx-muted text-center pb-1.5 capitalize">{m}</th>)}
          </tr>
        </thead>
        <tbody>
          {data.map(r => (
            <tr key={r.rep}>
              <td className="pr-2 py-0.5 nx-text font-medium whitespace-nowrap">{r.rep}</td>
              {r.cells.map((c, i) => {
                const intensity = c.valor / max;
                const bg = `rgba(45, 58, 140, ${0.08 + intensity * 0.85})`;
                return (
                  <td key={i} className="p-0.5">
                    <div
                      className="h-9 rounded text-center flex items-center justify-center nx-num font-medium"
                      style={{ background: bg, color: intensity > 0.5 ? "#fff" : "#0F172A" }}
                      title={`${r.rep} · ${c.mes}: ${fmtBRLc(c.valor)}`}
                    >
                      {fmtBRLc(c.valor)}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
