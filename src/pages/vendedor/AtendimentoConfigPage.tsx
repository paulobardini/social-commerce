import { useState, useEffect } from "react";
import { useAtendimentoComercial } from "@/contexts/AtendimentoComercialContext";
import { defaultConfigAC } from "@/data/mockAtendimentoComercial";
import { Plus, Trash2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AtendimentoConfigPage() {
  const { config, setConfig } = useAtendimentoComercial();
  const { toast } = useToast();
  const [local, setLocal] = useState(config);
  useEffect(() => setLocal(config), [config]);

  const salvar = () => { setConfig(local); toast({ title: "Configuração salva" }); };

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-3xl">
      <div>
        <h1 className="text-xl md:text-2xl font-heading font-bold text-foreground">Configuração do Atendimento</h1>
        <p className="text-xs text-muted-foreground">SLA, prazos e listas usadas pelo Kanban e pelo painel do WhatsApp.</p>
      </div>

      <section className="bg-card border border-border rounded-xl p-4 space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Prazos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] text-muted-foreground block mb-1">SLA de primeira resposta (horas)</label>
            <input type="number" min={1} value={local.slaHoras} onChange={e => setLocal({ ...local, slaHoras: Number(e.target.value) })}
              className="w-full bg-card border border-border rounded-lg px-3 py-2 text-[12px] focus:outline-none focus:ring-1 focus:ring-ring" />
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground block mb-1">Dias para alerta em "Em Atendimento"</label>
            <input type="number" min={1} value={local.diasEstagnado} onChange={e => setLocal({ ...local, diasEstagnado: Number(e.target.value) })}
              className="w-full bg-card border border-border rounded-lg px-3 py-2 text-[12px] focus:outline-none focus:ring-1 focus:ring-ring" />
          </div>
        </div>
      </section>

      <ListaEditavel titulo="Motivos de perda" itens={local.motivosPerda}
        onChange={itens => setLocal({ ...local, motivosPerda: itens })} />

      <ListaEditavel titulo="Perguntas de qualificação" itens={local.perguntasQualificacao.map(p => p.label)}
        onChange={labels => setLocal({ ...local, perguntasQualificacao: labels.map((l, i) => ({ key: `q${i}`, label: l })) })} />

      <div className="flex items-center gap-2">
        <button onClick={salvar} className="text-[12px] font-medium inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90">
          <Save className="h-3.5 w-3.5" /> Salvar configuração
        </button>
        <button onClick={() => { setLocal(defaultConfigAC); setConfig(defaultConfigAC); toast({ title: "Restaurado" }); }} className="text-[12px] px-3 py-2 rounded-lg border border-border hover:bg-muted">Restaurar padrão</button>
      </div>
    </div>
  );
}

function ListaEditavel({ titulo, itens, onChange }: { titulo: string; itens: string[]; onChange: (i: string[]) => void }) {
  const [novo, setNovo] = useState("");
  return (
    <section className="bg-card border border-border rounded-xl p-4">
      <h2 className="text-sm font-semibold text-foreground mb-3">{titulo}</h2>
      <div className="space-y-1.5">
        {itens.map((it, i) => (
          <div key={i} className="flex items-center gap-2">
            <input value={it} onChange={e => onChange(itens.map((x, idx) => idx === i ? e.target.value : x))}
              className="flex-1 h-8 px-2 text-[12px] border border-border rounded" />
            <button onClick={() => onChange(itens.filter((_, idx) => idx !== i))}
              className="h-8 w-8 rounded hover:bg-muted text-destructive flex items-center justify-center"><Trash2 className="h-3 w-3" /></button>
          </div>
        ))}
        <div className="flex gap-2 mt-2">
          <input value={novo} onChange={e => setNovo(e.target.value)} placeholder="Adicionar…"
            className="flex-1 h-8 px-2 text-[12px] border border-border rounded" />
          <button onClick={() => { if (novo.trim()) { onChange([...itens, novo.trim()]); setNovo(""); } }}
            className="h-8 px-3 rounded bg-primary text-primary-foreground text-[12px] inline-flex items-center gap-1"><Plus className="h-3 w-3" /> Adicionar</button>
        </div>
      </div>
    </section>
  );
}
