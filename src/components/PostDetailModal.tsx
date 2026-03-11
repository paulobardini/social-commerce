import { X, ShoppingBag, ExternalLink, Lock } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { CadastroPJModal } from "@/components/CadastroPJModal";
import type { Product } from "@/data/mockProducts";

interface PostDetailModalProps {
  open: boolean;
  onClose: () => void;
  image: string;
  title: string;
  brand: string;
  brandLogo: string;
  brandSlug: string;
  linkedProducts: Product[];
}

export function PostDetailModal({ open, onClose, image, title, brand, brandLogo, brandSlug, linkedProducts }: PostDetailModalProps) {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [showPJModal, setShowPJModal] = useState(false);

  const needsGating = !isAuthenticated || !user?.pjCompleted;

  if (!open) return null;

  const handleProductClick = () => {
    if (!isAuthenticated) {
      onClose();
      navigate("/login");
      return;
    }
    if (!user?.pjCompleted) {
      setShowPJModal(true);
      return;
    }
    onClose();
    navigate(`/marca/${brandSlug}/produtos`);
  };

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg mx-3 max-h-[90vh] overflow-y-auto rounded-2xl bg-card shadow-2xl"
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-10 rounded-full bg-foreground/60 p-1.5 text-background hover:bg-foreground/80 backdrop-blur-sm"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Image */}
            <img src={image} alt={title} className="w-full object-cover rounded-t-2xl" style={{ maxHeight: "60vh" }} />

            {/* Info */}
            <div className="p-4 space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">{title}</h2>
                <div className="mt-2 flex items-center gap-2">
                  {brandLogo ? (
                    <img src={brandLogo} alt={brand} className="h-6 w-6 rounded-full object-cover border border-border" />
                  ) : (
                    <div className="h-6 w-6 rounded-full bg-accent/20 flex items-center justify-center text-[9px] font-bold text-accent border border-border">
                      {brand.charAt(0)}
                    </div>
                  )}
                  <span className="text-sm font-medium text-muted-foreground">{brand}</span>
                </div>
              </div>

              {/* Linked products */}
              {linkedProducts.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <ShoppingBag className="h-4 w-4" />
                    <span>{linkedProducts.length} produto(s) vinculado(s)</span>
                  </div>

                  {needsGating ? (
                    <button
                      onClick={handleProductClick}
                      className="w-full flex items-center gap-3 rounded-xl border border-dashed border-accent/50 bg-accent/5 p-4 transition-colors hover:bg-accent/10 cursor-pointer"
                    >
                      <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <Lock className="h-4 w-4 text-accent" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-foreground">Conecte-se para ver valores</p>
                        <p className="text-xs text-muted-foreground">
                          {!isAuthenticated ? "Faça login e complete seu cadastro" : "Complete seu cadastro PJ para acessar preços e catálogo"}
                        </p>
                      </div>
                    </button>
                  ) : (
                    <div className="space-y-2">
                      {linkedProducts.map((product) => (
                        <div
                          key={product.id}
                          onClick={handleProductClick}
                          className="flex items-center gap-3 rounded-xl border border-border p-2.5 hover:bg-muted/50 transition-colors cursor-pointer"
                        >
                          <img
                            src={product.variants[0]?.images[0]}
                            alt={product.name}
                            className="h-14 w-14 rounded-lg object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
                            <p className="text-xs text-muted-foreground">Ref: {product.ref}</p>
                            <p className="text-sm font-semibold text-accent">
                              R$ {product.price.toFixed(2).replace(".", ",")}
                            </p>
                          </div>
                          <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      <CadastroPJModal
        open={showPJModal}
        onOpenChange={setShowPJModal}
        onComplete={() => {
          setShowPJModal(false);
          onClose();
          navigate(`/marca/${brandSlug}/produtos`);
        }}
      />
    </>
  );
}
