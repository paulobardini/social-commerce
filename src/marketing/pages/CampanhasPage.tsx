import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMarketing } from "../contexts/MarketingDataContext";
import { Campanha, CanalCampanha, StatusCampanha, statusLabels, objetivoLabels, totaisCampanha } from "../data/mockCampanhas";
import { formatBRL, formatBRLCompact, formatNum, formatPct } from "../styles/tokens";
import { Plus, Search, MessageSquare, Mail, MoreVertical, Copy, Trash2, PlayCircle, PauseCircle, Eye, AlertTriangle, FlaskConical, CalendarClock } from "lucide-react";
import { CampanhaWizard } from "../components/CampanhaWizard";

const CANAIS: { id: CanalCampanha | "todos"; label: string; icon: typeof MessageSquare; color: string }[] = [
  { id: "todos", label: "Todas", icon: MessageSquare, color: "text-foreground" },
  { id: "whatsapp", label: "WhatsApp", icon: MessageSquare, color: "text-[#25D366]" },
  { id: "email", label: "E-mail", icon: Mail, color: "text-[#A855F7]" },
];

const STATUS_FILTROS: (StatusCampanha | "todos")[] = ["todos", "rascunho", "agendada", "enviando", "concluida", "pausada"];

export default function CampanhasPage() {
  const navigate = useNavigate();
  const { proprias, integracoes, duplicarCampanha, excluirCampanha, atualizarStatusCampanha } = useMarketing();
  const [canal, setCanal] = useState<CanalCampanha | "todos">("todos");
  const [status, setStatus] = useState<StatusCampanha | "todos">("todos");
  const [search, setSearch] = useState("");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [openWizard, setOpenWizard] = useState(false);

  const wppConectado = integracoes.find(i => i.id === "int_wpp")?.status === "conectado";
  const mailchimpConectado = integracoes.find(i => i.id === "int_mailchimp")?.status === "conectado";

  const lista = useMemo(() => {
    return proprias.filter(c => {
      if (canal !== "todos" && c.canal !== canal) return false;
      if (status !== "todos" && c.status !== status) return false;
      if (search && !c.nome.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [proprias, canal, status, search]);

  // KPIs gerais
  const kpis = useMemo(() => {
    const concluidas = proprias.filter(c => c.status === "concluida");
    let envios = 0, conv = 0, receita = 0, custo = 0;
    concluidas.forEach(c => {
      const t = totaisCampanha(c);
      envios += t.entregues; conv += t.conversoes; receita += t.receitaAtribuida; custo += c.custoEstimado;
    });
    return {
      ativas: proprias.filter(c => ["enviando", "agendada"].includes(c.status)).length,
      envios, conv, receita, custo,
      taxaConv: envios > 0 ? (conv / envios) * 100 : 0,
    };
  }, [proprias]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">Campanhas</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Disparos próprios via WhatsApp Cloud API e Mailchimp com A/B testing.</p>
        </div>
        <button
          onClick={() => setOpenWizard(true)}
          className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground rounded-lg px-3.5 py-2 text-[12px] font-medium hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Nova campanha
        </button>
      </div>

      {/* Alertas integrações */}
      {(!wppConectado || !mailchimpConectado) && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 flex items-start gap-2.5">
          <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
          <div className="flex-1 text-[12px]">
            <p className="text-foreground font-medium">Integrações pendentes</p>
            <p className="text-muted-foreground mt-0.5">
              {!wppConectado && "WhatsApp Cloud API não conectado · "}
              {!mailchimpConectado && "Mailchimp não conectado · "}
              <button onClick={() => navigate("/marketing/integracoes")} className="text-primary font-medium hover:underline">
                Conectar agora
              </button>
            </p>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
        <Kpi label="Ativas" value={formatNum(kpis.ativas)} hint="Enviando + agendadas" />
        <Kpi label="Mensagens entregues" value={formatNum(kpis.envios)} hint="Total acumulado" />
        <Kpi label="Taxa de conversão" value={formatPct(kpis.taxaConv)} hint="Conversões / entregues" />
        <Kpi label="Receita atribuída" value={formatBRLCompact(kpis.receita)} hint="Pedidos ganhos" />
        <Kpi label="Custo total" value={formatBRL(kpis.custo)} hint="WhatsApp Cloud API" />
      </div>

      {/* Filtros */}
      <div className="bg-card border border-border rounded-xl p-3 flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1 w-fit">
          {CANAIS.map(c => (
            <button
              key={c.id}
              onClick={() => setCanal(c.id)}
              className={`text-[11px] font-medium px-2.5 py-1 rounded inline-flex items-center gap-1.5 ${
                canal === c.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <c.icon className={`h-3 w-3 ${canal === c.id ? c.color : ""}`} /> {c.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {STATUS_FILTROS.map(s => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${
                status === s ? "bg-foreground text-background border-foreground" : "bg-card text-muted-foreground border-border hover:text-foreground"
              }`}
            >
              {s === "todos" ? "Todos" : statusLabels[s as StatusCampanha].label}
            </button>
          ))}
        </div>
        <div className="md:ml-auto relative">
          <Search className="h-3.5 w-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar campanhas..."
            className="bg-card border border-border rounded-lg pl-8 pr-3 py-1.5 text-[12px] focus:outline-none focus:ring-1 focus:ring-ring w-full md:w-56"
          />
        </div>
      </div>

      {/* Lista */}
      <div className="grid grid-cols-1 gap-2.5">
        {lista.length === 0 && (
          <div className="bg-card border border-dashed border-border rounded-xl p-10 text-center">
            <p className="text-sm text-muted-foreground">Nenhuma campanha encontrada com esses filtros.</p>
          </div>
        )}
        {lista.map(c => <CampanhaCard key={c.id} c={c}
          onOpen={() => navigate(`/marketing/campanhas/${c.id}`)}
          onMenu={() => setOpenMenu(openMenu === c.id ? null : c.id)}
          menuOpen={openMenu === c.id}
          onDuplicar={() => { duplicarCampanha(c.id); setOpenMenu(null); }}
          onExcluir={() => { excluirCampanha(c.id); setOpenMenu(null); }}
          onPausar={() => { atualizarStatusCampanha(c.id, c.status === "enviando" ? "pausada" : "enviando"); setOpenMenu(null); }}
        />)}
      </div>

      {openWizard && <CampanhaWizard onClose={() => setOpenWizard(false)} onCreated={(id) => { setOpenWizard(false); navigate(`/marketing/campanhas/${id}`); }} />}
    </div>
  );
}

function Kpi({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-3">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">{label}</p>
      <p className="text-lg font-bold text-foreground mt-1 tabular-nums">{value}</p>
      <p className="text-[10px] text-muted-foreground mt-0.5">{hint}</p>
    </div>
  );
}

function CampanhaCard({ c, onOpen, onMenu, menuOpen, onDuplicar, onExcluir, onPausar }: {
  c: Campanha; onOpen: () => void; onMenu: () => void; menuOpen: boolean;
  onDuplicar: () => void; onExcluir: () => void; onPausar: () => void;
}) {
  const t = totaisCampanha(c);
  const tx = c.totalDestinatarios > 0 && t.entregues > 0 ? (t.conversoes / t.entregues) * 100 : 0;
  const Icon = c.canal === "whatsapp" ? MessageSquare : Mail;
  const channelColor = c.canal === "whatsapp" ? "bg-[#25D366]/10 text-[#25D366]" : "bg-[#A855F7]/10 text-[#A855F7]";
  const st = statusLabels[c.status];

  return (
    <div className="bg-card border border-border rounded-xl p-4 hover:border-primary/40 transition-colors">
      <div className="flex items-start gap-3">
        <button onClick={onOpen} className={`h-10 w-10 rounded-lg ${channelColor} flex items-center justify-center shrink-0`}>
          <Icon className="h-5 w-5" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <button onClick={onOpen} className="text-sm font-semibold text-foreground hover:text-primary text-left truncate block">
                {c.nome}
              </button>
              <div className="flex items-center gap-1.5 flex-wrap mt-1">
                <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${st.color}`}>{st.label}</span>
                <span className="text-[10px] text-muted-foreground">·</span>
                <span className="text-[10px] text-muted-foreground">{objetivoLabels[c.objetivo]}</span>
                <span className="text-[10px] text-muted-foreground">·</span>
                <span className="text-[10px] text-muted-foreground truncate">{c.segmentoNome} ({formatNum(c.totalDestinatarios)})</span>
                {c.abTeste && (
                  <span className="text-[9px] uppercase font-bold bg-amber-500/10 text-amber-600 px-1.5 py-0.5 rounded inline-flex items-center gap-1">
                    <FlaskConical className="h-2.5 w-2.5" /> A/B
                  </span>
                )}
              </div>
            </div>
            <div className="relative shrink-0">
              <button onClick={onMenu} className="h-7 w-7 rounded-lg hover:bg-muted flex items-center justify-center">
                <MoreVertical className="h-4 w-4 text-muted-foreground" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-8 w-44 bg-popover border border-border rounded-lg shadow-lg z-10 py-1">
                  <button onClick={onOpen} className="w-full text-left px-3 py-1.5 text-[12px] hover:bg-muted inline-flex items-center gap-2"><Eye className="h-3.5 w-3.5" /> Abrir</button>
                  {(c.status === "enviando" || c.status === "pausada") && (
                    <button onClick={onPausar} className="w-full text-left px-3 py-1.5 text-[12px] hover:bg-muted inline-flex items-center gap-2">
                      {c.status === "enviando" ? <><PauseCircle className="h-3.5 w-3.5" /> Pausar</> : <><PlayCircle className="h-3.5 w-3.5" /> Retomar</>}
                    </button>
                  )}
                  <button onClick={onDuplicar} className="w-full text-left px-3 py-1.5 text-[12px] hover:bg-muted inline-flex items-center gap-2"><Copy className="h-3.5 w-3.5" /> Duplicar</button>
                  <button onClick={onExcluir} className="w-full text-left px-3 py-1.5 text-[12px] text-rose-600 hover:bg-rose-500/10 inline-flex items-center gap-2"><Trash2 className="h-3.5 w-3.5" /> Excluir</button>
                </div>
              )}
            </div>
          </div>

          {/* Métricas inline */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-3 pt-3 border-t border-border">
            <Mini label="Entregues" value={formatNum(t.entregues)} />
            <Mini label="Aberturas" value={formatNum(t.abertos)} />
            <Mini label="Cliques" value={formatNum(t.cliques)} />
            <Mini label="Conversões" value={formatNum(t.conversoes)} hint={tx > 0 ? formatPct(tx) : "—"} />
            <Mini label="Receita" value={formatBRLCompact(t.receitaAtribuida)} highlight />
          </div>
          {(c.agendadaPara || c.enviadaEm) && (
            <p className="text-[10px] text-muted-foreground mt-2 inline-flex items-center gap-1">
              <CalendarClock className="h-3 w-3" />
              {c.status === "agendada" ? `Agendada para ${c.agendadaPara}` : `Enviada em ${c.enviadaEm}`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Mini({ label, value, hint, highlight }: { label: string; value: string; hint?: string; highlight?: boolean }) {
  return (
    <div>
      <p className="text-[9px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`text-sm font-bold tabular-nums ${highlight ? "text-emerald-600" : "text-foreground"}`}>{value}</p>
      {hint && <p className="text-[9px] text-muted-foreground">{hint}</p>}
    </div>
  );
}
