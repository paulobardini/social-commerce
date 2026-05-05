import { useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMarketing } from "../contexts/MarketingDataContext";
import {
  Jornada, JourneyNode, JourneyEdge, NodeKind, TriggerType, ActionType, ConditionType,
  triggerCatalog, actionCatalog, conditionCatalog, triggerLabels, actionLabels, conditionLabels, statusJornadaCfg,
} from "../data/mockJornadas";
import { ArrowLeft, Play, Pause, Save, Trash2, Plus, Zap, Send, GitFork, Clock, Flag, X, Settings2, GripVertical } from "lucide-react";
import { formatNum, formatPct, formatBRLCompact } from "../styles/tokens";

const KIND_CFG: Record<NodeKind, { color: string; bg: string; border: string; icon: typeof Zap; label: string }> = {
  trigger:   { color: "text-emerald-600", bg: "bg-emerald-500/10", border: "border-emerald-500/40", icon: Zap, label: "Gatilho" },
  action:    { color: "text-sky-600",     bg: "bg-sky-500/10",     border: "border-sky-500/40",     icon: Send, label: "Ação" },
  condition: { color: "text-amber-600",   bg: "bg-amber-500/10",   border: "border-amber-500/40",   icon: GitFork, label: "Condição" },
  delay:     { color: "text-violet-600",  bg: "bg-violet-500/10",  border: "border-violet-500/40",  icon: Clock, label: "Espera" },
  exit:      { color: "text-slate-600",   bg: "bg-slate-500/10",   border: "border-slate-500/40",   icon: Flag, label: "Saída" },
};

const NODE_W = 220;
const NODE_H = 92;

