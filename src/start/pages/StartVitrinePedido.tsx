import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Trash2, Plus, Minus, ShoppingBag, Loader2 } from "lucide-react";
import { useStartCart } from "../contexts/StartCartContext";
import { useStartData } from "../contexts/StartDataContext";
import { useStartAuth } from "../contexts/StartAuthContext";
import { ProdutoFoto } from "../components/ProdutoFoto";
import { TAMANHOS_POR_TIPO, UFS } from "../data/mockStart";
import { formatBRL, startClasses } from "../styles/tokens";

interface CompradorForm {
  loja: string;
  contato: string;
  whatsapp: string;
  cidade: string;
  estado: string;
  pagamento: string;
  prazo: string;
  observacoes: string;
}

const PAGAMENTOS = ["Pix", "Boleto 30 dias", "Boleto 30/60", "Cartão", "A combinar"];
const PRAZOS = ["Imediato", "Até 7 dias", "Até 15 dias", "A combinar"];

export default function StartVitrinePedido() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { fornecedor } = useStartAuth();
  const { produtos, addPedido, saveComprador, compradores } = useStartData();
  const { itens, updateItem, removeItem, totalPecas, totalValor, clear } = useStartCart();

  const [form, setForm] = useState<CompradorForm>({
    loja: "", contato: "", whatsapp: "", cidade: "", estado: "PE",
    pagamento: "Pix", prazo: "A combinar", observacoes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof CompradorForm, string>>>({});

  const itensComProduto = useMemo(() => itens.map(it => {
    const prod = produtos.find(p => p.id === it.produtoId);
    return { ...it, produto: prod };
  }), [itens, produtos]);

  function update(field: keyof CompradorForm, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  }

  function validate(): boolean {
    const e: Partial<Record<keyof CompradorForm, string>> = {};
    if (!form.loja.trim()) e.loja = "Informe o nome da loja";
    if (!form.contato.trim()) e.contato = "Informe o nome do contato";
    if (form.whatsapp.replace(/\D/g, "").length < 10) e.whatsapp = "WhatsApp inválido";
    if (!form.cidade.trim()) e.cidade = "Informe a cidade";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleQt(produtoId: string, tam: string, novo: number) {
    const item = itens.find(i => i.produtoId === produtoId);
    if (!item) return;
    const next = { ...item.porTamanho, [tam]: Math.max(0, novo) };
    updateItem(produtoId, next);
  }

  async function handleSubmit() {
    if (itens.length === 0) return;
    if (!validate()) {
      const firstErr = document.querySelector("[data-err]");
      firstErr?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 900));

    // monta itens
    const itensPedido = itens.flatMap(it =>
      Object.entries(it.porTamanho)
        .filter(([, q]) => q > 0)
        .map(([tam, q]) => ({
          produtoId: it.produtoId,
          produtoNome: it.produtoNome,
          tamanho: tam,
          quantidade: q,
          precoUnit: it.precoUnit,
        }))
    );

    // cria/registra comprador (mock simples: cria novo)
    const compId = `cv-${Date.now()}`;
    const existeWhats = compradores.find(c => c.whatsapp.replace(/\D/g, "") === form.whatsapp.replace(/\D/g, ""));
    if (!existeWhats) {
      saveComprador({
        id: compId,
        loja: form.loja,
        contato: form.contato,
        whatsapp: form.whatsapp,
        cidade: form.cidade,
        estado: form.estado,
        ultimoPedido: new Date().toISOString(),
        observacoes: "Cadastrado via vitrine pública",
      });
    }

    const novo = addPedido({
      compradorId: existeWhats?.id || compId,
      compradorNome: form.loja,
      compradorCidade: form.cidade,
      compradorEstado: form.estado,
      compradorWhats: form.whatsapp,
      total: totalValor,
      pecas: totalPecas,
      status: "novo",
      data: new Date().toISOString(),
      itens: itensPedido,
      pagamento: form.pagamento,
      prazo: form.prazo,
      observacoes: form.observacoes,
    });

    clear();
    navigate(`/vitrine/${slug}/pedido/sucesso?pedido=${novo.id}`);
  }

  if (itens.length === 0) {
    return (
      <div className="font-['Inter'] min-h-screen bg-white flex flex-col">
        <header className="border-b border-[rgba(0,0,0,0.08)]">
          <div className="max-w-[900px] mx-auto px-4 md:px-6 h-14 flex items-center">
            <button onClick={() => navigate(`/vitrine/${slug}`)} className="inline-flex items-center gap-1.5 text-[13px] text-[#1A1A1A] hover:text-[#1D9E75]">
              <ArrowLeft size={16} /> Voltar à vitrine
            </button>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center max-w-sm">
            <div className="w-16 h-16 rounded-full bg-[#F8F8F6] flex items-center justify-center mx-auto mb-4">
              <ShoppingBag size={26} className="text-[#A0A0A0]" />
            </div>
            <p className="text-[16px] font-medium mb-1">Seu pedido está vazio</p>
            <p className="text-[13px] text-[#6B6B6B] mb-5">Volte à vitrine e adicione produtos para montar seu pedido.</p>
            <Link to={`/vitrine/${slug}`} className={startClasses.btnPrimary}>Explorar produtos</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="font-['Inter'] min-h-screen bg-[#F8F8F6] text-[#1A1A1A] pb-40">
      <header className="sticky top-0 z-30 bg-white border-b border-[rgba(0,0,0,0.08)]">
        <div className="max-w-[1100px] mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          <button onClick={() => navigate(`/vitrine/${slug}`)} className="inline-flex items-center gap-1.5 text-[13px] text-[#1A1A1A] hover:text-[#1D9E75]">
            <ArrowLeft size={16} /> Continuar comprando
          </button>
          <p className="text-[13px] text-[#6B6B6B] hidden sm:block">Pedido em <span className="font-medium text-[#1A1A1A]">{fornecedor.nome}</span></p>
        </div>
      </header>

      <div className="max-w-[1100px] mx-auto px-4 md:px-6 py-6 md:py-8 grid md:grid-cols-[1fr_360px] gap-6">
        {/* Coluna principal */}
        <div className="space-y-5">
          {/* Itens */}
          <section className={startClasses.card}>
            <h2 className="text-[16px] font-semibold mb-3">Seu pedido ({itens.length} produto{itens.length > 1 ? "s" : ""})</h2>
            <div className="divide-y divide-[rgba(0,0,0,0.06)]">
              {itensComProduto.map(it => {
                const tamanhos = it.produto ? TAMANHOS_POR_TIPO[it.produto.gradeTipo] : Object.keys(it.porTamanho);
                const subtPecas = Object.values(it.porTamanho).reduce((a, b) => a + b, 0);
                const subtValor = subtPecas * it.precoUnit;
                return (
                  <div key={it.produtoId} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex gap-3">
                      <div className="w-16 h-20 rounded-lg shrink-0" style={{ background: it.fotoCor || "#F8F8F6" }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-[14px] font-medium truncate">{it.produtoNome}</p>
                            <p className="text-[12px] text-[#6B6B6B]">{formatBRL(it.precoUnit)} por peça</p>
                          </div>
                          <button onClick={() => removeItem(it.produtoId)} className="text-[#A0A0A0] hover:text-[#A32D2D] p-1" title="Remover">
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 mt-3">
                          {tamanhos.map(tam => {
                            const estoque = it.produto?.estoquePorTamanho[tam] ?? 0;
                            const v = it.porTamanho[tam] || 0;
                            return (
                              <div key={tam} className="flex items-center justify-between border border-[rgba(0,0,0,0.1)] rounded-md px-1.5 py-1 bg-white">
                                <span className="text-[11px] font-medium w-5">{tam}</span>
                                <div className="flex items-center gap-0.5">
                                  <button onClick={() => handleQt(it.produtoId, tam, v - 1)} disabled={v === 0} className="w-5 h-5 rounded text-[#6B6B6B] hover:bg-[#F8F8F6] disabled:opacity-30 flex items-center justify-center"><Minus size={10} /></button>
                                  <span className="w-5 text-center text-[12px] font-medium">{v}</span>
                                  <button onClick={() => handleQt(it.produtoId, tam, v + 1)} disabled={v >= estoque} className="w-5 h-5 rounded text-[#6B6B6B] hover:bg-[#F8F8F6] disabled:opacity-30 flex items-center justify-center"><Plus size={10} /></button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex items-center justify-between mt-2.5 text-[12px]">
                          <span className="text-[#6B6B6B]">{subtPecas} peça{subtPecas !== 1 ? "s" : ""}</span>
                          <span className="font-semibold">{formatBRL(subtValor)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Dados do comprador */}
          <section className={startClasses.card}>
            <h2 className="text-[16px] font-semibold mb-1">Seus dados</h2>
            <p className="text-[12px] text-[#6B6B6B] mb-4">O fornecedor entrará em contato pelo WhatsApp informado para confirmar.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div data-err={errors.loja ? true : undefined}>
                <label className={startClasses.label}>Nome da loja *</label>
                <input value={form.loja} onChange={e => update("loja", e.target.value)} className={startClasses.input} placeholder="Ex: Boutique da Maria" />
                {errors.loja && <p className="text-[11px] text-[#A32D2D] mt-1">{errors.loja}</p>}
              </div>
              <div data-err={errors.contato ? true : undefined}>
                <label className={startClasses.label}>Nome do contato *</label>
                <input value={form.contato} onChange={e => update("contato", e.target.value)} className={startClasses.input} placeholder="Ex: Maria Silva" />
                {errors.contato && <p className="text-[11px] text-[#A32D2D] mt-1">{errors.contato}</p>}
              </div>
              <div data-err={errors.whatsapp ? true : undefined}>
                <label className={startClasses.label}>WhatsApp *</label>
                <input value={form.whatsapp} onChange={e => update("whatsapp", e.target.value)} className={startClasses.input} placeholder="(00) 00000-0000" />
                {errors.whatsapp && <p className="text-[11px] text-[#A32D2D] mt-1">{errors.whatsapp}</p>}
              </div>
              <div className="grid grid-cols-[1fr_90px] gap-2">
                <div data-err={errors.cidade ? true : undefined}>
                  <label className={startClasses.label}>Cidade *</label>
                  <input value={form.cidade} onChange={e => update("cidade", e.target.value)} className={startClasses.input} placeholder="Ex: Recife" />
                  {errors.cidade && <p className="text-[11px] text-[#A32D2D] mt-1">{errors.cidade}</p>}
                </div>
                <div>
                  <label className={startClasses.label}>UF</label>
                  <select value={form.estado} onChange={e => update("estado", e.target.value)} className={startClasses.input}>
                    {UFS.map(u => <option key={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className={startClasses.label}>Forma de pagamento</label>
                <select value={form.pagamento} onChange={e => update("pagamento", e.target.value)} className={startClasses.input}>
                  {PAGAMENTOS.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className={startClasses.label}>Prazo de entrega</label>
                <select value={form.prazo} onChange={e => update("prazo", e.target.value)} className={startClasses.input}>
                  {PRAZOS.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className={startClasses.label}>Observações (opcional)</label>
                <textarea value={form.observacoes} onChange={e => update("observacoes", e.target.value)} rows={3} className={startClasses.input} placeholder="Ex: gostaria de receber em peças sortidas..." />
              </div>
            </div>
          </section>
        </div>

        {/* Coluna resumo */}
        <aside className="md:sticky md:top-20 self-start space-y-3">
          <div className={startClasses.card}>
            <h3 className="text-[14px] font-semibold mb-3">Resumo</h3>
            <div className="space-y-1.5 text-[13px]">
              <div className="flex justify-between"><span className="text-[#6B6B6B]">Produtos</span><span>{itens.length}</span></div>
              <div className="flex justify-between"><span className="text-[#6B6B6B]">Total de peças</span><span>{totalPecas}</span></div>
              <div className="border-t border-[rgba(0,0,0,0.06)] my-2" />
              <div className="flex justify-between text-[15px]"><span className="font-medium">Total</span><span className="font-semibold text-[#1D9E75]">{formatBRL(totalValor)}</span></div>
            </div>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className={`${startClasses.btnPrimary} w-full mt-4`}
            >
              {submitting ? (<><Loader2 size={16} className="animate-spin" /> Enviando...</>) : (<>Enviar pedido</>)}
            </button>
            <p className="text-[11px] text-[#6B6B6B] mt-2 text-center">
              Ao enviar, seu pedido será encaminhado ao fornecedor que entrará em contato em até 24h.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
