import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowRight, Zap, Sparkles, MapPin } from "lucide-react";
import nextilLogo from "@/assets/nextil-logo.png";

import brandBrandili from "@/assets/brand-brandili.jpg";
import brandKyly from "@/assets/brand-kyly.jpg";
import brandHering from "@/assets/brand-hering.jpg";
import brandMalwee from "@/assets/brand-malwee.jpg";
import brandLunender from "@/assets/brand-lunender.jpg";
import brandMarisol from "@/assets/brand-marisol.jpg";
import brandElian from "@/assets/brand-elian.jpg";
import brandColoritta from "@/assets/brand-coloritta.jpg";

// ── Data ──────────────────────────────────────────────

const segmentos = [
  { id: "sacoleira", label: "Sacoleira", emoji: "👜" },
  { id: "lojista", label: "Lojista", emoji: "🏪" },
  { id: "rede", label: "Rede de Lojas", emoji: "✨" },
  { id: "ecommerce", label: "E-commerce", emoji: "🌐" },
  { id: "atacadista", label: "Atacadista", emoji: "📦" },
  { id: "influencer", label: "Criador de Conteúdo", emoji: "📸" },
];

const portes = [
  { id: "micro", label: "Estou começando", desc: "Até R$ 81 mil/ano", emoji: "🌱" },
  { id: "pequeno", label: "Já tenho meu espaço", desc: "Até R$ 360 mil/ano", emoji: "🚀" },
  { id: "medio", label: "Estou crescendo", desc: "Até R$ 4,8 mi/ano", emoji: "📈" },
  { id: "grande", label: "Operação consolidada", desc: "Acima de R$ 4,8 mi/ano", emoji: "🏆" },
];

