import { useMemo, useState } from "react";
import { useCockpit } from "../../contexts/CockpitContext";
import {
  filaAprovacoes, motivoAprovacaoLabel, motivoAprovacaoBadge,
  repsForaRitmo, clientesChaveRisco, negociosGrandesParados, insightsEstruturais,
  type AprovacaoItem,
} from "../../lib/decisoes";
import { classificarTudo } from "../../lib/classificar";
import { fmtBRLc, fmtBRL } from "../../styles/tokens";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertTriangle, CheckCircle2, RotateCcw, XCircle, Bell, FileText,
  UserX, Users, DollarSign, MessageCircle, Layers, TrendingDown, Lightbulb,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTarefas } from "@/contexts/TarefasContext";
import { SolicitarPlanoModal } from "./SolicitarPlanoModal";
import { PlanosEmAndamento } from "./PlanosEmAndamento";
import type { PlanoTipo } from "@/lib/planos";

const gestorId = "gestor-atual"; // mock

// ------------------------------------------------------------------
// SECTION HEADER
// ------------------------------------------------------------------
function BlockHeader({ icon, title, count, hint }: { icon: React.ReactNode; title: string; count: number; hint?: string }) {
  return (
    <div className="flex items-end justify-between mb-3">
      <div>
        <h2 className="text-sm font-semibold nx-text flex items-center gap-2">
          <span className="text-[#2D3A8C]">{icon}</span>
          {title}
          <span className="text-[11px] font-normal nx-muted">({count})</span>
        </h2>
        {hint && <p className="text-[11px] nx-muted mt-0.5">{hint}</p>}
      </div>
    </div>
  );
}

function EmptyBlock({ msg }: { msg: string }) {
  return (
    <div className="nx-card p-6 text-center">
      <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
      <p className="text-xs nx-muted">{msg}</p>
    </div>
  );
}

// ------------------------------------------------------------------
// APROVAÇÃO — CARD
// ------------------------------------------------------------------
function AprovacaoCard({ item, onDecidir }: { item: AprovacaoItem; onDecidir: (a: AprovacaoItem) => void }) {
  const navigate = useNavigate();
  const { registrarAprovacao } = useCockpit();

  const handleNotificarEstoque = () => {
    registrarAprovacao({
      orcamentoId: item.id, motivo: item.motivo, decisao: "notificar_estoque", gestorId,
    });
    toast.success(`Notificação de reposição criada para ${item.id}`);
  };

  return (
    <div className="nx-card p-3">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={`text-[10px] border ${motivoAprovacaoBadge[item.motivo]}`} variant="outline">
              {motivoAprovacaoLabel[item.motivo]}
            </Badge>
            <span className="text-[11px] nx-muted">há {item.abertoDias}d</span>
          </div>
          <p className="text-sm font-semibold nx-text mt-1">{item.detalhe}</p>
          <p className="text-[11px] nx-muted mt-0.5">
            {item.clienteNome} · {item.repNome} · <span className="nx-num font-medium nx-text">{fmtBRL(item.valor)}</span>
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {item.motivo === "fora_da_politica" && (
          <>
            <Button size="sm" variant="default" className="h-7 text-[11px] bg-emerald-600 hover:bg-emerald-700" onClick={() => onDecidir({ ...item, motivo: item.motivo })}>
              <CheckCircle2 className="h-3 w-3 mr-1" /> Aprovar
            </Button>
            <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onDecidir({ ...item })}>
              <XCircle className="h-3 w-3 mr-1" /> Reprovar
            </Button>
            <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onDecidir({ ...item })}>
              <RotateCcw className="h-3 w-3 mr-1" /> Devolver com ajuste
            </Button>
          </>
        )}
        {item.motivo === "credito_cliente_novo" && (
          <>
            <Button size="sm" className="h-7 text-[11px] bg-emerald-600 hover:bg-emerald-700" onClick={() => onDecidir(item)}>
              <CheckCircle2 className="h-3 w-3 mr-1" /> Aprovar crédito
            </Button>
            <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onDecidir(item)}>
              <XCircle className="h-3 w-3 mr-1" /> Reprovar
            </Button>
            <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onDecidir(item)}>
              <FileText className="h-3 w-3 mr-1" /> Solicitar docs
            </Button>
          </>
        )}
        {item.motivo === "aguardando_estoque" && (
          <>
            <Button size="sm" className="h-7 text-[11px] bg-violet-600 hover:bg-violet-700" onClick={handleNotificarEstoque}>
              <Bell className="h-3 w-3 mr-1" /> Notificar quando disponível
            </Button>
            <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => toast.info("Buscando produtos alternativos...")}>
              Ver alternativas
            </Button>
            <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => onDecidir(item)}>
              Cancelar orçamento
            </Button>
          </>
        )}
        <button
          className="text-[11px] text-[#2D3A8C] hover:underline ml-auto"
          onClick={() => navigate(`/vendedor/orcamento-viewer?id=${item.id}`)}
        >
          Ver orçamento →
        </button>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// MODAL DE DECISÃO
