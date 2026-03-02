import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GradeAbertaModal } from "@/components/GradeAbertaModal";
import type { Product, Brand } from "@/data/mockProducts";

interface ProductDetailModalProps {
  product: Product | null;
  brand: Brand;
  onClose: () => void;
}

export function ProductDetailModal({ product, brand, onClose }: ProductDetailModalProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [descOpen, setDescOpen] = useState(true);
  const [specsOpen, setSpecsOpen] = useState(false);
  const [gradeOpen, setGradeOpen] = useState(false);

  if (!product) return null;

  const currentImages = product.variants[0]?.images || [];

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-foreground/60 backdrop-blur-sm"
      />

      {/* Slide-over panel */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[480px] md:w-[540px] bg-card shadow-2xl overflow-y-auto"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-10 h-9 w-9 rounded-full bg-card/90 backdrop-blur-sm border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shadow-sm"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Main image */}
        <div className="relative aspect-[3/4] overflow-hidden bg-muted">
          <AnimatePresence mode="wait">
            <motion.img
              key={selectedImage}
              src={currentImages[selectedImage]}
              alt={product.name}
              className="h-full w-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
          </AnimatePresence>
          <button className="absolute top-4 right-4 h-9 w-9 rounded-full bg-card/90 backdrop-blur-sm border border-border flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors shadow-sm">
            <Heart className="h-5 w-5" />
          </button>
        </div>

        {/* Thumbnails */}
        <div className="flex gap-2 p-4 overflow-x-auto scrollbar-hide border-b border-border">
          {currentImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedImage(idx)}
              className={`h-16 w-16 rounded-lg overflow-hidden shrink-0 border-2 transition-colors ${
                selectedImage === idx ? "border-accent" : "border-border"
              }`}
            >
              <img src={img} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>

        {/* Product info */}
        <div className="p-5 md:p-6">
          <p className="text-xs text-muted-foreground">Ref: {product.ref}</p>
          <h2 className="text-lg font-bold text-foreground mt-1 leading-tight">
            {product.name}
          </h2>
          <p className="text-2xl font-bold text-foreground mt-3">
            R$ {product.price.toFixed(2).replace(".", ",")}
          </p>

          {/* Description */}
          <button
            onClick={() => setDescOpen(!descOpen)}
            className="flex items-center justify-between w-full py-3 mt-4 border-t border-border"
          >
            <span className="text-sm font-semibold text-foreground">Descrição</span>
            {descOpen ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
          <AnimatePresence>
            {descOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <p className="text-sm text-muted-foreground leading-relaxed pb-3">
                  {product.description}
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 pb-3">
                  <li>- Malha Meia Malha de alta qualidade, garantindo conforto e caimento suave.</li>
                  <li>- Peça essencial de meia estação, com alto potencial de venda.</li>
                </ul>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Specs */}
          <button
            onClick={() => setSpecsOpen(!specsOpen)}
            className="flex items-center justify-between w-full py-3 border-t border-border"
          >
            <span className="text-sm font-semibold text-foreground">Especificações</span>
            {specsOpen ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
          <AnimatePresence>
            {specsOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="text-sm text-muted-foreground space-y-2 pb-3">
                  <p>Composição: 100% Algodão</p>
                  <p>Tamanhos: {product.sizes.join(", ")}</p>
                  <p>Cores: {product.variants.map((v) => v.color).join(", ")}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Buy button — sticky at bottom */}
          <div className="sticky bottom-0 pt-4 pb-2 bg-card">
            <Button
              onClick={() => setGradeOpen(true)}
              className="w-full gap-2"
              size="lg"
            >
              <LayoutGrid className="h-4 w-4" />
              Comprar | Montar Grade
            </Button>
          </div>
        </div>
      </motion.div>

      <GradeAbertaModal
        open={gradeOpen}
        onOpenChange={setGradeOpen}
        product={product}
      />
    </>
  );
}
