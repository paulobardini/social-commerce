// Carteira: linguagem de mercado (sem jargão). KPIs com tooltip.
// Mapa da carteira (Valor × Situação) substitui Matriz RFV.
// Ranking "Clientes que sustentam a receita" substitui o treemap.
// Fluxo da carteira substitui Funil de retenção.
import { useMemo, useState } from "react";
import { useCockpit } from "../../contexts/CockpitContext";
import { classificarTudo, type ContaClassificada } from "../../lib/classificar";
import { agingCarteira } from "../../lib/aging";
import { waterfallMovimento } from "../../lib/movimento";
import { repIdsNoEscopo } from "../../lib/escopo";
import { fmtBRLc, fmtNum, fmtPct, fmtDias } from "../../styles/tokens";
import { SectionCard } from "../SectionCard";
import { KpiCard } from "../KpiCard";
import { SaudeCarteiraBar } from "../SaudeCarteiraBar";
import { AgingBars } from "../AgingBars";
import { Waterfall } from "../Waterfall";
import { MapaCarteira, type FaixaValor, type SituacaoCol } from "./MapaCarteira";
import { TopClientesRank } from "./TopClientesRank";
import { FluxoCarteira } from "./FluxoCarteira";
import { Users, RefreshCw } from "lucide-react";
import { kpisCarteira } from "../../lib/kpis";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

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
                <th className="text-left">Representante</th>
                <th className="text-right">Valor 12m</th>
                <th className="text-right">Sem comprar há</th>
              </tr>
            </thead>
            <tbody>
              {st.contas.slice(0, 120).map(c => {
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
  const waterfall = useMemo(() => waterfallMovimento(classificadas, range), [classificadas, range]);

  const showDelta = (v: number) => comparar && v !== 0;

  return (
    <div className="space-y-4">
      <SaudeCarteiraBar />

      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3">
        <KpiCard label="Total de clientes" value={fmtNum(kpiC.totalClientes.atual)}
          delta={showDelta(kpiC.totalClientes.delta) ? { pct: kpiC.totalClientes.delta } : undefined}
          icon={<Users className="h-3.5 w-3.5" />}
          tooltip="Todos os clientes cadastrados no escopo selecionado." />
        <KpiCard label="Comprando" value={fmtNum(kpiC.ativos.atual)}
          delta={showDelta(kpiC.ativos.delta) ? { pct: kpiC.ativos.delta } : undefined}
          tooltip={`Clientes com pedido nos últimos ${diasAtivo} dias.`} />
        <KpiCard label="Parados" value={fmtNum(kpiC.inativos.atual)}
          delta={showDelta(kpiC.inativos.delta) ? { pct: kpiC.inativos.delta, invert: true } : undefined}
          tooltip={`Clientes sem pedido entre ${diasAtivo} e ${diasPerdido} dias — ainda dá para recuperar.`} />
        <KpiCard label="Sem comprar há muito" value={fmtNum(kpiC.perdidos.atual)}
          delta={showDelta(kpiC.perdidos.delta) ? { pct: kpiC.perdidos.delta, invert: true } : undefined}
          tooltip={`Clientes sem pedido há mais de ${diasPerdido} dias. Neste mercado ninguém cancela — simplesmente para de recomprar.`} />
        <KpiCard label="Recuperados" value={fmtNum(kpiC.reativados.atual)}
          delta={showDelta(kpiC.reativados.delta) ? { pct: kpiC.reativados.delta } : undefined}
          icon={<RefreshCw className="h-3.5 w-3.5" />}
          tooltip="Clientes que estavam parados/sem comprar e voltaram a fazer pedido no período." />
        <KpiCard label="Em média, sem comprar há" value={fmtDias(kpiC.recenciaMedia.atual)}
          delta={showDelta(kpiC.recenciaMedia.delta) ? { pct: kpiC.recenciaMedia.delta, invert: true } : undefined}
          tooltip="Média de dias desde a última compra, considerando toda a carteira." />
        <KpiCard label="Ticket médio por cliente" value={fmtBRLc(kpiC.ticketMedio.atual)}
          delta={showDelta(kpiC.ticketMedio.delta) ? { pct: kpiC.ticketMedio.delta } : undefined}
          tooltip="Valor médio comprado por cliente no período." />
        <KpiCard label="Deixaram de comprar" value={fmtPct(kpiC.churn.atual)}
          delta={showDelta(kpiC.churn.delta) ? { pct: kpiC.churn.delta, invert: true } : undefined}
          tooltip={`% da carteira sem pedido há mais de ${diasPerdido} dias. Neste mercado não há cancelamento — o cliente simplesmente para de recomprar.`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Tempo desde a última compra" subtitle="Clique numa faixa para listar os clientes">
          <div onClick={(e) => {
            const target = (e.target as HTMLElement).getAttribute("data-faixa");
            if (target) {
              setDrawer({
                titulo: `Sem comprar há ${target}`,
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

        <SectionCard title="Clientes que sustentam a receita" subtitle="Top 20 clientes pelos últimos 12 meses">
          <TopClientesRank classificadas={classificadas} representantes={seed.representantes} />
        </SectionCard>
      </div>

      <SectionCard title="Mapa da carteira" subtitle="Onde está o valor e como ele está escorregando">
        <MapaCarteira
          classificadas={classificadas}
          diasAtivo={diasAtivo}
          diasPerdido={diasPerdido}
          onCellClick={(faixa: FaixaValor, sit: SituacaoCol, arr) =>
            setDrawer({ titulo: `Clientes ${faixa.toLowerCase()} · ${sit}`, contas: arr })
          }
        />
      </SectionCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Movimentação da carteira" subtitle="Novos + recuperados − sem comprar há muito">
          <Waterfall data={waterfall} />
        </SectionCard>
        <SectionCard title="Fluxo da carteira no período" subtitle="Como os clientes migraram entre situações">
          <FluxoCarteira classificadas={classificadas} diasAtivo={diasAtivo} />
        </SectionCard>
      </div>

      <ListaClientesDrawer st={drawer} onClose={() => setDrawer(null)} />
    </div>
  );
}
