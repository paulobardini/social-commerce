import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Breadcrumbs } from "@/components/vendedor/Breadcrumbs";
import { OportunidadeBadges } from "@/components/vendedor/OportunidadeBadges";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowRight, FileText, Phone, MessageSquare, CheckSquare, Clock,
  Calendar, Plus, Send, ThumbsUp, ThumbsDown, User, Building, TrendingUp,
  Mail, Video, StickyNote, Zap, MessageCircle, MapPin, Sparkles, MoreHorizontal, Trash2, Copy, Target,
} from "lucide-react";
import {
  mockOportunidades, mockAtividades,
  etapasCanonicas, etapaToCanonica, canonicaToBase, probabilidadeAutoPorCanonica, getDemanda, getTituloCompleto,
  type Oportunidade, type EtapaCanonica,
} from "@/data/mockCRM";
import { mockOrcamentos } from "@/data/mockVendedor";
import { Textarea } from "@/components/ui/textarea";
import { useAutomacoes } from "@/contexts/AutomacoesContext";
import { automacaoTipoLabels, type AutomacaoTipoTarefa } from "@/data/mockAutomacoes";
import { toast } from "sonner";

const atividadeIcons: Record<string, any> = {
  ligacao: Phone, reuniao: Video, email: Mail, follow_up: Clock,
  nota: StickyNote, mudanca_etapa: ArrowRight, orcamento_criado: FileText, tarefa: CheckSquare,
  automacao: Zap,
};

const atividadeColors: Record<string, string> = {
  ligacao: "bg-green-100 text-green-600", reuniao: "bg-blue-100 text-blue-600",
  email: "bg-purple-100 text-purple-600", follow_up: "bg-orange-100 text-orange-600",
  nota: "bg-yellow-100 text-yellow-600", mudanca_etapa: "bg-slate-100 text-slate-600",
  orcamento_criado: "bg-indigo-100 text-indigo-600", tarefa: "bg-emerald-100 text-emerald-600",
  automacao: "bg-amber-100 text-amber-600",
};

const tarefaTipoIcon: Record<AutomacaoTipoTarefa, any> = {
  ligacao: Phone, whatsapp: MessageCircle, email: Mail,
  visita: MapPin, proposta: FileText, personalizado: Sparkles,
};

