// Dashboard Equipe — performance individual do time comercial.
import { useMemo, useState } from "react";
import { useCockpit } from "../../contexts/CockpitContext";
import { repIdsNoEscopo } from "../../lib/escopo";
import { performanceEquipe, resumoEquipe, type LinhaEquipe } from "../../lib/equipeExec";
import { fmtBRLc, fmtNum, fmtPct, deltaArrow, deltaColor } from "../../styles/tokens";
import { SectionCard } from "../SectionCard";
import { ExecTile, ExecHero } from "../ExecTiles";
import { cn } from "@/lib/utils";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell, ReferenceLine,
} from "recharts";

type Ord = keyof Pick<LinhaEquipe, "receita" | "atingimento" | "cobertura" | "winRate" | "margemPct" | "ticketMedio" | "devolucaoPct">;

const COLS: { key: Ord; label: string; fmt: (l: LinhaEquipe) => string }[] = [
  { key: "receita", label: "Receita", fmt: l => fmtBRLc(l.receita) },
  { key: "atingimento", label: "Meta", fmt: l => (l.meta ? fmtPct(l.atingimento, 0) : "—") },
  { key: "margemPct", label: "Margem %", fmt: l => fmtPct(l.margemPct) },
  { key: "cobertura", label: "Cobertura", fmt: l => fmtPct(l.cobertura, 0) },
  { key: "winRate", label: "Conversão", fmt: l => fmtPct(l.winRate, 0) },
  { key: "ticketMedio", label: "Ticket médio", fmt: l => fmtBRLc(l.ticketMedio) },
  { key: "devolucaoPct", label: "Devolução", fmt: l => fmtPct(l.devolucaoPct) },
];

