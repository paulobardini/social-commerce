import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { VendedorLayout } from "@/components/vendedor/VendedorLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search, Plus, Filter, CheckSquare, Clock, AlertTriangle, X,
  List, Kanban, Phone, MapPin, Calendar, User, ExternalLink,
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
import {
  mockTarefas360, tipoTarefaLabels, mockClientes360, type TarefaCRM360,
} from "@/data/mockCRM360";

export default function TarefasPage() {
  const navigate = useNavigate();
  const [view, setView] = useState<"list" | "board">("list");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterPrioridade, setFilterPrioridade] = useState<string>("");
  const [filterTipo, setFilterTipo] = useState<string>("");
  const [showNova, setShowNova] = useState(false);

  const filtered = useMemo(() => {
    return mockTarefas360.filter(t => {
      if (search && !t.titulo.toLowerCase().includes(search.toLowerCase()) && !(t.clienteNome || "").toLowerCase().includes(search.toLowerCase())) return false;
      if (filterStatus && t.status !== filterStatus) return false;
      if (filterPrioridade && t.prioridade !== filterPrioridade) return false;
      if (filterTipo && t.tipo !== filterTipo) return false;
      return true;
    });
  }, [search, filterStatus, filterPrioridade, filterTipo]);

  const counts = {
    total: mockTarefas360.length,
    pendentes: mockTarefas360.filter(t => t.status === "pendente").length,
    atrasadas: mockTarefas360.filter(t => t.status === "atrasada").length,
    concluidas: mockTarefas360.filter(t => t.status === "concluida").length,
  };

  const prioridadeDot: Record<string, string> = { alta: "bg-red-500", media: "bg-yellow-500", baixa: "bg-green-500" };
  const statusLabel: Record<string, string> = { pendente: "Pendente", atrasada: "Atrasada", concluida: "Concluída", cancelada: "Cancelada" };
  const statusColor: Record<string, string> = {
    pendente: "bg-blue-100 text-blue-700", atrasada: "bg-red-100 text-red-700",
    concluida: "bg-green-100 text-green-700", cancelada: "bg-slate-100 text-slate-500",
  };

  const boardStatuses = ["pendente", "atrasada", "concluida"] as const;

  return (
    <VendedorLayout>
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
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
                  <TableRow key={t.id} className="hover:bg-muted/30">
                    <TableCell>
                      <p className="text-sm font-medium">{t.titulo}</p>
                      {t.oportunidadeNome && <p className="text-[10px] text-muted-foreground">→ {t.oportunidadeNome}</p>}
                    </TableCell>
                    <TableCell>
                      {t.clienteNome ? (
                        <button onClick={() => navigate(`/vendedor/360/${t.clienteId}`)} className="text-sm text-accent hover:underline">{t.clienteNome}</button>
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
                {filtered.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">Nenhuma tarefa encontrada</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {boardStatuses.map(status => {
              const tasks = filtered.filter(t => t.status === status);
              return (
                <div key={status} className="w-[300px] min-w-[300px] shrink-0">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-2">
                      {status === "atrasada" && <AlertTriangle className="h-4 w-4 text-red-500" />}
                      <span className="text-sm font-semibold capitalize">{statusLabel[status]}</span>
                      <Badge variant="secondary" className="text-[10px] h-5">{tasks.length}</Badge>
                    </div>
                  </div>
                  <div className="space-y-2 bg-muted/30 rounded-xl p-2 min-h-[200px]">
                    {tasks.map(t => (
                      <Card key={t.id} className={`border cursor-pointer hover:shadow-md transition-all ${status === "atrasada" ? "border-red-200" : "border-border"}`}>
                        <CardContent className="p-3">
                          <div className="flex items-center gap-1.5 mb-1">
                            <div className={`w-2 h-2 rounded-full ${prioridadeDot[t.prioridade]}`} />
                            <span className="text-[10px] text-muted-foreground capitalize">{t.prioridade}</span>
                            <Badge variant="secondary" className="text-[9px] ml-auto">{tipoTarefaLabels[t.tipo]}</Badge>
                          </div>
                          <p className="text-sm font-medium mb-1">{t.titulo}</p>
                          {t.clienteNome && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1"><User className="h-3 w-3" /> {t.clienteNome}</p>
                          )}
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-2">
                            <Clock className="h-3 w-3" /> {t.vencimento}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {tasks.length === 0 && <div className="flex items-center justify-center h-24 text-xs text-muted-foreground border-2 border-dashed border-border rounded-lg">Nenhuma tarefa</div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Nova Tarefa Modal */}
      <Dialog open={showNova} onOpenChange={setShowNova}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading">Nova tarefa</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div><Label className="text-xs">Título *</Label><Input placeholder="Ex: Follow-up com cliente" className="mt-1" /></div>
            <div><Label className="text-xs">Descrição</Label><Textarea placeholder="Detalhes da tarefa" className="mt-1" rows={2} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Tipo</Label>
                <Select><SelectTrigger className="mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{Object.entries(tipoTarefaLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">Prioridade</Label>
                <Select><SelectTrigger className="mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent><SelectItem value="alta">Alta</SelectItem><SelectItem value="media">Média</SelectItem><SelectItem value="baixa">Baixa</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Cliente</Label>
                <Select><SelectTrigger className="mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{mockClientes360.map(c => <SelectItem key={c.id} value={c.id}>{c.nomeFantasia}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">Data de vencimento</Label><Input type="date" className="mt-1" /></div>
            </div>
            <div><Label className="text-xs">Observação</Label><Textarea placeholder="Notas adicionais" className="mt-1" rows={2} /></div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowNova(false)}>Cancelar</Button>
            <Button onClick={() => setShowNova(false)}>Criar tarefa</Button>
          </div>
        </DialogContent>
      </Dialog>
    </VendedorLayout>
  );
}
