// MetasWizard · gestão multidimensional de metas em 3 passos guiados.
// Rateio automático ao digitar a meta geral, com trava por linha,
// modos de distribuição, auto-save de rascunho e publicação com resumo.
import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Copy, PlusCircle, Trash2, ChevronDown, Layers, Target, Lock, Unlock,
  RotateCcw, Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useCockpit } from "@/cockpit/contexts/CockpitContext";
import { repsNoEscopo } from "@/cockpit/lib/escopo";
import { fmtBRL, fmtBRLc } from "@/cockpit/styles/tokens";
import {
  mesKey, mesLabel, periodoEhCorrente, periodosPlanejamento, mesLabelCurto,
  marcasCatalogo, colecoesCatalogo, nichosCatalogo, rateioProporcional,
  type DimensaoMeta, type MetaV2, type MetaSecundarias,
} from "@/cockpit/data/metasV2";
import { pesosPorRep12m, historico12m } from "@/cockpit/lib/metasCalc";
import { DuplicarMesModal } from "./DuplicarMesModal";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const dimensaoLabel: Record<DimensaoMeta, string> = {
  geral: "Meta geral", marca: "Marca", colecao: "Coleção", nicho: "Nicho",
};
const dimensaoBadge: Record<DimensaoMeta, string> = {
  geral: "bg-[#2D3A8C] text-white border-[#2D3A8C]",
  marca: "bg-sky-100 text-sky-800 border-sky-300",
  colecao: "bg-violet-100 text-violet-800 border-violet-300",
  nicho: "bg-amber-100 text-amber-800 border-amber-300",
};

interface Props {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  periodoInicial?: string;
}

