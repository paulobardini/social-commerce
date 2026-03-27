import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Baby, User, Users, Shirt, Scissors, Sun, Snowflake, CloudSun,
  Sparkles, X, ArrowLeft, ArrowRight, RotateCcw, ShoppingBag,
  Heart, Zap, Crown, Star, Package, ChevronRight, Minus, Plus,
  Target, Search, TrendingUp, Check
} from "lucide-react";
import { brands as allBrands } from "@/data/mockProducts";

/* ─── types ─── */
interface QuizAnswers {
  tipo: string[];
  genero: string;
  idade: string;
  categoria: string[];
  estilo: string[];
  estacao: string;
  tamanho: string[];
  valorRange: [number, number];
  quantidade: number;
}

const initialAnswers: QuizAnswers = {
  tipo: [],
  genero: "",
  idade: "",
  categoria: [],
  estilo: [],
  estacao: "",
  tamanho: [],
  valorRange: [0, 500],
  quantidade: 100,
};

/* ─── step config ─── */
const TOTAL_STEPS = 10; // 0=welcome, 1-9=questions

const aiMessages = [
  "Olá! Sou sua assistente de compras inteligente 🤖",
  "O que você está buscando hoje?",
  "Para quem são esses produtos?",
  "Qual a faixa etária?",
  "Que tipo de peça você procura?",
  "Qual o estilo desejado?",
  "Para qual estação?",
  "Quais tamanhos você precisa?",
  "Quanto quer investir por peça?",
  "Quantas peças você precisa?",
];

const tipoOptions = [
  { id: "adulto", label: "Adulto", icon: User, gradient: "from-blue-500 to-indigo-600" },
  { id: "infantil", label: "Infantil", icon: Baby, gradient: "from-pink-400 to-rose-500" },
  { id: "verao", label: "Verão", icon: Sun, gradient: "from-amber-400 to-orange-500" },
  { id: "inverno", label: "Inverno", icon: Snowflake, gradient: "from-cyan-400 to-blue-500" },
  { id: "kits", label: "Kits", icon: Package, gradient: "from-emerald-400 to-teal-500" },
  { id: "colecao", label: "Coleção", icon: Crown, gradient: "from-purple-400 to-violet-500" },
];

const generoOptions = [
  { id: "Masculino", label: "Masculino", icon: User, color: "from-blue-400 to-blue-600" },
  { id: "Feminino", label: "Feminino", icon: Heart, color: "from-pink-400 to-pink-600" },
  { id: "Unissex", label: "Unissex", icon: Users, color: "from-violet-400 to-violet-600" },
];

const idadeOptions = [
  { id: "bebe", label: "Bebê", sub: "0-2 anos", position: 0 },
  { id: "kids", label: "Kids", sub: "2-8 anos", position: 33 },
  { id: "teen", label: "Teen", sub: "8-14 anos", position: 66 },
  { id: "adulto", label: "Adulto", sub: "15+", position: 100 },
];

const categoriaOptions = [
  { id: "Camiseta", label: "Camiseta", icon: Shirt },
  { id: "Calça", label: "Calça", icon: Scissors },
  { id: "Vestido", label: "Vestido", icon: Sparkles },
  { id: "Conjunto", label: "Conjunto", icon: Package },
  { id: "Jaqueta", label: "Jaqueta", icon: Snowflake },
  { id: "Bermuda", label: "Bermuda", icon: Sun },
  { id: "Blusa", label: "Blusa", icon: Star },
  { id: "Saia", label: "Saia", icon: Heart },
];

const estiloOptions = [
  { id: "basico", label: "Básico", gradient: "from-gray-400 to-gray-600", desc: "Essenciais do guarda-roupa" },
  { id: "casual", label: "Casual", gradient: "from-green-400 to-emerald-600", desc: "Dia a dia confortável" },
  { id: "fashion", label: "Fashion", gradient: "from-fuchsia-400 to-purple-600", desc: "Tendências e ousadia" },
  { id: "social", label: "Social", gradient: "from-amber-400 to-yellow-600", desc: "Elegância e formalidade" },
  { id: "esportivo", label: "Esportivo", gradient: "from-cyan-400 to-blue-600", desc: "Performance e conforto" },
];

