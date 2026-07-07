// Filtragem por região/perfil. Fonte única para todas as abas do Painel Gestor.
import type { Seed, Representante } from "../data/seed";
import type { PerfilCtx } from "@/hooks/useVendedorPerfil";

export type Escopo = "nacional" | string; // string = regiao

export function regioesDisponiveis(seed: Seed): string[] {
  return Array.from(new Set(seed.representantes.map(r => r.regiao))).sort();
}

/** Escopo permitido pelo perfil. Regional só enxerga a própria região. */
export function escopoPermitido(perfil: PerfilCtx, escopo: Escopo): Escopo {
  if (perfil.perfil === "gestor_regional" && perfil.regiao) return perfil.regiao;
  return escopo;
}

/** Reps dentro do escopo atual. */
export function repsNoEscopo(seed: Seed, escopo: Escopo): Representante[] {
  if (escopo === "nacional") return seed.representantes;
  return seed.representantes.filter(r => r.regiao === escopo);
}

/** IDs dos reps no escopo — útil para filtrar contas/pedidos/oportunidades. */
export function repIdsNoEscopo(seed: Seed, escopo: Escopo): Set<string> {
  return new Set(repsNoEscopo(seed, escopo).map(r => r.id));
}
