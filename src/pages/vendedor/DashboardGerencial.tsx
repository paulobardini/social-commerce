// Painel comercial · Gestor — Posto de Leitura (v3).
// Cada pilar é uma página própria (rota /gestor/painel/:tab), acessível pelo menu lateral.
import { Navigate, useParams } from "react-router-dom";
import { CockpitTopbar } from "@/cockpit/components/CockpitTopbar";
import { CarteiraTab } from "@/cockpit/components/carteira/CarteiraTab";
import { AtendimentoTab } from "@/cockpit/components/atendimento/AtendimentoTab";
import { ProdutoTab } from "@/cockpit/components/produto/ProdutoTab";
import { DiretoriaTab } from "@/cockpit/components/diretoria/DiretoriaTab";
import { EquipeTab } from "@/cockpit/components/equipe/EquipeTab";
import { MarketingTab } from "@/cockpit/components/marketing/MarketingTab";

type TabKey = "diretoria" | "carteira" | "atendimento" | "produto" | "equipe" | "marketing";

const TITLES: Record<TabKey, string> = {
  diretoria: "Dashboard Diretoria",
  carteira: "Dashboard Carteira",
  atendimento: "Dashboard Atendimento",
  produto: "Dashboard Produto",
  equipe: "Dashboard Equipe",
  marketing: "Dashboard Marketing",
};

export default function DashboardGerencial() {
  const { tab } = useParams<{ tab: string }>();
  const key = tab as TabKey;

  if (!key || !(key in TITLES)) return <Navigate to="/gestor/painel/diretoria" replace />;

  return (
    <div className="nx-shell min-h-screen">
      <CockpitTopbar title={TITLES[key]} showPeriod showEscopo backTo={key === "diretoria" ? undefined : "/gestor/painel/diretoria"} />
      <div className="px-4 md:px-6 py-4 space-y-4">
        {key === "diretoria" && <DiretoriaTab />}
        {key === "carteira" && <CarteiraTab />}
        {key === "atendimento" && <AtendimentoTab />}
        {key === "produto" && <ProdutoTab />}
        {key === "equipe" && <EquipeTab />}
        {key === "marketing" && <MarketingTab />}
      </div>
    </div>
  );
}

