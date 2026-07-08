// MetasWizard · gestão multidimensional de metas com strip de meses futuros.
// 2 níveis: (a) Meta Geral com rateio validado, (b) Metas por Dimensão.
import { useMemo, useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Copy, PlusCircle, Trash2, ChevronDown, Layers, Target } from "lucide-react";
import { toast } from "sonner";
import { useCockpit } from "@/cockpit/contexts/CockpitContext";
import { repsNoEscopo } from "@/cockpit/lib/escopo";
import { fmtBRL, fmtBRLc } from "@/cockpit/styles/tokens";
import {
  mesKey, mesLabel, periodoEhCorrente,
  marcasCatalogo, colecoesCatalogo, nichosCatalogo, rateioProporcional,
  type DimensaoMeta, type MetaV2,
} from "@/cockpit/data/metasV2";
import { pesosPorRep12m, historico12m } from "@/cockpit/lib/metasCalc";
import { MesStrip } from "./MesStrip";
import { DuplicarMesModal } from "./DuplicarMesModal";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const dimensaoLabel: Record<DimensaoMeta, string> = {
  geral: "Meta geral",
  marca: "Marca",
  colecao: "Coleção",
  nicho: "Nicho",
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
  periodoInicial?: string;      // se vier, abre naquele mês
}

