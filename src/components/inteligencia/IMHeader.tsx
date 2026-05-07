import { Database } from "lucide-react";

interface Props {
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
}

export function IMHeader({ title, subtitle, actions }: Props) {
  return (
    <div className="border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="px-4 md:px-6 py-4 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-primary font-semibold mb-1">
            Nextil Inteligência de Mercado
          </p>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{subtitle}</p>
          <p className="text-[11px] text-muted-foreground/80 mt-2 flex items-center gap-1.5">
            <Database className="h-3 w-3" />
            Análises baseadas nos dados internos de compra, venda, estoque, pedidos, reservas e comportamento comercial da operação.
          </p>
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </div>
  );
}
