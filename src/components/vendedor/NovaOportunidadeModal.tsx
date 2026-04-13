import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { TagBadge } from "./TagBadge";
import { mockClientes } from "@/data/mockVendedor";
import { etapasFunil, tagLabels, type TagCRM } from "@/data/mockCRM";
import { useNavigate } from "react-router-dom";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const allTags: TagCRM[] = ["quente", "recorrente", "novo_cliente", "alto_potencial", "infantil", "adulto", "fitness", "urgente"];

export function NovaOportunidadeModal({ open, onOpenChange }: Props) {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [clienteId, setClienteId] = useState("");
  const [valorEstimado, setValorEstimado] = useState("");
  const [etapa, setEtapa] = useState("e1");
  const [prioridade, setPrioridade] = useState("media");
  const [origem, setOrigem] = useState("");
  const [previsao, setPrevisao] = useState("");
  const [tags, setTags] = useState<TagCRM[]>([]);
  const [observacoes, setObservacoes] = useState("");
  const [proximaAcao, setProximaAcao] = useState("");

  const toggleTag = (tag: TagCRM) => setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);

  const canSubmit = nome.trim() && clienteId;

  const handleSubmit = () => {
    // In real app would create the opportunity
    onOpenChange(false);
    navigate("/vendedor/oportunidades/op1"); // Navigate to detail
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">Nova oportunidade</DialogTitle>
          <p className="text-sm text-muted-foreground">Preencha os dados para abrir uma nova oportunidade comercial.</p>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Label className="text-xs font-medium">Nome da oportunidade *</Label>
            <Input placeholder="Ex: Pedido Inverno 2026 – Boutique da Thay" value={nome} onChange={e => setNome(e.target.value)} className="mt-1" />
          </div>

          <div>
            <Label className="text-xs font-medium">Cliente vinculado *</Label>
            <Select value={clienteId} onValueChange={setClienteId}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione o cliente" /></SelectTrigger>
              <SelectContent>
                {mockClientes.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-medium">Valor estimado</Label>
              <Input type="number" placeholder="0,00" value={valorEstimado} onChange={e => setValorEstimado(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs font-medium">Previsão de fechamento</Label>
              <Input type="date" value={previsao} onChange={e => setPrevisao(e.target.value)} className="mt-1" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-medium">Etapa inicial</Label>
              <Select value={etapa} onValueChange={setEtapa}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {etapasFunil.filter(e => e.ativa && e.tipo !== "ganho" && e.tipo !== "perda").map(e => (
                    <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-medium">Prioridade</Label>
              <Select value={prioridade} onValueChange={setPrioridade}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="baixa">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-xs font-medium">Origem</Label>
            <Select value={origem} onValueChange={setOrigem}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Carteira ativa">Carteira ativa</SelectItem>
                <SelectItem value="Prospecção ativa">Prospecção ativa</SelectItem>
                <SelectItem value="Indicação">Indicação</SelectItem>
                <SelectItem value="Feira comercial">Feira comercial</SelectItem>
                <SelectItem value="Site">Site</SelectItem>
                <SelectItem value="WhatsApp">WhatsApp</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs font-medium">Tags</Label>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`transition-all ${tags.includes(tag) ? "ring-2 ring-accent/30 rounded-full" : "opacity-60 hover:opacity-100"}`}
                >
                  <TagBadge tag={tag} size="md" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-xs font-medium">Próxima ação</Label>
            <Input placeholder="Ex: Enviar catálogo digital" value={proximaAcao} onChange={e => setProximaAcao(e.target.value)} className="mt-1" />
          </div>

          <div>
            <Label className="text-xs font-medium">Observações</Label>
            <Textarea placeholder="Notas iniciais sobre a oportunidade" value={observacoes} onChange={e => setObservacoes(e.target.value)} className="mt-1" rows={3} />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>Criar oportunidade</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
