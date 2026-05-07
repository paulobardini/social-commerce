import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronRight, LayoutList, KanbanSquare, Search, ShoppingCart } from "lucide-react";
import { mockClientes360, type Pedido, type PedidoStatus, type PedidoOrigem } from "@/data/mockCRM360";
import { usePedidos } from "@/contexts/PedidosContext";
import { PedidoDetalheModal } from "@/components/vendedor/PedidoDetalheModal";

const STATUS_LABEL: Record<PedidoStatus, string> = {
  confirmado: "Confirmado",
  em_producao: "Em produção",
  faturado: "Faturado",
  em_transporte: "Em transporte",
  entregue: "Entregue",
  cancelado: "Cancelado",
  enviado: "Enviado",
};

const STATUS_COLOR: Record<PedidoStatus, string> = {
  confirmado: "bg-blue-500/15 text-blue-600 border-blue-500/30",
  em_producao: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  faturado: "bg-purple-500/15 text-purple-600 border-purple-500/30",
  em_transporte: "bg-cyan-500/15 text-cyan-600 border-cyan-500/30",
  entregue: "bg-green-500/15 text-green-600 border-green-500/30",
  cancelado: "bg-red-500/15 text-red-600 border-red-500/30",
  enviado: "bg-cyan-500/15 text-cyan-600 border-cyan-500/30",
};

const ORIGEM_LABEL: Record<PedidoOrigem, string> = {
  orcamento: "Orçamento",
  marketplace: "Marketplace",
  manual: "Manual",
};
const ORIGEM_COLOR: Record<PedidoOrigem, string> = {
  orcamento: "bg-blue-500/15 text-blue-600 border-blue-500/30",
  marketplace: "bg-purple-500/15 text-purple-600 border-purple-500/30",
  manual: "bg-amber-500/15 text-amber-600 border-amber-500/30",
};

const PAG_COLOR: Record<string, string> = {
  pago: "bg-green-500/15 text-green-700",
  pendente: "bg-muted text-muted-foreground",
  parcial: "bg-amber-500/15 text-amber-700",
  atrasado: "bg-red-500/15 text-red-700",
};

const KANBAN_COLS: PedidoStatus[] = ["confirmado", "em_producao", "faturado", "em_transporte", "entregue"];

