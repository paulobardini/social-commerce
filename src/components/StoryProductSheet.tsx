import { X, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Product } from "@/data/mockProducts";

interface StoryProductSheetProps {
  open: boolean;
  onClose: () => void;
  products: Product[];
}

export function StoryProductSheet({ open, onClose, products }: StoryProductSheetProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="absolute bottom-0 left-0 right-0 z-20 rounded-t-2xl bg-card shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-accent" />
              <span className="text-sm font-semibold text-foreground">
                {products.length} Produto(s)
              </span>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="max-h-48 overflow-y-auto p-3 space-y-2">
            {products.map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-lg bg-muted/50 p-2">
                <img
                  src={p.variants[0]?.images[0]}
                  alt={p.name}
                  className="h-12 w-12 rounded-md object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{p.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    Ref: {p.ref} · R$ {p.price.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
