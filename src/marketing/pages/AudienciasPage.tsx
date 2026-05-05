import { useMemo, useState } from "react";
import { useMarketing } from "../contexts/MarketingDataContext";
import { Audiencia, RegraAudiencia, RegraCampo, RegraOperador, campoLabels, campoOpcoes, operadorLabels, avaliarRegras } from "../data/mockAudiencias";
import { mockClientes360 } from "@/data/mockCRM360";
import { formatBRLCompact, formatNum } from "../styles/tokens";
import { Users, Star, Flame, AlertTriangle, Sparkles, RotateCw, Plus, Search, RefreshCw, Trash2, Copy, Send, ArrowRight, X, ChevronDown, Database, Facebook, Pencil } from "lucide-react";
import { Link } from "react-router-dom";

const iconMap = { Users, Star, Flame, AlertTriangle, Sparkles, RotateCw } as const;

const origemLabels: Record<Audiencia["origem"], string> = {
  manual: "Manual", regra_crm: "Regra CRM", importada_meta: "Meta Ads", lookalike: "Lookalike", lookbook: "Lookbook", campanha: "Campanha",
};
const origemColors: Record<Audiencia["origem"], string> = {
  manual: "bg-slate-100 text-slate-700", regra_crm: "bg-emerald-100 text-emerald-700",
  importada_meta: "bg-blue-100 text-blue-700", lookalike: "bg-indigo-100 text-indigo-700",
  lookbook: "bg-purple-100 text-purple-700", campanha: "bg-amber-100 text-amber-700",
};

export function AudienciasPage() {
  const { audiencias, duplicarAudiencia, excluirAudiencia, recalcAudiencia, syncAudienciaMeta } = useMarketing();
  const [busca, setBusca] = useState("");
  const [origemFiltro, setOrigemFiltro] = useState<Audiencia["origem"] | "all">("all");
  const [selecionada, setSelecionada] = useState<Audiencia | null>(null);
  const [editor, setEditor] = useState<{ open: boolean; audiencia?: Audiencia | null }>({ open: false });

  const filtradas = useMemo(() => audiencias.filter(a =>
    (origemFiltro === "all" || a.origem === origemFiltro) &&
    (busca === "" || a.nome.toLowerCase().includes(busca.toLowerCase()))
  ), [audiencias, busca, origemFiltro]);

  const totalCRM = mockClientes360.length;
  const totalAtivas = audiencias.filter(a => a.status === "ativa").length;
  const totalReceita = audiencias.reduce((s, a) => s + a.receitaAtribuida, 0);

  if (selecionada) return <AudienciaDetalhe audiencia={selecionada} onBack={() => setSelecionada(null)} onEdit={(a) => setEditor({ open: true, audiencia: a })} />;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">Audiências</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Segmente sua base do CRM e sincronize com Meta Custom Audiences.</p>
        </div>
        <button onClick={() => setEditor({ open: true, audiencia: null })} className="bg-primary text-primary-foreground px-3.5 py-2 rounded-lg text-[12px] font-semibold hover:opacity-90 inline-flex items-center gap-1.5">
          <Plus className="h-4 w-4" /> Nova audiência
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPI label="Audiências ativas" value={String(totalAtivas)} icon={<Users className="h-4 w-4" />} accent="primary" />
        <KPI label="Base total CRM" value={formatNum(totalCRM)} icon={<Database className="h-4 w-4" />} accent="accent" />
        <KPI label="Sync com Meta" value={String(audiencias.filter(a => a.syncMeta).length)} icon={<Facebook className="h-4 w-4" />} accent="info" />
        <KPI label="Receita atribuída" value={formatBRLCompact(totalReceita)} icon={<Sparkles className="h-4 w-4" />} accent="success" />
      </div>

      {/* Filtros */}
      <div className="bg-card border border-border rounded-xl p-3 flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar audiência..." className="w-full pl-8 pr-3 py-1.5 text-[12px] bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-ring" />
        </div>
        <select value={origemFiltro} onChange={e => setOrigemFiltro(e.target.value as never)} className="text-[12px] bg-background border border-border rounded-lg px-2.5 py-1.5">
          <option value="all">Todas as origens</option>
          {Object.entries(origemLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {/* Lista */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {filtradas.map(a => {
          const Icon = iconMap[a.icone];
          return (
            <div key={a.id} className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-shadow group cursor-pointer" onClick={() => setSelecionada(a)}>
              <div className="flex items-start gap-3 mb-3">
                <div className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: a.cor + "22", color: a.cor }}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-foreground truncate">{a.nome}</p>
                  <p className="text-[11px] text-muted-foreground line-clamp-1">{a.descricao}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap mb-3">
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${origemColors[a.origem]}`}>{origemLabels[a.origem]}</span>
                {a.syncMeta && <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-blue-100 text-blue-700 inline-flex items-center gap-1"><Facebook className="h-2.5 w-2.5" /> {a.syncMeta.status === "ok" ? "Sincronizada" : "Sincronizando"}</span>}
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${a.status === "ativa" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"}`}>{a.status}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border">
                <div><p className="text-[9px] uppercase text-muted-foreground">Membros</p><p className="text-[13px] font-bold tabular-nums">{formatNum(a.totalMembros)}</p></div>
                <div><p className="text-[9px] uppercase text-muted-foreground">Conv.</p><p className="text-[13px] font-bold tabular-nums">{a.conversoes}</p></div>
                <div><p className="text-[9px] uppercase text-muted-foreground">Receita</p><p className="text-[13px] font-bold tabular-nums text-emerald-600">{formatBRLCompact(a.receitaAtribuida)}</p></div>
              </div>
              <div className="flex items-center gap-1.5 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={(e) => { e.stopPropagation(); recalcAudiencia(a.id); }} title="Recalcular" className="p-1.5 hover:bg-muted rounded text-muted-foreground"><RefreshCw className="h-3.5 w-3.5" /></button>
                {a.syncMeta && <button onClick={(e) => { e.stopPropagation(); syncAudienciaMeta(a.id); }} title="Sincronizar Meta" className="p-1.5 hover:bg-muted rounded text-muted-foreground"><Facebook className="h-3.5 w-3.5" /></button>}
                <button onClick={(e) => { e.stopPropagation(); duplicarAudiencia(a.id); }} title="Duplicar" className="p-1.5 hover:bg-muted rounded text-muted-foreground"><Copy className="h-3.5 w-3.5" /></button>
                <button onClick={(e) => { e.stopPropagation(); setEditor({ open: true, audiencia: a }); }} title="Editar" className="p-1.5 hover:bg-muted rounded text-muted-foreground"><Pencil className="h-3.5 w-3.5" /></button>
                <button onClick={(e) => { e.stopPropagation(); if (confirm("Excluir audiência?")) excluirAudiencia(a.id); }} title="Excluir" className="p-1.5 hover:bg-muted rounded text-rose-600 ml-auto"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          );
        })}
        {filtradas.length === 0 && (
          <p className="col-span-full text-[13px] text-muted-foreground text-center py-10">Nenhuma audiência encontrada.</p>
        )}
      </div>

      {editor.open && (
        <AudienciaEditor audiencia={editor.audiencia ?? null} onClose={() => setEditor({ open: false })} />
      )}
    </div>
  );
}

