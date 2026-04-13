import { ReactNode } from "react";
import { VendedorSidebar } from "./VendedorSidebar";
import { VendedorTopbar } from "./VendedorTopbar";

interface VendedorLayoutProps {
  children: ReactNode;
  breadcrumbs?: { label: string; path?: string }[];
}

export function VendedorLayout({ children }: VendedorLayoutProps) {
  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <VendedorTopbar />
      <div className="flex flex-1 overflow-hidden">
        <VendedorSidebar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
