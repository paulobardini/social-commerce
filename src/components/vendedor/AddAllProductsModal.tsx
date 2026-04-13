import { useState } from "react";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  resumoPorTipo,
  resumoPorSexo,
  resumoPorTamanho,
  type OrcamentoProduto,
} from "@/data/mockVendedor";

interface AddAllProductsModalProps {
  products: OrcamentoProduto[];
  onClose: () => void;
}

export function AddAllProductsModal({ products, onClose }: AddAllProductsModalProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>(
    Object.fromEntries(products.map((p) => [p.id, 1]))
  );

  const totalProdutos = products.length;
  const totalPecas = products.reduce((sum, p) => sum + p.pecas * (quantities[p.id] || 1), 0);
  const precoMedio = totalPecas > 0
    ? products.reduce((sum, p) => sum + p.preco * p.pecas * (quantities[p.id] || 1), 0) / totalPecas
    : 0;
  const valorTotal = products.reduce(
    (sum, p) => sum + p.preco * p.pecas * (quantities[p.id] || 1),
    0
  );

  const updateQty = (id: string, delta: number) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 1) + delta),
    }));
  };

  const removeProduct = (id: string) => {
    setQuantities((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const activeProducts = products.filter((p) => quantities[p.id] !== undefined);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-[780px] max-h-[85vh] flex flex-col mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <h2 className="text-lg font-bold text-foreground">Adicionar todos os produtos</h2>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Summary tables */}
          <div className="grid grid-cols-3 gap-4">
            {/* Por tipo */}
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="px-3 py-2 bg-muted/50 border-b border-border">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">Por tipo de produto</h3>
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-3 py-1.5 font-semibold text-muted-foreground">Tipo</th>
                    <th className="text-right px-2 py-1.5 font-semibold text-muted-foreground">Qtd</th>
                    <th className="text-right px-2 py-1.5 font-semibold text-muted-foreground">Peças</th>
                    <th className="text-right px-2 py-1.5 font-semibold text-muted-foreground">%</th>
                    <th className="text-right px-3 py-1.5 font-semibold text-muted-foreground">Preço Médio</th>
                  </tr>
                </thead>
                <tbody>
                  {resumoPorTipo.map((r) => (
                    <tr key={r.tipo} className="border-b border-border last:border-0">
                      <td className="px-3 py-1.5 font-medium text-foreground">{r.tipo}</td>
                      <td className="px-2 py-1.5 text-right text-muted-foreground">{r.qtd}</td>
                      <td className="px-2 py-1.5 text-right text-muted-foreground">{r.pecas}</td>
                      <td className="px-2 py-1.5 text-right text-muted-foreground">{r.pct}</td>
                      <td className="px-3 py-1.5 text-right font-semibold text-foreground">
                        R$ {r.precoMedio.toFixed(2).replace(".", ",")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Por sexo */}
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="px-3 py-2 bg-muted/50 border-b border-border">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">Por sexo</h3>
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-3 py-1.5 font-semibold text-muted-foreground">Sexo</th>
                    <th className="text-right px-2 py-1.5 font-semibold text-muted-foreground">Qtd</th>
                    <th className="text-right px-2 py-1.5 font-semibold text-muted-foreground">Peças</th>
                    <th className="text-right px-2 py-1.5 font-semibold text-muted-foreground">%</th>
                    <th className="text-right px-3 py-1.5 font-semibold text-muted-foreground">Preço Médio</th>
                  </tr>
                </thead>
                <tbody>
                  {resumoPorSexo.map((r) => (
                    <tr key={r.sexo} className="border-b border-border last:border-0">
                      <td className="px-3 py-1.5 font-medium text-foreground">{r.sexo}</td>
                      <td className="px-2 py-1.5 text-right text-muted-foreground">{r.qtd}</td>
                      <td className="px-2 py-1.5 text-right text-muted-foreground">{r.pecas}</td>
                      <td className="px-2 py-1.5 text-right text-muted-foreground">{r.pct}</td>
                      <td className="px-3 py-1.5 text-right font-semibold text-foreground">
                        R$ {r.precoMedio.toFixed(2).replace(".", ",")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Por tamanho */}
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="px-3 py-2 bg-muted/50 border-b border-border">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">Por tamanho</h3>
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-3 py-1.5 font-semibold text-muted-foreground">Tamanho</th>
                    <th className="text-right px-2 py-1.5 font-semibold text-muted-foreground">Peças</th>
                    <th className="text-right px-3 py-1.5 font-semibold text-muted-foreground">%</th>
                  </tr>
                </thead>
                <tbody>
                  {resumoPorTamanho.map((r) => (
                    <tr key={r.tamanho} className="border-b border-border last:border-0">
                      <td className="px-3 py-1.5 font-medium text-foreground">{r.tamanho}</td>
                      <td className="px-2 py-1.5 text-right text-muted-foreground">{r.pecas}</td>
                      <td className="px-3 py-1.5 text-right text-muted-foreground">{r.pct}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Products list */}
          <div>
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wide mb-3">
              Produtos/Kits ({activeProducts.length})
            </h3>
            <div className="space-y-2">
              {activeProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 py-2 border-b border-border last:border-0"
                >
                  <div className="h-10 w-10 rounded-lg overflow-hidden bg-muted shrink-0">
                    <img src={product.image} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{product.nome}</p>
                    <p className="text-xs text-muted-foreground">
                      {product.ref} · {product.categoria} · {product.genero}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => updateQty(product.id, -1)}
                      className="h-7 w-7 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="text-sm font-medium text-foreground w-6 text-center">
                      {quantities[product.id] || 0}
                    </span>
                    <button
                      onClick={() => updateQty(product.id, 1)}
                      className="h-7 w-7 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="text-right shrink-0 w-20">
                    <p className="text-[10px] text-muted-foreground">
                      {product.pecas * (quantities[product.id] || 1)} pç
                    </p>
                    <p className="text-xs font-semibold text-foreground">
                      R$ {(product.preco * product.pecas * (quantities[product.id] || 1)).toFixed(2).replace(".", ",")}
                    </p>
                  </div>
                  <button
                    onClick={() => removeProduct(product.id)}
                    className="h-7 w-7 rounded-md flex items-center justify-center text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border px-6 py-4 flex items-center justify-between shrink-0">
          <p className="text-sm text-muted-foreground">
            {activeProducts.length} prod · {totalPecas} pç · Média: R$ {precoMedio.toFixed(2).replace(".", ",")}
          </p>
          <div className="flex items-center gap-4">
            <p className="text-lg font-bold text-foreground">
              R$ {valorTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
            <Button className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground">
              <Layers className="h-4 w-4" />
              Adicionar ao orçamento
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
