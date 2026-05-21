import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus, Search, Filter, Kanban, List, Clock, Settings2, X, ShieldCheck, User as UserIcon, MessageCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { AtendimentoKanban } from "@/components/atendimento/AtendimentoKanban";
import { AtendimentoLista } from "@/components/atendimento/AtendimentoLista";
import { AtendimentoTimeline } from "@/components/atendimento/AtendimentoTimeline";
import { TicketDrawer } from "@/components/atendimento/TicketDrawer";
import { FunisConfigModal } from "@/components/atendimento/FunisConfigModal";
import {
  type Ticket, type Setor, setorLabels, setorDot, tipoLabels, prioridadeLabels,
  mockAtendentes, loadTickets, loadFunis, getCurrentAtendente, saveCurrentUserId,
  visibleSetores,
} from "@/data/mockAtendimento";

type View = "kanban" | "lista" | "timeline";

export default function AtendimentoPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [funis, setFunis] = useState(loadFunis());
  const [view, setView] = useState<View>("kanban");
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filtroSetores, setFiltroSetores] = useState<Setor[]>([]);
  const [filtroTipo, setFiltroTipo] = useState<string>("");
  const [filtroPrioridade, setFiltroPrioridade] = useState<string>("");
  const [filtroResponsavel, setFiltroResponsavel] = useState<string>("");
  const [filtroOrigem, setFiltroOrigem] = useState<string>("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [funilConfigOpen, setFunilConfigOpen] = useState(false);
  const [me, setMe] = useState(getCurrentAtendente());

  useEffect(() => { setTickets(loadTickets()); setFunis(loadFunis()); }, [refreshKey]);

  const setoresVisiveis = visibleSetores(me);

  const filtered = useMemo(() => {
    return tickets.filter(t => {
      if (!setoresVisiveis.includes(t.setor)) return false;
      if (filtroSetores.length > 0 && !filtroSetores.includes(t.setor)) return false;
      if (filtroTipo && t.tipo !== filtroTipo) return false;
      if (filtroPrioridade && t.prioridade !== filtroPrioridade) return false;
      if (filtroResponsavel && t.responsavelId !== filtroResponsavel) return false;
      if (filtroOrigem && t.origem !== filtroOrigem) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !t.empresa.toLowerCase().includes(q) &&
          !t.clienteNome.toLowerCase().includes(q) &&
          !t.descricao.toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });
  }, [tickets, setoresVisiveis, filtroSetores, filtroTipo, filtroPrioridade, filtroResponsavel, filtroOrigem, search]);

  const setoresAtivos = filtroSetores.length > 0 ? filtroSetores : setoresVisiveis;

  const activeFilterCount =
    filtroSetores.length + (filtroTipo ? 1 : 0) + (filtroPrioridade ? 1 : 0) +
    (filtroResponsavel ? 1 : 0) + (filtroOrigem ? 1 : 0);

  const toggleSetor = (s: Setor) => {
    setFiltroSetores(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const handleOpenTicket = (t: Ticket) => {
    setSelectedTicket(t);
    setDrawerOpen(true);
  };

  const handleNewTicket = () => {
    setSelectedTicket(null);
    setDrawerOpen(true);
  };

  const handleSaved = () => setRefreshKey(k => k + 1);

  const handleUserSwitch = (id: string) => {
    saveCurrentUserId(id);
    setMe(getCurrentAtendente());
  };

  const clearFilters = () => {
    setFiltroSetores([]); setFiltroTipo(""); setFiltroPrioridade("");
    setFiltroResponsavel(""); setFiltroOrigem("");
  };

  return (
    <>
      <div className="p-4 md:p-6 space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-heading font-bold text-foreground">Atendimento</h1>
            <p className="text-sm text-muted-foreground">Gerencie os tickets de atendimento dos seus clientes</p>
          </div>
          <div className="flex gap-2">
            {me.role === "supervisor" && (
              <Button variant="outline" size="sm" onClick={() => setFunilConfigOpen(true)}>
                <Settings2 className="h-4 w-4 mr-1" /> <span className="hidden sm:inline">Configurar funis</span>
              </Button>
            )}
            <Button size="sm" onClick={handleNewTicket}>
              <Plus className="h-4 w-4 mr-1" /> Novo ticket
            </Button>
          </div>
        </div>

        {/* Perfil bar */}
        <div className="flex items-center gap-3 flex-wrap p-3 bg-muted/40 border border-border rounded-lg">
          <div className="flex items-center gap-2">
            {me.role === "supervisor" ? <ShieldCheck className="h-4 w-4 text-indigo-600" /> : <UserIcon className="h-4 w-4 text-muted-foreground" />}
            <span className="text-xs font-medium text-foreground">
              {me.role === "supervisor"
                ? "Supervisor — vendo todos os setores"
                : `Atendente — ${me.setores.map(s => setorLabels[s]).join(", ")}`}
            </span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Visualizar como</span>
            <Select value={me.id} onValueChange={handleUserSwitch}>
              <SelectTrigger className="h-8 text-xs w-[200px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {mockAtendentes.map(a => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.nome} · {a.role === "supervisor" ? "Supervisor" : a.setores.map(s => setorLabels[s]).join("/")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar ticket, cliente ou descrição..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>

          <Button variant="outline" size="sm" onClick={() => setShowFilters(s => !s)} className="relative">
            <Filter className="h-4 w-4 mr-1" /> Filtros
            {activeFilterCount > 0 && (
              <Badge className="absolute -top-1.5 -right-1.5 h-4 w-4 p-0 flex items-center justify-center text-[9px]">{activeFilterCount}</Badge>
            )}
          </Button>

          <div className="flex items-center border border-border rounded-lg overflow-hidden ml-auto">
            {[
              { v: "kanban" as View, icon: Kanban, label: "Kanban" },
              { v: "lista" as View, icon: List, label: "Lista" },
              { v: "timeline" as View, icon: Clock, label: "Timeline" },
            ].map(opt => (
              <button
                key={opt.v}
                onClick={() => setView(opt.v)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors ${
                  view === opt.v ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <opt.icon className="h-4 w-4" /> {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Setor chips (sempre visíveis quando há mais de 1 setor visível) */}
        {setoresVisiveis.length > 1 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground">Setor:</span>
            {setoresVisiveis.map(s => {
              const active = filtroSetores.includes(s);
              return (
                <button
                  key={s}
                  onClick={() => toggleSetor(s)}
                  className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-all ${
                    active
                      ? "bg-foreground text-background border-foreground"
                      : "bg-card text-muted-foreground border-border hover:border-foreground/40"
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${setorDot[s]}`} />
                  {setorLabels[s]}
                </button>
              );
            })}
            {filtroSetores.length > 0 && (
              <button onClick={() => setFiltroSetores([])} className="text-[11px] text-muted-foreground hover:underline">
                limpar
              </button>
            )}
          </div>
        )}

        {/* Filtros avançados */}
        {showFilters && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-muted/40 rounded-lg border border-border">
            <div>
              <label className="text-[10px] uppercase text-muted-foreground">Tipo</label>
              <Select value={filtroTipo || "all"} onValueChange={(v) => setFiltroTipo(v === "all" ? "" : v)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {Object.entries(tipoLabels).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[10px] uppercase text-muted-foreground">Prioridade</label>
              <Select value={filtroPrioridade || "all"} onValueChange={(v) => setFiltroPrioridade(v === "all" ? "" : v)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {Object.entries(prioridadeLabels).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[10px] uppercase text-muted-foreground">Responsável</label>
              <Select value={filtroResponsavel || "all"} onValueChange={(v) => setFiltroResponsavel(v === "all" ? "" : v)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {mockAtendentes
                    .filter(a => a.role === "supervisor" || a.setores.some(s => setoresVisiveis.includes(s)))
                    .map(a => <SelectItem key={a.id} value={a.id}>{a.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[10px] uppercase text-muted-foreground">Origem</label>
              <Select value={filtroOrigem || "all"} onValueChange={(v) => setFiltroOrigem(v === "all" ? "" : v)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {activeFilterCount > 0 && (
              <div className="col-span-2 md:col-span-4 flex justify-end">
                <Button variant="ghost" size="sm" className="text-xs" onClick={clearFilters}>
                  <X className="h-3 w-3 mr-1" /> Limpar filtros
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Content */}
        {view === "kanban" && (
          <AtendimentoKanban
            tickets={filtered}
            funis={funis}
            setoresVisiveis={setoresAtivos}
            onTicketClick={handleOpenTicket}
          />
        )}
        {view === "lista" && (
          <AtendimentoLista tickets={filtered} funis={funis} onTicketClick={handleOpenTicket} />
        )}
        {view === "timeline" && (
          <AtendimentoTimeline tickets={filtered} funis={funis} onTicketClick={handleOpenTicket} />
        )}
      </div>

      <TicketDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        ticket={selectedTicket}
        onSaved={handleSaved}
      />
      <FunisConfigModal
        open={funilConfigOpen}
        onOpenChange={setFunilConfigOpen}
        onSaved={handleSaved}
      />
    </>
  );
}
