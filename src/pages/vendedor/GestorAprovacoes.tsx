// Tela Aprovações · Análise comercial (submenu do gestor).
// Fila (fora_da_politica · credito · estoque) + Histórico auditável.
// Navegação completa: busca, filtros por rep e valor, ordenação, agrupamento e contador.
// Cada decisão gera consequência estruturada no lado do rep (Tarefa dedicada).
import { useMemo, useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CockpitTopbar } from "@/cockpit/components/CockpitTopbar";
import { useCockpit } from "@/cockpit/contexts/CockpitContext";
import {
  filaAprovacoes, motivoAprovacaoLabel, motivoAprovacaoBadge,
  type AprovacaoItem,
} from "@/cockpit/lib/decisoes";
import { fmtBRL } from "@/cockpit/styles/tokens";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  CheckCircle2, RotateCcw, XCircle, Bell, FileText, Search, ChevronDown, ChevronRight, X,
} from "lucide-react";
import { toast } from "sonner";
import { useTarefas } from "@/contexts/TarefasContext";
import { useAtendimentoComercial } from "@/contexts/AtendimentoComercialContext";
import type { MotivoAprovacao } from "@/cockpit/data/seed";


const gestorId = "gestor-atual";

type DecisaoTipo = "aprovado" | "reprovado" | "devolvido" | "solicitar_docs" | "cancelado";
type FaixaValor = "todos" | "ate10k" | "10a25k" | "25kplus";
type Ordenacao = "espera" | "valor" | "rep";

const filtroMotivos: { key: "todas" | MotivoAprovacao; label: string }[] = [
  { key: "todas", label: "Todas" },
  { key: "fora_da_politica", label: "Fora da política" },
  { key: "credito_cliente_novo", label: "Crédito" },
  { key: "aguardando_estoque", label: "Estoque" },
];

const faixasValor: { key: FaixaValor; label: string; min: number; max: number }[] = [
  { key: "todos",   label: "Todos valores", min: 0,      max: Infinity },
  { key: "ate10k",  label: "Até R$ 10k",    min: 0,      max: 10000 },
  { key: "10a25k",  label: "R$ 10k a 25k",  min: 10000,  max: 25000 },
  { key: "25kplus", label: "Acima de R$ 25k", min: 25000, max: Infinity },
];

function formatBRDate(d: Date): string {
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}
function addDays(d: Date, n: number) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }

