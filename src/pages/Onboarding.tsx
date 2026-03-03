import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Store, ShoppingBag, Truck, Globe, Camera, Sparkles, ChevronRight } from "lucide-react";
import nextilLogo from "@/assets/nextil-logo.png";

const segmentos = [
  { id: "sacoleira", label: "Sacoleira", icon: ShoppingBag, desc: "Vendo de porta em porta ou por encomenda" },
  { id: "lojista", label: "Lojista", icon: Store, desc: "Tenho uma ou mais lojas físicas" },
  { id: "rede", label: "Rede de Lojas", icon: Sparkles, desc: "Possuo uma rede com múltiplas unidades" },
  { id: "ecommerce", label: "E-commerce", icon: Globe, desc: "Vendo exclusivamente online" },
  { id: "atacadista", label: "Atacadista", icon: Truck, desc: "Compro em grandes volumes para revenda" },
  { id: "influencer", label: "Produtor de Conteúdo", icon: Camera, desc: "Crio conteúdo de moda e tendências" },
];

const portes = [
  { id: "micro", label: "Micro", desc: "Faturamento até R$ 81 mil/ano" },
  { id: "pequeno", label: "Pequeno", desc: "Faturamento até R$ 360 mil/ano" },
  { id: "medio", label: "Médio", desc: "Faturamento até R$ 4,8 milhões/ano" },
  { id: "grande", label: "Grande", desc: "Faturamento acima de R$ 4,8 milhões/ano" },
];

const interessesList = [
  "Feminino", "Masculino", "Infantil", "Plus Size",
  "Moda Praia", "Fitness", "Íntima", "Sustentável",
  "Fast Fashion", "Premium", "Inverno", "Verão",
];

const Onboarding = () => {
  const [step, setStep] = useState(0);
  const [segmento, setSegmento] = useState("");
  const [porte, setPorte] = useState("");
  const [interesses, setInteresses] = useState<string[]>([]);
  const { completeOnboarding, user } = useAuth();
  const navigate = useNavigate();

  const toggleInteresse = (i: string) => {
    setInteresses((prev) => prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]);
  };

  const canNext = () => {
    if (step === 0) return !!segmento;
    if (step === 1) return !!porte;
    if (step === 2) return interesses.length >= 3;
    return true;
  };

  const handleNext = () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      completeOnboarding({ segmento, porte, interesses });
      navigate("/");
    }
  };

  const steps = ["Segmento", "Porte", "Interesses"];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <img src={nextilLogo} alt="Nextil" className="h-7 w-7" />
          <span className="text-sm font-medium text-muted-foreground">
            Olá, <span className="text-foreground font-semibold">{user?.name || "Usuário"}</span> 👋
          </span>
        </div>
        <button
          onClick={() => { completeOnboarding({ segmento: "skip", porte: "skip", interesses: [] }); navigate("/"); }}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Pular
        </button>
      </div>

      {/* Progress */}
      <div className="px-6 pt-6">
        <div className="flex items-center gap-2 max-w-lg mx-auto">
          {steps.map((s, i) => (
            <div key={s} className="flex-1 flex items-center gap-2">
              <div className={`flex items-center justify-center h-7 w-7 rounded-full text-xs font-bold shrink-0 transition-colors ${
                i < step ? "bg-accent text-accent-foreground" :
                i === step ? "bg-primary text-primary-foreground" :
                "bg-secondary text-muted-foreground"
              }`}>
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 rounded ${i < step ? "bg-accent" : "bg-border"}`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between max-w-lg mx-auto mt-2">
          {steps.map((s) => (
            <span key={s} className="text-[10px] text-muted-foreground">{s}</span>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="seg" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="w-full max-w-lg">
              <h2 className="text-xl font-semibold text-foreground mb-1 text-center">Como você atua no mercado?</h2>
              <p className="text-sm text-muted-foreground text-center mb-6">Selecione o que melhor descreve seu negócio</p>
              <div className="grid grid-cols-2 gap-3">
                {segmentos.map((s) => {
                  const Icon = s.icon;
                  const selected = segmento === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSegmento(s.id)}
                      className={`flex flex-col items-start gap-2 p-4 rounded-xl border-2 transition-all text-left ${
                        selected
                          ? "border-accent bg-accent/5 shadow-sm"
                          : "border-border hover:border-accent/30 bg-card"
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${selected ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-sm font-semibold text-foreground">{s.label}</span>
                      <span className="text-xs text-muted-foreground leading-tight">{s.desc}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="porte" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="w-full max-w-lg">
              <h2 className="text-xl font-semibold text-foreground mb-1 text-center">Qual o porte do seu negócio?</h2>
              <p className="text-sm text-muted-foreground text-center mb-6">Isso nos ajuda a recomendar as melhores marcas</p>
              <div className="flex flex-col gap-3">
                {portes.map((p) => {
                  const selected = porte === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setPorte(p.id)}
                      className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                        selected
                          ? "border-accent bg-accent/5 shadow-sm"
                          : "border-border hover:border-accent/30 bg-card"
                      }`}
                    >
                      <div>
                        <span className="text-sm font-semibold text-foreground">{p.label}</span>
                        <p className="text-xs text-muted-foreground mt-0.5">{p.desc}</p>
                      </div>
                      <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                        selected ? "border-accent bg-accent" : "border-border"
                      }`}>
                        {selected && <Check className="h-3 w-3 text-accent-foreground" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="int" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="w-full max-w-lg">
              <h2 className="text-xl font-semibold text-foreground mb-1 text-center">O que te interessa?</h2>
              <p className="text-sm text-muted-foreground text-center mb-6">Selecione pelo menos 3 categorias</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {interessesList.map((i) => {
                  const selected = interesses.includes(i);
                  return (
                    <button
                      key={i}
                      onClick={() => toggleInteresse(i)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        selected
                          ? "bg-accent text-accent-foreground shadow-sm"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                    >
                      {selected && <Check className="h-3.5 w-3.5 inline mr-1.5" />}
                      {i}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground text-center mt-3">
                {interesses.length}/3 selecionados
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-border">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <button
            onClick={() => step > 0 && setStep(step - 1)}
            className={`text-sm font-medium transition-colors ${step > 0 ? "text-foreground hover:text-accent" : "text-transparent pointer-events-none"}`}
          >
            Voltar
          </button>
          <button
            onClick={handleNext}
            disabled={!canNext()}
            className="flex items-center gap-2 px-8 h-11 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:pointer-events-none"
          >
            {step === 2 ? "Começar" : "Próximo"}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
