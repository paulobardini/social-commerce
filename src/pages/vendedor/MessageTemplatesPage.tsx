import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ChevronLeft, Plus, Edit3, Trash2, Eye, MessageSquare, Zap } from "lucide-react";
import { useMessageTemplates, fillTemplate, type MessageTemplate } from "@/contexts/MessageTemplatesContext";
import { useToast } from "@/hooks/use-toast";

const PREVIEW_VARS = { nome: "Thay", produto: "Coleção Inverno 2026", valor: "R$ 9.800,00" };

export default function MessageTemplatesPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { templates, addTemplate, updateTemplate, removeTemplate } = useMessageTemplates();
  const [editing, setEditing] = useState<MessageTemplate | null>(null);
  const [creating, setCreating] = useState(false);
  const [previewing, setPreviewing] = useState<MessageTemplate | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<MessageTemplate | null>(null);

  // Form state
  const [form, setForm] = useState({ nome: "", categoria: "", conteudo: "" });

  const openCreate = () => {
    setForm({ nome: "", categoria: "", conteudo: "" });
    setCreating(true);
  };

  const openEdit = (t: MessageTemplate) => {
    setForm({ nome: t.nome, categoria: t.categoria || "", conteudo: t.conteudo });
    setEditing(t);
  };

  const handleSave = () => {
    if (!form.nome.trim() || !form.conteudo.trim()) {
      toast({ title: "Preencha nome e conteúdo", variant: "destructive" });
      return;
    }
    if (editing) {
      updateTemplate(editing.id, { nome: form.nome, categoria: form.categoria, conteudo: form.conteudo });
      toast({ title: "Template atualizado" });
      setEditing(null);
    } else {
      addTemplate({ nome: form.nome, categoria: form.categoria, conteudo: form.conteudo });
      toast({ title: "Template criado" });
      setCreating(false);
    }
  };

  const isModalOpen = creating || !!editing;

  return (
    <>
      <div className="p-6 max-w-[900px] mx-auto space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/vendedor/configuracoes")} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-muted">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-xl font-heading font-bold flex items-center gap-2">
                <MessageSquare className="h-5 w-5" /> Templates de mensagem
              </h1>
              <p className="text-sm text-muted-foreground">Use <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{`{{nome}}`}</code>, <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{`{{produto}}`}</code>, <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{`{{valor}}`}</code> para inserir dados do cliente automaticamente.</p>
            </div>
          </div>
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1" /> Novo template
          </Button>
        </div>

        <div className="space-y-3">
          {templates.length === 0 && (
            <Card className="border border-dashed">
              <CardContent className="p-10 text-center text-sm text-muted-foreground">
                Nenhum template cadastrado ainda.
              </CardContent>
            </Card>
          )}
          {templates.map(t => (
            <Card key={t.id} className="border border-border">
              <CardContent className="p-4 flex items-start gap-3">
                <div className="h-9 w-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                  <Zap className="h-4 w-4 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold">{t.nome}</p>
                    {t.categoria && <Badge variant="secondary" className="text-[10px]">{t.categoria}</Badge>}
                    <span className="text-[10px] text-muted-foreground ml-auto">criado em {t.criadoEm}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5 whitespace-pre-line line-clamp-2">{t.conteudo}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setPreviewing(t)} title="Pré-visualizar">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(t)} title="Editar">
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setConfirmDelete(t)} title="Excluir">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Create / Edit modal */}
      <Dialog open={isModalOpen} onOpenChange={(o) => { if (!o) { setCreating(false); setEditing(null); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar template" : "Novo template"}</DialogTitle>
            <DialogDescription>Use variáveis no formato <code className="text-xs">{`{{nome}}`}</code> para preenchimento automático.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Nome do template *</Label>
              <Input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} placeholder="Ex: Follow-up orçamento" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Categoria</Label>
              <Input value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })} placeholder="Ex: Follow-up, Abertura, Pós-venda" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Conteúdo *</Label>
              <Textarea
                value={form.conteudo}
                onChange={e => setForm({ ...form, conteudo: e.target.value })}
                placeholder="Olá {{nome}}, sobre {{produto}}..."
                className="mt-1 min-h-[140px] text-sm"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                Variáveis disponíveis: <code>{`{{nome}}`}</code>, <code>{`{{produto}}`}</code>, <code>{`{{valor}}`}</code>
              </p>
            </div>
            {form.conteudo && (
              <div className="rounded-lg border border-border bg-muted/40 p-3">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">Pré-visualização</p>
                <p className="text-sm whitespace-pre-line">{fillTemplate(form.conteudo, PREVIEW_VARS)}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCreating(false); setEditing(null); }}>Cancelar</Button>
            <Button onClick={handleSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview modal */}
      <Dialog open={!!previewing} onOpenChange={(o) => !o && setPreviewing(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{previewing?.nome}</DialogTitle>
            <DialogDescription>Pré-visualização com dados de exemplo</DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border border-border bg-muted/40 p-3">
            <p className="text-sm whitespace-pre-line">{previewing && fillTemplate(previewing.conteudo, PREVIEW_VARS)}</p>
          </div>
          <DialogFooter>
            <Button onClick={() => setPreviewing(null)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm delete */}
      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir template?</AlertDialogTitle>
            <AlertDialogDescription>
              O template <b>{confirmDelete?.nome}</b> será removido. Esta ação não pode ser desfeita e o template deixará de aparecer no painel rápido do WhatsApp.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (confirmDelete) {
                  removeTemplate(confirmDelete.id);
                  toast({ title: "Template excluído" });
                  setConfirmDelete(null);
                }
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
