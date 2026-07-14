import { useMemo, useState } from "react";
import { useAtendimentoComercial } from "@/contexts/AtendimentoComercialContext";
import { useMarketing } from "../contexts/MarketingDataContext";
import { NovoLeadModal } from "@/components/atendimentoComercial/NovoLeadModal";
import { KpiCard } from "../components/KpiCard";
import { FunnelChart } from "../components/FunnelChart";
import { DonutChart } from "../components/DonutChart";
import { formatBRL, formatBRLCompact, formatPct, formatNum, origemACColors, origemACLabels, type OrigemAC } from "../styles/tokens";
import { investimentoPorCampanha, investimentoPorOrigem, type CardAC } from "@/data/mockAtendimentoComercial";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Users, DollarSign, Inbox, Plus, ArrowRightLeft, Search, Target, MessageCircle, Frown, Clock } from "lucide-react";


const ORDEM_FLUXO = ["leads", "fila", "atendimento", "cadastro", "qualificacao", "oportunidade"] as const;
const ORIGENS_PAGAS: OrigemAC[] = ["meta_ads", "instagram"];

function periodoParaDias(p: string): number {
  if (p === "7d") return 7;
  if (p === "30d") return 30;
  if (p === "90d") return 90;
  if (p === "ytd") {
    const now = new Date();
    const jan1 = new Date(now.getFullYear(), 0, 1);
    return Math.max(1, Math.ceil((now.getTime() - jan1.getTime()) / (86400000)));
  }
  return 30;
}

// Retorna a etapa máxima que o card alcançou (índice em ORDEM_FLUXO).
// Para perdidos, olha o histórico para descobrir a etapa mais avançada antes da perda.
function etapaAlcancada(card: CardAC, colLabelToKey: Record<string, string>): number {
  const atual = colLabelToKey[card.colunaId] as (typeof ORDEM_FLUXO)[number] | "perdido" | undefined;
  if (atual && atual !== "perdido") {
    const idx = ORDEM_FLUXO.indexOf(atual as any);
    if (idx >= 0) return idx;
  }
  // perdido — varre histórico "Movido para X"
  let maxIdx = 0; // pelo menos "leads"
  for (const h of card.historico) {
    const m = h.msg.match(/Movido para (.+)$/);
    if (!m) continue;
    const label = m[1];
    const key = colLabelToKey[`__label:${label}`];
    const idx = ORDEM_FLUXO.indexOf(key as any);
    if (idx > maxIdx) maxIdx = idx;
  }
  return maxIdx;
}

