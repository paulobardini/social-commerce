"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Store,
  ShoppingBag,
  Truck,
  Globe,
  Camera,
  Sparkles,
  ArrowRight,
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { nextilLogo, nextilWordmark } from "@/assets/placeholders";

const segmentos = [
  { id: "sacoleira", label: "Sacoleira", icon: ShoppingBag, emoji: "👜" },
  { id: "lojista", label: "Lojista", icon: Store, emoji: "🏪" },
  { id: "rede", label: "Rede de Lojas", icon: Sparkles, emoji: "✨" },
  { id: "ecommerce", label: "E-commerce", icon: Globe, emoji: "🌐" },
  { id: "atacadista", label: "Atacadista", icon: Truck, emoji: "📦" },
  { id: "influencer", label: "Criador de Conteúdo", icon: Camera, emoji: "📸" },
];

const portes = [
  { id: "micro", label: "Estou começando", desc: "Faturamento até R$ 81 mil/ano", emoji: "🌱" },
  {
    id: "pequeno",
    label: "Já tenho meu espaço",
    desc: "Faturamento até R$ 360 mil/ano",
    emoji: "🚀",
  },
  { id: "medio", label: "Estou crescendo", desc: "Faturamento até R$ 4,8 mi/ano", emoji: "📈" },
  {
    id: "grande",
    label: "Operação consolidada",
    desc: "Acima de R$ 4,8 mi/ano",
    emoji: "🏆",
  },
];

const interessesList = [
  { label: "Feminino", emoji: "👗" },
  { label: "Masculino", emoji: "👔" },
  { label: "Infantil", emoji: "🧸" },
  { label: "Plus Size", emoji: "💜" },
  { label: "Moda Praia", emoji: "🏖️" },
  { label: "Fitness", emoji: "💪" },
  { label: "Íntima", emoji: "🩱" },
  { label: "Sustentável", emoji: "🌿" },
  { label: "Fast Fashion", emoji: "⚡" },
  { label: "Premium", emoji: "💎" },
  { label: "Inverno", emoji: "🧥" },
  { label: "Verão", emoji: "☀️" },
];

