import { LayoutDashboard, Kanban, ClipboardList, Users, Briefcase, BarChart3, Settings, UserCircle, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/vendedor/dashboard" },
  { icon: Kanban, label: "Oportunidades", path: "/vendedor/oportunidades" },
  { icon: ClipboardList, label: "Orçamentos", path: "/vendedor" },
  { icon: Users, label: "Clientes", path: "/vendedor/carteira" },
  { icon: Briefcase, label: "Representantes", path: "/vendedor/representantes", disabled: true },
  { icon: BarChart3, label: "Relatórios", path: "/vendedor/relatorios", disabled: true },
  { icon: Settings, label: "Configurações", path: "/vendedor/configuracoes" },
];

interface VendedorSidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function VendedorSidebar({ collapsed, onToggle }: VendedorSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    if (path === "/vendedor") return location.pathname === "/vendedor" || location.pathname.startsWith("/vendedor/novo-orcamento") || location.pathname.startsWith("/vendedor/orcamento") || location.pathname === "/vendedor/grade" || location.pathname === "/vendedor/orcamento-viewer";
    if (path === "/vendedor/oportunidades") return location.pathname.startsWith("/vendedor/oportunidades");
    if (path === "/vendedor/dashboard") return location.pathname === "/vendedor/dashboard";
    if (path === "/vendedor/carteira") return location.pathname === "/vendedor/carteira";
    if (path === "/vendedor/configuracoes") return location.pathname.startsWith("/vendedor/configuracoes");
    return location.pathname === path;
  };

  return (
    <aside className="flex flex-col h-full w-[180px] bg-sidebar border-r border-sidebar-border shrink-0">
      {/* Close / Toggle */}
      <div className="flex items-center justify-center py-3">
        <button
          onClick={onToggle}
          className="h-8 w-8 rounded-lg flex items-center justify-center text-sidebar-foreground hover:bg-sidebar-accent/20 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Menu items */}
      <nav className="flex flex-col gap-0.5 px-2 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          const disabled = (item as any).disabled;
          return (
            <button
              key={item.label}
              onClick={() => !disabled && navigate(item.path)}
              disabled={disabled}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                disabled
                  ? "text-sidebar-foreground/30 cursor-not-allowed"
                  : active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/20 hover:text-sidebar-primary"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.label}</span>
              {disabled && (
                <span className="ml-auto text-[9px] uppercase tracking-wider text-sidebar-foreground/30">Em breve</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User info */}
      <div className="px-3 py-3 border-t border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-1.5">
          <UserCircle className="h-5 w-5 text-sidebar-foreground shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-medium text-sidebar-primary truncate">Paulo Bardini</p>
            <p className="text-[10px] text-sidebar-foreground truncate">Vendedor</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
