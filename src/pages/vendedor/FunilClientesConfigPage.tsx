import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft, Plus, GripVertical, Trash2, Check, Eye,
} from "lucide-react";
import { etapasClienteKanbanDefault, type EtapaClienteKanban } from "@/data/mockRepresentantes";
import { useToast } from "@/hooks/use-toast";

export default function FunilClientesConfigPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [etapas, setEtapas] = useState<EtapaClienteKanban[]>([...etapasClienteKanbanDefault]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");

  const addEtapa = () => {
    const newEtapa: EtapaClienteKanban = {
      id: `ek_new_${Date.now()}`,
      nome: "Nova etapa",
      cor: "#6366f1",
      ordem: etapas.length + 1,
      ativa: true,
    };
    setEtapas([...etapas, newEtapa]);
    setEditingId(newEtapa.id);
    setNewName("Nova etapa");
  };

  const updateName = (id: string, nome: string) => {
    setEtapas(etapas.map(e => e.id === id ? { ...e, nome } : e));
    setEditingId(null);
  };

  const toggleAtiva = (id: string) => {
    setEtapas(etapas.map(e => e.id === id ? { ...e, ativa: !e.ativa } : e));
  };

  const removeEtapa = (id: string) => {
    setEtapas(etapas.filter(e => e.id !== id));
  };

  const updateColor = (id: string, cor: string) => {
    setEtapas(etapas.map(e => e.id === id ? { ...e, cor } : e));
  };

  const handleSave = () => {
    toast({ title: "Funil salvo", description: "As etapas do Kanban de clientes foram atualizadas." });
    navigate("/vendedor/clientes/kanban");
  };

  const colors = ["#3b82f6", "#8b5cf6", "#10b981", "#06b6d4", "#f59e0b", "#ef4444", "#f97316", "#6366f1", "#94a3b8", "#ec4899"];

  return (
    <>
      <div className="p-6 space-y-6 max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/vendedor/clientes/kanban")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-heading font-bold text-foreground">Configurar Funil de Clientes</h1>
            <p className="text-sm text-muted-foreground">Personalize os estágios do Kanban de clientes</p>
          </div>
          <Button size="sm" onClick={handleSave}>
            <Check className="h-4 w-4 mr-1" /> Salvar configuração
          </Button>
        </div>

        {/* Stages list */}
        <Card className="border border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Etapas do funil</CardTitle>
              <Button variant="outline" size="sm" onClick={addEtapa}>
                <Plus className="h-4 w-4 mr-1" /> Adicionar etapa
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {etapas.map((etapa, idx) => (
              <div
                key={etapa.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                  etapa.ativa ? "border-border bg-card" : "border-border/50 bg-muted/30 opacity-60"
                }`}
              >
                <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab shrink-0" />

                {/* Color dot */}
                <div className="relative group">
                  <div className="w-5 h-5 rounded-full cursor-pointer border-2 border-background shadow-sm" style={{ backgroundColor: etapa.cor }} />
                  <div className="absolute top-7 left-0 bg-popover border border-border rounded-lg p-2 hidden group-hover:flex gap-1 z-10 shadow-lg">
                    {colors.map(c => (
                      <button key={c} onClick={() => updateColor(etapa.id, c)} className="w-5 h-5 rounded-full border border-border hover:scale-110 transition-transform" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>

                {/* Name */}
                <div className="flex-1">
                  {editingId === etapa.id ? (
                    <Input
                      autoFocus
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      onBlur={() => updateName(etapa.id, newName)}
                      onKeyDown={e => e.key === "Enter" && updateName(etapa.id, newName)}
                      className="h-8 text-sm"
                    />
                  ) : (
                    <button onClick={() => { setEditingId(etapa.id); setNewName(etapa.nome); }} className="text-sm font-medium hover:text-primary transition-colors text-left">
                      {etapa.nome}
                    </button>
                  )}
                </div>

                <Badge variant="outline" className="text-[10px]">Ordem {idx + 1}</Badge>

                <Switch checked={etapa.ativa} onCheckedChange={() => toggleAtiva(etapa.id)} />

                <button onClick={() => removeEtapa(etapa.id)} className="h-8 w-8 rounded flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-muted transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Preview */}
        <Card className="border border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Eye className="h-4 w-4" /> Preview do funil
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {etapas.filter(e => e.ativa).map(etapa => (
                <div key={etapa.id} className="flex flex-col items-center gap-1 min-w-[80px]">
                  <div className="w-full h-2 rounded-full" style={{ backgroundColor: etapa.cor }} />
                  <span className="text-[10px] text-center text-muted-foreground">{etapa.nome}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
