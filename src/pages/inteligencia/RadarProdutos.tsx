import { useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { IMHeader } from "@/components/inteligencia/IMHeader";
import { StatusBadge } from "@/components/inteligencia/StatusBadge";
import { ColumnsCustomizer, getActiveCols } from "@/components/inteligencia/ColumnsCustomizer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal, Save, Download, Columns3, GitCompare, X } from "lucide-react";
import { produtosIM, formatBRL, formatPct } from "@/data/mockInteligencia";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const advancedFilters = [
  "Período","Coleção","Marca","Categoria","Fornecedor","Canal","Região","Vendedor","Cliente",
  "Faixa preço compra","Faixa preço venda","Markup simples","Markup completo","Margem",
  "Sell-through","Dias em estoque","Estoque atual","Status inteligente","Ação recomendada",
];

export default function RadarProdutos() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const statusFilter = params.get("status");
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [colsOpen, setColsOpen] = useState(false);
  const [activeCols, setActiveCols] = useState<string[]>(getActiveCols());

  const data = useMemo(() => {
    let d = produtosIM;
    if (statusFilter === "parado") d = d.filter((p) => p.diasEmEstoque > 90);
    if (statusFilter === "ruptura") d = d.filter((p) => p.status === "Risco de ruptura");
    if (search) d = d.filter((p) => (p.nome + p.sku + p.marca + p.fornecedor).toLowerCase().includes(search.toLowerCase()));
    return d;
  }, [statusFilter, search]);

  const isCol = (c: string) => activeCols.includes(c);

  return (
    <div className="bg-background min-h-full">
      <IMHeader
        title="Radar de Produtos"
        subtitle="Pesquise, filtre e compare produtos com base no histórico de compra, venda, estoque, margem e giro."
      />

      <div className="p-4 md:p-6 space-y-4">
        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Busque por SKU, produto, coleção, fornecedor, categoria, cor, grade, cliente ou região..."
            className="pl-10 h-12 text-base bg-card"
          />
        </div>

        {/* Status filter chip */}
        {statusFilter && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Filtro ativo:</span>
            <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs font-semibold px-2 py-1 rounded-full">
              {statusFilter === "parado" ? "Estoque parado (+90 dias)" : statusFilter}
              <button onClick={() => navigate("/inteligencia-mercado/radar-produtos")}><X className="h-3 w-3" /></button>
            </span>
          </div>
        )}

        {/* Botões + filtros avançados */}
        <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
          <div className="flex flex-wrap items-center gap-2">
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm"><SlidersHorizontal className="h-3.5 w-3.5 mr-1" /> Filtros avançados</Button>
            </CollapsibleTrigger>
            <Button variant="outline" size="sm">Aplicar filtros</Button>
            <Button variant="ghost" size="sm">Limpar</Button>
            <Button variant="outline" size="sm"><Save className="h-3.5 w-3.5 mr-1" /> Salvar visão</Button>
            <Button variant="outline" size="sm"><Download className="h-3.5 w-3.5 mr-1" /> Exportar</Button>
            <Button variant="outline" size="sm"><GitCompare className="h-3.5 w-3.5 mr-1" /> Comparar selecionados</Button>
            <Button variant="outline" size="sm" onClick={() => setColsOpen(true)}><Columns3 className="h-3.5 w-3.5 mr-1" /> Personalizar colunas</Button>
          </div>
          <CollapsibleContent className="mt-3">
            <div className="bg-card border border-border rounded-xl p-3 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {advancedFilters.map((f) => (
                <Select key={f}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder={f} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                  </SelectContent>
                </Select>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Tabela */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-secondary/50 border-b border-border">
                <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                  <th className="sticky left-0 bg-secondary/95 backdrop-blur z-10 px-3 py-2 shadow-[2px_0_4px_rgba(0,0,0,0.04)] min-w-[220px]">Produto</th>
                  {isCol("SKU") && <th className="px-2 py-2">SKU</th>}
                  {isCol("Coleção") && <th className="px-2 py-2">Coleção</th>}
                  {isCol("Categoria") && <th className="px-2 py-2">Categoria</th>}
                  {isCol("Marca") && <th className="px-2 py-2">Marca</th>}
                  {isCol("Fornecedor") && <th className="px-2 py-2">Fornecedor</th>}
                  {isCol("Compra média") && <th className="px-2 py-2 text-right">Compra</th>}
                  {isCol("Venda média") && <th className="px-2 py-2 text-right">Venda</th>}
                  {isCol("Markup simples") && <th className="px-2 py-2 text-right">MK simples</th>}
                  {isCol("Markup completo") && <th className="px-2 py-2 text-right">MK completo</th>}
                  {isCol("Margem") && <th className="px-2 py-2 text-right">Margem</th>}
                  {isCol("Comprado") && <th className="px-2 py-2 text-right">Comprado</th>}
                  {isCol("Vendido") && <th className="px-2 py-2 text-right">Vendido</th>}
                  {isCol("Estoque") && <th className="px-2 py-2 text-right">Estoque</th>}
                  {isCol("Sell-through") && <th className="px-2 py-2 text-right">Sell-th</th>}
                  {isCol("Dias") && <th className="px-2 py-2 text-right">Dias</th>}
                  {isCol("Receita") && <th className="px-2 py-2 text-right">Receita</th>}
                  {isCol("Lucro") && <th className="px-2 py-2 text-right">Lucro</th>}
                  {isCol("Status") && <th className="px-2 py-2">Status</th>}
                  {isCol("Ação") && <th className="px-2 py-2">Ação</th>}
                </tr>
              </thead>
              <tbody>
                {data.map((p) => (
                  <tr
                    key={p.sku}
                    onClick={() => navigate(`/inteligencia-mercado/produto/${p.sku}`)}
                    className="border-b border-border last:border-0 hover:bg-secondary/30 cursor-pointer transition-colors"
                  >
                    <td className="sticky left-0 bg-card z-10 px-3 py-2 shadow-[2px_0_4px_rgba(0,0,0,0.04)]">
                      <div className="flex items-center gap-2">
                        <img src={p.imagem} alt="" className="h-9 w-9 rounded object-cover shrink-0" />
                        <div className="min-w-0">
                          <p className="font-semibold truncate">{p.nome}</p>
                          <p className="text-[10px] text-muted-foreground">{p.sku}</p>
                        </div>
                      </div>
                    </td>
                    {isCol("SKU") && <td className="px-2 py-2 font-mono text-[10px]">{p.sku}</td>}
                    {isCol("Coleção") && <td className="px-2 py-2">{p.colecao}</td>}
                    {isCol("Categoria") && <td className="px-2 py-2">{p.categoria}</td>}
                    {isCol("Marca") && <td className="px-2 py-2">{p.marca}</td>}
                    {isCol("Fornecedor") && <td className="px-2 py-2">{p.fornecedor}</td>}
                    {isCol("Compra média") && <td className="px-2 py-2 text-right tabular-nums">{formatBRL(p.precoCompra)}</td>}
                    {isCol("Venda média") && <td className="px-2 py-2 text-right tabular-nums">{formatBRL(p.precoVenda)}</td>}
                    {isCol("Markup simples") && <td className="px-2 py-2 text-right tabular-nums">{p.markupSimples}x</td>}
                    {isCol("Markup completo") && <td className="px-2 py-2 text-right tabular-nums">{p.markupCompleto}x</td>}
                    {isCol("Margem") && <td className="px-2 py-2 text-right tabular-nums font-semibold">{formatPct(p.margem)}</td>}
                    {isCol("Comprado") && <td className="px-2 py-2 text-right tabular-nums">{p.comprado}</td>}
                    {isCol("Vendido") && <td className="px-2 py-2 text-right tabular-nums">{p.vendido}</td>}
                    {isCol("Estoque") && <td className="px-2 py-2 text-right tabular-nums">{p.estoque}</td>}
                    {isCol("Sell-through") && <td className="px-2 py-2 text-right tabular-nums">{formatPct(p.sellThrough)}</td>}
                    {isCol("Dias") && <td className="px-2 py-2 text-right tabular-nums">{p.diasEmEstoque}d</td>}
                    {isCol("Receita") && <td className="px-2 py-2 text-right tabular-nums">{formatBRL(p.receita)}</td>}
                    {isCol("Lucro") && <td className="px-2 py-2 text-right tabular-nums text-emerald-700 font-semibold">{formatBRL(p.lucroBruto)}</td>}
                    {isCol("Status") && <td className="px-2 py-2"><StatusBadge status={p.status} /></td>}
                    {isCol("Ação") && <td className="px-2 py-2"><StatusBadge status={p.acao} /></td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-3 py-2 text-[11px] text-muted-foreground border-t border-border bg-secondary/20">
            Mostrando {data.length} produto(s). Clique em uma linha para ver o detalhe completo.
          </div>
        </div>
      </div>

      <ColumnsCustomizer open={colsOpen} onOpenChange={setColsOpen} onChange={() => setActiveCols(getActiveCols())} />
    </div>
  );
}
