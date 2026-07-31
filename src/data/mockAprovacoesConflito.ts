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

const LS = "nextil_conflitos_lead_v2";

const iso = (diasAtras: number, hora: number, min = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - diasAtras);
  d.setHours(hora, min, 0, 0);
  return d.toISOString();
};

// Seed de demonstração: 2 conflitos pendentes + 2 já decididos (histórico).
export const seedConflitos = (): ConflitoLead[] => [
  {
    id: "cf-seed-1", cardId: "c15b", nomeLead: "Kids Fashion Store", telefone: "+55 31 98765-0011",
    cnpj: "12.345.678/0001-90",
    vendedorDonoId: "v-paulo", vendedorDonoNome: "Paulo Bardini",
    vendedorNovoId: "v-marina", vendedorNovoNome: "Marina Costa",
    motivo: "CNPJ já pertence à carteira de Paulo Bardini (último pedido há 92 dias)",
    criadoEm: iso(1, 9, 30), status: "pendente",
  },
  {
    id: "cf-seed-2", cardId: "c15c", nomeLead: "+55 47 99120-4477", telefone: "+55 47 99120-4477",
    vendedorDonoId: "v-lucas", vendedorDonoNome: "Lucas Pereira",
    vendedorNovoId: "v-paulo", vendedorNovoNome: "Paulo Bardini",
    motivo: "Mesmo telefone já atendido por Lucas Pereira há 12 dias",
    criadoEm: iso(0, 8, 10), status: "pendente",
  },
  {
    id: "cf-seed-3", cardId: "c15d", nomeLead: "Super Baby Store", telefone: "+55 11 98812-3390",
    cnpj: "22.987.654/0001-11",
    vendedorDonoId: "v-marina", vendedorDonoNome: "Marina Costa",
    vendedorNovoId: "v-lucas", vendedorNovoNome: "Lucas Pereira",
    motivo: "CNPJ ativo na carteira de Marina Costa",
    criadoEm: iso(6, 14, 0), status: "resolvido_dono",
    decidoPor: "gestor", decidoEm: iso(5, 10, 20),
  },
  {
    id: "cf-seed-4", cardId: "c11", nomeLead: "Moda Teen BH", telefone: "+55 31 99441-2200",
    vendedorDonoId: "v-renata", vendedorDonoNome: "Renata Lopes",
    vendedorNovoId: "v-marina", vendedorNovoNome: "Marina Costa",
    motivo: "Dono da conta em férias — lead parado há 5 dias",
    criadoEm: iso(11, 11, 15), status: "resolvido_novo",
    decidoPor: "gestor", decidoEm: iso(10, 9, 40),
  },
];

export const loadConflitos = (): ConflitoLead[] => {
  try {
    const raw = localStorage.getItem(LS);
    if (raw) {
      const parsed = JSON.parse(raw) as ConflitoLead[];
      if (Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch {}
  return seedConflitos();
};
export const saveConflitos = (c: ConflitoLead[]) => { try { localStorage.setItem(LS, JSON.stringify(c)); } catch {} };

