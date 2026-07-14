// Fase 11.1 — Helpers puros de analytics para o módulo Atendimento.
// Consomem cards + colunas do AtendimentoComercialContext (dados 100% locais).
// Usados por Kanban, Painel Leads & Atendimento e pelos Relatórios (gestor e marketing).

import {
  CardAC, ColunaAC, PerdaQualificada, MarketingStatus,
  investimentoPorCampanha, investimentoPorOrigem, horasDesde, origemLabels,
} from "@/data/mockAtendimentoComercial";

export const ORDEM_FLUXO = ["leads", "fila", "atendimento", "cadastro", "qualificacao", "oportunidade"] as const;
export type EtapaFluxo = (typeof ORDEM_FLUXO)[number];
export const ETAPA_LABELS: Record<EtapaFluxo, string> = {
  leads: "Leads",
  fila: "Fila",
  atendimento: "Em Atendimento",
  cadastro: "Em Cadastro",
  qualificacao: "Em Qualificação",
  oportunidade: "Oportunidades",
};

export const ORIGENS_PAGAS = ["meta_ads", "instagram"] as const;
type OrigemPaga = (typeof ORIGENS_PAGAS)[number];

// ------------ Mapeadores base -------------
export function makeLabelMaps(colunas: ColunaAC[]) {
  const idToKey: Record<string, string> = {};
  const labelToKey: Record<string, string> = {};
  colunas.forEach(c => {
    if (c.key) {
      idToKey[c.id] = c.key;
      labelToKey[`__label:${c.label}`] = c.key;
    }
  });
  return { idToKey, labelToKey: { ...idToKey, ...labelToKey } };
}

// Etapa máxima já alcançada (via histórico). Não conta "perdido".
export function etapaAlcancada(card: CardAC, labelToKey: Record<string, string>): number {
  const atual = labelToKey[card.colunaId] as EtapaFluxo | "perdido" | undefined;
  if (atual && atual !== "perdido") {
    const idx = ORDEM_FLUXO.indexOf(atual as EtapaFluxo);
    if (idx >= 0) return idx;
  }
  let maxIdx = 0;
  for (const h of card.historico) {
    const m = h.msg.match(/Movido para (.+)$/);
    if (!m) continue;
    const key = labelToKey[`__label:${m[1]}`];
    const idx = ORDEM_FLUXO.indexOf(key as EtapaFluxo);
    if (idx > maxIdx) maxIdx = idx;
  }
  return maxIdx;
}

// Tempo (ms) que o card levou para chegar em cada etapa via histórico.
export function tempoPorEtapa(card: CardAC, labelToKey: Record<string, string>): Partial<Record<EtapaFluxo, number>> {
  const timestamps: Partial<Record<EtapaFluxo, number>> = { leads: new Date(card.chegouEm).getTime() };
  for (const h of card.historico) {
    const m = h.msg.match(/Movido para (.+)$/);
    if (!m) continue;
    const key = labelToKey[`__label:${m[1]}`] as EtapaFluxo | undefined;
    if (!key || timestamps[key] != null) continue;
    timestamps[key] = new Date(h.at).getTime();
  }
  return timestamps;
}

// Cards no período (por chegouEm)
export function filtrarPeriodo(cards: CardAC[], dias: number): CardAC[] {
  const limite = Date.now() - dias * 86400000;
  return cards.filter(c => new Date(c.chegouEm).getTime() >= limite);
}

// ------------ 11.2.1 Desempenho por vendedor -------------
export interface DesempenhoVendedor {
  vendedorId: string;
  vendedorNome: string;
  leadsRecebidos: number;
  respostasSla: number;
  respostasTotal: number;
  pctSla: number;
  tempoMedioResposta: number; // horas
  atendeuPct: number;
  cadastrouPct: number;
  qualificouPct: number;
  oportunidadePct: number;
  perdas: number;
  valorOportunidades: number;
}