function AprovacaoCard({ item, onDecidir, removing }: {
  item: AprovacaoItem; onDecidir: (a: AprovacaoItem, d: DecisaoTipo) => void; removing?: boolean;
}) {
  const navigate = useNavigate();
  const { registrarAprovacao } = useCockpit();

  const borda = item.abertoDias > 4 ? "border-l-4 border-l-rose-500"
              : item.abertoDias > 2 ? "border-l-4 border-l-amber-500"
              : "";

  const handleNotificarEstoque = () => {
    registrarAprovacao({ orcamentoId: item.id, motivo: item.motivo, decisao: "notificar_estoque", gestorId });
    toast.success(`Notificação de reposição criada para ${item.id}`);
  };

  return (
    <div className={`nx-card px-3 py-2.5 ${borda} transition-all duration-300 ${removing ? "opacity-0 scale-95 -translate-x-4" : "opacity-100"}`}>
      <div className="flex items-center gap-3 flex-wrap md:flex-nowrap">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={`text-[10px] border ${motivoAprovacaoBadge[item.motivo]}`} variant="outline">
              {motivoAprovacaoLabel[item.motivo]}
            </Badge>
            <span className="text-[11px] nx-muted font-mono">{item.id}</span>
            <span className={`text-[11px] ${item.abertoDias > 4 ? "text-rose-600 font-semibold" : item.abertoDias > 2 ? "text-amber-700 font-medium" : "nx-muted"}`}>
              há {item.abertoDias}d
            </span>
            <span className="nx-num font-semibold nx-text text-sm ml-auto md:ml-2">{fmtBRL(item.valor)}</span>
          </div>
          <p className="text-sm nx-text mt-1 truncate">{item.detalhe}</p>
          <p className="text-[11px] nx-muted mt-0.5 truncate">{item.clienteNome} · {item.repNome}</p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 md:justify-end md:shrink-0">
          {item.motivo === "fora_da_politica" && (
            <>
              <Button size="sm" className="h-8 md:h-7 text-[11px] bg-emerald-600 hover:bg-emerald-700" onClick={() => onDecidir(item, "aprovado")}>
                <CheckCircle2 className="h-3 w-3 mr-1" /> Aprovar
              </Button>
              <Button size="sm" variant="outline" className="h-8 md:h-7 text-[11px]" onClick={() => onDecidir(item, "devolvido")}>
                <RotateCcw className="h-3 w-3 mr-1" /> Devolver
              </Button>
              <Button size="sm" variant="outline" className="h-8 md:h-7 text-[11px]" onClick={() => onDecidir(item, "reprovado")}>
                <XCircle className="h-3 w-3 mr-1" /> Reprovar
              </Button>
            </>
          )}
          {item.motivo === "credito_cliente_novo" && (
            <>
              <Button size="sm" className="h-8 md:h-7 text-[11px] bg-emerald-600 hover:bg-emerald-700" onClick={() => onDecidir(item, "aprovado")}>
                <CheckCircle2 className="h-3 w-3 mr-1" /> Aprovar crédito
              </Button>
              <Button size="sm" variant="outline" className="h-8 md:h-7 text-[11px]" onClick={() => onDecidir(item, "solicitar_docs")}>
                <FileText className="h-3 w-3 mr-1" /> Solicitar docs
              </Button>
              <Button size="sm" variant="outline" className="h-8 md:h-7 text-[11px]" onClick={() => onDecidir(item, "reprovado")}>
                <XCircle className="h-3 w-3 mr-1" /> Reprovar
              </Button>
            </>
          )}
          {item.motivo === "aguardando_estoque" && (
            <>
              <Button size="sm" className="h-8 md:h-7 text-[11px] bg-violet-600 hover:bg-violet-700" onClick={handleNotificarEstoque}>
                <Bell className="h-3 w-3 mr-1" /> Notificar
              </Button>
              <Button size="sm" variant="outline" className="h-8 md:h-7 text-[11px]" onClick={() => toast.info("Buscando produtos alternativos...")}>
                Alternativas
              </Button>
              <Button size="sm" variant="outline" className="h-8 md:h-7 text-[11px]" onClick={() => onDecidir(item, "cancelado")}>
                Cancelar
              </Button>
            </>
          )}
          <button
            className="text-[11px] text-[#2D3A8C] hover:underline px-2"
            onClick={() => navigate(`/vendedor/orcamento-viewer?id=${item.id}`)}
          >
            Ver →
          </button>
        </div>
      </div>
    </div>
  );
}

