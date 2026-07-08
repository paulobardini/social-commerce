// Painel comercial · Gestor — Posto de Leitura (v3).
// Estrutura: faixa de saúde + 3 abas (Carteira · Atendimento · Produto).
// Cada aba tem 3 camadas: Insights → KPIs → Gráficos.
// Aprovações e Time & Metas migraram para submenus próprios.
import { useSearchParams } from "react-router-dom";
import { CockpitTopbar } from "@/cockpit/components/CockpitTopbar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CarteiraTab } from "@/cockpit/components/carteira/CarteiraTab";
import { AtendimentoTab } from "@/cockpit/components/atendimento/AtendimentoTab";
import { ProdutoTab } from "@/cockpit/components/produto/ProdutoTab";

type TabKey = "carteira" | "atendimento" | "produto";
const validTabs: TabKey[] = ["carteira", "atendimento", "produto"];

export default function DashboardGerencial() {
  const [params, setParams] = useSearchParams();
  const rawTab = params.get("tab") as TabKey | null;
  const tab: TabKey = rawTab && validTabs.includes(rawTab) ? rawTab : "carteira";

  const setTab = (t: TabKey) => {
    const p = new URLSearchParams(params);
    p.set("tab", t);
    setParams(p, { replace: true });
  };

  return (
    <div className="nx-shell min-h-screen">
      <CockpitTopbar title="Painel comercial · Gestor" showPeriod showEscopo />
      <div className="px-4 md:px-6 py-4 space-y-4">
        <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)} className="space-y-4">
          <TabsList className="bg-white border border-[#E7E9EE] p-1 h-auto overflow-x-auto flex-nowrap">
            <TabsTrigger value="carteira"    className="text-xs data-[state=active]:bg-[#2D3A8C] data-[state=active]:text-white">Carteira</TabsTrigger>
            <TabsTrigger value="atendimento" className="text-xs data-[state=active]:bg-[#2D3A8C] data-[state=active]:text-white">Atendimento</TabsTrigger>
            <TabsTrigger value="produto"     className="text-xs data-[state=active]:bg-[#2D3A8C] data-[state=active]:text-white">Produto</TabsTrigger>
          </TabsList>

          <TabsContent value="carteira"    className="mt-0"><CarteiraTab /></TabsContent>
          <TabsContent value="atendimento" className="mt-0"><AtendimentoTab /></TabsContent>
          <TabsContent value="produto"     className="mt-0"><ProdutoTab /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
