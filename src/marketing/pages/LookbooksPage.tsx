import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMarketing } from "../contexts/MarketingDataContext";
import { Lookbook, StatusLookbook, statusLookbookCfg } from "../data/mockLookbooks";
import { Plus, Search, BookOpen, MoreVertical, Copy, Trash2, Eye, Share2, ExternalLink, TrendingUp, Globe } from "lucide-react";
import { formatBRLCompact, formatNum } from "../styles/tokens";

const FILTROS: (StatusLookbook | "todos")[] = ["todos", "publicado", "rascunho", "arquivado"];

export default function LookbooksPage() {
  const navigate = useNavigate();
  const { lookbooks, duplicarLookbook, excluirLookbook, criarLookbook } = useMarketing();
  const [status, setStatus] = useState<StatusLookbook | "todos">("todos");
  const [search, setSearch] = useState("");
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const lista = useMemo(() => lookbooks.filter(l =>
    (status === "todos" || l.status === status) &&
    (!search || l.nome.toLowerCase().includes(search.toLowerCase()))
  ), [lookbooks, status, search]);

  const kpis = useMemo(() => ({
    publicados: lookbooks.filter(l => l.status === "publicado").length,
    views: lookbooks.reduce((a, l) => a + l.views, 0),
    cliques: lookbooks.reduce((a, l) => a + l.cliquesProduto, 0),
    receita: lookbooks.reduce((a, l) => a + l.receitaAtribuida, 0),
  }), [lookbooks]);

  const novo = () => {
    const id = criarLookbook({
      nome: "Novo lookbook", slug: `novo-${Date.now().toString().slice(-5)}`, descricao: "",
      status: "rascunho", capaUrl: "/src/assets/concept-1.jpg",
      paleta: { primaria: "#363BB4", fundo: "#080846", texto: "#FFFFFF" },
      paginas: [{ id: "p1", tipo: "capa", titulo: "Novo Lookbook", imagemUrl: "/src/assets/concept-1.jpg" }],
      responsavel: "Time Marketing", tags: [],
      views: 0, visualizadoresUnicos: 0, cliquesProduto: 0, conversoes: 0, receitaAtribuida: 0,
      tempoMedioSeg: 0, shareLinks: [], logs: [],
    });
    navigate(`/marketing/lookbooks/${id}`);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">Lookbooks digitais</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Catálogos enviáveis com tracking público de views, cliques e conversões.</p>
        </div>
        <button onClick={novo} className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground rounded-lg px-3.5 py-2 text-[12px] font-medium hover:opacity-90">
          <Plus className="h-4 w-4" /> Novo lookbook
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        <Kpi icon={Globe} label="Publicados" value={formatNum(kpis.publicados)} />
        <Kpi icon={Eye} label="Views totais" value={formatNum(kpis.views)} />
        <Kpi icon={TrendingUp} label="Cliques em produtos" value={formatNum(kpis.cliques)} />
        <Kpi icon={Share2} label="Receita atribuída" value={formatBRLCompact(kpis.receita)} highlight />
      </div>

      <div className="bg-card border border-border rounded-xl p-3 flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex items-center gap-1 flex-wrap">
          {FILTROS.map(s => (
            <button key={s} onClick={() => setStatus(s)} className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${
              status === s ? "bg-foreground text-background border-foreground" : "bg-card border-border text-muted-foreground hover:text-foreground"
            }`}>{s === "todos" ? "Todos" : statusLookbookCfg[s].label}</button>
          ))}
        </div>
        <div className="md:ml-auto relative">
          <Search className="h-3.5 w-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar lookbooks..."
            className="bg-card border border-border rounded-lg pl-8 pr-3 py-1.5 text-[12px] focus:outline-none focus:ring-1 focus:ring-ring w-full md:w-56" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {lista.map(l => <LookbookCard key={l.id} l={l}
          onOpen={() => navigate(`/marketing/lookbooks/${l.id}`)}
          menuOpen={openMenu === l.id}
          onMenu={() => setOpenMenu(openMenu === l.id ? null : l.id)}
          onDuplicar={() => { duplicarLookbook(l.id); setOpenMenu(null); }}
          onExcluir={() => { excluirLookbook(l.id); setOpenMenu(null); }}
        />)}
        {lista.length === 0 && (
          <div className="md:col-span-3 bg-card border border-dashed border-border rounded-xl p-10 text-center">
            <p className="text-sm text-muted-foreground">Nenhum lookbook encontrado.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Kpi({ icon: Icon, label, value, highlight }: { icon: typeof BookOpen; label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`border rounded-xl p-3 ${highlight ? "bg-emerald-500/5 border-emerald-500/20" : "bg-card border-border"}`}>
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon className={`h-3.5 w-3.5 ${highlight ? "text-emerald-600" : "text-muted-foreground"}`} />
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">{label}</span>
      </div>
      <p className={`text-lg font-bold tabular-nums ${highlight ? "text-emerald-600" : "text-foreground"}`}>{value}</p>
    </div>
  );
}

function LookbookCard({ l, onOpen, menuOpen, onMenu, onDuplicar, onExcluir }: {
  l: Lookbook; onOpen: () => void; menuOpen: boolean; onMenu: () => void; onDuplicar: () => void; onExcluir: () => void;
}) {
  const st = statusLookbookCfg[l.status];
  const publicUrl = `/publico/lookbook/${l.slug}`;
  const copyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(window.location.origin + publicUrl);
  };
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/40 transition-colors group">
      <button onClick={onOpen} className="block w-full aspect-[4/5] bg-muted relative overflow-hidden">
        <img src={l.capaUrl} alt={l.nome} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
        <div className="absolute top-2 left-2"><span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${st.color}`}>{st.label}</span></div>
        <div className="absolute top-2 right-2 relative">
          <button onClick={(e) => { e.stopPropagation(); onMenu(); }} className="h-7 w-7 rounded-lg bg-black/40 backdrop-blur text-white flex items-center justify-center hover:bg-black/60">
            <MoreVertical className="h-4 w-4" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-9 w-44 bg-popover border border-border rounded-lg shadow-lg z-10 py-1" onClick={(e) => e.stopPropagation()}>
              <button onClick={onOpen} className="w-full text-left px-3 py-1.5 text-[12px] hover:bg-muted inline-flex items-center gap-2"><Eye className="h-3.5 w-3.5" /> Editar</button>
              <a href={publicUrl} target="_blank" rel="noreferrer" className="w-full text-left px-3 py-1.5 text-[12px] hover:bg-muted inline-flex items-center gap-2"><ExternalLink className="h-3.5 w-3.5" /> Ver público</a>
              <button onClick={copyLink} className="w-full text-left px-3 py-1.5 text-[12px] hover:bg-muted inline-flex items-center gap-2"><Share2 className="h-3.5 w-3.5" /> Copiar link</button>
              <button onClick={onDuplicar} className="w-full text-left px-3 py-1.5 text-[12px] hover:bg-muted inline-flex items-center gap-2"><Copy className="h-3.5 w-3.5" /> Duplicar</button>
              <button onClick={onExcluir} className="w-full text-left px-3 py-1.5 text-[12px] text-rose-600 hover:bg-rose-500/10 inline-flex items-center gap-2"><Trash2 className="h-3.5 w-3.5" /> Excluir</button>
            </div>
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent text-white">
          <p className="text-[13px] font-bold line-clamp-1">{l.nome}</p>
          <p className="text-[10px] opacity-80 line-clamp-1">{l.descricao}</p>
        </div>
      </button>
      <div className="grid grid-cols-3 gap-1 p-2.5 text-center">
        <div><p className="text-[9px] uppercase text-muted-foreground">Views</p><p className="text-[12px] font-bold text-foreground tabular-nums">{formatNum(l.views)}</p></div>
        <div><p className="text-[9px] uppercase text-muted-foreground">Cliques</p><p className="text-[12px] font-bold text-foreground tabular-nums">{formatNum(l.cliquesProduto)}</p></div>
        <div><p className="text-[9px] uppercase text-muted-foreground">Receita</p><p className="text-[12px] font-bold text-emerald-600 tabular-nums">{formatBRLCompact(l.receitaAtribuida)}</p></div>
      </div>
    </div>
  );
}
