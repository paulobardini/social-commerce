import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus, Search, SlidersHorizontal, MoreVertical,
  ChevronLeft, ChevronRight, ChevronDown, ChevronRight as ChevRight,
  Layers, Copy,
} from "lucide-react";
import { mockOrcamentos, type Orcamento } from "@/data/mockVendedor";
import { toast } from "sonner";

const statusTabs = [
  { key: "ativo", label: "Ativos" },
  { key: "revisao_lojista", label: "Revisão Lojista" },
  { key: "revisao_comercial", label: "Revisão comercial" },
  { key: "aprovado_parcial", label: "Aprovado parcialmente" },
  { key: "aprovado", label: "Aprovados" },
  { key: "recusado", label: "Recusados" },
];

const ITEMS_PER_PAGE = 10;

interface OrcamentoGroup {
  nomeBase: string;
  latest: Orcamento;
  versions: Orcamento[]; // ordered desc by version
}

export default function VendedorOrcamentos() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("ativo");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recentes");
  const [currentPage, setCurrentPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  // Local mutable list to support "duplicate as new version"
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>(mockOrcamentos);

  const filtered = useMemo(() => {
    let list = orcamentos.filter((o) => o.status === activeTab);
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (o) =>
          o.nome.toLowerCase().includes(q) ||
          o.lojista?.toLowerCase().includes(q) ||
          o.marcas.some((m) => m.toLowerCase().includes(q))
      );
    }
    return list;
  }, [orcamentos, activeTab, searchTerm]);

  // Group by nomeBase
  const groups = useMemo<OrcamentoGroup[]>(() => {
    const map = new Map<string, Orcamento[]>();
    filtered.forEach((o) => {
      const key = o.nomeBase || o.nome;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(o);
    });
    const result: OrcamentoGroup[] = Array.from(map.entries()).map(([nomeBase, versions]) => {
      const sorted = [...versions].sort((a, b) => (b.versao ?? 1) - (a.versao ?? 1));
      return { nomeBase, latest: sorted[0], versions: sorted };
    });
    if (sortBy === "recentes") {
      result.sort((a, b) => b.latest.dataCriacao.localeCompare(a.latest.dataCriacao));
    } else if (sortBy === "valor") {
      result.sort((a, b) => (b.latest.valorTotal ?? 0) - (a.latest.valorTotal ?? 0));
    } else if (sortBy === "nome") {
      result.sort((a, b) => a.nomeBase.localeCompare(b.nomeBase));
    }
    return result;
  }, [filtered, sortBy]);

  const totalPages = Math.max(1, Math.ceil(groups.length / ITEMS_PER_PAGE));
  const paged = groups.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const formatValue = (val: number | null) => {
    if (!val) return "—";
    return `R$ ${val.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
  };

  const toggleGroup = (key: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const duplicarComoNovaVersao = (orc: Orcamento) => {
    const base = orc.nomeBase || orc.nome.replace(/ — v\d+$/, "");
    const existingVersions = orcamentos.filter(o => (o.nomeBase || o.nome) === base);
    const nextVersion = Math.max(...existingVersions.map(o => o.versao ?? 1)) + 1;
    const today = new Date().toLocaleDateString("pt-BR");
    const novo: Orcamento = {
      ...orc,
      id: `dup-${Date.now()}`,
      nome: `${base} — v${nextVersion}`,
      nomeBase: base,
      versao: nextVersion,
      dataCriacao: today,
      status: "ativo",
    };
    setOrcamentos((prev) => [novo, ...prev]);
    toast.success(`Nova versão criada: ${novo.nome}`);
    setOpenMenuId(null);
    // Auto-expand the group so the user sees siblings
    setExpandedGroups((prev) => new Set(prev).add(base));
  };

  const renderRow = (orc: Orcamento, isVersion = false) => (
    <tr
      key={orc.id}
      className={`border-b border-border last:border-0 hover:bg-muted/50 transition-colors cursor-pointer group ${
        isVersion ? "bg-muted/20" : ""
      }`}
      onClick={() => navigate(`/vendedor/orcamento/${orc.id}`)}
    >
      <td className="px-6 py-4">
        <div className={`flex items-center gap-2 ${isVersion ? "pl-8" : ""}`}>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{orc.nomeBase || orc.nome}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{orc.dataCriacao}</p>
          </div>
          {orc.versao && (
            <Badge variant="secondary" className="text-[10px] shrink-0">
              v{orc.versao}
            </Badge>
          )}
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-muted-foreground">{orc.lojista || "—"}</td>
      <td className="px-6 py-4 text-sm text-muted-foreground">
        {orc.marcas.length > 0 ? orc.marcas.join(", ") : "—"}
      </td>
      <td className="px-6 py-4 text-sm text-right font-medium text-foreground">
        {formatValue(orc.valorTotal)}
      </td>
      <td className="px-6 py-4 text-center">
        <div className="relative inline-block">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpenMenuId(openMenuId === orc.id ? null : orc.id);
            }}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          {openMenuId === orc.id && (
            <div
              className="absolute right-0 top-full mt-1 z-20 bg-card rounded-lg border border-border shadow-lg py-1 w-56"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => navigate(`/vendedor/orcamento/${orc.id}`)}
                className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
              >
                Visualizar
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                Editar
              </button>
              <button
                onClick={() => duplicarComoNovaVersao(orc)}
                className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors flex items-center gap-2"
              >
                <Copy className="h-3.5 w-3.5" />
                Duplicar como nova versão
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-destructive hover:bg-muted transition-colors">
                Excluir
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-foreground font-heading">Orçamentos</h1>
        <Button
          onClick={() => navigate("/vendedor/novo-orcamento")}
          className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <Plus className="h-4 w-4" />
          Novo orçamento
        </Button>
      </div>

      {/* Tabs + Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-0 overflow-x-auto">
          {statusTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="h-9 w-[160px] text-sm">
              <SelectValue placeholder="Mais recentes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recentes">Mais recentes</SelectItem>
              <SelectItem value="valor">Maior valor</SelectItem>
              <SelectItem value="nome">Nome A-Z</SelectItem>
            </SelectContent>
          </Select>

          <button className="h-9 w-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <SlidersHorizontal className="h-4 w-4" />
          </button>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 w-[180px] text-sm"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-6 py-3.5 text-sm font-semibold text-foreground">Nome do orçamento</th>
              <th className="text-left px-6 py-3.5 text-sm font-semibold text-foreground">Lojista</th>
              <th className="text-left px-6 py-3.5 text-sm font-semibold text-foreground">Marcas</th>
              <th className="text-right px-6 py-3.5 text-sm font-semibold text-foreground">Valor total</th>
              <th className="text-center px-6 py-3.5 text-sm font-semibold text-foreground w-20">Ações</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center text-sm text-muted-foreground">
                  Nenhum orçamento encontrado
                </td>
              </tr>
            ) : (
              paged.map((group) => {
                const isExpanded = expandedGroups.has(group.nomeBase);
                const hasMultipleVersions = group.versions.length > 1;
                return (
                  <>
                    <tr
                      key={group.latest.id}
                      className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors cursor-pointer group"
                      onClick={() => navigate(`/vendedor/orcamento/${group.latest.id}`)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {hasMultipleVersions ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleGroup(group.nomeBase);
                              }}
                              className="h-6 w-6 rounded flex items-center justify-center text-muted-foreground hover:bg-muted shrink-0"
                              title={isExpanded ? "Recolher versões" : "Ver versões anteriores"}
                            >
                              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevRight className="h-4 w-4" />}
                            </button>
                          ) : (
                            <div className="w-6 shrink-0" />
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">{group.nomeBase}</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">{group.latest.dataCriacao}</p>
                          </div>
                          {group.latest.versao && (
                            <Badge variant="secondary" className="text-[10px] shrink-0">
                              v{group.latest.versao}
                            </Badge>
                          )}
                          {hasMultipleVersions && (
                            <Badge variant="outline" className="text-[10px] shrink-0 gap-1">
                              <Layers className="h-2.5 w-2.5" />
                              {group.versions.length} versões
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{group.latest.lojista || "—"}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {group.latest.marcas.length > 0 ? group.latest.marcas.join(", ") : "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-right font-medium text-foreground">
                        {formatValue(group.latest.valorTotal)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="relative inline-block">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === group.latest.id ? null : group.latest.id);
                            }}
                            className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                          {openMenuId === group.latest.id && (
                            <div
                              className="absolute right-0 top-full mt-1 z-20 bg-card rounded-lg border border-border shadow-lg py-1 w-56"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={() => navigate(`/vendedor/orcamento/${group.latest.id}`)}
                                className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                              >
                                Visualizar
                              </button>
                              <button className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                                Editar
                              </button>
                              <button
                                onClick={() => duplicarComoNovaVersao(group.latest)}
                                className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors flex items-center gap-2"
                              >
                                <Copy className="h-3.5 w-3.5" />
                                Duplicar como nova versão
                              </button>
                              <button className="w-full text-left px-3 py-2 text-sm text-destructive hover:bg-muted transition-colors">
                                Excluir
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                    {isExpanded &&
                      group.versions.slice(1).map((v) => renderRow(v, true))}
                  </>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="h-9 w-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setCurrentPage(p)}
              className={`h-9 w-9 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
                currentPage === p
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="h-9 w-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
