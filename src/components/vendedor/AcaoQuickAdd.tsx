// MOCK: Quick Add com parse de linguagem natural PT-BR.
// Desambiguação inline: quando >1 cliente casa com pontuação equivalente, mostra dropdown.
import { useState, useRef, useEffect } from "react";
import { Plus, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { parseAcaoNL, HOJE_ANCHOR_BR, type ParseNL } from "@/lib/acoes";
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
  const [preview, setPreview] = useState<ParseNL | null>(null);
  // Cliente escolhido manualmente (quando há candidatos ambíguos).
  const [clienteEscolhido, setClienteEscolhido] = useState<{ id: string; nome: string } | null>(null);
  const debRef = useRef<number | null>(null);

  useEffect(() => {
    if (debRef.current) window.clearTimeout(debRef.current);
    if (!value.trim()) { setPreview(null); setClienteEscolhido(null); return; }
    debRef.current = window.setTimeout(() => {
      const p = parseAcaoNL(value, mockClientes360.map(c => ({ id: c.id, nomeFantasia: c.nomeFantasia })));
      setPreview(p);
      // Reset da escolha se ela não estiver mais entre os candidatos/válidos.
      if (clienteEscolhido && p.clienteId !== clienteEscolhido.id && !p.candidatos?.some(x => x.id === clienteEscolhido.id)) {
        setClienteEscolhido(null);
      }
    }, 120);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const clienteFinal = clienteEscolhido ?? (preview?.clienteId ? { id: preview.clienteId, nome: preview.clienteNome! } : null);
  const precisaDesambiguar = !!(preview?.candidatos && preview.candidatos.length > 1 && !clienteEscolhido);

  const handleAdd = () => {
    if (!value.trim() || !preview) return;
    if (precisaDesambiguar) {
      toast.info("Selecione o cliente correto");
      return;
    }
    if (!preview.vencimento) {
      onOpenModal({
        titulo: preview.titulo,
        clienteId: clienteFinal?.id,
        tipo: preview.tipo,
        hora: preview.hora,
      });
      setValue("");
      setClienteEscolhido(null);
      return;
    }
    addTarefa({
      titulo: preview.titulo,
      descricao: "",
      tipo: (preview.tipo as any) ?? "follow_up",
      clienteId: clienteFinal?.id,
      clienteNome: clienteFinal?.nome,
      prioridade: "media",
      vencimento: preview.vencimento,
      hora: preview.hora,
      responsavel: "Paulo Bardini",
      status: "pendente",
      origem: "vendedor",
      recorrencia: "nenhuma",
    });
    toast.success("Ação criada");
    setValue("");
    setPreview(null);
    setClienteEscolhido(null);
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
        <Button size="sm" onClick={handleAdd} disabled={!value.trim() || precisaDesambiguar}>
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
          {clienteFinal && <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">{clienteFinal.nome}</span>}
          {dataLabel && <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">{dataLabel}{preview.hora ? ` · ${preview.hora}` : ""}</span>}
          {!preview.vencimento && <span className="text-orange-600">sem data — abrirá modal</span>}
        </div>
      )}
      {precisaDesambiguar && (
        <div className="rounded-md border border-orange-200 bg-orange-50/70 px-2 py-1.5">
          <p className="text-[11px] text-orange-900 mb-1 font-medium">
            Mais de um cliente casa — escolha qual:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {preview!.candidatos!.map(c => (
              <button
                key={c.id}
                onClick={() => setClienteEscolhido({ id: c.id, nome: c.nome })}
                className="text-[11px] px-2 py-1 rounded border border-orange-300 bg-white hover:bg-orange-100 text-orange-900"
              >
                {c.nome}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
