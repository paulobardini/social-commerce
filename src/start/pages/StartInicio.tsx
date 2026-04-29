import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Camera, Copy, ExternalLink, AlertTriangle, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useStartAuth } from "../contexts/StartAuthContext";
import { useStartData } from "../contexts/StartDataContext";
import { startClasses, formatBRL } from "../styles/tokens";
import { calcTemperatura, diasDesde, StartPedido } from "../data/mockStart";

const statusBadge: Record<string, string> = {
  novo: "bg-[#FAEEDA] text-[#854F0B]",
  em_producao: "bg-[#E6F1FB] text-[#185FA5]",
  pronto: "bg-[#E1F5EE] text-[#0F6E56]",
  entregue: "bg-[#E1F5EE] text-[#0F6E56]",
  cancelado: "bg-[#FCEBEB] text-[#A32D2D]",
};
const statusLabel: Record<string, string> = {
  novo: "Novo", em_producao: "Em produção", pronto: "Pronto", entregue: "Entregue", cancelado: "Cancelado",
};

export default function StartInicio() {
  const navigate = useNavigate();
  const { fornecedor } = useStartAuth();
  const { pedidos, compradores, addPedido } = useStartData();
  const [copied, setCopied] = useState(false);

  const hoje = new Date();
  const saudacao = (() => {
    const h = hoje.getHours();
    if (h < 12) return "Bom dia";
    if (h < 18) return "Boa tarde";
    return "Boa noite";
  })();
  const primeiroNome = fornecedor.nome.split(" ")[0];

  const pedidosHoje = pedidos.filter(p => diasDesde(p.data) === 0);
  const faturadoHoje = pedidosHoje.reduce((s, p) => s + p.total, 0);
  const novosCount = pedidos.filter(p => p.status === "novo").length;
  const friosCount = compradores.filter(c => calcTemperatura(c.ultimoPedido) === "Frio").length;
  const recentes = useMemo(() => [...pedidos].sort((a, b) => +new Date(b.data) - +new Date(a.data)).slice(0, 4), [pedidos]);

  const link = `${fornecedor.slug}.nextil.com.br`;
  const copyLink = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Link copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  const simularNovo = () => {
    const c = compradores[0];
    addPedido({
      compradorId: c.id, compradorNome: c.loja, compradorCidade: c.cidade, compradorEstado: c.estado, compradorWhats: c.whatsapp,
      total: 320, pecas: 4, status: "novo", data: new Date().toISOString(),
      itens: [{ produtoId: "prod-1", produtoNome: "Vestido Linho Ombro a Ombro", tamanho: "M", quantidade: 4, precoUnit: 80 }],
      pagamento: "Pix",
    });
    toast.success("Novo pedido recebido!");
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[24px] font-medium">{saudacao}, {primeiroNome} 👋</h1>
        <p className="text-[13px] text-[#6B6B6B]">{hoje.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}</p>
      </div>

      {fornecedor.plano === "gratis" && (
        <div className="bg-[#FAEEDA]/60 border border-[#FAC775]/60 rounded-xl px-4 py-3 flex items-center gap-3">
          <AlertTriangle size={18} className="text-[#854F0B] shrink-0" />
          <p className="text-[13px] text-[#854F0B] flex-1">Você usou {fornecedor.produtosUsados} de 10 produtos do plano grátis</p>
          <Link to="/start/configuracoes/plano" className="text-[13px] font-medium text-[#854F0B] underline">Fazer upgrade</Link>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => navigate("/start/pedidos")} className={`${startClasses.card} text-left hover:border-[#1D9E75] transition-colors`}>
          <p className="text-[12px] text-[#6B6B6B]">Pedidos hoje</p>
          <p className="text-[28px] font-medium mt-1">{pedidosHoje.length}</p>
        </button>
        <button onClick={() => navigate("/start/pedidos")} className={`${startClasses.card} text-left hover:border-[#1D9E75] transition-colors`}>
          <p className="text-[12px] text-[#6B6B6B]">Faturado hoje</p>
          <p className="text-[24px] font-medium mt-1">{formatBRL(faturadoHoje)}</p>
        </button>
      </div>

      <div className="space-y-3">
        {novosCount > 0 && (
          <div className="bg-[#FAEEDA]/50 border border-[#FAC775]/50 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
            <p className="text-[13px] text-[#854F0B]">{novosCount} pedido(s) aguardando confirmação</p>
            <button onClick={() => navigate("/start/pedidos")} className="text-[13px] font-medium text-[#854F0B] underline whitespace-nowrap">Confirmar agora</button>
          </div>
        )}
        {friosCount > 0 && (
          <div className="bg-[#E6F1FB]/60 border border-[#BFD9F1]/60 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
            <p className="text-[13px] text-[#185FA5]">{friosCount} comprador(es) sem contato há mais de 30 dias</p>
            <button onClick={() => navigate("/start/compradores")} className="text-[13px] font-medium text-[#185FA5] underline whitespace-nowrap">Ver compradores</button>
          </div>
        )}
      </div>

      <button onClick={() => navigate("/start/catalogo/novo")} className="w-full bg-[#1D9E75] text-white rounded-xl py-4 flex items-center justify-center gap-2 hover:bg-[#0F6E56] transition-colors">
        <Camera size={20} />
        <span className="font-medium">+ Adicionar produto com foto</span>
      </button>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[16px] font-medium">Pedidos recentes</h2>
          <Link to="/start/pedidos" className="text-[13px] text-[#1D9E75] hover:text-[#0F6E56]">Ver todos →</Link>
        </div>
        <div className="space-y-2">
          {recentes.map(p => <PedidoMiniCard key={p.id} pedido={p} onClick={() => navigate(`/start/pedidos/${p.id}`)} />)}
        </div>
      </div>

      <div className="bg-[#E1F5EE] border border-[#9FE1CB] rounded-xl p-4">
        <p className="text-[12px] text-[#0F6E56] uppercase tracking-wide font-medium">Sua vitrine</p>
        <p className="text-[15px] text-[#1A1A1A] mt-1 break-all">{link}</p>
        <div className="flex gap-2 mt-3">
          <button onClick={copyLink} className={startClasses.btnSecondary}>
            <Copy size={14} /> {copied ? "Copiado!" : "Copiar"}
          </button>
          <a href={`/start/vitrine/${fornecedor.slug}`} target="_blank" rel="noreferrer" className={startClasses.btnPrimary}>
            <ExternalLink size={14} /> Abrir
          </a>
        </div>
      </div>

      <div className="text-center pt-4">
        <button onClick={simularNovo} className="inline-flex items-center gap-2 text-[12px] text-[#A0A0A0] hover:text-[#1D9E75]">
          <Sparkles size={12} /> Simular novo pedido chegando
        </button>
      </div>
    </div>
  );
}

function PedidoMiniCard({ pedido, onClick }: { pedido: StartPedido; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`w-full ${startClasses.card} text-left hover:border-[#1D9E75] transition-colors flex items-center justify-between gap-3`}>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-medium truncate">{pedido.id} · {pedido.compradorNome}</p>
        <p className="text-[12px] text-[#6B6B6B]">{pedido.pecas} peças</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-[14px] font-medium text-[#0F6E56]">{formatBRL(pedido.total)}</p>
        <span className={`mt-1 inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${statusBadge[pedido.status]}`}>{statusLabel[pedido.status]}</span>
      </div>
    </button>
  );
}
