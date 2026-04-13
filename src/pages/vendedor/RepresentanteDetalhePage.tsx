import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft, Users, Target, TrendingUp, AlertTriangle, CheckSquare,
  Calendar, Mail, Phone, MapPin, Eye, Shuffle, BarChart3,
} from "lucide-react";
import { mockRepresentantes } from "@/data/mockRepresentantes";
import { mockClientes360, nichoLabels, statusLabels, statusColors } from "@/data/mockCRM360";

export default function RepresentanteDetalhePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState("resumo");

  const rep = mockRepresentantes.find(r => r.id === id);
  if (!rep) {
    return (
      <>
        <div className="p-6 text-center text-muted-foreground">Representante não encontrado</div>
      </>
    );
  }

  const clientes = mockClientes360.filter(c => c.representante === rep.nome);
  const pctMeta = Math.round((rep.faturamentoMes / rep.metaMensal) * 100);

  return (
    <>
      <div className="p-6 space-y-6">
        {/* Back + Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/vendedor/representantes")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-heading font-bold">{rep.nome}</h1>
              <Badge variant="secondary" className="text-xs">{rep.regiao}/{rep.estado}</Badge>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${rep.status === "ativo" ? "bg-green-100 text-green-700 border-green-200" : rep.status === "ferias" ? "bg-yellow-100 text-yellow-700 border-yellow-200" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                {rep.status === "ativo" ? "Ativo" : rep.status === "ferias" ? "Férias" : "Inativo"}
              </span>
            </div>
            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {rep.email}</span>
              <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {rep.telefone}</span>
              <span>Entrada: {rep.dataEntrada}</span>
              <span>Último acesso: {rep.ultimoAcesso}</span>
            </div>
          </div>
          <Button variant="outline" size="sm">
            <Shuffle className="h-4 w-4 mr-1" /> Redistribuir
          </Button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[
            { label: "Carteira", value: rep.carteiraTotal, icon: Users, color: "text-primary" },
            { label: "Ativos", value: rep.clientesAtivos, icon: TrendingUp, color: "text-green-600" },
            { label: "Em risco", value: rep.clientesEmRisco, icon: AlertTriangle, color: "text-red-600" },
            { label: "Oportunidades", value: rep.oportunidadesAbertas, icon: Target, color: "text-blue-600" },
            { label: "Conversão", value: `${rep.taxaConversao}%`, icon: BarChart3, color: "text-purple-600" },
            { label: "Tarefas", value: rep.tarefasPendentes, icon: CheckSquare, color: "text-yellow-600" },
          ].map(kpi => (
            <Card key={kpi.label} className="border border-border">
              <CardContent className="p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <kpi.icon className={`h-3.5 w-3.5 ${kpi.color}`} />
                  <span className="text-[11px] text-muted-foreground">{kpi.label}</span>
                </div>
                <p className="text-xl font-bold">{kpi.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Meta */}
        <Card className="border border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Meta mensal</span>
              <span className="text-sm text-muted-foreground">
                R$ {rep.faturamentoMes.toLocaleString("pt-BR")} / R$ {rep.metaMensal.toLocaleString("pt-BR")}
              </span>
            </div>
            <Progress value={pctMeta} className="h-3" />
            <p className="text-xs text-muted-foreground mt-1">{pctMeta}% atingido • Faturamento anual: R$ {rep.faturamentoAno.toLocaleString("pt-BR")}</p>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="resumo">Resumo</TabsTrigger>
            <TabsTrigger value="carteira">Carteira ({clientes.length})</TabsTrigger>
            <TabsTrigger value="oportunidades">Oportunidades</TabsTrigger>
            <TabsTrigger value="agenda">Agenda e Tarefas</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="resumo">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="border border-border">
                <CardHeader className="pb-2"><CardTitle className="text-sm">Clientes por estágio</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {[
                    { label: "Ativos", count: rep.clientesAtivos, color: "bg-green-500" },
                    { label: "Em risco", count: rep.clientesEmRisco, color: "bg-red-500" },
                    { label: "Reativação", count: rep.clientesReativacao, color: "bg-yellow-500" },
                    { label: "Outros", count: rep.carteiraTotal - rep.clientesAtivos - rep.clientesEmRisco - rep.clientesReativacao, color: "bg-slate-400" },
                  ].map(s => (
                    <div key={s.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
                        <span className="text-sm">{s.label}</span>
                      </div>
                      <span className="text-sm font-medium">{s.count}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card className="border border-border">
                <CardHeader className="pb-2"><CardTitle className="text-sm">Alertas</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {rep.clientesEmRisco > 0 && (
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <AlertTriangle className="h-4 w-4" /> {rep.clientesEmRisco} clientes em risco
                    </div>
                  )}
                  {rep.tarefasPendentes > 5 && (
                    <div className="flex items-center gap-2 text-sm text-yellow-600">
                      <CheckSquare className="h-4 w-4" /> {rep.tarefasPendentes} tarefas pendentes
                    </div>
                  )}
                  {pctMeta < 70 && (
                    <div className="flex items-center gap-2 text-sm text-orange-600">
                      <BarChart3 className="h-4 w-4" /> Meta mensal abaixo de 70%
                    </div>
                  )}
                  {rep.clientesEmRisco === 0 && rep.tarefasPendentes <= 5 && pctMeta >= 70 && (
                    <p className="text-sm text-green-600">✓ Nenhum alerta no momento</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="carteira">
            <div className="border border-border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Cliente</TableHead>
                    <TableHead className="font-semibold">Cidade/UF</TableHead>
                    <TableHead className="font-semibold">Nicho</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Último contato</TableHead>
                    <TableHead className="font-semibold text-center">Oport.</TableHead>
                    <TableHead className="font-semibold w-16">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientes.map(c => (
                    <TableRow key={c.id} className="cursor-pointer hover:bg-muted/30" onClick={() => navigate(`/vendedor/360/${c.id}`)}>
                      <TableCell>
                        <p className="text-sm font-medium">{c.nomeFantasia}</p>
                        <p className="text-[11px] text-muted-foreground">{c.documento}</p>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{c.cidade}/{c.estado}</TableCell>
                      <TableCell><Badge variant="secondary" className="text-[10px]">{nichoLabels[c.nicho]}</Badge></TableCell>
                      <TableCell><span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusColors[c.status]}`}>{statusLabels[c.status]}</span></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{c.ultimoContato}</TableCell>
                      <TableCell className="text-center text-sm font-medium">{c.oportunidadesAbertas}</TableCell>
                      <TableCell>
                        <button onClick={e => { e.stopPropagation(); navigate(`/vendedor/360/${c.id}`); }} className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-muted transition-colors">
                          <Eye className="h-4 w-4" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {clientes.length === 0 && (
                    <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Nenhum cliente na carteira</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="oportunidades">
            <Card className="border border-border">
              <CardContent className="p-6 text-center text-muted-foreground">
                <Target className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                <p className="text-sm font-medium">{rep.oportunidadesAbertas} oportunidades abertas</p>
                <p className="text-xs mt-1">Acesse o módulo de oportunidades para ver detalhes</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={() => navigate("/vendedor/oportunidades")}>
                  Ver oportunidades
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="agenda">
            <Card className="border border-border">
              <CardContent className="p-6 text-center text-muted-foreground">
                <Calendar className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                <p className="text-sm font-medium">{rep.tarefasPendentes} tarefas pendentes</p>
                <p className="text-xs mt-1">Acesse a agenda e tarefas para acompanhar</p>
                <div className="flex gap-2 justify-center mt-3">
                  <Button variant="outline" size="sm" onClick={() => navigate("/vendedor/tarefas")}>Tarefas</Button>
                  <Button variant="outline" size="sm" onClick={() => navigate("/vendedor/agenda")}>Agenda</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border border-border">
                <CardHeader className="pb-2"><CardTitle className="text-sm">Indicadores</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { label: "Taxa de conversão", value: `${rep.taxaConversao}%` },
                    { label: "Faturamento mensal", value: `R$ ${rep.faturamentoMes.toLocaleString("pt-BR")}` },
                    { label: "Faturamento anual", value: `R$ ${rep.faturamentoAno.toLocaleString("pt-BR")}` },
                    { label: "Clientes ativos", value: `${rep.clientesAtivos} de ${rep.carteiraTotal}` },
                    { label: "Clientes reativados", value: `${rep.clientesReativacao}` },
                  ].map(ind => (
                    <div key={ind.label} className="flex items-center justify-between py-1 border-b border-border last:border-0">
                      <span className="text-sm text-muted-foreground">{ind.label}</span>
                      <span className="text-sm font-medium">{ind.value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card className="border border-border">
                <CardHeader className="pb-2"><CardTitle className="text-sm">Evolução da carteira</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>📈 Carteira cresceu 12% nos últimos 3 meses</p>
                  <p>✅ 2 clientes reativados no trimestre</p>
                  <p>⚠️ {rep.clientesEmRisco} clientes em risco atualmente</p>
                  <p>🕐 Tempo médio sem interação: 8 dias</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
