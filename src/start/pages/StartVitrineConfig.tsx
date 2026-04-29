import { useState } from "react";
import { Link } from "react-router-dom";
import { Copy, ExternalLink, Check, Eye, EyeOff, Palette, Image as ImageIcon } from "lucide-react";
import { useStartAuth } from "../contexts/StartAuthContext";
import { useStartData } from "../contexts/StartDataContext";
import { startClasses } from "../styles/tokens";

const CORES = ["#1D9E75", "#185FA5", "#A32D2D", "#854F0B", "#6A39B5", "#0F6E56", "#1A1A1A"];

export default function StartVitrineConfig() {
  const { fornecedor, updateFornecedor } = useStartAuth();
  const { produtos } = useStartData();
  const [copied, setCopied] = useState(false);

  const url = `${window.location.origin}/vitrine/${fornecedor.slug}`;
  const visiveis = produtos.filter(p => p.visivel).length;

  function copyUrl() {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[22px] font-semibold">Minha Vitrine</h1>
        <p className="text-[13px] text-[#6B6B6B] mt-1">Personalize sua loja pública e compartilhe o link com seus compradores.</p>
      </div>

      {/* URL e ações */}
      <div className={`${startClasses.card} space-y-4`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[12px] text-[#6B6B6B] mb-1">Endereço da sua vitrine</p>
            <div className="flex items-center gap-2 bg-[#F8F8F6] border border-[rgba(0,0,0,0.08)] rounded-lg px-3 py-2.5">
              <code className="text-[13px] truncate flex-1">{url}</code>
              <button onClick={copyUrl} className="text-[#1D9E75] hover:text-[#0F6E56]" title="Copiar">
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
          </div>
          <Link to={`/vitrine/${fornecedor.slug}`} target="_blank" className={startClasses.btnPrimary}>
            <ExternalLink size={14} /> Abrir vitrine
          </Link>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg bg-[#F8F8F6] border border-[rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-2.5">
            {fornecedor.vitrineAtiva ? <Eye size={18} className="text-[#1D9E75]" /> : <EyeOff size={18} className="text-[#A0A0A0]" />}
            <div>
              <p className="text-[13px] font-medium">{fornecedor.vitrineAtiva ? "Vitrine ativa" : "Vitrine pausada"}</p>
              <p className="text-[11px] text-[#6B6B6B]">{visiveis} produto(s) visível(is)</p>
            </div>
          </div>
          <button
            onClick={() => updateFornecedor({ vitrineAtiva: !fornecedor.vitrineAtiva })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${fornecedor.vitrineAtiva ? "bg-[#1D9E75]" : "bg-[#D1D5DB]"}`}
          >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${fornecedor.vitrineAtiva ? "translate-x-5" : "translate-x-1"}`} />
          </button>
        </div>
      </div>

      {/* Identidade */}
      <div className={`${startClasses.card} space-y-4`}>
        <div className="flex items-center gap-2">
          <Palette size={16} className="text-[#1D9E75]" />
          <h2 className="text-[15px] font-semibold">Identidade visual</h2>
        </div>

        <div>
          <label className={startClasses.label}>Nome exibido</label>
          <input value={fornecedor.nome} onChange={e => updateFornecedor({ nome: e.target.value })} className={startClasses.input} />
        </div>

        <div>
          <label className={startClasses.label}>Descrição da loja</label>
          <textarea value={fornecedor.descricao} onChange={e => updateFornecedor({ descricao: e.target.value })} rows={3} className={startClasses.input} />
        </div>

        <div>
          <label className={startClasses.label}>Cor de destaque</label>
          <div className="flex flex-wrap gap-2">
            {CORES.map(c => (
              <button
                key={c}
                onClick={() => updateFornecedor({ corDestaque: c })}
                className={`w-9 h-9 rounded-full border-2 transition-transform hover:scale-110 ${fornecedor.corDestaque === c ? "border-[#1A1A1A] scale-110" : "border-white shadow"}`}
                style={{ background: c }}
                title={c}
              />
            ))}
          </div>
        </div>

        <div>
          <label className={startClasses.label}>Iniciais (logo)</label>
          <div className="flex items-center gap-3">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-[18px] font-semibold"
              style={{ background: fornecedor.corDestaque }}
            >
              {fornecedor.iniciais}
            </div>
            <input
              value={fornecedor.iniciais}
              onChange={e => updateFornecedor({ iniciais: e.target.value.slice(0, 2).toUpperCase() })}
              maxLength={2}
              className={`${startClasses.input} max-w-[120px] text-center font-semibold`}
            />
            <p className={startClasses.hint}>Máx. 2 letras</p>
          </div>
        </div>

        <div className="flex items-start gap-2 text-[12px] text-[#854F0B] bg-[#FAEEDA] border border-[#FAC775] rounded-md p-2.5">
          <ImageIcon size={14} className="shrink-0 mt-0.5" />
          <p>Upload de logo personalizado disponível no plano <strong>Pro</strong>.</p>
        </div>
      </div>

      {/* Localização e contato */}
      <div className={`${startClasses.card} space-y-4`}>
        <h2 className="text-[15px] font-semibold">Localização e contato</h2>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_100px] gap-3">
          <div>
            <label className={startClasses.label}>Cidade</label>
            <input value={fornecedor.cidade} onChange={e => updateFornecedor({ cidade: e.target.value })} className={startClasses.input} />
          </div>
          <div>
            <label className={startClasses.label}>UF</label>
            <input value={fornecedor.estado} onChange={e => updateFornecedor({ estado: e.target.value.slice(0, 2).toUpperCase() })} maxLength={2} className={startClasses.input} />
          </div>
        </div>
        <div>
          <label className={startClasses.label}>WhatsApp para pedidos</label>
          <input value={fornecedor.whatsapp} onChange={e => updateFornecedor({ whatsapp: e.target.value })} className={startClasses.input} placeholder="(00) 00000-0000" />
        </div>
      </div>
    </div>
  );
}
