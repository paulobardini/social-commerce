import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check } from "lucide-react";

const tiposCliente = ["Sacoleira", "Lojista", "E-commerce", "Importadora", "Atacadista", "Distribuidora"];

interface CadastroPJModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
}

export function CadastroPJModal({ open, onOpenChange, onComplete }: CadastroPJModalProps) {
  const [step, setStep] = useState(0);
  const { completePJ } = useAuth();

  // Step 0: Address
  const [cep, setCep] = useState("");
  const [uf, setUf] = useState("");
  const [cidade, setCidade] = useState("");
  const [bairro, setBairro] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");

  // Step 1: Store data
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [nomeFantasia, setNomeFantasia] = useState("");
  const [razaoSocial, setRazaoSocial] = useState("");
  const [telefone, setTelefone] = useState("");
  const [emailPJ, setEmailPJ] = useState("");
  const [tipoCliente, setTipoCliente] = useState("");
  const [termos, setTermos] = useState(false);

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">
            {step === 0 ? "Endereço" : "Dados da sua loja"}
          </DialogTitle>
          <p className="text-sm text-muted-foreground text-center mt-1">
            {step === 0
              ? "Seu endereço é importante para que possamos te conectar com as melhores indústrias"
              : "Informe os dados da sua loja e comece a explorar a Nextil"}
          </p>
        </DialogHeader>

        {step === 0 && (
          <div className="space-y-4 mt-4">
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
            <div className="flex items-center justify-between pt-4">
              <button onClick={() => onOpenChange(false)} className="text-sm font-medium text-muted-foreground hover:text-foreground">
                Cancelar
              </button>
              <button
                onClick={() => setStep(1)}
                className="px-8 h-10 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
              >
                Próximo
              </button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4 mt-4">
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
                <select
                  value={tipoCliente}
                  onChange={(e) => setTipoCliente(e.target.value)}
                  className={inputClass}
                  required
                >
                  <option value="">Selecionar</option>
                  {tiposCliente.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <label className="flex items-start gap-2 cursor-pointer">
              <div
                onClick={() => setTermos(!termos)}
                className={`mt-0.5 h-4 w-4 rounded border flex items-center justify-center shrink-0 ${
                  termos ? "bg-accent border-accent" : "border-input"
                }`}
              >
                {termos && <Check className="h-3 w-3 text-accent-foreground" />}
              </div>
              <span className="text-xs text-muted-foreground">
                Li e concordo com a <button className="text-accent underline">Política de Privacidade</button>
              </span>
            </label>

            <div className="flex items-center justify-between pt-4">
              <button onClick={() => setStep(0)} className="text-sm font-medium text-foreground hover:text-accent">
                Voltar
              </button>
              <button
                onClick={handleFinish}
                disabled={!termos || !cpfCnpj || !razaoSocial}
                className="px-8 h-10 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-40"
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
