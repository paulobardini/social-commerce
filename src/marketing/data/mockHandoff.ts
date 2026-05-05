// Estado do handoff Marketing → CRM (lead virou cliente/oportunidade?)
export type HandoffStatus = "pendente" | "convertido" | "descartado" | "ignorado";

export interface HandoffRecord {
  leadId: string;
  status: HandoffStatus;
  clienteId?: string;
  oportunidadeId?: string;
  convertidoEm?: string;
  convertidoPor?: string;
  motivoDescarte?: string;
}

export const mockHandoffSeed: HandoffRecord[] = [];
