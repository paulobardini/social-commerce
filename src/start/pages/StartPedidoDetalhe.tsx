import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, MessageCircle, Check } from "lucide-react";
import { toast } from "sonner";
import { useStartData } from "../contexts/StartDataContext";
import { startClasses, formatBRL, formatDateLong, formatWhats } from "../styles/tokens";

export default function StartPedidoDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { pedidos, changePedidoStatus, updatePedido } = useStartData();
  const pedido = pedidos.find(p => p.id === id);
  const [obs, setObs] = useState(pedido?.observacoes || "");
  const [showComprovante, setShowComprovante] = useState(false);

  if (!pedido) return <div className="text-center py-16 text-[#6B6B6B]">Pedido não encontrado.</div>;

  const badgeMap: Record<string, string> = {
    novo: "bg-[#FAEEDA] text-[#854F0B]",
    em_producao: "bg-[#E6F1FB] text-[#185FA5]",
    pronto: "bg-[#E1F5EE] text-[#0F6E56]",
    entregue: "bg-[#E1F5EE] text-[#0F6E56]",
    cancelado: "bg-[#FCEBEB] text-[#A32D2D]",
  };
  const labelMap: Record<string, string> = {
    novo: "Novo", em_producao: "Em produção", pronto: "Pronto", entregue: "Entregue", cancelado: "Cancelado",
  };

  const advance = (next: typeof pedido.status, msg: string) => {
    changePedidoStatus(pedido.id, next);
    toast.success(msg);
  };

  const saveObs = () => { updatePedido(pedido.id, { observacoes: obs }); toast.success("Observação salva"); };

  const whatsMessage = `Olá ${pedido.compradorNome.split(" ")[0]}! Atualização do pedido #${pedido.id}: ${labelMap[pedido.status]}\nPrevisão de entrega: ${pedido.prazo || "A combinar"}\nQualquer dúvida estou à disposição!`;

  const comprovanteText = `*Pedido #${pedido.id}*\n${pedido.compradorNome}\n\n${pedido.itens.map(i => `${i.quantidade}x ${i.produtoNome} (${i.tamanho}) — ${formatBRL(i.precoUnit * i.quantidade)}`).join("\n")}\n\nTotal: ${formatBRL(pedido.total)} · ${pedido.pecas} peças\nPagamento: ${pedido.pagamento || "—"}`;

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-20 md:pb-0">
      <button onClick={() => navigate("/start/pedidos")} className="text-[#6B6B6B] hover:text-[#1A1A1A] flex items-center gap-2">
        <ArrowLeft size={18} /> <span className="text-[14px]">Voltar</span>
      </button>

      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium ${badgeMap[pedido.status]}`}>{labelMap[pedido.status]}</span>
          <span className="text-[12px] text-[#A0A0A0]">#{pedido.id}</span>
        </div>
        <h1 className="text-[22px] font-medium">Pedido #{pedido.id}</h1>
        {pedido.compradorId ? (
          <Link to={`/start/compradores/${pedido.compradorId}`} className="text-[14px] text-[#1D9E75] hover:underline">
            {pedido.compradorNome}
          </Link>
        ) : (
          <p className="text-[14px]">{pedido.compradorNome}</p>
        )}
        <p className="text-[12px] text-[#6B6B6B] mt-0.5">{pedido.compradorCidade}{pedido.compradorEstado ? `/${pedido.compradorEstado}` : ""} · {formatDateLong(pedido.data)}</p>
      </div>

      <div className={startClasses.card}>
        <p className="text-[12px] text-[#6B6B6B]">Total do pedido</p>
        <p className="text-[28px] font-medium text-[#0F6E56]">{formatBRL(pedido.total)}</p>
        <p className="text-[12px] text-[#6B6B6B]">{pedido.pecas} peças</p>
      </div>

      <div className={startClasses.card}>
        <p className="text-[13px] font-medium mb-3">Produtos</p>
        <div className="space-y-3">
          {pedido.itens.map((it, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg" style={{ background: "linear-gradient(135deg,#E1F5EE,#9FE1CB)" }} />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium truncate">{it.produtoNome}</p>
                <p className="text-[11px] text-[#6B6B6B]">Tam {it.tamanho} · {it.quantidade}un</p>
              </div>
              <p className="text-[13px] font-medium">{formatBRL(it.precoUnit * it.quantidade)}</p>
            </div>
          ))}
        </div>
        <div className="border-t border-[rgba(0,0,0,0.08)] mt-4 pt-3 flex items-center justify-between">
          <span className="text-[13px] font-medium">Total</span>
          <span className="text-[15px] font-medium text-[#0F6E56]">{formatBRL(pedido.total)}</span>
        </div>
      </div>

      <div className={startClasses.card}>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <p className="text-[11px] text-[#6B6B6B]">Pagamento</p>
            <p className="text-[13px] font-medium">{pedido.pagamento || "—"}</p>
          </div>
          <div>
            <p className="text-[11px] text-[#6B6B6B]">Prazo</p>
            <p className="text-[13px] font-medium">{pedido.prazo || "A combinar"}</p>
          </div>
        </div>
        <label className={startClasses.label}>Observações</label>
        <textarea className={startClasses.input} rows={3} value={obs} onChange={e => setObs(e.target.value)} />
        {obs !== (pedido.observacoes || "") && (
          <button onClick={saveObs} className={`${startClasses.btnSecondary} mt-2 !py-2`}>Salvar observação</button>
        )}
      </div>

      <div className={startClasses.card}>
        <p className="text-[13px] font-medium mb-3">Histórico</p>
        <ol className="space-y-2.5 relative">
          {pedido.historico.map((h, i) => (
            <li key={i} className="flex items-start gap-3 text-[12px]">
              <span className="w-2 h-2 rounded-full bg-[#1D9E75] mt-1.5 shrink-0" />
              <span className="font-medium">{labelMap[h.status]}</span>
              <span className="text-[#6B6B6B]">— {formatDateLong(h.data)}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="space-y-2">
        {pedido.status === "novo" && (
          <>
            <button onClick={() => advance("em_producao", "Pedido em produção")} className={`${startClasses.btnPrimary} w-full`}>Confirmar pedido</button>
            <button onClick={() => advance("cancelado", "Pedido cancelado")} className={`${startClasses.btnDestructive} w-full`}>Cancelar pedido</button>
          </>
        )}
        {pedido.status === "em_producao" && (
          <>
            <button onClick={() => advance("pronto", "Pedido marcado como pronto")} className={`${startClasses.btnPrimary} w-full`}>Marcar como pronto</button>
            <p className="text-[12px] text-[#6B6B6B] text-center">Avise quando as peças estiverem prontas</p>
          </>
        )}
        {pedido.status === "pronto" && (
          <>
            <button onClick={() => advance("entregue", "Pedido entregue!")} className={`${startClasses.btnPrimary} w-full`}>Marcar como entregue</button>
            <button onClick={() => setShowComprovante(true)} className={`${startClasses.btnSecondary} w-full`}>Gerar comprovante</button>
          </>
        )}
        {pedido.status === "entregue" && (
          <div className="bg-[#E1F5EE] border border-[#9FE1CB] rounded-xl px-4 py-3 flex items-center gap-3">
            <Check size={18} className="text-[#1D9E75]" />
            <span className="text-[13px] text-[#0F6E56] font-medium">Pedido entregue com sucesso</span>
          </div>
        )}
      </div>

      <button
        onClick={() => alert(`Abrindo WhatsApp para ${formatWhats(pedido.compradorWhats || "")}\n\n${whatsMessage}`)}
        className="md:hidden fixed bottom-20 left-4 right-4 bg-[#1D9E75] text-white rounded-full py-3 flex items-center justify-center gap-2 shadow-lg z-30"
      >
        <MessageCircle size={18} /> Falar com {pedido.compradorNome.split(" ")[0]}
      </button>

      {showComprovante && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-[16px] font-medium mb-3">Comprovante do pedido</h3>
            <pre className="bg-[#F8F8F6] p-4 rounded-lg text-[12px] whitespace-pre-wrap font-mono">{comprovanteText}</pre>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowComprovante(false)} className={`${startClasses.btnSecondary} flex-1`}>Fechar</button>
              <button onClick={() => { navigator.clipboard.writeText(comprovanteText); toast.success("Texto copiado!"); }} className={`${startClasses.btnPrimary} flex-1`}>Copiar texto</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
