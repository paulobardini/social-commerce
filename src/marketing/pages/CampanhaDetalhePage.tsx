import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMarketing } from "../contexts/MarketingDataContext";
import { gerarEnviosMock, statusLabels, objetivoLabels, totaisCampanha, VarianteAB, EnvioRegistro } from "../data/mockCampanhas";
import { ArrowLeft, MessageSquare, Mail, FlaskConical, Trophy, Send, Eye, MousePointerClick, Reply, ShoppingCart, AlertTriangle, Pause, Play, Copy, Trash2, Download } from "lucide-react";
import { formatBRL, formatBRLCompact, formatNum, formatPct, channelColors } from "../styles/tokens";

type Tab = "overview" | "ab" | "envios" | "audiencia";

export default function CampanhaDetalhePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { proprias, atualizarStatusCampanha, duplicarCampanha, excluirCampanha } = useMarketing();
  const c = proprias.find(p => p.id === id);
  const [tab, setTab] = useState<Tab>("overview");

  if (!c) {
    return (
      <div className="space-y-4">
        <button onClick={() => navigate("/marketing/campanhas")} className="text-[12px] inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Voltar
        </button>
        <div className="bg-card border border-dashed border-border rounded-xl p-10 text-center">
          <p className="text-sm text-muted-foreground">Campanha não encontrada.</p>
        </div>
      </div>
    );
  }

  const t = totaisCampanha(c);
  const enviado = c.totalDestinatarios > 0 ? (t.entregues / c.totalDestinatarios) * 100 : 0;
  const taxaAbertura = t.entregues > 0 ? (t.abertos / t.entregues) * 100 : 0;
  const taxaClique = t.abertos > 0 ? (t.cliques / t.abertos) * 100 : 0;
  const taxaConv = t.entregues > 0 ? (t.conversoes / t.entregues) * 100 : 0;
  const cpa = t.conversoes > 0 ? c.custoEstimado / t.conversoes : 0;
  const roas = c.custoEstimado > 0 ? t.receitaAtribuida / c.custoEstimado : 0;
  const Icon = c.canal === "whatsapp" ? MessageSquare : Mail;
  const channelColor = c.canal === "whatsapp" ? "bg-[#25D366]/10 text-[#25D366]" : "bg-[#A855F7]/10 text-[#A855F7]";
  const st = statusLabels[c.status];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <button onClick={() => navigate("/marketing/campanhas")} className="text-[12px] inline-flex items-center gap-1 text-muted-foreground hover:text-foreground mb-2">
          <ArrowLeft className="h-3.5 w-3.5" /> Voltar para campanhas
        </button>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-start gap-3">
            <div className={`h-12 w-12 rounded-xl ${channelColor} flex items-center justify-center shrink-0`}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl md:text-2xl font-bold text-foreground">{c.nome}</h1>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${st.color}`}>{st.label}</span>
                {c.abTeste && (
                  <span className="text-[10px] uppercase font-bold bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded inline-flex items-center gap-1">
                    <FlaskConical className="h-3 w-3" /> A/B
                  </span>
                )}
              </div>
              <p className="text-[12px] text-muted-foreground mt-1">
                {objetivoLabels[c.objetivo]} · {c.segmentoNome} · {formatNum(c.totalDestinatarios)} destinatários · Responsável: {c.responsavel}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Criada em {c.criadaEm}{c.enviadaEm ? ` · Enviada em ${c.enviadaEm}` : c.agendadaPara ? ` · Agendada para ${c.agendadaPara}` : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {c.status === "enviando" && (
              <button onClick={() => atualizarStatusCampanha(c.id, "pausada")} className="text-[12px] inline-flex items-center gap-1 bg-card border border-border rounded-lg px-2.5 py-1.5 hover:bg-muted">
                <Pause className="h-3.5 w-3.5" /> Pausar
              </button>
            )}
            {c.status === "pausada" && (
              <button onClick={() => atualizarStatusCampanha(c.id, "enviando")} className="text-[12px] inline-flex items-center gap-1 bg-primary text-primary-foreground rounded-lg px-2.5 py-1.5 hover:opacity-90">
                <Play className="h-3.5 w-3.5" /> Retomar
              </button>
            )}
            <button onClick={() => duplicarCampanha(c.id)} className="text-[12px] inline-flex items-center gap-1 bg-card border border-border rounded-lg px-2.5 py-1.5 hover:bg-muted">
              <Copy className="h-3.5 w-3.5" /> Duplicar
            </button>
            <button onClick={() => { excluirCampanha(c.id); navigate("/marketing/campanhas"); }} className="text-[12px] inline-flex items-center gap-1 text-rose-600 hover:bg-rose-500/10 rounded-lg px-2.5 py-1.5">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Progress */}
      {c.status === "enviando" && (
        <div className="bg-card border border-border rounded-xl p-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[12px] text-foreground font-medium">Progresso do disparo</span>
            <span className="text-[12px] text-muted-foreground tabular-nums">{formatNum(t.entregues)} / {formatNum(c.totalDestinatarios)} ({formatPct(enviado, 0)})</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all" style={{ width: `${enviado}%` }} />
          </div>
        </div>
      )}

      {/* KPIs principais */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2.5">
        <Kpi icon={Send} label="Entregues" value={formatNum(t.entregues)} sub={c.totalDestinatarios > 0 ? formatPct(enviado, 1) : undefined} />
        <Kpi icon={Eye} label="Aberturas" value={formatNum(t.abertos)} sub={formatPct(taxaAbertura)} />
        <Kpi icon={MousePointerClick} label="Cliques" value={formatNum(t.cliques)} sub={formatPct(taxaClique)} />
        {c.canal === "whatsapp" && <Kpi icon={Reply} label="Respostas" value={formatNum(t.respostas)} />}
        <Kpi icon={ShoppingCart} label="Conversões" value={formatNum(t.conversoes)} sub={formatPct(taxaConv)} highlight />
        <Kpi icon={Trophy} label="Receita" value={formatBRLCompact(t.receitaAtribuida)} sub={c.custoEstimado > 0 ? `ROAS ${roas.toFixed(2)}x` : undefined} highlight />
        {c.canal === "whatsapp" && c.custoEstimado > 0 && <Kpi icon={AlertTriangle} label="Custo / CPA" value={formatBRL(c.custoEstimado)} sub={cpa > 0 ? `CPA ${formatBRL(cpa)}` : undefined} />}
      </div>

      {/* Tabs */}
      <div className="border-b border-border flex items-center gap-1">
        {([
          { id: "overview", label: "Visão geral" },
          ...(c.abTeste ? [{ id: "ab" as Tab, label: "Teste A/B" }] : []),
          { id: "envios", label: "Envios" },
          { id: "audiencia", label: "Audiência" },
        ] as { id: Tab; label: string }[]).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`text-[12px] font-medium px-3 py-2 border-b-2 -mb-px transition-colors ${
              tab === t.id ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && <OverviewTab variantes={c.variantes} canal={c.canal} />}
      {tab === "ab" && c.abTeste && <ABTab campanha={c} />}
      {tab === "envios" && <EnviosTab campanhaId={c.id} envios={gerarEnviosMock(c, 32)} />}
      {tab === "audiencia" && <AudienciaTab campanha={c} />}
    </div>
  );
}

function Kpi({ icon: Icon, label, value, sub, highlight }: { icon: typeof Send; label: string; value: string; sub?: string; highlight?: boolean }) {
  return (
    <div className={`border rounded-xl p-3 ${highlight ? "bg-emerald-500/5 border-emerald-500/20" : "bg-card border-border"}`}>
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon className={`h-3.5 w-3.5 ${highlight ? "text-emerald-600" : "text-muted-foreground"}`} />
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">{label}</span>
      </div>
      <p className={`text-lg font-bold tabular-nums ${highlight ? "text-emerald-600" : "text-foreground"}`}>{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

function OverviewTab({ variantes, canal }: { variantes: VarianteAB[]; canal: "whatsapp" | "email" }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {variantes.map(v => (
        <div key={v.id} className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-foreground">{v.nome}</h3>
            <span className="text-[10px] uppercase font-bold bg-muted text-muted-foreground px-2 py-0.5 rounded">Preview</span>
          </div>
          {/* Preview real do conteúdo */}
          {canal === "whatsapp" ? (
            <div className="bg-[#E5DDD5] dark:bg-[#0B141A] rounded-lg p-3 mb-3">
              <div className="bg-white dark:bg-[#202C33] rounded-lg p-2.5 max-w-[85%] shadow-sm">
                {v.template && <p className="text-[9px] uppercase font-bold text-[#25D366] mb-1">Template: {v.template}</p>}
                <p className="text-[12px] text-foreground whitespace-pre-line">{v.conteudo}</p>
                {v.cta && (
                  <div className="mt-2 pt-2 border-t border-border">
                    <button className="text-[11px] text-[#25D366] font-medium w-full text-center">{v.cta}</button>
                  </div>
                )}
                <p className="text-[9px] text-muted-foreground text-right mt-1">10:30 ✓✓</p>
              </div>
            </div>
          ) : (
            <div className="bg-muted/50 border border-border rounded-lg p-3 mb-3">
              <div className="border-b border-border pb-2 mb-2">
                <p className="text-[10px] text-muted-foreground">De: contato@brandili.com.br</p>
                <p className="text-[12px] font-bold text-foreground">{v.assunto || "(sem assunto)"}</p>
                <p className="text-[10px] text-muted-foreground italic">{v.preview}</p>
              </div>
              <p className="text-[12px] text-foreground whitespace-pre-line">{v.conteudo}</p>
              {v.cta && <button className="mt-2 bg-primary text-primary-foreground text-[11px] px-3 py-1.5 rounded">{v.cta}</button>}
            </div>
          )}
          <div className="grid grid-cols-3 gap-2 text-center">
            <MiniMetric label="Entregues" value={formatNum(v.entregues)} />
            <MiniMetric label="Conv." value={formatNum(v.conversoes)} />
            <MiniMetric label="Receita" value={formatBRLCompact(v.receitaAtribuida)} />
          </div>
        </div>
      ))}
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted/40 rounded-lg p-2">
      <p className="text-[9px] uppercase text-muted-foreground">{label}</p>
      <p className="text-[12px] font-bold text-foreground tabular-nums">{value}</p>
    </div>
  );
}

function ABTab({ campanha }: { campanha: ReturnType<typeof useMarketing>["proprias"][number] }) {
  const [a, b] = campanha.variantes;
  const criterio = campanha.divisaoAB?.criterioVencedor || "conversao";

  const valA = criterio === "abertura" ? (a.entregues > 0 ? a.abertos / a.entregues : 0)
    : criterio === "clique" ? (a.abertos > 0 ? a.cliques / a.abertos : 0)
    : (a.entregues > 0 ? a.conversoes / a.entregues : 0);
  const valB = criterio === "abertura" ? (b.entregues > 0 ? b.abertos / b.entregues : 0)
    : criterio === "clique" ? (b.abertos > 0 ? b.cliques / b.abertos : 0)
    : (b.entregues > 0 ? b.conversoes / b.entregues : 0);

  const winner = valA === valB ? null : valA > valB ? "A" : "B";
  const lift = valA > 0 && valB > 0 ? Math.abs((valB - valA) / valA) * 100 : 0;
  const concluida = a.entregues > 0 && b.entregues > 0;

  const rows = [
    { label: "Enviados", a: a.enviados, b: b.enviados, fmt: formatNum },
    { label: "Entregues", a: a.entregues, b: b.entregues, fmt: formatNum },
    { label: "Aberturas", a: a.abertos, b: b.abertos, fmt: formatNum, pct: true, base: "entregues" as const },
    { label: "Cliques", a: a.cliques, b: b.cliques, fmt: formatNum, pct: true, base: "abertos" as const },
    { label: "Conversões", a: a.conversoes, b: b.conversoes, fmt: formatNum, pct: true, base: "entregues" as const },
    { label: "Receita atribuída", a: a.receitaAtribuida, b: b.receitaAtribuida, fmt: formatBRL },
    { label: "Opt-out / bloqueio", a: a.optouSair, b: b.optouSair, fmt: formatNum },
  ];

  return (
    <div className="space-y-4">
      {/* Banner vencedor */}
      <div className={`rounded-xl p-4 border ${
        !concluida ? "bg-muted/40 border-border" : winner ? "bg-emerald-500/5 border-emerald-500/30" : "bg-amber-500/5 border-amber-500/30"
      }`}>
        <div className="flex items-center gap-3">
          <Trophy className={`h-6 w-6 ${winner ? "text-emerald-600" : "text-amber-600"}`} />
          <div>
            <p className="text-sm font-semibold text-foreground">
              {!concluida ? "Aguardando dados de envio" : winner ? `Vencedor: Variante ${winner}` : "Empate técnico"}
            </p>
            <p className="text-[12px] text-muted-foreground">
              Critério: {criterio === "abertura" ? "Maior taxa de abertura" : criterio === "clique" ? "Maior taxa de clique" : "Maior taxa de conversão"}
              {concluida && winner && lift > 0 && ` · Lift de ${formatPct(lift)} sobre a variante perdedora`}
            </p>
          </div>
        </div>
      </div>

      {/* Tabela comparativa */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-[12px]">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-2.5 text-[11px] uppercase tracking-wide text-muted-foreground font-medium">Métrica</th>
              <th className={`text-right px-4 py-2.5 text-[11px] uppercase tracking-wide font-medium ${winner === "A" ? "text-emerald-600" : "text-muted-foreground"}`}>
                Variante A {winner === "A" && "🏆"}
              </th>
              <th className={`text-right px-4 py-2.5 text-[11px] uppercase tracking-wide font-medium ${winner === "B" ? "text-emerald-600" : "text-muted-foreground"}`}>
                Variante B {winner === "B" && "🏆"}
              </th>
              <th className="text-right px-4 py-2.5 text-[11px] uppercase tracking-wide text-muted-foreground font-medium">Δ B vs A</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map(r => {
              const delta = r.a > 0 ? ((r.b - r.a) / r.a) * 100 : 0;
              const aPct = r.pct && r.a > 0 ? (r.base === "entregues" ? (a.entregues > 0 ? r.a / a.entregues : 0) : (a.abertos > 0 ? r.a / a.abertos : 0)) * 100 : 0;
              const bPct = r.pct && r.b > 0 ? (r.base === "entregues" ? (b.entregues > 0 ? r.b / b.entregues : 0) : (b.abertos > 0 ? r.b / b.abertos : 0)) * 100 : 0;
              return (
                <tr key={r.label}>
                  <td className="px-4 py-2.5 text-foreground font-medium">{r.label}</td>
                  <td className="px-4 py-2.5 text-right text-foreground tabular-nums">
                    {r.fmt(r.a)}{r.pct && <span className="text-muted-foreground text-[10px] ml-1">({formatPct(aPct)})</span>}
                  </td>
                  <td className="px-4 py-2.5 text-right text-foreground tabular-nums">
                    {r.fmt(r.b)}{r.pct && <span className="text-muted-foreground text-[10px] ml-1">({formatPct(bPct)})</span>}
                  </td>
                  <td className={`px-4 py-2.5 text-right text-[11px] font-medium tabular-nums ${
                    delta > 0 ? "text-emerald-600" : delta < 0 ? "text-rose-600" : "text-muted-foreground"
                  }`}>
                    {r.a === 0 ? "—" : `${delta > 0 ? "+" : ""}${delta.toFixed(1)}%`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EnviosTab({ campanhaId, envios }: { campanhaId: string; envios: EnvioRegistro[] }) {
  const [filtro, setFiltro] = useState<EnvioRegistro["status"] | "todos">("todos");
  const lista = filtro === "todos" ? envios : envios.filter(e => e.status === filtro);

  const statusCfg: Record<EnvioRegistro["status"], { label: string; color: string }> = {
    entregue: { label: "Entregue", color: "bg-sky-500/10 text-sky-600" },
    lido: { label: "Lido", color: "bg-blue-500/10 text-blue-600" },
    clicou: { label: "Clicou", color: "bg-violet-500/10 text-violet-600" },
    respondeu: { label: "Respondeu", color: "bg-amber-500/10 text-amber-600" },
    converteu: { label: "Converteu", color: "bg-emerald-500/10 text-emerald-600" },
    pendente: { label: "Pendente", color: "bg-muted text-muted-foreground" },
    erro: { label: "Erro", color: "bg-rose-500/10 text-rose-600" },
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1 flex-wrap">
          {(["todos", "entregue", "lido", "clicou", "respondeu", "converteu", "erro"] as const).map(s => (
            <button key={s} onClick={() => setFiltro(s)} className={`text-[11px] px-2.5 py-1 rounded-full border ${
              filtro === s ? "bg-foreground text-background border-foreground" : "bg-card border-border text-muted-foreground hover:text-foreground"
            }`}>
              {s === "todos" ? "Todos" : statusCfg[s].label}
            </button>
          ))}
        </div>
        <button className="text-[11px] inline-flex items-center gap-1 bg-card border border-border rounded-lg px-2.5 py-1.5 hover:bg-muted">
          <Download className="h-3.5 w-3.5" /> Exportar CSV
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-[12px]">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-2.5 text-[11px] uppercase tracking-wide text-muted-foreground font-medium">Contato</th>
              <th className="text-left px-4 py-2.5 text-[11px] uppercase tracking-wide text-muted-foreground font-medium">Canal</th>
              <th className="text-left px-4 py-2.5 text-[11px] uppercase tracking-wide text-muted-foreground font-medium">Variante</th>
              <th className="text-left px-4 py-2.5 text-[11px] uppercase tracking-wide text-muted-foreground font-medium">Status</th>
              <th className="text-left px-4 py-2.5 text-[11px] uppercase tracking-wide text-muted-foreground font-medium">Data</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {lista.map(e => (
              <tr key={e.id} className="hover:bg-muted/30">
                <td className="px-4 py-2 text-foreground font-medium">{e.contatoNome}</td>
                <td className="px-4 py-2 text-muted-foreground tabular-nums">{e.contatoCanal}</td>
                <td className="px-4 py-2"><span className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-bold">{e.variante}</span></td>
                <td className="px-4 py-2">
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${statusCfg[e.status].color}`}>{statusCfg[e.status].label}</span>
                  {e.erro && <span className="text-[10px] text-rose-600 ml-2">{e.erro}</span>}
                </td>
                <td className="px-4 py-2 text-muted-foreground">{e.data}</td>
              </tr>
            ))}
            {lista.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Nenhum envio com esse filtro.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-[10px] text-muted-foreground text-center">Exibindo amostra de {envios.length} de {formatNum(envios.length * 4)} envios reais.</p>
    </div>
  );
}

