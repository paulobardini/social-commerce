import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { CheckCircle } from "lucide-react";

const mockPolicies = [
  {
    id: "cdka-inv26-sul",
    name: "CDKA - INV 26 - SUL/SUD/CO",
    saleType: "apolo",
    commission: "20% sob comissão",
    defaultDiscount: "19% prazo / 22% à vista",
    paymentTerms: "Boleto 75D",
    gridType: "Fechada",
    minOrderFreight: 2500,
    billingPeriod: "01/03 - 30/06",
    notes: "Pedido mínimo de R$ 2.500 para frete grátis. Válido para regiões Sul, Sudeste e Centro-Oeste.",
  },
  {
    id: "cdka-inv26-nne",
    name: "CDKA - INV 26 - N/NE",
    saleType: "apolo",
    commission: "22% sob comissão",
    defaultDiscount: "17% prazo / 20% à vista",
    paymentTerms: "Boleto 90D",
    gridType: "Fechada",
    minOrderFreight: 2000,
    billingPeriod: "01/03 - 30/06",
    notes: "Condição especial para Norte e Nordeste. Frete CIF acima do pedido mínimo.",
  },
  {
    id: "cdka-ver26",
    name: "CDKA - VER 26 - NACIONAL",
    saleType: "direta",
    commission: "—",
    defaultDiscount: "15% prazo / 18% à vista",
    paymentTerms: "Boleto 60D",
    gridType: "Aberta",
    minOrderFreight: 3000,
    billingPeriod: "01/07 - 30/10",
    notes: "Coleção verão com grade aberta. Disponível para todo o Brasil.",
  },
];

interface CommercialPolicyModalProps {
  open: boolean;
  onClose: () => void;
}

export const CommercialPolicyModal = ({ open, onClose }: CommercialPolicyModalProps) => {
  const [saleType, setSaleType] = useState("apolo");
  const [selectedPolicyId, setSelectedPolicyId] = useState(mockPolicies[0].id);

  const filteredPolicies = mockPolicies.filter((p) => p.saleType === saleType);
  const selected = mockPolicies.find((p) => p.id === selectedPolicyId) || filteredPolicies[0];

  const handleSaleTypeChange = (val: string) => {
    setSaleType(val);
    const first = mockPolicies.find((p) => p.saleType === val);
    if (first) setSelectedPolicyId(first.id);
  };

  const rows = selected
    ? [
        { label: "Comissionamento", value: selected.commission },
        { label: "Desconto padrão", value: selected.defaultDiscount },
        { label: "Prazo de pagamento", value: selected.paymentTerms },
        { label: "Tipo de grade", value: selected.gridType },
        { label: "Pedido mín. frete", value: `R$ ${selected.minOrderFreight.toLocaleString("pt-BR")}` },
        { label: "Período faturamento", value: selected.billingPeriod },
      ]
    : [];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Política Comercial</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Sale type */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Tipo de Venda</label>
            <Select value={saleType} onValueChange={handleSaleTypeChange}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="apolo">Venda Apolo</SelectItem>
                <SelectItem value="direta">Venda Direta</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Policy select */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Política</label>
            <Select value={selectedPolicyId} onValueChange={setSelectedPolicyId}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {filteredPolicies.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Policy details */}
          {selected && (
            <div className="rounded-lg border border-border overflow-hidden">
              {rows.map((row, i) => (
                <div
                  key={row.label}
                  className={`flex items-center justify-between px-3 py-2.5 text-sm ${
                    i % 2 === 0 ? "bg-muted/30" : "bg-background"
                  }`}
                >
                  <span className="text-muted-foreground text-xs">{row.label}</span>
                  <span className="font-medium text-foreground text-xs text-right">{row.value}</span>
                </div>
              ))}
              {selected.notes && (
                <div className="px-3 py-2.5 border-t border-border bg-muted/10">
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    <span className="font-medium">Obs:</span> {selected.notes}
                  </p>
                </div>
              )}
            </div>
          )}

          <Button onClick={onClose} className="w-full gap-2">
            <CheckCircle className="h-4 w-4" />
            Aplicar política
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
