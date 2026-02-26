import { Search, Bell, ShoppingBag } from "lucide-react";
import { useState } from "react";
import nextilLogo from "@/assets/nextil-logo.png";
import nextilWordmark from "@/assets/nextil-wordmark.png";

const navItems = ["Início", "Lives", "Chat", "Pedidos"];

export function NextilHeader() {
  const [focused, setFocused] = useState(false);
  const [activeNav, setActiveNav] = useState("Início");

  return (
    <header className="sticky top-0 z-50 flex h-14 md:h-16 items-center justify-between border-b border-sidebar-border bg-header px-3 md:px-6 gap-3">
      {/* Logo */}
      <div className="flex items-center gap-2 shrink-0">
        <img src={nextilLogo} alt="Nextil" className="h-6 w-6 md:h-7 md:w-7" />
        <img src={nextilWordmark} alt="Nextil" className="h-4 md:h-5 hidden sm:block" />
      </div>

      {/* Center: Search */}
      <div
        className={`relative flex items-center flex-1 max-w-md mx-auto transition-all duration-300`}
      >
        <Search className="absolute left-3 h-4 w-4 text-sidebar-foreground" />
        <input
          type="text"
          placeholder="Buscar tendências, marcas..."
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="h-9 w-full rounded-full border border-sidebar-border bg-sidebar pl-9 pr-4 text-sm text-header-foreground placeholder:text-sidebar-foreground transition-all focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent/50"
        />
      </div>

      {/* Right: Nav + Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <nav className="hidden lg:flex items-center gap-1 mr-2">
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
      </div>
    </header>
  );
}
