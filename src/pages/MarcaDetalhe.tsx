import { useParams, useNavigate } from "react-router-dom";
import { NextilHeader } from "@/components/NextilHeader";
import { NextilSidebar } from "@/components/NextilSidebar";
import { MobileNav } from "@/components/MobileNav";
import { getBrandBySlug } from "@/data/mockProducts";
import { useState } from "react";
import { motion } from "framer-motion";
import { Link2, Shirt, Heart, MessageCircle, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const MarcaDetalhe = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const brand = getBrandBySlug(slug || "");
  const [activeSubBrand, setActiveSubBrand] = useState<string | null>(null);

  if (!brand) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Marca não encontrada</p>
      </div>
    );
  }

  const filteredProducts = activeSubBrand
    ? brand.products.filter((p) => p.subBrandId === activeSubBrand)
    : brand.products;

  const activeSubBrandId = activeSubBrand || brand.subBrands[0]?.id;

  return (
    <div className="min-h-screen bg-background">
      <NextilHeader />
      <div className="flex">
        <NextilSidebar />
        <div className="flex-1 min-w-0 pb-16 md:pb-0">
          {/* Banner */}
          <div className="relative h-48 md:h-80 overflow-hidden">
            <img
              src={brand.banner}
              alt={brand.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
            <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8">
              <h2 className="text-2xl md:text-4xl font-bold text-primary-foreground tracking-wide font-heading">
                {brand.name.toLowerCase()}
              </h2>
              <div className="flex gap-4 mt-2">
                {brand.subBrands.map((sb) => (
                  <span
                    key={sb.id}
                    className="text-xs md:text-sm text-primary-foreground/80 font-medium"
                  >
                    {sb.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Brand info card */}
          <div className="mx-3 md:mx-6 -mt-8 relative z-10">
            <div className="bg-card rounded-xl md:rounded-2xl shadow-sm border border-border p-4 md:p-6 flex items-center gap-4 md:gap-6">
              <img
                src={brand.logo}
                alt={brand.name}
                className="h-14 w-14 md:h-20 md:w-20 rounded-xl object-cover border-2 border-border"
              />
              <div className="flex-1 min-w-0">
                <h1 className="text-lg md:text-2xl font-bold text-foreground">{brand.name}</h1>
                <p className="text-sm text-muted-foreground mt-0.5">{brand.description}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Link2 className="h-3.5 w-3.5" />
                    {brand.connections} conexões
                  </span>
                  <span className="flex items-center gap-1">
                    <Shirt className="h-3.5 w-3.5" />
                    {brand.totalProducts} produtos
                  </span>
                </div>
              </div>
              <Button
                onClick={() => {}}
                className="shrink-0"
              >
                Ver Produtos
              </Button>
            </div>
          </div>

          {/* Sub-brand tabs */}
          <div className="flex justify-center py-6 md:py-8">
            <div className="flex gap-4 md:gap-8">
              {brand.subBrands.map((sb) => (
                <button
                  key={sb.id}
                  onClick={() => setActiveSubBrand(sb.id === activeSubBrand ? null : sb.id)}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div
                    className={`h-14 w-14 md:h-18 md:w-18 rounded-full overflow-hidden border-2 transition-colors ${
                      activeSubBrandId === sb.id
                        ? "border-accent"
                        : "border-border group-hover:border-muted-foreground"
                    }`}
                  >
                    <img
                      src={sb.logo}
                      alt={sb.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <span
                    className={`text-[10px] md:text-xs font-semibold uppercase tracking-wide ${
                      activeSubBrandId === sb.id
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {sb.name}
                  </span>
                  {activeSubBrandId === sb.id && (
                    <div className="h-0.5 w-8 bg-accent rounded-full -mt-1" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Product grid */}
          <div className="px-3 md:px-6 pb-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {filteredProducts.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => navigate(`/marca/${slug}/produto/${product.id}`)}
                  className="bg-card rounded-xl overflow-hidden border border-border cursor-pointer group card-hover"
                >
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img
                      src={product.variants[0]?.images[0]}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <button
                      onClick={(e) => { e.stopPropagation(); }}
                      className="absolute top-2 right-2 h-8 w-8 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Heart className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-bold text-accent uppercase">
                      {brand.subBrands.find((sb) => sb.id === product.subBrandId)?.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Ref: {product.ref}</p>
                    <p className="text-xs text-foreground mt-1 line-clamp-2 leading-relaxed">
                      {product.name}
                    </p>
                    <p className="text-sm font-bold text-foreground mt-1.5">
                      R$ {product.price.toFixed(2).replace(".", ",")}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-0.5">
                        <Heart className="h-3 w-3" /> {product.likes}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <MessageCircle className="h-3 w-3" /> {product.comments}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <MobileNav />
    </div>
  );
};

export default MarcaDetalhe;
