import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search, Plus, Settings2, Filter, Save, Bookmark, X,
  MapPin, Calendar, AlertTriangle, User,
} from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  mockClientes360, statusLabels, nichoLabels, type Cliente360,
} from "@/data/mockCRM360";
import {
  etapasClienteKanbanDefault, getClienteEtapaKanban,
} from "@/data/mockRepresentantes";
import { TagBadge } from "@/components/vendedor/TagBadge";

export default function KanbanClientesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filterRep, setFilterRep] = useState("");
  const [filterNicho, setFilterNicho] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [etapas] = useState(etapasClienteKanbanDefault);

  const filtered = useMemo(() => {
    return mockClientes360.filter(c => {
      if (search) {
        const q = search.toLowerCase();
        if (!c.nomeFantasia.toLowerCase().includes(q) && !c.cidade.toLowerCase().includes(q)) return false;
      }
      if (filterRep && c.representante !== filterRep) return false;
      if (filterNicho && c.nicho !== filterNicho) return false;
      return true;
    });
  }, [search, filterRep, filterNicho]);

  const columns = useMemo(() => {
    return etapas.filter(e => e.ativa).map(etapa => ({
      ...etapa,
      clientes: filtered.filter(c => getClienteEtapaKanban(c) === etapa.id),
    }));
  }, [filtered, etapas]);

  const activeFilters = [filterRep, filterNicho].filter(Boolean).length;

  const tempIcon = (t: string) => t === "quente" ? "🔥" : t === "morna" ? "🌤" : "❄️";

  return (
    <>
      <div className="p-4 md:p-6 space-y-4 h-full flex flex-col">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-heading font-bold text-foreground">Kanban de Clientes</h1>
            <p className="text-sm text-muted-foreground">{filtered.length} clientes • Visão por estágio da carteira</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/vendedor/clientes/kanban/config")}>
              <Settings2 className="h-4 w-4 mr-1" /> Configurar funil
            </Button>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Novo cliente</Button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar cliente..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="relative">
            <Filter className="h-4 w-4 mr-1" /> Filtros
            {activeFilters > 0 && <Badge className="absolute -top-1.5 -right-1.5 h-4 w-4 p-0 flex items-center justify-center text-[9px]">{activeFilters}</Badge>}
          </Button>
          <Button variant="outline" size="sm"><Save className="h-4 w-4 mr-1" /> Salvar visão</Button>
          <Button variant="outline" size="sm"><Bookmark className="h-4 w-4 mr-1" /> Segmentações</Button>
        </div>

        {showFilters && (
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border flex-wrap">
            <Select value={filterRep} onValueChange={v => setFilterRep(v === "all" ? "" : v)}>
              <SelectTrigger className="h-8 w-[160px] text-xs"><SelectValue placeholder="Representante" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="Paulo Bardini">Paulo Bardini</SelectItem>
                <SelectItem value="Mariana Costa">Mariana Costa</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterNicho} onValueChange={v => setFilterNicho(v === "all" ? "" : v)}>
              <SelectTrigger className="h-8 w-[140px] text-xs"><SelectValue placeholder="Nicho" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {Object.entries(nichoLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
            {activeFilters > 0 && (
              <Button variant="ghost" size="sm" className="text-xs ml-auto" onClick={() => { setFilterRep(""); setFilterNicho(""); }}>
                <X className="h-3 w-3 mr-1" /> Limpar
              </Button>
            )}
          </div>
        )}

        {/* Kanban Board */}
        <div className="flex-1 overflow-x-auto">
          <div className="flex gap-3 h-full min-h-[500px]">
            {columns.map(col => (
              <div key={col.id} className="flex flex-col w-[260px] min-w-[260px] bg-muted/30 rounded-lg border border-border">
                {/* Column header */}
                <div className="p-3 border-b border-border">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col.cor }} />
                    <span className="text-sm font-semibold text-foreground">{col.nome}</span>
                    <Badge variant="secondary" className="text-[10px] ml-auto">{col.clientes.length}</Badge>
                  </div>
                </div>
                {/* Cards */}
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                  {col.clientes.map(c => (
                    <div
                      key={c.id}
                      onClick={() => navigate(`/vendedor/360/${c.id}`)}
                      className="bg-card border border-border rounded-lg p-3 cursor-pointer hover:border-primary/40 hover:shadow-sm transition-all space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{c.nomeFantasia}</p>
                          <p className="text-[11px] text-muted-foreground">{c.documento}</p>
                        </div>
                        <span className="text-sm shrink-0">{tempIcon(c.temperaturaComercial)}</span>
                      </div>

                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <MapPin className="h-3 w-3" /> {c.cidade}/{c.estado}
                      </div>

                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <User className="h-3 w-3" /> {c.representante}
                      </div>

                      <div className="text-[11px] text-muted-foreground">
                        <span className="font-medium text-foreground">{c.interessePrincipal}</span>
                      </div>

                      {c.marcasInteresse.length > 0 && (
                        <div className="flex gap-1 flex-wrap">
                          {c.marcasInteresse.slice(0, 2).map(m => (
                            <span key={m} className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">{m}</span>
                          ))}
                          {c.marcasInteresse.length > 2 && <span className="text-[9px] text-muted-foreground">+{c.marcasInteresse.length - 2}</span>}
                        </div>
                      )}

                      <div className="flex gap-1 flex-wrap">
                        {c.tags.slice(0, 2).map(t => <TagBadge key={t} tag={t} />)}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border">
                        <span className="flex items-center gap-1"><Calendar className="h-2.5 w-2.5" /> {c.ultimoContato}</span>
                        {c.oportunidadesAbertas > 0 && <span className="font-medium">{c.oportunidadesAbertas} oport.</span>}
                      </div>

                      {c.status === "em_risco" && (
                        <div className="flex items-center gap-1 text-[10px] text-destructive font-medium">
                          <AlertTriangle className="h-3 w-3" /> Cliente em risco
                        </div>
                      )}
                    </div>
                  ))}
                  {col.clientes.length === 0 && (
                    <div className="text-center text-xs text-muted-foreground py-8">Nenhum cliente</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
