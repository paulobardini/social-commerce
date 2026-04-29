import { Link, useParams, useSearchParams } from "react-router-dom";
import { CheckCircle2, MessageCircle, Home } from "lucide-react";
import { useStartAuth } from "../contexts/StartAuthContext";
import { useStartData } from "../contexts/StartDataContext";
import { formatBRL, startClasses } from "../styles/tokens";

export default function StartVitrineSucesso() {
  const { slug } = useParams<{ slug: string }>();
  const [search] = useSearchParams();
  const pedidoId = search.get("pedido");
  const { fornecedor } = useStartAuth();
  const { pedidos } = useStartData();

  const pedido = pedidos.find(p => p.id === pedidoId);

  return (
    <div className="font-['Inter'] min-h-screen bg-white flex flex-col">
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-[#E1F5EE] flex items-center justify-center mx-auto mb-5 animate-pulse-soft">
            <CheckCircle2 size={40} className="text-[#1D9E75]" />
          </div>
          <h1 className="text-[24px] font-semibold leading-tight">Pedido enviado!</h1>
          <p className="text-[14px] text-[#6B6B6B] mt-2">
            Seu pedido foi enviado para <span className="font-medium text-[#1A1A1A]">{fornecedor.nome}</span>.
            Você receberá o contato pelo WhatsApp em até 24 horas para confirmar valores e prazos.
          </p>

          {pedido && (
            <div className="mt-6 text-left p-4 rounded-xl bg-[#F8F8F6] border border-[rgba(0,0,0,0.06)]">
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-[#6B6B6B]">Número do pedido</span>
                <span className="font-mono font-semibold">{pedido.id}</span>
              </div>
              <div className="flex items-center justify-between text-[13px] mt-1.5">
                <span className="text-[#6B6B6B]">Total de peças</span>
                <span className="font-medium">{pedido.pecas}</span>
              </div>
              <div className="flex items-center justify-between text-[14px] mt-1.5">
                <span className="text-[#6B6B6B]">Total estimado</span>
                <span className="font-semibold text-[#1D9E75]">{formatBRL(pedido.total)}</span>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2 mt-6">
            <a
              href={`https://wa.me/55${fornecedor.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá! Acabei de enviar o pedido ${pedidoId} pela vitrine.`)}`}
              target="_blank" rel="noreferrer"
              className={`${startClasses.btnPrimary} flex-1`}
            >
              <MessageCircle size={16} /> Falar no WhatsApp
            </a>
            <Link to={`/vitrine/${slug}`} className={`${startClasses.btnSecondary} flex-1`}>
              <Home size={16} /> Voltar à vitrine
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
