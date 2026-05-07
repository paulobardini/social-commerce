import { IMHeader } from "@/components/inteligencia/IMHeader";
import { IMFilters } from "@/components/inteligencia/IMFilters";
import { KpiCard } from "@/components/inteligencia/KpiCard";
import { DecisionCard } from "@/components/inteligencia/DecisionCard";
import { InsightCard } from "@/components/inteligencia/InsightCard";
import {
  kpisVisaoGeral, formatBRLk, formatPct, recomendacoesIM, produtosIM,
  evolucaoReceitaMargem, estoqueParadoTop, receitaPorCanal, sellThroughColecao, margemCategoria
} from "@/data/mockInteligencia";
import {
  Repeat, AlertTriangle, PackageX, TrendingDown,
  DollarSign, Percent, Layers, Activity, Boxes, Target, Lightbulb, BarChart3
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, PieChart, Pie, Cell, Legend
} from "recharts";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useNavigate } from "react-router-dom";

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "#0ea5e9", "#10b981", "#f59e0b"];

export default function VisaoGeral() {
  const navigate = useNavigate();
  const insights = recomendacoesIM.filter((r) => r.prioridade === "Alta").slice(0, 4);
  const topRentaveis = [...produtosIM].sort((a, b) => b.lucroBruto - a.lucroBruto).slice(0, 5);
  const topRisco = [...produtosIM].sort((a, b) => a.score - b.score).slice(0, 5);

  return (
    <div className="bg-background min-h-full">
      <IMHeader title="Visão Geral" subtitle="Análise estratégica de compra, venda, estoque, margem e performance para decisões comerciais mais precisas." />
      <IMFilters />

      <div className="p-4 md:p-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
          <KpiCard label="Receita analisada" value={formatBRLk(kpisVisaoGeral.receita)} hint="Pedidos no período" icon={<DollarSign className="h-3.5 w-3.5" />} />
          <KpiCard label="Margem média" value={formatPct(kpisVisaoGeral.margemMedia)} hint="Após descontos" icon={<Percent className="h-3.5 w-3.5" />} accent="success" />
          <KpiCard label="Markup simples" value={`${kpisVisaoGeral.markupSimples}x`} hint="Venda / Compra" icon={<Layers className="h-3.5 w-3.5" />} />
          <KpiCard label="Markup completo" value={`${kpisVisaoGeral.markupCompleto}x`} hint="C/ custos extras" icon={<Layers className="h-3.5 w-3.5" />} />
          <KpiCard label="Sell-through" value={formatPct(kpisVisaoGeral.sellThrough)} hint="Vendido / Comprado" icon={<Activity className="h-3.5 w-3.5" />} accent="info" />
          <KpiCard label="Giro médio" value={`${kpisVisaoGeral.giro}x`} hint="No período" icon={<Repeat className="h-3.5 w-3.5" />} />
          <KpiCard label="Valor parado" value={formatBRLk(kpisVisaoGeral.valorParado)} hint="+90 dias estoque" icon={<Boxes className="h-3.5 w-3.5" />} accent="warn" />
          <KpiCard label="Recomendações" value={String(kpisVisaoGeral.recomendacoesAtivas)} hint="Ações sugeridas" icon={<Lightbulb className="h-3.5 w-3.5" />} accent="info" />
        </div>

        {/* Painel de Decisão */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-4 w-4 text-primary" />
            <h2 className="text-lg font-bold">Painel de Decisão</h2>
            <span className="text-xs text-muted-foreground">— o que exige atenção agora</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <DecisionCard icon={Repeat} title="Oportunidades de Recompra" indicator="12 produtos" message="Itens com alto giro, boa margem e estoque baixo." cta="Ver oportunidades" to="/inteligencia-mercado/recomendacoes?tipo=recompra" accent="primary" />
            <DecisionCard icon={AlertTriangle} title="Risco de Ruptura" indicator="8 produtos" message="Produtos com venda acelerada e estoque insuficiente." cta="Analisar risco" to="/inteligencia-mercado/recomendacoes?tipo=ruptura" accent="danger" />
            <DecisionCard icon={PackageX} title="Estoque Parado" indicator="R$ 286,9k" message="Capital parado em produtos com baixa saída." cta="Ver itens parados" to="/inteligencia-mercado/radar-produtos?status=parado" accent="warn" />
            <DecisionCard icon={TrendingDown} title="Margem em Atenção" indicator="15 produtos" message="Produtos vendendo bem, mas com rentabilidade abaixo do ideal." cta="Revisar margem" to="/inteligencia-mercado/recomendacoes?tipo=atencao-margem" accent="success" />
          </div>
        </section>

        {/* Insights prioritários */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-primary" />
              <h2 className="text-lg font-bold">Insights Estratégicos Prioritários</h2>
            </div>
            <button onClick={() => navigate("/inteligencia-mercado/recomendacoes")} className="text-xs text-primary hover:underline font-medium">
              Ver todas →
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {insights.map((r) => <InsightCard key={r.id} rec={r} />)}
          </div>
        </section>

        {/* Análise visual (recolhida) */}
        <section>
          <Accordion type="single" collapsible defaultValue="charts">
            <AccordionItem value="charts" className="border border-border rounded-xl bg-card">
              <AccordionTrigger className="px-4 hover:no-underline">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  <span className="text-sm font-bold">Análise Visual</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <ChartBox title="Evolução de receita e margem">
                    <LineChart data={evolucaoReceitaMargem}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                      <YAxis yAxisId="l" tick={{ fontSize: 11 }} />
                      <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Line yAxisId="l" dataKey="receita" stroke="hsl(var(--primary))" strokeWidth={2} />
                      <Line yAxisId="r" dataKey="margem" stroke="hsl(var(--accent))" strokeWidth={2} />
                    </LineChart>
                  </ChartBox>
                  <ChartBox title="Top produtos com maior valor parado">
                    <BarChart data={estoqueParadoTop} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis dataKey="produto" type="category" tick={{ fontSize: 10 }} width={110} />
                      <Tooltip />
                      <Bar dataKey="valor" fill="hsl(var(--destructive))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ChartBox>
                  <ChartBox title="Receita por canal">
                    <PieChart>
                      <Pie data={receitaPorCanal} dataKey="valor" nameKey="canal" innerRadius={50} outerRadius={80}>
                        {receitaPorCanal.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ChartBox>
                  <ChartBox title="Sell-through por coleção">
                    <BarChart data={sellThroughColecao} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis dataKey="colecao" type="category" tick={{ fontSize: 11 }} width={100} />
                      <Tooltip />
                      <Bar dataKey="valor" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ChartBox>
                  <ChartBox title="Margem média por categoria">
                    <BarChart data={margemCategoria}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="categoria" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="valor" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ChartBox>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* Rankings */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <RankingBox title="Top produtos mais rentáveis" items={topRentaveis.map(p => ({ nome: p.nome, valor: formatBRLk(p.lucroBruto), sub: `Margem ${formatPct(p.margem)}` }))} accent="success" />
          <RankingBox title="Top produtos com maior risco comercial" items={topRisco.map(p => ({ nome: p.nome, valor: `Score ${p.score}`, sub: p.status }))} accent="danger" />
        </section>
      </div>
    </div>
  );
}

function ChartBox({ title, children }: { title: string; children: React.ReactElement }) {
  return (
    <div className="bg-card border border-border rounded-xl p-3">
      <p className="text-xs font-semibold text-foreground mb-2">{title}</p>
      <div style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer>
      </div>
    </div>
  );
}

function RankingBox({ title, items, accent }: { title: string; items: { nome: string; valor: string; sub: string }[]; accent: "success" | "danger" }) {
  const c = accent === "success" ? "text-emerald-600" : "text-rose-600";
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <p className="text-sm font-bold mb-3">{title}</p>
      <ol className="space-y-2">
        {items.map((it, i) => (
          <li key={i} className="flex items-center justify-between text-sm py-1.5 border-b border-border last:border-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs text-muted-foreground w-5">{i + 1}.</span>
              <div className="min-w-0">
                <p className="font-medium truncate">{it.nome}</p>
                <p className="text-[11px] text-muted-foreground">{it.sub}</p>
              </div>
            </div>
            <span className={`font-bold tabular-nums text-sm ${c}`}>{it.valor}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