export function MetasWizard({ open, onOpenChange, periodoInicial }: Props) {
  const { seed, escopo, metasV2, salvarMeta, publicarMetaV2, removerMetaV2 } = useCockpit();
  const reps = useMemo(() => repsNoEscopo(seed, escopo), [seed, escopo]);
  const mesCorrente = mesKey(seed.hoje);
  const [periodo, setPeriodo] = useState<string>(periodoInicial ?? mesCorrente);
  const [duplicarOpen, setDuplicarOpen] = useState(false);

  useEffect(() => { if (open && periodoInicial) setPeriodo(periodoInicial); }, [open, periodoInicial]);

  const metasDoMes = metasV2.filter(m => m.periodo === periodo && m.escopo === escopo);
  const metaGeral = metasDoMes.find(m => m.dimensao === "geral");
  const dimensionais = metasDoMes.filter(m => m.dimensao !== "geral");
  const ehCorrente = periodoEhCorrente(periodo, seed.hoje);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[92vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-3 shrink-0 border-b">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <DialogTitle>Gestão de metas · {mesLabel(periodo)}</DialogTitle>
              <DialogDescription>
                Meta geral rateada + metas por dimensão (marca · coleção · nicho).
                Cada dimensão é uma lente sobre a mesma receita.
                {ehCorrente && <span className="ml-1 text-amber-700">Alteração no mês corrente será registrada em log.</span>}
              </DialogDescription>
            </div>
            <Button size="sm" variant="outline" onClick={() => setDuplicarOpen(true)} disabled={!metasDoMes.length}>
              <Copy className="h-3.5 w-3.5 mr-1" /> Duplicar para meses
            </Button>
          </div>
          <div className="mt-3">
            <MesStrip
              hoje={seed.hoje}
              metasV2={metasV2}
              escopo={escopo}
              periodoAtivo={periodo}
              onEscolher={setPeriodo}
            />
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {/* META GERAL */}
          <MetaGeralEditor
            key={`geral-${periodo}`}
            periodo={periodo}
            escopo={escopo}
            meta={metaGeral}
            reps={reps}
            gestorId="gestor-atual"
            onSalvar={salvarMeta}
            onPublicar={publicarMetaV2}
          />

          {/* METAS DIMENSIONAIS */}
          <div className="nx-card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-[#2D3A8C]" />
                <h3 className="text-sm font-semibold nx-text">Metas por dimensão</h3>
                <Badge variant="outline" className="text-[10px]">{dimensionais.length}</Badge>
              </div>
              <NovaMetaDimensional
                periodo={periodo}
                escopo={escopo}
                reps={reps}
                gestorId="gestor-atual"
                onSalvar={salvarMeta}
              />
            </div>
            {dimensionais.length === 0 ? (
              <p className="text-xs nx-muted py-4 text-center">Nenhuma meta dimensional. Use "+ Nova meta" para criar (Brandili, Inverno 25, Infantil, etc.).</p>
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

        <DialogFooter className="px-6 py-4 border-t shrink-0 bg-background flex-wrap gap-2">
          <div className="text-[11px] nx-muted mr-auto">
            {metasDoMes.length} meta(s) neste mês ·{" "}
            <span className="text-emerald-700 font-medium">{metasDoMes.filter(m => m.status === "publicada").length} publicada(s)</span>
            {" · "}
            <span className="text-amber-700 font-medium">{metasDoMes.filter(m => m.status === "rascunho").length} rascunho(s)</span>
          </div>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
          <Button
            onClick={() => {
              const rascunhos = metasDoMes.filter(m => m.status === "rascunho");
              if (!rascunhos.length) { toast.info("Nada em rascunho neste mês."); return; }
              rascunhos.forEach(m => publicarMetaV2(m.id, "gestor-atual"));
              toast.success(`${rascunhos.length} meta(s) publicada(s) · reps notificados`);
            }}
          >
            Publicar mês ({metasDoMes.filter(m => m.status === "rascunho").length})
          </Button>
        </DialogFooter>

        <DuplicarMesModal open={duplicarOpen} onOpenChange={setDuplicarOpen} origem={periodo} />
      </DialogContent>
    </Dialog>
  );
}

// ------------------- Meta Geral -------------------
function MetaGeralEditor({ periodo, escopo, meta, reps, gestorId, onSalvar, onPublicar }: {
  periodo: string; escopo: string; meta?: MetaV2;
  reps: ReturnType<typeof repsNoEscopo>;
  gestorId: string;
  onSalvar: ReturnType<typeof useCockpit>["salvarMeta"];
  onPublicar: ReturnType<typeof useCockpit>["publicarMetaV2"];
}) {
  const [agregado, setAgregado] = useState<string>(String(meta?.valorAgregado ?? 0));
  const [rateio, setRateio] = useState<Record<string, string>>(() => {
    const m: Record<string, string> = {};
    reps.forEach(r => { m[r.id] = String(meta?.rateio?.find(x => x.repId === r.id)?.valor ?? 0); });
    return m;
  });
  const [confirmSoma, setConfirmSoma] = useState(false);

  useEffect(() => {
    // Se ainda não tem rateio, sugere proporcional ao histórico 12m ao digitar o total.
    const total = Number(agregado) || 0;
    const jaTemNumeros = Object.values(rateio).some(v => Number(v) > 0);
    if (total > 0 && !jaTemNumeros && !meta) {
      const pesos = new Map(reps.map(r => [r.id, r.historicoMedio12m]));
      const distrib = rateioProporcional(total, reps, pesos);
      const patch: Record<string, string> = {};
      distrib.forEach(d => { patch[d.repId] = String(d.valor); });
      setRateio(patch);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agregado]);

  const somaRateio = reps.reduce((s, r) => s + (Number(rateio[r.id]) || 0), 0);
  const totalMeta = Number(agregado) || 0;
  const diff = somaRateio - totalMeta;

  const persist = (publicar: boolean) => {
    if (totalMeta <= 0) { toast.error("Defina a meta agregada."); return; }
    if (diff !== 0 && !confirmSoma) {
      setConfirmSoma(true);
      toast.warning("Soma do rateio difere da meta agregada. Confirme para publicar mesmo assim.");
      return;
    }
    onSalvar({
      id: meta?.id,
      periodo, escopo,
      dimensao: "geral", alvoId: null,
      valorAgregado: totalMeta,
      rateio: reps.map(r => ({ repId: r.id, valor: Number(rateio[r.id]) || 0 })),
      gestorId,
      publicar,
    });
    setConfirmSoma(false);
    toast.success(publicar ? "Meta geral publicada" : "Rascunho salvo");
  };

  return (
    <div className="nx-card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Badge className={`text-[10px] border ${dimensaoBadge.geral}`}>Meta geral</Badge>
        {meta && (
          <Badge variant="outline" className={`text-[10px] ${meta.status === "publicada" ? "bg-emerald-50 text-emerald-700 border-emerald-300" : "bg-amber-50 text-amber-700 border-amber-300"}`}>
            {meta.status}
          </Badge>
        )}
      </div>
      <div>
        <label className="text-xs font-medium nx-text">Meta agregada do mês (R$)</label>
        <Input
          type="number"
          className="mt-1 max-w-xs"
          value={agregado}
          onChange={e => setAgregado(e.target.value)}
          placeholder="Ex: 800000"
        />
      </div>

      <div className="border border-[#E7E9EE] rounded-lg overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-[#F6F7F9]">
            <tr className="text-[10px] uppercase nx-muted">
              <th className="text-left px-3 py-2">Representante</th>
              <th className="text-right">Histórico 12m</th>
              <th className="text-right px-3">Meta</th>
            </tr>
          </thead>
          <tbody>
            {reps.map(r => (
              <tr key={r.id} className="border-t border-[#F1F3F8]">
                <td className="px-3 py-1.5 nx-text font-medium">{r.nome}</td>
                <td className="text-right nx-num nx-muted">{fmtBRLc(r.historicoMedio12m)}/mês</td>
                <td className="text-right px-3">
                  <Input
                    type="number"
                    className="h-8 w-32 text-right nx-num text-xs inline-block"
                    value={rateio[r.id] ?? "0"}
                    onChange={e => setRateio(prev => ({ ...prev, [r.id]: e.target.value }))}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={`p-2.5 rounded text-[11px] border flex items-center justify-between ${
        diff === 0 ? "bg-emerald-50 border-emerald-200 text-emerald-800"
          : diff > 0 ? "bg-amber-50 border-amber-200 text-amber-800"
            : "bg-rose-50 border-rose-200 text-rose-800"
      }`}>
        <span>Rateado <strong className="nx-num">{fmtBRL(somaRateio)}</strong> de <strong className="nx-num">{fmtBRL(totalMeta)}</strong></span>
        {diff === 0 ? <span>Soma OK ✓</span> :
          diff > 0 ? <span>Sobram {fmtBRL(diff)}</span> : <span>Faltam {fmtBRL(-diff)}</span>}
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button size="sm" variant="outline" onClick={() => persist(false)}>Salvar rascunho</Button>
        <Button size="sm" onClick={() => persist(true)}>
          {confirmSoma && diff !== 0 ? `Confirmar publicar (${fmtBRLc(diff)} diff)` : "Publicar meta geral"}
        </Button>
      </div>
    </div>
  );
}

// ------------------- Nova meta dimensional -------------------
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
      const distrib = rateioProporcional(v, reps, pesos);
      rateio = distrib;
    }
    onSalvar({
      periodo, escopo, dimensao, alvoId,
      valorAgregado: v,
      rateio,
      gestorId,
      publicar: false,
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
            <p className="text-[10px] nx-muted">Rateio automático proporcional ao histórico 12m de {alvoId}. Edite depois se necessário.</p>
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

// ------------------- Item de meta dimensional -------------------
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
