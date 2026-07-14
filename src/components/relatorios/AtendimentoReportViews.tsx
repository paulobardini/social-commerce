// Views de relatórios de atendimento para o gestor (categoria "Atendimento" na Central).
// Usa os helpers puros de src/lib/atendimentoAnalytics.ts.

import { useMemo } from "react";
import { useAtendimentoComercial } from "@/contexts/AtendimentoComercialContext";
import {
  desempenhoPorVendedor, funilConsolidado, perdasDrilldown, slaEvolucao,
  filtrarPeriodo, formatHoras, ETAPA_LABELS,
} from "@/lib/atendimentoAnalytics";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, TrendingUp, Users, Frown } from "lucide-react";
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

const fmtPct = (n: number, dec = 0) => `${n.toFixed(dec)}%`;
const fmtBRL = (n: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(n);

interface ViewProps { dias?: number }

// ---------- 1. Desempenho por vendedor ----------
export function AtdDesempenhoView({ dias = 30 }: ViewProps) {
  const { cards, colunas, config } = useAtendimentoComercial();
  const rows = useMemo(
    () => desempenhoPorVendedor(filtrarPeriodo(cards, dias), colunas, config.slaHoras),
    [cards, colunas, config.slaHoras, dias]
  );
  const mediaOp = rows.length ? rows.reduce((s, r) => s + r.oportunidadePct, 0) / rows.length : 0;

  return (
    <Card className="border border-border">
      <CardContent className="p-4 overflow-x-auto">
        <table className="w-full text-xs min-w-[820px]">
          <thead className="text-[10px] uppercase text-muted-foreground border-b border-border">
            <tr>
              <th className="text-left px-2 py-2 font-medium">Vendedor</th>
              <th className="text-right px-2 py-2 font-medium">Leads</th>
              <th className="text-right px-2 py-2 font-medium">% SLA</th>
              <th className="text-right px-2 py-2 font-medium">T. médio 1ª resp</th>
              <th className="text-right px-2 py-2 font-medium">% Atendeu</th>
              <th className="text-right px-2 py-2 font-medium">% Qualificou</th>
              <th className="text-right px-2 py-2 font-medium">% Oport.</th>
              <th className="text-right px-2 py-2 font-medium">Perdas</th>
              <th className="text-right px-2 py-2 font-medium">Valor Op.</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => {
              const abaixo = r.oportunidadePct < mediaOp * 0.7;
              return (
                <tr key={r.vendedorId} className={`border-b border-border/50 ${abaixo ? "bg-rose-50/40" : ""}`}>
                  <td className="px-2 py-2 font-medium">{r.vendedorNome}{abaixo && <AlertTriangle className="inline h-3 w-3 ml-1 text-rose-600" />}</td>
                  <td className="px-2 py-2 text-right tabular-nums">{r.leadsRecebidos}</td>
                  <td className="px-2 py-2 text-right tabular-nums">{fmtPct(r.pctSla)}</td>
                  <td className="px-2 py-2 text-right tabular-nums">{formatHoras(r.tempoMedioResposta * 3600000)}</td>
                  <td className="px-2 py-2 text-right tabular-nums">{fmtPct(r.atendeuPct)}</td>
                  <td className="px-2 py-2 text-right tabular-nums">{fmtPct(r.qualificouPct)}</td>
                  <td className={`px-2 py-2 text-right tabular-nums font-semibold ${abaixo ? "text-rose-700" : "text-emerald-700"}`}>{fmtPct(r.oportunidadePct)}</td>
                  <td className="px-2 py-2 text-right tabular-nums">{r.perdas}</td>
                  <td className="px-2 py-2 text-right tabular-nums">{fmtBRL(r.valorOportunidades)}</td>
                </tr>
              );
            })}
            <tr className="bg-muted/40 font-semibold">
              <td className="px-2 py-2">Total / média</td>
              <td className="px-2 py-2 text-right tabular-nums">{rows.reduce((s, r) => s + r.leadsRecebidos, 0)}</td>
              <td className="px-2 py-2 text-right tabular-nums">—</td>
              <td className="px-2 py-2 text-right tabular-nums">—</td>
              <td className="px-2 py-2 text-right tabular-nums">—</td>
              <td className="px-2 py-2 text-right tabular-nums">—</td>
              <td className="px-2 py-2 text-right tabular-nums">{fmtPct(mediaOp)}</td>
              <td className="px-2 py-2 text-right tabular-nums">{rows.reduce((s, r) => s + r.perdas, 0)}</td>
              <td className="px-2 py-2 text-right tabular-nums">{fmtBRL(rows.reduce((s, r) => s + r.valorOportunidades, 0))}</td>
            </tr>
          </tbody>
        </table>
        <p className="text-[10px] text-muted-foreground mt-2">
          Vendedores destacados em vermelho estão abaixo de 70% da média de conversão para oportunidade.
        </p>
      </CardContent>
    </Card>
  );
}

