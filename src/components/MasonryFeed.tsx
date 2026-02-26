import { Bookmark, Heart } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

import concept1 from "@/assets/concept-1.jpg";
import concept2 from "@/assets/concept-2.jpg";
import concept3 from "@/assets/concept-3.jpg";
import concept4 from "@/assets/concept-4.jpg";
import concept5 from "@/assets/concept-5.jpg";
import concept6 from "@/assets/concept-6.jpg";
import concept7 from "@/assets/concept-7.jpg";
import concept8 from "@/assets/concept-8.jpg";

import brandBrandili from "@/assets/brand-brandili.jpg";
import brandKyly from "@/assets/brand-kyly.jpg";
import brandHering from "@/assets/brand-hering.jpg";
import brandMalwee from "@/assets/brand-malwee.jpg";
import brandLunender from "@/assets/brand-lunender.jpg";
import brandMarisol from "@/assets/brand-marisol.jpg";
import brandElian from "@/assets/brand-elian.jpg";
import brandColoritta from "@/assets/brand-coloritta.jpg";

const pins = [
  { id: 1, title: "Coleção Inverno Kids 2026", brand: "Brandili", brandLogo: brandBrandili, category: "Infantil", image: concept1, likes: 342 },
  { id: 2, title: "Acessórios Outono/Inverno", brand: "Lunender", brandLogo: brandLunender, category: "Feminino", image: concept2, likes: 189 },
  { id: 3, title: "Streetwear Infantil", brand: "Kyly", brandLogo: brandKyly, category: "Infantil", image: concept3, likes: 527 },
  { id: 4, title: "Texturas & Tricôs", brand: "Malwee", brandLogo: brandMalwee, category: "Tendência", image: concept4, likes: 415 },
  { id: 5, title: "Alfaiataria Moderna", brand: "Hering", brandLogo: brandHering, category: "Masculino", image: concept5, likes: 298 },
  { id: 6, title: "Candy Colors Verão", brand: "Marisol", brandLogo: brandMarisol, category: "Infantil", image: concept6, likes: 631 },
  { id: 7, title: "Paleta Earth Tones", brand: "Elian", brandLogo: brandElian, category: "Tendência", image: concept7, likes: 456 },
  { id: 8, title: "Floral Collection", brand: "Colorittá", brandLogo: brandColoritta, category: "Feminino", image: concept8, likes: 374 },
];

export function MasonryFeed() {
  const [saved, setSaved] = useState<Set<number>>(new Set());
  const [liked, setLiked] = useState<Set<number>>(new Set());

  const toggleSave = (id: number) => {
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleLike = (id: number) => {
    setLiked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="flex-1 px-6 py-6">
      <div className="masonry-col">
        {pins.map((pin, i) => (
          <motion.div
            key={pin.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className="mb-5 break-inside-avoid"
          >
            <div className="group relative overflow-hidden rounded-2xl bg-card shadow-sm card-hover cursor-pointer">
              {/* Image */}
              <div className="relative overflow-hidden">
                <img
                  src={pin.image}
                  alt={pin.title}
                  className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Category badge */}
                <span className="absolute left-3 top-3 rounded-full bg-card/90 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-foreground backdrop-blur-sm">
                  {pin.category}
                </span>

                {/* Hover overlay */}
                <div className="absolute inset-0 flex items-end opacity-0 transition-opacity duration-300 group-hover:opacity-100 overlay-gradient">
                  <div className="flex w-full items-center justify-between p-4">
                    <span className="text-sm font-medium text-primary-foreground">{pin.title}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleLike(pin.id); }}
                        className={`rounded-full p-2 shadow-md backdrop-blur-sm transition-all ${
                          liked.has(pin.id)
                            ? "bg-destructive text-destructive-foreground"
                            : "bg-card/90 text-foreground hover:bg-card"
                        }`}
                      >
                        <Heart className="h-4 w-4" fill={liked.has(pin.id) ? "currentColor" : "none"} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleSave(pin.id); }}
                        className={`rounded-full p-2 shadow-md backdrop-blur-sm transition-all ${
                          saved.has(pin.id)
                            ? "bg-accent text-accent-foreground"
                            : "bg-card/90 text-foreground hover:bg-card"
                        }`}
                      >
                        <Bookmark className="h-4 w-4" fill={saved.has(pin.id) ? "currentColor" : "none"} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info with brand */}
              <div className="p-3.5">
                <h3 className="text-sm font-semibold text-foreground leading-tight">
                  {pin.title}
                </h3>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={pin.brandLogo}
                      alt={pin.brand}
                      className="h-6 w-6 rounded-full object-cover border border-border"
                    />
                    <span className="text-xs font-medium text-muted-foreground">{pin.brand}</span>
                  </div>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Heart className="h-3 w-3" />
                    {liked.has(pin.id) ? pin.likes + 1 : pin.likes}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
