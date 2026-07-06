// Política comercial POR INDÚSTRIA (mock com persistência local).

export interface DegrauPolitica {
  desconto: number; // %
  comissao: number; // %
  minimoPedido?: number; // R$
}

export type RegraNegociado = "media" | "porItem" | "desabilitado";

export interface PrazoPagamento {
  id: string;
  metodo: "Boleto" | "Cartão de crédito" | "PIX";
  parcelas: string; // ex.: "30/60/90"
  padrao?: boolean;
}

export type TipoGrade = "Palito" | "Aberta" | "Fechada" | "Livre";

export interface PoliticaIndustria {
  brandSlug: string;
  nomeTabela: string;
  vigenciaInicio?: string;
  vigenciaFim?: string;
  status: "ativa" | "programada" | "vencida" | "rascunho";
  degraus: DegrauPolitica[];
  regraNegociado: RegraNegociado;
  prazosPagamento: PrazoPagamento[];
  prazos: number[];
  prazoMedio: number;
  bonusComissaoPor15Dias: number;
  minimoDuplicata: number;
  minimoFreteCIF: number;
  tempoAnaliseCredito: number;
  tempoMinCNPJ: number;
  tipoGrade: TipoGrade;
  permiteEscolherTamanho: boolean;
  permiteEscolherCor: boolean;
  gradeFechada?: boolean;
  // Legacy fields expected by other code
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

const prazosPadrao: PrazoPagamento[] = [
  { id: "p1", metodo: "Boleto", parcelas: "30/60/90", padrao: true },
  { id: "p2", metodo: "Boleto", parcelas: "30/45", padrao: false },
  { id: "p3", metodo: "PIX", parcelas: "à vista", padrao: false },
  { id: "p4", metodo: "Cartão de crédito", parcelas: "3x sem juros", padrao: false },
];

const base = (overrides: Partial<PoliticaIndustria>): PoliticaIndustria => ({
  brandSlug: "",
  nomeTabela: "",
  status: "ativa",
  degraus: genericoDegraus,
  regraNegociado: "media",
  prazosPagamento: prazosPadrao,
  prazos: [30, 45, 60],
  prazoMedio: 45,
  bonusComissaoPor15Dias: 0.5,
  minimoDuplicata: 300,
  minimoFreteCIF: 1800,
  tempoAnaliseCredito: 3,
  tempoMinCNPJ: 180,
  tipoGrade: "Palito",
  permiteEscolherTamanho: true,
  permiteEscolherCor: true,
  ativa: true,
  ...overrides,
});

export const defaultPoliticasPorMarca: Record<string, PoliticaIndustria> = {
  brandili: base({
    brandSlug: "brandili", nomeTabela: "Brandili PV 26",
    vigenciaInicio: "01/01/2026", vigenciaFim: "30/09/2026",
    degraus: brandiliDegraus, prazos: [30, 45, 60, 90], prazoMedio: 60,
    regraNegociado: "media", vencimento: "30/09/2026",
  }),
  kyly: base({
    brandSlug: "kyly", nomeTabela: "Kyly Verão 26",
    vigenciaInicio: "01/01/2026", vigenciaFim: "31/12/2026",
    degraus: kylyDegraus, regraNegociado: "porItem",
  }),
  hering: base({ brandSlug: "hering", nomeTabela: "Hering 26" }),
  malwee: base({
    brandSlug: "malwee", nomeTabela: "Malwee 26",
    gradeFechada: true, tipoGrade: "Fechada",
    permiteEscolherTamanho: false, permiteEscolherCor: false,
    regraNegociado: "desabilitado",
    prazos: [30, 45, 60, 90], prazoMedio: 60,
  }),
  lunender: base({ brandSlug: "lunender", nomeTabela: "Lunender 26" }),
  marisol: base({
    brandSlug: "marisol", nomeTabela: "Marisol 26",
    status: "vencida", ativa: false, vencimento: "31/03/2026",
    vigenciaFim: "31/03/2026",
  }),
  elian: base({ brandSlug: "elian", nomeTabela: "Elian 26" }),
  "colorittá": base({ brandSlug: "colorittá", nomeTabela: "Colorittá 26" }),
};

// -------- Persistência local (edições da política) --------
const POLS_KEY = "vendedor.politicas.v2";
type PolMap = Record<string, PoliticaIndustria>;

function readPersisted(): PolMap {
  try {
    const raw = localStorage.getItem(POLS_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch { return {}; }
}
function writePersisted(map: PolMap) {
  try { localStorage.setItem(POLS_KEY, JSON.stringify(map)); } catch {}
  try { window.dispatchEvent(new Event("politicas:updated")); } catch {}
}

export function getPolitica(slug: string): PoliticaIndustria | undefined {
  const persisted = readPersisted();
  return persisted[slug] || defaultPoliticasPorMarca[slug];
}

export function listPoliticas(): PoliticaIndustria[] {
  const persisted = readPersisted();
  const map: PolMap = { ...defaultPoliticasPorMarca, ...persisted };
  return Object.values(map);
}

export function upsertPolitica(pol: PoliticaIndustria) {
  const persisted = readPersisted();
  // ativar única por indústria
  if (pol.status === "ativa") {
    Object.keys(persisted).forEach((k) => {
      if (persisted[k].brandSlug === pol.brandSlug && k !== pol.brandSlug) {
        persisted[k] = { ...persisted[k], status: "vencida", ativa: false };
      }
    });
  }
  persisted[pol.brandSlug] = { ...pol, ativa: pol.status === "ativa" };
  writePersisted(persisted);
}

export function duplicarPolitica(slug: string, novoNome: string): PoliticaIndustria | null {
  const pol = getPolitica(slug);
  if (!pol) return null;
  const nova: PoliticaIndustria = {
    ...pol,
    nomeTabela: novoNome,
    status: "rascunho",
    ativa: false,
  };
  return nova;
}

// -------- Utilidades --------
export function formatBRL(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Enquadramento: dado desconto médio ponderado, retorna o degrau que "comporta" essa média.
// Regra: escolhe o menor degrau cujo desconto >= média. Se média > último degrau, retorna null (fora).
export function enquadrarDegrau(
  pol: PoliticaIndustria,
  descontoMedio: number
): { degrau: DegrauPolitica; idx: number } | null {
  const ordenados = pol.degraus
    .map((d, i) => ({ d, i }))
    .sort((a, b) => a.d.desconto - b.d.desconto);
  for (const { d, i } of ordenados) {
    if (d.desconto + 1e-6 >= descontoMedio) return { degrau: d, idx: i };
  }
  return null;
}

// -------- Persistência do último degrau por cliente+marca --------
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

// -------- Materiais de apoio (mock) --------
export interface MaterialApoio {
  id: string;
  brandSlug: string;
  titulo: string;
  tipo: "catálogo PDF" | "vídeo" | "lookbook" | "tabela de preços";
  colecao: string;
  url: string;
}

export const materiaisApoio: MaterialApoio[] = [
  { id: "m1", brandSlug: "brandili", titulo: "Catálogo Brandili PV 26", tipo: "catálogo PDF", colecao: "PV 26", url: "#" },
  { id: "m2", brandSlug: "brandili", titulo: "Vídeo de coleção Alto Verão", tipo: "vídeo", colecao: "Alto Verão 26", url: "#" },
  { id: "m3", brandSlug: "brandili", titulo: "Tabela de preços Brandili", tipo: "tabela de preços", colecao: "PV 26", url: "#" },
  { id: "m4", brandSlug: "kyly", titulo: "Lookbook Kyly Verão", tipo: "lookbook", colecao: "Verão 26", url: "#" },
  { id: "m5", brandSlug: "kyly", titulo: "Catálogo Kyly 26", tipo: "catálogo PDF", colecao: "Verão 26", url: "#" },
  { id: "m6", brandSlug: "malwee", titulo: "Catálogo Malwee 26", tipo: "catálogo PDF", colecao: "PV 26", url: "#" },
];
