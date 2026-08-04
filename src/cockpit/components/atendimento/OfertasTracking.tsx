// Trackeamento de ofertas: produtos enviados via WhatsApp/link, recebimento,
// abertura, resposta e conversão em pedido.
import { SectionCard } from "../SectionCard";
import { KpiCard } from "../KpiCard";
import { fmtBRLc, fmtNum, fmtPct, NX, CHART_PALETTE } from "../../styles/tokens";
import type { OfertaProduto, OfertaResumo } from "../../lib/ofertas";
import type { TrackingOfertas } from "../../lib/ofertas";
import { Send, MailOpen, ShoppingBag, EyeOff } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";

const tt = { background: "#fff", border: "1px solid #E7E9EE", borderRadius: 8, fontSize: 12 };

interface Props {
  lista: OfertaProduto[];
  resumo: OfertaResumo;
  tracking: TrackingOfertas;
}

export function OfertasTracking({ lista, resumo, tracking }: Props) {
  const topAbertura = [...lista]
    .filter(o => o.envios >= 8)
    .sort((a, b) => b.taxaAbertura - a.taxaAbertura)
    .slice(0, 8)
    .map(o => ({ nome: o.produtoNome, taxa: o.taxaAbertura, marca: o.marcaNome }));

  const maxEtapa = tracking.etapas[0]?.valor || 1;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <KpiCard label="Produtos enviados" value={fmtNum(resumo.totalEnvios)} icon={<Send className="h-3.5 w-3.5" />} tooltip="Quantidade de produtos enviados a clientes em links, catálogos e mensagens." />
        <KpiCard label="Entregues" value={fmtPct(tracking.entregues / Math.max(1, resumo.totalEnvios) * 100)} tooltip="% das ofertas com confirmação de entrega no WhatsApp." />
        <KpiCard label="Taxa de abertura" value={fmtPct(resumo.taxaAbertura)} icon={<MailOpen className="h-3.5 w-3.5" />} tooltip="% dos links de produto que foram abertos pelo cliente." />
        <KpiCard label="Tempo até abrir" value={`${tracking.tempoMedioAberturaH.toFixed(1).replace(".", ",")}h`} tooltip="Tempo médio entre o envio do link e a primeira abertura." />
        <KpiCard label="Viraram pedido" value={fmtPct(resumo.conversaoMedia)} icon={<ShoppingBag className="h-3.5 w-3.5" />} tooltip="% das ofertas enviadas que resultaram em pedido." />
        <KpiCard label="Nunca abertos" value={fmtNum(tracking.semAbertura)} icon={<EyeOff className="h-3.5 w-3.5" />} tooltip="Ofertas entregues que o cliente nunca abriu — esforço sem retorno." />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Jornada da oferta" subtitle="Envio → recebimento → abertura → resposta → pedido">
          <div className="space-y-2">
            {tracking.etapas.map((e, i) => (
              <div key={e.etapa}>
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-medium nx-text">{e.etapa}</span>
                  <span className="nx-muted nx-num">
                    {fmtNum(e.valor)} · {fmtPct(e.pctTotal, 0)} do total
                    {i > 0 && <span className="ml-1 text-[#94A3B8]">({fmtPct(e.pctAnterior, 0)} da etapa anterior)</span>}
                  </span>
                </div>
                <div className="h-6 rounded bg-[#F1F3F7] overflow-hidden">
                  <div
                    className="h-full rounded transition-all"
                    style={{ width: `${Math.max(2, (e.valor / maxEtapa) * 100)}%`, background: CHART_PALETTE[i % CHART_PALETTE.length] }}
                  />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Abertura por canal de envio" subtitle="Onde a oferta é mais vista">
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={tracking.porCanal} layout="vertical" margin={{ left: 6, right: 20 }}>
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
              <YAxis type="category" dataKey="canal" tick={{ fontSize: 10 }} width={150} />
              <Tooltip formatter={(v: number, _n, p) => [`${fmtPct(v)} de abertura · ${fmtNum((p.payload as { envios: number }).envios)} envios`, "Abertura"]} contentStyle={tt} />
              <Bar dataKey="taxa" radius={[0, 4, 4, 0]}>
                {tracking.porCanal.map((c, i) => <Cell key={c.canal} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Produtos com maior abertura" subtitle="Chamam atenção quando enviados">
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={topAbertura} layout="vertical" margin={{ left: 6, right: 20 }}>
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
              <YAxis type="category" dataKey="nome" tick={{ fontSize: 10 }} width={90} />
              <Tooltip formatter={(v: number) => fmtPct(v)} contentStyle={tt} />
              <Bar dataKey="taxa" fill={NX.primary} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Leitura rápida" subtitle="O que fazer com esses números">
          <div className="space-y-2">
            {[
              { t: "Oferta que converte", cor: "#16A34A", itens: resumo.vitrine, campo: (o: OfertaProduto) => `${fmtPct(o.conversao, 0)} de conversão · ${fmtBRLc(o.receita)}` },
              { t: "Muito enviada, sem retorno", cor: "#DC2626", itens: resumo.desperdicio, campo: (o: OfertaProduto) => `${fmtNum(o.envios)} envios · ${fmtPct(o.conversao, 0)} de conversão` },
              { t: "Converte, mas é pouco ofertada", cor: "#F26B21", itens: resumo.ocultos, campo: (o: OfertaProduto) => `${fmtNum(o.envios)} envios · ${fmtPct(o.conversao, 0)} de conversão` },
            ].map(bloco => (
              <div key={bloco.t} className="rounded-lg border border-[#E7E9EE] p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: bloco.cor }} />
                  <p className="text-[11px] font-semibold nx-text">{bloco.t}</p>
                </div>
                {bloco.itens.length === 0
                  ? <p className="text-[11px] nx-muted">Sem produtos nesta faixa.</p>
                  : (
                    <ul className="space-y-1">
                      {bloco.itens.slice(0, 3).map(o => (
                        <li key={o.produtoId} className="flex items-center justify-between text-[11px]">
                          <span className="nx-text truncate mr-2">{o.produtoNome} <span className="nx-muted">· {o.marcaNome}</span></span>
                          <span className="nx-muted nx-num shrink-0">{bloco.campo(o)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
