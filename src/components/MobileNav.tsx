import { Home, Search, MessageCircle, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const items = [
  { icon: Home, label: "Início", path: "/" },
  { icon: Search, label: "Explorar", path: "/explorar" },
  { icon: MessageCircle, label: "Chat", path: "/", badge: 3 },
  { icon: User, label: "Perfil", path: "/perfil" },
];

export function MobileNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden items-center justify-around border-t border-border bg-card px-2 py-1.5 safe-bottom">
      {items.map(({ icon: Icon, label, path, badge }) => {
        const isActive = location.pathname === path && (label !== "Chat");
        return (
          <button
            key={label}
            onClick={() => navigate(path)}
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
