import {
  Compass,
  TrendingUp,
  Users,
  Sparkles,
  Bookmark,
  Briefcase,
  BarChart3,
  Package,
  Settings,
} from "lucide-react";
import { useState } from "react";

const menuItems = [
  { icon: Compass, label: "Explorar" },
  { icon: TrendingUp, label: "Tendências" },
  { icon: Users, label: "Fornecedores" },
  { icon: Sparkles, label: "Novidades" },
  { icon: Bookmark, label: "Salvos" },
  { divider: true },
  { icon: Briefcase, label: "Meu Negócio" },
  { icon: BarChart3, label: "Analytics" },
  { icon: Package, label: "Pedidos" },
] as const;

type MenuItem = {
  icon?: React.ComponentType<{ className?: string }>;
  label?: string;
  divider?: boolean;
};

export function NextilSidebar() {
  const [active, setActive] = useState("Explorar");

  return (
    <aside className="sticky top-16 flex h-[calc(100vh-4rem)] w-[60px] flex-col items-center border-r border-sidebar-border bg-sidebar py-6 justify-between">
      <nav className="flex flex-col items-center gap-1">
        {(menuItems as unknown as MenuItem[]).map((item, i) => {
          if (item.divider) {
            return (
              <div key={`div-${i}`} className="my-3 h-px w-8 bg-sidebar-border" />
            );
          }
          const Icon = item.icon!;
          const isActive = active === item.label;
          return (
            <button
              key={item.label}
              onClick={() => setActive(item.label!)}
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
        className="flex h-10 w-10 items-center justify-center rounded-xl text-sidebar-foreground transition-colors hover:bg-sidebar-accent/20 hover:text-sidebar-primary"
      >
        <Settings className="h-5 w-5" />
      </button>
    </aside>
  );
}