// ---------- 2. Funil consolidado ----------
export function AtdFunilView({ dias = 30 }: ViewProps) {
  const { cards, colunas } = useAtendimentoComercial();
  const funil = useMemo(() => funilConsolidado(filtrarPeriodo(cards, dias), colunas), [cards, colunas, dias]);
  const max = funil.etapas[0]?.count || 1;

  return (
    <div className="space-y-4">
      <Card className="border border-border">
        <CardContent className="p-4 space-y-2">
          <p className="text-sm font-semibold">Volume e permanência por etapa</p>
          {funil.etapas.map(e => {
            const w = (e.count / max) * 100;
            const isGargalo = funil.gargalo === e.key;
            return (
              <div key={e.key}>
                <div className="flex items-center justify-between text-xs mb-0.5">
                  <span className="text-foreground flex items-center gap-1">
                    {e.label}
                    {isGargalo && <Badge variant="destructive" className="text-[9px] px-1 py-0"><AlertTriangle className="h-2.5 w-2.5 mr-0.5" />gargalo</Badge>}
                  </span>
                  <span className="tabular-nums text-muted-foreground">
                    {e.count} · perm. {formatHoras(e.tempoMedioMs)} · avanço {fmtPct(e.taxaAvanco)}
                  </span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full ${isGargalo ? "bg-rose-500" : "bg-primary"}/70`} style={{ width: `${w}%` }} />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card className="border border-border">
        <CardContent className="p-4">
          <p className="text-sm font-semibold mb-2">Cards estagnados (2+ dias em atendimento) — {funil.estagnados2d.length}</p>
          {funil.estagnados2d.length === 0 ? (
            <p className="text-xs text-muted-foreground">Nenhum card estagnado 🎉</p>
          ) : (
            <div className="space-y-1">
              {funil.estagnados2d.slice(0, 10).map(c => (
                <div key={c.id} className="flex items-center justify-between text-xs">
                  <span className="truncate">{c.nome}</span>
                  <span className="text-muted-foreground">{c.vendedorNome}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ---------- 3. Perdas detalhadas (drill-down) ----------
export function AtdPerdasView({ dias = 30 }: ViewProps) {
  const { cards } = useAtendimentoComercial();
  const drill = useMemo(() => perdasDrilldown(filtrarPeriodo(cards, dias)), [cards, dias]);
  const [aberto, setAberto] = useState<Record<string, boolean>>({});
  const total = drill.reduce((s, r) => s + r.total, 0);
  const valor = drill.reduce((s, r) => s + r.valorPerdido, 0);

  return (
    <div className="space-y-3">
      <Card className="border border-border">
        <CardContent className="p-4 grid grid-cols-3 gap-3">
          <Kpi label="Total de perdidos" value={String(total)} icon={<Frown className="h-4 w-4" />} />
          <Kpi label="Valor perdido (pot.)" value={fmtBRL(valor)} icon={<TrendingUp className="h-4 w-4" />} />
          <Kpi label="Motivos distintos" value={String(drill.length)} icon={<Users className="h-4 w-4" />} />
        </CardContent>
      </Card>

      <Card className="border border-border">
        <CardContent className="p-4 space-y-2">
          {drill.map(row => {
            const open = !!aberto[row.motivo];
            const pct = total ? (row.total / total) * 100 : 0;
            return (
              <div key={row.motivo} className="border border-border rounded-lg overflow-hidden">
                <button onClick={() => setAberto(a => ({ ...a, [row.motivo]: !open }))}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted/30 text-left">
                  {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                  <span className="text-xs font-medium flex-1">{row.motivo}</span>
                  <span className="text-[10px] text-muted-foreground">{row.total} · {fmtPct(pct)}</span>
                  {row.valorPerdido > 0 && <span className="text-[10px] text-rose-700">{fmtBRL(row.valorPerdido)}</span>}
                </button>
                <div className="h-1.5 bg-muted"><div className="h-full bg-rose-500/70" style={{ width: `${pct}%` }} /></div>
                {open && (
                  <div className="border-t border-border/60 bg-muted/10">
                    {row.subMotivos.map(sm => (
                      <div key={sm.subMotivo}>
                        <div className="flex items-center gap-2 px-3 py-1.5 pl-8 text-[11px]">
                          <span className="text-muted-foreground">↳</span>
                          <span className="flex-1">{sm.subMotivo}</span>
                          <span className="text-muted-foreground">{sm.cards.length}</span>
                          {sm.valorPerdido > 0 && <span className="text-rose-700">{fmtBRL(sm.valorPerdido)}</span>}
                        </div>
                        <div className="pl-14 pb-1.5">
                          {sm.cards.map(c => (
                            <p key={c.id} className="text-[10px] text-muted-foreground truncate">• {c.nome} · {c.vendedorNome}{c.perda?.explicacao ? ` — "${c.perda.explicacao.slice(0, 80)}"` : ""}</p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {drill.length === 0 && <p className="text-xs text-muted-foreground text-center py-6">Nenhuma perda no período</p>}
        </CardContent>
      </Card>
    </div>
  );
}

// ---------- 4. SLA e tempos ----------
export function AtdSlaView({ dias = 30 }: ViewProps) {
  const { cards, colunas, config } = useAtendimentoComercial();
  const sla = useMemo(() => slaEvolucao(cards, colunas, config.slaHoras, dias), [cards, colunas, config.slaHoras, dias]);

  const maxTempo = Math.max(1, ...sla.serieDiaria.map(s => s.tempoMedioMs));

  return (
    <div className="space-y-3">
      <Card className="border border-border">
        <CardContent className="p-4 grid grid-cols-4 gap-3">
          <Kpi label="% dentro do SLA" value={fmtPct(sla.pctSla)} icon={<Clock className="h-4 w-4" />} />
          <Kpi label="Tempo médio 1ª resp." value={formatHoras(sla.tempoMedioMs)} icon={<TrendingUp className="h-4 w-4" />} />
          <Kpi label="Estouros no período" value={String(sla.totalEstouros)} icon={<AlertTriangle className="h-4 w-4" />} />
          <Kpi label="Parados 2d+" value={String(sla.parados2d)} icon={<Frown className="h-4 w-4" />} />
        </CardContent>
      </Card>

      <Card className="border border-border">
        <CardContent className="p-4">
          <p className="text-sm font-semibold mb-2">Tempo médio diário de 1ª resposta</p>
          {sla.serieDiaria.length === 0 ? (
            <p className="text-xs text-muted-foreground">Sem dados no período</p>
          ) : (
            <div className="space-y-1">
              {sla.serieDiaria.map(s => (
                <div key={s.dia} className="flex items-center gap-2 text-[11px]">
                  <span className="w-20 text-muted-foreground shrink-0">{s.dia}</span>
                  <div className="flex-1 h-3 bg-muted rounded overflow-hidden">
                    <div className="h-full bg-primary/70" style={{ width: `${(s.tempoMedioMs / maxTempo) * 100}%` }} />
                  </div>
                  <span className="tabular-nums w-16 text-right shrink-0">{formatHoras(s.tempoMedioMs)}</span>
                  {s.estouros > 0 && <span className="text-rose-700 shrink-0">{s.estouros} 🔴</span>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {sla.estourosAtivos.length > 0 && (
        <Card className="border border-rose-200 bg-rose-50/40">
          <CardContent className="p-4">
            <p className="text-sm font-semibold text-rose-800 mb-2">🔴 {sla.estourosAtivos.length} estouros ativos (na fila agora)</p>
            <div className="space-y-1">
              {sla.estourosAtivos.map(c => (
                <div key={c.id} className="flex items-center justify-between text-xs">
                  <span className="truncate">{c.nome}</span>
                  <span className="text-muted-foreground">{c.vendedorNome}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Kpi({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">{icon}</div>
      <div>
        <p className="text-[10px] uppercase text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}
