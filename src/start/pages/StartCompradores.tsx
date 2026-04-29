import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { useStartData } from "../contexts/StartDataContext";
import { startClasses } from "../styles/tokens";
import { calcTemperatura, diasDesde, StartComprador, Temperatura } from "../data/mockStart";

const tempStyle: Record<Temperatura, { bg: string; tx: string; circle: string }> = {
  Quente: { bg: "bg-[#E1F5EE]", tx: "text-[#0F6E56]", circle: "bg-[#1D9E75]" },
  Morno: { bg: "bg-[#FAEEDA]", tx: "text-[#854F0B]", circle: "bg-[#D89A3D]" },
  Frio: { bg: "bg-[#E6F1FB]", tx: "text-[#185FA5]", circle: "bg-[#5BA8D9]" },
};

export default function StartCompradores() {
  const navigate = useNavigate();
  const { compradores } = useStartData();
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<"todos" | Temperatura>("todos");

  const counts = useMemo(() => ({
    todos: compradores.length,
    Quente: compradores.filter(c => calcTemperatura(c.ultimoPedido) === "Quente").length,
    Morno: compradores.filter(c => calcTemperatura(c.ultimoPedido) === "Morno").length,
    Frio: compradores.filter(c => calcTemperatura(c.ultimoPedido) === "Frio").length,
  }), [compradores]);

  const lista = useMemo(() => compradores.filter(c => {
    const t = calcTemperatura(c.ultimoPedido);
    if (filtro !== "todos" && t !== filtro) return false;
    const q = busca.toLowerCase();
    return q === "" || c.loja.toLowerCase().includes(q) || c.cidade.toLowerCase().includes(q) || c.contato.toLowerCase().includes(q);
  }), [compradores, busca, filtro]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-medium">Compradores</h1>
          <p className="text-[12px] text-[#6B6B6B]">{compradores.length} cliente(s)</p>
        </div>
        <button onClick={() => navigate("/start/compradores/novo")} className={startClasses.btnPrimary}>
          <Plus size={16} /> Comprador
        </button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0A0A0]" />
        <input className={`${startClasses.input} pl-9`} placeholder="Buscar comprador, cidade..." value={busca} onChange={e => setBusca(e.target.value)} />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          { v: "todos", l: `Todos (${counts.todos})` },
          { v: "Quente", l: `Quentes (${counts.Quente})` },
          { v: "Morno", l: `Mornos (${counts.Morno})` },
          { v: "Frio", l: `Frios (${counts.Frio})` },
        ].map(o => (
          <button key={o.v} onClick={() => setFiltro(o.v as any)} className={`shrink-0 px-3 py-1.5 rounded-full text-[12px] font-medium whitespace-nowrap ${filtro === o.v ? "bg-[#1D9E75] text-white" : "bg-[#F8F8F6] text-[#6B6B6B] hover:bg-[#E1F5EE]"}`}>
            {o.l}
          </button>
        ))}
      </div>

      {lista.length === 0 ? (
        <div className="text-center py-16">
          <div className="mx-auto w-14 h-14 rounded-full bg-[#F8F8F6] flex items-center justify-center text-[#A0A0A0] mb-4">👥</div>
          <p className="text-[16px] font-medium">Nenhum comprador</p>
          <p className="text-[13px] text-[#6B6B6B]">Seus compradores aparecem aqui quando fazem pedido</p>
        </div>
      ) : (
        <div className="space-y-2">
          {lista.map(c => <CompradorRow key={c.id} c={c} onClick={() => navigate(`/start/compradores/${c.id}`)} />)}
        </div>
      )}
    </div>
  );
}

function CompradorRow({ c, onClick }: { c: StartComprador; onClick: () => void }) {
  const t = calcTemperatura(c.ultimoPedido);
  const s = tempStyle[t];
  const dias = diasDesde(c.ultimoPedido);
  const iniciais = c.loja.split(" ").slice(0, 2).map(s => s[0]).join("").toUpperCase();

  return (
    <button onClick={onClick} className={`w-full ${startClasses.card} text-left flex items-center gap-3 hover:border-[#1D9E75] transition-colors`}>
      <div className={`w-11 h-11 rounded-full ${s.circle} text-white flex items-center justify-center text-[13px] font-medium shrink-0`}>{iniciais}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-medium truncate">{c.loja}</p>
        <p className="text-[12px] text-[#6B6B6B]">{c.cidade}/{c.estado} · {dias === null ? "Nunca comprou" : `há ${dias} dias`}</p>
      </div>
      <span className={`px-2 py-1 rounded-full text-[10px] font-medium ${s.bg} ${s.tx}`}>{t}</span>
    </button>
  );
}
