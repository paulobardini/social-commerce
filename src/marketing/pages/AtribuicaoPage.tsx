import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMarketing } from "../contexts/MarketingDataContext";
import { channelColors, channelLabels, formatBRL, formatBRLCompact, formatRoas, MktChannel } from "../styles/tokens";
import { ChevronDown, ChevronRight, ExternalLink } from "lucide-react";

type Modelo = "first" | "last" | "linear" | "time_decay" | "data_driven";
const modeloLabels: Record<Modelo, string> = {
  first: "First-touch",
  last: "Last-touch",
  linear: "Linear",
  time_decay: "Time-decay",
  data_driven: "Data-driven",
};

export default function AtribuicaoPage() {
  const { leads } = useMarketing();
  const [modelo, setModelo] = useState<Modelo>("linear");
  const [expanded, setExpanded] = useState<string | null>(null);

  const leadsComJornada = useMemo(
    () => leads.filter(l => l.touchpoints.length > 1).slice(0, 30),
    [leads]
  );

  // Distribuição de receita atribuída por canal segundo o modelo
  const distribByChannel = useMemo(() => {
    const map: Record<string, { receita: number; custo: number; touches: number }> = {};
    leads.forEach(l => {
      if (l.receita === 0) return;
      const tps = l.touchpoints.filter(t => t.type !== "purchase");
      if (tps.length === 0) return;
      const weights: number[] = (() => {
        switch (modelo) {
          case "first": return tps.map((_, i) => i === 0 ? 1 : 0);
          case "last": return tps.map((_, i) => i === tps.length - 1 ? 1 : 0);
          case "linear": return tps.map(() => 1 / tps.length);
          case "time_decay": {
            const w = tps.map((_, i) => Math.pow(2, i));
            const sum = w.reduce((a, b) => a + b, 0);
            return w.map(x => x / sum);
          }
          case "data_driven": return tps.map((_, i) => (i + 1) / ((tps.length * (tps.length + 1)) / 2));
        }
      })();
      tps.forEach((t, i) => {
        const ch = t.channel;
        if (!map[ch]) map[ch] = { receita: 0, custo: 0, touches: 0 };
        map[ch].receita += l.receita * weights[i];
        map[ch].custo += l.custoAtribuido * weights[i];
        map[ch].touches += 1;
      });
    });
    return Object.entries(map)
      .map(([ch, v]) => ({ channel: ch as MktChannel, ...v, roas: v.custo > 0 ? v.receita / v.custo : 0 }))
      .sort((a, b) => b.receita - a.receita);
  }, [leads, modelo]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-foreground">Atribuição</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Como cada canal contribui para a receita conforme o modelo escolhido.</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
          <h2 className="text-sm font-semibold text-foreground">Modelo de atribuição</h2>
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            {(Object.keys(modeloLabels) as Modelo[]).map(m => (
              <button
                key={m}
                onClick={() => setModelo(m)}
                className={`text-[11px] font-medium px-2.5 py-1 rounded ${
                  modelo === m ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {modeloLabels[m]}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {distribByChannel.map(d => (
            <div key={d.channel} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/40">
              <span className="h-3 w-3 rounded-sm shrink-0" style={{ background: channelColors[d.channel] }} />
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-foreground">{channelLabels[d.channel]}</p>
                <p className="text-[10px] text-muted-foreground">{d.touches} toques · custo {formatBRLCompact(d.custo)}</p>
              </div>
              <div className="text-right">
                <p className="text-[13px] font-semibold tabular-nums">{formatBRLCompact(d.receita)}</p>
                <p className={`text-[10px] tabular-nums ${d.roas >= 2 ? "text-emerald-600" : d.roas >= 1 ? "text-amber-600" : "text-rose-600"}`}>
                  ROAS {formatRoas(d.roas)}
                </p>
              </div>
            </div>
          ))}
          {distribByChannel.length === 0 && (
            <p className="col-span-full text-[12px] text-muted-foreground text-center py-6">Sem receita atribuída neste recorte.</p>
          )}
        </div>
      </div>

      {/* Jornada do lead */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h2 className="text-sm font-semibold text-foreground mb-3">Jornada dos leads · {leadsComJornada.length} amostrados</h2>
        <div className="space-y-1">
          {leadsComJornada.map(l => {
            const isOpen = expanded === l.id;
            return (
              <div key={l.id} className="border border-border rounded-lg overflow-hidden">
                <button onClick={() => setExpanded(isOpen ? null : l.id)} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted/40 transition-colors text-left">
                  {isOpen ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ background: channelColors[l.origem] }} />
                  <span className="text-[12px] font-medium text-foreground truncate flex-1">{l.clienteNome}</span>
                  <span className="text-[10px] text-muted-foreground hidden md:inline">{l.touchpoints.length} toques</span>
                  <span className={`text-[10px] uppercase font-medium px-2 py-0.5 rounded ${
                    l.status === "ganho" ? "bg-emerald-500/10 text-emerald-600" :
                    l.status === "perdido" ? "bg-rose-500/10 text-rose-600" :
                    l.status === "oportunidade" ? "bg-amber-500/10 text-amber-700" :
                    "bg-muted text-muted-foreground"
                  }`}>{l.status}</span>
                  {l.receita > 0 && <span className="text-[11px] font-semibold text-emerald-600 tabular-nums">{formatBRLCompact(l.receita)}</span>}
                </button>
                {isOpen && (
                  <div className="border-t border-border bg-muted/20 px-3 py-3">
                    <div className="flex items-center gap-2 overflow-x-auto pb-2">
                      {l.touchpoints.map((t, i) => (
                        <div key={t.id} className="flex items-center gap-2 shrink-0">
                          <div className="flex flex-col items-center gap-1">
                            <div className="h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ background: channelColors[t.channel] }}>
                              {channelLabels[t.channel].slice(0, 2)}
                            </div>
                            <p className="text-[9px] text-muted-foreground">{t.type.replace("_", " ")}</p>
                            <p className="text-[9px] text-foreground">{new Date(t.date).toLocaleDateString("pt-BR")}</p>
                          </div>
                          {i < l.touchpoints.length - 1 && <div className="h-px w-6 bg-border" />}
                        </div>
                      ))}
                    </div>
                    {l.clienteId && (
                      <Link to={`/vendedor/360/${l.clienteId}`} className="text-[11px] text-primary hover:underline inline-flex items-center gap-1 mt-2">
                        Ver Cliente 360 <ExternalLink className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