export default function PedidosHub() {
  const navigate = useNavigate();
  const { pedidos } = usePedidos();
  const [params, setParams] = useSearchParams();

  const [view, setView] = useState<"lista" | "kanban">("lista");
  const [busca, setBusca] = useState("");
  const [origem, setOrigem] = useState<"todas" | PedidoOrigem>("todas");
  const [statusFiltro, setStatusFiltro] = useState<"todos" | PedidoStatus>("todos");
  const [marca, setMarca] = useState<string>("todas");
  const [openId, setOpenId] = useState<string | null>(null);

  const clienteFiltro = params.get("cliente");

  const clientesById = useMemo(() => Object.fromEntries(mockClientes360.map((c) => [c.id, c])), []);
  const marcas = useMemo(() => Array.from(new Set(pedidos.map((p) => p.marca).filter(Boolean) as string[])).sort(), [pedidos]);

  const filtrados = useMemo(() => {
    return pedidos.filter((p) => {
      if (clienteFiltro && p.clienteId !== clienteFiltro) return false;
      if (origem !== "todas" && p.origemTipo !== origem) return false;
      if (statusFiltro !== "todos" && p.status !== statusFiltro) return false;
      if (marca !== "todas" && p.marca !== marca) return false;
      if (busca) {
        const q = busca.toLowerCase();
        const cli = clientesById[p.clienteId]?.nomeFantasia.toLowerCase() ?? "";
        if (!p.numero.toLowerCase().includes(q) && !cli.includes(q)) return false;
      }
      return true;
    });
  }, [pedidos, busca, origem, statusFiltro, marca, clienteFiltro, clientesById]);

  const kpis = useMemo(() => {
    const ativo = pedidos.filter((p) => !["entregue", "cancelado"].includes(p.status));
    return {
      emProducao: pedidos.filter((p) => p.status === "em_producao").length,
      faturado: pedidos.filter((p) => p.status === "faturado").length,
      transporte: pedidos.filter((p) => p.status === "em_transporte").length,
      entregueMes: pedidos.filter((p) => p.status === "entregue" && p.data.includes("/04/2026")).length,
      valorAtivo: ativo.reduce((s, p) => s + p.valor, 0),
    };
  }, [pedidos]);

  const clienteNome = clienteFiltro ? clientesById[clienteFiltro]?.nomeFantasia : null;
  const escopo = params.get("escopo") === "empresa" ? "empresa" : "vendedor";

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-[1400px] mx-auto">
      <div className="flex items-center text-xs text-muted-foreground gap-1.5">
        {escopo === "empresa" ? (
          <>
            <button onClick={() => navigate("/vendedor/dashboard-gerencial")} className="hover:text-foreground">Gestão</button>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium">Pedidos da Empresa</span>
          </>
        ) : (
          <>
            <button onClick={() => navigate("/vendedor/360")} className="hover:text-foreground">Nextil 360</button>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium">Meus Pedidos</span>
          </>
        )}
      </div>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <ShoppingCart className="h-6 w-6 text-[hsl(191,100%,50%)]" />
            {escopo === "empresa" ? "Pedidos da Empresa" : "Meus Pedidos"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {escopo === "empresa"
              ? "Visão consolidada de todos os pedidos da empresa, por vendedor, marca e origem."
              : "Seus pedidos da carteira, vindos de orçamentos, marketplace ou lançados manualmente."}
          </p>
          {clienteFiltro && (
            <div className="mt-2 inline-flex items-center gap-2 text-xs bg-muted px-2 py-1 rounded">
              Filtrando por: <strong>{clienteNome}</strong>
              <button onClick={() => { params.delete("cliente"); setParams(params); }} className="text-muted-foreground hover:text-foreground">×</button>
            </div>
          )}
        </div>
        <div className="flex gap-1 bg-muted p-1 rounded-lg">
          <button
            onClick={() => setView("lista")}
            className={`px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 ${view === "lista" ? "bg-background shadow" : "text-muted-foreground"}`}
          >
            <LayoutList className="h-3.5 w-3.5" /> Lista
          </button>
          <button
            onClick={() => setView("kanban")}
            className={`px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 ${view === "kanban" ? "bg-background shadow" : "text-muted-foreground"}`}
          >
            <KanbanSquare className="h-3.5 w-3.5" /> Kanban
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Kpi label="Em produção" value={kpis.emProducao} accent="amber" />
        <Kpi label="Faturados" value={kpis.faturado} accent="purple" />
        <Kpi label="Em transporte" value={kpis.transporte} accent="cyan" />
        <Kpi label="Entregues no mês" value={kpis.entregueMes} accent="green" />
        <Kpi label="Valor ativo" value={`R$ ${(kpis.valorAtivo / 1000).toFixed(1)}k`} accent="blue" />
      </div>

      <Card className="p-3 flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por nº ou cliente" className="pl-8 h-9" />
        </div>
        <ChipGroup
          value={origem}
          onChange={(v) => setOrigem(v as any)}
          options={[
            { v: "todas", l: "Todas origens" },
            { v: "orcamento", l: "Orçamento" },
            { v: "marketplace", l: "Marketplace" },
            { v: "manual", l: "Manual" },
          ]}
        />
        <Select value={statusFiltro} onValueChange={(v) => setStatusFiltro(v as any)}>
          <SelectTrigger className="h-9 w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos status</SelectItem>
            {KANBAN_COLS.concat(["cancelado"]).map((s) => (
              <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={marca} onValueChange={setMarca}>
          <SelectTrigger className="h-9 w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas marcas</SelectItem>
            {marcas.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
          </SelectContent>
        </Select>
      </Card>

      {view === "lista" ? (
        <ListaView pedidos={filtrados} clientesById={clientesById} onOpen={setOpenId} />
      ) : (
        <KanbanView pedidos={filtrados} clientesById={clientesById} onOpen={setOpenId} />
      )}

      {openId && <PedidoDetalheModal pedidoId={openId} onClose={() => setOpenId(null)} />}
    </div>
  );
}

function Kpi({ label, value, accent }: { label: string; value: string | number; accent: string }) {
  const acc: Record<string, string> = {
    amber: "border-l-amber-500",
    purple: "border-l-purple-500",
    cyan: "border-l-cyan-500",
    green: "border-l-green-500",
    blue: "border-l-blue-500",
  };
  return (
    <Card className={`p-3 border-l-4 ${acc[accent]}`}>
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-xl font-semibold mt-1">{value}</p>
    </Card>
  );
}

function ChipGroup({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { v: string; l: string }[] }) {
  return (
    <div className="flex gap-1 bg-muted/50 rounded-lg p-1">
      {options.map((o) => (
        <button
          key={o.v}
          onClick={() => onChange(o.v)}
          className={`px-2.5 py-1 rounded text-xs font-medium ${value === o.v ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          {o.l}
        </button>
      ))}
    </div>
  );
}

function ListaView({ pedidos, clientesById, onOpen }: { pedidos: Pedido[]; clientesById: Record<string, any>; onOpen: (id: string) => void }) {
  if (pedidos.length === 0) return <Empty />;
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="text-left px-3 py-2.5">Nº</th>
              <th className="text-left px-3 py-2.5">Cliente</th>
              <th className="text-left px-3 py-2.5">Marca</th>
              <th className="text-left px-3 py-2.5">Origem</th>
              <th className="text-right px-3 py-2.5">Peças</th>
              <th className="text-right px-3 py-2.5">Valor</th>
              <th className="text-left px-3 py-2.5">Status</th>
              <th className="text-left px-3 py-2.5">Pagamento</th>
              <th className="text-left px-3 py-2.5">Previsão</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map((p) => {
              const ot = (p.origemTipo ?? "manual") as PedidoOrigem;
              const ps = (p.pagamento?.status ?? "pendente") as string;
              return (
                <tr key={p.id} onClick={() => onOpen(p.id)} className="border-t border-border hover:bg-muted/40 cursor-pointer">
                  <td className="px-3 py-2.5 font-mono text-xs">{p.numero}</td>
                  <td className="px-3 py-2.5 font-medium">{clientesById[p.clienteId]?.nomeFantasia ?? "—"}</td>
                  <td className="px-3 py-2.5 text-muted-foreground">{p.marca ?? "—"}</td>
                  <td className="px-3 py-2.5">
                    <Badge variant="outline" className={`${ORIGEM_COLOR[ot]} text-[10px]`}>{ORIGEM_LABEL[ot]}</Badge>
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{p.pecas ?? "—"}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums font-medium">R$ {p.valor.toLocaleString("pt-BR")}</td>
                  <td className="px-3 py-2.5">
                    <Badge variant="outline" className={`${STATUS_COLOR[p.status as PedidoStatus]} text-[10px]`}>{STATUS_LABEL[p.status as PedidoStatus]}</Badge>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${PAG_COLOR[ps]}`}>{ps}</span>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-muted-foreground">{p.previsaoEntrega ?? "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function KanbanView({ pedidos, clientesById, onOpen }: { pedidos: Pedido[]; clientesById: Record<string, any>; onOpen: (id: string) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
      {KANBAN_COLS.map((col) => {
        const items = pedidos.filter((p) => p.status === col);
        const total = items.reduce((s, p) => s + p.valor, 0);
        return (
          <div key={col} className="bg-secondary/70 rounded-lg p-2.5 flex flex-col min-h-[400px]">
            <div className="flex items-center justify-between mb-2 px-1">
              <div>
                <p className="text-xs font-semibold">{STATUS_LABEL[col]}</p>
                <p className="text-[10px] text-muted-foreground">{items.length} · R$ {(total / 1000).toFixed(1)}k</p>
              </div>
              <Badge variant="outline" className={`${STATUS_COLOR[col]} text-[10px]`}>{items.length}</Badge>
            </div>
            <div className="space-y-2 flex-1 overflow-y-auto">
              {items.map((p) => {
                const ot = (p.origemTipo ?? "manual") as PedidoOrigem;
                return (
                  <Card key={p.id} onClick={() => onOpen(p.id)} className="p-2.5 cursor-pointer hover:shadow-sm">
                    <div className="flex items-start justify-between gap-1.5 mb-1">
                      <p className="text-xs font-medium truncate">{clientesById[p.clienteId]?.nomeFantasia}</p>
                      <Badge variant="outline" className={`${ORIGEM_COLOR[ot]} text-[9px] shrink-0`}>{ORIGEM_LABEL[ot]}</Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{p.marca} · {p.pecas} pçs</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <p className="text-sm font-semibold">R$ {p.valor.toLocaleString("pt-BR")}</p>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${PAG_COLOR[p.pagamento?.status ?? "pendente"]}`}>
                        {p.pagamento?.status ?? "pendente"}
                      </span>
                    </div>
                  </Card>
                );
              })}
              {items.length === 0 && <p className="text-[11px] text-muted-foreground text-center py-6">Vazio</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Empty() {
  return (
    <Card className="p-12 text-center">
      <ShoppingCart className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
      <p className="font-medium">Nenhum pedido encontrado</p>
      <p className="text-sm text-muted-foreground">Ajuste os filtros para ver outros pedidos.</p>
    </Card>
  );
}

export { STATUS_LABEL, STATUS_COLOR, ORIGEM_LABEL, ORIGEM_COLOR, PAG_COLOR };
