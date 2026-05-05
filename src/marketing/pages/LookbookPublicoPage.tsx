import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useMarketing } from "../contexts/MarketingDataContext";
import { ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";

export default function LookbookPublicoPage() {
  const { slug } = useParams();
  const [params] = useSearchParams();
  const { lookbooks, registrarLookbookView } = useMarketing();
  const lookbook = lookbooks.find(l => l.slug === slug);
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (!lookbook) return;
    const utm = params.get("utm_source");
    const origem: "whatsapp" | "email" | "direto" | "qr_code" =
      utm === "whatsapp" ? "whatsapp" : utm === "email" ? "email" : utm === "qr" ? "qr_code" : "direto";
    registrarLookbookView(slug!, origem);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  if (!lookbook) {
    return <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="text-center"><p className="text-lg font-bold text-foreground">Lookbook não encontrado</p><p className="text-sm text-muted-foreground mt-1">Confira o link recebido.</p></div>
    </div>;
  }

  const p = lookbook.paginas[page];
  const total = lookbook.paginas.length;

  return (
    <div className="min-h-screen flex items-center justify-center p-2 md:p-6 font-['Poppins']" style={{ backgroundColor: lookbook.paleta.fundo }}>
      <div className="w-full max-w-[440px] aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl flex flex-col relative" style={{ backgroundColor: lookbook.paleta.fundo, color: lookbook.paleta.texto }}>
        {/* Progress bars */}
        <div className="absolute top-2 left-2 right-2 flex gap-1 z-20">
          {lookbook.paginas.map((_, i) => (
            <div key={i} className="flex-1 h-1 rounded-full bg-white/20 overflow-hidden">
              <div className="h-full bg-white transition-all" style={{ width: i < page ? "100%" : i === page ? "100%" : "0%" }} />
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 relative overflow-hidden">
          {p?.tipo === "capa" && (<>
            {p.imagemUrl && <img src={p.imagemUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-10 left-6 right-6 text-white">
              {p.subtitulo && <p className="text-[12px] uppercase tracking-widest opacity-80">{p.subtitulo}</p>}
              <h1 className="text-3xl md:text-4xl font-bold mt-2">{p.titulo}</h1>
            </div>
          </>)}
          {p?.tipo === "imagem" && (<>
            {p.imagemUrl && <img src={p.imagemUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />}
            {p.titulo && <p className="absolute bottom-12 left-6 right-6 text-white text-[14px] font-medium drop-shadow-lg">{p.titulo}</p>}
          </>)}
          {p?.tipo === "texto" && (
            <div className="p-8 flex-1 flex flex-col justify-center h-full">
              {p.titulo && <h2 className="text-xl font-bold mb-3">{p.titulo}</h2>}
              <p className="text-[14px] leading-relaxed opacity-90 whitespace-pre-line">{p.texto}</p>
            </div>
          )}
          {p?.tipo === "produtos" && (
            <div className="p-5 h-full overflow-y-auto pb-16">
              <h2 className="text-lg font-bold mb-3">{p.titulo}</h2>
              <div className="grid grid-cols-2 gap-2">
                {(p.produtoIds || []).map((pid, idx) => (
                  <a key={pid + idx} href="#" className="aspect-[3/4] rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex flex-col items-center justify-center text-center p-3">
                    <ShoppingBag className="h-6 w-6 opacity-50 mb-1" />
                    <p className="text-[10px] opacity-80">Produto</p>
                    <p className="text-[10px] font-bold mt-1 underline">Ver detalhes</p>
                  </a>
                ))}
                {(p.produtoIds || []).length === 0 && <p className="col-span-2 text-center text-[12px] opacity-60 py-8">Nenhum produto vinculado</p>}
              </div>
            </div>
          )}
        </div>

        {/* Nav */}
        <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}
          className="absolute left-0 top-0 bottom-0 w-1/3 flex items-center justify-start pl-2 z-10 opacity-0 hover:opacity-100 transition-opacity disabled:hidden">
          <div className="h-10 w-10 rounded-full bg-black/40 backdrop-blur flex items-center justify-center text-white"><ChevronLeft className="h-5 w-5" /></div>
        </button>
        <button onClick={() => setPage(Math.min(total - 1, page + 1))} disabled={page === total - 1}
          className="absolute right-0 top-0 bottom-0 w-1/3 flex items-center justify-end pr-2 z-10 opacity-0 hover:opacity-100 transition-opacity disabled:hidden">
          <div className="h-10 w-10 rounded-full bg-black/40 backdrop-blur flex items-center justify-center text-white"><ChevronRight className="h-5 w-5" /></div>
        </button>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center justify-between text-[10px] opacity-70 z-10">
          <span>{lookbook.nome}</span>
          <span>{page + 1} / {total}</span>
        </div>
      </div>
    </div>
  );
}
