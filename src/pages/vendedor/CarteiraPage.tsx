import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users, AlertTriangle, TrendingUp, UserCheck, RefreshCw, Clock,
  Target, ChevronRight, BarChart3, ShieldAlert, Zap, MessageCircle, Flag, Sparkles,
} from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { mockClientes360, nichoLabels, type Nicho, type ClienteStatus } from "@/data/mockCRM360";
import { mockRepresentantes } from "@/data/mockRepresentantes";
import { Sparkline } from "@/components/vendedor/Sparkline";
import { toast } from "sonner";

const meses6 = ["Nov", "Dez", "Jan", "Fev", "Mar", "Abr"];
const sparkHistorico: Record<string, number[]> = {
  Total: [10, 11, 12, 12, 13, 14],
  Ativos: [6, 6, 7, 7, 8, 8],
  Novos: [1, 0, 2, 1, 2, 3],
  "Em risco": [3, 3, 4, 3, 2, 2],
  Reativação: [0, 1, 1, 0, 1, 1],
  Inativos: [4, 4, 3, 3, 2, 2],
};
function sparkPoints(label: string) {
  return (sparkHistorico[label] || []).map((v, i) => ({ label: meses6[i], value: v }));
}

// ---- Saúde: badge unificado (linguagem do método, sem "temperatura") ----
const saudeBadge: Record<ClienteStatus, { label: string; classe: string }> = {
  ativo:      { label: "Ativo",     classe: "bg-emerald-100 text-emerald-800 border-emerald-300" },
  em_risco:   { label: "Em risco",  classe: "bg-amber-100 text-amber-800 border-amber-300" },
  reativacao: { label: "Reativação",classe: "bg-sky-100 text-sky-800 border-sky-300" },
  inativo:    { label: "Inativo",   classe: "bg-slate-200 text-slate-700 border-slate-300" },
  novo:       { label: "Novo",      classe: "bg-blue-100 text-blue-800 border-blue-300" },
};

