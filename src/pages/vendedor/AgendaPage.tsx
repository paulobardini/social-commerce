// LENTE 3 (Agenda) — projeção calendário da entidade única "Ação".
// Dedup no TarefasContext: compromissos são derivação pura das tarefas com hora.
// Chips = 7 tipos canônicos (sem "Tarefa"). "Novo compromisso" = criar Ação com hora obrigatória.
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight,
  Phone, MapPin, Clock, Video, ArrowRight, Presentation, CheckSquare, Sparkles, Route,
} from "lucide-react";
import { tipoAcaoLabels, mockClientes360 } from "@/data/mockCRM360";
import { useTarefas } from "@/contexts/TarefasContext";
import { NovoCompromissoModal } from "@/components/vendedor/NovoCompromissoModal";
import { ConcluirAcaoModal } from "@/components/vendedor/ConcluirAcaoModal";
import { statusDerivado } from "@/lib/acoes";
import { toast } from "sonner";

// Ícones e cores por TIPO canônico (7). Fallback -> "outros".
const tipoIcons: Record<string, any> = {
  ligacao: Phone, reuniao: Video, visita: MapPin, follow_up: ArrowRight,
  retorno_orcamento: Clock, apresentacao: Presentation, outros: CalendarIcon,
  // legado com fallback visual
  retorno_proposta: Clock, cobranca_resposta: Clock, pos_venda: CheckSquare,
};
const tipoColors: Record<string, string> = {
  ligacao: "bg-green-100 text-green-700",
  reuniao: "bg-blue-100 text-blue-700",
  visita: "bg-purple-100 text-purple-700",
  follow_up: "bg-orange-100 text-orange-700",
  retorno_orcamento: "bg-yellow-100 text-yellow-700",
  apresentacao: "bg-indigo-100 text-indigo-700",
  outros: "bg-slate-100 text-slate-700",
  retorno_proposta: "bg-yellow-100 text-yellow-700",
  cobranca_resposta: "bg-orange-100 text-orange-700",
  pos_venda: "bg-emerald-100 text-emerald-700",
};

const weekDates = [
  { day: "Seg", date: "14/04", full: "14/04/2026" },
  { day: "Ter", date: "15/04", full: "15/04/2026" },
  { day: "Qua", date: "16/04", full: "16/04/2026" },
  { day: "Qui", date: "17/04", full: "17/04/2026" },
  { day: "Sex", date: "18/04", full: "18/04/2026" },
];
const WEEK_DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const hours = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

function tipoLabel(t: string) {
  return tipoAcaoLabels[t] ?? tipoAcaoLabels.outros;
}

