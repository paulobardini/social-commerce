// LENTE 2 (Tarefas): planejamento temporal + view Semana.
// Fonte única = TarefasContext. Status derivado, nunca stored como "atrasada".
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Search, Plus, CheckSquare, Clock, AlertTriangle, X, List, CalendarDays, Target,
  ChevronDown, ChevronRight, RefreshCw, CalendarClock,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { tipoTarefaLabels, mockClientes360 } from "@/data/mockCRM360";
import { useTarefas, type Recorrencia, type TarefaExt } from "@/contexts/TarefasContext";
import {
  statusDerivado, agruparPorTempo, grupoTempoLabels, grupoTempoOrdem,
  HOJE_ANCHOR, formatBR, type GrupoTempo,
} from "@/lib/acoes";
import { AcaoOrigemIcon } from "@/components/vendedor/AcaoOrigemIcon";
import { AcaoQuickAdd } from "@/components/vendedor/AcaoQuickAdd";
import { ConcluirAcaoModal } from "@/components/vendedor/ConcluirAcaoModal";
import { toast } from "sonner";

const recorrenciaLabels: Record<Recorrencia, string> = {
  nenhuma: "Não repetir", diaria: "Diariamente", semanal: "Semanalmente",
  mensal: "Mensalmente", personalizada: "Personalizado",
};

type FilterCounter = "total" | "pendentes" | "atrasadas" | "concluidas";
type ViewMode = "lista" | "semana";

const grupoIcons: Record<GrupoTempo, any> = {
  atrasadas: AlertTriangle, hoje: Clock, amanha: CalendarClock,
  esta_semana: CalendarDays, depois: CalendarDays, sem_data: Clock,
};
const grupoColors: Record<GrupoTempo, string> = {
  atrasadas: "text-red-600", hoje: "text-blue-600", amanha: "text-purple-600",
  esta_semana: "text-slate-600", depois: "text-slate-500", sem_data: "text-muted-foreground",
};

// ---- Week view helpers ----
function semanaAtual(): { data: string; dia: string; num: string; isToday: boolean }[] {
  const base = new Date(HOJE_ANCHOR.getTime());
  const dow = base.getDay(); // 0=dom
  const seg = new Date(base.getTime());
  seg.setDate(seg.getDate() - ((dow + 6) % 7));
  const labels = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(seg.getTime());
    d.setDate(seg.getDate() + i);
    return {
      data: formatBR(d),
      dia: labels[i],
      num: String(d.getDate()).padStart(2, "0"),
      isToday: d.toDateString() === HOJE_ANCHOR.toDateString(),
    };
  });
}

