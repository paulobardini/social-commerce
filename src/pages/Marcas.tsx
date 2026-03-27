import { NextilHeader } from "@/components/NextilHeader";
import { NextilSidebar } from "@/components/NextilSidebar";
import { MobileNav } from "@/components/MobileNav";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, Eye, Heart, Sparkles } from "lucide-react";
import { SmartBuyerQuiz } from "@/components/SmartBuyerQuiz";

import brandBrandili from "@/assets/brand-brandili.jpg";
import brandKyly from "@/assets/brand-kyly.jpg";
import brandHering from "@/assets/brand-hering.jpg";
import brandMalwee from "@/assets/brand-malwee.jpg";
import brandLunender from "@/assets/brand-lunender.jpg";
import brandMarisol from "@/assets/brand-marisol.jpg";
import brandElian from "@/assets/brand-elian.jpg";
import brandColoritta from "@/assets/brand-coloritta.jpg";

import concept1 from "@/assets/concept-1.jpg";
import concept2 from "@/assets/concept-2.jpg";
import concept3 from "@/assets/concept-3.jpg";
import concept4 from "@/assets/concept-4.jpg";
import concept5 from "@/assets/concept-5.jpg";
import concept6 from "@/assets/concept-6.jpg";
import concept7 from "@/assets/concept-7.jpg";
import concept8 from "@/assets/concept-8.jpg";

const categories = ["Todas", "Infantil", "Feminino", "Masculino", "Plus Size", "Sustentável"];

const brands = [
  {
    name: "Brandili",
    logo: brandBrandili,
    category: "Infantil",
    description: "Moda infantil com estampas lúdicas e conforto premium",
    followers: "12.5k",
    posts: [concept1, concept3, concept6],
  },
  {
    name: "Kyly",
    logo: brandKyly,
    category: "Infantil",
    description: "Streetwear infantil moderno e colorido",
    followers: "9.8k",
    posts: [concept3, concept1],
  },
  {
    name: "Hering",
    logo: brandHering,
    category: "Masculino",
    description: "Básicos reinventados com alfaiataria moderna",
    followers: "45.2k",
    posts: [concept5],
  },
  {
    name: "Malwee",
    logo: brandMalwee,
    category: "Sustentável",
    description: "Moda sustentável com texturas e tricôs artesanais",
    followers: "18.3k",
    posts: [concept4, concept8, concept5],
  },
  {
    name: "Lunender",
    logo: brandLunender,
    category: "Feminino",
    description: "Elegância contemporânea para mulheres sofisticadas",
    followers: "22.1k",
    posts: [concept2, concept7],
  },
  {
    name: "Marisol",
    logo: brandMarisol,
    category: "Infantil",
    description: "Candy colors e estampas vibrantes para crianças",
    followers: "15.7k",
    posts: [concept6],
  },
  {
    name: "Elian",
    logo: brandElian,
    category: "Feminino",
    description: "Paletas earth tones com design atemporal",
    followers: "8.4k",
    posts: [concept7, concept4, concept8],
  },
  {
    name: "Colorittá",
    logo: brandColoritta,
    category: "Infantil",
    description: "Coleções florais e estampas exclusivas",
    followers: "6.9k",
    posts: [concept8, concept2],
  },
];

const Marcas = () => {
  const [activeCategory, setActiveCategory] = useState("Todas");
  const [quizOpen, setQuizOpen] = useState(false);
  const navigate = useNavigate();

  const filtered = activeCategory === "Todas"
    ? brands
    : brands.filter((b) => b.category === activeCategory);

  return (
    <div className="min-h-screen bg-background">
      <NextilHeader />
      <div className="flex">
        <NextilSidebar />
        <div className="flex-1 min-w-0 flex flex-col pb-16 md:pb-0 overflow-hidden">
          {/* Hero Banner */}
          <div className="relative h-40 md:h-56 overflow-hidden bg-gradient-to-r from-primary to-accent">
            <div className="absolute inset-0 bg-primary/40" />
            <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
              <h1 className="text-2xl md:text-4xl font-bold text-primary-foreground">Mundo das Marcas</h1>
              <p className="mt-2 text-sm md:text-base text-primary-foreground/80 max-w-md">
                Descubra coleções exclusivas das maiores marcas do Brasil
              </p>
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setQuizOpen(true)}
                className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-background text-foreground text-sm font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                <Sparkles className="h-4 w-4 text-primary" />
                Comprador Inteligente
              </motion.button>
            </div>
          </div>

          {/* Category filters */}
          <div className="border-b border-border bg-card/50 px-3 md:px-6 py-3">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    activeCategory === cat
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Brands Grid */}
          <div className="px-3 md:px-6 py-4 md:py-6">
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 md:gap-5">
              {filtered.map((brand, i) => (
                <motion.div
                  key={brand.name}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="bg-card rounded-xl md:rounded-2xl overflow-hidden shadow-sm card-hover cursor-pointer group"
                  onClick={() => navigate(`/marca/${brand.name.toLowerCase().replace(/\s+/g, '-')}`)}
                >
                  {/* Preview — mobile: 1 foto / desktop: grid */}
                  <div className={`h-32 md:h-40 overflow-hidden md:grid md:gap-0.5 ${
                    brand.posts.length === 1 ? "md:grid-cols-1" :
                    brand.posts.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3"
                  }`}>
                    {/* Mobile: only first image */}
                    <div className="md:hidden h-full overflow-hidden">
                      <img
                        src={brand.posts[0]}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    {/* Desktop: all images */}
                    {brand.posts.map((img, j) => (
                      <div key={j} className="hidden md:block overflow-hidden h-full">
                        <img
                          src={img}
                          alt=""
                          loading="lazy"
                          className={`h-full w-full transition-transform duration-500 group-hover:scale-105 ${
                            brand.posts.length === 1 ? "object-contain bg-muted" : "object-cover"
                          }`}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Brand info */}
                  <div className="p-2.5 md:p-4">
                    <div className="flex items-center gap-2 md:gap-3">
                      <img
                        src={brand.logo}
                        alt={brand.name}
                        className="h-8 w-8 md:h-12 md:w-12 rounded-full object-cover border-2 border-border"
                        loading="lazy"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm md:text-base font-semibold text-foreground">{brand.name}</h3>
                        <p className="text-[10px] md:text-xs text-muted-foreground">{brand.followers} seguidores</p>
                      </div>
                    </div>
                    <p className="mt-1.5 md:mt-2 text-[10px] md:text-xs text-muted-foreground line-clamp-2 hidden sm:block">{brand.description}</p>
                    <button className="mt-2.5 md:mt-3 w-full py-1.5 md:py-2 rounded-lg bg-primary text-primary-foreground text-xs md:text-sm font-medium hover:bg-primary/90 active:scale-[0.97] transition-all">
                      Ver produtos
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <MobileNav />
      <SmartBuyerQuiz open={quizOpen} onClose={() => setQuizOpen(false)} />
    </div>
  );
};

export default Marcas;