export function desempenhoPorVendedor(
  cards: CardAC[], colunas: ColunaAC[], slaHoras: number
): DesempenhoVendedor[] {
  const { labelToKey } = makeLabelMaps(colunas);
  const grupos = new Map<string, { nome: string; items: CardAC[] }>();
  cards.forEach(c => {
    if (!grupos.has(c.vendedorId)) grupos.set(c.vendedorId, { nome: c.vendedorNome, items: [] });
    grupos.get(c.vendedorId)!.items.push(c);
  });
  const result: DesempenhoVendedor[] = [];
  grupos.forEach(({ nome, items }, vendedorId) => {
    const total = items.length;
    const tempos = items.map(c => {
      const t = tempoPorEtapa(c, labelToKey);
      if (t.atendimento && t.leads) return (t.atendimento - t.leads) / 3600000;
      return null;
    }).filter((x): x is number => x != null);
    const respostas = tempos.length;
    const sla = tempos.filter(t => t <= slaHoras).length;
    const tempoMedio = respostas ? tempos.reduce((s, t) => s + t, 0) / respostas : 0;
    const pass = (key: EtapaFluxo) => items.filter(c => etapaAlcancada(c, labelToKey) >= ORDEM_FLUXO.indexOf(key)).length;
    result.push({
      vendedorId, vendedorNome: nome,
      leadsRecebidos: total,
      respostasSla: sla,
      respostasTotal: respostas,
      pctSla: respostas ? (sla / respostas) * 100 : 0,
      tempoMedioResposta: tempoMedio,
      atendeuPct: total ? (pass("atendimento") / total) * 100 : 0,
      cadastrouPct: total ? (pass("cadastro") / total) * 100 : 0,
      qualificouPct: total ? (pass("qualificacao") / total) * 100 : 0,
      oportunidadePct: total ? (pass("oportunidade") / total) * 100 : 0,
      perdas: items.filter(c => c.status === "perdido").length,
      valorOportunidades: items
        .filter(c => etapaAlcancada(c, labelToKey) >= ORDEM_FLUXO.indexOf("oportunidade"))
        .reduce((s, c) => s + (c.valorEstimado || 0), 0),
    });
  });
  return result.sort((a, b) => b.valorOportunidades - a.valorOportunidades);
}

// ------------ 11.2.2 Funil consolidado -------------
export interface FunilEtapa {
  key: EtapaFluxo;
  label: string;
  count: number;
  valor: number;
  tempoMedioMs: number; // permanência média nesta etapa (via próxima)
  taxaAvanco: number;   // % que avançou para próxima etapa
}

export interface FunilConsolidado {
  etapas: FunilEtapa[];
  gargalo: EtapaFluxo | null;
  estagnados2d: CardAC[];
}

export function funilConsolidado(cards: CardAC[], colunas: ColunaAC[]): FunilConsolidado {
  const { labelToKey } = makeLabelMaps(colunas);
  const etapas: FunilEtapa[] = ORDEM_FLUXO.map(key => {
    const passaram = cards.filter(c => etapaAlcancada(c, labelToKey) >= ORDEM_FLUXO.indexOf(key));
    const tempos = passaram.map(c => tempoPorEtapa(c, labelToKey));
    // permanência = tempo entre esta etapa e a próxima (quando o card avançou)
    const permanencias: number[] = [];
    const proxKey = ORDEM_FLUXO[ORDEM_FLUXO.indexOf(key) + 1];
    tempos.forEach(t => {
      if (proxKey && t[key] && t[proxKey]) permanencias.push(t[proxKey]! - t[key]!);
    });
    const tempoMedio = permanencias.length ? permanencias.reduce((s, t) => s + t, 0) / permanencias.length : 0;
    return {
      key, label: ETAPA_LABELS[key],
      count: passaram.length,
      valor: passaram.reduce((s, c) => s + (c.valorEstimado || 0), 0),
      tempoMedioMs: tempoMedio,
      taxaAvanco: 0,
    };
  });
  for (let i = 0; i < etapas.length - 1; i++) {
    etapas[i].taxaAvanco = etapas[i].count ? (etapas[i + 1].count / etapas[i].count) * 100 : 0;
  }
  etapas[etapas.length - 1].taxaAvanco = 100;
  // Gargalo: etapa (não-final) com maior tempo médio
  const consider = etapas.slice(0, -1);
  const gargalo = consider.length ? consider.reduce((a, b) => b.tempoMedioMs > a.tempoMedioMs ? b : a).key : null;
  const estagnados2d = cards.filter(c => {
    const key = labelToKey[c.colunaId];
    return key === "atendimento" && horasDesde(c.entradaColunaEm) >= 48 && c.status !== "perdido";
  });
  return { etapas, gargalo, estagnados2d };
}

