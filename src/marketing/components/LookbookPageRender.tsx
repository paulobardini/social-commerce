import { LookbookPagina } from "../data/mockLookbooks";
import { LookbookProductCard } from "./LookbookProductCard";

interface Props {
  page: LookbookPagina;
  paletaPrimaria?: string;
  /** Tamanho do container — afeta typography. */
  scale?: "preview" | "publico";
  onProductClick?: (productId: string) => void;
}

/**
 * Renderiza visualmente uma página do lookbook, com cards reais de produto
 * e variações de layout (grid-2, grid-3, lista, split-imagem, destaque-1).
 */
export function LookbookPageRender({ page, paletaPrimaria, scale = "preview", onProductClick }: Props) {
  const titleSize = scale === "publico" ? "text-lg" : "text-sm";
  const isPublico = scale === "publico";

  if (page.tipo === "capa") {
    return (
      <div className="relative w-full h-full">
        {page.imagemUrl && <img src={page.imagemUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
        <div className="absolute bottom-6 left-5 right-5 text-white">
          {page.subtitulo && <p className={`uppercase tracking-widest opacity-90 ${isPublico ? "text-[12px]" : "text-[10px]"}`}>{page.subtitulo}</p>}
          <h2 className={`font-bold mt-1 ${isPublico ? "text-3xl md:text-4xl" : "text-2xl"}`}>{page.titulo}</h2>
        </div>
      </div>
    );
  }

  if (page.tipo === "imagem") {
    return (
      <div className="relative w-full h-full">
        {page.imagemUrl && <img src={page.imagemUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />}
        {page.titulo && <p className={`absolute bottom-4 left-4 right-4 text-white font-medium drop-shadow-lg ${isPublico ? "text-sm" : "text-[12px]"}`}>{page.titulo}</p>}
      </div>
    );
  }

  if (page.tipo === "texto") {
    return (
      <div className={`p-6 h-full flex flex-col justify-center`}>
        {page.titulo && <h3 className={`font-bold mb-2 ${isPublico ? "text-xl" : "text-lg"}`}>{page.titulo}</h3>}
        <p className={`leading-relaxed opacity-90 whitespace-pre-line ${isPublico ? "text-[14px]" : "text-[13px]"}`}>{page.texto}</p>
      </div>
    );
  }

  // tipo === "produtos"
  const ids = page.produtoIds || [];
  const layout = page.layout || "grid-2";
  const padding = isPublico ? "p-5 pb-16" : "p-3 pb-10";

  if (ids.length === 0) {
    return (
      <div className={`${padding} h-full overflow-y-auto`}>
        {page.titulo && <h3 className={`font-bold mb-3 ${titleSize}`}>{page.titulo}</h3>}
        <div className="border border-dashed border-current/30 rounded-lg p-6 text-center text-[11px] opacity-60">
          Selecione produtos no painel lateral para popular esta página.
        </div>
      </div>
    );
  }

  if (layout === "destaque-1") {
    const id = ids[0];
    return (
      <div className={`${padding} h-full overflow-y-auto`}>
        {page.titulo && <h3 className={`font-bold mb-3 ${titleSize}`}>{page.titulo}</h3>}
        <div className="aspect-[4/5] w-full">
          <LookbookProductCard productId={id} size="lg" paletaPrimaria={paletaPrimaria} onClick={() => onProductClick?.(id)} />
        </div>
      </div>
    );
  }

  if (layout === "split-imagem") {
    return (
      <div className="h-full flex flex-col">
        <div className="relative h-1/2 shrink-0">
          {page.imagemUrl && <img src={page.imagemUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          {page.titulo && <p className="absolute bottom-2 left-3 right-3 text-white text-[12px] font-bold">{page.titulo}</p>}
        </div>
        <div className={`${padding} grid grid-cols-2 gap-2 flex-1 overflow-y-auto`}>
          {ids.slice(0, 2).map(id => (
            <LookbookProductCard key={id} productId={id} size="md" paletaPrimaria={paletaPrimaria} onClick={() => onProductClick?.(id)} />
          ))}
        </div>
      </div>
    );
  }

  if (layout === "lista") {
    return (
      <div className={`${padding} h-full overflow-y-auto`}>
        {page.titulo && <h3 className={`font-bold mb-3 ${titleSize}`}>{page.titulo}</h3>}
        <div className="space-y-2">
          {ids.map(id => (
            <div key={id} className="aspect-[16/9]">
              <LookbookProductCard productId={id} size="md" paletaPrimaria={paletaPrimaria} onClick={() => onProductClick?.(id)} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const cols = layout === "grid-3" ? "grid-cols-3" : "grid-cols-2";
  const max = layout === "grid-3" ? 9 : 4;
  const cardSize = layout === "grid-3" ? "sm" : "md";
  return (
    <div className={`${padding} h-full overflow-y-auto`}>
      {page.titulo && <h3 className={`font-bold mb-3 ${titleSize}`}>{page.titulo}</h3>}
      <div className={`grid ${cols} gap-2`}>
        {ids.slice(0, max).map(id => (
          <LookbookProductCard key={id} productId={id} size={cardSize} paletaPrimaria={paletaPrimaria} onClick={() => onProductClick?.(id)} />
        ))}
      </div>
    </div>
  );
}
