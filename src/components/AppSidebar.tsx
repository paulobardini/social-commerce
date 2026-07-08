import {
  Home, Compass, User, Star,
  LayoutDashboard, BarChart3, Kanban, Users, Target, Briefcase,
  UserCog, MessageCircle, ClipboardList, CheckSquare, Calendar,
  Settings, Lightbulb, Tag, ChevronLeft, ChevronRight,
  FileText, ChevronDown, Sparkles, ShoppingCart, Radar, Brain, GitCompare, Truck, Layers, Headphones,
  ShieldCheck,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useCockpit } from "@/cockpit/contexts/CockpitContext";
import { usePlanos } from "@/contexts/PlanosContext";
import { filaAprovacoes } from "@/cockpit/lib/decisoes";

interface MenuItem {
  icon: any;
  label: string;
  path: string;
  highlight?: boolean;
  badgeKey?: "aprovacoes" | "planos_escalados";
}

interface MenuSection {
  title: string;
  items: MenuItem[];
  collapsible?: boolean;
}

const sections: MenuSection[] = [
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
    title: "Nextil 360",
    collapsible: true,
    items: [
      { icon: LayoutDashboard, label: "Painel", path: "/vendedor/dashboard" },
      { icon: Kanban, label: "Oportunidades", path: "/vendedor/oportunidades" },
      { icon: ShoppingCart, label: "Meus Pedidos", path: "/vendedor/360/pedidos" },
      { icon: ClipboardList, label: "Orçamentos", path: "/vendedor" },
      { icon: Users, label: "Clientes", path: "/vendedor/clientes" },
      { icon: MessageCircle, label: "WhatsApp", path: "/vendedor/whatsapp" },
      { icon: CheckSquare, label: "Tarefas", path: "/vendedor/tarefas" },
      { icon: Calendar, label: "Agenda", path: "/vendedor/agenda" },
    ],
  },
  {
    title: "Gestão",
    collapsible: true,
    items: [
      { icon: BarChart3, label: "Painel Gestor", path: "/gestor/painel" },
      { icon: ShieldCheck, label: "Aprovações", path: "/gestor/aprovacoes", badgeKey: "aprovacoes" },
      { icon: UserCog, label: "Representantes", path: "/vendedor/representantes", badgeKey: "planos_escalados" },
      { icon: ShoppingCart, label: "Pedidos (Empresa)", path: "/vendedor/360/pedidos?escopo=empresa" },
      { icon: Briefcase, label: "Carteira", path: "/vendedor/carteira" },
      { icon: Headphones, label: "Atendimento", path: "/vendedor/atendimento" },
      { icon: FileText, label: "Relatórios", path: "/vendedor/relatorios" },
      { icon: Tag, label: "Segmentações", path: "/vendedor/segmentacoes" },
    ],
  },
  {
    title: "Inteligência",
    collapsible: true,
    items: [
      { icon: Brain, label: "Inteligência de Mercado", path: "/inteligencia-mercado", highlight: true },
      { icon: Radar, label: "Radar de Produtos", path: "/inteligencia-mercado/radar-produtos" },
      { icon: Lightbulb, label: "Recomendações", path: "/inteligencia-mercado/recomendacoes" },
      { icon: GitCompare, label: "Comparativos", path: "/inteligencia-mercado/comparativos" },
      { icon: Truck, label: "Fornecedores", path: "/inteligencia-mercado/fornecedores" },
      { icon: Layers, label: "Coleções", path: "/inteligencia-mercado/colecoes" },
      { icon: FileText, label: "Relatórios IM", path: "/inteligencia-mercado/relatorios" },
    ],
  },
  {
    title: "Marketing",
    collapsible: true,
    items: [
      { icon: Sparkles, label: "Marketing Hub", path: "/marketing/dashboard", highlight: true },
    ],
  },
];

const settingsItem: MenuItem = { icon: Settings, label: "Configurações", path: "/vendedor/configuracoes" };

function isPathActive(path: string, currentPath: string): boolean {
  if (path === "/") return currentPath === "/";
  if (path === "/vendedor") {
    return currentPath === "/vendedor" || currentPath.startsWith("/vendedor/novo-orcamento") || currentPath.startsWith("/vendedor/orcamento") || currentPath === "/vendedor/grade" || currentPath === "/vendedor/orcamento-viewer";
  }
  if (path === "/vendedor/oportunidades") return currentPath.startsWith("/vendedor/oportunidades");
  if (path === "/vendedor/clientes") return currentPath === "/vendedor/clientes" || currentPath.startsWith("/vendedor/clientes/");
  if (path === "/vendedor/360") return currentPath.startsWith("/vendedor/360");
  if (path === "/vendedor/representantes") return currentPath.startsWith("/vendedor/representantes");
  if (path === "/vendedor/whatsapp") return currentPath.startsWith("/vendedor/whatsapp");
  if (path === "/vendedor/relatorios") return currentPath.startsWith("/vendedor/relatorios");
  if (path === "/gestor/painel") return currentPath.startsWith("/gestor/painel") || currentPath.startsWith("/vendedor/dashboard-gerencial");
  if (path === "/gestor/aprovacoes") return currentPath.startsWith("/gestor/aprovacoes");
  return currentPath === path || currentPath.startsWith(path + "/");
}

