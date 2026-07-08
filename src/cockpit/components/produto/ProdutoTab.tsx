// Produto (por MARCA): faturamento/penetração, marca×nicho, ABC produtos,
// marcas sem giro → push campanha idempotente, cross-sell → oportunidade pré-preenchida.
import { useMemo, useState } from "react";
import { useCockpit } from "../../contexts/CockpitContext";
import { kpisProduto } from "../../lib/kpis";
import { curvaAbc } from "../../lib/abc";
import { fmtBRL, fmtBRLc, fmtNum, fmtPct, NX, CHART_PALETTE } from "../../styles/tokens";
import { repIdsNoEscopo } from "../../lib/escopo";
import { SectionCard } from "../SectionCard";
import { KpiCard } from "../KpiCard";
import { AbcCurve } from "../AbcCurve";
import { MarcaNichoHeatmap } from "./MarcaNichoHeatmap";
import { InsightsStrip } from "../InsightsStrip";
import { insightsProduto } from "../../lib/insights";
import type { Nicho } from "../../data/seed";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Layers, DollarSign, Package, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useTarefas } from "@/contexts/TarefasContext";
import { classificarTudo } from "../../lib/classificar";
import { NovaOportunidadeModal } from "@/components/vendedor/NovaOportunidadeModal";

// ------------------------------------------------------------------
// CAMPANHA PUSH — MODAL IDEMPOTENTE
// ------------------------------------------------------------------
function CampanhaPushModal({
  open, onOpenChange, marca, repsAlvo,
}: { open: boolean; onOpenChange: (b: boolean) => void; marca: string; repsAlvo: { repId: string; repNome: string; clientesSugeridos: { id: string; razao: string }[] }[] }) {
  const [texto, setTexto] = useState(`Oferecer ${marca} aos clientes X, Y — nicho compatível`);
  const { addTarefa, tarefas } = useTarefas();
  const { registrarCampanhaPush, campanhasPush } = useCockpit();

  const chave = `push_marca_${marca.toLowerCase().replace(/\s+/g, "_")}`;
  const ultimaCampanha = campanhasPush[chave];

  const handleEnviar = () => {
    let criadas = 0;
    let atualizadas = 0;
    let ignoradas = 0;
    for (const r of repsAlvo) {
      for (const cli of r.clientesSugeridos.slice(0, 3)) {
        const chaveAcao = `${chave}::${cli.id}`;
        const existente = tarefas.find(t => t.origem === "sistema" && t.clienteId === cli.id && t.descricao?.includes(chave));
        if (existente) {
          if (existente.titulo === `${marca} para ${cli.razao}` && existente.descricao === `[${chave}] ${texto}`) {
            ignoradas++;
          } else {
            atualizadas++;
            // upsert: nothing to update in mock (leaves as-is)
          }
          continue;
        }
        addTarefa({
          titulo: `${marca} para ${cli.razao}`,
          descricao: `[${chave}] ${texto}`,
          tipo: "follow_up",
          clienteId: cli.id, clienteNome: cli.razao,
          prioridade: "media",
          vencimento: formatBRDate(addDays(new Date(), 3)),
          responsavel: r.repNome,
          status: "pendente",
          origem: "sistema",
          recorrencia: "nenhuma",
        });
        criadas++;
      }
    }
    registrarCampanhaPush(chave, texto);
    toast.success(`Campanha "${marca}" · ${criadas} novas · ${ignoradas} idênticas ignoradas · ${atualizadas} atualizadas`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Campanha de push · {marca}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-xs nx-muted">
            Gera ações sugeridas na fila dos {repsAlvo.length} rep(s) envolvidos. Chave <code className="bg-[#F6F7F9] px-1 rounded">{chave}</code> —
            executar duas vezes NÃO duplica: entradas idênticas são ignoradas.
          </p>
          {ultimaCampanha && (
            <div className="text-[11px] p-2 bg-sky-50 border border-sky-200 rounded text-sky-800">
              Última execução: {new Date(ultimaCampanha.criadaEm).toLocaleString("pt-BR")}
            </div>
          )}
          <Textarea rows={3} value={texto} onChange={e => setTexto(e.target.value)} />
          <div className="text-[11px] nx-muted">
            {repsAlvo.reduce((s, r) => s + Math.min(3, r.clientesSugeridos.length), 0)} ações a criar (até 3 clientes por rep).
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleEnviar}><Send className="h-3.5 w-3.5 mr-1" /> Enviar campanha</Button>
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
export function ProdutoTab() {
  const { seed, escopo, range, previousRange, comparar, diasAtivo, diasPerdido } = useCockpit();
  const repIds = useMemo(() => repIdsNoEscopo(seed, escopo), [seed, escopo]);

  const insights = useMemo(() => insightsProduto(seed, escopo, range, previousRange), [seed, escopo, range, previousRange]);

  const kpiP = useMemo(() => kpisProduto(seed, range, previousRange, { diasAtivo: 60, diasPerdido: 180, repId: "todos" }), [seed, range, previousRange]);
  const noEscopoPedidos = useMemo(() => kpiP.pedidosPeriodo.filter(p => repIds.has(p.repId)), [kpiP, repIds]);

  const faturPorMarca = useMemo(() => seed.marcas.map(m => ({
    nome: m.nome,
    valor: noEscopoPedidos.filter(p => p.marcaId === m.id).reduce((s, p) => s + p.valor, 0),
  })).sort((a, b) => b.valor - a.valor), [seed, noEscopoPedidos]);

  const penetracao = useMemo(() => {
    const contas = seed.contas.filter(c => repIds.has(c.repId));
    const totalBase = contas.length || 1;
    return seed.marcas.map(m => {
      const contasComMarca = new Set(seed.pedidos.filter(p => p.marcaId === m.id && repIds.has(p.repId)).map(p => p.contaId)).size;
      return { nome: m.nome, pct: (contasComMarca / totalBase) * 100 };
    }).sort((a, b) => b.pct - a.pct);
  }, [seed, repIds]);

  const NICHOS_ORD: Nicho[] = ["Infantil", "Adulto", "Fitness", "Moda Praia", "Casual", "Multimarcas"];
  const heatMarcaNicho = useMemo(() => {
    return seed.marcas.map(m => {
      const cells = NICHOS_ORD.map(n => {
        const contasNicho = new Set(seed.contas.filter(c => c.nicho === n && repIds.has(c.repId)).map(c => c.id));
        const valor = seed.pedidos.filter(p => p.marcaId === m.id && contasNicho.has(p.contaId)).reduce((s, p) => s + p.valor, 0);
        const clientes = new Set(seed.pedidos.filter(p => p.marcaId === m.id && contasNicho.has(p.contaId)).map(p => p.contaId)).size;
        return { nicho: n, valor, clientes };
      });
      const total = cells.reduce((s, c) => s + c.valor, 0);
      return { marcaId: m.id, marcaNome: m.nome, cells, total };
    }).sort((a, b) => b.total - a.total);
  }, [seed, repIds]);

  const abcProduto = useMemo(() => {
    const map = new Map<string, number>();
    noEscopoPedidos.forEach(p => map.set(p.produtoId, (map.get(p.produtoId) ?? 0) + p.valor));
    return curvaAbc([...map.entries()].map(([id, valor]) => ({ item: { id }, valor })));
  }, [noEscopoPedidos]);

  const topProdutos = useMemo(() => {
    const map = new Map<string, number>();
    noEscopoPedidos.forEach(p => map.set(p.produtoId, (map.get(p.produtoId) ?? 0) + p.valor));
    const arr = [...map.entries()].map(([id, valor]) => ({ nome: id.toUpperCase(), valor })).sort((a, b) => b.valor - a.valor);
    return { top: arr.slice(0, 10), bottom: arr.slice(-10).reverse() };
  }, [noEscopoPedidos]);

  // Marcas sem giro por rep + clientes candidatos
  const semGiro = useMemo(() => {
    const reps = seed.representantes.filter(r => repIds.has(r.id));
    return reps.map(r => {
      const marcasVendidas = new Set(noEscopoPedidos.filter(p => p.repId === r.id).map(p => p.marcaId));
      const marcasSem = seed.marcas.filter(m => !marcasVendidas.has(m.id));
      const carteiraRep = seed.contas.filter(c => c.repId === r.id).slice(0, 5).map(c => ({ id: c.id, razao: c.razao }));
      return { rep: r, marcasSem, clientesSugeridos: carteiraRep };
    });
  }, [seed, repIds, noEscopoPedidos]);

  // Cross-sell drill-down: clientes com só 1 marca comprada
  const classificadas = useMemo(
    () => classificarTudo(seed.contas.filter(c => repIds.has(c.repId)), seed.pedidos.filter(p => repIds.has(p.repId)), range, diasAtivo, diasPerdido, seed.hoje),
    [seed, repIds, range, diasAtivo, diasPerdido],
  );
  const crossSell = useMemo(() => {
    return classificadas.map(c => {
      const marcasComp = new Set(seed.pedidos.filter(p => p.contaId === c.conta.id).map(p => p.marcaId));
      if (marcasComp.size !== 1) return null;
      const marcaAtual = seed.marcas.find(m => marcasComp.has(m.id));
      // Candidatos: marcas cuja categoria bate com o nicho aproximado
      const candidatas = seed.marcas.filter(m => m.id !== marcaAtual?.id).slice(0, 3);
      return {
        cliente: c.conta,
        marcaAtual: marcaAtual?.nome ?? "—",
        candidatas,
      };
    }).filter(Boolean).slice(0, 8) as { cliente: any; marcaAtual: string; candidatas: any[] }[];
  }, [classificadas, seed]);

  const [pushModalMarca, setPushModalMarca] = useState<string | null>(null);
  const [pushReps, setPushReps] = useState<{ repId: string; repNome: string; clientesSugeridos: { id: string; razao: string }[] }[]>([]);
  const [novaOpOpen, setNovaOpOpen] = useState(false);
  const [briefingIni, setBriefingIni] = useState<string>("");
  const [clienteIni, setClienteIni] = useState<string>("");

  const showDelta = (v: number) => comparar && v !== 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-3">
        <KpiCard label="Faturamento" value={fmtBRLc(kpiP.faturamento.atual)} delta={showDelta(kpiP.faturamento.delta) ? { pct: kpiP.faturamento.delta } : undefined} icon={<DollarSign className="h-3.5 w-3.5" />} tooltip="Soma dos pedidos fechados no período." />
        <KpiCard label="Marcas com venda" value={fmtNum(kpiP.marcasAtivas.atual)} delta={showDelta(kpiP.marcasAtivas.delta) ? { pct: kpiP.marcasAtivas.delta } : undefined} icon={<Layers className="h-3.5 w-3.5" />} tooltip="Quantas marcas tiveram ao menos 1 pedido no período." />
        <KpiCard label="Ticket médio por marca" value={fmtBRLc(kpiP.ticketMarca.atual)} delta={showDelta(kpiP.ticketMarca.delta) ? { pct: kpiP.ticketMarca.delta } : undefined} tooltip="Faturamento dividido pelo número de marcas com venda." />
        <KpiCard label="Marca líder" value={<span className="text-base">{kpiP.marcaLider}</span>} tooltip="Marca com maior faturamento no período." />
        <KpiCard label="Peças por pedido" value={kpiP.itensPorPedido.atual.toFixed(1).replace(".", ",")} delta={showDelta(kpiP.itensPorPedido.delta) ? { pct: kpiP.itensPorPedido.delta } : undefined} icon={<Package className="h-3.5 w-3.5" />} tooltip="Média de peças (itens) por pedido no período." />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Faturamento por marca">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={faturPorMarca} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={fmtBRLc} />
              <YAxis type="category" dataKey="nome" tick={{ fontSize: 11 }} width={90} />
              <Tooltip formatter={(v: number) => fmtBRL(v)} contentStyle={{ background: "#fff", border: "1px solid #E7E9EE", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="valor" fill={NX.primary} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
        <SectionCard title="Quantos clientes compram cada marca" subtitle="% da carteira que já comprou a marca">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={penetracao} layout="vertical">
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
              <YAxis type="category" dataKey="nome" tick={{ fontSize: 11 }} width={90} />
              <Tooltip formatter={(v: number) => fmtPct(v)} contentStyle={{ background: "#fff", border: "1px solid #E7E9EE", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="pct" fill={NX.accent} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      <SectionCard title="Marca × Nicho" subtitle="Onde cada marca vende mais — receita por combinação (escala por linha)">
        <MarcaNichoHeatmap
          rows={heatMarcaNicho}
          nichos={NICHOS_ORD}
          onCellClick={(marcaId, nicho) => {
            const marca = seed.marcas.find(m => m.id === marcaId)?.nome ?? marcaId;
            toast.info(`${marca} · ${nicho} — abrir lista de clientes (em breve).`);
          }}
        />
      </SectionCard>

      <SectionCard title="Concentração de receita por produto" subtitle="Poucos produtos concentram a maior parte do faturamento — a linha mostra o acumulado (%)">
        <AbcCurve data={abcProduto} labelKey={(t: { id: string }) => t.id.toUpperCase()} />
      </SectionCard>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Top 10 produtos">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={topProdutos.top} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={fmtBRLc} />
              <YAxis type="category" dataKey="nome" tick={{ fontSize: 10 }} width={70} />
              <Tooltip formatter={(v: number) => fmtBRL(v)} contentStyle={{ background: "#fff", border: "1px solid #E7E9EE", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="valor" fill="#16A34A" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
        <SectionCard title="Bottom 10 produtos">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={topProdutos.bottom} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={fmtBRLc} />
              <YAxis type="category" dataKey="nome" tick={{ fontSize: 10 }} width={70} />
              <Tooltip formatter={(v: number) => fmtBRL(v)} contentStyle={{ background: "#fff", border: "1px solid #E7E9EE", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="valor" fill="#DC2626" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      <SectionCard title="Marcas sem giro por representante" subtitle="Criar campanha de push envia ações sugeridas idempotentes para a fila dos reps">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-[10px] uppercase nx-muted border-b border-[#E7E9EE]">
              <tr>
                <th className="text-left py-2">Representante</th>
                <th className="text-left">Marcas sem venda</th>
                <th className="text-right pr-2">Ação</th>
              </tr>
            </thead>
            <tbody>
              {semGiro.map(r => (
                <tr key={r.rep.id} className="border-b border-[#F1F3F8]">
                  <td className="py-2 nx-text font-medium">{r.rep.nome}</td>
                  <td className="py-2">
                    {r.marcasSem.length === 0
                      ? <span className="text-emerald-600 text-[11px]">Vendeu todas as marcas ✓</span>
                      : <div className="flex flex-wrap gap-1">
                          {r.marcasSem.map(m => (
                            <button key={m.id} onClick={() => {
                              setPushModalMarca(m.nome);
                              setPushReps([{ repId: r.rep.id, repNome: r.rep.nome, clientesSugeridos: r.clientesSugeridos }]);
                            }}>
                              <Badge variant="outline" className="text-[10px] hover:border-[#2D3A8C] hover:bg-[#E8EAF6] cursor-pointer">{m.nome}</Badge>
                            </button>
                          ))}
                        </div>
                    }
                  </td>
                  <td className="text-right pr-2">
                    {r.marcasSem.length > 0 && (
                      <Button size="sm" variant="outline" className="h-7 text-[10px]"
                        onClick={() => {
                          setPushModalMarca(r.marcasSem[0].nome);
                          setPushReps([{ repId: r.rep.id, repNome: r.rep.nome, clientesSugeridos: r.clientesSugeridos }]);
                        }}>
                        <Send className="h-3 w-3 mr-1" /> Push da 1ª marca
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SectionCard title="Cross-sell · Expansão de marcas" subtitle="Clientes com apenas 1 marca comprada — candidatos a expansão">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-[10px] uppercase nx-muted border-b border-[#E7E9EE]">
              <tr>
                <th className="text-left py-2 pl-2">Cliente</th>
                <th className="text-left">Nicho</th>
                <th className="text-left">Marca atual</th>
                <th className="text-left">Candidatas</th>
                <th className="text-right pr-2">Ação</th>
              </tr>
            </thead>
            <tbody>
              {crossSell.map((r) => (
                <tr key={r.cliente.id} className="border-b border-[#F1F3F8]">
                  <td className="py-2 pl-2 nx-text">{r.cliente.razao}</td>
                  <td className="nx-muted">{r.cliente.nicho}</td>
                  <td><Badge variant="outline" className="text-[10px]">{r.marcaAtual}</Badge></td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {r.candidatas.map((m: any) => <Badge key={m.id} className="bg-[#E8EAF6] text-[#2D3A8C] text-[10px]">{m.nome}</Badge>)}
                    </div>
                  </td>
                  <td className="text-right pr-2">
                    <Button size="sm" variant="outline" className="h-7 text-[10px]"
                      onClick={() => {
                        const briefing =
                          `Cross-sell · Expandir mix.\n` +
                          `Cliente: ${r.cliente.razao}\n` +
                          `Nicho: ${r.cliente.nicho}\n` +
                          `Marca atual: ${r.marcaAtual}\n` +
                          `Marcas candidatas: ${r.candidatas.map((m: any) => m.nome).join(", ")}\n` +
                          `Origem: cross_sell (motor de expansão do Painel Gestor).`;
                        setBriefingIni(briefing);
                        setClienteIni(r.cliente.id);
                        setNovaOpOpen(true);
                      }}>
                      <Sparkles className="h-3 w-3 mr-1" /> Criar oportunidade
                    </Button>
                  </td>
                </tr>
              ))}
              {crossSell.length === 0 && (
                <tr><td colSpan={5} className="py-6 text-center text-[11px] nx-muted">Sem candidatos de cross-sell neste escopo.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {pushModalMarca && (
        <CampanhaPushModal
          open={!!pushModalMarca}
          onOpenChange={(b) => !b && setPushModalMarca(null)}
          marca={pushModalMarca}
          repsAlvo={pushReps}
        />
      )}
      <NovaOportunidadeModal
        open={novaOpOpen}
        onOpenChange={setNovaOpOpen}
        briefingInicial={briefingIni}
        clienteIdInicial={clienteIni}
      />
    </div>
  );
}