// ------------ 11.2.3 Perdas detalhadas -------------
export interface PerdaAgregada {
  motivo: string;
  subMotivos: { subMotivo: string; cards: CardAC[]; valorPerdido: number }[];
  total: number;
  valorPerdido: number;
}

export function perdasDrilldown(cards: CardAC[]): PerdaAgregada[] {
  const perdidos = cards.filter(c => c.status === "perdido");
  const porMotivo = new Map<string, CardAC[]>();
  perdidos.forEach(c => {
    const m = c.perda?.motivo || c.motivoPerda || "Não informado";
    if (!porMotivo.has(m)) porMotivo.set(m, []);
    porMotivo.get(m)!.push(c);
  });
  const result: PerdaAgregada[] = [];
  porMotivo.forEach((items, motivo) => {
    const porSub = new Map<string, CardAC[]>();
    items.forEach(c => {
      const s = c.perda?.subMotivo || "(sem sub-motivo)";
      if (!porSub.has(s)) porSub.set(s, []);
      porSub.get(s)!.push(c);
    });
    const subMotivos = Array.from(porSub.entries()).map(([subMotivo, arr]) => ({
      subMotivo,
      cards: arr,
      valorPerdido: arr.reduce((s, c) => s + (c.valorEstimado || 0), 0),
    })).sort((a, b) => b.cards.length - a.cards.length);
    result.push({
      motivo,
      subMotivos,
      total: items.length,
      valorPerdido: items.reduce((s, c) => s + (c.valorEstimado || 0), 0),
    });
  });
  return result.sort((a, b) => b.total - a.total);
}

// ------------ 11.2.4 SLA e tempos de resposta -------------
export interface SlaResumo {
  pctSla: number;
  tempoMedioMs: number;
  totalEstouros: number;
  parados2d: number;
  serieDiaria: { dia: string; tempoMedioMs: number; estouros: number }[];
  estourosAtivos: CardAC[];
}

export function slaEvolucao(cards: CardAC[], colunas: ColunaAC[], slaHoras: number, dias = 30): SlaResumo {
  const { labelToKey } = makeLabelMaps(colunas);
  const inicio = Date.now() - dias * 86400000;
  const respostas: number[] = [];
  const porDia = new Map<string, number[]>();
  const porDiaEstouros = new Map<string, number>();
  cards.forEach(c => {
    const t = tempoPorEtapa(c, labelToKey);
    if (!t.atendimento || !t.leads) return;
    if (t.leads < inicio) return;
    const horas = (t.atendimento - t.leads) / 3600000;
    respostas.push(horas);
    const dia = new Date(t.leads).toISOString().slice(0, 10);
    if (!porDia.has(dia)) porDia.set(dia, []);
    porDia.get(dia)!.push(horas * 3600000);
    if (horas > slaHoras) porDiaEstouros.set(dia, (porDiaEstouros.get(dia) || 0) + 1);
  });
  const sla = respostas.filter(h => h <= slaHoras).length;
  const total = respostas.length;
  const tempoMedio = total ? (respostas.reduce((s, h) => s + h, 0) / total) * 3600000 : 0;
  const estourosAtivos = cards.filter(c => {
    const key = labelToKey[c.colunaId];
    return key === "fila" && c.status === "ativo" && horasDesde(c.chegouEm) > slaHoras;
  });
  const parados2d = cards.filter(c => {
    const key = labelToKey[c.colunaId];
    return key === "atendimento" && horasDesde(c.entradaColunaEm) >= 48 && c.status !== "perdido";
  }).length;
  const serieDiaria = Array.from(porDia.entries())
    .map(([dia, arr]) => ({
      dia,
      tempoMedioMs: arr.reduce((s, m) => s + m, 0) / arr.length,
      estouros: porDiaEstouros.get(dia) || 0,
    }))
    .sort((a, b) => a.dia.localeCompare(b.dia));
  return {
    pctSla: total ? (sla / total) * 100 : 0,
    tempoMedioMs: tempoMedio,
    totalEstouros: total - sla,
    parados2d,
    serieDiaria,
    estourosAtivos,
  };
}

// ------------ Marketing 11.3.1 Origem/campanha → receita -------------
export interface OrigemReceitaRow {
  chave: string;
  origem: string;
  campanha?: string;
  leads: number;
  investimento: number;
  cpl: number;
  distribuidos: number;
  distribuidosPct: number;
  oportunidades: number;
  conversaoOp: number;
  valorGerado: number;
  custoPorOp: number;
  paga: boolean;
}

