import { useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Building, Save } from "lucide-react";
import {
  type Cliente360, type ClienteStatus, type Nicho,
  statusLabels, nichoLabels,
} from "@/data/mockCRM360";
import { useToast } from "@/hooks/use-toast";

interface EditClienteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cliente: Cliente360 | null;
  onSave?: (updated: Cliente360) => void;
}

export function EditClienteModal({ open, onOpenChange, cliente, onSave }: EditClienteModalProps) {
  const { toast } = useToast();
  const [form, setForm] = useState({
    nomeFantasia: "",
    razaoSocial: "",
    documento: "",
    telefone: "",
    whatsapp: "",
    email: "",
    endereco: "",
    cidade: "",
    estado: "",
    nicho: "" as Nicho,
    status: "" as ClienteStatus,
    interessePrincipal: "",
    representante: "",
    origem: "",
    temperaturaComercial: "" as "fria" | "morna" | "quente",
    observacoes: "",
  });

  useEffect(() => {
    if (cliente) {
      setForm({
        nomeFantasia: cliente.nomeFantasia,
        razaoSocial: cliente.razaoSocial,
        documento: cliente.documento,
        telefone: cliente.telefone,
        whatsapp: cliente.whatsapp,
        email: cliente.email,
        endereco: cliente.endereco,
        cidade: cliente.cidade,
        estado: cliente.estado,
        nicho: cliente.nicho,
        status: cliente.status,
        interessePrincipal: cliente.interessePrincipal,
        representante: cliente.representante,
        origem: cliente.origem,
        temperaturaComercial: cliente.temperaturaComercial,
        observacoes: "",
      });
    }
  }, [cliente]);

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSave = () => {
    if (!cliente) return;
    const updated = { ...cliente, ...form };
    onSave?.(updated);
    toast({ title: "Cliente atualizado", description: `${form.nomeFantasia} foi salvo com sucesso.` });
    onOpenChange(false);
  };

  if (!cliente) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Building className="h-5 w-5 text-accent" />
            </div>
            <div>
              <DialogTitle className="font-heading">Editar cliente</DialogTitle>
              <p className="text-sm text-muted-foreground">{cliente.nomeFantasia}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 pr-1 py-2">
          {/* Dados da empresa */}
          <fieldset className="space-y-3">
            <legend className="text-sm font-semibold text-foreground flex items-center gap-2 mb-1">
              <Badge variant="secondary" className="text-[10px]">Empresa</Badge>
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Nome fantasia</Label>
                <Input value={form.nomeFantasia} onChange={e => update("nomeFantasia", e.target.value)} className="h-9" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Razão social</Label>
                <Input value={form.razaoSocial} onChange={e => update("razaoSocial", e.target.value)} className="h-9" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">CNPJ / CPF</Label>
                <Input value={form.documento} onChange={e => update("documento", e.target.value)} className="h-9" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Origem</Label>
                <Input value={form.origem} onChange={e => update("origem", e.target.value)} className="h-9" />
              </div>
            </div>
          </fieldset>

          {/* Contato */}
          <fieldset className="space-y-3">
            <legend className="text-sm font-semibold text-foreground flex items-center gap-2 mb-1">
              <Badge variant="secondary" className="text-[10px]">Contato</Badge>
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Telefone</Label>
                <Input value={form.telefone} onChange={e => update("telefone", e.target.value)} className="h-9" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">WhatsApp</Label>
                <Input value={form.whatsapp} onChange={e => update("whatsapp", e.target.value)} className="h-9" />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs">E-mail</Label>
                <Input value={form.email} onChange={e => update("email", e.target.value)} className="h-9" type="email" />
              </div>
            </div>
          </fieldset>

          {/* Endereço */}
          <fieldset className="space-y-3">
            <legend className="text-sm font-semibold text-foreground flex items-center gap-2 mb-1">
              <Badge variant="secondary" className="text-[10px]">Endereço</Badge>
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5 sm:col-span-3">
                <Label className="text-xs">Endereço</Label>
                <Input value={form.endereco} onChange={e => update("endereco", e.target.value)} className="h-9" />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs">Cidade</Label>
                <Input value={form.cidade} onChange={e => update("cidade", e.target.value)} className="h-9" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">UF</Label>
                <Input value={form.estado} onChange={e => update("estado", e.target.value)} className="h-9" maxLength={2} />
              </div>
            </div>
          </fieldset>

          {/* Comercial */}
          <fieldset className="space-y-3">
            <legend className="text-sm font-semibold text-foreground flex items-center gap-2 mb-1">
              <Badge variant="secondary" className="text-[10px]">Comercial</Badge>
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Nicho</Label>
                <Select value={form.nicho} onValueChange={v => update("nicho", v)}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(nichoLabels).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Status</Label>
                <Select value={form.status} onValueChange={v => update("status", v)}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusLabels).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Temperatura comercial</Label>
                <Select value={form.temperaturaComercial} onValueChange={v => update("temperaturaComercial", v)}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quente">🔥 Quente</SelectItem>
                    <SelectItem value="morna">🌤 Morna</SelectItem>
                    <SelectItem value="fria">❄️ Fria</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Representante</Label>
                <Input value={form.representante} onChange={e => update("representante", e.target.value)} className="h-9" />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs">Interesse principal</Label>
                <Input value={form.interessePrincipal} onChange={e => update("interessePrincipal", e.target.value)} className="h-9" />
              </div>
            </div>
          </fieldset>

          {/* Observações */}
          <div className="space-y-1.5">
            <Label className="text-xs">Observações</Label>
            <Textarea
              value={form.observacoes}
              onChange={e => update("observacoes", e.target.value)}
              placeholder="Observações internas sobre o cliente..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="shrink-0 pt-3 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-1" /> Salvar alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
