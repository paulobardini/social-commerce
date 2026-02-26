import { Home, Compass, User, Bell, Star } from "lucide-react";
import { useState } from "react";

const items = [
  { icon: Home, label: "Início" },
  { icon: Compass, label: "Explorar" },
  { icon: Bell, label: "Atualizações" },
  { icon: Star, label: "Marcas" },
  { icon: User, label: "Perfil" },
];

export function MobileNav() {
  const [active, setActive] = useState("Início");

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden items-center justify-around border-t border-sidebar-border bg-header px-2 py-1 safe-bottom">
      {items.map(({ icon: Icon, label }) => {
        const isActive = active === label;
        return (
          <button
            key={label}
            onClick={() => setActive(label)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors ${
              isActive
                ? "text-accent"
                : "text-sidebar-foreground"
            }`}
          >
            <Icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
