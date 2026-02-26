import { Plus, Eye } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

export function StoriesBar() {
  const [activeStory, setActiveStory] = useState<string | null>(null);

  const activeData = stories.find((s) => s.id === activeStory);

  return (
    <>
      <div className="border-b border-border bg-card/50 px-6 py-4">
        <div className="flex gap-5 overflow-x-auto scrollbar-hide">
          {stories.map((story) => (
            <button
              key={story.id}
              onClick={() => story.id !== "create" && setActiveStory(story.id)}
              className="flex flex-col items-center gap-2 flex-shrink-0"
            >
              {/* Circle container with ring */}
              <div
                className={`relative flex items-center justify-center ${
                  story.id === "create" ? "" : ""
                }`}
              >
                {/* Gradient ring for non-create stories */}
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
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative h-[85vh] w-[420px] overflow-hidden rounded-2xl bg-card shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Progress bar */}
              <div className="absolute top-3 left-3 right-3 z-10">
                <div className="h-0.5 w-full rounded-full bg-primary-foreground/30">
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 5, ease: "linear" }}
                    onAnimationComplete={() => setActiveStory(null)}
                    className="h-full rounded-full bg-primary-foreground"
                  />
                </div>
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
                className="h-full w-full object-cover"
              />

              {/* Overlay */}
              <div className="absolute inset-0 overlay-gradient" />

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
                className="absolute right-4 top-6 rounded-full bg-primary-foreground/20 p-1.5 text-primary-foreground backdrop-blur-sm transition-colors hover:bg-primary-foreground/40"
              >
                <Plus className="h-4 w-4 rotate-45" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
