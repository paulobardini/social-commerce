import { useEffect, useState, useMemo } from "react";
import {
  loadPrecificacao,
  subscribePrecificacao,
  getRegra,
  calcularVenda,
  calcularLucro,
  type PrecificacaoState,
  type RegraPreco,
} from "@/lib/precificacao";

export function usePrecificacaoState(): PrecificacaoState {
  const [state, setState] = useState<PrecificacaoState>(() => loadPrecificacao());
  useEffect(() => subscribePrecificacao(() => setState(loadPrecificacao())), []);
  return state;
}

export interface PrecoVenda {
  regra: RegraPreco;
  origem: "global" | "marca" | "produto";
  precoVenda: number;
  lucro: number;
  margemEfetiva: number;
  markupEfetivo: number;
  mostrarNoCard: boolean;
}

export function usePrecoVenda(
  precoAtacado: number,
  brandSlug?: string,
  productId?: string
): PrecoVenda {
  const state = usePrecificacaoState();
  return useMemo(() => {
    const { regra, origem } = getRegra(state, brandSlug, productId);
    const precoVenda = calcularVenda(precoAtacado, regra);
    const { lucro, margemEfetiva, markupEfetivo } = calcularLucro(precoAtacado, precoVenda);
    return { regra, origem, precoVenda, lucro, margemEfetiva, markupEfetivo, mostrarNoCard: state.mostrarNoCard };
  }, [state, precoAtacado, brandSlug, productId]);
}
