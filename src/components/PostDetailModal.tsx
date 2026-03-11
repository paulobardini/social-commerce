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
  const [showProducts, setShowProducts] = useState(false);

  const needsGating = !isAuthenticated || !user?.pjCompleted;
  const contentId = brandSlug + "-" + title;
  const commentCount = getCommentCount(contentId, "post");

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
          className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/80 backdrop-blur-sm p-3 md:p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-5xl max-h-[90vh] rounded-2xl bg-card shadow-2xl overflow-hidden flex flex-col md:flex-row"
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-10 rounded-full bg-foreground/60 p-1.5 text-background hover:bg-foreground/80 backdrop-blur-sm"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Left: Image — takes most space */}
            <div className="md:w-[55%] lg:w-[60%] flex-shrink-0 bg-foreground/5">
              <img
                src={image}
                alt={title}
                className="w-full h-full object-cover md:max-h-[90vh]"
                style={{ maxHeight: "45vh" }}
              />
            </div>

            {/* Right: Content */}
            <div className="flex-1 flex flex-col min-w-0 md:max-h-[90vh]">
              {/* Header */}
              <div className="p-4 pb-3 border-b border-border">
                <div className="flex items-center gap-2.5">
                  {brandLogo ? (
                    <img src={brandLogo} alt={brand} className="h-8 w-8 rounded-full object-cover border border-border" />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-accent/15 flex items-center justify-center text-[10px] font-bold text-accent border border-border">
                      {brand.charAt(0)}
                    </div>
                  )}
                  <div>
                    <span className="text-sm font-semibold text-foreground">{brand}</span>
                    <p className="text-xs text-muted-foreground leading-tight">{title}</p>
                  </div>
                </div>
              </div>

              {/* Scrollable area */}
              <div className="flex-1 overflow-y-auto">
                {/* Engagement bar */}
                <div className="flex items-center gap-1 px-4 py-2.5 border-b border-border">
                  <button
                    onClick={onToggleLike}
                    className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                      initialLiked ? "text-destructive" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <Heart className="h-4 w-4" fill={initialLiked ? "currentColor" : "none"} />
                    {likeCount}
                  </button>
                  <div className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground">
                    <MessageCircle className="h-4 w-4" />
                    {commentCount}
                  </div>
                  <button
                    onClick={onToggleSave}
                    className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                      initialSaved ? "text-accent" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <Bookmark className="h-4 w-4" fill={initialSaved ? "currentColor" : "none"} />
                    Salvar
                  </button>
                </div>

                {/* Products accordion */}
                {linkedProducts.length > 0 && (
                  <div className="border-b border-border">
                    <button
                      onClick={() => setShowProducts(!showProducts)}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="h-4 w-4 text-accent" />
                        <span className="text-sm font-medium text-foreground">
                          {linkedProducts.length} produto{linkedProducts.length > 1 ? "s" : ""} vinculado{linkedProducts.length > 1 ? "s" : ""}
                        </span>
                      </div>
                      <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${showProducts ? "rotate-180" : ""}`} />
                    </button>

                    <AnimatePresence>
                      {showProducts && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: "auto" }}
                          exit={{ height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-3 space-y-2">
                            {needsGating && (
                              <button
                                onClick={handleProductClick}
                                className="w-full flex items-center gap-2 rounded-lg border border-dashed border-accent/40 bg-accent/5 px-3 py-2 transition-colors hover:bg-accent/10 cursor-pointer"
                              >
                                <Lock className="h-3.5 w-3.5 text-accent flex-shrink-0" />
                                <p className="text-[11px] font-medium text-accent">
                                  {!isAuthenticated ? "Faça login para ver valores" : "Complete seu cadastro PJ para ver valores"}
                                </p>
                              </button>
                            )}
                            {linkedProducts.map((product) => (
                              <div
                                key={product.id}
                                onClick={handleProductClick}
                                className="flex items-center gap-2.5 rounded-lg border border-border p-2 hover:bg-muted/50 transition-colors cursor-pointer"
                              >
                                <img
                                  src={product.variants[0]?.images[0]}
                                  alt={product.name}
                                  className="h-11 w-11 rounded-md object-cover flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-foreground truncate">{product.name}</p>
                                  <p className="text-[10px] text-muted-foreground">Ref: {product.ref}</p>
                                  {needsGating ? (
                                    <p className="text-[10px] text-muted-foreground/60 italic">Conecte-se para ver o preço</p>
                                  ) : (
                                    <p className="text-xs font-semibold text-accent">
                                      R$ {product.price.toFixed(2).replace(".", ",")}
                                    </p>
                                  )}
                                </div>
                                {needsGating ? (
                                  <Lock className="h-3.5 w-3.5 text-muted-foreground/50 flex-shrink-0" />
                                ) : (
                                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
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
