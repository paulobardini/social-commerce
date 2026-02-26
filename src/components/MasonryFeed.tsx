import { Bookmark, ExternalLink } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

import fabric1 from "@/assets/fabric-1.jpg";
import fabric2 from "@/assets/fabric-2.jpg";
import fabric3 from "@/assets/fabric-3.jpg";
import fabric4 from "@/assets/fabric-4.jpg";
import fabric5 from "@/assets/fabric-5.jpg";
import fabric6 from "@/assets/fabric-6.jpg";
import fabric7 from "@/assets/fabric-7.jpg";
import fabric8 from "@/assets/fabric-8.jpg";

const products = [
  { id: 1, name: "Algodão Orgânico Premium", supplier: "Textile House", price: "R$ 42,90/m", image: fabric1, tag: "Sustentável" },
  { id: 2, name: "Linho Natural Europeu", supplier: "Linen & Co", price: "R$ 89,00/m", image: fabric2, tag: "Importado" },
  { id: 3, name: "Veludo Forest Green", supplier: "Velvet Studio", price: "R$ 67,50/m", image: fabric3, tag: "Tendência" },
  { id: 4, name: "Twill Terracota 280g", supplier: "Cotton Mills", price: "R$ 38,00/m", image: fabric4, tag: "Novo" },
  { id: 5, name: "Herringbone Charcoal", supplier: "Wool Masters", price: "R$ 112,00/m", image: fabric5, tag: "Premium" },
  { id: 6, name: "Renda Chantilly Marfim", supplier: "Lace Atelier", price: "R$ 195,00/m", image: fabric6, tag: "Artesanal" },
  { id: 7, name: "Denim Selvedge Índigo", supplier: "Raw Denim Co", price: "R$ 78,00/m", image: fabric7, tag: "Clássico" },
  { id: 8, name: "Malha Canelada Coral", supplier: "Knit Factory", price: "R$ 29,90/m", image: fabric8, tag: "Popular" },
];

export function MasonryFeed() {
  const [saved, setSaved] = useState<Set<number>>(new Set());

  const toggleSave = (id: number) => {
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="flex-1 px-6 py-6">
      <div className="masonry-col">
        {products.map((product, i) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className="mb-5 break-inside-avoid"
          >
            <div className="group relative overflow-hidden rounded-xl bg-card shadow-sm card-hover">
              {/* Image */}
              <div className="relative overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Tag */}
                <span className="absolute left-3 top-3 rounded-full bg-card/90 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-foreground backdrop-blur-sm">
                  {product.tag}
                </span>

                {/* Overlay on hover */}
                <div className="absolute inset-0 flex items-end opacity-0 transition-opacity duration-300 group-hover:opacity-100 overlay-gradient">
                  <div className="flex w-full items-center justify-between p-4">
                    <button className="flex items-center gap-1.5 rounded-full bg-card px-4 py-2 text-xs font-semibold text-foreground shadow-md transition-transform hover:scale-105">
                      <ExternalLink className="h-3.5 w-3.5" />
                      Ver Detalhes
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSave(product.id);
                      }}
                      className={`rounded-full p-2 shadow-md backdrop-blur-sm transition-all ${
                        saved.has(product.id)
                          ? "bg-accent text-accent-foreground"
                          : "bg-card/90 text-foreground hover:bg-card"
                      }`}
                    >
                      <Bookmark
                        className="h-4 w-4"
                        fill={saved.has(product.id) ? "currentColor" : "none"}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="p-3.5">
                <h3 className="text-sm font-semibold text-foreground leading-tight">
                  {product.name}
                </h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {product.supplier}
                </p>
                <p className="mt-1.5 text-sm font-bold text-accent">
                  {product.price}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
