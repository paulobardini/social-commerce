// Dashboard Marketing (visão gestor) — inbound x outbound, CPL, CAC e ROAS real.
import { useMemo } from "react";
import { resumoMarketing, funilMarketing, porCanal, porCampanha, serieMarketing } from "../../lib/marketingExec";
import { fmtBRL, fmtBRLc, fmtNum, fmtPct } from "../../styles/tokens";
import { SectionCard } from "../SectionCard";
import { ExecTile, ExecHero } from "../ExecTiles";
import { LeadsBloco } from "./LeadsBloco";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from "recharts";

export function MarketingTab() {
  const r = useMemo(() => resumoMarketing(), []);
  const funil = useMemo(() => funilMarketing(), []);
  const canais = useMemo(() => porCanal(), []);
  const campanhas = useMemo(() => porCampanha(), []);
  const serie = useMemo(() => serieMarketing(), []);
  const topoFunil = funil[0]?.valor || 1;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <ExecHero
          label="Receita gerada por marketing"
          value={fmtBRLc(r.receitaConfirmada)}
          delta={r.receitaConfirmadaPrev ? ((r.receitaConfirmada - r.receitaConfirmadaPrev) / r.receitaConfirmadaPrev) * 100 : 0}
          detalhe="Somente pedidos confirmados no CRM cujo cliente veio de um lead de marketing."
          narrativa={`De ${fmtBRLc(r.receitaAtribuida)} atribuídos, esta é a parte já confirmada em pedido.`}
        />
        <ExecTile
          label="Investimento"
          value={fmtBRLc(r.investimento)}
          delta={r.investimentoPrev ? ((r.investimento - r.investimentoPrev) / r.investimentoPrev) * 100 : 0}
          sub="Verba de mídia gasta nas campanhas ativas do período."
        />
        <ExecTile
          label="ROAS"
          value={`${r.roas.toFixed(2).replace(".", ",")}x`}
          delta={r.roasPrev ? ((r.roas - r.roasPrev) / r.roasPrev) * 100 : 0}
          tone={r.roas >= 3 ? "good" : r.roas < 1.5 ? "risk" : "neutral"}
          sub="Receita confirmada dividida pelo investimento em mídia."
        />
        <ExecTile
          label="Custo por lead"
          value={fmtBRL(r.cpl)}
          delta={r.cplPrev ? ((r.cpl - r.cplPrev) / r.cplPrev) * 100 : 0}
          invert
          sub={`${fmtNum(r.leads)} leads gerados no período.`}
        />
        <ExecTile
          label="Custo por cliente"
          value={fmtBRL(r.cac)}
          invert
          sub={`Investimento dividido pelos ${fmtNum(r.leadsGanhos)} leads que viraram pedido.`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionCard title="Do lead ao pedido" subtitle="Conversão acumulada do funil de marketing">
          <div className="space-y-2.5">
            {funil.map((f, i) => (
              <div key={f.etapa}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="nx-text">{f.etapa}</span>
                  <span className="nx-num nx-muted">{fmtNum(f.valor)} · {fmtPct((f.valor / topoFunil) * 100, 0)}</span>
                </div>
                <div className="h-6 rounded bg-[#F1F3F8] overflow-hidden">
                  <div
                    className="h-full rounded"
                    style={{
                      width: `${Math.max(3, (f.valor / topoFunil) * 100)}%`,
                      background: ["#080846", "#363BB4", "#0EA5E9", "#0D9488"][i],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-[#F1F3F8]">
            <div>
              <p className="text-[10px] uppercase nx-muted">Inbound</p>
              <p className="text-lg nx-num nx-text">{fmtNum(r.inbound)}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase nx-muted">Outbound / direto</p>
              <p className="text-lg nx-num nx-text">{fmtNum(r.outbound)}</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard className="lg:col-span-2" title="Investimento, leads e receita" subtitle="Evolução mensal">
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={serie} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid stroke="#F1F3F8" vertical={false} />
              <XAxis dataKey="mes" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="l" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => fmtBRLc(v)} />
              <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(v: number, n) => (n === "Leads" ? fmtNum(v) : fmtBRLc(v))}
                contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #E7E9EE" }}
              />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar yAxisId="l" dataKey="investimento" name="Investimento" fill="#C7CBF0" radius={[3, 3, 0, 0]} />
              <Bar yAxisId="l" dataKey="receita" name="Receita" fill="#363BB4" radius={[3, 3, 0, 0]} />
              <Line yAxisId="r" dataKey="leads" name="Leads" stroke="#0EA5E9" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      <LeadsBloco />



      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Desempenho por canal" subtitle="Onde o lead nasceu">
          <table className="w-full text-xs">
            <thead className="text-[10px] uppercase nx-muted border-b border-[#E7E9EE]">
              <tr>
                <th className="text-left py-2">Canal</th>
                <th className="text-right">Leads</th>
                <th className="text-right">CPL</th>
                <th className="text-right">Conversão</th>
                <th className="text-right">Receita</th>
                <th className="text-right">ROAS</th>
              </tr>
            </thead>
            <tbody>
              {canais.map(c => (
                <tr key={c.canal} className="border-b border-[#F1F3F8]">
                  <td className="py-2">
                    <span className="inline-flex items-center gap-1.5 nx-text">
                      <span className="w-2 h-2 rounded-full" style={{ background: c.cor }} />
                      {c.label}
                    </span>
                  </td>
                  <td className="text-right nx-num">{fmtNum(c.leads)}</td>
                  <td className="text-right nx-num nx-muted">{c.cpl ? fmtBRL(c.cpl) : "—"}</td>
                  <td className="text-right nx-num">{fmtPct(c.conversao, 0)}</td>
                  <td className="text-right nx-num nx-text">{fmtBRLc(c.receita)}</td>
                  <td className={cn("text-right nx-num font-medium", c.roas >= 3 ? "text-emerald-600" : c.roas < 1.5 ? "text-rose-600" : "nx-text")}>
                    {c.custo ? `${c.roas.toFixed(1).replace(".", ",")}x` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </SectionCard>

        <SectionCard title="Campanhas" subtitle="Ordenadas por investimento">
          <div className="max-h-[300px] overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="text-[10px] uppercase nx-muted border-b border-[#E7E9EE] sticky top-0 bg-white">
                <tr>
                  <th className="text-left py-2">Campanha</th>
                  <th className="text-right">Investido</th>
                  <th className="text-right">Leads</th>
                  <th className="text-right">CPL</th>
                  <th className="text-right">ROAS</th>
                </tr>
              </thead>
              <tbody>
                {campanhas.map(c => (
                  <tr key={c.id} className="border-b border-[#F1F3F8]">
                    <td className="py-2 nx-text truncate max-w-[180px]">
                      {c.nome}
                      {c.status !== "active" && <Badge variant="outline" className="ml-1.5 text-[9px]">pausada</Badge>}
                    </td>
                    <td className="text-right nx-num nx-muted">{fmtBRLc(c.investido)}</td>
                    <td className="text-right nx-num">{fmtNum(c.leads)}</td>
                    <td className="text-right nx-num nx-muted">{fmtBRL(c.cpl)}</td>
                    <td className={cn("text-right nx-num font-medium", c.roas >= 3 ? "text-emerald-600" : c.roas < 1.5 ? "text-rose-600" : "nx-text")}>
                      {c.roas.toFixed(1).replace(".", ",")}x
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
