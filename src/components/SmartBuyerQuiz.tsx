import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Baby, User, Users, Shirt, Scissors, Sun, Snowflake, CloudSun,
  Sparkles, X, ArrowLeft, ArrowRight, RotateCcw, ShoppingBag,
  Heart, Zap, Crown, Star, Package, ChevronRight, Minus, Plus,
  Target, Search, TrendingUp, Check, AlertCircle, FileText, DollarSign
} from "lucide-react";
import { brands as allBrands } from "@/data/mockProducts";

interface MockResult {
  brandSlug: string;
  brandName: string;
  brandLogo: string;
  brandDescription: string;
  connected: boolean;
  matchedCount: number;
  avgPrice: number;
  minPrice: number;
  estimatedTotal: number;
  products: { name: string; category: string; price: number; qty: number }[];
}

/* ─── types ─── */
interface QuizAnswers {
  tipo: string[];
  genero: string[];
  idade: string[];
  categoria: string[];
  estilo: string[];
  estacao: string[];
  tamanho: string[];
  valorRange: [number, number];
  quantidade: number;
}

const initialAnswers: QuizAnswers = {
  tipo: [],
  genero: [],
  idade: [],
  categoria: [],
  estilo: [],
  estacao: [],
  tamanho: [],
  valorRange: [0, 50],
  quantidade: 100,
};

/* ─── step config ─── */
const TOTAL_STEPS = 9; // 0=welcome, 1-8=questions

const aiMessages = [
  "Olá! Sou sua assistente de compras inteligente 🤖",
  "O que você está buscando hoje?",
  "Para quem são esses produtos?",
  "Qual a faixa etária?",
  "Que tipo de peça você procura?",
  "Qual linha você procura?",
  "Para qual estação?",
  "Quanto você quer investir por peça?",
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
  { id: "bebe", label: "Bebê", sub: "RN ao G Bebê" },
  { id: "primeiros-passos", label: "Primeiros Passos", sub: "1 a 3 anos" },
  { id: "infantil", label: "Infantil", sub: "4 ao 8" },
  { id: "teen", label: "Teen", sub: "10 ao 18" },
  { id: "adulto", label: "Adulto", sub: "P ao XG" },
  { id: "plus-size", label: "Plus Size", sub: "G1, G2, G3" },
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
  { id: "popular", label: "Popular", gradient: "from-amber-400 to-orange-500", desc: "Preço acessível, alto giro" },
  { id: "basico", label: "Básico", gradient: "from-gray-400 to-gray-600", desc: "Essenciais do guarda-roupa" },
  { id: "casual", label: "Casual", gradient: "from-green-400 to-emerald-600", desc: "Dia a dia confortável" },
  { id: "fashion", label: "Fashion", gradient: "from-fuchsia-400 to-purple-600", desc: "Tendências e ousadia" },
  { id: "premium", label: "Premium", gradient: "from-yellow-400 to-amber-600", desc: "Alta qualidade e acabamento" },
  { id: "social", label: "Social", gradient: "from-indigo-400 to-blue-600", desc: "Elegância e formalidade" },
  { id: "esportivo", label: "Esportivo", gradient: "from-cyan-400 to-blue-600", desc: "Performance e conforto" },
];

const estacaoOptions = [
  { id: "verao", label: "Primavera / Verão", icon: Sun, bg: "from-amber-300 via-orange-300 to-yellow-200" },
  { id: "inverno", label: "Outono / Inverno", icon: Snowflake, bg: "from-blue-300 via-indigo-300 to-slate-200" },
  { id: "meia", label: "Meia-estação", icon: CloudSun, bg: "from-emerald-300 via-teal-200 to-lime-200" },
];


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