export default function LeadsAtendimentoPage() {
  const { cards, colunas, inbox, vendedores, distribuirManual, distribuirRodizio, togglePausaVendedor } = useAtendimentoComercial();
  const { periodo } = useMarketing();
  const [novoOpen, setNovoOpen] = useState(false);

  const dias = periodoParaDias(periodo);
  const periodoMs = dias * 86400000;
  const agora = Date.now();

  // Mapa colunaId -> key e label -> key para etapa alcançada
  const { colIdToKey, labelToKey } = useMemo(() => {
    const idMap: Record<string, string> = {};
    const lblMap: Record<string, string> = {};
    colunas.forEach(c => { if (c.key) idMap[c.id] = c.key; if (c.key) lblMap[`__label:${c.label}`] = c.key; });
    return { colIdToKey: idMap, labelToKey: { ...idMap, ...lblMap } };
  }, [colunas]);

  // Cards no período (por chegouEm)
  const cardsPeriodo = useMemo(
    () => cards.filter(c => agora - new Date(c.chegouEm).getTime() <= periodoMs),
    [cards, agora, periodoMs]
  );

  // KPIs
  const totalLeads = cardsPeriodo.length;
  const perdidos = cardsPeriodo.filter(c => colIdToKey[c.colunaId] === "perdido");
  const passouOp = cardsPeriodo.filter(c => etapaAlcancada(c, labelToKey) >= ORDEM_FLUXO.indexOf("oportunidade"));
  const conversaoLeadOp = totalLeads > 0 ? (passouOp.length / totalLeads) * 100 : 0;

  const investimentoTotal = useMemo(() => {
    // Considera só cards de origem paga
    const campanhasPresentes = new Set<string>();
    const origensPagasPresentes = new Set<OrigemAC>();
    cardsPeriodo.forEach(c => {
      if (!ORIGENS_PAGAS.includes(c.origem as OrigemAC)) return;
      if (c.campanha && investimentoPorCampanha[c.campanha] != null) {
        campanhasPresentes.add(c.campanha);
      } else {
        origensPagasPresentes.add(c.origem as OrigemAC);
      }
    });
    let total = 0;
    campanhasPresentes.forEach(nm => { total += investimentoPorCampanha[nm] || 0; });
    origensPagasPresentes.forEach(o => { total += investimentoPorOrigem[o] || 0; });
    // proporcionaliza pelo período (base = 30d)
    return Math.round(total * (dias / 30));
  }, [cardsPeriodo, dias]);

  const leadsPagos = cardsPeriodo.filter(c => ORIGENS_PAGAS.includes(c.origem as OrigemAC)).length;
  const cplMedio = leadsPagos > 0 ? investimentoTotal / leadsPagos : 0;

  // Funil acumulado
  const funnelSteps = useMemo(() => {
    const count = (key: (typeof ORDEM_FLUXO)[number]) =>
      cardsPeriodo.filter(c => etapaAlcancada(c, labelToKey) >= ORDEM_FLUXO.indexOf(key)).length;
    const valorPot = (key: (typeof ORDEM_FLUXO)[number]) =>
      cardsPeriodo
        .filter(c => etapaAlcancada(c, labelToKey) >= ORDEM_FLUXO.indexOf(key))
        .reduce((s, c) => s + (c.valorEstimado || 0), 0);
    return [
      { label: "Leads recebidos", value: totalLeads },
      { label: "Atendidos (1ª resposta)", value: count("atendimento") },
      { label: "Cadastrados", value: count("cadastro") },
      { label: "Qualificados", value: count("qualificacao"), money: valorPot("qualificacao") || undefined },
      { label: "Oportunidades", value: count("oportunidade"), money: valorPot("oportunidade") || undefined },
    ];
  }, [cardsPeriodo, labelToKey, colIdToKey, totalLeads]);


  // Origens — donut + tabela
  const porOrigem = useMemo(() => {
    const groups: Record<string, CardAC[]> = {};
    cardsPeriodo.forEach(c => {
      groups[c.origem] = groups[c.origem] || [];
      groups[c.origem].push(c);
    });
    return Object.entries(groups)
      .map(([origem, items]) => {
        const paga = ORIGENS_PAGAS.includes(origem as OrigemAC);
        const invest = paga
          ? items.reduce((s, c) => {
              if (c.campanha && investimentoPorCampanha[c.campanha] != null) return s; // contado por campanha
              return s + 0;
            }, 0) + Array.from(new Set(items.map(i => i.campanha).filter(Boolean)))
              .reduce((s, nm) => s + (investimentoPorCampanha[nm as string] || 0), 0)
              + (items.some(i => !i.campanha || investimentoPorCampanha[i.campanha!] == null)
                  ? (investimentoPorOrigem[origem] || 0)
                  : 0)
          : 0;
        const cpl = paga && items.length > 0 ? invest / items.length : 0;
        const ops = items.filter(c => etapaAlcancada(c, labelToKey) >= ORDEM_FLUXO.indexOf("oportunidade")).length;
        // subcampanhas (Meta Ads)
        const subs = origem === "meta_ads"
          ? Object.entries(items.reduce<Record<string, CardAC[]>>((acc, c) => {
              const k = c.campanha || "(sem campanha)";
              acc[k] = acc[k] || []; acc[k].push(c); return acc;
            }, {})).map(([nome, its]) => ({
              nome,
              total: its.length,
              cpl: investimentoPorCampanha[nome] ? investimentoPorCampanha[nome] / its.length : 0,
              ops: its.filter(c => etapaAlcancada(c, labelToKey) >= ORDEM_FLUXO.indexOf("oportunidade")).length,
            }))
          : [];
        return {
          origem: origem as OrigemAC,
          total: items.length,
          cpl,
          ops,
          conv: items.length > 0 ? (ops / items.length) * 100 : 0,
          subs,
        };
      })
      .filter(o => o.total > 0)
      .sort((a, b) => b.total - a.total);
  }, [cardsPeriodo, labelToKey]);

  const donutData = porOrigem.map(o => ({
    label: origemACLabels[o.origem],
    value: o.total,
    color: origemACColors[o.origem] || "#94A3B8",
  }));

  // Perdas por motivo
  const porMotivo = useMemo(() => {
    const map: Record<string, number> = {};
    perdidos.forEach(c => { const m = c.motivoPerda || "Não informado"; map[m] = (map[m] || 0) + 1; });
    return Object.entries(map).map(([motivo, qtd]) => ({ motivo, qtd })).sort((a, b) => b.qtd - a.qtd);
  }, [perdidos]);

  const totalPerdas = perdidos.length;

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground">Leads & Atendimento</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Origens, distribuição e conversão do WhatsApp central.</p>
          </div>
          <button onClick={() => setNovoOpen(true)} className="text-[12px] font-medium inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90">
            <Plus className="h-3.5 w-3.5" /> Lead manual
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KpiCard label="Leads no período" value={formatNum(totalLeads)} icon={<Users className="h-4 w-4" />} accent="primary" hint={`últimos ${dias} dias`} />
          <KpiCard label="CPL médio" value={cplMedio > 0 ? formatBRL(cplMedio) : "—"} icon={<DollarSign className="h-4 w-4" />} accent="warn" hint="só origens pagas" />
          <KpiCard label="Lead → Oportunidade" value={formatPct(conversaoLeadOp)} icon={<Target className="h-4 w-4" />} accent="success" hint={`${passouOp.length} de ${totalLeads}`} />
          <KpiCard label="Aguardando distribuição" value={formatNum(inbox.length)} icon={<Inbox className="h-4 w-4" />} accent="accent" hint="inbox central" />
        </div>

        {/* Funil */}
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Funil de conversão</h2>
              <p className="text-[11px] text-muted-foreground">Passagem acumulada pelas etapas — todo card que já cruzou o estágio</p>
            </div>
            {totalPerdas > 0 && (
              <span className="text-[11px] text-rose-600 inline-flex items-center gap-1"><Frown className="h-3.5 w-3.5" /> {totalPerdas} perdidos no período</span>
            )}
          </div>
          <FunnelChart steps={funnelSteps} formatMoney={formatBRLCompact} />
        </div>

        {/* Origens */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-card border border-border rounded-xl p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Leads por origem</h2>
            <div className="overflow-x-auto -mx-4">
              <table className="w-full text-[12px] min-w-[640px]">
                <thead className="text-[10px] uppercase text-muted-foreground border-b border-border">
                  <tr>
                    <th className="text-left font-medium px-4 py-2">Origem / campanha</th>
                    <th className="text-right font-medium px-2 py-2">Volume</th>
                    <th className="text-right font-medium px-2 py-2">CPL</th>
                    <th className="text-right font-medium px-2 py-2">Oportunidades</th>
                    <th className="text-right font-medium px-4 py-2">Conversão</th>
                  </tr>
                </thead>
                <tbody>
                  {porOrigem.flatMap(o => [
                    <tr key={o.origem} className="border-b border-border/50 hover:bg-muted/40">
                      <td className="px-4 py-2.5">
                        <span className="inline-flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: origemACColors[o.origem] }} />
                          <span className="font-medium text-foreground">{origemACLabels[o.origem]}</span>
                        </span>
                      </td>
                      <td className="px-2 py-2.5 text-right tabular-nums">{o.total}</td>
                      <td className="px-2 py-2.5 text-right tabular-nums text-muted-foreground">{o.cpl > 0 ? formatBRL(o.cpl) : "—"}</td>
                      <td className="px-2 py-2.5 text-right tabular-nums">{o.ops}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums font-medium text-foreground">{o.total > 0 ? formatPct(o.conv, 0) : "—"}</td>
                    </tr>,
                    ...o.subs.map(s => (
                      <tr key={`${o.origem}-${s.nome}`} className="border-b border-border/30 bg-muted/20">
                        <td className="px-4 py-1.5 pl-10 text-muted-foreground">↳ {s.nome}</td>
                        <td className="px-2 py-1.5 text-right tabular-nums text-muted-foreground">{s.total}</td>
                        <td className="px-2 py-1.5 text-right tabular-nums text-muted-foreground">{s.cpl > 0 ? formatBRL(s.cpl) : "—"}</td>
                        <td className="px-2 py-1.5 text-right tabular-nums text-muted-foreground">{s.ops}</td>
                        <td className="px-4 py-1.5 text-right tabular-nums text-muted-foreground">{s.total > 0 ? formatPct((s.ops / s.total) * 100, 0) : "—"}</td>
                      </tr>
                    )),
                  ])}

                  {porOrigem.length === 0 && (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Nenhum lead no período</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Share por origem</h2>
            {donutData.length > 0
              ? <DonutChart data={donutData} size={140} />
              : <p className="text-[12px] text-muted-foreground py-8 text-center">Sem dados no período</p>}
          </div>
        </div>

        {/* Perdas por motivo */}
        <div className="bg-card border border-border rounded-xl p-4">
          <h2 className="text-sm font-semibold text-foreground mb-3">Perdas por motivo</h2>
          {porMotivo.length === 0 ? (
            <p className="text-[12px] text-muted-foreground py-6 text-center">Nenhum lead perdido no período 🎉</p>
          ) : (
            <div className="space-y-2">
              {porMotivo.map(({ motivo, qtd }) => {
                const pct = (qtd / totalPerdas) * 100;
                return (
                  <div key={motivo}>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-foreground truncate pr-2">{motivo}</span>
                      <span className="tabular-nums text-muted-foreground shrink-0">{qtd} · {formatPct(pct, 0)}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500/70 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Inbox */}
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <MessageCircle className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Inbox do WhatsApp central</h2>
            <span className="text-[10px] bg-primary/10 text-primary rounded-full px-2 py-0.5 font-semibold">{inbox.length}</span>
          </div>
          {inbox.length === 0 ? (
            <p className="text-[12px] text-muted-foreground py-6 text-center">Nenhuma conversa aguardando distribuição</p>
          ) : (
            <div className="space-y-2">
              {inbox.map(conv => {
                const horas = (Date.now() - new Date(conv.chegouEm).getTime()) / (1000 * 3600);
                const slaChip = horas >= 4 ? "bg-rose-500/10 text-rose-600 border-rose-500/30"
                  : horas >= 2 ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                  : "bg-emerald-500/10 text-emerald-600 border-emerald-500/30";
                const initials = conv.nome.split(" ").slice(0, 2).map(n => n[0]?.toUpperCase() ?? "").join("");
                const cor = origemACColors[conv.origem as OrigemAC] || "#94A3B8";
                return (
                  <div key={conv.id} className="border border-border rounded-lg p-3 flex items-start gap-3 hover:bg-muted/30 transition-colors">
                    <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[11px] font-semibold shrink-0">{initials}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-[13px] font-semibold text-foreground truncate">{conv.nome}</p>
                        <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border border-border bg-muted/50 text-muted-foreground">
                          <span className="h-1.5 w-1.5 rounded-full" style={{ background: cor }} />
                          {origemACLabels[conv.origem as OrigemAC]}{conv.campanha ? ` · ${conv.campanha}` : ""}
                        </span>
                        <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border ${slaChip}`}>
                          <Clock className="h-2.5 w-2.5" />
                          {horas < 1 ? `${Math.max(1, Math.round(horas * 60))}m` : `${Math.round(horas)}h`}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">{conv.telefone}</p>
                      <p className="text-[12px] text-muted-foreground line-clamp-1 mt-0.5">{conv.ultimaMensagem}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => distribuirRodizio(conv.id)}
                        className="text-[11px] inline-flex items-center gap-1 px-2 py-1.5 rounded border border-border hover:bg-muted text-foreground"
                        title="Distribuir por rodízio"
                      >
                        <ArrowRightLeft className="h-3 w-3" /> Rodízio
                      </button>
                      <DistribuirPopover
                        vendedores={vendedores.filter(v => !v.pausado)}
                        onPick={(vid) => distribuirManual(conv.id, vid)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Controle de distribuição */}
        <div className="bg-card border border-border rounded-xl p-4">
          <h2 className="text-sm font-semibold text-foreground mb-3">Controle de distribuição</h2>
          <div className="overflow-x-auto -mx-4">
            <table className="w-full text-[12px] min-w-[640px]">
              <thead className="text-[10px] uppercase text-muted-foreground border-b border-border">
                <tr>
                  <th className="text-left font-medium px-4 py-2">Vendedor</th>
                  <th className="text-right font-medium px-2 py-2">Leads no período</th>
                  <th className="text-right font-medium px-2 py-2">Oportunidades</th>
                  <th className="text-right font-medium px-2 py-2">Conversão</th>
                  <th className="text-right font-medium px-4 py-2">Rodízio</th>
                </tr>
              </thead>
              <tbody>
                {vendedores.map(v => {
                  const seus = cardsPeriodo.filter(c => c.vendedorId === v.id);
                  const ops = seus.filter(c => etapaAlcancada(c, labelToKey) >= ORDEM_FLUXO.indexOf("oportunidade")).length;
                  const conv = seus.length > 0 ? (ops / seus.length) * 100 : 0;
                  return (
                    <tr key={v.id} className={`border-b border-border/50 hover:bg-muted/40 ${v.pausado ? "opacity-60" : ""}`}>
                      <td className="px-4 py-2.5">
                        <span className="inline-flex items-center gap-2">
                          <span className={`h-7 w-7 rounded-full ${v.cor} text-white flex items-center justify-center text-[10px] font-semibold shrink-0`}>
                            {v.iniciais}
                          </span>
                          <span className="font-medium text-foreground">{v.nome}</span>
                        </span>
                      </td>
                      <td className="px-2 py-2.5 text-right tabular-nums">{seus.length}</td>
                      <td className="px-2 py-2.5 text-right tabular-nums">{ops}</td>
                      <td className="px-2 py-2.5 text-right tabular-nums font-medium">{seus.length > 0 ? formatPct(conv, 0) : "—"}</td>
                      <td className="px-4 py-2.5 text-right">
                        <div className="inline-flex items-center gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span>
                                <Switch checked={!v.pausado} onCheckedChange={() => togglePausaVendedor(v.id)} />
                              </span>
                            </TooltipTrigger>
                            <TooltipContent side="left">
                              {v.pausado ? "Pausado — não recebe rodízio" : "Ativo no rodízio"}
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <NovoLeadModal open={novoOpen} onClose={() => setNovoOpen(false)} />
      </div>
    </TooltipProvider>
  );
}

function DistribuirPopover({ vendedores, onPick }: { vendedores: { id: string; nome: string; iniciais: string; cor: string }[]; onPick: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const filtrados = vendedores.filter(v => v.nome.toLowerCase().includes(q.toLowerCase()));
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="text-[11px] inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-primary text-primary-foreground hover:opacity-90">
          Distribuir
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-2">
        <div className="relative mb-2">
          <Search className="h-3 w-3 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            autoFocus
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Buscar vendedor…"
            className="w-full pl-7 pr-2 py-1.5 text-[12px] border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div className="max-h-56 overflow-y-auto">
          {filtrados.length === 0 && <p className="text-[11px] text-muted-foreground text-center py-3">Nenhum vendedor</p>}
          {filtrados.map(v => (
            <button
              key={v.id}
              onClick={() => { onPick(v.id); setOpen(false); setQ(""); }}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted text-left text-[12px]"
            >
              <span className={`h-6 w-6 rounded-full ${v.cor} text-white flex items-center justify-center text-[10px] font-semibold`}>{v.iniciais}</span>
              <span className="flex-1 truncate">{v.nome}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
