import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ShoppingBag, MessageCircle, Plus, Minus, Check } from "lucide-react";
import { useStartData } from "../contexts/StartDataContext";
import { useStartAuth } from "../contexts/StartAuthContext";
import { useStartCart } from "../contexts/StartCartContext";
import { ProdutoFoto } from "../components/ProdutoFoto";
import { TAMANHOS_POR_TIPO } from "../data/mockStart";
import { formatBRL, startClasses } from "../styles/tokens";

export default function StartVitrineProduto() {
  const { slug, id } = useParams<{ slug: string; id: string }>();
  const navigate = useNavigate();
  const { fornecedor } = useStartAuth();
  const { produtos } = useStartData();
  const { addItem, totalPecas } = useStartCart();

  const produto = produtos.find(p => p.id === id);
  const tamanhosDisponiveis = produto ? TAMANHOS_POR_TIPO[produto.gradeTipo] : [];

  const [qts, setQts] = useState<Record<string, number>>({});
  const [added, setAdded] = useState(false);

  const totalProduto = useMemo(() => Object.values(qts).reduce((a, b) => a + b, 0), [qts]);
  const valor = produto ? totalProduto * produto.preco : 0;
  const minimo = produto?.pedidoMinimo || 0;
  const atendeMinimo = totalProduto >= minimo;

  if (!produto) {
    return (
      <div className="font-['Inter'] min-h-screen bg-white flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-[16px] font-medium mb-2">Produto não encontrado</p>
          <Link to={`/vitrine/${slug}`} className={startClasses.btnSecondary}>Voltar à vitrine</Link>
        </div>
      </div>
    );
  }

  function handleAddOrSet(tam: string, novo: number) {
    setAdded(false);
    setQts(prev => ({ ...prev, [tam]: Math.max(0, novo) }));
  }

  function handleAddToCart() {
    if (!atendeMinimo) return;
    addItem({
      produtoId: produto.id,
      produtoNome: produto.nome,
      precoUnit: produto.preco,
      fotoCor: produto.fotoCor,
      fotoUrl: produto.fotoUrl,
      porTamanho: { ...qts },
    });
    setAdded(true);
    setQts({});
    setTimeout(() => setAdded(false), 2200);
  }

  return (
    <div className="font-['Inter'] min-h-screen bg-white text-[#1A1A1A] pb-32">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-[rgba(0,0,0,0.08)]">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 h-14 flex items-center justify-between gap-3">
          <button onClick={() => navigate(`/vitrine/${slug}`)} className="inline-flex items-center gap-1.5 text-[13px] text-[#1A1A1A] hover:text-[#1D9E75]">
            <ArrowLeft size={16} /> Voltar à vitrine
          </button>
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

      <div className="max-w-[1100px] mx-auto px-0 md:px-6 py-0 md:py-10 grid md:grid-cols-2 gap-0 md:gap-12">
        {/* Imagem — full-bleed em mobile */}
        <div className="md:rounded-2xl overflow-hidden md:border md:border-[rgba(0,0,0,0.08)]">
          <ProdutoFoto fotoUrl={produto.fotoUrl} fotoCor={produto.fotoCor} alt={produto.nome} priority aspect="aspect-[3/4]" />
        </div>

        <div className="px-4 md:px-0 py-5 md:py-0">
          <p className="text-[12px] text-[#6B6B6B] uppercase tracking-wider">{produto.categoria}</p>
          <h1 className="text-[24px] md:text-[28px] font-semibold leading-tight mt-1">{produto.nome}</h1>
          <p className="text-[26px] font-semibold text-[#1D9E75] mt-3">{formatBRL(produto.preco)}<span className="text-[12px] text-[#6B6B6B] font-normal ml-1">por peça</span></p>

          <div className="flex flex-wrap gap-1.5 mt-4">
            <span className={startClasses.badgeNeutral}>{produto.estacao}</span>
            <span className={startClasses.badgeNeutral}>{produto.genero}</span>
            {produto.cor && <span className={startClasses.badgeNeutral}>{produto.cor}</span>}
            <span className={startClasses.badgeQuente}>Pedido mín. {produto.pedidoMinimo} peças</span>
          </div>

          {produto.descricao && (
            <p className="text-[14px] text-[#1A1A1A] leading-relaxed mt-5 whitespace-pre-line">{produto.descricao}</p>
          )}

          {/* Grade */}
          <div className="mt-7">
            <p className={startClasses.label}>Monte sua grade</p>
            <p className={startClasses.hint + " mb-3"}>Selecione a quantidade por tamanho</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {tamanhosDisponiveis.map(tam => {
                const estoque = produto.estoquePorTamanho[tam] ?? 0;
                const v = qts[tam] || 0;
                const semEstoque = estoque === 0;
                return (
                  <div
                    key={tam}
                    className={`rounded-lg border p-2.5 flex items-center justify-between ${
                      semEstoque ? "bg-[#F8F8F6] border-[rgba(0,0,0,0.06)] opacity-60" : "bg-white border-[rgba(0,0,0,0.12)]"
                    }`}
                  >
                    <div>
                      <p className="text-[13px] font-medium">{tam}</p>
                      <p className="text-[10px] text-[#6B6B6B]">{semEstoque ? "Sem estoque" : `${estoque} disp.`}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleAddOrSet(tam, v - 1)}
                        disabled={v === 0}
                        className="w-7 h-7 rounded border border-[rgba(0,0,0,0.12)] hover:bg-[#F8F8F6] disabled:opacity-40 flex items-center justify-center"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-7 text-center text-[13px] font-medium">{v}</span>
                      <button
                        type="button"
                        onClick={() => handleAddOrSet(tam, v + 1)}
                        disabled={semEstoque || v >= estoque}
                        className="w-7 h-7 rounded border border-[rgba(0,0,0,0.12)] hover:bg-[#F8F8F6] disabled:opacity-40 flex items-center justify-center"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Resumo */}
          <div className="mt-5 p-4 rounded-xl bg-[#F8F8F6] border border-[rgba(0,0,0,0.06)]">
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-[#6B6B6B]">Subtotal deste produto</span>
              <span className="font-medium">{totalProduto} peça{totalProduto !== 1 ? "s" : ""}</span>
            </div>
            <div className="flex items-center justify-between text-[15px] mt-1">
              <span className="font-medium">Total</span>
              <span className="font-semibold text-[#1D9E75]">{formatBRL(valor)}</span>
            </div>
            {totalProduto > 0 && !atendeMinimo && (
              <p className="text-[12px] text-[#854F0B] bg-[#FAEEDA] border border-[#FAC775] rounded-md px-2 py-1.5 mt-3">
                Faltam {minimo - totalProduto} peça(s) para atingir o pedido mínimo deste produto.
              </p>
            )}
          </div>

          {/* Ações */}
          <div className="flex flex-col sm:flex-row gap-2 mt-5">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!atendeMinimo}
              className={`${startClasses.btnPrimary} flex-1 ${added ? "bg-[#0F6E56]" : ""}`}
            >
              {added ? (<><Check size={16} /> Adicionado ao pedido</>) : (<><ShoppingBag size={16} /> Adicionar ao pedido</>)}
            </button>
            <a
              href={`https://wa.me/55${fornecedor.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá! Tenho interesse no produto "${produto.nome}".`)}`}
              target="_blank" rel="noreferrer"
              className={startClasses.btnSecondary}
            >
              <MessageCircle size={16} /> WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
