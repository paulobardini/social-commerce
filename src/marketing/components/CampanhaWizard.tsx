import { useMemo, useState } from "react";
import { useMarketing } from "../contexts/MarketingDataContext";
import { Campanha, CanalCampanha, ObjetivoCampanha, mockTemplatesWpp, mockTemplatesEmail, objetivoLabels, VarianteAB } from "../data/mockCampanhas";
import { X, MessageSquare, Mail, Check, ChevronRight, ChevronLeft, FlaskConical, Users, Send, CalendarClock, Sparkles } from "lucide-react";
import { formatNum, formatBRL } from "../styles/tokens";

interface Props { onClose: () => void; onCreated: (id: string) => void; }

const OBJETIVOS: { id: ObjetivoCampanha; descricao: string; icon: string }[] = [
  { id: "lancamento", descricao: "Apresentar nova coleção ou produto", icon: "✨" },
  { id: "reativacao", descricao: "Recuperar clientes inativos", icon: "💌" },
  { id: "promocao", descricao: "Divulgar oferta ou desconto", icon: "🔥" },
  { id: "lookbook", descricao: "Compartilhar lookbook digital", icon: "📖" },
  { id: "carrinho_abandonado", descricao: "Recuperar grades não fechadas", icon: "🛒" },
  { id: "boas_vindas", descricao: "Onboarding de novos lojistas", icon: "👋" },
  { id: "pos_venda", descricao: "NPS, fidelização e relacionamento", icon: "💬" },
];

