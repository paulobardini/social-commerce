import { useState } from "react";
import { KanbanBoard } from "@/components/vendedor/KanbanBoard";
import { FunilConfigModal } from "@/components/vendedor/FunilConfigModal";
import { NovaOportunidadeModal } from "@/components/vendedor/NovaOportunidadeModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { TagBadge } from "@/components/vendedor/TagBadge";
import {
  Plus, Settings, Search, Kanban, List, Filter, X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  mockOportunidades, etapaMap, tagLabels, tagColors, type TagCRM, type OportunidadeEtapa,
} from "@/data/mockCRM";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";

const allTags: TagCRM[] = ["quente", "recorrente", "novo_cliente", "alto_potencial", "infantil", "adulto", "fitness", "urgente"];

export default function VendedorOportunidades() {
  const navigate = useNavigate();
  const [view, setView] = useState<"kanban" | "lista">("kanban");
  const [search, setSearch] = useState("");
  const [showFunil, setShowFunil] = useState(false);
  const [showNova, setShowNova] = useState(false);
  const [filterTags, setFilterTags] = useState<TagCRM[]>([]);
  const [filterPrioridade, setFilterPrioridade] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  const toggleTag = (t: TagCRM) => setFilterTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  const filtered = mockOportunidades.filter(o => {
    if (search && !o.nome.toLowerCase().includes(search.toLowerCase()) && !o.clienteNome.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterTags.length > 0 && !filterTags.some(t => o.tags.includes(t))) return false;
    if (filterPrioridade && o.prioridade !== filterPrioridade) return false;
    return true;
  });

  const prioridadeDot: Record<string, string> = { alta: "bg-red-500", media: "bg-yellow-500", baixa: "bg-green-500" };
  const etapaDot: Record<string, string> = {
    novo_lead: "bg-slate-400", contato_iniciado: "bg-blue-400", em_qualificacao: "bg-purple-400",
    proposta_construcao: "bg-yellow-400", orcamento_enviado: "bg-orange-400", em_negociacao: "bg-orange-500",
    ganho: "bg-green-500", perdido: "bg-red-500",
  };

  const activeFilterCount = filterTags.length + (filterPrioridade ? 1 : 0);

  return (
    <>
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-heading font-bold text-foreground">Oportunidades</h1>
            <p className="text-sm text-muted-foreground">Gerencie seu pipeline comercial</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowFunil(true)}>
              <Settings className="h-4 w-4 mr-1" /> Configurar funil
            </Button>
            <Button size="sm" onClick={() => setShowNova(true)}>
              <Plus className="h-4 w-4 mr-1" /> Nova oportunidade
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

          <div className="flex items-center border border-border rounded-lg overflow-hidden ml-auto">
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
              <Button variant="ghost" size="sm" className="text-xs ml-auto" onClick={() => { setFilterTags([]); setFilterPrioridade(""); }}>
                <X className="h-3 w-3 mr-1" /> Limpar filtros
              </Button>
            )}
          </div>
        )}

        {/* Content */}
        {view === "kanban" ? (
          <KanbanBoard searchQuery={search} filterTags={filterTags} filterPrioridade={filterPrioridade || undefined} />
        ) : (
          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Oportunidade</TableHead>
                  <TableHead className="font-semibold">Cliente</TableHead>
                  <TableHead className="font-semibold">Etapa</TableHead>
                  <TableHead className="font-semibold">Valor</TableHead>
                  <TableHead className="font-semibold">Prioridade</TableHead>
                  <TableHead className="font-semibold">Última interação</TableHead>
                  <TableHead className="font-semibold">Tags</TableHead>
                  <TableHead className="font-semibold w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(op => (
                  <TableRow key={op.id} className="cursor-pointer hover:bg-muted/30" onClick={() => navigate(`/vendedor/oportunidades/${op.id}`)}>
                    <TableCell className="font-medium">{op.nome}</TableCell>
                    <TableCell className="text-muted-foreground">{op.clienteNome}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${etapaDot[op.etapa]}`} />
                        <span className="text-sm">{etapaMap[op.etapa]}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">R$ {op.valorEstimado.toLocaleString("pt-BR")}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${prioridadeDot[op.prioridade]}`} />
                        <span className="capitalize text-sm">{op.prioridade}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{op.ultimaInteracao}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {op.tags.slice(0, 2).map(tag => <TagBadge key={tag} tag={tag} />)}
                        {op.tags.length > 2 && <span className="text-[10px] text-muted-foreground">+{op.tags.length - 2}</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/vendedor/oportunidades/${op.id}`)}><Eye className="h-4 w-4 mr-2" /> Ver detalhe</DropdownMenuItem>
                          <DropdownMenuItem><Edit className="h-4 w-4 mr-2" /> Editar</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive"><Trash2 className="h-4 w-4 mr-2" /> Excluir</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">Nenhuma oportunidade encontrada</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <FunilConfigModal open={showFunil} onOpenChange={setShowFunil} />
      <NovaOportunidadeModal open={showNova} onOpenChange={setShowNova} />
    </>
  );
}
