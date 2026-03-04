import { Bookmark, Heart } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  concept1,
  concept2,
  concept3,
  concept4,
  concept5,
  concept6,
  concept7,
  concept8,
  brandBrandili,
  brandKyly,
  brandHering,
  brandMalwee,
  brandLunender,
  brandMarisol,
  brandElian,
  brandColoritta,
} from "@/assets/placeholders";

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

  // Split pins into columns for true masonry
  const colCount = { mobile: 2, tablet: 3, desktop: 4 };
  const getColumns = (items: typeof pins, cols: number) => {
    const columns: (typeof pins)[] = Array.from({ length: cols }, () => []);
    items.forEach((item, i) => columns[i % cols].push(item));
    return columns;
  };

  const mobileColumns = getColumns(pins, 2);

  return (
    <div className="flex-1 px-2 md:px-6 py-3 md:py-6">
      {/* Mobile: 2-col flex masonry */}
      <div className="flex gap-2 md:hidden">
        {mobileColumns.map((col, colIdx) => (
          <div key={colIdx} className="flex-1 flex flex-col gap-2">
            {col.map((pin, i) => (
              <motion.div
                key={pin.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (colIdx + i * 2) * 0.08, duration: 0.4 }}
              >
                <div className="group relative overflow-hidden rounded-xl bg-card cursor-pointer">
                  <div className="relative overflow-hidden">
                    <img
                      src={typeof pin.image === "string" ? pin.image : pin.image.src}
                      alt={pin.title}
                      loading="lazy"
                      className="w-full object-cover"
                    />
                  </div>
                  <div className="p-2">
                    <h3 className="text-xs font-semibold text-foreground leading-tight line-clamp-2">{pin.title}</h3>
                    <div className="mt-1 flex items-center gap-1.5">
                      <img
                        src={typeof pin.brandLogo === "string" ? pin.brandLogo : pin.brandLogo.src}
                        alt={pin.brand}
                        className="h-5 w-5 rounded-full object-cover border border-border"
                      />
                      <span className="text-[10px] font-medium text-muted-foreground">{pin.brand}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ))}
      </div>

      {/* Desktop: CSS columns masonry */}
      <div className="hidden md:block columns-3 xl:columns-4 gap-4">
        {pins.map((pin, i) => (
          <motion.div
            key={pin.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className="mb-2 md:mb-4 break-inside-avoid"
          >
            <div className="group relative overflow-hidden rounded-xl md:rounded-2xl bg-card shadow-sm card-hover cursor-pointer">
              {/* Image */}
              <div className="relative overflow-hidden">
                <img
                  src={typeof pin.image === "string" ? pin.image : pin.image.src}
                  alt={pin.title}
                  loading="lazy"
                  className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Hover overlay (desktop) */}
                <div className="absolute inset-0 flex items-end opacity-0 transition-opacity duration-300 group-hover:opacity-100 overlay-gradient">
                  <div className="flex w-full items-center justify-between p-3 md:p-4">
                    <span className="text-xs md:text-sm font-medium text-primary-foreground line-clamp-1">{pin.title}</span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleLike(pin.id); }}
                        className={`rounded-full p-1.5 md:p-2 shadow-md backdrop-blur-sm transition-all ${
                          liked.has(pin.id)
                            ? "bg-destructive text-destructive-foreground"
                            : "bg-card/90 text-foreground hover:bg-card"
                        }`}
                      >
                        <Heart className="h-3.5 w-3.5 md:h-4 md:w-4" fill={liked.has(pin.id) ? "currentColor" : "none"} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleSave(pin.id); }}
                        className={`rounded-full p-1.5 md:p-2 shadow-md backdrop-blur-sm transition-all ${
                          saved.has(pin.id)
                            ? "bg-accent text-accent-foreground"
                            : "bg-card/90 text-foreground hover:bg-card"
                        }`}
                      >
                        <Bookmark className="h-3.5 w-3.5 md:h-4 md:w-4" fill={saved.has(pin.id) ? "currentColor" : "none"} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info - compact on mobile */}
              <div className="p-2 md:p-3.5">
                <h3 className="text-xs md:text-sm font-semibold text-foreground leading-tight line-clamp-2">
                  {pin.title}
                </h3>
                <div className="mt-1.5 md:mt-2 flex items-center gap-1.5">
                  <img
                    src={typeof pin.brandLogo === "string" ? pin.brandLogo : pin.brandLogo.src}
                    alt={pin.brand}
                    className="h-5 w-5 md:h-6 md:w-6 rounded-full object-cover border border-border"
                  />
                  <span className="text-[10px] md:text-xs font-medium text-muted-foreground">{pin.brand}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
