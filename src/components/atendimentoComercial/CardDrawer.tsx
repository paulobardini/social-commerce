import { useState } from "react";
import { X, MessageCircle, ChevronRight, ChevronLeft } from "lucide-react";
import { CardAC, tagLabels, tagBadge, origemLabels } from "@/data/mockAtendimentoComercial";
import { useAtendimentoComercial } from "@/contexts/AtendimentoComercialContext";
import { useNavigate } from "react-router-dom";
import { MotivoPerdaModal } from "./MotivoPerdaModal";

export function CardDrawer({ card, onClose }: { card: CardAC; onClose: () => void }) {
  const { colunas, moverCard, gerarOportunidade, reabrirCard, config, redistribuirCard, vendedores } = useAtendimentoComercial();
  const navigate = useNavigate();
  const [openPerda, setOpenPerda] = useState(false);
  const [valorOp, setValorOp] = useState<number>(card.valorEstimado ?? 20000);
  const [redistOpen, setRedistOpen] = useState(false);

  const col = colunas.find(c => c.id === card.colunaId);
  const idx = colunas.findIndex(c => c.id === card.colunaId);
  const anterior = colunas[idx - 1];
  const proxima = colunas[idx + 1];

  return (
    <>
      <div className="fixed inset-0 z-[100] bg-black/50" onClick={onClose} />
      <aside className="fixed right-0 top-0 h-full w-full sm:w-[420px] z-[110] bg-card border-l border-border shadow-2xl flex flex-col">
        <div className="shrink-0 px-4 py-3 border-b border-border flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{card.nome}</p>
            <p className="text-[11px] text-muted-foreground">{card.telefone}</p>
          </div>
          <button onClick={onClose} className="h-7 w-7 rounded-md hover:bg-muted flex items-center justify-center"><X className="h-4 w-4" /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {/* Etapa */}
          <div className="bg-muted/40 rounded-lg p-3">
            <p className="text-[10px] uppercase text-muted-foreground font-semibold mb-1">Etapa atual</p>
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${col?.cor}`} />
              <span className="text-[13px] font-semibold text-foreground">{col?.label}</span>
            </div>
            <div className="flex gap-2 mt-2">
              {anterior && (
                <button onClick={() => { const r = moverCard(card.id, anterior.id); if (!r.ok) alert(r.erro); }} className="flex-1 text-[11px] inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-md border border-border hover:bg-muted">
                  <ChevronLeft className="h-3 w-3" /> {anterior.label}
                </button>
              )}
              {proxima && proxima.key !== "perdido" && (
                <button onClick={() => { const r = moverCard(card.id, proxima.id); if (!r.ok) alert(r.erro); }} className="flex-1 text-[11px] inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-md bg-primary text-primary-foreground hover:opacity-90">
                  {proxima.label} <ChevronRight className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          {/* Info */}
          <Section title="Sobre">
            <div className="flex flex-wrap gap-1 mb-2">
              <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border ${tagBadge[card.tag]}`}>{tagLabels[card.tag]}</span>
              <span className="text-[9px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">{origemLabels[card.origem]}</span>
              {card.campanha && <span className="text-[9px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">{card.campanha}</span>}
            </div>
            <Row label="Vendedor" value={card.vendedorNome} />
            <Row label="Chegada" value={new Date(card.chegouEm).toLocaleString("pt-BR")} />
            <Row label="Última msg" value={card.ultimaMensagem || "—"} />
          </Section>

          {/* Cadastro editável */}
          {card.tag !== "carteira" && (
            <Section title="Cadastro (edite para avançar automaticamente)">
              <Edit label="Nome / razão social" value={card.cadastro.nome ?? ""} onChange={v => atualizarCadastro(card.id, { nome: v })} />
              <Edit label="CNPJ" value={card.cadastro.cnpj ?? ""} onChange={v => atualizarCadastro(card.id, { cnpj: v })} />
              <div className="grid grid-cols-2 gap-2">
                <Edit label="Cidade" value={card.cadastro.cidade ?? ""} onChange={v => atualizarCadastro(card.id, { cidade: v })} />
                <Edit label="UF" value={card.cadastro.uf ?? ""} onChange={v => atualizarCadastro(card.id, { uf: v })} />
              </div>
              <Edit label="E-mail" value={card.cadastro.email ?? ""} onChange={v => atualizarCadastro(card.id, { email: v })} />
              <Edit label="Instagram" value={card.cadastro.instagram ?? ""} onChange={v => atualizarCadastro(card.id, { instagram: v })} />
            </Section>
          )}

          {/* Qualificação editável */}
          <Section title="Qualificação">
            {config.perguntasQualificacao.map(p => (
              <Edit key={p.key} label={p.label}
                value={(card.qualificacao as any)[p.key] ?? ""}
                onChange={v => atualizarQualificacao(card.id, { [p.key]: v } as any)} />
            ))}
          </Section>

          {/* Gerar oportunidade */}
          {col?.key === "qualificacao" && (
            <Section title="Gerar oportunidade">
              <label className="text-[11px] text-muted-foreground block mb-1">Valor estimado</label>
              <div className="flex gap-2">
                <input type="number" value={valorOp} onChange={e => setValorOp(Number(e.target.value))}
                  className="flex-1 bg-card border border-border rounded-lg px-3 py-2 text-[12px] focus:outline-none focus:ring-1 focus:ring-ring" />
                <button onClick={() => gerarOportunidade(card.id, valorOp)} className="text-[12px] font-medium px-3 rounded-lg bg-emerald-600 text-white hover:opacity-90">Confirmar</button>
              </div>
            </Section>
          )}

          {/* Motivo de perda registrado */}
          {card.status === "perdido" && (
            <div className="bg-rose-500/5 border border-rose-500/20 rounded-lg p-3">
              <p className="text-[10px] uppercase text-rose-700 font-semibold mb-1">Motivo da perda</p>
              <p className="text-[12px] text-foreground">{card.motivoPerda}</p>
              {card.motivoPerdaTexto && <p className="text-[11px] text-muted-foreground mt-1">{card.motivoPerdaTexto}</p>}
              <button onClick={() => reabrirCard(card.id)} className="mt-2 text-[11px] px-2 py-1 rounded border border-border hover:bg-muted">Reabrir na Fila</button>
            </div>
          )}

          {/* Histórico */}
          <Section title="Histórico">
            <div className="space-y-1.5">
              {card.historico.slice().reverse().map((h, i) => (
                <div key={i} className="text-[11px]">
                  <span className="text-muted-foreground">{new Date(h.at).toLocaleString("pt-BR")}</span>
                  <p className="text-foreground">{h.msg}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* Redistribuir */}
          <div>
            <button onClick={() => setRedistOpen(o => !o)} className="text-[11px] text-primary hover:underline">Redistribuir para outro vendedor</button>
            {redistOpen && (
              <div className="mt-2 space-y-1">
                {vendedores.filter(v => v.id !== card.vendedorId).map(v => (
                  <button key={v.id} onClick={() => { redistribuirCard(card.id, v.id); setRedistOpen(false); }}
                    className="w-full text-left text-[12px] px-2 py-1.5 rounded border border-border hover:border-primary/40">
                    {v.nome}{v.pausado ? " (pausado)" : ""}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="shrink-0 px-4 py-3 border-t border-border flex items-center gap-2">
          {card.conversaId ? (
            <button onClick={() => navigate("/vendedor/whatsapp")} className="flex-1 text-[12px] font-medium inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-emerald-600 text-white hover:opacity-90">
              <MessageCircle className="h-4 w-4" /> Abrir no WhatsApp
            </button>
          ) : (
            <button onClick={() => navigate("/vendedor/whatsapp")} className="flex-1 text-[12px] font-medium inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg border border-border hover:bg-muted">
              <MessageCircle className="h-4 w-4" /> Ir ao WhatsApp
            </button>
          )}
          {card.status !== "perdido" && (
            <button onClick={() => setOpenPerda(true)} className="text-[12px] px-3 py-2 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50">Marcar perda</button>
          )}
        </div>
      </aside>

      <MotivoPerdaModal open={openPerda} motivos={config.motivosPerda} onClose={() => setOpenPerda(false)} onConfirm={(m, t) => {
        setOpenPerda(false);
        const colPerd = colunas.find(c => c.key === "perdido");
        if (colPerd) moverCard(card.id, colPerd.id, { motivo: m, motivoTexto: t });
      }} />
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] uppercase text-muted-foreground font-semibold mb-1.5">{title}</p>
      <div className="bg-card border border-border rounded-lg p-3 space-y-1">{children}</div>
    </div>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex items-start justify-between gap-2 text-[12px]"><span className="text-muted-foreground shrink-0">{label}</span><span className="text-foreground text-right">{value}</span></div>;
}
