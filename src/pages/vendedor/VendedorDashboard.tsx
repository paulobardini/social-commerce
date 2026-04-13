import { VendedorLayout } from "@/components/vendedor/VendedorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, Target, FileText, CheckSquare, AlertTriangle, Users, 
  Phone, Calendar, ArrowRight, Clock, Flame, Plus 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { dashboardKPIs, mockOportunidades, mockTarefas, compromissos, etapaMap, tagColors, tagLabels, type TagCRM } from "@/data/mockCRM";

export default function VendedorDashboard() {
  const navigate = useNavigate();

  const oportunidadesQuentes = mockOportunidades.filter(o => o.tags.includes("quente") || o.prioridade === "alta").filter(o => o.etapa !== "ganho" && o.etapa !== "perdido").slice(0, 5);
  const tarefasPendentes = mockTarefas.filter(t => t.status !== "concluida").slice(0, 5);
  const tarefasAtrasadas = mockTarefas.filter(t => t.status === "atrasada");

  const kpiCards = [
    { label: "Oportunidades abertas", value: dashboardKPIs.oportunidadesAbertas, icon: Target, color: "text-blue-600" },
    { label: "Em negociação", value: dashboardKPIs.emNegociacao, icon: TrendingUp, color: "text-orange-600" },
    { label: "Orçamentos enviados", value: dashboardKPIs.orcamentosEnviados, icon: FileText, color: "text-purple-600" },
    { label: "Tarefas pendentes", value: dashboardKPIs.tarefasPendentes, icon: CheckSquare, color: "text-emerald-600" },
    { label: "Tarefas atrasadas", value: dashboardKPIs.tarefasAtrasadas, icon: AlertTriangle, color: "text-red-600" },
    { label: "Taxa de conversão", value: `${dashboardKPIs.taxaConversao}%`, icon: TrendingUp, color: "text-green-600" },
  ];

  // Pipeline summary
  const etapas: Array<{ etapa: string; count: number; valor: number }> = [];
  const activeOps = mockOportunidades.filter(o => o.etapa !== "ganho" && o.etapa !== "perdido");
  const etapaOrder = ["novo_lead", "contato_iniciado", "em_qualificacao", "proposta_construcao", "orcamento_enviado", "em_negociacao"] as const;
  etapaOrder.forEach(e => {
    const ops = activeOps.filter(o => o.etapa === e);
    if (ops.length > 0) {
      etapas.push({ etapa: etapaMap[e], count: ops.length, valor: ops.reduce((s, o) => s + o.valorEstimado, 0) });
    }
  });

  return (
    <VendedorLayout>
      <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">Bom dia, Paulo 👋</h1>
            <p className="text-sm text-muted-foreground mt-1">Aqui está o resumo do seu dia — 13 de abril de 2026</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/vendedor/oportunidades")}>
              <Flame className="h-4 w-4 mr-1" /> Ver pipeline
            </Button>
            <Button size="sm" onClick={() => navigate("/vendedor/oportunidades/nova")}>
              <Plus className="h-4 w-4 mr-1" /> Nova oportunidade
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {kpiCards.map(kpi => (
            <Card key={kpi.label} className="border border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                </div>
                <p className="text-2xl font-bold font-heading text-foreground">{kpi.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{kpi.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pipeline value */}
        <Card className="border border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-heading">Valor do pipeline ativo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-6 mb-4">
              <div>
                <p className="text-3xl font-bold font-heading text-foreground">
                  R$ {dashboardKPIs.valorPipeline.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Total em oportunidades ativas</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-foreground">
                  R$ {dashboardKPIs.ticketMedio.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-muted-foreground">Ticket médio</p>
              </div>
            </div>
            {/* Pipeline bar */}
            <div className="flex h-3 rounded-full overflow-hidden bg-muted">
              {etapas.map((e, i) => {
                const colors = ["bg-slate-400", "bg-blue-400", "bg-purple-400", "bg-yellow-400", "bg-orange-400", "bg-orange-500"];
                const width = (e.count / activeOps.length) * 100;
                return <div key={i} className={`${colors[i]} h-full`} style={{ width: `${width}%` }} title={`${e.etapa}: ${e.count}`} />;
              })}
            </div>
            <div className="flex flex-wrap gap-4 mt-3">
              {etapas.map((e, i) => {
                const colors = ["bg-slate-400", "bg-blue-400", "bg-purple-400", "bg-yellow-400", "bg-orange-400", "bg-orange-500"];
                return (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <div className={`w-2.5 h-2.5 rounded-full ${colors[i]}`} />
                    {e.etapa} ({e.count}) — R$ {e.valor.toLocaleString("pt-BR")}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Hot opportunities */}
          <Card className="border border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-heading flex items-center gap-2">
                  <Flame className="h-4 w-4 text-orange-500" /> Oportunidades prioritárias
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate("/vendedor/oportunidades")} className="text-xs">
                  Ver todas <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {oportunidadesQuentes.map(op => (
                <button
                  key={op.id}
                  onClick={() => navigate(`/vendedor/oportunidades/${op.id}`)}
                  className="w-full flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors text-left"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{op.nome}</p>
                    <p className="text-xs text-muted-foreground">{op.clienteNome} · {etapaMap[op.etapa]}</p>
                    <div className="flex gap-1 mt-1">
                      {op.tags.slice(0, 3).map(tag => (
                        <span key={tag} className={`text-[10px] px-1.5 py-0.5 rounded-full border ${tagColors[tag]}`}>
                          {tagLabels[tag]}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right ml-3 shrink-0">
                    <p className="text-sm font-semibold text-foreground">R$ {op.valorEstimado.toLocaleString("pt-BR")}</p>
                    <p className="text-[10px] text-muted-foreground">{op.probabilidade}% prob.</p>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Tasks */}
          <Card className="border border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-heading flex items-center gap-2">
                  <CheckSquare className="h-4 w-4 text-emerald-500" /> Tarefas do dia
                  {tarefasAtrasadas.length > 0 && (
                    <Badge variant="destructive" className="text-[10px] px-1.5 py-0">{tarefasAtrasadas.length} atrasadas</Badge>
                  )}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {tarefasPendentes.map(t => (
                <div
                  key={t.id}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                    t.status === "atrasada" ? "border-red-200 bg-red-50/50" : "border-border hover:bg-muted/50"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground truncate">{t.titulo}</p>
                      {t.status === "atrasada" && <AlertTriangle className="h-3 w-3 text-red-500 shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground">{t.descricao}</p>
                  </div>
                  <div className="text-right ml-3 shrink-0">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {t.vencimento}
                    </div>
                    <Badge
                      variant={t.prioridade === "alta" ? "destructive" : "secondary"}
                      className="text-[10px] mt-1"
                    >
                      {t.prioridade}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Upcoming appointments */}
        <Card className="border border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-heading flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" /> Próximos compromissos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {compromissos.map(c => (
                <button
                  key={c.id}
                  onClick={() => navigate(`/vendedor/oportunidades/${c.oportunidadeId}`)}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors text-left"
                >
                  <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                    c.tipo === "reuniao" ? "bg-blue-100 text-blue-600" : c.tipo === "ligacao" ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600"
                  }`}>
                    {c.tipo === "reuniao" ? <Calendar className="h-4 w-4" /> : c.tipo === "ligacao" ? <Phone className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{c.titulo}</p>
                    <p className="text-xs text-muted-foreground">{c.data}</p>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </VendedorLayout>
  );
}
