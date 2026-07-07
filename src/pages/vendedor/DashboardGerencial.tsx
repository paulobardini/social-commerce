// Painel Comercial · Gestor — Posto de Comando (v2)
// 5 abas: Decisões (padrão) · Time & Metas · Carteira · Atendimento · Produto
// Escopo hierárquico (Nacional/Regional) e MARCA como dimensão principal.
import { useSearchParams } from "react-router-dom";
import { CockpitTopbar } from "@/cockpit/components/CockpitTopbar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DecisoesTab } from "@/cockpit/components/decisoes/DecisoesTab";
import { TimeMetasTab } from "@/cockpit/components/time/TimeMetasTab";
import { CarteiraTab } from "@/cockpit/components/carteira/CarteiraTab";
import { AtendimentoTab } from "@/cockpit/components/atendimento/AtendimentoTab";
import { ProdutoTab } from "@/cockpit/components/produto/ProdutoTab";

type TabKey = "decisoes" | "time" | "carteira" | "atendimento" | "produto";
const validTabs: TabKey[] = ["decisoes", "time", "carteira", "atendimento", "produto"];

export default function DashboardGerencial() {
  const [params, setParams] = useSearchParams();
  const rawTab = params.get("tab") as TabKey | null;
  const tab: TabKey = rawTab && validTabs.includes(rawTab) ? rawTab : "decisoes";

  const setTab = (t: TabKey) => {
    const p = new URLSearchParams(params);
    p.set("tab", t);
    setParams(p, { replace: true });
  };

  // Período some apenas na aba Decisões (fila = agora)
  const showPeriod = tab !== "decisoes";

  return (
    <div className="nx-shell min-h-screen">
      <CockpitTopbar title="Painel comercial · Gestor" showPeriod={showPeriod} showEscopo />
      <div className="px-4 md:px-6 py-4 space-y-4">
        <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)} className="space-y-4">
          <TabsList className="bg-white border border-[#E7E9EE] p-1 h-auto flex-wrap">
            <TabsTrigger value="decisoes"    className="text-xs data-[state=active]:bg-[#2D3A8C] data-[state=active]:text-white">Decisões</TabsTrigger>
            <TabsTrigger value="time"        className="text-xs data-[state=active]:bg-[#2D3A8C] data-[state=active]:text-white">Time &amp; Metas</TabsTrigger>
            <TabsTrigger value="carteira"    className="text-xs data-[state=active]:bg-[#2D3A8C] data-[state=active]:text-white">Carteira</TabsTrigger>
            <TabsTrigger value="atendimento" className="text-xs data-[state=active]:bg-[#2D3A8C] data-[state=active]:text-white">Atendimento</TabsTrigger>
            <TabsTrigger value="produto"     className="text-xs data-[state=active]:bg-[#2D3A8C] data-[state=active]:text-white">Produto</TabsTrigger>
          </TabsList>

          <TabsContent value="decisoes"    className="mt-0"><DecisoesTab /></TabsContent>
          <TabsContent value="time"        className="mt-0"><TimeMetasTab /></TabsContent>
          <TabsContent value="carteira"    className="mt-0"><CarteiraTab /></TabsContent>
          <TabsContent value="atendimento" className="mt-0"><AtendimentoTab /></TabsContent>
          <TabsContent value="produto"     className="mt-0"><ProdutoTab /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
