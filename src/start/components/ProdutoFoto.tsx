import { ImageIcon } from "lucide-react";

interface Props {
  fotoUrl?: string;
  fotoCor?: string;
  alt?: string;
  className?: string;
  /** Define o aspect-ratio do wrapper. Padrão: 3/4 (vertical). */
  aspect?: string;
  /** Marca como hero/LCP — desativa lazy loading. */
  priority?: boolean;
  rounded?: string;
}

/**
 * Foto do produto com fallback para gradiente quando não houver imagem.
 * Mantém aspect-ratio consistente em qualquer largura (mobile-first).
 */
export function ProdutoFoto({
  fotoUrl,
  fotoCor,
  alt = "",
  className = "",
  aspect = "aspect-[3/4]",
  priority = false,
  rounded = "",
}: Props) {
  return (
    <div
      className={`${aspect} w-full overflow-hidden bg-[#F8F8F6] relative ${rounded} ${className}`}
      style={!fotoUrl ? { background: fotoCor || "#F8F8F6" } : undefined}
    >
      {fotoUrl ? (
        <img
          src={fotoUrl}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-white/70">
          <ImageIcon size={28} />
        </div>
      )}
    </div>
  );
}
