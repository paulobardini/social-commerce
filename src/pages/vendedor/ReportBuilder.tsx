import { VendedorLayout } from "@/components/vendedor/VendedorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Save, Eye, Download, ArrowLeft, Table2, BarChart3, LineChart, PieChart,
  LayoutGrid, Filter, GripVertical, Plus, X, ArrowUpDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { camposPorEntidade } from "@/data/mockAnalytics";
import { mockClientes360 } from "@/data/mockCRM360";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const entidades = [
  { value: "clientes", label: "Clientes" },
  { value: "oportunidades", label: "Oportunidades" },
  { value: "representantes", label: "Representantes" },
  { value: "tarefas", label: "Tarefas" },
  { value: "orcamentos", label: "Orçamentos" },
  { value: "mensagens", label: "Mensagens" },
  { value: "pedidos", label: "Pedidos" },
];

const visualizacoes = [
  { value: "tabela", label: "Tabela", icon: Table2 },
  { value: "barras", label: "Barras", icon: BarChart3 },
  { value: "linha", label: "Linha", icon: LineChart },
  { value: "pizza", label: "Pizza", icon: PieChart },
  { value: "kpi", label: "Cards KPI", icon: LayoutGrid },
];

export default function ReportBuilder() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [entidade, setEntidade] = useState("clientes");
  const [colunasSelected, setColunasSelected] = useState<string[]>(["nomeFantasia", "cidade", "representante", "nicho", "status", "ultimoContato"]);
  const [visualizacao, setVisualizacao] = useState("tabela");
  const [agrupamento, setAgrupamento] = useState("");
  const [ordenacao, setOrdenacao] = useState("");
  const [step, setStep] = useState<"config" | "preview">("config");

  const campos = camposPorEntidade[entidade] || [];

  const toggleColuna = (campo: string) => {
    setColunasSelected(prev => prev.includes(campo) ? prev.filter(c => c !== campo) : [...prev, campo]);
  };

  const handleSave = () => {
    toast({ title: "Relatório salvo", description: `"${nome || "Sem título"}" foi salvo com sucesso.` });
    navigate("/vendedor/relatorios");
  };

  const selectedFields = campos.filter(c => colunasSelected.includes(c.campo));

  // Mock preview data for clients
  const previewData = entidade === "clientes" ? mockClientes360.slice(0, 8) : [];

  return (
    <VendedorLayout>
      <div className="p-6 space-y-5 max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate("/vendedor/relatorios")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-heading font-bold text-foreground">Construtor de Relatórios</h1>
              <p className="text-xs text-muted-foreground mt-0.5">Monte relatórios customizados para análise da operação</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-xs" onClick={() => setStep(step === "config" ? "preview" : "config")}>
              <Eye className="h-3.5 w-3.5 mr-1" /> {step === "config" ? "Pré-visualizar" : "Voltar à configuração"}
            </Button>
            <Button variant="outline" size="sm" className="text-xs"><Download className="h-3.5 w-3.5 mr-1" /> Exportar</Button>
            <Button size="sm" className="text-xs" onClick={handleSave}><Save className="h-3.5 w-3.5 mr-1" /> Salvar</Button>
          </div>
        </div>

        {step === "config" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Left: Configuration */}
            <div className="lg:col-span-1 space-y-4">
              <Card className="border border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-heading">Configuração</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-xs">Nome do relatório</Label>
                    <Input value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Clientes sem contato" className="mt-1 h-9 text-xs" />
                  </div>
                  <div>
                    <Label className="text-xs">Descrição</Label>
                    <Input value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Breve descrição..." className="mt-1 h-9 text-xs" />
                  </div>
                  <div>
                    <Label className="text-xs">Entidade principal</Label>
                    <Select value={entidade} onValueChange={v => { setEntidade(v); setColunasSelected([]); }}>
                      <SelectTrigger className="mt-1 h-9 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {entidades.map(e => <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Agrupar por</Label>
                    <Select value={agrupamento} onValueChange={setAgrupamento}>
                      <SelectTrigger className="mt-1 h-9 text-xs"><SelectValue placeholder="Sem agrupamento" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nenhum">Sem agrupamento</SelectItem>
                        {campos.filter(c => c.tipo === "texto" || c.tipo === "status").map(c => (
                          <SelectItem key={c.campo} value={c.campo}>{c.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Ordenar por</Label>
                    <Select value={ordenacao} onValueChange={setOrdenacao}>
                      <SelectTrigger className="mt-1 h-9 text-xs"><SelectValue placeholder="Padrão" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="padrao">Padrão</SelectItem>
                        {campos.map(c => (
                          <SelectItem key={c.campo} value={c.campo}>{c.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Visualização */}
              <Card className="border border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-heading">Visualização</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-1.5">
                    {visualizacoes.map(v => (
                      <button
                        key={v.value}
                        onClick={() => setVisualizacao(v.value)}
                        className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-xs transition-colors ${
                          visualizacao === v.value ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:bg-muted/50"
                        }`}
                      >
                        <v.icon className="h-4 w-4" />
                        <span className="text-[9px]">{v.label}</span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Center: Columns selection */}
            <div className="lg:col-span-1">
              <Card className="border border-border h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-heading">Colunas e Métricas</CardTitle>
                    <Badge variant="secondary" className="text-[9px]">{colunasSelected.length} selecionadas</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-1">
                  {campos.map(c => (
                    <label
                      key={c.campo}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    >
                      <Checkbox
                        checked={colunasSelected.includes(c.campo)}
                        onCheckedChange={() => toggleColuna(c.campo)}
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-xs text-foreground">{c.label}</span>
                      </div>
                      <Badge variant="outline" className="text-[8px] px-1 py-0">{c.tipo}</Badge>
                    </label>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Right: Filters */}
            <div className="lg:col-span-1">
              <Card className="border border-border h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-heading flex items-center gap-2">
                      <Filter className="h-3.5 w-3.5" /> Filtros Avançados
                    </CardTitle>
                    <Button variant="ghost" size="sm" className="text-[10px] h-6"><Plus className="h-3 w-3 mr-1" /> Adicionar</Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Pre-built filter entries */}
                  <div className="p-3 rounded-lg border border-border bg-muted/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-foreground">Período</span>
                      <Button variant="ghost" size="icon" className="h-5 w-5"><X className="h-3 w-3" /></Button>
                    </div>
                    <Select defaultValue="abril_2026">
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="abril_2026">Abril 2026</SelectItem>
                        <SelectItem value="q1_2026">Q1 2026</SelectItem>
                        <SelectItem value="2026">2026</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="p-3 rounded-lg border border-border bg-muted/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-foreground">Status</span>
                      <Button variant="ghost" size="icon" className="h-5 w-5"><X className="h-3 w-3" /></Button>
                    </div>
                    <Select defaultValue="todos">
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="ativo">Ativo</SelectItem>
                        <SelectItem value="em_risco">Em risco</SelectItem>
                        <SelectItem value="inativo">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="p-3 rounded-lg border border-border bg-muted/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-foreground">Representante</span>
                      <Button variant="ghost" size="icon" className="h-5 w-5"><X className="h-3 w-3" /></Button>
                    </div>
                    <Select defaultValue="todos">
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="paulo">Paulo Bardini</SelectItem>
                        <SelectItem value="marina">Marina Oliveira</SelectItem>
                        <SelectItem value="rafael">Rafael Costa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="p-3 rounded-lg border border-border bg-muted/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-foreground">Nicho</span>
                      <Button variant="ghost" size="icon" className="h-5 w-5"><X className="h-3 w-3" /></Button>
                    </div>
                    <Select defaultValue="todos">
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="infantil">Infantil</SelectItem>
                        <SelectItem value="adulto">Adulto</SelectItem>
                        <SelectItem value="fitness">Fitness</SelectItem>
                        <SelectItem value="multimarcas">Multimarcas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          /* Preview */
          <Card className="border border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-heading">{nome || "Relatório sem título"}</CardTitle>
                  {descricao && <p className="text-xs text-muted-foreground mt-0.5">{descricao}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[9px]">{entidades.find(e => e.value === entidade)?.label}</Badge>
                  <Badge variant="outline" className="text-[9px]">{selectedFields.length} colunas</Badge>
                  <Badge variant="outline" className="text-[9px]">{visualizacoes.find(v => v.value === visualizacao)?.label}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {visualizacao === "tabela" && entidade === "clientes" && (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border">
                        {selectedFields.map(f => (
                          <th key={f.campo} className="text-left py-2 px-3 font-medium text-muted-foreground whitespace-nowrap">
                            <span className="flex items-center gap-1">{f.label} <ArrowUpDown className="h-2.5 w-2.5" /></span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.map((c, i) => (
                        <tr key={i} className="border-b border-border/50 hover:bg-muted/30 cursor-pointer" onClick={() => navigate(`/vendedor/360/${c.id}`)}>
                          {selectedFields.map(f => {
                            const val = (c as any)[f.campo];
                            return (
                              <td key={f.campo} className="py-2 px-3 whitespace-nowrap">
                                {f.tipo === "status" ? (
                                  <Badge variant={val === "ativo" ? "default" : val === "em_risco" ? "destructive" : "secondary"} className="text-[9px] px-1.5 py-0">{val}</Badge>
                                ) : f.tipo === "lista" ? (
                                  <span className="text-muted-foreground">{Array.isArray(val) ? val.join(", ") : val}</span>
                                ) : f.tipo === "numero" ? (
                                  <span className="font-medium">{val}</span>
                                ) : (
                                  <span>{val}</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {visualizacao === "barras" && (
                <div className="flex items-end gap-2 h-48 px-4 pt-4">
                  {previewData.slice(0, 6).map((c, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full bg-primary/80 rounded-t transition-all" style={{ height: `${((c.oportunidadesAbertas || 1) / 3) * 100}%` }} />
                      <span className="text-[8px] text-muted-foreground text-center truncate w-full">{c.nomeFantasia.split(" ")[0]}</span>
                    </div>
                  ))}
                </div>
              )}
              {visualizacao === "pizza" && (
                <div className="flex items-center justify-center py-8">
                  <div className="relative h-40 w-40">
                    <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                      {[
                        { pct: 50, color: "#10b981" },
                        { pct: 14, color: "#3b82f6" },
                        { pct: 7, color: "#f59e0b" },
                        { pct: 14, color: "#8b5cf6" },
                        { pct: 15, color: "#6b7280" },
                      ].reduce<{ offset: number; elements: JSX.Element[] }>((acc, seg, i) => {
                        const el = (
                          <circle key={i} cx="50" cy="50" r="40" fill="none" stroke={seg.color} strokeWidth="20"
                            strokeDasharray={`${seg.pct * 2.51} ${251 - seg.pct * 2.51}`}
                            strokeDashoffset={`${-acc.offset * 2.51}`}
                          />
                        );
                        return { offset: acc.offset + seg.pct, elements: [...acc.elements, el] };
                      }, { offset: 0, elements: [] }).elements}
                    </svg>
                  </div>
                  <div className="ml-6 space-y-2">
                    {[
                      { label: "Infantil", color: "#10b981", pct: "50%" },
                      { label: "Adulto", color: "#3b82f6", pct: "14%" },
                      { label: "Fitness", color: "#f59e0b", pct: "7%" },
                      { label: "Multimarcas", color: "#8b5cf6", pct: "14%" },
                      { label: "Outros", color: "#6b7280", pct: "15%" },
                    ].map((s, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: s.color }} />
                        <span className="text-xs text-foreground">{s.label}</span>
                        <span className="text-xs text-muted-foreground">{s.pct}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {(visualizacao === "linha" || visualizacao === "kpi") && (
                <div className="text-center py-12 text-muted-foreground text-xs">
                  Visualização "{visualizacoes.find(v => v.value === visualizacao)?.label}" aplicada ao relatório.
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </VendedorLayout>
  );
}
