import { Bell, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function VendedorTopbar() {
  const navigate = useNavigate();

  return (
    <header className="h-14 bg-sidebar flex items-center justify-between px-4 border-b border-sidebar-border shrink-0">
      {/* Logo */}
      <button onClick={() => navigate("/")} className="flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
            <span className="text-accent-foreground font-bold text-sm">N</span>
          </div>
          <span className="text-sidebar-primary font-heading font-semibold text-base tracking-tight">nextil</span>
        </div>
      </button>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <button className="h-8 w-8 rounded-lg flex items-center justify-center text-sidebar-foreground hover:bg-sidebar-accent/20 transition-colors">
          <Bell className="h-4 w-4" />
        </button>

        <button className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-sidebar-accent/20 transition-colors">
          <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center overflow-hidden">
            <span className="text-accent-foreground font-bold text-xs">B</span>
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-semibold text-sidebar-primary leading-none">Brandili</p>
            <p className="text-[10px] text-sidebar-foreground leading-none mt-0.5">Paulo Bardini</p>
          </div>
          <ChevronDown className="h-3 w-3 text-sidebar-foreground" />
        </button>
      </div>
    </header>
  );
}
