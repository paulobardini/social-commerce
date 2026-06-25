import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Props {
  title?: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function SectionCard({ title, subtitle, action, children, className }: Props) {
  return (
    <div className={cn("nx-card p-4", className)}>
      {(title || action) && (
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            {title && <h3 className="text-sm font-semibold nx-text">{title}</h3>}
            {subtitle && <p className="text-[11px] nx-muted mt-0.5">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
