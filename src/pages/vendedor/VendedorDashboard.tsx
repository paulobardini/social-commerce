import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, Target, FileText, CheckSquare, AlertTriangle, Users, 
  Phone, Calendar, ArrowRight, Clock, Flame, Plus, MessageCircle, UserX,
  MapPin, ShoppingBag, Pencil,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { dashboardKPIs, mockOportunidades, mockTarefas, compromissos, etapaMap, tagColors, tagLabels, type TagCRM } from "@/data/mockCRM";
import { mockConversas, mockClientes360, mockCompromissos, tipoCompromissoLabels } from "@/data/mockCRM360";
import { useMetas } from "@/contexts/MetasContext";
import { MetasModal } from "@/components/vendedor/MetasModal";
import { QuickTaskModal } from "@/components/vendedor/QuickTaskModal";

export default function VendedorDashboard() {
  const navigate = useNavigate();
  const { metaMensal, realizadoMes } = useMetas();
  const [showMeta, setShowMeta] = useState(false);
  const [taskModal, setTaskModal] = useState<{ open: boolean; cliente: string }>({ open: false, cliente: "" });

  const oportunidadesQuentes = mockOportunidades.filter(o => o.tags.includes("quente") || o.prioridade === "alta").filter(o => o.etapa !== "ganho" && o.etapa !== "perdido").slice(0, 4);
  const tarefasPendentes = mockTarefas.filter(t => t.status !== "concluida").slice(0, 5);
  const tarefasAtrasadas = mockTarefas.filter(t => t.status === "atrasada");
  const totalNaoLidas = mockConversas.reduce((s, c) => s + c.naoLidas, 0);
  const clientesSemContato = mockClientes360.filter(c => c.temperaturaComercial === "fria" && (c.status === "em_risco" || c.status === "reativacao" || c.status === "inativo"));
  const proximosCompromissos = mockCompromissos.filter(c => c.status === "agendado").slice(0, 4);

  // negative=true => métrica de "alerta" (atrasadas, não lidas). Recebe border-left vermelho se valor>0; opacidade reduzida se valor=0.
  const kpiCards = [
    { label: "Oportunidades abertas", value: dashboardKPIs.oportunidadesAbertas, icon: Target, color: "text-blue-600", bg: "bg-blue-50", negative: false },
    { label: "Em negociação", value: dashboardKPIs.emNegociacao, icon: TrendingUp, color: "text-orange-600", bg: "bg-orange-50", negative: false },
    { label: "Orçamentos enviados", value: dashboardKPIs.orcamentosEnviados, icon: FileText, color: "text-purple-600", bg: "bg-purple-50", negative: false },
    { label: "Tarefas pendentes", value: dashboardKPIs.tarefasPendentes, icon: CheckSquare, color: "text-emerald-600", bg: "bg-emerald-50", negative: false },
    { label: "Tarefas atrasadas", value: dashboardKPIs.tarefasAtrasadas, icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50", negative: true },
    { label: "Mensagens não lidas", value: totalNaoLidas, icon: MessageCircle, color: "text-green-600", bg: "bg-green-50", negative: true },
  ];

  // Meta do mês
  const pctMeta = metaMensal > 0 ? Math.min(100, Math.round((realizadoMes / metaMensal) * 100)) : 0;
  const metaBarColor = pctMeta >= 80 ? "bg-emerald-500" : pctMeta >= 50 ? "bg-yellow-500" : "bg-red-500";
  const metaTextColor = pctMeta >= 80 ? "text-emerald-600" : pctMeta >= 50 ? "text-yellow-600" : "text-red-600";

  const activeOps = mockOportunidades.filter(o => o.etapa !== "ganho" && o.etapa !== "perdido");
  const etapaOrder = ["novo_lead", "contato_iniciado", "em_qualificacao", "proposta_construcao", "orcamento_enviado", "em_negociacao"] as const;
  const etapas = etapaOrder.map(e => {
    const ops = activeOps.filter(o => o.etapa === e);
    return { etapa: etapaMap[e], count: ops.length, valor: ops.reduce((s, o) => s + o.valorEstimado, 0) };
  }).filter(e => e.count > 0);

  const tipoIcons: Record<string, any> = {
    ligacao: Phone, reuniao: Calendar, visita: MapPin, follow_up: ArrowRight,
    retorno_orcamento: Clock, apresentacao: FileText,
  };
  const tipoColors: Record<string, string> = {
    ligacao: "bg-green-100 text-green-600", reuniao: "bg-blue-100 text-blue-600",
    visita: "bg-purple-100 text-purple-600", follow_up: "bg-orange-100 text-orange-600",
    retorno_orcamento: "bg-yellow-100 text-yellow-600", apresentacao: "bg-indigo-100 text-indigo-600",
  };

  return (
    <>
      <div className="p-4 md:p-6 space-y-5 max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-heading font-bold text-foreground">Bom dia, Paulo 👋</h1>
            <p className="text-sm text-muted-foreground mt-1">Aqui está o resumo do seu dia — 13 de abril de 2026</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/vendedor/oportunidades")}>
              <Flame className="h-4 w-4 mr-1" /> <span className="hidden sm:inline">Ver pipeline</span><span className="sm:hidden">Pipeline</span>
            </Button>
            <Button size="sm" onClick={() => navigate("/vendedor/oportunidades/nova")}>
              <Plus className="h-4 w-4 mr-1" /> Nova
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {kpiCards.map(kpi => (
            <Card key={kpi.label} className="border border-border hover:border-accent/30 transition-colors cursor-pointer" onClick={() => {
              if (kpi.label.includes("Mensagens")) navigate("/vendedor/whatsapp");
              else if (kpi.label.includes("Tarefa")) navigate("/vendedor/tarefas");
              else if (kpi.label.includes("Oportunidades") || kpi.label.includes("negociação")) navigate("/vendedor/oportunidades");
            }}>
              <CardContent className="p-4">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center mb-2 ${kpi.bg}`}>
                  <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                </div>
                <p className="text-2xl font-bold font-heading text-foreground">{kpi.value}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{kpi.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pipeline value */}
        <Card className="border border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-heading">Valor do pipeline ativo</CardTitle>
              <p className="text-xs text-muted-foreground">Taxa de conversão: <span className="font-semibold text-foreground">{dashboardKPIs.taxaConversao}%</span></p>
            </div>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
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
                  className="w-full flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 hover:border-accent/30 transition-all text-left"
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
                <Button variant="ghost" size="sm" onClick={() => navigate("/vendedor/tarefas")} className="text-xs">
                  Ver todas <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
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
                      <Clock className="h-3 w-3" /> {t.vencimento}
                    </div>
                    <Badge variant={t.prioridade === "alta" ? "destructive" : "secondary"} className="text-[10px] mt-1">{t.prioridade}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Upcoming appointments */}
          <Card className="border border-border lg:col-span-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-heading flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-500" /> Próximos compromissos
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate("/vendedor/agenda")} className="text-xs">
                  Ver agenda <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {proximosCompromissos.map(c => {
                  const Icon = tipoIcons[c.tipo] || Calendar;
                  return (
                    <button
                      key={c.id}
                      onClick={() => c.clienteId && navigate(`/vendedor/360/${c.clienteId}`)}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 hover:border-accent/30 transition-all text-left"
                    >
                      <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${tipoColors[c.tipo]}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">{c.titulo}</p>
                        <p className="text-xs text-muted-foreground">{c.data} · {c.hora} · {c.duracao}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Clients without contact */}
          <Card className="border border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-heading flex items-center gap-2">
                  <UserX className="h-4 w-4 text-red-500" /> Atenção
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {clientesSemContato.map(c => (
                <button
                  key={c.id}
                  onClick={() => navigate(`/vendedor/360/${c.id}`)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-lg border border-border hover:bg-muted/50 transition-colors text-left"
                >
                  <div className="h-8 w-8 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-red-600">{c.nomeFantasia[0]}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{c.nomeFantasia}</p>
                    <p className="text-[10px] text-muted-foreground">Último: {c.ultimoContato}</p>
                  </div>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full border ${c.status === "em_risco" ? "bg-red-100 text-red-700 border-red-200" : c.status === "reativacao" ? "bg-yellow-100 text-yellow-700 border-yellow-200" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                    {c.status === "em_risco" ? "Em risco" : c.status === "reativacao" ? "Reativação" : "Inativo"}
                  </span>
                </button>
              ))}
              {clientesSemContato.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">Nenhum alerta</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
