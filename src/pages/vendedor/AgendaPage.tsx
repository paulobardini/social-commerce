import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { VendedorLayout } from "@/components/vendedor/VendedorLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight,
  Phone, MapPin, Clock, User, Video, Footprints, ArrowRight, Presentation,
} from "lucide-react";
import {
  mockCompromissos, tipoCompromissoLabels, type Compromisso,
} from "@/data/mockCRM360";

const tipoIcons: Record<string, any> = {
  ligacao: Phone, reuniao: Video, visita: Footprints, follow_up: ArrowRight,
  retorno_orcamento: Clock, apresentacao: Presentation,
};
const tipoColors: Record<string, string> = {
  ligacao: "bg-green-100 text-green-600", reuniao: "bg-blue-100 text-blue-600",
  visita: "bg-purple-100 text-purple-600", follow_up: "bg-orange-100 text-orange-600",
  retorno_orcamento: "bg-yellow-100 text-yellow-600", apresentacao: "bg-indigo-100 text-indigo-600",
};

const WEEK_DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

// Generate dates for week view
const weekDates = [
  { day: "Seg", date: "14/04", full: "14/04/2026" },
  { day: "Ter", date: "15/04", full: "15/04/2026" },
  { day: "Qua", date: "16/04", full: "16/04/2026" },
  { day: "Qui", date: "17/04", full: "17/04/2026" },
  { day: "Sex", date: "18/04", full: "18/04/2026" },
];

const hours = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

