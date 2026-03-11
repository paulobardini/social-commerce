import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check, ArrowRight, Store, MapPin } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

const tiposCliente = ["Sacoleira", "Lojista", "E-commerce", "Importadora", "Atacadista", "Distribuidora"];

interface CadastroPJModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
}

export function CadastroPJModal({ open, onOpenChange, onComplete }: CadastroPJModalProps) {
  const [step, setStep] = useState(0);
  const { completePJ } = useAuth();

  // Step 0: Store data (PJ)
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [nomeFantasia, setNomeFantasia] = useState("");
  const [razaoSocial, setRazaoSocial] = useState("");
  const [telefone, setTelefone] = useState("");
  const [emailPJ, setEmailPJ] = useState("");
  const [tipoCliente, setTipoCliente] = useState("");
  const [termos, setTermos] = useState(false);

  // Step 1: Address
  const [cep, setCep] = useState("");
  const [uf, setUf] = useState("");
  const [cidade, setCidade] = useState("");
  const [bairro, setBairro] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");

  const handleFinish = () => {
    completePJ({
      cpfCnpj,
      nomeFantasia,
      razaoSocial,
      tipoCliente,
      endereco: { cep, uf, cidade, bairro, rua, numero },
    });
    onOpenChange(false);
    onComplete?.();
  };

  const inputClass = "w-full h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent/50";

  const steps = [
    { icon: Store, label: "Dados da loja" },
    { icon: MapPin, label: "Endereço" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0 gap-0">
        {/* Header with context */}
        <div className="bg-primary/5 border-b border-border px-6 pt-6 pb-5 rounded-t-lg">
          <h2 className="text-lg font-bold text-foreground text-center">
            Falta pouco para conectar! 🤝
          </h2>
          <p className="text-sm text-muted-foreground text-center mt-1.5 max-w-sm mx-auto">
            Para que as marcas possam enviar propostas, condições comerciais e processar seus pedidos, precisamos de alguns dados da sua loja.
          </p>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-3 mt-5">
            {steps.map((s, i) => {
              const Icon = s.icon;
              const isActive = step === i;
              const isDone = step > i;
              return (
                <div key={i} className="flex items-center gap-2">
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    isActive ? "bg-accent text-accent-foreground" :
                    isDone ? "bg-accent/20 text-accent" :
                    "bg-secondary text-muted-foreground"
                  }`}>
                    {isDone ? <Check className="h-3 w-3" /> : <Icon className="h-3 w-3" />}
                    {s.label}
                  </div>
                  {i < steps.length - 1 && (
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 0: Store data */}
        {step === 0 && (
          <div className="px-6 py-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">CPF/CNPJ <span className="text-destructive">*</span></label>
                <input value={cpfCnpj} onChange={(e) => setCpfCnpj(e.target.value)} placeholder="00.000.000/0000-00" className={inputClass} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Nome Fantasia</label>
                <input value={nomeFantasia} onChange={(e) => setNomeFantasia(e.target.value)} placeholder="Digite aqui" className={inputClass} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Razão Social <span className="text-destructive">*</span></label>
                <input value={razaoSocial} onChange={(e) => setRazaoSocial(e.target.value)} placeholder="Digite aqui" className={inputClass} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Telefone <span className="text-destructive">*</span></label>
                <input value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(00) 0 0000-0000" className={inputClass} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">E-mail <span className="text-destructive">*</span></label>
                <input value={emailPJ} onChange={(e) => setEmailPJ(e.target.value)} placeholder="exemplo@mail.com" className={inputClass} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Tipo de Cliente <span className="text-destructive">*</span></label>
                <select value={tipoCliente} onChange={(e) => setTipoCliente(e.target.value)} className={inputClass} required>
                  <option value="">Selecionar</option>
                  {tiposCliente.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
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
                onClick={() => setStep(1)}
                disabled={!termos || !cpfCnpj || !razaoSocial}
                className="flex items-center gap-2 px-6 h-10 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-40"
              >
                Próximo
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 1: Address */}
        {step === 1 && (
          <div className="px-6 py-5 space-y-4">
            <p className="text-xs text-muted-foreground -mt-1 mb-2">
              Seu endereço nos ajuda a conectar você com indústrias mais próximas e otimizar a logística de entrega.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">CEP <span className="text-destructive">*</span></label>
                <input value={cep} onChange={(e) => setCep(e.target.value)} placeholder="00000-000" className={inputClass} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">UF</label>
                <input value={uf} onChange={(e) => setUf(e.target.value)} placeholder="Pesquisar estado" className={inputClass} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Cidade</label>
                <input value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="Pesquisar..." className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Bairro <span className="text-destructive">*</span></label>
                <input value={bairro} onChange={(e) => setBairro(e.target.value)} placeholder="Digite aqui" className={inputClass} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Rua <span className="text-destructive">*</span></label>
                <input value={rua} onChange={(e) => setRua(e.target.value)} placeholder="Digite aqui" className={inputClass} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Número <span className="text-destructive">*</span></label>
                <input value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="0" className={inputClass} required />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <button onClick={() => setStep(0)} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                ← Voltar
              </button>
              <button
                onClick={handleFinish}
                disabled={!cep || !bairro || !rua}
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
