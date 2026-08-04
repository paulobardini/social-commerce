// Dashboards de tickets (pós-venda): volume, tipos, etapas, aging, atendentes e clientes.
import { useMemo } from "react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, Legend,
  PieChart, Pie,
} from "recharts";
import { SectionCard } from "../SectionCard";
import { KpiCard } from "../KpiCard";
import { NX, CHART_PALETTE, fmtNum, fmtPct, fmtDias, fmtBRLc } from "../../styles/tokens";
import {
  mockTickets, defaultFunis, mockAtendentes, setorLabels, tipoLabels,
  type Setor, type Ticket,
} from "@/data/mockAtendimento";
import { Ticket as TicketIcon, AlarmClock, Flame, CheckCircle2 } from "lucide-react";

const SETORES: Setor[] = ["sac", "cobranca", "financeiro", "logistica"];

function parseData(s: string): Date {
  const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  return m ? new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1])) : new Date();
}
const aging = (t: Ticket) => Math.floor((Date.now() - parseData(t.dataAbertura).getTime()) / 86400000);

// etapas finais por setor (resolvido / encerrado / pago / conciliado / entregue)
const FINAIS = new Set([
  "sac-resol", "sac-enc", "cob-pago", "cob-perd", "fin-conc", "fin-enc", "log-entr", "log-dev",
]);
const colunaLabel = (id: string) =>
  defaultFunis.flatMap(f => f.colunas).find(c => c.id === id)?.label ?? id;

