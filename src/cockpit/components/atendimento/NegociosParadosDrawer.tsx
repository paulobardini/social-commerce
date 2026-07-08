// Drawer com a tabela de negócios grandes parados (>= R$ 20k, >= 7d sem movimento).
import { useMemo } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useCockpit } from "@/cockpit/contexts/CockpitContext";
import { negociosGrandesParados } from "@/cockpit/lib/decisoes";
import { fmtBRL } from "@/cockpit/styles/tokens";

export function NegociosParadosDrawer({ open, onOpenChange }: { open: boolean; onOpenChange: (b: boolean) => void }) {
  const { seed, escopo } = useCockpit();
  const navigate = useNavigate();
  const negocios = useMemo(() => negociosGrandesParados(seed, escopo), [seed, escopo]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Negócios grandes parados</SheetTitle>
        </SheetHeader>
        <p className="text-[11px] nx-muted mt-1">Oportunidades acima de R$ 20k sem movimento há ≥ 7 dias.</p>

        {negocios.length === 0 ? (
          <p className="text-xs nx-muted mt-4">Nenhum negócio grande parado.</p>
        ) : (
          <table className="w-full text-xs mt-4">
            <thead className="text-[10px] uppercase nx-muted border-b border-[#E7E9EE]">
              <tr>
                <th className="text-left py-2">Oportunidade</th>
                <th className="text-left">Cliente · Rep</th>
                <th className="text-right">Valor</th>
                <th className="text-right">Parado há</th>
                <th className="text-right pr-2"></th>
              </tr>
            </thead>
            <tbody>
              {negocios.map(n => (
                <tr key={n.op.id} className="border-b border-[#F1F3F8]">
                  <td className="py-2 nx-text font-medium">{n.op.id}</td>
                  <td className="nx-muted">{n.clienteNome} · {n.repNome}</td>
                  <td className="text-right nx-num">{fmtBRL(n.op.valor)}</td>
                  <td className="text-right"><Badge className="bg-amber-100 text-amber-700">{n.diasParado}d</Badge></td>
                  <td className="text-right pr-2">
                    <Button size="sm" variant="outline" className="h-7 text-[10px]"
                      onClick={() => { onOpenChange(false); navigate(`/vendedor/oportunidades/${n.op.id}`); }}>
                      Ver negociação
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </SheetContent>
    </Sheet>
  );
}
