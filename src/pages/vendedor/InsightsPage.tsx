import { VendedorLayout } from "@/components/vendedor/VendedorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle, TrendingUp, Target, Lightbulb, ChevronRight, ArrowRight,
  Shield, Flame, Eye,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { alertasGerenciais } from "@/data/mockAnalytics";

const tipoConfig: Record<string, { icon: any; color: string; bg: string; label: string }> = {
  risco: { icon: AlertTriangle, color: "text-red-500", bg: "bg-red-50", label: "Risco" },
  alerta: { icon: Shield, color: "text-amber-500", bg: "bg-amber-50", label: "Alerta" },
  oportunidade: { icon: Target, color: "text-blue-500", bg: "bg-blue-50", label: "Oportunidade" },
  tendencia: { icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50", label: "Tendência" },
};

const severidadeConfig: Record<string, { variant: "destructive" | "default" | "secondary" }> = {
  alta: { variant: "destructive" },
  media: { variant: "default" },
  baixa: { variant: "secondary" },
};

export default function InsightsPage() {
  const navigate = useNavigate();

  const altas = alertasGerenciais.filter(a => a.severidade === "alta");
  const medias = alertasGerenciais.filter(a => a.severidade === "media");
  const baixas = alertasGerenciais.filter(a => a.severidade === "baixa");

  return (
    <VendedorLayout>
      <div className="p-6 space-y-5 max-w-[1200px] mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
              <Lightbulb className="h-6 w-6 text-amber-500" /> Alertas & Insights
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Leituras gerenciais automáticas e acionáveis da operação</p>
          </div>
          <Button variant="outline" size="sm" className="text-xs" onClick={() => navigate("/vendedor/dashboard-gerencial")}>
            <Eye className="h-3.5 w-3.5 mr-1" /> Ver dashboard
          </Button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Severidade alta", value: altas.length, color: "text-red-600", bg: "bg-red-50", icon: AlertTriangle },
            { label: "Severidade média", value: medias.length, color: "text-amber-600", bg: "bg-amber-50", icon: Shield },
            { label: "Oportunidades", value: alertasGerenciais.filter(a => a.tipo === "oportunidade").length, color: "text-blue-600", bg: "bg-blue-50", icon: Target },
            { label: "Tendências", value: alertasGerenciais.filter(a => a.tipo === "tendencia").length, color: "text-emerald-600", bg: "bg-emerald-50", icon: TrendingUp },
          ].map(k => (
            <Card key={k.label} className="border border-border">
              <CardContent className="p-4">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center mb-2 ${k.bg}`}>
                  <k.icon className={`h-4 w-4 ${k.color}`} />
                </div>
                <p className="text-2xl font-bold font-heading">{k.value}</p>
                <p className="text-[10px] text-muted-foreground">{k.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Priority section */}
        {altas.length > 0 && (
          <Card className="border border-red-200 bg-red-50/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-heading text-red-700 flex items-center gap-2">
                <Flame className="h-4 w-4" /> Ação imediata necessária
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {altas.map(a => <InsightCard key={a.id} insight={a} navigate={navigate} />)}
            </CardContent>
          </Card>
        )}

        {/* Medium section */}
        {medias.length > 0 && (
          <Card className="border border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-heading flex items-center gap-2">
                <Shield className="h-4 w-4 text-amber-500" /> Atenção recomendada
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {medias.map(a => <InsightCard key={a.id} insight={a} navigate={navigate} />)}
            </CardContent>
          </Card>
        )}

        {/* Low section */}
        {baixas.length > 0 && (
          <Card className="border border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-heading flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-500" /> Informativo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {baixas.map(a => <InsightCard key={a.id} insight={a} navigate={navigate} />)}
            </CardContent>
          </Card>
        )}
      </div>
    </VendedorLayout>
  );
}

function InsightCard({ insight, navigate }: { insight: typeof alertasGerenciais[0]; navigate: any }) {
  const config = tipoConfig[insight.tipo];
  const Icon = config.icon;
  return (
    <button
      onClick={() => insight.linkTo && navigate(insight.linkTo)}
      className="w-full flex items-start gap-3 p-4 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors text-left"
    >
      <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${config.bg}`}>
        <Icon className={`h-4 w-4 ${config.color}`} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-foreground">{insight.titulo}</p>
          <Badge variant={severidadeConfig[insight.severidade].variant} className="text-[9px] px-1.5 py-0">{insight.severidade}</Badge>
          <Badge variant="outline" className="text-[9px] px-1.5 py-0">{config.label}</Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-1">{insight.descricao}</p>
        <p className="text-[10px] text-muted-foreground mt-1">{insight.data} · {insight.entidade}</p>
      </div>
      {insight.linkTo && <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-2" />}
    </button>
  );
}
