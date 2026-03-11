import { Bookmark, Heart, Plus, ShoppingBag, MessageCircle } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useContent } from "@/contexts/ContentContext";
import { useComments } from "@/contexts/CommentsContext";
import { CreatePostModal } from "@/components/CreatePostModal";
import { PostDetailModal } from "@/components/PostDetailModal";
import { brands, type Product } from "@/data/mockProducts";

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

interface Pin {
  id: number | string;
  title: string;
  brand: string;
  brandSlug: string;
  brandLogo: string;
  category: string;
  image: string;
  likes: number;
  linkedProducts: Product[];
}

// Helper to get sample products from a brand
function getBrandProducts(slug: string, count: number): Product[] {
  const brand = brands.find(b => b.slug === slug);
  if (!brand) return [];
  return brand.products.slice(0, count);
}

const staticPins: Pin[] = [
  { id: 1, title: "Coleção Inverno Kids 2026", brand: "Brandili", brandSlug: "brandili", brandLogo: brandBrandili, category: "Infantil", image: concept1, likes: 342, linkedProducts: getBrandProducts("brandili", 4) },
  { id: 2, title: "Acessórios Outono/Inverno", brand: "Lunender", brandSlug: "lunender", brandLogo: brandLunender, category: "Feminino", image: concept2, likes: 189, linkedProducts: [] },
  { id: 3, title: "Streetwear Infantil", brand: "Kyly", brandSlug: "kyly", brandLogo: brandKyly, category: "Infantil", image: concept3, likes: 527, linkedProducts: getBrandProducts("kyly", 5) },
  { id: 4, title: "Texturas & Tricôs", brand: "Malwee", brandSlug: "malwee", brandLogo: brandMalwee, category: "Tendência", image: concept4, likes: 415, linkedProducts: getBrandProducts("malwee", 2) },
  { id: 5, title: "Alfaiataria Moderna", brand: "Hering", brandSlug: "hering", brandLogo: brandHering, category: "Masculino", image: concept5, likes: 298, linkedProducts: getBrandProducts("hering", 6) },
  { id: 6, title: "Candy Colors Verão", brand: "Marisol", brandSlug: "marisol", brandLogo: brandMarisol, category: "Infantil", image: concept6, likes: 631, linkedProducts: getBrandProducts("marisol", 3) },
  { id: 7, title: "Paleta Earth Tones", brand: "Elian", brandSlug: "elian", brandLogo: brandElian, category: "Tendência", image: concept7, likes: 456, linkedProducts: [] },
  { id: 8, title: "Floral Collection", brand: "Colorittá", brandSlug: "coloritta", brandLogo: brandColoritta, category: "Feminino", image: concept8, likes: 374, linkedProducts: getBrandProducts("coloritta", 3) },
];

