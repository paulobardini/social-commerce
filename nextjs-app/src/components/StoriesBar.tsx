import { Plus, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import {
  brandBrandili,
  brandKyly,
  brandHering,
  brandMalwee,
  brandLunender,
  brandMarisol,
  brandElian,
  brandColoritta,
  concept1,
  concept2,
  concept3,
  concept4,
  concept5,
  concept6,
  concept7,
  concept8,
} from "@/assets/placeholders";

interface BrandStories {
  id: string;
  brand: string;
  avatar: string;
  stories: { image: string; caption: string }[];
}

const brands: (BrandStories | { id: "create"; brand: string; avatar: null; stories: never[] })[] = [
  { id: "create", brand: "Criar Story", avatar: null, stories: [] },
  {
    id: "brandili", brand: "Brandili", avatar: typeof brandBrandili === "string" ? brandBrandili : brandBrandili.src,
    stories: [
      { image: typeof concept1 === "string" ? concept1 : concept1.src, caption: "Nova Coleção Verão 2026" },
      { image: typeof concept5 === "string" ? concept5 : concept5.src, caption: "Linha Kids Sustentável" },
      { image: typeof concept3 === "string" ? concept3 : concept3.src, caption: "Lançamento Primavera" },
    ],
  },
  {
    id: "kyly", brand: "Kyly", avatar: typeof brandKyly === "string" ? brandKyly : brandKyly.src,
    stories: [
      { image: typeof concept6 === "string" ? concept6 : concept6.src, caption: "Coleção Outono 2026" },
      { image: typeof concept2 === "string" ? concept2 : concept2.src, caption: "Novos Tecidos" },
    ],
  },
  {
    id: "hering", brand: "Hering", avatar: typeof brandHering === "string" ? brandHering : brandHering.src,
    stories: [{ image: typeof concept5 === "string" ? concept5 : concept5.src, caption: "Básicos Reinventados" }],
  },
  {
    id: "malwee", brand: "Malwee", avatar: typeof brandMalwee === "string" ? brandMalwee : brandMalwee.src,
    stories: [
      { image: typeof concept7 === "string" ? concept7 : concept7.src, caption: "Eco Fashion" },
      { image: typeof concept4 === "string" ? concept4 : concept4.src, caption: "Tendências 2026" },
      { image: typeof concept1 === "string" ? concept1 : concept1.src, caption: "Linha Premium" },
    ],
  },
  {
    id: "lunender", brand: "Lunender", avatar: typeof brandLunender === "string" ? brandLunender : brandLunender.src,
    stories: [
      { image: typeof concept8 === "string" ? concept8 : concept8.src, caption: "Night Collection" },
      { image: typeof concept6 === "string" ? concept6 : concept6.src, caption: "Urban Style" },
    ],
  },
  {
    id: "marisol", brand: "Marisol", avatar: typeof brandMarisol === "string" ? brandMarisol : brandMarisol.src,
    stories: [{ image: typeof concept3 === "string" ? concept3 : concept3.src, caption: "Infantil Verão" }],
  },
  {
    id: "elian", brand: "Elian", avatar: typeof brandElian === "string" ? brandElian : brandElian.src,
    stories: [
      { image: typeof concept4 === "string" ? concept4 : concept4.src, caption: "Baby Collection" },
      { image: typeof concept8 === "string" ? concept8 : concept8.src, caption: "Linha Conforto" },
    ],
  },
  {
    id: "coloritta", brand: "Colorittá", avatar: typeof brandColoritta === "string" ? brandColoritta : brandColoritta.src,
    stories: [{ image: typeof concept2 === "string" ? concept2 : concept2.src, caption: "Cores Vibrantes" }],
  },
];

const navigableBrands = brands.filter((b): b is BrandStories => b.id !== "create");

export function StoriesBar() {
  const router = useRouter();
  const [activeBrandId, setActiveBrandId] = useState<string | null>(null);
  const [storyIndex, setStoryIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [progressKey, setProgressKey] = useState(0);

  const brandIndex = navigableBrands.findIndex((b) => b.id === activeBrandId);
  const activeBrand = brandIndex >= 0 ? navigableBrands[brandIndex] : null;
  const activeStoryData = activeBrand?.stories[storyIndex];

  const openBrand = useCallback((brandId: string) => {
    setActiveBrandId(brandId);
    setStoryIndex(0);
    setDirection(0);
    setProgressKey((k) => k + 1);
  }, []);

  const close = useCallback(() => {
    setActiveBrandId(null);
    setStoryIndex(0);
  }, []);

  // Advance to next story within brand, or next brand
  const goNext = useCallback(() => {
    if (!activeBrand) return;
    if (storyIndex < activeBrand.stories.length - 1) {
      // Next story in same brand
      setDirection(1);
      setStoryIndex((i) => i + 1);
      setProgressKey((k) => k + 1);
    } else if (brandIndex < navigableBrands.length - 1) {
      // Next brand
      setDirection(1);
      const nextBrand = navigableBrands[brandIndex + 1];
      setActiveBrandId(nextBrand.id);
      setStoryIndex(0);
      setProgressKey((k) => k + 1);
    } else {
      close();
    }
  }, [activeBrand, storyIndex, brandIndex, close]);

  const goPrev = useCallback(() => {
    if (!activeBrand) return;
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
  }, [activeBrand, storyIndex, brandIndex]);

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

  return (
    <>
      <div className="border-b border-border bg-card/50 px-2 md:px-6 py-2.5 md:py-4">
        <div className="flex gap-2.5 md:gap-5 overflow-x-auto scrollbar-hide">
          {brands.map((brand) => (
            <button
              key={brand.id}
              onClick={() => brand.id !== "create" && openBrand(brand.id)}
              className="flex flex-col items-center gap-1.5 flex-shrink-0"
            >
              <div className="relative flex items-center justify-center">
                {brand.id !== "create" ? (
                  <div className="flex h-14 w-14 md:h-[68px] md:w-[68px] items-center justify-center rounded-full bg-gradient-to-br from-accent to-tertiary p-[2px] md:p-[3px]">
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-card p-[2px]">
                      <img
                        src={brand.avatar!}
                        alt={brand.brand}
                        className="h-full w-full rounded-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex h-14 w-14 md:h-[68px] md:w-[68px] items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/40">
                    <Plus className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                  </div>
                )}
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
            {/* Prev arrow */}
            {(storyIndex > 0 || brandIndex > 0) && (
              <button
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                className="absolute left-2 md:left-6 z-[110] rounded-full bg-card/80 p-2 text-foreground shadow-lg backdrop-blur-sm transition-colors hover:bg-card"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}

            {/* Next arrow */}
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
                  {/* Progress bar — per brand */}
                  <div className="absolute top-3 left-3 right-3 z-10 flex gap-1">
                    {activeBrand.stories.map((_, i) => (
                      <div key={i} className="h-0.5 flex-1 rounded-full bg-primary-foreground/30 overflow-hidden">
                        {i < storyIndex && (
                          <div className="h-full w-full bg-primary-foreground" />
                        )}
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
                    <img
                      src={activeBrand.avatar}
                      alt={activeBrand.brand}
                      className="h-9 w-9 rounded-full border-2 border-primary-foreground/50 object-cover"
                    />
                    <span className="text-sm font-semibold text-primary-foreground drop-shadow-md">
                      {activeBrand.brand}
                    </span>
                  </div>

                  <img
                    src={activeStoryData.image}
                    alt={activeStoryData.caption}
                    className="h-full w-full object-cover pointer-events-none"
                  />

                  <div className="absolute inset-0 overlay-gradient pointer-events-none" />

                  {/* Bottom info */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-xl font-semibold text-primary-foreground">
                      {activeBrand.brand}
                    </h3>
                    <p className="mt-1 text-sm text-primary-foreground/80">{activeStoryData.caption}</p>
                    <button
                      onClick={() => {
                        close();
                        router.push(`/marca/${activeBrand.id}`);
                      }}
                      className="mt-4 flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-transform hover:scale-105"
                    >
                      <Eye className="h-4 w-4" />
                      Ver Coleção
                    </button>
                  </div>

                  {/* Close */}
                  <button
                    onClick={close}
                    className="absolute right-4 top-6 z-10 rounded-full bg-primary-foreground/20 p-1.5 text-primary-foreground backdrop-blur-sm transition-colors hover:bg-primary-foreground/40"
                  >
                    <Plus className="h-4 w-4 rotate-45" />
                  </button>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
