export type AbcClasse = "A" | "B" | "C";

export interface AbcRow<T> { item: T; valor: number; acumulado: number; pct: number; classe: AbcClasse; }

export function curvaAbc<T>(items: { item: T; valor: number }[]): AbcRow<T>[] {
  const sorted = [...items].sort((a, b) => b.valor - a.valor);
  const total = sorted.reduce((s, x) => s + x.valor, 0) || 1;
  let acc = 0;
  return sorted.map(({ item, valor }) => {
    acc += valor;
    const pct = (acc / total) * 100;
    const classe: AbcClasse = pct <= 80 ? "A" : pct <= 95 ? "B" : "C";
    return { item, valor, acumulado: acc, pct, classe };
  });
}
