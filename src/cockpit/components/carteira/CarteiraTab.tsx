// Carteira enxugada: mantém SaudeCarteira/Aging/RFV/ABC/Waterfall/Funil retenção.
// Remove donut, KPIs com 0,0% e gráficos vazios. Gráficos são clicáveis → ListaClientesDrawer.
import { useMemo, useState } from "react";
import { useCockpit } from "../../contexts/CockpitContext";
import { classificarTudo, type ContaClassificada } from "../../lib/classificar";
import { classificarRfv } from "../../lib/rfv";
import { agingCarteira } from "../../lib/aging";
import { curvaAbc } from "../../lib/abc";
import { waterfallMovimento, funilRetencao } from "../../lib/movimento";
import { repIdsNoEscopo } from "../../lib/escopo";
import { fmtBRLc, fmtNum, fmtPct, fmtDias, NX } from "../../styles/tokens";
import { SectionCard } from "../SectionCard";
import { KpiCard } from "../KpiCard";
import { SaudeCarteiraBar } from "../SaudeCarteiraBar";
import { AgingBars } from "../AgingBars";
import { RfvHeatmap } from "../RfvHeatmap";
import { AbcCurve } from "../AbcCurve";
import { TreemapClientes } from "../TreemapClientes";
import { Waterfall } from "../Waterfall";
import { FunnelChart } from "../FunnelChart";
import { Users, Activity, RefreshCw } from "lucide-react";
import { kpisCarteira } from "../../lib/kpis";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

interface DrawerState { titulo: string; contas: ContaClassificada[] }

