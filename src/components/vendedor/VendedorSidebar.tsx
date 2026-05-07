import { LayoutDashboard, Kanban, ClipboardList, Users, MessageCircle, CheckSquare, Calendar, Settings, UserCircle, X, Target, Briefcase, UserCog, Tag, BarChart3, Lightbulb, ShoppingCart } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/vendedor/dashboard" },
  { icon: BarChart3, label: "Dashboard Gerencial", path: "/vendedor/dashboard-gerencial" },
  { icon: Kanban, label: "Oportunidades", path: "/vendedor/oportunidades" },
  { icon: Users, label: "Clientes", path: "/vendedor/clientes" },
  { icon: Target, label: "Nextil 360", path: "/vendedor/360", highlight: true },
  { icon: ShoppingCart, label: "Pedidos", path: "/vendedor/360/pedidos", indent: true },
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
    if (path === "/vendedor/clientes") return location.pathname === "/vendedor/clientes" || location.pathname.startsWith("/vendedor/clientes/");
    if (path === "/vendedor/360") return location.pathname === "/vendedor/360" || (location.pathname.startsWith("/vendedor/360/") && !location.pathname.startsWith("/vendedor/360/pedidos"));
    if (path === "/vendedor/360/pedidos") return location.pathname.startsWith("/vendedor/360/pedidos");
    if (path === "/vendedor/carteira") return location.pathname === "/vendedor/carteira";
    if (path === "/vendedor/representantes") return location.pathname.startsWith("/vendedor/representantes");
    if (path === "/vendedor/whatsapp") return location.pathname.startsWith("/vendedor/whatsapp");
    if (path === "/vendedor/tarefas") return location.pathname.startsWith("/vendedor/tarefas");
    if (path === "/vendedor/agenda") return location.pathname.startsWith("/vendedor/agenda");
    if (path === "/vendedor/segmentacoes") return location.pathname.startsWith("/vendedor/segmentacoes");
    if (path === "/vendedor/dashboard") return location.pathname === "/vendedor/dashboard";
    if (path === "/vendedor/dashboard-gerencial") return location.pathname === "/vendedor/dashboard-gerencial";
    if (path === "/vendedor/relatorios") return location.pathname.startsWith("/vendedor/relatorios");
    if (path === "/vendedor/insights") return location.pathname.startsWith("/vendedor/insights");
    if (path === "/vendedor/configuracoes") return location.pathname.startsWith("/vendedor/configuracoes");
    return location.pathname === path;
  };

  return (
    <aside className="flex flex-col h-full w-[180px] bg-sidebar border-r border-sidebar-border shrink-0">
      <div className="flex items-center justify-center py-3">
        <button onClick={onToggle} className="h-8 w-8 rounded-lg flex items-center justify-center text-sidebar-foreground hover:bg-sidebar-accent/20 transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>
      <nav className="flex flex-col gap-0.5 px-2 flex-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          const highlight = (item as any).highlight;
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 ${
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : highlight
                  ? "text-[hsl(191,100%,50%)] hover:bg-sidebar-accent/20"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/20 hover:text-sidebar-primary"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>
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
