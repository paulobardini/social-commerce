// AcompanhamentoMetas · aba "Metas" da tela Representantes.
// (a) Acompanhamento do mês corrente com cards ordenados por % ASC.
// (b) Planejamento: strip de meses + botão Gestão de metas.
import { useMemo, useState } from "react";
import { useCockpit } from "@/cockpit/contexts/CockpitContext";
import { repsNoEscopo } from "@/cockpit/lib/escopo";
import {
  mesKey, mesLabel, periodosPlanejamento, mesLabelCurto, type MetaV2,
} from "@/cockpit/data/metasV2";
import {
  realizadoMeta, veredictoMeta, metaGeralDoMes,
} from "@/cockpit/lib/metasCalc";
import { DimensionalCard } from "./DimensionalCard";
import { MesStrip } from "./MesStrip";
import { MetasWizard } from "./MetasWizard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Target, Calendar, Sparkles } from "lucide-react";
import { fmtBRLc } from "@/cockpit/styles/tokens";

export function AcompanhamentoMetas() {
  const { seed, escopo, metasV2, metasPublicadas } = useCockpit();
  const reps = useMemo(() => repsNoEscopo(seed, escopo), [seed, escopo]);
  const mesAtual = mesKey(seed.hoje);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardMes, setWizardMes] = useState<string>(mesAtual);

  // Meta geral do mês corrente (V2 > legado)
  const consolidadaLegada = seed.metas.find(m => m.repId === "consolidada" && m.tipo === "faturamento" && m.mes === mesAtual)?.valor;
  const geral = metaGeralDoMes(metasV2, mesAtual, escopo, consolidadaLegada);

  // Metas V2 do mês para render
  const metasDoMesV2 = useMemo(
    () => metasV2.filter(m => m.periodo === mesAtual && m.escopo === escopo),
    [metasV2, mesAtual, escopo],
  );

  // Se não tem V2 geral, sintetiza um card baseado no legado + rateio de metasPublicadas
  const metaGeralSintetica: MetaV2 | null = geral.fonte !== "vazio" && !metasDoMesV2.find(m => m.dimensao === "geral")
    ? {
        id: "syn-geral",
        periodo: mesAtual,
        dimensao: "geral",
        alvoId: null,
        valorAgregado: geral.valor,
        rateio: reps.map(r => ({
          repId: r.id,
          valor: metasPublicadas[`${r.id}:${mesAtual}`]
            ?? seed.metas.find(m => m.repId === r.id && m.tipo === "faturamento" && m.mes === mesAtual)?.valor
            ?? 0,
        })),
        status: "publicada",
        escopo,
        log: [],
      }
    : null;

  const todasMetas: MetaV2[] = [
    ...metasDoMesV2,
    ...(metaGeralSintetica ? [metaGeralSintetica] : []),
  ];

  // Ordena por % ASC (pior primeiro), meta geral no topo
  const ordenadas = todasMetas
    .map(m => ({ meta: m, realizado: realizadoMeta(seed, m, escopo) }))
    .sort((a, b) => {
      if (a.meta.dimensao === "geral" && b.meta.dimensao !== "geral") return -1;
      if (b.meta.dimensao === "geral" && a.meta.dimensao !== "geral") return 1;
      const pa = a.meta.valorAgregado > 0 ? (a.realizado / a.meta.valorAgregado) * 100 : 0;
      const pb = b.meta.valorAgregado > 0 ? (b.realizado / b.meta.valorAgregado) * 100 : 0;
      return pa - pb;
    });

  const abrirGestao = (mes: string) => { setWizardMes(mes); setWizardOpen(true); };
  const periodos = periodosPlanejamento(seed.hoje);
  const futurosPublicados = periodos.slice(1).filter(p => metasV2.some(m => m.periodo === p && m.escopo === escopo && m.status === "publicada"));
  const futurosRascunho = periodos.slice(1).filter(p => metasV2.some(m => m.periodo === p && m.escopo === escopo && m.status === "rascunho") && !futurosPublicados.includes(p));

  return (
    <div className="space-y-5">
      {/* ACOMPANHAMENTO */}
      <section className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-semibold nx-text flex items-center gap-2">
              <Target className="h-4 w-4 text-[#2D3A8C]" /> Acompanhamento · {mesLabel(mesAtual)}
            </h3>
            <p className="text-[11px] nx-muted">Ordenado do pior atingimento primeiro.</p>
          </div>
          <Button size="sm" onClick={() => abrirGestao(mesAtual)} className="bg-[#2D3A8C] hover:bg-[#243078]">
            <Sparkles className="h-3.5 w-3.5 mr-1" /> Gestão de metas
          </Button>
        </div>

        {ordenadas.length === 0 ? (
          <div className="nx-card p-6 text-center text-xs nx-muted">
            Nenhuma meta configurada para {mesLabel(mesAtual)}. Clique em "Gestão de metas" para começar.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {ordenadas.map(({ meta, realizado }) => {
              const veredito = veredictoMeta(realizado, meta.valorAgregado, seed.hoje);
              const breakdown = meta.rateio && meta.rateio.length > 0
                ? meta.rateio.map(r => {
                    const rep = reps.find(x => x.id === r.repId);
                    return {
                      repNome: rep?.nome ?? r.repId,
                      alvo: r.valor,
                      realizado: realizadoMeta(seed, meta, escopo, r.repId),
                    };
                  }).sort((a, b) => a.realizado / (a.alvo || 1) - b.realizado / (b.alvo || 1))
                : undefined;
              return (
                <DimensionalCard
                  key={meta.id}
                  meta={meta}
                  realizado={realizado}
                  veredito={veredito}
                  breakdownReps={breakdown}
                />
              );
            })}
          </div>
        )}
      </section>

      {/* PLANEJAMENTO */}
      <section className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-semibold nx-text flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#2D3A8C]" /> Planejamento · próximos meses
            </h3>
            <p className="text-[11px] nx-muted">Clique num mês para abrir a Gestão de metas dele. Rascunhos são invisíveis ao vendedor.</p>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-emerald-500"></span> {futurosPublicados.length} publicados</span>
            <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-amber-500"></span> {futurosRascunho.length} rascunhos</span>
          </div>
        </div>

        <div className="nx-card p-3">
          <MesStrip
            hoje={seed.hoje}
            metasV2={metasV2}
            escopo={escopo}
            periodoAtivo={wizardMes}
            onEscolher={(m) => abrirGestao(m)}
          />
        </div>

        {(futurosPublicados.length + futurosRascunho.length) > 0 && (
          <div className="flex flex-wrap gap-2">
            {futurosPublicados.map(p => (
              <Badge key={p} variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 text-[11px] cursor-pointer" onClick={() => abrirGestao(p)}>
                {mesLabelCurto(p)} · publicada
              </Badge>
            ))}
            {futurosRascunho.map(p => (
              <Badge key={p} variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 text-[11px] cursor-pointer" onClick={() => abrirGestao(p)}>
                {mesLabelCurto(p)} · rascunho
              </Badge>
            ))}
          </div>
        )}
      </section>

      <MetasWizard open={wizardOpen} onOpenChange={setWizardOpen} periodoInicial={wizardMes} />
    </div>
  );
}
