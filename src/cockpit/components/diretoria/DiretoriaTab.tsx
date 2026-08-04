// Dashboard Diretoria — consolidado do negócio antes de abrir os pilares
// (Carteira · Atendimento · Produto). Leitura de topo: número grande + "i".
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip as RechartsTooltip,
} from "recharts";
import { ArrowRight, Users, MessageSquare, Package } from "lucide-react";
import { useCockpit } from "../../contexts/CockpitContext";
import { repIdsNoEscopo } from "../../lib/escopo";
import { classificarTudo } from "../../lib/classificar";
import { kpisAtendimento, kpisProduto } from "../../lib/kpis";
import {
  resumoExecutivo, concentracao, riscoReceita, serieReceitaMensal, receitaPorRegiao, ponteReceita,
} from "../../lib/executivo";
import { analyticsWhatsApp, fmtMin } from "../../lib/whatsapp";
import { ofertasPorProduto, resumoOfertas } from "../../lib/ofertas";
import { NX, fmtBRLc, fmtNum, fmtPct, fmtDias, deltaArrow, deltaColor } from "../../styles/tokens";
import { SectionCard } from "../SectionCard";
import { ExecTile, ExecHero, ExecBarRow } from "../ExecTiles";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function PilarCard({
  icon: Icon, titulo, resumo, linhas, onOpen,
}: {
  icon: typeof Users;
  titulo: string;
  resumo: string;
  linhas: { label: string; valor: string; delta?: number; invert?: boolean }[];
  onOpen: () => void;
}) {
  return (
    <SectionCard
      title={
        <span className="flex items-center gap-2">
          <Icon className="w-4 h-4 nx-muted" /> {titulo}
        </span>
      }
      subtitle={resumo}
      action={
        <Button variant="ghost" size="sm" className="text-[11px] h-7 px-2" onClick={onOpen}>
          Abrir <ArrowRight className="w-3 h-3 ml-1" />
        </Button>
      }
    >
      <div className="space-y-2">
        {linhas.map(l => (
          <div key={l.label} className="flex items-baseline justify-between gap-2 border-b border-[#EEF0F4] last:border-0 pb-1.5 last:pb-0">
            <span className="text-[11px] nx-muted">{l.label}</span>
            <span className="flex items-baseline gap-1.5">
              <span className="text-base font-semibold nx-num nx-text">{l.valor}</span>
              {l.delta !== undefined && (
                <span className={cn("text-[10px] nx-num", deltaColor(l.delta, l.invert))}>
                  {deltaArrow(l.delta)} {fmtPct(Math.abs(l.delta), 0)}
                </span>
              )}
            </span>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

export function DiretoriaTab() {
  const { seed, escopo, range, previousRange, diasAtivo, diasPerdido } = useCockpit();
  const navigate = useNavigate();

  const d = useMemo(() => {
    const ids = repIdsNoEscopo(seed, escopo);
    const contas = seed.contas.filter(c => ids.has(c.repId));
    const pedidos = seed.pedidos.filter(p => ids.has(p.repId));
    const classificadas = classificarTudo(contas, pedidos, range, diasAtivo, diasPerdido, seed.hoje);
    const pedidosPeriodo = pedidos.filter(p => p.data >= range.from && p.data <= range.to);
    const pedidosPrev = pedidos.filter(p => p.data >= previousRange.from && p.data <= previousRange.to);
    const classificadasPrev = classificarTudo(contas, pedidos, previousRange, diasAtivo, diasPerdido, previousRange.to);
    return {
      classificadasPrev,
      concPrev: concentracao(classificadasPrev),
      wppPrev: analyticsWhatsApp(seed, previousRange, ids),
      ofertasPrev: resumoOfertas(ofertasPorProduto(seed, pedidosPrev)),
      riscoPrev: riscoReceita(classificadasPrev, diasAtivo),
      resumo: resumoExecutivo(pedidos, range, previousRange),
      ponte: ponteReceita(pedidos, range, previousRange),
      conc: concentracao(classificadas),
      risco: riscoReceita(classificadas, diasAtivo),
      serie: serieReceitaMensal(pedidos, seed.hoje),
      regioes: receitaPorRegiao(seed, pedidos, range, previousRange),
      classificadas,
      baseTotal: classificadas.length,
      wpp: analyticsWhatsApp(seed, range, ids),
      ofertas: resumoOfertas(ofertasPorProduto(seed, pedidosPeriodo)),
      repIds: ids,
    };
  }, [seed, escopo, range, previousRange, diasAtivo, diasPerdido]);

  const kpiA = useMemo(
    () => kpisAtendimento(seed, range, previousRange, { diasAtivo, diasPerdido, repId: "todos" }),
    [seed, range, previousRange, diasAtivo, diasPerdido],
  );
  const kpiP = useMemo(
    () => kpisProduto(seed, range, previousRange, { diasAtivo, diasPerdido, repId: "todos" }),
    [seed, range, previousRange, diasAtivo, diasPerdido],
  );

  const {
    resumo, ponte, conc, risco, serie, regioes, classificadas, baseTotal, wpp, ofertas,
    classificadasPrev, concPrev, wppPrev, ofertasPrev, riscoPrev,
  } = d;

  // variação relativa (%) entre dois valores; 0 quando não há base de comparação
  const varPct = (atual: number, anterior: number) =>
    anterior === 0 ? 0 : ((atual - anterior) / anterior) * 100;

  const cobertura = baseTotal ? (resumo.clientesCompraram / baseTotal) * 100 : 0;
  const deltaClientes = resumo.clientesCompraramPrev
    ? ((resumo.clientesCompraram - resumo.clientesCompraramPrev) / resumo.clientesCompraramPrev) * 100
    : 0;
  const ticketCliente = resumo.clientesCompraram ? resumo.receitaAtual / resumo.clientesCompraram : 0;
  const pedidosPorCliente = resumo.clientesCompraram ? resumo.pedidos / resumo.clientesCompraram : 0;

  const ativos = classificadas.filter(c => c.status === "ativo").length;
  const inativos = classificadas.filter(c => c.status === "inativo").length;
  const novos = classificadas.filter(c => c.novoNoPeriodo).length;

  const ativosPrev = classificadasPrev.filter(c => c.status === "ativo").length;
  const inativosPrev = classificadasPrev.filter(c => c.status === "inativo").length;
  const novosPrev = classificadasPrev.filter(c => c.novoNoPeriodo).length;

  const coberturaPrev = baseTotal ? (resumo.clientesCompraramPrev / baseTotal) * 100 : 0;
  const ticketClientePrev = resumo.clientesCompraramPrev
    ? resumo.receitaAnterior / resumo.clientesCompraramPrev
    : 0;

  const deltaCobertura = varPct(cobertura, coberturaPrev);
  const deltaTicketCliente = varPct(ticketCliente, ticketClientePrev);
  const deltaConcentracao = varPct(conc.top10Share, concPrev.top10Share);
  const deltaConversaWpp = varPct(wpp.conversao, wppPrev.conversao);
  const deltaEnvios = varPct(ofertas.totalEnvios, ofertasPrev.totalEnvios);
  const deltaConversaoOfertas = varPct(ofertas.conversaoMedia, ofertasPrev.conversaoMedia);
  const deltaItensPedido = varPct(kpiP.itensPorPedido.atual, kpiP.itensPorPedido.anterior);
  const deltaPrimeiraResposta = varPct(wpp.primeiraRespostaMin, wppPrev.primeiraRespostaMin);
  const deltaCiclo = varPct(kpiA.ciclo.atual, kpiA.ciclo.anterior);
  const deltaAtivos = varPct(ativos, ativosPrev);
  const deltaInativos = varPct(inativos, inativosPrev);
  const deltaNovos = varPct(novos, novosPrev);
  const deltaRisco = varPct(risco.emRisco, riscoPrev.emRisco);
  const deltaCrossSell = varPct(kpiP.crossSell.atual, kpiP.crossSell.anterior);

  const maiorEfeito = ponte
    .filter(p => p.tipo !== "total")
    .sort((a, b) => Math.abs(b.valor) - Math.abs(a.valor))[0];

  const narrativa = `Receita ${fmtPct(Math.abs(resumo.deltaReceita))} ${resumo.deltaReceita >= 0 ? "acima" : "abaixo"} do período anterior; o maior efeito veio de "${maiorEfeito?.label ?? "—"}" (${fmtBRLc(maiorEfeito?.valor ?? 0)}). ${fmtNum(inativos)} clientes parados somam ${fmtBRLc(risco.emRisco)} de receita anual.`;

  const maxRegiao = Math.max(1, ...regioes.map(r => r.atual));
  const foraSLA = wpp.filaSLA.slice(2).reduce((s, f) => s + f.qtd, 0);

  const pilares = [
    { id: "carteira", label: "Carteira", icon: Users, path: "/gestor/painel/carteira", cor: "#2D3A8C" },
    { id: "atendimento", label: "Atendimento", icon: MessageSquare, path: "/gestor/painel/atendimento", cor: "#00A8B5" },
    { id: "produto", label: "Produto", icon: Package, path: "/gestor/painel/produto", cor: "#5A3E8C" },
  ];

  const atalhos = [
    { rota: "/gestor/painel/carteira", titulo: "Carteira", hint: "Clientes, receita e cobertura", icon: Users, cor: NX.primary },
    { rota: "/gestor/painel/atendimento", titulo: "Atendimento", hint: "WhatsApp, SLA e pipeline", icon: MessageSquare, cor: "#0EA5E9" },
    { rota: "/gestor/painel/produto", titulo: "Produto", hint: "Marcas, ofertas e mix", icon: Package, cor: "#7C3AED" },
  ];



  return (
    <div className="space-y-4">
      {/* Atalhos para os pilares */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {atalhos.map(a => (
          <button
            key={a.rota}
            onClick={() => navigate(a.rota)}
            className="group nx-card px-3.5 py-3 flex items-center gap-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <span
              className="w-9 h-9 rounded-lg grid place-items-center shrink-0 transition-colors"
              style={{ background: `${a.cor}14`, color: a.cor }}
            >
              <a.icon className="w-4 h-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-semibold nx-text leading-tight">{a.titulo}</span>
              <span className="block text-[11px] nx-muted truncate">{a.hint}</span>
            </span>
            <ArrowRight className="w-4 h-4 nx-muted transition-transform group-hover:translate-x-0.5" />
          </button>
        ))}
      </div>

      {/* Faixa executiva consolidada */}
      <div className="nx-card p-4">

        <div className="flex flex-col lg:flex-row lg:items-stretch gap-4">
          <div className="lg:w-[280px] shrink-0">
            <ExecHero
              label="Receita no período"
              value={fmtBRLc(resumo.receitaAtual)}
              delta={resumo.deltaReceita}
              detalhe={`vs ${fmtBRLc(resumo.receitaAnterior)} no período anterior · ${fmtNum(resumo.pedidos)} pedidos · ticket ${fmtBRLc(resumo.ticketPedido)}`}
              narrativa={narrativa}
            />
          </div>

          <div className="flex-1 grid grid-cols-2 xl:grid-cols-4 gap-2.5">
            <ExecTile
              label="Clientes que compraram"
              value={fmtNum(resumo.clientesCompraram)}
              delta={deltaClientes}
              sub={`vs ${fmtNum(resumo.clientesCompraramPrev)} no período anterior · base de ${fmtNum(baseTotal)} clientes`}
              tone={deltaClientes >= 0 ? "good" : "risk"}
            />
            <ExecTile
              label="Cobertura da carteira"
              value={fmtPct(cobertura, 0)}
              delta={deltaCobertura}
              sub={`${fmtNum(ativos)} ativos · ${fmtNum(inativos)} parados · ${fmtNum(novos)} novos no período`}
              tone={cobertura < 40 ? "risk" : "neutral"}
            />
            <ExecTile
              label="Ticket médio por cliente"
              value={fmtBRLc(ticketCliente)}
              delta={deltaTicketCliente}
              sub={`${pedidosPorCliente.toFixed(1)} pedidos por cliente · ticket pedido ${fmtBRLc(resumo.ticketPedido)}`}
            />
            <ExecTile
              label="Concentração"
              value={fmtPct(conc.top10Share, 0)}
              delta={deltaConcentracao}
              invert
              sub={`nos 10 maiores · ${fmtNum(conc.clientesMetadeReceita)} clientes = metade da receita`}
              tone={conc.top10Share > 40 ? "risk" : "neutral"}
            />
          </div>
        </div>
      </div>

      {/* Tendência + regiões */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionCard title="Receita dos últimos 12 meses" subtitle="Tendência consolidada do escopo" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={serie} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="dirRec" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2D3A8C" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="#2D3A8C" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis dataKey="mes" tick={{ fontSize: 10, fill: NX.muted }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: NX.muted }} axisLine={false} tickLine={false} tickFormatter={(v) => fmtBRLc(Number(v))} />
              <RechartsTooltip formatter={(v: number) => fmtBRLc(v)} labelStyle={{ fontSize: 11 }} contentStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="receita" stroke="#2D3A8C" strokeWidth={2} fill="url(#dirRec)" />
            </AreaChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Receita por região" subtitle="Valor no período e variação vs anterior">
          <div className="space-y-2.5">
            {regioes.slice(0, 7).map(r => (
              <ExecBarRow key={r.regiao} label={r.regiao} valor={r.atual} max={maxRegiao} valorFmt={fmtBRLc(r.atual)} delta={r.delta} />
            ))}
            {regioes.length === 0 && <p className="text-xs nx-muted">Sem receita no período.</p>}
          </div>
        </SectionCard>
      </div>

      {/* Consolidado por pilar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <PilarCard
          icon={Users}
          titulo="Carteira"
          resumo={`${fmtNum(baseTotal)} clientes no escopo`}
          onOpen={() => navigate("/gestor/painel/carteira")}
          linhas={[
            { label: "Clientes ativos", valor: fmtNum(ativos), delta: deltaAtivos },
            { label: "Clientes parados", valor: fmtNum(inativos), delta: deltaInativos, invert: true },
            { label: "Novos no período", valor: fmtNum(novos), delta: deltaNovos },
            { label: "Receita em clientes parados", valor: fmtBRLc(risco.emRisco), delta: deltaRisco, invert: true },
          ]}
        />

        <PilarCard
          icon={MessageSquare}
          titulo="Atendimento"
          resumo={`${fmtNum(wpp.conversas)} conversas · ${fmtNum(kpiA.opsAbertas.atual)} propostas abertas`}
          onOpen={() => navigate("/gestor/painel/atendimento")}
          linhas={[
            { label: "Receita em negociação", valor: fmtBRLc(kpiA.pipelineRS.atual), delta: kpiA.pipelineRS.delta },
            { label: "1ª resposta", valor: fmtMin(wpp.primeiraRespostaMin), delta: deltaPrimeiraResposta, invert: true },
            { label: "Aproveitamento de propostas", valor: fmtPct(kpiA.winRate.atual, 0), delta: kpiA.winRate.delta },
            { label: "Fila acima de 2h", valor: fmtNum(foraSLA), delta: varPct(foraSLA, wppPrev.filaSLA.slice(2).reduce((s2, f) => s2 + f.qtd, 0)), invert: true },
          ]}
        />

        <PilarCard
          icon={Package}
          titulo="Produto"
          resumo={`${fmtNum(kpiP.marcasAtivas.atual)} marcas com venda · líder ${kpiP.marcaLider}`}
          onOpen={() => navigate("/gestor/painel/produto")}
          linhas={[
            { label: "Faturamento", valor: fmtBRLc(kpiP.faturamento.atual), delta: kpiP.faturamento.delta },
            { label: "Concentração na líder", valor: fmtPct(kpiP.concentracaoTop.atual, 0), invert: true, delta: kpiP.concentracaoTop.delta },
            { label: "Marcas por cliente", valor: kpiP.crossSell.atual.toFixed(1), delta: deltaCrossSell },
            { label: "Conversão das ofertas", valor: fmtPct(ofertas.conversaoMedia, 1), delta: deltaConversaoOfertas },
          ]}
        />
      </div>

      {/* Ciclo e eficiência do período */}
      <SectionCard title="Eficiência comercial no período" subtitle="Leitura rápida da máquina de vendas">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          <ExecTile
            label="Conversas em pedido"
            value={fmtPct(wpp.conversao, 0)}
            delta={deltaConversaWpp}
            sub={`${fmtNum(wpp.conversas)} conversas no período · ${fmtPct(wpp.respondidasNoSLA, 0)} respondidas dentro do SLA`}
          />
          <ExecTile
            label="Ciclo até fechar"
            value={fmtDias(kpiA.ciclo.atual)}
            delta={deltaCiclo}
            invert
            sub={`ticket médio por proposta ${fmtBRLc(kpiA.ticketOportunidade.atual)}`}
          />
          <ExecTile
            label="Ofertas enviadas"
            value={fmtNum(ofertas.totalEnvios)}
            delta={deltaEnvios}
            sub={`${fmtPct(ofertas.taxaAbertura, 0)} de abertura · ${fmtNum(ofertas.produtosOfertados)} produtos ofertados`}
          />
          <ExecTile
            label="Itens por pedido"
            value={kpiP.itensPorPedido.atual.toFixed(1)}
            delta={deltaItensPedido}
            sub={`vs ${kpiP.itensPorPedido.anterior.toFixed(1)} no período anterior`}
          />
        </div>
      </SectionCard>

      {/* Rentabilidade e condições comerciais */}
      <SectionCard title="Rentabilidade e condições" subtitle="Margem de contribuição comercial, devoluções e como o cliente paga">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
          <ExecTile
            label="Margem de contribuição"
            value={fmtBRLc(margem.margem)}
            delta={margemPrev.margem ? ((margem.margem - margemPrev.margem) / margemPrev.margem) * 100 : 0}
            sub={`Receita menos custo da mercadoria. ${fmtPct(margem.coberturaCusto, 0)} da receita tem custo cadastrado.`}
          />
          <ExecTile
            label="Margem %"
            value={fmtPct(margem.margemPct)}
            delta={margem.margemPct - margemPrev.margemPct}
            sub="Percentual da receita que sobra depois do custo do produto."
          />
          <ExecTile
            label="Devoluções"
            value={fmtPct(dev.pctReceita)}
            delta={dev.pctReceita - dev.pctReceitaPrev}
            invert
            tone={dev.pctReceita > 3 ? "risk" : "neutral"}
            sub={`${fmtBRLc(dev.valor)} devolvidos em ${fmtNum(dev.qtd)} ocorrências. Principal motivo: ${dev.porMotivo[0]?.motivo ?? "—"}.`}
          />
          <ExecTile
            label="Prazo médio"
            value={fmtDias(cond.prazoMedio)}
            delta={cond.prazoMedioPrev ? ((cond.prazoMedio - cond.prazoMedioPrev) / cond.prazoMedioPrev) * 100 : 0}
            invert
            sub={`Forma dominante: ${cond.mix[0]?.label ?? "—"} com ${fmtPct(cond.mix[0]?.share ?? 0, 0)} da receita.`}
          />
          <ExecTile
            label="Preço médio por peça"
            value={fmtBRLc(cond.precoPeca)}
            delta={cond.precoPecaPrev ? ((cond.precoPeca - cond.precoPecaPrev) / cond.precoPecaPrev) * 100 : 0}
            sub={`${fmtNum(cond.pecas)} peças faturadas · desconto médio de ${fmtPct(cond.descontoMedio)}.`}
          />
        </div>
      </SectionCard>
    </div>

  );
}
