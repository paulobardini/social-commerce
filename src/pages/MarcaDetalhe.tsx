import { useParams, useNavigate } from "react-router-dom";
import { NextilHeader } from "@/components/NextilHeader";
import { NextilSidebar } from "@/components/NextilSidebar";
import { MobileNav } from "@/components/MobileNav";
import { getBrandBySlug } from "@/data/mockProducts";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link2, Shirt, Heart, MessageCircle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

const MarcaDetalhe = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const brand = getBrandBySlug(slug || "");
  const [activeSubBrand, setActiveSubBrand] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  if (!brand) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Marca não encontrada</p>
      </div>
    );
  }

  const activeSubBrandObj = activeSubBrand
    ? brand.subBrands.find((sb) => sb.id === activeSubBrand)
    : brand.subBrands[0];

  const activeId = activeSubBrandObj?.id || brand.subBrands[0]?.id;
  const vitrineImages = activeSubBrandObj?.vitrineImages || [];

  return (
    <div className="min-h-screen bg-background">
      <NextilHeader />
      <div className="flex">
        <NextilSidebar />
        <div className="flex-1 min-w-0 pb-16 md:pb-0">
          {/* Hero Banner — full-width, tall, editorial feel */}
          <div className="relative h-64 md:h-[420px] overflow-hidden bg-foreground">
            <img
              src={brand.banner}
              alt={brand.name}
              className="w-full h-full object-cover"
            />
            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/30 to-transparent" />
            {/* Brand name + sub-brand logos */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-4xl md:text-6xl font-bold text-primary-foreground tracking-wider font-heading lowercase"
              >
                {brand.name}
              </motion.h2>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="flex items-center gap-4 md:gap-6 mt-4 md:mt-6"
              >
                {brand.subBrands.map((sb) => (
                  <span
                    key={sb.id}
                    className="text-sm md:text-base text-primary-foreground/80 font-semibold uppercase tracking-widest"
                  >
                    {sb.name}
                  </span>
                ))}
              </motion.div>
            </div>
          </div>

          {/* Brand info card — overlapping the banner */}
          <div className="max-w-4xl mx-auto px-3 md:px-6 -mt-12 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card rounded-2xl shadow-lg border border-border p-5 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6"
            >
              <img
                src={brand.logo}
                alt={brand.name}
                className="h-16 w-16 md:h-20 md:w-20 rounded-2xl object-cover border-2 border-border shadow-sm"
              />
              <div className="flex-1 min-w-0">
                <h1 className="text-xl md:text-2xl font-bold text-foreground">{brand.name}</h1>
                <p className="text-sm text-muted-foreground mt-1">{brand.description}</p>
                <div className="flex items-center gap-5 mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Link2 className="h-3.5 w-3.5" />
                    {brand.connections} conexões
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Shirt className="h-3.5 w-3.5" />
                    {brand.totalProducts} produtos
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2 shrink-0 w-full md:w-auto">
                {isConnected ? (
                  <>
                    <Button
                      onClick={() => navigate(`/marca/${slug}/produto/${brand.products[0]?.id}`)}
                      className="w-full md:w-auto"
                    >
                      Ver Produtos
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsConnected(false)}
                      className="w-full md:w-auto text-xs"
                    >
                      Conectado ✓
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => setIsConnected(true)}
                    className="w-full md:w-auto"
                  >
                    Conectar
                  </Button>
                )}
              </div>
            </motion.div>
          </div>

          {/* Sub-brand tabs */}
          <div className="flex justify-center py-8 md:py-10">
            <div className="flex gap-5 md:gap-10">
              {brand.subBrands.map((sb) => (
                <button
                  key={sb.id}
                  onClick={() => setActiveSubBrand(sb.id)}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div
                    className={`h-16 w-16 md:h-20 md:w-20 rounded-full overflow-hidden border-[3px] transition-all duration-300 ${
                      activeId === sb.id
                        ? "border-accent shadow-md scale-105"
                        : "border-border group-hover:border-muted-foreground"
                    }`}
                  >
                    <img
                      src={sb.logo}
                      alt={sb.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <span
                    className={`text-[10px] md:text-xs font-bold uppercase tracking-widest transition-colors ${
                      activeId === sb.id ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {sb.name}
                  </span>
                  {activeId === sb.id && (
                    <motion.div
                      layoutId="subBrandIndicator"
                      className="h-[2px] w-10 bg-accent rounded-full"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Vitrine — Editorial masonry grid of conceptual images */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeId}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="px-3 md:px-6 pb-8 max-w-7xl mx-auto"
            >
              {/* Row 1: 3 equal tall images */}
              {vitrineImages.length >= 3 && (
                <div className="grid grid-cols-3 gap-2 md:gap-3 mb-2 md:mb-3">
                  {vitrineImages.slice(0, 3).map((img, i) => (
                    <motion.div
                      key={`row1-${i}`}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="relative aspect-[3/4] rounded-xl md:rounded-2xl overflow-hidden group cursor-pointer"
                    >
                      <img
                        src={img}
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex gap-2 text-primary-foreground text-xs">
                          <span className="flex items-center gap-1 bg-foreground/40 backdrop-blur-sm px-2 py-1 rounded-full">
                            <Heart className="h-3 w-3" /> 0
                          </span>
                          <span className="flex items-center gap-1 bg-foreground/40 backdrop-blur-sm px-2 py-1 rounded-full">
                            <MessageCircle className="h-3 w-3" /> 0
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Row 2: 2 images — one wide, one with text overlay */}
              {vitrineImages.length >= 5 && (
                <div className="grid grid-cols-2 gap-2 md:gap-3 mb-2 md:mb-3">
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="relative aspect-[4/3] rounded-xl md:rounded-2xl overflow-hidden group cursor-pointer"
                  >
                    <img
                      src={vitrineImages[3]}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="relative aspect-[4/3] rounded-xl md:rounded-2xl overflow-hidden flex items-center justify-center bg-accent/10"
                  >
                    <img
                      src={vitrineImages[4]}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-foreground/10 to-transparent" />
                    <div className="absolute inset-0 flex flex-col items-end justify-center pr-6 md:pr-12">
                      <span className="text-2xl md:text-5xl font-black text-destructive/80 uppercase tracking-tight leading-none">
                        INVERNO
                      </span>
                      <span className="text-3xl md:text-6xl font-black text-destructive/60 tracking-tight leading-none">
                        26
                      </span>
                    </div>
                  </motion.div>
                </div>
              )}

              {/* Row 3: 3 more images */}
              {vitrineImages.length >= 8 && (
                <div className="grid grid-cols-3 gap-2 md:gap-3">
                  {vitrineImages.slice(5, 8).map((img, i) => (
                    <motion.div
                      key={`row3-${i}`}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35 + i * 0.08 }}
                      className="relative aspect-[3/4] rounded-xl md:rounded-2xl overflow-hidden group cursor-pointer"
                    >
                      <img
                        src={img}
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex gap-2 text-primary-foreground text-xs">
                          <span className="flex items-center gap-1 bg-foreground/40 backdrop-blur-sm px-2 py-1 rounded-full">
                            <Heart className="h-3 w-3" /> 0
                          </span>
                          <span className="flex items-center gap-1 bg-foreground/40 backdrop-blur-sm px-2 py-1 rounded-full">
                            <MessageCircle className="h-3 w-3" /> 0
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* CTA when not connected */}
              {!isConnected && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-8 flex flex-col items-center gap-3 py-8 bg-card rounded-2xl border border-border"
                >
                  <Lock className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground text-center max-w-sm">
                    Conecte-se com <strong className="text-foreground">{brand.name}</strong> para acessar o catálogo completo com preços e fazer pedidos
                  </p>
                  <Button onClick={() => setIsConnected(true)}>
                    Conectar com {brand.name}
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <MobileNav />
    </div>
  );
};

export default MarcaDetalhe;
