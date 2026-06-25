import { useMemo } from "react";
import { useCockpit } from "../contexts/CockpitContext";
import { classificarTudo } from "../lib/classificar";
import { STATUS_COLORS, fmtNum, fmtPct, deltaArrow, deltaColor } from "../styles/tokens";

export function SaudeCarteiraBar({ filtroRepId }: { filtroRepId?: string }) {
  const { seed, range, previousRange, diasAtivo, diasPerdido, comparar } = useCockpit();

  const calc = useMemo(() => {
    const contas = filtroRepId ? seed.contas.filter(c => c.repId === filtroRepId) : seed.contas;
    const pedidos = filtroRepId ? seed.pedidos.filter(p => p.repId === filtroRepId) : seed.pedidos;
    const a = classificarTudo(contas, pedidos, range, diasAtivo, diasPerdido, seed.hoje);
    const p = classificarTudo(contas, pedidos, previousRange, diasAtivo, diasPerdido, seed.hoje);
    const count = (lista: typeof a, st: string) => lista.filter(c => c.status === st).length;
    return {
      ativos: count(a, "ativo"), inativos: count(a, "inativo"), perdidos: count(a, "perdido"),
      ativosPrev: count(p, "ativo"), inativosPrev: count(p, "inativo"), perdidosPrev: count(p, "perdido"),
      total: a.filter(c => c.status !== "lead").length,
    };
  }, [seed, range, previousRange, diasAtivo, diasPerdido, filtroRepId]);

  const { ativos, inativos, perdidos, total, ativosPrev, inativosPrev, perdidosPrev } = calc;
  const tot = total || 1;

  const delta = (a: number, b: number) => b === 0 ? 0 : ((a - b) / Math.abs(b)) * 100;

  const segs = [
    { key: "ativo", label: "Ativos", n: ativos, color: STATUS_COLORS.ativo, d: delta(ativos, ativosPrev), invert: false },
    { key: "inativo", label: "Inativos", n: inativos, color: STATUS_COLORS.inativo, d: delta(inativos, inativosPrev), invert: true },
    { key: "perdido", label: "Perdidos", n: perdidos, color: STATUS_COLORS.perdido, d: delta(perdidos, perdidosPrev), invert: true },
  ];

  return (
    <div className="nx-card p-4">
      <div className="flex items-end justify-between mb-2">
        <div>
          <h2 className="text-sm font-semibold nx-text">Saúde da carteira</h2>
          <p className="text-[11px] nx-muted">{fmtNum(total)} clientes ativos na base · classificação por recência</p>
        </div>
        <div className="text-[11px] nx-muted hidden md:flex gap-3">
          {segs.map(s => (
            <span key={s.key} className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm" style={{ background: s.color }} />
              {s.label}: <span className="nx-num font-semibold nx-text">{fmtNum(s.n)}</span> ({fmtPct((s.n / tot) * 100, 0)})
            </span>
          ))}
        </div>
      </div>

      <div className="flex h-3 w-full rounded-full overflow-hidden bg-[#E7E9EE]">
        {segs.map(s => (
          <div key={s.key} style={{ width: `${(s.n / tot) * 100}%`, background: s.color }} title={`${s.label}: ${s.n}`} />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3 mt-3">
        {segs.map(s => (
          <div key={s.key} className="flex items-center justify-between bg-[#F6F7F9] rounded-lg px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ background: s.color }} />
              <div>
                <p className="text-[10px] uppercase tracking-wide nx-muted leading-none mb-0.5">{s.label}</p>
                <p className="text-base font-semibold nx-num nx-text leading-tight">{fmtNum(s.n)}</p>
              </div>
            </div>
            {comparar && (
              <span className={`text-[11px] font-medium nx-num ${deltaColor(s.d, s.invert)}`}>
                {deltaArrow(s.d)} {fmtPct(Math.abs(s.d), 0)}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
