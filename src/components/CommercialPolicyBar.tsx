import { motion } from "framer-motion";
import { TrendingUp, Gift } from "lucide-react";

export interface DiscountTier {
  minPieces: number;
  discountPercent: number;
}

interface Props {
  tiers: DiscountTier[];
  currentPieces: number;
}

const CommercialPolicyBar = ({ tiers, currentPieces }: Props) => {
  if (tiers.length === 0) return null;

  const sortedTiers = [...tiers].sort((a, b) => a.minPieces - b.minPieces);
  const maxPieces = sortedTiers[sortedTiers.length - 1].minPieces;

  // Find current active tier
  const activeTierIndex = sortedTiers.reduce(
    (acc, tier, i) => (currentPieces >= tier.minPieces ? i : acc),
    -1
  );

  const activeDiscount = activeTierIndex >= 0 ? sortedTiers[activeTierIndex].discountPercent : 0;

  // Next tier info
  const nextTier = activeTierIndex < sortedTiers.length - 1 ? sortedTiers[activeTierIndex + 1] : null;
  const piecesToNext = nextTier ? nextTier.minPieces - currentPieces : 0;

  const progressPercent = Math.min((currentPieces / maxPieces) * 100, 100);

  return (
    <div className="px-4 py-3 bg-muted/20 border-t border-border space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-bold text-foreground">Política Comercial</span>
        </div>
        {activeDiscount > 0 && (
          <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            {activeDiscount}% de desconto ativo
          </span>
        )}
      </div>

      {/* Progress bar with tier markers */}
      <div className="relative">
        {/* Track */}
        <div className="h-2 rounded-full bg-border overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>

        {/* Tier markers */}
        <div className="relative mt-1">
          {sortedTiers.map((tier, i) => {
            const leftPercent = (tier.minPieces / maxPieces) * 100;
            const isActive = currentPieces >= tier.minPieces;

            return (
              <div
                key={tier.minPieces}
                className="absolute -translate-x-1/2 flex flex-col items-center"
                style={{ left: `${leftPercent}%` }}
              >
                {/* Dot */}
                <div
                  className={`h-3 w-3 rounded-full border-2 -mt-[14px] ${
                    isActive
                      ? "bg-primary border-primary"
                      : "bg-card border-border"
                  }`}
                />
                {/* Label */}
                <span className={`text-[9px] mt-1 whitespace-nowrap ${isActive ? "text-primary font-bold" : "text-muted-foreground"}`}>
                  {tier.minPieces} pç
                </span>
                <span className={`text-[9px] ${isActive ? "text-primary font-bold" : "text-muted-foreground"}`}>
                  {tier.discountPercent}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Spacer for labels */}
      <div className="h-4" />

      {/* Motivational message */}
      {nextTier && piecesToNext > 0 && (
        <div className="flex items-center gap-1.5 bg-accent/50 rounded-lg px-3 py-2">
          <Gift className="h-3.5 w-3.5 text-primary shrink-0" />
          <p className="text-[11px] text-foreground">
            Adicione mais <span className="font-bold text-primary">{piecesToNext} peças</span> para
            desbloquear <span className="font-bold text-primary">{nextTier.discountPercent}%</span> de desconto!
          </p>
        </div>
      )}

      {!nextTier && activeDiscount > 0 && (
        <div className="flex items-center gap-1.5 bg-primary/10 rounded-lg px-3 py-2">
          <Gift className="h-3.5 w-3.5 text-primary shrink-0" />
          <p className="text-[11px] text-foreground font-medium">
            🎉 Você atingiu o desconto máximo de <span className="font-bold text-primary">{activeDiscount}%</span>!
          </p>
        </div>
      )}
    </div>
  );
};

export default CommercialPolicyBar;