export function MasonryFeed() {
  const { isAuthenticated, user } = useAuth();
  const { userPosts } = useContent();
  const { getCommentCount } = useComments();
  const [saved, setSaved] = useState<Set<number | string>>(new Set([1, 3, 6]));
  const [liked, setLiked] = useState<Set<number | string>>(new Set([1, 4, 5, 8]));
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);

  const canCreate = isAuthenticated && (user?.role === "fabrica" || user?.role === "criador");

  const userPins: Pin[] = userPosts.map((p) => ({
    id: p.id,
    title: p.title,
    brand: p.brandName,
    brandSlug: p.brandName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-"),
    brandLogo: p.brandLogo,
    category: p.category,
    image: p.images[0],
    likes: 0,
    linkedProducts: p.linkedProducts,
  }));

  const pins = [...userPins, ...staticPins];

  const toggleSave = (id: number | string) => {
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleLike = (id: number | string) => {
    setLiked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getColumns = (items: Pin[], cols: number) => {
    const columns: Pin[][] = Array.from({ length: cols }, () => []);
    items.forEach((item, i) => columns[i % cols].push(item));
    return columns;
  };

  const mobileColumns = getColumns(pins, 2);

  const renderPin = (pin: Pin, i: number, colIdx: number, isMobile: boolean) => (
    <motion.div
      key={pin.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: isMobile ? (colIdx + i * 2) * 0.08 : i * 0.08, duration: 0.4 }}
      className={isMobile ? "" : "mb-2 md:mb-4 break-inside-avoid"}
    >
      <div
        onClick={() => setSelectedPin(pin)}
        className="group relative overflow-hidden rounded-xl md:rounded-2xl bg-card shadow-sm card-hover cursor-pointer"
      >
        <div className="relative overflow-hidden">
          <img
            src={pin.image}
            alt={pin.title}
            loading="lazy"
            className={`w-full object-cover ${!isMobile ? "transition-transform duration-500 group-hover:scale-105" : ""}`}
          />

          {pin.linkedProducts.length > 0 && (
            <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-card/90 px-2 py-1 text-[10px] font-medium text-foreground backdrop-blur-sm">
              <ShoppingBag className="h-3 w-3" />
              {pin.linkedProducts.length}
            </div>
          )}

          {!isMobile && (
            <div className="absolute inset-0 flex items-end opacity-0 transition-opacity duration-300 group-hover:opacity-100 overlay-gradient">
              <div className="flex w-full items-center justify-between p-3 md:p-4">
                <span className="text-xs md:text-sm font-medium text-primary-foreground line-clamp-1">{pin.title}</span>
                <div className="flex gap-1.5">
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleLike(pin.id); }}
                    className={`rounded-full p-1.5 md:p-2 shadow-md backdrop-blur-sm transition-all ${
                      liked.has(pin.id) ? "bg-destructive text-destructive-foreground" : "bg-card/90 text-foreground hover:bg-card"
                    }`}
                  >
                    <Heart className="h-3.5 w-3.5 md:h-4 md:w-4" fill={liked.has(pin.id) ? "currentColor" : "none"} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleSave(pin.id); }}
                    className={`rounded-full p-1.5 md:p-2 shadow-md backdrop-blur-sm transition-all ${
                      saved.has(pin.id) ? "bg-accent text-accent-foreground" : "bg-card/90 text-foreground hover:bg-card"
                    }`}
                  >
                    <Bookmark className="h-3.5 w-3.5 md:h-4 md:w-4" fill={saved.has(pin.id) ? "currentColor" : "none"} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-2.5 md:p-3.5">
          <h3 className="text-xs md:text-sm font-semibold text-foreground leading-tight line-clamp-2">{pin.title}</h3>
          <div className="mt-1.5 md:mt-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5 min-w-0">
              {pin.brandLogo ? (
                <img src={pin.brandLogo} alt={pin.brand} className="h-5 w-5 md:h-6 md:w-6 rounded-full object-cover border border-border flex-shrink-0" />
              ) : (
                <div className="h-5 w-5 md:h-6 md:w-6 rounded-full bg-accent/20 flex items-center justify-center text-[8px] font-bold text-accent border border-border flex-shrink-0">
                  {pin.brand.charAt(0)}
                </div>
              )}
              <span className="text-[10px] md:text-xs font-medium text-muted-foreground truncate">{pin.brand}</span>
            </div>
            {/* Engagement counters */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <div className={`flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-medium transition-colors ${
                liked.has(pin.id) ? "bg-destructive/10 text-destructive" : "bg-muted/60 text-muted-foreground"
              }`}>
                <Heart className="h-3 w-3" fill={liked.has(pin.id) ? "currentColor" : "none"} />
                <span>{pin.likes + (liked.has(pin.id) ? 1 : 0)}</span>
              </div>
              <div className="flex items-center gap-0.5 rounded-full bg-muted/60 px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                <MessageCircle className="h-3 w-3" />
                <span>{getCommentCount(pin.brandSlug + "-" + pin.title, "post")}</span>
              </div>
              <div className={`flex items-center rounded-full px-1 py-0.5 transition-colors ${
                saved.has(pin.id) ? "bg-accent/10 text-accent" : "bg-muted/60 text-muted-foreground"
              }`}>
                <Bookmark className="h-3 w-3" fill={saved.has(pin.id) ? "currentColor" : "none"} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="relative flex-1 px-2 md:px-6 py-3 md:py-6">
      <div className="flex gap-2 md:hidden">
        {mobileColumns.map((col, colIdx) => (
          <div key={colIdx} className="flex-1 flex flex-col gap-2">
            {col.map((pin, i) => renderPin(pin, i, colIdx, true))}
          </div>
        ))}
      </div>

      <div className="hidden md:block columns-3 xl:columns-4 gap-4">
        {pins.map((pin, i) => renderPin(pin, i, 0, false))}
      </div>

      {canCreate && (
        <button
          onClick={() => setShowCreatePost(true)}
          className="fixed bottom-20 right-4 md:bottom-8 md:right-8 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg transition-transform hover:scale-110"
        >
          <Plus className="h-6 w-6" />
        </button>
      )}

      <CreatePostModal open={showCreatePost} onClose={() => setShowCreatePost(false)} />

      {selectedPin && (
        <PostDetailModal
          open={!!selectedPin}
          onClose={() => setSelectedPin(null)}
          image={selectedPin.image}
          title={selectedPin.title}
          brand={selectedPin.brand}
          brandSlug={selectedPin.brandSlug}
          brandLogo={selectedPin.brandLogo}
          linkedProducts={selectedPin.linkedProducts}
          pinId={selectedPin.id}
          initialLiked={liked.has(selectedPin.id)}
          initialSaved={saved.has(selectedPin.id)}
          onToggleLike={() => toggleLike(selectedPin.id)}
          onToggleSave={() => toggleSave(selectedPin.id)}
          likeCount={selectedPin.likes + (liked.has(selectedPin.id) ? 1 : 0)}
        />
      )}
    </div>
  );
}