function ListaClientesDrawer({ st, onClose }: { st: DrawerState | null; onClose: () => void }) {
  const { seed } = useCockpit();
  return (
    <Sheet open={!!st} onOpenChange={(b) => !b && onClose()}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader><SheetTitle>{st?.titulo}</SheetTitle></SheetHeader>
        <p className="text-[11px] nx-muted mt-1">{st?.contas.length ?? 0} clientes</p>
        {st && (
          <table className="w-full text-xs mt-4">
            <thead className="text-[10px] uppercase nx-muted border-b border-[#E7E9EE]">
              <tr>
                <th className="text-left py-2">Cliente</th>
                <th className="text-left">Rep</th>
                <th className="text-right">Valor 12m</th>
                <th className="text-right">Recência</th>
              </tr>
            </thead>
            <tbody>
              {st.contas.slice(0, 80).map(c => {
                const rep = seed.representantes.find(r => r.id === c.conta.repId)?.nome ?? "—";
                return (
                  <tr key={c.conta.id} className="border-b border-[#F1F3F8]">
                    <td className="py-2 nx-text">{c.conta.razao}</td>
                    <td className="nx-muted">{rep}</td>
                    <td className="text-right nx-num">{fmtBRLc(c.valor12m)}</td>
                    <td className="text-right nx-num">{c.recencia === Infinity ? "—" : `${c.recencia}d`}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </SheetContent>
    </Sheet>
  );
}

export function CarteiraTab() {
  const { seed, escopo, range, previousRange, diasAtivo, diasPerdido, comparar } = useCockpit();
  const [drawer, setDrawer] = useState<DrawerState | null>(null);

  const repsIds = useMemo(() => repIdsNoEscopo(seed, escopo), [seed, escopo]);
  const contas = useMemo(() => seed.contas.filter(c => repsIds.has(c.repId)), [seed, repsIds]);
  const pedidos = useMemo(() => seed.pedidos.filter(p => repsIds.has(p.repId)), [seed, repsIds]);

  const classificadas = useMemo(
    () => classificarTudo(contas, pedidos, range, diasAtivo, diasPerdido, seed.hoje),
    [contas, pedidos, range, diasAtivo, diasPerdido, seed.hoje],
  );
  const kpiC = useMemo(() => kpisCarteira(seed, range, previousRange, { diasAtivo, diasPerdido, repId: "todos" }), [seed, range, previousRange, diasAtivo, diasPerdido]);

  const agingData = useMemo(() => agingCarteira(classificadas), [classificadas]);
  const rfv = useMemo(() => classificarRfv(classificadas), [classificadas]);
  const abc = useMemo(() => curvaAbc(classificadas.filter(c => c.valor12m > 0).map(c => ({ item: c.conta, valor: c.valor12m }))), [classificadas]);
  const treemap = useMemo(() => classificadas.filter(c => c.valor12m > 0).sort((a, b) => b.valor12m - a.valor12m).slice(0, 30).map(c => ({ name: c.conta.razao, size: c.valor12m })), [classificadas]);
  const waterfall = useMemo(() => waterfallMovimento(classificadas, range), [classificadas, range]);
  const funRet = useMemo(() => funilRetencao(classificadas), [classificadas]);

  // KPIs enxutos (removidos: donut, textos "0,0%")
  const showDelta = (v: number) => comparar && v !== 0;

  return (
    <div className="space-y-4">
      <SaudeCarteiraBar />

      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3">
        <KpiCard label="Total clientes"    value={fmtNum(kpiC.totalClientes.atual)} delta={showDelta(kpiC.totalClientes.delta) ? { pct: kpiC.totalClientes.delta } : undefined} icon={<Users className="h-3.5 w-3.5" />} />
        <KpiCard label="Ativos"             value={fmtNum(kpiC.ativos.atual)}        delta={showDelta(kpiC.ativos.delta) ? { pct: kpiC.ativos.delta } : undefined} />
        <KpiCard label="Inativos"           value={fmtNum(kpiC.inativos.atual)}      delta={showDelta(kpiC.inativos.delta) ? { pct: kpiC.inativos.delta, invert: true } : undefined} />
        <KpiCard label="Perdidos"           value={fmtNum(kpiC.perdidos.atual)}      delta={showDelta(kpiC.perdidos.delta) ? { pct: kpiC.perdidos.delta, invert: true } : undefined} />
        <KpiCard label="Reativados"         value={fmtNum(kpiC.reativados.atual)}    delta={showDelta(kpiC.reativados.delta) ? { pct: kpiC.reativados.delta } : undefined} icon={<RefreshCw className="h-3.5 w-3.5" />} />
        <KpiCard label="Recência média"     value={fmtDias(kpiC.recenciaMedia.atual)} delta={showDelta(kpiC.recenciaMedia.delta) ? { pct: kpiC.recenciaMedia.delta, invert: true } : undefined} />
        <KpiCard label="Ticket médio/cli."  value={fmtBRLc(kpiC.ticketMedio.atual)}   delta={showDelta(kpiC.ticketMedio.delta) ? { pct: kpiC.ticketMedio.delta } : undefined} />
        <KpiCard label="Churn"              value={fmtPct(kpiC.churn.atual)}         delta={showDelta(kpiC.churn.delta) ? { pct: kpiC.churn.delta, invert: true } : undefined} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Aging da carteira" subtitle="Clique numa faixa para listar clientes">
          <div onClick={(e) => {
            const target = (e.target as HTMLElement).getAttribute("data-faixa");
            if (target) {
              setDrawer({
                titulo: `Aging — ${target}`,
                contas: classificadas.filter(c => {
                  const r = c.recencia;
                  if (target === "0-30d") return r <= 30;
                  if (target === "31-60d") return r > 30 && r <= 60;
                  if (target === "61-90d") return r > 60 && r <= 90;
                  if (target === "91-180d") return r > 90 && r <= 180;
                  return r > 180 && r < Infinity;
                }),
              });
            }
          }}>
            <AgingBars data={agingData} />
          </div>
        </SectionCard>

        <SectionCard title="Curva ABC — Top clientes" subtitle="Clique numa classe para listar" action={
          <div className="flex gap-1 text-[10px]">
            {(["A","B","C"] as const).map(cls => (
              <button key={cls} onClick={() => {
                const ids = new Set(abc.filter(r => r.classe === cls).map(r => (r.item as any).id));
                setDrawer({ titulo: `Curva ABC — Classe ${cls}`, contas: classificadas.filter(c => ids.has(c.conta.id)) });
              }}>
                <Badge className={cls === "A" ? "bg-emerald-500 text-white" : cls === "B" ? "bg-amber-500 text-white" : "bg-rose-500 text-white"}>
                  {cls} {abc.filter(r => r.classe === cls).length}
                </Badge>
              </button>
            ))}
          </div>
        }>
          <TreemapClientes data={treemap} />
        </SectionCard>
      </div>

      <SectionCard title="Matriz RFV" subtitle="Recência × Frequência × Valor (12m)">
        <RfvHeatmap cells={rfv} />
      </SectionCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Movimentação líquida" subtitle="Novos + reativados − perdidos">
          <Waterfall data={waterfall} />
        </SectionCard>
        <SectionCard title="Funil de retenção">
          <FunnelChart etapas={funRet.map(f => ({ etapa: f.etapa, valor: f.valor }))} taxas={funRet.map((f, i) => i === 0 ? null : funRet[i-1].valor > 0 ? (f.valor / funRet[i-1].valor) * 100 : 0)} />
        </SectionCard>
      </div>

      <ListaClientesDrawer st={drawer} onClose={() => setDrawer(null)} />
    </div>
  );
}
