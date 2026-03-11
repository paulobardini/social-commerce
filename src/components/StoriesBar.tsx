import { Plus, Eye, ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useContent } from "@/contexts/ContentContext";
import { CreateStoryModal } from "@/components/CreateStoryModal";
import { StoryProductSheet } from "@/components/StoryProductSheet";

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

import type { Product } from "@/data/mockProducts";

interface BrandStories {
  id: string;
  brand: string;
  avatar: string;
  stories: { image: string; caption: string; cta?: string; linkedProducts?: Product[] }[];
}

const staticBrands: BrandStories[] = [
  {
    id: "brandili", brand: "Brandili", avatar: brandBrandili,
    stories: [
      { image: concept1, caption: "Nova Coleção Verão 2026" },
      { image: concept5, caption: "Linha Kids Sustentável" },
      { image: concept3, caption: "Lançamento Primavera" },
    ],
  },
  {
    id: "kyly", brand: "Kyly", avatar: brandKyly,
    stories: [
      { image: concept6, caption: "Coleção Outono 2026" },
      { image: concept2, caption: "Novos Tecidos" },
    ],
  },
  {
    id: "hering", brand: "Hering", avatar: brandHering,
    stories: [{ image: concept5, caption: "Básicos Reinventados" }],
  },
  {
    id: "malwee", brand: "Malwee", avatar: brandMalwee,
    stories: [
      { image: concept7, caption: "Eco Fashion" },
      { image: concept4, caption: "Tendências 2026" },
      { image: concept1, caption: "Linha Premium" },
    ],
  },
  {
    id: "lunender", brand: "Lunender", avatar: brandLunender,
    stories: [
      { image: concept8, caption: "Night Collection" },
      { image: concept6, caption: "Urban Style" },
    ],
  },
  {
    id: "marisol", brand: "Marisol", avatar: brandMarisol,
    stories: [{ image: concept3, caption: "Infantil Verão" }],
  },
  {
    id: "elian", brand: "Elian", avatar: brandElian,
    stories: [
      { image: concept4, caption: "Baby Collection" },
      { image: concept8, caption: "Linha Conforto" },
    ],
  },
  {
    id: "coloritta", brand: "Colorittá", avatar: brandColoritta,
    stories: [{ image: concept2, caption: "Cores Vibrantes" }],
  },
];

