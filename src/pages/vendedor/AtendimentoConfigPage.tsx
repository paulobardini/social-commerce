import { useState, useEffect } from "react";
import { useAtendimentoComercial } from "@/contexts/AtendimentoComercialContext";
import { defaultConfigAC, MotivoPerdaNode } from "@/data/mockAtendimentoComercial";
import { Plus, Trash2, Save, ChevronRight, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AtendimentoConfigPage() {
  const { config, setConfig } = useAtendimentoComercial();
  const { toast } = useToast();
  const [local, setLocal] = useState(config);
  useEffect(() => setLocal(config), [config]);

  const salvar = () => {
    // Mantém motivosPerda em sync com a árvore
    const motivosPerda = local.motivosPerdaTree.map(m => m.motivo);
    const atualizado = { ...local, motivosPerda };
    setConfig(atualizado);
    setLocal(atualizado);
    toast({ title: "Configuração salva" });
  };

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

      <MotivosPerdaEditor
        tree={local.motivosPerdaTree}
        onChange={tree => setLocal({ ...local, motivosPerdaTree: tree })}
      />

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

function MotivosPerdaEditor({ tree, onChange }: { tree: MotivoPerdaNode[]; onChange: (t: MotivoPerdaNode[]) => void }) {
  const [expandido, setExpandido] = useState<Record<number, boolean>>({});
  const [novoMotivo, setNovoMotivo] = useState("");
  const [novoSub, setNovoSub] = useState<Record<number, string>>({});

  return (
    <section className="bg-card border border-border rounded-xl p-4 space-y-2.5">
      <h2 className="text-sm font-semibold text-foreground">Motivos de perda (2 níveis)</h2>
      <p className="text-[11px] text-muted-foreground -mt-1.5">
        Configure motivo → sub-motivos. Sub-motivos com padrão "retomar em Xd" agendam automaticamente uma data de retomada.
      </p>

      <div className="space-y-1.5">
        {tree.map((node, i) => {
          const aberto = !!expandido[i];
          return (
            <div key={i} className="border border-border rounded-lg">
              <div className="flex items-center gap-1.5 p-1.5">
                <button onClick={() => setExpandido(e => ({ ...e, [i]: !aberto }))} className="h-6 w-6 flex items-center justify-center rounded hover:bg-muted">
                  {aberto ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                </button>
                <input
                  value={node.motivo}
                  onChange={e => onChange(tree.map((n, idx) => idx === i ? { ...n, motivo: e.target.value } : n))}
                  className="flex-1 h-8 px-2 text-[12px] font-medium border border-border rounded"
                />
                <span className="text-[10px] text-muted-foreground shrink-0">{node.subMotivos.length} sub</span>
                <button onClick={() => onChange(tree.filter((_, idx) => idx !== i))} className="h-8 w-8 rounded hover:bg-muted text-destructive flex items-center justify-center">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
              {aberto && (
                <div className="border-t border-border/60 p-2 pl-8 space-y-1.5 bg-muted/20">
                  {node.subMotivos.map((sub, si) => (
                    <div key={si} className="flex items-center gap-2">
                      <input
                        value={sub}
                        onChange={e => onChange(tree.map((n, idx) => idx === i ? { ...n, subMotivos: n.subMotivos.map((s, sj) => sj === si ? e.target.value : s) } : n))}
                        className="flex-1 h-7 px-2 text-[11px] border border-border rounded bg-background"
                      />
                      <button onClick={() => onChange(tree.map((n, idx) => idx === i ? { ...n, subMotivos: n.subMotivos.filter((_, sj) => sj !== si) } : n))} className="h-7 w-7 rounded hover:bg-muted text-destructive flex items-center justify-center">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-2 pt-1">
                    <input
                      value={novoSub[i] || ""}
                      onChange={e => setNovoSub({ ...novoSub, [i]: e.target.value })}
                      placeholder="Novo sub-motivo…"
                      className="flex-1 h-7 px-2 text-[11px] border border-border rounded bg-background"
                    />
                    <button
                      onClick={() => {
                        const v = (novoSub[i] || "").trim();
                        if (!v) return;
                        onChange(tree.map((n, idx) => idx === i ? { ...n, subMotivos: [...n.subMotivos, v] } : n));
                        setNovoSub({ ...novoSub, [i]: "" });
                      }}
                      className="h-7 px-2 rounded bg-primary text-primary-foreground text-[11px] inline-flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" /> Add
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex gap-2 pt-1">
        <input value={novoMotivo} onChange={e => setNovoMotivo(e.target.value)} placeholder="Novo motivo…"
          className="flex-1 h-8 px-2 text-[12px] border border-border rounded" />
        <button
          onClick={() => {
            const v = novoMotivo.trim();
            if (!v) return;
            onChange([...tree, { motivo: v, subMotivos: [] }]);
            setNovoMotivo("");
          }}
          className="h-8 px-3 rounded bg-primary text-primary-foreground text-[12px] inline-flex items-center gap-1"
        >
          <Plus className="h-3 w-3" /> Motivo
        </button>
      </div>
    </section>
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
