// Representantes — hub do gestor sobre o time.
// Absorve Time & Metas (aba padrão: Visão geral com desvio table + rankings + Gestão de metas)
// e Planos de recuperação (loop de cobrança).
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CockpitTopbar } from "@/cockpit/components/CockpitTopbar";
import { TimeMetasTab } from "@/cockpit/components/time/TimeMetasTab";
import { PlanosEmAndamento } from "@/cockpit/components/decisoes/PlanosEmAndamento";
import { usePlanos } from "@/contexts/PlanosContext";

type TabKey = "visao" | "planos";

export default function RepresentantesPage() {
  const [tab, setTab] = useState<TabKey>("visao");
  const { planos } = usePlanos();
  const escalados = planos.filter(p => p.status === "escalado").length;

  return (
    <div className="nx-shell min-h-screen">
      <CockpitTopbar title="Representantes" showPeriod showEscopo />
      <div className="px-4 md:px-6 py-4 space-y-4">
        <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)} className="space-y-4">
          <TabsList className="bg-white border border-[#E7E9EE] p-1 h-auto">
            <TabsTrigger value="visao" className="text-xs data-[state=active]:bg-[#2D3A8C] data-[state=active]:text-white">
              Visão geral &amp; metas
            </TabsTrigger>
            <TabsTrigger value="planos" className="text-xs data-[state=active]:bg-[#2D3A8C] data-[state=active]:text-white relative">
              Planos de recuperação
              {escalados > 0 && (
                <span className="ml-2 h-4 min-w-5 px-1.5 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center leading-none">
                  {escalados}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="visao" className="mt-0"><TimeMetasTab /></TabsContent>
          <TabsContent value="planos" className="mt-0"><PlanosEmAndamento /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