function AudienciaTab({ campanha }: { campanha: ReturnType<typeof useMarketing>["proprias"][number] }) {
  const { segmentos } = useMarketing();
  const seg = segmentos.find(s => s.id === campanha.segmentoId);
  if (!seg) return null;

  // Distribuição estado / canal de origem (mock)
  const distOrigem = [
    { ch: "meta_ads", pct: 38 }, { ch: "organic", pct: 22 }, { ch: "indicacao", pct: 18 }, { ch: "whatsapp", pct: 12 }, { ch: "google_ads", pct: 10 },
  ] as const;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="text-sm font-bold text-foreground mb-1">{seg.nome}</h3>
        <p className="text-[12px] text-muted-foreground mb-3">{seg.descricao}</p>
        <div className="space-y-2">
          {seg.filtros.map(f => (
            <div key={f.label} className="flex items-center justify-between text-[12px]">
              <span className="text-muted-foreground">{f.label}</span>
              <span className="text-foreground font-medium">{f.value}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-[10px] uppercase text-muted-foreground">Total de contatos</p>
          <p className="text-2xl font-bold text-foreground tabular-nums">{formatNum(seg.totalContatos)}</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="text-sm font-bold text-foreground mb-3">Distribuição por origem</h3>
        <div className="space-y-2">
          {distOrigem.map(d => (
            <div key={d.ch}>
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-foreground">{d.ch}</span>
                <span className="text-muted-foreground tabular-nums">{d.pct}%</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${d.pct}%`, backgroundColor: channelColors[d.ch as keyof typeof channelColors] || "#94A3B8" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
