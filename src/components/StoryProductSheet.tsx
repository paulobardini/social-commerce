import { X, ShoppingBag, Lock, ExternalLink } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { CadastroPJModal } from "@/components/CadastroPJModal";
import type { Product } from "@/data/mockProducts";

interface StoryProductSheetProps {
  open: boolean;
  onClose: () => void;
  onCloseStory: () => void;
  products: Product[];
  brandSlug: string;
}

export function StoryProductSheet({ open, onClose, onCloseStory, products, brandSlug }: StoryProductSheetProps) {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [showPJModal, setShowPJModal] = useState(false);

  const handleProductClick = () => {
    if (!isAuthenticated) {
      onClose();
      onCloseStory();
      navigate("/login");
      return;
    }
    if (!user?.pjCompleted) {
      setShowPJModal(true);
      return;
    }
    onClose();
    onCloseStory();
    navigate(`/marca/${brandSlug}/produtos`);
  };

  const needsGating = !isAuthenticated || !user?.pjCompleted;

  return (
    <>
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
                <div key={p.id} onClick={handleProductClick} className="flex items-center gap-3 rounded-lg bg-muted/50 p-2 cursor-pointer hover:bg-muted transition-colors">
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
                  {needsGating ? (
                    <Lock className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CadastroPJModal
        open={showPJModal}
        onOpenChange={setShowPJModal}
        onComplete={() => {
          setShowPJModal(false);
          onClose();
          onCloseStory();
          navigate(`/marca/${brandSlug}/produtos`);
        }}
      />
    </>
  );
}
