import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check, ArrowRight, Store, BarChart3, Loader2 } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

const faixasFaturamento = [
  "Até R$81.000",
  "R$81.000 - R$360.000",
  "R$360.000 - R$4.800.000",
  "R$4.800.000 - R$300.000.000",
  "Acima de R$300.000.000",
];

// Mock da API da Receita Federal
const mockReceitaFetch = (cnpj: string) => {
  return new Promise<{
    nomeFantasia: string;
    razaoSocial: string;
    tipoCliente: string;
    endereco: { cep: string; uf: string; cidade: string; bairro: string; rua: string; numero: string };
  }>((resolve) => {
    setTimeout(() => {
      resolve({
        nomeFantasia: "Moda Store",
        razaoSocial: "Moda Store Ltda",
        tipoCliente: "Lojista",
        endereco: {
          cep: "01310-100",
          uf: "SP",
          cidade: "São Paulo",
          bairro: "Bela Vista",
          rua: "Av. Paulista",
          numero: "1000",
        },
      });
    }, 1500);
  });
};

interface CadastroPJModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
}

export function CadastroPJModal({ open, onOpenChange, onComplete }: CadastroPJModalProps) {
  const [step, setStep] = useState(0);
  const { completePJ } = useAuth();

  // Step 0: CNPJ
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [termos, setTermos] = useState(false);
  const [loading, setLoading] = useState(false);

  // Dados vindos da "Receita"
  const [dadosReceita, setDadosReceita] = useState<{
    nomeFantasia: string;
    razaoSocial: string;
    tipoCliente: string;
    endereco: { cep: string; uf: string; cidade: string; bairro: string; rua: string; numero: string };
  } | null>(null);

  // Step 1: Commercial profile
  const [faturamentoAnual, setFaturamentoAnual] = useState("");

  const handleCnpjSubmit = async () => {
    setLoading(true);
    const data = await mockReceitaFetch(cpfCnpj);
    setDadosReceita(data);
    setLoading(false);
    setStep(1);
  };

  const handleFinish = () => {
    if (!dadosReceita) return;
    completePJ({
      cpfCnpj,
      nomeFantasia: dadosReceita.nomeFantasia,
      razaoSocial: dadosReceita.razaoSocial,
      tipoCliente: dadosReceita.tipoCliente,
      endereco: dadosReceita.endereco,
      faturamentoAnual,
    });
    onOpenChange(false);
    onComplete?.();
  };

  const formatCnpj = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 14);
    return digits
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  };

  const inputClass = "w-full h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent/50";

  const steps = [
    { icon: Store, label: "CNPJ" },
    { icon: BarChart3, label: "Perfil comercial" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0 gap-0 z-[200]">
        <VisuallyHidden><DialogTitle>Cadastro PJ</DialogTitle></VisuallyHidden>

        {/* Header */}
        <div className="bg-primary/5 border-b border-border px-6 pt-6 pb-5 rounded-t-lg">
          <h2 className="text-lg font-bold text-foreground text-center">
            Falta pouco para conectar! 🤝
          </h2>
          <p className="text-sm text-muted-foreground text-center mt-1.5 max-w-sm mx-auto">
            Informe seu CNPJ e buscaremos os dados automaticamente na Receita Federal.
          </p>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mt-5">
            {steps.map((s, i) => {
              const Icon = s.icon;
              const isActive = step === i;
              const isDone = step > i;
              return (
                <div key={i} className="flex items-center gap-1.5">
                  <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    isActive ? "bg-accent text-accent-foreground" :
                    isDone ? "bg-accent/20 text-accent" :
                    "bg-secondary text-muted-foreground"
                  }`}>
                    {isDone ? <Check className="h-3 w-3" /> : <Icon className="h-3 w-3" />}
                    <span className="hidden sm:inline">{s.label}</span>
                  </div>
                  {i < steps.length - 1 && (
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 0: CNPJ */}
        {step === 0 && (
          <div className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                CNPJ <span className="text-destructive">*</span>
              </label>
              <input
                value={cpfCnpj}
                onChange={(e) => setCpfCnpj(formatCnpj(e.target.value))}
                placeholder="00.000.000/0000-00"
                className={inputClass}
                required
              />
              <p className="text-xs text-muted-foreground mt-1.5">
                Os dados da empresa serão preenchidos automaticamente pela Receita Federal.
              </p>
            </div>

            <label className="flex items-start gap-2 cursor-pointer pt-1">
              <div
                onClick={() => setTermos(!termos)}
                className={`mt-0.5 h-4 w-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                  termos ? "bg-accent border-accent" : "border-input"
                }`}
              >
                {termos && <Check className="h-3 w-3 text-accent-foreground" />}
              </div>
              <span className="text-xs text-muted-foreground">
                Li e concordo com a <button className="text-accent underline">Política de Privacidade</button>
              </span>
            </label>

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <button onClick={() => onOpenChange(false)} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Cancelar
              </button>
              <button
                onClick={handleCnpjSubmit}
                disabled={!termos || cpfCnpj.replace(/\D/g, "").length < 14 || loading}
                className="flex items-center gap-2 px-6 h-10 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-40"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Consultando...
                  </>
                ) : (
                  <>
                    Consultar CNPJ
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 1: Commercial profile */}
        {step === 1 && dadosReceita && (
          <div className="px-6 py-5 space-y-5">
            {/* Dados encontrados */}
            <div className="bg-accent/5 border border-accent/20 rounded-lg p-4 space-y-1.5">
              <p className="text-xs font-medium text-accent flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5" /> Dados encontrados
              </p>
              <p className="text-sm font-semibold text-foreground">{dadosReceita.razaoSocial}</p>
              <p className="text-xs text-muted-foreground">
                {dadosReceita.nomeFantasia} · {dadosReceita.endereco.cidade}/{dadosReceita.endereco.uf}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Porte da empresa <span className="text-destructive">*</span></label>
              <select value={porte} onChange={(e) => setPorte(e.target.value)} className={inputClass} required>
                <option value="">Selecionar porte</option>
                {portes.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Faturamento anual <span className="text-destructive">*</span></label>
              <select value={faturamentoAnual} onChange={(e) => setFaturamentoAnual(e.target.value)} className={inputClass} required>
                <option value="">Selecionar faixa</option>
                {faixasFaturamento.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <button onClick={() => setStep(0)} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                ← Voltar
              </button>
              <button
                onClick={handleFinish}
                disabled={!porte || !faturamentoAnual}
                className="flex items-center gap-2 px-6 h-10 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-40"
              >
                Cadastre-se
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
