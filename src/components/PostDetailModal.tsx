import { X, ShoppingBag, ExternalLink, Lock, Heart, Bookmark, MessageCircle, ChevronDown } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useComments } from "@/contexts/CommentsContext";
import { CadastroPJModal } from "@/components/CadastroPJModal";
import { CommentsSection } from "@/components/CommentsSection";
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
  pinId: number | string;
  initialLiked?: boolean;
  initialSaved?: boolean;
  onToggleLike?: () => void;
  onToggleSave?: () => void;
  likeCount: number;
}

export function PostDetailModal({
  open, onClose, image, title, brand, brandLogo, brandSlug,
  linkedProducts, pinId, initialLiked, initialSaved,
  onToggleLike, onToggleSave, likeCount,
}: PostDetailModalProps) {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { getCommentCount } = useComments();
  const [showPJModal, setShowPJModal] = useState(false);
  const [showProducts, setShowProducts] = useState(true);

  const needsGating = !isAuthenticated || !user?.pjCompleted;
  const contentId = brandSlug + "-" + title;
  const commentCount = getCommentCount(contentId, "post");
  const hasProducts = linkedProducts.length > 0;

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
          className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/80 backdrop-blur-sm p-2 md:p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl h-[85vh] md:h-[80vh] rounded-2xl bg-card shadow-2xl overflow-hidden flex flex-col md:flex-row"
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-20 rounded-full bg-foreground/60 p-1.5 text-background hover:bg-foreground/80 backdrop-blur-sm md:hidden"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Left: Image */}
            <div className="md:w-[55%] flex-shrink-0 bg-foreground/5 relative">
              <img
                src={image}
                alt={title}
                className="w-full h-full object-cover"
                style={{ maxHeight: "45vh" }}
              />
              {/* Desktop close on image */}
              <button
                onClick={onClose}
                className="absolute top-3 left-3 z-10 rounded-full bg-foreground/50 p-1.5 text-background hover:bg-foreground/70 backdrop-blur-sm hidden md:flex"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Right: Content */}
            <div className="flex-1 flex flex-col min-w-0 md:max-h-[92vh]">
              {/* Brand header */}
              <div className="px-4 py-3 border-b border-border flex items-center gap-3">
                {brandLogo ? (
                  <img src={brandLogo} alt={brand} className="h-9 w-9 rounded-full object-cover border border-border" />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-accent/15 flex items-center justify-center text-xs font-bold text-accent border border-border">
                    {brand.charAt(0)}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">{brand}</p>
                  <p className="text-xs text-muted-foreground truncate">{title}</p>
                </div>
              </div>

              {/* Engagement bar */}
              <div className="flex items-center px-4 py-2 border-b border-border gap-1">
                <button
                  onClick={onToggleLike}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    initialLiked ? "text-destructive bg-destructive/10" : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Heart className="h-4 w-4" fill={initialLiked ? "currentColor" : "none"} />
                  {likeCount}
                </button>
                <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground">
                  <MessageCircle className="h-4 w-4" />
                  {commentCount}
                </div>
                <button
                  onClick={onToggleSave}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    initialSaved ? "text-accent bg-accent/10" : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Bookmark className="h-4 w-4" fill={initialSaved ? "currentColor" : "none"} />
                </button>
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto">
                {/* Products */}
                {hasProducts && (
                  <div className="border-b border-border">
                    <button
                      onClick={() => setShowProducts(!showProducts)}
                      className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="h-3.5 w-3.5 text-accent" />
                        <span className="text-xs font-semibold text-foreground">
                          {linkedProducts.length} produto{linkedProducts.length > 1 ? "s" : ""}
                        </span>
                        {needsGating && (
                          <span className="flex items-center gap-1 text-[10px] text-accent bg-accent/10 rounded-full px-2 py-0.5">
                            <Lock className="h-2.5 w-2.5" /> Conecte-se
                          </span>
                        )}
                      </div>
                      <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${showProducts ? "rotate-180" : ""}`} />
                    </button>

                    <AnimatePresence initial={false}>
                      {showProducts && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: "auto" }}
                          exit={{ height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          {/* Max height = ~3 products, scroll if more */}
                          <div className="px-3 pb-2.5 space-y-1.5 max-h-[210px] overflow-y-auto">
                            {linkedProducts.map((product) => (
                              <div
                                key={product.id}
                                onClick={handleProductClick}
                                className="flex items-center gap-2.5 rounded-lg border border-border/70 p-2 hover:bg-muted/40 transition-colors cursor-pointer"
                              >
                                <img
                                  src={product.variants[0]?.images[0]}
                                  alt={product.name}
                                  className="h-10 w-10 rounded-md object-cover flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-[11px] font-medium text-foreground truncate">{product.name}</p>
                                  {needsGating ? (
                                    <p className="text-[10px] text-muted-foreground/60 italic">Conecte-se para ver o preço</p>
                                  ) : (
                                    <p className="text-[11px] font-semibold text-accent">
                                      R$ {product.price.toFixed(2).replace(".", ",")}
                                    </p>
                                  )}
                                </div>
                                {needsGating ? (
                                  <Lock className="h-3 w-3 text-muted-foreground/40 flex-shrink-0" />
                                ) : (
                                  <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                )}
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Comments */}
                <div className="p-4">
                  <CommentsSection contentId={contentId} contentType="post" />
                </div>
              </div>
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
