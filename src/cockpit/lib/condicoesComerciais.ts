// Condições comerciais: mix de forma de pagamento, prazo médio,
// preço médio por peça e por quilo. Tudo derivado dos pedidos.
import type { FormaPagamento, Pedido } from "../data/seed";
import type { DateRange } from "./range";

export const FORMA_LABEL: Record<FormaPagamento, string> = {
  boleto: "Boleto",
  cartao: "Cartão",
  pix: "Pix",
  faturado: "Faturado",
};

export const FORMA_COR: Record<FormaPagamento, string> = {
  boleto: "#2D3A8C",
  cartao: "#0EA5E9",
  pix: "#0D9488",
  faturado: "#F26B21",
};

export interface CondicoesResumo {
  mix: { forma: FormaPagamento; label: string; valor: number; share: number; sharePrev: number }[];
  prazoMedio: number;
  prazoMedioPrev: number;
  precoPeca: number;
  precoPecaPrev: number;
  precoQuilo: number;
  precoQuiloPrev: number;
  descontoMedio: number;
  descontoMedioPrev: number;
  pecas: number;
  pesoKg: number;
}

const noRange = (pedidos: Pedido[], r: DateRange) =>
  pedidos.filter(p => p.data >= r.from && p.data <= r.to);

function agregar(lista: Pedido[]) {
  const receita = lista.reduce((s, p) => s + p.valor, 0);
  const pecas = lista.reduce((s, p) => s + p.itens, 0);
  const peso = lista.reduce((s, p) => s + p.pesoKg, 0);
  const prazoPonderado = receita
    ? lista.reduce((s, p) => s + p.prazoDias * p.valor, 0) / receita
    : 0;
  const desconto = receita
    ? lista.reduce((s, p) => s + p.desconto * p.valor, 0) / receita
    : 0;
  return {
    receita, pecas, peso, prazoPonderado, desconto,
    precoPeca: pecas ? receita / pecas : 0,
    precoQuilo: peso ? receita / peso : 0,
  };
}

export function condicoesComerciais(pedidos: Pedido[], range: DateRange, prev: DateRange): CondicoesResumo {
  const atual = noRange(pedidos, range);
  const anterior = noRange(pedidos, prev);
  const a = agregar(atual);
  const b = agregar(anterior);

  const formas: FormaPagamento[] = ["boleto", "faturado", "cartao", "pix"];
  const mix = formas.map(f => {
    const valor = atual.filter(p => p.formaPagamento === f).reduce((s, p) => s + p.valor, 0);
    const valorPrev = anterior.filter(p => p.formaPagamento === f).reduce((s, p) => s + p.valor, 0);
    return {
      forma: f,
      label: FORMA_LABEL[f],
      valor,
      share: a.receita ? (valor / a.receita) * 100 : 0,
      sharePrev: b.receita ? (valorPrev / b.receita) * 100 : 0,
    };
  }).sort((x, y) => y.valor - x.valor);

  return {
    mix,
    prazoMedio: a.prazoPonderado,
    prazoMedioPrev: b.prazoPonderado,
    precoPeca: a.precoPeca,
    precoPecaPrev: b.precoPeca,
    precoQuilo: a.precoQuilo,
    precoQuiloPrev: b.precoQuilo,
    descontoMedio: a.desconto,
    descontoMedioPrev: b.desconto,
    pecas: a.pecas,
    pesoKg: a.peso,
  };
}

/** Série mensal (12 meses) do mix de pagamento e do prazo médio. */
export function serieCondicoes(pedidos: Pedido[], hoje: Date) {
  const out: { mes: string; boleto: number; cartao: number; pix: number; faturado: number; prazo: number; precoPeca: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const ini = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    const fim = new Date(hoje.getFullYear(), hoje.getMonth() - i + 1, 0, 23, 59, 59);
    const lista = pedidos.filter(p => p.data >= ini && p.data <= fim);
    const total = lista.reduce((s, p) => s + p.valor, 0) || 1;
    const share = (f: FormaPagamento) =>
      (lista.filter(p => p.formaPagamento === f).reduce((s, p) => s + p.valor, 0) / total) * 100;
    const pecas = lista.reduce((s, p) => s + p.itens, 0);
    out.push({
      mes: ini.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""),
      boleto: share("boleto"),
      cartao: share("cartao"),
      pix: share("pix"),
      faturado: share("faturado"),
      prazo: lista.reduce((s, p) => s + p.prazoDias * p.valor, 0) / total,
      precoPeca: pecas ? lista.reduce((s, p) => s + p.valor, 0) / pecas : 0,
    });
  }
  return out;
}
