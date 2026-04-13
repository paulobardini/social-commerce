import { useState } from "react";
import { X, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type OrcamentoProduto } from "@/data/mockVendedor";

interface MontarGradeModalProps {
  products: OrcamentoProduto[];
  onClose: () => void;
}

export function MontarGradeModal({ products, onClose }: MontarGradeModalProps) {
  const [gradeData, setGradeData] = useState<
    Record<string, { quantities: Record<string, number>; grades: number }>
  >(
    Object.fromEntries(
      products.map((p) => [
        p.id,
        {
          quantities: Object.fromEntries(p.tamanhos.map((t) => [t, 1])),
          grades: 1,
        },
      ])
    )
  );

  const [distributeValue, setDistributeValue] = useState("");

  const totalPecas = products.reduce((sum, p) => {
    const data = gradeData[p.id];
    if (!data) return sum;
    const pcsPerGrade = Object.values(data.quantities).reduce((a, b) => a + b, 0);
    return sum + pcsPerGrade * data.grades;
  }, 0);

  const precoMedio =
    totalPecas > 0
      ? products.reduce((sum, p) => {
          const data = gradeData[p.id];
          if (!data) return sum;
          const pcsPerGrade = Object.values(data.quantities).reduce((a, b) => a + b, 0);
          return sum + p.preco * pcsPerGrade * data.grades;
        }, 0) / totalPecas
      : 0;

  const totalFinal = products.reduce((sum, p) => {
    const data = gradeData[p.id];
    if (!data) return sum;
    const pcsPerGrade = Object.values(data.quantities).reduce((a, b) => a + b, 0);
    return sum + p.preco * pcsPerGrade * data.grades;
  }, 0);

  const handleDistribute = () => {
    const val = parseInt(distributeValue);
    if (isNaN(val) || val <= 0) return;
    // distribute evenly to first product as demo
    const newData = { ...gradeData };
    products.forEach((p) => {
      const perSize = Math.floor(val / p.tamanhos.length);
      const remainder = val % p.tamanhos.length;
      newData[p.id] = {
        ...newData[p.id],
        quantities: Object.fromEntries(
          p.tamanhos.map((t, i) => [t, perSize + (i < remainder ? 1 : 0)])
        ),
      };
    });
    setGradeData(newData);
  };

  const updateQuantity = (productId: string, size: string, value: number) => {
    setGradeData((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        quantities: {
          ...prev[productId].quantities,
          [size]: Math.max(0, value),
        },
      },
    }));
  };

  const updateGrades = (productId: string, value: number) => {
    setGradeData((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        grades: Math.max(1, value),
      },
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-[720px] max-h-[85vh] flex flex-col mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div>
            <h2 className="text-lg font-bold text-foreground">Montar grade</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Nesse estilo de grade você pode ajustar os tamanhos, quantidade e variantes.
            </p>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Summary */}
        <div className="px-6 py-3 border-b border-border shrink-0 space-y-0.5">
          <p className="text-sm text-foreground">
            Preço médio: <span className="font-semibold">R$ {precoMedio.toFixed(2).replace(".", ",")}</span>
          </p>
          <p className="text-sm text-foreground">
            Total final: <span className="font-bold">R$ {totalFinal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
          </p>
        </div>

        {/* Distribute control */}
        <div className="px-6 py-3 border-b border-border shrink-0">
          <p className="text-sm font-medium text-foreground mb-2">Total de peças</p>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={0}
              placeholder={`Min. ${totalPecas} peças (grades fechadas)`}
              value={distributeValue}
              onChange={(e) => setDistributeValue(e.target.value)}
              className="h-9 text-sm flex-1"
            />
            <Button variant="outline" size="sm" onClick={handleDistribute} className="gap-2 text-sm shrink-0">
              <Shuffle className="h-4 w-4" />
              Distribuir
            </Button>
          </div>
        </div>

        {/* Products grid */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {products.slice(0, 8).map((product) => {
            const data = gradeData[product.id];
            if (!data) return null;
            const productTotal = Object.values(data.quantities).reduce((a, b) => a + b, 0) * data.grades;

            return (
              <div key={product.id}>
                <p className="text-sm font-semibold text-foreground mb-2">
                  {product.nome} - Ref: {product.ref}
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        <th className="text-left py-1 pr-4 font-medium text-muted-foreground">Tamanho</th>
                        {product.tamanhos.map((t) => (
                          <th key={t} className="text-center py-1 px-3 font-semibold text-accent">{t}</th>
                        ))}
                        <th className="text-center py-1 px-3 font-medium text-muted-foreground">Qtd grades</th>
                        <th className="text-center py-1 px-3 font-medium text-muted-foreground">Total peças</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="py-1 pr-4 text-sm text-foreground font-medium">Quantidade</td>
                        {product.tamanhos.map((t) => (
                          <td key={t} className="py-1 px-2 text-center">
                            <Input
                              type="number"
                              min={0}
                              value={data.quantities[t] || 0}
                              onChange={(e) =>
                                updateQuantity(product.id, t, parseInt(e.target.value) || 0)
                              }
                              className="h-8 w-14 text-center text-sm mx-auto"
                            />
                          </td>
                        ))}
                        <td className="py-1 px-2 text-center">
                          <Input
                            type="number"
                            min={1}
                            value={data.grades}
                            onChange={(e) =>
                              updateGrades(product.id, parseInt(e.target.value) || 1)
                            }
                            className="h-8 w-14 text-center text-sm mx-auto border-accent"
                          />
                        </td>
                        <td className="py-1 px-3 text-center font-semibold text-foreground">
                          {productTotal}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t border-border px-6 py-4 flex items-center justify-end shrink-0">
          <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
            Salvar
          </Button>
        </div>
      </div>
    </div>
  );
}