const estacaoOptions = [
  { id: "verao", label: "Primavera / Verão", icon: Sun, bg: "from-amber-300 via-orange-300 to-yellow-200" },
  { id: "inverno", label: "Outono / Inverno", icon: Snowflake, bg: "from-blue-300 via-indigo-300 to-slate-200" },
  { id: "meia", label: "Meia-estação", icon: CloudSun, bg: "from-emerald-300 via-teal-200 to-lime-200" },
];

const tamanhoInfantil = ["RN", "P", "M", "G", "1", "2", "3", "4", "6", "8", "10", "12", "14", "16"];
const tamanhoAdulto = ["PP", "P", "M", "G", "GG", "XG", "XXG", "34", "36", "38", "40", "42", "44", "46"];

const quantidadeSugestoes = [50, 100, 200, 500, 1000];

/* ─── Typewriter ─── */
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
    }, 30);
    return () => clearInterval(iv);
  }, [text]);
  return (
    <span className="text-foreground">
      {displayed}
      <span className="animate-pulse text-primary">|</span>
    </span>
  );
};

/* ─── Floating Particles (CSS-only feel via framer) ─── */
const Particles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {Array.from({ length: 20 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 rounded-full bg-primary/20"
        initial={{
          x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 800),
          y: Math.random() * (typeof window !== "undefined" ? window.innerHeight : 600),
        }}
        animate={{
          y: [null, Math.random() * -200 - 100],
          opacity: [0, 0.6, 0],
        }}
        transition={{
          duration: 4 + Math.random() * 4,
          repeat: Infinity,
          delay: Math.random() * 3,
        }}
      />
    ))}
  </div>
);

/* ─── Progress Bar ─── */
const ProgressBar = ({ step }: { step: number }) => {
  const pct = step === 0 ? 0 : (step / (TOTAL_STEPS - 1)) * 100;
  return (
    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-gradient-to-r from-primary via-accent to-primary rounded-full"
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{ boxShadow: "0 0 12px hsl(var(--primary) / 0.5)" }}
      />
    </div>
  );
};

/* ─── Main Component ─── */
interface SmartBuyerQuizProps {
  open: boolean;
  onClose: () => void;
}

