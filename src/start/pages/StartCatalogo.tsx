import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { useStartData } from "../contexts/StartDataContext";
import { useStartAuth } from "../contexts/StartAuthContext";
import { startClasses, formatBRL } from "../styles/tokens";
import { CATEGORIAS_PRODUTO, StartProduto } from "../data/mockStart";
import { ProdutoFoto } from "../components/ProdutoFoto";

export default function StartCatalogo() {
  const navigate = useNavigate();
  const { produtos } = useStartData();
  const { fornecedor } = useStartAuth();
  const [busca, setBusca] = useState("");
  const [cat, setCat] = useState("Todos");

  const lista = useMemo(() => produtos.filter(p =>
    (cat === "Todos" || p.categoria === cat) &&
    (busca === "" || p.nome.toLowerCase().includes(busca.toLowerCase()))
  ), [produtos, cat, busca]);

  const limite = 10;
  const usados = produtos.length;
  const limiteAtingido = fornecedor.plano === "gratis" && usados >= limite;
  const barraCor = usados >= limite ? "bg-[#FCEBEB]" : usados >= 9 ? "bg-[#FAEEDA]" : "bg-[#F8F8F6]";

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-medium">Catálogo</h1>
          <p className="text-[12px] text-[#6B6B6B]">{produtos.length} produto(s)</p>
        </div>
        <button
          onClick={() => limiteAtingido ? navigate("/start/configuracoes/plano") : navigate("/start/catalogo/novo")}
          className={startClasses.btnPrimary}
        >
          <Plus size={16} /> Produto
        </button>
      </div>

      {fornecedor.plano === "gratis" && (
        <div className={`${barraCor} rounded-lg px-4 py-3`}>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[12px] text-[#1A1A1A]">Plano grátis · {usados} / {limite} produtos</p>
            {usados >= 9 && <button onClick={() => navigate("/start/configuracoes/plano")} className="text-[12px] text-[#1D9E75] underline">Fazer upgrade</button>}
          </div>
          <div className="h-1.5 bg-white rounded-full overflow-hidden">
            <div className="h-full bg-[#1D9E75]" style={{ width: `${Math.min((usados / limite) * 100, 100)}%` }} />
          </div>
        </div>
      )}

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0A0A0]" />
        <input className={`${startClasses.input} pl-9`} placeholder="Buscar produto..." value={busca} onChange={e => setBusca(e.target.value)} />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-thin">
        {["Todos", ...new Set(produtos.map(p => p.categoria))].map(c => (
          <button key={c} onClick={() => setCat(c)} className={`shrink-0 px-3 py-1.5 rounded-full text-[12px] font-medium whitespace-nowrap transition-colors ${cat === c ? "bg-[#1D9E75] text-white" : "bg-[#F8F8F6] text-[#6B6B6B] hover:bg-[#E1F5EE] hover:text-[#0F6E56]"}`}>
            {c}
          </button>
        ))}
      </div>

      {lista.length === 0 ? (
        <EmptyCatalogo onCreate={() => navigate("/start/catalogo/novo")} />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {lista.map(p => <ProdCard key={p.id} produto={p} onClick={() => navigate(`/start/catalogo/${p.id}`)} />)}
        </div>
      )}
    </div>
  );
}

function ProdCard({ produto, onClick }: { produto: StartProduto; onClick: () => void }) {
  const total = Object.values(produto.estoquePorTamanho).reduce((s, n) => s + n, 0);
  const badge =
    total === 0 ? { c: "bg-[#FCEBEB] text-[#A32D2D]", t: "Sem estoque" } :
    total <= 10 ? { c: "bg-[#FAEEDA] text-[#854F0B]", t: "Pouco estoque" } :
    { c: "bg-[#E1F5EE] text-[#0F6E56]", t: "Disponível" };
  const iniciais = produto.nome.split(" ").slice(0, 2).map(s => s[0]).join("");

  return (
    <button onClick={onClick} className="text-left bg-white border border-[rgba(0,0,0,0.08)] rounded-xl overflow-hidden hover:border-[#1D9E75] transition-colors">
      <div className="aspect-square flex items-center justify-center text-[#1A1A1A]/30 text-[24px] font-medium" style={{ background: produto.fotoCor || "#F0F0F0" }}>
        {iniciais}
      </div>
      <div className="p-3">
        <p className="text-[13px] font-medium truncate">{produto.nome}</p>
        <p className="text-[14px] font-medium text-[#0F6E56] mt-0.5">{formatBRL(produto.preco)}</p>
        <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-medium ${badge.c}`}>{badge.t}</span>
      </div>
    </button>
  );
}

function EmptyCatalogo({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="text-center py-16">
      <div className="mx-auto w-14 h-14 rounded-full bg-[#F8F8F6] flex items-center justify-center text-[#A0A0A0] mb-4">👕</div>
      <p className="text-[16px] font-medium">Seu catálogo está vazio</p>
      <p className="text-[13px] text-[#6B6B6B] mb-5">Adicione seu primeiro produto com uma foto</p>
      <button onClick={onCreate} className={startClasses.btnPrimary}>Adicionar produto</button>
    </div>
  );
}