export function origemCampanhaReceita(cards: CardAC[], colunas: ColunaAC[], dias: number): OrigemReceitaRow[] {
  const { labelToKey } = makeLabelMaps(colunas);
  const groups = new Map<string, CardAC[]>();
  cards.forEach(c => {
    const key = `${c.origem}::${c.campanha || ""}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(c);
  });
  const rows: OrigemReceitaRow[] = [];
  groups.forEach((items, chave) => {
    const [origem, campanha] = chave.split("::");
    const paga = (ORIGENS_PAGAS as readonly string[]).includes(origem);
    const invMensal = campanha && investimentoPorCampanha[campanha]
      ? investimentoPorCampanha[campanha]
      : (paga ? (investimentoPorOrigem[origem] || 0) : 0);
    const investimento = Math.round(invMensal * (dias / 30));
    const distribuidos = items.filter(c => labelToKey[c.colunaId] && labelToKey[c.colunaId] !== "leads").length;
    const ops = items.filter(c => etapaAlcancada(c, labelToKey) >= ORDEM_FLUXO.indexOf("oportunidade"));
    const valor = ops.reduce((s, c) => s + (c.valorEstimado || 0), 0);
    rows.push({
      chave, origem: origemLabels[origem as keyof typeof origemLabels] || origem,
      campanha: campanha || undefined,
      leads: items.length,
      investimento,
      cpl: items.length ? investimento / items.length : 0,
      distribuidos, distribuidosPct: items.length ? (distribuidos / items.length) * 100 : 0,
      oportunidades: ops.length,
      conversaoOp: items.length ? (ops.length / items.length) * 100 : 0,
      valorGerado: valor,
      custoPorOp: ops.length ? investimento / ops.length : 0,
      paga,
    });
  });
  return rows.sort((a, b) => b.valorGerado - a.valorGerado);
}

// ------------ Marketing 11.3.2 Perdas e renutrição -------------
export interface FunilRenutricao {
  perdidos: number;
  emRenutricao: number;
  reabertos: number;
  reconvertidos: number;
  arquivados: number;
  sugeridos: CardAC[]; // cards com retomarEm <= hoje ainda não em renutrição
}

export function funilRenutricao(cards: CardAC[], colunas: ColunaAC[]): FunilRenutricao {
  const { labelToKey } = makeLabelMaps(colunas);
  const perdidos = cards.filter(c => c.status === "perdido" || c.perda);
  const emRenutricao = cards.filter(c => c.marketingStatus === "renutricao").length;
  const arquivados = cards.filter(c => c.marketingStatus === "arquivado").length;
  const reabertos = cards.filter(c => {
    // já teve perda registrada mas voltou ao fluxo ativo
    return c.perda && c.status !== "perdido";
  }).length;
  const reconvertidos = cards.filter(c => {
    return c.perda && c.status !== "perdido"
      && etapaAlcancada(c, labelToKey) >= ORDEM_FLUXO.indexOf("oportunidade");
  }).length;
  const hoje = Date.now();
  const sugeridos = cards.filter(c =>
    c.perda?.retomarEm && new Date(c.perda.retomarEm).getTime() <= hoje && c.marketingStatus !== "renutricao"
  );
  return { perdidos: perdidos.length, emRenutricao, reabertos, reconvertidos, arquivados, sugeridos };
}

// ------------ Marketing 11.3.3 Distribuição e rodízio -------------
export interface DistribuicaoResumo {
  tempoMedioDistribuicaoMs: number;
  porVendedor: { vendedorId: string; vendedorNome: string; total: number; rodizio: number; manual: number; pausas: number }[];
  filaAtual: number;
}

export function distribuicaoRodizio(cards: CardAC[], colunas: ColunaAC[], inboxAtual: number): DistribuicaoResumo {
  const { labelToKey } = makeLabelMaps(colunas);
  const tempos: number[] = [];
  const porV = new Map<string, { nome: string; total: number; rodizio: number; manual: number; pausas: number }>();
  cards.forEach(c => {
    // Tempo entre chegouEm e primeira mudança (distribuição)
    const primeiro = c.historico[0]?.at;
    if (primeiro) {
      const t = new Date(primeiro).getTime() - new Date(c.chegouEm).getTime();
      if (t >= 0 && t < 30 * 86400000) tempos.push(t);
    }
    if (!porV.has(c.vendedorId)) porV.set(c.vendedorId, { nome: c.vendedorNome, total: 0, rodizio: 0, manual: 0, pausas: 0 });
    const g = porV.get(c.vendedorId)!;
    g.total++;
    if (c.origem === "whats_central" || c.origem === "meta_ads" || c.origem === "instagram") g.rodizio++;
    else g.manual++;
  });
  return {
    tempoMedioDistribuicaoMs: tempos.length ? tempos.reduce((s, t) => s + t, 0) / tempos.length : 0,
    porVendedor: Array.from(porV.entries()).map(([vendedorId, g]) => ({ vendedorId, vendedorNome: g.nome, ...g })),
    filaAtual: inboxAtual,
  };
}

// ------------ Marketing 11.3.4 Qualidade do lead por origem -------------
export interface QualidadeOrigemRow {
  chave: string;
  origem: string;
  campanha?: string;
  leads: number;
  respondidoPct: number;
  cadastradoPct: number;
  qualificadoPct: number;
  oportunidadePct: number;
  perdaSemPerfilPct: number;
  scoreQualidade: number;
}

export function qualidadeLeadPorOrigem(cards: CardAC[], colunas: ColunaAC[]): QualidadeOrigemRow[] {
  const { labelToKey } = makeLabelMaps(colunas);
  const groups = new Map<string, CardAC[]>();
  cards.forEach(c => {
    const key = `${c.origem}::${c.campanha || ""}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(c);
  });
  const rows: QualidadeOrigemRow[] = [];
  groups.forEach((items, chave) => {
    const [origem, campanha] = chave.split("::");
    const pass = (key: EtapaFluxo) => items.filter(c => etapaAlcancada(c, labelToKey) >= ORDEM_FLUXO.indexOf(key)).length;
    const perdaSemPerfil = items.filter(c => (c.perda?.motivo || c.motivoPerda) === "Sem perfil / sem CNPJ").length;
    const respondido = items.length ? (pass("atendimento") / items.length) * 100 : 0;
    const cadastrado = items.length ? (pass("cadastro") / items.length) * 100 : 0;
    const qualificado = items.length ? (pass("qualificacao") / items.length) * 100 : 0;
    const oportunidade = items.length ? (pass("oportunidade") / items.length) * 100 : 0;
    const scoreQualidade = (respondido + cadastrado + qualificado + oportunidade) / 4;
    rows.push({
      chave, origem: origemLabels[origem as keyof typeof origemLabels] || origem,
      campanha: campanha || undefined,
      leads: items.length,
      respondidoPct: respondido,
      cadastradoPct: cadastrado,
      qualificadoPct: qualificado,
      oportunidadePct: oportunidade,
      perdaSemPerfilPct: items.length ? (perdaSemPerfil / items.length) * 100 : 0,
      scoreQualidade,
    });
  });
  return rows.sort((a, b) => b.scoreQualidade - a.scoreQualidade);
}

