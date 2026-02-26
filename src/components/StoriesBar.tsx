import { Plus, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useCallback } from "react";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import brandBrandili from "@/assets/brand-brandili.jpg";
import brandKyly from "@/assets/brand-kyly.jpg";
import brandHering from "@/assets/brand-hering.jpg";
import brandMalwee from "@/assets/brand-malwee.jpg";
import brandLunender from "@/assets/brand-lunender.jpg";
import brandMarisol from "@/assets/brand-marisol.jpg";
import brandElian from "@/assets/brand-elian.jpg";
import brandColoritta from "@/assets/brand-coloritta.jpg";

import concept1 from "@/assets/concept-1.jpg";
import concept3 from "@/assets/concept-3.jpg";
import concept4 from "@/assets/concept-4.jpg";
import concept5 from "@/assets/concept-5.jpg";
import concept6 from "@/assets/concept-6.jpg";
import concept7 from "@/assets/concept-7.jpg";
import concept8 from "@/assets/concept-8.jpg";
import concept2 from "@/assets/concept-2.jpg";

const stories = [
  { id: "create", brand: "Criar Story", avatar: null, storyImage: null },
  { id: "1", brand: "Brandili", avatar: brandBrandili, storyImage: concept1 },
  { id: "2", brand: "Kyly", avatar: brandKyly, storyImage: concept6 },
  { id: "3", brand: "Hering", avatar: brandHering, storyImage: concept5 },
  { id: "4", brand: "Malwee", avatar: brandMalwee, storyImage: concept7 },
  { id: "5", brand: "Lunender", avatar: brandLunender, storyImage: concept8 },
  { id: "6", brand: "Marisol", avatar: brandMarisol, storyImage: concept3 },
  { id: "7", brand: "Elian", avatar: brandElian, storyImage: concept4 },
  { id: "8", brand: "Colorittá", avatar: brandColoritta, storyImage: concept2 },
];

const navigableStories = stories.filter((s) => s.id !== "create");

export function StoriesBar() {
  const [activeStory, setActiveStory] = useState<string | null>(null);
  const [direction, setDirection] = useState(0);
  const [progressKey, setProgressKey] = useState(0);

  const activeData = stories.find((s) => s.id === activeStory);
  const activeIndex = navigableStories.findIndex((s) => s.id === activeStory);

  const goToStory = useCallback((index: number, dir: number) => {
    if (index >= 0 && index < navigableStories.length) {
      setDirection(dir);
      setActiveStory(navigableStories[index].id);
      setProgressKey((k) => k + 1);
    } else {
      setActiveStory(null);
    }
  }, []);

  const goNext = useCallback(() => goToStory(activeIndex + 1, 1), [activeIndex, goToStory]);
  const goPrev = useCallback(() => goToStory(activeIndex - 1, -1), [activeIndex, goToStory]);

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

  return (
    <>
      <div className="border-b border-border bg-card/50 px-3 md:px-6 py-3 md:py-4">
        <div className="flex gap-3 md:gap-5 overflow-x-auto scrollbar-hide">
          {stories.map((story) => (
            <button
              key={story.id}
              onClick={() => story.id !== "create" && setActiveStory(story.id)}
              className="flex flex-col items-center gap-2 flex-shrink-0"
            >
              <div className="relative flex items-center justify-center">
                {story.id !== "create" ? (
                  <div className="flex h-[68px] w-[68px] items-center justify-center rounded-full bg-gradient-to-br from-accent to-tertiary p-[3px]">
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-card p-[2px]">
                      <img
                        src={story.avatar!}
                        alt={story.brand}
                        className="h-full w-full rounded-full object-cover"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex h-[68px] w-[68px] items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/40">
                    <Plus className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
              </div>
              <span className="max-w-[76px] truncate text-[11px] font-medium text-muted-foreground">
                {story.brand}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Story Modal */}
      <AnimatePresence>
        {activeStory && activeData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/80 backdrop-blur-sm"
            onClick={() => setActiveStory(null)}
          >
            {/* Prev arrow */}
            {activeIndex > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                className="absolute left-2 md:left-6 z-[110] rounded-full bg-card/80 p-2 text-foreground shadow-lg backdrop-blur-sm transition-colors hover:bg-card"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}

            {/* Next arrow */}
            {activeIndex < navigableStories.length - 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                className="absolute right-2 md:right-6 z-[110] rounded-full bg-card/80 p-2 text-foreground shadow-lg backdrop-blur-sm transition-colors hover:bg-card"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            )}

            <div
              className="relative w-full max-w-[420px] overflow-hidden rounded-2xl bg-card shadow-2xl mx-4"
              style={{ aspectRatio: "9/16", maxHeight: "85vh" }}
              onClick={(e) => e.stopPropagation()}
            >
              <AnimatePresence initial={false} custom={direction} mode="popLayout">
                <motion.div
                  key={activeStory}
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
                    {navigableStories.map((s, i) => (
                      <div key={s.id} className="h-0.5 flex-1 rounded-full bg-primary-foreground/30 overflow-hidden">
                        {i < activeIndex && (
                          <div className="h-full w-full bg-primary-foreground" />
                        )}
                        {i === activeIndex && (
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
                      src={activeData.avatar!}
                      alt={activeData.brand}
                      className="h-9 w-9 rounded-full border-2 border-primary-foreground/50 object-cover"
                    />
                    <span className="text-sm font-semibold text-primary-foreground drop-shadow-md">
                      {activeData.brand}
                    </span>
                  </div>

                  <img
                    src={activeData.storyImage!}
                    alt={activeData.brand}
                    className="h-full w-full object-cover pointer-events-none"
                  />

                  <div className="absolute inset-0 overlay-gradient pointer-events-none" />

                  {/* Bottom info */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-xl font-semibold text-primary-foreground">
                      {activeData.brand}
                    </h3>
                    <p className="mt-1 text-sm text-primary-foreground/80">Nova Coleção 2026</p>
                    <button className="mt-4 flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-transform hover:scale-105">
                      <Eye className="h-4 w-4" />
                      Ver Coleção
                    </button>
                  </div>

                  {/* Close */}
                  <button
                    onClick={() => setActiveStory(null)}
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
