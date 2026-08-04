// Bloco de analytics do WhatsApp dentro da plataforma.
import { SectionCard } from "../SectionCard";
import { KpiCard } from "../KpiCard";
import { fmtNum, fmtPct, NX, CHART_PALETTE, STATUS_COLORS } from "../../styles/tokens";
import { fmtMin, type WppResumo } from "../../lib/whatsapp";
import { MessageSquare, Timer, Reply, AlertTriangle } from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
  AreaChart, Area, CartesianGrid, Legend,
} from "recharts";

const tt = { background: "#fff", border: "1px solid #E7E9EE", borderRadius: 8, fontSize: 12 };

export function WhatsAppAnalytics({ wpp }: { wpp: WppResumo }) {
  const picos = [...wpp.porHora].sort((a, b) => b.qtd - a.qtd).slice(0, 3).map(h => h.hora);
  const maxRep = Math.max(1, ...wpp.porRep.map(r => r.conversas));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <KpiCard label="Conversas no período" value={fmtNum(wpp.conversas)} icon={<MessageSquare className="h-3.5 w-3.5" />} tooltip="Conversas de WhatsApp abertas ou movimentadas dentro da plataforma." />
        <KpiCard label="Mensagens trocadas" value={fmtNum(wpp.mensagens)} tooltip="Total de mensagens enviadas e recebidas pelos representantes." />
        <KpiCard label="Tempo de 1ª resposta" value={fmtMin(wpp.primeiraRespostaMin)} icon={<Timer className="h-3.5 w-3.5" />} tooltip="Mediana do tempo entre a mensagem do cliente e a primeira resposta do vendedor." />
        <KpiCard label="Respondidas em 30 min" value={fmtPct(wpp.respondidasNoSLA)} tooltip="% de conversas respondidas dentro do SLA de 30 minutos." />
        <KpiCard label="Cliente respondeu" value={fmtPct(wpp.taxaResposta)} icon={<Reply className="h-3.5 w-3.5" />} tooltip="% das conversas em que o cliente respondeu o vendedor." />
        <KpiCard label="Aguardando vendedor" value={fmtNum(wpp.aguardandoResposta)} icon={<AlertTriangle className="h-3.5 w-3.5" />} tooltip="Conversas com mensagem do cliente sem resposta há mais de 24h." />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionCard title="Volume de mensagens" subtitle="Últimos 14 dias" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={wpp.serie} margin={{ left: -10, right: 8, top: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EEF0F4" vertical={false} />
              <XAxis dataKey="dia" tick={{ fontSize: 10 }} interval={1} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={tt} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="recebidas" name="Recebidas" stroke={NX.primary} fill={NX.primary} fillOpacity={0.15} strokeWidth={2} />
              <Area type="monotone" dataKey="enviadas" name="Enviadas" stroke={NX.accent} fill={NX.accent} fillOpacity={0.12} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Fila por tempo de espera" subtitle="Conversas aguardando resposta">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={wpp.filaSLA} layout="vertical" margin={{ left: 6, right: 16 }}>
              <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
              <YAxis type="category" dataKey="faixa" tick={{ fontSize: 10 }} width={70} />
              <Tooltip formatter={(v: number) => `${v} conversa(s)`} contentStyle={tt} />
              <Bar dataKey="qtd" radius={[0, 4, 4, 0]}>
                {wpp.filaSLA.map(f => <Cell key={f.faixa} fill={f.cor} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Horários de pico" subtitle={`Concentração às ${picos.sort((a, b) => a - b).map(h => `${h}h`).join(", ")}`}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={wpp.porHora} margin={{ left: -14, right: 8 }}>
              <XAxis dataKey="hora" tick={{ fontSize: 10 }} tickFormatter={(h) => `${h}h`} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip labelFormatter={(h) => `${h}h`} formatter={(v: number) => `${v} mensagens`} contentStyle={tt} />
              <Bar dataKey="qtd" radius={[4, 4, 0, 0]}>
                {wpp.porHora.map(h => (
                  <Cell key={h.hora} fill={picos.includes(h.hora) ? NX.accent : NX.primary} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Volume por dia da semana">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={wpp.porDiaSemana} margin={{ left: -14, right: 8 }}>
              <XAxis dataKey="dia" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v: number) => `${v} conversas`} contentStyle={tt} />
              <Bar dataKey="qtd" fill={CHART_PALETTE[2]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      <SectionCard title="Desempenho por representante" subtitle="Volume, velocidade de resposta e conversão da conversa">
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="text-left nx-muted border-b border-[#E7E9EE]">
                <th className="py-2 pr-3 font-medium">Representante</th>
                <th className="py-2 px-2 font-medium text-right">Conversas</th>
                <th className="py-2 px-2 font-medium text-right">Msg enviadas</th>
                <th className="py-2 px-2 font-medium text-right">1ª resposta</th>
                <th className="py-2 px-2 font-medium text-right">No SLA</th>
                <th className="py-2 px-2 font-medium text-right">Cliente respondeu</th>
                <th className="py-2 px-2 font-medium text-right">Sem resposta</th>
                <th className="py-2 pl-2 font-medium text-right">Virou pedido</th>
              </tr>
            </thead>
            <tbody>
              {wpp.porRep.map(r => (
                <tr key={r.repId} className="border-b border-[#F1F3F7] last:border-0">
                  <td className="py-2 pr-3">
                    <p className="font-semibold nx-text">{r.rep}</p>
                    <div className="h-1 mt-1 rounded-full bg-[#EEF0F4] w-24 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(r.conversas / maxRep) * 100}%`, background: NX.primary }} />
                    </div>
                  </td>
                  <td className="py-2 px-2 text-right nx-num">{fmtNum(r.conversas)}</td>
                  <td className="py-2 px-2 text-right nx-num nx-muted">{fmtNum(r.mensagensEnviadas)}</td>
                  <td className="py-2 px-2 text-right nx-num" style={{ color: r.primeiraRespostaMin > 60 ? STATUS_COLORS.perdido : r.primeiraRespostaMin > 30 ? STATUS_COLORS.inativo : STATUS_COLORS.ativo }}>
                    {fmtMin(r.primeiraRespostaMin)}
                  </td>
                  <td className="py-2 px-2 text-right nx-num">{fmtPct(r.respondidasNoSLA, 0)}</td>
                  <td className="py-2 px-2 text-right nx-num">{fmtPct(r.taxaResposta, 0)}</td>
                  <td className="py-2 px-2 text-right nx-num" style={{ color: r.conversasSemResposta > 3 ? STATUS_COLORS.perdido : NX.muted }}>
                    {r.conversasSemResposta}
                  </td>
                  <td className="py-2 pl-2 text-right nx-num font-semibold">{fmtPct(r.conversao, 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
