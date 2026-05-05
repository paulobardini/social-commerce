import { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Megaphone, GitBranch, BookOpen, Users2, Target, Plug, Settings, Sparkles, ArrowRightLeft, Flame } from "lucide-react";
import { useMarketing } from "../contexts/MarketingDataContext";
import { useNotifications } from "../contexts/MarketingNotificationsContext";

const navItems = [
  { to: "/marketing/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/marketing/central-vendas", icon: Flame, label: "Central de Vendas", badge: "fila" as const },
  { to: "/marketing/meta-ads", icon: Sparkles, label: "Meta Ads", highlight: true },
  { to: "/marketing/atribuicao", icon: Target, label: "Atribuição" },
  { to: "/marketing/campanhas", icon: Megaphone, label: "Campanhas" },
  { to: "/marketing/jornadas", icon: GitBranch, label: "Jornadas" },
  { to: "/marketing/lookbooks", icon: BookOpen, label: "Lookbooks" },
  { to: "/marketing/audiencias", icon: Users2, label: "Audiências" },
  { to: "/marketing/handoff", icon: ArrowRightLeft, label: "Handoff CRM" },
];
const bottomItems = [
  { to: "/marketing/integracoes", icon: Plug, label: "Integrações" },
  { to: "/marketing/configuracoes", icon: Settings, label: "Configurações" },
];

export function MarketingLayout({ children }: { children: ReactNode }) {
  const { periodo, setPeriodo, contaId, setContaId, contas } = useMarketing();

  return (
    <div className="min-h-screen bg-background text-foreground flex font-['Poppins']">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex md:flex-col w-[220px] bg-sidebar border-r border-sidebar-border fixed h-screen z-30">
        <div className="px-5 py-5 border-b border-sidebar-border flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-sidebar-primary">Marketing</p>
            <p className="text-[10px] text-sidebar-foreground/60">Nextil Hub</p>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-2 py-3">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium mb-0.5 transition-colors ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : item.highlight
                    ? "text-[hsl(var(--accent))] hover:bg-sidebar-accent/20"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/20 hover:text-sidebar-primary"
                }`
              }
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="px-2 py-3 border-t border-sidebar-border space-y-0.5">
          {bottomItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                  isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent/20"
                }`
              }
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
          <div className="flex items-center gap-2 px-3 pt-3">
            <div className="h-7 w-7 rounded-lg bg-accent flex items-center justify-center">
              <span className="text-accent-foreground font-bold text-[10px]">MK</span>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-sidebar-primary truncate">Time Marketing</p>
              <p className="text-[9px] text-sidebar-foreground/70 truncate">Brandili</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-sidebar border-b border-sidebar-border z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="text-[13px] font-semibold text-sidebar-primary">Marketing</span>
        </div>
      </header>

      <main className="flex-1 md:ml-[220px] pt-14 md:pt-0 pb-20 md:pb-0 min-h-screen">
        {/* Top bar with global filters */}
        <div className="sticky top-14 md:top-0 z-20 bg-background border-b border-border px-4 md:px-6 py-3 flex items-center gap-2 md:gap-3 flex-wrap">
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            {(["7d", "30d", "90d", "ytd"] as const).map(p => (
              <button
                key={p}
                onClick={() => setPeriodo(p)}
                className={`text-[11px] font-medium px-2.5 py-1 rounded ${
                  periodo === p ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {p === "7d" ? "7 dias" : p === "30d" ? "30 dias" : p === "90d" ? "90 dias" : "Este ano"}
              </button>
            ))}
          </div>
          <select
            value={contaId}
            onChange={e => setContaId(e.target.value)}
            className="text-[12px] bg-card border border-border rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="all">Todas as contas</option>
            {contas.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="max-w-[1320px] mx-auto px-4 md:px-6 py-5">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-sidebar border-t border-sidebar-border z-40 grid grid-cols-5 h-16">
        {[navItems[0], navItems[1], navItems[2], navItems[3], bottomItems[0]].map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 ${
                isActive ? "text-sidebar-accent-foreground" : "text-sidebar-foreground/70"
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[9px] font-medium truncate">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
