import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { VendedorLayout } from "@/components/vendedor/VendedorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users, AlertTriangle, TrendingUp, UserCheck, RefreshCw, Clock,
  Target, ChevronRight, BarChart3, ShieldAlert, Zap,
} from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { mockClientes360, nichoLabels, type Nicho } from "@/data/mockCRM360";
import { mockRepresentantes } from "@/data/mockRepresentantes";
import { Progress } from "@/components/ui/progress";

export default function CarteiraPage() {
  const navigate = useNavigate();
  const [filterRep, setFilterRep] = useState("");

  const clientes = filterRep
    ? mockClientes360.filter(c => c.representante === filterRep)
    : mockClientes360;

  const ativos = clientes.filter(c => c.status === "ativo").length;
  const emRisco = clientes.filter(c => c.status === "em_risco").length;
  const reativacao = clientes.filter(c => c.status === "reativacao").length;
  const inativos = clientes.filter(c => c.status === "inativo").length;
  const novos = clientes.filter(c => c.status === "novo").length;
  const semContato = clientes.filter(c => c.temperaturaComercial === "fria").length;
  const comOportunidade = clientes.filter(c => c.oportunidadesAbertas > 0).length;
  const semOportunidade = clientes.filter(c => c.oportunidadesAbertas === 0).length;

  const nichos: Nicho[] = ["infantil", "adulto", "fitness", "multimarcas", "moda_praia", "casual"];
  const nichoDist = nichos.map(n => ({ nicho: n, count: clientes.filter(c => c.nicho === n).length })).filter(d => d.count > 0);

  const clientesEmRisco = mockClientes360.filter(c => c.status === "em_risco" || c.status === "reativacao" || c.temperaturaComercial === "fria");
  const clientesPrioritarios = mockClientes360.filter(c => c.tags.includes("alto_potencial") || c.tags.includes("urgente")).slice(0, 5);

  return (
    <VendedorLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-heading font-bold text-foreground">Visão da Carteira</h1>
            <p className="text-sm text-muted-foreground">Saúde e distribuição da base comercial</p>
          </div>
          <Select value={filterRep} onValueChange={v => setFilterRep(v === "all" ? "" : v)}>
            <SelectTrigger className="h-9 w-[200px] text-sm"><SelectValue placeholder="Todos representantes" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos representantes</SelectItem>
              {mockRepresentantes.map(r => <SelectItem key={r.id} value={r.nome}>{r.nome}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[
            { label: "Total", value: clientes.length, icon: Users, color: "text-primary" },
            { label: "Ativos", value: ativos, icon: UserCheck, color: "text-green-600" },
            { label: "Novos", value: novos, icon: Zap, color: "text-blue-600" },
            { label: "Em risco", value: emRisco, icon: AlertTriangle, color: "text-red-600" },
            { label: "Reativação", value: reativacao, icon: RefreshCw, color: "text-yellow-600" },
            { label: "Inativos", value: inativos, icon: Clock, color: "text-muted-foreground" },
          ].map(kpi => (
            <Card key={kpi.label} className="border border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                  <span className="text-xs text-muted-foreground">{kpi.label}</span>
                </div>
                <p className="text-2xl font-bold">{kpi.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Distribuição por representante */}
          <Card className="border border-border lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" /> Distribuição por representante
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockRepresentantes.filter(r => r.status !== "inativo").map(rep => {
                const pct = Math.round((rep.faturamentoMes / rep.metaMensal) * 100);
                return (
                  <div key={rep.id} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <button onClick={() => navigate(`/vendedor/representantes/${rep.id}`)} className="text-sm font-medium hover:text-primary transition-colors">
                        {rep.nome}
                      </button>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{rep.carteiraTotal} clientes</span>
                        <span className={rep.clientesEmRisco > 0 ? "text-red-600 font-medium" : ""}>{rep.clientesEmRisco} risco</span>
                        <Badge variant="secondary" className="text-[10px]">{rep.regiao}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={pct} className="h-2 flex-1" />
                      <span className="text-[11px] font-medium w-10 text-right">{pct}%</span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Distribuição por nicho */}
          <Card className="border border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" /> Distribuição por nicho
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {nichoDist.map(d => (
                <div key={d.nicho} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <span className="text-sm">{nichoLabels[d.nicho]}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${(d.count / clientes.length) * 100}%` }} />
                    </div>
                    <span className="text-sm font-medium w-6 text-right">{d.count}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Alertas */}
          <Card className="border border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-red-500" /> Clientes que exigem ação
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate("/vendedor/clientes")}>
                  Ver todos <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {clientesEmRisco.slice(0, 5).map(c => (
                <div key={c.id} onClick={() => navigate(`/vendedor/360/${c.id}`)} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{c.nomeFantasia}</p>
                    <p className="text-[11px] text-muted-foreground">{c.cidade}/{c.estado} • {c.representante}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={c.status === "em_risco" ? "destructive" : "secondary"} className="text-[10px]">
                      {c.status === "em_risco" ? "Em risco" : c.status === "reativacao" ? "Reativação" : "Frio"}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground">{c.ultimoContato}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Prioritários */}
          <Card className="border border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" /> Clientes prioritários
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate("/vendedor/clientes")}>
                  Ver todos <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {clientesPrioritarios.map(c => (
                <div key={c.id} onClick={() => navigate(`/vendedor/360/${c.id}`)} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{c.nomeFantasia}</p>
                    <p className="text-[11px] text-muted-foreground">{nichoLabels[c.nicho]} • {c.interessePrincipal}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {c.oportunidadesAbertas > 0 && <span className="text-[11px] text-primary font-medium">{c.oportunidadesAbertas} oport.</span>}
                    <span className="text-sm">{c.temperaturaComercial === "quente" ? "🔥" : c.temperaturaComercial === "morna" ? "🌤" : "❄️"}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="border border-border cursor-pointer hover:border-primary/40 transition-colors" onClick={() => navigate("/vendedor/clientes")}>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-primary">{comOportunidade}</p>
              <p className="text-xs text-muted-foreground">Com oportunidade aberta</p>
            </CardContent>
          </Card>
          <Card className="border border-border cursor-pointer hover:border-primary/40 transition-colors" onClick={() => navigate("/vendedor/clientes")}>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-yellow-600">{semOportunidade}</p>
              <p className="text-xs text-muted-foreground">Sem oportunidade</p>
            </CardContent>
          </Card>
          <Card className="border border-border cursor-pointer hover:border-primary/40 transition-colors" onClick={() => navigate("/vendedor/clientes")}>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-red-600">{semContato}</p>
              <p className="text-xs text-muted-foreground">Temperatura fria</p>
            </CardContent>
          </Card>
          <Card className="border border-border cursor-pointer hover:border-primary/40 transition-colors" onClick={() => navigate("/vendedor/clientes")}>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{Math.round((ativos / clientes.length) * 100)}%</p>
              <p className="text-xs text-muted-foreground">Taxa de clientes ativos</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </VendedorLayout>
  );
}
