// MOCK: Quick Add com parse de linguagem natural PT-BR. Fallback: abre modal completo.
import { useState, useRef, useEffect } from "react";
import { Plus, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { parseAcaoNL, HOJE_ANCHOR_BR } from "@/lib/acoes";
import { mockClientes360, tipoTarefaLabels } from "@/data/mockCRM360";
import { useTarefas } from "@/contexts/TarefasContext";
import { toast } from "sonner";

interface Props {
  onOpenModal: (prefill?: {
    titulo?: string; clienteId?: string; tipo?: string; vencimento?: string; hora?: string;
  }) => void;
}

export function AcaoQuickAdd({ onOpenModal }: Props) {
  const { addTarefa } = useTarefas();
  const [value, setValue] = useState("");
  const [preview, setPreview] = useState<ReturnType<typeof parseAcaoNL> | null>(null);
  const debRef = useRef<number | null>(null);

  useEffect(() => {
    if (debRef.current) window.clearTimeout(debRef.current);
    if (!value.trim()) { setPreview(null); return; }
    debRef.current = window.setTimeout(() => {
      setPreview(parseAcaoNL(value, mockClientes360.map(c => ({ id: c.id, nomeFantasia: c.nomeFantasia }))));
    }, 120);
  }, [value]);

  const handleAdd = () => {
    if (!value.trim()) return;
    const p = parseAcaoNL(value, mockClientes360.map(c => ({ id: c.id, nomeFantasia: c.nomeFantasia })));
    if (!p.vencimento) {
      // sem data → abre modal para completar
      onOpenModal({ titulo: p.titulo, clienteId: p.clienteId, tipo: p.tipo, hora: p.hora });
      setValue("");
      return;
    }
    addTarefa({
      titulo: p.titulo,
      descricao: "",
      tipo: (p.tipo as any) ?? "follow_up",
      clienteId: p.clienteId,
      clienteNome: p.clienteNome,
      prioridade: "media",
      vencimento: p.vencimento,
      hora: p.hora,
      responsavel: "Paulo Bardini",
      status: "pendente",
      origem: "vendedor",
      recorrencia: "nenhuma",
    });
    toast.success("Ação criada");
    setValue("");
    setPreview(null);
  };

  const dataLabel = preview?.vencimento === HOJE_ANCHOR_BR ? "hoje" : preview?.vencimento;

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-accent" />
          <Input
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleAdd(); }}
            placeholder='ex: "Ligar para AGK amanhã 14h" ou "Visitar Boutique da Thay sexta"'
            className="pl-9 h-9"
          />
        </div>
        <Button size="sm" onClick={handleAdd} disabled={!value.trim()}>
          <Plus className="h-4 w-4 mr-1" /> Criar
        </Button>
        <Button size="sm" variant="outline" onClick={() => onOpenModal()}>
          Modal completo
        </Button>
      </div>
      {preview && (
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground px-1">
          <span>Interpretado:</span>
          {preview.tipo && <span className="px-1.5 py-0.5 rounded bg-accent/10 text-accent">{tipoTarefaLabels[preview.tipo] ?? preview.tipo}</span>}
          {preview.clienteNome && <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">{preview.clienteNome}</span>}
          {dataLabel && <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">{dataLabel}{preview.hora ? ` · ${preview.hora}` : ""}</span>}
          {!preview.vencimento && <span className="text-orange-600">sem data — abrirá modal</span>}
        </div>
      )}
    </div>
  );
}
