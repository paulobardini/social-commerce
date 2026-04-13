import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Users, Target, FileText, CheckSquare, AlertTriangle, TrendingUp,
  ShoppingBag, MessageCircle, ArrowRight, Clock, Download, Save, BarChart3,
  Flame, UserX, Filter, ChevronRight, Eye, Award, PieChart,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  dashboardGerencialKPIs, funnelData, carteiraEstagioData,
  performanceRepresentantes, distribuicaoNicho, evolucaoPeriodo, alertasGerenciais,
} from "@/data/mockAnalytics";
import { mockClientes360 } from "@/data/mockCRM360";
import { useState } from "react";

export default function DashboardGerencial() {
  const navigate = useNavigate();
  const [periodo, setPeriodo] = useState("abril_2026");
  const kpis = dashboardGerencialKPIs;

  const kpiCards = [
    { label: "Clientes totais", value: kpis.clientesTotais, icon: Users, color: "text-blue-600", bg: "bg-blue-50", link: "/vendedor/clientes" },
    { label: "Clientes ativos", value: kpis.clientesAtivos, icon: Users, color: "text-emerald-600", bg: "bg-emerald-50", link: "/vendedor/clientes" },
    { label: "Clientes em risco", value: kpis.clientesEmRisco, icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50", link: "/vendedor/clientes" },
    { label: "Oportunidades abertas", value: kpis.oportunidadesAbertas, icon: Target, color: "text-purple-600", bg: "bg-purple-50", link: "/vendedor/oportunidades" },
    { label: "Em negociação", value: kpis.oportunidadesNegociacao, icon: TrendingUp, color: "text-orange-600", bg: "bg-orange-50", link: "/vendedor/oportunidades" },
    { label: "Taxa de conversão", value: `${kpis.taxaConversao}%`, icon: Award, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Orçamentos abertos", value: kpis.orcamentosAbertos, icon: FileText, color: "text-cyan-600", bg: "bg-cyan-50" },
    { label: "Tarefas vencidas", value: kpis.tarefasVencidas, icon: CheckSquare, color: "text-red-600", bg: "bg-red-50", link: "/vendedor/tarefas" },
    { label: "Msgs sem resposta", value: kpis.mensagensSemResposta, icon: MessageCircle, color: "text-green-600", bg: "bg-green-50", link: "/vendedor/whatsapp" },
    { label: "Pedidos do período", value: kpis.pedidosPeriodo, icon: ShoppingBag, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Ticket médio", value: `R$ ${kpis.ticketMedio.toLocaleString("pt-BR")}`, icon: TrendingUp, color: "text-violet-600", bg: "bg-violet-50" },
    { label: "Sem contato recente", value: kpis.clientesSemContato, icon: UserX, color: "text-rose-600", bg: "bg-rose-50", link: "/vendedor/clientes" },
  ];

  const maxFunnel = Math.max(...funnelData.map(f => f.volume));
  const topClientes = [...mockClientes360].filter(c => c.status === "ativo" && c.temperaturaComercial !== "fria").slice(0, 5);
  const clientesEmRisco = mockClientes360.filter(c => c.status === "em_risco" || c.status === "reativacao");

  return (
    <>
      <div className="p-4 md:p-6 space-y-5 max-w-[1500px] mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">Dashboard Gerencial</h1>
            <p className="text-sm text-muted-foreground mt-1">Visão executiva consolidada da operação comercial</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={periodo} onValueChange={setPeriodo}>
              <SelectTrigger className="w-[160px] h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="abril_2026">Abril 2026</SelectItem>
                <SelectItem value="marco_2026">Março 2026</SelectItem>
                <SelectItem value="q1_2026">Q1 2026</SelectItem>
                <SelectItem value="2026">Ano 2026</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="text-xs"><Filter className="h-3.5 w-3.5 mr-1" /> Filtros</Button>
            <Button variant="outline" size="sm" className="text-xs"><Save className="h-3.5 w-3.5 mr-1" /> Salvar visão</Button>
            <Button variant="outline" size="sm" className="text-xs"><Download className="h-3.5 w-3.5 mr-1" /> Exportar</Button>
            <Button size="sm" className="text-xs" onClick={() => navigate("/vendedor/relatorios")}>
              <BarChart3 className="h-3.5 w-3.5 mr-1" /> Relatórios
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {kpiCards.map(kpi => (
            <Card
              key={kpi.label}
              className="border border-border hover:border-accent/30 transition-colors cursor-pointer"
              onClick={() => kpi.link && navigate(kpi.link)}
            >
              <CardContent className="p-3.5">
                <div className={`h-7 w-7 rounded-lg flex items-center justify-center mb-2 ${kpi.bg}`}>
                  <kpi.icon className={`h-3.5 w-3.5 ${kpi.color}`} />
                </div>
                <p className="text-xl font-bold font-heading text-foreground">{kpi.value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{kpi.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Funnel */}
          <Card className="border border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-heading">Funil de Oportunidades</CardTitle>
                <div className="flex gap-3 text-xs text-muted-foreground">
                  <span>Taxa de ganho: <span className="font-semibold text-emerald-600">25%</span></span>
                  <span>Taxa de perda: <span className="font-semibold text-red-500">8%</span></span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {funnelData.map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-[11px] text-muted-foreground w-[120px] truncate text-right">{f.etapa}</span>
                  <div className="flex-1 h-7 bg-muted rounded overflow-hidden relative">
                    <div
                      className="h-full rounded flex items-center px-2 transition-all"
                      style={{ width: `${(f.volume / maxFunnel) * 100}%`, backgroundColor: f.cor }}
                    >
                      <span className="text-[10px] font-semibold text-white whitespace-nowrap">{f.volume}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground w-[80px] text-right">
                    R$ {(f.valor / 1000).toFixed(0)}k
                  </span>
                  <span className="text-[10px] text-muted-foreground w-[40px] text-right">{f.taxaAvanco}%</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Carteira por estágio */}
          <Card className="border border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-heading">Carteira por Estágio</CardTitle>
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate("/vendedor/carteira")}>
                  Ver carteira <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {carteiraEstagioData.map((e, i) => (
                  <button
                    key={i}
                    onClick={() => navigate("/vendedor/clientes/kanban")}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${e.cor}15` }}>
                      <span className="text-sm font-bold" style={{ color: e.cor }}>{e.quantidade}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{e.estagio}</p>
                      <div className="h-1.5 w-16 bg-muted rounded-full mt-1 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${(e.quantidade / 14) * 100}%`, backgroundColor: e.cor }} />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance por representante */}
        <Card className="border border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-heading flex items-center gap-2">
                <Award className="h-4 w-4 text-amber-500" /> Performance por Representante
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate("/vendedor/representantes")}>
                Ver todos <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Representante</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Região</th>
                    <th className="text-center py-2 px-3 text-xs font-medium text-muted-foreground">Carteira</th>
                    <th className="text-center py-2 px-3 text-xs font-medium text-muted-foreground">Ativos</th>
                    <th className="text-center py-2 px-3 text-xs font-medium text-muted-foreground">Em risco</th>
                    <th className="text-center py-2 px-3 text-xs font-medium text-muted-foreground">Oport.</th>
                    <th className="text-center py-2 px-3 text-xs font-medium text-muted-foreground">Conversão</th>
                    <th className="text-center py-2 px-3 text-xs font-medium text-muted-foreground">Tarefas pend.</th>
                    <th className="text-center py-2 px-3 text-xs font-medium text-muted-foreground">Último acesso</th>
                  </tr>
                </thead>
                <tbody>
                  {performanceRepresentantes.map((r, i) => (
                    <tr
                      key={i}
                      className="border-b border-border/50 hover:bg-muted/30 cursor-pointer transition-colors"
                      onClick={() => navigate("/vendedor/representantes")}
                    >
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <span className="text-[10px] font-bold text-primary">{r.nome.split(" ").map(w => w[0]).join("")}</span>
                          </div>
                          <span className="font-medium text-foreground text-xs">{r.nome}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-xs text-muted-foreground">{r.regiao}</td>
                      <td className="py-2.5 px-3 text-xs text-center font-medium">{r.carteira}</td>
                      <td className="py-2.5 px-3 text-xs text-center text-emerald-600 font-medium">{r.ativos}</td>
                      <td className="py-2.5 px-3 text-xs text-center">
                        {r.emRisco > 2 ? <span className="text-red-600 font-semibold">{r.emRisco}</span> : r.emRisco}
                      </td>
                      <td className="py-2.5 px-3 text-xs text-center">{r.oportunidades}</td>
                      <td className="py-2.5 px-3 text-xs text-center">
                        <span className={r.conversao >= 30 ? "text-emerald-600 font-semibold" : r.conversao < 20 ? "text-red-500 font-semibold" : ""}>{r.conversao}%</span>
                      </td>
                      <td className="py-2.5 px-3 text-xs text-center">
                        {r.tarefasPendentes > 5 ? <span className="text-red-500 font-semibold">{r.tarefasPendentes}</span> : r.tarefasPendentes}
                      </td>
                      <td className="py-2.5 px-3 text-xs text-center text-muted-foreground">{r.ultimoAcesso}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Distribuição por nicho */}
          <Card className="border border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-heading flex items-center gap-2">
                <PieChart className="h-4 w-4 text-violet-500" /> Por Nicho
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {distribuicaoNicho.map((n, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: n.cor }} />
                  <span className="text-xs text-foreground flex-1">{n.nicho}</span>
                  <span className="text-xs font-medium text-foreground">{n.clientes}</span>
                  <span className="text-[10px] text-muted-foreground w-10 text-right">{n.percentual}%</span>
                  <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${n.percentual}%`, backgroundColor: n.cor }} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Evolução do período */}
          <Card className="border border-border lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-heading flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-500" /> Evolução do Período
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-2 font-medium text-muted-foreground">Mês</th>
                      <th className="text-center py-2 px-2 font-medium text-muted-foreground">Oport. criadas</th>
                      <th className="text-center py-2 px-2 font-medium text-muted-foreground">Oport. ganhas</th>
                      <th className="text-center py-2 px-2 font-medium text-muted-foreground">Clientes ativ.</th>
                      <th className="text-center py-2 px-2 font-medium text-muted-foreground">Tarefas concl.</th>
                      <th className="text-center py-2 px-2 font-medium text-muted-foreground">Pedidos</th>
                      <th className="text-center py-2 px-2 font-medium text-muted-foreground">Msgs respond.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {evolucaoPeriodo.map((e, i) => (
                      <tr key={i} className="border-b border-border/50">
                        <td className="py-2 px-2 font-medium">{e.mes}</td>
                        <td className="py-2 px-2 text-center">{e.oportunidadesCriadas}</td>
                        <td className="py-2 px-2 text-center text-emerald-600 font-medium">{e.oportunidadesGanhas}</td>
                        <td className="py-2 px-2 text-center">{e.clientesAtivados}</td>
                        <td className="py-2 px-2 text-center">{e.tarefasConcluidas}</td>
                        <td className="py-2 px-2 text-center">{e.pedidos}</td>
                        <td className="py-2 px-2 text-center">{e.mensagensRespondidas}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Simple bar chart */}
              <div className="mt-4 flex items-end gap-1 h-20">
                {evolucaoPeriodo.map((e, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex gap-0.5 items-end justify-center h-16">
                      <div className="w-2 rounded-t bg-blue-400" style={{ height: `${(e.oportunidadesCriadas / 8) * 100}%` }} title="Oport." />
                      <div className="w-2 rounded-t bg-emerald-400" style={{ height: `${(e.oportunidadesGanhas / 3) * 100}%` }} title="Ganhas" />
                      <div className="w-2 rounded-t bg-amber-400" style={{ height: `${(e.pedidos / 5) * 100}%` }} title="Pedidos" />
                    </div>
                    <span className="text-[9px] text-muted-foreground">{e.mes}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 mt-2 justify-center">
                <div className="flex items-center gap-1 text-[9px] text-muted-foreground"><div className="w-2 h-2 rounded bg-blue-400" /> Oport. criadas</div>
                <div className="flex items-center gap-1 text-[9px] text-muted-foreground"><div className="w-2 h-2 rounded bg-emerald-400" /> Ganhas</div>
                <div className="flex items-center gap-1 text-[9px] text-muted-foreground"><div className="w-2 h-2 rounded bg-amber-400" /> Pedidos</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Alertas gerenciais */}
          <Card className="border border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-heading flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" /> Alertas Gerenciais
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate("/vendedor/insights")}>
                  Ver todos <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {alertasGerenciais.filter(a => a.severidade === "alta").map(a => (
                <button
                  key={a.id}
                  onClick={() => a.linkTo && navigate(a.linkTo)}
                  className="w-full flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors text-left"
                >
                  <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    a.tipo === "risco" ? "bg-red-50" : a.tipo === "alerta" ? "bg-amber-50" : "bg-blue-50"
                  }`}>
                    <AlertTriangle className={`h-3.5 w-3.5 ${
                      a.tipo === "risco" ? "text-red-500" : a.tipo === "alerta" ? "text-amber-500" : "text-blue-500"
                    }`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-foreground">{a.titulo}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{a.descricao}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Listas executivas */}
          <Card className="border border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-heading">Listas Executivas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-muted-foreground flex items-center gap-1"><Flame className="h-3 w-3 text-orange-500" /> Top clientes ativos</p>
                  </div>
                  {topClientes.map(c => (
                    <button key={c.id} onClick={() => navigate(`/vendedor/360/${c.id}`)} className="w-full flex items-center justify-between py-1.5 px-2 rounded hover:bg-muted/50 text-left">
                      <div className="flex items-center gap-2">
                        <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center"><span className="text-[8px] font-bold text-primary">{c.nomeFantasia[0]}</span></div>
                        <span className="text-xs text-foreground">{c.nomeFantasia}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[9px] px-1 py-0">{c.nicho}</Badge>
                        <span className="text-[10px] text-muted-foreground">{c.oportunidadesAbertas} oport.</span>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="border-t border-border pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-muted-foreground flex items-center gap-1"><AlertTriangle className="h-3 w-3 text-red-500" /> Clientes em risco</p>
                  </div>
                  {clientesEmRisco.map(c => (
                    <button key={c.id} onClick={() => navigate(`/vendedor/360/${c.id}`)} className="w-full flex items-center justify-between py-1.5 px-2 rounded hover:bg-muted/50 text-left">
                      <div className="flex items-center gap-2">
                        <div className="h-5 w-5 rounded-full bg-red-50 flex items-center justify-center"><span className="text-[8px] font-bold text-red-600">{c.nomeFantasia[0]}</span></div>
                        <span className="text-xs text-foreground">{c.nomeFantasia}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground">Último: {c.ultimoContato}</span>
                        <Badge variant="destructive" className="text-[9px] px-1 py-0">{c.status === "em_risco" ? "Risco" : "Reativação"}</Badge>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
