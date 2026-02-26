import { Plus, Eye } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import concept1 from "@/assets/concept-1.jpg";
import concept2 from "@/assets/concept-2.jpg";
import concept3 from "@/assets/concept-3.jpg";
import concept4 from "@/assets/concept-4.jpg";
import concept5 from "@/assets/concept-5.jpg";
import concept6 from "@/assets/concept-6.jpg";
import concept7 from "@/assets/concept-7.jpg";
import concept8 from "@/assets/concept-8.jpg";

const stories = [
  { id: "create", label: "Criar Story", image: null },
  { id: "1", label: "Inverno Kids", image: concept1 },
  { id: "2", label: "Acessórios FW26", image: concept2 },
  { id: "3", label: "Street Kids", image: concept3 },
  { id: "4", label: "Tricôs & Malhas", image: concept4 },
  { id: "5", label: "Alfaiataria", image: concept5 },
  { id: "6", label: "Candy Colors", image: concept6 },
  { id: "7", label: "Earth Tones", image: concept7 },
  { id: "8", label: "Verão Floral", image: concept8 },
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
              className="flex flex-col items-center gap-1.5 flex-shrink-0"
            >
              <div
                className={`flex h-16 w-16 items-center justify-center overflow-hidden rounded-full ${
                  story.id === "create"
                    ? "border-2 border-dashed border-muted-foreground/40"
                    : "story-ring"
                }`}
              >
                {story.id === "create" ? (
                  <Plus className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <img
                    src={story.image!}
                    alt={story.label}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <span className="max-w-[72px] truncate text-xs text-muted-foreground">
                {story.label}
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
                <div className="h-0.5 w-full rounded-full bg-background/30">
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 5, ease: "linear" }}
                    onAnimationComplete={() => setActiveStory(null)}
                    className="h-full rounded-full bg-background"
                  />
                </div>
              </div>

              <img
                src={activeData.image!}
                alt={activeData.label}
                className="h-full w-full object-cover"
              />

              {/* Overlay */}
              <div className="absolute inset-0 overlay-gradient" />

              {/* Bottom info */}
              <div className="absolute bottom-0 left-0 right-0 p-6 overlay-gradient">
                <h3 className="text-xl font-semibold text-card">
                  {activeData.label}
                </h3>
                <p className="mt-1 text-sm text-card/80">Tendência 2026</p>
                <button className="mt-4 flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-transform hover:scale-105">
                  <Eye className="h-4 w-4" />
                  Explorar Tendência
                </button>
              </div>

              {/* Close */}
              <button
                onClick={() => setActiveStory(null)}
                className="absolute right-4 top-6 rounded-full bg-background/20 p-1.5 text-card backdrop-blur-sm transition-colors hover:bg-background/40"
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
