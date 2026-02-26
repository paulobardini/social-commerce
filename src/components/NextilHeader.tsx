import { Search, Bell, ShoppingBag, MessageCircle, Menu } from "lucide-react";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import nextilLogo from "@/assets/nextil-logo.png";
import nextilWordmark from "@/assets/nextil-wordmark.png";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Home, Compass, User, Star, Settings } from "lucide-react";

const sidebarItems = [
  { icon: Home, label: "Página Inicial", path: "/" },
  { icon: Compass, label: "Explorar", path: "/explorar" },
  { icon: User, label: "Meu Perfil", path: "/perfil" },
  { icon: Bell, label: "Atualizações", path: "/" },
  { icon: Star, label: "Minhas Marcas", path: "/marcas" },
  { icon: Settings, label: "Configurações", path: "/" },
];

const navItems = [
  { label: "Início", path: "/" },
  { label: "Lives", path: "/" },
  { label: "Marcas", path: "/marcas" },
  { label: "Pedidos", path: "/" },
];

export function NextilHeader() {
  const [focused, setFocused] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveNav = () => {
    if (location.pathname === "/marcas") return "Marcas";
    if (location.pathname === "/explorar") return "Explorar";
    if (location.pathname === "/perfil") return "Perfil";
    return "Início";
  };

  return (
    <>
      <header className="sticky top-0 z-50 flex h-14 md:h-16 items-center justify-between border-b border-sidebar-border bg-header px-3 md:px-6 gap-3">
        {/* Left: Hamburger (mobile) + Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setMenuOpen(true)}
            className="md:hidden rounded-lg p-1.5 text-sidebar-foreground hover:text-header-foreground transition-colors"
            aria-label="Menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <button onClick={() => navigate("/")} className="flex items-center gap-2">
            <img src={nextilLogo} alt="Nextil" className="h-6 w-6 md:h-7 md:w-7" />
            <img src={nextilWordmark} alt="Nextil" className="h-4 md:h-5 hidden sm:block" />
          </button>
        </div>

        {/* Center: Search */}
        <div className="relative flex items-center flex-1 max-w-md mx-auto">
          <Search className="absolute left-3 h-4 w-4 text-sidebar-foreground" />
          <input
            type="text"
            placeholder="Buscar tendências, marcas..."
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="h-9 w-full rounded-full border border-sidebar-border bg-sidebar pl-9 pr-4 text-sm text-header-foreground placeholder:text-sidebar-foreground transition-all focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent/50"
          />
        </div>

        {/* Right: Nav + Icons */}
        <div className="flex items-center gap-1 shrink-0">
          <nav className="hidden lg:flex items-center gap-1 mr-2">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  getActiveNav() === item.label
                    ? "text-header-foreground"
                    : "text-sidebar-foreground hover:text-header-foreground"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {[
            { icon: MessageCircle, label: "Chat", badge: 3, hideOnMobile: true },
            { icon: Bell, label: "Notificações", badge: 7, hideOnMobile: false },
            { icon: ShoppingBag, label: "Carrinho", badge: 0, hideOnMobile: false },
          ].map(({ icon: Icon, label, badge, hideOnMobile }) => (
            <button
              key={label}
              aria-label={label}
              className={`relative rounded-lg p-2 text-sidebar-foreground transition-colors hover:bg-sidebar-accent/20 hover:text-header-foreground ${hideOnMobile ? "hidden md:flex" : ""}`}
            >
              <Icon className="h-5 w-5" />
              {badge > 0 && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      {/* Mobile Sheet Menu */}
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="w-[280px] bg-sidebar border-sidebar-border p-0">
          <SheetHeader className="p-4 border-b border-sidebar-border">
            <SheetTitle className="flex items-center gap-2">
              <img src={nextilLogo} alt="Nextil" className="h-7 w-7" />
              <img src={nextilWordmark} alt="Nextil" className="h-5" />
            </SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col p-3 gap-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.label}
                  onClick={() => {
                    navigate(item.path);
                    setMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/20 hover:text-sidebar-primary"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}
