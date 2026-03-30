import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { Check, ArrowRight, X, Zap, Search, Sparkles, MapPin } from "lucide-react";
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
  { id: "sul", label: "Sul", states: "PR, SC, RS" },
  { id: "sudeste", label: "Sudeste", states: "SP, RJ, MG, ES" },
  { id: "centro-oeste", label: "Centro-Oeste", states: "GO, MT, MS, DF" },
  { id: "nordeste", label: "Nordeste", states: "BA, PE, CE, MA..." },
  { id: "norte", label: "Norte", states: "AM, PA, RO, AC..." },
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

// ── Particles ─────────────────────────────────────────

const Particles = ({ count = 30 }: { count?: number }) => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {Array.from({ length: count }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 rounded-full bg-accent/40"
        initial={{
          x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1000),
          y: Math.random() * (typeof window !== "undefined" ? window.innerHeight : 800),
          opacity: 0,
        }}
        animate={{
          y: [null, Math.random() * -200 - 100],
          opacity: [0, 0.8, 0],
          scale: [0.5, 1.5, 0.5],
        }}
        transition={{
          duration: 3 + Math.random() * 4,
          repeat: Infinity,
          delay: Math.random() * 3,
          ease: "easeInOut",
        }}
      />
    ))}
  </div>
);

// ── Typewriter ────────────────────────────────────────

const Typewriter = ({ text, onDone }: { text: string; onDone?: () => void }) => {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    setDisplayed("");
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(iv);
        onDone?.();
      }
    }, 45);
    return () => clearInterval(iv);
  }, [text]);
  return (
    <span>
      {displayed}
      <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity }} className="inline-block w-0.5 h-6 bg-accent ml-1 align-middle" />
    </span>
  );
};

// ── Swipe Card ────────────────────────────────────────

const SwipeCard = ({
  item,
  onSwipe,
  isTop,
}: {
  item: { id: string; label: string; emoji: string };
  onSwipe: (id: string) => void;
  isTop: boolean;
}) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);
  const selectOpacity = useTransform(x, [0, 80, 150], [0, 0.5, 1]);
  const rejectOpacity = useTransform(x, [-150, -80, 0], [1, 0.5, 0]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x > 80) {
      onSwipe(item.id);
    }
  };

  if (!isTop) {
    return (
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        style={{ scale: 0.95 }}
      >
        <div className="w-72 h-80 md:w-80 md:h-96 rounded-3xl bg-card/50 border border-border/50 backdrop-blur-sm" />
      </motion.div>
    );
  }

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center z-10 cursor-grab active:cursor-grabbing"
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.8}
      style={{ x, rotate, opacity }}
      onDragEnd={handleDragEnd}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ x: 300, opacity: 0, transition: { duration: 0.3 } }}
    >
      <div className="w-72 h-80 md:w-80 md:h-96 rounded-3xl bg-card border-2 border-border shadow-2xl flex flex-col items-center justify-center gap-6 relative overflow-hidden">
        <motion.div
          className="absolute top-4 right-4 bg-green-500/20 text-green-500 px-3 py-1 rounded-full text-sm font-bold"
          style={{ opacity: selectOpacity }}
        >
          ✓ Sou eu!
        </motion.div>
        <motion.div
          className="absolute top-4 left-4 bg-red-500/20 text-red-500 px-3 py-1 rounded-full text-sm font-bold"
          style={{ opacity: rejectOpacity }}
        >
          ✗ Próximo
        </motion.div>
        <span className="text-7xl md:text-8xl">{item.emoji}</span>
        <span className="text-xl md:text-2xl font-bold text-foreground">{item.label}</span>
        <span className="text-sm text-muted-foreground">Arraste para a direita →</span>
      </div>
    </motion.div>
  );
};

// ── Main Component ────────────────────────────────────

