import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useStartData } from "../contexts/StartDataContext";
import { startClasses, formatBRL, formatDateRelative } from "../styles/tokens";
import { StartPedido, StartPedidoStatus } from "../data/mockStart";

const tabs: { v: StartPedidoStatus | "todos"; l: string }[] = [
  { v: "novo", l: "Novos" },
  { v: "em_producao", l: "Em produção" },
  { v: "pronto", l: "Prontos" },
  { v: "entregue", l: "Entregues" },
  { v: "cancelado", l: "Cancelados" },
];

export default function StartPedidos() {
  const navigate = useNavigate();
  const { pedidos, changePedidoStatus } = useStartData();
  const [tab, setTab] = useState<StartPedidoStatus>("novo");
  const [confirmarId, setConfirmarId] = useState<string | null>(null);

  const counts = useMemo(() => ({
    novo: pedidos.filter(p => p.status === "novo").length,
    em_producao: pedidos.filter(p => p.status === "em_producao").length,
    pronto: pedidos.filter(p => p.status === "pronto").length,
    entregue: pedidos.filter(p => p.status === "entregue").length,
    cancelado: pedidos.filter(p => p.status === "cancelado").length,
  }), [pedidos]);

  const lista = useMemo(() => pedidos.filter(p => p.status === tab).sort((a, b) => +new Date(b.data) - +new Date(a.data)), [pedidos, tab]);

  const confirmar = () => {
    if (!confirmarId) return;
    changePedidoStatus(confirmarId, "em_producao");
    toast.success("Pedido confirmado e em produção");
    setConfirmarId(null);
  };

  const pedidoConfirmar = pedidos.find(p => p.id === confirmarId);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] font-medium">Pedidos</h1>
        <button onClick={() => navigate("/start/pedidos")} className={startClasses.btnSecondary}>+ Pedido manual</button>
      </div>

      <div className="flex gap-1 border-b border-[rgba(0,0,0,0.08)] overflow-x-auto -mx-4 px-4">
        {tabs.map(t => (
          <button
            key={t.v}
            onClick={() => setTab(t.v as StartPedidoStatus)}
            className={`shrink-0 px-3 py-2.5 text-[13px] font-medium border-b-2 transition-colors ${tab === t.v ? "border-[#1D9E75] text-[#0F6E56]" : "border-transparent text-[#6B6B6B] hover:text-[#1A1A1A]"}`}
          >
            {t.l} ({counts[t.v as StartPedidoStatus]})
          </button>
        ))}
      </div>

      {lista.length === 0 ? (
        <EmptyPedidos />
      ) : (
        <div className="space-y-3">
          {lista.map(p => (
            <PedidoCard key={p.id} p={p} onOpen={() => navigate(`/start/pedidos/${p.id}`)} onConfirm={() => setConfirmarId(p.id)} />
          ))}
        </div>
      )}

      {confirmarId && pedidoConfirmar && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full animate-in zoom-in-95 fade-in duration-150">
            <h3 className="text-[16px] font-medium mb-2">Confirmar pedido de {pedidoConfirmar.compradorNome}?</h3>
            <p className="text-[13px] text-[#6B6B6B] mb-5">{formatBRL(pedidoConfirmar.total)} · {pedidoConfirmar.pecas} peças</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmarId(null)} className={`${startClasses.btnSecondary} flex-1`}>Cancelar</button>
              <button onClick={confirmar} className={`${startClasses.btnPrimary} flex-1`}>Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PedidoCard({ p, onOpen, onConfirm }: { p: StartPedido; onOpen: () => void; onConfirm: () => void }) {
  const isNovo = p.status === "novo";
  const isEntregue = p.status === "entregue";
  const bg = isNovo ? "bg-[#FFFBF0] border-[#FAC775] shadow-[0_0_0_3px_rgba(250,199,117,0.15)] animate-pulse-soft" : isEntregue ? "bg-[#F8F8F6] border-[rgba(0,0,0,0.08)]" : "bg-white border-[rgba(0,0,0,0.08)]";
  const badge = {
    novo: "bg-[#FAEEDA] text-[#854F0B]",
    em_producao: "bg-[#E6F1FB] text-[#185FA5]",
    pronto: "bg-[#E1F5EE] text-[#0F6E56]",
    entregue: "bg-[#E1F5EE] text-[#0F6E56]",
    cancelado: "bg-[#FCEBEB] text-[#A32D2D]",
  }[p.status];
  const label = { novo: "Novo", em_producao: "Em produção", pronto: "Pronto", entregue: "Entregue", cancelado: "Cancelado" }[p.status];

  return (
    <div className={`border rounded-xl p-4 ${bg}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[14px] font-medium truncate">{p.compradorNome}</p>
          <p className="text-[12px] text-[#6B6B6B] mt-0.5">{p.pecas} peças · {formatDateRelative(p.data)}</p>
        </div>
        <p className="text-[16px] font-medium text-[#0F6E56] shrink-0">{formatBRL(p.total)}</p>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${badge}`}>{label}</span>
        <span className="text-[11px] text-[#A0A0A0]">#{p.id}</span>
      </div>
      {isNovo ? (
        <div className="mt-3 flex gap-2">
          <button onClick={onConfirm} className={`${startClasses.btnPrimary} flex-1 !py-2`}>Confirmar pedido</button>
          <button onClick={onOpen} className={`${startClasses.btnSecondary} flex-1 !py-2`}>Ver detalhes</button>
        </div>
      ) : (
        <button onClick={onOpen} className="mt-3 text-[13px] text-[#1D9E75] hover:text-[#0F6E56] font-medium">Ver detalhes →</button>
      )}
    </div>
  );
}

function EmptyPedidos() {
  return (
    <div className="text-center py-16">
      <div className="mx-auto w-14 h-14 rounded-full bg-[#F8F8F6] flex items-center justify-center text-[#A0A0A0] mb-4">📦</div>
      <p className="text-[16px] font-medium">Nenhum pedido aqui</p>
      <p className="text-[13px] text-[#6B6B6B]">Compartilhe sua vitrine para receber pedidos</p>
    </div>
  );
}