export function TicketsAnalytics() {
  const tickets = mockTickets;

  const abertos = useMemo(() => tickets.filter(t => !FINAIS.has(t.statusColunaId)), [tickets]);
  const resolvidos = tickets.length - abertos.length;
  const urgentes = abertos.filter(t => t.prioridade === "urgente").length;
  const estourados = abertos.filter(t => aging(t) > 3).length;
  const tempoMedio = abertos.length
    ? abertos.reduce((s, t) => s + aging(t), 0) / abertos.length
    : 0;
  const taxaResolucao = tickets.length ? (resolvidos / tickets.length) * 100 : 0;

  // por tipo
  const porTipo = useMemo(() => {
    const m = new Map<string, number>();
    tickets.forEach(t => m.set(t.tipo, (m.get(t.tipo) ?? 0) + 1));
    return [...m.entries()]
      .map(([tipo, qtd]) => ({ tipo: tipoLabels[tipo as keyof typeof tipoLabels] ?? tipo, qtd }))
      .sort((a, b) => b.qtd - a.qtd);
  }, [tickets]);

  // setor × etapa (aberto / em andamento / finalizado)
  const porSetorEtapa = useMemo(() => SETORES.map(s => {
    const tks = tickets.filter(t => t.setor === s);
    const funil = defaultFunis.find(f => f.setor === s)!;
    const primeira = funil.colunas[0].id;
    return {
      setor: setorLabels[s],
      Novos: tks.filter(t => t.statusColunaId === primeira).length,
      "Em andamento": tks.filter(t => t.statusColunaId !== primeira && !FINAIS.has(t.statusColunaId)).length,
      Finalizados: tks.filter(t => FINAIS.has(t.statusColunaId)).length,
    };
  }), [tickets]);

  // aging dos abertos
  const buckets = useMemo(() => {
    const defs: { label: string; test: (d: number) => boolean; cor: string }[] = [
      { label: "≤ 1 dia", test: d => d <= 1, cor: "#16A34A" },
      { label: "2-3 dias", test: d => d > 1 && d <= 3, cor: "#EAB308" },
      { label: "4-7 dias", test: d => d > 3 && d <= 7, cor: "#F97316" },
      { label: "8+ dias", test: d => d > 7, cor: "#DC2626" },
    ];
    return defs.map(d => ({ label: d.label, qtd: abertos.filter(t => d.test(aging(t))).length, cor: d.cor }));
  }, [abertos]);

  // por atendente
  const porAtendente = useMemo(() => mockAtendentes.map(a => {
    const tks = tickets.filter(t => t.responsavelId === a.id);
    const ab = tks.filter(t => !FINAIS.has(t.statusColunaId));
    return {
      nome: a.nome.split(" ")[0],
      abertos: ab.length,
      finalizados: tks.length - ab.length,
      atrasados: ab.filter(t => aging(t) > 3).length,
      total: tks.length,
    };
  }).filter(a => a.total > 0).sort((a, b) => b.total - a.total), [tickets]);

  // clientes com mais tickets
  const porCliente = useMemo(() => {
    const m = new Map<string, { empresa: string; total: number; abertos: number; setores: Set<Setor>; valor: number }>();
    tickets.forEach(t => {
      const cur = m.get(t.empresa) ?? { empresa: t.empresa, total: 0, abertos: 0, setores: new Set<Setor>(), valor: 0 };
      cur.total += 1;
      if (!FINAIS.has(t.statusColunaId)) cur.abertos += 1;
      cur.setores.add(t.setor);
      cur.valor += t.historicoCompras.reduce((s, p) => s + p.valor, 0);
      m.set(t.empresa, cur);
    });
    return [...m.values()].sort((a, b) => b.total - a.total).slice(0, 8);
  }, [tickets]);

  const gargalos = useMemo(() => {
    const m = new Map<string, number>();
    abertos.forEach(t => m.set(t.statusColunaId, (m.get(t.statusColunaId) ?? 0) + 1));
    return [...m.entries()]
      .map(([id, qtd]) => ({ etapa: colunaLabel(id), qtd }))
      .sort((a, b) => b.qtd - a.qtd)
      .slice(0, 6);
  }, [abertos]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
        <KpiCard label="Tickets abertos" value={fmtNum(abertos.length)} icon={<TicketIcon className="h-3.5 w-3.5" />} tooltip="Tickets que ainda não chegaram a uma etapa final do funil do setor." />
        <KpiCard label="Urgentes em aberto" value={fmtNum(urgentes)} icon={<Flame className="h-3.5 w-3.5" />} tooltip="Tickets abertos marcados com prioridade urgente." />
        <KpiCard label="Fora do prazo (3d+)" value={fmtNum(estourados)} icon={<AlarmClock className="h-3.5 w-3.5" />} tooltip="Tickets abertos há mais de 3 dias sem finalização." />
        <KpiCard label="Tempo médio em aberto" value={fmtDias(tempoMedio)} tooltip="Média de dias desde a abertura dos tickets ainda ativos." />
        <KpiCard label="Taxa de resolução" value={fmtPct(taxaResolucao)} icon={<CheckCircle2 className="h-3.5 w-3.5" />} tooltip="% do total de tickets que já chegou a uma etapa final." />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Tickets por assunto" subtitle="Motivos mais recorrentes de contato">
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={porTipo} layout="vertical" margin={{ left: 10, right: 20 }}>
              <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
              <YAxis type="category" dataKey="tipo" tick={{ fontSize: 11 }} width={100} />
              <Tooltip formatter={(v: number) => `${v} ticket(s)`} contentStyle={{ background: "#fff", border: "1px solid #E7E9EE", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="qtd" radius={[0, 4, 4, 0]}>
                {porTipo.map((_, i) => <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Situação por setor" subtitle="Novos, em andamento e finalizados">
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={porSetorEtapa}>
              <XAxis dataKey="setor" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "#fff", border: "1px solid #E7E9EE", borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Novos" stackId="a" fill="#94A3B8" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Em andamento" stackId="a" fill={NX.primary} />
              <Bar dataKey="Finalizados" stackId="a" fill="#16A34A" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Tempo de espera dos tickets abertos" subtitle="Distribuição por faixa de dias desde a abertura">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={buckets} dataKey="qtd" nameKey="label" innerRadius={50} outerRadius={80} paddingAngle={2}>
                {buckets.map((b, i) => <Cell key={i} fill={b.cor} />)}
              </Pie>
              <Tooltip formatter={(v: number, n) => [`${v} ticket(s)`, n as string]} contentStyle={{ background: "#fff", border: "1px solid #E7E9EE", borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Onde os tickets estão parando" subtitle="Etapas com mais tickets em aberto">
          {gargalos.length === 0 ? (
            <p className="text-xs nx-muted py-8 text-center">Nenhum ticket em aberto</p>
          ) : (
            <div className="space-y-2 pt-1">
              {gargalos.map((g, i) => {
                const max = gargalos[0].qtd || 1;
                return (
                  <div key={g.etapa}>
                    <div className="flex items-center justify-between text-[11px] mb-0.5">
                      <span className="nx-text">{g.etapa}</span>
                      <span className="nx-num nx-muted">{g.qtd}</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-[#F1F3F8] overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(g.qtd / max) * 100}%`, background: i === 0 ? "#DC2626" : NX.primary }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Carga por atendente" subtitle="Tickets em aberto, finalizados e atrasados">
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-[#E7E9EE] nx-muted">
                  <th className="text-left font-medium pb-1.5">Atendente</th>
                  <th className="text-right font-medium pb-1.5">Abertos</th>
                  <th className="text-right font-medium pb-1.5">Finalizados</th>
                  <th className="text-right font-medium pb-1.5">Atrasados</th>
                </tr>
              </thead>
              <tbody>
                {porAtendente.map(a => (
                  <tr key={a.nome} className="border-b border-[#F1F3F8] last:border-0">
                    <td className="py-1.5 nx-text font-medium">{a.nome}</td>
                    <td className="py-1.5 text-right nx-num">{a.abertos}</td>
                    <td className="py-1.5 text-right nx-num">{a.finalizados}</td>
                    <td className={`py-1.5 text-right nx-num ${a.atrasados > 0 ? "text-rose-600 font-semibold" : "nx-muted"}`}>{a.atrasados}</td>
                  </tr>
                ))}
                {porAtendente.length === 0 && (
                  <tr><td colSpan={4} className="py-6 text-center nx-muted">Sem tickets atribuídos</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard title="Clientes que mais abrem chamado" subtitle="Volume de tickets e setores envolvidos">
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-[#E7E9EE] nx-muted">
                  <th className="text-left font-medium pb-1.5">Cliente</th>
                  <th className="text-right font-medium pb-1.5">Tickets</th>
                  <th className="text-right font-medium pb-1.5">Abertos</th>
                  <th className="text-left font-medium pb-1.5 pl-3">Setores</th>
                  <th className="text-right font-medium pb-1.5">Compras</th>
                </tr>
              </thead>
              <tbody>
                {porCliente.map(c => (
                  <tr key={c.empresa} className="border-b border-[#F1F3F8] last:border-0">
                    <td className="py-1.5 nx-text font-medium truncate max-w-[150px]">{c.empresa}</td>
                    <td className="py-1.5 text-right nx-num">{c.total}</td>
                    <td className={`py-1.5 text-right nx-num ${c.abertos > 0 ? "text-amber-600 font-semibold" : "nx-muted"}`}>{c.abertos}</td>
                    <td className="py-1.5 pl-3 nx-muted">{[...c.setores].map(s => setorLabels[s]).join(", ")}</td>
                    <td className="py-1.5 text-right nx-num nx-muted">{fmtBRLc(c.valor)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
