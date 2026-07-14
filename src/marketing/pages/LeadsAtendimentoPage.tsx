import { useState } from "react";
import { useAtendimentoComercial } from "@/contexts/AtendimentoComercialContext";
import { origemLabels } from "@/data/mockAtendimentoComercial";
import { NovoLeadModal } from "@/components/atendimentoComercial/NovoLeadModal";
import { TrendingUp, Users, DollarSign, Inbox, Plus, Play, Pause, ArrowRightLeft, MessageCircle } from "lucide-react";

export default function LeadsAtendimentoPage() {
  const { cards, colunas, inbox, vendedores, distribuirManual, distribuirRodizio, togglePausaVendedor } = useAtendimentoComercial();
  const [novoOpen, setNovoOpen] = useState(false);
  const [distribParaConv, setDistribParaConv] = useState<string | null>(null);

  const totalLeads = cards.length;
  const cpl = 12.4; // mock
  const colFila = colunas.find(c => c.key === "fila");
  const colOp = colunas.find(c => c.key === "oportunidade");
  const emFila = colFila ? cards.filter(c => c.colunaId === colFila.id).length : 0;
  const emOp = colOp ? cards.filter(c => c.colunaId === colOp.id).length : 0;
  const conversao = emFila + emOp > 0 ? Math.round((emOp / (emFila + emOp)) * 100) : 0;

  // por origem
  const porOrigem = Object.keys(origemLabels).map(o => {
    const items = cards.filter(c => c.origem === o);
    const opsItems = items.filter(c => c.colunaId === colOp?.id);
    return { origem: o, total: items.length, ops: opsItems.length, cpl: o === "meta_ads" ? 8.2 : o === "instagram" ? 4.5 : 0 };
  });

  // funil
  const funil = colunas.filter(c => c.key !== "perdido").sort((a, b) => a.ordem - b.ordem).map(col => ({
    label: col.label,
    qty: cards.filter(c => c.colunaId === col.id).length,
  }));

  const perdas = cards.filter(c => c.status === "perdido");
  const porMotivo = perdas.reduce<Record<string, number>>((acc, c) => {
    const m = c.motivoPerda ?? "Não informado";
    acc[m] = (acc[m] ?? 0) + 1;
    return acc;
  }, {});

  const leadsRecebidos = (vendId: string) => cards.filter(c => c.vendedorId === vendId).length;
  const opsAbertas = (vendId: string) => colOp ? cards.filter(c => c.vendedorId === vendId && c.colunaId === colOp.id).length : 0;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl md:text-2xl font-heading font-bold text-foreground">Leads & Atendimento</h1>
          <p className="text-xs text-muted-foreground">Origens, distribuição e conversão do WhatsApp central.</p>
        </div>
        <button onClick={() => setNovoOpen(true)} className="text-[12px] font-medium inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90">
          <Plus className="h-3.5 w-3.5" /> Lead manual
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Kpi icon={Users} label="Leads no período" value={totalLeads.toString()} />
        <Kpi icon={DollarSign} label="CPL médio" value={`R$ ${cpl.toFixed(2)}`} />
        <Kpi icon={TrendingUp} label="Fila → Oportunidade" value={`${conversao}%`} />
        <Kpi icon={Inbox} label="Aguardando distribuição" value={inbox.length.toString()} />
      </div>

      {/* Leads por origem */}
      <section className="bg-card border border-border rounded-xl p-4">
        <h2 className="text-sm font-semibold text-foreground mb-3">Leads por origem / campanha</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead className="text-[10px] uppercase text-muted-foreground">
              <tr className="border-b border-border">
                <th className="text-left py-2">Origem</th>
                <th className="text-right py-2">Volume</th>
                <th className="text-right py-2">CPL</th>
                <th className="text-right py-2">Oportunidades</th>
                <th className="text-right py-2">Conversão</th>
              </tr>
            </thead>
            <tbody>
              {porOrigem.map(o => (
                <tr key={o.origem} className="border-b border-border/40">
                  <td className="py-2 text-foreground font-medium">{origemLabels[o.origem as keyof typeof origemLabels]}</td>
                  <td className="py-2 text-right tabular-nums">{o.total}</td>
                  <td className="py-2 text-right tabular-nums text-muted-foreground">{o.cpl > 0 ? `R$ ${o.cpl.toFixed(2)}` : "—"}</td>
                  <td className="py-2 text-right tabular-nums">{o.ops}</td>
                  <td className="py-2 text-right tabular-nums">{o.total ? `${Math.round((o.ops / o.total) * 100)}%` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Funil */}
      <section className="bg-card border border-border rounded-xl p-4">
        <h2 className="text-sm font-semibold text-foreground mb-3">Conversão por etapa</h2>
        <div className="space-y-1.5">
          {funil.map((f, i) => {
            const max = Math.max(...funil.map(x => x.qty), 1);
            const w = (f.qty / max) * 100;
            return (
              <div key={i} className="flex items-center gap-2">
                <span className="text-[11px] text-muted-foreground w-40 truncate">{f.label}</span>
                <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full flex items-center justify-end pr-2 text-[10px] text-primary-foreground font-semibold" style={{ width: `${w}%` }}>
                    {f.qty > 0 && f.qty}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Perdas por motivo */}
      {perdas.length > 0 && (
        <section className="bg-card border border-border rounded-xl p-4">
          <h2 className="text-sm font-semibold text-foreground mb-3">Perdas por motivo</h2>
          <div className="space-y-1.5">
            {Object.entries(porMotivo).map(([m, q]) => (
              <div key={m} className="flex items-center justify-between text-[12px]">
                <span className="text-muted-foreground">{m}</span>
                <span className="font-semibold text-foreground tabular-nums">{q}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Inbox central */}
      <section className="bg-card border border-border rounded-xl p-4">
        <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <MessageCircle className="h-4 w-4" /> Inbox do WhatsApp central ({inbox.length})
        </h2>
        <div className="space-y-2">
          {inbox.length === 0 && <p className="text-[12px] text-muted-foreground">Nenhuma conversa aguardando distribuição.</p>}
          {inbox.map(conv => (
            <div key={conv.id} className="border border-border rounded-lg p-3">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-foreground">{conv.nome}</p>
                  <p className="text-[11px] text-muted-foreground">{conv.telefone} · {origemLabels[conv.origem]}{conv.campanha ? ` · ${conv.campanha}` : ""}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => distribuirRodizio(conv.id)} className="text-[11px] px-2 py-1 rounded border border-border hover:bg-muted inline-flex items-center gap-1">
                    <ArrowRightLeft className="h-3 w-3" /> Rodízio
                  </button>
                  <button onClick={() => setDistribParaConv(distribParaConv === conv.id ? null : conv.id)} className="text-[11px] px-2 py-1 rounded bg-primary text-primary-foreground">Distribuir para…</button>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground line-clamp-2">{conv.ultimaMensagem}</p>
              {distribParaConv === conv.id && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {vendedores.filter(v => !v.pausado).map(v => (
                    <button key={v.id} onClick={() => { distribuirManual(conv.id, v.id); setDistribParaConv(null); }}
                      className="text-[11px] px-2 py-1 rounded border border-border hover:border-primary/40">{v.nome}</button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Controle de distribuição */}
      <section className="bg-card border border-border rounded-xl p-4">
        <h2 className="text-sm font-semibold text-foreground mb-3">Controle de distribuição</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead className="text-[10px] uppercase text-muted-foreground">
              <tr className="border-b border-border">
                <th className="text-left py-2">Vendedor</th>
                <th className="text-right py-2">Leads (total)</th>
                <th className="text-right py-2">Oportunidades abertas</th>
                <th className="text-right py-2">Rodízio</th>
              </tr>
            </thead>
            <tbody>
              {vendedores.map(v => (
                <tr key={v.id} className="border-b border-border/40">
                  <td className="py-2 text-foreground font-medium">{v.nome}</td>
                  <td className="py-2 text-right tabular-nums">{leadsRecebidos(v.id)}</td>
                  <td className="py-2 text-right tabular-nums">{opsAbertas(v.id)}</td>
                  <td className="py-2 text-right">
                    <button onClick={() => togglePausaVendedor(v.id)}
                      className={`text-[11px] inline-flex items-center gap-1 px-2 py-0.5 rounded border ${v.pausado ? "bg-amber-100 text-amber-700 border-amber-200" : "bg-emerald-100 text-emerald-700 border-emerald-200"}`}>
                      {v.pausado ? <><Pause className="h-3 w-3" /> Pausado</> : <><Play className="h-3 w-3" /> Ativo</>}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <NovoLeadModal open={novoOpen} onClose={() => setNovoOpen(false)} />
    </div>
  );
}

function Kpi({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-3">
      <div className="flex items-center gap-2 mb-1">
        <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
          <Icon className="h-3.5 w-3.5" />
        </div>
        <p className="text-[10px] uppercase text-muted-foreground font-semibold">{label}</p>
      </div>
      <p className="text-xl font-bold text-foreground tabular-nums">{value}</p>
    </div>
  );
}
