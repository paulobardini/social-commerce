import { useMemo, useState } from "react";
import { useCockpit } from "../../contexts/CockpitContext";
import { repsNoEscopo } from "../../lib/escopo";
import { nivelDesvio, desvioClasse, type DesvioNivel } from "../../lib/desvio";
import { classificarTudo } from "../../lib/classificar";
import { fmtBRL, fmtBRLc, fmtPct, fmtNum, NX } from "../../styles/tokens";
import { SectionCard } from "../SectionCard";
import { KpiCard } from "../KpiCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { ArrowDown, ArrowUp, Minus, MessageCircle, PlusCircle, Users, Target, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { useTarefas } from "@/contexts/TarefasContext";
import { usePlanos } from "@/contexts/PlanosContext";
import type { Representante } from "../../data/seed";

// ------------------------------------------------------------------
// TABELA DE REPS (por DESVIO)
// ------------------------------------------------------------------
interface RepRow {
  rep: Representante;
  paceNivel: DesvioNivel;
  coberturaNivel: DesvioNivel;
  emRisco: number;
  emRiscoNivel: DesvioNivel;
  pipeline: number;
  pipelineNivel: DesvioNivel;
  positivacao: number;
  positivacaoNivel: DesvioNivel;
}

function Cell({ nivel, children }: { nivel: DesvioNivel; children: React.ReactNode }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded border text-[11px] nx-num font-medium ${desvioClasse[nivel]}`}>
      {children}
    </span>
  );
}

// ------------------------------------------------------------------
// DRAWER — mini-painel do rep
// ------------------------------------------------------------------
function RepDrawer({ rep, open, onOpenChange }: { rep: Representante | null; open: boolean; onOpenChange: (b: boolean) => void }) {
  const { seed, range, previousRange, diasAtivo, diasPerdido, metasPublicadas } = useCockpit();
  const { tarefas, addTarefa } = useTarefas();
  const { getPlanosDoRep } = usePlanos();

  const dados = useMemo(() => {
    if (!rep) return null;
    const classificadas = classificarTudo(
      seed.contas.filter(c => c.repId === rep.id),
      seed.pedidos.filter(p => p.repId === rep.id),
      range, diasAtivo, diasPerdido, seed.hoje,
    );
    const opsAbertas = seed.oportunidades.filter(o => o.repId === rep.id && ["novo_lead","em_negociacao","proposta_enviada","orcamento_aprovado"].includes(o.etapa));
    const pipeline = opsAbertas.reduce((s, o) => s + o.valor, 0);
    const inicioMes = new Date(seed.hoje.getFullYear(), seed.hoje.getMonth(), 1);
    const realizado = seed.pedidos.filter(p => p.repId === rep.id && p.data >= inicioMes).reduce((s, p) => s + p.valor, 0);
    const mesKey = `${seed.hoje.getFullYear()}-${String(seed.hoje.getMonth() + 1).padStart(2, "0")}`;
    const metaPublicada = metasPublicadas[`${rep.id}:${mesKey}`];
    const metaLegada = seed.metas.find(m => m.repId === rep.id && m.tipo === "faturamento" && m.mes === mesKey)?.valor ?? 0;
    const meta = metaPublicada ?? metaLegada;
    return { classificadas, opsAbertas, pipeline, realizado, meta };
  }, [rep, seed, range, diasAtivo, diasPerdido, metasPublicadas]);

  if (!rep) return null;

  const acoesAtrasadas = tarefas.filter(t => t.responsavel === rep.nome && t.status === "pendente").length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-heading">{rep.nome}</SheetTitle>
          <p className="text-xs nx-muted">{rep.regiao} · {rep.email}</p>
        </SheetHeader>

        {dados && (
          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <KpiCard label="Meta do mês" value={fmtBRLc(dados.meta)} />
              <KpiCard label="Realizado" value={fmtBRLc(dados.realizado)} hint={dados.meta > 0 ? `${fmtPct((dados.realizado / dados.meta) * 100, 0)} atingido` : "—"} />
              <KpiCard label="Pace" value={`${rep.pace}%`} tooltip="Ritmo do rep: no fim do mês, ele bate 100% da meta se seguir no ritmo atual." />
              <KpiCard label="Cobertura" value={`${rep.cobertura}%`} hint={`${rep.coberturaDelta >= 0 ? "+" : ""}${rep.coberturaDelta}pp vs mês ant.`} tooltip="% da carteira dele que recebeu atendimento no mês." />
              <KpiCard label="Em negociação" value={fmtBRLc(dados.pipeline)} tooltip="Valor das propostas em aberto (ainda sem pedido nem perda)." />
              <KpiCard label="Ações pendentes" value={fmtNum(acoesAtrasadas)} hint="fila do vendedor" />
            </div>

            <SectionCard title="Distribuição da carteira" >
              <div className="grid grid-cols-4 gap-2 text-center">
                {(["ativo","inativo","perdido","lead"] as const).map(s => (
                  <div key={s} className="p-2 rounded bg-[#F6F7F9]">
                    <p className="text-[10px] uppercase nx-muted">{s}</p>
                    <p className="text-lg font-semibold nx-num">{dados.classificadas.filter(c => c.status === s).length}</p>
                  </div>
                ))}
              </div>
            </SectionCard>

            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" className="flex-1 min-w-[140px]"
                onClick={() => window.open("https://wa.me/", "_blank")}>
                <MessageCircle className="h-3.5 w-3.5 mr-1" /> WhatsApp
              </Button>
              <Button size="sm" variant="outline" className="flex-1 min-w-[140px]"
                onClick={() => {
                  addTarefa({
                    titulo: "Tarefa do gestor", descricao: "", tipo: "outros",
                    prioridade: "media", vencimento: formatBRDate(new Date()),
                    responsavel: rep.nome, status: "pendente", origem: "sistema",
                    recorrencia: "nenhuma",
                  });
                  toast.success(`Tarefa criada para ${rep.nome}`);
                }}>
                <PlusCircle className="h-3.5 w-3.5 mr-1" /> Criar tarefa
              </Button>
              <Button size="sm" variant="outline" className="flex-1 min-w-[140px]"
                onClick={() => toast.info("Fluxo de redistribuição — em breve")}>
                <Users className="h-3.5 w-3.5 mr-1" /> Redistribuir
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function formatBRDate(d: Date): string {
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

// ------------------------------------------------------------------
// METAS WIZARD
// ------------------------------------------------------------------
function MetasWizardModal({ open, onOpenChange }: { open: boolean; onOpenChange: (b: boolean) => void }) {
  const { seed, escopo, publicarMetas, metasPublicadas } = useCockpit();
  const reps = useMemo(() => repsNoEscopo(seed, escopo), [seed, escopo]);
  const mesKey = `${seed.hoje.getFullYear()}-${String(seed.hoje.getMonth() + 1).padStart(2, "0")}`;
  const mudancaMesCorrente = true;

  const [metaAgregada, setMetaAgregada] = useState<string>("0");
  const [rateio, setRateio] = useState<Record<string, string>>({});
  const [confirmando, setConfirmando] = useState(false);

  // Inicializa rateio proporcional ao histórico quando abrir
  useMemo(() => {
    if (!open) return;
    const total = Number(metaAgregada) || 0;
    if (total <= 0) return;
    const somaHist = reps.reduce((s, r) => s + r.historicoMedio12m, 0) || 1;
    const patch: Record<string, string> = {};
    reps.forEach(r => {
      patch[r.id] = String(Math.round((r.historicoMedio12m / somaHist) * total));
    });
    setRateio(patch);
  }, [metaAgregada, open, reps]);

  const somaRateio = reps.reduce((s, r) => s + (Number(rateio[r.id]) || 0), 0);
  const totalMeta = Number(metaAgregada) || 0;
  const diff = somaRateio - totalMeta;

  const handlePublicar = () => {
    if (totalMeta <= 0) { toast.error("Defina a meta agregada"); return; }
    if (diff !== 0 && !confirmando) {
      setConfirmando(true);
      return;
    }
    publicarMetas({
      mes: mesKey,
      escopoAlvo: escopo,
      metaAgregada: totalMeta,
      reps: reps.map(r => ({ repId: r.id, valor: Number(rateio[r.id]) || 0 })),
      mudancaMesCorrente,
      gestorId: "gestor-atual",
    });
    toast.success(`Metas publicadas — reps notificados no mesmo instante`);
    setConfirmando(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(b) => { onOpenChange(b); if (!b) setConfirmando(false); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-3 shrink-0 border-b">
          <DialogTitle>Gestão de metas · {escopo === "nacional" ? "Nacional" : escopo}</DialogTitle>
          <DialogDescription>
            Meta agregada → rateio por rep (proporcional ao histórico, editável).
            {mudancaMesCorrente && <span className="ml-1 text-amber-700">Alteração no mês corrente será registrada em log.</span>}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          <div>
            <label className="text-xs font-medium nx-text">Meta agregada do mês (R$)</label>
            <Input
              type="number"
              className="mt-1 max-w-xs"
              value={metaAgregada}
              onChange={e => setMetaAgregada(e.target.value)}
              placeholder="Ex: 800000"
            />
          </div>

          <div className="border border-[#E7E9EE] rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-[#F6F7F9]">
                <tr className="text-[10px] uppercase nx-muted">
                  <th className="text-left px-3 py-2">Representante</th>
                  <th className="text-right">Histórico 12m</th>
                  <th className="text-right">Meta sugerida</th>
                  <th className="text-right px-3">Editar</th>
                </tr>
              </thead>
              <tbody>
                {reps.map(r => (
                  <tr key={r.id} className="border-t border-[#F1F3F8]">
                    <td className="px-3 py-2 nx-text font-medium">{r.nome}</td>
                    <td className="text-right nx-num nx-muted">{fmtBRLc(r.historicoMedio12m)}/mês</td>
                    <td className="text-right nx-num nx-muted">
                      {fmtBRLc(Number(rateio[r.id]) || 0)}
                    </td>
                    <td className="text-right px-3">
                      <Input
                        type="number"
                        className="h-8 w-32 text-right nx-num text-xs"
                        value={rateio[r.id] ?? "0"}
                        onChange={e => setRateio(prev => ({ ...prev, [r.id]: e.target.value }))}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={`p-3 rounded-lg text-xs border ${diff === 0 ? "bg-emerald-50 border-emerald-200 text-emerald-800" : diff > 0 ? "bg-amber-50 border-amber-200 text-amber-800" : "bg-rose-50 border-rose-200 text-rose-800"}`}>
            <div className="flex justify-between items-center">
              <span>Rateado: <strong className="nx-num">{fmtBRL(somaRateio)}</strong> de <strong className="nx-num">{fmtBRL(totalMeta)}</strong></span>
              {diff === 0
                ? <span>Soma OK ✓</span>
                : diff > 0
                  ? <span>Sobram <strong className="nx-num">{fmtBRL(diff)}</strong></span>
                  : <span>Faltam <strong className="nx-num">{fmtBRL(-diff)}</strong></span>
              }
            </div>
            {confirmando && diff !== 0 && (
              <p className="mt-2 text-[11px]">Confirme para publicar com soma diferente da meta agregada.</p>
            )}
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t shrink-0 bg-background">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handlePublicar}>
            {confirmando && diff !== 0 ? `Confirmar (${fmtBRLc(diff)} de diferença)` : "Publicar metas"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ------------------------------------------------------------------
// TAB
// ------------------------------------------------------------------
export function TimeMetasTab() {
  const { seed, escopo, range, diasAtivo, diasPerdido, metasPublicadas } = useCockpit();

  const reps = useMemo(() => repsNoEscopo(seed, escopo), [seed, escopo]);
  const mesKey = `${seed.hoje.getFullYear()}-${String(seed.hoje.getMonth() + 1).padStart(2, "0")}`;

  const classificadas = useMemo(
    () => classificarTudo(seed.contas, seed.pedidos, range, diasAtivo, diasPerdido, seed.hoje),
    [seed, range, diasAtivo, diasPerdido],
  );

  const rows: RepRow[] = useMemo(() => {
    const paceMedio = reps.reduce((s, r) => s + r.pace, 0) / Math.max(reps.length, 1);
    const cobMedia = reps.reduce((s, r) => s + r.cobertura, 0) / Math.max(reps.length, 1);
    const emRiscoByRep = reps.map(r => classificadas.filter(c => c.conta.repId === r.id && c.status === "inativo").length);
    const emRiscoMedia = emRiscoByRep.reduce((s, x) => s + x, 0) / Math.max(reps.length, 1);
    const pipelineByRep = reps.map(r => seed.oportunidades.filter(o => o.repId === r.id && ["novo_lead","em_negociacao","proposta_enviada","orcamento_aprovado"].includes(o.etapa)).reduce((s, o) => s + o.valor, 0));
    const pipelineMedia = pipelineByRep.reduce((s, x) => s + x, 0) / Math.max(reps.length, 1);
    const positByRep = reps.map(r => classificadas.filter(c => c.conta.repId === r.id && c.positivadoNoPeriodo).length);
    const positMedia = positByRep.reduce((s, x) => s + x, 0) / Math.max(reps.length, 1);

    return reps.map((r, i) => ({
      rep: r,
      paceNivel: nivelDesvio(r.pace, { target: 100 }),                     // alvo: 100%
      coberturaNivel: nivelDesvio(r.cobertura, { target: 80 }),            // alvo: 80%
      emRisco: emRiscoByRep[i],
      emRiscoNivel: nivelDesvio(emRiscoByRep[i], { media: emRiscoMedia, invert: true }),
      pipeline: pipelineByRep[i],
      pipelineNivel: nivelDesvio(pipelineByRep[i], { media: pipelineMedia }),
      positivacao: positByRep[i],
      positivacaoNivel: nivelDesvio(positByRep[i], { media: positMedia }),
    })).sort((a, b) => a.rep.pace - b.rep.pace);
  }, [reps, classificadas, seed]);

  // Rankings
  const rankingAting = useMemo(() => {
    return reps.map(r => {
      const meta = metasPublicadas[`${r.id}:${mesKey}`]
        ?? seed.metas.find(m => m.repId === r.id && m.tipo === "faturamento" && m.mes === mesKey)?.valor
        ?? 1;
      const inicioMes = new Date(seed.hoje.getFullYear(), seed.hoje.getMonth(), 1);
      const real = seed.pedidos.filter(p => p.repId === r.id && p.data >= inicioMes).reduce((s, p) => s + p.valor, 0);
      return { rep: r, meta, real, pct: (real / meta) * 100 };
    }).sort((a, b) => b.pct - a.pct);
  }, [reps, seed, metasPublicadas, mesKey]);

  const rankingEvol = useMemo(() => {
    const inicioAtual = new Date(seed.hoje.getFullYear(), seed.hoje.getMonth(), 1);
    const inicioAnterior = new Date(seed.hoje.getFullYear(), seed.hoje.getMonth() - 1, 1);
    const fimAnterior = new Date(seed.hoje.getFullYear(), seed.hoje.getMonth(), 0);
    return reps.map(r => {
      const at = seed.pedidos.filter(p => p.repId === r.id && p.data >= inicioAtual).reduce((s, p) => s + p.valor, 0);
      const an = seed.pedidos.filter(p => p.repId === r.id && p.data >= inicioAnterior && p.data <= fimAnterior).reduce((s, p) => s + p.valor, 0);
      return { rep: r, delta: an > 0 ? ((at - an) / an) * 100 : 0, atual: at };
    }).sort((a, b) => b.delta - a.delta);
  }, [reps, seed]);

  const [drawerRep, setDrawerRep] = useState<Representante | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-sm font-semibold nx-text">Time · {reps.length} representantes</h2>
          <p className="text-[11px] nx-muted">Colorido por desvio vs. alvo (pace/cobertura) ou média (pipeline/positivação).</p>
        </div>
        <Button onClick={() => setWizardOpen(true)} className="bg-[#2D3A8C] hover:bg-[#243078]">
          <Target className="h-4 w-4 mr-1.5" /> Gestão de metas
        </Button>
      </div>

      <SectionCard title="Tabela por desvio" subtitle="Ordenado do pior pace primeiro">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-[10px] uppercase nx-muted border-b border-[#E7E9EE]">
              <tr>
                <th className="text-left py-2 pl-2">Representante</th>
                <th className="text-right">Pace</th>
                <th className="text-right">Cobertura</th>
                <th className="text-right">Em risco</th>
                <th className="text-right">Em negociação</th>
                <th className="text-right">Positivação</th>
                <th className="text-right pr-2">Detalhes</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.rep.id} className="border-b border-[#F1F3F8]">
                  <td className="py-2 pl-2 nx-text font-medium">
                    <button onClick={() => setDrawerRep(row.rep)} className="hover:underline text-left">{row.rep.nome}</button>
                    <div className="text-[10px] nx-muted">{row.rep.regiao}</div>
                  </td>
                  <td className="text-right"><Cell nivel={row.paceNivel}>{row.rep.pace}%</Cell></td>
                  <td className="text-right"><Cell nivel={row.coberturaNivel}>{row.rep.cobertura}%</Cell></td>
                  <td className="text-right"><Cell nivel={row.emRiscoNivel}>{row.emRisco}</Cell></td>
                  <td className="text-right"><Cell nivel={row.pipelineNivel}>{fmtBRLc(row.pipeline)}</Cell></td>
                  <td className="text-right"><Cell nivel={row.positivacaoNivel}>{row.positivacao}</Cell></td>
                  <td className="text-right pr-2">
                    <Button size="sm" variant="ghost" className="h-6 text-[10px] text-[#2D3A8C]" onClick={() => setDrawerRep(row.rep)}>
                      Abrir
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Ranking · Atingimento de meta">
          <div className="space-y-1.5">
            {rankingAting.map((r, i) => (
              <div key={r.rep.id} className="flex items-center gap-2 p-2 rounded hover:bg-[#F6F7F9]">
                <span className="text-[10px] nx-muted w-4">{i + 1}.</span>
                <span className="text-xs nx-text font-medium flex-1">{r.rep.nome}</span>
                <span className="text-[11px] nx-num nx-muted">{fmtBRLc(r.real)} / {fmtBRLc(r.meta)}</span>
                <Badge className={r.pct >= 100 ? "bg-emerald-100 text-emerald-700" : r.pct >= 80 ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"}>
                  {fmtPct(r.pct, 0)}
                </Badge>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Ranking · Evolução (vs mês anterior)">
          <div className="space-y-1.5">
            {rankingEvol.map((r, i) => (
              <div key={r.rep.id} className="flex items-center gap-2 p-2 rounded hover:bg-[#F6F7F9]">
                <span className="text-[10px] nx-muted w-4">{i + 1}.</span>
                <span className="text-xs nx-text font-medium flex-1">{r.rep.nome}</span>
                <span className="text-[11px] nx-num nx-muted">{fmtBRLc(r.atual)}</span>
                <span className={`text-[11px] font-medium flex items-center gap-0.5 ${r.delta > 0 ? "text-emerald-600" : r.delta < 0 ? "text-rose-600" : "nx-muted"}`}>
                  {r.delta > 0 ? <ArrowUp className="h-3 w-3" /> : r.delta < 0 ? <ArrowDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                  {fmtPct(Math.abs(r.delta), 0)}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <RepDrawer rep={drawerRep} open={!!drawerRep} onOpenChange={(b) => !b && setDrawerRep(null)} />
      <MetasWizardModal open={wizardOpen} onOpenChange={setWizardOpen} />
    </div>
  );
}