// Parse "DD/MM/YYYY" e retorna dias desde hoje (mock fixo p/ consistência)
const HOJE = new Date(2026, 3, 14);
function diasSemContato(ultimoContato: string): number {
  const m = ultimoContato.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return 999;
  const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  return Math.max(0, Math.floor((HOJE.getTime() - d.getTime()) / 86400000));
}

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

  // "Sem comprar há muito" = inativo (não há "perdido" no schema de clientes 360)
  const semComprarHaMuito = clientes.filter(c => c.status === "inativo").length;
  const comOportunidade = clientes.filter(c => c.oportunidadesAbertas > 0).length;
  const semOportunidade = clientes.filter(c => c.oportunidadesAbertas === 0).length;
  const pctAtivos = clientes.length > 0 ? Math.round((ativos / clientes.length) * 100) : 0;

  const nichos: Nicho[] = ["infantil", "adulto", "fitness", "multimarcas", "moda_praia", "casual"];
  const nichoDist = nichos.map(n => ({ nicho: n, count: clientes.filter(c => c.nicho === n).length })).filter(d => d.count > 0);

  // Ação: pega risco/reativação + quem está inativo há muito (não usa mais "temperatura").
  const clientesAcao = mockClientes360
    .filter(c => c.status === "em_risco" || c.status === "reativacao" || c.status === "inativo")
    .sort((a, b) => diasSemContato(b.ultimoContato) - diasSemContato(a.ultimoContato))
    .slice(0, 5);

  const clientesPrioritarios = mockClientes360.filter(c => c.tags.includes("alto_potencial") || c.tags.includes("urgente")).slice(0, 5);

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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

      {/* KPIs de saúde */}
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
              <div className="mt-1.5">
                <Sparkline data={sparkPoints(kpi.label)} color="hsl(var(--primary))" width={100} height={22} />
              </div>
              <p className="text-[9px] text-muted-foreground/70 mt-0.5">Últimos 6 meses</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Atingimento de meta por rep (antes: barra ambígua com % sem contexto) */}
        <Card className="border border-border lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" /> Atingimento de meta por representante
            </CardTitle>
            <p className="text-[11px] text-muted-foreground mt-1">Faturamento do mês ÷ meta mensal. Pode passar de 100% quando o rep supera a meta — isto é real, não normalizamos.</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockRepresentantes.filter(r => r.status !== "inativo").map(rep => {
              const temMeta = rep.metaMensal && rep.metaMensal > 0;
              const pctReal = temMeta ? (rep.faturamentoMes / rep.metaMensal) * 100 : 0;
              const pctVisual = Math.min(100, pctReal);
              const acimaMeta = pctReal > 100;
              const cor = pctReal >= 100 ? "bg-emerald-500" : pctReal >= 80 ? "bg-amber-500" : "bg-rose-500";
              return (
                <div key={rep.id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <button onClick={() => navigate(`/vendedor/representantes/${rep.id}`)} className="text-sm font-medium hover:text-primary transition-colors">
                      {rep.nome}
                    </button>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{rep.carteiraTotal} clientes</span>
                      <span className={rep.clientesEmRisco > 0 ? "text-red-600 font-medium" : ""}>{rep.clientesEmRisco} em risco</span>
                      <Badge variant="secondary" className="text-[10px]">{rep.regiao}</Badge>
                    </div>
                  </div>
                  {temMeta ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-2 cursor-help">
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden relative">
                            <div className={`h-full ${cor}`} style={{ width: `${pctVisual}%` }} />
                            {acimaMeta && <div className="absolute top-0 right-0 h-full w-1 bg-emerald-700" title="Ultrapassou meta" />}
                          </div>
                          <span className={`text-[11px] font-medium w-14 text-right ${acimaMeta ? "text-emerald-700" : ""}`}>
                            {Math.round(pctReal)}%
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-[280px] text-xs">
                        Faturamento do mês (R$ {rep.faturamentoMes.toLocaleString("pt-BR")}) ÷ meta mensal (R$ {rep.metaMensal.toLocaleString("pt-BR")}). {acimaMeta && "Ultrapassou a meta — barra visualmente capada em 100% e valor real ao lado."}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">Meta não definida</span>
                  )}
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
        {/* Clientes que exigem ação — badges de saúde + motivo + ações inline */}
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
            {clientesAcao.map(c => {
              const dias = diasSemContato(c.ultimoContato);
              const badge = saudeBadge[c.status] ?? saudeBadge.inativo;
              return (
                <div key={c.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="min-w-0 flex-1 cursor-pointer" onClick={() => navigate(`/vendedor/360/${c.id}`)}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium truncate">{c.nomeFantasia}</p>
                      <Badge variant="outline" className={`text-[10px] ${badge.classe}`}>{badge.label}</Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {c.cidade}/{c.estado} · {c.representante} · sem compra há {dias}d
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="WhatsApp" onClick={(e) => { e.stopPropagation(); window.open(`https://wa.me/${c.whatsapp?.replace(/\D/g, "")}`, "_blank"); }}>
                      <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 text-[10px] text-[#2D3A8C]" onClick={(e) => { e.stopPropagation(); toast.success(`Plano de recuperação solicitado ao rep ${c.representante}`); }}>
                      <Flag className="h-3 w-3 mr-1" /> Cobrar plano
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Prioritários — badges de tag em vez de emojis */}
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
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium truncate">{c.nomeFantasia}</p>
                    {c.tags.includes("alto_potencial") && (
                      <Badge variant="outline" className="text-[10px] bg-violet-100 text-violet-800 border-violet-300">
                        <Sparkles className="h-2.5 w-2.5 mr-0.5" /> Alto potencial
                      </Badge>
                    )}
                    {c.tags.includes("urgente") && (
                      <Badge variant="outline" className="text-[10px] bg-rose-100 text-rose-800 border-rose-300">Urgente</Badge>
                    )}
                    {c.tags.includes("quente") && (
                      <Badge variant="outline" className="text-[10px] bg-amber-100 text-amber-800 border-amber-300">Quente</Badge>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">{nichoLabels[c.nicho]} · {c.interessePrincipal}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {c.oportunidadesAbertas > 0 && <span className="text-[11px] text-primary font-medium">{c.oportunidadesAbertas} oport.</span>}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick stats (rodapé) — sem "temperatura fria" */}
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
            <p className="text-2xl font-bold text-red-600">{semComprarHaMuito}</p>
            <p className="text-xs text-muted-foreground">Sem comprar há muito</p>
          </CardContent>
        </Card>
        <Card className="border border-border cursor-pointer hover:border-primary/40 transition-colors" onClick={() => navigate("/vendedor/clientes")}>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{pctAtivos}%</p>
            <p className="text-xs text-muted-foreground">Clientes comprando</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
