import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";

interface DiscountTier {
  description: string;
  discount: string;
  commission: string;
  minOrder: string;
}

interface PolicyTabData {
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
}

interface PolicyData {
  id: string;
  name: string;
  valid: boolean;
  apolo: PolicyTabData;
  direta: PolicyTabData;
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
        { description: "19% PRAZO 24% VISTA\n28% ANTEC.", discount: "19%", commission: "10,0%", minOrder: "" },
        { description: "24% PRAZO 29% VISTA\n31% ANTEC.", discount: "24%", commission: "7,0%", minOrder: "" },
        { description: "27% PRAZO 32% VISTA\n34% ANTEC.", discount: "27%", commission: "5,0%", minOrder: "" },
        { description: "29% PRAZO 34% VISTA\n36% ANTEC.", discount: "29%", commission: "4,0%", minOrder: "" },
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
        { description: "17% PRAZO 22% VISTA\n26% ANTEC.", discount: "17%", commission: "12,0%", minOrder: "" },
        { description: "22% PRAZO 27% VISTA\n30% ANTEC.", discount: "22%", commission: "8,0%", minOrder: "" },
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
  {
    id: "pokotinha-inv26",
    name: "POKOTINHA - INV 26",
    valid: true,
    apolo: {
      commission: "20% SOB A COMISSÃO",
      discountTiers: [
        { description: "", discount: "1,00%", commission: "10,0%", minOrder: "LIVRE" },
        { description: "", discount: "3,75%", commission: "9,0%", minOrder: "LIVRE" },
        { description: "", discount: "6,50%", commission: "8,0%", minOrder: "LIVRE" },
        { description: "", discount: "9,25%", commission: "7,0%", minOrder: "LIVRE" },
        { description: "", discount: "12,00%", commission: "6,0%", minOrder: "R$ 15.000,00" },
        { description: "", discount: "14,75%", commission: "5,0%", minOrder: "R$ 15.000,00" },
        { description: "", discount: "17,50%", commission: "4,0%", minOrder: "R$ 15.000,00" },
        { description: "", discount: "20,30%", commission: "3,0%", minOrder: "R$ 15.000,00" },
        { description: "", discount: "23,00%", commission: "2,0%", minOrder: "R$ 15.000,00" },
      ],
      observation: "",
      discountNotes: "",
      paymentPrazo: "",
      paymentBoleto: "75D MÉDIO",
      paymentCartao: "6X SEM JUROS",
      paymentAVista: "5% DESCONTO - NA DATA DE FATURAMENTO",
      gridType: "PALITO",
      gridAllowSize: "NÃO",
      gridAllowColor: "NÃO",
      minFreight: "R$ 2.800,00",
      minDuplicata: "R$ 300,00",
      creditAnalysis: "48H EM MÉDIA",
      additionalDiscounts: "0,5% A CADA 15DD A MENOS DE PRAZO MÉDIO",
      minCnpjTime: "MÍNIMO DE 1 ANO PARA APROVAÇÃO NO BOLETO",
      campaigns: "",
      billingStart: "",
      billingEnd: "",
      salesStart: "",
      salesEnd: "",
      scheduledOrders: "CONSULTAR TIME DE PRODUTO",
      avgBillingTime: "",
      notes: "Alteração de cores em produtos para pedidos cadastrados a partir de 18/02/2026:\nRef. 8530 - Cor amarelo. Cor marrom e rosa indisponíveis.\nRef. 8436 - Ribana na cor preta, não mais na cor da peça.",
    },
    direta: {
      commission: "10% SOB A COMISSÃO",
      discountTiers: [
        { description: "", discount: "", commission: "15,0%", minOrder: "" },
        { description: "", discount: "5,00%", commission: "14,0%", minOrder: "" },
        { description: "", discount: "10,00%", commission: "13,0%", minOrder: "" },
        { description: "", discount: "15,00%", commission: "12,0%", minOrder: "" },
        { description: "", discount: "18,00%", commission: "10,9%", minOrder: "" },
        { description: "", discount: "20,00%", commission: "10,0%", minOrder: "" },
        { description: "", discount: "25,00%", commission: "9,2%", minOrder: "" },
        { description: "", discount: "28,00%", commission: "9,0%", minOrder: "" },
        { description: "", discount: "30,00%", commission: "8,0%", minOrder: "" },
      ],
      observation: "Consultar observações finais para descontos adicionais.",
      discountNotes: "",
      paymentPrazo: "",
      paymentBoleto: "Prazo médio 90D",
      paymentCartao: "6x",
      paymentAVista: "",
      gridType: "SEMIABERTA",
      gridAllowSize: "NÃO",
      gridAllowColor: "SIM",
      minFreight: "R$ 2.800,00\nAbaixo deste valor: Frete Fob\nDespachos poderão ser fracionados",
      minDuplicata: "",
      creditAnalysis: "",
      additionalDiscounts: "",
      minCnpjTime: "1 ano",
      campaigns: "R$ 50,00 por cliente novo aberto\nVálido a partir da 2ª coleção trabalhada\nGrupo considera 1 cliente\nValor será pago no final da coleção",
      billingStart: "",
      billingEnd: "",
      salesStart: "",
      salesEnd: "",
      scheduledOrders: "CONSULTAR TIME DE PRODUTO",
      avgBillingTime: "Alteração de cores em produtos para pedidos cadastrados a partir de 18/02/2026:\nRef. 8530 - Cor amarelo. Cor marrom e rosa indisponíveis.\nRef. 8436 - Ribana na cor preta, não mais na cor da peça.",
      notes: "Tabela completa desconto x prazo x comissão:\nhttps://drive.google.com/file/d/1JWE0y6WP9cFvcE4EbWlLMm_kbNmXjMPc/view?usp=drive_link",
    },
  },
];

