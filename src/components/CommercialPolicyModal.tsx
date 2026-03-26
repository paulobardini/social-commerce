import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";

interface DiscountTier {
  description: string;
  commission: string;
  minOrder: string;
}

interface PolicyData {
  id: string;
  name: string;
  valid: boolean;
  apolo: {
    commission: string;
    discountTiers: DiscountTier[];
    observation: string;
    discountNotes: string;
    paymentPrazo: string;
    paymentBoleto: string;
    paymentCartao: string;
    paymentAVista: string;
    gridType: string;
    gridAllowSize: string;
    gridAllowColor: string;
    minFreight: string;
    minDuplicata: string;
    creditAnalysis: string;
    additionalDiscounts: string;
    minCnpjTime: string;
    campaigns: string;
    billingStart: string;
    billingEnd: string;
    salesStart: string;
    salesEnd: string;
    scheduledOrders: string;
    avgBillingTime: string;
    notes: string;
  };
  direta: {
    commission: string;
    discountTiers: DiscountTier[];
    observation: string;
    discountNotes: string;
    paymentPrazo: string;
    paymentBoleto: string;
    paymentCartao: string;
    paymentAVista: string;
    gridType: string;
    gridAllowSize: string;
    gridAllowColor: string;
    minFreight: string;
    minDuplicata: string;
    creditAnalysis: string;
    additionalDiscounts: string;
    minCnpjTime: string;
    campaigns: string;
    billingStart: string;
    billingEnd: string;
    salesStart: string;
    salesEnd: string;
    scheduledOrders: string;
    avgBillingTime: string;
    notes: string;
  };
}

const mockPolicies: PolicyData[] = [
  {
    id: "cdka-inv26-sul",
    name: "CDKA - INV 26 - SUL/SUD/CO",
    valid: true,
    apolo: {
      commission: "20% SOB A COMISSÃO",
      discountTiers: [],
      observation: "",
      discountNotes: "",
      paymentPrazo: "",
      paymentBoleto: "",
      paymentCartao: "",
      paymentAVista: "",
      gridType: "",
      gridAllowSize: "",
      gridAllowColor: "",
      minFreight: "",
      minDuplicata: "",
      creditAnalysis: "",
      additionalDiscounts: "",
      minCnpjTime: "",
      campaigns: "",
      billingStart: "",
      billingEnd: "",
      salesStart: "",
      salesEnd: "",
      scheduledOrders: "",
      avgBillingTime: "",
      notes: "",
    },
    direta: {
      commission: "10% SOB A COMISSÃO",
      discountTiers: [
        { description: "19% PRAZO 24% VISTA\n28% ANTEC.", commission: "10,0%", minOrder: "" },
        { description: "24% PRAZO 29% VISTA\n31% ANTEC.", commission: "7,0%", minOrder: "" },
        { description: "27% PRAZO 32% VISTA\n34% ANTEC.", commission: "5,0%", minOrder: "" },
        { description: "29% PRAZO 34% VISTA\n36% ANTEC.", commission: "4,0%", minOrder: "" },
      ],
      observation: "",
      discountNotes: "",
      paymentPrazo: "",
      paymentBoleto: "75D PRAZO MÉDIO",
      paymentCartao: "",
      paymentAVista: "20DD",
      gridType: "FECHADA",
      gridAllowSize: "NÃO",
      gridAllowColor: "NÃO",
      minFreight: "R$ 2.500,00 - SUL/SUD  R$ 3.000,00 - CO",
      minDuplicata: "R$ 450,00",
      creditAnalysis: "",
      additionalDiscounts: "",
      minCnpjTime: "MÍNIMO DE 1 ANO PARA APROVAÇÃO NO BOLETO",
      campaigns: "",
      billingStart: "01/03/2026",
      billingEnd: "30/06/2026",
      salesStart: "01/01/2026",
      salesEnd: "30/04/2026",
      scheduledOrders: "CONSULTAR TIME DE PRODUTO",
      avgBillingTime: "",
      notes: "",
    },
  },
  {
    id: "cdka-inv26-nne",
    name: "CDKA - INV 26 - N/NE",
    valid: true,
    apolo: {
      commission: "22% SOB A COMISSÃO",
      discountTiers: [],
      observation: "",
      discountNotes: "",
      paymentPrazo: "",
      paymentBoleto: "",
      paymentCartao: "",
      paymentAVista: "",
      gridType: "",
      gridAllowSize: "",
      gridAllowColor: "",
      minFreight: "",
      minDuplicata: "",
      creditAnalysis: "",
      additionalDiscounts: "",
      minCnpjTime: "",
      campaigns: "",
      billingStart: "",
      billingEnd: "",
      salesStart: "",
      salesEnd: "",
      scheduledOrders: "",
      avgBillingTime: "",
      notes: "",
    },
    direta: {
      commission: "12% SOB A COMISSÃO",
      discountTiers: [
        { description: "17% PRAZO 22% VISTA\n26% ANTEC.", commission: "12,0%", minOrder: "" },
        { description: "22% PRAZO 27% VISTA\n30% ANTEC.", commission: "8,0%", minOrder: "" },
      ],
      observation: "",
      discountNotes: "",
      paymentPrazo: "",
      paymentBoleto: "90D PRAZO MÉDIO",
      paymentCartao: "",
      paymentAVista: "20DD",
      gridType: "FECHADA",
      gridAllowSize: "NÃO",
      gridAllowColor: "NÃO",
      minFreight: "R$ 2.000,00",
      minDuplicata: "R$ 400,00",
      creditAnalysis: "",
      additionalDiscounts: "",
      minCnpjTime: "MÍNIMO DE 1 ANO PARA APROVAÇÃO NO BOLETO",
      campaigns: "",
      billingStart: "01/03/2026",
      billingEnd: "30/06/2026",
      salesStart: "01/01/2026",
      salesEnd: "30/04/2026",
      scheduledOrders: "CONSULTAR TIME DE PRODUTO",
      avgBillingTime: "",
      notes: "",
    },
  },
];

