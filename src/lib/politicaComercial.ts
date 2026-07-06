// Política comercial POR INDÚSTRIA (mock).
// Degraus de desconto ↔ comissão, prazo médio de referência, mínimos.

export interface DegrauPolitica {
  desconto: number; // %
  comissao: number; // %
  minimoPedido?: number; // R$ (bloqueia se abaixo)
}

export interface PoliticaIndustria {
  brandSlug: string;
  nomeTabela: string; // ex.: "Brandili PV 26"
  degraus: DegrauPolitica[];
  prazos: number[]; // dias (opções de prazo)
  prazoMedio: number; // dias
  bonusComissaoPor15Dias: number; // % adicional a cada 15 dias antecipados
  minimoDuplicata: number;
  minimoFreteCIF: number;
  gradeFechada?: boolean;
  ativa: boolean;
  vencimento?: string;
}

const brandiliDegraus: DegrauPolitica[] = [
  { desconto: 15, comissao: 10 },
  { desconto: 17.5, comissao: 9 },
  { desconto: 20, comissao: 8 },
  { desconto: 22.5, comissao: 7 },
  { desconto: 25, comissao: 6 },
  { desconto: 27.5, comissao: 5 },
  { desconto: 30, comissao: 4 },
  { desconto: 32.5, comissao: 3, minimoPedido: 15000 },
  { desconto: 35, comissao: 2, minimoPedido: 15000 },
];

const kylyDegraus: DegrauPolitica[] = [
  { desconto: 12, comissao: 9 },
  { desconto: 15, comissao: 8 },
  { desconto: 18, comissao: 7 },
  { desconto: 22, comissao: 6 },
  { desconto: 26, comissao: 5, minimoPedido: 10000 },
  { desconto: 30, comissao: 4, minimoPedido: 15000 },
];

const genericoDegraus: DegrauPolitica[] = [
  { desconto: 10, comissao: 8 },
  { desconto: 15, comissao: 7 },
  { desconto: 20, comissao: 6 },
  { desconto: 25, comissao: 5, minimoPedido: 8000 },
  { desconto: 30, comissao: 4, minimoPedido: 15000 },
];

export const politicasPorMarca: Record<string, PoliticaIndustria> = {
  brandili: {
    brandSlug: "brandili",
    nomeTabela: "Brandili PV 26",
    degraus: brandiliDegraus,
    prazos: [30, 45, 60, 90],
    prazoMedio: 60,
    bonusComissaoPor15Dias: 0.5,
    minimoDuplicata: 300,
    minimoFreteCIF: 1800,
    ativa: true,
    vencimento: "30/09/2026",
  },
  kyly: {
    brandSlug: "kyly",
    nomeTabela: "Kyly Verão 26",
    degraus: kylyDegraus,
    prazos: [30, 45, 60],
    prazoMedio: 45,
    bonusComissaoPor15Dias: 0.5,
    minimoDuplicata: 300,
    minimoFreteCIF: 1800,
    ativa: true,
  },
  hering: { brandSlug: "hering", nomeTabela: "Hering 26", degraus: genericoDegraus, prazos: [30, 45, 60], prazoMedio: 45, bonusComissaoPor15Dias: 0.5, minimoDuplicata: 300, minimoFreteCIF: 1800, ativa: true },
  malwee: { brandSlug: "malwee", nomeTabela: "Malwee 26", degraus: genericoDegraus, prazos: [30, 45, 60, 90], prazoMedio: 60, bonusComissaoPor15Dias: 0.5, minimoDuplicata: 300, minimoFreteCIF: 1800, ativa: true, gradeFechada: true },
  lunender: { brandSlug: "lunender", nomeTabela: "Lunender 26", degraus: genericoDegraus, prazos: [30, 45, 60], prazoMedio: 45, bonusComissaoPor15Dias: 0.5, minimoDuplicata: 300, minimoFreteCIF: 1800, ativa: true },
  marisol: { brandSlug: "marisol", nomeTabela: "Marisol 26", degraus: genericoDegraus, prazos: [30, 45, 60], prazoMedio: 45, bonusComissaoPor15Dias: 0.5, minimoDuplicata: 300, minimoFreteCIF: 1800, ativa: false, vencimento: "31/03/2026" },
  elian: { brandSlug: "elian", nomeTabela: "Elian 26", degraus: genericoDegraus, prazos: [30, 45, 60], prazoMedio: 45, bonusComissaoPor15Dias: 0.5, minimoDuplicata: 300, minimoFreteCIF: 1800, ativa: true },
  "colorittá": { brandSlug: "colorittá", nomeTabela: "Colorittá 26", degraus: genericoDegraus, prazos: [30, 45, 60], prazoMedio: 45, bonusComissaoPor15Dias: 0.5, minimoDuplicata: 300, minimoFreteCIF: 1800, ativa: true },
};

export function getPolitica(slug: string): PoliticaIndustria | undefined {
  return politicasPorMarca[slug];
}

export function formatBRL(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Persistência do último degrau por cliente+marca
const KEY = "vendedor.ultimoDegrau";
type UltimoDegrauMap = Record<string, number>;
function loadMap(): UltimoDegrauMap {
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; }
}
export function getUltimoDegrau(clienteId: string | null, brandSlug: string): number | undefined {
  const map = loadMap();
  return map[`${clienteId || "nc"}::${brandSlug}`];
}
export function saveUltimoDegrau(clienteId: string | null, brandSlug: string, idx: number) {
  const map = loadMap();
  map[`${clienteId || "nc"}::${brandSlug}`] = idx;
  try { localStorage.setItem(KEY, JSON.stringify(map)); } catch {}
}