// ------------------------------------------------------------------
type DecisaoTipo = "aprovado" | "reprovado" | "devolvido" | "solicitar_docs" | "cancelado";

function DecisaoModal({
  item, decisao, open, onOpenChange,
}: { item: AprovacaoItem | null; decisao: DecisaoTipo; open: boolean; onOpenChange: (b: boolean) => void }) {
  const [nota, setNota] = useState("");
  const { registrarAprovacao } = useCockpit();
  const { addTarefa } = useTarefas();

  const titulo: Record<DecisaoTipo, string> = {
    aprovado: "Aprovar orçamento",
    reprovado: "Reprovar orçamento",
    devolvido: "Devolver com ajuste",
    solicitar_docs: "Solicitar documentação",
    cancelado: "Cancelar orçamento",
  };
  const notaPlaceholder: Record<DecisaoTipo, string> = {
    aprovado: "Nota opcional (contexto da aprovação)",
    reprovado: "Motivo da reprovação (obrigatório)",
    devolvido: 'Ajuste solicitado (ex: "Reduzir desconto para 30% ou atingir mínimo")',
    solicitar_docs: "Quais documentos são necessários",
    cancelado: "Motivo do cancelamento",
  };
  const obrigatorio = decisao === "reprovado" || decisao === "devolvido";

  const handleConfirm = () => {
    if (!item) return;
    if (obrigatorio && !nota.trim()) {
      toast.error("Nota obrigatória para esta decisão");
      return;
    }
    registrarAprovacao({
      orcamentoId: item.id, motivo: item.motivo, decisao, gestorId, nota: nota.trim() || undefined,
    });

    // DEVOLUÇÃO fecha o loop: cria Ação sistema para o rep
    if (decisao === "devolvido") {
      addTarefa({
        titulo: `Ajustar orçamento ${item.id}`,
        descricao: `Gestor devolveu: ${nota.trim()}`,
        tipo: "outros",
        clienteId: item.contaId,
        clienteNome: item.clienteNome,
        prioridade: "alta",
        vencimento: formatBRDate(addDays(new Date(), 2)),
        responsavel: item.repNome,
        status: "pendente",
        origem: "sistema",
        recorrencia: "nenhuma",
      });
      toast.success(`Devolvido — ação criada para ${item.repNome}`);
    } else {
      toast.success(`${titulo[decisao]} · registrado em auditoria`);
    }
    setNota("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{titulo[decisao]}</DialogTitle>
        </DialogHeader>
        {item && (
          <div className="space-y-3">
            <div className="text-xs nx-muted p-2 bg-[#F6F7F9] rounded">
              <div>{item.id} · {fmtBRL(item.valor)}</div>
              <div>{item.clienteNome} · {item.repNome}</div>
              <div className="mt-1 text-[11px]">{item.detalhe}</div>
            </div>
            <div>
              <label className="text-xs font-medium nx-text mb-1 block">
                Nota {obrigatorio && <span className="text-rose-500">*</span>}
              </label>
              <Textarea rows={3} value={nota} onChange={e => setNota(e.target.value)} placeholder={notaPlaceholder[decisao]} />
              <p className="text-[10px] nx-muted mt-1">Toda decisão é registrada em log de auditoria.</p>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleConfirm}>Confirmar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function formatBRDate(d: Date): string {
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}
function addDays(d: Date, n: number) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }

// ------------------------------------------------------------------
// TAB
// ------------------------------------------------------------------
export function DecisoesTab() {
  const { seed, escopo, range, previousRange, diasAtivo, diasPerdido } = useCockpit();
  const navigate = useNavigate();
  const { addTarefa } = useTarefas();

  const [modalItem, setModalItem] = useState<AprovacaoItem | null>(null);
  const [modalDecisao, setModalDecisao] = useState<DecisaoTipo>("aprovado");
  const [modalOpen, setModalOpen] = useState(false);

  const aprovacoes = useMemo(() => filaAprovacoes(seed, escopo), [seed, escopo]);
  const foraRitmo = useMemo(() => repsForaRitmo(seed, escopo), [seed, escopo]);
  const classificadas = useMemo(
    () => classificarTudo(seed.contas, seed.pedidos, range, diasAtivo, diasPerdido, seed.hoje),
    [seed, range, diasAtivo, diasPerdido],
  );
  const chaveRisco = useMemo(
    () => clientesChaveRisco(classificadas, seed, escopo, diasPerdido),
    [classificadas, seed, escopo, diasPerdido],
  );
  const negocios = useMemo(() => negociosGrandesParados(seed, escopo), [seed, escopo]);
  const estruturais = useMemo(() => insightsEstruturais(seed, escopo, classificadas), [seed, escopo, classificadas]);

  const openDecisao = (item: AprovacaoItem, dec: DecisaoTipo = "aprovado") => {
    setModalItem(item); setModalDecisao(dec); setModalOpen(true);
  };

  const cobrarPlanoRep = (repNome: string, clienteNome: string, clienteId: string) => {
    addTarefa({
      titulo: `Plano de resgate: ${clienteNome}`,
      descricao: `Gestor solicitou plano de ação. Cliente-chave prestes a virar perdido.`,
      tipo: "follow_up",
      clienteId, clienteNome,
      prioridade: "alta",
      vencimento: formatBRDate(addDays(new Date(), 1)),
      responsavel: repNome,
      status: "pendente",
      origem: "sistema",
      recorrencia: "nenhuma",
    });
    toast.success(`Ação criada para ${repNome} — cobrança de plano registrada.`);
  };

  return (
    <div className="space-y-6">
      {/* Insights estruturais */}
      {estruturais.length > 0 && (
        <div className="space-y-2">
          {estruturais.map((e, i) => (
            <div key={i} className="rounded-lg border border-amber-200 bg-amber-50 p-3">
              <div className="flex items-start gap-2">
                <Lightbulb className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-amber-900">{e.titulo}</p>
                  <p className="text-[11px] text-amber-800 mt-0.5">{e.descricao}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* a) APROVAÇÕES */}
      <section>
        <BlockHeader
          icon={<CheckCircle2 className="h-4 w-4" />}
          title="Aprovações pendentes"
          count={aprovacoes.length}
          hint="Análise comercial: fora da política · crédito · estoque. Fast-track passa direto e não aparece aqui."
        />
        {aprovacoes.length === 0
          ? <EmptyBlock msg="Nenhuma aprovação pendente." />
          : <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {aprovacoes.map(a => <AprovacaoCard key={a.id} item={a} onDecidir={(item) => openDecisao(item)} />)}
            </div>
        }
      </section>

      {/* b) TIME FORA DO RITMO */}
      <section>
        <BlockHeader
          icon={<UserX className="h-4 w-4" />}
          title="Time fora do ritmo"
          count={foraRitmo.length}
          hint="Reps com pace &lt; 80%, queda de cobertura ou sem acesso ≥ 7d."
        />
        {foraRitmo.length === 0
          ? <EmptyBlock msg="Todo o time no ritmo esperado." />
          : <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {foraRitmo.map(({ rep, motivo, severidade }) => (
                <div key={rep.id} className={`nx-card p-3 border-l-4 ${severidade === "critico" ? "border-l-rose-500" : "border-l-amber-500"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold nx-text">{rep.nome}</p>
                      <p className="text-[11px] nx-muted">{rep.regiao} · pace {rep.pace}% · cobertura {rep.cobertura}%</p>
                      <p className="text-[12px] mt-1">{motivo}</p>
                    </div>
                    <AlertTriangle className={`h-4 w-4 shrink-0 ${severidade === "critico" ? "text-rose-500" : "text-amber-500"}`} />
                  </div>
                  <div className="flex gap-1.5 mt-2">
                    <Button size="sm" variant="outline" className="h-7 text-[11px]"
                      onClick={() => window.open(`https://wa.me/`, "_blank")}>
                      <MessageCircle className="h-3 w-3 mr-1" /> WhatsApp
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-[11px]"
                      onClick={() => navigate(`/vendedor/representantes/${rep.id}`)}>
                      <Users className="h-3 w-3 mr-1" /> Ver carteira
                    </Button>
                  </div>
                </div>
              ))}
            </div>
        }
      </section>

      {/* c) CLIENTES-CHAVE EM RISCO */}
      <section>
        <BlockHeader
          icon={<TrendingDown className="h-4 w-4" />}
          title="Clientes-chave em risco"
          count={chaveRisco.length}
          hint="Clientes classe A (curva ABC) prestes a virar perdidos."
        />
        {chaveRisco.length === 0
          ? <EmptyBlock msg="Nenhum cliente-chave em risco no momento." />
          : <div className="nx-card overflow-hidden">
              <table className="w-full text-xs">
                <thead className="text-[10px] uppercase nx-muted border-b border-[#E7E9EE]">
                  <tr>
                    <th className="text-left px-3 py-2">Cliente</th>
                    <th className="text-left">Rep</th>
                    <th className="text-right">Valor 12m</th>
                    <th className="text-right">Dias p/ perdido</th>
                    <th className="text-right px-3">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {chaveRisco.map(item => (
                    <tr key={item.cliente.conta.id} className="border-b border-[#F1F3F8]">
                      <td className="px-3 py-2 nx-text font-medium">{item.cliente.conta.razao}</td>
                      <td className="nx-muted">{item.repNome}</td>
                      <td className="text-right nx-num">{fmtBRLc(item.valor12m)}</td>
                      <td className="text-right">
                        <Badge className={item.diasRestantes <= 7 ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}>
                          {item.diasRestantes}d
                        </Badge>
                      </td>
                      <td className="text-right px-3">
                        <Button size="sm" variant="outline" className="h-7 text-[10px]"
                          onClick={() => cobrarPlanoRep(item.repNome, item.cliente.conta.razao, item.cliente.conta.id)}>
                          Cobrar plano do rep
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        }
      </section>

      {/* d) NEGÓCIOS GRANDES PARADOS */}
      <section>
        <BlockHeader
          icon={<DollarSign className="h-4 w-4" />}
          title="Negócios grandes parados"
          count={negocios.length}
          hint="Oportunidades acima de R$ 20k sem movimento há ≥ 7 dias."
        />
        {negocios.length === 0
          ? <EmptyBlock msg="Nenhum negócio grande parado." />
          : <div className="nx-card overflow-hidden">
              <table className="w-full text-xs">
                <thead className="text-[10px] uppercase nx-muted border-b border-[#E7E9EE]">
                  <tr>
                    <th className="text-left px-3 py-2">Oportunidade</th>
                    <th className="text-left">Cliente · Rep</th>
                    <th className="text-right">Valor</th>
                    <th className="text-right">Parado há</th>
                    <th className="text-right px-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {negocios.map(n => (
                    <tr key={n.op.id} className="border-b border-[#F1F3F8]">
                      <td className="px-3 py-2 nx-text font-medium">{n.op.id}</td>
                      <td className="nx-muted">{n.clienteNome} · {n.repNome}</td>
                      <td className="text-right nx-num">{fmtBRL(n.op.valor)}</td>
                      <td className="text-right"><Badge className="bg-amber-100 text-amber-700">{n.diasParado}d</Badge></td>
                      <td className="text-right px-3">
                        <Button size="sm" variant="outline" className="h-7 text-[10px]"
                          onClick={() => navigate(`/vendedor/oportunidades/${n.op.id}`)}>
                          Ver negociação
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        }
      </section>

      <DecisaoModal item={modalItem} decisao={modalDecisao} open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
}