export function StoriesBar() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { userStories } = useContent();

  const [activeBrandId, setActiveBrandId] = useState<string | null>(null);
  const [storyIndex, setStoryIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [progressKey, setProgressKey] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showProductSheet, setShowProductSheet] = useState(false);

  // Merge user stories into brands list
  const navigableBrands = useMemo<BrandStories[]>(() => {
    const userBrandStories: BrandStories[] = [];
    // Group user stories by brandName
    const grouped = new Map<string, BrandStories>();
    for (const s of userStories) {
      const key = s.brandName || "Meu Story";
      if (!grouped.has(key)) {
        grouped.set(key, {
          id: `user-${key}`,
          brand: key,
          avatar: s.brandAvatar || "",
          stories: [],
        });
      }
      grouped.get(key)!.stories.push({
        image: s.image,
        caption: s.caption,
        cta: s.cta,
        linkedProducts: s.linkedProducts,
      });
    }
    grouped.forEach((v) => userBrandStories.push(v));
    return [...userBrandStories, ...staticBrands];
  }, [userStories]);

  const canCreate = isAuthenticated && (user?.role === "fabrica" || user?.role === "criador");

  const brandIndex = navigableBrands.findIndex((b) => b.id === activeBrandId);
  const activeBrand = brandIndex >= 0 ? navigableBrands[brandIndex] : null;
  const activeStoryData = activeBrand?.stories[storyIndex];
  const activeLinkedProducts = activeStoryData?.linkedProducts || [];

  const openBrand = useCallback((brandId: string) => {
    setActiveBrandId(brandId);
    setStoryIndex(0);
    setDirection(0);
    setProgressKey((k) => k + 1);
    setShowProductSheet(false);
  }, []);

  const close = useCallback(() => {
    setActiveBrandId(null);
    setStoryIndex(0);
    setShowProductSheet(false);
  }, []);

  const goNext = useCallback(() => {
    if (!activeBrand) return;
    setShowProductSheet(false);
    if (storyIndex < activeBrand.stories.length - 1) {
      setDirection(1);
      setStoryIndex((i) => i + 1);
      setProgressKey((k) => k + 1);
    } else if (brandIndex < navigableBrands.length - 1) {
      setDirection(1);
      const nextBrand = navigableBrands[brandIndex + 1];
      setActiveBrandId(nextBrand.id);
      setStoryIndex(0);
      setProgressKey((k) => k + 1);
    } else {
      close();
    }
  }, [activeBrand, storyIndex, brandIndex, navigableBrands, close]);

  const goPrev = useCallback(() => {
    if (!activeBrand) return;
    setShowProductSheet(false);
    if (storyIndex > 0) {
      setDirection(-1);
      setStoryIndex((i) => i - 1);
      setProgressKey((k) => k + 1);
    } else if (brandIndex > 0) {
      setDirection(-1);
      const prevBrand = navigableBrands[brandIndex - 1];
      setActiveBrandId(prevBrand.id);
      setStoryIndex(prevBrand.stories.length - 1);
      setProgressKey((k) => k + 1);
    }
  }, [activeBrand, storyIndex, brandIndex, navigableBrands]);

  const handleDragEnd = useCallback((_: any, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.x < -threshold) goNext();
    else if (info.offset.x > threshold) goPrev();
  }, [goNext, goPrev]);

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0 }),
  };

  const contentKey = activeBrand ? `${activeBrand.id}-${storyIndex}` : "";

  const handleCreateClick = () => {
    if (!isAuthenticated) {
      navigate("/login");
    } else if (canCreate) {
      setShowCreateModal(true);
    }
  };

  return (
    <>
      <div className="border-b border-border bg-card/50 px-2 md:px-6 py-2.5 md:py-4">
        <div className="flex gap-2.5 md:gap-5 overflow-x-auto scrollbar-hide">
          {/* Create button */}
          <button
            onClick={handleCreateClick}
            className="flex flex-col items-center gap-1.5 flex-shrink-0"
          >
            <div className="flex h-14 w-14 md:h-[68px] md:w-[68px] items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/40">
              <Plus className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
            </div>
            <span className="max-w-[60px] md:max-w-[76px] truncate text-[10px] md:text-[11px] font-medium text-muted-foreground">
              Criar Story
            </span>
          </button>

          {/* Brand circles */}
          {navigableBrands.map((brand) => (
            <button
              key={brand.id}
              onClick={() => openBrand(brand.id)}
              className="flex flex-col items-center gap-1.5 flex-shrink-0"
            >
              <div className="flex h-14 w-14 md:h-[68px] md:w-[68px] items-center justify-center rounded-full bg-gradient-to-br from-accent to-tertiary p-[2px] md:p-[3px]">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-card p-[2px]">
                  {brand.avatar ? (
                    <img src={brand.avatar} alt={brand.brand} className="h-full w-full rounded-full object-cover" loading="lazy" />
                  ) : (
                    <div className="h-full w-full rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold text-accent">
                      {brand.brand.charAt(0)}
                    </div>
                  )}
                </div>
              </div>
              <span className="max-w-[60px] md:max-w-[76px] truncate text-[10px] md:text-[11px] font-medium text-muted-foreground">
                {brand.brand}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Story Modal */}
      <AnimatePresence>
        {activeBrand && activeStoryData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/80 backdrop-blur-sm"
            onClick={close}
          >
            {(storyIndex > 0 || brandIndex > 0) && (
              <button
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                className="absolute left-2 md:left-6 z-[110] rounded-full bg-card/80 p-2 text-foreground shadow-lg backdrop-blur-sm transition-colors hover:bg-card"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
            {(storyIndex < activeBrand.stories.length - 1 || brandIndex < navigableBrands.length - 1) && (
              <button
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                className="absolute right-2 md:right-6 z-[110] rounded-full bg-card/80 p-2 text-foreground shadow-lg backdrop-blur-sm transition-colors hover:bg-card"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            )}

            <div
              className="relative w-full max-w-[420px] overflow-hidden rounded-2xl bg-card shadow-2xl mx-2 md:mx-4"
              style={{ aspectRatio: "9/16", maxHeight: "90vh" }}
              onClick={(e) => e.stopPropagation()}
            >
              <AnimatePresence initial={false} custom={direction} mode="popLayout">
                <motion.div
                  key={contentKey}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={handleDragEnd}
                  className="absolute inset-0"
                >
                  {/* Progress bar */}
                  <div className="absolute top-3 left-3 right-3 z-10 flex gap-1">
                    {activeBrand.stories.map((_, i) => (
                      <div key={i} className="h-0.5 flex-1 rounded-full bg-primary-foreground/30 overflow-hidden">
                        {i < storyIndex && <div className="h-full w-full bg-primary-foreground" />}
                        {i === storyIndex && (
                          <motion.div
                            key={progressKey}
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 5, ease: "linear" }}
                            onAnimationComplete={goNext}
                            className="h-full bg-primary-foreground"
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Brand header */}
                  <div className="absolute top-6 left-4 z-10 flex items-center gap-3">
                    {activeBrand.avatar ? (
                      <img src={activeBrand.avatar} alt={activeBrand.brand} className="h-9 w-9 rounded-full border-2 border-primary-foreground/50 object-cover" />
                    ) : (
                      <div className="h-9 w-9 rounded-full border-2 border-primary-foreground/50 bg-accent/30 flex items-center justify-center text-xs font-bold text-primary-foreground">
                        {activeBrand.brand.charAt(0)}
                      </div>
                    )}
                    <span className="text-sm font-semibold text-primary-foreground drop-shadow-md">
                      {activeBrand.brand}
                    </span>
                  </div>

                  <img src={activeStoryData.image} alt={activeStoryData.caption} className="h-full w-full object-cover pointer-events-none" />
                  <div className="absolute inset-0 overlay-gradient pointer-events-none" />

                  {/* Bottom info */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-xl font-semibold text-primary-foreground">{activeBrand.brand}</h3>
                    <p className="mt-1 text-sm text-primary-foreground/80">{activeStoryData.caption}</p>
                    <div className="mt-4 flex items-center gap-2">
                      <button
                        onClick={() => { close(); navigate(`/marca/${activeBrand.id}`); }}
                        className="flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-transform hover:scale-105"
                      >
                        <Eye className="h-4 w-4" />
                        {activeStoryData.cta || "Ver Coleção"}
                      </button>
                      {activeLinkedProducts.length > 0 && (
                        <button
                          onClick={() => setShowProductSheet(!showProductSheet)}
                          className="flex items-center gap-1.5 rounded-full bg-card/80 px-3 py-2.5 text-sm font-medium text-foreground backdrop-blur-sm transition-transform hover:scale-105"
                        >
                          <ShoppingBag className="h-4 w-4" />
                          {activeLinkedProducts.length}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Close */}
                  <button
                    onClick={close}
                    className="absolute right-4 top-6 z-10 rounded-full bg-primary-foreground/20 p-1.5 text-primary-foreground backdrop-blur-sm transition-colors hover:bg-primary-foreground/40"
                  >
                    <Plus className="h-4 w-4 rotate-45" />
                  </button>

                  {/* Product sheet */}
                  <StoryProductSheet
                    open={showProductSheet}
                    onClose={() => setShowProductSheet(false)}
                    onCloseStory={close}
                    products={activeLinkedProducts}
                    brandSlug={activeBrand.id}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Story Modal */}
      <CreateStoryModal open={showCreateModal} onClose={() => setShowCreateModal(false)} />
    </>
  );
}