interface CommercialPolicyModalProps {
  open: boolean;
  onClose: () => void;
}

const Row = ({ label, value, sub }: { label: string; value?: string; sub?: boolean }) => (
  <div className={`flex gap-2 ${sub ? "pl-4" : ""} border-b border-border last:border-b-0`}>
    <div className={`${sub ? "w-1/2" : "w-2/5"} py-2 px-3 bg-muted/40 text-[11px] font-semibold text-foreground uppercase leading-tight flex items-center`}>
      {label}
    </div>
    <div className="flex-1 py-2 px-3 text-[11px] text-foreground flex items-center">
      {value || "—"}
    </div>
  </div>
);

export const CommercialPolicyModal = ({ open, onClose }: CommercialPolicyModalProps) => {
  const [selectedPolicyId, setSelectedPolicyId] = useState(mockPolicies[0].id);
  const [activeTab, setActiveTab] = useState<"apolo" | "direta">("direta");

  const policy = mockPolicies.find((p) => p.id === selectedPolicyId) || mockPolicies[0];
  const data = policy[activeTab];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-5 pt-5 pb-0">
          <DialogTitle className="text-base font-bold">Política Comercial</DialogTitle>
        </DialogHeader>

        <div className="px-5 pt-3 space-y-3">
          {/* Policy selector */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Selecione a política</label>
            <Select value={selectedPolicyId} onValueChange={setSelectedPolicyId}>
              <SelectTrigger className="h-9 text-sm font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {mockPolicies.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Valid badge */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase">Política válida?</span>
            {policy.valid ? (
              <span className="flex items-center gap-1 text-[11px] font-bold text-green-600">
                <CheckCircle className="h-3.5 w-3.5" /> Válida
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] font-bold text-destructive">
                <XCircle className="h-3.5 w-3.5" /> Inválida
              </span>
            )}
          </div>

          {/* Tabs */}
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => setActiveTab("apolo")}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wide transition-colors ${
                activeTab === "apolo"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/30 text-muted-foreground hover:bg-muted/60"
              }`}
            >
              Venda Apolo
            </button>
            <button
              onClick={() => setActiveTab("direta")}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wide transition-colors ${
                activeTab === "direta"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/30 text-muted-foreground hover:bg-muted/60"
              }`}
            >
              Venda Direta
            </button>
          </div>

          {/* Commission highlight */}
          <div className="rounded-lg bg-accent/10 border border-accent/30 px-3 py-2 text-center">
            <span className="text-xs font-bold text-accent">{data.commission}</span>
          </div>
        </div>

        {/* Scrollable table content */}
        <div className="flex-1 overflow-y-auto px-5 pb-5 pt-2">
          <div className="rounded-lg border border-border overflow-hidden">
            {/* 1 - Comissionamento / Desconto x Prazo */}
            <div className="border-b border-border">
              <div className="flex gap-2 bg-muted/60 border-b border-border">
                <div className="w-8 py-2 px-2 text-[10px] font-bold text-muted-foreground flex items-center justify-center">1</div>
                <div className="flex-1 py-2 px-2 text-[11px] font-bold text-foreground uppercase">
                  Porcentagem de comissionamento / Desconto x Prazo
                </div>
              </div>
              {data.discountTiers.length > 0 ? (
                <div className="border-b border-border">
                  <div className="grid grid-cols-[1fr_auto_auto_auto] text-[10px] font-semibold text-muted-foreground uppercase bg-muted/30 border-b border-border">
                    <div className="px-3 py-1.5">Comissionamento padrão</div>
                    <div className="px-3 py-1.5 w-24 text-center">Desconto</div>
                    <div className="px-3 py-1.5 w-20 text-center">Comissão</div>
                    <div className="px-3 py-1.5 w-24 text-center">Pedido mín.</div>
                  </div>
                  {data.discountTiers.map((tier, i) => (
                    <div key={i} className="grid grid-cols-[1fr_auto_auto_auto] text-[11px] border-b border-border last:border-b-0">
                      <div className="px-3 py-2 text-foreground whitespace-pre-line">{tier.description}</div>
                      <div className="px-3 py-2 w-24 text-center text-foreground">{tier.description.split("\n")[0]?.split(" ")[0] || ""}</div>
                      <div className="px-3 py-2 w-20 text-center font-medium text-foreground">{tier.commission}</div>
                      <div className="px-3 py-2 w-24 text-center text-foreground">{tier.minOrder || "—"}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-3 py-2 text-[11px] text-muted-foreground">Sem dados de desconto</div>
              )}
              <Row label="Observação" value={data.observation} sub />
              <Row label="Desconto" value={data.discountNotes} sub />
            </div>

            {/* 2 - Prazo de Pagamento */}
            <div className="border-b border-border">
              <div className="flex gap-2 bg-muted/60 border-b border-border">
                <div className="w-8 py-2 px-2 text-[10px] font-bold text-muted-foreground flex items-center justify-center">2</div>
                <div className="flex-1 py-2 px-2 text-[11px] font-bold text-foreground uppercase">Prazo de Pagamento</div>
              </div>
              <Row label="Prazo" value={data.paymentPrazo} sub />
              <Row label="Boleto" value={data.paymentBoleto} sub />
              <Row label="Cartão" value={data.paymentCartao} sub />
              <Row label="À vista" value={data.paymentAVista} sub />
            </div>

            {/* 3 - Grade Produto */}
            <div className="border-b border-border">
              <div className="flex gap-2 bg-muted/60 border-b border-border">
                <div className="w-8 py-2 px-2 text-[10px] font-bold text-muted-foreground flex items-center justify-center">3</div>
                <div className="flex-1 py-2 px-2 text-[11px] font-bold text-foreground uppercase">Grade Produto</div>
              </div>
              <Row label="Tipo de grade" value={data.gridType} sub />
              <Row label="Permite escolha de tamanho" value={data.gridAllowSize} sub />
              <Row label="Permite escolha de cor" value={data.gridAllowColor} sub />
            </div>

            {/* 4 - Pedido mínimo frete */}
            <div className="border-b border-border">
              <div className="flex gap-2 bg-muted/60 border-b border-border">
                <div className="w-8 py-2 px-2 text-[10px] font-bold text-muted-foreground flex items-center justify-center">4</div>
                <div className="flex-1 py-2 px-2 text-[11px] font-bold text-foreground uppercase">Pedido mínimo para frete CIF</div>
              </div>
              <Row label="Valor" value={data.minFreight} sub />
            </div>

            {/* 5 - Pedido mínimo duplicata */}
            <div className="border-b border-border">
              <div className="flex gap-2 bg-muted/60 border-b border-border">
                <div className="w-8 py-2 px-2 text-[10px] font-bold text-muted-foreground flex items-center justify-center">5</div>
                <div className="flex-1 py-2 px-2 text-[11px] font-bold text-foreground uppercase">Pedido mínimo para duplicata</div>
              </div>
              <Row label="Valor" value={data.minDuplicata} sub />
            </div>

            {/* 6 - Tempo análise crédito */}
            <div className="border-b border-border">
              <div className="flex gap-2 bg-muted/60 border-b border-border">
                <div className="w-8 py-2 px-2 text-[10px] font-bold text-muted-foreground flex items-center justify-center">6</div>
                <div className="flex-1 py-2 px-2 text-[11px] font-bold text-foreground uppercase">Tempo de análise de crédito</div>
              </div>
              <div className="px-3 py-2 text-[11px] text-foreground pl-6">{data.creditAnalysis || "—"}</div>
            </div>

            {/* 7 - Descontos adicionais */}
            <div className="border-b border-border">
              <div className="flex gap-2 bg-muted/60 border-b border-border">
                <div className="w-8 py-2 px-2 text-[10px] font-bold text-muted-foreground flex items-center justify-center">7</div>
                <div className="flex-1 py-2 px-2 text-[11px] font-bold text-foreground uppercase">Descontos adicionais por prazo aplicado</div>
              </div>
              <div className="px-3 py-2 text-[11px] text-foreground pl-6">{data.additionalDiscounts || "—"}</div>
            </div>

            {/* 8 - Tempo mínimo CNPJ */}
            <div className="border-b border-border">
              <div className="flex gap-2 bg-muted/60 border-b border-border">
                <div className="w-8 py-2 px-2 text-[10px] font-bold text-muted-foreground flex items-center justify-center">8</div>
                <div className="flex-1 py-2 px-2 text-[11px] font-bold text-foreground uppercase">Tempo mínimo de abertura do CNPJ para atendimento</div>
              </div>
              <div className="px-3 py-2 text-[11px] text-foreground pl-6">{data.minCnpjTime || "—"}</div>
            </div>

            {/* 9 - Campanhas */}
            <div className="border-b border-border">
              <div className="flex gap-2 bg-muted/60 border-b border-border">
                <div className="w-8 py-2 px-2 text-[10px] font-bold text-muted-foreground flex items-center justify-center">9</div>
                <div className="flex-1 py-2 px-2 text-[11px] font-bold text-foreground uppercase leading-tight">Campanhas ou bônus por descontos aplicados ou abertura de clientes novos</div>
              </div>
              <div className="px-3 py-2 text-[11px] text-foreground pl-6">{data.campaigns || "—"}</div>
            </div>

            {/* 10 - Período faturamento coleção */}
            <div className="border-b border-border">
              <div className="flex gap-2 bg-muted/60 border-b border-border">
                <div className="w-8 py-2 px-2 text-[10px] font-bold text-muted-foreground flex items-center justify-center">10</div>
                <div className="flex-1 py-2 px-2 text-[11px] font-bold text-foreground uppercase">Período de faturamento da coleção</div>
              </div>
              <Row label="Início" value={data.billingStart} sub />
              <Row label="Fim" value={data.billingEnd} sub />
            </div>

            {/* 11 - Período vendas coleção */}
            <div className="border-b border-border">
              <div className="flex gap-2 bg-muted/60 border-b border-border">
                <div className="w-8 py-2 px-2 text-[10px] font-bold text-muted-foreground flex items-center justify-center">11</div>
                <div className="flex-1 py-2 px-2 text-[11px] font-bold text-foreground uppercase">Período de vendas da coleção</div>
              </div>
              <Row label="Início" value={data.salesStart} sub />
              <Row label="Fim" value={data.salesEnd} sub />
            </div>

            {/* 12 - Faturamento pedidos programados */}
            <div className="border-b border-border">
              <div className="flex gap-2 bg-muted/60 border-b border-border">
                <div className="w-8 py-2 px-2 text-[10px] font-bold text-muted-foreground flex items-center justify-center">12</div>
                <div className="flex-1 py-2 px-2 text-[11px] font-bold text-foreground uppercase">Faturamento de pedidos programados</div>
              </div>
              <Row label="Tempo" value={data.scheduledOrders} sub />
            </div>

            {/* 13 - Tempo médio faturamento */}
            <div className="border-b border-border">
              <div className="flex gap-2 bg-muted/60 border-b border-border">
                <div className="w-8 py-2 px-2 text-[10px] font-bold text-muted-foreground flex items-center justify-center">13</div>
                <div className="flex-1 py-2 px-2 text-[11px] font-bold text-foreground uppercase">Tempo médio de faturamento</div>
              </div>
              <div className="px-3 py-2 text-[11px] text-foreground pl-6">{data.avgBillingTime || "—"}</div>
            </div>

            {/* 14 - Observações */}
            <div>
              <div className="flex gap-2 bg-muted/60 border-b border-border">
                <div className="w-8 py-2 px-2 text-[10px] font-bold text-muted-foreground flex items-center justify-center">14</div>
                <div className="flex-1 py-2 px-2 text-[11px] font-bold text-foreground uppercase">Observações</div>
              </div>
              <div className="px-3 py-3 text-[11px] text-foreground pl-6 min-h-[40px]">{data.notes || "—"}</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
