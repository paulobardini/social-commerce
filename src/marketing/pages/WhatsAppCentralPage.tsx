import { useMemo, useState } from "react";
import { useAtendimentoComercial } from "@/contexts/AtendimentoComercialContext";
import { origemLabels, tempoAgo, CardAC, ConversaCentral } from "@/data/mockAtendimentoComercial";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MessageCircle, Search, Clock, ArrowRightLeft, Shuffle, User, Send } from "lucide-react";
import { origemACColors, origemACLabels, type OrigemAC } from "../styles/tokens";

type Aba = "nao_distribuidas" | "distribuidas";

export default function WhatsAppCentralPage() {
  const { inbox, cards, vendedores, colunas, distribuirManual, distribuirRodizio, enviarMensagemMarketing } = useAtendimentoComercial();
  const [aba, setAba] = useState<Aba>("nao_distribuidas");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Distribuídas = cards do CRM que vieram do whats_central (histórico visível para marketing)
  const distribuidas = useMemo(() => cards.filter(c => c.origem === "whats_central" || c.conversaId?.startsWith("conv")), [cards]);

  const lista = aba === "nao_distribuidas" ? inbox : distribuidas;

  // Selecionar item padrão
  const currentId = selectedId || (lista[0] as any)?.id || null;
  const selectedItem = lista.find((i: any) => i.id === currentId) as ConversaCentral | CardAC | undefined;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-foreground">WhatsApp Central</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Espelho do canal central — o marketing acompanha e distribui, o vendedor responde.</p>
      </div>

      <div className="flex items-center gap-1 bg-muted rounded-lg p-1 w-fit">
        <button onClick={() => { setAba("nao_distribuidas"); setSelectedId(null); }}
          className={`text-[12px] font-medium px-3 py-1.5 rounded ${aba === "nao_distribuidas" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
          Não distribuídas ({inbox.length})
        </button>
        <button onClick={() => { setAba("distribuidas"); setSelectedId(null); }}
          className={`text-[12px] font-medium px-3 py-1.5 rounded ${aba === "distribuidas" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
          Distribuídas ({distribuidas.length})
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden flex h-[calc(100vh-16rem)] min-h-[520px]">
        {/* Lista */}
        <div className="w-[320px] border-r border-border overflow-y-auto shrink-0">
          {lista.length === 0 ? (
            <p className="text-[12px] text-muted-foreground text-center py-10">Nenhuma conversa nesta aba</p>
          ) : (
            (lista as any[]).map((item: any) => {
              const isConv = aba === "nao_distribuidas";
              const nome = item.nome;
              const telefone = item.telefone;
              const origem = item.origem as OrigemAC;
              const cor = origemACColors[origem] || "#94A3B8";
              const ativo = currentId === item.id;
              const ultima = isConv ? item.ultimaMensagem : item.ultimaMensagem;
              const at = isConv ? item.chegouEm : item.ultimaInteracao;
              return (
                <button key={item.id} onClick={() => setSelectedId(item.id)}
                  className={`w-full text-left px-3 py-2.5 border-b border-border/60 hover:bg-muted/30 ${ativo ? "bg-muted/50" : ""}`}>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ background: cor }} />
                    <p className="text-[13px] font-semibold text-foreground truncate flex-1">{nome}</p>
                    <span className="text-[10px] text-muted-foreground shrink-0">{tempoAgo(at)}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate">{telefone}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{ultima}</p>
                  <div className="flex items-center gap-1 mt-1 flex-wrap">
                    <span className="text-[9px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">{origemACLabels[origem] || origem}</span>
                    {!isConv && (
                      <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded truncate max-w-[120px]">
                        {(item as CardAC).vendedorNome}
                      </span>
                    )}
                    {!isConv && (
                      <span className="text-[9px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded truncate max-w-[100px]">
                        {colunas.find(c => c.id === (item as CardAC).colunaId)?.label}
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Painel do chat */}
        <div className="flex-1 flex flex-col min-w-0">
          {!selectedItem ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <MessageCircle className="h-10 w-10 mx-auto opacity-40 mb-2" />
                <p className="text-sm">Selecione uma conversa</p>
              </div>
            </div>
          ) : (
            <ChatPane
              item={selectedItem}
              aba={aba}
              vendedores={vendedores}
              onDistribuirManual={(vid) => aba === "nao_distribuidas" && distribuirManual(selectedItem.id, vid)}
              onDistribuirRodizio={() => aba === "nao_distribuidas" && distribuirRodizio(selectedItem.id)}
              onEnviarMensagem={(texto) => enviarMensagemMarketing(selectedItem.id, texto)}
              vendedorAtual={aba === "distribuidas" ? (selectedItem as CardAC).vendedorNome : undefined}
              etapaAtual={aba === "distribuidas" ? colunas.find(c => c.id === (selectedItem as CardAC).colunaId)?.label : undefined}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function ChatPane({
  item, aba, vendedores, onDistribuirManual, onDistribuirRodizio, vendedorAtual, etapaAtual,
}: {
  item: any;
  aba: Aba;
  vendedores: { id: string; nome: string; iniciais: string; cor: string; pausado: boolean }[];
  onDistribuirManual: (vid: string) => void;
  onDistribuirRodizio: () => void;
  vendedorAtual?: string;
  etapaAtual?: string;
}) {
  const mensagens: { at: string; from: "lead" | "central"; msg: string }[] =
    item.mensagens || item.historico || [{ at: item.ultimaInteracao || item.chegouEm, from: "lead", msg: item.ultimaMensagem }];
  const nome = item.nome;
  const telefone = item.telefone;

  return (
    <>
      {/* Header */}
      <div className="shrink-0 px-4 py-2.5 border-b border-border flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-foreground truncate">{nome}</p>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <span>{telefone}</span>
            {vendedorAtual && <span>· <User className="h-2.5 w-2.5 inline" /> {vendedorAtual}</span>}
            {etapaAtual && <span>· etapa: <strong className="text-foreground">{etapaAtual}</strong></span>}
          </div>
        </div>
        <span className="text-[10px] font-semibold uppercase text-muted-foreground bg-muted px-2 py-0.5 rounded shrink-0">
          {aba === "nao_distribuidas" ? "Não distribuída" : "Distribuída"}
        </span>
      </div>

      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-muted/10">
        {mensagens.map((m, i) => (
          <div key={i} className={`flex ${m.from === "lead" ? "justify-start" : "justify-end"}`}>
            <div className={`max-w-[70%] rounded-lg px-3 py-2 text-[12px] shadow-sm ${
              m.from === "lead" ? "bg-card border border-border" : "bg-emerald-500/90 text-white"
            }`}>
              <p>{m.msg}</p>
              <p className={`text-[9px] mt-0.5 ${m.from === "lead" ? "text-muted-foreground" : "text-white/70"}`}>
                {new Date(m.at).toLocaleString("pt-BR")}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Barra inferior — só distribuir se não distribuída */}
      <div className="shrink-0 px-4 py-3 border-t border-border bg-card">
        {aba === "nao_distribuidas" ? (
          <div className="flex items-center gap-2">
            <p className="text-[11px] text-muted-foreground flex-1">
              🔒 Marketing acompanha em leitura — respostas são feitas pelo vendedor no CRM.
            </p>
            <button onClick={onDistribuirRodizio}
              className="text-[11px] inline-flex items-center gap-1 px-2.5 py-1.5 rounded border border-border hover:bg-muted">
              <Shuffle className="h-3 w-3" /> Rodízio
            </button>
            <DistribuirPopover vendedores={vendedores} onPick={onDistribuirManual} />
          </div>
        ) : (
          <p className="text-[11px] text-muted-foreground text-center">
            Conversa em atendimento por <strong className="text-foreground">{vendedorAtual}</strong> · etapa <strong className="text-foreground">{etapaAtual}</strong>
          </p>
        )}
      </div>
    </>
  );
}

function DistribuirPopover({ vendedores, onPick }: { vendedores: { id: string; nome: string; iniciais: string; cor: string; pausado: boolean }[]; onPick: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const filtrados = vendedores.filter(v => v.nome.toLowerCase().includes(q.toLowerCase()));
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="text-[11px] font-medium inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-primary text-primary-foreground hover:opacity-90">
          <ArrowRightLeft className="h-3 w-3" /> Distribuir para vendedor
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-2">
        <div className="relative mb-2">
          <Search className="h-3 w-3 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar vendedor…"
            className="w-full pl-7 pr-2 py-1.5 text-[12px] border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-ring" />
        </div>
        <div className="max-h-56 overflow-y-auto">
          {filtrados.map(v => (
            <button key={v.id} onClick={() => { onPick(v.id); setOpen(false); setQ(""); }}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted text-left text-[12px]">
              <span className={`h-6 w-6 rounded-full ${v.cor} text-white flex items-center justify-center text-[10px] font-semibold`}>{v.iniciais}</span>
              <span className="flex-1 truncate">{v.nome}{v.pausado ? " (pausado)" : ""}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
