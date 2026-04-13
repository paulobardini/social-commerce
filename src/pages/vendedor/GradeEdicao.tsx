import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Breadcrumbs } from "@/components/vendedor/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  LayoutGrid,
  Eye,
  Send,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Shuffle,
} from "lucide-react";
import { mockCatalogoProdutos, type OrcamentoProduto } from "@/data/mockVendedor";
import { MontarGradeModal } from "@/components/vendedor/MontarGradeModal";

const ITEMS_PER_PAGE = 10;

export default function GradeEdicao() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [showMontarGrade, setShowMontarGrade] = useState(false);

  const products = mockCatalogoProdutos;
  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  const paged = products.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalPecas = products.reduce((s, p) => s + p.pecas, 0);
  const valorTotal = products.reduce((s, p) => s + p.valorTotal, 0);
  const valorMedio = totalPecas > 0 ? valorTotal / totalPecas : 0;

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Breadcrumb bar */}
        <div className="border-b border-border px-6 py-3 flex items-center justify-between shrink-0">
          <Breadcrumbs
            items={[
              { label: "Orçamentos", path: "/vendedor" },
              { label: "Editar Orçamento", path: "/vendedor/novo-orcamento" },
              { label: "Grade" },
            ]}
          />
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2 text-sm">
              <Eye className="h-4 w-4" />
              Visualizar orçamento
            </Button>
            <Button variant="outline" size="sm" className="text-sm">
              Enviar orçamento
            </Button>
          </div>
        </div>

        {/* Summary bar */}
        <div className="border-b border-border px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-6 text-sm">
            <span className="font-semibold text-foreground">Orçamento 13/04/2026 09:43</span>
            <span className="text-muted-foreground">
              Tipo de estoque: <span className="text-foreground">Pronta entrega / Programado</span>
            </span>
            <span className="text-muted-foreground">
              Peças: <span className="font-semibold text-foreground">{totalPecas}</span>
            </span>
            <span className="text-muted-foreground">
              Valor médio: <span className="font-semibold text-foreground">R$ {valorMedio.toFixed(2).replace(".", ",")}</span>
            </span>
            <span className="text-muted-foreground">
              Total: <span className="font-bold text-foreground">R$ {valorTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
            </span>
          </div>
          <Button
            onClick={() => setShowMontarGrade(true)}
            className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            Distribuir grade
          </Button>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-card z-10">
              <tr className="border-b border-border">
                <th className="text-left px-6 py-3 text-sm font-semibold text-muted-foreground">Foto</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-muted-foreground">Referência</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-muted-foreground">Produto/Kit</th>
                <th className="text-center px-4 py-3 text-sm font-semibold text-muted-foreground">Peças</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-muted-foreground">Tamanho</th>
                <th className="text-center px-4 py-3 text-sm font-semibold text-muted-foreground">Grade</th>
                <th className="text-right px-4 py-3 text-sm font-semibold text-muted-foreground">Preço unit.</th>
                <th className="text-right px-4 py-3 text-sm font-semibold text-muted-foreground">Valor total</th>
                <th className="text-center px-6 py-3 text-sm font-semibold text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-border hover:bg-muted/50 transition-colors"
                >
                  <td className="px-6 py-3">
                    <div className="h-12 w-12 rounded-lg overflow-hidden bg-muted">
                      <img src={product.image} alt="" className="w-full h-full object-cover" />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground font-medium">{product.ref}</td>
                  <td className="px-4 py-3 text-sm text-foreground">{product.nome}</td>
                  <td className="px-4 py-3 text-sm text-center text-foreground">{product.pecas}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {product.tamanhos.join(" / ")}
                  </td>
                  <td className="px-4 py-3 text-sm text-center text-muted-foreground">{product.grade}</td>
                  <td className="px-4 py-3 text-sm text-right text-foreground">
                    R$ {product.preco.toFixed(2).replace(".", ",")}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-semibold text-foreground">
                    R$ {product.valorTotal.toFixed(2).replace(".", ",")}
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                        <LayoutGrid className="h-4 w-4" />
                      </button>
                      <button className="h-8 w-8 rounded-lg flex items-center justify-center text-destructive hover:bg-destructive/10 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-border px-6 py-3 flex items-center justify-center gap-1 shrink-0">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="h-9 w-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: Math.min(3, totalPages) }, (_, i) => i + 1).map((p) => (
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
            {totalPages > 4 && <span className="text-muted-foreground px-1">...</span>}
            {totalPages > 3 && (
              <button
                onClick={() => setCurrentPage(totalPages)}
                className={`h-9 w-9 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
                  currentPage === totalPages
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {totalPages}
              </button>
            )}
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

      {showMontarGrade && (
        <MontarGradeModal
          products={products}
          onClose={() => setShowMontarGrade(false)}
        />
      )}
    </>
  );
}
