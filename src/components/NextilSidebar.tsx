import {
  Home,
  Compass,
  User,
  Bell,
  Star,
  Settings,
} from "lucide-react";
import { useState } from "react";

const menuItems = [
  { icon: Home, label: "Página Inicial" },
  { icon: Compass, label: "Explorar" },
  { icon: User, label: "Meu Perfil" },
  { icon: Bell, label: "Atualizações" },
  { icon: Star, label: "Minhas Marcas" },
];

export function NextilSidebar() {
  const [active, setActive] = useState("Página Inicial");

  return (
    <aside className="hidden md:flex sticky top-16 h-[calc(100vh-4rem)] w-[60px] flex-col items-center border-r border-sidebar-border bg-sidebar py-6 justify-between">
      <nav className="flex flex-col items-center gap-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.label;
          return (
            <button
              key={item.label}
              onClick={() => setActive(item.label)}
              title={item.label}
              className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/20 hover:text-sidebar-primary"
              }`}
            >
              <Icon className="h-5 w-5" />
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-sidebar-accent" />
              )}
            </button>
          );
        })}
      </nav>

      <button
        title="Configurações"
        onClick={() => setActive("Configurações")}
        className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
          active === "Configurações"
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground hover:bg-sidebar-accent/20 hover:text-sidebar-primary"
        }`}
      >
        <Settings className="h-5 w-5" />
      </button>
    </aside>
  );
}
