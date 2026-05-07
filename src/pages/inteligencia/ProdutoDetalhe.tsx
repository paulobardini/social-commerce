import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { IMHeader } from "@/components/inteligencia/IMHeader";
import { KpiCard } from "@/components/inteligencia/KpiCard";
import { StatusBadge } from "@/components/inteligencia/StatusBadge";
import { ScoreBreakdown } from "@/components/inteligencia/ScoreBreakdown";
import { InsightCard } from "@/components/inteligencia/InsightCard";
import { Button } from "@/components/ui/button";
import { CriarTarefaModal } from "@/components/inteligencia/modals/CriarTarefaModal";
import { RecompraModal } from "@/components/inteligencia/modals/RecompraModal";
import { ExportarAnaliseModal } from "@/components/inteligencia/modals/ExportarAnaliseModal";
import {
  produtosIM, computeScoreBreakdown, formatBRL, formatPct, recomendacoesIM,
  vendasSemanais, estoqueTempo, vendaPorRegiao, vendaPorGrade, estoquePorCor,
  topClientes, topVendedores, historicoComprasDetalhe, historicoVendasDetalhe, receitaPorCanal
} from "@/data/mockInteligencia";
import { GitCompare, Download, ListPlus, ShoppingCart } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

export default function ProdutoDetalhe() {
  const { sku } = useParams();
  const navigate = useNavigate();
  const produto = produtosIM.find((p) => p.sku === sku) ?? produtosIM[0];
  const breakdown = computeScoreBreakdown(produto);
  const insights = recomendacoesIM.filter((r) => r.sku === produto.sku).slice(0, 4);
  const insightsExtra = recomendacoesIM.slice(0, 4);
  const [tarefa, setTarefa] = useState(false);
  const [recompra, setRecompra] = useState(false);
  const [exportar, setExportar] = useState(false);

  return (
    <div className="bg-background min-h-full">
      <IMHeader
        title={produto.nome}
        subtitle={`${produto.marca} • ${produto.colecao} • ${produto.categoria} • Fornecedor ${produto.fornecedor}`}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => navigate(`/inteligencia-mercado/comparativos?produto=${produto.sku}`)}>
              <GitCompare className="h-3.5 w-3.5 mr-1" /> Comparar
            </Button>
            <Button variant="outline" size="sm" onClick={() => setExportar(true)}>
              <Download className="h-3.5 w-3.5 mr-1" /> Exportar análise
            </Button>
            <Button variant="outline" size="sm" onClick={() => setTarefa(true)}>
              <ListPlus className="h-3.5 w-3.5 mr-1" /> Criar tarefa
            </Button>
            <Button size="sm" onClick={() => setRecompra(true)}>
              <ShoppingCart className="h-3.5 w-3.5 mr-1" /> Marcar para recompra
            </Button>
          </>
        }
      />

      <div className="p-4 md:p-6 space-y-6">
        {/* Top: Imagem + Score */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-xl p-4 flex gap-4">
            <img src={produto.imagem} alt={produto.nome} className="w-32 h-40 object-cover rounded-lg" />
            <div className="flex flex-col gap-2">
              <p className="text-xs text-muted-foreground">SKU {produto.sku}</p>
              <h2 className="text-lg font-bold">{produto.nome}</h2>
              <div className="flex flex-wrap gap-1.5">
                <StatusBadge status={produto.status} />
                <StatusBadge status={produto.acao} />
              </div>
              <div className="text-xs text-muted-foreground space-y-0.5 mt-2">
                <p>Marca: <span className="text-foreground font-medium">{produto.marca}</span></p>
                <p>Coleção: <span className="text-foreground font-medium">{produto.colecao}</span></p>
                <p>Fornecedor: <span className="text-foreground font-medium">{produto.fornecedor}</span></p>
              </div>
            </div>
          </div>
          <div className="lg:col-span-2">
            <ScoreBreakdown data={breakdown} score={produto.score} />
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <KpiCard label="Compra média" value={formatBRL(produto.precoCompra)} />
          <KpiCard label="Venda média" value={formatBRL(produto.precoVenda)} />
          <KpiCard label="Markup simples" value={`${produto.markupSimples}x`} />
          <KpiCard label="Markup completo" value={`${produto.markupCompleto}x`} />
          <KpiCard label="Margem bruta" value={formatPct(produto.margem)} accent="success" />
          <KpiCard label="Receita gerada" value={formatBRL(produto.receita)} />
          <KpiCard label="Lucro bruto" value={formatBRL(produto.lucroBruto)} accent="success" />
          <KpiCard label="Comprado" value={`${produto.comprado} un`} />
          <KpiCard label="Vendido" value={`${produto.vendido} un`} />
          <KpiCard label="Estoque atual" value={`${produto.estoque} un`} accent="warn" />
          <KpiCard label="Sell-through" value={formatPct(produto.sellThrough)} accent="info" />
          <KpiCard label="Dias em estoque" value={`${produto.diasEmEstoque}d`} />
        </div>

        {/* Leitura de Markup */}
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm font-bold mb-1">Leitura de Markup</p>
          <p className="text-xs text-muted-foreground mb-3">
            Markup simples considera a relação direta entre preço médio de venda e preço médio de compra. Markup completo considera custos adicionais estimados, como frete, impostos, comissão, embalagem e descontos.
          </p>
          <div className="grid grid-cols-3 gap-3">
            <Stat label="Markup simples" v={`${produto.markupSimples}x`} />
            <Stat label="Markup completo" v={`${produto.markupCompleto}x`} />
            <Stat label="Diferença" v={`${(produto.markupSimples - produto.markupCompleto).toFixed(2)}x`} />
          </div>
          <p className="text-xs text-emerald-700 mt-3 font-medium">
            Leitura: produto mantém boa rentabilidade mesmo após custos adicionais.
          </p>
        </div>

        {/* Visualizações */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartBox title="Vendas por semana">
            <LineChart data={vendasSemanais}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="semana" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line dataKey="vendas" stroke="hsl(var(--primary))" strokeWidth={2} />
            </LineChart>
          </ChartBox>
          <ChartBox title="Estoque ao longo do tempo">
            <LineChart data={estoqueTempo}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="semana" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line dataKey="estoque" stroke="hsl(var(--accent))" strokeWidth={2} />
            </LineChart>
          </ChartBox>
          <ChartBox title="Venda por canal">
            <BarChart data={receitaPorCanal}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="canal" tick={{ fontSize: 9 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="valor" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartBox>
          <ChartBox title="Venda por região">
            <BarChart data={vendaPorRegiao} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="regiao" type="category" tick={{ fontSize: 11 }} width={90} />
              <Tooltip />
              <Bar dataKey="valor" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ChartBox>
        </div>

        {/* Tabelas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TableBox title="Venda por grade e tamanho" headers={["Tamanho", "Vendas", "%"]} rows={vendaPorGrade.map(r => [r.tamanho, String(r.vendas), `${r.perc}%`])} />
          <TableBox title="Estoque por cor" headers={["Cor", "Estoque"]} rows={estoquePorCor.map(r => [r.cor, String(r.estoque)])} />
          <TableBox title="Top clientes" headers={["Cliente", "Qtd", "Receita"]} rows={topClientes.map(r => [r.cliente, String(r.qtd), formatBRL(r.receita)])} />
          <TableBox title="Top vendedores" headers={["Vendedor", "Qtd", "Receita"]} rows={topVendedores.map(r => [r.vendedor, String(r.qtd), formatBRL(r.receita)])} />
        </div>

        {/* Histórico */}
        <TableBox title="Histórico de compras"
          headers={["Data", "Fornecedor", "Qtd", "Custo un", "Total", "Prazo", "Status"]}
          rows={historicoComprasDetalhe.map(h => [h.data, h.fornecedor, String(h.qtd), formatBRL(h.custoUn), formatBRL(h.total), h.prazo, h.status])} />
        <TableBox title="Histórico de vendas"
          headers={["Período", "Canal", "Qtd", "Receita", "Desconto", "Margem", "Clientes"]}
          rows={historicoVendasDetalhe.map(h => [h.periodo, h.canal, String(h.qtd), formatBRL(h.receita), `${h.descontoMedio}%`, `${h.margem}%`, String(h.clientes)])} />

        {/* Insights */}
        <section>
          <h2 className="text-lg font-bold mb-3">Insights para este produto</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {(insights.length ? insights : insightsExtra).map((r) => <InsightCard key={r.id} rec={r} />)}
          </div>
        </section>
      </div>

      <CriarTarefaModal open={tarefa} onOpenChange={setTarefa} produto={produto.nome} />
      <RecompraModal open={recompra} onOpenChange={setRecompra} produto={produto.nome} estoque={produto.estoque} />
      <ExportarAnaliseModal open={exportar} onOpenChange={setExportar} />
    </div>
  );
}

function Stat({ label, v }: { label: string; v: string }) {
  return (
    <div className="bg-secondary/40 border border-border rounded-md p-2">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="font-bold tabular-nums text-lg">{v}</p>
    </div>
  );
}

function ChartBox({ title, children }: { title: string; children: React.ReactElement }) {
  return (
    <div className="bg-card border border-border rounded-xl p-3">
      <p className="text-xs font-semibold mb-2">{title}</p>
      <div style={{ height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer>
      </div>
    </div>
  );
}

function TableBox({ title, headers, rows }: { title: string; headers: string[]; rows: string[][] }) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <p className="text-xs font-semibold p-3 border-b border-border">{title}</p>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-secondary/50">
            <tr>{headers.map((h) => <th key={h} className="px-3 py-2 text-left text-[10px] uppercase tracking-wider text-muted-foreground">{h}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-border">
                {r.map((c, j) => <td key={j} className="px-3 py-2 tabular-nums">{c}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
