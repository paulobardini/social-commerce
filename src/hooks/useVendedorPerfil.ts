// MOCK: perfil do usuário logado no módulo Vendedor.
// Em produção isso virá do backend/Auth. Default = "gestor" NACIONAL para liberar
// ações administrativas e ver todas as regiões. Troque para "gestor_regional" com
// uma regiao para validar o escopo travado, ou "vendedor" para restringir ações.
export type PerfilVendedor = "vendedor" | "gestor" | "gestor_regional" | "admin";

export interface PerfilCtx {
  perfil: PerfilVendedor;
  regiao?: string;
}

const MOCK_PERFIL: PerfilCtx = { perfil: "gestor" };

export function useVendedorPerfil(): PerfilVendedor {
  return MOCK_PERFIL.perfil;
}

export function useVendedorPerfilCtx(): PerfilCtx {
  return MOCK_PERFIL;
}

export function podeRedistribuir(perfil: PerfilVendedor) {
  return perfil === "gestor" || perfil === "admin" || perfil === "gestor_regional";
}

export function isGestor(perfil: PerfilVendedor) {
  return perfil === "gestor" || perfil === "admin" || perfil === "gestor_regional";
}
