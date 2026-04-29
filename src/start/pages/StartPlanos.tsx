import { Check, Sparkles, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useStartAuth } from "../contexts/StartAuthContext";
import { startClasses } from "../styles/tokens";
import { toast } from "sonner";

const planos = [
  {
    id: "gratis" as const,
    nome: "Grátis",
    preco: "R$ 0",
    sub: "para sempre",
    desc: "Comece a vender online sem custos.",
    features: [
      "Até 10 produtos",
      "Até 30 pedidos/mês",
      "Vitrine pública compartilhável",
      "Cadastro de compradores",
      "Pedidos via vitrine",
    ],
    cta: "Plano atual",
    highlight: false,
  },
  {
    id: "pro" as const,
    nome: "Pro",
    preco: "R$ 49",
    sub: "/mês",
    desc: "Para fábricas que querem escalar pedidos.",
    features: [
      "Produtos ilimitados",
      "Pedidos ilimitados",
      "Logo personalizado na vitrine",
      "Domínio próprio (ex: maria.com.br)",
      "Análise de IA nas fotos",
      "Relatórios e métricas",
      "Suporte prioritário",
    ],
    cta: "Fazer upgrade",
    highlight: true,
  },
];

export default function StartPlanos() {
  const { fornecedor, updateFornecedor } = useStartAuth();

  function handleUpgrade(id: "gratis" | "pro") {
    if (id === fornecedor.plano) return;
    updateFornecedor({ plano: id });
    toast.success(id === "pro" ? "Bem-vindo ao Pro! 🚀" : "Plano alterado para Grátis");
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link to="/start/configuracoes" className="inline-flex items-center gap-1.5 text-[13px] text-[#6B6B6B] hover:text-[#1A1A1A] mb-4">
        <ArrowLeft size={14} /> Voltar para Configurações
      </Link>

      <div className="text-center mb-8">
        <Sparkles size={28} className="text-[#1D9E75] mx-auto mb-2" />
        <h1 className="text-[26px] font-semibold">Escolha o plano ideal</h1>
        <p className="text-[14px] text-[#6B6B6B] mt-2 max-w-md mx-auto">
          Comece grátis e faça upgrade quando precisar de mais produtos, pedidos e personalização.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {planos.map(p => {
          const atual = p.id === fornecedor.plano;
          return (
            <div
              key={p.id}
              className={`relative rounded-2xl p-6 border transition-all ${
                p.highlight
                  ? "bg-gradient-to-b from-[#0F6E56] to-[#1D9E75] text-white border-[#0F6E56] shadow-xl"
                  : "bg-white text-[#1A1A1A] border-[rgba(0,0,0,0.08)]"
              }`}
            >
              {p.highlight && (
                <span className="absolute -top-2.5 right-4 bg-[#1A1A1A] text-white text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">Recomendado</span>
              )}
              <div className="flex items-baseline gap-2">
                <h3 className="text-[20px] font-semibold">{p.nome}</h3>
                {atual && (
                  <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded ${p.highlight ? "bg-white/20 text-white" : "bg-[#E1F5EE] text-[#0F6E56]"}`}>
                    Atual
                  </span>
                )}
              </div>
              <p className={`text-[13px] mt-1 ${p.highlight ? "text-white/80" : "text-[#6B6B6B]"}`}>{p.desc}</p>

              <div className="mt-5 flex items-baseline gap-1">
                <span className="text-[34px] font-semibold">{p.preco}</span>
                <span className={`text-[13px] ${p.highlight ? "text-white/80" : "text-[#6B6B6B]"}`}>{p.sub}</span>
              </div>

              <ul className="mt-5 space-y-2">
                {p.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-[13px]">
                    <Check size={15} className={`mt-0.5 shrink-0 ${p.highlight ? "text-white" : "text-[#1D9E75]"}`} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleUpgrade(p.id)}
                disabled={atual}
                className={`w-full mt-6 rounded-lg px-5 py-3 text-[14px] font-medium transition-colors disabled:opacity-60 ${
                  p.highlight
                    ? "bg-white text-[#0F6E56] hover:bg-[#F8F8F6]"
                    : "border border-[#1D9E75] text-[#1D9E75] hover:bg-[#E1F5EE]"
                }`}
              >
                {atual ? "Plano atual" : p.cta}
              </button>
            </div>
          );
        })}
      </div>

      <p className="text-center text-[11px] text-[#A0A0A0] mt-6">
        Cancele quando quiser. Pagamento seguro via cartão ou Pix.
      </p>
    </div>
  );
}