const stepContent = [
  {
    greeting: "Conta pra gente",
    title: "O que melhor descreve você?",
    subtitle:
      "Para personalizar sua experiência, precisamos saber como você atua no mercado da moda.",
  },
  {
    greeting: "Quase lá",
    title: "Em que momento está seu negócio?",
    subtitle:
      "Isso nos ajuda a conectar você com marcas e condições ideais pro seu perfil.",
  },
  {
    greeting: "Última etapa!",
    title: "O que você quer encontrar?",
    subtitle:
      "Selecione pelo menos 3 categorias e vamos montar um feed sob medida pra você.",
  },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [segmento, setSegmento] = useState("");
  const [porte, setPorte] = useState("");
  const [interesses, setInteresses] = useState<string[]>([]);
  const { completeOnboarding } = useAuth();
  const router = useRouter();

  const toggleInteresse = (i: string) => {
    setInteresses((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i],
    );
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
      router.push("/");
    }
  };

  const progress = ((step + 1) / 3) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 md:px-8 py-4">
        <div className="flex items-center gap-2.5">
          <img src={typeof nextilLogo === "string" ? nextilLogo : nextilLogo.src} alt="Nextil" className="h-7 w-7" />
          <img src={typeof nextilWordmark === "string" ? nextilWordmark : nextilWordmark.src} alt="Nextil" className="h-4 hidden sm:block" />
        </div>
        <button
          onClick={() => {
            completeOnboarding({ segmento: "skip", porte: "skip", interesses: [] });
            router.push("/");
          }}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Pular por agora
        </button>
      </div>

      {/* Progress bar */}
      <div className="px-5 md:px-8">
        <div className="h-1 w-full bg-secondary rounded-full overflow-hidden max-w-2xl mx-auto">
          <motion.div
            className="h-full bg-accent rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center px-5 md:px-8 pt-8 md:pt-14 pb-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35 }}
            className="w-full max-w-2xl"
          >
            {/* Header text */}
            <div className="mb-8 md:mb-10">
              <p className="text-accent font-semibold text-sm mb-1.5">
                {stepContent[step].greeting}
              </p>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight mb-2">
                {stepContent[step].title}
              </h1>
              <p className="text-muted-foreground text-sm md:text-base max-w-md">
                {stepContent[step].subtitle}
              </p>
            </div>

            {/* Step 0: Segmento */}
            {step === 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {segmentos.map((s) => {
                  const selected = segmento === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSegmento(s.id)}
                      className={`group relative flex flex-col items-center gap-2.5 p-5 md:p-6 rounded-2xl border-2 transition-all duration-200 ${
                        selected
                          ? "border-accent bg-accent/5 shadow-md shadow-accent/10"
                          : "border-border bg-card hover:border-accent/30 hover:shadow-sm"
                      }`}
                    >
                      {selected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-2.5 right-2.5 h-5 w-5 rounded-full bg-accent flex items-center justify-center"
                        >
                          <Check className="h-3 w-3 text-accent-foreground" />
                        </motion.div>
                      )}
                      <span className="text-2xl md:text-3xl">{s.emoji}</span>
                      <span className="text-sm font-semibold text-foreground">
                        {s.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Step 1: Porte */}
            {step === 1 && (
              <div className="flex flex-col gap-3">
                {portes.map((p) => {
                  const selected = porte === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setPorte(p.id)}
                      className={`flex items-center gap-4 p-4 md:p-5 rounded-2xl border-2 transition-all duration-200 text-left ${
                        selected
                          ? "border-accent bg-accent/5 shadow-md shadow-accent/10"
                          : "border-border bg-card hover:border-accent/30 hover:shadow-sm"
                      }`}
                    >
                      <span className="text-2xl md:text-3xl shrink-0">{p.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-semibold text-foreground block">
                          {p.label}
                        </span>
                        <span className="text-xs text-muted-foreground">{p.desc}</span>
                      </div>
                      <div
                        className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                          selected ? "border-accent bg-accent" : "border-border"
                        }`}
                      >
                        {selected && (
                          <Check className="h-3 w-3 text-accent-foreground" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Step 2: Interesses */}
            {step === 2 && (
              <div>
                <div className="flex flex-wrap gap-2.5">
                  {interessesList.map((i) => {
                    const selected = interesses.includes(i.label);
                    return (
                      <button
                        key={i.label}
                        onClick={() => toggleInteresse(i.label)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                          selected
                            ? "bg-accent text-accent-foreground shadow-md shadow-accent/15 scale-[1.03]"
                            : "bg-card border border-border text-foreground hover:border-accent/30 hover:shadow-sm"
                        }`}
                      >
                        <span className="text-base">{i.emoji}</span>
                        {i.label}
                        {selected && <Check className="h-3.5 w-3.5 ml-0.5" />}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-5 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-accent rounded-full"
                      animate={{
                        width: `${Math.min((interesses.length / 3) * 100, 100)}%`,
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      interesses.length >= 3 ? "text-accent" : "text-muted-foreground"
                    }`}
                  >
                    {interesses.length}/3
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="px-5 md:px-8 py-5 border-t border-border bg-card/50">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <button
            onClick={() => step > 0 && setStep(step - 1)}
            className={`text-sm font-medium transition-colors ${
              step > 0 ? "text-muted-foreground hover:text-foreground" : "invisible"
            }`}
          >
            ← Voltar
          </button>
          <button
            onClick={handleNext}
            disabled={!canNext()}
            className="flex items-center gap-2 px-8 h-11 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all disabled:opacity-30 disabled:pointer-events-none shadow-lg shadow-primary/20"
          >
            {step === 2 ? "Explorar agora" : "Continuar"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

