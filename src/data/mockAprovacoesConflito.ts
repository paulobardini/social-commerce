// Mock de conflitos de lead escalados ao gestor (Fase 7.2).
// Persistido em localStorage no mesmo padrão dos demais mocks.

export type StatusConflito = "pendente" | "resolvido_dono" | "resolvido_novo";

export interface ConflitoLead {
  id: string;
  cardId: string;
  nomeLead: string;
  telefone: string;
  cnpj?: string;
  vendedorDonoId: string;
  vendedorDonoNome: string;
  vendedorNovoId: string;
  vendedorNovoNome: string;
  motivo: string; // "CNPJ já pertence a X" etc.
  criadoEm: string;
  status: StatusConflito;
  decidoPor?: string;
  decidoEm?: string;
}

const LS = "nextil_conflitos_lead_v1";

export const loadConflitos = (): ConflitoLead[] => {
  try { const raw = localStorage.getItem(LS); if (raw) return JSON.parse(raw); } catch {}
  return [];
};
export const saveConflitos = (c: ConflitoLead[]) => { try { localStorage.setItem(LS, JSON.stringify(c)); } catch {} };