export function EquipeTab() {
  const { seed, range, previousRange, escopo, diasAtivo, diasPerdido } = useCockpit();
  const [ord, setOrd] = useState<Ord>("receita");

  const linhas = useMemo(() => {
    const ids = repIdsNoEscopo(seed, escopo);
    return performanceEquipe(seed, ids, range, previousRange, diasAtivo, diasPerdido);
  }, [seed, escopo, range, previousRange, diasAtivo, diasPerdido]);

  const resumo = useMemo(() => resumoEquipe(linhas), [linhas]);
  const ordenadas = useMemo(() => [...linhas].sort((a, b) => (b[ord] as number) - (a[ord] as number)), [linhas, ord]);
  const chart = ordenadas.slice(0, 12).map(l => ({
    nome: l.nome.split(" ")[0],
    atingimento: l.atingimento,
    receita: l.receita,
  }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <ExecHero
          label="Receita do time"
          value={fmtBRLc(resumo.receita)}
          delta={resumo.delta}
          detalhe={`Meta somada de ${fmtBRLc(resumo.meta)} no mês corrente.`}
          narrativa={`${resumo.acimaDaMeta} de ${resumo.time} representantes já bateram a meta.`}
        />
        <ExecTile
          label="Atingimento"
          value={fmtPct(resumo.atingimento, 0)}
          tone={resumo.atingimento >= 100 ? "good" : resumo.atingimento < 70 ? "risk" : "neutral"}
          sub="Receita realizada sobre a meta somada do time no mês."
        />
        <ExecTile
          label="Abaixo de 70% da meta"
          value={fmtNum(resumo.abaixoDe70)}
          tone={resumo.abaixoDe70 > 0 ? "risk" : "good"}
          sub="Representantes que precisam de plano de recuperação imediato."
        />
        <ExecTile
          label="Cobertura média"
          value={fmtPct(resumo.coberturaMedia, 0)}
          sub="Percentual médio da carteira de cada representante que comprou no período."
        />
        <ExecTile
          label="Margem gerada"
          value={fmtBRLc(resumo.margem)}
          sub="Margem de contribuição comercial somada do time no período."
        />
      </div>

      <SectionCard title="Atingimento de meta por representante" subtitle="Barra vermelha indica abaixo de 70%">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chart} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid stroke="#F1F3F8" vertical={false} />
            <XAxis dataKey="nome" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} interval={0} angle={-20} textAnchor="end" height={48} />
            <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${Math.round(v)}%`} />
            <Tooltip
              formatter={(v: number, n) => (n === "atingimento" ? fmtPct(v, 0) : fmtBRLc(v))}
              contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #E7E9EE" }}
            />
            <ReferenceLine y={100} stroke="#080846" strokeDasharray="4 4" />
            <Bar dataKey="atingimento" radius={[3, 3, 0, 0]}>
              {chart.map((c, i) => (
                <Cell key={i} fill={c.atingimento >= 100 ? "#0D9488" : c.atingimento < 70 ? "#E11D48" : "#363BB4"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </SectionCard>

      <SectionCard
        title="Placar do time"
        subtitle="Clique num indicador para reordenar"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[860px]">
            <thead className="text-[10px] uppercase nx-muted border-b border-[#E7E9EE]">
              <tr>
                <th className="text-left py-2">Representante</th>
                <th className="text-left">Região</th>
                {COLS.map(c => (
                  <th
                    key={c.key}
                    onClick={() => setOrd(c.key)}
                    className={cn("text-right cursor-pointer select-none hover:text-[#363BB4]", ord === c.key && "text-[#363BB4]")}
                  >
                    {c.label}
                  </th>
                ))}
                <th className="text-right">vs anterior</th>
              </tr>
            </thead>
            <tbody>
              {ordenadas.map(l => (
                <tr key={l.repId} className="border-b border-[#F1F3F8]">
                  <td className="py-2 nx-text truncate max-w-[160px]">{l.nome}</td>
                  <td className="nx-muted">{l.regiao}</td>
                  {COLS.map(c => (
                    <td
                      key={c.key}
                      className={cn(
                        "text-right nx-num",
                        c.key === "atingimento" && l.meta > 0 && l.atingimento < 70 && "text-rose-600 font-medium",
                        c.key === "atingimento" && l.atingimento >= 100 && "text-emerald-600 font-medium",
                        c.key === "devolucaoPct" && l.devolucaoPct > 3 && "text-rose-600",
                      )}
                    >
                      {c.fmt(l)}
                    </td>
                  ))}
                  <td className={cn("text-right nx-num", deltaColor(l.delta))}>
                    {deltaArrow(l.delta)} {fmtPct(Math.abs(l.delta), 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Atividade" subtitle="Esforço registrado no período">
          <table className="w-full text-xs">
            <thead className="text-[10px] uppercase nx-muted border-b border-[#E7E9EE]">
              <tr>
                <th className="text-left py-2">Representante</th>
                <th className="text-right">Atendimentos</th>
                <th className="text-right">Propostas</th>
                <th className="text-right">Ganhas</th>
                <th className="text-right">Último acesso</th>
              </tr>
            </thead>
            <tbody>
              {[...linhas].sort((a, b) => b.atendimentos - a.atendimentos).map(l => (
                <tr key={l.repId} className="border-b border-[#F1F3F8]">
                  <td className="py-1.5 nx-text truncate max-w-[150px]">{l.nome}</td>
                  <td className="text-right nx-num">{fmtNum(l.atendimentos)}</td>
                  <td className="text-right nx-num nx-muted">{fmtNum(l.propostas)}</td>
                  <td className="text-right nx-num nx-text">{fmtNum(l.ganhas)}</td>
                  <td className={cn("text-right nx-num", l.ultimoAcessoDias > 7 ? "text-rose-600" : "nx-muted")}>
                    {l.ultimoAcessoDias}d
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </SectionCard>

        <SectionCard title="Cobertura de carteira" subtitle="Clientes que compraram sobre o total da carteira">
          <div className="space-y-2">
            {[...linhas].sort((a, b) => b.cobertura - a.cobertura).map(l => (
              <div key={l.repId}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="nx-text truncate max-w-[180px]">{l.nome}</span>
                  <span className="nx-num nx-muted">{l.clientesCompraram}/{l.carteira} · {fmtPct(l.cobertura, 0)}</span>
                </div>
                <div className="h-2 rounded bg-[#F1F3F8] overflow-hidden">
                  <div
                    className={cn("h-full rounded", l.cobertura < 30 ? "bg-rose-400" : l.cobertura > 60 ? "bg-emerald-500" : "bg-[#363BB4]")}
                    style={{ width: `${Math.max(2, Math.min(100, l.cobertura))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