interface CommercialPolicyModalProps {
  open: boolean;
  onClose: () => void;
}

const SectionHeader = ({ title }: { title: string }) => (
  <div className="bg-primary/10 border-b border-primary/20 px-4 py-2.5">
    <span className="text-[12px] font-bold text-primary uppercase tracking-wide">{title}</span>
  </div>
);

const Row = ({ label, value }: { label: string; value?: string }) => (
  <div className="flex border-b border-border last:border-b-0">
    <div className="w-2/5 py-2.5 px-4 bg-muted/30 text-[11px] font-semibold text-muted-foreground uppercase leading-tight flex items-center">
      {label}
    </div>
    <div className="flex-1 py-2.5 px-4 text-[11px] text-foreground flex items-center whitespace-pre-line">
      {value || "—"}
    </div>
  </div>
);

const CenteredValue = ({ value }: { value?: string }) => (
  <div className="border-b border-border last:border-b-0 px-4 py-2.5 text-[11px] text-foreground text-center whitespace-pre-line">
    {value || "—"}
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
              <span className="flex items-center gap-1 text-[11px] font-bold text-accent">
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

          {/* Commission highlight at the top */}
          <div className="rounded-lg bg-primary/5 border border-primary/20 px-4 py-3 text-center space-y-1">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide block">Comissão para o vendedor</span>
            <span className="text-[13px] font-bold text-primary uppercase block">{data.commission}</span>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 pb-5 pt-3 space-y-4">
          
          {/* Comissionamento / Desconto x Prazo */}
          <div className="rounded-lg border border-border overflow-hidden">
            <SectionHeader title="Porcentagem de Comissionamento / Desconto x Prazo" />
            {data.discountTiers.length > 0 ? (
              <>
                <div className="grid grid-cols-[1fr_100px_100px_110px] text-[10px] font-bold text-muted-foreground uppercase bg-muted/50 border-b border-border">
                  <div className="px-4 py-2">Comissionamento padrão</div>
                  <div className="px-3 py-2 text-center">Desconto</div>
                  <div className="px-3 py-2 text-center">Comissão</div>
                  <div className="px-3 py-2 text-center">Pedido mín.</div>
                </div>
                {data.discountTiers.map((tier, i) => (
                  <div key={i} className="grid grid-cols-[1fr_100px_100px_110px] text-[11px] border-b border-border last:border-b-0">
                    <div className="px-4 py-2 text-foreground whitespace-pre-line">{tier.description || "—"}</div>
                    <div className="px-3 py-2 text-center text-foreground">{tier.discount || "—"}</div>
                    <div className="px-3 py-2 text-center font-semibold text-primary">{tier.commission}</div>
                    <div className="px-3 py-2 text-center text-foreground">{tier.minOrder || "—"}</div>
                  </div>
                ))}
              </>
            ) : (
              <div className="px-4 py-3 text-[11px] text-muted-foreground text-center">Sem dados de desconto</div>
            )}
            {(data.observation || data.discountNotes) && (
              <div className="border-t border-border">
                {data.observation && <Row label="Observação" value={data.observation} />}
                {data.discountNotes && <Row label="Desconto" value={data.discountNotes} />}
              </div>
            )}
          </div>

          {/* Prazo de Pagamento */}
          <div className="rounded-lg border border-border overflow-hidden">
            <SectionHeader title="Prazo de Pagamento" />
            <Row label="Prazo" value={data.paymentPrazo} />
            <Row label="Boleto" value={data.paymentBoleto} />
            <Row label="Cartão" value={data.paymentCartao} />
            <Row label="À vista" value={data.paymentAVista} />
          </div>

          {/* Grade Produto */}
          <div className="rounded-lg border border-border overflow-hidden">
            <SectionHeader title="Grade Produto" />
            <Row label="Tipo de grade" value={data.gridType} />
            <Row label="Permite escolha de tamanho" value={data.gridAllowSize} />
            <Row label="Permite escolha de cor" value={data.gridAllowColor} />
          </div>

          {/* Pedido mínimo frete */}
          <div className="rounded-lg border border-border overflow-hidden">
            <SectionHeader title="Pedido mínimo para frete CIF" />
            <Row label="Valor" value={data.minFreight} />
          </div>

          {/* Pedido mínimo duplicata */}
          <div className="rounded-lg border border-border overflow-hidden">
            <SectionHeader title="Pedido mínimo para duplicata" />
            <Row label="Valor" value={data.minDuplicata} />
          </div>

          {/* Tempo análise crédito */}
          <div className="rounded-lg border border-border overflow-hidden">
            <SectionHeader title="Tempo de análise de crédito" />
            <CenteredValue value={data.creditAnalysis} />
          </div>

          {/* Descontos adicionais */}
          <div className="rounded-lg border border-border overflow-hidden">
            <SectionHeader title="Descontos adicionais por prazo aplicado" />
            <CenteredValue value={data.additionalDiscounts} />
          </div>

          {/* Tempo mínimo CNPJ */}
          <div className="rounded-lg border border-border overflow-hidden">
            <SectionHeader title="Tempo mínimo de abertura do CNPJ para atendimento" />
            <CenteredValue value={data.minCnpjTime} />
          </div>

          {/* Campanhas */}
          <div className="rounded-lg border border-border overflow-hidden">
            <SectionHeader title="Campanhas ou bônus por descontos aplicados ou abertura de clientes novos" />
            <CenteredValue value={data.campaigns} />
          </div>

          {/* Período faturamento */}
          <div className="rounded-lg border border-border overflow-hidden">
            <SectionHeader title="Período de faturamento da coleção" />
            <Row label="Início" value={data.billingStart} />
            <Row label="Fim" value={data.billingEnd} />
          </div>

          {/* Período vendas */}
          <div className="rounded-lg border border-border overflow-hidden">
            <SectionHeader title="Período de vendas da coleção" />
            <Row label="Início" value={data.salesStart} />
            <Row label="Fim" value={data.salesEnd} />
          </div>

          {/* Faturamento pedidos programados */}
          <div className="rounded-lg border border-border overflow-hidden">
            <SectionHeader title="Faturamento de pedidos programados" />
            <Row label="Tempo" value={data.scheduledOrders} />
          </div>

          {/* Tempo médio faturamento */}
          <div className="rounded-lg border border-border overflow-hidden">
            <SectionHeader title="Tempo médio de faturamento" />
            <CenteredValue value={data.avgBillingTime} />
          </div>

          {/* Observações */}
          <div className="rounded-lg border border-border overflow-hidden">
            <SectionHeader title="Observações" />
            <div className="px-4 py-3 text-[11px] text-foreground whitespace-pre-line min-h-[40px]">
              {data.notes || "—"}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
