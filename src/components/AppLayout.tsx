import { ReactNode, useState } from "react";
import { AppSidebar } from "./AppSidebar";
import { AppTopbar } from "./AppTopbar";
import { MobileNav } from "./MobileNav";

interface AppLayoutProps {
  children: ReactNode;
  /** If true, hides sidebar/topbar (for login, onboarding, etc.) */
  bare?: boolean;
  /** If true, main area takes full height with overflow hidden (for WhatsApp-style pages) */
  fullHeight?: boolean;
}

export function AppLayout({ children, bare, fullHeight }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  if (bare) {
    return <>{children}</>;
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <AppTopbar onMenuToggle={() => setCollapsed(!collapsed)} />
      <div className="flex flex-1 overflow-hidden">
        <AppSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
        <main className={fullHeight ? "flex-1 overflow-hidden" : "flex-1 overflow-y-auto"}>
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
