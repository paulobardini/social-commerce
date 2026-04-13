import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Eye,
  Edit3,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import { mockClientes } from "@/data/mockVendedor";

const ITEMS_PER_PAGE = 10;

export default function VendedorCarteira() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    if (!searchTerm) return mockClientes;
    const q = searchTerm.toLowerCase();
    return mockClientes.filter(
      (c) =>
        c.nome.toLowerCase().includes(q) ||
        c.documento.includes(q) ||
        c.cidade.toLowerCase().includes(q)
    );
  }, [searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paged = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground font-heading">Carteira</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 h-9 w-[200px] text-sm"
            />
          </div>
        </div>

        <Button className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground">
          <Plus className="h-4 w-4" />
          Pré-cadastro lojista
        </Button>

        {/* Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-6 py-3.5 text-sm font-semibold text-foreground">Nome</th>
                <th className="text-left px-6 py-3.5 text-sm font-semibold text-foreground">Documento</th>
                <th className="text-left px-6 py-3.5 text-sm font-semibold text-foreground">Cidade</th>
                <th className="text-left px-6 py-3.5 text-sm font-semibold text-foreground">Tipo</th>
                <th className="text-center px-6 py-3.5 text-sm font-semibold text-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-sm text-muted-foreground">
                    Nenhum cliente encontrado
                  </td>
                </tr>
              ) : (
                paged.map((cliente) => (
                  <tr
                    key={cliente.id}
                    className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-foreground">{cliente.nome}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{cliente.documento}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{cliente.cidade}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{cliente.tipo}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-accent hover:bg-muted transition-colors">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-accent hover:bg-muted transition-colors">
                          <Edit3 className="h-4 w-4" />
                        </button>
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
