import { Home, Kanban, BarChart3, Users, Menu } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Compass, Star, User, LayoutDashboard, Target, Briefcase,
  UserCog, MessageCircle, ClipboardList, CheckSquare, Calendar,
  Settings, Lightbulb, Tag, FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

const bottomItems = [
  { icon: Home, label: "Início", path: "/" },
  { icon: LayoutDashboard, label: "Painel", path: "/vendedor/dashboard" },
  { icon: Kanban, label: "Oportun.", path: "/vendedor/oportunidades" },
  { icon: Users, label: "Clientes", path: "/vendedor/clientes" },
];

const sections = [
  {
    title: "Loja",
    items: [
      { icon: Home, label: "Início", path: "/" },
      { icon: Compass, label: "Explorar", path: "/explorar" },
      { icon: Star, label: "Marcas", path: "/marcas" },
      { icon: User, label: "Perfil", path: "/perfil" },
    ],
  },
  {
    title: "Comercial",
    items: [
      { icon: LayoutDashboard, label: "Painel", path: "/vendedor/dashboard" },
      { icon: Kanban, label: "Oportunidades", path: "/vendedor/oportunidades" },
      { icon: ClipboardList, label: "Orçamentos", path: "/vendedor" },
      { icon: Users, label: "Clientes", path: "/vendedor/clientes" },
      { icon: Target, label: "Nextil 360", path: "/vendedor/360" },
      { icon: MessageCircle, label: "WhatsApp", path: "/vendedor/whatsapp" },
      { icon: CheckSquare, label: "Tarefas", path: "/vendedor/tarefas" },
      { icon: Calendar, label: "Agenda", path: "/vendedor/agenda" },
    ],
  },
  {
    title: "Gestão",
    items: [
      { icon: BarChart3, label: "Gerencial", path: "/vendedor/dashboard-gerencial" },
      { icon: Briefcase, label: "Carteira", path: "/vendedor/carteira" },
      { icon: UserCog, label: "Representantes", path: "/vendedor/representantes" },
      { icon: FileText, label: "Relatórios", path: "/vendedor/relatorios" },
      { icon: Lightbulb, label: "Insights", path: "/vendedor/insights" },
      { icon: Tag, label: "Segmentações", path: "/vendedor/segmentacoes" },
    ],
  },
];

export function MobileNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden items-center justify-around border-t border-border bg-card/95 backdrop-blur-md px-2 py-1 safe-bottom">
      {bottomItems.map(({ icon: Icon, label, path }) => {
        const active = isActive(path);
        return (
          <button
            key={label}
            onClick={() => navigate(path)}
            className={cn(
              "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors",
              active ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 1.5} />
            <span className="text-[10px]">{label}</span>
          </button>
        );
      })}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-muted-foreground">
            <Menu className="h-5 w-5" />
            <span className="text-[10px]">Menu</span>
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[260px] p-0 bg-sidebar">
          <div className="p-4 space-y-4 overflow-y-auto h-full">
            {sections.map((section) => (
              <div key={section.title}>
                <p className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                  {section.title}
                </p>
                <div className="flex flex-col gap-0.5">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    return (
                      <button
                        key={item.path}
                        onClick={() => { navigate(item.path); setOpen(false); }}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors",
                          active
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-sidebar-foreground hover:bg-sidebar-accent/20"
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="border-t border-sidebar-border pt-3">
              <button
                onClick={() => { navigate("/vendedor/configuracoes"); setOpen(false); }}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium text-sidebar-foreground hover:bg-sidebar-accent/20 w-full"
              >
                <Settings className="h-4 w-4 shrink-0" />
                <span>Configurações</span>
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  );
}
