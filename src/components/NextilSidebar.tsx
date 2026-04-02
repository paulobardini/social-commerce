import {
  Home,
  Compass,
  User,
  Bell,
  Star,
  ClipboardList,
  Settings,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const menuItems = [
  { icon: Home, label: "Página Inicial", path: "/" },
  { icon: Compass, label: "Explorar", path: "/explorar" },
  { icon: ClipboardList, label: "Orçamentos", path: "/vendedor" },
  { icon: User, label: "Meu Perfil", path: "/perfil" },
  { icon: Bell, label: "Atualizações", path: "/" },
  { icon: Star, label: "Minhas Marcas", path: "/marcas" },
];

export function NextilSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="hidden md:flex sticky top-16 h-[calc(100vh-4rem)] w-[60px] flex-col items-center border-r border-sidebar-border bg-sidebar py-6 justify-between">
      <nav className="flex flex-col items-center gap-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
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
        className="flex h-10 w-10 items-center justify-center rounded-xl transition-colors text-sidebar-foreground hover:bg-sidebar-accent/20 hover:text-sidebar-primary"
      >
        <Settings className="h-5 w-5" />
      </button>
    </aside>
  );
}
