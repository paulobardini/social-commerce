import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Plus, Zap, Pencil, Copy, Trash2, Sparkles } from "lucide-react";
import { useAutomacoes } from "@/contexts/AutomacoesContext";
import { AutomacaoFormModal } from "@/components/vendedor/AutomacaoFormModal";
import { etapaMap, etapaCorMap } from "@/data/mockCRM";
import type { Automacao } from "@/data/mockAutomacoes";

export default function AutomacoesPage() {
  const navigate = useNavigate();
  const { automacoes, saveAutomacao, deleteAutomacao, duplicateAutomacao } = useAutomacoes();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Automacao | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const openNew = () => { setEditing(null); setShowForm(true); };
  const openEdit = (a: Automacao) => { setEditing(a); setShowForm(true); };

  return (
    <div className="p-4 md:p-6 max-w-[1100px] mx-auto space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <Button variant="ghost" size="sm" className="mb-2 -ml-2 h-8" onClick={() => navigate("/vendedor/configuracoes")}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Configurações
          </Button>
          <h1 className="text-xl font-heading font-bold text-foreground flex items-center gap-2">
            <Zap className="h-5 w-5 text-accent" /> Automações de followup
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure sequências de tarefas que são criadas automaticamente quando uma oportunidade entra em uma etapa do funil.
          </p>
        </div>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4 mr-1" /> Nova automação
        </Button>
      </div>

      {automacoes.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-10 text-center">
            <Sparkles className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground">Nenhuma automação cadastrada</p>
            <p className="text-xs text-muted-foreground mt-1">Crie sua primeira automação para acelerar o trabalho do vendedor.</p>
            <Button size="sm" className="mt-3" onClick={openNew}>
              <Plus className="h-4 w-4 mr-1" /> Nova automação
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3">
        {automacoes.map(a => (
          <Card key={a.id} className="border border-border">
            <CardContent className="p-4 flex flex-col md:flex-row md:items-start gap-4">
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-foreground">{a.nome}</p>
                  {a.isPosVenda && (
                    <Badge className="text-[10px] bg-emerald-100 text-emerald-700 border border-emerald-200 hover:bg-emerald-100">
                      Pós-venda
                    </Badge>
                  )}
                  <Badge variant="secondary" className="text-[10px]">{a.tarefas.length} tarefas</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{a.descricao || "Sem descrição."}</p>
                <div className="flex flex-wrap gap-1.5">
                  {a.etapasVinculadas.map(et => (
                    <Badge
                      key={et}
                      variant="outline"
                      className="text-[10px] border"
                      style={{ borderColor: `${etapaCorMap[et]}66`, color: etapaCorMap[et], backgroundColor: `${etapaCorMap[et]}10` }}
                    >
                      {etapaMap[et]}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex md:flex-col gap-1.5 shrink-0">
                <Button variant="outline" size="sm" onClick={() => openEdit(a)} className="gap-1">
                  <Pencil className="h-3.5 w-3.5" /> Editar
                </Button>
                <Button variant="outline" size="sm" onClick={() => duplicateAutomacao(a.id)} className="gap-1">
                  <Copy className="h-3.5 w-3.5" /> Duplicar
                </Button>
                <Button variant="outline" size="sm" onClick={() => setConfirmDelete(a.id)} className="gap-1 text-destructive hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" /> Excluir
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AutomacaoFormModal
        open={showForm}
        onOpenChange={setShowForm}
        automacao={editing}
        onSave={saveAutomacao}
      />

      <AlertDialog open={!!confirmDelete} onOpenChange={o => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir automação?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Tarefas já criadas a partir desta automação serão mantidas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (confirmDelete) deleteAutomacao(confirmDelete); setConfirmDelete(null); }}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
