import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowRight, Zap, Sparkles, Link2, AlertTriangle } from "lucide-react";
import nextilLogo from "@/assets/nextil-logo.png";
import { CadastroPJModal } from "@/components/CadastroPJModal";

import brandBrandili from "@/assets/brand-brandili.jpg";
import brandKyly from "@/assets/brand-kyly.jpg";
import brandHering from "@/assets/brand-hering.jpg";
import brandMalwee from "@/assets/brand-malwee.jpg";
import brandLunender from "@/assets/brand-lunender.jpg";
import brandMarisol from "@/assets/brand-marisol.jpg";
import brandElian from "@/assets/brand-elian.jpg";
import brandColoritta from "@/assets/brand-coloritta.jpg";

// ── Data ──────────────────────────────────────────────

const nichos = [
  { id: "feminino", label: "Moda Feminina", emoji: "👗" },
  { id: "masculino", label: "Moda Masculina", emoji: "👔" },
  { id: "infantil", label: "Moda Infantil", emoji: "🧸" },
  { id: "plus-size", label: "Plus Size", emoji: "💜" },
  { id: "fitness", label: "Fitness / Esportivo", emoji: "💪" },
  { id: "intima", label: "Moda Íntima", emoji: "🩱" },
  { id: "praia", label: "Moda Praia", emoji: "🏖️" },
  { id: "jeans", label: "Jeans / Casual", emoji: "👖" },
];

const marcasMock = [
  { slug: "brandili", name: "Brandili", logo: brandBrandili, category: "infantil" },
  { slug: "kyly", name: "Kyly", logo: brandKyly, category: "infantil" },
  { slug: "hering", name: "Hering", logo: brandHering, category: "masculino" },
  { slug: "malwee", name: "Malwee", logo: brandMalwee, category: "feminino" },
  { slug: "lunender", name: "Lunender", logo: brandLunender, category: "feminino" },
  { slug: "marisol", name: "Marisol", logo: brandMarisol, category: "infantil" },
  { slug: "elian", name: "Elian", logo: brandElian, category: "feminino" },
  { slug: "coloritta", name: "Colorittá", logo: brandColoritta, category: "infantil" },
  { slug: "hering-kids", name: "Hering Kids", logo: brandHering, category: "infantil" },
  { slug: "malwee-kids", name: "Malwee Kids", logo: brandMalwee, category: "infantil" },
  { slug: "lunender-plus", name: "Lunender Plus", logo: brandLunender, category: "plus-size" },
  { slug: "hering-intimates", name: "Hering Intimates", logo: brandHering, category: "intima" },
  { slug: "malwee-liberta", name: "Malwee Liberta", logo: brandMalwee, category: "feminino" },
  { slug: "kyly-fitness", name: "Kyly Fitness", logo: brandKyly, category: "fitness" },
  { slug: "marisol-praia", name: "Marisol Praia", logo: brandMarisol, category: "praia" },
  { slug: "elian-jeans", name: "Elian Jeans", logo: brandElian, category: "jeans" },
];

const TOTAL_STEPS = 4; // 0=intro, 1=nicho, 2=valor, 3=resultado

// ── Main Component ────────────────────────────────────

