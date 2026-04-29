import { Link } from "react-router-dom";
import { User, Building2, Bell, Shield, CreditCard, ChevronRight, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useStartAuth } from "../contexts/StartAuthContext";
import { startClasses } from "../styles/tokens";

const sections = [
  { icon: User, title: "Conta", desc: "Nome, e-mail, senha", to: "#" },
  { icon: Building2, title: "Dados da empresa", desc: "Razão social, CNPJ, endereço", to: "#" },
  { icon: Bell, title: "Notificações", desc: "E-mail e WhatsApp para alertas de pedidos", to: "#" },
  { icon: Shield, title: "Privacidade e LGPD", desc: "Termos e exportação de dados", to: "#" },
];

export default function StartConfiguracoes() {
  const { fornecedor, logout } = useStartAuth();
  const navigate = useNavigate();

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-[22px] font-semibold">Configurações</h1>
        <p className="text-[13px] text-[#6B6B6B] mt-1">Gerencie sua conta, sua empresa e seu plano.</p>
      </div>

      {/* Resumo do plano */}
      <div className={`${startClasses.card} flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-[#FAEEDA] text-[#854F0B] flex items-center justify-center">
            <CreditCard size={20} />
          </div>
          <div>
            <p className="text-[14px] font-medium">Plano {fornecedor.plano === "gratis" ? "Grátis" : "Pro"}</p>
            <p className="text-[12px] text-[#6B6B6B]">{fornecedor.produtosUsados}/10 produtos · {fornecedor.pedidosMes}/30 pedidos no mês</p>
          </div>
        </div>
        <Link to="/start/planos" className={startClasses.btnPrimary}>Ver planos</Link>
      </div>

      {/* Seções */}
      <div className="bg-white rounded-xl border border-[rgba(0,0,0,0.08)] divide-y divide-[rgba(0,0,0,0.06)] overflow-hidden">
        {sections.map(s => (
          <button key={s.title} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[#F8F8F6] transition-colors text-left">
            <div className="w-9 h-9 rounded-lg bg-[#F8F8F6] flex items-center justify-center text-[#1A1A1A]">
              <s.icon size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-medium">{s.title}</p>
              <p className="text-[12px] text-[#6B6B6B]">{s.desc}</p>
            </div>
            <ChevronRight size={16} className="text-[#A0A0A0]" />
          </button>
        ))}
      </div>

      <button
        onClick={() => { logout(); navigate("/start/login"); }}
        className="w-full inline-flex items-center justify-center gap-2 text-[13px] text-[#A32D2D] hover:bg-[#FCEBEB] rounded-lg py-3 transition-colors"
      >
        <LogOut size={15} /> Sair da conta
      </button>

      <p className="text-center text-[11px] text-[#A0A0A0] pt-2">Nextil Start · v0.1 protótipo</p>
    </div>
  );
}
