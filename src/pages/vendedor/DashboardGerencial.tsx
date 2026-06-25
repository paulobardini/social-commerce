import { useMemo } from "react";
import { useCockpit } from "@/cockpit/contexts/CockpitContext";
import { CockpitTopbar } from "@/cockpit/components/CockpitTopbar";
import { SaudeCarteiraBar } from "@/cockpit/components/SaudeCarteiraBar";
import { SectionCard } from "@/cockpit/components/SectionCard";
import { KpiCard } from "@/cockpit/components/KpiCard";
import { StatusDonut } from "@/cockpit/components/StatusDonut";
import { AgingBars } from "@/cockpit/components/AgingBars";
import { RfvHeatmap } from "@/cockpit/components/RfvHeatmap";
import { AbcCurve } from "@/cockpit/components/AbcCurve";
import { TreemapClientes } from "@/cockpit/components/TreemapClientes";
import { Waterfall } from "@/cockpit/components/Waterfall";
import { FunnelChart } from "@/cockpit/components/FunnelChart";
import { Gauge } from "@/cockpit/components/Gauge";
import { ProgressBar } from "@/cockpit/components/ProgressBar";
import { HeatmapMesRep } from "@/cockpit/components/HeatmapMesRep";
import { StackedBarRep } from "@/cockpit/components/StackedBarRep";
import { MultiLineSerie } from "@/cockpit/components/MultiLineSerie";
import { Sparkline } from "@/cockpit/components/Sparkline";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { kpisCarteira, kpisAtendimento, kpisProduto, kpisMetas } from "@/cockpit/lib/kpis";
import { classificarTudo } from "@/cockpit/lib/classificar";
import { classificarRfv } from "@/cockpit/lib/rfv";
import { agingCarteira, agingOportunidades } from "@/cockpit/lib/aging";
import { curvaAbc } from "@/cockpit/lib/abc";
import { waterfallMovimento, funilRetencao } from "@/cockpit/lib/movimento";
import { funilOportunidades, pipelinePorEtapa, oportunidadesEstagnadas, motivosPerda, ETAPAS_FUNIL, ETAPA_LABEL } from "@/cockpit/lib/funis";
import { serieDiaria, serieMensal, heatmapMesRep } from "@/cockpit/lib/series";
import { CHART_PALETTE, STATUS_COLORS, fmtBRL, fmtBRLc, fmtNum, fmtPct, fmtDias, deltaArrow, deltaColor, NX } from "@/cockpit/styles/tokens";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend as RLegend } from "recharts";
import { AlertTriangle, Users, UserPlus, UserMinus, RefreshCw, TrendingUp, Activity, Phone, MessageCircle, MapPin, Target, Package, DollarSign, Layers } from "lucide-react";
import { differenceInDays } from "date-fns";

