import { usePrecoVenda } from "@/hooks/usePrecoVenda";
import { fmtBRL, formatRegra } from "@/lib/precificacao";

interface Props {
  precoAtacado: number;
  brandSlug: string;
  productId: string;
  /** "card" (linha discreta) | "modal" (bloco expandido) */
  variant?: "card" | "modal";
}

/**
 * Exibe o preço de venda calculado. No card, é uma linha muito discreta
 * (12px, muted). No modal, um bloco com lucro e margem.
 */
export function PrecoVendaLinha({ precoAtacado, brandSlug, productId, variant = "card" }: Props) {
  const { precoVenda, regra, lucro, margemEfetiva, mostrarNoCard } = usePrecoVenda(
    precoAtacado,
    brandSlug,
    productId
  );

  if (!mostrarNoCard || precoVenda <= 0) return null;

  if (variant === "modal") {
    return (
      <div className="mt-2 rounded-lg bg-accent/5 border border-accent/20 p-3 space-y-1.5">
        <div className="flex items-baseline justify-between">
          <span className="text-[11px] font-semibold text-accent uppercase tracking-wide">
            Sugestão de venda
          </span>
          <span className="text-[10px] text-muted-foreground">{formatRegra(regra)}</span>
        </div>
        <p className="text-xl font-bold text-foreground leading-none">{fmtBRL(precoVenda)}</p>
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span>
            Lucro: <span className="font-semibold text-foreground">{fmtBRL(lucro)}/pç</span>
          </span>
          <span>
            Margem: <span className="font-semibold text-foreground">{margemEfetiva.toFixed(0)}%</span>
          </span>
        </div>
      </div>
    );
  }

  return (
    <p className="text-[10px] md:text-[11px] text-muted-foreground mt-0.5 leading-tight">
      Venda <span className="font-semibold text-foreground/80">{fmtBRL(precoVenda)}</span>
      <span className="text-muted-foreground/70"> · {formatRegra(regra)}</span>
    </p>
  );
}
