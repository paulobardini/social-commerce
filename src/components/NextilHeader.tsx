import { Search, Bell, MessageCircle, ShoppingBag, User } from "lucide-react";
import { useState } from "react";

const navItems = ["Início", "Lives", "Chat", "Pedidos"];

export function NextilHeader() {
  const [focused, setFocused] = useState(false);
  const [activeNav, setActiveNav] = useState("Início");

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-sidebar-border bg-header px-6">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center">
          <svg viewBox="0 0 32 32" className="h-7 w-7" fill="none">
            <path d="M16 4C9.4 4 4 9.4 4 16s5.4 12 12 12 12-5.4 12-12S22.6 4 16 4zm-2 16.5c0 .8-.7 1.5-1.5 1.5S11 21.3 11 20.5v-9c0-.8.7-1.5 1.5-1.5s1.5.7 1.5 1.5v3.8l5-5.3c.6-.6 1.5-.6 2.1 0s.6 1.5 0 2.1L16 15l4.1 4.1c.6.6.6 1.5 0 2.1-.3.3-.7.4-1.1.4s-.8-.1-1.1-.4l-4-4v3.3z" fill="hsl(var(--tertiary))" />
          </svg>
        </div>
        <span className="text-lg font-semibold tracking-tight text-header-foreground">
          nextil
        </span>
      </div>

      {/* Center nav + search */}
      <div className="flex items-center gap-6">
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item}
              onClick={() => setActiveNav(item)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                activeNav === item
                  ? "text-header-foreground"
                  : "text-sidebar-foreground hover:text-header-foreground"
              }`}
            >
              {item}
            </button>
          ))}
        </nav>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1">
        {/* Search */}
        <div
          className={`relative flex items-center transition-all duration-300 ${
            focused ? "w-64" : "w-48"
          }`}
        >
          <Search className="absolute left-3 h-4 w-4 text-sidebar-foreground" />
          <input
            type="text"
            placeholder="Buscar..."
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="h-9 w-full rounded-lg border border-sidebar-border bg-sidebar pl-9 pr-3 text-sm text-header-foreground placeholder:text-sidebar-foreground transition-all focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent/50"
          />
        </div>

        {[
          { icon: Bell, label: "Notificações", badge: 7 },
          { icon: ShoppingBag, label: "Carrinho", badge: 0 },
        ].map(({ icon: Icon, label, badge }) => (
          <button
            key={label}
            aria-label={label}
            className="relative rounded-lg p-2 text-sidebar-foreground transition-colors hover:bg-sidebar-accent/20 hover:text-header-foreground"
          >
            <Icon className="h-5 w-5" />
            {badge > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                {badge}
              </span>
            )}
          </button>
        ))}

        {/* User */}
        <div className="ml-2 flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-sidebar-accent/20 cursor-pointer">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">
            ML
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-medium text-header-foreground leading-tight">Minha Loja</p>
            <p className="text-[10px] text-sidebar-foreground leading-tight">Comprador</p>
          </div>
        </div>
      </div>
    </header>
  );
}