export default function DashboardGerencial() {
  const ctx = useCockpit();
  const { seed, range, previousRange, diasAtivo, diasPerdido, comparar } = ctx;

  const cfg = { diasAtivo, diasPerdido, repId: "todos" as const };
  const kpiC = useMemo(() => kpisCarteira(seed, range, previousRange, cfg), [seed, range, previousRange, cfg]);
  const kpiA = useMemo(() => kpisAtendimento(seed, range, previousRange, cfg), [seed, range, previousRange, cfg]);
  const kpiP = useMemo(() => kpisProduto(seed, range, previousRange, cfg), [seed, range, previousRange, cfg]);
  const kpiM = useMemo(() => kpisMetas(seed, range, previousRange, cfg), [seed, range, previousRange, cfg]);

  const classificadas = kpiC.classificadas;
  const dCompara = comparar;

  // Carteira: dados derivados
  const donutData = useMemo(() => ([
    { status: "ativo" as const, valor: kpiC.ativos.atual },
    { status: "inativo" as const, valor: kpiC.inativos.atual },
    { status: "perdido" as const, valor: kpiC.perdidos.atual },
  ]), [kpiC]);

  const agingData = useMemo(() => agingCarteira(classificadas), [classificadas]);

  const nichoData = useMemo(() => {
    const map = new Map<string, number>();
    classificadas.forEach(c => map.set(c.conta.nicho, (map.get(c.conta.nicho) ?? 0) + 1));
    return [...map.entries()].map(([nome, valor]) => ({ nome, valor }));
  }, [classificadas]);

  const treemapClientes = useMemo(() =>
    classificadas
      .filter(c => c.valor12m > 0)
      .sort((a, b) => b.valor12m - a.valor12m)
      .slice(0, 30)
      .map(c => ({ name: c.conta.razao, size: c.valor12m })),
    [classificadas]
  );

  const abcClientes = useMemo(() =>
    curvaAbc(classificadas.filter(c => c.valor12m > 0).map(c => ({ item: c.conta, valor: c.valor12m }))),
    [classificadas]
  );

  const rfv = useMemo(() => classificarRfv(classificadas), [classificadas]);

  const waterfall = useMemo(() => waterfallMovimento(classificadas, range), [classificadas, range]);

  const movimentoMarca = useMemo(() => {
    const map = new Map<string, { marca: string; novos: number; perdidos: number }>();
    seed.marcas.forEach(m => map.set(m.id, { marca: m.nome, novos: 0, perdidos: 0 }));
    classificadas.forEach(c => {
      const ultMarca = seed.pedidos.filter(p => p.contaId === c.conta.id).slice(-1)[0]?.marcaId;
      if (!ultMarca) return;
      const rec = map.get(ultMarca);
      if (!rec) return;
      if (c.novoNoPeriodo) rec.novos++;
      if (c.status === "perdido") rec.perdidos++;
    });
    return [...map.values()];
  }, [classificadas, seed]);

  const funRet = useMemo(() => funilRetencao(classificadas), [classificadas]);

  const serieStatus = useMemo(() => {
    const meses = serieMensal(6, seed.pedidos, seed.hoje);
    return meses.map(m => {
      const recAtivo = seed.contas.filter(c => {
        const ps = seed.pedidos.filter(p => p.contaId === c.id && p.data <= new Date(m.data)).sort((a,b)=>+b.data-+a.data);
        if (!ps.length) return false;
        return differenceInDays(seed.hoje, ps[0].data) <= diasAtivo;
      }).length;
      return { data: m.data, ativos: recAtivo, faturamento: m.valor };
    });
  }, [seed, diasAtivo]);

  const crescAcum = useMemo(() => {
    const meses = serieMensal(6, seed.pedidos, seed.hoje);
    let acc = 0;
    return meses.map(m => {
      const novos = Math.floor(m.valor / 50000); // proxy mock para visual
      const perd = Math.floor(m.valor / 80000);
      acc += novos - perd;
      return { data: m.data, valor: acc };
    });
  }, [seed]);

  // Por representante
  const carteiraRep = useMemo(() => {
    return seed.representantes.map(r => {
      const arr = classificadas.filter(c => c.conta.repId === r.id);
      const ativos = arr.filter(c => c.status === "ativo").length;
      const inativos = arr.filter(c => c.status === "inativo").length;
      const perdidos = arr.filter(c => c.status === "perdido").length;
      const positivados = arr.filter(c => c.positivadoNoPeriodo).length;
      const total = ativos + inativos + perdidos || 1;
      return {
        rep: r.nome, ativo: ativos, inativo: inativos, perdido: perdidos,
        positivados, pctInativos: (inativos / total) * 100,
        spark: Array.from({ length: 12 }, () => Math.floor(Math.random() * 30) + 10),
      };
    });
  }, [seed, classificadas]);

  // Em risco ≤15 dias de virar perdidos
  const emRisco = useMemo(() => {
    return classificadas
      .filter(c => c.status === "inativo")
      .map(c => ({ ...c, diasRestantes: diasPerdido - c.recencia }))
      .filter(c => c.diasRestantes <= 15)
      .sort((a, b) => a.diasRestantes - b.diasRestantes)
      .slice(0, 20);
  }, [classificadas, diasPerdido]);

  // Alertas
  const alertas = useMemo(() => {
    const out: { titulo: string; descricao: string; severity: "danger" | "warn" }[] = [];
    carteiraRep.forEach(r => {
      if (r.pctInativos > 30) out.push({ titulo: `${r.rep} com ${r.pctInativos.toFixed(0)}% da carteira inativa`, descricao: "Acionar plano de cobertura imediato.", severity: "danger" });
    });
    if (kpiC.churn.atual > 15) out.push({ titulo: "Churn acima de 15%", descricao: `Taxa atual de ${fmtPct(kpiC.churn.atual)}. Investigar concentração de perdas.`, severity: "warn" });
    if (kpiC.txReativacao.atual < 5 && (kpiC.inativos.atual + kpiC.perdidos.atual) > 20) out.push({ titulo: "Reativação fraca", descricao: "Menos de 5% da base inativa voltou no período.", severity: "warn" });
    return out;
  }, [carteiraRep, kpiC]);

  // ATENDIMENTO
  const funOp = useMemo(() => funilOportunidades(seed.oportunidades), [seed]);
  const pipeEt = useMemo(() => pipelinePorEtapa(seed.oportunidades), [seed]);
  const opsEst = useMemo(() => oportunidadesEstagnadas(seed.oportunidades, 14, seed.hoje), [seed]);
  const agingOp = useMemo(() => agingOportunidades(seed.oportunidades.filter(o => ETAPAS_FUNIL.includes(o.etapa)), seed.hoje), [seed]);

  const atPorRep = useMemo(() => seed.representantes.map(r => ({
    rep: r.nome,
    atendimentos: seed.atendimentos.filter(a => a.repId === r.id && a.data >= range.from && a.data <= range.to).length,
    leads: seed.atendimentos.filter(a => a.repId === r.id && a.leadOuCliente === "lead" && a.data >= range.from && a.data <= range.to).length,
    clientes: seed.atendimentos.filter(a => a.repId === r.id && a.leadOuCliente === "cliente" && a.data >= range.from && a.data <= range.to).length,
  })), [seed, range]);

  const atPorTipo = useMemo(() => {
    const tipos = ["visita", "ligacao", "whatsapp"] as const;
    return tipos.map(t => ({
      nome: t === "visita" ? "Visita" : t === "ligacao" ? "Ligação" : "WhatsApp",
      valor: seed.atendimentos.filter(a => a.tipo === t && a.data >= range.from && a.data <= range.to).length,
    }));
  }, [seed, range]);

  const coberturaRep = useMemo(() => seed.representantes.map(r => {
    const contasR = seed.contas.filter(c => c.repId === r.id);
    const atendidas = new Set(seed.atendimentos.filter(a => a.repId === r.id && a.data >= range.from && a.data <= range.to).map(a => a.contaId)).size;
    return { rep: r.nome, cobertura: contasR.length > 0 ? (atendidas / contasR.length) * 100 : 0 };
  }), [seed, range]);

  const motivos = useMemo(() => motivosPerda(seed.oportunidades), [seed]);
  const winPorRep = useMemo(() => seed.representantes.map(r => {
    const fechadas = seed.oportunidades.filter(o => o.repId === r.id && (o.etapa === "ganha" || o.etapa === "perdida"));
    const ganhas = fechadas.filter(o => o.etapa === "ganha").length;
    return { rep: r.nome, win: fechadas.length > 0 ? (ganhas / fechadas.length) * 100 : 0 };
  }), [seed]);

  const serieAtend = useMemo(() => {
    const s = serieDiaria(range, seed.atendimentos.map(a => ({ ...a, valor: 1 } as any)), "count");
    return s.map(p => ({ data: p.data, valor: p.valor }));
  }, [range, seed]);

  // PRODUTO
  const faturPorMarca = useMemo(() => {
    return seed.marcas.map(m => ({
      nome: m.nome,
      valor: kpiP.pedidosPeriodo.filter(p => p.marcaId === m.id).reduce((s, p) => s + p.valor, 0),
    })).sort((a, b) => b.valor - a.valor);
  }, [kpiP, seed]);

  const faturPorCategoria = useMemo(() => {
    const map = new Map<string, number>();
    kpiP.pedidosPeriodo.forEach(p => map.set(p.categoria, (map.get(p.categoria) ?? 0) + p.valor));
    return [...map.entries()].map(([nome, valor]) => ({ nome, valor })).sort((a, b) => b.valor - a.valor).slice(0, 12);
  }, [kpiP]);

  const topProdutos = useMemo(() => {
    const map = new Map<string, number>();
    kpiP.pedidosPeriodo.forEach(p => map.set(p.produtoId, (map.get(p.produtoId) ?? 0) + p.valor));
    const arr = [...map.entries()].map(([id, valor]) => ({ nome: id.toUpperCase(), valor })).sort((a, b) => b.valor - a.valor);
    return { top: arr.slice(0, 10), bottom: arr.slice(-10).reverse() };
  }, [kpiP]);

  const abcProduto = useMemo(() => {
    const map = new Map<string, number>();
    kpiP.pedidosPeriodo.forEach(p => map.set(p.produtoId, (map.get(p.produtoId) ?? 0) + p.valor));
    return curvaAbc([...map.entries()].map(([id, valor]) => ({ item: { id }, valor })));
  }, [kpiP]);

  const penetracaoMarca = useMemo(() => {
    const totalBase = classificadas.filter(c => c.status !== "lead").length || 1;
    return seed.marcas.map(m => {
      const contasComMarca = new Set(seed.pedidos.filter(p => p.marcaId === m.id).map(p => p.contaId)).size;
      return { nome: m.nome, pct: (contasComMarca / totalBase) * 100 };
    }).sort((a, b) => b.pct - a.pct);
  }, [seed, classificadas]);

  const heatMarcaNicho = useMemo(() => {
    const nichos = ["Boutique", "Multimarca", "Atacadista", "E-commerce", "Rede", "Franquia"];
    return seed.marcas.map(m => ({
      rep: m.nome,
      cells: nichos.map(n => {
        const contasNicho = new Set(seed.contas.filter(c => c.nicho === n).map(c => c.id));
        const v = seed.pedidos.filter(p => p.marcaId === m.id && contasNicho.has(p.contaId)).reduce((s, p) => s + p.valor, 0);
        return { mes: n.slice(0, 3), valor: v };
      }),
    }));
  }, [seed]);

  const marcasSemGiro = useMemo(() => {
    return seed.representantes.map(r => {
      const semGiro = seed.marcas.filter(m =>
        !kpiP.pedidosPeriodo.some(p => p.repId === r.id && p.marcaId === m.id)
      );
      return { rep: r.nome, marcas: semGiro.map(m => m.nome) };
    });
  }, [seed, kpiP]);

  const sazoMarca = useMemo(() => {
    const meses = serieMensal(6, seed.pedidos, seed.hoje);
    return meses.map(m => {
      const row: Record<string, number | string> = { data: m.data };
      seed.marcas.slice(0, 4).forEach(mk => {
        row[mk.nome] = seed.pedidos.filter(p => p.marcaId === mk.id && p.data.toISOString().startsWith(m.data.split(" ")[0])).reduce((s, p) => s + p.valor, 0);
      });
      return row;
    });
  }, [seed]);

  const recompraColecao = useMemo(() => {
    const cols = ["Verão 25", "Inverno 25", "Resort 25", "Básicos"];
    return cols.map(c => ({
      nome: c,
      valor: new Set(seed.pedidos.filter(p => p.colecao === c).map(p => p.contaId)).size,
    }));
  }, [seed]);

  const ticketCategoria = useMemo(() => {
    const map = new Map<string, { soma: number; n: number }>();
    kpiP.pedidosPeriodo.forEach(p => {
      const r = map.get(p.categoria) ?? { soma: 0, n: 0 };
      r.soma += p.valor; r.n++;
      map.set(p.categoria, r);
    });
    return [...map.entries()].map(([nome, v]) => ({ nome, valor: v.soma / v.n })).sort((a, b) => b.valor - a.valor).slice(0, 10);
  }, [kpiP]);

  // METAS
  const histAting = useMemo(() => {
    const meses = serieMensal(6, seed.pedidos, seed.hoje);
    return meses.map(m => {
      const meta = 900000;
      return { mes: m.data, ating: (m.valor / meta) * 100 };
    });
  }, [seed]);

  const projecaoMes = useMemo(() => {
    const diaAtual = seed.hoje.getDate();
    const diasNoMes = new Date(seed.hoje.getFullYear(), seed.hoje.getMonth() + 1, 0).getDate();
    const real = kpiM.realizado;
    const meta = kpiM.metaFaturamento || 1;
    const arr = [];
    for (let d = 1; d <= diasNoMes; d++) {
      const realAtual = d <= diaAtual ? (real / diaAtual) * d : null;
      const proj = d > diaAtual ? (real / diaAtual) * d : null;
      arr.push({ dia: `${d}`, realizado: realAtual, projetado: proj, meta: (meta / diasNoMes) * d });
    }
    return arr;
  }, [seed, kpiM]);

  const rankingMetas = useMemo(() => {
    return seed.representantes.map(r => {
      const meta = seed.metas.find(m => m.repId === r.id && m.tipo === "faturamento" && m.mes === `${seed.hoje.getFullYear()}-${String(seed.hoje.getMonth() + 1).padStart(2, "0")}`)?.valor ?? 1;
      const inicioMes = new Date(seed.hoje.getFullYear(), seed.hoje.getMonth(), 1);
      const real = seed.pedidos.filter(p => p.repId === r.id && p.data >= inicioMes).reduce((s, p) => s + p.valor, 0);
      return { rep: r.nome, meta, real, pct: (real / meta) * 100 };
    }).sort((a, b) => b.pct - a.pct);
  }, [seed]);

  const atingPorTipo = useMemo(() => {
    return seed.representantes.map(r => ({
      rep: r.nome,
      faturamento: Math.floor(Math.random() * 50) + 60,
      positivacao: Math.floor(Math.random() * 40) + 70,
      cobertura: Math.floor(Math.random() * 35) + 65,
    }));
  }, [seed]);

  // PROGRESSÕES
  const tendFaturamento = useMemo(() => serieMensal(6, seed.pedidos, seed.hoje).map(p => ({ data: p.data, valor: p.valor })), [seed]);

  const yoyMoM = useMemo(() => {
    const meses = serieMensal(6, seed.pedidos, seed.hoje);
    return meses.map((m, i) => ({
      data: m.data,
      atual: m.valor,
      anterior: i > 0 ? meses[i - 1].valor : m.valor * 0.9,
    }));
  }, [seed]);

  const comparativoRep = useMemo(() => {
    const meses = serieMensal(6, seed.pedidos, seed.hoje);
    return meses.map(m => {
      const row: Record<string, number | string> = { data: m.data };
      seed.representantes.forEach(r => {
        row[r.nome] = seed.pedidos.filter(p => p.repId === r.id && p.data.toLocaleString("default", { month: "short", year: "2-digit" }).includes(m.data.split("/")[0])).reduce((s, p) => s + p.valor, 0);
      });
      return row;
    });
  }, [seed]);

  const heatRep = useMemo(() => heatmapMesRep(6, seed.pedidos, seed.representantes, seed.hoje), [seed]);

  const rankingEvolucao = useMemo(() => {
    return seed.representantes.map(r => ({
      rep: r.nome,
      crescimento: Math.floor(Math.random() * 40) - 10,
    })).sort((a, b) => b.crescimento - a.crescimento);
  }, [seed]);

  return (
    <div className="nx-shell min-h-screen">
      <CockpitTopbar title="Painel comercial · Gestor" />
      <div className="px-4 md:px-6 py-4 space-y-4">
        <SaudeCarteiraBar />

        <Tabs defaultValue="carteira" className="space-y-4">
          <TabsList className="bg-white border border-[#E7E9EE] p-1 h-auto">
            <TabsTrigger value="carteira"     className="text-xs data-[state=active]:bg-[#2D3A8C] data-[state=active]:text-white">Carteira</TabsTrigger>
            <TabsTrigger value="atendimento"  className="text-xs data-[state=active]:bg-[#2D3A8C] data-[state=active]:text-white">Atendimento</TabsTrigger>
            <TabsTrigger value="produto"      className="text-xs data-[state=active]:bg-[#2D3A8C] data-[state=active]:text-white">Produto</TabsTrigger>
            <TabsTrigger value="metas"        className="text-xs data-[state=active]:bg-[#2D3A8C] data-[state=active]:text-white">Metas</TabsTrigger>
            <TabsTrigger value="progressoes"  className="text-xs data-[state=active]:bg-[#2D3A8C] data-[state=active]:text-white">Progressões</TabsTrigger>
          </TabsList>

          {/* CARTEIRA */}
          <TabsContent value="carteira" className="space-y-4 mt-0">
            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
              <KpiCard label="Total clientes"     value={fmtNum(kpiC.totalClientes.atual)} delta={dCompara ? { pct: kpiC.totalClientes.delta } : undefined} icon={<Users className="h-3.5 w-3.5" />} />
              <KpiCard label="Leads na base"      value={fmtNum(kpiC.leads.atual)}         delta={dCompara ? { pct: kpiC.leads.delta } : undefined} icon={<UserPlus className="h-3.5 w-3.5" />} />
              <KpiCard label="Ativos"             value={fmtNum(kpiC.ativos.atual)}        delta={dCompara ? { pct: kpiC.ativos.delta } : undefined} />
              <KpiCard label="Inativos"           value={fmtNum(kpiC.inativos.atual)}      delta={dCompara ? { pct: kpiC.inativos.delta, invert: true } : undefined} />
              <KpiCard label="Perdidos"           value={fmtNum(kpiC.perdidos.atual)}      delta={dCompara ? { pct: kpiC.perdidos.delta, invert: true } : undefined} icon={<UserMinus className="h-3.5 w-3.5" />} />
              <KpiCard label="Novos"              value={fmtNum(kpiC.novos.atual)}         delta={dCompara ? { pct: kpiC.novos.delta } : undefined} />
              <KpiCard label="Reativados"         value={fmtNum(kpiC.reativados.atual)}    delta={dCompara ? { pct: kpiC.reativados.delta } : undefined} icon={<RefreshCw className="h-3.5 w-3.5" />} />
              <KpiCard label="Positivados"        value={fmtNum(kpiC.positivados.atual)}   delta={dCompara ? { pct: kpiC.positivados.delta } : undefined} />
              <KpiCard label="Tx. positivação"    value={fmtPct(kpiC.txPositivacao.atual)} delta={dCompara ? { pct: kpiC.txPositivacao.delta } : undefined} />
              <KpiCard label="Churn rate"         value={fmtPct(kpiC.churn.atual)}         delta={dCompara ? { pct: kpiC.churn.delta, invert: true } : undefined} />
              <KpiCard label="Tx. reativação"     value={fmtPct(kpiC.txReativacao.atual)}  delta={dCompara ? { pct: kpiC.txReativacao.delta } : undefined} />
              <KpiCard label="Recência média"     value={fmtDias(kpiC.recenciaMedia.atual)} delta={dCompara ? { pct: kpiC.recenciaMedia.delta, invert: true } : undefined} />
              <KpiCard label="Ticket médio/cli."  value={fmtBRLc(kpiC.ticketMedio.atual)}   delta={dCompara ? { pct: kpiC.ticketMedio.delta } : undefined} />
              <KpiCard label="Frequência média"   value={kpiC.frequenciaMedia.atual.toFixed(1).replace(".", ",")} hint="pedidos/cliente 12m" delta={dCompara ? { pct: kpiC.frequenciaMedia.delta } : undefined} />
            </div>

            {/* Composição */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <SectionCard title="Distribuição por status">
                <StatusDonut data={donutData} />
              </SectionCard>
              <SectionCard title="Aging da carteira" subtitle="Recência do último pedido">
                <AgingBars data={agingData} />
              </SectionCard>
              <SectionCard title="Distribuição por nicho">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={nichoData} dataKey="valor" nameKey="nome" outerRadius={80} label={{ fontSize: 10 }}>
                      {nichoData.map((_, i) => <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#fff", border: "1px solid #E7E9EE", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => fmtNum(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </SectionCard>
              <SectionCard title="Top clientes" subtitle="Curva ABC por valor (12m)" action={
                <div className="flex gap-1 text-[10px]">
                  <Badge style={{ background: "#16A34A", color: "#fff" }}>A {abcClientes.filter(r => r.classe === "A").length}</Badge>
                  <Badge style={{ background: "#F59E0B", color: "#fff" }}>B {abcClientes.filter(r => r.classe === "B").length}</Badge>
                  <Badge style={{ background: "#DC2626", color: "#fff" }}>C {abcClientes.filter(r => r.classe === "C").length}</Badge>
                </div>
              }>
                <TreemapClientes data={treemapClientes} />
              </SectionCard>
            </div>

            {/* RFV */}
            <SectionCard title="Matriz RFV" subtitle="Recência × Frequência × Valor (12 meses)">
              <RfvHeatmap cells={rfv} />
            </SectionCard>

            {/* Movimento */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <SectionCard title="Movimentação líquida" subtitle="Novos + reativados − perdidos">
                <Waterfall data={waterfall} />
              </SectionCard>
              <SectionCard title="Evolução por status" subtitle="Ativos e faturamento — últimos 6 meses">
                <MultiLineSerie
                  data={serieStatus}
                  series={[{ key: "ativos", nome: "Ativos", color: STATUS_COLORS.ativo }]}
                  fmtY={fmtNum}
                />
              </SectionCard>
              <SectionCard title="Movimentação por marca">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={movimentoMarca}>
                    <CartesianGrid stroke="#F1F3F8" vertical={false} />
                    <XAxis dataKey="marca" tick={{ fontSize: 10, fill: NX.muted }} angle={-20} textAnchor="end" height={50} interval={0} />
                    <YAxis tick={{ fontSize: 10, fill: NX.muted }} />
                    <Tooltip contentStyle={{ background: "#fff", border: "1px solid #E7E9EE", borderRadius: 8, fontSize: 12 }} />
                    <RLegend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="novos" name="Novos" fill="#16A34A" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="perdidos" name="Perdidos" fill="#DC2626" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </SectionCard>
              <SectionCard title="Funil de retenção">
                <FunnelChart etapas={funRet.map(f => ({ etapa: f.etapa, valor: f.valor }))} taxas={funRet.map((f, i) => i === 0 ? null : funRet[i-1].valor > 0 ? (f.valor / funRet[i-1].valor) * 100 : 0)} />
              </SectionCard>
              <SectionCard className="lg:col-span-2" title="Crescimento líquido acumulado" subtitle="Entradas − saídas">
                <MultiLineSerie data={crescAcum} series={[{ key: "valor", nome: "Saldo líquido" }]} fmtY={fmtNum} height={180} />
              </SectionCard>
            </div>

            {/* Por representante */}
            <SectionCard title="Carteira por representante" subtitle="Distribuição Ativo / Inativo / Perdido">
              <StackedBarRep data={carteiraRep} />
            </SectionCard>
            <SectionCard title="Tabela por representante">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="text-[10px] uppercase nx-muted border-b border-[#E7E9EE]">
                    <tr><th className="text-left py-2">Representante</th><th className="text-right">Ativos</th><th className="text-right">Inativos</th><th className="text-right">Perdidos</th><th className="text-right">Positivados</th><th className="text-right">% inativa</th><th className="text-center">30d</th></tr>
                  </thead>
                  <tbody>
                    {carteiraRep.map(r => (
                      <tr key={r.rep} className="border-b border-[#F1F3F8]">
                        <td className="py-2 nx-text font-medium">{r.rep}</td>
                        <td className="text-right nx-num">{fmtNum(r.ativo)}</td>
                        <td className="text-right nx-num">{fmtNum(r.inativo)}</td>
                        <td className="text-right nx-num">{fmtNum(r.perdido)}</td>
                        <td className="text-right nx-num">{fmtNum(r.positivados)}</td>
                        <td className="text-right nx-num"><span className={r.pctInativos > 30 ? "text-amber-600 font-semibold" : ""}>{fmtPct(r.pctInativos, 0)}</span></td>
                        <td className="flex justify-center py-2"><Sparkline data={r.spark} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>

            {/* Ação */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <SectionCard className="lg:col-span-2" title="Clientes em risco" subtitle="Inativos a ≤15 dias de virar perdidos">
                <div className="overflow-x-auto max-h-[280px] overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead className="text-[10px] uppercase nx-muted border-b border-[#E7E9EE] sticky top-0 bg-white">
                      <tr><th className="text-left py-2">Cliente</th><th className="text-left">Rep</th><th className="text-right">Dias restantes</th><th className="text-right">Valor 12m</th></tr>
                    </thead>
                    <tbody>
                      {emRisco.length === 0 && <tr><td colSpan={4} className="py-6 text-center nx-muted text-xs">Nenhum cliente em risco neste período</td></tr>}
                      {emRisco.map(c => {
                        const repNome = seed.representantes.find(r => r.id === c.conta.repId)?.nome ?? "—";
                        return (
                          <tr key={c.conta.id} className="border-b border-[#F1F3F8]">
                            <td className="py-2 nx-text">{c.conta.razao}</td>
                            <td className="nx-muted">{repNome}</td>
                            <td className="text-right">
                              <Badge className={c.diasRestantes <= 5 ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}>{c.diasRestantes}d</Badge>
                            </td>
                            <td className="text-right nx-num">{fmtBRLc(c.valor12m)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </SectionCard>
              <SectionCard title="Alertas gerenciais">
                <div className="space-y-2">
                  {alertas.length === 0 && <p className="text-xs nx-muted">Nenhum alerta no momento.</p>}
                  {alertas.map((a, i) => (
                    <div key={i} className={`p-2.5 rounded-lg border text-[11px] ${a.severity === "danger" ? "bg-rose-50 border-rose-200" : "bg-amber-50 border-amber-200"}`}>
                      <div className="flex items-start gap-2">
                        <AlertTriangle className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${a.severity === "danger" ? "text-rose-600" : "text-amber-600"}`} />
                        <div>
                          <p className="font-semibold nx-text">{a.titulo}</p>
                          <p className="nx-muted mt-0.5">{a.descricao}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>
          </TabsContent>

          {/* ATENDIMENTO */}
          <TabsContent value="atendimento" className="space-y-4 mt-0">
            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3">
              <KpiCard label="Cobertura" value={fmtPct(kpiA.cobertura.atual)} delta={dCompara ? { pct: kpiA.cobertura.delta } : undefined} icon={<Activity className="h-3.5 w-3.5" />} />
              <KpiCard label="Atendimentos" value={fmtNum(kpiA.nAtendimentos.atual)} delta={dCompara ? { pct: kpiA.nAtendimentos.delta } : undefined} />
              <KpiCard label="A leads" value={fmtNum(kpiA.aLeads.atual)} delta={dCompara ? { pct: kpiA.aLeads.delta } : undefined} />
              <KpiCard label="A clientes" value={fmtNum(kpiA.aClientes.atual)} delta={dCompara ? { pct: kpiA.aClientes.delta } : undefined} />
              <KpiCard label="Conv. Lead→Cliente" value={fmtPct(kpiA.txConversao.atual)} delta={dCompara ? { pct: kpiA.txConversao.delta } : undefined} />
              <KpiCard label="Ciclo de vendas" value={fmtDias(kpiA.ciclo.atual)} />
              <KpiCard label="Win rate" value={fmtPct(kpiA.winRate.atual)} icon={<Target className="h-3.5 w-3.5" />} />
              <KpiCard label="Ticket oportunidade" value={fmtBRLc(kpiA.ticketOportunidade.atual)} />
              <KpiCard label="Oport. abertas" value={fmtNum(kpiA.opsAbertas.atual)} />
              <KpiCard label="Pipeline R$" value={fmtBRLc(kpiA.pipelineRS.atual)} icon={<DollarSign className="h-3.5 w-3.5" />} />
              <KpiCard label="Tempo médio etapa" value={fmtDias(kpiA.tempoMedioEtapa.atual)} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <SectionCard title="Funil de oportunidades" subtitle="Taxa de conversão entre etapas">
                <FunnelChart etapas={funOp.counts.map(c => ({ etapa: c.etapa, valor: c.valor, receita: c.receita }))} taxas={funOp.taxas} money />
              </SectionCard>
              <SectionCard title="Pipeline por etapa (R$)">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={pipeEt}>
                    <CartesianGrid stroke="#F1F3F8" vertical={false} />
                    <XAxis dataKey="etapa" tick={{ fontSize: 10, fill: NX.muted }} angle={-15} textAnchor="end" height={50} interval={0} />
                    <YAxis tick={{ fontSize: 10, fill: NX.muted }} tickFormatter={fmtBRLc} />
                    <Tooltip contentStyle={{ background: "#fff", border: "1px solid #E7E9EE", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => fmtBRL(v)} />
                    <Bar dataKey="valor" fill={NX.primary} radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </SectionCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <SectionCard title="Oportunidades estagnadas" subtitle="Mais de 14 dias na mesma etapa">
                <div className="overflow-x-auto max-h-[280px] overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead className="text-[10px] uppercase nx-muted border-b border-[#E7E9EE] sticky top-0 bg-white">
                      <tr><th className="text-left py-2">Op</th><th>Cliente</th><th>Etapa</th><th className="text-right">Dias</th><th className="text-right">Valor</th></tr>
                    </thead>
                    <tbody>
                      {opsEst.slice(0, 15).map(o => {
                        const cliente = seed.contas.find(c => c.id === o.contaId);
                        return (
                          <tr key={o.id} className="border-b border-[#F1F3F8]">
                            <td className="py-2 nx-text font-medium">{o.id}</td>
                            <td className="nx-muted">{cliente?.razao}</td>
                            <td className="nx-muted">{ETAPA_LABEL[o.etapa]}</td>
                            <td className="text-right"><Badge className="bg-rose-100 text-rose-700">{o.diasParada}d</Badge></td>
                            <td className="text-right nx-num">{fmtBRLc(o.valor)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </SectionCard>
              <SectionCard title="Aging de oportunidades abertas">
                <AgingBars data={agingOp} color={NX.accent} />
              </SectionCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <SectionCard title="Atendimentos por representante">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={atPorRep}>
                    <CartesianGrid stroke="#F1F3F8" vertical={false} />
                    <XAxis dataKey="rep" tick={{ fontSize: 10 }} angle={-15} textAnchor="end" height={50} interval={0} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: "#fff", border: "1px solid #E7E9EE", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="atendimentos" fill={NX.primary} radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </SectionCard>
              <SectionCard title="Atendimentos por tipo">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={atPorTipo} dataKey="valor" nameKey="nome" outerRadius={80} label={{ fontSize: 10 }}>
                      {atPorTipo.map((_, i) => <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#fff", border: "1px solid #E7E9EE", borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </SectionCard>
              <SectionCard title="Lead vs Cliente por rep">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={atPorRep}>
                    <CartesianGrid stroke="#F1F3F8" vertical={false} />
                    <XAxis dataKey="rep" tick={{ fontSize: 10 }} angle={-15} textAnchor="end" height={50} interval={0} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: "#fff", border: "1px solid #E7E9EE", borderRadius: 8, fontSize: 12 }} />
                    <RLegend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="leads" name="Leads" fill={STATUS_COLORS.lead} />
                    <Bar dataKey="clientes" name="Clientes" fill={STATUS_COLORS.ativo} />
                  </BarChart>
                </ResponsiveContainer>
              </SectionCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <SectionCard title="Evolução de atendimentos" subtitle="No período selecionado">
                <MultiLineSerie data={serieAtend} series={[{ key: "valor", nome: "Atendimentos" }]} fmtY={fmtNum} />
              </SectionCard>
              <SectionCard title="Cobertura por representante">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={coberturaRep} layout="vertical">
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
                    <YAxis type="category" dataKey="rep" tick={{ fontSize: 10 }} width={100} />
                    <Tooltip formatter={(v: number) => fmtPct(v)} contentStyle={{ background: "#fff", border: "1px solid #E7E9EE", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="cobertura" fill={NX.primary} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </SectionCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <SectionCard title="Motivos de perda">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={motivos.map(m => ({ nome: m.motivo, valor: m.qtd }))} dataKey="valor" nameKey="nome" outerRadius={80} label={{ fontSize: 10 }}>
                      {motivos.map((_, i) => <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#fff", border: "1px solid #E7E9EE", borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </SectionCard>
              <SectionCard title="Win rate por representante">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={winPorRep} layout="vertical">
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
                    <YAxis type="category" dataKey="rep" tick={{ fontSize: 10 }} width={100} />
                    <Tooltip formatter={(v: number) => fmtPct(v)} contentStyle={{ background: "#fff", border: "1px solid #E7E9EE", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="win" fill={STATUS_COLORS.ativo} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </SectionCard>
              <SectionCard title="Funil Lead vs Cliente">
                <div className="space-y-3">
                  <div>
                    <p className="text-[10px] uppercase nx-muted mb-1">Prospecção (Lead)</p>
                    <FunnelChart etapas={[{ etapa: "Lead", valor: kpiA.aLeads.atual }, { etapa: "Convertido", valor: Math.round(kpiA.aLeads.atual * (kpiA.txConversao.atual / 100)) }]} taxas={[null, kpiA.txConversao.atual]} color={STATUS_COLORS.lead} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase nx-muted mb-1">Fidelização (Cliente)</p>
                    <FunnelChart etapas={[{ etapa: "Contatado", valor: kpiA.aClientes.atual }, { etapa: "Recomprou", valor: Math.round(kpiA.aClientes.atual * 0.42) }]} taxas={[null, 42]} color={STATUS_COLORS.ativo} />
                  </div>
                </div>
              </SectionCard>
            </div>
          </TabsContent>

          {/* PRODUTO */}
          <TabsContent value="produto" className="space-y-4 mt-0">
            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-3">
              <KpiCard label="Faturamento" value={fmtBRLc(kpiP.faturamento.atual)} delta={dCompara ? { pct: kpiP.faturamento.delta } : undefined} icon={<DollarSign className="h-3.5 w-3.5" />} />
              <KpiCard label="Marcas ativas" value={fmtNum(kpiP.marcasAtivas.atual)} delta={dCompara ? { pct: kpiP.marcasAtivas.delta } : undefined} icon={<Layers className="h-3.5 w-3.5" />} />
              <KpiCard label="Ticket por marca" value={fmtBRLc(kpiP.ticketMarca.atual)} delta={dCompara ? { pct: kpiP.ticketMarca.delta } : undefined} />
              <KpiCard label="Cross-sell" value={kpiP.crossSell.atual.toFixed(1).replace(".", ",")} hint="marcas/cliente" />
              <KpiCard label="Marca líder" value={<span className="text-base">{kpiP.marcaLider}</span>} />
              <KpiCard label="Maior crescimento" value={<span className="text-base">{kpiP.maiorCrescimento}</span>} />
              <KpiCard label="Maior queda" value={<span className="text-base">{kpiP.maiorQueda}</span>} />
              <KpiCard label="Itens/pedido" value={kpiP.itensPorPedido.atual.toFixed(1).replace(".", ",")} delta={dCompara ? { pct: kpiP.itensPorPedido.delta } : undefined} icon={<Package className="h-3.5 w-3.5" />} />
              <KpiCard label="% marca top" value={fmtPct(kpiP.concentracaoTop.atual)} delta={dCompara ? { pct: kpiP.concentracaoTop.delta, invert: true } : undefined} hint="concentração" />
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
              <SectionCard title="Faturamento por categoria/coleção">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={faturPorCategoria}>
                    <CartesianGrid stroke="#F1F3F8" vertical={false} />
                    <XAxis dataKey="nome" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={50} interval={0} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={fmtBRLc} />
                    <Tooltip formatter={(v: number) => fmtBRL(v)} contentStyle={{ background: "#fff", border: "1px solid #E7E9EE", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="valor" fill={NX.accent} radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </SectionCard>
            </div>

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

            <SectionCard title="Curva ABC de produtos" subtitle="Concentração de receita">
              <AbcCurve data={abcProduto} labelKey={(t: { id: string }) => t.id.toUpperCase()} />
            </SectionCard>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <SectionCard title="Penetração de marca" subtitle="% da base que compra cada marca">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={penetracaoMarca} layout="vertical">
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
                    <YAxis type="category" dataKey="nome" tick={{ fontSize: 11 }} width={90} />
                    <Tooltip formatter={(v: number) => fmtPct(v)} contentStyle={{ background: "#fff", border: "1px solid #E7E9EE", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="pct" fill={NX.primary} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </SectionCard>
              <SectionCard title="Marca × Nicho" subtitle="Heatmap de receita">
                <HeatmapMesRep data={heatMarcaNicho} />
              </SectionCard>
            </div>

            <SectionCard title="Marcas sem giro" subtitle="Por representante (período)">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="text-[10px] uppercase nx-muted border-b border-[#E7E9EE]">
                    <tr><th className="text-left py-2">Representante</th><th className="text-left">Marcas sem venda</th></tr>
                  </thead>
                  <tbody>
                    {marcasSemGiro.map(r => (
                      <tr key={r.rep} className="border-b border-[#F1F3F8]">
                        <td className="py-2 nx-text font-medium">{r.rep}</td>
                        <td className="py-2">
                          {r.marcas.length === 0 ? <span className="nx-muted text-[11px]">Vendeu todas as marcas</span> :
                            <div className="flex flex-wrap gap-1">{r.marcas.map(m => <Badge key={m} variant="outline" className="text-[10px]">{m}</Badge>)}</div>
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <SectionCard title="Sazonalidade por marca">
                <MultiLineSerie data={sazoMarca} series={seed.marcas.slice(0, 4).map((m, i) => ({ key: m.nome, nome: m.nome, color: CHART_PALETTE[i] }))} fmtY={fmtBRLc} />
              </SectionCard>
              <SectionCard title="Recompra por coleção">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={recompraColecao}>
                    <CartesianGrid stroke="#F1F3F8" vertical={false} />
                    <XAxis dataKey="nome" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: "#fff", border: "1px solid #E7E9EE", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="valor" fill={NX.accent} radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </SectionCard>
            </div>

            <SectionCard title="Ticket médio por categoria">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={ticketCategoria}>
                  <CartesianGrid stroke="#F1F3F8" vertical={false} />
                  <XAxis dataKey="nome" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={50} interval={0} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={fmtBRLc} />
                  <Tooltip formatter={(v: number) => fmtBRL(v)} contentStyle={{ background: "#fff", border: "1px solid #E7E9EE", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="valor" fill={NX.primary} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </SectionCard>
          </TabsContent>

          {/* METAS */}
          <TabsContent value="metas" className="space-y-4 mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <SectionCard className="lg:col-span-1" title="Atingimento meta de faturamento" subtitle={`Meta ${fmtBRL(kpiM.metaFaturamento)} · Realizado ${fmtBRL(kpiM.realizado)}`}>
                <Gauge value={kpiM.atingimento} label="Atingimento" size={220} />
                <p className="text-center text-[11px] nx-muted mt-2">Pace projetado: <span className={`font-semibold nx-num ${deltaColor(kpiM.paceAtingimento - 100)}`}>{fmtPct(kpiM.paceAtingimento, 0)} ({fmtBRLc(kpiM.projecao)})</span></p>
              </SectionCard>
              <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-3 content-start">
                <KpiCard label="Gap para meta" value={fmtBRLc(kpiM.gap)} hint="restam alcançar" />
                <KpiCard label="Dias úteis restantes" value={fmtNum(kpiM.diasRestantes)} hint="até fim do mês" />
                <KpiCard label="R$/dia necessário" value={fmtBRLc(kpiM.rsPorDia)} />
                <KpiCard label="Atingimento atual" value={fmtPct(kpiM.atingimento)} />
                <KpiCard label="Meta positivação" value="68%" hint="atingido" />
                <KpiCard label="Meta cobertura" value="74%" hint="atingido" />
                <KpiCard label="Meta novos clientes" value="82%" hint="atingido" />
                <KpiCard label="Meta reativação" value="55%" hint="atingido" />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <SectionCard className="lg:col-span-2" title="Realizado × Projetado × Meta (mês atual)">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={projecaoMes}>
                    <CartesianGrid stroke="#F1F3F8" vertical={false} />
                    <XAxis dataKey="dia" tick={{ fontSize: 9 }} interval={2} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={fmtBRLc} />
                    <Tooltip formatter={(v: number) => v == null ? "—" : fmtBRL(v)} contentStyle={{ background: "#fff", border: "1px solid #E7E9EE", borderRadius: 8, fontSize: 12 }} />
                    <RLegend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="realizado" name="Realizado" fill={NX.primary} stackId="a" />
                    <Bar dataKey="projetado" name="Projetado" fill="#94A3B8" stackId="a" />
                    <Bar dataKey="meta" name="Meta diária" fill={NX.accent} fillOpacity={0.2} />
                  </BarChart>
                </ResponsiveContainer>
              </SectionCard>
              <SectionCard title="Histórico de atingimento" subtitle="Últimos 6 meses">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={histAting}>
                    <CartesianGrid stroke="#F1F3F8" vertical={false} />
                    <XAxis dataKey="mes" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${v.toFixed(0)}%`} />
                    <Tooltip formatter={(v: number) => fmtPct(v)} contentStyle={{ background: "#fff", border: "1px solid #E7E9EE", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="ating" radius={[3, 3, 0, 0]}>
                      {histAting.map((d, i) => <Cell key={i} fill={d.ating >= 100 ? "#16A34A" : d.ating >= 75 ? "#F59E0B" : "#DC2626"} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </SectionCard>
            </div>

            <SectionCard title="Ranking por representante">
              <div className="space-y-2">
                {rankingMetas.map((r, i) => (
                  <div key={r.rep} className="flex items-center gap-3 bg-[#F6F7F9] rounded-lg px-3 py-2">
                    <span className="text-[10px] font-bold nx-muted w-5">#{i + 1}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium nx-text">{r.rep}</span>
                        <span className="text-[11px] nx-muted nx-num">{fmtBRLc(r.real)} / {fmtBRLc(r.meta)}</span>
                      </div>
                      <ProgressBar value={r.pct} color={r.pct >= 100 ? "#16A34A" : r.pct >= 75 ? "#F59E0B" : "#DC2626"} />
                    </div>
                    <span className={`text-xs font-semibold nx-num w-16 text-right ${r.pct >= 100 ? "text-emerald-600" : "nx-text"}`}>{fmtPct(r.pct, 0)}</span>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Atingimento por tipo de meta × representante">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={atingPorTipo}>
                  <CartesianGrid stroke="#F1F3F8" vertical={false} />
                  <XAxis dataKey="rep" tick={{ fontSize: 10 }} angle={-15} textAnchor="end" height={50} interval={0} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
                  <Tooltip formatter={(v: number) => fmtPct(v)} contentStyle={{ background: "#fff", border: "1px solid #E7E9EE", borderRadius: 8, fontSize: 12 }} />
                  <RLegend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="faturamento" name="Faturamento" fill={NX.primary} />
                  <Bar dataKey="positivacao" name="Positivação" fill={STATUS_COLORS.ativo} />
                  <Bar dataKey="cobertura" name="Cobertura" fill={NX.accent} />
                </BarChart>
              </ResponsiveContainer>
            </SectionCard>
          </TabsContent>

          {/* PROGRESSÕES */}
          <TabsContent value="progressoes" className="space-y-4 mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <SectionCard title="Faturamento (6 meses)">
                <MultiLineSerie data={tendFaturamento} series={[{ key: "valor", nome: "Faturamento" }]} fmtY={fmtBRLc} />
              </SectionCard>
              <SectionCard title="Comparativo MoM / YoY">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={yoyMoM}>
                    <CartesianGrid stroke="#F1F3F8" vertical={false} />
                    <XAxis dataKey="data" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={fmtBRLc} />
                    <Tooltip formatter={(v: number) => fmtBRL(v)} contentStyle={{ background: "#fff", border: "1px solid #E7E9EE", borderRadius: 8, fontSize: 12 }} />
                    <RLegend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="atual" name="Período atual" fill={NX.primary} />
                    <Bar dataKey="anterior" name="Período anterior" fill="#94A3B8" />
                  </BarChart>
                </ResponsiveContainer>
              </SectionCard>
            </div>

            <SectionCard title="Tabela comparativa completa">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="text-[10px] uppercase nx-muted border-b border-[#E7E9EE]">
                    <tr><th className="text-left py-2">Métrica</th><th className="text-right">Atual</th><th className="text-right">Anterior</th><th className="text-right">Δ %</th></tr>
                  </thead>
                  <tbody>
                    {[
                      ["Total clientes", kpiC.totalClientes],
                      ["Ativos", kpiC.ativos],
                      ["Inativos", kpiC.inativos, true],
                      ["Perdidos", kpiC.perdidos, true],
                      ["Novos", kpiC.novos],
                      ["Reativados", kpiC.reativados],
                      ["Positivados", kpiC.positivados],
                      ["Tx. positivação", kpiC.txPositivacao, false, "pct"],
                      ["Churn", kpiC.churn, true, "pct"],
                      ["Faturamento", kpiP.faturamento, false, "brl"],
                      ["Cobertura", kpiA.cobertura, false, "pct"],
                      ["Conversão Lead→Cliente", kpiA.txConversao, false, "pct"],
                    ].map(([nome, v, invert, kind]: any) => (
                      <tr key={nome} className="border-b border-[#F1F3F8]">
                        <td className="py-2 nx-text">{nome}</td>
                        <td className="text-right nx-num">{kind === "pct" ? fmtPct(v.atual) : kind === "brl" ? fmtBRLc(v.atual) : fmtNum(v.atual)}</td>
                        <td className="text-right nx-num nx-muted">{kind === "pct" ? fmtPct(v.anterior) : kind === "brl" ? fmtBRLc(v.anterior) : fmtNum(v.anterior)}</td>
                        <td className={`text-right nx-num font-medium ${deltaColor(v.delta, invert)}`}>{deltaArrow(v.delta)} {fmtPct(Math.abs(v.delta), 1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>

            <SectionCard title="Comparativo entre representantes" subtitle="Faturamento mensal">
              <MultiLineSerie data={comparativoRep} series={seed.representantes.map((r, i) => ({ key: r.nome, nome: r.nome, color: CHART_PALETTE[i] }))} fmtY={fmtBRLc} height={260} />
            </SectionCard>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <SectionCard title="Crescimento líquido acumulado">
                <MultiLineSerie data={crescAcum} series={[{ key: "valor", nome: "Saldo (novos − perdidos)" }]} fmtY={fmtNum} />
              </SectionCard>
              <SectionCard title="Ranking de evolução" subtitle="Crescimento % no período">
                <div className="space-y-1.5">
                  {rankingEvolucao.map((r, i) => (
                    <div key={r.rep} className="flex items-center gap-2 bg-[#F6F7F9] rounded-md px-3 py-1.5">
                      <span className="text-[10px] nx-muted w-5">#{i + 1}</span>
                      <span className="flex-1 text-xs nx-text">{r.rep}</span>
                      <span className={`text-xs font-semibold nx-num ${deltaColor(r.crescimento)}`}>{deltaArrow(r.crescimento)} {fmtPct(Math.abs(r.crescimento), 0)}</span>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>

            <SectionCard title="Performance mensal por representante" subtitle="Faturamento — últimos 6 meses">
              <HeatmapMesRep data={heatRep} />
            </SectionCard>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
