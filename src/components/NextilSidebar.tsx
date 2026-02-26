import {
  Compass,
  TrendingUp,
  Users,
  Sparkles,
  Bookmark,
  Briefcase,
  BarChart3,
  Package,
} from "lucide-react";
import { useState } from "react";

const menuItems = [
  { icon: Compass, label: "Explorar", active: true },
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
  active?: boolean;
  divider?: boolean;
};

export function NextilSidebar() {
  const [active, setActive] = useState("Explorar");

  return (
    <aside className="sticky top-16 flex h-[calc(100vh-4rem)] w-56 flex-col border-r border-border bg-card/50 px-3 py-6">
      <nav className="flex flex-col gap-1">
        {(menuItems as unknown as MenuItem[]).map((item, i) => {
          if (item.divider) {
            return (
              <div key={`div-${i}`} className="my-3 h-px bg-border" />
            );
          }
          const Icon = item.icon!;
          const isActive = active === item.label;
          return (
            <button
              key={item.label}
              onClick={() => setActive(item.label!)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
              }`}
            >
              <Icon className={`h-[18px] w-[18px] ${isActive ? "text-accent" : ""}`} />
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
