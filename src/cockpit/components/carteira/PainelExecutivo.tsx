// Faixa executiva da Carteira — leitura de diretoria (receita, risco, concentração).
import { useMemo } from "react";
import { Info } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, Cell, ReferenceLine,
} from "recharts";
import { useCockpit } from "../../contexts/CockpitContext";
import { repIdsNoEscopo } from "../../lib/escopo";
import { classificarTudo } from "../../lib/classificar";
import {
  resumoExecutivo, ponteReceita, concentracao, riscoReceita, serieReceitaMensal, receitaPorRegiao,
} from "../../lib/executivo";
import { NX, fmtBRLc, fmtNum, fmtPct, deltaArrow, deltaColor } from "../../styles/tokens";
import { SectionCard } from "../SectionCard";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function Tile({ label, value, sub, tone = "neutral" }: { label: string; value: string; sub?: string; tone?: "neutral" | "risk" | "good" }) {
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn(
            "rounded-lg px-3 py-3 border cursor-help h-full flex flex-col",
            tone === "risk" ? "bg-rose-50/70 border-rose-100" : tone === "good" ? "bg-emerald-50/70 border-emerald-100" : "bg-[#F6F7F9] border-[#E7E9EE]",
          )}>
            <div className="flex items-start justify-between gap-2 mb-2">
              <p className="text-[10px] uppercase tracking-wide nx-muted leading-tight">{label}</p>
              {sub && <Info className="w-3.5 h-3.5 nx-muted shrink-0 mt-0.5 opacity-70 hover:opacity-100 transition-opacity" />}
            </div>
            <p className="text-3xl font-semibold nx-num nx-text leading-none mt-auto">{value}</p>
          </div>
        </TooltipTrigger>
        {sub && (
          <TooltipContent side="bottom" align="start" className="max-w-[220px] bg-white border border-[#E7E9EE] shadow-md">
            <p className="text-xs nx-text leading-snug">{sub}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}

export function PainelExecutivo() {
  const { seed, escopo, range, previousRange, diasAtivo, diasPerdido } = useCockpit();

  const d = useMemo(() => {
    const ids = repIdsNoEscopo(seed, escopo);
    const contas = seed.contas.filter(c => ids.has(c.repId));
    const pedidos = seed.pedidos.filter(p => ids.has(p.repId));
    const classificadas = classificarTudo(contas, pedidos, range, diasAtivo, diasPerdido, seed.hoje);
    return {
      resumo: resumoExecutivo(pedidos, range, previousRange),
      ponte: ponteReceita(pedidos, range, previousRange),
      conc: concentracao(classificadas),
      risco: riscoReceita(classificadas, diasAtivo),
      serie: serieReceitaMensal(pedidos, seed.hoje),
      regioes: receitaPorRegiao(seed, pedidos, range, previousRange),
      baseTotal: classificadas.length,
    };
  }, [seed, escopo, range, previousRange, diasAtivo, diasPerdido]);

  const { resumo, ponte, conc, risco, serie, regioes, baseTotal } = d;

  const cobertura = baseTotal ? (resumo.clientesCompraram / baseTotal) * 100 : 0;
  const deltaClientes = resumo.clientesCompraramPrev
    ? ((resumo.clientesCompraram - resumo.clientesCompraramPrev) / resumo.clientesCompraramPrev) * 100
    : 0;
  const ticketCliente = resumo.clientesCompraram ? resumo.receitaAtual / resumo.clientesCompraram : 0;
  const pedidosPorCliente = resumo.clientesCompraram ? resumo.pedidos / resumo.clientesCompraram : 0;


  const bars = ponte.map((pt, i) => {
    if (pt.tipo === "total") return { ...pt, base: 0, top: pt.acumulado, mostrado: pt.acumulado };
    const acAnterior = i > 0 ? ponte[i - 1].acumulado : 0;
    const base = pt.valor >= 0 ? acAnterior : acAnterior + pt.valor;
    return { ...pt, base, top: Math.abs(pt.valor), mostrado: pt.valor };
  });

  const narrativa = (() => {
    const dir = resumo.deltaReceita >= 0 ? "acima" : "abaixo";
    const maior = ponte.filter(p => p.tipo !== "total").sort((a, b) => Math.abs(b.valor) - Math.abs(a.valor))[0];
    return `Receita ${fmtPct(Math.abs(resumo.deltaReceita))} ${dir} do período anterior. O maior efeito veio de "${maior?.label ?? "—"}" (${fmtBRLc(maior?.valor ?? 0)}). ${fmtBRLc(risco.emRisco)} de receita anual está em clientes parados.`;
  })();

  return (
    <div className="space-y-4">
      <div className="nx-card p-4">
        <div className="flex flex-col lg:flex-row lg:items-stretch gap-4">
          <div className="lg:w-[260px] shrink-0">
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="rounded-lg px-3 py-3 border bg-[#F6F7F9] border-[#E7E9EE] cursor-help h-full flex flex-col">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-[10px] uppercase tracking-wide nx-muted leading-tight">Receita no período</p>
                      <Info className="w-3.5 h-3.5 nx-muted shrink-0 mt-0.5 opacity-70 hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="flex items-end gap-2 mt-auto">
                      <p className="text-4xl font-semibold nx-num nx-text leading-none">{fmtBRLc(resumo.receitaAtual)}</p>
                      <span className={cn("text-sm font-medium nx-num pb-0.5", deltaColor(resumo.deltaReceita))}>
                        {deltaArrow(resumo.deltaReceita)} {fmtPct(Math.abs(resumo.deltaReceita))}
                      </span>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" align="start" className="max-w-[260px] bg-white border border-[#E7E9EE] shadow-md">
                  <p className="text-xs nx-text leading-snug">
                    vs {fmtBRLc(resumo.receitaAnterior)} no período anterior · {fmtNum(resumo.pedidos)} pedidos · ticket {fmtBRLc(resumo.ticketPedido)}
                  </p>
                  <p className="text-xs nx-muted leading-snug mt-1.5">{narrativa}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>


          <div className="flex-1 grid grid-cols-2 xl:grid-cols-4 gap-2.5">
            <Tile label="Clientes que compraram" value={fmtNum(resumo.clientesCompraram)}
              sub={`${deltaArrow(deltaClientes)} ${fmtPct(Math.abs(deltaClientes), 0)} vs período anterior`}
              tone={deltaClientes >= 0 ? "good" : "risk"} />
            <Tile label="Cobertura da carteira" value={fmtPct(cobertura, 0)}
              sub={`da base de ${fmtNum(baseTotal)} clientes comprou no período`}
              tone={cobertura < 40 ? "risk" : "neutral"} />
            <Tile label="Ticket médio por cliente" value={fmtBRLc(ticketCliente)}
              sub={`${pedidosPorCliente.toFixed(1)} pedidos por cliente · ticket pedido ${fmtBRLc(resumo.ticketPedido)}`} />
            <Tile label="Concentração" value={fmtPct(conc.top10Share, 0)}
              sub={`nos 10 maiores · ${fmtNum(conc.clientesMetadeReceita)} clientes = metade da receita`}
              tone={conc.top10Share > 40 ? "risk" : "neutral"} />

          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionCard className="lg:col-span-2" title="O que explica a variação de receita"
          subtitle="Do período anterior ao atual, por origem do movimento">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={bars} margin={{ top: 8, right: 8, left: 0, bottom: 4 }} stackOffset="sign">
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: NX.muted }} interval={0} />
              <YAxis tick={{ fontSize: 10, fill: NX.muted }} tickFormatter={(v) => fmtBRLc(v)} width={58} />
              <RechartsTooltip
                contentStyle={{ background: "#fff", border: "1px solid #E7E9EE", borderRadius: 8, fontSize: 12 }}
                formatter={(_v: number, _n: any, p: any) => [fmtBRLc(p.payload.mostrado), p.payload.label]}
              />
              <Bar dataKey="base" stackId="a" fill="transparent" />
              <Bar dataKey="top" stackId="a" radius={[3, 3, 0, 0]}>
                {bars.map((b, i) => (
                  <Cell key={i} fill={b.tipo === "total" ? "#475569" : b.tipo === "positivo" ? "#16A34A" : "#DC2626"} />
                ))}
              </Bar>
              <ReferenceLine y={0} stroke={NX.muted} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Receita dos últimos 12 meses" subtitle="Tendência da base no escopo selecionado">
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={serie} margin={{ top: 8, right: 6, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradExec" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={NX.primary} stopOpacity={0.28} />
                  <stop offset="100%" stopColor={NX.primary} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis dataKey="mes" tick={{ fontSize: 9, fill: NX.muted }} interval={1} />
              <YAxis hide />
              <RechartsTooltip
                contentStyle={{ background: "#fff", border: "1px solid #E7E9EE", borderRadius: 8, fontSize: 12 }}
                formatter={(v: number) => [fmtBRLc(v), "Receita"]}
              />
              <Area type="monotone" dataKey="receita" stroke={NX.primary} strokeWidth={2} fill="url(#gradExec)" />
            </AreaChart>
          </ResponsiveContainer>

          <div className="mt-3 pt-3 border-t border-[#E7E9EE]">
            <p className="text-[10px] uppercase tracking-wide nx-muted mb-2">Receita por região</p>
            <div className="space-y-1.5">
              {regioes.slice(0, 5).map(r => {
                const max = regioes[0]?.atual || 1;
                return (
                  <div key={r.regiao} className="flex items-center gap-2">
                    <span className="text-[11px] nx-text w-24 truncate">{r.regiao}</span>
                    <div className="flex-1 h-2 rounded-full bg-[#EEF0F4] overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(r.atual / max) * 100}%`, background: NX.primary }} />
                    </div>
                    <span className="text-[11px] nx-num nx-text w-14 text-right">{fmtBRLc(r.atual)}</span>
                    <span className={cn("text-[10px] nx-num w-12 text-right", deltaColor(r.delta))}>
                      {deltaArrow(r.delta)} {fmtPct(Math.abs(r.delta), 0)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