const Onboarding = () => {
  const [step, setStep] = useState(0);
  const [segmento, setSegmento] = useState("");
  const [porte, setPorte] = useState("");
  const [regiao, setRegiao] = useState("");
  const [interesses, setInteresses] = useState<string[]>([]);
  const [marcasConhecidas, setMarcasConhecidas] = useState<string[]>([]);
  const [faixaInvestimento, setFaixaInvestimento] = useState("");
  const [introReady, setIntroReady] = useState(false);
  const [swipeStack, setSwipeStack] = useState([...segmentos].reverse());
  const [processing, setProcessing] = useState(false);
  const [processingText, setProcessingText] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [shakeNext, setShakeNext] = useState(false);

  const { completeOnboarding, user } = useAuth();
  const navigate = useNavigate();

  // Progress
  const progress = step === 0 ? 5 : (step / (TOTAL_STEPS - 1)) * 100;

  // Validation per step
  const canNext = useCallback(() => {
    if (step === 0) return introReady;
    if (step === 1) return !!segmento;
    if (step === 2) return !!porte;
    if (step === 3) return !!regiao;
    if (step === 4) return interesses.length >= 3;
    if (step === 5) return true; // can skip
    if (step === 6) return !!faixaInvestimento;
    return true;
  }, [step, introReady, segmento, porte, regiao, interesses, faixaInvestimento]);

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

  const handleSwipe = (id: string) => {
    setSegmento(id);
    setSwipeStack((prev) => prev.filter((s) => s.id !== id));
    setTimeout(() => setStep(2), 400);
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
      }, 1000);
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

  // ── Step 0: Cinematic Intro ────────────────

  const renderIntro = () => (
    <motion.div
      className="flex-1 flex flex-col items-center justify-center relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <Particles count={40} />
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", damping: 12, stiffness: 100, delay: 0.3 }}
        className="mb-8"
      >
        <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/30">
          <img src={nextilLogo} alt="Nextil" className="h-14 w-14 md:h-20 md:w-20 brightness-0 invert" />
        </div>
      </motion.div>
      <h1 className="text-2xl md:text-4xl font-bold text-foreground text-center max-w-lg leading-tight">
        <Typewriter
          text={`Olá${user?.name ? `, ${user.name}` : ""}! Vamos personalizar sua experiência.`}
          onDone={() => setIntroReady(true)}
        />
      </h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: introReady ? 1 : 0 }}
        className="text-muted-foreground mt-4 text-center text-sm md:text-base"
      >
        Serão apenas algumas perguntas rápidas
      </motion.p>
    </motion.div>
  );

  // ── Step 1: Segmento (Swipe) ───────────────

  const renderSegmento = () => (
    <div className="flex-1 flex flex-col items-center pt-8">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl md:text-3xl font-bold text-foreground text-center mb-2"
      >
        Como você atua?
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-muted-foreground text-sm mb-8 text-center"
      >
        Arraste o card para a direita quando encontrar o seu perfil
      </motion.p>

      {segmento && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="mb-4 px-4 py-2 rounded-full bg-accent/10 border border-accent/30 text-accent text-sm font-medium"
        >
          ✓ {segmentos.find((s) => s.id === segmento)?.label}
        </motion.div>
      )}

      <div className="relative flex-1 w-full max-w-sm mx-auto">
        <AnimatePresence>
          {swipeStack.slice(-2).map((item, i) => (
            <SwipeCard
              key={item.id}
              item={item}
              onSwipe={handleSwipe}
              isTop={i === swipeStack.slice(-2).length - 1}
            />
          ))}
        </AnimatePresence>
        {swipeStack.length === 0 && !segmento && (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Nenhum card restante
          </div>
        )}
      </div>
    </div>
  );

  // ── Step 2: Porte (Expanding cards) ────────

  const renderPorte = () => (
    <div className="flex-1 flex flex-col items-center pt-8 px-4">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl md:text-3xl font-bold text-foreground text-center mb-2"
      >
        Em que momento está seu negócio?
      </motion.h2>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-muted-foreground text-sm mb-10 text-center">
        Toque para selecionar
      </motion.p>
      <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
        {portes.map((p, i) => {
          const selected = porte === p.id;
          return (
            <motion.button
              key={p.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: 1,
                scale: selected ? 1.08 : porte && !selected ? 0.92 : 1,
                filter: porte && !selected ? "blur(1px)" : "blur(0px)",
              }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 200 }}
              onClick={() => setPorte(p.id)}
              className={`relative p-6 rounded-3xl border-2 transition-colors duration-300 flex flex-col items-center gap-3 ${
                selected
                  ? "border-accent bg-accent/10 shadow-xl shadow-accent/20"
                  : "border-border bg-card hover:border-accent/30"
              }`}
            >
              {selected && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-accent flex items-center justify-center">
                  <Check className="h-4 w-4 text-accent-foreground" />
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

  // ── Step 3: Região (Interactive map) ───────

  const renderRegiao = () => (
    <div className="flex-1 flex flex-col items-center pt-8 px-4">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl md:text-3xl font-bold text-foreground text-center mb-2"
      >
        De onde você compra?
      </motion.h2>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-muted-foreground text-sm mb-10 text-center">
        Selecione sua região principal
      </motion.p>
      <div className="relative w-72 h-80 md:w-80 md:h-96 mx-auto">
        {/* Stylized Brazil map regions as positioned blocks */}
        {regioes.map((r, i) => {
          const selected = regiao === r.id;
          const positions: Record<string, string> = {
            norte: "top-0 left-1/2 -translate-x-1/2",
            nordeste: "top-12 right-0",
            "centro-oeste": "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
            sudeste: "bottom-16 right-4",
            sul: "bottom-0 left-1/2 -translate-x-1/2",
          };
          return (
            <motion.button
              key={r.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: 1,
                scale: selected ? 1.15 : 1,
                boxShadow: selected ? "0 0 30px hsl(var(--accent) / 0.4)" : "0 0 0px transparent",
              }}
              transition={{ delay: i * 0.12, type: "spring" }}
              onClick={() => setRegiao(r.id)}
              className={`absolute ${positions[r.id]} w-28 h-20 md:w-32 md:h-24 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-colors ${
                selected
                  ? "border-accent bg-accent/15 text-accent"
                  : "border-border bg-card text-foreground hover:border-accent/40"
              }`}
            >
              <MapPin className={`h-4 w-4 ${selected ? "text-accent" : "text-muted-foreground"}`} />
              <span className="text-xs font-bold">{r.label}</span>
              <span className="text-[10px] text-muted-foreground">{r.states}</span>
              {selected && (
                <motion.div
                  className="absolute inset-0 rounded-2xl border-2 border-accent"
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );

  // ── Step 4: Interesses (Floating bubbles) ──

  const renderInteresses = () => (
    <div className="flex-1 flex flex-col items-center pt-8 px-4">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl md:text-3xl font-bold text-foreground text-center mb-2"
      >
        O que te interessa?
      </motion.h2>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-muted-foreground text-sm mb-4 text-center">
        Selecione pelo menos 3 categorias
      </motion.p>

      {/* Collected bar */}
      <div className="w-full max-w-md mb-6">
        <div className="flex items-center gap-2 mb-2">
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
        {interesses.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {interesses.map((int) => (
              <motion.span
                key={int}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="text-xs bg-accent/15 text-accent px-2 py-1 rounded-full font-medium"
              >
                {int}
              </motion.span>
            ))}
          </div>
        )}
      </div>

      {/* Floating bubbles */}
      <div className="flex flex-wrap justify-center gap-3 max-w-xl">
        {interessesList.map((item, i) => {
          const selected = interesses.includes(item.label);
          return (
            <motion.button
              key={item.label}
              initial={{ opacity: 0, y: 30, scale: 0.5 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: selected ? 1.1 : 1,
              }}
              whileHover={{ scale: 1.1, y: -4 }}
              whileTap={{ scale: 0.95 }}
              transition={{ delay: i * 0.05, type: "spring", stiffness: 300 }}
              onClick={() => {
                setInteresses((prev) =>
                  prev.includes(item.label) ? prev.filter((x) => x !== item.label) : [...prev, item.label]
                );
              }}
              className={`relative px-5 py-3 rounded-full border-2 text-sm font-semibold transition-colors ${
                selected
                  ? "bg-accent text-accent-foreground border-accent shadow-lg shadow-accent/20"
                  : "bg-card border-border text-foreground hover:border-accent/40"
              }`}
              style={{
                animation: !selected ? `float ${3 + (i % 3)}s ease-in-out infinite ${i * 0.2}s` : undefined,
              }}
            >
              <span className="mr-1.5">{item.emoji}</span>
              {item.label}
              {selected && (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-1.5">
                  ✓
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );

  // ── Step 5: Marcas conhecidas (Logo wall) ──

  const renderMarcas = () => (
    <div className="flex-1 flex flex-col items-center pt-8 px-4">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl md:text-3xl font-bold text-foreground text-center mb-2"
      >
        Quais marcas você já conhece?
      </motion.h2>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-muted-foreground text-sm mb-10 text-center">
        Toque nas marcas que você já comprou ou conhece — ou pule esta etapa
      </motion.p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl w-full">
        {marcasMock.map((m, i) => {
          const selected = marcasConhecidas.includes(m.slug);
          return (
            <motion.button
              key={m.slug}
              initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
              animate={{
                opacity: 1,
                scale: 1,
                rotate: 0,
              }}
              whileHover={{ y: -6 }}
              transition={{ delay: i * 0.08, type: "spring" }}
              onClick={() =>
                setMarcasConhecidas((prev) =>
                  prev.includes(m.slug) ? prev.filter((x) => x !== m.slug) : [...prev, m.slug]
                )
              }
              className={`relative p-4 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${
                selected
                  ? "border-accent bg-accent/10 shadow-xl shadow-accent/20"
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
              {selected && (
                <motion.div
                  className="absolute inset-0 rounded-2xl"
                  animate={{ boxShadow: ["0 0 0px hsl(var(--accent) / 0)", "0 0 20px hsl(var(--accent) / 0.3)", "0 0 0px hsl(var(--accent) / 0)"] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );

  // ── Step 6: Investimento (Visual blocks) ───

  const renderInvestimento = () => (
    <div className="flex-1 flex flex-col items-center pt-8 px-4">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl md:text-3xl font-bold text-foreground text-center mb-2"
      >
        Quanto pretende investir por mês?
      </motion.h2>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-muted-foreground text-sm mb-10 text-center">
        Isso nos ajuda a calibrar marcas e condições ideais
      </motion.p>
      <div className="grid grid-cols-2 gap-4 max-w-lg w-full">
        {investFaixas.map((f, i) => {
          const selected = faixaInvestimento === f.id;
          return (
            <motion.button
              key={f.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: selected ? 1.05 : faixaInvestimento && !selected ? 0.95 : 1,
              }}
              transition={{ delay: i * 0.1, type: "spring" }}
              onClick={() => setFaixaInvestimento(f.id)}
              className={`relative p-6 rounded-3xl border-2 flex flex-col items-center gap-3 transition-colors ${
                selected
                  ? "border-accent bg-accent/10 shadow-xl shadow-accent/20"
                  : "border-border bg-card hover:border-accent/30"
              }`}
            >
              {selected && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-accent flex items-center justify-center">
                  <Check className="h-4 w-4 text-accent-foreground" />
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

  // ── Step 7: Result (Unlock) ────────────────

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
              className="w-24 h-24 rounded-full border-4 border-accent/30 border-t-accent"
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
            <Particles count={20} />
          </motion.div>
        ) : showResults ? (
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl"
          >
            <motion.div className="text-center mb-8" initial={{ y: -20 }} animate={{ y: 0 }}>
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
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {matchedBrands.map((brand, i) => {
                const isKnown = marcasConhecidas.includes(brand.slug);
                return (
                  <motion.div
                    key={brand.slug}
                    initial={{ opacity: 0, y: 40, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.3 + i * 0.15, type: "spring" }}
                    className="relative p-4 rounded-2xl border-2 border-border bg-card flex flex-col items-center gap-3 group hover:border-accent/40 transition-colors"
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
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 text-muted-foreground"
              >
                <p className="text-lg font-medium mb-2">Nenhuma marca encontrada com esses critérios</p>
                <p className="text-sm">Tente ajustar seus interesses para ver mais opções</p>
              </motion.div>
            )}

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              onClick={handleFinish}
              className="w-full max-w-sm mx-auto flex items-center justify-center gap-2 h-14 rounded-full bg-primary text-primary-foreground font-bold text-lg shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all"
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

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden relative">
      {/* Ambient particles */}
      <Particles count={15} />

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 relative z-20">
        <div className="flex items-center gap-2.5">
          <img src={nextilLogo} alt="Nextil" className="h-7 w-7" />
        </div>
        <button onClick={handleSkip} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          Pular por agora
        </button>
      </div>

      {/* Progress */}
      {step > 0 && step < 7 && (
        <div className="px-5 relative z-20">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-2 mb-1">
              {Array.from({ length: TOTAL_STEPS - 2 }).map((_, i) => (
                <motion.div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    i < step ? "bg-accent" : "bg-secondary"
                  }`}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: i * 0.05 }}
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
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -60 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="flex-1 flex flex-col relative z-10"
        >
          {steps[step]()}
        </motion.div>
      </AnimatePresence>

      {/* Footer (not on intro & result) */}
      {step > 0 && step < 7 && (
        <div className="px-5 py-5 relative z-20">
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
                  ? "bg-primary text-primary-foreground hover:shadow-xl shadow-primary/20"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {step === 5 && marcasConhecidas.length === 0 ? "Pular" : "Continuar"}
              <ArrowRight className="h-4 w-4" />
            </motion.button>
          </div>
        </div>
      )}

      {/* Intro CTA */}
      {step === 0 && introReady && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-5 py-5 flex justify-center relative z-20"
        >
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-10 h-14 rounded-full bg-primary text-primary-foreground font-bold text-lg shadow-xl shadow-primary/20 hover:shadow-2xl transition-all animate-pulse"
          >
            Começar
            <ArrowRight className="h-5 w-5" />
          </button>
        </motion.div>
      )}

      {/* Float animation keyframes */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
};

export default Onboarding;
