// Tela Aprovações · Análise comercial (submenu do gestor).
// Fila (fora_da_politica · credito · estoque) + Histórico auditável.
// Ordenada por espera DESC. Aprovação fora_da_politica > R$ 20k pede confirmação.
import { useMemo, useState } from "react";
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
  CheckCircle2, RotateCcw, XCircle, Bell, FileText, Search,
} from "lucide-react";
import { toast } from "sonner";
import { useTarefas } from "@/contexts/TarefasContext";
import type { MotivoAprovacao } from "@/cockpit/data/seed";

const gestorId = "gestor-atual";

type DecisaoTipo = "aprovado" | "reprovado" | "devolvido" | "solicitar_docs" | "cancelado";

const filtroMotivos: { key: "todas" | MotivoAprovacao; label: string }[] = [
  { key: "todas", label: "Todas" },
  { key: "fora_da_politica", label: "Fora da política" },
  { key: "credito_cliente_novo", label: "Crédito" },
  { key: "aguardando_estoque", label: "Estoque" },
];

function formatBRDate(d: Date): string {
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}
function addDays(d: Date, n: number) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }

function AprovacaoCard({ item, onDecidir }: { item: AprovacaoItem; onDecidir: (a: AprovacaoItem, d: DecisaoTipo) => void }) {
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
    <div className={`nx-card px-3 py-2.5 ${borda}`}>
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


function DecisaoModal({ item, decisao, open, onOpenChange }: {
  item: AprovacaoItem | null; decisao: DecisaoTipo; open: boolean; onOpenChange: (b: boolean) => void;
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
    reprovado: "Motivo da reprovação (obrigatório)",
    devolvido: 'Ajuste solicitado (ex: "Reduzir desconto para 30% ou atingir mínimo")',
    solicitar_docs: "Quais documentos são necessários",
    cancelado: "Motivo do cancelamento",
  };
  const obrigatorio = decisao === "reprovado" || decisao === "devolvido";

  const handleConfirm = () => {
    if (!item) return;
    if (obrigatorio && !nota.trim()) { toast.error("Nota obrigatória para esta decisão"); return; }
    registrarAprovacao({ orcamentoId: item.id, motivo: item.motivo, decisao, gestorId, nota: nota.trim() || undefined });
    if (decisao === "devolvido") {
      addTarefa({
        titulo: `Ajustar orçamento ${item.id}`, descricao: `Gestor devolveu: ${nota.trim()}`,
        tipo: "outros", clienteId: item.contaId, clienteNome: item.clienteNome,
        prioridade: "alta", vencimento: formatBRDate(addDays(new Date(), 2)),
        responsavel: item.repNome, status: "pendente", origem: "sistema", recorrencia: "nenhuma",
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

export default function GestorAprovacoes() {
  const [params, setParams] = useSearchParams();
  const { seed, escopo } = useCockpit();

  const aprovacoes = useMemo(() => filaAprovacoes(seed, escopo)
    .slice().sort((a, b) => b.abertoDias - a.abertoDias), [seed, escopo]);

  const contagens = useMemo(() => {
    const c: Record<string, number> = { todas: aprovacoes.length };
    for (const m of ["fora_da_politica", "credito_cliente_novo", "aguardando_estoque"] as MotivoAprovacao[]) {
      c[m] = aprovacoes.filter(a => a.motivo === m).length;
    }
    return c;
  }, [aprovacoes]);

  const filtroKey = (params.get("motivo") as "todas" | MotivoAprovacao) ?? "todas";
  const filtradas = filtroKey === "todas" ? aprovacoes : aprovacoes.filter(a => a.motivo === filtroKey);

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

  const setMotivo = (k: string) => {
    const p = new URLSearchParams(params);
    if (k === "todas") p.delete("motivo"); else p.set("motivo", k);
    setParams(p, { replace: true });
  };

  const tabParam = params.get("aba") === "historico" ? "historico" : "fila";

  return (
    <div className="nx-shell min-h-screen">
      <CockpitTopbar title="Aprovações · Análise comercial" showPeriod={false} showEscopo />
      <div className="px-4 md:px-6 py-4 space-y-4">
        <div>
          <p className="text-xs nx-muted">
            Fora da política · crédito · estoque. Fast-track passa direto e não aparece aqui.
          </p>
        </div>

        <Tabs value={tabParam} onValueChange={(v) => {
          const p = new URLSearchParams(params);
          if (v === "historico") p.set("aba", "historico"); else p.delete("aba");
          setParams(p, { replace: true });
        }}>
          <TabsList className="bg-white border border-[#E7E9EE] p-1 h-auto">
            <TabsTrigger value="fila" className="text-xs data-[state=active]:bg-[#2D3A8C] data-[state=active]:text-white">Fila</TabsTrigger>
            <TabsTrigger value="historico" className="text-xs data-[state=active]:bg-[#2D3A8C] data-[state=active]:text-white">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="fila" className="mt-4 space-y-4">
            <div className="flex flex-wrap gap-2">
              {filtroMotivos.map(f => (
                <button key={f.key} onClick={() => setMotivo(f.key)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-medium border transition ${
                    filtroKey === f.key
                      ? "bg-[#2D3A8C] text-white border-[#2D3A8C]"
                      : "bg-white nx-text border-[#E7E9EE] hover:border-[#2D3A8C]"
                  }`}>
                  {f.label} ({contagens[f.key] ?? 0})
                </button>
              ))}
            </div>

            {filtradas.length === 0 ? (
              <div className="nx-card p-8 text-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm nx-muted">Nenhuma aprovação pendente neste filtro.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {filtradas.map(a => (
                  <AprovacaoCard key={a.id} item={a} onDecidir={abrirDecisao} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="historico" className="mt-4"><HistoricoTab /></TabsContent>
        </Tabs>

        <DecisaoModal item={modal.item} decisao={modal.decisao} open={modal.open} onOpenChange={(b) => setModal(m => ({ ...m, open: b }))} />

        <AlertDialog open={!!confirmacao} onOpenChange={(b) => !b && setConfirmacao(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Aprovar {fmtBRL(confirmacao?.item?.valor ?? 0)} fora da política?</AlertDialogTitle>
              <AlertDialogDescription>
                Valor acima de R$ 20 mil exige confirmação. A decisão vai para o log de auditoria.
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
