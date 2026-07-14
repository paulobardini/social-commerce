import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Download, Copy, Edit, Star, Share2, MoreHorizontal, Clock,
  Table2, BarChart3, Filter, Users, Target,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { relatoriosSalvos } from "@/data/mockAnalytics";
import { mockClientes360 } from "@/data/mockCRM360";
import { mockOportunidades, etapaMap } from "@/data/mockCRM";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AtdDesempenhoView, AtdFunilView, AtdPerdasView, AtdSlaView } from "@/components/relatorios/AtendimentoReportViews";

export default function RelatorioViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [exportOpen, setExportOpen] = useState(false);

  const relatorio = relatoriosSalvos.find(r => r.id === id) || relatoriosSalvos[0];

  const handleExport = (formato: string) => {
    toast({ title: "Exportação iniciada", description: `Exportando em ${formato}...` });
    setExportOpen(false);
  };

  return (
    <>
      <div className="p-6 space-y-5 max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate("/vendedor/relatorios")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-heading font-bold text-foreground">{relatorio.nome}</h1>
                {relatorio.favorito && <Star className="h-4 w-4 text-amber-500 fill-amber-500" />}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{relatorio.descricao}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-xs" onClick={() => navigate("/vendedor/relatorios/novo")}>
              <Edit className="h-3.5 w-3.5 mr-1" /> Editar
            </Button>
            <Button variant="outline" size="sm" className="text-xs" onClick={() => { toast({ title: "Duplicado", description: "Cópia criada" }); }}>
              <Copy className="h-3.5 w-3.5 mr-1" /> Duplicar
            </Button>
            <Button variant="outline" size="sm" className="text-xs"><Share2 className="h-3.5 w-3.5 mr-1" /> Compartilhar</Button>
            <Button size="sm" className="text-xs" onClick={() => setExportOpen(true)}>
              <Download className="h-3.5 w-3.5 mr-1" /> Exportar
            </Button>
          </div>
        </div>

        {/* Metadata bar */}
        <div className="flex items-center gap-4 flex-wrap">
          <Badge variant="secondary" className="text-[10px]">{relatorio.entidade}</Badge>
          <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> Atualizado: {relatorio.dataAtualizacao}</span>
          <span className="text-xs text-muted-foreground">Autor: {relatorio.autor}</span>
          {relatorio.filtrosAplicados.map((f, i) => (
            <Badge key={i} variant="outline" className="text-[9px]"><Filter className="h-2.5 w-2.5 mr-1" />{f}</Badge>
          ))}
          {relatorio.agrupamento && <Badge variant="outline" className="text-[9px]">Agrupado por: {relatorio.agrupamento}</Badge>}
        </div>

        {/* Report content by entity */}
        {relatorio.entidade === "clientes" && (
          <Card className="border border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-heading flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" /> Resultado — {mockClientes360.length} clientes
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-3 font-medium text-muted-foreground">Cliente</th>
                      <th className="text-left py-2 px-3 font-medium text-muted-foreground">Cidade/UF</th>
                      <th className="text-left py-2 px-3 font-medium text-muted-foreground">Nicho</th>
                      <th className="text-left py-2 px-3 font-medium text-muted-foreground">Interesse</th>
                      <th className="text-left py-2 px-3 font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-2 px-3 font-medium text-muted-foreground">Último contato</th>
                      <th className="text-center py-2 px-3 font-medium text-muted-foreground">Oport.</th>
                      <th className="text-center py-2 px-3 font-medium text-muted-foreground">Pedidos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockClientes360.map(c => (
                      <tr key={c.id} className="border-b border-border/50 hover:bg-muted/30 cursor-pointer" onClick={() => navigate(`/vendedor/360/${c.id}`)}>
                        <td className="py-2 px-3 font-medium">{c.nomeFantasia}</td>
                        <td className="py-2 px-3 text-muted-foreground">{c.cidade}/{c.estado}</td>
                        <td className="py-2 px-3"><Badge variant="secondary" className="text-[9px] px-1 py-0">{c.nicho}</Badge></td>
                        <td className="py-2 px-3 text-muted-foreground">{c.interessePrincipal}</td>
                        <td className="py-2 px-3">
                          <Badge variant={c.status === "ativo" ? "default" : c.status === "em_risco" ? "destructive" : "secondary"} className="text-[9px] px-1.5 py-0">
                            {c.status === "em_risco" ? "Em risco" : c.status === "reativacao" ? "Reativação" : c.status}
                          </Badge>
                        </td>
                        <td className="py-2 px-3 text-muted-foreground">{c.ultimoContato}</td>
                        <td className="py-2 px-3 text-center font-medium">{c.oportunidadesAbertas}</td>
                        <td className="py-2 px-3 text-center font-medium">{c.pedidosRealizados}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {relatorio.entidade === "oportunidades" && (
          <Card className="border border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-heading flex items-center gap-2">
                <Target className="h-4 w-4 text-purple-500" /> Resultado — {mockOportunidades.length} oportunidades
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-3 font-medium text-muted-foreground">Oportunidade</th>
                      <th className="text-left py-2 px-3 font-medium text-muted-foreground">Cliente</th>
                      <th className="text-left py-2 px-3 font-medium text-muted-foreground">Etapa</th>
                      <th className="text-right py-2 px-3 font-medium text-muted-foreground">Valor</th>
                      <th className="text-left py-2 px-3 font-medium text-muted-foreground">Prioridade</th>
                      <th className="text-left py-2 px-3 font-medium text-muted-foreground">Previsão</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockOportunidades.map(o => (
                      <tr key={o.id} className="border-b border-border/50 hover:bg-muted/30 cursor-pointer" onClick={() => navigate(`/vendedor/oportunidades/${o.id}`)}>
                        <td className="py-2 px-3 font-medium">{o.nome}</td>
                        <td className="py-2 px-3 text-muted-foreground">{o.clienteNome}</td>
                        <td className="py-2 px-3"><Badge variant="secondary" className="text-[9px] px-1.5 py-0">{etapaMap[o.etapa]}</Badge></td>
                        <td className="py-2 px-3 text-right font-medium">R$ {o.valorEstimado.toLocaleString("pt-BR")}</td>
                        <td className="py-2 px-3">
                          <Badge variant={o.prioridade === "alta" ? "destructive" : "secondary"} className="text-[9px] px-1 py-0">{o.prioridade}</Badge>
                        </td>
                        <td className="py-2 px-3 text-muted-foreground">{o.previsaoFechamento}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {!["clientes", "oportunidades"].includes(relatorio.entidade) && (
          <Card className="border border-border">
            <CardContent className="py-12 text-center text-muted-foreground text-sm">
              Relatório de {relatorio.entidade} — visualização disponível com dados operacionais.
            </CardContent>
          </Card>
        )}
      </div>

      {/* Export modal */}
      <Dialog open={exportOpen} onOpenChange={setExportOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">Exportar Relatório</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            {[
              { label: "CSV", desc: "Dados tabulares para planilha" },
              { label: "Excel (.xlsx)", desc: "Planilha formatada com filtros" },
              { label: "PDF", desc: "Relatório visual para impressão" },
            ].map(f => (
              <button
                key={f.label}
                onClick={() => handleExport(f.label)}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors text-left"
              >
                <Download className="h-4 w-4 text-primary shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">{f.label}</p>
                  <p className="text-[10px] text-muted-foreground">{f.desc}</p>
                </div>
              </button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setExportOpen(false)}>Cancelar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
