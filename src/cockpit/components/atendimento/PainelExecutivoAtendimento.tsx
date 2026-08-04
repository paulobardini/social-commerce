// Faixa executiva do Atendimento — leitura de diretoria (negociação, resposta, conversão).
import {
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip as RechartsTooltip,
} from "recharts";
import { NX, fmtBRLc, fmtNum, fmtPct, fmtDias } from "../../styles/tokens";
import { SectionCard } from "../SectionCard";
import { ExecTile, ExecHero, ExecBarRow } from "../ExecTiles";
import { fmtMin } from "../../lib/whatsapp";

type Wpp = {
  conversas: number;
  conversasAtivas: number;
  mensagens: number;
  primeiraRespostaMin: number;
  respondidasNoSLA: number;
  taxaResposta: number;
  aguardandoResposta: number;
  conversao: number;
  porRep: { rep: string; conversas: number; conversasComPedido: number; primeiraRespostaMin: number }[];
  serie: { dia: string; recebidas: number; enviadas: number }[];
  filaSLA: { faixa: string; qtd: number; cor: string }[];
};

export function PainelExecutivoAtendimento({
  kpiA, wpp,
}: {
  kpiA: {
    cobertura: { atual: number; delta: number };
    nAtendimentos: { atual: number; delta: number };
    txConversao: { atual: number; delta: number };
    winRate: { atual: number };
    ciclo: { atual: number };
    pipelineRS: { atual: number };
    opsAbertas: { atual: number };
    ticketOportunidade: { atual: number };
  };
  wpp: Wpp;
}) {
  const foraSLA = wpp.filaSLA.slice(2).reduce((s, f) => s + f.qtd, 0);
  const maxFila = Math.max(1, ...wpp.filaSLA.map(f => f.qtd));
  const topReps = [...wpp.porRep].sort((a, b) => b.conversas - a.conversas).slice(0, 5);
  const maxRep = Math.max(1, ...topReps.map(r => r.conversas));

  const narrativa = `${fmtNum(wpp.conversas)} conversas no período, ${fmtPct(wpp.respondidasNoSLA, 0)} respondidas dentro do SLA. ${fmtNum(foraSLA)} conversas aguardando há mais de 2h.`;

  return (
    <div className="space-y-4">
      <div className="nx-card p-4">
        <div className="flex flex-col lg:flex-row lg:items-stretch gap-4">
          <div className="lg:w-[260px] shrink-0">
            <ExecHero
              label="Receita em negociação"
              value={fmtBRLc(kpiA.pipelineRS.atual)}
              detalhe={`${fmtNum(kpiA.opsAbertas.atual)} propostas em aberto · ticket médio ${fmtBRLc(kpiA.ticketOportunidade.atual)} · ciclo de ${fmtDias(kpiA.ciclo.atual)} até fechar`}
              narrativa={narrativa}
            />
          </div>

          <div className="flex-1 grid grid-cols-2 xl:grid-cols-4 gap-2.5">
            <ExecTile
              label="Cobertura da carteira"
              value={fmtPct(kpiA.cobertura.atual, 0)}
              sub={`${fmtNum(kpiA.nAtendimentos.atual)} atendimentos no período · ${fmtPct(Math.abs(kpiA.cobertura.delta), 0)} de variação vs período anterior`}
              tone={kpiA.cobertura.atual < 40 ? "risk" : "neutral"}
            />
            <ExecTile
              label="Tempo de 1ª resposta"
              value={fmtMin(wpp.primeiraRespostaMin)}
              sub={`${fmtPct(wpp.respondidasNoSLA, 0)} respondidas em até 30 min · ${fmtNum(wpp.aguardandoResposta)} conversas sem resposta`}
              tone={wpp.primeiraRespostaMin > 30 ? "risk" : "good"}
            />
            <ExecTile
              label="Aproveitamento de propostas"
              value={fmtPct(kpiA.winRate.atual, 0)}
              sub={`de cada 10 propostas enviadas, ${(kpiA.winRate.atual / 10).toFixed(1)} viram pedido`}
              tone={kpiA.winRate.atual < 25 ? "risk" : "neutral"}
            />
            <ExecTile
              label="Conversas que viraram pedido"
              value={fmtPct(wpp.conversao, 0)}
              sub={`${fmtPct(kpiA.txConversao.atual, 0)} dos leads atendidos fizeram o primeiro pedido no período`}
              tone={wpp.conversao < 10 ? "risk" : "good"}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionCard className="lg:col-span-2" title="Volume de conversas (últimos 14 dias)"
          subtitle="Mensagens recebidas e enviadas pelo time no escopo selecionado">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={wpp.serie} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradAtRec" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={NX.primary} stopOpacity={0.28} />
                  <stop offset="100%" stopColor={NX.primary} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis dataKey="dia" tick={{ fontSize: 9, fill: NX.muted }} interval={1} />
              <YAxis tick={{ fontSize: 10, fill: NX.muted }} width={32} />
              <RechartsTooltip contentStyle={{ background: "#fff", border: "1px solid #E7E9EE", borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="recebidas" name="Recebidas" stroke={NX.primary} strokeWidth={2} fill="url(#gradAtRec)" />
              <Area type="monotone" dataKey="enviadas" name="Enviadas" stroke="#16A34A" strokeWidth={2} fill="transparent" />
            </AreaChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Fila por tempo de espera" subtitle="Leads aguardando retorno do time">
          <div className="space-y-1.5">
            {wpp.filaSLA.map(f => (
              <div key={f.faixa} className="flex items-center gap-2">
                <span className="text-[11px] nx-text w-20 truncate">{f.faixa}</span>
                <div className="flex-1 h-2 rounded-full bg-[#EEF0F4] overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(f.qtd / maxFila) * 100}%`, background: f.cor }} />
                </div>
                <span className="text-[11px] nx-num nx-text w-8 text-right">{f.qtd}</span>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-[#E7E9EE]">
            <p className="text-[10px] uppercase tracking-wide nx-muted mb-2">Conversas por representante</p>
            <div className="space-y-1.5">
              {topReps.map(r => (
                <ExecBarRow
                  key={r.rep}
                  label={r.rep}
                  valor={r.conversas}
                  max={maxRep}
                  valorFmt={fmtNum(r.conversas)}
                />
              ))}
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
