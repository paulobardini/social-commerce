import type { ContaClassificada } from "./classificar";
import type { DateRange } from "./range";

export interface WaterfallPonto { label: string; valor: number; tipo: "total" | "positivo" | "negativo"; acumulado: number; }

export function waterfallMovimento(classificadas: ContaClassificada[], _range: DateRange): WaterfallPonto[] {
  const saldoInicial = classificadas.filter(c => c.status === "ativo" || c.status === "inativo").length;
  const novos = classificadas.filter(c => c.novoNoPeriodo).length;
  const reativados = classificadas.filter(c => c.reativadoNoPeriodo).length;
  const perdidos = -classificadas.filter(c => c.status === "perdido").length;
  const saldoFinal = saldoInicial + novos + reativados + perdidos;
  let acc = saldoInicial;
  return [
    { label: "Saldo inicial", valor: saldoInicial, tipo: "total",     acumulado: acc },
    { label: "Novos",         valor: novos,        tipo: "positivo",  acumulado: (acc += novos) },
    { label: "Reativados",    valor: reativados,   tipo: "positivo",  acumulado: (acc += reativados) },
    { label: "Perdidos",      valor: perdidos,     tipo: "negativo",  acumulado: (acc += perdidos) },
    { label: "Saldo final",   valor: saldoFinal,   tipo: "total",     acumulado: saldoFinal },
  ];
}

export function funilRetencao(classificadas: ContaClassificada[]) {
  return [
    { etapa: "Ativo",      valor: classificadas.filter(c => c.status === "ativo").length },
    { etapa: "Inativo",    valor: classificadas.filter(c => c.status === "inativo").length },
    { etapa: "Perdido",    valor: classificadas.filter(c => c.status === "perdido").length },
    { etapa: "Reativado",  valor: classificadas.filter(c => c.reativadoNoPeriodo).length },
  ];
}

export function crescimentoAcumulado(classificadas: ContaClassificada[]) {
  const novos = classificadas.filter(c => c.novoNoPeriodo).length;
  const perdidos = classificadas.filter(c => c.status === "perdido").length;
  return novos - perdidos;
}