export default function JornadaEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { jornadas, atualizarJornada, setStatusJornada } = useMarketing();
  const original = jornadas.find(j => j.id === id);

  const [draft, setDraft] = useState<Jornada | null>(original ? structuredClone(original) : null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const dragRef = useRef<{ id: string; offX: number; offY: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  if (!draft) {
    return (
      <div className="space-y-4">
        <button onClick={() => navigate("/marketing/jornadas")} className="text-[12px] inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Voltar
        </button>
        <div className="bg-card border border-dashed border-border rounded-xl p-10 text-center">
          <p className="text-sm text-muted-foreground">Jornada não encontrada.</p>
        </div>
      </div>
    );
  }

  const selected = selectedId ? draft.nodes.find(n => n.id === selectedId) : null;
  const dirty = JSON.stringify(draft) !== JSON.stringify(original);

  const updateNode = (nid: string, patch: Partial<JourneyNode>) => {
    setDraft(d => d ? { ...d, nodes: d.nodes.map(n => n.id === nid ? { ...n, ...patch } : n) } : d);
  };
  const addNode = (kind: NodeKind, sub?: TriggerType | ActionType | ConditionType) => {
    const nid = `n_${Date.now()}`;
    const lastY = Math.max(...draft.nodes.map(n => n.y), 0);
    const node: JourneyNode = {
      id: nid, kind, x: 60, y: lastY + 140,
      label: kind === "trigger" ? triggerLabels[sub as TriggerType] || "Novo gatilho"
        : kind === "action" ? actionLabels[sub as ActionType] || "Nova ação"
        : kind === "condition" ? conditionLabels[sub as ConditionType] || "Nova condição"
        : kind === "delay" ? "Espera" : "Saída",
      triggerType: kind === "trigger" ? sub as TriggerType : undefined,
      actionType: kind === "action" ? sub as ActionType : undefined,
      conditionType: kind === "condition" ? sub as ConditionType : undefined,
    };
    setDraft(d => d ? { ...d, nodes: [...d.nodes, node] } : d);
    setSelectedId(nid);
  };
  const removeNode = (nid: string) => {
    setDraft(d => d ? {
      ...d,
      nodes: d.nodes.filter(n => n.id !== nid),
      edges: d.edges.filter(e => e.from !== nid && e.to !== nid),
    } : d);
    setSelectedId(null);
  };
  const addEdge = (from: string, to: string, branch?: "sim" | "nao") => {
    if (from === to) return;
    setDraft(d => d ? { ...d, edges: [...d.edges, { id: `e_${Date.now()}`, from, to, branch }] } : d);
  };
  const removeEdge = (eid: string) => setDraft(d => d ? { ...d, edges: d.edges.filter(e => e.id !== eid) } : d);

  const onMouseDown = (e: React.MouseEvent, n: JourneyNode) => {
    setSelectedId(n.id);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    dragRef.current = { id: n.id, offX: e.clientX - rect.left - n.x, offY: e.clientY - rect.top - n.y };
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragRef.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(0, e.clientX - rect.left - dragRef.current.offX);
    const y = Math.max(0, e.clientY - rect.top - dragRef.current.offY);
    updateNode(dragRef.current.id, { x, y });
  };
  const onMouseUp = () => { dragRef.current = null; };

  const salvar = () => { atualizarJornada(draft); };
  const togglePause = () => {
    const s = draft.status === "ativa" ? "pausada" : "ativa";
    setDraft(d => d ? { ...d, status: s } : d);
    setStatusJornada(draft.id, s);
  };
  const ativar = () => {
    setDraft(d => d ? { ...d, status: "ativa" } : d);
    setStatusJornada(draft.id, "ativa");
    atualizarJornada({ ...draft, status: "ativa" });
  };

  const st = statusJornadaCfg[draft.status];

  // Tamanho do canvas
  const maxX = Math.max(...draft.nodes.map(n => n.x + NODE_W), 800);
  const maxY = Math.max(...draft.nodes.map(n => n.y + NODE_H), 600);

  return (
    <div className="space-y-4 -mx-4 md:-mx-6 -my-5 px-4 md:px-6 py-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-start gap-3 min-w-0">
          <button onClick={() => navigate("/marketing/jornadas")} className="h-9 w-9 rounded-lg bg-card border border-border hover:bg-muted flex items-center justify-center shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="min-w-0">
            <input value={draft.nome} onChange={e => setDraft(d => d ? { ...d, nome: e.target.value } : d)}
              className="text-lg md:text-xl font-bold text-foreground bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-ring rounded px-1 -ml-1 w-full" />
            <div className="flex items-center gap-2 flex-wrap mt-0.5">
              <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${st.color}`}>{st.label}</span>
              <span className="text-[11px] text-muted-foreground">{draft.nodes.length} etapas · Editado em {draft.ultimaEdicao}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {draft.status === "rascunho" && (
            <button onClick={ativar} className="text-[12px] inline-flex items-center gap-1 bg-emerald-500 text-white rounded-lg px-3 py-1.5 hover:opacity-90">
              <Play className="h-3.5 w-3.5" /> Publicar e ativar
            </button>
          )}
          {(draft.status === "ativa" || draft.status === "pausada") && (
            <button onClick={togglePause} className="text-[12px] inline-flex items-center gap-1 bg-card border border-border rounded-lg px-2.5 py-1.5 hover:bg-muted">
              {draft.status === "ativa" ? <><Pause className="h-3.5 w-3.5" /> Pausar</> : <><Play className="h-3.5 w-3.5" /> Ativar</>}
            </button>
          )}
          <button disabled={!dirty} onClick={salvar} className="text-[12px] inline-flex items-center gap-1 bg-primary text-primary-foreground rounded-lg px-3 py-1.5 hover:opacity-90 disabled:opacity-40">
            <Save className="h-3.5 w-3.5" /> Salvar
          </button>
        </div>
      </div>

      {/* KPIs execução */}
      {draft.status !== "rascunho" && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
          <KpiMini label="Entraram" value={formatNum(draft.totalEntraram)} />
          <KpiMini label="Em fluxo" value={formatNum(draft.ativos)} highlight />
          <KpiMini label="Concluíram" value={formatNum(draft.concluiram)} />
          <KpiMini label="Conversões" value={formatNum(draft.conversoes)} sub={draft.totalEntraram > 0 ? formatPct(draft.conversoes / draft.totalEntraram * 100) : undefined} />
          <KpiMini label="Receita" value={formatBRLCompact(draft.receitaAtribuida)} highlight />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_300px] gap-3 min-h-[600px]">
        {/* Paleta */}
        <aside className="bg-card border border-border rounded-xl p-3 space-y-3 max-h-[700px] overflow-y-auto">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-bold mb-1.5">Gatilhos</p>
            <div className="space-y-1">
              {triggerCatalog.map(t => (
                <button key={t.type} onClick={() => addNode("trigger", t.type)} className="w-full text-left bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2 py-1.5 flex items-center gap-2">
                  <span className="text-base">{t.icon}</span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-foreground truncate">{triggerLabels[t.type]}</p>
                    <p className="text-[9px] text-muted-foreground truncate">{t.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-bold mb-1.5">Ações</p>
            <div className="space-y-1">
              {actionCatalog.map(a => (
                <button key={a.type} onClick={() => addNode("action", a.type)} className="w-full text-left bg-sky-500/5 hover:bg-sky-500/10 border border-sky-500/20 rounded-lg px-2 py-1.5 flex items-center gap-2">
                  <span className="text-base">{a.icon}</span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-foreground truncate">{actionLabels[a.type]}</p>
                    <p className="text-[9px] text-muted-foreground truncate">{a.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-bold mb-1.5">Condições</p>
            <div className="space-y-1">
              {conditionCatalog.map(c => (
                <button key={c.type} onClick={() => addNode("condition", c.type)} className="w-full text-left bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/20 rounded-lg px-2 py-1.5 flex items-center gap-2">
                  <span className="text-base">{c.icon}</span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-foreground truncate">{conditionLabels[c.type]}</p>
                    <p className="text-[9px] text-muted-foreground truncate">{c.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-bold mb-1.5">Outros</p>
            <button onClick={() => addNode("delay")} className="w-full text-left bg-violet-500/5 hover:bg-violet-500/10 border border-violet-500/20 rounded-lg px-2 py-1.5 flex items-center gap-2">
              <Clock className="h-4 w-4 text-violet-600" />
              <p className="text-[11px] font-semibold text-foreground">Espera (delay)</p>
            </button>
            <button onClick={() => addNode("exit")} className="w-full text-left bg-slate-500/5 hover:bg-slate-500/10 border border-slate-500/20 rounded-lg px-2 py-1.5 flex items-center gap-2 mt-1">
              <Flag className="h-4 w-4 text-slate-600" />
              <p className="text-[11px] font-semibold text-foreground">Saída</p>
            </button>
          </div>
        </aside>

        {/* Canvas */}
        <div className="bg-muted/30 border border-border rounded-xl overflow-auto relative" style={{ minHeight: 600, maxHeight: 700 }}>
          <div
            ref={canvasRef}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onClick={() => setSelectedId(null)}
            className="relative"
            style={{
              width: maxX + 80,
              height: maxY + 80,
              backgroundImage: "radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          >
            {/* Edges (SVG) */}
            <svg className="absolute inset-0 pointer-events-none" width="100%" height="100%">
              <defs>
                <marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
                  <path d="M0,0 L10,5 L0,10 z" fill="hsl(var(--muted-foreground))" />
                </marker>
              </defs>
              {draft.edges.map(e => <EdgeSvg key={e.id} edge={e} nodes={draft.nodes} onRemove={() => removeEdge(e.id)} />)}
            </svg>

            {/* Nodes */}
            {draft.nodes.map(n => {
              const cfg = KIND_CFG[n.kind];
              const Icon = cfg.icon;
              const isSelected = selectedId === n.id;
              return (
                <div
                  key={n.id}
                  onMouseDown={(e) => { e.stopPropagation(); onMouseDown(e, n); }}
                  onClick={(e) => e.stopPropagation()}
                  className={`absolute rounded-xl bg-card border-2 ${isSelected ? "border-primary shadow-lg" : cfg.border} hover:shadow-md transition-shadow cursor-move select-none`}
                  style={{ left: n.x, top: n.y, width: NODE_W, minHeight: NODE_H }}
                >
                  <div className={`px-2.5 py-1.5 ${cfg.bg} rounded-t-lg flex items-center gap-1.5`}>
                    <Icon className={`h-3.5 w-3.5 ${cfg.color}`} />
                    <span className={`text-[10px] uppercase font-bold ${cfg.color}`}>{cfg.label}</span>
                    <GripVertical className="h-3 w-3 text-muted-foreground ml-auto" />
                  </div>
                  <div className="p-2.5">
                    <p className="text-[12px] font-semibold text-foreground line-clamp-2">{n.label}</p>
                    {n.description && <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">{n.description}</p>}
                    {n.stats && (
                      <div className="flex items-center gap-2 mt-1.5 pt-1.5 border-t border-border text-[9px] text-muted-foreground">
                        <span><strong className="text-foreground">{formatNum(n.stats.entrou)}</strong> in</span>
                        <span>·</span>
                        <span><strong className="text-foreground">{formatNum(n.stats.saiu)}</strong> out</span>
                      </div>
                    )}
                  </div>
                  {/* Connection helpers */}
                  {n.kind !== "exit" && <ConnectionDot draft={draft} from={n} addEdge={addEdge} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Inspector */}
        <aside className="bg-card border border-border rounded-xl p-3 max-h-[700px] overflow-y-auto">
          {selected ? (
            <NodeInspector node={selected} draft={draft} onChange={(p) => updateNode(selected.id, p)} onRemove={() => removeNode(selected.id)} addEdge={addEdge} />
          ) : (
            <div className="text-center py-8">
              <Settings2 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-[12px] font-medium text-foreground">Inspecionar etapa</p>
              <p className="text-[11px] text-muted-foreground mt-1">Selecione uma etapa no canvas para configurar suas propriedades.</p>
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-bold mb-2">Detalhes da jornada</p>
                <textarea value={draft.descricao} onChange={e => setDraft(d => d ? { ...d, descricao: e.target.value } : d)}
                  rows={3} placeholder="Descrição da jornada..."
                  className="w-full bg-card border border-border rounded-lg px-2 py-1.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-ring" />
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function ConnectionDot({ draft, from, addEdge }: { draft: Jornada; from: JourneyNode; addEdge: (f: string, t: string, br?: "sim" | "nao") => void }) {
  const [open, setOpen] = useState(false);
  const candidatos = draft.nodes.filter(n => n.id !== from.id && !draft.edges.some(e => e.from === from.id && e.to === n.id && (from.kind !== "condition" || true)));
  return (
    <>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(true); }}
        className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold hover:scale-110 transition-transform shadow"
        title="Conectar a próxima etapa"
      >+</button>
      {open && (
        <div onClick={(e) => e.stopPropagation()} className="absolute top-full mt-3 left-1/2 -translate-x-1/2 z-30 bg-popover border border-border rounded-lg shadow-xl w-52 p-1.5">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-bold px-1.5 py-1">
            Conectar a... {from.kind === "condition" && "(escolha o ramo)"}
          </p>
          {candidatos.length === 0 && <p className="text-[10px] text-muted-foreground px-1.5 py-1">Nenhum nó disponível</p>}
          {candidatos.map(c => (
            <div key={c.id} className="px-1">
              {from.kind === "condition" ? (
                <div className="flex items-center gap-1 py-0.5">
                  <span className="text-[11px] text-foreground flex-1 truncate">{c.label}</span>
                  <button onClick={() => { addEdge(from.id, c.id, "sim"); setOpen(false); }} className="text-[10px] bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 rounded hover:bg-emerald-500/20">Sim</button>
                  <button onClick={() => { addEdge(from.id, c.id, "nao"); setOpen(false); }} className="text-[10px] bg-rose-500/10 text-rose-600 px-1.5 py-0.5 rounded hover:bg-rose-500/20">Não</button>
                </div>
              ) : (
                <button onClick={() => { addEdge(from.id, c.id); setOpen(false); }} className="w-full text-left text-[11px] hover:bg-muted px-1.5 py-1 rounded truncate">{c.label}</button>
              )}
            </div>
          ))}
          <button onClick={() => setOpen(false)} className="w-full text-[10px] text-muted-foreground hover:bg-muted px-1.5 py-1 rounded mt-1">Cancelar</button>
        </div>
      )}
    </>
  );
}

function EdgeSvg({ edge, nodes, onRemove }: { edge: JourneyEdge; nodes: JourneyNode[]; onRemove: () => void }) {
  const a = nodes.find(n => n.id === edge.from);
  const b = nodes.find(n => n.id === edge.to);
  if (!a || !b) return null;
  const x1 = a.x + NODE_W / 2;
  const y1 = a.y + NODE_H;
  const x2 = b.x + NODE_W / 2;
  const y2 = b.y;
  const midY = (y1 + y2) / 2;
  const path = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;
  const branchColor = edge.branch === "sim" ? "hsl(160 84% 39%)" : edge.branch === "nao" ? "hsl(0 84% 60%)" : "hsl(var(--muted-foreground))";
  return (
    <g className="pointer-events-auto">
      <path d={path} stroke={branchColor} strokeWidth="2" fill="none" markerEnd="url(#arrow)" opacity={0.6} />
      {edge.branch && (
        <text x={(x1 + x2) / 2} y={midY - 4} fill={branchColor} fontSize="10" fontWeight="bold" textAnchor="middle">
          {edge.branch === "sim" ? "Sim" : "Não"}
        </text>
      )}
      <circle cx={(x1 + x2) / 2} cy={midY + 8} r="7" fill="hsl(var(--background))" stroke={branchColor} strokeWidth="1" className="cursor-pointer" onClick={onRemove}>
        <title>Remover conexão</title>
      </circle>
      <text x={(x1 + x2) / 2} y={midY + 11} fontSize="10" fill={branchColor} textAnchor="middle" className="cursor-pointer pointer-events-none">×</text>
    </g>
  );
}

function NodeInspector({ node, draft, onChange, onRemove, addEdge }: {
  node: JourneyNode; draft: Jornada; onChange: (p: Partial<JourneyNode>) => void; onRemove: () => void; addEdge: (f: string, t: string, br?: "sim" | "nao") => void;
}) {
  const cfg = KIND_CFG[node.kind];
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded ${cfg.bg}`}>
          <cfg.icon className={`h-3.5 w-3.5 ${cfg.color}`} />
          <span className={`text-[10px] uppercase font-bold ${cfg.color}`}>{cfg.label}</span>
        </div>
        <button onClick={onRemove} className="h-6 w-6 rounded hover:bg-rose-500/10 text-rose-600 flex items-center justify-center" title="Remover">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <Field label="Título">
        <input value={node.label} onChange={e => onChange({ label: e.target.value })}
          className="w-full bg-card border border-border rounded-lg px-2 py-1.5 text-[12px] focus:outline-none focus:ring-1 focus:ring-ring" />
      </Field>

      <Field label="Descrição">
        <textarea value={node.description || ""} onChange={e => onChange({ description: e.target.value })} rows={2}
          className="w-full bg-card border border-border rounded-lg px-2 py-1.5 text-[12px] focus:outline-none focus:ring-1 focus:ring-ring" />
      </Field>

      {node.kind === "trigger" && (
        <Field label="Tipo de gatilho">
          <select value={node.triggerType || ""} onChange={e => onChange({ triggerType: e.target.value as TriggerType, label: triggerLabels[e.target.value as TriggerType] })}
            className="w-full bg-card border border-border rounded-lg px-2 py-1.5 text-[12px] focus:outline-none focus:ring-1 focus:ring-ring">
            <option value="">Selecione...</option>
            {triggerCatalog.map(t => <option key={t.type} value={t.type}>{triggerLabels[t.type]}</option>)}
          </select>
        </Field>
      )}
      {node.kind === "action" && (
        <Field label="Tipo de ação">
          <select value={node.actionType || ""} onChange={e => onChange({ actionType: e.target.value as ActionType, label: actionLabels[e.target.value as ActionType] })}
            className="w-full bg-card border border-border rounded-lg px-2 py-1.5 text-[12px] focus:outline-none focus:ring-1 focus:ring-ring">
            <option value="">Selecione...</option>
            {actionCatalog.map(a => <option key={a.type} value={a.type}>{actionLabels[a.type]}</option>)}
          </select>
        </Field>
      )}
      {node.kind === "condition" && (
        <Field label="Tipo de condição">
          <select value={node.conditionType || ""} onChange={e => onChange({ conditionType: e.target.value as ConditionType, label: conditionLabels[e.target.value as ConditionType] })}
            className="w-full bg-card border border-border rounded-lg px-2 py-1.5 text-[12px] focus:outline-none focus:ring-1 focus:ring-ring">
            <option value="">Selecione...</option>
            {conditionCatalog.map(c => <option key={c.type} value={c.type}>{conditionLabels[c.type]}</option>)}
          </select>
        </Field>
      )}
      {node.kind === "delay" && (
        <Field label="Duração">
          <input value={node.label} onChange={e => onChange({ label: e.target.value })} placeholder="Ex.: 2 dias, 4 horas"
            className="w-full bg-card border border-border rounded-lg px-2 py-1.5 text-[12px] focus:outline-none focus:ring-1 focus:ring-ring" />
        </Field>
      )}

      <div className="mt-4 pt-3 border-t border-border">
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-bold mb-1.5">Conexões saindo</p>
        <div className="space-y-1">
          {draft.edges.filter(e => e.from === node.id).map(e => {
            const t = draft.nodes.find(n => n.id === e.to);
            return (
              <div key={e.id} className="flex items-center gap-1.5 text-[11px] bg-muted/40 rounded px-2 py-1">
                {e.branch && <span className={`text-[9px] uppercase font-bold ${e.branch === "sim" ? "text-emerald-600" : "text-rose-600"}`}>{e.branch}</span>}
                <span className="text-foreground truncate flex-1">→ {t?.label}</span>
              </div>
            );
          })}
          {draft.edges.filter(e => e.from === node.id).length === 0 && (
            <p className="text-[10px] text-muted-foreground italic">Sem conexões saindo</p>
          )}
        </div>
      </div>

      {node.stats && (
        <div className="mt-4 pt-3 border-t border-border">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-bold mb-1.5">Execução</p>
          <div className="grid grid-cols-2 gap-1.5 text-center">
            <div className="bg-muted/40 rounded px-2 py-1.5">
              <p className="text-[9px] uppercase text-muted-foreground">Entraram</p>
              <p className="text-sm font-bold text-foreground tabular-nums">{formatNum(node.stats.entrou)}</p>
            </div>
            <div className="bg-muted/40 rounded px-2 py-1.5">
              <p className="text-[9px] uppercase text-muted-foreground">Saíram</p>
              <p className="text-sm font-bold text-foreground tabular-nums">{formatNum(node.stats.saiu)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <label className="text-[10px] uppercase tracking-wide text-muted-foreground font-bold block mb-1">{label}</label>
      {children}
    </div>
  );
}

function KpiMini({ label, value, sub, highlight }: { label: string; value: string; sub?: string; highlight?: boolean }) {
  return (
    <div className={`border rounded-xl p-2.5 ${highlight ? "bg-emerald-500/5 border-emerald-500/20" : "bg-card border-border"}`}>
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">{label}</p>
      <p className={`text-base font-bold tabular-nums ${highlight ? "text-emerald-600" : "text-foreground"}`}>{value}</p>
      {sub && <p className="text-[9px] text-muted-foreground">{sub}</p>}
    </div>
  );
}
