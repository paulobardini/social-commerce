import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FunilConfigModal } from "@/components/vendedor/FunilConfigModal";
import { MetasModal } from "@/components/vendedor/MetasModal";
import { useCockpit } from "@/cockpit/contexts/CockpitContext";
import { Settings, Kanban, Bell, User, Zap, Target, MessageSquare, Gauge, AlertTriangle, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function VendedorConfiguracoes() {
  const [showFunil, setShowFunil] = useState(false);
  const [showMeta, setShowMeta] = useState(false);
  const navigate = useNavigate();

  const { diasAtivo, diasPerdido, setDiasAtivo, setDiasPerdido, resetClassificacao } = useCockpit();
  const [da, setDa] = useState(diasAtivo);
  const [dp, setDp] = useState(diasPerdido);

  const sections = [
    { icon: Kanban, title: "Funil de oportunidades", desc: "Configure as etapas do seu pipeline comercial", action: () => setShowFunil(true), btnLabel: "Configurar" },
    { icon: Zap, title: "Automações de followup", desc: "Crie sequências de tarefas disparadas pelas etapas do funil", action: () => navigate("/vendedor/configuracoes/automacoes"), btnLabel: "Configurar" },
    { icon: Target, title: "Metas", desc: "Defina sua meta mensal de vendas exibida no Painel", action: () => setShowMeta(true), btnLabel: "Configurar" },
    { icon: MessageSquare, title: "Templates de mensagem", desc: "Modelos rápidos com variáveis para usar no chat do WhatsApp", action: () => navigate("/vendedor/configuracoes/templates"), btnLabel: "Gerenciar" },
    { icon: Bell, title: "Notificações", desc: "Gerencie alertas e lembretes do sistema", action: undefined, btnLabel: "Em breve", disabled: true },
    { icon: User, title: "Perfil do vendedor", desc: "Edite suas informações e preferências", action: undefined, btnLabel: "Em breve", disabled: true },
  ];

  function salvar() {
    setDiasAtivo(da);
    setDiasPerdido(dp);
    toast.success("Classificação atualizada. Carteira reclassificada.");
  }

  return (
    <>
      <div className="p-6 max-w-[800px] mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-heading font-bold text-foreground flex items-center gap-2">
            <Settings className="h-5 w-5" /> Configurações
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Personalize sua experiência no NEXTIL 360</p>
        </div>

        {/* Cockpit comercial */}
        <Card className="border border-border">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Gauge className="h-5 w-5 text-accent" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">Cockpit comercial — classificação de carteira</p>
                <p className="text-xs text-muted-foreground">Define quando um cliente é considerado Ativo, Inativo ou Perdido com base na recência do último pedido.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-14">
              <div>
                <Label htmlFor="diasAtivo" className="text-xs">Dias para considerar Ativo</Label>
                <Input id="diasAtivo" type="number" min={7} max={365} value={da} onChange={(e) => setDa(Number(e.target.value))} className="h-9 mt-1" />
                <p className="text-[10px] text-muted-foreground mt-1">Padrão: 60 dias</p>
              </div>
              <div>
                <Label htmlFor="diasPerdido" className="text-xs">Dias para considerar Perdido</Label>
                <Input id="diasPerdido" type="number" min={30} max={730} value={dp} onChange={(e) => setDp(Number(e.target.value))} className="h-9 mt-1" />
                <p className="text-[10px] text-muted-foreground mt-1">Padrão: 180 dias</p>
              </div>
            </div>

            <div className="pl-14">
              <p className="text-[11px] text-muted-foreground">
                <span className="font-semibold">Inativo:</span> entre {da + 1} e {dp} dias sem comprar.
              </p>
            </div>

            <div className="ml-14 p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-[11px] text-amber-800">
                Alterar esses valores reclassifica toda a carteira em ambos os painéis (Gestor e Vendedor). A mudança é imediata.
              </p>
            </div>

            <div className="pl-14 flex gap-2">
              <Button size="sm" onClick={salvar}>Salvar</Button>
              <Button size="sm" variant="outline" onClick={() => { resetClassificacao(); setDa(60); setDp(180); toast.success("Padrões restaurados"); }}>Restaurar padrões</Button>
            </div>
          </CardContent>
        </Card>

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
      <MetasModal open={showMeta} onOpenChange={setShowMeta} />
    </>
  );
}