// ------------ Utilitário para "Perdas por motivo/sub" agregado marketing -------------
export interface PerdasAgregadasMarketing {
  motivo: string;
  subMotivo?: string;
  total: number;
  porOrigem: Record<string, number>;
}

export function perdasPorOrigem(cards: CardAC[]): PerdasAgregadasMarketing[] {
  const perdidos = cards.filter(c => c.status === "perdido" || c.perda);
  const map = new Map<string, PerdasAgregadasMarketing>();
  perdidos.forEach(c => {
    const motivo = c.perda?.motivo || c.motivoPerda || "Não informado";
    const sub = c.perda?.subMotivo;
    const key = `${motivo}::${sub || ""}`;
    if (!map.has(key)) map.set(key, { motivo, subMotivo: sub, total: 0, porOrigem: {} });
    const row = map.get(key)!;
    row.total++;
    row.porOrigem[c.origem] = (row.porOrigem[c.origem] || 0) + 1;
  });
  return Array.from(map.values()).sort((a, b) => b.total - a.total);
}

export function formatHoras(ms: number): string {
  const h = ms / 3600000;
  if (h < 1) return `${Math.max(1, Math.round(h * 60))}m`;
  if (h < 24) return `${h.toFixed(1)}h`;
  return `${(h / 24).toFixed(1)}d`;
}