function useBadgeCounts() {
  try {
    const { seed, escopo } = useCockpit();
    const { planos } = usePlanos();
    return {
      aprovacoes: filaAprovacoes(seed, escopo).length,
      planos_escalados: planos.filter(p => p.status === "escalado").length,
    };
  } catch {
    return { aprovacoes: 0, planos_escalados: 0 };
  }
}

export function AppSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ Comercial: true, Gestão: true });
  const badges = useBadgeCounts();

  const toggleSection = (title: string) => {
    setOpenSections((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  // Auto-open section if active route is inside it
  const isSectionActive = (section: MenuSection) =>
    section.items.some((item) => isPathActive(item.path, location.pathname));

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col h-full bg-sidebar border-r border-sidebar-border shrink-0 transition-all duration-200",
        collapsed ? "w-[60px]" : "w-[200px]"
      )}
    >
      {/* Collapse toggle */}
      <div className={cn("flex items-center py-3 shrink-0", collapsed ? "justify-center" : "justify-end px-3")}>
        <button
          onClick={onToggle}
          className="h-7 w-7 rounded-md flex items-center justify-center text-sidebar-foreground hover:bg-sidebar-accent/20 transition-colors"
          title={collapsed ? "Expandir menu" : "Recolher menu"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 space-y-3">
        {sections.map((section) => {
          const isOpen = !section.collapsible || openSections[section.title] || isSectionActive(section);
          return (
            <div key={section.title}>
              {!collapsed && section.collapsible ? (
                <button
                  onClick={() => toggleSection(section.title)}
                  className="flex items-center justify-between w-full px-3 mb-1.5 group"
                >
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                    {section.title}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-3 w-3 text-sidebar-foreground/40 transition-transform duration-200",
                      !isOpen && "-rotate-90"
                    )}
                  />
                </button>
              ) : !collapsed ? (
                <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                  {section.title}
                </p>
              ) : (
                <div className="border-t border-sidebar-border/30 mx-2 mb-2" />
              )}
              {isOpen && (
                <div className="flex flex-col gap-0.5">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const active = isPathActive(item.path, location.pathname);
                    const badgeVal = item.badgeKey ? badges[item.badgeKey] : 0;
                    return (
                      <button
                        key={item.path + item.label}
                        onClick={() => navigate(item.path)}
                        title={collapsed ? item.label : undefined}
                        className={cn(
                          "relative flex items-center rounded-lg text-[13px] font-medium transition-all duration-150",
                          collapsed ? "justify-center h-10 w-10 mx-auto" : "gap-3 px-3 py-2",
                          active
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : item.highlight
                            ? "text-[hsl(var(--tertiary))] hover:bg-sidebar-accent/20"
                            : "text-sidebar-foreground hover:bg-sidebar-accent/20 hover:text-sidebar-primary"
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        {!collapsed && <span className="truncate flex-1 text-left">{item.label}</span>}
                        {badgeVal > 0 && (
                          collapsed ? (
                            <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center leading-none">
                              {badgeVal > 9 ? "9+" : badgeVal}
                            </span>
                          ) : (
                            <span className="h-4 min-w-5 px-1.5 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center leading-none">
                              {badgeVal}
                            </span>
                          )
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Settings + User */}
      <div className="shrink-0 border-t border-sidebar-border">
        <div className="px-2 py-2">
          <button
            onClick={() => navigate(settingsItem.path)}
            title={collapsed ? settingsItem.label : undefined}
            className={cn(
              "flex items-center rounded-lg text-[13px] font-medium transition-all duration-150 w-full",
              collapsed ? "justify-center h-10" : "gap-3 px-3 py-2",
              isPathActive(settingsItem.path, location.pathname)
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/20 hover:text-sidebar-primary"
            )}
          >
            <Settings className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="truncate">Configurações</span>}
          </button>
        </div>
        {!collapsed && (
          <div className="px-3 pb-3">
            <div className="flex items-center gap-2 px-2 py-1.5">
              <div className="h-7 w-7 rounded-lg bg-accent flex items-center justify-center shrink-0">
                <span className="text-accent-foreground font-bold text-[10px]">PB</span>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-sidebar-primary truncate">Paulo Bardini</p>
                <p className="text-[10px] text-sidebar-foreground truncate">Comercial · Brandili</p>
              </div>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center pb-3">
            <div className="h-7 w-7 rounded-lg bg-accent flex items-center justify-center" title="Paulo Bardini">
              <span className="text-accent-foreground font-bold text-[10px]">PB</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