// Próxima hora após a hora informada (00:30 depois), limitada às horas visíveis
function horaSugerida(afterHora: string): string {
  const [h, m] = afterHora.split(":").map(Number);
  const total = h * 60 + m + 90; // sugerir 1h30 depois
  const hh = Math.min(18, Math.floor(total / 60));
  const mm = total % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

export default function AgendaPage() {
  const navigate = useNavigate();
  const { compromissos, tarefas, toggleConcluida } = useTarefas();
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("week");
  const [selectedDay, setSelectedDay] = useState("14/04/2026");
  const [novoOpen, setNovoOpen] = useState(false);
  const [novoPrefill, setNovoPrefill] = useState<{ data?: string; hora?: string; clienteId?: string; tipo?: string; titulo?: string }>({});
  const [concluirId, setConcluirId] = useState<string | null>(null);

  // Deduplicado: já é 1x por Ação (hydration + sync do contexto)
  const eventos = compromissos;
  const todayEvents = eventos.filter(c => c.data === selectedDay);

  // ---- Sugestões de rota ----
  // Base: visitas agendadas no DIA selecionado (view Dia) OU na SEMANA (view Semana).
  const sugestoes = useMemo(() => {
    const scope = viewMode === "week"
      ? eventos.filter(e => weekDates.some(d => d.full === e.data))
      : eventos.filter(e => e.data === selectedDay);
    const visitas = scope.filter(e => e.tipo === "visita" && e.clienteId);
    if (visitas.length === 0) return [];
    // Mapear cidade das visitas
    const cidadesComVisita = new Map<string, { data: string; hora: string; clienteId: string; clienteNome?: string }>();
    for (const v of visitas) {
      const c = mockClientes360.find(x => x.id === v.clienteId);
      if (c) {
        const key = `${c.cidade}|${v.data}`;
        if (!cidadesComVisita.has(key)) cidadesComVisita.set(key, { data: v.data, hora: v.hora, clienteId: v.clienteId!, clienteNome: v.clienteNome });
      }
    }
    // Clientes em risco/reativação/inativo nas mesmas cidades — sem visita já marcada
    const jaAgendados = new Set(scope.map(e => `${e.clienteId}|${e.data}`));
    const out: Array<{ cliente: typeof mockClientes360[number]; data: string; hora: string; ancoraCliente?: string }> = [];
    for (const [key, ancora] of cidadesComVisita.entries()) {
      const [cidade, data] = key.split("|");
      const candidatos = mockClientes360.filter(c =>
        c.cidade === cidade &&
        c.id !== ancora.clienteId &&
        (c.status === "em_risco" || c.status === "reativacao" || c.status === "inativo") &&
        !jaAgendados.has(`${c.id}|${data}`),
      );
      for (const c of candidatos) {
        out.push({ cliente: c, data, hora: horaSugerida(ancora.hora), ancoraCliente: ancora.clienteNome });
      }
    }
    return out.slice(0, 6);
  }, [eventos, viewMode, selectedDay]);

  const abrirNova = (prefill?: typeof novoPrefill) => {
    setNovoPrefill({ data: prefill?.data || selectedDay, ...prefill });
    setNovoOpen(true);
  };

  const concluirEvento = (compId: string) => {
    const comp = eventos.find(e => e.id === compId);
    if (!comp?.tarefaId) return;
    const t = tarefas.find(x => x.id === comp.tarefaId);
    if (!t) return;
    if (t.clienteId) {
      setConcluirId(t.id);
    } else {
      toggleConcluida(t.id);
      toast.success("Ação concluída");
    }
  };

  return (
    <>
      <div className="p-4 md:p-6 space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-heading font-bold text-foreground flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" /> Agenda
            </h1>
            <p className="text-sm text-muted-foreground">Semana de 14 a 18 de abril de 2026</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm"><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm">Hoje</Button>
            <Button variant="outline" size="sm"><ChevronRight className="h-4 w-4" /></Button>
            <div className="flex items-center border border-border rounded-lg overflow-hidden">
              {(["day", "week", "month"] as const).map(m => (
                <button key={m} onClick={() => setViewMode(m)} className={`px-3 py-1.5 text-xs transition-colors capitalize ${viewMode === m ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted"}`}>
                  {m === "day" ? "Dia" : m === "week" ? "Semana" : "Mês"}
                </button>
              ))}
            </div>
            <Button size="sm" onClick={() => abrirNova()}>
              <Plus className="h-4 w-4 mr-1" /> <span className="hidden sm:inline">Novo compromisso</span><span className="sm:hidden">Novo</span>
            </Button>
          </div>
        </div>

        {/* Summary bar — tipos canônicos, sem "Tarefa" */}
        <div className="flex gap-3 flex-wrap">
          {Object.entries(tipoAcaoLabels).map(([key, label]) => {
            const count = eventos.filter(c => c.tipo === key && c.status === "agendado").length;
            if (count === 0) return null;
            const Icon = tipoIcons[key] || CalendarIcon;
            return (
              <div key={key} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs ${tipoColors[key]}`}>
                <Icon className="h-3.5 w-3.5" />
                <span className="font-medium">{label}</span>
                <Badge variant="secondary" className="text-[9px] h-4 px-1">{count}</Badge>
              </div>
            );
          })}
        </div>

        {/* Banner mobile — sugestões de rota */}
        {sugestoes.length > 0 && (
          <div className="md:hidden rounded-lg border border-purple-200 bg-purple-50/60 px-3 py-2 flex items-start gap-2">
            <Route className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-purple-900">
                {sugestoes.length} sugestã{sugestoes.length === 1 ? "o" : "ões"} de rota
              </p>
              <p className="text-[10px] text-purple-800 truncate">
                Clientes em risco na mesma cidade de suas visitas.
              </p>
            </div>
            <Button size="sm" variant="ghost" className="h-7 text-[10px]" onClick={() => setViewMode("day")}>
              Ver
            </Button>
          </div>
        )}

        <div className="flex gap-6">
          {/* Main calendar area */}
          <div className="flex-1 min-w-0">
            {viewMode === "week" ? (
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="grid grid-cols-[60px_repeat(5,1fr)] border-b border-border bg-muted/50">
                  <div className="p-3" />
                  {weekDates.map(d => (
                    <button key={d.full} onClick={() => setSelectedDay(d.full)} className={`p-3 text-center transition-colors border-l border-border/50 ${selectedDay === d.full ? "bg-accent/10" : "hover:bg-muted"}`}>
                      <p className="text-[10px] text-muted-foreground uppercase">{d.day}</p>
                      <p className={`text-lg font-bold font-heading ${d.full === "14/04/2026" ? "text-accent" : ""}`}>{d.date.split("/")[0]}</p>
                    </button>
                  ))}
                </div>
                <div className="relative">
                  {hours.map(h => (
                    <div key={h} className="grid grid-cols-[60px_repeat(5,1fr)] border-b border-border/30">
                      <div className="p-1.5 text-[10px] text-muted-foreground text-right pr-2 border-r border-border/30">{h}</div>
                      {weekDates.map(d => {
                        const events = eventos.filter(c => c.data === d.full && c.hora === h);
                        return (
                          <div key={d.full + h} className="min-h-[56px] p-1 border-l border-border/20">
                            {events.map(ev => {
                              const Icon = tipoIcons[ev.tipo] || CalendarIcon;
                              return (
                                <button
                                  key={ev.id}
                                  onClick={() => ev.clienteId && navigate(`/vendedor/360/${ev.clienteId}`)}
                                  className={`w-full text-left p-1.5 rounded-md text-[10px] mb-0.5 ${tipoColors[ev.tipo] || tipoColors.outros} hover:opacity-80 transition-opacity`}
                                >
                                  <div className="flex items-center gap-1">
                                    <Icon className="h-3 w-3 shrink-0" />
                                    <span className="font-medium truncate">{ev.titulo}</span>
                                  </div>
                                  <span className="text-[9px] opacity-70">{ev.hora} · {ev.duracao}</span>
                                </button>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            ) : viewMode === "day" ? (
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="p-3 bg-muted/50 border-b border-border">
                  <p className="text-sm font-semibold">{selectedDay}</p>
                </div>
                <div className="divide-y divide-border/50">
                  {hours.map(h => {
                    const events = eventos.filter(c => c.data === selectedDay && c.hora === h);
                    return (
                      <div key={h} className="flex min-h-[60px]">
                        <div className="w-16 p-2 text-xs text-muted-foreground shrink-0 border-r border-border/30 text-right pr-3">{h}</div>
                        <div className="flex-1 p-1">
                          {events.map(ev => {
                            const Icon = tipoIcons[ev.tipo] || CalendarIcon;
                            return (
                              <button key={ev.id} onClick={() => ev.clienteId && navigate(`/vendedor/360/${ev.clienteId}`)} className={`w-full text-left p-2.5 rounded-md mb-1 ${tipoColors[ev.tipo] || tipoColors.outros} hover:opacity-80 transition-opacity`}>
                                <div className="flex items-center gap-2">
                                  <Icon className="h-4 w-4 shrink-0" />
                                  <div>
                                    <p className="text-sm font-medium">{ev.titulo}</p>
                                    <p className="text-xs opacity-70">{ev.hora} · {ev.duracao} · {ev.clienteNome}</p>
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="border border-border rounded-lg p-4">
                <p className="text-sm text-muted-foreground text-center mb-4">Abril 2026</p>
                <div className="grid grid-cols-7 gap-1">
                  {WEEK_DAYS.map(d => <div key={d} className="text-center text-[10px] text-muted-foreground font-medium py-1">{d}</div>)}
                  {Array.from({ length: 2 }, (_, i) => <div key={`empty-${i}`} className="h-16" />)}
                  {Array.from({ length: 30 }, (_, i) => {
                    const day = i + 1;
                    const dateStr = `${day.toString().padStart(2, "0")}/04/2026`;
                    const events = eventos.filter(c => c.data === dateStr);
                    const isToday = day === 14;
                    return (
                      <button key={day} onClick={() => { setSelectedDay(dateStr); setViewMode("day"); }} className={`h-16 p-1 border border-border/30 rounded-md text-left hover:bg-muted/50 transition-colors ${isToday ? "bg-accent/5 border-accent/30" : ""}`}>
                        <p className={`text-xs font-medium ${isToday ? "text-accent" : ""}`}>{day}</p>
                        {events.length > 0 && (
                          <div className="mt-0.5">
                            {events.slice(0, 2).map(ev => (
                              <div key={ev.id} className={`text-[8px] px-1 py-0.5 rounded mb-0.5 truncate ${tipoColors[ev.tipo] || tipoColors.outros}`}>{ev.titulo.substring(0, 15)}</div>
                            ))}
                            {events.length > 2 && <p className="text-[8px] text-muted-foreground">+{events.length - 2}</p>}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div className="hidden md:block w-[280px] shrink-0 space-y-4">
            <div>
              <p className="text-sm font-semibold font-heading mb-1">Compromissos do dia</p>
              <p className="text-xs text-muted-foreground mb-3">{selectedDay} · {todayEvents.length} evento{todayEvents.length !== 1 ? "s" : ""}</p>
              <div className="space-y-2">
                {todayEvents.map(c => {
                  const Icon = tipoIcons[c.tipo] || CalendarIcon;
                  const tarefaVinculada = c.tarefaId ? tarefas.find(t => t.id === c.tarefaId) : undefined;
                  const isConcluido = tarefaVinculada ? statusDerivado(tarefaVinculada) === "concluida" : c.status === "concluido";
                  return (
                    <Card key={c.id} className={`border border-border hover:border-accent/40 hover:shadow-sm transition-all ${isConcluido ? "opacity-60" : ""}`}>
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${tipoColors[c.tipo] || tipoColors.outros}`}>
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] text-muted-foreground">{c.hora} · {c.duracao}</span>
                          </div>
                          <Badge variant="secondary" className="text-[9px]">{tipoLabel(c.tipo)}</Badge>
                        </div>
                        <button onClick={() => c.clienteId && navigate(`/vendedor/360/${c.clienteId}`)} className="text-left w-full">
                          <p className={`text-sm font-medium ${isConcluido ? "line-through" : ""}`}>{c.titulo}</p>
                          {c.clienteNome && <p className="text-xs text-accent mt-0.5">{c.clienteNome}</p>}
                          <p className="text-[10px] text-muted-foreground mt-1">{c.descricao}</p>
                        </button>
                        {c.tarefaId && !isConcluido && (
                          <button
                            onClick={() => concluirEvento(c.id)}
                            className="mt-2 text-[10px] text-accent hover:underline flex items-center gap-1"
                          >
                            <CheckSquare className="h-3 w-3" /> Concluir
                          </button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
                {todayEvents.length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
                    <CalendarIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
                    <p className="text-xs text-muted-foreground">Nenhum compromisso</p>
                  </div>
                )}
              </div>
            </div>

            {/* Sugestões de rota */}
            {sugestoes.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <Route className="h-4 w-4 text-purple-600" />
                  <p className="text-sm font-semibold font-heading">Sugestões de rota</p>
                </div>
                <p className="text-xs text-muted-foreground mb-2">Aproveite deslocamentos já agendados</p>
                <div className="space-y-2">
                  {sugestoes.map((s, i) => (
                    <Card key={`${s.cliente.id}-${i}`} className="border border-purple-200 bg-purple-50/40">
                      <CardContent className="p-2.5">
                        <div className="flex items-start gap-1 mb-1">
                          <Sparkles className="h-3 w-3 text-purple-600 mt-0.5 shrink-0" />
                          <p className="text-[10px] text-purple-900 leading-tight">
                            Você estará em <strong>{s.cliente.cidade}</strong> em {s.data}
                          </p>
                        </div>
                        <p className="text-xs font-medium truncate">{s.cliente.nomeFantasia}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {s.cliente.status === "em_risco" ? "Em risco" : s.cliente.status === "reativacao" ? "Reativação" : "Inativo"}
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2 h-7 text-[10px] w-full border-purple-300 text-purple-700 hover:bg-purple-100"
                          onClick={() => abrirNova({
                            data: s.data,
                            hora: s.hora,
                            clienteId: s.cliente.id,
                            tipo: "visita",
                            titulo: `Visita ${s.cliente.nomeFantasia}`,
                          })}
                        >
                          <Plus className="h-3 w-3 mr-1" /> Adicionar visita
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <NovoCompromissoModal
        open={novoOpen}
        onOpenChange={setNovoOpen}
        defaultDate={novoPrefill.data}
        defaultHora={novoPrefill.hora}
        defaultClienteId={novoPrefill.clienteId}
        defaultTipo={novoPrefill.tipo}
        defaultTitulo={novoPrefill.titulo}
      />
      <ConcluirAcaoModal open={concluirId !== null} onOpenChange={o => !o && setConcluirId(null)} acaoId={concluirId} />
    </>
  );
}
