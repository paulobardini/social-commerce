import { useMemo, useState } from "react";
import { useAtendimentoComercial } from "@/contexts/AtendimentoComercialContext";
import { perdasDrilldown, funilRenutricao, PerdaAgregada } from "@/lib/atendimentoAnalytics";
import { CardAC, origemLabels } from "@/data/mockAtendimentoComercial";
import { ChevronDown, ChevronRight, Archive, Sparkles, Frown, ArrowRightLeft, Search, Undo2, Calendar } from "lucide-react";
import { formatBRLCompact, formatPct, origemACColors, type OrigemAC } from "../styles/tokens";
import { useToast } from "@/hooks/use-toast";

type Aba = "analise" | "renutricao" | "arquivados";

interface Props {
  cardsPeriodo: CardAC[];
}

export function PerdidosSection({ cardsPeriodo }: Props) {
  const [aba, setAba] = useState<Aba>("analise");
  const { colunas, moverParaRenutricao, arquivarCard, reativarMarketing } = useAtendimentoComercial();

  const drill = useMemo(() => perdasDrilldown(cardsPeriodo), [cardsPeriodo]);
  const funil = useMemo(() => funilRenutricao(cardsPeriodo, colunas), [cardsPeriodo, colunas]);

  const perdidos = cardsPeriodo.filter(c => c.status === "perdido" || c.perda);
  const emRenutricao = cardsPeriodo.filter(c => c.marketingStatus === "renutricao");
  const arquivados = cardsPeriodo.filter(c => c.marketingStatus === "arquivado");
  const sugeridos = funil.sugeridos;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1 bg-muted rounded-lg p-1 w-fit">
        {[
          { k: "analise", label: `Análise (${perdidos.length})` },
          { k: "renutricao", label: `Renutrição (${emRenutricao.length}${sugeridos.length ? ` +${sugeridos.length}` : ""})` },
          { k: "arquivados", label: `Arquivados (${arquivados.length})` },
        ].map(t => (
          <button
            key={t.k}
            onClick={() => setAba(t.k as Aba)}
            className={`text-[11px] font-medium px-3 py-1.5 rounded ${
              aba === t.k ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {aba === "analise" && <AbaAnalise drill={drill} totalPerdidos={perdidos.length} />}
      {aba === "renutricao" && (
        <AbaRenutricao
          emRenutricao={emRenutricao}
          sugeridos={sugeridos}
          onMover={(id, campanha, data) => moverParaRenutricao(id, { nome: campanha, data: new Date(data).toISOString() })}
          onArquivar={arquivarCard}
          onRemover={reativarMarketing}
        />
      )}
      {aba === "arquivados" && (
        <AbaArquivados
          arquivados={arquivados}
          onDesarquivar={reativarMarketing}
        />
      )}
    </div>
  );
}

// ---------------- ANÁLISE (drill-down motivo → sub-motivo) ----------------
function AbaAnalise({ drill, totalPerdidos }: { drill: PerdaAgregada[]; totalPerdidos: number }) {
  const [aberto, setAberto] = useState<Record<string, boolean>>({});

  if (totalPerdidos === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 text-center">
        <Frown className="h-8 w-8 mx-auto text-muted-foreground opacity-40 mb-2" />
        <p className="text-sm text-muted-foreground">Nenhum lead perdido no período</p>
      </div>
    );
  }
  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-2">
      <h3 className="text-sm font-semibold text-foreground mb-2">Perdas por motivo → sub-motivo</h3>
      {drill.map(row => {
        const pct = (row.total / totalPerdidos) * 100;
        const open = !!aberto[row.motivo];
        return (
          <div key={row.motivo} className="border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setAberto(a => ({ ...a, [row.motivo]: !open }))}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted/30 text-left"
            >
              {open ? <ChevronDown className="h-3.5 w-3.5 shrink-0" /> : <ChevronRight className="h-3.5 w-3.5 shrink-0" />}
              <span className="text-[13px] font-medium text-foreground flex-1 truncate">{row.motivo}</span>
              <span className="text-[11px] text-muted-foreground tabular-nums shrink-0">
                {row.total} · {formatPct(pct, 0)}
              </span>
              {row.valorPerdido > 0 && (
                <span className="text-[11px] text-rose-700 tabular-nums shrink-0">{formatBRLCompact(row.valorPerdido)} pot.</span>
              )}
            </button>
            <div className="h-1.5 bg-muted">
              <div className="h-full bg-rose-500/70" style={{ width: `${pct}%` }} />
            </div>
            {open && (
              <div className="border-t border-border/60 bg-muted/10 divide-y divide-border/40">
                {row.subMotivos.map(sm => (
                  <div key={sm.subMotivo} className="px-3 py-2 pl-9 flex items-center gap-2">
                    <span className="text-[11px] text-muted-foreground shrink-0">↳</span>
                    <span className="text-[12px] text-foreground flex-1 truncate">{sm.subMotivo}</span>
                    <span className="text-[11px] tabular-nums text-muted-foreground shrink-0">{sm.cards.length}</span>
                    {sm.valorPerdido > 0 && (
                      <span className="text-[11px] tabular-nums text-rose-700 shrink-0">{formatBRLCompact(sm.valorPerdido)}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ---------------- RENUTRIÇÃO ----------------
function AbaRenutricao({
  emRenutricao, sugeridos, onMover, onArquivar, onRemover,
}: {
  emRenutricao: CardAC[];
  sugeridos: CardAC[];
  onMover: (id: string, campanha: string, data: string) => void;
  onArquivar: (id: string) => void;
  onRemover: (id: string) => void;
}) {
  const [moverId, setMoverId] = useState<string | null>(null);
  const [campanha, setCampanha] = useState("");
  const [dataCamp, setDataCamp] = useState(new Date().toISOString().slice(0, 10));
  const { toast } = useToast();

  const confirmar = () => {
    if (!moverId || !campanha.trim() || !dataCamp) return;
    onMover(moverId, campanha.trim(), dataCamp);
    setMoverId(null); setCampanha(""); setDataCamp(new Date().toISOString().slice(0, 10));
    toast({ title: "Card movido para renutrição" });
  };

  return (
    <div className="space-y-4">
      {sugeridos.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-amber-700" />
            <h3 className="text-sm font-semibold text-amber-900">Sugeridos para renutrir hoje</h3>
            <span className="text-[11px] text-amber-700">{sugeridos.length} cards com data de retomada</span>
          </div>
          <div className="space-y-1.5">
            {sugeridos.map(c => (
              <CardPerdidoRow key={c.id} card={c}
                onMover={() => setMoverId(c.id)}
                onArquivar={() => onArquivar(c.id)}
                variant="sugerido"
              />
            ))}
          </div>
        </div>
      )}

      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="text-sm font-semibold text-foreground mb-2">Em renutrição ({emRenutricao.length})</h3>
        {emRenutricao.length === 0 ? (
          <p className="text-[12px] text-muted-foreground py-4 text-center">Nenhum card em renutrição no período</p>
        ) : (
          <div className="space-y-1.5">
            {emRenutricao.map(c => (
              <CardPerdidoRow key={c.id} card={c}
                onArquivar={() => onArquivar(c.id)}
                onRemover={() => onRemover(c.id)}
                variant="renutricao"
              />
            ))}
          </div>
        )}
      </div>

      {moverId && (
        <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4" onClick={() => setMoverId(null)}>
          <div className="bg-card rounded-xl border border-border w-full max-w-md p-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-semibold text-foreground mb-3">Mover para renutrição</h3>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-muted-foreground block mb-1">Nome da campanha *</label>
                <input value={campanha} onChange={e => setCampanha(e.target.value)} placeholder="Ex: Nurture Concorrência OI26"
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-[12px] focus:outline-none focus:ring-1 focus:ring-ring" />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground block mb-1">Data de início *</label>
                <input type="date" value={dataCamp} onChange={e => setDataCamp(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-[12px] focus:outline-none focus:ring-1 focus:ring-ring" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 mt-4">
              <button onClick={() => setMoverId(null)} className="text-[12px] px-3 py-1.5 rounded-lg hover:bg-muted">Cancelar</button>
              <button onClick={confirmar} disabled={!campanha.trim()}
                className="text-[12px] font-medium px-4 py-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40">Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------- ARQUIVADOS ----------------
function AbaArquivados({ arquivados, onDesarquivar }: { arquivados: CardAC[]; onDesarquivar: (id: string) => void }) {
  if (arquivados.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 text-center">
        <Archive className="h-8 w-8 mx-auto text-muted-foreground opacity-40 mb-2" />
        <p className="text-sm text-muted-foreground">Nenhum card arquivado</p>
      </div>
    );
  }
  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-1.5">
      {arquivados.map(c => (
        <CardPerdidoRow key={c.id} card={c} onDesarquivar={() => onDesarquivar(c.id)} variant="arquivado" />
      ))}
    </div>
  );
}

// ---------------- Linha de card perdido ----------------
function CardPerdidoRow({
  card, onMover, onArquivar, onRemover, onDesarquivar, variant,
}: {
  card: CardAC;
  onMover?: () => void;
  onArquivar?: () => void;
  onRemover?: () => void;
  onDesarquivar?: () => void;
  variant: "sugerido" | "renutricao" | "arquivado";
}) {
  const cor = origemACColors[card.origem as OrigemAC] || "#94A3B8";
  return (
    <div className="border border-border/70 rounded-lg p-2 flex items-start gap-2.5 bg-background/60">
      <span className="h-2 w-2 rounded-full mt-1.5 shrink-0" style={{ background: cor }} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-[12px] font-semibold text-foreground truncate">{card.nome}</p>
          <span className="text-[9px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">{origemLabels[card.origem]}</span>
          {card.campanha && <span className="text-[9px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded truncate max-w-[180px]">{card.campanha}</span>}
        </div>
        <p className="text-[10px] text-muted-foreground">{card.telefone} · vendedor: {card.vendedorNome}</p>
        {(card.perda?.motivo || card.motivoPerda) && (
          <p className="text-[11px] text-rose-700 mt-0.5">
            {card.perda?.motivo || card.motivoPerda}{card.perda?.subMotivo ? ` → ${card.perda.subMotivo}` : ""}
          </p>
        )}
        {card.perda?.explicacao && <p className="text-[10px] text-muted-foreground italic line-clamp-1">{card.perda.explicacao}</p>}
        {variant === "sugerido" && card.perda?.retomarEm && (
          <p className="text-[10px] text-amber-700 mt-0.5 flex items-center gap-1"><Calendar className="h-3 w-3" /> Retomar em {new Date(card.perda.retomarEm).toLocaleDateString("pt-BR")}</p>
        )}
        {variant === "renutricao" && card.campanhaRenutricao && (
          <p className="text-[10px] text-blue-700 mt-0.5">
            📣 {card.campanhaRenutricao.nome} · {new Date(card.campanhaRenutricao.data).toLocaleDateString("pt-BR")}
          </p>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {onMover && (
          <button onClick={onMover} title="Mover para renutrição" className="text-[10px] px-2 py-1 rounded bg-primary text-primary-foreground hover:opacity-90 inline-flex items-center gap-1">
            <ArrowRightLeft className="h-3 w-3" /> Renutrir
          </button>
        )}
        {onRemover && (
          <button onClick={onRemover} title="Remover da renutrição" className="text-[10px] px-2 py-1 rounded border border-border hover:bg-muted inline-flex items-center gap-1">
            <Undo2 className="h-3 w-3" /> Remover
          </button>
        )}
        {onArquivar && (
          <button onClick={onArquivar} title="Arquivar" className="text-[10px] px-2 py-1 rounded border border-border hover:bg-muted inline-flex items-center gap-1">
            <Archive className="h-3 w-3" />
          </button>
        )}
        {onDesarquivar && (
          <button onClick={onDesarquivar} title="Desarquivar" className="text-[10px] px-2 py-1 rounded border border-border hover:bg-muted inline-flex items-center gap-1">
            <Undo2 className="h-3 w-3" /> Desarquivar
          </button>
        )}
      </div>
    </div>
  );
}