// ============ Consequência no lado do REP ============
// Cria Tarefa contextualizada com base na decisão do gestor. Origem "sistema"
// + observacao carregando "Gestor: <nota>" para o rep saber quem cobrou.
function criarTarefaParaRep(
  addTarefa: ReturnType<typeof useTarefas>["addTarefa"],
  item: AprovacaoItem,
  decisao: DecisaoTipo,
  nota: string,
) {
  const hoje = new Date();
  const dueIn = (n: number) => formatBRDate(addDays(hoje, n));

  const templates: Record<DecisaoTipo, { titulo: string; descricao: string; prioridade: "alta" | "media" | "baixa"; dias: number }> = {
    aprovado: {
      titulo: `Pedido aprovado · ${item.clienteNome}`,
      descricao: `Orçamento ${item.id} (${fmtBRL(item.valor)}) foi aprovado pelo comercial. Confirmar entrada do pedido e comunicar o cliente no WhatsApp.`,
      prioridade: "media",
      dias: 1,
    },
    reprovado: {
      titulo: `Orçamento reprovado · renegociar com ${item.clienteNome}`,
      descricao: `${item.id} (${fmtBRL(item.valor)}) foi REPROVADO pelo comercial.\nMotivo do gestor: ${nota || "sem nota"}.\nRenegociar cesta ou avisar o cliente com nova proposta ANTES que ele descubra por outro canal.`,
      prioridade: "alta",
      dias: 1,
    },
    devolvido: {
      titulo: `Ajustar orçamento ${item.id} · ${item.clienteNome}`,
      descricao: `Gestor devolveu para ajuste. Exigência: ${nota || "conforme detalhes"}. Abrir a cesta em modo edição, atender o ajuste e reenviar — vai voltar para a fila do gestor com badge "2ª rodada".`,
      prioridade: "alta",
      dias: 2,
    },
    solicitar_docs: {
      titulo: `Enviar documentação · ${item.clienteNome}`,
      descricao: `Gestor pediu: ${nota || "documentação complementar"}.\nAnexar ou pedir ao cliente no WhatsApp. Sem docs em 5 dias úteis o SLA da pendência migra para o rep.`,
      prioridade: "alta",
      dias: 5,
    },
    cancelado: {
      titulo: `Orçamento cancelado · ${item.clienteNome}`,
      descricao: `${item.id} cancelado (${nota || "sem nota"}). Alinhar próximo passo com o cliente.`,
      prioridade: "media",
      dias: 1,
    },
  };

  const t = templates[decisao];
  addTarefa({
    titulo: t.titulo,
    descricao: t.descricao,
    tipo: decisao === "solicitar_docs" ? "outros" : decisao === "aprovado" ? "pos_venda" : "retorno_orcamento",
    clienteId: item.contaId,
    clienteNome: item.clienteNome,
    prioridade: t.prioridade,
    vencimento: dueIn(t.dias),
    responsavel: item.repNome,
    status: "pendente",
    origem: "sistema",
    recorrencia: "nenhuma",
    observacao: `Gestor · ${nota || "sem nota adicional"}`,
  });
}

