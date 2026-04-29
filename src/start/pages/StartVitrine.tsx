import { useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Search, ShoppingBag, MapPin, MessageCircle } from "lucide-react";
import { useStartData } from "../contexts/StartDataContext";
import { useStartAuth } from "../contexts/StartAuthContext";
import { useStartCart } from "../contexts/StartCartContext";
import { StartLogo } from "../components/StartLogo";
import { CATEGORIAS_PRODUTO, ESTACOES, GENEROS } from "../data/mockStart";
import { formatBRL, startClasses } from "../styles/tokens";

export default function StartVitrine() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { fornecedor } = useStartAuth();
  const { produtos } = useStartData();
  const { totalPecas, totalValor } = useStartCart();

  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState<string>("Todas");
  const [estacao, setEstacao] = useState<string>("Todas");
  const [genero, setGenero] = useState<string>("Todos");
  const [ordem, setOrdem] = useState<"recentes" | "menor" | "maior">("recentes");

  const slugCorreto = slug === fornecedor.slug;

  const lista = useMemo(() => {
    let out = produtos.filter(p => p.visivel);
    if (busca.trim()) {
      const q = busca.trim().toLowerCase();
      out = out.filter(p => p.nome.toLowerCase().includes(q) || p.categoria.toLowerCase().includes(q));
    }
    if (categoria !== "Todas") out = out.filter(p => p.categoria === categoria);
    if (estacao !== "Todas") out = out.filter(p => p.estacao === estacao);
    if (genero !== "Todos") out = out.filter(p => p.genero === genero);
    if (ordem === "menor") out = [...out].sort((a, b) => a.preco - b.preco);
    if (ordem === "maior") out = [...out].sort((a, b) => b.preco - a.preco);
    return out;
  }, [produtos, busca, categoria, estacao, genero, ordem]);

  if (!slugCorreto || !fornecedor.vitrineAtiva) {
    return (
      <div className="font-['Inter'] min-h-screen bg-white flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-[#F8F8F6] flex items-center justify-center mx-auto mb-4">
            <ShoppingBag size={28} className="text-[#A0A0A0]" />
          </div>
          <h1 className="text-[20px] font-semibold mb-2">Vitrine não encontrada</h1>
          <p className="text-[14px] text-[#6B6B6B] mb-5">
            A vitrine que você está procurando não existe ou está temporariamente indisponível.
          </p>
          <Link to="/start/login" className={startClasses.btnSecondary}>Voltar para Nextil Start</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="font-['Inter'] min-h-screen bg-white text-[#1A1A1A]">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-[rgba(0,0,0,0.08)]">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 h-14 flex items-center justify-between gap-3">
          <Link to={`/vitrine/${slug}`} className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-medium shrink-0"
              style={{ background: fornecedor.corDestaque }}
            >
              {fornecedor.iniciais}
            </div>
            <div className="min-w-0 hidden sm:block">
              <p className="text-[14px] font-medium truncate leading-tight">{fornecedor.nome}</p>
              <p className="text-[11px] text-[#6B6B6B] truncate flex items-center gap-1">
                <MapPin size={10} /> {fornecedor.cidade} · {fornecedor.estado}
              </p>
            </div>
          </Link>

          <button
            onClick={() => navigate(`/vitrine/${slug}/pedido`)}
            className="relative inline-flex items-center gap-2 bg-[#1A1A1A] hover:bg-black text-white rounded-lg px-3.5 py-2 text-[13px] font-medium transition-colors"
          >
            <ShoppingBag size={16} />
            <span className="hidden sm:inline">Meu pedido</span>
            {totalPecas > 0 && (
              <span className="bg-[#1D9E75] text-white rounded-full text-[10px] min-w-[18px] h-[18px] px-1 flex items-center justify-center font-semibold">
                {totalPecas}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-[#F8F8F6] to-white border-b border-[rgba(0,0,0,0.06)]">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-8 md:py-10">
          <div className="flex items-start gap-4 md:gap-5">
            <div
              className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center text-white text-[22px] md:text-[26px] font-semibold shrink-0"
              style={{ background: fornecedor.corDestaque }}
            >
              {fornecedor.iniciais}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-[22px] md:text-[28px] font-semibold leading-tight">{fornecedor.nome}</h1>
              <p className="text-[13px] md:text-[14px] text-[#6B6B6B] mt-1 flex items-center gap-1.5">
                <MapPin size={13} /> {fornecedor.cidade}, {fornecedor.estado}
              </p>
              <p className="text-[13px] md:text-[14px] text-[#1A1A1A] mt-3 max-w-2xl">
                {fornecedor.descricao}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href={`https://wa.me/55${fornecedor.whatsapp.replace(/\D/g, "")}`}
                  target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-2 bg-[#1D9E75] hover:bg-[#0F6E56] text-white rounded-lg px-3.5 py-2 text-[13px] font-medium transition-colors"
                >
                  <MessageCircle size={14} /> WhatsApp
                </a>
                <span className={startClasses.badgeNeutral}>Pedido mínimo a partir de 6 peças</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filtros */}
      <section className="sticky top-14 z-20 bg-white border-b border-[rgba(0,0,0,0.08)]">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-3 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[180px] max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0A0A0]" />
            <input
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder="Buscar produto..."
              className={`${startClasses.input} pl-9 py-2`}
            />
          </div>
          <select value={categoria} onChange={e => setCategoria(e.target.value)} className={`${startClasses.input} w-auto py-2`}>
            <option>Todas</option>
            {CATEGORIAS_PRODUTO.map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={estacao} onChange={e => setEstacao(e.target.value)} className={`${startClasses.input} w-auto py-2`}>
            <option>Todas</option>
            {ESTACOES.map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={genero} onChange={e => setGenero(e.target.value)} className={`${startClasses.input} w-auto py-2`}>
            <option>Todos</option>
            {GENEROS.map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={ordem} onChange={e => setOrdem(e.target.value as any)} className={`${startClasses.input} w-auto py-2`}>
            <option value="recentes">Mais recentes</option>
            <option value="menor">Menor preço</option>
            <option value="maior">Maior preço</option>
          </select>
        </div>
      </section>

      {/* Grid */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-6 py-6 md:py-8 pb-32">
        {lista.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#F8F8F6] flex items-center justify-center mb-3">
              <Search size={22} className="text-[#A0A0A0]" />
            </div>
            <p className="text-[15px] font-medium">Nenhum produto encontrado</p>
            <p className="text-[13px] text-[#6B6B6B] mt-1">Tente ajustar os filtros ou a busca</p>
          </div>
        ) : (
          <>
            <p className="text-[13px] text-[#6B6B6B] mb-4">{lista.length} produto{lista.length > 1 ? "s" : ""}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-5">
              {lista.map(p => (
                <Link
                  to={`/vitrine/${slug}/produto/${p.id}`}
                  key={p.id}
                  className="group block rounded-xl overflow-hidden border border-[rgba(0,0,0,0.08)] bg-white hover:shadow-md transition-all"
                >
                  <div
                    className="aspect-[3/4] w-full"
                    style={{ background: p.fotoCor || "#F8F8F6" }}
                  />
                  <div className="p-3">
                    <p className="text-[13px] text-[#6B6B6B] uppercase tracking-wide">{p.categoria}</p>
                    <p className="text-[14px] font-medium leading-snug line-clamp-2 mt-0.5 min-h-[36px]">{p.nome}</p>
                    <div className="flex items-end justify-between mt-2">
                      <p className="text-[15px] font-semibold text-[#1D9E75]">{formatBRL(p.preco)}</p>
                      <span className="text-[10px] text-[#A0A0A0]">mín. {p.pedidoMinimo}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </section>

      {/* Mini-cart fixo */}
      {totalPecas > 0 && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:w-[360px] z-40">
          <button
            onClick={() => navigate(`/vitrine/${slug}/pedido`)}
            className="w-full bg-[#1A1A1A] hover:bg-black text-white rounded-xl shadow-lg px-4 py-3 flex items-center justify-between transition-colors"
          >
            <span className="flex items-center gap-2 text-[13px]">
              <ShoppingBag size={16} />
              {totalPecas} peça{totalPecas > 1 ? "s" : ""} no pedido
            </span>
            <span className="text-[14px] font-semibold">{formatBRL(totalValor)} →</span>
          </button>
        </div>
      )}

      {/* Footer minimalista */}
      <footer className="border-t border-[rgba(0,0,0,0.06)] py-6 text-center">
        <Link to="/start/login" className="inline-flex items-center gap-1.5 text-[12px] text-[#A0A0A0] hover:text-[#6B6B6B]">
          Vitrine criada com <StartLogo size={11} />
        </Link>
      </footer>
    </div>
  );
}