export function MetasWizard({ open, onOpenChange, periodoInicial }: Props) {
  const { seed, escopo, metasV2, salvarMeta, publicarMetaV2, removerMetaV2 } = useCockpit();
  const reps = useMemo(() => repsNoEscopo(seed, escopo), [seed, escopo]);
  const mesCorrente = mesKey(seed.hoje);
  const [periodo, setPeriodo] = useState<string>(periodoInicial ?? mesCorrente);
  const [duplicarOpen, setDuplicarOpen] = useState(false);
  const [confirmPublicar, setConfirmPublicar] = useState(false);

  useEffect(() => { if (open && periodoInicial) setPeriodo(periodoInicial); }, [open, periodoInicial]);

  const periodos = useMemo(() => periodosPlanejamento(seed.hoje), [seed.hoje]);
  const metasDoMes = metasV2.filter(m => m.periodo === periodo && m.escopo === escopo);
  const metaGeral = metasDoMes.find(m => m.dimensao === "geral");
  const dimensionais = metasDoMes.filter(m => m.dimensao !== "geral");
  const ehCorrente = periodoEhCorrente(periodo, seed.hoje);

  // mês anterior (para "manter %" e para o start-choice)
  const periodoAnterior = useMemo(() => {
    const [y, m] = periodo.split("-").map(Number);
    const d = new Date(y, m - 2, 1);
    return mesKey(d);
  }, [periodo]);
  const metaAnterior = metasV2.find(m => m.periodo === periodoAnterior && m.escopo === escopo && m.dimensao === "geral");

  const rascunhos = metasDoMes.filter(m => m.status === "rascunho");
  const publicadas = metasDoMes.filter(m => m.status === "publicada");

  const publicarMes = () => {
    if (!rascunhos.length) { toast.info("Nada em rascunho neste mês."); return; }
    rascunhos.forEach(m => publicarMetaV2(m.id, "gestor-atual"));
    toast.success(`${rascunhos.length} meta(s) publicada(s) · representantes notificados`);
    setConfirmPublicar(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[92vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-5 pb-3 shrink-0 border-b">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex-1 min-w-0">
              <DialogTitle className="flex items-center gap-2 flex-wrap">
                <span>Gestão de metas ·</span>
                <Select value={periodo} onValueChange={setPeriodo}>
                  <SelectTrigger className="h-8 w-[180px] text-sm font-medium"><SelectValue /></SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {periodos.map(p => (
                      <SelectItem key={p} value={p} className="text-sm">
                        {mesLabel(p)}{p === mesCorrente ? " (corrente)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {ehCorrente && <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-300">mês corrente</Badge>}
              </DialogTitle>
              <DialogDescription className="mt-1 text-xs">
                Rateio automático proporcional ao histórico. Edite linhas para travar; auto-save de rascunho.
              </DialogDescription>
            </div>
            <Button size="sm" variant="outline" onClick={() => setDuplicarOpen(true)} disabled={!metasDoMes.length}>
              <Copy className="h-3.5 w-3.5 mr-1" /> Duplicar para meses
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          <MetaGeralEditor
            key={`geral-${periodo}`}
            periodo={periodo}
            escopo={escopo}
            meta={metaGeral}
            metaAnterior={metaAnterior}
            reps={reps}
            gestorId="gestor-atual"
            onSalvar={salvarMeta}
          />

          <div className="nx-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2D3A8C] text-white text-[11px] font-bold">3</span>
              <Layers className="h-4 w-4 text-[#2D3A8C]" />
              <h3 className="text-sm font-semibold nx-text">Metas por dimensão</h3>
              <Badge variant="outline" className="text-[10px]">{dimensionais.length}</Badge>
              <div className="ml-auto">
                <NovaMetaDimensional
                  periodo={periodo}
                  escopo={escopo}
                  reps={reps}
                  gestorId="gestor-atual"
                  onSalvar={salvarMeta}
                />
              </div>
            </div>
            {dimensionais.length === 0 ? (
              <div className="text-center py-4 border border-dashed border-[#E7E9EE] rounded-lg bg-[#FAFBFD]">
                <p className="text-xs nx-muted">Nenhuma meta dimensional criada.</p>
                <p className="text-[11px] nx-muted mt-1">
                  Exemplo: <em>"Marca · Brandili · R$ 120k"</em> ou <em>"Coleção · Inverno 26 · R$ 80k"</em>.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {dimensionais.map(m => (
                  <MetaDimensionalItem
                    key={m.id}
                    meta={m}
                    reps={reps}
                    gestorId="gestor-atual"
                    onSalvar={salvarMeta}
                    onPublicar={publicarMetaV2}
                    onRemover={removerMetaV2}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="px-6 py-3 border-t shrink-0 bg-background flex-wrap gap-2 items-center">
          <div className="text-[11px] nx-muted mr-auto">
            {rascunhos.length > 0 && (
              <span className="text-amber-700 font-medium">{rascunhos.length} rascunho(s)</span>
            )}
            {rascunhos.length > 0 && publicadas.length > 0 && " · "}
            {publicadas.length > 0 && (
              <span className="text-emerald-700 font-medium">{publicadas.length} publicada(s)</span>
            )}
            {!metasDoMes.length && "Sem metas neste mês"}
          </div>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
          <Button onClick={() => setConfirmPublicar(true)} disabled={!rascunhos.length}>
            Publicar mês
          </Button>
        </DialogFooter>

        <DuplicarMesModal open={duplicarOpen} onOpenChange={setDuplicarOpen} origem={periodo} />

        <AlertDialog open={confirmPublicar} onOpenChange={setConfirmPublicar}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Publicar {mesLabel(periodo)}</AlertDialogTitle>
              <AlertDialogDescription>
                Publicar {mesLabel(periodo)}: meta geral{" "}
                <strong>{fmtBRLc(rascunhos.find(m => m.dimensao === "geral")?.valorAgregado ?? metaGeral?.valorAgregado ?? 0)}</strong>
                {" "}rateada entre {reps.length} reps
                {dimensionais.filter(m => m.status === "rascunho").length > 0 && (
                  <> + <strong>{dimensionais.filter(m => m.status === "rascunho").length}</strong> meta(s) dimensional(is)</>
                )}
                . Os representantes serão notificados.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={publicarMes}>Publicar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// META GERAL — passo 1 (rateio auto) + passo 2 (secundárias)
// ============================================================================
type DistribMode = "hist12m" | "carteira" | "igual" | "mantePct";

function roundTo500(n: number): number {
  return Math.round(n / 500) * 500;
}

/**
 * Distribui `total` proporcionalmente aos pesos, respeitando linhas travadas
 * (mantém seu valor). Arredonda para múltiplos de R$500 e ajusta a diferença
 * na maior linha destravada.
 */
function distribuirComTravas(
  total: number,
  repIds: string[],
  pesos: Map<string, number>,
  travas: Record<string, boolean>,
  travados: Record<string, number>,
): Record<string, number> {
  const out: Record<string, number> = {};
  let somaTravados = 0;
  const destravados: string[] = [];
  for (const id of repIds) {
    if (travas[id]) {
      out[id] = travados[id] ?? 0;
      somaTravados += out[id];
    } else {
      destravados.push(id);
    }
  }
  const restante = Math.max(0, total - somaTravados);
  if (!destravados.length) return out;

  const somaPesos = destravados.reduce((s, id) => s + (pesos.get(id) ?? 0), 0);
  const parts: { id: string; raw: number }[] = destravados.map(id => ({
    id,
    raw: somaPesos > 0 ? (pesos.get(id) ?? 0) / somaPesos * restante : restante / destravados.length,
  }));
  parts.forEach(p => { out[p.id] = roundTo500(p.raw); });
  const somaCalc = parts.reduce((s, p) => s + out[p.id], 0);
  const diff = restante - somaCalc;
  if (diff !== 0 && parts.length) {
    const maior = parts.reduce((a, b) => (a.raw >= b.raw ? a : b));
    out[maior.id] = Math.max(0, out[maior.id] + diff);
  }
  return out;
}

function MetaGeralEditor({ periodo, escopo, meta, metaAnterior, reps, gestorId, onSalvar }: {
  periodo: string; escopo: string; meta?: MetaV2; metaAnterior?: MetaV2;
  reps: ReturnType<typeof repsNoEscopo>;
  gestorId: string;
  onSalvar: ReturnType<typeof useCockpit>["salvarMeta"];
}) {
  const { seed } = useCockpit();
  const sugestaoMedia = useMemo(
    () => reps.reduce((s, r) => s + r.historicoMedio12m, 0),
    [reps],
  );
  const anterior = metaAnterior?.valorAgregado ?? 0;

  // agregado — se existe meta, começa com ela; se não, vazio (mostra placeholder de sugestão)
  const [agregado, setAgregado] = useState<number>(meta?.valorAgregado ?? 0);
  const [modo, setModo] = useState<DistribMode>("hist12m");
  const [travas, setTravas] = useState<Record<string, boolean>>({});
  const [rateio, setRateio] = useState<Record<string, number>>(() => {
    const m: Record<string, number> = {};
    reps.forEach(r => { m[r.id] = meta?.rateio?.find(x => x.repId === r.id)?.valor ?? 0; });
    return m;
  });
  const [secundarias, setSecundarias] = useState<MetaSecundarias>(meta?.metasSecundarias ?? {});
  const [startChoice, setStartChoice] = useState<boolean>(!meta && !!metaAnterior);
  const [lastSaved, setLastSaved] = useState<string | null>(meta ? "carregado" : null);

  // ---------- Pesos por modo ----------
  const pesos = useMemo<Map<string, number>>(() => {
    if (modo === "igual") return new Map(reps.map(r => [r.id, 1]));
    if (modo === "carteira") {
      return new Map(reps.map(r => [
        r.id,
        seed.contas.filter(c => c.repId === r.id).length,
      ]));
    }
    if (modo === "mantePct" && metaAnterior?.rateio && anterior > 0) {
      return new Map(metaAnterior.rateio.map(r => [r.repId, r.valor / anterior]));
    }
    return new Map(reps.map(r => [r.id, r.historicoMedio12m]));
  }, [modo, reps, seed, metaAnterior, anterior]);

  // ---------- Recalcular rateio quando muda agregado, modo, ou pesos ----------
  const recalcular = useCallback((total: number, novasTravas?: Record<string, boolean>, novosTravados?: Record<string, number>) => {
    const t = novasTravas ?? travas;
    const v = novosTravados ?? rateio;
    setRateio(distribuirComTravas(total, reps.map(r => r.id), pesos, t, v));
  }, [pesos, reps, travas, rateio]);

  // recomputa ao alterar agregado ou modo (mantém travas atuais)
  useEffect(() => {
    if (agregado <= 0) return;
    setRateio(prev => distribuirComTravas(agregado, reps.map(r => r.id), pesos, travas, prev));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agregado, modo]);

  // ---------- Handlers ----------
  const editarLinha = (repId: string, valor: number) => {
    const novoTravado = { ...rateio, [repId]: valor };
    const novasTravas = { ...travas, [repId]: true };
    setTravas(novasTravas);
    setRateio(distribuirComTravas(agregado, reps.map(r => r.id), pesos, novasTravas, novoTravado));
  };

  const alternarTrava = (repId: string) => {
    const novas = { ...travas, [repId]: !travas[repId] };
    setTravas(novas);
    if (agregado > 0) setRateio(distribuirComTravas(agregado, reps.map(r => r.id), pesos, novas, rateio));
  };

  const redistribuirTudo = () => {
    setTravas({});
    if (agregado > 0) setRateio(distribuirComTravas(agregado, reps.map(r => r.id), pesos, {}, {}));
    toast.success("Rateio redistribuído entre todos os reps.");
  };

  const aplicarAtalho = (v: number) => {
    setAgregado(roundTo500(v));
    setStartChoice(false);
  };

  // ---------- Auto-save (debounced) ----------
  const timer = useRef<number | null>(null);
  useEffect(() => {
    if (agregado <= 0) return;
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      const now = new Date();
      onSalvar({
        id: meta?.id,
        periodo, escopo,
        dimensao: "geral", alvoId: null,
        valorAgregado: agregado,
        rateio: reps.map(r => ({ repId: r.id, valor: rateio[r.id] ?? 0 })),
        metasSecundarias: secundarias,
        gestorId,
        publicar: false,
      });
      setLastSaved(`${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`);
    }, 800);
    return () => { if (timer.current) window.clearTimeout(timer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agregado, rateio, secundarias]);

  // ---------- Métricas ----------
  const somaRateio = reps.reduce((s, r) => s + (rateio[r.id] ?? 0), 0);
  const diff = somaRateio - agregado;

  return (
    <div className="space-y-4">
      {/* ===== PASSO 1 — META GERAL ===== */}
      <div className="nx-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2D3A8C] text-white text-[11px] font-bold">1</span>
          <Target className="h-4 w-4 text-[#2D3A8C]" />
          <h3 className="text-sm font-semibold nx-text">Meta geral do mês</h3>
          {meta && (
            <Badge variant="outline" className={`text-[10px] ${meta.status === "publicada" ? "bg-emerald-50 text-emerald-700 border-emerald-300" : "bg-amber-50 text-amber-700 border-amber-300"}`}>
              {meta.status}
            </Badge>
          )}
        </div>

        {/* Start choice */}
        {startChoice && (
          <div className="mb-3 p-3 rounded-lg border border-[#DDE4FF] bg-[#F4F6FF] flex items-center gap-3 flex-wrap">
            <Sparkles className="h-4 w-4 text-[#2D3A8C]" />
            <span className="text-xs nx-text">
              Meta anterior ({mesLabelCurto(metaAnterior!.periodo)}): <strong>{fmtBRLc(anterior)}</strong>. Como começar?
            </span>
            <div className="flex gap-2 ml-auto">
              <Button size="sm" variant="outline" onClick={() => { aplicarAtalho(anterior); }}>= mês anterior</Button>
              <Button size="sm" variant="outline" onClick={() => aplicarAtalho(anterior * 1.05)}>+5%</Button>
              <Button size="sm" variant="ghost" onClick={() => setStartChoice(false)}>Do zero</Button>
            </div>
          </div>
        )}

        {/* Input grande + atalhos */}
        <div className="flex items-end gap-3 flex-wrap">
          <div className="flex-1 min-w-[240px]">
            <label className="text-[11px] uppercase nx-muted font-medium">Meta agregada</label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg nx-muted">R$</span>
              <Input
                type="number"
                className="h-14 pl-11 text-2xl font-semibold nx-num"
                value={agregado || ""}
                onChange={e => { setAgregado(Number(e.target.value) || 0); setStartChoice(false); }}
                placeholder={`sugestão: ${fmtBRLc(sugestaoMedia)}/mês, média do time`}
              />
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {anterior > 0 && (
            <>
              <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => aplicarAtalho(anterior)}>= mês anterior ({fmtBRLc(anterior)})</Button>
              <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => aplicarAtalho(anterior * 1.05)}>+5%</Button>
              <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => aplicarAtalho(anterior * 1.10)}>+10%</Button>
            </>
          )}
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => aplicarAtalho(sugestaoMedia)}>
            média 12m do time ({fmtBRLc(sugestaoMedia)})
          </Button>
        </div>

        {/* Modo de distribuição */}
        <div className="flex items-center gap-2 mt-4 flex-wrap">
          <label className="text-[11px] uppercase nx-muted">Distribuir</label>
          <Select value={modo} onValueChange={(v) => setModo(v as DistribMode)}>
            <SelectTrigger className="h-8 w-[260px] text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="hist12m">Proporcional ao histórico 12m</SelectItem>
              <SelectItem value="carteira">Proporcional à carteira (nº clientes)</SelectItem>
              <SelectItem value="igual">Igualitário</SelectItem>
              <SelectItem value="mantePct" disabled={!metaAnterior?.rateio}>
                Manter % do mês anterior{!metaAnterior?.rateio ? " (indisponível)" : ""}
              </SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" variant="ghost" className="h-8 text-xs ml-auto" onClick={redistribuirTudo} disabled={agregado <= 0}>
            <RotateCcw className="h-3.5 w-3.5 mr-1" /> Redistribuir tudo
          </Button>
        </div>

        {/* Tabela de rateio */}
        <div className="mt-3 border border-[#E7E9EE] rounded-lg overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-[#F6F7F9]">
              <tr className="text-[10px] uppercase nx-muted">
                <th className="text-left px-3 py-2">Representante</th>
                <th className="text-right">Histórico 12m/mês</th>
                <th className="text-right">% rateio</th>
                <th className="text-right px-2">Meta</th>
                <th className="text-right pr-3">vs histórico</th>
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody>
              {reps.map(r => {
                const valor = rateio[r.id] ?? 0;
                const pct = agregado > 0 ? (valor / agregado) * 100 : 0;
                const delta = r.historicoMedio12m > 0 ? ((valor - r.historicoMedio12m) / r.historicoMedio12m) * 100 : 0;
                const travada = !!travas[r.id];
                return (
                  <tr key={r.id} className={`border-t border-[#F1F3F8] ${travada ? "bg-amber-50/40" : ""}`}>
                    <td className="px-3 py-1.5 nx-text font-medium">
                      {r.nome}
                    </td>
                    <td className="text-right nx-num nx-muted">{fmtBRLc(r.historicoMedio12m)}</td>
                    <td className="text-right nx-num nx-muted">{pct.toFixed(1)}%</td>
                    <td className="text-right px-2">
                      <Input
                        type="number"
                        className="h-8 w-32 text-right nx-num text-xs inline-block"
                        value={valor || ""}
                        onChange={e => editarLinha(r.id, Number(e.target.value) || 0)}
                        placeholder="0"
                      />
                    </td>
                    <td className={`text-right pr-3 nx-num text-[11px] ${delta > 0 ? "text-emerald-700" : delta < 0 ? "text-rose-700" : "nx-muted"}`}>
                      {agregado > 0 ? (delta >= 0 ? "+" : "") + delta.toFixed(0) + "%" : "—"}
                    </td>
                    <td className="pr-2">
                      <button
                        type="button"
                        title={travada ? "Destravar (voltar ao proporcional)" : "Travar valor"}
                        onClick={() => alternarTrava(r.id)}
                        className={`p-1 rounded hover:bg-[#F1F3F8] ${travada ? "text-amber-700" : "nx-muted"}`}
                      >
                        {travada ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Validação */}
        <div className={`mt-2 p-2.5 rounded text-[11px] border flex items-center justify-between ${
          agregado <= 0 ? "bg-[#F6F7F9] border-[#E7E9EE] nx-muted"
            : diff === 0 ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
        }`}>
          <span>Rateado <strong className="nx-num">{fmtBRL(somaRateio)}</strong> de <strong className="nx-num">{fmtBRL(agregado)}</strong></span>
          {agregado <= 0 ? <span>Defina a meta agregada</span>
            : diff === 0 ? <span>Soma OK ✓</span>
              : diff > 0 ? <span>Sobram {fmtBRL(diff)}</span> : <span>Faltam {fmtBRL(-diff)}</span>}
        </div>
      </div>

      {/* ===== PASSO 2 — METAS SECUNDÁRIAS ===== */}
      <div className="nx-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2D3A8C] text-white text-[11px] font-bold">2</span>
          <h3 className="text-sm font-semibold nx-text">Metas secundárias</h3>
          <span className="text-[11px] nx-muted">opcionais — indicadores de saúde do mês</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {([
            { k: "positivacao", label: "Positivação (clientes)" },
            { k: "cobertura", label: "Cobertura (%)" },
            { k: "novos", label: "Novos clientes" },
            { k: "reativacao", label: "Reativações" },
          ] as const).map(({ k, label }) => (
            <div key={k}>
              <label className="text-[10px] uppercase nx-muted">{label}</label>
              <Input
                type="number"
                className="h-8 mt-1 text-xs nx-num"
                value={secundarias[k] ?? ""}
                onChange={e => setSecundarias(s => ({ ...s, [k]: Number(e.target.value) || undefined }))}
                placeholder={metaAnterior?.metasSecundarias?.[k] != null ? String(metaAnterior.metasSecundarias[k]) : "—"}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Nota de auto-save */}
      <p className="text-[11px] nx-muted text-right">
        {lastSaved
          ? lastSaved === "carregado"
            ? "Meta carregada · alterações são salvas automaticamente"
            : `Rascunho salvo automaticamente às ${lastSaved}`
          : "Digite a meta para começar — rascunho salvo automaticamente"}
      </p>
    </div>
  );
}

// ============================================================================
// NOVA META DIMENSIONAL (mantido)
// ============================================================================
function NovaMetaDimensional({ periodo, escopo, reps, gestorId, onSalvar }: {
  periodo: string; escopo: string;
  reps: ReturnType<typeof repsNoEscopo>;
  gestorId: string;
  onSalvar: ReturnType<typeof useCockpit>["salvarMeta"];
}) {
  const { seed } = useCockpit();
  const [dimensao, setDimensao] = useState<DimensaoMeta>("marca");
  const [alvoId, setAlvoId] = useState<string>("");
  const [valor, setValor] = useState<string>("0");
  const [ratear, setRatear] = useState(false);
  const [open, setOpen] = useState(false);

  const opcoes = useMemo(() => {
    if (dimensao === "marca") return marcasCatalogo(seed).map(m => m.nome);
    if (dimensao === "colecao") return colecoesCatalogo(seed);
    if (dimensao === "nicho") return nichosCatalogo(seed);
    return [];
  }, [dimensao, seed]);

  const salvar = () => {
    const v = Number(valor) || 0;
    if (!alvoId) { toast.error("Selecione o alvo"); return; }
    if (v <= 0) { toast.error("Valor deve ser > 0"); return; }
    let rateio;
    if (ratear) {
      const pesos = pesosPorRep12m(seed, dimensao, alvoId, seed.hoje);
      rateio = rateioProporcional(v, reps, pesos);
    }
    onSalvar({
      periodo, escopo, dimensao, alvoId,
      valorAgregado: v, rateio, gestorId, publicar: false,
    });
    toast.success(`Meta ${dimensaoLabel[dimensao]} · ${alvoId} criada em rascunho`);
    setOpen(false);
    setAlvoId(""); setValor("0"); setRatear(false);
  };

  return (
    <div className="relative">
      <Button size="sm" variant="outline" onClick={() => setOpen(v => !v)}>
        <PlusCircle className="h-3.5 w-3.5 mr-1" /> Nova meta
      </Button>
      {open && (
        <div className="absolute right-0 top-9 z-10 w-[380px] nx-card p-3 shadow-lg space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] uppercase nx-muted">Dimensão</label>
              <Select value={dimensao} onValueChange={(v) => { setDimensao(v as DimensaoMeta); setAlvoId(""); }}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="marca">Marca</SelectItem>
                  <SelectItem value="colecao">Coleção</SelectItem>
                  <SelectItem value="nicho">Nicho</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[10px] uppercase nx-muted">Alvo</label>
              <Select value={alvoId} onValueChange={setAlvoId}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {opcoes.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase nx-muted">Valor (R$)</label>
            <Input type="number" value={valor} onChange={e => setValor(e.target.value)} className="h-8 text-xs" />
          </div>
          <div className="flex items-center justify-between text-xs p-2 rounded bg-[#F6F7F9]">
            <span>Ratear por representante?</span>
            <Switch checked={ratear} onCheckedChange={setRatear} />
          </div>
          {ratear && alvoId && (
            <p className="text-[10px] nx-muted">Rateio proporcional ao histórico 12m de {alvoId}.</p>
          )}
          <div className="flex justify-end gap-2 pt-1">
            <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button size="sm" onClick={salvar}>Criar rascunho</Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// ITEM DE META DIMENSIONAL (mantido)
// ============================================================================
function MetaDimensionalItem({ meta, reps, gestorId, onSalvar, onPublicar, onRemover }: {
  meta: MetaV2;
  reps: ReturnType<typeof repsNoEscopo>;
  gestorId: string;
  onSalvar: ReturnType<typeof useCockpit>["salvarMeta"];
  onPublicar: ReturnType<typeof useCockpit>["publicarMetaV2"];
  onRemover: ReturnType<typeof useCockpit>["removerMetaV2"];
}) {
  const { seed } = useCockpit();
  const [aberto, setAberto] = useState(false);
  const [valor, setValor] = useState<string>(String(meta.valorAgregado));
  const [ratear, setRatear] = useState(!!meta.rateio && meta.rateio.length > 0);
  const [rateio, setRateio] = useState<Record<string, string>>(() => {
    const m: Record<string, string> = {};
    reps.forEach(r => { m[r.id] = String(meta.rateio?.find(x => x.repId === r.id)?.valor ?? 0); });
    return m;
  });

  const hist = useMemo(() => historico12m(seed, meta.dimensao, meta.alvoId, seed.hoje), [seed, meta]);
  const mediaHist = hist.reduce((s, x) => s + x.valor, 0) / Math.max(1, hist.length);

  const salvar = (publicar: boolean) => {
    const v = Number(valor) || 0;
    if (v <= 0) { toast.error("Valor deve ser > 0"); return; }
    let rat: { repId: string; valor: number }[] | undefined;
    if (ratear) {
      rat = reps.map(r => ({ repId: r.id, valor: Number(rateio[r.id]) || 0 }));
      const soma = rat.reduce((s, x) => s + x.valor, 0);
      if (soma !== v) toast.warning(`Rateio (${soma}) difere do total (${v}). Salvo mesmo assim.`);
    }
    onSalvar({
      id: meta.id, periodo: meta.periodo, escopo: meta.escopo,
      dimensao: meta.dimensao, alvoId: meta.alvoId,
      valorAgregado: v, rateio: rat, gestorId, publicar,
    });
    toast.success(publicar ? "Meta publicada" : "Rascunho salvo");
  };

  return (
    <Collapsible open={aberto} onOpenChange={setAberto}>
      <div className="border border-[#E7E9EE] rounded-lg">
        <CollapsibleTrigger className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#F6F7F9]">
          <ChevronDown className={`h-3.5 w-3.5 nx-muted transition-transform ${aberto ? "" : "-rotate-90"}`} />
          <Badge variant="outline" className={`text-[10px] ${dimensaoBadge[meta.dimensao]}`}>{dimensaoLabel[meta.dimensao]}</Badge>
          <span className="text-sm font-medium nx-text">{meta.alvoId}</span>
          <span className="text-xs nx-muted ml-auto nx-num">{fmtBRLc(meta.valorAgregado)}</span>
          <Badge variant="outline" className={`text-[10px] ${meta.status === "publicada" ? "bg-emerald-50 text-emerald-700 border-emerald-300" : "bg-amber-50 text-amber-700 border-amber-300"}`}>
            {meta.status}
          </Badge>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-3 pb-3 pt-1 space-y-2 border-t border-[#F1F3F8]">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase nx-muted">Valor da meta (R$)</label>
                <Input type="number" value={valor} onChange={e => setValor(e.target.value)} className="h-8 text-xs" />
                <p className="text-[10px] nx-muted mt-1">Histórico médio 12m: <span className="nx-num">{fmtBRLc(mediaHist)}</span>/mês</p>
              </div>
              <div className="flex items-center gap-2 pt-4">
                <Switch checked={ratear} onCheckedChange={setRatear} />
                <span className="text-xs">Ratear por representante</span>
              </div>
            </div>

            {ratear && (
              <div className="border border-[#F1F3F8] rounded overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-[#F6F7F9] text-[10px] uppercase nx-muted">
                    <tr><th className="text-left px-2 py-1">Rep</th><th className="text-right">Hist 12m nesta dimensão</th><th className="text-right px-2">Meta</th></tr>
                  </thead>
                  <tbody>
                    {reps.map(r => {
                      const pesos = pesosPorRep12m(seed, meta.dimensao, meta.alvoId, seed.hoje);
                      return (
                        <tr key={r.id} className="border-t border-[#F1F3F8]">
                          <td className="px-2 py-1 nx-text">{r.nome}</td>
                          <td className="text-right nx-num nx-muted">{fmtBRLc(pesos.get(r.id) ?? 0)}</td>
                          <td className="text-right px-2">
                            <Input type="number" value={rateio[r.id] ?? "0"} onChange={e => setRateio(p => ({ ...p, [r.id]: e.target.value }))} className="h-7 w-28 text-right text-xs inline-block nx-num" />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex gap-2 flex-wrap">
              <Button size="sm" variant="outline" onClick={() => salvar(false)}>Salvar rascunho</Button>
              <Button size="sm" onClick={() => salvar(true)}>Publicar</Button>
              <Button size="sm" variant="ghost" className="text-rose-600 ml-auto" onClick={() => { onRemover(meta.id); toast.success("Meta removida"); }}>
                <Trash2 className="h-3.5 w-3.5 mr-1" /> Remover
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