export const SmartBuyerQuiz = ({ open, onClose }: SmartBuyerQuizProps) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({ ...initialAnswers });
  const [typing, setTyping] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeText, setAnalyzeText] = useState("");
  const [direction, setDirection] = useState(1);
  const [sliderValue, setSliderValue] = useState(250);

  const reset = () => {
    setStep(0);
    setAnswers({ ...initialAnswers });
    setTyping(true);
    setAnalyzing(false);
    setAnalyzeText("");
    setSliderValue(250);
  };

  const canProceed = useCallback(() => {
    switch (step) {
      case 0: return true;
      case 1: return answers.tipo.length > 0;
      case 2: return !!answers.genero;
      case 3: return !!answers.idade;
      case 4: return answers.categoria.length > 0;
      case 5: return answers.estilo.length > 0;
      case 6: return !!answers.estacao;
      case 7: return answers.tamanho.length > 0;
      case 8: return true;
      case 9: return answers.quantidade > 0;
      default: return false;
    }
  }, [step, answers]);

  const goNext = () => {
    if (!canProceed()) return;
    if (step === 9) {
      runAnalysis();
      return;
    }
    setDirection(1);
    setTyping(true);
    setStep((s) => s + 1);
  };

  const goBack = () => {
    if (step === 0) return;
    setDirection(-1);
    setTyping(true);
    setStep((s) => s - 1);
  };

  const runAnalysis = () => {
    setAnalyzing(true);
    const msgs = ["Cruzando dados...", "Encontrando marcas...", "Calculando compatibilidade...", "Montando orçamento..."];
    let i = 0;
    setAnalyzeText(msgs[0]);
    const iv = setInterval(() => {
      i++;
      if (i < msgs.length) {
        setAnalyzeText(msgs[i]);
      } else {
        clearInterval(iv);
        setStep(TOTAL_STEPS);
        setAnalyzing(false);
      }
    }, 800);
  };

  // Matching logic
  const getResults = () => {
    return allBrands.map((brand) => {
      let score = 0;
      let total = 0;
      const products = brand.products;

      // Gender match
      if (answers.genero) {
        total += 30;
        const genderMatch = products.filter(
          (p) => p.gender === answers.genero || p.gender === "Unissex"
        ).length;
        score += Math.min(30, (genderMatch / Math.max(products.length, 1)) * 30);
      }

      // Category match
      if (answers.categoria.length > 0) {
        total += 30;
        const catMatch = products.filter((p) =>
          answers.categoria.includes(p.category)
        ).length;
        score += Math.min(30, (catMatch / Math.max(products.length, 1)) * 40);
      }

      // Price match
      total += 20;
      const avgPrice =
        products.reduce((s, p) => s + p.price, 0) / Math.max(products.length, 1);
      if (avgPrice <= sliderValue) score += 20;
      else if (avgPrice <= sliderValue * 1.3) score += 10;

      // Size match
      if (answers.tamanho.length > 0) {
        total += 20;
        const sizeMatch = products.filter((p) =>
          p.sizes.some((s) => answers.tamanho.includes(s))
        ).length;
        score += Math.min(20, (sizeMatch / Math.max(products.length, 1)) * 25);
      }

      const pct = total > 0 ? Math.round((score / total) * 100) : 50;
      const connected = brand.connections > 10;
      const avgP =
        products.reduce((s, p) => s + p.price, 0) / Math.max(products.length, 1);

      return {
        brand,
        score: Math.min(pct, 99),
        connected,
        avgPrice: avgP,
        estimatedTotal: avgP * answers.quantidade,
      };
    })
      .sort((a, b) => b.score - a.score);
  };

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -300 : 300, opacity: 0 }),
  };

  if (!open) return null;

  const toggleArray = (arr: string[], val: string) =>
    arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];

  const tamanhos = answers.tipo.includes("infantil") || answers.idade === "kids" || answers.idade === "teen" || answers.idade === "bebe"
    ? tamanhoInfantil : tamanhoAdulto;

  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-background flex flex-col overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Particles />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-4 md:px-8 py-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-sm font-semibold text-foreground">Comprador Inteligente</span>
        </div>
        <button
          onClick={() => { reset(); onClose(); }}
          className="p-2 rounded-full hover:bg-muted transition-colors"
        >
          <X className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      {/* Progress */}
      {step > 0 && step < TOTAL_STEPS && !analyzing && (
        <div className="px-4 md:px-8 mb-2">
          <ProgressBar step={step} />
          <p className="text-xs text-muted-foreground mt-1 text-right">{step} de {TOTAL_STEPS - 1}</p>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-8 relative overflow-hidden">
        {/* Analyzing overlay */}
        {analyzing && (
          <motion.div
            className="flex flex-col items-center gap-6"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <motion.div
              className="h-24 w-24 rounded-full border-4 border-primary/30 border-t-primary"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <motion.p
              key={analyzeText}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-lg font-medium text-foreground"
            >
              {analyzeText}
            </motion.p>
          </motion.div>
        )}

        {/* Steps */}
        {!analyzing && step < TOTAL_STEPS && (
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="w-full max-w-2xl mx-auto flex flex-col items-center"
            >
              {/* AI message */}
              <div className="mb-8 text-center">
                <h2 className="text-2xl md:text-3xl font-bold mb-2">
                  {typing ? (
                    <Typewriter text={aiMessages[step]} onDone={() => setTyping(false)} />
                  ) : (
                    aiMessages[step]
                  )}
                </h2>
                {step === 0 && !typing && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-muted-foreground mt-2"
                  >
                    Responda algumas perguntas rápidas e encontrarei as melhores marcas para você
                  </motion.p>
                )}
              </div>

              {/* Step 0 — Welcome */}
              {step === 0 && !typing && (
                <motion.button
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={goNext}
                  className="px-10 py-4 rounded-2xl bg-gradient-to-r from-primary to-accent text-primary-foreground text-lg font-bold shadow-lg"
                  style={{ boxShadow: "0 0 30px hsl(var(--primary) / 0.4)" }}
                >
                  <span className="flex items-center gap-2">
                    Começar <Zap className="h-5 w-5" />
                  </span>
                </motion.button>
              )}

              {/* Step 1 — Tipo */}
              {step === 1 && !typing && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full"
                >
                  {tipoOptions.map((opt) => {
                    const selected = answers.tipo.includes(opt.id);
                    return (
                      <motion.button
                        key={opt.id}
                        whileHover={{ scale: 1.03, rotateY: 5 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setAnswers((a) => ({ ...a, tipo: toggleArray(a.tipo, opt.id) }))}
                        className={`relative p-5 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-3 overflow-hidden ${
                          selected
                            ? "border-primary bg-primary/10 shadow-lg"
                            : "border-border bg-card hover:border-primary/40"
                        }`}
                        style={selected ? { boxShadow: "0 0 20px hsl(var(--primary) / 0.3)" } : {}}
                      >
                        <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${opt.gradient} flex items-center justify-center text-white`}>
                          <opt.icon className="h-6 w-6" />
                        </div>
                        <span className="font-semibold text-foreground text-sm">{opt.label}</span>
                        {selected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center"
                          >
                            <Check className="h-3 w-3 text-primary-foreground" />
                          </motion.div>
                        )}
                      </motion.button>
                    );
                  })}
                </motion.div>
              )}

              {/* Step 2 — Gênero */}
              {step === 2 && !typing && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-4 md:gap-6 justify-center"
                >
                  {generoOptions.map((opt) => {
                    const selected = answers.genero === opt.id;
                    return (
                      <motion.button
                        key={opt.id}
                        whileHover={{ y: -8, boxShadow: "0 20px 40px -10px rgba(0,0,0,0.3)" }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setAnswers((a) => ({ ...a, genero: opt.id }))}
                        className={`flex flex-col items-center gap-3 p-6 rounded-3xl border-2 transition-all w-28 md:w-36 ${
                          selected
                            ? "border-primary bg-primary/10 shadow-xl"
                            : "border-border bg-card hover:border-primary/30"
                        }`}
                      >
                        <div className={`h-16 w-16 md:h-20 md:w-20 rounded-full bg-gradient-to-br ${opt.color} flex items-center justify-center text-white shadow-lg`}>
                          <opt.icon className="h-7 w-7 md:h-8 md:w-8" />
                        </div>
                        <span className="font-semibold text-foreground text-sm">{opt.label}</span>
                      </motion.button>
                    );
                  })}
                </motion.div>
              )}

              {/* Step 3 — Idade (Timeline) */}
              {step === 3 && !typing && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full max-w-lg"
                >
                  <div className="relative py-8">
                    <div className="absolute top-1/2 left-0 right-0 h-1 bg-muted rounded-full -translate-y-1/2" />
                    {answers.idade && (
                      <motion.div
                        className="absolute top-1/2 left-0 h-1 bg-primary rounded-full -translate-y-1/2"
                        initial={{ width: 0 }}
                        animate={{
                          width: `${idadeOptions.find((o) => o.id === answers.idade)?.position ?? 0}%`,
                        }}
                        transition={{ duration: 0.4 }}
                      />
                    )}
                    <div className="relative flex justify-between">
                      {idadeOptions.map((opt) => {
                        const selected = answers.idade === opt.id;
                        return (
                          <motion.button
                            key={opt.id}
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setAnswers((a) => ({ ...a, idade: opt.id }))}
                            className="flex flex-col items-center gap-2 -mt-3"
                          >
                            <motion.div
                              className={`h-8 w-8 rounded-full border-3 transition-all ${
                                selected
                                  ? "bg-primary border-primary shadow-lg"
                                  : "bg-card border-muted-foreground/30"
                              }`}
                              animate={selected ? { boxShadow: "0 0 15px hsl(var(--primary) / 0.5)" } : {}}
                            />
                            <span className={`text-xs font-semibold ${selected ? "text-primary" : "text-muted-foreground"}`}>
                              {opt.label}
                            </span>
                            <span className="text-[10px] text-muted-foreground">{opt.sub}</span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 4 — Categoria */}
              {step === 4 && !typing && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full"
                >
                  {categoriaOptions.map((opt, idx) => {
                    const selected = answers.categoria.includes(opt.id);
                    return (
                      <motion.button
                        key={opt.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() =>
                          setAnswers((a) => ({
                            ...a,
                            categoria: toggleArray(a.categoria, opt.id),
                          }))
                        }
                        className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                          selected
                            ? "border-primary bg-primary/10 shadow-md"
                            : "border-border bg-card hover:border-primary/30"
                        }`}
                      >
                        <opt.icon className={`h-6 w-6 ${selected ? "text-primary" : "text-muted-foreground"}`} />
                        <span className={`text-sm font-medium ${selected ? "text-primary" : "text-foreground"}`}>
                          {opt.label}
                        </span>
                        {selected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                            className="h-4 w-4 rounded-full bg-primary flex items-center justify-center"
                          >
                            <Check className="h-2.5 w-2.5 text-primary-foreground" />
                          </motion.div>
                        )}
                      </motion.button>
                    );
                  })}
                  {answers.categoria.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="col-span-full text-center mt-2"
                    >
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        {answers.categoria.length} selecionada{answers.categoria.length > 1 ? "s" : ""}
                      </span>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* Step 5 — Estilo */}
              {step === 5 && !typing && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col gap-3 w-full"
                >
                  {estiloOptions.map((opt) => {
                    const selected = answers.estilo.includes(opt.id);
                    return (
                      <motion.button
                        key={opt.id}
                        whileHover={{ x: 6 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() =>
                          setAnswers((a) => ({
                            ...a,
                            estilo: toggleArray(a.estilo, opt.id),
                          }))
                        }
                        className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                          selected
                            ? "border-primary bg-primary/5 shadow-md"
                            : "border-border bg-card hover:border-primary/30"
                        }`}
                      >
                        <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${opt.gradient} flex items-center justify-center flex-shrink-0`}>
                          <Star className="h-5 w-5 text-white" />
                        </div>
                        <div className="text-left flex-1">
                          <p className="font-semibold text-foreground text-sm">{opt.label}</p>
                          <p className="text-xs text-muted-foreground">{opt.desc}</p>
                        </div>
                        {selected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="h-6 w-6 rounded-full bg-primary flex items-center justify-center"
                          >
                            <Check className="h-3.5 w-3.5 text-primary-foreground" />
                          </motion.div>
                        )}
                      </motion.button>
                    );
                  })}
                </motion.div>
              )}

              {/* Step 6 — Estação */}
              {step === 6 && !typing && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full"
                >
                  {estacaoOptions.map((opt) => {
                    const selected = answers.estacao === opt.id;
                    return (
                      <motion.button
                        key={opt.id}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setAnswers((a) => ({ ...a, estacao: opt.id }))}
                        className={`relative p-6 rounded-2xl border-2 transition-all overflow-hidden ${
                          selected
                            ? "border-primary shadow-xl"
                            : "border-border hover:border-primary/30"
                        }`}
                      >
                        <div className={`absolute inset-0 bg-gradient-to-br ${opt.bg} opacity-${selected ? "30" : "10"} transition-opacity`} />
                        <div className="relative flex flex-col items-center gap-3">
                          <opt.icon className={`h-10 w-10 ${selected ? "text-primary" : "text-muted-foreground"}`} />
                          <span className="font-semibold text-foreground text-sm">{opt.label}</span>
                        </div>
                        {selected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center"
                          >
                            <Check className="h-3 w-3 text-primary-foreground" />
                          </motion.div>
                        )}
                      </motion.button>
                    );
                  })}
                </motion.div>
              )}

              {/* Step 7 — Tamanho */}
              {step === 7 && !typing && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-wrap justify-center gap-2 w-full max-w-md"
                >
                  {tamanhos.map((sz, idx) => {
                    const selected = answers.tamanho.includes(sz);
                    return (
                      <motion.button
                        key={sz}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.03, type: "spring", stiffness: 300 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.85 }}
                        onClick={() =>
                          setAnswers((a) => ({
                            ...a,
                            tamanho: toggleArray(a.tamanho, sz),
                          }))
                        }
                        className={`h-12 w-12 rounded-full border-2 flex items-center justify-center text-sm font-semibold transition-all ${
                          selected
                            ? "border-primary bg-primary text-primary-foreground shadow-md"
                            : "border-border bg-card text-foreground hover:border-primary/40"
                        }`}
                        style={selected ? { boxShadow: "0 0 12px hsl(var(--primary) / 0.4)" } : {}}
                      >
                        {sz}
                      </motion.button>
                    );
                  })}
                </motion.div>
              )}

              {/* Step 8 — Valor (Custom Slider) */}
              {step === 8 && !typing && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full max-w-md flex flex-col items-center gap-6"
                >
                  <motion.div
                    key={sliderValue}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    className="text-5xl font-bold text-primary"
                  >
                    R$ {sliderValue}
                  </motion.div>
                  <p className="text-sm text-muted-foreground">por peça (até)</p>
                  <input
                    type="range"
                    min={10}
                    max={500}
                    step={10}
                    value={sliderValue}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setSliderValue(v);
                      setAnswers((a) => ({ ...a, valorRange: [0, v] }));
                    }}
                    className="w-full h-3 rounded-full appearance-none cursor-pointer bg-muted
                      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-7 [&::-webkit-slider-thumb]:w-7
                      [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary
                      [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-grab
                      [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-background
                      [&::-moz-range-thumb]:h-7 [&::-moz-range-thumb]:w-7 [&::-moz-range-thumb]:rounded-full
                      [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-4 [&::-moz-range-thumb]:border-background"
                  />
                  <div className="flex justify-between w-full text-xs text-muted-foreground">
                    <span>R$ 10</span>
                    <span>R$ 500</span>
                  </div>
                </motion.div>
              )}

              {/* Step 9 — Quantidade */}
              {step === 9 && !typing && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center gap-6 w-full max-w-md"
                >
                  <div className="flex items-center gap-4">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() =>
                        setAnswers((a) => ({
                          ...a,
                          quantidade: Math.max(1, a.quantidade - 10),
                        }))
                      }
                      className="h-12 w-12 rounded-full border-2 border-border bg-card flex items-center justify-center hover:border-primary transition-colors"
                    >
                      <Minus className="h-5 w-5" />
                    </motion.button>
                    <motion.div
                      key={answers.quantidade}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      className="text-5xl font-bold text-primary min-w-[120px] text-center"
                    >
                      {answers.quantidade}
                    </motion.div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() =>
                        setAnswers((a) => ({
                          ...a,
                          quantidade: a.quantidade + 10,
                        }))
                      }
                      className="h-12 w-12 rounded-full border-2 border-border bg-card flex items-center justify-center hover:border-primary transition-colors"
                    >
                      <Plus className="h-5 w-5" />
                    </motion.button>
                  </div>
                  <p className="text-sm text-muted-foreground">peças no total</p>
                  <div className="flex flex-wrap justify-center gap-2 mt-2">
                    {quantidadeSugestoes.map((q) => (
                      <motion.button
                        key={q}
                        whileHover={{ y: -4 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setAnswers((a) => ({ ...a, quantidade: q }))}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          answers.quantidade === q
                            ? "bg-primary text-primary-foreground shadow-md"
                            : "bg-muted text-foreground hover:bg-muted/80"
                        }`}
                      >
                        {q} peças
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Results */}
        {step === TOTAL_STEPS && !analyzing && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-3xl mx-auto overflow-y-auto max-h-[70vh] px-1"
          >
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-3"
              >
                <Target className="h-4 w-4" />
                Encontramos {getResults().filter((r) => r.score >= 30).length} marcas para você
              </motion.div>
              <h2 className="text-2xl font-bold text-foreground">Suas Recomendações</h2>
            </div>

            <div className="grid gap-3">
              {getResults().map((result, idx) => (
                <motion.div
                  key={result.brand.slug}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4"
                >
                  <img
                    src={result.brand.logo}
                    alt={result.brand.name}
                    className="h-14 w-14 rounded-xl object-cover border border-border flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-foreground">{result.brand.name}</h3>
                      <span className="text-sm font-bold text-primary">{result.score}%</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-2">
                      <motion.div
                        className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${result.score}%` }}
                        transition={{ delay: idx * 0.1 + 0.3, duration: 0.6 }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">{result.brand.description}</p>
                    {result.connected && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Orçamento estimado:</span>
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: idx * 0.1 + 0.6 }}
                          className="text-sm font-bold text-primary"
                        >
                          R$ {result.estimatedTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </motion.span>
                      </div>
                    )}
                    {!result.connected && (
                      <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.1 + 0.4 }}
                        className="mt-2 px-3 py-1 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
                      >
                        Solicitar conexão
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="flex justify-center gap-3 mt-6 pb-4">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={reset}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm font-medium hover:bg-muted transition-colors"
              >
                <RotateCcw className="h-4 w-4" /> Refazer
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => { reset(); onClose(); }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <ShoppingBag className="h-4 w-4" /> Ver todas as marcas
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      {step > 0 && step < TOTAL_STEPS && !analyzing && (
        <div className="relative z-10 flex items-center justify-between px-4 md:px-8 py-4">
          <button
            onClick={goBack}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar
          </button>
          <motion.button
            whileHover={{ scale: canProceed() ? 1.03 : 1 }}
            whileTap={{ scale: canProceed() ? 0.97 : 1 }}
            onClick={goNext}
            disabled={!canProceed()}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              canProceed()
                ? "bg-primary text-primary-foreground shadow-md hover:bg-primary/90"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            }`}
          >
            {step === 9 ? "Ver resultados" : "Próximo"} <ArrowRight className="h-4 w-4" />
          </motion.button>
        </div>
      )}
    </motion.div>
  );
};
