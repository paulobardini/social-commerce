import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search, Plus, CheckSquare, Clock, AlertTriangle, X,
  List, Kanban, User, Target, RefreshCw,
} from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  tipoTarefaLabels, mockClientes360,
} from "@/data/mockCRM360";
import { useTarefas, type Recorrencia } from "@/contexts/TarefasContext";

const recorrenciaLabels: Record<Recorrencia, string> = {
  nenhuma: "Não repetir",
  diaria: "Diariamente",
  semanal: "Semanalmente",
  mensal: "Mensalmente",
  personalizada: "Personalizado",
};

export default function TarefasPage() {
  const navigate = useNavigate();
  const { tarefas, addTarefa, toggleConcluida } = useTarefas();
  const [view, setView] = useState<"list" | "board">("list");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterPrioridade, setFilterPrioridade] = useState<string>("");
  const [filterTipo, setFilterTipo] = useState<string>("");
  const [showNova, setShowNova] = useState(false);

  // Form state
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tipo, setTipo] = useState<string>("follow_up");
  const [prioridade, setPrioridade] = useState<"alta" | "media" | "baixa">("media");
  const [clienteId, setClienteId] = useState<string>("");
  const [vencimento, setVencimento] = useState<string>("");
  const [hora, setHora] = useState<string>("");
  const [observacao, setObservacao] = useState<string>("");
  const [recorrencia, setRecorrencia] = useState<Recorrencia>("nenhuma");
  const [intervaloCustom, setIntervaloCustom] = useState<number>(7);

  const filtered = useMemo(() => {
    return tarefas.filter(t => {
      if (search && !t.titulo.toLowerCase().includes(search.toLowerCase()) && !(t.clienteNome || "").toLowerCase().includes(search.toLowerCase())) return false;
      if (filterStatus && t.status !== filterStatus) return false;
      if (filterPrioridade && t.prioridade !== filterPrioridade) return false;
      if (filterTipo && t.tipo !== filterTipo) return false;
      return true;
    });
  }, [tarefas, search, filterStatus, filterPrioridade, filterTipo]);

  const counts = {
    total: tarefas.length,
    pendentes: tarefas.filter(t => t.status === "pendente").length,
    atrasadas: tarefas.filter(t => t.status === "atrasada").length,
    concluidas: tarefas.filter(t => t.status === "concluida").length,
  };

  const prioridadeDot: Record<string, string> = { alta: "bg-red-500", media: "bg-yellow-500", baixa: "bg-green-500" };
  const statusLabel: Record<string, string> = { pendente: "Pendente", atrasada: "Atrasada", concluida: "Concluída", cancelada: "Cancelada" };
  const statusColor: Record<string, string> = {
    pendente: "bg-blue-100 text-blue-700", atrasada: "bg-red-100 text-red-700",
    concluida: "bg-green-100 text-green-700", cancelada: "bg-slate-100 text-slate-500",
  };
  const statusIconColors: Record<string, string> = {
    pendente: "text-blue-500", atrasada: "text-red-500", concluida: "text-green-500",
  };
  const boardStatuses = ["pendente", "atrasada", "concluida"] as const;
  const activeFilters = [filterStatus, filterPrioridade, filterTipo].filter(Boolean).length;

  const formatVencimento = (iso: string) => {
    if (!iso) return "";
    if (iso.includes("/")) return iso;
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
  };

  const resetForm = () => {
    setTitulo(""); setDescricao(""); setTipo("follow_up"); setPrioridade("media");
    setClienteId(""); setVencimento(""); setHora(""); setObservacao("");
    setRecorrencia("nenhuma"); setIntervaloCustom(7);
  };

  const handleCreate = () => {
    if (!titulo.trim() || !vencimento) return;
    const cliente = mockClientes360.find(c => c.id === clienteId);
    addTarefa({
      titulo,
      descricao,
      tipo: tipo as any,
      clienteId: clienteId || undefined,
      clienteNome: cliente?.nomeFantasia,
      prioridade,
      vencimento: formatVencimento(vencimento),
      hora: hora || undefined,
      responsavel: "Paulo Bardini",
      status: "pendente",
      observacao: observacao || undefined,
      recorrencia,
      recorrenciaIntervaloDias: recorrencia === "personalizada" ? intervaloCustom : undefined,
    });
    setShowNova(false);
    resetForm();
  };

  return (
    <>
      <div className="p-4 md:p-6 space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-heading font-bold text-foreground flex items-center gap-2">
              <CheckSquare className="h-5 w-5" /> Tarefas
            </h1>
            <p className="text-sm text-muted-foreground">
              {counts.pendentes} pendentes · {counts.atrasadas} atrasadas · {counts.concluidas} concluídas
            </p>
          </div>
          <Button size="sm" onClick={() => setShowNova(true)}>
            <Plus className="h-4 w-4 mr-1" /> Nova tarefa
          </Button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total", value: counts.total, color: "text-foreground", bg: "bg-muted/50", icon: CheckSquare },
            { label: "Pendentes", value: counts.pendentes, color: "text-blue-600", bg: "bg-blue-50", icon: Clock },
            { label: "Atrasadas", value: counts.atrasadas, color: "text-red-600", bg: "bg-red-50", icon: AlertTriangle },
            { label: "Concluídas", value: counts.concluidas, color: "text-green-600", bg: "bg-green-50", icon: CheckSquare },
          ].map(c => (
            <Card key={c.label} className="border border-border">
              <CardContent className="p-3 flex items-center gap-3">
                <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${c.bg}`}>
                  <c.icon className={`h-4 w-4 ${c.color}`} />
                </div>
                <div>
                  <p className={`text-xl font-bold font-heading ${c.color}`}>{c.value}</p>
                  <p className="text-[10px] text-muted-foreground">{c.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar tarefa ou cliente..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
          </div>
          <Select value={filterStatus} onValueChange={v => setFilterStatus(v === "all" ? "" : v)}>
            <SelectTrigger className="h-9 w-[130px] text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="atrasada">Atrasada</SelectItem>
              <SelectItem value="concluida">Concluída</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterPrioridade} onValueChange={v => setFilterPrioridade(v === "all" ? "" : v)}>
            <SelectTrigger className="h-9 w-[130px] text-xs"><SelectValue placeholder="Prioridade" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="alta">Alta</SelectItem>
              <SelectItem value="media">Média</SelectItem>
              <SelectItem value="baixa">Baixa</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterTipo} onValueChange={v => setFilterTipo(v === "all" ? "" : v)}>
            <SelectTrigger className="h-9 w-[140px] text-xs"><SelectValue placeholder="Tipo" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {Object.entries(tipoTarefaLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
          {activeFilters > 0 && (
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => { setFilterStatus(""); setFilterPrioridade(""); setFilterTipo(""); }}>
              <X className="h-3 w-3 mr-1" /> Limpar ({activeFilters})
            </Button>
          )}
          <div className="flex items-center border border-border rounded-lg overflow-hidden ml-auto">
            <button onClick={() => setView("list")} className={`flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors ${view === "list" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted"}`}>
              <List className="h-4 w-4" /> Lista
            </button>
            <button onClick={() => setView("board")} className={`flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors ${view === "board" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted"}`}>
              <Kanban className="h-4 w-4" /> Board
            </button>
          </div>
        </div>

        {/* Content */}
        {view === "list" ? (
          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold w-8"></TableHead>
                  <TableHead className="font-semibold">Tarefa</TableHead>
                  <TableHead className="font-semibold">Cliente</TableHead>
                  <TableHead className="font-semibold">Tipo</TableHead>
                  <TableHead className="font-semibold">Prioridade</TableHead>
                  <TableHead className="font-semibold">Vencimento</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(t => (
                  <TableRow key={t.id} className={`hover:bg-muted/30 ${t.status === "atrasada" ? "bg-red-50/30" : ""}`}>
                    <TableCell>
                      <button onClick={() => toggleConcluida(t.id)} aria-label="Concluir tarefa">
                        <CheckSquare className={`h-4 w-4 ${statusIconColors[t.status] || "text-muted-foreground"} hover:scale-110 transition-transform`} />
                      </button>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <p className={`text-sm font-medium ${t.status === "concluida" ? "line-through text-muted-foreground" : ""}`}>{t.titulo}</p>
                        {t.recorrencia && t.recorrencia !== "nenhuma" && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <RefreshCw className="h-3 w-3 text-accent" />
                            </TooltipTrigger>
                            <TooltipContent>Tarefa recorrente: {recorrenciaLabels[t.recorrencia]}</TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                      {t.oportunidadeNome && <p className="text-[10px] text-accent flex items-center gap-1"><Target className="h-3 w-3" /> {t.oportunidadeNome}</p>}
                    </TableCell>
                    <TableCell>
                      {t.clienteNome ? (
                        <button onClick={(e) => { e.stopPropagation(); navigate(`/vendedor/360/${t.clienteId}`); }} className="text-sm text-accent hover:underline">{t.clienteNome}</button>
                      ) : <span className="text-sm text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell><Badge variant="secondary" className="text-[10px]">{tipoTarefaLabels[t.tipo]}</Badge></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${prioridadeDot[t.prioridade]}`} />
                        <span className="text-sm capitalize">{t.prioridade}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" /> {t.vencimento}
                        {t.hora && <span className="text-[10px]">às {t.hora}</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusColor[t.status]}`}>{statusLabel[t.status]}</span>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground">Nenhuma tarefa encontrada</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {boardStatuses.map(status => {
              const tasks = filtered.filter(t => t.status === status);
              return (
                <div key={status} className="w-[320px] min-w-[320px] shrink-0">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-2">
                      {status === "atrasada" && <AlertTriangle className="h-4 w-4 text-red-500" />}
                      {status === "pendente" && <Clock className="h-4 w-4 text-blue-500" />}
                      {status === "concluida" && <CheckSquare className="h-4 w-4 text-green-500" />}
                      <span className="text-sm font-semibold">{statusLabel[status]}</span>
                      <Badge variant="secondary" className="text-[10px] h-5">{tasks.length}</Badge>
                    </div>
                  </div>
                  <div className="space-y-2 bg-muted/30 rounded-xl p-2.5 min-h-[300px]">
                    {tasks.map(t => (
                      <Card key={t.id} className={`border cursor-pointer hover:shadow-md hover:border-accent/30 transition-all ${status === "atrasada" ? "border-red-200" : "border-border"}`}>
                        <CardContent className="p-3">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <div className={`w-2 h-2 rounded-full ${prioridadeDot[t.prioridade]}`} />
                            <span className="text-[10px] text-muted-foreground capitalize">{t.prioridade}</span>
                            {t.recorrencia && t.recorrencia !== "nenhuma" && (
                              <RefreshCw className="h-3 w-3 text-accent" aria-label="Recorrente" />
                            )}
                            <Badge variant="secondary" className="text-[9px] ml-auto">{tipoTarefaLabels[t.tipo]}</Badge>
                          </div>
                          <p className={`text-sm font-medium mb-1 ${status === "concluida" ? "line-through text-muted-foreground" : ""}`}>{t.titulo}</p>
                          {t.clienteNome && (
                            <button onClick={() => navigate(`/vendedor/360/${t.clienteId}`)} className="text-xs text-accent hover:underline flex items-center gap-1 mb-1">
                              <User className="h-3 w-3" /> {t.clienteNome}
                            </button>
                          )}
                          {t.oportunidadeNome && (
                            <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Target className="h-3 w-3" /> {t.oportunidadeNome}</p>
                          )}
                          <div className="flex items-center justify-between gap-1 text-[10px] text-muted-foreground mt-2 pt-2 border-t border-border/50">
                            <div className="flex items-center gap-1"><Clock className="h-3 w-3" /> {t.vencimento}{t.hora ? ` · ${t.hora}` : ""}</div>
                            <button onClick={() => toggleConcluida(t.id)} className="text-accent hover:underline">
                              {t.status === "concluida" ? "Reabrir" : "Concluir"}
                            </button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {tasks.length === 0 && (
                      <div className="flex items-center justify-center h-24 text-xs text-muted-foreground border-2 border-dashed border-border rounded-lg">
                        Nenhuma tarefa
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Nova Tarefa Modal */}
      <Dialog open={showNova} onOpenChange={(o) => { setShowNova(o); if (!o) resetForm(); }}>
        <DialogContent className="max-w-lg max-h-[90vh] flex flex-col">
          <DialogHeader className="shrink-0">
            <DialogTitle className="font-heading">Nova tarefa</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2 overflow-y-auto pr-1">
            <div><Label className="text-xs">Título *</Label><Input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ex: Follow-up com cliente" className="mt-1" /></div>
            <div><Label className="text-xs">Descrição</Label><Textarea value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Detalhes da tarefa" className="mt-1" rows={2} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Tipo</Label>
                <Select value={tipo} onValueChange={setTipo}><SelectTrigger className="mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{Object.entries(tipoTarefaLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">Prioridade</Label>
                <Select value={prioridade} onValueChange={(v: any) => setPrioridade(v)}><SelectTrigger className="mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent><SelectItem value="alta">Alta</SelectItem><SelectItem value="media">Média</SelectItem><SelectItem value="baixa">Baixa</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Cliente</Label>
                <Select value={clienteId} onValueChange={setClienteId}><SelectTrigger className="mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{mockClientes360.map(c => <SelectItem key={c.id} value={c.id}>{c.nomeFantasia}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">Data de vencimento *</Label><Input type="date" value={vencimento} onChange={e => setVencimento(e.target.value)} className="mt-1" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Hora</Label><Input type="time" value={hora} onChange={e => setHora(e.target.value)} className="mt-1" /></div>
              <div><Label className="text-xs">Responsável</Label><Input value="Paulo Bardini" className="mt-1" readOnly /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs flex items-center gap-1"><RefreshCw className="h-3 w-3" /> Repetir</Label>
                <Select value={recorrencia} onValueChange={(v: any) => setRecorrencia(v)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(recorrenciaLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {recorrencia === "personalizada" && (
                <div>
                  <Label className="text-xs">A cada (dias)</Label>
                  <Input type="number" min={1} value={intervaloCustom} onChange={e => setIntervaloCustom(Number(e.target.value) || 1)} className="mt-1" />
                </div>
              )}
            </div>
            <div><Label className="text-xs">Observação</Label><Textarea value={observacao} onChange={e => setObservacao(e.target.value)} placeholder="Notas adicionais" className="mt-1" rows={2} /></div>
            {hora && vencimento && (
              <p className="text-[11px] text-muted-foreground bg-muted/50 px-3 py-2 rounded-md">
                ℹ️ Esta tarefa também aparecerá na <strong>Agenda</strong> como evento do tipo "Tarefa".
              </p>
            )}
          </div>
          <div className="flex justify-end gap-2 mt-4 shrink-0">
            <Button variant="outline" onClick={() => setShowNova(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={!titulo.trim() || !vencimento}>Criar tarefa</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