function DecisaoModal({ item, decisao, open, onOpenChange, onDecidido }: {
  item: AprovacaoItem | null; decisao: DecisaoTipo; open: boolean;
  onOpenChange: (b: boolean) => void; onDecidido: (orcId: string) => void;
}) {
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
  const placeholders: Record<DecisaoTipo, string> = {
    aprovado: "Nota opcional (contexto da aprovação)",
    reprovado: "Motivo da reprovação (obrigatório) — o rep verá isso na Ação",
    devolvido: 'Ajuste solicitado (ex: "Reduzir desconto para 30% ou atingir mínimo de R$ 15.000")',
    solicitar_docs: "Quais documentos são necessários (ex: comprovante de endereço)",
    cancelado: "Motivo do cancelamento",
  };
  const consequencia: Record<DecisaoTipo, string> = {
    aprovado: "Rep é notificado · card avança para 'Virou pedido' · evento na timeline do cliente",
    reprovado: "Ação urgente na fila do rep com o motivo · rep renegocia ANTES do cliente saber",
    devolvido: "Ação no rep abre a cesta em modo edição · quando reenviar, volta ao gestor com badge '2ª rodada'",
    solicitar_docs: "Ação com upload no rep · docs recebidos = volta ao gestor mantendo idade original",
    cancelado: "Cliente é notificado · card sai da fila",
  };
  const obrigatorio = decisao === "reprovado" || decisao === "devolvido";

  const handleConfirm = () => {
    if (!item) return;
    if (obrigatorio && !nota.trim()) { toast.error("Nota obrigatória para esta decisão"); return; }
    registrarAprovacao({ orcamentoId: item.id, motivo: item.motivo, decisao, gestorId, nota: nota.trim() || undefined });
    criarTarefaParaRep(addTarefa, item, decisao, nota.trim());
    onDecidido(item.id);
    toast.success(`${titulo[decisao]} · registrado · ação criada para ${item.repNome}`);
    setNota("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{titulo[decisao]}</DialogTitle></DialogHeader>
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
              <Textarea rows={3} value={nota} onChange={e => setNota(e.target.value)} placeholder={placeholders[decisao]} />
            </div>
            <div className="text-[11px] nx-muted bg-[#EEF2FF] border border-[#C7D2FE] rounded p-2">
              <span className="font-semibold text-[#2D3A8C]">O que acontece:</span> {consequencia[decisao]}
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

function ConflitosTab() {
  const { conflitos, resolverConflito } = useAtendimentoComercial();
  const pendentes = conflitos.filter(c => c.status === "pendente");
  const historico = conflitos.filter(c => c.status !== "pendente").slice(0, 20);

  if (conflitos.length === 0) {
    return <div className="nx-card p-8 text-center"><CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" /><p className="text-sm nx-muted">Sem conflitos de lead.</p></div>;
  }

  return (
    <div className="space-y-3">
      {pendentes.length === 0 && (
        <div className="nx-card p-6 text-center"><CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto mb-2" /><p className="text-sm nx-muted">Nenhum conflito pendente.</p></div>
      )}
      {pendentes.map(cf => (
        <div key={cf.id} className="nx-card px-3 py-2.5 border-l-4 border-l-amber-500">
          <div className="flex items-center gap-3 flex-wrap md:flex-nowrap">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-[10px] bg-amber-50 border-amber-200 text-amber-800">Conflito de lead</Badge>
                <span className="text-[11px] nx-muted font-mono">{cf.id}</span>
                <span className="text-[11px] nx-muted">{new Date(cf.criadoEm).toLocaleString("pt-BR")}</span>
              </div>
              <p className="text-sm nx-text mt-1 truncate">{cf.nomeLead} · {cf.telefone}{cf.cnpj ? ` · ${cf.cnpj}` : ""}</p>
              <p className="text-[11px] nx-muted mt-0.5">
                <span className="font-semibold">{cf.vendedorDonoNome}</span> (dono) × <span className="font-semibold">{cf.vendedorNovoNome}</span> (novo) — {cf.motivo}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 md:justify-end md:shrink-0">
              <Button size="sm" className="h-8 md:h-7 text-[11px] bg-emerald-600 hover:bg-emerald-700"
                onClick={() => { resolverConflito(cf.id, "manter_dono"); toast.success(`Mantido com ${cf.vendedorDonoNome}`); }}>
                <CheckCircle2 className="h-3 w-3 mr-1" /> Manter com dono da conta
              </Button>
              <Button size="sm" variant="outline" className="h-8 md:h-7 text-[11px]"
                onClick={() => { resolverConflito(cf.id, "liberar_novo"); toast.success(`Liberado para ${cf.vendedorNovoNome}`); }}>
                Liberar para o novo
              </Button>
            </div>
          </div>
        </div>
      ))}

      {historico.length > 0 && (
        <div className="pt-2">
          <p className="text-[10px] uppercase font-semibold nx-muted mb-1.5">Últimos resolvidos</p>
          <div className="space-y-1.5">
            {historico.map(cf => (
              <div key={cf.id} className="nx-card px-3 py-1.5 flex items-center gap-2">
                <span className="text-[11px] nx-muted flex-1 truncate">
                  {cf.nomeLead} · {cf.status === "resolvido_dono" ? `→ ${cf.vendedorDonoNome}` : `→ ${cf.vendedorNovoNome}`}
                </span>
                <span className="text-[10px] nx-muted">{cf.decidoEm ? new Date(cf.decidoEm).toLocaleString("pt-BR") : ""}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function HistoricoTab() {

  const { aprovacoesLog, seed } = useCockpit();
  const [q, setQ] = useState("");
  const [filtroDec, setFiltroDec] = useState<string>("todas");

  const linhas = useMemo(() => {
    const items = aprovacoesLog.slice().reverse();
    return items.filter(l => {
      if (filtroDec !== "todas" && l.decisao !== filtroDec) return false;
      if (q) {
        const cliente = seed.contas.find(c => seed.orcamentosPendentes.find(o => o.id === l.orcamentoId)?.contaId === c.id)?.razao ?? "";
        return l.orcamentoId.toLowerCase().includes(q.toLowerCase()) || cliente.toLowerCase().includes(q.toLowerCase());
      }
      return true;
    });
  }, [aprovacoesLog, filtroDec, q, seed]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Buscar por orçamento ou cliente..." value={q} onChange={e => setQ(e.target.value)} className="pl-9 h-9 text-xs" />
        </div>
        <Select value={filtroDec} onValueChange={setFiltroDec}>
          <SelectTrigger className="h-9 w-[180px] text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as decisões</SelectItem>
            <SelectItem value="aprovado">Aprovado</SelectItem>
            <SelectItem value="reprovado">Reprovado</SelectItem>
            <SelectItem value="devolvido">Devolvido</SelectItem>
            <SelectItem value="solicitar_docs">Solicitar docs</SelectItem>
            <SelectItem value="notificar_estoque">Notificar estoque</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {linhas.length === 0 ? (
        <div className="nx-card p-6 text-center text-xs nx-muted">Nenhum registro na auditoria.</div>
      ) : (
        <div className="nx-card overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-[10px] uppercase nx-muted border-b border-[#E7E9EE]">
              <tr>
                <th className="text-left px-3 py-2">Data</th>
                <th className="text-left">Orçamento</th>
                <th className="text-left">Cliente · Rep</th>
                <th className="text-left">Motivo</th>
                <th className="text-left">Decisão</th>
                <th className="text-left">Gestor</th>
                <th className="text-left px-3">Nota</th>
              </tr>
            </thead>
            <tbody>
              {linhas.map(l => {
                const pend = seed.orcamentosPendentes.find(o => o.id === l.orcamentoId);
                const cliente = pend ? seed.contas.find(c => c.id === pend.contaId)?.razao : "—";
                const rep = pend ? seed.representantes.find(r => r.id === pend.repId)?.nome : "—";
                return (
                  <tr key={l.id} className="border-b border-[#F1F3F8]">
                    <td className="px-3 py-2 nx-muted">{new Date(l.timestamp).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</td>
                    <td className="nx-text font-medium">{l.orcamentoId}</td>
                    <td className="nx-muted">{cliente} · {rep}</td>
                    <td><Badge variant="outline" className={`text-[10px] ${motivoAprovacaoBadge[l.motivo]}`}>{motivoAprovacaoLabel[l.motivo]}</Badge></td>
                    <td className="nx-text capitalize">{l.decisao.replace("_", " ")}</td>
                    <td className="nx-muted">{l.gestorId}</td>
                    <td className="px-3 nx-muted truncate max-w-[200px]">{l.nota ?? "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const PAGE_SIZE = 15;

export default function GestorAprovacoes() {
  const [params, setParams] = useSearchParams();
  const { seed, escopo } = useCockpit();

  const aprovacoes = useMemo(() => filaAprovacoes(seed, escopo), [seed, escopo]);

  // ==== Navegação: busca, filtros, ordenação, agrupamento ====
  const [q, setQ] = useState("");
  const [repFiltro, setRepFiltro] = useState<string>("todos");
  const [faixa, setFaixa] = useState<FaixaValor>("todos");
  const [ordem, setOrdem] = useState<Ordenacao>("espera");
  const [agrupar, setAgrupar] = useState(false);
  const [visiveis, setVisiveis] = useState(PAGE_SIZE);
  const [removendo, setRemovendo] = useState<Set<string>>(new Set());
  const sentinelRef = useRef<HTMLDivElement>(null);

  const filtroKey = (params.get("motivo") as "todas" | MotivoAprovacao) ?? "todas";

  // Contadores por rep (dentro do escopo, independente dos demais filtros)
  const contagensRep = useMemo(() => {
    const m = new Map<string, { nome: string; total: number }>();
    for (const a of aprovacoes) {
      const cur = m.get(a.repId) ?? { nome: a.repNome, total: 0 };
      cur.total++;
      m.set(a.repId, cur);
    }
    return m;
  }, [aprovacoes]);

  // Contagens por motivo (respeitando busca/rep/faixa — para chips refletirem contexto)
  const preFiltradas = useMemo(() => {
    return aprovacoes.filter(a => {
      if (repFiltro !== "todos" && a.repId !== repFiltro) return false;
      const f = faixasValor.find(x => x.key === faixa)!;
      if (a.valor < f.min || a.valor >= f.max) return false;
      if (q.trim()) {
        const s = q.trim().toLowerCase();
        return a.id.toLowerCase().includes(s)
            || a.clienteNome.toLowerCase().includes(s)
            || a.repNome.toLowerCase().includes(s);
      }
      return true;
    });
  }, [aprovacoes, repFiltro, faixa, q]);

  const contagensMotivo = useMemo(() => {
    const c: Record<string, number> = { todas: preFiltradas.length };
    for (const m of ["fora_da_politica", "credito_cliente_novo", "aguardando_estoque"] as MotivoAprovacao[]) {
      c[m] = preFiltradas.filter(a => a.motivo === m).length;
    }
    return c;
  }, [preFiltradas]);

  // Fila final ordenada
  const filtradas = useMemo(() => {
    const arr = filtroKey === "todas" ? preFiltradas : preFiltradas.filter(a => a.motivo === filtroKey);
    const sort = arr.slice();
    if (ordem === "espera") sort.sort((a, b) => b.abertoDias - a.abertoDias);
    else if (ordem === "valor") sort.sort((a, b) => b.valor - a.valor);
    else if (ordem === "rep") sort.sort((a, b) => a.repNome.localeCompare(b.repNome) || b.valor - a.valor);
    return sort;
  }, [preFiltradas, filtroKey, ordem]);

  // Reset page-size ao mudar filtro
  useEffect(() => { setVisiveis(PAGE_SIZE); }, [q, repFiltro, faixa, filtroKey, ordem, agrupar]);

  // Scroll infinito
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || agrupar) return;
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        setVisiveis(v => Math.min(v + PAGE_SIZE, filtradas.length));
      }
    }, { rootMargin: "200px" });
    obs.observe(el);
    return () => obs.disconnect();
  }, [filtradas.length, agrupar]);

  const paginadas = agrupar ? filtradas : filtradas.slice(0, visiveis);

  // Agrupamento por rep
  const grupos = useMemo(() => {
    if (!agrupar) return [];
    const g = new Map<string, { nome: string; itens: AprovacaoItem[]; total: number }>();
    for (const a of filtradas) {
      const cur = g.get(a.repId) ?? { nome: a.repNome, itens: [], total: 0 };
      cur.itens.push(a);
      cur.total += a.valor;
      g.set(a.repId, cur);
    }
    return Array.from(g.entries()).sort((a, b) => b[1].itens.length - a[1].itens.length);
  }, [agrupar, filtradas]);

  const [modal, setModal] = useState<{ item: AprovacaoItem | null; decisao: DecisaoTipo; open: boolean }>({
    item: null, decisao: "aprovado", open: false,
  });
  const [confirmacao, setConfirmacao] = useState<{ item: AprovacaoItem | null; decisao: DecisaoTipo } | null>(null);

  const abrirDecisao = (item: AprovacaoItem, decisao: DecisaoTipo) => {
    // Confirmação em 1 passo para fora_da_politica > R$ 20k
    if (decisao === "aprovado" && item.motivo === "fora_da_politica" && item.valor > 20000) {
      setConfirmacao({ item, decisao });
      return;
    }
    setModal({ item, decisao, open: true });
  };

  const onDecidido = (orcId: string) => {
    // Anima saída antes do card sumir (o item continua no seed até o mock atualizar)
    setRemovendo(prev => new Set(prev).add(orcId));
  };

  const setMotivo = (k: string) => {
    const p = new URLSearchParams(params);
    if (k === "todas") p.delete("motivo"); else p.set("motivo", k);
    setParams(p, { replace: true });
  };

  const setEscopoFiltro = <T,>(setter: (v: T) => void, val: T) => { setter(val); };

  const tabParam = params.get("aba") === "historico" ? "historico" : params.get("aba") === "conflitos" ? "conflitos" : "fila";
  const filtroAtivo = q || repFiltro !== "todos" || faixa !== "todos" || filtroKey !== "todas";
  const { conflitos } = useAtendimentoComercial();
  const conflitosPendentes = conflitos.filter(c => c.status === "pendente").length;

  return (
    <div className="nx-shell min-h-screen">
      <CockpitTopbar title="Aprovações · Análise comercial" showPeriod={false} showEscopo />
      <div className="px-4 md:px-6 py-4 space-y-4">
        <div>
          <p className="text-xs nx-muted">
            Fora da política · crédito · estoque · conflitos de lead. Fast-track passa direto e não aparece aqui.
          </p>
        </div>

        <Tabs value={tabParam} onValueChange={(v) => {
          const p = new URLSearchParams(params);
          if (v === "fila") p.delete("aba"); else p.set("aba", v);
          setParams(p, { replace: true });
        }}>
          <TabsList className="bg-white border border-[#E7E9EE] p-1 h-auto">
            <TabsTrigger value="fila" className="text-xs data-[state=active]:bg-[#2D3A8C] data-[state=active]:text-white">Fila</TabsTrigger>
            <TabsTrigger value="conflitos" className="text-xs data-[state=active]:bg-[#2D3A8C] data-[state=active]:text-white">
              Conflitos de lead{conflitosPendentes > 0 && ` (${conflitosPendentes})`}
            </TabsTrigger>
            <TabsTrigger value="historico" className="text-xs data-[state=active]:bg-[#2D3A8C] data-[state=active]:text-white">Histórico</TabsTrigger>
          </TabsList>


          <TabsContent value="fila" className="mt-4 space-y-3">
            {/* Barra de busca + filtros avançados */}
            <div className="nx-card p-3 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 min-w-[220px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por orçamento (orc-145), cliente ou representante..."
                    value={q} onChange={e => setQ(e.target.value)} className="pl-9 h-9 text-xs"
                  />
                  {q && (
                    <button onClick={() => setQ("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <Select value={repFiltro} onValueChange={(v) => setEscopoFiltro(setRepFiltro, v)}>
                  <SelectTrigger className="h-9 w-[220px] text-xs"><SelectValue placeholder="Representante" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os representantes ({aprovacoes.length})</SelectItem>
                    {Array.from(contagensRep.entries())
                      .sort((a, b) => b[1].total - a[1].total)
                      .map(([rid, info]) => (
                        <SelectItem key={rid} value={rid}>{info.nome} ({info.total})</SelectItem>
                      ))}
                  </SelectContent>
                </Select>

                <Select value={faixa} onValueChange={(v) => setEscopoFiltro(setFaixa, v as FaixaValor)}>
                  <SelectTrigger className="h-9 w-[160px] text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {faixasValor.map(f => <SelectItem key={f.key} value={f.key}>{f.label}</SelectItem>)}
                  </SelectContent>
                </Select>

                <Select value={ordem} onValueChange={(v) => setEscopoFiltro(setOrdem, v as Ordenacao)}>
                  <SelectTrigger className="h-9 w-[180px] text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="espera">Ordenar: Espera (padrão)</SelectItem>
                    <SelectItem value="valor">Ordenar: Maior valor</SelectItem>
                    <SelectItem value="rep">Ordenar: Representante A-Z</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-[11px] nx-muted">Agrupar por rep</span>
                  <Switch checked={agrupar} onCheckedChange={setAgrupar} />
                </div>
              </div>

              {/* Chips de motivo (contadores refletem busca+rep+faixa) */}
              <div className="flex flex-wrap gap-2 items-center">
                {filtroMotivos.map(f => (
                  <button key={f.key} onClick={() => setMotivo(f.key)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-medium border transition ${
                      filtroKey === f.key
                        ? "bg-[#2D3A8C] text-white border-[#2D3A8C]"
                        : "bg-white nx-text border-[#E7E9EE] hover:border-[#2D3A8C]"
                    }`}>
                    {f.label} ({contagensMotivo[f.key] ?? 0})
                  </button>
                ))}

                <div className="ml-auto flex items-center gap-3">
                  <span className="text-[11px] nx-muted">
                    Mostrando <span className="nx-text font-semibold">{agrupar ? filtradas.length : Math.min(visiveis, filtradas.length)}</span> de {aprovacoes.length}
                    {filtroAtivo && filtradas.length !== aprovacoes.length && ` · ${filtradas.length} no filtro`}
                  </span>
                  {filtroAtivo && (
                    <button
                      onClick={() => { setQ(""); setRepFiltro("todos"); setFaixa("todos"); setMotivo("todas"); }}
                      className="text-[11px] text-[#2D3A8C] hover:underline"
                    >
                      Limpar filtros
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Lista */}
            {filtradas.length === 0 ? (
              <div className="nx-card p-8 text-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm nx-muted">
                  {filtroAtivo ? "Nenhuma aprovação bate com os filtros atuais." : "Nenhuma aprovação pendente."}
                </p>
              </div>
            ) : agrupar ? (
              <div className="space-y-3">
                {grupos.map(([rid, grp]) => (
                  <Collapsible key={rid} defaultOpen>
                    <div className="nx-card">
                      <CollapsibleTrigger className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-[#F6F7F9] transition">
                        <div className="flex items-center gap-2">
                          <ChevronRight className="h-3.5 w-3.5 nx-muted transition-transform data-[state=open]:rotate-90" />
                          <span className="text-sm font-semibold nx-text">{grp.nome}</span>
                          <Badge variant="outline" className="text-[10px]">{grp.itens.length} pendências</Badge>
                        </div>
                        <span className="text-xs nx-muted">Subtotal <span className="nx-text font-semibold nx-num">{fmtBRL(grp.total)}</span></span>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="p-2 pt-0 space-y-2 border-t border-[#F1F3F8]">
                          {grp.itens.map(a => (
                            <AprovacaoCard key={a.id} item={a} onDecidir={abrirDecisao} removing={removendo.has(a.id)} />
                          ))}
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                ))}
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-2">
                  {paginadas.map(a => (
                    <AprovacaoCard key={a.id} item={a} onDecidir={abrirDecisao} removing={removendo.has(a.id)} />
                  ))}
                </div>
                {visiveis < filtradas.length && (
                  <div ref={sentinelRef} className="text-center py-4 text-[11px] nx-muted">
                    Carregando mais... <button onClick={() => setVisiveis(v => Math.min(v + PAGE_SIZE, filtradas.length))} className="text-[#2D3A8C] hover:underline ml-2">ver mais</button>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="conflitos" className="mt-4"><ConflitosTab /></TabsContent>
          <TabsContent value="historico" className="mt-4"><HistoricoTab /></TabsContent>

        </Tabs>

        <DecisaoModal
          item={modal.item} decisao={modal.decisao} open={modal.open}
          onOpenChange={(b) => setModal(m => ({ ...m, open: b }))}
          onDecidido={onDecidido}
        />

        <AlertDialog open={!!confirmacao} onOpenChange={(b) => !b && setConfirmacao(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Aprovar {fmtBRL(confirmacao?.item?.valor ?? 0)} fora da política?</AlertDialogTitle>
              <AlertDialogDescription>
                Valor acima de R$ 20 mil exige confirmação. A decisão vai para o log de auditoria e cria ação para o rep.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={() => {
                if (confirmacao) setModal({ item: confirmacao.item, decisao: confirmacao.decisao, open: true });
                setConfirmacao(null);
              }}>Confirmar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