function KPI({ label, value, icon, accent }: { label: string; value: string; icon: React.ReactNode; accent: "primary" | "accent" | "success" | "info" }) {
  const cls = { primary: "bg-primary/10 text-primary", accent: "bg-accent/10 text-accent", success: "bg-emerald-500/10 text-emerald-600", info: "bg-blue-500/10 text-blue-600" }[accent];
  return (
    <div className="bg-card border border-border rounded-xl p-3 md:p-4">
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">{label}</p>
        <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${cls}`}>{icon}</div>
      </div>
      <p className="text-xl md:text-2xl font-bold text-foreground tabular-nums leading-tight">{value}</p>
    </div>
  );
}

// ===== Detalhe =====
function AudienciaDetalhe({ audiencia, onBack, onEdit }: { audiencia: Audiencia; onBack: () => void; onEdit: (a: Audiencia) => void }) {
  const Icon = iconMap[audiencia.icone];
  const membros = mockClientes360.filter(c => audiencia.membrosClienteIds.includes(c.id));
  return (
    <div className="space-y-5">
      <button onClick={onBack} className="text-[12px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1">← Voltar</button>
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-start gap-4 flex-wrap">
          <div className="h-12 w-12 rounded-lg flex items-center justify-center shrink-0" style={{ background: audiencia.cor + "22", color: audiencia.cor }}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-foreground">{audiencia.nome}</h1>
            <p className="text-[12px] text-muted-foreground mt-0.5">{audiencia.descricao}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${origemColors[audiencia.origem]}`}>{origemLabels[audiencia.origem]}</span>
              <span className="text-[10px] text-muted-foreground">Atualizada: {audiencia.ultimaAtualizacao}</span>
              <span className="text-[10px] text-muted-foreground">Por: {audiencia.criadaPor}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onEdit(audiencia)} className="text-[12px] px-3 py-1.5 border border-border rounded-lg hover:bg-muted inline-flex items-center gap-1.5"><Pencil className="h-3.5 w-3.5" /> Editar</button>
            <Link to="/marketing/campanhas" className="text-[12px] bg-primary text-primary-foreground px-3 py-1.5 rounded-lg hover:opacity-90 inline-flex items-center gap-1.5"><Send className="h-3.5 w-3.5" /> Usar em campanha</Link>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5 pt-4 border-t border-border">
          <Stat label="Membros" value={formatNum(audiencia.totalMembros)} />
          <Stat label="Conversões" value={String(audiencia.conversoes)} />
          <Stat label="Receita" value={formatBRLCompact(audiencia.receitaAtribuida)} />
          <Stat label="CPA médio" value={audiencia.cpaMedio > 0 ? formatBRLCompact(audiencia.cpaMedio) : "—"} />
        </div>
      </div>

      {/* Regras */}
      {audiencia.regras && audiencia.regras.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-3">Regras de segmentação</h2>
          <p className="text-[11px] text-muted-foreground mb-3">Cliente entra na audiência se {audiencia.matchAll ? "TODAS" : "QUALQUER UMA"} das regras abaixo for verdadeira:</p>
          <div className="space-y-2">
            {audiencia.regras.map(r => (
              <div key={r.id} className="flex items-center gap-2 p-2.5 bg-muted/40 rounded-lg text-[12px]">
                <span className="font-medium text-foreground">{campoLabels[r.campo]}</span>
                <span className="text-muted-foreground">{operadorLabels[r.operador]}</span>
                <span className="font-medium text-primary">{Array.isArray(r.valor) ? r.valor.join(", ") : String(r.valor)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {audiencia.syncMeta && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Facebook className="h-5 w-5 text-blue-600" />
            <h2 className="text-sm font-semibold text-blue-900">Sincronização Meta Ads</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[12px]">
            <div><p className="text-blue-700 text-[10px] uppercase">Conta</p><p className="font-medium text-blue-900">{audiencia.syncMeta.contaId}</p></div>
            <div><p className="text-blue-700 text-[10px] uppercase">Audience ID</p><p className="font-mono text-blue-900">{audiencia.syncMeta.audienceMetaId}</p></div>
            <div><p className="text-blue-700 text-[10px] uppercase">Último sync</p><p className="text-blue-900">{audiencia.syncMeta.ultimoSync}</p></div>
            <div><p className="text-blue-700 text-[10px] uppercase">Status</p><p className="text-blue-900 capitalize">{audiencia.syncMeta.status}</p></div>
          </div>
        </div>
      )}

      {/* Histórico de uso */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="text-sm font-semibold text-foreground mb-3">Histórico de uso</h2>
        {audiencia.historicoUso.length === 0 ? (
          <p className="text-[12px] text-muted-foreground">Audiência ainda não foi usada em campanhas/jornadas.</p>
        ) : (
          <div className="space-y-1.5">
            {audiencia.historicoUso.map(u => (
              <div key={u.id} className="flex items-center justify-between p-2.5 hover:bg-muted/40 rounded-lg text-[12px]">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-medium px-2 py-0.5 rounded bg-muted">{u.contexto}</span>
                  <span className="font-medium text-foreground">{u.refNome}</span>
                </div>
                <span className="text-[11px] text-muted-foreground">{u.data}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Membros */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground">Membros · {membros.length}</h2>
          {audiencia.origem !== "regra_crm" && <span className="text-[11px] text-muted-foreground">Importados do Meta — sem detalhe individual</span>}
        </div>
        {membros.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="text-left text-[10px] uppercase text-muted-foreground border-b border-border">
                  <th className="px-2 py-2">Cliente</th><th className="px-2 py-2">Cidade</th><th className="px-2 py-2">Nicho</th><th className="px-2 py-2">Status</th><th className="px-2 py-2 text-right">Pedidos</th>
                </tr>
              </thead>
              <tbody>
                {membros.slice(0, 50).map(c => (
                  <tr key={c.id} className="border-b border-border hover:bg-muted/40">
                    <td className="px-2 py-2"><Link to={`/vendedor/360/${c.id}`} className="font-medium text-foreground hover:text-primary">{c.nomeFantasia}</Link></td>
                    <td className="px-2 py-2 text-muted-foreground">{c.cidade}/{c.estado}</td>
                    <td className="px-2 py-2 text-muted-foreground capitalize">{c.nicho}</td>
                    <td className="px-2 py-2"><span className="text-[10px] px-1.5 py-0.5 rounded bg-muted">{c.status}</span></td>
                    <td className="px-2 py-2 text-right tabular-nums">{c.pedidosRealizados}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {membros.length > 50 && <p className="text-[11px] text-muted-foreground text-center mt-3">+ {membros.length - 50} clientes</p>}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase text-muted-foreground">{label}</p>
      <p className="text-lg font-bold tabular-nums">{value}</p>
    </div>
  );
}

// ===== Editor (criar/editar) =====
function AudienciaEditor({ audiencia, onClose }: { audiencia: Audiencia | null; onClose: () => void }) {
  const { criarAudiencia, atualizarAudiencia } = useMarketing();
  const [nome, setNome] = useState(audiencia?.nome || "");
  const [descricao, setDescricao] = useState(audiencia?.descricao || "");
  const [matchAll, setMatchAll] = useState(audiencia?.matchAll ?? true);
  const [regras, setRegras] = useState<RegraAudiencia[]>(audiencia?.regras || [{ id: `r${Date.now()}`, campo: "status", operador: "in", valor: ["ativo"] }]);
  const [cor, setCor] = useState(audiencia?.cor || "#363BB4");
  const [icone, setIcone] = useState<Audiencia["icone"]>(audiencia?.icone || "Users");

  const preview = useMemo(() => avaliarRegras(regras, matchAll).length, [regras, matchAll]);

  const addRegra = () => setRegras(prev => [...prev, { id: `r${Date.now()}`, campo: "tag", operador: "in", valor: [] }]);
  const updRegra = (id: string, patch: Partial<RegraAudiencia>) => setRegras(prev => prev.map(r => r.id === id ? { ...r, ...patch } as RegraAudiencia : r));
  const delRegra = (id: string) => setRegras(prev => prev.filter(r => r.id !== id));

  const salvar = () => {
    if (!nome.trim()) { alert("Defina um nome"); return; }
    const payload = { nome, descricao, origem: "regra_crm" as const, status: "ativa" as const, matchAll, regras, conversoes: 0, receitaAtribuida: 0, cpaMedio: 0, criadaPor: "Time Marketing", cor, icone, historicoUso: [] };
    if (audiencia) atualizarAudiencia({ ...audiencia, ...payload });
    else criarAudiencia(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base font-semibold">{audiencia ? "Editar audiência" : "Nova audiência"}</h2>
            <p className="text-[11px] text-muted-foreground">Combine regras sobre seu CRM para gerar segmentos dinâmicos.</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded"><X className="h-4 w-4" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] uppercase text-muted-foreground font-medium">Nome</label>
              <input value={nome} onChange={e => setNome(e.target.value)} className="w-full mt-1 px-3 py-2 text-[13px] bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-ring" placeholder="Ex.: Lojistas SP em risco" />
            </div>
            <div>
              <label className="text-[11px] uppercase text-muted-foreground font-medium">Ícone & Cor</label>
              <div className="flex items-center gap-2 mt-1">
                <select value={icone} onChange={e => setIcone(e.target.value as Audiencia["icone"])} className="flex-1 px-3 py-2 text-[13px] bg-background border border-border rounded-lg">
                  {Object.keys(iconMap).map(k => <option key={k} value={k}>{k}</option>)}
                </select>
                <input type="color" value={cor} onChange={e => setCor(e.target.value)} className="h-10 w-12 rounded-lg border border-border" />
              </div>
            </div>
          </div>
          <div>
            <label className="text-[11px] uppercase text-muted-foreground font-medium">Descrição</label>
            <textarea value={descricao} onChange={e => setDescricao(e.target.value)} rows={2} className="w-full mt-1 px-3 py-2 text-[13px] bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-ring resize-none" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] uppercase text-muted-foreground font-medium">Regras</label>
              <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                <button onClick={() => setMatchAll(true)} className={`text-[11px] font-medium px-2.5 py-1 rounded ${matchAll ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>Todas (E)</button>
                <button onClick={() => setMatchAll(false)} className={`text-[11px] font-medium px-2.5 py-1 rounded ${!matchAll ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>Qualquer (OU)</button>
              </div>
            </div>
            <div className="space-y-2">
              {regras.map(r => <RegraRow key={r.id} regra={r} onChange={(p) => updRegra(r.id, p)} onDelete={() => delRegra(r.id)} />)}
              <button onClick={addRegra} className="text-[12px] text-primary hover:underline inline-flex items-center gap-1"><Plus className="h-3.5 w-3.5" /> Adicionar regra</button>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase text-muted-foreground">Preview de membros</p>
              <p className="text-2xl font-bold text-primary tabular-nums">{formatNum(preview)}</p>
            </div>
            <p className="text-[11px] text-muted-foreground">de {formatNum(mockClientes360.length)} clientes no CRM</p>
          </div>
        </div>

        <div className="px-5 py-3 border-t border-border flex items-center justify-end gap-2 shrink-0">
          <button onClick={onClose} className="text-[12px] px-3 py-1.5 border border-border rounded-lg hover:bg-muted">Cancelar</button>
          <button onClick={salvar} className="text-[12px] bg-primary text-primary-foreground px-4 py-1.5 rounded-lg hover:opacity-90 font-semibold">{audiencia ? "Salvar" : "Criar audiência"}</button>
        </div>
      </div>
    </div>
  );
}

function RegraRow({ regra, onChange, onDelete }: { regra: RegraAudiencia; onChange: (p: Partial<RegraAudiencia>) => void; onDelete: () => void }) {
  const opts = campoOpcoes[regra.campo];
  return (
    <div className="flex items-start gap-2 p-2.5 bg-muted/40 rounded-lg">
      <select value={regra.campo} onChange={e => {
        const novoCampo = e.target.value as RegraCampo;
        const novosOps = campoOpcoes[novoCampo];
        onChange({ campo: novoCampo, operador: novosOps.operadores[0], valor: novosOps.tipo === "number" ? 0 : [] });
      }} className="text-[12px] bg-background border border-border rounded px-2 py-1.5 min-w-[160px]">
        {Object.entries(campoLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
      </select>
      <select value={regra.operador} onChange={e => onChange({ operador: e.target.value as RegraOperador })} className="text-[12px] bg-background border border-border rounded px-2 py-1.5">
        {opts.operadores.map(o => <option key={o} value={o}>{operadorLabels[o]}</option>)}
      </select>
      <div className="flex-1 min-w-0">
        {opts.tipo === "number" ? (
          regra.operador === "between" ? (
            <div className="flex items-center gap-1">
              <input type="number" value={Array.isArray(regra.valor) ? regra.valor[0] : 0} onChange={e => onChange({ valor: [Number(e.target.value), Array.isArray(regra.valor) ? (regra.valor as number[])[1] : 0] as [number, number] })} className="w-full text-[12px] bg-background border border-border rounded px-2 py-1.5" />
              <span className="text-[11px] text-muted-foreground">e</span>
              <input type="number" value={Array.isArray(regra.valor) ? (regra.valor as number[])[1] : 0} onChange={e => onChange({ valor: [Array.isArray(regra.valor) ? (regra.valor as number[])[0] : 0, Number(e.target.value)] as [number, number] })} className="w-full text-[12px] bg-background border border-border rounded px-2 py-1.5" />
            </div>
          ) : (
            <input type="number" value={typeof regra.valor === "number" ? regra.valor : 0} onChange={e => onChange({ valor: Number(e.target.value) })} className="w-full text-[12px] bg-background border border-border rounded px-2 py-1.5" />
          )
        ) : (
          <div className="flex flex-wrap gap-1">
            {opts.opcoes?.map(op => {
              const sel = Array.isArray(regra.valor) && (regra.valor as string[]).includes(op.value);
              return (
                <button key={op.value} onClick={() => {
                  const arr = Array.isArray(regra.valor) ? [...(regra.valor as string[])] : [];
                  if (sel) onChange({ valor: arr.filter(x => x !== op.value) });
                  else onChange({ valor: [...arr, op.value] });
                }} className={`text-[11px] px-2 py-1 rounded border transition-colors ${sel ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border text-muted-foreground hover:text-foreground"}`}>
                  {op.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
      <button onClick={onDelete} className="p-1.5 hover:bg-rose-50 text-rose-600 rounded shrink-0"><Trash2 className="h-3.5 w-3.5" /></button>
    </div>
  );
}
