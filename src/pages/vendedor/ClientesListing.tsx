import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { EditClienteModal } from "@/components/vendedor/EditClienteModal";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { TagBadge } from "@/components/vendedor/TagBadge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search, Plus, Filter, Download, ChevronLeft, ChevronRight, Eye, Edit3,
  LayoutGrid, List, X, Thermometer, Building, MapPin, Target, Kanban, Shuffle,
  Info, EyeOff,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { calcularTemperatura, maskCNPJ } from "@/lib/temperaturaCliente";
import { useVendedorPerfil, podeRedistribuir } from "@/hooks/useVendedorPerfil";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  mockClientes360, statusLabels, statusColors, nichoLabels, temperaturaColors, type Cliente360,
} from "@/data/mockCRM360";

const ITEMS_PER_PAGE = 10;

export default function ClientesListing() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"table" | "cards">("table");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterNicho, setFilterNicho] = useState<string>("");
  const [filterTemperatura, setFilterTemperatura] = useState<string>("");
  const [editCliente, setEditCliente] = useState<Cliente360 | null>(null);
  const [revealCNPJ, setRevealCNPJ] = useState(false);

  const perfil = useVendedorPerfil();
  const showRedistribuir = podeRedistribuir(perfil);

  const filtered = useMemo(() => {
    return mockClientes360.filter(c => {
      if (search) {
        const q = search.toLowerCase();
        if (!c.nomeFantasia.toLowerCase().includes(q) && !c.razaoSocial.toLowerCase().includes(q) && !c.documento.includes(q) && !c.cidade.toLowerCase().includes(q)) return false;
      }
      if (filterStatus && c.status !== filterStatus) return false;
      if (filterNicho && c.nicho !== filterNicho) return false;
      if (filterTemperatura && calcularTemperatura(c.ultimoContato) !== filterTemperatura) return false;
      return true;
    });
  }, [search, filterStatus, filterNicho, filterTemperatura]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paged = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const activeFilters = [filterStatus, filterNicho, filterTemperatura].filter(Boolean).length;

  const tempIcon = (t: string) => t === "quente" ? "🔥" : t === "morna" ? "✨" : "❄️";

  return (
    <>
      <div className="p-4 md:p-6 space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-heading font-bold text-foreground">Clientes</h1>
            <p className="text-sm text-muted-foreground">{filtered.length} clientes na carteira</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => navigate("/vendedor/clientes/kanban")}><Kanban className="h-4 w-4 mr-1" /> Kanban</Button>
            <Button variant="outline" size="sm" onClick={() => navigate("/vendedor/clientes/redistribuir")}><Shuffle className="h-4 w-4 mr-1" /> <span className="hidden sm:inline">Redistribuir</span><span className="sm:hidden">Redist.</span></Button>
            <Button variant="outline" size="sm" className="hidden sm:flex"><Download className="h-4 w-4 mr-1" /> Exportar</Button>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> <span className="hidden sm:inline">Novo cliente</span><span className="sm:hidden">Novo</span></Button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar cliente, documento, cidade..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-9 h-9" />
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="relative">
            <Filter className="h-4 w-4 mr-1" /> Filtros
            {activeFilters > 0 && <Badge className="absolute -top-1.5 -right-1.5 h-4 w-4 p-0 flex items-center justify-center text-[9px]">{activeFilters}</Badge>}
          </Button>
          <div className="flex items-center border border-border rounded-lg overflow-hidden ml-auto">
            <button onClick={() => setView("table")} className={`flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors ${view === "table" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted"}`}>
              <List className="h-4 w-4" /> Tabela
            </button>
            <button onClick={() => setView("cards")} className={`flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors ${view === "cards" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted"}`}>
              <LayoutGrid className="h-4 w-4" /> Cards
            </button>
          </div>
        </div>

        {/* Filter bar */}
        {showFilters && (
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border flex-wrap">
            <Select value={filterStatus} onValueChange={v => { setFilterStatus(v === "all" ? "" : v); setPage(1); }}>
              <SelectTrigger className="h-8 w-[140px] text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {Object.entries(statusLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterNicho} onValueChange={v => { setFilterNicho(v === "all" ? "" : v); setPage(1); }}>
              <SelectTrigger className="h-8 w-[140px] text-xs"><SelectValue placeholder="Nicho" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {Object.entries(nichoLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterTemperatura} onValueChange={v => { setFilterTemperatura(v === "all" ? "" : v); setPage(1); }}>
              <SelectTrigger className="h-8 w-[140px] text-xs"><SelectValue placeholder="Temperatura" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="quente">🔥 Quente</SelectItem>
                <SelectItem value="morna">🌤 Morna</SelectItem>
                <SelectItem value="fria">❄️ Fria</SelectItem>
              </SelectContent>
            </Select>
            {activeFilters > 0 && (
              <Button variant="ghost" size="sm" className="text-xs ml-auto" onClick={() => { setFilterStatus(""); setFilterNicho(""); setFilterTemperatura(""); }}>
                <X className="h-3 w-3 mr-1" /> Limpar
              </Button>
            )}
          </div>
        )}

        {/* Table view */}
        {view === "table" ? (
          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Cliente</TableHead>
                  <TableHead className="font-semibold">Cidade/UF</TableHead>
                  <TableHead className="font-semibold">Nicho</TableHead>
                  <TableHead className="font-semibold">Interesse</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Temp.</TableHead>
                  <TableHead className="font-semibold">Último contato</TableHead>
                  <TableHead className="font-semibold">Oport.</TableHead>
                  <TableHead className="font-semibold w-20">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.map(c => (
                  <TableRow key={c.id} className="cursor-pointer hover:bg-muted/30" onClick={() => navigate(`/vendedor/360/${c.id}`)}>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{c.nomeFantasia}</p>
                        <p className="text-[11px] text-muted-foreground">{c.documento}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{c.cidade}/{c.estado}</TableCell>
                    <TableCell><Badge variant="secondary" className="text-[10px]">{nichoLabels[c.nicho]}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[150px] truncate">{c.interessePrincipal}</TableCell>
                    <TableCell><span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusColors[c.status]}`}>{statusLabels[c.status]}</span></TableCell>
                    <TableCell className="text-center">{tempIcon(c.temperaturaComercial)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{c.ultimoContato}</TableCell>
                    <TableCell className="text-center text-sm font-medium">{c.oportunidadesAbertas}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <button onClick={e => { e.stopPropagation(); navigate(`/vendedor/360/${c.id}`); }} className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-accent hover:bg-muted transition-colors">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button onClick={e => { e.stopPropagation(); setEditCliente(c); }} className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-accent hover:bg-muted transition-colors">
                           <Edit3 className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {paged.length === 0 && (
                  <TableRow><TableCell colSpan={9} className="text-center py-12 text-muted-foreground">Nenhum cliente encontrado</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paged.map(c => (
              <Card key={c.id} className="border border-border cursor-pointer hover:border-accent/40 hover:shadow-md transition-all" onClick={() => navigate(`/vendedor/360/${c.id}`)}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold">{c.nomeFantasia}</p>
                      <p className="text-[11px] text-muted-foreground">{c.documento}</p>
                    </div>
                    <span className="text-lg">{tempIcon(c.temperaturaComercial)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                    <MapPin className="h-3 w-3" /> {c.cidade}/{c.estado}
                  </div>
                  <div className="flex gap-1.5 mb-3 flex-wrap">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusColors[c.status]}`}>{statusLabels[c.status]}</span>
                    <Badge variant="secondary" className="text-[10px]">{nichoLabels[c.nicho]}</Badge>
                  </div>
                  <div className="flex gap-1 mb-2 flex-wrap">{c.tags.slice(0, 3).map(t => <TagBadge key={t} tag={t} />)}</div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border">
                    <span>{c.oportunidadesAbertas} oportunidades</span>
                    <span>Último: {c.ultimoContato}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="h-9 w-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} className={`h-9 w-9 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${page === p ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>{p}</button>
            ))}
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="h-9 w-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 transition-colors">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <EditClienteModal
        open={!!editCliente}
        onOpenChange={open => !open && setEditCliente(null)}
        cliente={editCliente}
      />
    </>
  );
}
