import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";
import { useStartData } from "../contexts/StartDataContext";
import { startClasses, formatBRL, formatDateRelative, formatWhats } from "../styles/tokens";
import { calcTemperatura, diasDesde } from "../data/mockStart";
import { useStartAuth } from "../contexts/StartAuthContext";

export default function StartCompradorDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { compradores, pedidos, saveComprador } = useStartData();
  const { fornecedor } = useStartAuth();
  const c = compradores.find(x => x.id === id);
  const [obs, setObs] = useState(c?.observacoes || "");

  if (!c) return <div className="text-center py-16 text-[#6B6B6B]">Comprador não encontrado.</div>;

  const meusPedidos = useMemo(() => pedidos.filter(p => p.compradorId === c.id).sort((a, b) => +new Date(b.data) - +new Date(a.data)), [pedidos, c.id]);
  const total = meusPedidos.reduce((s, p) => s + p.total, 0);
  const ticket = meusPedidos.length ? total / meusPedidos.length : 0;
  const t = calcTemperatura(c.ultimoPedido);
  const tBg = { Quente: "bg-[#E1F5EE] text-[#0F6E56]", Morno: "bg-[#FAEEDA] text-[#854F0B]", Frio: "bg-[#E6F1FB] text-[#185FA5]" }[t];
  const iniciais = c.loja.split(" ").slice(0, 2).map(s => s[0]).join("").toUpperCase();
  const dias = diasDesde(c.ultimoPedido);

  const saveObs = () => { saveComprador({ ...c, observacoes: obs }); toast.success("Observação salva"); };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <button onClick={() => navigate("/start/compradores")} className="text-[#6B6B6B] hover:text-[#1A1A1A] flex items-center gap-2">
        <ArrowLeft size={18} /> <span className="text-[14px]">Voltar</span>
      </button>

      <div className="text-center">
        <div className="mx-auto w-20 h-20 rounded-full bg-[#1D9E75] text-white flex items-center justify-center text-[24px] font-medium mb-3">{iniciais}</div>
        <h1 className="text-[22px] font-medium">{c.contato}</h1>
        <p className="text-[14px] text-[#6B6B6B]">{c.loja}</p>
        <p className="text-[12px] text-[#6B6B6B]">{c.cidade}/{c.estado}</p>
        <span className={`inline-block mt-2 px-2.5 py-1 rounded-full text-[11px] font-medium ${tBg}`} title="Quente: até 15 dias · Morno: 16-45 · Frio: 45+">{t}</span>
      </div>

      <div className={startClasses.card}>
        <p className="text-[12px] text-[#6B6B6B] mb-1">WhatsApp</p>
        <p className="text-[14px] font-medium mb-3">{formatWhats(c.whatsapp)}</p>
        <div className="flex flex-col md:flex-row gap-2">
          <button onClick={() => alert(`Abrindo WhatsApp: ${formatWhats(c.whatsapp)}`)} className={`${startClasses.btnPrimary} flex-1`}>
            <MessageCircle size={14} /> Falar agora
          </button>
          <button onClick={() => alert(`Enviando link da vitrine para ${c.contato}: ${fornecedor.slug}.nextil.com.br`)} className={`${startClasses.btnSecondary} flex-1`}>
            <Send size={14} /> Enviar catálogo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className={`${startClasses.card} text-center`}>
          <p className="text-[20px] font-medium">{meusPedidos.length}</p>
          <p className="text-[11px] text-[#6B6B6B]">Pedidos</p>
        </div>
        <div className={`${startClasses.card} text-center`}>
          <p className="text-[16px] font-medium text-[#0F6E56]">{formatBRL(total)}</p>
          <p className="text-[11px] text-[#6B6B6B]">Total comprado</p>
        </div>
        <div className={`${startClasses.card} text-center`}>
          <p className="text-[16px] font-medium">{formatBRL(ticket)}</p>
          <p className="text-[11px] text-[#6B6B6B]">Ticket médio</p>
        </div>
      </div>

      <div>
        <p className="text-[14px] font-medium mb-2">Pedidos deste comprador</p>
        {meusPedidos.length === 0 ? (
          <p className="text-[13px] text-[#6B6B6B]">{dias === null ? "Nunca comprou ainda." : "Nenhum pedido recente."}</p>
        ) : (
          <div className="space-y-2">
            {meusPedidos.map(p => (
              <button key={p.id} onClick={() => navigate(`/start/pedidos/${p.id}`)} className={`w-full ${startClasses.card} text-left flex items-center justify-between gap-3 hover:border-[#1D9E75]`}>
                <div className="min-w-0">
                  <p className="text-[13px] font-medium">#{p.id}</p>
                  <p className="text-[11px] text-[#6B6B6B]">{p.pecas} peças · {formatDateRelative(p.data)}</p>
                </div>
                <p className="text-[13px] font-medium text-[#0F6E56]">{formatBRL(p.total)}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={startClasses.card}>
        <label className={startClasses.label}>Observações</label>
        <textarea className={startClasses.input} rows={3} value={obs} onChange={e => setObs(e.target.value)} placeholder="Anote aqui informações úteis sobre este comprador..." />
        {obs !== (c.observacoes || "") && (
          <button onClick={saveObs} className={`${startClasses.btnSecondary} mt-2 !py-2`}>Salvar</button>
        )}
      </div>
    </div>
  );
}
