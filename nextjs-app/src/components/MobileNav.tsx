import { Home, Search, MessageCircle, User } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const items = [
  { icon: Home, label: "Início", href: "/" },
  { icon: Search, label: "Explorar", href: "/explorar" },
  { icon: MessageCircle, label: "Chat", href: "/", badge: 3 },
  { icon: User, label: "Perfil", href: "/perfil" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden items-center justify-around border-t border-border bg-card/95 backdrop-blur-md px-2 py-1 safe-bottom">
      {items.map(({ icon: Icon, label, href, badge }) => {
        const isActive = pathname === href && label !== "Chat";
        return (
          <Link
            key={label}
            className={`relative flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-lg transition-colors ${
              isActive ? "text-foreground" : "text-muted-foreground"
            }`}
            href={href as any}
          >
            <Icon className="h-6 w-6" strokeWidth={isActive ? 2.5 : 1.5} />
            {badge && badge > 0 && (
              <span className="absolute top-0.5 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
                {badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
