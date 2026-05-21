import { useState, useEffect } from "react";
import { AtendimentoTimeline } from "@/components/atendimento/AtendimentoTimeline";
import { TicketDrawer } from "@/components/atendimento/TicketDrawer";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { type Ticket, loadTickets, loadFunis } from "@/data/mockAtendimento";

interface Props {
  clienteId: string;
}

export function ClienteAtendimentoTab({ clienteId }: Props) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState<Ticket | null>(null);
  const funis = loadFunis();

  useEffect(() => {
    setTickets(loadTickets().filter(t => t.clienteId === clienteId));
  }, [clienteId, refreshKey]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-heading font-semibold">Histórico de atendimento</h3>
          <p className="text-xs text-muted-foreground">{tickets.length} ticket(s) deste cliente</p>
        </div>
        <Button size="sm" onClick={() => { setSelected(null); setDrawerOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Novo ticket
        </Button>
      </div>

      <AtendimentoTimeline
        tickets={tickets}
        funis={funis}
        onTicketClick={(t) => { setSelected(t); setDrawerOpen(true); }}
        compact
      />

      <TicketDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        ticket={selected}
        defaultClienteId={clienteId}
        onSaved={() => setRefreshKey(k => k + 1)}
      />
    </div>
  );
}
