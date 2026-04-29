// MOCK: perfil do usuário logado no módulo Vendedor.
// Em produção isso virá do backend/Auth. Default = "gestor" para liberar
// ações administrativas (Redistribuir etc.). Troque para "vendedor" para
// validar a regra de ocultação.
export type PerfilVendedor = "vendedor" | "gestor" | "admin";

const MOCK_PERFIL: PerfilVendedor = "gestor";

export function useVendedorPerfil(): PerfilVendedor {
  return MOCK_PERFIL;
}

export function podeRedistribuir(perfil: PerfilVendedor) {
  return perfil === "gestor" || perfil === "admin";
}
