import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { VendedorLayout } from "@/components/vendedor/VendedorLayout";
import { Breadcrumbs } from "@/components/vendedor/Breadcrumbs";
import { TagBadge } from "@/components/vendedor/TagBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Building, MapPin, User, Calendar, Phone, Mail, MessageCircle, Target,
  FileText, CheckSquare, Clock, Plus, ArrowRight, Send, Edit, Paperclip,
  Pin, Trash2, ThumbsUp, ExternalLink, Star, Thermometer, ShoppingBag,
  TrendingUp, AlertTriangle, Eye, MoreVertical, Copy,
} from "lucide-react";
import {
  mockClientes360, mockConversas, mockMensagens, mockPedidos, mockNotas,
  mockHistorico, mockTarefas360, mockCompromissos, statusLabels, statusColors, nichoLabels,
  temperaturaColors, tipoTarefaLabels, tipoCompromissoLabels, type Cliente360,
} from "@/data/mockCRM360";
import { mockOportunidades, etapaMap, etapaCorMap } from "@/data/mockCRM";
import { mockOrcamentos } from "@/data/mockVendedor";

export default function Cliente360Page() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState("resumo");
  const [msgInput, setMsgInput] = useState("");
  const [notaInput, setNotaInput] = useState("");

  const cliente = mockClientes360.find(c => c.id === id) || mockClientes360[0];
  const conversa = mockConversas.find(c => c.clienteId === cliente.id);
  const mensagens = conversa ? mockMensagens[conversa.id] || [] : [];
  const oportunidades = mockOportunidades.filter(o => o.clienteNome === cliente.nomeFantasia);
  const pedidos = mockPedidos.filter(p => p.clienteId === cliente.id);
  const notas = mockNotas.filter(n => n.clienteId === cliente.id);
  const tarefas = mockTarefas360.filter(t => t.clienteId === cliente.id);
  const historico = mockHistorico.filter(h => h.clienteId === cliente.id);
  const orcamentos = mockOrcamentos.filter(o => o.lojista === cliente.nomeFantasia);
  const compromissos = mockCompromissos.filter(c => c.clienteId === cliente.id);

  const tempIcon = (t: string) => t === "quente" ? "🔥" : t === "morna" ? "🌤" : "❄️";
  const tempLabel = (t: string) => t === "quente" ? "Quente" : t === "morna" ? "Morna" : "Fria";
  const tempBarColor = (t: string) => t === "quente" ? "bg-red-500" : t === "morna" ? "bg-yellow-500" : "bg-blue-400";
  const tempBarWidth = (t: string) => t === "quente" ? "w-full" : t === "morna" ? "w-2/3" : "w-1/3";

  const historicoIcons: Record<string, any> = {
    cadastro: Star, mensagem_recebida: MessageCircle, mensagem_enviada: Send, oportunidade_criada: Target,
    oportunidade_movida: ArrowRight, orcamento_gerado: FileText, tarefa_criada: CheckSquare,
    tarefa_concluida: ThumbsUp, reuniao_agendada: Calendar, nota_adicionada: Pin,
    pedido_registrado: FileText, atualizacao_cadastral: Edit,
  };
  const historicoColors: Record<string, string> = {
    cadastro: "bg-blue-100 text-blue-600", mensagem_recebida: "bg-green-100 text-green-600",
    mensagem_enviada: "bg-emerald-100 text-emerald-600", oportunidade_criada: "bg-purple-100 text-purple-600",
    oportunidade_movida: "bg-slate-100 text-slate-600", orcamento_gerado: "bg-indigo-100 text-indigo-600",
    tarefa_criada: "bg-orange-100 text-orange-600", tarefa_concluida: "bg-green-100 text-green-600",
    reuniao_agendada: "bg-blue-100 text-blue-600", nota_adicionada: "bg-yellow-100 text-yellow-600",
    pedido_registrado: "bg-indigo-100 text-indigo-600", atualizacao_cadastral: "bg-slate-100 text-slate-600",
  };
  const pedidoStatusColors: Record<string, string> = {
    confirmado: "bg-blue-100 text-blue-700", em_producao: "bg-yellow-100 text-yellow-700",
    enviado: "bg-purple-100 text-purple-700", entregue: "bg-green-100 text-green-700",
    cancelado: "bg-red-100 text-red-700",
  };
  const tipoIcons: Record<string, any> = {
    ligacao: Phone, reuniao: Calendar, visita: MapPin, follow_up: ArrowRight,
    retorno_orcamento: Clock, apresentacao: FileText,
  };

  const totalPedidosValor = pedidos.reduce((s, p) => s + p.valor, 0);
  const tarefasPendentes = tarefas.filter(t => t.status !== "concluida" && t.status !== "cancelada");
  const tarefasAtrasadas = tarefas.filter(t => t.status === "atrasada");
  const proximoCompromisso = compromissos.filter(c => c.status === "agendado")[0];

  return (
    <VendedorLayout>
      <div className="p-6 max-w-[1200px] mx-auto space-y-5">
        <Breadcrumbs items={[
          { label: "Clientes", path: "/vendedor/clientes" },
          { label: cliente.nomeFantasia },
        ]} />

        {/* Header Card */}
        <Card className="border border-border">
          <CardContent className="p-5">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 rounded-xl bg-accent/10 flex items-center justify-center">
                    <Building className="h-7 w-7 text-accent" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-xl font-heading font-bold text-foreground">{cliente.nomeFantasia}</h1>
                      <span className="text-lg">{tempIcon(cliente.temperaturaComercial)}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusColors[cliente.status]}`}>{statusLabels[cliente.status]}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{cliente.razaoSocial} · {cliente.documento}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {cliente.cidade}/{cliente.estado}</span>
                  <span className="flex items-center gap-1"><User className="h-3 w-3" /> {cliente.representante}</span>
                  <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {cliente.whatsapp}</span>
                  <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {cliente.email}</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="text-[10px]">{nichoLabels[cliente.nicho]}</Badge>
                  <Badge variant="outline" className="text-[10px]">{cliente.interessePrincipal}</Badge>
                  {cliente.tags.map(t => <TagBadge key={t} tag={t} />)}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                <Button size="sm" variant="outline" onClick={() => setTab("whatsapp")}><MessageCircle className="h-4 w-4 mr-1" /> Mensagem</Button>
                <Button size="sm" variant="outline"><Target className="h-4 w-4 mr-1" /> Oportunidade</Button>
                <Button size="sm" variant="outline"><CheckSquare className="h-4 w-4 mr-1" /> Tarefa</Button>
                <Button size="sm" variant="outline"><Calendar className="h-4 w-4 mr-1" /> Agendar</Button>
                <Button size="sm"><FileText className="h-4 w-4 mr-1" /> Orçamento</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab} className="space-y-4">
          <TabsList className="bg-muted/50 flex-wrap h-auto">
            <TabsTrigger value="resumo">Resumo</TabsTrigger>
            <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
            <TabsTrigger value="oportunidades">Oportunidades</TabsTrigger>
            <TabsTrigger value="orcamentos">Orçamentos</TabsTrigger>
            <TabsTrigger value="pedidos">Pedidos</TabsTrigger>
            <TabsTrigger value="tarefas">Tarefas</TabsTrigger>
            <TabsTrigger value="historico">Histórico</TabsTrigger>
            <TabsTrigger value="anotacoes">Anotações</TabsTrigger>
          </TabsList>

          {/* RESUMO - Enhanced */}
          <TabsContent value="resumo" className="space-y-4">
            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { label: "Oportunidades", value: cliente.oportunidadesAbertas, icon: Target, color: "text-purple-600", bg: "bg-purple-50" },
                { label: "Orçamentos", value: cliente.orcamentosAtivos, icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
                { label: "Pedidos", value: cliente.pedidosRealizados, icon: ShoppingBag, color: "text-green-600", bg: "bg-green-50" },
                { label: "Tarefas pendentes", value: tarefasPendentes.length, icon: CheckSquare, color: "text-orange-600", bg: "bg-orange-50" },
                { label: "Faturamento", value: `R$ ${(totalPedidosValor / 1000).toFixed(0)}k`, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
                { label: "Atrasadas", value: tarefasAtrasadas.length, icon: AlertTriangle, color: tarefasAtrasadas.length > 0 ? "text-red-600" : "text-muted-foreground", bg: tarefasAtrasadas.length > 0 ? "bg-red-50" : "bg-muted/50" },
              ].map(k => (
                <Card key={k.label} className="border border-border">
                  <CardContent className="p-3">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center mb-2 ${k.bg}`}>
                      <k.icon className={`h-4 w-4 ${k.color}`} />
                    </div>
                    <p className={`text-xl font-bold font-heading ${k.color}`}>{k.value}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{k.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Left col - info + temperature */}
              <div className="space-y-4">
                <Card className="border border-border">
                  <CardHeader className="pb-2"><CardTitle className="text-sm font-heading">Temperatura comercial</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{tempIcon(cliente.temperaturaComercial)}</span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{tempLabel(cliente.temperaturaComercial)}</p>
                        <div className="h-2 rounded-full bg-muted mt-1 overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${tempBarColor(cliente.temperaturaComercial)} ${tempBarWidth(cliente.temperaturaComercial)}`} />
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t border-border">
                      <div className="flex justify-between"><span>Origem</span><span className="font-medium text-foreground">{cliente.origem}</span></div>
                      <div className="flex justify-between"><span>Cadastro</span><span className="font-medium text-foreground">{cliente.dataCadastro}</span></div>
                      <div className="flex justify-between"><span>Último contato</span><span className="font-medium text-foreground">{cliente.ultimoContato}</span></div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-border">
                  <CardHeader className="pb-2"><CardTitle className="text-sm font-heading">Marcas de interesse</CardTitle></CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1.5">
                      {cliente.marcasInteresse.map(m => (
                        <Badge key={m} variant="outline" className="text-xs">{m}</Badge>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-border">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Próxima ação</span>
                        <span className="font-medium text-accent">{cliente.proximaAcao}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Center col - upcoming */}
              <div className="space-y-4">
                {/* Próximo compromisso */}
                <Card className="border border-border">
                  <CardHeader className="pb-2"><CardTitle className="text-sm font-heading flex items-center gap-2"><Calendar className="h-4 w-4 text-blue-500" /> Próximos compromissos</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    {compromissos.length > 0 ? compromissos.slice(0, 3).map(c => {
                      const Icon = tipoIcons[c.tipo] || Calendar;
                      return (
                        <div key={c.id} className="flex items-center gap-3 p-2 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
                          <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                            <Icon className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{c.titulo}</p>
                            <p className="text-[10px] text-muted-foreground">{c.data} · {c.hora} · {c.duracao}</p>
                          </div>
                        </div>
                      );
                    }) : (
                      <p className="text-xs text-muted-foreground text-center py-4">Nenhum compromisso agendado</p>
                    )}
                  </CardContent>
                </Card>

                {/* Tarefas pendentes */}
                <Card className="border border-border">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-heading flex items-center gap-2"><CheckSquare className="h-4 w-4 text-orange-500" /> Tarefas pendentes</CardTitle>
                      {tarefasAtrasadas.length > 0 && <Badge variant="destructive" className="text-[9px] px-1.5">{tarefasAtrasadas.length} atrasadas</Badge>}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-1.5">
                    {tarefasPendentes.length > 0 ? tarefasPendentes.slice(0, 3).map(t => (
                      <div key={t.id} className={`flex items-center gap-2 p-2 rounded-lg border text-xs ${t.status === "atrasada" ? "border-red-200 bg-red-50/50" : "border-border/50"}`}>
                        <CheckSquare className={`h-3.5 w-3.5 shrink-0 ${t.status === "atrasada" ? "text-red-500" : "text-muted-foreground"}`} />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{t.titulo}</p>
                          <p className="text-muted-foreground text-[10px]">{t.vencimento}</p>
                        </div>
                        <Badge variant={t.prioridade === "alta" ? "destructive" : "secondary"} className="text-[9px] shrink-0">{t.prioridade}</Badge>
                      </div>
                    )) : (
                      <p className="text-xs text-muted-foreground text-center py-4">Nenhuma tarefa pendente</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right col - timeline */}
              <Card className="border border-border">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-heading">Últimas movimentações</CardTitle>
                    <Button variant="ghost" size="sm" className="text-[10px] h-6" onClick={() => setTab("historico")}>Ver tudo</Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-0">
                  {historico.slice(0, 8).map((h, i) => {
                    const Icon = historicoIcons[h.tipo] || Star;
                    return (
                      <div key={h.id} className="flex gap-2.5 items-start">
                        <div className="flex flex-col items-center">
                          <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 ${historicoColors[h.tipo]}`}>
                            <Icon className="h-3 w-3" />
                          </div>
                          {i < Math.min(historico.length, 8) - 1 && <div className="w-px flex-1 bg-border mt-0.5 min-h-[12px]" />}
                        </div>
                        <div className="pb-3 min-w-0">
                          <p className="text-xs font-medium truncate">{h.descricao}</p>
                          <p className="text-[10px] text-muted-foreground">{h.data}</p>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* WHATSAPP */}
          <TabsContent value="whatsapp">
            <div className="border border-border rounded-lg overflow-hidden h-[520px] flex">
              <div className="flex-1 flex flex-col">
                <div className="h-14 border-b border-border flex items-center px-4 gap-3 bg-card">
                  <div className="h-9 w-9 rounded-full bg-green-100 flex items-center justify-center">
                    <MessageCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{cliente.nomeFantasia}</p>
                    <p className="text-[10px] text-muted-foreground">{conversa?.online ? "Online" : "Offline"} · {cliente.whatsapp}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="sm" className="text-xs"><CheckSquare className="h-3 w-3 mr-1" /> Tarefa</Button>
                    <Button variant="ghost" size="sm" className="text-xs"><Target className="h-3 w-3 mr-1" /> Oportunidade</Button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[hsl(var(--background))]">
                  {mensagens.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-sm text-muted-foreground">Nenhuma conversa com este cliente</div>
                  ) : (
                    <>
                      <div className="flex justify-center"><span className="text-[10px] text-muted-foreground bg-muted px-3 py-1 rounded-full">{mensagens[0]?.data}</span></div>
                      {mensagens.map(m => (
                        <div key={m.id} className={`flex ${m.remetente === "vendedor" ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[70%] px-3 py-2 rounded-xl text-sm ${
                            m.remetente === "vendedor" ? "bg-accent text-accent-foreground rounded-br-sm" : "bg-card border border-border rounded-bl-sm"
                          }`}>
                            <p>{m.texto}</p>
                            <p className={`text-[10px] mt-1 text-right ${m.remetente === "vendedor" ? "text-accent-foreground/70" : "text-muted-foreground"}`}>{m.horario}</p>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
                <div className="h-14 border-t border-border flex items-center gap-2 px-3 bg-card">
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0"><Paperclip className="h-4 w-4" /></Button>
                  <Input placeholder="Digite uma mensagem..." value={msgInput} onChange={e => setMsgInput(e.target.value)} className="h-9 flex-1" />
                  <Button size="icon" className="h-8 w-8 shrink-0"><Send className="h-4 w-4" /></Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* OPORTUNIDADES */}
          <TabsContent value="oportunidades" className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{oportunidades.length} oportunidades</p>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Nova oportunidade</Button>
            </div>
            {oportunidades.length > 0 ? (
              <div className="space-y-2">
                {oportunidades.map(op => (
                  <div key={op.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => navigate(`/vendedor/oportunidades/${op.id}`)}>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{op.nome}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: etapaCorMap[op.etapa] }} />
                          <span className="text-xs text-muted-foreground">{etapaMap[op.etapa]}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground">{op.probabilidade}% prob.</span>
                        <span className="text-xs text-muted-foreground">·</span>
                        {op.tags.slice(0, 2).map(t => <TagBadge key={t} tag={t} />)}
                      </div>
                    </div>
                    <div className="text-right ml-3 shrink-0">
                      <p className="text-sm font-semibold">R$ {op.valorEstimado.toLocaleString("pt-BR")}</p>
                      <p className="text-[10px] text-muted-foreground">{op.ultimaInteracao}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                <Target className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
                <p className="text-sm">Nenhuma oportunidade encontrada</p>
                <Button size="sm" variant="outline" className="mt-3"><Plus className="h-4 w-4 mr-1" /> Criar oportunidade</Button>
              </div>
            )}
          </TabsContent>

          {/* ORÇAMENTOS */}
          <TabsContent value="orcamentos" className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{orcamentos.length} orçamentos</p>
              <Button size="sm"><FileText className="h-4 w-4 mr-1" /> Gerar orçamento</Button>
            </div>
            {orcamentos.length > 0 ? (
              <div className="space-y-2">
                {orcamentos.map(orc => (
                  <div key={orc.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{orc.nome}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>{orc.dataCriacao}</span>
                        {orc.marcas.length > 0 && <span>{orc.marcas.join(", ")}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {orc.valorTotal && <span className="text-sm font-semibold">R$ {orc.valorTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>}
                      <Badge variant="secondary" className="capitalize text-xs">{orc.status.replace("_", " ")}</Badge>
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" onClick={() => navigate(`/vendedor/orcamento/${orc.id}`)}>
                          <Eye className="h-3.5 w-3.5 mr-1" /> Abrir
                        </Button>
                        <Button variant="ghost" size="sm"><Copy className="h-3.5 w-3.5" /></Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                <FileText className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
                <p className="text-sm">Nenhum orçamento vinculado</p>
                <Button size="sm" variant="outline" className="mt-3"><Plus className="h-4 w-4 mr-1" /> Gerar orçamento</Button>
              </div>
            )}
          </TabsContent>

          {/* PEDIDOS */}
          <TabsContent value="pedidos" className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{pedidos.length} pedidos · Faturamento total: <span className="font-semibold text-foreground">R$ {totalPedidosValor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span></p>
            </div>
            {pedidos.length > 0 ? (
              <div className="space-y-2">
                {pedidos.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{p.numero}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>{p.data}</span>
                        <span>{p.origem}</span>
                        {p.observacoes && <span className="italic">{p.observacoes}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm font-semibold">R$ {p.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border capitalize ${pedidoStatusColors[p.status]}`}>{p.status.replace("_", " ")}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                <ShoppingBag className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
                <p className="text-sm">Nenhum pedido registrado</p>
              </div>
            )}
          </TabsContent>

          {/* TAREFAS */}
          <TabsContent value="tarefas" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <p className="text-sm text-muted-foreground">{tarefas.length} tarefas</p>
                {tarefasAtrasadas.length > 0 && <Badge variant="destructive" className="text-[10px]">{tarefasAtrasadas.length} atrasadas</Badge>}
              </div>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Nova tarefa</Button>
            </div>
            <div className="space-y-2">
              {tarefas.map(t => (
                <div key={t.id} className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${t.status === "atrasada" ? "border-red-200 bg-red-50/50" : t.status === "concluida" ? "border-green-200 bg-green-50/50" : "border-border hover:bg-muted/30"}`}>
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <CheckSquare className={`h-4 w-4 shrink-0 ${t.status === "concluida" ? "text-green-500" : t.status === "atrasada" ? "text-red-500" : "text-muted-foreground"}`} />
                    <div className="min-w-0">
                      <p className={`text-sm font-medium truncate ${t.status === "concluida" ? "line-through text-muted-foreground" : ""}`}>{t.titulo}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{tipoTarefaLabels[t.tipo]}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {t.vencimento}{t.hora ? ` às ${t.hora}` : ""}</span>
                        {t.oportunidadeNome && <><span>·</span><span className="text-accent truncate">→ {t.oportunidadeNome}</span></>}
                      </div>
                    </div>
                  </div>
                  <Badge variant={t.prioridade === "alta" ? "destructive" : "secondary"} className="text-[10px] shrink-0 ml-2">{t.prioridade}</Badge>
                </div>
              ))}
              {tarefas.length === 0 && (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  <CheckSquare className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
                  <p>Nenhuma tarefa vinculada</p>
                  <Button size="sm" variant="outline" className="mt-3"><Plus className="h-4 w-4 mr-1" /> Criar tarefa</Button>
                </div>
              )}
            </div>
          </TabsContent>

          {/* HISTÓRICO */}
          <TabsContent value="historico" className="space-y-0">
            <div className="border border-border rounded-lg p-4">
              {historico.map((h, i) => {
                const Icon = historicoIcons[h.tipo] || Star;
                return (
                  <div key={h.id} className="flex gap-3 items-start">
                    <div className="flex flex-col items-center">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${historicoColors[h.tipo]}`}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      {i < historico.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                    </div>
                    <div className="pb-5 min-w-0 flex-1">
                      <p className="text-sm font-medium">{h.descricao}</p>
                      {h.detalhes && <p className="text-xs text-muted-foreground mt-0.5 italic bg-muted/50 px-2 py-1 rounded mt-1">{h.detalhes}</p>}
                      <p className="text-[11px] text-muted-foreground mt-1">{h.data}{h.autor ? ` · ${h.autor}` : ""}</p>
                    </div>
                  </div>
                );
              })}
              {historico.length === 0 && <div className="text-center py-12 text-muted-foreground text-sm">Nenhum evento registrado</div>}
            </div>
          </TabsContent>

          {/* ANOTAÇÕES */}
          <TabsContent value="anotacoes" className="space-y-4">
            <div className="flex gap-2">
              <Textarea placeholder="Adicionar uma nota sobre este cliente..." value={notaInput} onChange={e => setNotaInput(e.target.value)} className="min-h-[60px]" />
              <Button size="sm" className="shrink-0 self-end"><Plus className="h-4 w-4 mr-1" /> Adicionar</Button>
            </div>
            <div className="space-y-2">
              {notas.sort((a, b) => (b.fixada ? 1 : 0) - (a.fixada ? 1 : 0)).map(n => (
                <div key={n.id} className={`p-3 rounded-lg border transition-colors ${n.fixada ? "border-yellow-200 bg-yellow-50/50" : "border-border hover:bg-muted/30"}`}>
                  <div className="flex items-start justify-between">
                    <p className="text-sm">{n.texto}</p>
                    <div className="flex items-center gap-1 ml-2 shrink-0">
                      {n.fixada && <Pin className="h-3 w-3 text-yellow-600" />}
                      <Button variant="ghost" size="icon" className="h-6 w-6"><MoreVertical className="h-3 w-3" /></Button>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2">{n.data} · {n.autor}</p>
                </div>
              ))}
              {notas.length === 0 && <div className="text-center py-12 text-muted-foreground text-sm">Nenhuma anotação</div>}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </VendedorLayout>
  );
}
