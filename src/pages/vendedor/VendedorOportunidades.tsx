import { useState, useMemo } from "react";
import { KanbanBoard } from "@/components/vendedor/KanbanBoard";
import { FunilConfigModal } from "@/components/vendedor/FunilConfigModal";
import { NovaOportunidadeModal } from "@/components/vendedor/NovaOportunidadeModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { TagBadge } from "@/components/vendedor/TagBadge";
import {
  Plus, Settings, Search, Kanban, List, Filter, X, ChevronDown, ChevronRight, Factory, Tag as TagIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  mockOportunidades, type TagCRM, type Oportunidade,
  etapasCanonicas, etapaToCanonica, type EtapaCanonica, getDemanda,
} from "@/data/mockCRM";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const allTags: TagCRM[] = ["quente", "recorrente", "novo_cliente", "alto_potencial", "infantil", "adulto", "fitness", "urgente"];

// Mock indústrias / marcas — cicladas por id para popular a coluna.
const industriaPool = ["Brandili", "Hering", "Malwee", "Lupo", "Cia Marítima", "Colcci", "Rovitex"];
function industriaDe(op: Oportunidade): string {
  const idx = Math.abs(op.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0)) % industriaPool.length;
  return industriaPool[idx];
}

export default function VendedorOportunidades() {
  const navigate = useNavigate();
  const [view, setView] = useState<"kanban" | "lista">("kanban");
  const [search, setSearch] = useState("");
  const [showFunil, setShowFunil] = useState(false);
  const [showNova, setShowNova] = useState(false);
  const [filterTags, setFilterTags] = useState<TagCRM[]>([]);
  const [filterPrioridade, setFilterPrioridade] = useState<string>("");
  const [filterIndustrias, setFilterIndustrias] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleTag = (t: TagCRM) => setFilterTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  const toggleIndustria = (i: string) => setFilterIndustrias(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
  const toggleCollapse = (e: string) => setCollapsed(prev => ({ ...prev, [e]: !prev[e] }));

  const filtered = useMemo(() => mockOportunidades.filter(o => {
    if (search && !o.nome.toLowerCase().includes(search.toLowerCase()) && !o.clienteNome.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterTags.length > 0 && !filterTags.some(t => o.tags.includes(t))) return false;
    if (filterPrioridade && o.prioridade !== filterPrioridade) return false;
    if (filterIndustrias.length > 0 && !filterIndustrias.includes(industriaDe(o))) return false;
    return true;
  }), [search, filterTags, filterPrioridade, filterIndustrias]);

  const prioridadeDot: Record<string, string> = { alta: "bg-red-500", media: "bg-yellow-500", baixa: "bg-green-500" };
  const prioridadeLabel: Record<string, string> = { alta: "Alta", media: "Média", baixa: "Baixa" };

  const activeFilterCount = filterTags.length + (filterPrioridade ? 1 : 0) + filterIndustrias.length;

  const grupos = useMemo(() => etapasCanonicas.map(e => ({
    etapa: e.id,
    cor: e.cor,
    nome: e.nome,
    ops: filtered.filter(o => etapaToCanonica[o.etapa] === e.id),
  })), [filtered]);

  const industriaLabel = filterIndustrias.length === 0
    ? "Todas as indústrias"
    : filterIndustrias.length === 1 ? filterIndustrias[0] : `${filterIndustrias.length} indústrias`;

  // Layout grid columns shared by header + rows.
  const colGrid = "grid grid-cols-[minmax(220px,2fr)_minmax(160px,1.4fr)_minmax(160px,1.4fr)_120px_120px_120px] gap-3 items-center";

  return (
    <>
      <div className="p-4 md:p-6 space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-heading font-bold text-foreground">Oportunidades</h1>
            <p className="text-sm text-muted-foreground">Gerencie seu pipeline comercial</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowFunil(true)}>
              <Settings className="h-4 w-4 mr-1" /> <span className="hidden sm:inline">Configurar funil</span><span className="sm:hidden">Funil</span>
            </Button>
            <Button size="sm" onClick={() => setShowNova(true)}>
              <Plus className="h-4 w-4 mr-1" /> <span className="hidden sm:inline">Nova oportunidade</span><span className="sm:hidden">Nova</span>
            </Button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar oportunidade ou cliente..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
          </div>

          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="relative">
            <Filter className="h-4 w-4 mr-1" /> Filtros
            {activeFilterCount > 0 && (
              <Badge className="absolute -top-1.5 -right-1.5 h-4 w-4 p-0 flex items-center justify-center text-[9px]">{activeFilterCount}</Badge>
            )}
          </Button>

          <div className="flex items-center gap-2 ml-auto">
            <div className="flex items-center border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setView("kanban")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors ${view === "kanban" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted"}`}
              >
                <Kanban className="h-4 w-4" /> Kanban
              </button>
              <button
                onClick={() => setView("lista")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors ${view === "lista" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted"}`}
              >
                <List className="h-4 w-4" /> Lista
              </button>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Factory className="h-4 w-4 mr-1.5" /> {industriaLabel}
                  <ChevronDown className="h-3.5 w-3.5 ml-1.5 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Filtrar por indústria</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {industriaPool.map(i => (
                  <DropdownMenuCheckboxItem
                    key={i}
                    checked={filterIndustrias.includes(i)}
                    onCheckedChange={() => toggleIndustria(i)}
                    onSelect={e => e.preventDefault()}
                  >
                    {i}
                  </DropdownMenuCheckboxItem>
                ))}
                {filterIndustrias.length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setFilterIndustrias([])} className="text-xs text-muted-foreground">
                      <X className="h-3 w-3 mr-1.5" /> Limpar
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Filter bar */}
        {showFilters && (
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border flex-wrap">
            <span className="text-xs font-medium text-muted-foreground">Tags:</span>
            {allTags.map(tag => (
              <button key={tag} onClick={() => toggleTag(tag)} className={`transition-all ${filterTags.includes(tag) ? "ring-2 ring-accent/30 rounded-full" : "opacity-50 hover:opacity-100"}`}>
                <TagBadge tag={tag} size="sm" />
              </button>
            ))}
            <div className="w-px h-5 bg-border mx-1" />
            <span className="text-xs font-medium text-muted-foreground">Prioridade:</span>
            {["alta", "media", "baixa"].map(p => (
              <button
                key={p}
                onClick={() => setFilterPrioridade(filterPrioridade === p ? "" : p)}
                className={`text-xs px-2 py-0.5 rounded-full border transition-colors capitalize ${
                  filterPrioridade === p ? "bg-accent text-accent-foreground border-accent" : "border-border text-muted-foreground hover:border-accent/40"
                }`}
              >
                {p}
              </button>
            ))}
            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" className="text-xs ml-auto" onClick={() => { setFilterTags([]); setFilterPrioridade(""); setFilterIndustrias([]); }}>
                <X className="h-3 w-3 mr-1" /> Limpar filtros
              </Button>
            )}
          </div>
        )}

        {/* Content */}
        {view === "kanban" ? (
          <KanbanBoard searchQuery={search} filterTags={filterTags} filterPrioridade={filterPrioridade || undefined} />
        ) : (
          <div className="border border-border rounded-xl overflow-hidden bg-card">
            {/* Header */}
            <div className={`${colGrid} px-4 py-3 bg-muted/40 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wide`}>
              <div>Título</div>
              <div>Cliente</div>
              <div>Indústria</div>
              <div>Valor</div>
              <div>Prioridade</div>
              <div>Fechamento</div>
            </div>

            {/* Grupos por etapa */}
            <div className="divide-y divide-border">
              {grupos.map(({ etapa, cor, nome, ops }) => {
                const isCollapsed = collapsed[etapa];
                return (
                  <div key={etapa}>
                    {/* Cabeçalho do grupo */}
                    <button
                      type="button"
                      onClick={() => toggleCollapse(etapa)}
                      className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-muted/30 transition-colors text-left relative"
                      style={{ background: `linear-gradient(to right, ${cor}14, transparent 40%)` }}
                    >
                      <span className="absolute left-0 top-0 bottom-0 w-1" style={{ background: cor }} />
                      <div className="flex items-center gap-2 pl-2">
                        {isCollapsed ? <ChevronRight className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                        <span className="text-sm font-semibold text-foreground">{nome}</span>
                        <span
                          className="text-[11px] font-semibold rounded-full px-2 py-0.5"
                          style={{ background: `${cor}22`, color: cor }}
                        >
                          {ops.length}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setShowNova(true); }}
                        className="h-7 w-7 rounded-md flex items-center justify-center hover:bg-background border border-border text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Adicionar oportunidade"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </button>

                    {/* Linhas */}
                    {!isCollapsed && ops.map(op => {
                      const industria = industriaDe(op);
                      return (
                        <div
                          key={op.id}
                          onClick={() => navigate(`/vendedor/oportunidades/${op.id}`)}
                          className={`${colGrid} px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors border-t border-border/60`}
                        >
                          <div className="min-w-0">
                            <p className="font-medium text-sm text-primary truncate">{op.nome}</p>
                          </div>
                          <div className="text-sm text-foreground truncate">{op.clienteNome}</div>
                          <div className="min-w-0">
                            <p className="text-sm text-foreground truncate">{industria}</p>
                            <p className="text-[11px] text-muted-foreground flex items-center gap-1 truncate">
                              <TagIcon className="h-2.5 w-2.5" /> Marca · Todas as marcas
                            </p>
                          </div>
                          <div className="text-sm font-medium text-foreground">R$ {op.valorEstimado.toLocaleString("pt-BR")}</div>
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${prioridadeDot[op.prioridade]}`} />
                            <span className="text-sm">{prioridadeLabel[op.prioridade]}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">{op.previsaoFechamento || "—"}</div>
                        </div>
                      );
                    })}

                    {!isCollapsed && ops.length === 0 && (
                      <div className="px-4 py-4 text-xs text-muted-foreground italic border-t border-border/60">
                        Nenhuma oportunidade nesta etapa
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <FunilConfigModal open={showFunil} onOpenChange={setShowFunil} />
      <NovaOportunidadeModal open={showNova} onOpenChange={setShowNova} />
    </>
  );
}
