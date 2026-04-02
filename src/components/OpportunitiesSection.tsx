import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { brands, mockOpportunities, type Opportunity } from "@/data/mockProducts";
import { useAuth, type ConnectedBrand } from "@/contexts/AuthContext";
import { Clock, Flame, Eye, EyeOff, X, Lock } from "lucide-react";
import { toast } from "sonner";

const allProducts = brands.flatMap((b) =>
  b.products.map((p) => ({ ...p, brandName: b.name, brandSlug: b.slug, brandLogo: b.logo }))
);

type EnrichedProduct = (typeof allProducts)[number];

function CountdownTimer({ expiresAt }: { expiresAt: string }) {
  const [, setTick] = useState(0);
  const diff = new Date(expiresAt).getTime() - Date.now();
  const hours = Math.max(0, Math.floor(diff / 3600000));
  const mins = Math.max(0, Math.floor((diff % 3600000) / 60000));

  useState(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(id);
  });

  if (diff <= 0) return <span className="text-xs opacity-70">Expirado</span>;
  return (
    <span className="flex items-center gap-1 text-xs font-medium">
      <Clock className="h-3 w-3" />
      {hours}h {mins}min restantes
    </span>
  );
}

interface OpportunitiesSectionProps {
  onSelectProduct?: (product: EnrichedProduct) => void;
  /** Show connection gating for unconnected brands */
  showConnectionGating?: boolean;
}

export function OpportunitiesSection({ onSelectProduct, showConnectionGating = false }: OpportunitiesSectionProps) {
  const { user } = useAuth();
  const [showOpportunities, setShowOpportunities] = useState(true);
  const [hiddenOpps, setHiddenOpps] = useState<string[]>([]);

  const connectedSlugs = useMemo(() => {
    return new Set((user?.connectedBrands || []).map((b: ConnectedBrand) => b.slug));
  }, [user?.connectedBrands]);

  const oppProducts = useMemo(() => {
    return mockOpportunities.map((opp) => {
      const prod = allProducts.find((p) => p.id === opp.productId);
      return { opp, product: prod };
    }).filter((x) => x.product);
  }, []);

  const visibleOpps = oppProducts.filter(({ opp }) => !hiddenOpps.includes(opp.id));

  if (!showOpportunities) {
    return (
      <div className="border-b border-border px-3 md:px-6 py-3">
        <button
          onClick={() => setShowOpportunities(true)}
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          <Eye className="h-3 w-3" /> Mostrar oportunidades
        </button>
      </div>
    );
  }

  if (visibleOpps.length === 0) return null;

  const handleRequestConnection = (brandName: string) => {
    toast.success(`Solicitação de conexão enviada para ${brandName}!`, {
      description: "Você receberá uma notificação quando a marca aceitar.",
    });
  };

  return (
    <div className="border-b border-border px-3 md:px-6 py-4">
      <div className="flex items-center gap-2 mb-3">
        <Flame className="h-5 w-5 text-destructive" />
        <h2 className="font-semibold text-foreground text-sm md:text-base">Oportunidades</h2>
        <Badge variant="secondary" className="text-[10px]">
          {visibleOpps.length} ofertas
        </Badge>
        <div className="flex-1" />
        {hiddenOpps.length > 0 && (
          <button
            onClick={() => setHiddenOpps([])}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <Eye className="h-3 w-3" /> Mostrar ocultas ({hiddenOpps.length})
          </button>
        )}
        <button
          onClick={() => setShowOpportunities(false)}
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          <EyeOff className="h-3 w-3" /> Ocultar
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
        {visibleOpps.map(({ opp, product }) => {
          if (!product) return null;
          const img = product.variants[0]?.images[0];
          const isUrgent = new Date(opp.expiresAt).getTime() - Date.now() < 86400000;
          const isConnected = !showConnectionGating || connectedSlugs.has(opp.brandSlug);

          return (
            <div key={opp.id} className="flex-shrink-0 w-[160px] relative group/card">
              {/* Hide button */}
              <button
                onClick={(e) => { e.stopPropagation(); setHiddenOpps((prev) => [...prev, opp.id]); }}
                title="Ocultar esta oportunidade"
                className="absolute top-2 right-2 z-20 opacity-0 group-hover/card:opacity-100 transition-opacity bg-card/90 backdrop-blur-sm rounded-full p-1 hover:bg-destructive hover:text-destructive-foreground"
              >
                <X className="h-3 w-3" />
              </button>

              <div
                onClick={() => isConnected && onSelectProduct?.(product)}
                className={`w-full text-left bg-card rounded-xl border border-border overflow-hidden transition-all duration-200 relative ${
                  isConnected ? "hover:shadow-lg cursor-pointer" : "cursor-default"
                }`}
              >
                {/* Discount badge */}
                <div className="absolute top-2 left-2 z-10">
                  <Badge className={`border-0 text-[10px] font-bold px-1.5 py-0.5 ${
                    isUrgent ? "bg-destructive text-destructive-foreground animate-pulse" : "bg-accent text-accent-foreground"
                  }`}>
                    -{opp.discountPercent}%
                  </Badge>
                </div>

                {/* Image */}
                <div className="aspect-square relative overflow-hidden bg-muted">
                  <img
                    src={img}
                    alt={product.name}
                    className={`w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300 ${
                      !isConnected ? "blur-[2px]" : ""
                    }`}
                  />
                  {/* Lock overlay for unconnected */}
                  {!isConnected && (
                    <div className="absolute inset-0 bg-background/40 flex items-center justify-center">
                      <Lock className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-2.5 space-y-1">
                  <p className="text-[10px] text-muted-foreground">{product.brandName}</p>
                  <p className="text-xs font-medium text-foreground line-clamp-2 leading-tight">{product.name}</p>

                  {isConnected ? (
                    <>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xs line-through text-muted-foreground">R$ {opp.originalPrice.toFixed(2)}</span>
                        <span className="text-sm font-bold text-destructive">R$ {opp.promoPrice.toFixed(2)}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">{opp.reason}</p>
                      <div className={`flex items-center gap-1 text-[10px] ${isUrgent ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                        <CountdownTimer expiresAt={opp.expiresAt} />
                      </div>
                    </>
                  ) : (
                    <div className="space-y-2 pt-1">
                      <p className="text-[10px] text-muted-foreground">Conecte-se à marca para ver os valores</p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full h-7 text-[10px]"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRequestConnection(product.brandName);
                        }}
                      >
                        <Lock className="h-3 w-3 mr-1" />
                        Solicitar conexão
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
