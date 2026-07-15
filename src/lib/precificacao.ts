// Precificação (markup/margem) por lojista — persistência local.
// Hierarquia: produto > marca > global.

export type ModoPreco = "markup" | "margem";
export type Arredondamento = "none" | "90" | "99" | "inteiro";

export interface RegraPreco {
  modo: ModoPreco;
  valor: number; // markup: multiplicador (ex.: 2.5). margem: % (ex.: 60).
  arredondamento?: Arredondamento;
}

export interface PrecificacaoState {
  mostrarNoCard: boolean;
  global: RegraPreco;
  porMarca: Record<string, RegraPreco>;
  porProduto: Record<string, RegraPreco>;
}

const KEY = "nextil.precificacao.v1";
const EVT = "precificacao:updated";

const DEFAULT: PrecificacaoState = {
  mostrarNoCard: true,
  global: { modo: "markup", valor: 2.5, arredondamento: "90" },
  porMarca: {},
  porProduto: {},
};

export function loadPrecificacao(): PrecificacaoState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT, ...parsed };
  } catch {
    return { ...DEFAULT };
  }
}

export function savePrecificacao(state: PrecificacaoState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {}
  try {
    window.dispatchEvent(new Event(EVT));
  } catch {}
}

export function subscribePrecificacao(cb: () => void) {
  const h = () => cb();
  window.addEventListener(EVT, h);
  window.addEventListener("storage", h);
  return () => {
    window.removeEventListener(EVT, h);
    window.removeEventListener("storage", h);
  };
}

export function getRegra(
  state: PrecificacaoState,
  brandSlug?: string,
  productId?: string
): { regra: RegraPreco; origem: "global" | "marca" | "produto" } {
  if (productId && state.porProduto[productId]) {
    return { regra: state.porProduto[productId], origem: "produto" };
  }
  if (brandSlug && state.porMarca[brandSlug]) {
    return { regra: state.porMarca[brandSlug], origem: "marca" };
  }
  return { regra: state.global, origem: "global" };
}

export function calcularVenda(custo: number, regra: RegraPreco): number {
  if (!regra || !regra.valor || custo <= 0) return 0;
  let venda = 0;
  if (regra.modo === "markup") {
    venda = custo * regra.valor;
  } else {
    const m = Math.min(Math.max(regra.valor, 0), 99.99);
    venda = custo / (1 - m / 100);
  }
  return arredondar(venda, regra.arredondamento || "none");
}

function arredondar(v: number, modo: Arredondamento): number {
  if (v <= 0) return 0;
  if (modo === "inteiro") return Math.round(v);
  const inteiro = Math.floor(v);
  if (modo === "90") return inteiro + 0.9;
  if (modo === "99") return inteiro + 0.99;
  return Math.round(v * 100) / 100;
}

export function calcularLucro(custo: number, venda: number) {
  const lucro = venda - custo;
  const margemEfetiva = venda > 0 ? (lucro / venda) * 100 : 0;
  const markupEfetivo = custo > 0 ? venda / custo : 0;
  return { lucro, margemEfetiva, markupEfetivo };
}

export function formatRegra(regra: RegraPreco): string {
  if (regra.modo === "markup") {
    const v = regra.valor.toString().replace(".", ",");
    return `${v}x`;
  }
  return `${regra.valor.toString().replace(".", ",")}%`;
}

export function fmtBRL(v: number): string {
  return `R$ ${v.toFixed(2).replace(".", ",")}`;
}
