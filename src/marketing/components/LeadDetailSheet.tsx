import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScoreBadge, ScoreBar } from "./ScoreBadge";
import { useMarketing } from "../contexts/MarketingDataContext";
import { SINAL_LABELS, scoreCores, classificar } from "../data/leadScoring";
import { channelLabels, channelColors, formatBRL, formatBRLCompact } from "../styles/tokens";
import { Link } from "react-router-dom";
import { ExternalLink, CheckCircle2, XCircle, MessageCircle, TrendingUp } from "lucide-react";
import { toast } from "sonner";

export function LeadDetailSheet({ leadId, open, onOpenChange }: { leadId: string | null; open: boolean; onOpenChange: (o: boolean) => void }) {
  const { leads, leadScores, registrarPedidoCrm, pedidosCrm } = useMarketing();
  const [valorPedido, setValorPedido] = useState("");
  const [resultadoMsg, setResultadoMsg] = useState<string>("");

  const lead = leadId ? leads.find(l => l.id === leadId) : null;
  const score = lead ? leadScores.get(lead.id) : null;

  if (!lead || !score) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-[480px]" />
      </Sheet>
    );
  }

  const cls = classificar(score.score);
  const cores = scoreCores[cls];
  const pedido = pedidosCrm[lead.id];

  const registrarGanho = () => {
    const v = parseFloat(valorPedido.replace(/\D/g, ""));
    if (!v || v <= 0) { toast.error("Informe o valor do pedido"); return; }
    registrarPedidoCrm(lead.id, v, new Date().toISOString());
    toast.success(`Pedido de ${formatBRL(v)} registrado — receita CRM atualizada no Marketing`);
    setValorPedido("");
  };
  const registrarPerda = () => {
    setResultadoMsg("Lead marcado como perdido — entrará na jornada de re-ativação automaticamente.");
    toast("Lead marcado como perdido", { description: "Adicionado à jornada de re-ativação" });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[520px] overflow-y-auto">
        <SheetHeader className="space-y-3 pb-4 border-b">
          <div className="flex items-start justify-between gap-3">
            <div>
              <SheetTitle className="text-lg">{lead.clienteNome}</SheetTitle>
              <p className="text-[11px] text-muted-foreground mt-1 inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: channelColors[lead.origem] }} />
                {channelLabels[lead.origem]} · UTM {lead.utm.campaign}
              </p>
            </div>
            <ScoreBadge score={score.score} tendencia={score.tendencia} size="md" />
          </div>
          <div>
            <ScoreBar score={score.score} />
            <p className={`text-[11px] mt-1 font-medium ${cores.text}`}>{cores.emoji} Lead {cls} · tendência {score.tendencia}</p>
          </div>
        </SheetHeader>

        <div className="py-4 space-y-4">
          {/* Sugestão */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
            <p className="text-[10px] uppercase font-semibold text-primary mb-1">Sugestão de abordagem</p>
            <p className="text-[13px] text-foreground">{score.sugestaoAbordagem}</p>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-2 gap-2">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
              <MessageCircle className="h-4 w-4 mr-1" /> Iniciar WhatsApp
            </Button>
            {lead.clienteId && (
              <Button asChild size="sm" variant="outline">
                <Link to={`/vendedor/360/${lead.clienteId}`}>
                  Ficha 360 <ExternalLink className="h-3.5 w-3.5 ml-1" />
                </Link>
              </Button>
            )}
          </div>

          {/* Breakdown de score */}
          <div>
            <h3 className="text-[12px] font-semibold mb-2 flex items-center gap-1.5"><TrendingUp className="h-3.5 w-3.5" /> Como o score foi calculado</h3>
            <div className="space-y-1">
              {score.breakdown.map(b => (
                <div key={b.tipo} className="flex items-center justify-between text-[12px] py-1.5 px-2 rounded bg-muted/40">
                  <span className="text-foreground">{SINAL_LABELS[b.tipo]} {b.count > 1 && <span className="text-muted-foreground">×{b.count}</span>}</span>
                  <span className={`tabular-nums font-semibold ${b.pts > 0 ? "text-emerald-600" : "text-rose-600"}`}>{b.pts > 0 ? "+" : ""}{b.pts}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div>
            <h3 className="text-[12px] font-semibold mb-2">Timeline de interações</h3>
            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
              {score.sinais.slice(0, 12).map(s => (
                <div key={s.id} className="flex items-start gap-2 text-[11px]">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground">
                      {SINAL_LABELS[s.tipo]}
                      {s.meta?.lookbookNome && <span className="text-muted-foreground"> — {s.meta.lookbookNome}</span>}
                    </p>
                    <p className="text-muted-foreground text-[10px]">{new Date(s.data).toLocaleString("pt-BR")}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Registrar resultado CRM */}
          <div className="border-t pt-4">
            <h3 className="text-[12px] font-semibold mb-2">Registrar resultado no CRM</h3>
            {pedido ? (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 text-[12px]">
                <p className="font-medium text-emerald-700">Pedido fechado: {formatBRLCompact(pedido.valor)}</p>
                <p className="text-[10px] text-muted-foreground mt-1">Atribuído a esta campanha · {new Date(pedido.data).toLocaleDateString("pt-BR")}</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    value={valorPedido}
                    onChange={e => setValorPedido(e.target.value.replace(/\D/g, ""))}
                    placeholder="Valor do pedido (R$)"
                    className="flex-1 px-3 py-2 text-[12px] border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  <Button size="sm" onClick={registrarGanho} className="bg-emerald-600 hover:bg-emerald-700">
                    <CheckCircle2 className="h-4 w-4 mr-1" /> Ganho
                  </Button>
                </div>
                <Button size="sm" variant="outline" onClick={registrarPerda} className="w-full text-rose-600 border-rose-300 hover:bg-rose-50">
                  <XCircle className="h-4 w-4 mr-1" /> Marcar como perdido
                </Button>
                {resultadoMsg && <p className="text-[11px] text-muted-foreground italic">{resultadoMsg}</p>}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
