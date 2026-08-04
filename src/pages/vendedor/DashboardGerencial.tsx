// Painel comercial · Gestor — Posto de Leitura (v3).
// Cada pilar é uma página própria (rota /gestor/painel/:tab), acessível pelo menu lateral.
import { Navigate, useParams } from "react-router-dom";
import { CockpitTopbar } from "@/cockpit/components/CockpitTopbar";
import { CarteiraTab } from "@/cockpit/components/carteira/CarteiraTab";
import { AtendimentoTab } from "@/cockpit/components/atendimento/AtendimentoTab";
import { ProdutoTab } from "@/cockpit/components/produto/ProdutoTab";

type TabKey = "carteira" | "atendimento" | "produto";

const TITLES: Record<TabKey, string> = {
  carteira: "Dashboard Carteira",
  atendimento: "Dashboard Atendimento",
  produto: "Dashboard Produto",
};

export default function DashboardGerencial() {
  const { tab } = useParams<{ tab: string }>();
  const key = tab as TabKey;

  if (!key || !(key in TITLES)) return <Navigate to="/gestor/painel/carteira" replace />;

  return (
    <div className="nx-shell min-h-screen">
      <CockpitTopbar title={TITLES[key]} showPeriod showEscopo />
      <div className="px-4 md:px-6 py-4 space-y-4">
        {key === "carteira" && <CarteiraTab />}
        {key === "atendimento" && <AtendimentoTab />}
        {key === "produto" && <ProdutoTab />}
      </div>
    </div>
  );
}
