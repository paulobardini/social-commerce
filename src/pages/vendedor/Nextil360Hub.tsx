import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { ShoppingCart, Users, ArrowRight, Sparkles } from "lucide-react";
import { mockClientes360 } from "@/data/mockCRM360";
import { usePedidos } from "@/contexts/PedidosContext";

export default function Nextil360Hub() {
  const navigate = useNavigate();
  const { pedidos } = usePedidos();

  const ativos = pedidos.filter((p) => !["entregue", "cancelado"].includes(p.status)).length;
  const emProducao = pedidos.filter((p) => p.status === "em_producao").length;
  const faturamentoMes = pedidos
    .filter((p) => p.data.includes("/04/2026") && p.status !== "cancelado")
    .reduce((s, p) => s + p.valor, 0);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <header>
        <div className="flex items-center gap-2 text-[hsl(191,100%,50%)] text-sm font-medium mb-1">
          <Sparkles className="h-4 w-4" />
          Nextil 360
        </div>
        <h1 className="text-2xl font-semibold">Visão consolidada da operação</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Hub central com pedidos, relacionamento e inteligência da carteira.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ModuleCard
          icon={<ShoppingCart className="h-5 w-5" />}
          title="Pedidos"
          subtitle="Acompanhe todos os pedidos por status, origem e cliente"
          onClick={() => navigate("/vendedor/360/pedidos")}
          stats={[
            { label: "Ativos", value: ativos.toString() },
            { label: "Em produção", value: emProducao.toString() },
            { label: "Faturamento (mês)", value: `R$ ${(faturamentoMes / 1000).toFixed(1)}k` },
          ]}
        />

        <ModuleCard
          icon={<Users className="h-5 w-5" />}
          title="Cliente 360"
          subtitle="Ficha completa de cada cliente da carteira"
          onClick={() => navigate("/vendedor/clientes")}
          stats={[
            { label: "Clientes", value: mockClientes360.length.toString() },
            { label: "Ativos", value: mockClientes360.filter((c) => c.status === "ativo").length.toString() },
            { label: "Quentes", value: mockClientes360.filter((c) => c.temperaturaComercial === "quente").length.toString() },
          ]}
        />
      </div>
    </div>
  );
}

function ModuleCard({
  icon,
  title,
  subtitle,
  stats,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  stats: { label: string; value: string }[];
  onClick: () => void;
}) {
  return (
    <Card
      onClick={onClick}
      className="p-5 cursor-pointer hover:shadow-md hover:border-[hsl(191,100%,50%)]/40 transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-[hsl(191,100%,50%)]/10 text-[hsl(191,100%,50%)] flex items-center justify-center">
            {icon}
          </div>
          <div>
            <h3 className="font-semibold">{title}</h3>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
      </div>
      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border">
        {stats.map((s) => (
          <div key={s.label}>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{s.label}</p>
            <p className="text-lg font-semibold mt-0.5">{s.value}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