const orcStatusChip: Record<string, { label: string; cls: string }> = {
  ativo: { label: "rascunho", cls: "bg-slate-100 text-slate-700 border-slate-200" },
  revisao_lojista: { label: "visualizado", cls: "bg-blue-100 text-blue-700 border-blue-200" },
  revisao_comercial: { label: "contraproposta", cls: "bg-amber-100 text-amber-700 border-amber-200" },
  aprovado_parcial: { label: "aprovado parcial", cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  aprovado: { label: "aprovado", cls: "bg-green-100 text-green-700 border-green-200" },
  recusado: { label: "recusado", cls: "bg-red-100 text-red-700 border-red-200" },
};

export default function OportunidadeDetalhe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState("resumo");
  const [novaNota, setNovaNota] = useState("");

  const { tarefas: tarefasAll, aplicadas, concluirTarefa } = useAutomacoes();

  const op = mockOportunidades.find(o => o.id === id) || mockOportunidades[0];
  const atividades = mockAtividades.filter(a => a.oportunidadeId === op.id);
  const tarefas = tarefasAll.filter(t => t.oportunidadeId === op.id);
  const automacoesAplicadas = aplicadas.filter(a => a.oportunidadeId === op.id);
  const orcamentos = mockOrcamentos.filter(o => op.orcamentoIds.includes(o.id));

  const prioridadeDot: Record<string, string> = { alta: "bg-red-500", media: "bg-yellow-500", baixa: "bg-green-500" };

  const currentCanon: EtapaCanonica = etapaToCanonica[op.etapa];
  const etapasProgresso = etapasCanonicas.filter(e => e.id !== "perdida");
  const currentIdx = etapasProgresso.findIndex(e => e.id === currentCanon);
  const etapaAtual = etapasCanonicas.find(e => e.id === currentCanon)!;
  const probAuto = probabilidadeAutoPorCanonica[currentCanon];

  // Briefing resumo
  const b = op.briefing;
  const briefingLinhas: string[] = [];
  if (b?.categorias?.length) briefingLinhas.push(b.categorias.join(", "));
  if (b?.faixaMin && b?.faixaMax) briefingLinhas.push(`R$ ${b.faixaMin}–${b.faixaMax}/pç`);
  if (b?.quantidade) briefingLinhas.push(`${b.quantidade} pçs`);
  if (b?.genero) briefingLinhas.push(b.genero);
  if (b?.estacao) briefingLinhas.push(b.estacao);
  const briefingResumo = briefingLinhas.join(" · ") || "Sem briefing estruturado";

  // Comparativo briefing × orçamento
  const mediaProposta = orcamentos.length
    ? Math.round(orcamentos.reduce((s, o) => s + (o.valorTotal || 0), 0) / orcamentos.length)
    : 0;

  const handleChangeEtapa = (canon: EtapaCanonica) => {
    // mock — apenas toast, mockOportunidades é imutável aqui
    toast.success(`Etapa alterada para "${etapasCanonicas.find(e => e.id === canon)?.nome}"`);
  };

  const timeline = [
    ...automacoesAplicadas.map(aa => ({
      id: aa.id, tipo: "automacao" as const,
      descricao: `Automação: ${aa.automacaoNome}${aa.encerradaEm ? " (encerrada)" : ""}`,
      data: aa.dataAplicacao, autor: aa.aplicadaPor, detalhes: undefined as string | undefined,
    })),
    ...atividades.map(a => ({
      id: a.id, tipo: a.tipo, descricao: a.descricao, data: a.data, autor: a.autor, detalhes: a.detalhes,
    })),
  ].sort((a, b) => (a.data < b.data ? 1 : -1));

  return (
    <div className="p-4 md:p-6 max-w-[1200px] mx-auto space-y-5">
      <Breadcrumbs items={[
        { label: "Oportunidades", path: "/vendedor/oportunidades" },
        { label: getTituloCompleto(op.nome, op.clienteNome) },
      ]} />

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div className="space-y-2 min-w-0">
          <h1 className="text-xl font-heading font-bold text-foreground leading-tight">{op.nome}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1"><Building className="h-3.5 w-3.5" /> {op.clienteNome}</span>
            <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> {op.representante}</span>
            <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Criada em {op.dataCriacao}</span>
            {op.origem && <span>Origem: <span className="font-medium text-foreground">{op.origem}</span></span>}
          </div>
          <OportunidadeBadges
            temperatura={op.temperatura}
            segmento={op.segmento}
            urgente={op.urgente}
            size="md"
          />
        </div>

        <div className="flex flex-wrap gap-2 shrink-0">
          <Button size="sm" onClick={() => navigate(`/vendedor/novo-orcamento?oportunidade=${op.id}&cliente=${op.clienteNome}`)}>
            <FileText className="h-4 w-4 mr-1" /> Gerar orçamento
          </Button>
          {currentCanon !== "ganha" && currentCanon !== "perdida" && (
            <>
              <Button variant="outline" size="sm" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => handleChangeEtapa("ganha")}>
                <ThumbsUp className="h-4 w-4 mr-1" /> Ganho
              </Button>
              <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleChangeEtapa("perdida")}>
                <ThumbsDown className="h-4 w-4 mr-1" /> Perdido
              </Button>
            </>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9"><MoreHorizontal className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem><Copy className="h-4 w-4 mr-2" /> Duplicar</DropdownMenuItem>
              <DropdownMenuItem><FileText className="h-4 w-4 mr-2" /> Exportar PDF</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onClick={() => {
                  if (confirm("Excluir esta oportunidade? Esta ação não pode ser desfeita.")) {
                    toast.success("Oportunidade excluída."); navigate("/vendedor/oportunidades");
                  }
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Progresso clicável (único controle de etapa) */}
      <div>
        <div className="flex items-center gap-1">
          {etapasProgresso.map((e, i) => {
            const isActive = i <= currentIdx && currentCanon !== "perdida";
            const color = isActive ? e.cor : "#e2e8f0";
            const isCurrent = e.id === currentCanon;
            return (
              <button
                key={e.id}
                onClick={() => handleChangeEtapa(e.id)}
                className="flex-1 flex flex-col items-center gap-1 group"
              >
                <div
                  className={`w-full h-2 rounded-full transition-all group-hover:h-2.5 ${isCurrent ? "ring-2 ring-offset-1" : ""}`}
                  style={{ backgroundColor: color, ...(isCurrent ? { boxShadow: `0 0 0 2px ${color}40` } : {}) }}
                />
                <span className={`text-[10px] ${isCurrent ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                  {e.nome}
                </span>
              </button>
            );
          })}
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">
          Probabilidade (automática por etapa): <span className="font-medium text-foreground">{probAuto}%</span>
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Valor estimado</p>
            <p className="text-lg font-bold font-heading">R$ {op.valorEstimado.toLocaleString("pt-BR")}</p>
          </CardContent>
        </Card>
        <Card className="border border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Previsão fechamento</p>
            <p className="text-lg font-bold font-heading">{op.previsaoFechamento}</p>
          </CardContent>
        </Card>
        <Card className="border border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Prioridade</p>
            <div className="flex items-center gap-2 mt-1">
              <div className={`w-2.5 h-2.5 rounded-full ${prioridadeDot[op.prioridade]}`} />
              <p className="text-lg font-bold font-heading capitalize">{op.prioridade}</p>
            </div>
          </CardContent>
        </Card>
        <Card
          className="border border-border cursor-pointer hover:border-accent/60 transition-colors"
          onClick={() => toast.info("Editar briefing (mock)")}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5 text-accent" />
              <p className="text-xs text-muted-foreground">Briefing</p>
            </div>
            <p className="text-xs font-medium mt-1 line-clamp-2">{briefingResumo}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs consolidadas */}
      <Tabs value={tab} onValueChange={setTab} className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
          <TabsTrigger value="orcamento">Orçamentos ({orcamentos.length})</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="tarefas">Tarefas ({tarefas.length})</TabsTrigger>
        </TabsList>

        {/* Resumo */}
        <TabsContent value="resumo" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="border border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-heading">Dados</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Cliente</span><span className="font-medium">{op.clienteNome}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Origem</span><span className="font-medium">{op.origem}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Etapa</span><span className="font-medium">{etapaAtual.nome}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Última interação</span><span className="font-medium">{op.ultimaInteracao}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Orçamentos</span><span className="font-medium">{orcamentos.length}</span></div>
                {op.motivoPerda && (
                  <div className="flex justify-between"><span className="text-muted-foreground">Motivo da perda</span><span className="font-medium text-red-600">{op.motivoPerda}</span></div>
                )}
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-heading">Próximos passos</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2 p-3 rounded-lg bg-accent/5 border border-accent/10">
                  <ArrowRight className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                  <p className="text-sm font-medium">{op.proximaAcao}</p>
                </div>
                {op.observacoes && (
                  <div className="p-3 rounded-lg bg-muted/50 border border-border">
                    <p className="text-xs text-muted-foreground mb-1">Observações</p>
                    <p className="text-sm">{op.observacoes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Orçamentos */}
        <TabsContent value="orcamento" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Tentativas de atender a demanda</p>
            <Button size="sm" onClick={() => navigate(`/vendedor/novo-orcamento?oportunidade=${op.id}&cliente=${op.clienteNome}`)}>
              <Plus className="h-4 w-4 mr-1" /> Novo orçamento (catálogo pré-filtrado)
            </Button>
          </div>

          {/* Comparativo briefing × proposta */}
          {b?.faixaMax && mediaProposta > 0 && (
            <div className="p-3 rounded-lg border border-border bg-muted/30 text-sm flex items-center gap-3 flex-wrap">
              <Target className="h-4 w-4 text-accent shrink-0" />
              <div className="flex-1 min-w-[200px]">
                <p className="text-xs text-muted-foreground">Comparativo</p>
                <p className="font-medium">
                  Pediu até R$ {b.faixaMax}/pç · proposta média R$ {b.quantidade ? Math.round(mediaProposta / b.quantidade) : "—"}/pç{" "}
                  <span className={b.quantidade && (mediaProposta / b.quantidade) <= b.faixaMax ? "text-green-600" : "text-orange-600"}>
                    {b.quantidade && (mediaProposta / b.quantidade) <= b.faixaMax ? "✓" : "⚠"}
                  </span>
                </p>
              </div>
            </div>
          )}

          {orcamentos.length > 0 ? (
            <div className="space-y-2">
              {orcamentos.map(orc => {
                const chip = orcStatusChip[orc.status] || { label: orc.status, cls: "bg-muted text-muted-foreground border-border" };
                return (
                  <div key={orc.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium">#{orc.id} · {orc.nomeBase || orc.nome}</p>
                        {orc.versao && <Badge variant="secondary" className="text-[10px]">v{orc.versao}</Badge>}
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border ${chip.cls}`}>{chip.label}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>{orc.dataCriacao}</span>
                        {orc.marcas.length > 0 && <span>{orc.marcas.join(", ")}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {orc.valorTotal && (
                        <span className="text-sm font-semibold">R$ {orc.valorTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                      )}
                      <Button variant="outline" size="sm" onClick={() => navigate(`/vendedor/orcamento/${orc.id}`)}>
                        Abrir
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground border border-dashed border-border rounded-lg">
              <FileText className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
              <p className="text-sm">Nenhum orçamento vinculado</p>
              <p className="text-xs mt-1">Monte a cesta a partir do briefing para atender esta demanda</p>
            </div>
          )}
        </TabsContent>

        {/* Timeline (Atividades + Histórico + Anotações) */}
        <TabsContent value="timeline" className="space-y-4">
          {/* Composer de nota */}
          <Card className="border border-border">
            <CardContent className="p-3 space-y-2">
              <Textarea
                placeholder="Adicionar nota, registrar contato ou anotar contexto..."
                value={novaNota}
                onChange={e => setNovaNota(e.target.value)}
                rows={2}
              />
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex gap-1.5 flex-wrap">
                  {[
                    { label: "Ligação", icon: Phone },
                    { label: "Reunião", icon: Video },
                    { label: "E-mail", icon: Mail },
                    { label: "Follow-up", icon: Clock },
                    { label: "Nota", icon: StickyNote },
                  ].map(a => (
                    <Button key={a.label} variant="ghost" size="sm" className="h-7 text-[11px]">
                      <a.icon className="h-3 w-3 mr-1" /> {a.label}
                    </Button>
                  ))}
                </div>
                <Button size="sm" disabled={!novaNota.trim()} onClick={() => { toast.success("Nota registrada."); setNovaNota(""); }}>
                  <Send className="h-3.5 w-3.5 mr-1" /> Registrar
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {timeline.map(item => {
              const Icon = atividadeIcons[item.tipo] || StickyNote;
              return (
                <div key={item.id} className="flex gap-3 items-start">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${atividadeColors[item.tipo] || "bg-muted text-muted-foreground"}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 border border-border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1 gap-2">
                      <p className="text-sm font-medium">{item.descricao}</p>
                      <span className="text-[11px] text-muted-foreground whitespace-nowrap">{item.data}</span>
                    </div>
                    {item.detalhes && <p className="text-xs text-muted-foreground">{item.detalhes}</p>}
                    <p className="text-[11px] text-muted-foreground mt-1">por {item.autor}</p>
                  </div>
                </div>
              );
            })}
            {timeline.length === 0 && (
              <div className="text-center py-12 text-muted-foreground text-sm">Nada registrado ainda</div>
            )}
          </div>
        </TabsContent>

        {/* Tarefas */}
        <TabsContent value="tarefas" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{tarefas.length} tarefa(s) vinculada(s)</p>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Nova tarefa</Button>
          </div>
          <div className="space-y-2">
            {tarefas.map(t => {
              const TipoIcon = t.tipo ? tarefaTipoIcon[t.tipo] : CheckSquare;
              const isCancelada = t.status === "cancelada";
              const isConcluida = t.status === "concluida";
              const isAtrasada = t.status === "atrasada";
              return (
                <div
                  key={t.id}
                  className={`flex items-center justify-between gap-3 p-3 rounded-lg border transition-colors ${
                    isCancelada ? "border-border bg-muted/30 opacity-70" :
                    isAtrasada ? "border-red-200 bg-red-50/50" :
                    isConcluida ? "border-green-200 bg-green-50/50" :
                    "border-border"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`h-8 w-8 rounded-md flex items-center justify-center shrink-0 ${
                      isCancelada ? "bg-muted text-muted-foreground" :
                      isConcluida ? "bg-green-100 text-green-600" :
                      isAtrasada ? "bg-red-100 text-red-600" :
                      "bg-accent/10 text-accent"
                    }`}>
                      <TipoIcon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm font-medium truncate ${isCancelada || isConcluida ? "line-through text-muted-foreground" : ""}`}>
                        {t.titulo}
                      </p>
                      <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                        {t.tipo && (
                          <Badge variant="secondary" className="text-[10px]">{automacaoTipoLabels[t.tipo]}</Badge>
                        )}
                        {t.automacaoNome && (
                          <Badge variant="outline" className="text-[10px] gap-1 border-amber-200 bg-amber-50 text-amber-700">
                            <Zap className="h-2.5 w-2.5" /> {t.automacaoNome}
                          </Badge>
                        )}
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {t.vencimento}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={t.prioridade === "alta" ? "destructive" : "secondary"} className="text-[10px] capitalize">{t.prioridade}</Badge>
                    {!isConcluida && !isCancelada && (
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => concluirTarefa(t.id)}>
                        Concluir
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
            {tarefas.length === 0 && (
              <div className="text-center py-12 text-muted-foreground text-sm">Nenhuma tarefa vinculada</div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
