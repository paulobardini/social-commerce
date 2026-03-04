import {
  Home,
  Compass,
  User,
  Bell,
  Star,
  Settings,
} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const menuItems = [
  { icon: Home, label: "Página Inicial", href: "/" },
  { icon: Compass, label: "Explorar", href: "/explorar" },
  { icon: User, label: "Meu Perfil", href: "/perfil" },
  { icon: Bell, label: "Atualizações", href: "/" },
  { icon: Star, label: "Minhas Marcas", href: "/marcas" },
];

export function NextilSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex sticky top-16 h-[calc(100vh-4rem)] w-[60px] flex-col items-center border-r border-sidebar-border bg-sidebar py-6 justify-between">
      <nav className="flex flex-col items-center gap-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href as any}
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
            </Link>
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
