import { useMemo, useState } from "react";
import { useAtendimentoComercial } from "@/contexts/AtendimentoComercialContext";
import { CardAC, tagLabels, tagBadge, origemLabels, motivosPerda } from "@/data/mockAtendimentoComercial";
import { AlertTriangle, Check, ChevronDown, ChevronRight, Sparkles, Zap, ShieldAlert, Target, X, RotateCcw, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Props {
  conversaId: string;
  clienteId?: string;
  clienteNome?: string;
  telefone?: string;
  appendMessage: (texto: string) => void;
  onSimularRecebida?: () => void;
}

const ETAPAS: { key: string; label: string; cor: string }[] = [
  { key: "leads", label: "Leads", cor: "bg-slate-400" },
  { key: "fila", label: "Fila", cor: "bg-blue-500" },
  { key: "atendimento", label: "Atendimento", cor: "bg-indigo-500" },
  { key: "cadastro", label: "Cadastro", cor: "bg-violet-500" },
  { key: "qualificacao", label: "Qualificação", cor: "bg-fuchsia-500" },
  { key: "oportunidade", label: "Oportunidade", cor: "bg-emerald-500" },
];

export function PainelAtendimentoWpp({ conversaId, clienteId, clienteNome, telefone, appendMessage, onSimularRecebida }: Props) {
  const { cardDaConversa, colunas, config, atualizarCadastro, atualizarQualificacao, marcarPerda, gerarOportunidade, reabrirCard, criarLead, conflitos } = useAtendimentoComercial();
  const { toast } = useToast();
  const card = cardDaConversa(conversaId);
  const [openCad, setOpenCad] = useState(true);
  const [openQual, setOpenQual] = useState(true);
  const [openPerda, setOpenPerda] = useState(false);
  const [motivoSel, setMotivoSel] = useState<string>("");
  const [motivoTxt, setMotivoTxt] = useState("");
  const [valorOp, setValorOp] = useState(0);

  const col = card ? colunas.find(c => c.id === card.colunaId) : null;
  const etapaAtual = col?.key ?? "";
  const conflitoAtivo = card ? conflitos.find(cf => cf.cardId === card.id && cf.status === "pendente") : undefined;

  const qualPreenchidas = useMemo(() => {
    if (!card) return 0;
    return config.perguntasQualificacao.filter(p => !!(card.qualificacao as any)[p.key]).length;
  }, [card, config.perguntasQualificacao]);
  const qualTotal = config.perguntasQualificacao.length;
  const qualCompleta = qualPreenchidas >= qualTotal;

  // valor pré-sugerido pela faixa de volume
  const valorSugerido = useMemo(() => {
    if (!card) return 15000;
    const v = (card.qualificacao?.volume || "").toLowerCase();
    if (v.includes("50")) return 45000;
    if (v.includes("25") || v.includes("30")) return 25000;
    if (v.includes("15")) return 15000;
    return card.valorEstimado ?? 20000;
  }, [card]);

  if (!card) {
    return (
      <div className="p-3 border-b border-border bg-accent/5">
        <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Atendimento Comercial</p>
        <p className="text-[11px] text-muted-foreground mb-2">
          Nenhum card vinculado a esta conversa.
        </p>
        <button
          onClick={() => {
            const novo = criarLead({
              nome: clienteNome || "Novo contato",
              telefone: telefone || "",
              origem: clienteId ? "manual" : "whats_direto",
              tag: clienteId ? "carteira" : "lead",
              conversaId,
              clienteId,
            });
            toast({ title: "Card criado na Fila", description: `${novo.nome} · ${novo.vendedorNome}` });
          }}
          className="w-full text-[11px] font-medium inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg border border-primary/40 text-primary hover:bg-primary/5"
        >
          <Play className="h-3 w-3" /> Iniciar atendimento comercial
        </button>
        {onSimularRecebida && (
          <button onClick={onSimularRecebida} className="mt-1.5 w-full text-[10px] text-muted-foreground hover:text-foreground underline">
            (dev) simular mensagem recebida
          </button>
        )}
      </div>
    );
  }

  const enviarPedidoCampo = (campo: string, pergunta: string) => {
    const nome = card.cadastro.nome || card.nome;
    appendMessage(`Oi ${nome.split(" ")[0]}, ${pergunta}`);
    toast({ title: "Mensagem enviada", description: pergunta });
  };

  const isPerdido = card.status === "perdido";
  const etapaIdx = ETAPAS.findIndex(e => e.key === etapaAtual);

  return (
    <div className="border-b border-border bg-accent/5">
      {/* Header + Stepper */}
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Atendimento Comercial</p>
          <div className="flex items-center gap-1">
            <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border ${tagBadge[card.tag]}`}>{tagLabels[card.tag]}</span>
            <span className="text-[9px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">{origemLabels[card.origem]}</span>
          </div>
        </div>

        {conflitoAtivo && (
          <div className="rounded-md border border-amber-300 bg-amber-50 p-1.5 flex items-start gap-1.5">
            <ShieldAlert className="h-3 w-3 text-amber-700 mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-amber-800">Em conflito — aguardando gestor</p>
              <p className="text-[10px] text-amber-700 truncate">{conflitoAtivo.motivo}</p>
            </div>
          </div>
        )}

        {isPerdido ? (
          <div className="rounded-md border border-rose-300 bg-rose-50 p-2 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-rose-800">Perdido: {card.motivoPerda}</p>
              {card.motivoPerdaTexto && <p className="text-[10px] text-rose-700 truncate">{card.motivoPerdaTexto}</p>}
            </div>
            <button onClick={() => reabrirCard(card.id)} className="text-[10px] font-semibold px-2 py-1 rounded border border-rose-300 text-rose-700 hover:bg-white inline-flex items-center gap-1">
              <RotateCcw className="h-3 w-3" /> Reabrir
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-0.5 overflow-x-auto">
            {ETAPAS.map((e, i) => {
              const ativo = e.key === etapaAtual;
              const done = etapaIdx >= 0 && i < etapaIdx;
              return (
                <div key={e.key} className="flex items-center gap-0.5 shrink-0">
                  <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded ${ativo ? `${e.cor} text-white` : done ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"}`}>
                    {done && <Check className="h-2.5 w-2.5" />}
                    <span className="text-[9px] font-semibold">{e.label}</span>
                  </div>
                  {i < ETAPAS.length - 1 && <ChevronRight className="h-2.5 w-2.5 text-muted-foreground" />}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cadastro — não mostra para carteira */}
      {!isPerdido && card.tag !== "carteira" && (
        <div className="border-t border-border/60">
          <button onClick={() => setOpenCad(o => !o)} className="w-full flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase text-muted-foreground hover:bg-muted/40">
            {openCad ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            Cadastro
            <span className="ml-auto text-[9px] text-muted-foreground normal-case">
              {(["nome", "cnpj", "cidade", "email"] as const).filter(k => !!card.cadastro[k]).length} de 4 obrigatórios
            </span>
          </button>
          {openCad && (
            <div className="px-3 pb-2 space-y-1.5">
              <CampoRapido label="Nome / razão" value={card.cadastro.nome ?? ""} onChange={v => atualizarCadastro(card.id, { nome: v })}
                onZap={() => enviarPedidoCampo("nome", "para começar o cadastro, qual o nome/razão social da sua loja?")} />
              <CampoRapido label="CNPJ" value={card.cadastro.cnpj ?? ""} onChange={v => atualizarCadastro(card.id, { cnpj: v })}
                onZap={() => enviarPedidoCampo("cnpj", "pode me passar o CNPJ da loja pra eu abrir seu cadastro?")} />
              <div className="grid grid-cols-2 gap-1.5">
                <CampoRapido label="Cidade" value={card.cadastro.cidade ?? ""} onChange={v => atualizarCadastro(card.id, { cidade: v })}
                  onZap={() => enviarPedidoCampo("cidade", "de qual cidade você fala?")} />
                <CampoRapido label="UF" value={card.cadastro.uf ?? ""} onChange={v => atualizarCadastro(card.id, { uf: v })} />
              </div>
              <CampoRapido label="E-mail" value={card.cadastro.email ?? ""} onChange={v => atualizarCadastro(card.id, { email: v })}
                onZap={() => enviarPedidoCampo("email", "qual o melhor e-mail para envio de proposta e NF?")} />
              <CampoRapido label="Instagram" value={card.cadastro.instagram ?? ""} onChange={v => atualizarCadastro(card.id, { instagram: v })}
                onZap={() => enviarPedidoCampo("instagram", "qual o @ do Instagram da loja? adoro dar uma olhada no que vocês vêm postando.")} />
            </div>
          )}
        </div>
      )}

      {/* Qualificação */}
      {!isPerdido && (
        <div className="border-t border-border/60">
          <button onClick={() => setOpenQual(o => !o)} className="w-full flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase text-muted-foreground hover:bg-muted/40">
            {openQual ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            Qualificação
            <span className="ml-auto text-[9px] text-muted-foreground normal-case">{qualPreenchidas} de {qualTotal}</span>
          </button>
          {openQual && (
            <div className="px-3 pb-2 space-y-1.5">
              {config.perguntasQualificacao.map(p => (
                <CampoRapido
                  key={p.key}
                  label={p.label}
                  value={(card.qualificacao as any)[p.key] ?? ""}
                  onChange={v => atualizarQualificacao(card.id, { [p.key]: v } as any)}
                  onZap={() => enviarPedidoCampo(p.key, `pra te oferecer o melhor: ${p.label.toLowerCase()}?`)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Confirmação de oportunidade */}
      {!isPerdido && qualCompleta && etapaAtual === "qualificacao" && (
        <div className="p-3 border-t border-border/60 bg-emerald-50/60">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Sparkles className="h-3 w-3 text-emerald-700" />
            <p className="text-[10px] font-bold uppercase text-emerald-800">Qualificação completa — gerar oportunidade?</p>
          </div>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              value={valorOp || valorSugerido}
              onChange={e => setValorOp(Number(e.target.value))}
              placeholder="R$"
              className="flex-1 text-[11px] px-2 py-1 rounded border border-emerald-300 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <button
              onClick={() => gerarOportunidade(card.id, valorOp || valorSugerido)}
              className="text-[11px] font-medium px-2 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 inline-flex items-center gap-1"
            >
              <Target className="h-3 w-3" /> Confirmar
            </button>
          </div>
          <p className="text-[9px] text-emerald-700 mt-1">Sugestão baseada no volume declarado.</p>
        </div>
      )}

      {/* Oportunidade gerada */}
      {etapaAtual === "oportunidade" && card.valorEstimado && (
        <div className="p-3 border-t border-border/60 bg-emerald-50/60">
          <p className="text-[10px] font-bold uppercase text-emerald-800">Oportunidade gerada</p>
          <p className="text-[11px] text-emerald-900 mt-0.5">R$ {card.valorEstimado.toLocaleString("pt-BR")}</p>
        </div>
      )}

      {/* Marcar como perdido / dev */}
      {!isPerdido && (
        <div className="p-2 border-t border-border/60 flex items-center gap-2">
          {!openPerda ? (
            <>
              <button
                onClick={() => setOpenPerda(true)}
                className="text-[10px] px-2 py-1 rounded border border-rose-200 text-rose-700 hover:bg-rose-50 inline-flex items-center gap-1"
              >
                <AlertTriangle className="h-3 w-3" /> Marcar como perdido
              </button>
              {onSimularRecebida && (
                <button onClick={onSimularRecebida} className="ml-auto text-[9px] text-muted-foreground hover:text-foreground underline">
                  (dev) simular msg recebida
                </button>
              )}
            </>
          ) : (
            <div className="w-full space-y-1.5">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase text-rose-700">Motivo da perda</p>
                <button onClick={() => { setOpenPerda(false); setMotivoSel(""); setMotivoTxt(""); }} className="text-muted-foreground hover:text-foreground">
                  <X className="h-3 w-3" />
                </button>
              </div>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {(config.motivosPerda || motivosPerda).map(m => (
                  <button
                    key={m}
                    onClick={() => setMotivoSel(m)}
                    className={`w-full text-left text-[10px] px-2 py-1 rounded border ${motivoSel === m ? "border-rose-400 bg-rose-50 text-rose-800" : "border-border text-muted-foreground hover:border-rose-200"}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
              {motivoSel === "Outros" && (
                <textarea
                  value={motivoTxt} onChange={e => setMotivoTxt(e.target.value)} rows={2}
                  placeholder="Descreva (obrigatório)"
                  className="w-full text-[10px] p-1.5 rounded border border-border bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                />
              )}
              <button
                disabled={!motivoSel || (motivoSel === "Outros" && !motivoTxt.trim())}
                onClick={() => {
                  marcarPerda(card.id, motivoSel, motivoSel === "Outros" ? motivoTxt.trim() : undefined);
                  setOpenPerda(false); setMotivoSel(""); setMotivoTxt("");
                }}
                className="w-full text-[10px] font-medium px-2 py-1 rounded bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-40"
              >
                Confirmar perda
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CampoRapido({ label, value, onChange, onZap }: { label: string; value: string; onChange: (v: string) => void; onZap?: () => void }) {
  const vazio = !value;
  return (
    <div>
      <label className="text-[9px] text-muted-foreground block mb-0.5">{label}</label>
      <div className="flex items-center gap-1">
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          className="flex-1 text-[11px] px-2 py-1 rounded border border-border bg-background focus:outline-none focus:ring-1 focus:ring-ring"
        />
        {onZap && vazio && (
          <button onClick={onZap} title="Enviar mensagem pedindo esta info" className="h-6 w-6 shrink-0 flex items-center justify-center rounded border border-accent/40 text-accent hover:bg-accent/10">
            <Zap className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
}
