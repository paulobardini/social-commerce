import { Search, Bell, ShoppingBag, MessageCircle, Menu, LogOut } from "lucide-react";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import nextilLogo from "@/assets/nextil-logo.png";
import nextilWordmark from "@/assets/nextil-wordmark.png";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Home, Compass, User, Star, Settings, LayoutDashboard, Kanban, Users,
  Target, Briefcase, UserCog, ClipboardList, CheckSquare, Calendar,
  BarChart3, Lightbulb, Tag,
} from "lucide-react";

const mobileMenuSections = [
  {
    title: "Loja",
    items: [
      { icon: Home, label: "Início", path: "/" },
      { icon: Compass, label: "Explorar", path: "/explorar" },
      { icon: Star, label: "Marcas", path: "/marcas" },
      { icon: User, label: "Perfil", path: "/perfil" },
    ],
  },
  {
    title: "CRM",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", path: "/vendedor/dashboard" },
      { icon: BarChart3, label: "Gerencial", path: "/vendedor/dashboard-gerencial" },
      { icon: Kanban, label: "Oportunidades", path: "/vendedor/oportunidades" },
      { icon: Users, label: "Clientes", path: "/vendedor/clientes" },
      { icon: Target, label: "Nextil 360", path: "/vendedor/360" },
      { icon: Briefcase, label: "Carteira", path: "/vendedor/carteira" },
      { icon: UserCog, label: "Representantes", path: "/vendedor/representantes" },
      { icon: MessageCircle, label: "WhatsApp", path: "/vendedor/whatsapp" },
      { icon: ClipboardList, label: "Orçamentos", path: "/vendedor" },
      { icon: CheckSquare, label: "Tarefas", path: "/vendedor/tarefas" },
      { icon: Calendar, label: "Agenda", path: "/vendedor/agenda" },
      { icon: BarChart3, label: "Relatórios", path: "/vendedor/relatorios" },
      { icon: Lightbulb, label: "Insights", path: "/vendedor/insights" },
      { icon: Tag, label: "Segmentações", path: "/vendedor/segmentacoes" },
      { icon: Settings, label: "Configurações", path: "/vendedor/configuracoes" },
    ],
  },
];

interface AppTopbarProps {
  onMenuToggle?: () => void;
}

export function AppTopbar({ onMenuToggle }: AppTopbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated: authFlag, logout } = useAuth();
  const cart = useCart();
  // Rotas do vendedor operam sempre em modo logado (mock — usuário vendedor).
  const isVendedorRoute = location.pathname.startsWith("/vendedor");
  const isAuthenticated = authFlag || isVendedorRoute;

  return (
    <>
      <header className="sticky top-0 z-50 flex h-12 items-center justify-between border-b border-sidebar-border bg-sidebar px-3 md:px-4 gap-3 shrink-0">
        {/* Left: Hamburger (mobile) + Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setMenuOpen(true)}
            className="md:hidden rounded-md p-1.5 text-sidebar-foreground hover:text-sidebar-primary transition-colors"
            aria-label="Menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <button onClick={() => navigate("/")} className="flex items-center gap-2">
            <img src={nextilLogo} alt="Nextil" className="h-6 w-6" />
            <img src={nextilWordmark} alt="Nextil" className="h-4 hidden sm:block" />
          </button>
        </div>

        {/* Center: Search */}
        <div className="relative flex items-center flex-1 max-w-sm mx-auto">
          <Search className="absolute left-2.5 h-3.5 w-3.5 text-sidebar-foreground" />
          <input
            type="text"
            placeholder="Buscar..."
            className="h-8 w-full rounded-lg border border-sidebar-border bg-sidebar-background pl-8 pr-3 text-xs text-sidebar-primary placeholder:text-sidebar-foreground transition-all focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent/50"
          />
        </div>

        {/* Right: Icons */}
        <div className="flex items-center gap-0.5 shrink-0">
          {isAuthenticated ? (
            <>
              <button
                aria-label="Chat"
                className="relative rounded-md p-1.5 text-sidebar-foreground transition-colors hover:bg-sidebar-accent/20 hover:text-sidebar-primary hidden md:flex"
              >
                <MessageCircle className="h-4 w-4" />
                <span className="absolute right-0.5 top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-accent-foreground">3</span>
              </button>
              <button
                aria-label="Notificações"
                className="relative rounded-md p-1.5 text-sidebar-foreground transition-colors hover:bg-sidebar-accent/20 hover:text-sidebar-primary"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute right-0.5 top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-accent-foreground">7</span>
              </button>
              <button
                aria-label="Carrinho"
                onClick={() => cart.setIsOpen(true)}
                className="relative rounded-md p-1.5 text-sidebar-foreground transition-colors hover:bg-sidebar-accent/20 hover:text-sidebar-primary"
              >
                <ShoppingBag className="h-4 w-4" />
                {cart.items.length > 0 && (
                  <span className="absolute right-0.5 top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-accent-foreground">
                    {cart.items.length}
                  </span>
                )}
              </button>

              {/* User avatar */}
              <div className="flex items-center gap-1.5 ml-1">
                <div className="h-7 w-7 rounded-lg bg-accent flex items-center justify-center">
                  <span className="text-accent-foreground font-bold text-[10px]">B</span>
                </div>
                <div className="text-left hidden lg:block">
                  <p className="text-[11px] font-semibold text-sidebar-primary leading-none">Brandili</p>
                  <p className="text-[9px] text-sidebar-foreground leading-none mt-0.5">Paulo Bardini</p>
                </div>
              </div>

              <button
                aria-label="Sair"
                onClick={() => { logout(); navigate("/"); }}
                className="rounded-md p-1.5 text-sidebar-foreground transition-colors hover:bg-sidebar-accent/20 hover:text-sidebar-primary hidden md:flex ml-1"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("/login")}
                className="px-3 py-1 text-xs font-medium rounded-lg text-sidebar-foreground hover:text-sidebar-primary transition-colors"
              >
                Entrar
              </button>
              <button
                onClick={() => navigate("/cadastro")}
                className="px-3 py-1 text-xs font-medium rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 transition-colors"
              >
                Cadastre-se
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Sheet Menu */}
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="w-[280px] bg-sidebar border-sidebar-border p-0">
          <SheetHeader className="p-4 border-b border-sidebar-border">
            <SheetTitle className="flex items-center gap-2">
              <img src={nextilLogo} alt="Nextil" className="h-6 w-6" />
              <img src={nextilWordmark} alt="Nextil" className="h-4" />
            </SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col p-3 gap-4 overflow-y-auto max-h-[calc(100vh-80px)]">
            {mobileMenuSections.map((section) => (
              <div key={section.title}>
                <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                  {section.title}
                </p>
                <div className="flex flex-col gap-0.5">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <button
                        key={item.label}
                        onClick={() => {
                          navigate(item.path);
                          setMenuOpen(false);
                        }}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-sidebar-foreground hover:bg-sidebar-accent/20 hover:text-sidebar-primary"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}
