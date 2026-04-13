import { useState } from "react";
import { VendedorLayout } from "@/components/vendedor/VendedorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FunilConfigModal } from "@/components/vendedor/FunilConfigModal";
import { Settings, Kanban, Bell, User } from "lucide-react";

export default function VendedorConfiguracoes() {
  const [showFunil, setShowFunil] = useState(false);

  const sections = [
    { icon: Kanban, title: "Funil de oportunidades", desc: "Configure as etapas do seu pipeline comercial", action: () => setShowFunil(true), btnLabel: "Configurar" },
    { icon: Bell, title: "Notificações", desc: "Gerencie alertas e lembretes do sistema", action: undefined, btnLabel: "Em breve", disabled: true },
    { icon: User, title: "Perfil do vendedor", desc: "Edite suas informações e preferências", action: undefined, btnLabel: "Em breve", disabled: true },
  ];

  return (
    <VendedorLayout>
      <div className="p-6 max-w-[800px] mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-heading font-bold text-foreground flex items-center gap-2">
            <Settings className="h-5 w-5" /> Configurações
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Personalize sua experiência no NEXTIL 360</p>
        </div>

        <div className="space-y-4">
          {sections.map(s => (
            <Card key={s.title} className="border border-border">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <s.icon className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{s.title}</p>
                    <p className="text-xs text-muted-foreground">{s.desc}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={s.action} disabled={s.disabled as boolean}>
                  {s.btnLabel}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <FunilConfigModal open={showFunil} onOpenChange={setShowFunil} />
    </VendedorLayout>
  );
}
