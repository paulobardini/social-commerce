import { useMemo, useState, useEffect } from "react";
import { useAtendimentoComercial } from "@/contexts/AtendimentoComercialContext";
import { tagLabels, tagBadge, origemLabels, motivosPerda, horasDesde } from "@/data/mockAtendimentoComercial";
import {
  AlertTriangle, Check, ChevronRight, Sparkles, Zap, ShieldAlert,
  Target, X, RotateCcw, Play, MessageCircle, Pencil, Store, Clock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";

interface Props {
  conversaId: string;
  clienteId?: string;
  clienteNome?: string;
  telefone?: string;
  appendMessage: (texto: string) => void;
  onSimularRecebida?: () => void;
}

type StepKey = "fila" | "atendimento" | "cadastro" | "qualificacao" | "oportunidade";

const STEPS: { key: StepKey; label: string; short: string; cor: string }[] = [
  { key: "fila", label: "Fila", short: "Fila", cor: "bg-blue-500" },
  { key: "atendimento", label: "Em Atendimento", short: "Atend.", cor: "bg-indigo-500" },
  { key: "cadastro", label: "Em Cadastro", short: "Cadastro", cor: "bg-violet-500" },
  { key: "qualificacao", label: "Em Qualificação", short: "Qualif.", cor: "bg-fuchsia-500" },
  { key: "oportunidade", label: "Oportunidade", short: "Oport.", cor: "bg-emerald-500" },
];

const NICHOS = ["Infantil", "Adulto", "Fitness", "Moda Praia", "Casual", "Multimarcas"];
const MARCAS_PORT = ["Brandili", "Milon", "Malwee", "Colcci", "Forum", "Cantão", "Farm", "Osklen"];
const VOLUME_FAIXAS = ["Até R$ 5k", "R$ 5k–15k", "R$ 15k–50k", "R$ 50k+"];
const FREQ_OPCOES = ["Agora", "Próxima coleção", "Pesquisando"];
const SAZ_OPCOES = ["Verão", "Inverno", "Ambos"];

// Templates naturais dos ⚡
const TEMPLATES_CAD: Record<string, string> = {
  nome: "Pra abrir seu cadastro aqui, me passa o nome/razão social da loja?",
  cnpj: "Pra montar seu cadastro aqui na Nextil, me passa o CNPJ da loja?",
  cidade: "Você atende de qual cidade/estado?",
  email: "Qual o melhor e-mail pra envio de proposta e NF?",
  instagram: "Qual o @ do Instagram da loja? Adoro dar uma olhada no que vocês vêm postando.",
};
const TEMPLATES_QUAL: Record<string, string> = {
  nicho: "Me conta um pouco da sua loja — vocês trabalham mais com qual público? Infantil, adulto, fitness...?",
  marcas: "Quais marcas você tem interesse em trabalhar? Te mando o catálogo certo.",
  volume: "Pra eu te passar as melhores condições: quanto costuma girar de compra por coleção?",
  frequencia: "Você já tá comprando pra próxima coleção ou ainda pesquisando?",
  cidadePrincipal: "Sua loja física atende principalmente qual cidade?",
  sazonalidade: "Vocês giram mais verão, inverno ou trabalham as duas coleções cheias?",
};

const CADASTRO_ORDEM: { key: keyof Cadastro; label: string; required?: boolean }[] = [
  { key: "nome", label: "Nome / razão", required: true },
  { key: "cnpj", label: "CNPJ", required: true },
  { key: "cidade", label: "Cidade", required: true },
  { key: "email", label: "E-mail", required: true },
  { key: "instagram", label: "Instagram" },
];
type Cadastro = { nome?: string; cnpj?: string; cidade?: string; uf?: string; email?: string; instagram?: string };

// Chave de storage local para "perguntado" (por card+campo)
const PERG_LS = "ac_wpp_perguntado_v1";
const loadPerguntado = (): Record<string, string> => {
  try { return JSON.parse(localStorage.getItem(PERG_LS) || "{}"); } catch { return {}; }
};
const savePerguntado = (data: Record<string, string>) => {
  try { localStorage.setItem(PERG_LS, JSON.stringify(data)); } catch {}
};

const isDevMode = () => {
  try { return new URLSearchParams(window.location.search).get("dev") === "1"; } catch { return false; }
};

export function PainelAtendimentoWpp({ conversaId, clienteId, clienteNome, telefone, appendMessage, onSimularRecebida }: Props) {
  const {
    cardDaConversa, colunas, config, atualizarCadastro, atualizarQualificacao,
    marcarPerda, gerarOportunidade, reabrirCard, criarLead, conflitos, moverCard,
  } = useAtendimentoComercial();
  const { toast } = useToast();
  const card = cardDaConversa(conversaId);

  const [openPerda, setOpenPerda] = useState(false);
  const [motivoSel, setMotivoSel] = useState<string>("");
  const [motivoTxt, setMotivoTxt] = useState("");
  const [valorOp, setValorOp] = useState(0);
  const [editing, setEditing] = useState<string | null>(null);
  const [showAllCad, setShowAllCad] = useState(false);
  const [perguntado, setPerguntado] = useState<Record<string, string>>(loadPerguntado);
  const dev = isDevMode();

  useEffect(() => { savePerguntado(perguntado); }, [perguntado]);

  const col = card ? colunas.find(c => c.id === card.colunaId) : null;
  const etapaAtual = (col?.key ?? "") as StepKey | "leads" | "perdido" | "";
  const conflitoAtivo = card ? conflitos.find(cf => cf.cardId === card.id && cf.status === "pendente") : undefined;
  const stepIdx = STEPS.findIndex(s => s.key === etapaAtual);

  const cadPreenchidos = useMemo(() => {
    if (!card) return 0;
    return CADASTRO_ORDEM.filter(c => c.required && (card.cadastro as any)[c.key]).length;
  }, [card]);
  const cadTotal = CADASTRO_ORDEM.filter(c => c.required).length;

  const qualPreenchidas = useMemo(() => {
    if (!card) return 0;
    return config.perguntasQualificacao.filter(p => {
      const v = (card.qualificacao as any)[p.key];
      return Array.isArray(v) ? v.length > 0 : !!v;
    }).length;
  }, [card, config.perguntasQualificacao]);
  const qualTotal = config.perguntasQualificacao.length;
  const qualCompleta = qualPreenchidas >= qualTotal;

  const proxCadastro = useMemo(() => {
    if (!card) return null;
    return CADASTRO_ORDEM.find(c => c.required && !(card.cadastro as any)[c.key]) ?? null;
  }, [card]);
  const proxQual = useMemo(() => {
    if (!card) return null;
    return config.perguntasQualificacao.find(p => {
      const v = (card.qualificacao as any)[p.key];
      return Array.isArray(v) ? v.length === 0 : !v;
    }) ?? null;
  }, [card, config.perguntasQualificacao]);

  const valorSugerido = useMemo(() => {
    if (!card) return 15000;
    const v = (card.qualificacao?.volume || "").toLowerCase();
    if (v.includes("50")) return 60000;
    if (v.includes("15")) return 25000;
    if (v.includes("5")) return 10000;
    return card.valorEstimado ?? 15000;
  }, [card]);

  const focusComposer = () => {
    const el = document.getElementById("wpp-composer-input") as HTMLInputElement | null;
    el?.focus();
    el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  const enviarTemplate = (campoKey: string, texto: string) => {
    const nome = card?.cadastro?.nome || card?.nome || clienteNome || "";
    const primeiro = nome.split(" ")[0];
    const msg = primeiro ? `Oi ${primeiro}, ${texto.charAt(0).toLowerCase()}${texto.slice(1)}` : texto;
    appendMessage(msg);
    if (card) {
      setPerguntado(p => ({ ...p, [`${card.id}:${campoKey}`]: new Date().toISOString() }));
    }
    toast({ title: "Mensagem enviada" });
  };

  // ---------- Empty state (sem card) ----------
  if (!card) {
    return (
      <div className="p-3 border-b border-border bg-accent/5">
        <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Atendimento</p>
        <p className="text-[11px] text-muted-foreground mb-2">Nenhum card vinculado a esta conversa.</p>
        <button
          onClick={() => {
            const novo = criarLead({
              nome: clienteNome || "Novo contato",
              telefone: telefone || "",
              origem: clienteId ? "manual" : "whats_direto",
              tag: clienteId ? "carteira" : "lead",
              conversaId, clienteId,
            });
            toast({ title: "Card criado na Fila", description: `${novo.nome} · ${novo.vendedorNome}` });
          }}
          className="w-full text-[11px] font-medium inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg border border-primary/40 text-primary hover:bg-primary/5"
        >
          <Play className="h-3 w-3" /> Iniciar atendimento comercial
        </button>
        {dev && onSimularRecebida && (
          <button onClick={onSimularRecebida} className="mt-1.5 w-full text-[10px] text-muted-foreground hover:text-foreground underline">
            (dev) simular mensagem recebida
          </button>
        )}
      </div>
    );
  }

  const isPerdido = card.status === "perdido";
  const isCarteira = card.tag === "carteira" || card.tag === "reativacao";
  const stepCorAtual = STEPS[stepIdx]?.cor ?? "bg-muted";
  const stepLabelAtual = STEPS[stepIdx]?.label ?? (etapaAtual === "leads" ? "Leads" : etapaAtual === "perdido" ? "Perdido" : "—");

  const irParaColuna = (key: StepKey) => {
    const dest = colunas.find(c => c.key === key);
    if (!dest) return;
    const r = moverCard(card.id, dest.id);
    if (!r.ok) toast({ title: "Não foi possível avançar", description: r.erro, variant: "destructive" });
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="border-b border-border bg-accent/5">
        {/* HEADER compacto */}
        <div className="p-3 space-y-2">
          <div className="flex items-center gap-2 min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Atendimento</p>
            <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded text-white ${stepCorAtual}`}>{stepLabelAtual}</span>
            <div className="ml-auto flex items-center gap-1 shrink-0">
              <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border ${tagBadge[card.tag]}`}>{tagLabels[card.tag]}</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-[9px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded cursor-help">{origemLabels[card.origem]}</span>
                </TooltipTrigger>
                <TooltipContent side="left" className="text-[10px]">Origem do lead</TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Stepper de 5 dots — linha única, sem texto */}
          {!isPerdido && (
            <div className="flex items-center gap-1">
              {STEPS.map((s, i) => {
                const done = stepIdx > i;
                const active = stepIdx === i;
                const skipped = card.tag === "carteira" && s.key === "cadastro";
                return (
                  <div key={s.key} className="flex items-center gap-1 flex-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={`h-2 w-2 rounded-full shrink-0 ${
                            active ? `${s.cor} ring-2 ring-offset-1 ring-offset-background ring-current` :
                            done ? "bg-emerald-500" :
                            skipped ? "bg-transparent border border-dashed border-muted-foreground/50" :
                            "bg-muted"
                          }`}
                          style={active ? { color: "rgba(0,0,0,0.15)" } : undefined}
                        />
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="text-[10px]">
                        {s.label}{skipped ? " (pulado)" : ""}
                      </TooltipContent>
                    </Tooltip>
                    {i < STEPS.length - 1 && (
                      <div className={`h-px flex-1 ${done ? "bg-emerald-400" : "bg-muted"}`} />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {conflitoAtivo && (
            <div className="rounded-md border border-amber-300 bg-amber-50 p-1.5 flex items-start gap-1.5">
              <ShieldAlert className="h-3 w-3 text-amber-700 mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-amber-800">Em conflito — aguardando gestor</p>
                <p className="text-[10px] text-amber-700 truncate">{conflitoAtivo.motivo}</p>
              </div>
            </div>
          )}

          {isPerdido && (
            <div className="rounded-md border border-rose-300 bg-rose-50 p-2 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-rose-800">Perdido: {card.motivoPerda}</p>
                {card.motivoPerdaTexto && <p className="text-[10px] text-rose-700 truncate">{card.motivoPerdaTexto}</p>}
              </div>
              <button onClick={() => reabrirCard(card.id)} className="text-[10px] font-semibold px-2 py-1 rounded border border-rose-300 text-rose-700 hover:bg-white inline-flex items-center gap-1">
                <RotateCcw className="h-3 w-3" /> Reabrir
              </button>
            </div>
          )}
        </div>

        {/* CORPO — só a etapa atual */}
        {!isPerdido && !conflitoAtivo && (
          <div className="border-t border-border/60 px-3 py-2.5">
            {/* FILA — lead novo: SLA + responder */}
            {etapaAtual === "fila" && !isCarteira && (
              <FilaBloco card={card} onResponder={focusComposer} slaHoras={config.slaHoras} />
            )}

            {/* FILA — carteira/reativação: é cliente conhecido, não é prospect */}
            {etapaAtual === "fila" && isCarteira && (
              <ClienteResumo
                nome={card.cadastro.nome || card.nome}
                cnpj={card.cadastro.cnpj}
                tag={card.tag}
                onQualificar={focusComposer}
                ctaLabel="Responder agora"
                ctaIcon="chat"
                nota="Cliente conhecido — responder a mensagem já move para Em Atendimento."
              />
            )}

            {/* ATENDIMENTO — carteira/reativação: resumo cliente + CTA qualificação */}
            {etapaAtual === "atendimento" && isCarteira && (
              <ClienteResumo
                nome={card.cadastro.nome || card.nome}
                cnpj={card.cadastro.cnpj}
                tag={card.tag}
                onQualificar={() => irParaColuna("qualificacao")}
              />
            )}

            {/* ATENDIMENTO (lead) OU CADASTRO — bloco cadastro */}
            {((etapaAtual === "atendimento" && !isCarteira) || etapaAtual === "cadastro") && (
              <CadastroBloco
                card={card}
                proxCampo={proxCadastro}
                showAll={showAllCad || etapaAtual === "cadastro"}
                setShowAll={setShowAllCad}
                editing={editing}
                setEditing={setEditing}
                onChange={(k, v) => atualizarCadastro(card.id, { [k]: v } as any)}
                onZap={(k) => enviarTemplate(k, TEMPLATES_CAD[k])}
                perguntado={perguntado}
                totalReq={cadTotal}
                preenchidosReq={cadPreenchidos}
                showProgress={etapaAtual === "cadastro"}
              />
            )}

            {/* QUALIFICAÇÃO — uma pergunta em destaque + respondidas */}
            {etapaAtual === "qualificacao" && !qualCompleta && (
              <QualificacaoBloco
                card={card}
                perguntas={config.perguntasQualificacao}
                prox={proxQual}
                editing={editing}
                setEditing={setEditing}
                onChange={(k, v) => atualizarQualificacao(card.id, { [k]: v } as any)}
                onZap={(k) => enviarTemplate(k, TEMPLATES_QUAL[k] ?? `${k}?`)}
                perguntado={perguntado}
                preenchidas={qualPreenchidas}
                total={qualTotal}
              />
            )}

            {/* Qualificação completa → confirmar oportunidade */}
            {qualCompleta && etapaAtual === "qualificacao" && (
              <div className="rounded-md border border-emerald-300 bg-emerald-50/60 p-2">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Sparkles className="h-3 w-3 text-emerald-700" />
                  <p className="text-[10px] font-bold uppercase text-emerald-800">Gerar oportunidade?</p>
                </div>
                <p className="text-[10px] text-emerald-700 mb-1.5">Valor sugerido pelo volume declarado.</p>
                <div className="flex items-center gap-1.5">
                  <div className="flex-1 relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-emerald-700">R$</span>
                    <input
                      type="number"
                      value={valorOp || valorSugerido}
                      onChange={e => setValorOp(Number(e.target.value))}
                      className="w-full text-[11px] pl-7 pr-2 py-1 rounded border border-emerald-300 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <button
                    onClick={() => gerarOportunidade(card.id, valorOp || valorSugerido)}
                    className="text-[11px] font-medium px-2 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 inline-flex items-center gap-1"
                  >
                    <Target className="h-3 w-3" /> Confirmar
                  </button>
                </div>
              </div>
            )}

            {/* OPORTUNIDADE */}
            {etapaAtual === "oportunidade" && (
              <div className="rounded-md border border-emerald-300 bg-emerald-50/60 p-2">
                <p className="text-[10px] font-bold uppercase text-emerald-800">Oportunidade gerada</p>
                <p className="text-[13px] font-semibold text-emerald-900 mt-0.5">
                  R$ {(card.valorEstimado || 0).toLocaleString("pt-BR")}
                </p>
                <button className="mt-1.5 text-[10px] text-emerald-800 underline hover:text-emerald-900 inline-flex items-center gap-1">
                  Ver oportunidade <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            )}

            {/* LEADS */}
            {etapaAtual === "leads" && (
              <p className="text-[10px] text-muted-foreground italic">Lead ainda não distribuído.</p>
            )}
          </div>
        )}

        {/* RODAPÉ — perda + dev */}
        {!isPerdido && (
          <div className="px-3 pb-2.5 pt-1 flex items-center gap-2">
            {!openPerda ? (
              <>
                <button
                  onClick={() => setOpenPerda(true)}
                  className="text-[10px] px-2 py-1 rounded text-muted-foreground hover:text-rose-700 hover:bg-rose-50 inline-flex items-center gap-1"
                >
                  <AlertTriangle className="h-3 w-3" /> Marcar como perdido
                </button>
                {dev && onSimularRecebida && (
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
    </TooltipProvider>
  );
}

// ---------- Sub-blocos ----------

function FilaBloco({ card, onResponder, slaHoras }: { card: any; onResponder: () => void; slaHoras: number }) {
  const horas = Math.max(0, Math.round(horasDesde(card.chegouEm)));
  const estourado = horas >= slaHoras;
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Clock className={`h-3.5 w-3.5 ${estourado ? "text-rose-600" : "text-blue-600"}`} />
        <p className="text-[11px] text-foreground">
          Aguardando primeira resposta há <span className="font-semibold">{horas}h</span>
        </p>
        <span className={`ml-auto text-[9px] font-semibold px-1.5 py-0.5 rounded ${estourado ? "bg-rose-100 text-rose-700" : "bg-blue-100 text-blue-700"}`}>
          SLA {slaHoras}h
        </span>
      </div>
      <p className="text-[10px] text-muted-foreground">
        Responder a mensagem move o card para <span className="font-medium">Em Atendimento</span> automaticamente.
      </p>
      <button
        onClick={onResponder}
        className="w-full text-[11px] font-medium inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90"
      >
        <MessageCircle className="h-3 w-3" /> Responder agora
      </button>
    </div>
  );
}

function ClienteResumo({ nome, cnpj, tag, onQualificar }: { nome: string; cnpj?: string; tag: string; onQualificar: () => void }) {
  return (
    <div className="space-y-2">
      <div className="flex items-start gap-2">
        <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
          <Store className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-foreground truncate">{nome}</p>
          {cnpj && <p className="text-[10px] text-muted-foreground truncate">{cnpj}</p>}
          <p className="text-[9px] text-emerald-700 mt-0.5">Cliente {tag === "reativacao" ? "para reativar" : "da carteira"} — cadastro dispensado</p>
        </div>
      </div>
      <button
        onClick={onQualificar}
        className="w-full text-[11px] font-medium inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90"
      >
        <Sparkles className="h-3 w-3" /> Iniciar qualificação
      </button>
    </div>
  );
}

function CadastroBloco({
  card, proxCampo, showAll, setShowAll, editing, setEditing, onChange, onZap, perguntado, totalReq, preenchidosReq, showProgress,
}: any) {
  const outros = CADASTRO_ORDEM.filter(c => c.key !== proxCampo?.key);
  return (
    <div className="space-y-2">
      {showProgress && (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-violet-500 transition-all" style={{ width: `${(preenchidosReq / totalReq) * 100}%` }} />
          </div>
          <span className="text-[9px] font-medium text-muted-foreground">{preenchidosReq} de {totalReq}</span>
        </div>
      )}
      {proxCampo && (
        <CampoDestaque
          label={proxCampo.label}
          value={(card.cadastro as any)[proxCampo.key] ?? ""}
          onChange={(v) => onChange(proxCampo.key, v)}
          onZap={() => onZap(proxCampo.key)}
          template={TEMPLATES_CAD[proxCampo.key]}
          perguntadoAt={perguntado[`${card.id}:${proxCampo.key}`]}
          hint="próximo dado"
        />
      )}
      <div className="space-y-1">
        {outros.map(c => {
          const v = (card.cadastro as any)[c.key] ?? "";
          const isEditing = editing === `cad:${c.key}`;
          if (!showAll && !v && proxCampo?.key !== c.key) return null;
          if (!v && proxCampo?.key === c.key) return null;
          return (
            <LinhaCompacta
              key={c.key} label={c.label} value={v} editing={isEditing}
              onEdit={() => setEditing(`cad:${c.key}`)}
              onSave={(val) => { onChange(c.key, val); setEditing(null); }}
              onCancel={() => setEditing(null)}
              onZap={!v ? () => onZap(c.key) : undefined}
              template={TEMPLATES_CAD[c.key]}
              perguntadoAt={perguntado[`${card.id}:${c.key}`]}
            />
          );
        })}
      </div>
      {!showAll && (
        <button onClick={() => setShowAll(true)} className="text-[10px] text-muted-foreground hover:text-foreground underline">
          Ver todos os campos
        </button>
      )}
    </div>
  );
}

function QualificacaoBloco({ card, perguntas, prox, editing, setEditing, onChange, onZap, perguntado, preenchidas, total }: any) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-fuchsia-500 transition-all" style={{ width: `${(preenchidas / total) * 100}%` }} />
        </div>
        <span className="text-[9px] font-medium text-muted-foreground">{preenchidas} de {total}</span>
      </div>
      {prox && (
        <div className="rounded-md border border-fuchsia-200 bg-fuchsia-50/50 p-2 space-y-1.5">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold text-fuchsia-800">{prox.label}</p>
            <BotaoZap onClick={() => onZap(prox.key)} template={TEMPLATES_QUAL[prox.key]} perguntadoAt={perguntado[`${card.id}:${prox.key}`]} />
          </div>
          <QualInput
            campo={prox.key}
            value={(card.qualificacao as any)[prox.key]}
            onChange={(v) => onChange(prox.key, v)}
          />
        </div>
      )}
      <div className="space-y-1">
        {perguntas.map((p: any) => {
          if (p.key === prox?.key) return null;
          const v = (card.qualificacao as any)[p.key];
          const preenchido = Array.isArray(v) ? v.length > 0 : !!v;
          if (!preenchido) return null;
          const display = Array.isArray(v) ? v.join(", ") : v;
          const isEditing = editing === `qual:${p.key}`;
          return (
            <div key={p.key} className="flex items-start gap-1.5 py-0.5">
              <div className="flex-1 min-w-0">
                <p className="text-[9px] text-muted-foreground">{p.label}</p>
                {isEditing ? (
                  <div className="mt-1">
                    <QualInput campo={p.key} value={v} onChange={(nv) => { onChange(p.key, nv); }} />
                    <button onClick={() => setEditing(null)} className="text-[9px] text-muted-foreground hover:text-foreground mt-1">Fechar</button>
                  </div>
                ) : (
                  <p className="text-[11px] text-foreground truncate">{display}</p>
                )}
              </div>
              {!isEditing && (
                <button onClick={() => setEditing(`qual:${p.key}`)} className="text-muted-foreground hover:text-foreground mt-1">
                  <Pencil className="h-3 w-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function QualInput({ campo, value, onChange }: { campo: string; value: any; onChange: (v: any) => void }) {
  if (campo === "nicho") {
    return (
      <select value={value ?? ""} onChange={e => onChange(e.target.value)}
        className="w-full text-[11px] px-2 py-1 rounded border border-border bg-background focus:outline-none focus:ring-1 focus:ring-ring">
        <option value="">Selecione…</option>
        {NICHOS.map(n => <option key={n} value={n}>{n}</option>)}
      </select>
    );
  }
  if (campo === "volume") {
    return (
      <select value={value ?? ""} onChange={e => onChange(e.target.value)}
        className="w-full text-[11px] px-2 py-1 rounded border border-border bg-background focus:outline-none focus:ring-1 focus:ring-ring">
        <option value="">Selecione…</option>
        {VOLUME_FAIXAS.map(v => <option key={v} value={v}>{v}</option>)}
      </select>
    );
  }
  if (campo === "frequencia") {
    return (
      <select value={value ?? ""} onChange={e => onChange(e.target.value)}
        className="w-full text-[11px] px-2 py-1 rounded border border-border bg-background focus:outline-none focus:ring-1 focus:ring-ring">
        <option value="">Selecione…</option>
        {FREQ_OPCOES.map(v => <option key={v} value={v}>{v}</option>)}
      </select>
    );
  }
  if (campo === "sazonalidade") {
    return (
      <select value={value ?? ""} onChange={e => onChange(e.target.value)}
        className="w-full text-[11px] px-2 py-1 rounded border border-border bg-background focus:outline-none focus:ring-1 focus:ring-ring">
        <option value="">Selecione…</option>
        {SAZ_OPCOES.map(v => <option key={v} value={v}>{v}</option>)}
      </select>
    );
  }
  if (campo === "marcas") {
    const arr: string[] = Array.isArray(value) ? value : [];
    const toggle = (m: string) => onChange(arr.includes(m) ? arr.filter(x => x !== m) : [...arr, m]);
    return (
      <div className="flex flex-wrap gap-1">
        {MARCAS_PORT.map(m => {
          const on = arr.includes(m);
          return (
            <button key={m} onClick={() => toggle(m)}
              className={`text-[10px] px-1.5 py-0.5 rounded-full border ${on ? "bg-fuchsia-600 text-white border-fuchsia-600" : "bg-background text-muted-foreground border-border hover:border-foreground/40"}`}>
              {m}
            </button>
          );
        })}
      </div>
    );
  }
  return (
    <input value={value ?? ""} onChange={e => onChange(e.target.value)}
      className="w-full text-[11px] px-2 py-1 rounded border border-border bg-background focus:outline-none focus:ring-1 focus:ring-ring" />
  );
}

function CampoDestaque({ label, value, onChange, onZap, template, perguntadoAt, hint }: any) {
  return (
    <div className="rounded-md border border-violet-200 bg-violet-50/50 p-2 space-y-1">
      <div className="flex items-center justify-between">
        <div>
          {hint && <p className="text-[8px] font-bold uppercase text-violet-700 tracking-wider">{hint}</p>}
          <p className="text-[11px] font-semibold text-foreground">{label}</p>
        </div>
        <BotaoZap onClick={onZap} template={template} perguntadoAt={perguntadoAt} />
      </div>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Digite ou aguarde a resposta"
        className="w-full text-[11px] px-2 py-1 rounded border border-border bg-background focus:outline-none focus:ring-1 focus:ring-ring"
      />
    </div>
  );
}

function LinhaCompacta({ label, value, editing, onEdit, onSave, onCancel, onZap, template, perguntadoAt }: any) {
  const [tmp, setTmp] = useState(value ?? "");
  useEffect(() => { setTmp(value ?? ""); }, [value, editing]);
  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <input value={tmp} onChange={e => setTmp(e.target.value)}
          className="flex-1 text-[11px] px-2 py-1 rounded border border-border bg-background focus:outline-none focus:ring-1 focus:ring-ring" />
        <button onClick={() => onSave(tmp)} className="text-[10px] px-1.5 py-1 rounded bg-primary text-primary-foreground">OK</button>
        <button onClick={onCancel} className="text-muted-foreground hover:text-foreground"><X className="h-3 w-3" /></button>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 group py-0.5">
      <p className="text-[10px] text-muted-foreground shrink-0 w-20">{label}</p>
      <p className="text-[11px] text-foreground flex-1 truncate">{value || <span className="italic text-muted-foreground">—</span>}</p>
      {onZap && <BotaoZap onClick={onZap} template={template} perguntadoAt={perguntadoAt} />}
      <button onClick={onEdit} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-opacity">
        <Pencil className="h-3 w-3" />
      </button>
    </div>
  );
}

function BotaoZap({ onClick, template, perguntadoAt }: { onClick: () => void; template?: string; perguntadoAt?: string }) {
  const perguntado = !!perguntadoAt;
  const horas = perguntadoAt ? Math.max(0, Math.round(horasDesde(perguntadoAt))) : 0;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          className={`h-6 w-6 shrink-0 flex items-center justify-center rounded border transition-colors ${
            perguntado
              ? "border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
              : "border-accent/40 text-accent hover:bg-accent/10"
          }`}
        >
          {perguntado ? <Check className="h-3 w-3" /> : <Zap className="h-3 w-3" />}
        </button>
      </TooltipTrigger>
      <TooltipContent side="left" className="max-w-[240px] text-[10px]">
        {perguntado ? (
          <div>
            <p className="font-semibold mb-0.5">Perguntado há {horas}h</p>
            <p className="text-muted-foreground italic">"{template}"</p>
            <p className="mt-1">Clique para reenviar.</p>
          </div>
        ) : (
          <div>
            <p className="font-semibold mb-0.5">Enviar mensagem</p>
            <p className="italic">"{template}"</p>
          </div>
        )}
      </TooltipContent>
    </Tooltip>
  );
}
