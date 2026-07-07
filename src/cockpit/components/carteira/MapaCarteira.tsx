// MAPA DA CARTEIRA — Valor (Grandes/Médios/Pequenos) × Situação (Ativo/Em risco/Inativo/Perdido).
// Substitui a Matriz RFV com eixos nomeados, cor por criticidade e insight destacado.
import { useMemo } from "react";
import type { ContaClassificada } from "../../lib/classificar";
import { fmtBRLc, fmtNum } from "../../styles/tokens";

export type FaixaValor = "Grandes" | "Médios" | "Pequenos";
export type SituacaoCol = "Ativo" | "Em risco" | "Inativo" | "Perdido";

const COLS: SituacaoCol[] = ["Ativo", "Em risco", "Inativo", "Perdido"];
const ROWS: FaixaValor[] = ["Grandes", "Médios", "Pequenos"];

// Cor por criticidade — quanto maior o valor e pior a situação, mais vermelho.
function corCelula(faixa: FaixaValor, sit: SituacaoCol, n: number): { bg: string; fg: string } {
  if (n === 0) return { bg: "#F1F3F8", fg: "#94A3B8" };
  const grid: Record<FaixaValor, Record<SituacaoCol, string>> = {
    Grandes:  { "Ativo": "#16A34A", "Em risco": "#DC2626", "Inativo": "#991B1B", "Perdido": "#7F1D1D" },
    "Médios": { "Ativo": "#4ADE80", "Em risco": "#F59E0B", "Inativo": "#DC2626", "Perdido": "#991B1B" },
    Pequenos: { "Ativo": "#86EFAC", "Em risco": "#FBBF24", "Inativo": "#F59E0B", "Perdido": "#DC2626" },
  };
  const bg = grid[faixa][sit];
  // texto branco em fundos escuros
  const escuros = ["#16A34A", "#DC2626", "#991B1B", "#7F1D1D", "#F59E0B"];
  return { bg, fg: escuros.includes(bg) ? "#fff" : "#0F172A" };
}

function faixaValor(valores: number[]): { p66: number; p33: number } {
  const sorted = [...valores].sort((a, b) => b - a);
  return {
    p66: sorted[Math.floor(sorted.length * 0.2)] ?? 0,  // top 20% = Grandes
    p33: sorted[Math.floor(sorted.length * 0.5)] ?? 0,  // top 50% = Médios; resto = Pequenos
  };
}

function classificaFaixa(v: number, cortes: { p66: number; p33: number }): FaixaValor {
  if (v >= cortes.p66) return "Grandes";
  if (v >= cortes.p33) return "Médios";
  return "Pequenos";
}

function situacaoDe(c: ContaClassificada, diasAtivo: number, diasPerdido: number): SituacaoCol {
  if (c.status === "perdido") return "Perdido";
  if (c.status === "inativo") return "Inativo";
  if (c.status === "ativo") {
    // Em risco = ativo com recência entre 70% do limite de "ativo" e o limite
    if (c.recencia > diasAtivo * 0.7) return "Em risco";
    return "Ativo";
  }
  return "Em risco"; // lead residual
}

interface Props {
  classificadas: ContaClassificada[];
  diasAtivo: number;
  diasPerdido: number;
  onCellClick?: (faixa: FaixaValor, sit: SituacaoCol, contas: ContaClassificada[]) => void;
}

