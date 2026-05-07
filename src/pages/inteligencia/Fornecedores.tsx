import { IMHeader } from "@/components/inteligencia/IMHeader";
import { KpiCard } from "@/components/inteligencia/KpiCard";
import { StatusBadge } from "@/components/inteligencia/StatusBadge";
import { fornecedoresIM, formatBRL, formatPct } from "@/data/mockInteligencia";
import { Trophy, Percent, Repeat, AlertTriangle, Handshake, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, ScatterChart, Scatter, ZAxis } from "recharts";

export default function Fornecedores() {
  const top = [...fornecedoresIM].sort((a, b) => b.receita - a.receita)[0];
  const bestMg = [...fornecedoresIM].sort((a, b) => b.margem - a.margem)[0];
  const bestGiro = [...fornecedoresIM].sort((a, b) => b.sellThrough - a.sellThrough)[0];
  const worst = [...fornecedoresIM].sort((a, b) => b.parados - a.parados)[0];

  return (
    <div className="bg-background min-h-full">
      <IMHeader title="Performance de Fornecedores" subtitle="Analise quais fornecedores entregam melhor giro, margem, sell-through e retorno comercial." />

      <div className="p-4 md:p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <KpiCard label="Melhor por receita" value={top.nome} hint={formatBRL(top.receita)} icon={<Trophy className="h-3.5 w-3.5" />} />
          <KpiCard label="Melhor margem" value={bestMg.nome} hint={formatPct(bestMg.margem)} icon={<Percent className="h-3.5 w-3.5" />} accent="success" />
          <KpiCard label="Maior giro" value={bestGiro.nome} hint={formatPct(bestGiro.sellThrough)} icon={<Repeat className="h-3.5 w-3.5" />} accent="info" />
          <KpiCard label="Maior parado" value={worst.nome} hint={`${worst.parados} produtos`} icon={<AlertTriangle className="h-3.5 w-3.5" />} accent="warn" />
          <KpiCard label="Renegociação" value="2 fornec." hint="Recomendado" icon={<Handshake className="h-3.5 w-3.5" />} accent="warn" />
          <KpiCard label="Variação custo" value="+4,2%" hint="vs período ant." icon={<TrendingUp className="h-3.5 w-3.5" />} />
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <p className="text-sm font-bold p-3 border-b border-border">Tabela de fornecedores</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-secondary/50">
                <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                  {["Fornecedor","Receita","Comprado","Vendido","Sell-through","Margem","MK simples","MK completo","Dias estoque","Estrelas","Parados","Recomendação"].map(h => <th key={h} className="px-3 py-2">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {fornecedoresIM.map(f => (
                  <tr key={f.nome} className="border-t border-border hover:bg-secondary/20">
                    <td className="px-3 py-2 font-semibold">{f.nome}</td>
                    <td className="px-3 py-2 tabular-nums">{formatBRL(f.receita)}</td>
                    <td className="px-3 py-2 tabular-nums">{f.comprado}</td>
                    <td className="px-3 py-2 tabular-nums">{f.vendido}</td>
                    <td className="px-3 py-2 tabular-nums">{formatPct(f.sellThrough)}</td>
                    <td className="px-3 py-2 tabular-nums font-semibold">{formatPct(f.margem)}</td>
                    <td className="px-3 py-2 tabular-nums">{f.markupSimples}x</td>
                    <td className="px-3 py-2 tabular-nums">{f.markupCompleto}x</td>
                    <td className="px-3 py-2 tabular-nums">{f.diasEmEstoque}d</td>
                    <td className="px-3 py-2 tabular-nums text-emerald-700">{f.estrelas}</td>
                    <td className="px-3 py-2 tabular-nums text-rose-600">{f.parados}</td>
                    <td className="px-3 py-2"><StatusBadge status={f.recomendacao} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartBox title="Receita por fornecedor">
            <BarChart data={fornecedoresIM}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="nome" tick={{ fontSize: 9 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="receita" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartBox>
          <ChartBox title="Margem por fornecedor">
            <BarChart data={fornecedoresIM}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="nome" tick={{ fontSize: 9 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="margem" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartBox>
          <ChartBox title="Sell-through vs margem">
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" dataKey="sellThrough" name="Sell-through" tick={{ fontSize: 11 }} />
              <YAxis type="number" dataKey="margem" name="Margem" tick={{ fontSize: 11 }} />
              <ZAxis dataKey="receita" range={[60, 400]} />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} />
              <Scatter data={fornecedoresIM} fill="hsl(var(--primary))" />
            </ScatterChart>
          </ChartBox>
          <ChartBox title="Fornecedores com maior estoque parado">
            <BarChart data={[...fornecedoresIM].sort((a,b)=>b.parados-a.parados)}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="nome" tick={{ fontSize: 9 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="parados" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartBox>
        </div>
      </div>
    </div>
  );
}

function ChartBox({ title, children }: { title: string; children: React.ReactElement }) {
  return (
    <div className="bg-card border border-border rounded-xl p-3">
      <p className="text-xs font-semibold mb-2">{title}</p>
      <div style={{ height: 220 }}><ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer></div>
    </div>
  );
}
