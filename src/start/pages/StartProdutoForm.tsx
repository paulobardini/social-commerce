import { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Camera, Loader2, X, Trash2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useStartData } from "../contexts/StartDataContext";
import { startClasses } from "../styles/tokens";
import {
  CATEGORIAS_PRODUTO, ESTACOES, GENEROS, simulateAIPhotoAnalysis,
  StartGradeTipo, StartProduto, TAMANHOS_POR_TIPO,
} from "../data/mockStart";

const gradientes = [
  "linear-gradient(135deg,#FAEEDA,#F4D6A8)",
  "linear-gradient(135deg,#E1F5EE,#9FE1CB)",
  "linear-gradient(135deg,#E6F1FB,#BFD9F1)",
  "linear-gradient(135deg,#FCEBEB,#F7C1C1)",
  "linear-gradient(135deg,#F3E8FF,#D8B4FE)",
];

export default function StartProdutoForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { produtos, saveProduto, deleteProduto } = useStartData();
  const editing = useMemo(() => id ? produtos.find(p => p.id === id) : null, [id, produtos]);
  const isEdit = !!editing;

  const [iaPreview, setIaPreview] = useState<string | null>(null);
  const [iaLoading, setIaLoading] = useState(false);

  const [nome, setNome] = useState(editing?.nome || "");
  const [categoria, setCategoria] = useState(editing?.categoria || CATEGORIAS_PRODUTO[0]);
  const [descricao, setDescricao] = useState(editing?.descricao || "");
  const [cor, setCor] = useState(editing?.cor || "");
  const [estacao, setEstacao] = useState(editing?.estacao || ESTACOES[0]);
  const [genero, setGenero] = useState(editing?.genero || GENEROS[0]);
  const [preco, setPreco] = useState(editing?.preco?.toString() || "");
  const [pedidoMin, setPedidoMin] = useState(editing?.pedidoMinimo?.toString() || "6");
  const [gradeTipo, setGradeTipo] = useState<StartGradeTipo>(editing?.gradeTipo || "letras");
  const [estoque, setEstoque] = useState<Record<string, number>>(editing?.estoquePorTamanho || {});
  const [visivel, setVisivel] = useState(editing?.visivel ?? true);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    // ao trocar tipo, limpar estoque se for novo produto
    if (!isEdit) setEstoque({});
  }, [gradeTipo, isEdit]);

  const total = Object.values(estoque).reduce((s, n) => s + (Number(n) || 0), 0);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIaPreview(URL.createObjectURL(file));
    setIaLoading(true);
    simulateAIPhotoAnalysis().then(res => {
      setIaLoading(false);
      setNome(res.nome); setCategoria(res.categoria); setCor(res.cor);
      setEstacao(res.estacao); setGenero(res.genero); setDescricao(res.descricao);
      toast.success("IA preencheu os campos! Revise e complete o preço.");
      setTimeout(() => document.getElementById("form-base")?.scrollIntoView({ behavior: "smooth" }), 100);
    });
  };

  const setQty = (t: string, v: string) => setEstoque(prev => ({ ...prev, [t]: parseInt(v) || 0 }));

  const handleSave = () => {
    if (!nome.trim()) { toast.error("Nome é obrigatório"); return; }
    if (!preco || parseFloat(preco) <= 0) { toast.error("Preço é obrigatório"); return; }
    const prod: StartProduto = {
      id: editing?.id || `prod-${Date.now()}`,
      nome, categoria, descricao, cor, estacao, genero,
      preco: parseFloat(preco), pedidoMinimo: parseInt(pedidoMin) || 6,
      gradeTipo, estoquePorTamanho: estoque, visivel,
      fotoCor: editing?.fotoCor || gradientes[Math.floor(Math.random() * gradientes.length)],
    };
    saveProduto(prod);
    toast.success("Produto salvo com sucesso");
    navigate("/start/catalogo");
  };

  const handleDelete = () => {
    if (editing) { deleteProduto(editing.id); toast.success("Produto excluído"); navigate("/start/catalogo"); }
  };

  const tamanhos = TAMANHOS_POR_TIPO[gradeTipo];

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate("/start/catalogo")} className="text-[#6B6B6B] hover:text-[#1A1A1A] flex items-center gap-2">
          <ArrowLeft size={18} /> <span className="text-[14px]">Voltar</span>
        </button>
        <h1 className="text-[20px] font-medium">{isEdit ? "Editar produto" : "Novo produto"}</h1>
        <button onClick={() => navigate("/start/catalogo")} className="text-[#A0A0A0] hover:text-[#1A1A1A]"><X size={18} /></button>
      </div>

      {/* Bloco IA */}
      <div className="bg-[#E1F5EE] border border-[#9FE1CB] rounded-xl p-4">
        <p className="text-[14px] font-medium text-[#0F6E56]">Cadastrar com IA</p>
        <p className="text-[12px] text-[#0F6E56]/80 mb-3">Tire uma foto e preenchemos tudo para você</p>
        <label className="block bg-white border-2 border-dashed border-[#9FE1CB] rounded-lg cursor-pointer hover:bg-[#E1F5EE]/40 transition-colors relative overflow-hidden">
          {iaPreview ? (
            <div className="relative">
              <img src={iaPreview} alt="" className="w-full h-48 object-cover" />
              <span className="absolute bottom-2 right-2 bg-white/90 text-[12px] px-2 py-1 rounded">Trocar foto</span>
            </div>
          ) : (
            <div className="py-10 flex flex-col items-center gap-2 text-[#0F6E56]">
              <Camera size={26} />
              <span className="text-[13px]">Clique para fotografar ou importar</span>
            </div>
          )}
          {iaLoading && (
            <div className="absolute inset-0 bg-white/85 flex flex-col items-center justify-center gap-2">
              <Loader2 size={26} className="animate-spin text-[#1D9E75]" />
              <span className="text-[13px] text-[#0F6E56] font-medium">Analisando com IA...</span>
            </div>
          )}
          <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
        </label>
      </div>

      <div className="text-center text-[12px] text-[#A0A0A0]">— ou preencha manualmente —</div>

      <div id="form-base" className="space-y-4">
        <div>
          <label className={startClasses.label}>Nome do produto <span className="text-[#A0A0A0]">({nome.length}/60)</span></label>
          <input className={startClasses.input} value={nome} maxLength={60} onChange={e => setNome(e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={startClasses.label}>Categoria</label>
            <select className={startClasses.input} value={categoria} onChange={e => setCategoria(e.target.value)}>
              {CATEGORIAS_PRODUTO.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={startClasses.label}>Cor principal</label>
            <input className={startClasses.input} value={cor} onChange={e => setCor(e.target.value)} />
          </div>
        </div>

        <div>
          <label className={startClasses.label}>Descrição <span className="text-[#A0A0A0]">({descricao.length}/200)</span></label>
          <textarea className={`${startClasses.input} min-h-[80px]`} value={descricao} maxLength={200} onChange={e => setDescricao(e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={startClasses.label}>Estação</label>
            <select className={startClasses.input} value={estacao} onChange={e => setEstacao(e.target.value)}>
              {ESTACOES.map(e => <option key={e}>{e}</option>)}
            </select>
          </div>
          <div>
            <label className={startClasses.label}>Gênero</label>
            <select className={startClasses.input} value={genero} onChange={e => setGenero(e.target.value)}>
              {GENEROS.map(g => <option key={g}>{g}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={startClasses.label}>Preço de atacado</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6B6B] text-[14px]">R$</span>
              <input type="number" className={`${startClasses.input} pl-9`} value={preco} onChange={e => setPreco(e.target.value)} />
            </div>
          </div>
          <div>
            <label className={startClasses.label}>Pedido mínimo</label>
            <input type="number" className={startClasses.input} value={pedidoMin} onChange={e => setPedidoMin(e.target.value)} />
            <p className={startClasses.hint}>Compradores precisarão pedir ao menos {pedidoMin || 0} peças</p>
          </div>
        </div>

        <div>
          <label className={startClasses.label}>Tamanhos e estoque</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
            {([
              { v: "letras", l: "Letras P/M/G" },
              { v: "numeros", l: "Números 34-44" },
              { v: "infantil", l: "Infantil 1-8" },
              { v: "unico", l: "Tamanho único" },
            ] as { v: StartGradeTipo; l: string }[]).map(opt => (
              <button
                key={opt.v}
                type="button"
                onClick={() => setGradeTipo(opt.v)}
                className={`px-3 py-2 rounded-lg border text-[12px] font-medium transition-colors ${gradeTipo === opt.v ? "border-[#1D9E75] bg-[#E1F5EE] text-[#0F6E56]" : "border-[rgba(0,0,0,0.12)] text-[#6B6B6B] hover:border-[#9FE1CB]"}`}
              >
                {opt.l}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            {tamanhos.map(t => (
              <div key={t} className="flex items-center gap-3">
                <span className="w-12 text-[13px] font-medium">{t}</span>
                <input type="number" min={0} className={`${startClasses.input} flex-1`} placeholder="0" value={estoque[t] ?? ""} onChange={e => setQty(t, e.target.value)} />
              </div>
            ))}
          </div>
          <p className="mt-2 text-[13px] text-[#0F6E56] font-medium">Total: {total} peças</p>
        </div>

        <label className="flex items-center justify-between bg-[#F8F8F6] rounded-lg px-4 py-3">
          <span className="text-[14px]">Produto visível na vitrine</span>
          <input type="checkbox" checked={visivel} onChange={e => setVisivel(e.target.checked)} className="w-5 h-5 accent-[#1D9E75]" />
        </label>
      </div>

      <div className="flex flex-col-reverse md:flex-row gap-3 pt-4">
        {isEdit && (
          <button onClick={() => setShowDelete(true)} className={`${startClasses.btnDestructive} flex-1`}>
            <Trash2 size={14} /> Excluir produto
          </button>
        )}
        <button onClick={handleSave} className={`${startClasses.btnPrimary} flex-1`}>
          {isEdit ? "Salvar alterações" : "Salvar produto"}
        </button>
      </div>

      {showDelete && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-[16px] font-medium mb-2">Excluir este produto?</h3>
            <p className="text-[13px] text-[#6B6B6B] mb-5">Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDelete(false)} className={`${startClasses.btnSecondary} flex-1`}>Cancelar</button>
              <button onClick={handleDelete} className={`${startClasses.btnDestructive} flex-1`}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