export default function TarefasPage() {
  const navigate = useNavigate();
  const { tarefas, addTarefa, toggleConcluida, adiarDias, updateTarefa } = useTarefas();
  const [view, setView] = useState<ViewMode>("lista");
  const [search, setSearch] = useState("");
  const [filterCounter, setFilterCounter] = useState<FilterCounter>("total");
  const [filterPrioridade, setFilterPrioridade] = useState<string>("");
  const [filterTipo, setFilterTipo] = useState<string>("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [collapsed, setCollapsed] = useState<Set<GrupoTempo>>(new Set());
  const [concluirId, setConcluirId] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);

  const [showNova, setShowNova] = useState(false);
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

  // Contadores derivados
  const counts = useMemo(() => {
    const c = { total: 0, pendentes: 0, atrasadas: 0, concluidas: 0 };
    for (const t of tarefas) {
      const st = statusDerivado(t);
      c.total++;
      if (st === "concluida") c.concluidas++;
      else if (st === "atrasada") c.atrasadas++;
      else if (st === "pendente") c.pendentes++;
    }
    return c;
  }, [tarefas]);

  const filtered = useMemo(() => {
    return tarefas.filter(t => {
      const st = statusDerivado(t);
      // Canceladas (Dispensar) NUNCA aparecem nas lentes — item 9.
      if (st === "cancelada") return false;
      // O filtro "total" exclui concluídas por padrão; concluídas só aparecem no chip "Concluídas".
      if (filterCounter === "total" && st === "concluida") return false;
      if (filterCounter === "pendentes" && st !== "pendente") return false;
      if (filterCounter === "atrasadas" && st !== "atrasada") return false;
      if (filterCounter === "concluidas" && st !== "concluida") return false;
      if (search && !t.titulo.toLowerCase().includes(search.toLowerCase()) &&
          !(t.clienteNome || "").toLowerCase().includes(search.toLowerCase())) return false;
      if (filterPrioridade && t.prioridade !== filterPrioridade) return false;
      if (filterTipo && t.tipo !== filterTipo) return false;
      return true;
    });
  }, [tarefas, search, filterCounter, filterPrioridade, filterTipo]);

  const grupos = useMemo(() => agruparPorTempo(filtered), [filtered]);
  const prioridadeDot: Record<string, string> = { alta: "bg-red-500", media: "bg-yellow-500", baixa: "bg-green-500" };
  const activeFilters = [filterPrioridade, filterTipo].filter(Boolean).length;
  const week = useMemo(() => semanaAtual(), []);

  const toggleGrupo = (g: GrupoTempo) => {
    setCollapsed(prev => {
      const s = new Set(prev);
      s.has(g) ? s.delete(g) : s.add(g);
      return s;
    });
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  const bulkAdiar = () => {
    selected.forEach(id => adiarDias(id, 1));
    toast.success(`${selected.size} ${selected.size === 1 ? "ação adiada" : "ações adiadas"} em 1 dia`);
    setSelected(new Set());
  };
  const bulkConcluir = () => {
    selected.forEach(id => toggleConcluida(id));
    toast.success(`${selected.size} ${selected.size === 1 ? "ação concluída" : "ações concluídas"}`);
    setSelected(new Set());
  };

  const openConcluir = (t: TarefaExt) => {
    if (statusDerivado(t) === "concluida") { toggleConcluida(t.id); return; }
    if (t.clienteId) { setConcluirId(t.id); return; }
    toggleConcluida(t.id);
    toast.success("Ação concluída");
  };

  const resetForm = () => {
    setTitulo(""); setDescricao(""); setTipo("follow_up"); setPrioridade("media");
    setClienteId(""); setVencimento(""); setHora(""); setObservacao("");
    setRecorrencia("nenhuma"); setIntervaloCustom(7);
  };

  const openNova = (prefill?: { titulo?: string; clienteId?: string; tipo?: string; vencimento?: string; hora?: string }) => {
    resetForm();
    if (prefill?.titulo) setTitulo(prefill.titulo);
    if (prefill?.clienteId) setClienteId(prefill.clienteId);
    if (prefill?.tipo) setTipo(prefill.tipo);
    if (prefill?.vencimento) setVencimento(prefill.vencimento);
    if (prefill?.hora) setHora(prefill.hora);
    setShowNova(true);
  };

  const handleCreate = () => {
    if (!titulo.trim() || !vencimento) return;
    const cliente = mockClientes360.find(c => c.id === clienteId);
    addTarefa({
      titulo, descricao, tipo: tipo as any,
      clienteId: clienteId || undefined,
      clienteNome: cliente?.nomeFantasia,
      prioridade,
      vencimento,
      hora: hora || undefined,
      responsavel: "Paulo Bardini",
      status: "pendente",
      observacao: observacao || undefined,
      origem: "vendedor",
      recorrencia,
      recorrenciaIntervaloDias: recorrencia === "personalizada" ? intervaloCustom : undefined,
    });
    toast.success("Ação criada");
    setShowNova(false);
    resetForm();
  };

  // --- Drag & drop na view Semana ---
  const onDragStart = (id: string) => setDragId(id);
  const onDropDia = (data: string) => {
    if (!dragId) return;
    updateTarefa(dragId, { vencimento: data });
    toast.success("Ação reagendada");
    setDragId(null);
  };

  const counterChips: Array<{ id: FilterCounter; label: string; value: number; icon: any; color: string }> = [
    { id: "total", label: "Total", value: counts.total, icon: List, color: "text-foreground" },
    { id: "pendentes", label: "Pendentes", value: counts.pendentes, icon: Clock, color: "text-blue-600" },
    { id: "atrasadas", label: "Atrasadas", value: counts.atrasadas, icon: AlertTriangle, color: "text-red-600" },
    { id: "concluidas", label: "Concluídas", value: counts.concluidas, icon: CheckSquare, color: "text-green-600" },
  ];

  return (
    <>
      <div className="p-4 md:p-6 space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-heading font-bold text-foreground flex items-center gap-2">
              <CheckSquare className="h-5 w-5" /> Tarefas
            </h1>
            <p className="text-sm text-muted-foreground">Planejamento temporal das suas ações</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-border rounded-lg overflow-hidden">
              <button onClick={() => setView("lista")} className={`flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors ${view === "lista" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted"}`}>
                <List className="h-4 w-4" /> Lista
              </button>
              <button onClick={() => setView("semana")} className={`flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors ${view === "semana" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted"}`}>
                <CalendarDays className="h-4 w-4" /> Semana
              </button>
            </div>
            <Button size="sm" onClick={() => openNova()}>
              <Plus className="h-4 w-4 mr-1" /> Nova ação
            </Button>
          </div>
        </div>

        {/* Counter chips = filtros clicáveis */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {counterChips.map(c => {
            const active = filterCounter === c.id;
            const Icon = c.icon;
            return (
              <button
                key={c.id}
                onClick={() => setFilterCounter(c.id)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg border transition-all text-left ${
                  active ? "border-accent bg-accent/5 shadow-sm" : "border-border hover:border-accent/30 bg-background"
                }`}
              >
                <div className={`h-8 w-8 rounded-md flex items-center justify-center bg-muted/50 ${c.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className={`text-lg leading-none font-bold font-heading ${c.color}`}>{c.value}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{c.label}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Quick add NL */}
        <AcaoQuickAdd onOpenModal={openNova} />

        {/* Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar ação ou cliente..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
          </div>
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
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => { setFilterPrioridade(""); setFilterTipo(""); }}>
              <X className="h-3 w-3 mr-1" /> Limpar ({activeFilters})
            </Button>
          )}
        </div>

        {/* Content */}
        {view === "lista" ? (
          <div className="space-y-3">
            {grupoTempoOrdem
              // Se filtrando concluídas, mostra tudo num único bloco "Concluídas"
              .filter(g => filterCounter === "concluidas" ? g === "depois" : true)
              .map(g => {
                const items = grupos[g];
                if (items.length === 0) return null;
                const Icon = grupoIcons[g];
                const isCollapsed = collapsed.has(g);
                const label = filterCounter === "concluidas" && g === "depois" ? "Concluídas" : grupoTempoLabels[g];
                return (
                  <div key={g} className="border border-border rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleGrupo(g)}
                      className="w-full flex items-center gap-2 px-3 py-2 bg-muted/40 hover:bg-muted/60 transition-colors"
                    >
                      {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      <Icon className={`h-4 w-4 ${grupoColors[g]}`} />
                      <span className="text-sm font-semibold">{label}</span>
                      <Badge variant="secondary" className="text-[10px] h-5">{items.length}</Badge>
                    </button>
                    {!isCollapsed && (
                      <div className="divide-y divide-border/60">
                        {items.map(t => (
                          <AcaoLinha
                            key={t.id}
                            t={t}
                            selected={selected.has(t.id)}
                            onSelect={() => toggleSelect(t.id)}
                            onToggle={() => openConcluir(t)}
                            onClientClick={() => t.clienteId && navigate(`/vendedor/360/${t.clienteId}`)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            {filtered.length === 0 && (
              <div className="text-center py-16 border-2 border-dashed border-border rounded-lg">
                <CheckSquare className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">Nenhuma ação encontrada</p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-2 overflow-x-auto">
            {week.map(d => {
              const items = filtered.filter(t => t.vencimento === d.data && statusDerivado(t) !== "concluida");
              return (
                <div
                  key={d.data}
                  onDragOver={e => e.preventDefault()}
                  onDrop={() => onDropDia(d.data)}
                  className={`min-h-[400px] rounded-lg border p-2 ${d.isToday ? "border-accent bg-accent/5" : "border-border bg-muted/20"}`}
                >
                  <div className="flex items-baseline justify-between mb-2 px-1">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase">{d.dia}</p>
                      <p className={`text-lg font-bold font-heading ${d.isToday ? "text-accent" : ""}`}>{d.num}</p>
                    </div>
                    <Badge variant="secondary" className="text-[9px]">{items.length}</Badge>
                  </div>
                  <div className="space-y-1.5">
                    {items.map(t => {
                      const st = statusDerivado(t);
                      return (
                        <Card
                          key={t.id}
                          draggable
                          onDragStart={() => onDragStart(t.id)}
                          className={`border cursor-grab active:cursor-grabbing ${st === "atrasada" ? "border-red-200" : "border-border"}`}
                        >
                          <CardContent className="p-2">
                            <div className="flex items-center gap-1 mb-1">
                              <div className={`w-1.5 h-1.5 rounded-full ${prioridadeDot[t.prioridade]}`} />
                              <span className="text-[9px] uppercase text-muted-foreground">{tipoTarefaLabels[t.tipo]}</span>
                              <div className="ml-auto"><AcaoOrigemIcon origem={t.origem} size={11} /></div>
                            </div>
                            <p className="text-[11px] font-medium leading-tight line-clamp-2">{t.titulo}</p>
                            {t.clienteNome && (
                              <p className="text-[10px] text-accent mt-1 truncate">{t.clienteNome}</p>
                            )}
                            {t.hora && <p className="text-[9px] text-muted-foreground mt-0.5">{t.hora}</p>}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Barra de ações em lote */}
      {selected.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-foreground text-background rounded-full shadow-2xl px-4 py-2 flex items-center gap-3 z-40">
          <span className="text-sm font-medium">{selected.size} selecionada{selected.size > 1 ? "s" : ""}</span>
          <div className="h-4 w-px bg-background/30" />
          <button onClick={bulkAdiar} className="text-xs hover:underline">Adiar 1 dia</button>
          <button onClick={bulkConcluir} className="text-xs hover:underline">Concluir</button>
          <button onClick={() => setSelected(new Set())} className="ml-1 p-1 rounded hover:bg-background/20">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Modal completo Nova Ação */}
      <Dialog open={showNova} onOpenChange={(o) => { setShowNova(o); if (!o) resetForm(); }}>
        <DialogContent className="max-w-lg max-h-[90vh] flex flex-col">
          <DialogHeader className="shrink-0">
            <DialogTitle className="font-heading">Nova ação</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2 overflow-y-auto pr-1 flex-1">
            <div><Label className="text-xs">Título *</Label><Input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ex: Follow-up com cliente" className="mt-1" /></div>
            <div><Label className="text-xs">Descrição</Label><Textarea value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Detalhes" className="mt-1" rows={2} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Tipo</Label>
                <Select value={tipo} onValueChange={setTipo}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(tipoTarefaLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">Prioridade</Label>
                <Select value={prioridade} onValueChange={(v: any) => setPrioridade(v)}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
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
              <div><Label className="text-xs">Vencimento *</Label><Input value={vencimento} onChange={e => setVencimento(e.target.value)} placeholder="DD/MM/AAAA" className="mt-1" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Hora</Label><Input value={hora} onChange={e => setHora(e.target.value)} placeholder="HH:MM" className="mt-1" /></div>
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
            <div><Label className="text-xs">Observação</Label><Textarea value={observacao} onChange={e => setObservacao(e.target.value)} rows={2} className="mt-1" /></div>
            {hora && vencimento && (
              <p className="text-[11px] text-muted-foreground bg-muted/50 px-3 py-2 rounded-md">
                ℹ️ Com hora, esta ação aparece também na <strong>Agenda</strong>.
              </p>
            )}
          </div>
          <div className="flex justify-end gap-2 mt-4 shrink-0">
            <Button variant="outline" onClick={() => setShowNova(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={!titulo.trim() || !vencimento}>Criar ação</Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConcluirAcaoModal open={concluirId !== null} onOpenChange={o => !o && setConcluirId(null)} acaoId={concluirId} />
    </>
  );
}

// ---- Linha da ação ----
interface LinhaProps {
  t: TarefaExt;
  selected: boolean;
  onSelect: () => void;
  onToggle: () => void;
  onClientClick: () => void;
}
function AcaoLinha({ t, selected, onSelect, onToggle, onClientClick }: LinhaProps) {
  const { updateTarefa } = useTarefas();
  const st = statusDerivado(t);
  const prioridadeDot: Record<string, string> = { alta: "bg-red-500", media: "bg-yellow-500", baixa: "bg-green-500" };
  const concluida = st === "concluida";
  return (
    <div className={`flex items-center gap-2 px-3 py-2 hover:bg-muted/30 transition-colors ${st === "atrasada" ? "bg-red-50/40" : ""}`}>
      <Checkbox checked={selected} onCheckedChange={onSelect} className="shrink-0" />
      <button onClick={onToggle} className="shrink-0" aria-label="Concluir">
        <CheckSquare className={`h-4 w-4 ${concluida ? "text-green-500" : st === "atrasada" ? "text-red-500" : "text-blue-500"} hover:scale-110 transition-transform`} />
      </button>
      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${prioridadeDot[t.prioridade]}`} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className={`text-sm font-medium truncate ${concluida ? "line-through text-muted-foreground" : ""}`}>{t.titulo}</p>
          {t.recorrencia && t.recorrencia !== "nenhuma" && (
            <Tooltip><TooltipTrigger asChild><RefreshCw className="h-3 w-3 text-accent shrink-0" /></TooltipTrigger><TooltipContent>Recorrente</TooltipContent></Tooltip>
          )}
        </div>
        {t.oportunidadeNome && (
          <p className="text-[10px] text-accent flex items-center gap-1 truncate"><Target className="h-3 w-3" /> {t.oportunidadeNome}</p>
        )}
      </div>
      {t.clienteNome && (
        <button onClick={onClientClick} className="hidden md:block text-xs text-accent hover:underline max-w-[160px] truncate shrink-0">
          {t.clienteNome}
        </button>
      )}
      <Badge variant="secondary" className="hidden sm:inline-flex text-[9px] shrink-0">{tipoTarefaLabels[t.tipo] ?? t.tipo}</Badge>
      <div className="flex items-center gap-1 text-[11px] text-muted-foreground shrink-0 min-w-[100px] justify-end">
        <Clock className="h-3 w-3" />
        <span>{t.vencimento}{t.hora ? ` · ${t.hora}` : ""}</span>
      </div>
      <div className="shrink-0"><AcaoOrigemIcon origem={t.origem} /></div>
      {/* Dispensar — só para ações sugeridas pelo sistema */}
      {t.origem === "sistema" && !concluida && (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => {
                updateTarefa(t.id, { status: "cancelada" });
                toast.info("Sugestão dispensada");
              }}
              className="shrink-0 p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
              aria-label="Dispensar sugestão"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Dispensar (não conta como concluída)</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
