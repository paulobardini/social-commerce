import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Breadcrumbs } from "@/components/vendedor/Breadcrumbs";
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
  Plus,
  Search,
  SlidersHorizontal,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { mockOrcamentos, type Orcamento } from "@/data/mockVendedor";

const statusTabs = [
  { key: "ativo", label: "Ativos" },
  { key: "revisao_lojista", label: "Revisão Lojista" },
  { key: "revisao_comercial", label: "Revisão comercial" },
  { key: "aprovado_parcial", label: "Aprovado parcialmente" },
  { key: "aprovado", label: "Aprovados" },
  { key: "recusado", label: "Recusados" },
];

const ITEMS_PER_PAGE = 10;

export default function VendedorOrcamentos() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("ativo");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recentes");
  const [currentPage, setCurrentPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = mockOrcamentos.filter((o) => o.status === activeTab);
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (o) =>
          o.nome.toLowerCase().includes(q) ||
          o.lojista?.toLowerCase().includes(q) ||
          o.marcas.some((m) => m.toLowerCase().includes(q))
      );
    }
    if (sortBy === "recentes") {
      list = [...list].sort((a, b) => b.dataCriacao.localeCompare(a.dataCriacao));
    }
    return list;
  }, [activeTab, searchTerm, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paged = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const formatValue = (val: number | null) => {
    if (!val) return "—";
    return `R$ ${val.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
  };

  return (
    <>
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
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
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
                <th className="text-left px-6 py-3.5 text-sm font-semibold text-foreground">Data criação</th>
                <th className="text-right px-6 py-3.5 text-sm font-semibold text-foreground">Valor total</th>
                <th className="text-center px-6 py-3.5 text-sm font-semibold text-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-sm text-muted-foreground">
                    Nenhum orçamento encontrado
                  </td>
                </tr>
              ) : (
                paged.map((orc) => (
                  <tr
                    key={orc.id}
                    className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors cursor-pointer group"
                    onClick={() => navigate(`/vendedor/orcamento/${orc.id}`)}
                  >
                    <td className="px-6 py-4 text-sm text-foreground">{orc.nome}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{orc.lojista || "—"}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {orc.marcas.length > 0 ? orc.marcas.join(", ") : "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{orc.dataCriacao}</td>
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
                          <div className="absolute right-0 top-full mt-1 z-20 bg-card rounded-lg border border-border shadow-lg py-1 w-40">
                            <button className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                              Editar
                            </button>
                            <button className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                              Duplicar
                            </button>
                            <button className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                              Visualizar PDF
                            </button>
                            <button className="w-full text-left px-3 py-2 text-sm text-destructive hover:bg-muted transition-colors">
                              Excluir
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
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
    </>
  );
}