const regioes = [
  { id: "sul", label: "Sul", states: "PR, SC, RS", emoji: "🧉" },
  { id: "sudeste", label: "Sudeste", states: "SP, RJ, MG, ES", emoji: "🏙️" },
  { id: "centro-oeste", label: "Centro-Oeste", states: "GO, MT, MS, DF", emoji: "🌾" },
  { id: "nordeste", label: "Nordeste", states: "BA, PE, CE, MA...", emoji: "☀️" },
  { id: "norte", label: "Norte", states: "AM, PA, RO, AC...", emoji: "🌿" },
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

const marcasMock = [
  { slug: "brandili", name: "Brandili", logo: brandBrandili, category: "Infantil" },
  { slug: "kyly", name: "Kyly", logo: brandKyly, category: "Infantil" },
  { slug: "hering", name: "Hering", logo: brandHering, category: "Masculino" },
  { slug: "malwee", name: "Malwee", logo: brandMalwee, category: "Sustentável" },
  { slug: "lunender", name: "Lunender", logo: brandLunender, category: "Feminino" },
  { slug: "marisol", name: "Marisol", logo: brandMarisol, category: "Infantil" },
  { slug: "elian", name: "Elian", logo: brandElian, category: "Feminino" },
  { slug: "coloritta", name: "Colorittá", logo: brandColoritta, category: "Infantil" },
];

const investFaixas = [
  { id: "ate5k", label: "Até R$ 5 mil", emoji: "💰", desc: "Investimento inicial" },
  { id: "5a15k", label: "R$ 5 — 15 mil", emoji: "💵", desc: "Crescimento constante" },
  { id: "15a50k", label: "R$ 15 — 50 mil", emoji: "🏦", desc: "Escala profissional" },
  { id: "mais50k", label: "+R$ 50 mil", emoji: "🚀", desc: "Operação de grande porte" },
];

const TOTAL_STEPS = 8;

// ── Main Component ────────────────────────────────────

const Onboarding = () => {
  const [step, setStep] = useState(0);
  const [segmento, setSegmento] = useState("");
  const [porte, setPorte] = useState("");
  const [regiao, setRegiao] = useState("");
  const [interesses, setInteresses] = useState<string[]>([]);
  const [marcasConhecidas, setMarcasConhecidas] = useState<string[]>([]);
  const [faixaInvestimento, setFaixaInvestimento] = useState("");
  const [processing, setProcessing] = useState(false);
  const [processingText, setProcessingText] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [shakeNext, setShakeNext] = useState(false);

  const { completeOnboarding, user } = useAuth();
  const navigate = useNavigate();

  // Auto-advance for single-select steps
  const autoAdvance = useCallback((nextStep: number) => {
    setTimeout(() => setStep(nextStep), 400);
  }, []);

  // Validation per step
  const canNext = useCallback(() => {
    if (step === 0) return true;
    if (step === 1) return !!segmento;
    if (step === 2) return !!porte;
    if (step === 3) return !!regiao;
    if (step === 4) return interesses.length >= 3;
    if (step === 5) return true; // can skip
    if (step === 6) return !!faixaInvestimento;
    return true;
  }, [step, segmento, porte, regiao, interesses, faixaInvestimento]);

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

  // Step 7 → processing → results
  useEffect(() => {
    if (step === 7 && !processing && !showResults) {
      setProcessing(true);
      const texts = ["Analisando seu perfil...", "Encontrando marcas ideais...", "Montando sugestões personalizadas..."];
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
      }, 800);
      return () => clearInterval(iv);
    }
  }, [step]);

  // Match brands
  const matchedBrands = useMemo(() => {
    return marcasMock.filter((b) => interesses.includes(b.category) || marcasConhecidas.includes(b.slug));
  }, [interesses, marcasConhecidas]);

  const handleFinish = () => {
    completeOnboarding({
      segmento,
      porte,
      interesses,
      regiao,
      marcasConhecidas,
      faixaInvestimento,
    });
    navigate("/");
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
        <div className="w-24 h-24 md:w-28 md:h-28 rounded-3xl bg-primary flex items-center justify-center shadow-lg">
          <img src={nextilLogo} alt="Nextil" className="h-14 w-14 md:h-16 md:w-16 brightness-0 invert" />
        </div>
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-2xl md:text-4xl font-bold text-foreground text-center max-w-lg leading-tight"
      >
        Olá{user?.name ? `, ${user.name}` : ""}! Vamos personalizar sua experiência.
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-muted-foreground mt-4 text-center text-sm md:text-base"
      >
        Serão apenas algumas perguntas rápidas
      </motion.p>
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        onClick={handleNext}
        className="mt-10 flex items-center gap-2 px-10 h-14 rounded-full bg-primary text-primary-foreground font-bold text-lg shadow-lg hover:shadow-xl transition-all"
      >
        Começar
        <ArrowRight className="h-5 w-5" />
      </motion.button>
    </div>
  );

  // ── Step 1: Segmento (Grid, auto-advance) ──────

  const renderSegmento = () => (
    <div className="flex-1 flex flex-col items-center pt-8 px-4">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl md:text-3xl font-bold text-foreground text-center mb-2"
      >
        Como você atua?
      </motion.h2>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="text-muted-foreground text-sm mb-8 text-center">
        Selecione seu perfil
      </motion.p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full max-w-lg">
        {segmentos.map((s, i) => {
          const selected = segmento === s.id;
          return (
            <motion.button
              key={s.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => {
                setSegmento(s.id);
                autoAdvance(2);
              }}
              className={`relative p-5 rounded-2xl border-2 flex flex-col items-center gap-3 transition-colors ${
                selected
                  ? "border-accent bg-accent/10 shadow-md"
                  : "border-border bg-card hover:border-accent/40"
              }`}
            >
              {selected && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                  <Check className="h-3.5 w-3.5 text-accent-foreground" />
                </motion.div>
              )}
              <span className="text-4xl">{s.emoji}</span>
              <span className="text-sm font-semibold text-foreground">{s.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );

  // ── Step 2: Porte (Grid, auto-advance) ─────────

  const renderPorte = () => (
    <div className="flex-1 flex flex-col items-center pt-8 px-4">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl md:text-3xl font-bold text-foreground text-center mb-2"
      >
        Em que momento está seu negócio?
      </motion.h2>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="text-muted-foreground text-sm mb-8 text-center">
        Selecione o porte
      </motion.p>
      <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
        {portes.map((p, i) => {
          const selected = porte === p.id;
          return (
            <motion.button
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => {
                setPorte(p.id);
                autoAdvance(3);
              }}
              className={`relative p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-colors ${
                selected
                  ? "border-accent bg-accent/10 shadow-md"
                  : "border-border bg-card hover:border-accent/40"
              }`}
            >
              {selected && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                  <Check className="h-3.5 w-3.5 text-accent-foreground" />
                </motion.div>
              )}
              <span className="text-4xl">{p.emoji}</span>
              <span className="text-sm font-bold text-foreground text-center">{p.label}</span>
              <span className="text-xs text-muted-foreground text-center">{p.desc}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );

  // ── Step 3: Região (Vertical list, auto-advance) ──

  const renderRegiao = () => (
    <div className="flex-1 flex flex-col items-center pt-8 px-4">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl md:text-3xl font-bold text-foreground text-center mb-2"
      >
        De onde você compra?
      </motion.h2>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="text-muted-foreground text-sm mb-8 text-center">
        Selecione sua região principal
      </motion.p>
      <div className="flex flex-col gap-3 w-full max-w-md">
        {regioes.map((r, i) => {
          const selected = regiao === r.id;
          return (
            <motion.button
              key={r.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => {
                setRegiao(r.id);
                autoAdvance(4);
              }}
              className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-colors ${
                selected
                  ? "border-accent bg-accent/10"
                  : "border-border bg-card hover:border-accent/40"
              }`}
            >
              <span className="text-2xl">{r.emoji}</span>
              <div className="flex-1 text-left">
                <span className="text-sm font-bold text-foreground">{r.label}</span>
                <span className="text-xs text-muted-foreground ml-2">{r.states}</span>
              </div>
              {selected && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  <Check className="h-5 w-5 text-accent" />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );

  // ── Step 4: Interesses (Chips grid, multi-select) ──

  const renderInteresses = () => (
    <div className="flex-1 flex flex-col items-center pt-8 px-4">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl md:text-3xl font-bold text-foreground text-center mb-2"
      >
        O que te interessa?
      </motion.h2>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="text-muted-foreground text-sm mb-4 text-center">
        Selecione pelo menos 3 categorias
      </motion.p>

      {/* Progress bar */}
      <div className="w-full max-w-md mb-6">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-accent rounded-full"
              animate={{ width: `${Math.min((interesses.length / 3) * 100, 100)}%` }}
              transition={{ type: "spring", stiffness: 300 }}
            />
          </div>
          <span className={`text-xs font-bold ${interesses.length >= 3 ? "text-accent" : "text-muted-foreground"}`}>
            {interesses.length}/3
          </span>
        </div>
      </div>

      {/* Chips */}
      <div className="flex flex-wrap justify-center gap-3 max-w-xl">
        {interessesList.map((item, i) => {
          const selected = interesses.includes(item.label);
          return (
            <motion.button
              key={item.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setInteresses((prev) =>
                  prev.includes(item.label) ? prev.filter((x) => x !== item.label) : [...prev, item.label]
                );
              }}
              className={`px-5 py-3 rounded-full border-2 text-sm font-semibold transition-colors ${
                selected
                  ? "bg-accent text-accent-foreground border-accent"
                  : "bg-card border-border text-foreground hover:border-accent/40"
              }`}
            >
              <span className="mr-1.5">{item.emoji}</span>
              {item.label}
              {selected && <span className="ml-1.5">✓</span>}
            </motion.button>
          );
        })}
      </div>
    </div>
  );

  // ── Step 5: Marcas conhecidas (Grid, multi-select) ──

  const renderMarcas = () => (
    <div className="flex-1 flex flex-col items-center pt-8 px-4">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl md:text-3xl font-bold text-foreground text-center mb-2"
      >
        Quais marcas você já conhece?
      </motion.h2>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="text-muted-foreground text-sm mb-8 text-center">
        Toque nas marcas que você já comprou ou conhece — ou pule esta etapa
      </motion.p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl w-full">
        {marcasMock.map((m, i) => {
          const selected = marcasConhecidas.includes(m.slug);
          return (
            <motion.button
              key={m.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() =>
                setMarcasConhecidas((prev) =>
                  prev.includes(m.slug) ? prev.filter((x) => x !== m.slug) : [...prev, m.slug]
                )
              }
              className={`relative p-4 rounded-2xl border-2 flex flex-col items-center gap-3 transition-colors ${
                selected
                  ? "border-accent bg-accent/10 shadow-md"
                  : "border-border bg-card hover:border-accent/30"
              }`}
            >
              {selected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-accent flex items-center justify-center z-10"
                >
                  <Check className="h-3 w-3 text-accent-foreground" />
                </motion.div>
              )}
              <div className="w-16 h-16 rounded-xl overflow-hidden">
                <img src={m.logo} alt={m.name} className="w-full h-full object-cover" />
              </div>
              <span className="text-xs font-bold text-foreground">{m.name}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );

  // ── Step 6: Investimento (Grid, auto-advance) ──────

  const renderInvestimento = () => (
    <div className="flex-1 flex flex-col items-center pt-8 px-4">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl md:text-3xl font-bold text-foreground text-center mb-2"
      >
        Quanto pretende investir por mês?
      </motion.h2>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="text-muted-foreground text-sm mb-8 text-center">
        Isso nos ajuda a calibrar marcas e condições ideais
      </motion.p>
      <div className="grid grid-cols-2 gap-4 max-w-lg w-full">
        {investFaixas.map((f, i) => {
          const selected = faixaInvestimento === f.id;
          return (
            <motion.button
              key={f.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => {
                setFaixaInvestimento(f.id);
                autoAdvance(7);
              }}
              className={`relative p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-colors ${
                selected
                  ? "border-accent bg-accent/10 shadow-md"
                  : "border-border bg-card hover:border-accent/40"
              }`}
            >
              {selected && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                  <Check className="h-3.5 w-3.5 text-accent-foreground" />
                </motion.div>
              )}
              <span className="text-4xl">{f.emoji}</span>
              <span className="text-sm font-bold text-foreground">{f.label}</span>
              <span className="text-xs text-muted-foreground text-center">{f.desc}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );

  // ── Step 7: Result ────────────────────────────

  const renderResultado = () => (
    <div className="flex-1 flex flex-col items-center justify-center px-4">
      <AnimatePresence mode="wait">
        {processing ? (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-6"
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
            className="w-full max-w-2xl"
          >
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-bold mb-4"
              >
                <Sparkles className="h-4 w-4" />
                {matchedBrands.length} marcas encontradas
              </motion.div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                Suas marcas ideais
              </h2>
              <p className="text-muted-foreground text-sm mt-2">
                Com base no seu perfil, estas marcas combinam com você
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {matchedBrands.map((brand, i) => {
                const isKnown = marcasConhecidas.includes(brand.slug);
                return (
                  <motion.div
                    key={brand.slug}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="relative p-4 rounded-2xl border-2 border-border bg-card flex flex-col items-center gap-3 hover:border-accent/40 transition-colors"
                  >
                    {isKnown && (
                      <span className="absolute -top-2 left-2 text-[10px] bg-accent/15 text-accent px-2 py-0.5 rounded-full font-bold">
                        Já conhece
                      </span>
                    )}
                    <div className="w-14 h-14 rounded-xl overflow-hidden">
                      <img src={brand.logo} alt={brand.name} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-xs font-bold text-foreground text-center">{brand.name}</span>
                    <span className="text-[10px] text-muted-foreground">{brand.category}</span>
                    <button className="w-full mt-1 text-[10px] bg-accent/10 hover:bg-accent hover:text-accent-foreground text-accent py-1.5 rounded-full font-bold transition-colors">
                      Solicitar conexão
                    </button>
                  </motion.div>
                );
              })}
            </div>

            {matchedBrands.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg font-medium mb-2">Nenhuma marca encontrada com esses critérios</p>
                <p className="text-sm">Tente ajustar seus interesses para ver mais opções</p>
              </div>
            )}

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              onClick={handleFinish}
              className="w-full max-w-sm mx-auto flex items-center justify-center gap-2 h-14 rounded-full bg-primary text-primary-foreground font-bold text-lg shadow-lg hover:shadow-xl transition-all"
            >
              <Zap className="h-5 w-5" />
              Explorar plataforma
            </motion.button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );

  // ── Render ──────────────────────────────────

  const steps = [renderIntro, renderSegmento, renderPorte, renderRegiao, renderInteresses, renderMarcas, renderInvestimento, renderResultado];

  // Determine if current step is multi-select (needs Continue button)
  const isMultiSelectStep = step === 4 || step === 5;
  const showFooter = step > 0 && step < 7;

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2.5">
          <img src={nextilLogo} alt="Nextil" className="h-7 w-7" />
        </div>
        <button onClick={handleSkip} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          Pular por agora
        </button>
      </div>

      {/* Progress */}
      {step > 0 && step < 7 && (
        <div className="px-5">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-1.5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                    i < step ? "bg-accent" : "bg-secondary"
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
          className="flex-1 flex flex-col"
        >
          {steps[step]()}
        </motion.div>
      </AnimatePresence>

      {/* Footer — only for multi-select steps */}
      {showFooter && isMultiSelectStep && (
        <div className="px-5 py-5">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            <button
              onClick={() => step > 0 && setStep(step - 1)}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Voltar
            </button>
            <motion.button
              onClick={handleNext}
              animate={shakeNext ? { x: [0, -8, 8, -8, 8, 0] } : {}}
              transition={{ duration: 0.4 }}
              className={`flex items-center gap-2 px-8 h-12 rounded-full font-bold transition-all shadow-lg ${
                canNext()
                  ? "bg-primary text-primary-foreground hover:shadow-xl"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {step === 5 && marcasConhecidas.length === 0 ? "Pular" : "Continuar"}
              <ArrowRight className="h-4 w-4" />
            </motion.button>
          </div>
        </div>
      )}

      {/* Back button for single-select steps */}
      {showFooter && !isMultiSelectStep && (
        <div className="px-5 py-5">
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => step > 0 && setStep(step - 1)}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Voltar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Onboarding;