export default function AgendaPage() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("week");
  const [selectedDay, setSelectedDay] = useState("14/04/2026");

  const dayCompromissos = mockCompromissos.filter(c => c.data === selectedDay);
  const todayCompromissos = mockCompromissos.filter(c => c.data === "14/04/2026");

  return (
    <VendedorLayout>
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-heading font-bold text-foreground flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" /> Agenda
            </h1>
            <p className="text-sm text-muted-foreground">Semana de 14 a 18 de abril de 2026</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm"><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm">Hoje</Button>
            <Button variant="outline" size="sm"><ChevronRight className="h-4 w-4" /></Button>
            <div className="flex items-center border border-border rounded-lg overflow-hidden ml-2">
              {(["day", "week", "month"] as const).map(m => (
                <button key={m} onClick={() => setViewMode(m)} className={`px-3 py-1.5 text-xs transition-colors capitalize ${viewMode === m ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted"}`}>
                  {m === "day" ? "Dia" : m === "week" ? "Semana" : "Mês"}
                </button>
              ))}
            </div>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Novo compromisso</Button>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Main calendar area */}
          <div className="flex-1">
            {viewMode === "week" ? (
              <div className="border border-border rounded-lg overflow-hidden">
                {/* Week header */}
                <div className="grid grid-cols-5 border-b border-border bg-muted/50">
                  {weekDates.map(d => (
                    <button key={d.full} onClick={() => setSelectedDay(d.full)} className={`p-3 text-center transition-colors ${selectedDay === d.full ? "bg-accent/10" : "hover:bg-muted"}`}>
                      <p className="text-[10px] text-muted-foreground uppercase">{d.day}</p>
                      <p className={`text-lg font-bold font-heading ${d.full === "14/04/2026" ? "text-accent" : ""}`}>{d.date.split("/")[0]}</p>
                    </button>
                  ))}
                </div>
                {/* Time grid */}
                <div className="relative">
                  {hours.map(h => (
                    <div key={h} className="grid grid-cols-5 border-b border-border/50">
                      {weekDates.map(d => {
                        const events = mockCompromissos.filter(c => c.data === d.full && c.hora === h);
                        return (
                          <div key={d.full + h} className="min-h-[60px] p-1 border-r border-border/30 last:border-r-0 relative">
                            {d === weekDates[0] && <span className="absolute -left-0 top-1 text-[9px] text-muted-foreground">{h}</span>}
                            {events.map(ev => {
                              const Icon = tipoIcons[ev.tipo] || CalendarIcon;
                              return (
                                <button
                                  key={ev.id}
                                  onClick={() => ev.clienteId && navigate(`/vendedor/360/${ev.clienteId}`)}
                                  className={`w-full text-left p-1.5 rounded-md text-[10px] mb-0.5 ${tipoColors[ev.tipo]} hover:opacity-80 transition-opacity`}
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
                    const events = mockCompromissos.filter(c => c.data === selectedDay && c.hora === h);
                    return (
                      <div key={h} className="flex min-h-[60px]">
                        <div className="w-16 p-2 text-xs text-muted-foreground shrink-0 border-r border-border/30">{h}</div>
                        <div className="flex-1 p-1">
                          {events.map(ev => {
                            const Icon = tipoIcons[ev.tipo] || CalendarIcon;
                            return (
                              <button key={ev.id} onClick={() => ev.clienteId && navigate(`/vendedor/360/${ev.clienteId}`)} className={`w-full text-left p-2 rounded-md mb-1 ${tipoColors[ev.tipo]} hover:opacity-80 transition-opacity`}>
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
              /* Month simplified */
              <div className="border border-border rounded-lg p-4">
                <p className="text-sm text-muted-foreground text-center">Visão mensal — Abril 2026</p>
                <div className="grid grid-cols-7 gap-1 mt-4">
                  {WEEK_DAYS.map(d => <div key={d} className="text-center text-[10px] text-muted-foreground font-medium py-1">{d}</div>)}
                  {Array.from({ length: 2 }, (_, i) => <div key={`empty-${i}`} className="h-16" />)}
                  {Array.from({ length: 30 }, (_, i) => {
                    const day = i + 1;
                    const dateStr = `${day.toString().padStart(2, "0")}/04/2026`;
                    const events = mockCompromissos.filter(c => c.data === dateStr);
                    const isToday = day === 14;
                    return (
                      <button key={day} onClick={() => { setSelectedDay(dateStr); setViewMode("day"); }} className={`h-16 p-1 border border-border/30 rounded-md text-left hover:bg-muted/50 transition-colors ${isToday ? "bg-accent/5 border-accent/30" : ""}`}>
                        <p className={`text-xs font-medium ${isToday ? "text-accent" : ""}`}>{day}</p>
                        {events.length > 0 && (
                          <div className="mt-0.5">
                            {events.slice(0, 2).map(ev => (
                              <div key={ev.id} className={`text-[8px] px-1 py-0.5 rounded mb-0.5 truncate ${tipoColors[ev.tipo]}`}>{ev.titulo.substring(0, 15)}</div>
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

          {/* Right sidebar - Today's events */}
          <div className="w-[260px] shrink-0 space-y-4">
            <div>
              <p className="text-sm font-semibold font-heading mb-2">Compromissos do dia</p>
              <p className="text-xs text-muted-foreground mb-3">{selectedDay}</p>
              <div className="space-y-2">
                {mockCompromissos.filter(c => c.data === selectedDay).map(c => {
                  const Icon = tipoIcons[c.tipo] || CalendarIcon;
                  return (
                    <Card key={c.id} className="border border-border cursor-pointer hover:border-accent/40 transition-all" onClick={() => c.clienteId && navigate(`/vendedor/360/${c.clienteId}`)}>
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`h-6 w-6 rounded-md flex items-center justify-center ${tipoColors[c.tipo]}`}>
                            <Icon className="h-3 w-3" />
                          </div>
                          <span className="text-[10px] text-muted-foreground">{c.hora} · {c.duracao}</span>
                        </div>
                        <p className="text-sm font-medium">{c.titulo}</p>
                        {c.clienteNome && <p className="text-xs text-muted-foreground mt-0.5">{c.clienteNome}</p>}
                        <p className="text-[10px] text-muted-foreground mt-1">{c.descricao}</p>
                      </CardContent>
                    </Card>
                  );
                })}
                {mockCompromissos.filter(c => c.data === selectedDay).length === 0 && (
                  <p className="text-xs text-muted-foreground py-4 text-center">Nenhum compromisso</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </VendedorLayout>
  );
}
