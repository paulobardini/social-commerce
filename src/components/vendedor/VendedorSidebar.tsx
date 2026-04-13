import { ClipboardList, Users, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const menuItems = [
  { icon: ClipboardList, label: "Orçamentos", path: "/vendedor" },
  { icon: Users, label: "Carteira", path: "/vendedor/carteira" },
];

interface VendedorSidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function VendedorSidebar({ collapsed, onToggle }: VendedorSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside className="flex flex-col h-full w-[120px] bg-sidebar border-r border-sidebar-border">
      {/* Close / Toggle */}
      <div className="flex items-center justify-center py-4">
        <button
          onClick={onToggle}
          className="h-8 w-8 rounded-lg flex items-center justify-center text-sidebar-foreground hover:bg-sidebar-accent/20 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Menu items */}
      <nav className="flex flex-col gap-0.5 px-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || 
            (item.path === "/vendedor" && location.pathname.startsWith("/vendedor") && location.pathname !== "/vendedor/carteira");
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/20 hover:text-sidebar-primary"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