export function MapaCarteira({ classificadas, diasAtivo, diasPerdido, onCellClick }: Props) {
  const dados = useMemo(() => {
    const ativos = classificadas.filter(c => c.valor12m > 0 || c.status !== "lead");
    const cortes = faixaValor(ativos.map(c => c.valor12m));
    // grid[faixa][sit] = ContaClassificada[]
    const grid: Record<FaixaValor, Record<SituacaoCol, ContaClassificada[]>> = {
      Grandes:  { Ativo: [], "Em risco": [], Inativo: [], Perdido: [] },
      "Médios": { Ativo: [], "Em risco": [], Inativo: [], Perdido: [] },
      Pequenos: { Ativo: [], "Em risco": [], Inativo: [], Perdido: [] },
    };
    for (const c of ativos) {
      const faixa = classificaFaixa(c.valor12m, cortes);
      const sit = situacaoDe(c, diasAtivo, diasPerdido);
      grid[faixa][sit].push(c);
    }
    return grid;
  }, [classificadas, diasAtivo, diasPerdido]);

  // Insight destacado: célula crítica (grandes escorregando)
  const criticaGrandes = [...dados["Grandes"]["Em risco"], ...dados["Grandes"]["Inativo"]];
  const valorCritico = criticaGrandes.reduce((s, c) => s + c.valor12m, 0);

  return (
    <div className="space-y-3">
      {valorCritico > 0 && (
        <div className="p-2.5 rounded-md bg-rose-50 border border-rose-200 text-[12px] text-rose-800">
          <span className="font-semibold">{fmtBRLc(valorCritico)}</span> em clientes grandes escorregando (em risco ou inativos) — {criticaGrandes.length} clientes.
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-[11px] border-separate border-spacing-1">
          <thead>
            <tr>
              <th className="text-left font-medium nx-muted pr-2 pb-1.5">Valor do cliente</th>
              {COLS.map(c => (
                <th key={c} className="font-semibold text-center pb-1.5" style={{ color: "#0F172A" }}>{c}</th>
              ))}
              <th className="text-right font-medium nx-muted pl-2 pb-1.5">Total</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map(faixa => {
              const totalLinha = COLS.reduce((s, c) => s + dados[faixa][c].length, 0);
              return (
                <tr key={faixa}>
                  <td className="pr-2 py-1 nx-text font-semibold whitespace-nowrap align-middle">{faixa}</td>
                  {COLS.map(sit => {
                    const arr = dados[faixa][sit];
                    const soma = arr.reduce((s, c) => s + c.valor12m, 0);
                    const { bg, fg } = corCelula(faixa, sit, arr.length);
                    const critico = (faixa === "Grandes" && (sit === "Em risco" || sit === "Inativo" || sit === "Perdido"));
                    return (
                      <td key={sit} className="p-0">
                        <button
                          type="button"
                          disabled={arr.length === 0}
                          onClick={() => onCellClick?.(faixa, sit, arr)}
                          className="w-full h-16 rounded-md text-left px-2 py-1 flex flex-col justify-center hover:ring-2 hover:ring-offset-1 hover:ring-[#2D3A8C] transition disabled:cursor-default disabled:hover:ring-0"
                          style={{ background: bg, color: fg }}
                          title={`${faixa} · ${sit}: ${arr.length} clientes · ${fmtBRLc(soma)}`}
                        >
                          <span className={`text-lg font-bold leading-none nx-num ${critico ? "" : ""}`}>{fmtNum(arr.length)}</span>
                          <span className="text-[10px] nx-num opacity-90">{fmtBRLc(soma)}</span>
                        </button>
                      </td>
                    );
                  })}
                  <td className="pl-2 nx-num font-semibold text-right nx-text">{fmtNum(totalLinha)}</td>
                </tr>
              );
            })}
            <tr>
              <td className="pr-2 pt-1 text-[10px] nx-muted">Total</td>
              {COLS.map(sit => {
                const n = ROWS.reduce((s, f) => s + dados[f][sit].length, 0);
                return <td key={sit} className="text-center pt-1 text-[10px] nx-num nx-muted">{fmtNum(n)}</td>;
              })}
              <td />
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-[10px] nx-muted">
        Linhas: faixa de valor do cliente nos últimos 12 meses (top 20% Grandes · próximos 30% Médios · demais Pequenos).
        Colunas: situação atual pela régua de saúde do sistema.
      </p>
    </div>
  );
}
