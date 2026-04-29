import { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Home, Package, ShoppingBag, Users, Store, Settings, LogOut } from "lucide-react";
import { StartLogo } from "./StartLogo";
import { useStartAuth } from "../contexts/StartAuthContext";

interface Props {
  children: ReactNode;
  bare?: boolean; // sem sidebar nem bottom nav (login/onboarding/vitrine)
}

const navItems = [
  { to: "/start/inicio", icon: Home, label: "Início" },
  { to: "/start/catalogo", icon: Package, label: "Catálogo" },
  { to: "/start/pedidos", icon: ShoppingBag, label: "Pedidos" },
  { to: "/start/compradores", icon: Users, label: "Compradores" },
];

const lojaItems = [
  { to: "/start/vitrine-config", icon: Store, label: "Minha Vitrine" },
  { to: "/start/configuracoes", icon: Settings, label: "Configurações" },
];

export function StartLayout({ children, bare }: Props) {
  const { fornecedor, logout } = useStartAuth();
  const navigate = useNavigate();

  if (bare) {
    return (
      <div className="font-['Inter'] min-h-screen bg-white text-[#1A1A1A]">
        {children}
      </div>
    );
  }

  return (
    <div className="font-['Inter'] min-h-screen bg-[#F8F8F6] text-[#1A1A1A] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col w-[220px] bg-white border-r border-[rgba(0,0,0,0.08)] fixed h-screen">
        <div className="px-5 py-5 border-b border-[rgba(0,0,0,0.06)]">
          <StartLogo size={20} />
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="px-3 text-[10px] uppercase tracking-wider text-[#A0A0A0] mb-2">Menu</p>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] mb-0.5 transition-colors ${
                  isActive ? "bg-[#E1F5EE] text-[#0F6E56] font-medium" : "text-[#1A1A1A] hover:bg-[#F8F8F6]"
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
          <p className="px-3 text-[10px] uppercase tracking-wider text-[#A0A0A0] mt-5 mb-2">Loja</p>
          {lojaItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] mb-0.5 transition-colors ${
                  isActive ? "bg-[#E1F5EE] text-[#0F6E56] font-medium" : "text-[#1A1A1A] hover:bg-[#F8F8F6]"
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-3 py-3 border-t border-[rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-9 h-9 rounded-full bg-[#1D9E75] text-white flex items-center justify-center text-[13px] font-medium">
              {fornecedor.iniciais}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium truncate">{fornecedor.nome}</p>
              <span className="inline-block text-[10px] px-1.5 py-0.5 rounded bg-[#FAEEDA] text-[#854F0B] mt-0.5">
                Plano {fornecedor.plano}
              </span>
            </div>
            <button
              onClick={() => { logout(); navigate("/start/login"); }}
              className="text-[#A0A0A0] hover:text-[#A32D2D]"
              title="Sair"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-[rgba(0,0,0,0.08)] z-40 flex items-center justify-between px-4">
        <StartLogo size={18} />
        <div className="w-8 h-8 rounded-full bg-[#1D9E75] text-white flex items-center justify-center text-[12px] font-medium">
          {fornecedor.iniciais}
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 md:ml-[220px] pt-14 md:pt-0 pb-20 md:pb-0 min-h-screen">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-6">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-[rgba(0,0,0,0.08)] z-40 flex">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-0.5 ${
                isActive ? "text-[#1D9E75]" : "text-[#6B6B6B]"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={20} />
                <span className="text-[10px] font-medium">{item.label}</span>
                {isActive && <span className="w-1 h-1 rounded-full bg-[#1D9E75] -mt-0.5" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
