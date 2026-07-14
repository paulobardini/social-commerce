import { useMemo, useState } from "react";
import { useAtendimentoComercial } from "@/contexts/AtendimentoComercialContext";
import { useMarketing } from "../contexts/MarketingDataContext";
import {
  origemCampanhaReceita, funilRenutricao, perdasPorOrigem, distribuicaoRodizio,
  qualidadeLeadPorOrigem, filtrarPeriodo, formatHoras,
} from "@/lib/atendimentoAnalytics";
import { KpiCard } from "../components/KpiCard";
import { formatBRL, formatBRLCompact, formatNum, formatPct } from "../styles/tokens";
import { Download, Users, DollarSign, Frown, Shuffle, TrendingUp, Award, RefreshCw, Archive } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const TABS = [
  { k: "origem", label: "Origem/campanha → Receita", icon: DollarSign },
  { k: "perdas", label: "Perdas e renutrição", icon: Frown },
  { k: "distribuicao", label: "Distribuição e rodízio", icon: Shuffle },
  { k: "qualidade", label: "Qualidade do lead", icon: Award },
] as const;

function periodoParaDias(p: string): number {
  if (p === "7d") return 7;
  if (p === "30d") return 30;
  if (p === "90d") return 90;
  return 30;
}

export default function RelatoriosAtendimentoPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]["k"]>("origem");
  const { cards, colunas, inbox } = useAtendimentoComercial();
  const { periodo } = useMarketing();
  const dias = periodoParaDias(periodo);
  const cardsPeriodo = useMemo(() => filtrarPeriodo(cards, dias), [cards, dias]);
  const { toast } = useToast();

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">Relatórios de Atendimento</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Visão de marketing sobre origem, perdas, distribuição e qualidade dos leads.</p>
        </div>
        <button onClick={() => toast({ title: "Export iniciado", description: "Arquivo mockado — em produção geraria CSV/XLSX." })}
          className="text-[12px] font-medium inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border hover:bg-muted">
          <Download className="h-3.5 w-3.5" /> Exportar
        </button>
      </div>

      <div className="flex items-center gap-1 bg-muted rounded-lg p-1 w-fit overflow-x-auto">
        {TABS.map(t => (
          <button key={t.k} onClick={() => setTab(t.k)}
            className={`text-[12px] font-medium px-3 py-1.5 rounded inline-flex items-center gap-1.5 whitespace-nowrap ${
              tab === t.k ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}>
            <t.icon className="h-3.5 w-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {tab === "origem" && <OrigemReceitaTab cards={cardsPeriodo} colunas={colunas} dias={dias} />}
      {tab === "perdas" && <PerdasTab cards={cardsPeriodo} colunas={colunas} />}
      {tab === "distribuicao" && <DistribuicaoTab cards={cardsPeriodo} colunas={colunas} inboxAtual={inbox.length} />}
      {tab === "qualidade" && <QualidadeTab cards={cardsPeriodo} colunas={colunas} />}
    </div>
  );
}

// ---------- 1. Origem/campanha → Receita ----------
function OrigemReceitaTab({ cards, colunas, dias }: { cards: any[]; colunas: any[]; dias: number }) {
  const rows = useMemo(() => origemCampanhaReceita(cards, colunas, dias), [cards, colunas, dias]);
  const totInv = rows.reduce((s, r) => s + r.investimento, 0);
  const totLeads = rows.reduce((s, r) => s + r.leads, 0);
  const totVal = rows.reduce((s, r) => s + r.valorGerado, 0);
  const roi = totInv > 0 ? ((totVal - totInv) / totInv) * 100 : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Leads totais" value={formatNum(totLeads)} icon={<Users className="h-4 w-4" />} accent="primary" />
        <KpiCard label="Investimento" value={formatBRL(totInv)} icon={<DollarSign className="h-4 w-4" />} accent="warn" />
        <KpiCard label="Valor gerado (potencial)" value={formatBRLCompact(totVal)} icon={<TrendingUp className="h-4 w-4" />} accent="success" />
        <KpiCard label="ROI estimado" value={`${roi.toFixed(0)}%`} icon={<Award className="h-4 w-4" />} accent="accent" />
      </div>

      <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto">
        <table className="w-full text-[12px] min-w-[900px]">
          <thead className="text-[10px] uppercase text-muted-foreground border-b border-border">
            <tr>
              <th className="text-left font-medium px-3 py-2">Origem · Campanha</th>
              <th className="text-right font-medium px-2 py-2">Leads</th>
              <th className="text-right font-medium px-2 py-2">CPL</th>
              <th className="text-right font-medium px-2 py-2">% Distribuídos</th>
              <th className="text-right font-medium px-2 py-2">Oport.</th>
              <th className="text-right font-medium px-2 py-2">Conv. Op</th>
              <th className="text-right font-medium px-2 py-2">Valor gerado</th>
              <th className="text-right font-medium px-3 py-2">Custo/Op</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.chave} className="border-b border-border/50 hover:bg-muted/30">
                <td className="px-3 py-2">
                  <p className="font-medium text-foreground">{r.origem}</p>
                  {r.campanha && <p className="text-[10px] text-muted-foreground truncate">{r.campanha}</p>}
                </td>
                <td className="px-2 py-2 text-right tabular-nums">{r.leads}</td>
                <td className="px-2 py-2 text-right tabular-nums text-muted-foreground">{r.paga ? formatBRL(r.cpl) : "—"}</td>
                <td className="px-2 py-2 text-right tabular-nums">{formatPct(r.distribuidosPct, 0)}</td>
                <td className="px-2 py-2 text-right tabular-nums font-medium">{r.oportunidades}</td>
                <td className="px-2 py-2 text-right tabular-nums">{formatPct(r.conversaoOp, 0)}</td>
                <td className="px-2 py-2 text-right tabular-nums text-emerald-700">{formatBRLCompact(r.valorGerado)}</td>
                <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">{r.custoPorOp > 0 ? formatBRL(r.custoPorOp) : "—"}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={8} className="text-center py-8 text-muted-foreground">Sem dados no período</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------- 2. Perdas e renutrição ----------
function PerdasTab({ cards, colunas }: { cards: any[]; colunas: any[] }) {
  const funil = useMemo(() => funilRenutricao(cards, colunas), [cards, colunas]);
  const porOrigem = useMemo(() => perdasPorOrigem(cards), [cards]);
  const taxaReacao = funil.perdidos > 0 ? (funil.reabertos / funil.perdidos) * 100 : 0;
  const taxaReconv = funil.reabertos > 0 ? (funil.reconvertidos / funil.reabertos) * 100 : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <KpiCard label="Perdidos" value={formatNum(funil.perdidos)} icon={<Frown className="h-4 w-4" />} accent="warn" />
        <KpiCard label="Em renutrição" value={formatNum(funil.emRenutricao)} icon={<RefreshCw className="h-4 w-4" />} accent="accent" />
        <KpiCard label="Reabertos" value={formatNum(funil.reabertos)} accent="primary" hint={`${formatPct(taxaReacao, 0)} de reação`} />
        <KpiCard label="Reconvertidos" value={formatNum(funil.reconvertidos)} icon={<TrendingUp className="h-4 w-4" />} accent="success" hint={`${formatPct(taxaReconv, 0)} dos reabertos`} />
        <KpiCard label="Arquivados" value={formatNum(funil.arquivados)} icon={<Archive className="h-4 w-4" />} accent="primary" />
      </div>

      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Funil da renutrição</h3>
        <div className="space-y-1.5">
          {[
            { label: "Perdidos", value: funil.perdidos, cor: "bg-rose-500" },
            { label: "Em renutrição", value: funil.emRenutricao, cor: "bg-blue-500" },
            { label: "Reabertos (reação)", value: funil.reabertos, cor: "bg-amber-500" },
            { label: "Reconvertidos", value: funil.reconvertidos, cor: "bg-emerald-500" },
          ].map((s, i, arr) => {
            const max = arr[0].value || 1;
            const w = (s.value / max) * 100;
            return (
              <div key={s.label}>
                <div className="flex items-center justify-between text-[11px] mb-0.5">
                  <span className="text-foreground">{s.label}</span>
                  <span className="tabular-nums text-muted-foreground">{s.value}</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full ${s.cor}/70`} style={{ width: `${w}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto">
        <h3 className="text-sm font-semibold text-foreground mb-3">Perdas por motivo × origem</h3>
        <table className="w-full text-[12px] min-w-[700px]">
          <thead className="text-[10px] uppercase text-muted-foreground border-b border-border">
            <tr>
              <th className="text-left font-medium px-3 py-2">Motivo / sub-motivo</th>
              <th className="text-right font-medium px-2 py-2">Total</th>
              <th className="text-right font-medium px-2 py-2">Meta Ads</th>
              <th className="text-right font-medium px-2 py-2">Instagram</th>
              <th className="text-right font-medium px-2 py-2">Whats Central</th>
              <th className="text-right font-medium px-2 py-2">Whats Direto</th>
              <th className="text-right font-medium px-3 py-2">Manual</th>
            </tr>
          </thead>
          <tbody>
            {porOrigem.map((r, i) => (
              <tr key={i} className="border-b border-border/50 hover:bg-muted/30">
                <td className="px-3 py-2">
                  <p className="text-foreground">{r.motivo}</p>
                  {r.subMotivo && <p className="text-[10px] text-muted-foreground">↳ {r.subMotivo}</p>}
                </td>
                <td className="px-2 py-2 text-right tabular-nums font-medium">{r.total}</td>
                <td className="px-2 py-2 text-right tabular-nums text-muted-foreground">{r.porOrigem.meta_ads || 0}</td>
                <td className="px-2 py-2 text-right tabular-nums text-muted-foreground">{r.porOrigem.instagram || 0}</td>
                <td className="px-2 py-2 text-right tabular-nums text-muted-foreground">{r.porOrigem.whats_central || 0}</td>
                <td className="px-2 py-2 text-right tabular-nums text-muted-foreground">{r.porOrigem.whats_direto || 0}</td>
                <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">{r.porOrigem.manual || 0}</td>
              </tr>
            ))}
            {porOrigem.length === 0 && <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">Sem perdas no período</td></tr>}
          </tbody>
        </table>
      </div>

      {funil.sugeridos.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-[13px] font-semibold text-amber-900 mb-2">🗓 {funil.sugeridos.length} sugestões pendentes de retomada</p>
          <div className="space-y-1.5">
            {funil.sugeridos.map(c => (
              <div key={c.id} className="flex items-center justify-between text-[11px]">
                <span className="text-foreground truncate">{c.nome}</span>
                <span className="text-amber-800">Retomar em {c.perda?.retomarEm ? new Date(c.perda.retomarEm).toLocaleDateString("pt-BR") : "—"}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- 3. Distribuição e rodízio ----------
function DistribuicaoTab({ cards, colunas, inboxAtual }: { cards: any[]; colunas: any[]; inboxAtual: number }) {
  const resumo = useMemo(() => distribuicaoRodizio(cards, colunas, inboxAtual), [cards, colunas, inboxAtual]);
  const totalR = resumo.porVendedor.reduce((s, v) => s + v.rodizio, 0);
  const totalM = resumo.porVendedor.reduce((s, v) => s + v.manual, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Tempo médio de distribuição" value={formatHoras(resumo.tempoMedioDistribuicaoMs)} icon={<Shuffle className="h-4 w-4" />} accent="primary" />
        <KpiCard label="Fila atual" value={formatNum(resumo.filaAtual)} accent="warn" hint="conversas aguardando" />
        <KpiCard label="Total via rodízio" value={formatNum(totalR)} accent="accent" />
        <KpiCard label="Total manual" value={formatNum(totalM)} accent="primary" />
      </div>

      <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto">
        <h3 className="text-sm font-semibold text-foreground mb-3">Distribuição por vendedor</h3>
        <table className="w-full text-[12px] min-w-[520px]">
          <thead className="text-[10px] uppercase text-muted-foreground border-b border-border">
            <tr>
              <th className="text-left font-medium px-3 py-2">Vendedor</th>
              <th className="text-right font-medium px-2 py-2">Total</th>
              <th className="text-right font-medium px-2 py-2">Rodízio</th>
              <th className="text-right font-medium px-2 py-2">Manual</th>
              <th className="text-right font-medium px-3 py-2">% Rodízio</th>
            </tr>
          </thead>
          <tbody>
            {resumo.porVendedor.map(v => {
              const pct = v.total ? (v.rodizio / v.total) * 100 : 0;
              return (
                <tr key={v.vendedorId} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="px-3 py-2 font-medium text-foreground">{v.vendedorNome}</td>
                  <td className="px-2 py-2 text-right tabular-nums">{v.total}</td>
                  <td className="px-2 py-2 text-right tabular-nums text-blue-700">{v.rodizio}</td>
                  <td className="px-2 py-2 text-right tabular-nums text-muted-foreground">{v.manual}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{formatPct(pct, 0)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------- 4. Qualidade do lead por origem ----------
function QualidadeTab({ cards, colunas }: { cards: any[]; colunas: any[] }) {
  const rows = useMemo(() => qualidadeLeadPorOrigem(cards, colunas), [cards, colunas]);

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto">
        <h3 className="text-sm font-semibold text-foreground mb-3">% que passa em cada etapa · ranking de qualidade vs volume</h3>
        <table className="w-full text-[12px] min-w-[900px]">
          <thead className="text-[10px] uppercase text-muted-foreground border-b border-border">
            <tr>
              <th className="text-left font-medium px-3 py-2">Origem · Campanha</th>
              <th className="text-right font-medium px-2 py-2">Leads</th>
              <th className="text-right font-medium px-2 py-2">Respondido</th>
              <th className="text-right font-medium px-2 py-2">Cadastrado</th>
              <th className="text-right font-medium px-2 py-2">Qualificado</th>
              <th className="text-right font-medium px-2 py-2">Oport.</th>
              <th className="text-right font-medium px-2 py-2">% Sem perfil</th>
              <th className="text-right font-medium px-3 py-2">Score</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.chave} className="border-b border-border/50 hover:bg-muted/30">
                <td className="px-3 py-2">
                  <p className="font-medium text-foreground">{r.origem}{i === 0 && <span className="ml-1 text-[9px] bg-emerald-100 text-emerald-700 px-1 py-0.5 rounded">👑 melhor</span>}</p>
                  {r.campanha && <p className="text-[10px] text-muted-foreground truncate">{r.campanha}</p>}
                </td>
                <td className="px-2 py-2 text-right tabular-nums">{r.leads}</td>
                <td className="px-2 py-2 text-right tabular-nums">{formatPct(r.respondidoPct, 0)}</td>
                <td className="px-2 py-2 text-right tabular-nums">{formatPct(r.cadastradoPct, 0)}</td>
                <td className="px-2 py-2 text-right tabular-nums">{formatPct(r.qualificadoPct, 0)}</td>
                <td className="px-2 py-2 text-right tabular-nums text-emerald-700 font-medium">{formatPct(r.oportunidadePct, 0)}</td>
                <td className="px-2 py-2 text-right tabular-nums text-rose-700">{formatPct(r.perdaSemPerfilPct, 0)}</td>
                <td className="px-3 py-2 text-right tabular-nums font-bold">{r.scoreQualidade.toFixed(0)}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={8} className="text-center py-8 text-muted-foreground">Sem dados no período</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
