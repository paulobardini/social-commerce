// Drawer com a tabela de clientes-chave em risco + "Cobrar plano do rep" por linha.
import { useMemo, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCockpit } from "@/cockpit/contexts/CockpitContext";
import { classificarTudo } from "@/cockpit/lib/classificar";
import { clientesChaveRisco } from "@/cockpit/lib/decisoes";
import { fmtBRLc } from "@/cockpit/styles/tokens";
import { SolicitarPlanoModal } from "@/cockpit/components/decisoes/SolicitarPlanoModal";
import type { PlanoTipo } from "@/lib/planos";

export function ClientesRiscoDrawer({ open, onOpenChange }: { open: boolean; onOpenChange: (b: boolean) => void }) {
  const { seed, escopo, range, diasAtivo, diasPerdido } = useCockpit();

  const classificadas = useMemo(
    () => classificarTudo(seed.contas, seed.pedidos, range, diasAtivo, diasPerdido, seed.hoje),
    [seed, range, diasAtivo, diasPerdido],
  );
  const risco = useMemo(
    () => clientesChaveRisco(classificadas, seed, escopo, diasPerdido),
    [classificadas, seed, escopo, diasPerdido],
  );

  const [plano, setPlano] = useState<{
    open: boolean; tipo: PlanoTipo; repId: string; repNome: string;
    contexto: { clienteId?: string; clienteNome?: string; valor?: number };
    sugestaoNota: string;
  }>({ open: false, tipo: "cliente_risco", repId: "", repNome: "", contexto: {}, sugestaoNota: "" });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Clientes-chave em risco</SheetTitle>
        </SheetHeader>
        <p className="text-[11px] nx-muted mt-1">
          Clientes classe A prestes a virar perdidos. Cobre o plano do rep para agir antes.
        </p>

        {risco.length === 0 ? (
          <p className="text-xs nx-muted mt-4">Nenhum cliente-chave em risco no momento.</p>
        ) : (
          <table className="w-full text-xs mt-4">
            <thead className="text-[10px] uppercase nx-muted border-b border-[#E7E9EE]">
              <tr>
                <th className="text-left py-2">Cliente</th>
                <th className="text-left">Rep</th>
                <th className="text-right">Valor 12m</th>
                <th className="text-right">Dias p/ perdido</th>
                <th className="text-right pr-2">Ação</th>
              </tr>
            </thead>
            <tbody>
              {risco.map(item => (
                <tr key={item.cliente.conta.id} className="border-b border-[#F1F3F8]">
                  <td className="py-2 nx-text font-medium">{item.cliente.conta.razao}</td>
                  <td className="nx-muted">{item.repNome}</td>
                  <td className="text-right nx-num">{fmtBRLc(item.valor12m)}</td>
                  <td className="text-right">
                    <Badge className={item.diasRestantes <= 7 ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}>
                      {item.diasRestantes}d
                    </Badge>
                  </td>
                  <td className="text-right pr-2">
                    <Button size="sm" variant="outline" className="h-7 text-[10px]"
                      onClick={() => setPlano({
                        open: true, tipo: "cliente_risco",
                        repId: item.cliente.conta.repId, repNome: item.repNome,
                        contexto: { clienteId: item.cliente.conta.id, clienteNome: item.cliente.conta.razao, valor: item.valor12m },
                        sugestaoNota: `${item.cliente.conta.razao} · R$ ${(item.valor12m/1000).toFixed(0)}k · ${item.diasRestantes}d para virar perdido — qual o plano?`,
                      })}>
                      Cobrar plano do rep
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <SolicitarPlanoModal
          open={plano.open}
          onOpenChange={b => setPlano(p => ({ ...p, open: b }))}
          tipo={plano.tipo}
          repId={plano.repId}
          repNome={plano.repNome}
          contexto={plano.contexto}
          sugestaoNota={plano.sugestaoNota}
        />
      </SheetContent>
    </Sheet>
  );
}
