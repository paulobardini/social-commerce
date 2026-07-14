// MOCK: perfil do usuário logado no módulo Vendedor.
// Em produção isso virá do backend/Auth. Default = "gestor" NACIONAL para liberar
// ações administrativas e ver todas as regiões. Troque para "gestor_regional" com
// uma regiao para validar o escopo travado, ou "vendedor" para restringir ações.
export type PerfilVendedor = "vendedor" | "gestor" | "gestor_regional" | "admin" | "marketing";

export interface PerfilCtx {
  perfil: PerfilVendedor;
  regiao?: string;
}

const LS_KEY = "nextil_perfil_ativo";

function getStored(): PerfilVendedor {
  try {
    const v = localStorage.getItem(LS_KEY);
    if (v && ["vendedor", "gestor", "gestor_regional", "admin", "marketing"].includes(v)) return v as PerfilVendedor;
  } catch {}
  return "gestor";
}

const MOCK_PERFIL: PerfilCtx = { perfil: getStored() };

export function setPerfilAtivo(p: PerfilVendedor) {
  MOCK_PERFIL.perfil = p;
  try { localStorage.setItem(LS_KEY, p); } catch {}
  // força reload leve para o menu reagir (mock)
  window.dispatchEvent(new Event("perfil-alterado"));
}

export function useVendedorPerfil(): PerfilVendedor {
  return MOCK_PERFIL.perfil;
}

export function useVendedorPerfilCtx(): PerfilCtx {
  return MOCK_PERFIL;
}

export function podeRedistribuir(perfil: PerfilVendedor) {
  return perfil === "gestor" || perfil === "admin" || perfil === "gestor_regional" || perfil === "marketing";
}

export function isGestor(perfil: PerfilVendedor) {
  return perfil === "gestor" || perfil === "admin" || perfil === "gestor_regional";
}

export function isMarketing(perfil: PerfilVendedor) {
  return perfil === "marketing";
}
