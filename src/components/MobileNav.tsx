import { Home, Search, MessageCircle, User } from "lucide-react";
import { useState } from "react";

const items = [
  { icon: Home, label: "Início" },
  { icon: Search, label: "Explorar" },
  { icon: MessageCircle, label: "Chat", badge: 3 },
  { icon: User, label: "Perfil" },
];

export function MobileNav() {
  const [active, setActive] = useState("Início");

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden items-center justify-around border-t border-border bg-card px-2 py-1.5 safe-bottom">
      {items.map(({ icon: Icon, label, badge }) => {
        const isActive = active === label;
        return (
          <button
            key={label}
            onClick={() => setActive(label)}
            className={`relative flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-lg transition-colors ${
              isActive ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            <Icon className="h-6 w-6" strokeWidth={isActive ? 2.5 : 1.5} />
            {badge && badge > 0 && (
              <span className="absolute top-0.5 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
                {badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
