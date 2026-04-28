import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Breadcrumbs } from "@/components/vendedor/Breadcrumbs";
import { TagBadge } from "@/components/vendedor/TagBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowRight, Edit, FileText, Phone, MessageSquare, CheckSquare, Clock,
  Calendar, Plus, Send, ThumbsUp, ThumbsDown, User, Building, Target, TrendingUp,
  Mail, Video, StickyNote, Zap, MessageCircle, MapPin, Sparkles,
} from "lucide-react";
import {
  mockOportunidades, mockAtividades, etapaMap, etapaCorMap,
  type Oportunidade, type AtividadeCRM,
} from "@/data/mockCRM";
import { mockOrcamentos } from "@/data/mockVendedor";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAutomacoes } from "@/contexts/AutomacoesContext";
import { automacaoTipoLabels, type AutomacaoTipoTarefa } from "@/data/mockAutomacoes";

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

export default function OportunidadeDetalhe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState("resumo");
  const [novaAtividade, setNovaAtividade] = useState("");

  const { tarefas: tarefasAll, aplicadas, concluirTarefa, editarTarefa } = useAutomacoes();

  const op = mockOportunidades.find(o => o.id === id) || mockOportunidades[0];
  const atividades = mockAtividades.filter(a => a.oportunidadeId === op.id);
  const tarefas = tarefasAll.filter(t => t.oportunidadeId === op.id);
  const automacoesAplicadas = aplicadas.filter(a => a.oportunidadeId === op.id);
  const orcamentos = mockOrcamentos.filter(o => op.orcamentoIds.includes(o.id));

  const prioridadeDot: Record<string, string> = { alta: "bg-red-500", media: "bg-yellow-500", baixa: "bg-green-500" };
  const etapaColor = etapaCorMap[op.etapa];

  const etapaOrder = ["novo_lead", "contato_iniciado", "em_qualificacao", "proposta_construcao", "orcamento_enviado", "em_negociacao", "ganho", "perdido"] as const;
  const currentIdx = etapaOrder.indexOf(op.etapa);

  return (
    <>
      <div className="p-6 max-w-[1200px] mx-auto space-y-6">
        <Breadcrumbs items={[
          { label: "Oportunidades", path: "/vendedor/oportunidades" },
          { label: op.nome },
        ]} />

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-heading font-bold text-foreground">{op.nome}</h1>
              <Badge className="text-xs px-2 py-0.5" style={{ backgroundColor: `${etapaColor}20`, color: etapaColor, borderColor: `${etapaColor}40` }}>
                {etapaMap[op.etapa]}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Building className="h-3.5 w-3.5" /> {op.clienteNome}</span>
              <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> {op.representante}</span>
              <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Criada em {op.dataCriacao}</span>
            </div>
            <div className="flex gap-1.5">{op.tags.map(tag => <TagBadge key={tag} tag={tag} size="md" />)}</div>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            <Select defaultValue={op.etapa}>
              <SelectTrigger className="h-9 w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {etapaOrder.map(e => <SelectItem key={e} value={e}>{etapaMap[e]}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm"><Edit className="h-4 w-4 mr-1" /> Editar</Button>
            <Button size="sm" onClick={() => navigate(`/vendedor/novo-orcamento?oportunidade=${op.id}&cliente=${op.clienteNome}`)}>
              <FileText className="h-4 w-4 mr-1" /> Gerar orçamento
            </Button>
            {op.etapa !== "ganho" && op.etapa !== "perdido" && (
              <>
                <Button variant="outline" size="sm" className="text-green-600 border-green-200 hover:bg-green-50">
                  <ThumbsUp className="h-4 w-4 mr-1" /> Ganho
                </Button>
                <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                  <ThumbsDown className="h-4 w-4 mr-1" /> Perdido
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-1">
          {etapaOrder.filter(e => e !== "perdido").map((e, i) => {
            const isActive = i <= currentIdx && op.etapa !== "perdido";
            const color = isActive ? etapaColor : "#e2e8f0";
            return (
              <div key={e} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full h-2 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-[9px] text-muted-foreground">{etapaMap[e]}</span>
              </div>
            );
          })}
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border border-border">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Valor estimado</p>
              <p className="text-lg font-bold font-heading">R$ {op.valorEstimado.toLocaleString("pt-BR")}</p>
            </CardContent>
          </Card>
          <Card className="border border-border">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Probabilidade</p>
              <p className="text-lg font-bold font-heading">{op.probabilidade}%</p>
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
        </div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab} className="space-y-4">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="resumo">Resumo</TabsTrigger>
            <TabsTrigger value="atividades">Atividades</TabsTrigger>
            <TabsTrigger value="orcamento">Orçamento</TabsTrigger>
            <TabsTrigger value="historico">Histórico</TabsTrigger>
            <TabsTrigger value="tarefas">Tarefas</TabsTrigger>
          </TabsList>

          {/* Resumo */}
          <TabsContent value="resumo" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="border border-border">
                <CardHeader className="pb-2"><CardTitle className="text-sm font-heading">Dados da oportunidade</CardTitle></CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Origem</span><span className="font-medium">{op.origem}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Responsável</span><span className="font-medium">{op.representante}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Última interação</span><span className="font-medium">{op.ultimaInteracao}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Orçamentos</span><span className="font-medium">{orcamentos.length}</span></div>
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

          {/* Atividades */}
          <TabsContent value="atividades" className="space-y-4">
            {/* Quick add */}
            <div className="flex gap-2">
              <Textarea placeholder="Registrar nova atividade..." value={novaAtividade} onChange={e => setNovaAtividade(e.target.value)} className="h-10 min-h-[40px]" />
              <Button size="sm" className="shrink-0"><Plus className="h-4 w-4 mr-1" /> Registrar</Button>
            </div>
            <div className="flex gap-2 flex-wrap">
              {[
                { label: "Ligação", icon: Phone },
                { label: "Reunião", icon: Video },
                { label: "E-mail", icon: Mail },
                { label: "Follow-up", icon: Clock },
                { label: "Nota", icon: StickyNote },
              ].map(a => (
                <Button key={a.label} variant="outline" size="sm" className="text-xs">
                  <a.icon className="h-3 w-3 mr-1" /> {a.label}
                </Button>
              ))}
            </div>
            {/* Timeline */}
            <div className="space-y-3">
              {atividades.map(a => {
                const Icon = atividadeIcons[a.tipo] || StickyNote;
                return (
                  <div key={a.id} className="flex gap-3 items-start">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${atividadeColors[a.tipo]}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 border border-border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium">{a.descricao}</p>
                        <span className="text-[11px] text-muted-foreground">{a.data}</span>
                      </div>
                      {a.detalhes && <p className="text-xs text-muted-foreground">{a.detalhes}</p>}
                      <p className="text-[11px] text-muted-foreground mt-1">por {a.autor}</p>
                    </div>
                  </div>
                );
              })}
              {atividades.length === 0 && (
                <div className="text-center py-12 text-muted-foreground text-sm">Nenhuma atividade registrada</div>
              )}
            </div>
          </TabsContent>

          {/* Orçamento */}
          <TabsContent value="orcamento" className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Orçamentos vinculados a esta oportunidade</p>
              <Button size="sm" onClick={() => navigate(`/vendedor/novo-orcamento?oportunidade=${op.id}&cliente=${op.clienteNome}`)}>
                <FileText className="h-4 w-4 mr-1" /> Gerar orçamento
              </Button>
            </div>
            {orcamentos.length > 0 ? (
              <div className="space-y-2">
                {orcamentos.map(orc => (
                  <div key={orc.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                    <div>
                      <p className="text-sm font-medium">{orc.nome}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>{orc.dataCriacao}</span>
                        {orc.marcas.length > 0 && <span>{orc.marcas.join(", ")}</span>}
                        {orc.lojista && <span className="flex items-center gap-1"><Building className="h-3 w-3" /> {orc.lojista}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {orc.valorTotal && (
                        <span className="text-sm font-semibold">R$ {orc.valorTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                      )}
                      <Badge variant="secondary" className="capitalize text-xs">{orc.status.replace("_", " ")}</Badge>
                      <Button variant="outline" size="sm" onClick={() => navigate(`/vendedor/orcamento/${orc.id}`)}>
                        Abrir
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                <FileText className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
                <p className="text-sm">Nenhum orçamento vinculado</p>
                <p className="text-xs mt-1">Clique em "Gerar orçamento" para criar o primeiro</p>
              </div>
            )}
          </TabsContent>

          {/* Histórico */}
          <TabsContent value="historico" className="space-y-3">
            {atividades.map(a => {
              const Icon = atividadeIcons[a.tipo] || StickyNote;
              return (
                <div key={a.id} className="flex gap-3 items-start">
                  <div className="flex flex-col items-center">
                    <div className={`h-7 w-7 rounded-full flex items-center justify-center ${atividadeColors[a.tipo]}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="w-px flex-1 bg-border mt-1" />
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-medium">{a.descricao}</p>
                    {a.detalhes && <p className="text-xs text-muted-foreground mt-0.5">{a.detalhes}</p>}
                    <p className="text-[11px] text-muted-foreground mt-1">{a.data} · {a.autor}</p>
                  </div>
                </div>
              );
            })}
          </TabsContent>

          {/* Tarefas */}
          <TabsContent value="tarefas" className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{tarefas.length} tarefas vinculadas</p>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Nova tarefa</Button>
            </div>
            <div className="space-y-2">
              {tarefas.map(t => (
                <div
                  key={t.id}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                    t.status === "atrasada" ? "border-red-200 bg-red-50/50" : t.status === "concluida" ? "border-green-200 bg-green-50/50" : "border-border"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CheckSquare className={`h-4 w-4 ${t.status === "concluida" ? "text-green-500" : t.status === "atrasada" ? "text-red-500" : "text-muted-foreground"}`} />
                    <div>
                      <p className="text-sm font-medium">{t.titulo}</p>
                      <p className="text-xs text-muted-foreground">{t.descricao}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{t.vencimento}</span>
                    <Badge variant={t.prioridade === "alta" ? "destructive" : "secondary"} className="text-[10px]">{t.prioridade}</Badge>
                  </div>
                </div>
              ))}
              {tarefas.length === 0 && (
                <div className="text-center py-12 text-muted-foreground text-sm">Nenhuma tarefa vinculada</div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
