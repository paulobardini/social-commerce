import { X, ShoppingBag, ExternalLink, Lock, Heart, Bookmark, MessageCircle, ChevronRight } from "lucide-react";
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
          className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/80 backdrop-blur-sm"
          onClick={onClose}
        >
          {/* Desktop: side-by-side layout when products are shown */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className={`relative flex max-h-[90vh] rounded-2xl bg-card shadow-2xl overflow-hidden transition-all duration-300 ${
              showProducts && linkedProducts.length > 0
                ? "w-full max-w-3xl mx-3"
                : "w-full max-w-lg mx-3"
            }`}
          >
            {/* Main content */}
            <div className={`flex flex-col min-w-0 overflow-y-auto ${
              showProducts && linkedProducts.length > 0 ? "md:w-[60%] w-full" : "w-full"
            }`}>
              {/* Close */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 z-10 rounded-full bg-foreground/60 p-1.5 text-background hover:bg-foreground/80 backdrop-blur-sm"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Image */}
              <img src={image} alt={title} className="w-full object-cover" style={{ maxHeight: "55vh" }} />

              {/* Info */}
              <div className="p-4 space-y-3">
                {/* Title + brand */}
                <div>
                  <h2 className="text-lg font-semibold text-foreground">{title}</h2>
                  <div className="mt-1.5 flex items-center gap-2">
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

                {/* Engagement bar */}
                <div className="flex items-center gap-4 py-2 border-y border-border">
                  <button
                    onClick={onToggleLike}
                    className={`flex items-center gap-1.5 text-sm transition-colors ${
                      initialLiked ? "text-destructive" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Heart className="h-4 w-4" fill={initialLiked ? "currentColor" : "none"} />
                    <span className="text-xs font-medium">{likeCount}</span>
                  </button>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-xs font-medium">{commentCount}</span>
                  </div>
                  <button
                    onClick={onToggleSave}
                    className={`flex items-center gap-1.5 text-sm transition-colors ${
                      initialSaved ? "text-accent" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Bookmark className="h-4 w-4" fill={initialSaved ? "currentColor" : "none"} />
                    <span className="text-xs font-medium">Salvar</span>
                  </button>

                  {/* Products toggle button */}
                  {linkedProducts.length > 0 && (
                    <button
                      onClick={() => setShowProducts(!showProducts)}
                      className={`ml-auto flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                        showProducts
                          ? "bg-accent text-accent-foreground"
                          : "bg-muted text-foreground hover:bg-muted/80"
                      }`}
                    >
                      <ShoppingBag className="h-3.5 w-3.5" />
                      {linkedProducts.length} produto{linkedProducts.length > 1 ? "s" : ""}
                      <ChevronRight className={`h-3 w-3 transition-transform ${showProducts ? "rotate-90" : ""}`} />
                    </button>
                  )}
                </div>

                {/* Products list - mobile only (inline collapsible) */}
                <AnimatePresence>
                  {showProducts && linkedProducts.length > 0 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden md:hidden"
                    >
                      <ProductList
                        products={linkedProducts}
                        needsGating={needsGating}
                        isAuthenticated={isAuthenticated}
                        onProductClick={handleProductClick}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Comments */}
                <CommentsSection contentId={contentId} contentType="post" />
              </div>
            </div>

            {/* Desktop side panel for products */}
            <AnimatePresence>
              {showProducts && linkedProducts.length > 0 && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: "40%", opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="hidden md:flex flex-col border-l border-border overflow-hidden"
                >
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
                    <ShoppingBag className="h-4 w-4 text-accent" />
                    <span className="text-sm font-semibold text-foreground">
                      {linkedProducts.length} Produto{linkedProducts.length > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    <ProductList
                      products={linkedProducts}
                      needsGating={needsGating}
                      isAuthenticated={isAuthenticated}
                      onProductClick={handleProductClick}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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

function ProductList({
  products, needsGating, isAuthenticated, onProductClick,
}: {
  products: Product[];
  needsGating: boolean;
  isAuthenticated: boolean;
  onProductClick: () => void;
}) {
  return (
    <div className="p-3 space-y-2">
      {needsGating && (
        <button
          onClick={onProductClick}
          className="w-full flex items-center gap-3 rounded-xl border border-dashed border-accent/50 bg-accent/5 p-3 transition-colors hover:bg-accent/10 cursor-pointer"
        >
          <Lock className="h-4 w-4 text-accent flex-shrink-0" />
          <p className="text-xs font-medium text-accent">
            {!isAuthenticated ? "Faça login para ver valores" : "Complete seu cadastro PJ para ver valores"}
          </p>
        </button>
      )}
      {products.map((product) => (
        <div
          key={product.id}
          onClick={onProductClick}
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
            {needsGating ? (
              <p className="text-xs text-muted-foreground/50 italic">Conecte-se para ver o preço</p>
            ) : (
              <p className="text-sm font-semibold text-accent">
                R$ {product.price.toFixed(2).replace(".", ",")}
              </p>
            )}
          </div>
          {needsGating ? (
            <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          ) : (
            <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          )}
        </div>
      ))}
    </div>
  );
}