/* ─── Floating Particles ─── */
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
  const [sliderValue, setSliderValue] = useState(30);
  const [shakeNext, setShakeNext] = useState(false);

  const [budgetDetail, setBudgetDetail] = useState<MockResult | null>(null);

  const reset = () => {
    setStep(0);
    setAnswers({ ...initialAnswers });
    setTyping(true);
    setAnalyzing(false);
    setAnalyzeText("");
    setSliderValue(30);
    setShakeNext(false);
    setBudgetDetail(null);
  };

  const canProceed = useCallback(() => {
    switch (step) {
      case 0: return true;
      case 1: return answers.tipo.length > 0;
      case 2: return answers.genero.length > 0;
      case 3: return answers.idade.length > 0;
      case 4: return answers.categoria.length > 0;
      case 5: return answers.estilo.length > 0;
      case 6: return answers.estacao.length > 0;
      case 7: return true;
      case 8: return answers.quantidade > 0;
      default: return false;
    }
  }, [step, answers]);

  const goNext = () => {
    if (!canProceed()) {
      setShakeNext(true);
      setTimeout(() => setShakeNext(false), 600);
      return;
    }
    if (step === 8) {
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
    const msgs = ["Cruzando dados...", "Encontrando marcas...", "Calculando orçamento...", "Montando resultado..."];
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

  // Matching logic — only show brands that truly match ALL criteria
  const getResults = (): MockResult[] => {
    const qty = answers.quantidade;
    const perBrand = Math.ceil(qty / 6);
    const brandData = allBrands.slice(0, 6);

    return [
      // 3 connected
      {
        brandSlug: brandData[0]?.slug || "brandili",
        brandName: brandData[0]?.name || "Brandili",
        brandLogo: brandData[0]?.logo || "",
        brandDescription: brandData[0]?.description || "",
        connected: true,
        matchedCount: 45,
        avgPrice: Math.min(sliderValue * 0.75, 38.9),
        minPrice: Math.min(sliderValue * 0.4, 19.9),
        estimatedTotal: Math.min(sliderValue * 0.75, 38.9) * perBrand,
        products: [
          { name: "Camiseta Meia Malha", category: "Camiseta", price: 29.9, qty: Math.ceil(perBrand * 0.3) },
          { name: "Conjunto Moletom", category: "Conjunto", price: 49.9, qty: Math.ceil(perBrand * 0.25) },
          { name: "Calça Jogging", category: "Calça", price: 39.9, qty: Math.ceil(perBrand * 0.2) },
          { name: "Blusão Felpado", category: "Blusão", price: 44.9, qty: Math.ceil(perBrand * 0.15) },
          { name: "Bermuda Sarja", category: "Bermuda", price: 34.9, qty: Math.ceil(perBrand * 0.1) },
        ],
      },
      {
        brandSlug: brandData[1]?.slug || "kyly",
        brandName: brandData[1]?.name || "Kyly",
        brandLogo: brandData[1]?.logo || "",
        brandDescription: brandData[1]?.description || "",
        connected: true,
        matchedCount: 38,
        avgPrice: Math.min(sliderValue * 0.8, 42.5),
        minPrice: Math.min(sliderValue * 0.35, 22.9),
        estimatedTotal: Math.min(sliderValue * 0.8, 42.5) * perBrand,
        products: [
          { name: "Vestido Florido", category: "Vestido", price: 45.9, qty: Math.ceil(perBrand * 0.3) },
          { name: "Legging Cotton", category: "Legging", price: 24.9, qty: Math.ceil(perBrand * 0.25) },
          { name: "Blusa Babado", category: "Blusa", price: 35.9, qty: Math.ceil(perBrand * 0.2) },
          { name: "Conjunto Malha", category: "Conjunto", price: 49.9, qty: Math.ceil(perBrand * 0.15) },
          { name: "Jaqueta Bomber", category: "Jaqueta", price: 59.9, qty: Math.ceil(perBrand * 0.1) },
        ],
      },
      {
        brandSlug: brandData[2]?.slug || "hering",
        brandName: brandData[2]?.name || "Hering",
        brandLogo: brandData[2]?.logo || "",
        brandDescription: brandData[2]?.description || "",
        connected: true,
        matchedCount: 52,
        avgPrice: Math.min(sliderValue * 0.85, 45.0),
        minPrice: Math.min(sliderValue * 0.45, 25.9),
        estimatedTotal: Math.min(sliderValue * 0.85, 45.0) * perBrand,
        products: [
          { name: "Camiseta Básica", category: "Camiseta", price: 34.9, qty: Math.ceil(perBrand * 0.35) },
          { name: "Polo Piquet", category: "Polo", price: 49.9, qty: Math.ceil(perBrand * 0.2) },
          { name: "Calça Chino", category: "Calça", price: 59.9, qty: Math.ceil(perBrand * 0.2) },
          { name: "Bermuda Sarja", category: "Bermuda", price: 44.9, qty: Math.ceil(perBrand * 0.15) },
          { name: "Moletom Canguru", category: "Blusão", price: 54.9, qty: Math.ceil(perBrand * 0.1) },
        ],
      },
      // 3 not connected
      {
        brandSlug: brandData[3]?.slug || "malwee",
        brandName: brandData[3]?.name || "Malwee",
        brandLogo: brandData[3]?.logo || "",
        brandDescription: brandData[3]?.description || "",
        connected: false,
        matchedCount: 30,
        avgPrice: Math.min(sliderValue * 0.7, 35.0),
        minPrice: Math.min(sliderValue * 0.3, 18.9),
        estimatedTotal: Math.min(sliderValue * 0.7, 35.0) * perBrand,
        products: [],
      },
      {
        brandSlug: brandData[4]?.slug || "lunender",
        brandName: brandData[4]?.name || "Lunender",
        brandLogo: brandData[4]?.logo || "",
        brandDescription: brandData[4]?.description || "",
        connected: false,
        matchedCount: 25,
        avgPrice: Math.min(sliderValue * 0.9, 48.0),
        minPrice: Math.min(sliderValue * 0.5, 28.9),
        estimatedTotal: Math.min(sliderValue * 0.9, 48.0) * perBrand,
        products: [],
      },
      {
        brandSlug: brandData[5]?.slug || "marisol",
        brandName: brandData[5]?.name || "Marisol",
        brandLogo: brandData[5]?.logo || "",
        brandDescription: brandData[5]?.description || "",
        connected: false,
        matchedCount: 28,
        avgPrice: Math.min(sliderValue * 0.65, 32.0),
        minPrice: Math.min(sliderValue * 0.28, 15.9),
        estimatedTotal: Math.min(sliderValue * 0.65, 32.0) * perBrand,
        products: [],
      },
    ];
  };

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -300 : 300, opacity: 0 }),
  };

  if (!open) return null;

  const toggleArray = (arr: string[], val: string) =>
    arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];

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
      <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-8 relative overflow-y-auto">
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

              {/* Step 2 — Gênero (Multi-select) */}
              {step === 2 && !typing && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-4 md:gap-6 justify-center flex-wrap"
                >
                  {generoOptions.map((opt) => {
                    const selected = answers.genero.includes(opt.id);
                    return (
                      <motion.button
                        key={opt.id}
                        whileHover={{ y: -8, boxShadow: "0 20px 40px -10px rgba(0,0,0,0.3)" }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setAnswers((a) => ({ ...a, genero: toggleArray(a.genero, opt.id) }))}
                        className={`relative flex flex-col items-center gap-3 p-6 rounded-3xl border-2 transition-all w-28 md:w-36 ${
                          selected
                            ? "border-primary bg-primary/10 shadow-xl"
                            : "border-border bg-card hover:border-primary/30"
                        }`}
                      >
                        <div className={`h-16 w-16 md:h-20 md:w-20 rounded-full bg-gradient-to-br ${opt.color} flex items-center justify-center text-white shadow-lg`}>
                          <opt.icon className="h-7 w-7 md:h-8 md:w-8" />
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

              {/* Step 3 — Idade (Cards multi-select) */}
              {step === 3 && !typing && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full"
                >
                  {idadeOptions.map((opt, idx) => {
                    const selected = answers.idade.includes(opt.id);
                    return (
                      <motion.button
                        key={opt.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setAnswers((a) => ({ ...a, idade: toggleArray(a.idade, opt.id) }))}
                        className={`relative p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                          selected
                            ? "border-primary bg-primary/10 shadow-lg"
                            : "border-border bg-card hover:border-primary/30"
                        }`}
                        style={selected ? { boxShadow: "0 0 16px hsl(var(--primary) / 0.3)" } : {}}
                      >
                        <span className="font-bold text-foreground text-sm">{opt.label}</span>
                        <span className="text-xs text-muted-foreground">{opt.sub}</span>
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

              {/* Step 5 — Linha (Estilo) */}
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
                        className={`relative flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
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

              {/* Step 6 — Estação (Multi-select) */}
              {step === 6 && !typing && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full"
                >
                  {estacaoOptions.map((opt) => {
                    const selected = answers.estacao.includes(opt.id);
                    return (
                      <motion.button
                        key={opt.id}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setAnswers((a) => ({ ...a, estacao: toggleArray(a.estacao, opt.id) }))}
                        className={`relative p-6 rounded-2xl border-2 transition-all overflow-hidden ${
                          selected
                            ? "border-primary shadow-xl"
                            : "border-border hover:border-primary/30"
                        }`}
                      >
                        <div className={`absolute inset-0 bg-gradient-to-br ${opt.bg} ${selected ? "opacity-30" : "opacity-10"} transition-opacity`} />
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

              {/* Step 7 — Valor (Custom Slider) */}
              {step === 7 && !typing && (
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
                  <p className="text-xs text-muted-foreground/70 text-center">
                    Com esse valor calcularemos a média do seu pedido
                  </p>
                  <input
                    type="range"
                    min={5}
                    max={150}
                    step={5}
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
                    <span>R$ 5</span>
                    <span>R$ 150</span>
                  </div>
                </motion.div>
              )}

              {/* Step 8 — Quantidade */}
              {step === 8 && !typing && (
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
        {step === TOTAL_STEPS && !analyzing && !budgetDetail && (() => {
          const results = getResults();
          return (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-3xl mx-auto overflow-y-auto max-h-[70vh] px-1"
            >
              <div className="text-center mb-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-3"
                >
                  <Target className="h-4 w-4" />
                  {results.length} marca{results.length > 1 ? "s" : ""} atendem sua busca
                </motion.div>
                <h2 className="text-2xl font-bold text-foreground">Suas Recomendações</h2>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-3 gap-3 mb-4"
              >
                <div className="bg-card border border-border rounded-xl p-3 text-center">
                  <p className="text-xs text-muted-foreground">Qtd. desejada</p>
                  <p className="text-lg font-bold text-foreground">{answers.quantidade}</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-3 text-center">
                  <p className="text-xs text-muted-foreground">Valor por peça (até)</p>
                  <p className="text-lg font-bold text-primary">R$ {sliderValue}</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-3 text-center">
                  <p className="text-xs text-muted-foreground">Orçamento estimado</p>
                  <p className="text-lg font-bold text-foreground">
                    R$ {(sliderValue * answers.quantidade).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </motion.div>

              {/* Connected brands */}
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 mt-4">Marcas conectadas</p>
              <div className="grid gap-3 mb-4">
                {results.filter((r) => r.connected).map((result, idx) => (
                  <motion.div
                    key={result.brandSlug}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-card border border-border rounded-2xl p-4 flex items-start gap-4"
                  >
                    <img src={result.brandLogo} alt={result.brandName} className="h-14 w-14 rounded-xl object-cover border border-border flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-foreground">{result.brandName}</h3>
                        <span className="text-xs text-muted-foreground">{result.matchedCount} peças</span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{result.brandDescription}</p>
                      <div className="grid grid-cols-3 gap-2 text-center mb-2">
                        <div className="bg-muted/50 rounded-lg py-1.5 px-2">
                          <p className="text-[10px] text-muted-foreground">Preço mín.</p>
                          <p className="text-xs font-bold text-foreground">R$ {result.minPrice.toFixed(2)}</p>
                        </div>
                        <div className="bg-muted/50 rounded-lg py-1.5 px-2">
                          <p className="text-[10px] text-muted-foreground">Preço médio</p>
                          <p className="text-xs font-bold text-primary">R$ {result.avgPrice.toFixed(2)}</p>
                        </div>
                        <div className="bg-muted/50 rounded-lg py-1.5 px-2">
                          <p className="text-[10px] text-muted-foreground">Total estimado</p>
                          <p className="text-xs font-bold text-foreground">
                            R$ {result.estimatedTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-medium">
                          <Check className="h-3 w-3" /> Conectado
                        </span>
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setBudgetDetail(result)}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
                        >
                          <FileText className="h-3 w-3" /> Ver orçamento
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Not connected brands */}
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Marcas disponíveis</p>
              <div className="grid gap-3">
                {results.filter((r) => !r.connected).map((result, idx) => (
                  <motion.div
                    key={result.brandSlug}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (idx + 3) * 0.1 }}
                    className="bg-card border border-border rounded-2xl p-4 flex items-start gap-4"
                  >
                    <img src={result.brandLogo} alt={result.brandName} className="h-14 w-14 rounded-xl object-cover border border-border flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-foreground">{result.brandName}</h3>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{result.brandDescription}</p>
                      <p className="text-xs text-foreground mb-2">
                        Esta marca atende ao seu perfil de compra. Solicite conexão para visualizar preços e montar seu orçamento.
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors animate-pulse"
                      >
                        Solicitar conexão
                      </motion.button>
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
          );
        })()}

        {/* Budget Detail View */}
        {budgetDetail && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-3xl mx-auto overflow-y-auto max-h-[70vh] px-1"
          >
            <div className="flex items-center gap-3 mb-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setBudgetDetail(null)}
                className="p-2 rounded-xl hover:bg-muted transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-muted-foreground" />
              </motion.button>
              <img src={budgetDetail.brandLogo} alt={budgetDetail.brandName} className="h-10 w-10 rounded-lg object-cover border border-border" />
              <div>
                <h2 className="text-xl font-bold text-foreground">Orçamento — {budgetDetail.brandName}</h2>
                <p className="text-xs text-muted-foreground">{budgetDetail.brandDescription}</p>
              </div>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              <div className="bg-card border border-border rounded-xl p-3 text-center">
                <p className="text-[10px] text-muted-foreground">Qtd. Peças</p>
                <p className="text-lg font-bold text-foreground">{answers.quantidade}</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-3 text-center">
                <p className="text-[10px] text-muted-foreground">Preço Médio</p>
                <p className="text-lg font-bold text-primary">R$ {budgetDetail.avgPrice.toFixed(2)}</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-3 text-center">
                <p className="text-[10px] text-muted-foreground">Preço Mínimo</p>
                <p className="text-lg font-bold text-foreground">R$ {budgetDetail.minPrice.toFixed(2)}</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-3 text-center">
                <p className="text-[10px] text-muted-foreground">Total Estimado</p>
                <p className="text-lg font-bold text-primary">
                  R$ {budgetDetail.estimatedTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            {/* Products table */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden mb-6">
              <div className="px-4 py-3 bg-muted/30 border-b border-border">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-primary" /> Composição do Pedido
                </h3>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="text-left py-2 px-4 font-medium text-xs">Produto</th>
                    <th className="text-left py-2 px-4 font-medium text-xs">Categoria</th>
                    <th className="text-right py-2 px-4 font-medium text-xs">Qtd.</th>
                    <th className="text-right py-2 px-4 font-medium text-xs">Preço unit.</th>
                    <th className="text-right py-2 px-4 font-medium text-xs">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {budgetDetail.products.map((p, i) => (
                    <tr key={i} className="border-b border-border/50 last:border-0">
                      <td className="py-2.5 px-4 font-medium text-foreground">{p.name}</td>
                      <td className="py-2.5 px-4 text-muted-foreground">{p.category}</td>
                      <td className="py-2.5 px-4 text-right text-foreground">{p.qty}</td>
                      <td className="py-2.5 px-4 text-right text-foreground">R$ {p.price.toFixed(2)}</td>
                      <td className="py-2.5 px-4 text-right font-semibold text-foreground">
                        R$ {(p.price * p.qty).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-muted/20">
                    <td colSpan={2} className="py-3 px-4 font-bold text-foreground">Total</td>
                    <td className="py-3 px-4 text-right font-bold text-foreground">
                      {budgetDetail.products.reduce((s, p) => s + p.qty, 0)}
                    </td>
                    <td className="py-3 px-4 text-right text-muted-foreground">—</td>
                    <td className="py-3 px-4 text-right font-bold text-primary text-base">
                      R$ {budgetDetail.products.reduce((s, p) => s + p.price * p.qty, 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Proportion info */}
            <div className="bg-card border border-border rounded-2xl p-4 mb-6">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" /> Proporção do Pedido
              </h3>
              <div className="space-y-2">
                {budgetDetail.products.map((p, i) => {
                  const totalQty = budgetDetail.products.reduce((s, pr) => s + pr.qty, 0);
                  const pct = Math.round((p.qty / totalQty) * 100);
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs text-foreground w-32 truncate">{p.name}</span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ delay: i * 0.1, duration: 0.5 }}
                          className="h-full bg-primary rounded-full"
                        />
                      </div>
                      <span className="text-xs font-semibold text-primary w-10 text-right">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-center gap-3 pb-4">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setBudgetDetail(null)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm font-medium hover:bg-muted transition-colors"
              >
                <ArrowLeft className="h-4 w-4" /> Voltar aos resultados
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
          <div className="flex items-center gap-2">
            {shakeNext && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs text-destructive flex items-center gap-1"
              >
                <AlertCircle className="h-3.5 w-3.5" /> Selecione uma opção
              </motion.span>
            )}
            <motion.button
              animate={shakeNext ? { x: [0, -6, 6, -6, 6, 0] } : {}}
              transition={{ duration: 0.4 }}
              whileHover={{ scale: canProceed() ? 1.03 : 1 }}
              whileTap={{ scale: canProceed() ? 0.97 : 1 }}
              onClick={goNext}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                canProceed()
                  ? "bg-primary text-primary-foreground shadow-md hover:bg-primary/90"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {step === 8 ? "Ver resultados" : "Próximo"} <ArrowRight className="h-4 w-4" />
            </motion.button>
          </div>
        </div>
      )}
    </motion.div>
  );
};
