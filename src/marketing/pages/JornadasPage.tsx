import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMarketing } from "../contexts/MarketingDataContext";
import { Jornada, StatusJornada, statusJornadaCfg } from "../data/mockJornadas";
import { Plus, Search, GitBranch, MoreVertical, Copy, Trash2, Pause, Play, Eye, Users, TrendingUp, Sparkles } from "lucide-react";
import { formatBRLCompact, formatNum, formatPct } from "../styles/tokens";

const STATUS_FILTROS: (StatusJornada | "todas")[] = ["todas", "ativa", "pausada", "rascunho", "arquivada"];

export default function JornadasPage() {
  const navigate = useNavigate();
  const { jornadas, setStatusJornada, duplicarJornada, excluirJornada, criarJornada } = useMarketing();
  const [status, setStatus] = useState<StatusJornada | "todas">("todas");
  const [search, setSearch] = useState("");
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const lista = useMemo(() => jornadas.filter(j =>
    (status === "todas" || j.status === status) &&
    (!search || j.nome.toLowerCase().includes(search.toLowerCase()))
  ), [jornadas, status, search]);

  const kpis = useMemo(() => ({
    ativas: jornadas.filter(j => j.status === "ativa").length,
    emExecucao: jornadas.reduce((a, j) => a + j.ativos, 0),
    conversoes: jornadas.reduce((a, j) => a + j.conversoes, 0),
    receita: jornadas.reduce((a, j) => a + j.receitaAtribuida, 0),
  }), [jornadas]);

  const novaJornada = () => {
    const id = criarJornada({
      nome: "Nova jornada", descricao: "", status: "rascunho", responsavel: "Time Marketing", tags: [],
      totalEntraram: 0, ativos: 0, concluiram: 0, conversoes: 0, receitaAtribuida: 0,
      nodes: [
        { id: "n1", kind: "trigger", x: 60, y: 60, label: "Selecione um gatilho" },
        { id: "n2", kind: "exit", x: 60, y: 220, label: "Fim" },
      ],
      edges: [{ id: "e1", from: "n1", to: "n2" }],
    });
    navigate(`/marketing/jornadas/${id}`);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">Jornadas automatizadas</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Workflows visuais com gatilhos, condições e ações automáticas integrados ao CRM.</p>
        </div>
        <button onClick={novaJornada} className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground rounded-lg px-3.5 py-2 text-[12px] font-medium hover:opacity-90">
          <Plus className="h-4 w-4" /> Nova jornada
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        <Kpi icon={GitBranch} label="Jornadas ativas" value={formatNum(kpis.ativas)} />
        <Kpi icon={Users} label="Em execução" value={formatNum(kpis.emExecucao)} hint="Contatos no fluxo agora" />
        <Kpi icon={TrendingUp} label="Conversões totais" value={formatNum(kpis.conversoes)} />
        <Kpi icon={Sparkles} label="Receita atribuída" value={formatBRLCompact(kpis.receita)} highlight />
      </div>

      <div className="bg-card border border-border rounded-xl p-3 flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex items-center gap-1 flex-wrap">
          {STATUS_FILTROS.map(s => (
            <button key={s} onClick={() => setStatus(s)} className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${
              status === s ? "bg-foreground text-background border-foreground" : "bg-card border-border text-muted-foreground hover:text-foreground"
            }`}>
              {s === "todas" ? "Todas" : statusJornadaCfg[s].label}
            </button>
          ))}
        </div>
        <div className="md:ml-auto relative">
          <Search className="h-3.5 w-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar jornadas..."
            className="bg-card border border-border rounded-lg pl-8 pr-3 py-1.5 text-[12px] focus:outline-none focus:ring-1 focus:ring-ring w-full md:w-56" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {lista.map(j => <JornadaCard key={j.id} j={j}
          onOpen={() => navigate(`/marketing/jornadas/${j.id}`)}
          menuOpen={openMenu === j.id}
          onMenu={() => setOpenMenu(openMenu === j.id ? null : j.id)}
          onTogglePause={() => { setStatusJornada(j.id, j.status === "ativa" ? "pausada" : "ativa"); setOpenMenu(null); }}
          onDuplicar={() => { duplicarJornada(j.id); setOpenMenu(null); }}
          onExcluir={() => { excluirJornada(j.id); setOpenMenu(null); }}
        />)}
        {lista.length === 0 && (
          <div className="md:col-span-2 bg-card border border-dashed border-border rounded-xl p-10 text-center">
            <p className="text-sm text-muted-foreground">Nenhuma jornada encontrada com esses filtros.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Kpi({ icon: Icon, label, value, hint, highlight }: { icon: typeof GitBranch; label: string; value: string; hint?: string; highlight?: boolean }) {
  return (
    <div className={`border rounded-xl p-3 ${highlight ? "bg-emerald-500/5 border-emerald-500/20" : "bg-card border-border"}`}>
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon className={`h-3.5 w-3.5 ${highlight ? "text-emerald-600" : "text-muted-foreground"}`} />
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">{label}</span>
      </div>
      <p className={`text-lg font-bold tabular-nums ${highlight ? "text-emerald-600" : "text-foreground"}`}>{value}</p>
      {hint && <p className="text-[10px] text-muted-foreground mt-0.5">{hint}</p>}
    </div>
  );
}

function JornadaCard({ j, onOpen, menuOpen, onMenu, onTogglePause, onDuplicar, onExcluir }: {
  j: Jornada; onOpen: () => void; menuOpen: boolean; onMenu: () => void;
  onTogglePause: () => void; onDuplicar: () => void; onExcluir: () => void;
}) {
  const st = statusJornadaCfg[j.status];
  const taxaConv = j.totalEntraram > 0 ? (j.conversoes / j.totalEntraram) * 100 : 0;
  return (
    <div className="bg-card border border-border rounded-xl p-4 hover:border-primary/40 transition-colors">
      <div className="flex items-start gap-3">
        <button onClick={onOpen} className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <GitBranch className="h-5 w-5" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <button onClick={onOpen} className="text-sm font-semibold text-foreground hover:text-primary text-left truncate block">{j.nome}</button>
              <div className="flex items-center gap-1.5 flex-wrap mt-1">
                <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${st.color}`}>{st.label}</span>
                <span className="text-[10px] text-muted-foreground">·</span>
                <span className="text-[10px] text-muted-foreground">{j.nodes.length} etapas</span>
                <span className="text-[10px] text-muted-foreground">·</span>
                <span className="text-[10px] text-muted-foreground truncate">Editado em {j.ultimaEdicao}</span>
              </div>
              {j.descricao && <p className="text-[12px] text-muted-foreground mt-1.5 line-clamp-2">{j.descricao}</p>}
            </div>
            <div className="relative shrink-0">
              <button onClick={onMenu} className="h-7 w-7 rounded-lg hover:bg-muted flex items-center justify-center">
                <MoreVertical className="h-4 w-4 text-muted-foreground" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-8 w-44 bg-popover border border-border rounded-lg shadow-lg z-10 py-1">
                  <button onClick={onOpen} className="w-full text-left px-3 py-1.5 text-[12px] hover:bg-muted inline-flex items-center gap-2"><Eye className="h-3.5 w-3.5" /> Abrir editor</button>
                  {(j.status === "ativa" || j.status === "pausada") && (
                    <button onClick={onTogglePause} className="w-full text-left px-3 py-1.5 text-[12px] hover:bg-muted inline-flex items-center gap-2">
                      {j.status === "ativa" ? <><Pause className="h-3.5 w-3.5" /> Pausar</> : <><Play className="h-3.5 w-3.5" /> Ativar</>}
                    </button>
                  )}
                  <button onClick={onDuplicar} className="w-full text-left px-3 py-1.5 text-[12px] hover:bg-muted inline-flex items-center gap-2"><Copy className="h-3.5 w-3.5" /> Duplicar</button>
                  <button onClick={onExcluir} className="w-full text-left px-3 py-1.5 text-[12px] text-rose-600 hover:bg-rose-500/10 inline-flex items-center gap-2"><Trash2 className="h-3.5 w-3.5" /> Excluir</button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-border">
            <Mini label="Entraram" value={formatNum(j.totalEntraram)} />
            <Mini label="Em fluxo" value={formatNum(j.ativos)} highlight={j.ativos > 0} />
            <Mini label="Conv." value={formatNum(j.conversoes)} sub={taxaConv > 0 ? formatPct(taxaConv) : undefined} />
            <Mini label="Receita" value={formatBRLCompact(j.receitaAtribuida)} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Mini({ label, value, sub, highlight }: { label: string; value: string; sub?: string; highlight?: boolean }) {
  return (
    <div>
      <p className="text-[9px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`text-sm font-bold tabular-nums ${highlight ? "text-amber-600" : "text-foreground"}`}>{value}</p>
      {sub && <p className="text-[9px] text-muted-foreground">{sub}</p>}
    </div>
  );
}