const Onboarding = () => {
  const [step, setStep] = useState(0);
  const [selectedNichos, setSelectedNichos] = useState<string[]>([]);
  const [valorMedio, setValorMedio] = useState(30);
  const [processing, setProcessing] = useState(false);
  const [processingText, setProcessingText] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [shakeNext, setShakeNext] = useState(false);
  const [showPJModal, setShowPJModal] = useState(false);
  const [pendingConnectionBrand, setPendingConnectionBrand] = useState<string | null>(null);
  const [connectedBrands, setConnectedBrands] = useState<string[]>([]);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [connectAllPending, setConnectAllPending] = useState(false);

  const { completeOnboarding, user } = useAuth();
  const navigate = useNavigate();

  // Validation
  const canNext = useCallback(() => {
    if (step === 0) return true;
    if (step === 1) return selectedNichos.length >= 1;
    if (step === 2) return true;
    return true;
  }, [step, selectedNichos]);

  const handleNext = () => {
    if (!canNext()) {
      setShakeNext(true);
      setTimeout(() => setShakeNext(false), 600);
      return;
    }
    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1);
    }
  };

  // Step 3 → processing → results
  useEffect(() => {
    if (step === 3 && !processing && !showResults) {
      setProcessing(true);
      const texts = ["Analisando seu perfil...", "Encontrando marcas ideais..."];
      let i = 0;
      setProcessingText(texts[0]);
      const iv = setInterval(() => {
        i++;
        if (i < texts.length) {
          setProcessingText(texts[i]);
        } else {
          clearInterval(iv);
          setProcessing(false);
          setShowResults(true);
        }
      }, 700);
      return () => clearInterval(iv);
    }
  }, [step]);

  // Match brands
  const matchedBrands = useMemo(() => {
    const matched = marcasMock.filter((b) => selectedNichos.includes(b.category));
    if (matched.length >= 6) return matched;
    const remaining = marcasMock.filter((b) => !matched.some((m) => m.slug === b.slug));
    return [...matched, ...remaining].slice(0, Math.max(matched.length, 8));
  }, [selectedNichos]);

  const handleRequestConnection = (brandSlug: string) => {
    if (user?.pjCompleted) {
      setConnectedBrands((prev) => [...prev, brandSlug]);
    } else {
      setPendingConnectionBrand(brandSlug);
      setShowPJModal(true);
    }
  };

  const handleRequestAllConnections = () => {
    if (user?.pjCompleted) {
      const allSlugs = matchedBrands.map((b) => b.slug).filter((s) => !connectedBrands.includes(s));
      setConnectedBrands((prev) => [...prev, ...allSlugs]);
      setTimeout(() => handleFinish(), 600);
    } else {
      setConnectAllPending(true);
      setShowPJModal(true);
    }
  };

  const handlePJComplete = () => {
    if (connectAllPending) {
      const allSlugs = matchedBrands.map((b) => b.slug).filter((s) => !connectedBrands.includes(s));
      setConnectedBrands((prev) => [...prev, ...allSlugs]);
      setConnectAllPending(false);
      setTimeout(() => handleFinish(), 600);
    } else if (pendingConnectionBrand) {
      setConnectedBrands((prev) => [...prev, pendingConnectionBrand]);
      setPendingConnectionBrand(null);
    }
  };

  const handleFinish = () => {
    completeOnboarding({
      segmento: "lojista",
      porte: "",
      interesses: selectedNichos,
      faixaInvestimento: `R$${valorMedio}`,
    });
    navigate("/");
  };

  const handleTryExit = () => {
    const uncommitted = matchedBrands.filter((b) => !connectedBrands.includes(b.slug));
    if (uncommitted.length > 0) {
      setShowExitConfirm(true);
    } else {
      handleFinish();
    }
  };

  const handleSkip = () => {
    completeOnboarding({ segmento: "skip", porte: "skip", interesses: [] });
    navigate("/");
  };

  // ── Step 0: Intro ────────────────────────────

  const renderIntro = () => (
    <div className="flex-1 flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 15 }}
        className="mb-8"
      >
        <div className="w-24 h-24 rounded-3xl bg-primary flex items-center justify-center shadow-lg">
          <img src={nextilLogo} alt="Nextil" className="h-14 w-14 brightness-0 invert" />
        </div>
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-2xl md:text-4xl font-bold text-foreground text-center max-w-lg leading-tight"
      >
        Olá{user?.name ? `, ${user.name}` : ""}! 👋
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-muted-foreground mt-3 text-center text-sm md:text-base max-w-md"
      >
        Vamos em 2 perguntas rápidas encontrar as marcas perfeitas pra você
      </motion.p>
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        onClick={handleNext}
        className="mt-10 flex items-center gap-2 px-10 h-14 rounded-full bg-primary text-primary-foreground font-bold text-lg shadow-lg hover:shadow-xl transition-all"
      >
        Vamos lá
        <ArrowRight className="h-5 w-5" />
      </motion.button>
    </div>
  );

  // ── Step 1: Nicho (multi-select) ──────

  const renderNicho = () => (
    <div className="flex-1 flex flex-col items-center pt-8 px-4">
      <motion.h2 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-2xl md:text-3xl font-bold text-foreground text-center mb-2">
        O que você vende?
      </motion.h2>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-muted-foreground text-sm mb-8 text-center">
        Selecione um ou mais nichos
      </motion.p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-2xl">
        {nichos.map((n, i) => {
          const selected = selectedNichos.includes(n.id);
          return (
            <motion.button
              key={n.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                setSelectedNichos((prev) =>
                  prev.includes(n.id) ? prev.filter((x) => x !== n.id) : [...prev, n.id]
                );
              }}
              className={`relative p-5 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${
                selected ? "border-accent bg-accent/10 shadow-md" : "border-border bg-card hover:border-accent/40"
              }`}
            >
              {selected && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                  <Check className="h-3.5 w-3.5 text-accent-foreground" />
                </motion.div>
              )}
              <span className="text-3xl">{n.emoji}</span>
              <span className="text-sm font-semibold text-foreground">{n.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );

  // ── Step 2: Valor Médio por Peça (slider) ──────

  const renderValor = () => (
    <div className="flex-1 flex flex-col items-center justify-center px-6">
      <motion.h2 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-2xl md:text-3xl font-bold text-foreground text-center mb-2">
        Qual o valor médio que você paga por peça?
      </motion.h2>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-muted-foreground text-sm mb-12 text-center max-w-md">
        Arraste para indicar — isso nos ajuda a encontrar marcas na sua faixa
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-md"
      >
        {/* Value display */}
        <div className="text-center mb-8">
          <span className="text-5xl md:text-6xl font-bold text-foreground">
            R$ {valorMedio}
          </span>
          <span className="text-lg text-muted-foreground ml-1">/peça</span>
        </div>

        {/* Slider */}
        <div className="relative px-2">
          <input
            type="range"
            min={10}
            max={120}
            step={5}
            value={valorMedio}
            onChange={(e) => setValorMedio(Number(e.target.value))}
            className="w-full h-3 rounded-full appearance-none cursor-pointer bg-secondary
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-7 [&::-webkit-slider-thumb]:h-7 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:active:cursor-grabbing [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-background
              [&::-moz-range-thumb]:w-7 [&::-moz-range-thumb]:h-7 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-accent [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:active:cursor-grabbing [&::-moz-range-thumb]:border-4 [&::-moz-range-thumb]:border-background"
            style={{
              background: `linear-gradient(to right, hsl(var(--accent)) ${((valorMedio - 10) / 110) * 100}%, hsl(var(--secondary)) ${((valorMedio - 10) / 110) * 100}%)`,
            }}
          />
          <div className="flex justify-between mt-3 text-xs text-muted-foreground font-medium">
            <span>R$ 10</span>
            <span>R$ 120+</span>
          </div>
        </div>

        {/* Contextual hint */}
        <motion.div
          key={valorMedio > 60 ? "high" : valorMedio > 30 ? "mid" : "low"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mt-8"
        >
          <span className="text-xs text-muted-foreground bg-secondary/50 px-4 py-2 rounded-full">
            {valorMedio <= 25
              ? "💡 Faixa popular — muitas opções disponíveis"
              : valorMedio <= 50
              ? "✨ Faixa intermediária — ótimo custo-benefício"
              : valorMedio <= 80
              ? "🎯 Faixa premium — marcas diferenciadas"
              : "💎 Faixa alta — marcas exclusivas"}
          </span>
        </motion.div>
      </motion.div>
    </div>
  );

  // ── Step 3: Resultado ────────────────────────────

  const uncommittedCount = matchedBrands.filter((b) => !connectedBrands.includes(b.slug)).length;

  const renderResultado = () => (
    <div className="flex-1 flex flex-col items-center px-4 overflow-hidden">
      <AnimatePresence mode="wait">
        {processing ? (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center gap-6"
          >
            <motion.div
              className="w-20 h-20 rounded-full border-4 border-accent/30 border-t-accent"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <motion.p
              key={processingText}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-lg font-medium text-foreground text-center"
            >
              {processingText}
            </motion.p>
          </motion.div>
        ) : showResults ? (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full max-w-3xl flex flex-col flex-1 overflow-hidden pt-6"
          >
            <div className="text-center mb-5 shrink-0">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-bold mb-3"
              >
                <Sparkles className="h-4 w-4" />
                {matchedBrands.length} marcas encontradas
              </motion.div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                Suas marcas ideais
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                Solicite conexão para comprar direto da indústria
              </p>
            </div>

            {uncommittedCount > 0 && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                onClick={handleRequestAllConnections}
                className="shrink-0 mx-auto mb-5 flex items-center gap-2 px-6 h-11 rounded-full bg-accent text-accent-foreground font-bold text-sm shadow-md hover:shadow-lg transition-all"
              >
                <Link2 className="h-4 w-4" />
                Solicitar conexão com todas ({uncommittedCount})
              </motion.button>
            )}

            <div className="flex-1 overflow-y-auto pb-4 pt-2 min-h-0">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {matchedBrands.map((brand, i) => {
                  const isConnected = connectedBrands.includes(brand.slug);
                  const nichoLabel = nichos.find((n) => n.id === brand.category)?.label || brand.category;
                  return (
                    <motion.div
                      key={brand.slug}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.06 }}
                      className={`relative rounded-2xl border bg-card overflow-hidden transition-all hover:shadow-md ${
                        isConnected ? "border-accent/40 ring-1 ring-accent/20" : "border-border"
                      }`}
                    >
                      {/* Logo area */}
                      <div className="bg-secondary/30 p-6 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-background shadow-sm">
                          <img src={brand.logo} alt={brand.name} className="w-full h-full object-cover" />
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-4 text-center space-y-1">
                        <h3 className="text-sm font-bold text-foreground">{brand.name}</h3>
                        <p className="text-xs text-muted-foreground">{nichoLabel}</p>

                        {isConnected ? (
                          <div className="flex items-center justify-center gap-1.5 pt-2">
                            <div className="w-5 h-5 rounded-full bg-accent/15 flex items-center justify-center">
                              <Check className="h-3 w-3 text-accent" />
                            </div>
                            <span className="text-xs font-semibold text-accent">Conexão solicitada</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleRequestConnection(brand.slug)}
                            className="w-full mt-2 text-xs bg-accent text-accent-foreground py-2 rounded-xl font-semibold hover:bg-accent/90 transition-colors"
                          >
                            Solicitar conexão
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <div className="shrink-0 pt-4 pb-2">
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                onClick={handleTryExit}
                className="w-full max-w-sm mx-auto flex items-center justify-center gap-2 h-14 rounded-full bg-primary text-primary-foreground font-bold text-lg shadow-lg hover:shadow-xl transition-all"
              >
                <Zap className="h-5 w-5" />
                Explorar plataforma
              </motion.button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );

  // ── Render ──────────────────────────────────

  const steps = [renderIntro, renderNicho, renderValor, renderResultado];
  const showFooter = step === 1 || step === 2;

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2.5">
          <img src={nextilLogo} alt="Nextil" className="h-7 w-7" />
        </div>
        <button onClick={handleSkip} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          Pular
        </button>
      </div>

      {/* Progress — 2 segments for step 1 and 2 */}
      {(step === 1 || step === 2) && (
        <div className="px-5">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-1.5">
              {[1, 2].map((s) => (
                <div
                  key={s}
                  className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                    step >= s ? "bg-accent" : "bg-secondary"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          className="flex-1 flex flex-col overflow-hidden"
        >
          {steps[step]()}
        </motion.div>
      </AnimatePresence>

      {/* Footer */}
      {showFooter && (
        <div className="px-5 py-5">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            <button onClick={() => step > 0 && setStep(step - 1)} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              ← Voltar
            </button>
            <motion.button
              onClick={handleNext}
              animate={shakeNext ? { x: [0, -8, 8, -8, 8, 0] } : {}}
              transition={{ duration: 0.4 }}
              className={`flex items-center gap-2 px-8 h-12 rounded-full font-bold transition-all shadow-lg ${
                canNext() ? "bg-primary text-primary-foreground hover:shadow-xl" : "bg-secondary text-muted-foreground"
              }`}
            >
              Continuar
              <ArrowRight className="h-4 w-4" />
            </motion.button>
          </div>
        </div>
      )}

      {/* PJ Modal */}
      <CadastroPJModal
        open={showPJModal}
        onOpenChange={setShowPJModal}
        onComplete={handlePJComplete}
      />

      {/* Exit Confirm */}
      <AnimatePresence>
        {showExitConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4"
            onClick={() => setShowExitConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-2xl border border-border shadow-2xl p-6 max-w-sm w-full"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Tem certeza?</h3>
                  <p className="text-sm text-muted-foreground">
                    Você tem {uncommittedCount} marca{uncommittedCount > 1 ? "s" : ""} sem conexão
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Solicitar conexão garante acesso mais rápido a condições exclusivas.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowExitConfirm(false)}
                  className="flex-1 h-10 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors"
                >
                  Voltar e conectar
                </button>
                <button
                  onClick={() => { setShowExitConfirm(false); handleFinish(); }}
                  className="flex-1 h-10 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Sair mesmo assim
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Onboarding;
