import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Check, Copy, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { StartLogo } from "../components/StartLogo";
import { useStartAuth } from "../contexts/StartAuthContext";
import { useStartData } from "../contexts/StartDataContext";
import { startClasses } from "../styles/tokens";
import { simulateAIPhotoAnalysis, UFS, AI_PHOTO_RESULT } from "../data/mockStart";

export default function StartOnboarding() {
  const navigate = useNavigate();
  const { fornecedor, updateFornecedor, completeOnboarding } = useStartAuth();
  const { saveProduto, produtos } = useStartData();
  const [step, setStep] = useState(1);

  // step 1
  const [nomeFabrica, setNomeFabrica] = useState(fornecedor.nome);
  const [cidade, setCidade] = useState(fornecedor.cidade);
  const [estado, setEstado] = useState(fornecedor.estado);
  const [whats, setWhats] = useState(fornecedor.whatsapp);

  // step 2
  const sugestao = nomeFabrica.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const [slug, setSlug] = useState(sugestao || fornecedor.slug);
  const slugDisponivel = slug.length > 0 && (slug.charCodeAt(slug.length - 1) % 2 === 1);

  // step 3
  const [iaPreview, setIaPreview] = useState<string | null>(null);
  const [iaLoading, setIaLoading] = useState(false);
  const [iaDone, setIaDone] = useState(false);
  const [prodNome, setProdNome] = useState("");
  const [prodPreco, setProdPreco] = useState("");

  // step 4
  const [copied, setCopied] = useState(false);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setIaPreview(url);
    setIaLoading(true);
    simulateAIPhotoAnalysis().then(res => {
      setIaLoading(false);
      setIaDone(true);
      setProdNome(res.nome);
      toast.success("IA preencheu os campos! Revise e complete o preço.");
    });
  };

  const finishStep1 = () => {
    updateFornecedor({ nome: nomeFabrica, cidade, estado, whatsapp: whats });
    setStep(2);
  };

  const finishStep2 = () => {
    if (!slugDisponivel) return;
    updateFornecedor({ slug });
    setStep(3);
  };

  const finishStep3 = (skip: boolean) => {
    if (!skip && prodNome && prodPreco) {
      const novo = {
        id: `prod-${Date.now()}`,
        nome: prodNome,
        categoria: AI_PHOTO_RESULT.categoria,
        preco: parseFloat(prodPreco) || 0,
        cor: AI_PHOTO_RESULT.cor,
        estacao: AI_PHOTO_RESULT.estacao,
        genero: AI_PHOTO_RESULT.genero,
        descricao: AI_PHOTO_RESULT.descricao,
        pedidoMinimo: 6,
        visivel: true,
        gradeTipo: "letras" as const,
        estoquePorTamanho: { P: 5, M: 5, G: 5 },
        fotoCor: "linear-gradient(135deg,#FCEBEB,#F7C1C1)",
      };
      saveProduto(novo);
    }
    setStep(4);
  };

  const finish = () => {
    completeOnboarding();
    navigate("/start/inicio");
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${slug}.nextil.com.br`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="font-['Inter'] min-h-screen bg-white text-[#1A1A1A]">
      <header className="border-b border-[rgba(0,0,0,0.08)] px-6 py-4 flex items-center gap-4">
        {step > 1 && step < 4 && (
          <button onClick={() => setStep(s => s - 1)} className="text-[#6B6B6B] hover:text-[#1A1A1A]"><ArrowLeft size={18} /></button>
        )}
        <StartLogo size={18} />
        <div className="flex-1 flex gap-1.5 max-w-md mx-auto">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className={`h-1 flex-1 rounded-full ${step >= n ? "bg-[#1D9E75]" : "bg-[rgba(0,0,0,0.08)]"}`} />
          ))}
        </div>
        <span className="text-[12px] text-[#6B6B6B]">{step}/4</span>
      </header>

      <main className="max-w-xl mx-auto px-6 py-10">
        {step === 1 && (
          <div>
            <h1 className="text-[24px] font-medium mb-2">Conta pra gente sobre sua fábrica</h1>
            <p className="text-[14px] text-[#6B6B6B] mb-6">Essas informações aparecem na sua vitrine pública.</p>
            <div className="space-y-4">
              <div><label className={startClasses.label}>Nome da fábrica</label>
                <input className={startClasses.input} value={nomeFabrica} onChange={e => setNomeFabrica(e.target.value)} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={startClasses.label}>Cidade</label>
                  <input className={startClasses.input} value={cidade} onChange={e => setCidade(e.target.value)} /></div>
                <div><label className={startClasses.label}>Estado</label>
                  <select className={startClasses.input} value={estado} onChange={e => setEstado(e.target.value)}>
                    {UFS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                  </select></div>
              </div>
              <div><label className={startClasses.label}>WhatsApp com DDD</label>
                <input className={startClasses.input} value={whats} onChange={e => setWhats(e.target.value)} /></div>
              <button type="button" className="w-full border-2 border-dashed border-[rgba(0,0,0,0.12)] rounded-xl py-6 flex flex-col items-center gap-2 text-[#6B6B6B] hover:border-[#1D9E75] hover:text-[#1D9E75] transition-colors">
                <Camera size={22} />
                <span className="text-[13px]">Adicionar foto da fábrica (opcional)</span>
              </button>
            </div>
            <button onClick={finishStep1} className={`${startClasses.btnPrimary} w-full mt-6`}>Continuar</button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 className="text-[24px] font-medium mb-2">Escolha o endereço da sua vitrine</h1>
            <p className="text-[14px] text-[#6B6B6B] mb-6">Este será o link que você vai compartilhar com seus compradores.</p>
            <div className="flex items-stretch border border-[rgba(0,0,0,0.12)] rounded-lg overflow-hidden focus-within:border-[#1D9E75]">
              <input className="flex-1 px-3.5 py-2.5 text-[14px] outline-none" value={slug} onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} />
              <span className="bg-[#F8F8F6] px-3.5 py-2.5 text-[14px] text-[#6B6B6B] border-l border-[rgba(0,0,0,0.08)]">.nextil.com.br</span>
            </div>
            {slug && (
              <p className={`mt-2 text-[13px] ${slugDisponivel ? "text-[#0F6E56]" : "text-[#A32D2D]"}`}>
                {slugDisponivel ? "✓ Disponível" : "✗ Indisponível, tente outro"}
              </p>
            )}
            <p className={startClasses.hint}>Use o nome da sua fábrica sem espaços. Exemplo: mariasconfeccoes</p>
            <button onClick={finishStep2} disabled={!slugDisponivel} className={`${startClasses.btnPrimary} w-full mt-6`}>Continuar</button>
          </div>
        )}

        {step === 3 && (
          <div>
            <h1 className="text-[24px] font-medium mb-2">Adicione seu primeiro produto</h1>
            <p className="text-[14px] text-[#6B6B6B] mb-6">Tire uma foto e nossa IA preenche o cadastro em segundos.</p>
            <label className="block w-full bg-[#E1F5EE] border-2 border-dashed border-[#9FE1CB] rounded-xl py-10 text-center cursor-pointer hover:bg-[#d6f0e6] transition-colors relative overflow-hidden">
              {iaPreview ? (
                <img src={iaPreview} alt="" className="w-full h-48 object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-[#0F6E56]">
                  <Camera size={32} />
                  <span className="text-[14px] font-medium">Tirar foto ou importar</span>
                  <span className="text-[12px] text-[#6B6B6B]">Nossa IA preenche o cadastro em segundos</span>
                </div>
              )}
              {iaLoading && (
                <div className="absolute inset-0 bg-white/85 flex flex-col items-center justify-center gap-2">
                  <Loader2 size={28} className="animate-spin text-[#1D9E75]" />
                  <span className="text-[13px] text-[#0F6E56] font-medium">Analisando a peça com IA...</span>
                </div>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            </label>

            {iaDone && (
              <div className="mt-5 space-y-3">
                <div><label className={startClasses.label}>Nome do produto</label>
                  <input className={startClasses.input} value={prodNome} onChange={e => setProdNome(e.target.value)} /></div>
                <div><label className={startClasses.label}>Preço de atacado (R$)</label>
                  <input type="number" className={startClasses.input} value={prodPreco} onChange={e => setProdPreco(e.target.value)} placeholder="89,00" /></div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button onClick={() => finishStep3(true)} className={`${startClasses.btnSecondary} flex-1`}>Pular este passo</button>
              <button onClick={() => finishStep3(false)} className={`${startClasses.btnPrimary} flex-1`}>Salvar e continuar</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="text-center">
            <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-[#E1F5EE] flex items-center justify-center animate-[pulse_1.2s_ease-in-out]">
              <Check size={40} className="text-[#1D9E75]" />
            </div>
            <h1 className="text-[26px] font-medium mb-2">Sua vitrine está no ar!</h1>
            <p className="text-[14px] text-[#6B6B6B] mb-6">Compartilhe com seus compradores</p>
            <div className="bg-[#F8F8F6] rounded-lg px-4 py-3 mb-3 inline-flex items-center gap-3">
              <span className="text-[14px] text-[#1A1A1A]">{slug}.nextil.com.br</span>
              <button onClick={copyLink} className="text-[#1D9E75] hover:text-[#0F6E56]">
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
            {copied && <p className="text-[12px] text-[#0F6E56] mb-3">Copiado!</p>}
            <div className="flex flex-col gap-3 max-w-xs mx-auto mt-6">
              <a href={`/start/vitrine/${slug}`} target="_blank" rel="noreferrer" className={startClasses.btnPrimary}>Ver minha vitrine</a>
              <button onClick={finish} className={startClasses.btnSecondary}>Ir para minha conta</button>
            </div>
            <p className="text-[12px] text-[#6B6B6B] mt-6">Você tem {produtos.length} produtos cadastrados</p>
          </div>
        )}
      </main>
    </div>
  );
}
