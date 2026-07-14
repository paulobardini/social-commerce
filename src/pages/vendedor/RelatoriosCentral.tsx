import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus, Search, Star, Share2, BarChart3, Table2, PieChart, LineChart,
  MoreHorizontal, Copy, Download, Trash2, Eye, Edit, Clock, FileText,
  BookOpen, Users, Target, CheckSquare, MessageCircle, ShoppingBag, Tag, TrendingUp, AlertTriangle, RefreshCw, Award,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { relatoriosSalvos, relatoriosProntos } from "@/data/mockAnalytics";
import { useState } from "react";
import { useVendedorPerfil } from "@/hooks/useVendedorPerfil";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const formatoIcons: Record<string, any> = {
  tabela: Table2, grafico_barras: BarChart3, grafico_linha: LineChart, pizza: PieChart, cards_kpi: BarChart3, resumo: FileText,
};
const entidadeIcons: Record<string, any> = {
  clientes: Users, oportunidades: Target, representantes: Users, tarefas: CheckSquare, orcamentos: FileText, mensagens: MessageCircle, pedidos: ShoppingBag,
};
const iconMap: Record<string, any> = {
  BarChart3, UserX: Users, AlertTriangle, PieChart, Clock, CheckSquare, TrendingUp, MessageCircle, RefreshCw, ShoppingBag, Tag, Award,
};

export default function RelatoriosCentral() {
  const navigate = useNavigate();
  const perfil = useVendedorPerfil();
  const isGestor = perfil === "gestor" || perfil === "admin" || perfil === "gestor_regional";
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("todos");

  // Vendedor não vê categoria "Atendimento" (Fase 11)
  const podeVerCategoria = (cat: string) => isGestor || cat !== "Atendimento";
  const relatoriosSalvosVisiveis = relatoriosSalvos.filter(r => isGestor || !r.id.startsWith("atd-"));
  const relatoriosProntosVisiveis = relatoriosProntos.filter(r => podeVerCategoria(r.categoria));

  const filteredRels = relatoriosSalvosVisiveis.filter(r => {
    if (search && !r.nome.toLowerCase().includes(search.toLowerCase())) return false;
    if (tab === "favoritos" && !r.favorito) return false;
    if (tab === "compartilhados" && !r.compartilhado) return false;
    return true;
  });

  return (
    <>
      <div className="p-4 md:p-6 space-y-5 max-w-[1400px] mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">Relatórios</h1>
            <p className="text-sm text-muted-foreground mt-1">Central de análises e relatórios customizados</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-xs" onClick={() => navigate("/vendedor/visoes-salvas")}>
              <Eye className="h-3.5 w-3.5 mr-1" /> Visões salvas
            </Button>
            <Button size="sm" className="text-xs" onClick={() => navigate("/vendedor/relatorios/novo")}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Novo relatório
            </Button>
          </div>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <div className="flex items-center justify-between gap-3">
            <TabsList>
              <TabsTrigger value="todos" className="text-xs">Todos</TabsTrigger>
              <TabsTrigger value="favoritos" className="text-xs">⭐ Favoritos</TabsTrigger>
              <TabsTrigger value="compartilhados" className="text-xs">Compartilhados</TabsTrigger>
              <TabsTrigger value="biblioteca" className="text-xs">📚 Biblioteca</TabsTrigger>
            </TabsList>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input placeholder="Buscar relatórios..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-9 text-xs" />
            </div>
          </div>

          {/* Relatórios salvos */}
          <TabsContent value="todos" className="mt-4">
            <RelatoriosList relatorios={filteredRels} navigate={navigate} />
          </TabsContent>
          <TabsContent value="favoritos" className="mt-4">
            <RelatoriosList relatorios={filteredRels} navigate={navigate} />
          </TabsContent>
          <TabsContent value="compartilhados" className="mt-4">
            <RelatoriosList relatorios={filteredRels} navigate={navigate} />
          </TabsContent>

          {/* Biblioteca de relatórios prontos */}
          <TabsContent value="biblioteca" className="mt-4">
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">Modelos prontos para uso. Escolha um modelo para criar um relatório personalizado.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {relatoriosProntosVisiveis.map(rp => {
                const Icon = iconMap[rp.icone] || BarChart3;
                return (
                  <Card key={rp.id} className="border border-border hover:border-accent/30 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground">{rp.nome}</p>
                          <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">{rp.descricao}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="text-[9px] px-1.5 py-0">{rp.entidade}</Badge>
                            <Badge variant="outline" className="text-[9px] px-1.5 py-0">{rp.formato}</Badge>
                          </div>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="w-full mt-3 text-xs"
                        onClick={() => navigate(rp.id.startsWith("atd-") ? `/vendedor/relatorios/${rp.id}` : "/vendedor/relatorios/novo")}>
                        {rp.id.startsWith("atd-") ? "Abrir relatório" : "Usar modelo"}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

function RelatoriosList({ relatorios, navigate }: { relatorios: typeof relatoriosSalvos; navigate: any }) {
  if (relatorios.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <FileText className="h-10 w-10 mx-auto mb-3 opacity-40" />
        <p className="text-sm">Nenhum relatório encontrado</p>
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {relatorios.map(r => {
        const FormatoIcon = formatoIcons[r.formato] || FileText;
        const EntidadeIcon = entidadeIcons[r.entidade] || FileText;
        return (
          <button
            key={r.id}
            onClick={() => navigate(`/vendedor/relatorios/${r.id}`)}
            className="w-full flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 hover:border-accent/30 transition-all text-left"
          >
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <FormatoIcon className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-foreground">{r.nome}</p>
                {r.favorito && <Star className="h-3 w-3 text-amber-500 fill-amber-500" />}
                {r.compartilhado && <Share2 className="h-3 w-3 text-blue-500" />}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">{r.descricao}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <Badge variant="secondary" className="text-[9px] px-1.5 py-0">{r.entidade}</Badge>
                {r.filtrosAplicados.slice(0, 2).map((f, i) => (
                  <span key={i} className="text-[9px] text-muted-foreground">{f}</span>
                ))}
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[10px] text-muted-foreground">{r.autor}</p>
              <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1"><Clock className="h-2.5 w-2.5" /> {r.dataAtualizacao}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0"><MoreHorizontal className="h-4 w-4" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem><Eye className="h-3.5 w-3.5 mr-2" /> Abrir</DropdownMenuItem>
                <DropdownMenuItem><Edit className="h-3.5 w-3.5 mr-2" /> Editar</DropdownMenuItem>
                <DropdownMenuItem><Copy className="h-3.5 w-3.5 mr-2" /> Duplicar</DropdownMenuItem>
                <DropdownMenuItem><Star className="h-3.5 w-3.5 mr-2" /> Favoritar</DropdownMenuItem>
                <DropdownMenuItem><Share2 className="h-3.5 w-3.5 mr-2" /> Compartilhar</DropdownMenuItem>
                <DropdownMenuItem><Download className="h-3.5 w-3.5 mr-2" /> Exportar</DropdownMenuItem>
                <DropdownMenuItem className="text-red-600"><Trash2 className="h-3.5 w-3.5 mr-2" /> Excluir</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </button>
        );
      })}
    </div>
  );
}