export function CampanhaWizard({ onClose, onCreated }: Props) {
  const { criarCampanha, segmentos, integracoes } = useMarketing();
  const [step, setStep] = useState(1);

  // form state
  const [nome, setNome] = useState("");
  const [canal, setCanal] = useState<CanalCampanha>("whatsapp");
  const [objetivo, setObjetivo] = useState<ObjetivoCampanha>("lancamento");
  const [segmentoId, setSegmentoId] = useState(segmentos[0].id);
  const [abTeste, setAbTeste] = useState(true);
  const [criterio, setCriterio] = useState<"abertura" | "clique" | "conversao">("conversao");
  const [varA, setVarA] = useState({ assunto: "", template: "lancamento_colecao", conteudo: "", cta: "Ver coleção" });
  const [varB, setVarB] = useState({ assunto: "", template: "lancamento_colecao", conteudo: "", cta: "Conferir agora" });
  const [agendamento, setAgendamento] = useState<"agora" | "agendar" | "rascunho">("agendar");
  const [data, setData] = useState("");
  const [hora, setHora] = useState("09:00");

  const segmento = segmentos.find(s => s.id === segmentoId)!;
  const integracao = canal === "whatsapp" ? "int_wpp" : "int_mailchimp";
  const integConectada = integracoes.find(i => i.id === integracao)?.status === "conectado";
  const custoEstimado = canal === "whatsapp" ? segmento.totalContatos * 0.06 : 0;

  const canNext = useMemo(() => {
    if (step === 1) return nome.trim().length > 2;
    if (step === 2) return !!segmentoId;
    if (step === 3) {
      const a = varA.conteudo.trim().length > 5;
      const b = !abTeste || varB.conteudo.trim().length > 5;
      const subjOk = canal === "email" ? (varA.assunto.trim().length > 2 && (!abTeste || varB.assunto.trim().length > 2)) : true;
      return a && b && subjOk;
    }
    if (step === 4) return agendamento !== "agendar" || (data && hora);
    return true;
  }, [step, nome, segmentoId, varA, varB, abTeste, canal, agendamento, data, hora]);

  const finalizar = () => {
    const variantes: VarianteAB[] = [];
    const baseStats = { enviados: 0, entregues: 0, abertos: 0, cliques: 0, respostas: 0, conversoes: 0, receitaAtribuida: 0, optouSair: 0 };
    variantes.push({
      id: "A", nome: "Variante A",
      assunto: canal === "email" ? varA.assunto : undefined,
      preview: canal === "email" ? varA.assunto.slice(0, 60) : undefined,
      template: canal === "whatsapp" ? varA.template : undefined,
      conteudo: varA.conteudo, cta: varA.cta, ctaUrl: "https://nextil.app/", ...baseStats,
    });
    if (abTeste) variantes.push({
      id: "B", nome: "Variante B",
      assunto: canal === "email" ? varB.assunto : undefined,
      preview: canal === "email" ? varB.assunto.slice(0, 60) : undefined,
      template: canal === "whatsapp" ? varB.template : undefined,
      conteudo: varB.conteudo, cta: varB.cta, ctaUrl: "https://nextil.app/", ...baseStats,
    });
    const status = agendamento === "rascunho" ? "rascunho" : agendamento === "agora" ? "enviando" : "agendada";
    const id = criarCampanha({
      nome, canal, objetivo, status,
      agendadaPara: agendamento === "agendar" ? `${data} ${hora}` : undefined,
      enviadaEm: agendamento === "agora" ? new Date().toLocaleString("pt-BR") : undefined,
      segmentoId, segmentoNome: segmento.nome,
      totalDestinatarios: segmento.totalContatos,
      abTeste,
      divisaoAB: abTeste ? { A: 50, B: 50, criterioVencedor: criterio } : undefined,
      variantes,
      tags: [objetivoLabels[objetivo]],
      responsavel: "Time Marketing",
      custoEstimado,
      integracaoId: integracao as "int_wpp" | "int_mailchimp",
    });
    onCreated(id);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-xl border border-border w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="px-5 py-4 border-b border-border shrink-0 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Nova campanha</h3>
            <div className="flex items-center gap-1.5 mt-1.5">
              {[1, 2, 3, 4].map(s => (
                <div key={s} className="flex items-center gap-1.5">
                  <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    step === s ? "bg-primary text-primary-foreground" :
                    step > s ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"
                  }`}>
                    {step > s ? <Check className="h-3 w-3" /> : s}
                  </div>
                  {s < 4 && <div className={`h-0.5 w-8 ${step > s ? "bg-emerald-500" : "bg-muted"}`} />}
                </div>
              ))}
              <span className="ml-2 text-[11px] text-muted-foreground">
                {step === 1 ? "Objetivo" : step === 2 ? "Audiência" : step === 3 ? "Conteúdo + A/B" : "Agendamento"}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-medium text-foreground block mb-1.5">Nome da campanha</label>
                <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex.: Lançamento Outono Inverno 2026"
                  className="w-full bg-card border border-border rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-ring" />
              </div>
              <div>
                <label className="text-[11px] font-medium text-foreground block mb-1.5">Canal</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["whatsapp", "email"] as CanalCampanha[]).map(c => {
                    const Icon = c === "whatsapp" ? MessageSquare : Mail;
                    return (
                      <button key={c} onClick={() => setCanal(c)} className={`p-3 rounded-lg border-2 flex items-start gap-3 text-left ${
                        canal === c ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                      }`}>
                        <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${
                          c === "whatsapp" ? "bg-[#25D366]/10 text-[#25D366]" : "bg-[#A855F7]/10 text-[#A855F7]"
                        }`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold text-foreground">{c === "whatsapp" ? "WhatsApp Cloud API" : "Mailchimp"}</p>
                          <p className="text-[11px] text-muted-foreground">{c === "whatsapp" ? "Templates aprovados Meta · custo por mensagem" : "Campanha de e-mail · sem custo por envio"}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {!integConectada && (
                  <p className="text-[11px] text-amber-600 mt-2 inline-flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> Integração ainda não conectada — você poderá enviar como rascunho.
                  </p>
                )}
              </div>
              <div>
                <label className="text-[11px] font-medium text-foreground block mb-1.5">Objetivo</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {OBJETIVOS.map(o => (
                    <button key={o.id} onClick={() => setObjetivo(o.id)} className={`p-2.5 rounded-lg border text-left flex items-center gap-2.5 ${
                      objetivo === o.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                    }`}>
                      <span className="text-lg">{o.icon}</span>
                      <div>
                        <p className="text-[12px] font-semibold text-foreground">{objetivoLabels[o.id]}</p>
                        <p className="text-[10px] text-muted-foreground">{o.descricao}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <p className="text-[12px] text-muted-foreground">Selecione um segmento de audiência. Os filtros são pré-configurados a partir do CRM.</p>
              <div className="space-y-2">
                {segmentos.map(s => (
                  <button key={s.id} onClick={() => setSegmentoId(s.id)} className={`w-full p-3 rounded-lg border-2 text-left ${
                    segmentoId === s.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                  }`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <Users className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-foreground">{s.nome}</p>
                          <p className="text-[11px] text-muted-foreground">{s.descricao}</p>
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {s.filtros.map(f => (
                              <span key={f.label} className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">{f.label}: {f.value}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-base font-bold text-foreground tabular-nums">{formatNum(s.totalContatos)}</p>
                        <p className="text-[9px] text-muted-foreground uppercase">contatos</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={abTeste} onChange={e => setAbTeste(e.target.checked)} className="h-4 w-4 rounded" />
                <FlaskConical className="h-4 w-4 text-amber-600" />
                <span className="text-[12px] font-medium text-foreground">Habilitar teste A/B</span>
                <span className="text-[10px] text-muted-foreground">Divide a audiência em duas variantes</span>
              </label>
              {abTeste && (
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3">
                  <label className="text-[11px] font-medium text-foreground block mb-1.5">Critério de vencedor</label>
                  <div className="flex gap-2">
                    {(["abertura", "clique", "conversao"] as const).map(c => (
                      <button key={c} onClick={() => setCriterio(c)} className={`text-[11px] px-2.5 py-1 rounded-full border ${
                        criterio === c ? "bg-foreground text-background border-foreground" : "bg-card border-border text-muted-foreground hover:text-foreground"
                      }`}>{c === "abertura" ? "Maior abertura" : c === "clique" ? "Mais cliques" : "Mais conversões"}</button>
                    ))}
                  </div>
                </div>
              )}

              <VariantEditor canal={canal} label="Variante A" value={varA} onChange={setVarA} />
              {abTeste && <VariantEditor canal={canal} label="Variante B" value={varB} onChange={setVarB} />}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              {/* Resumo */}
              <div className="bg-muted/40 border border-border rounded-lg p-3 space-y-1.5">
                <Row label="Campanha" value={nome} />
                <Row label="Canal" value={canal === "whatsapp" ? "WhatsApp Cloud API" : "Mailchimp"} />
                <Row label="Objetivo" value={objetivoLabels[objetivo]} />
                <Row label="Audiência" value={`${segmento.nome} (${formatNum(segmento.totalContatos)} contatos)`} />
                <Row label="Variantes" value={abTeste ? "Teste A/B (50/50)" : "Única"} />
                {custoEstimado > 0 && <Row label="Custo estimado" value={formatBRL(custoEstimado)} />}
              </div>

              <div>
                <label className="text-[11px] font-medium text-foreground block mb-1.5">Quando enviar?</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "agora", label: "Enviar agora", desc: "Disparo imediato", icon: Send },
                    { id: "agendar", label: "Agendar", desc: "Data e hora futura", icon: CalendarClock },
                    { id: "rascunho", label: "Salvar rascunho", desc: "Enviar depois", icon: Check },
                  ].map(o => (
                    <button key={o.id} onClick={() => setAgendamento(o.id as "agora" | "agendar" | "rascunho")} className={`p-3 rounded-lg border-2 text-left ${
                      agendamento === o.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                    }`}>
                      <o.icon className="h-4 w-4 text-primary mb-1" />
                      <p className="text-[12px] font-semibold text-foreground">{o.label}</p>
                      <p className="text-[10px] text-muted-foreground">{o.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
              {agendamento === "agendar" && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-medium text-foreground block mb-1">Data</label>
                    <input type="date" value={data} onChange={e => setData(e.target.value)}
                      className="w-full bg-card border border-border rounded-lg px-3 py-2 text-[12px] focus:outline-none focus:ring-1 focus:ring-ring" />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-foreground block mb-1">Hora</label>
                    <input type="time" value={hora} onChange={e => setHora(e.target.value)}
                      className="w-full bg-card border border-border rounded-lg px-3 py-2 text-[12px] focus:outline-none focus:ring-1 focus:ring-ring" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border shrink-0 flex items-center justify-between">
          <button onClick={() => step === 1 ? onClose() : setStep(step - 1)} className="text-[12px] inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-muted-foreground hover:bg-muted">
            <ChevronLeft className="h-4 w-4" /> {step === 1 ? "Cancelar" : "Voltar"}
          </button>
          {step < 4 ? (
            <button disabled={!canNext} onClick={() => setStep(step + 1)} className="text-[12px] font-medium inline-flex items-center gap-1 px-4 py-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed">
              Próximo <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button disabled={!canNext} onClick={finalizar} className="text-[12px] font-medium inline-flex items-center gap-1 px-4 py-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40">
              {agendamento === "agora" ? "Enviar campanha" : agendamento === "agendar" ? "Agendar campanha" : "Salvar rascunho"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-[12px]">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground font-medium text-right truncate ml-2">{value}</span>
    </div>
  );
}

interface VarState { assunto: string; template: string; conteudo: string; cta: string; }
function VariantEditor({ canal, label, value, onChange }: {
  canal: CanalCampanha; label: string; value: VarState; onChange: (v: VarState) => void;
}) {
  return (
    <div className="bg-card border border-border rounded-lg p-3">
      <p className="text-[11px] font-bold text-foreground mb-2">{label}</p>
      {canal === "email" ? (
        <input value={value.assunto} onChange={e => onChange({ ...value, assunto: e.target.value })}
          placeholder="Assunto do e-mail"
          className="w-full bg-card border border-border rounded-lg px-3 py-2 text-[12px] mb-2 focus:outline-none focus:ring-1 focus:ring-ring" />
      ) : (
        <select value={value.template} onChange={e => onChange({ ...value, template: e.target.value })}
          className="w-full bg-card border border-border rounded-lg px-3 py-2 text-[12px] mb-2 focus:outline-none focus:ring-1 focus:ring-ring">
          {mockTemplatesWpp.map(t => <option key={t.id} value={t.nome}>{t.nome} ({t.categoria})</option>)}
        </select>
      )}
      <textarea value={value.conteudo} onChange={e => onChange({ ...value, conteudo: e.target.value })} rows={4}
        placeholder={canal === "whatsapp" ? "Mensagem... use {{nome}} para personalizar" : "Conteúdo do e-mail (suporta HTML básico)"}
        className="w-full bg-card border border-border rounded-lg px-3 py-2 text-[12px] focus:outline-none focus:ring-1 focus:ring-ring" />
      <input value={value.cta} onChange={e => onChange({ ...value, cta: e.target.value })}
        placeholder="Texto do botão CTA"
        className="w-full bg-card border border-border rounded-lg px-3 py-2 text-[12px] mt-2 focus:outline-none focus:ring-1 focus:ring-ring" />
      {canal === "email" && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {mockTemplatesEmail.map(t => (
            <button key={t.id} className="text-[10px] bg-muted px-2 py-0.5 rounded inline-flex items-center gap-1 hover:bg-muted/70">
              {t.thumb} {t.nome}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
