// Phase 4 — Representantes & Carteira data
import type { Cliente360 } from "./mockCRM360";

export interface Representante {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  regiao: string;
  estado: string;
  status: "ativo" | "inativo" | "ferias";
  dataEntrada: string;
  ultimoAcesso: string;
  carteiraTotal: number;
  clientesAtivos: number;
  clientesEmRisco: number;
  clientesReativacao: number;
  oportunidadesAbertas: number;
  taxaConversao: number;
  tarefasPendentes: number;
  faturamentoMes: number;
  faturamentoAno: number;
  metaMensal: number;
  avatar?: string;
}

export interface EtapaClienteKanban {
  id: string;
  nome: string;
  cor: string;
  ordem: number;
  ativa: boolean;
}

export interface SegmentacaoSalva {
  id: string;
  nome: string;
  filtros: Record<string, string>;
  criadoPor: string;
  dataCriacao: string;
  totalClientes: number;
}

export const etapasClienteKanbanDefault: EtapaClienteKanban[] = [
  { id: "ek1", nome: "Novo", cor: "#3b82f6", ordem: 1, ativa: true },
  { id: "ek2", nome: "Em ativação", cor: "#8b5cf6", ordem: 2, ativa: true },
  { id: "ek3", nome: "Ativo infantil", cor: "#10b981", ordem: 3, ativa: true },
  { id: "ek4", nome: "Ativo adulto", cor: "#06b6d4", ordem: 4, ativa: true },
  { id: "ek5", nome: "Ativo fitness", cor: "#f59e0b", ordem: 5, ativa: true },
  { id: "ek6", nome: "Ativo multimarcas", cor: "#6366f1", ordem: 6, ativa: true },
  { id: "ek7", nome: "Em risco", cor: "#ef4444", ordem: 7, ativa: true },
  { id: "ek8", nome: "Reativação", cor: "#f97316", ordem: 8, ativa: true },
  { id: "ek9", nome: "Inativo", cor: "#94a3b8", ordem: 9, ativa: true },
];

// Map clientes to pipeline stage based on status+nicho
export function getClienteEtapaKanban(c: Cliente360): string {
  if (c.status === "novo") return "ek1";
  if (c.status === "reativacao") return "ek8";
  if (c.status === "inativo") return "ek9";
  if (c.status === "em_risco") return "ek7";
  // ativo → by nicho
  if (c.nicho === "infantil") return "ek3";
  if (c.nicho === "adulto") return "ek4";
  if (c.nicho === "fitness") return "ek5";
  if (c.nicho === "multimarcas") return "ek6";
  return "ek2"; // em_ativacao default
}

export const mockRepresentantes: Representante[] = [
  { id: "rep1", nome: "Paulo Bardini", email: "paulo@nextil.com.br", telefone: "(47) 99901-0001", regiao: "Sul", estado: "SC", status: "ativo", dataEntrada: "15/03/2022", ultimoAcesso: "13/04/2026 08:30", carteiraTotal: 14, clientesAtivos: 8, clientesEmRisco: 1, clientesReativacao: 1, oportunidadesAbertas: 8, taxaConversao: 68, tarefasPendentes: 12, faturamentoMes: 42500, faturamentoAno: 387000, metaMensal: 50000 },
  { id: "rep2", nome: "Mariana Costa", email: "mariana@nextil.com.br", telefone: "(11) 99902-0002", regiao: "Sudeste", estado: "SP", status: "ativo", dataEntrada: "10/06/2023", ultimoAcesso: "13/04/2026 09:15", carteiraTotal: 18, clientesAtivos: 12, clientesEmRisco: 3, clientesReativacao: 2, oportunidadesAbertas: 6, taxaConversao: 72, tarefasPendentes: 8, faturamentoMes: 58000, faturamentoAno: 520000, metaMensal: 60000 },
  { id: "rep3", nome: "Ricardo Alves", email: "ricardo@nextil.com.br", telefone: "(21) 99903-0003", regiao: "Sudeste", estado: "RJ", status: "ativo", dataEntrada: "01/02/2024", ultimoAcesso: "12/04/2026 17:45", carteiraTotal: 11, clientesAtivos: 6, clientesEmRisco: 2, clientesReativacao: 1, oportunidadesAbertas: 4, taxaConversao: 55, tarefasPendentes: 5, faturamentoMes: 31000, faturamentoAno: 285000, metaMensal: 45000 },
  { id: "rep4", nome: "Fernanda Lima", email: "fernanda@nextil.com.br", telefone: "(31) 99904-0004", regiao: "Sudeste", estado: "MG", status: "ativo", dataEntrada: "20/08/2023", ultimoAcesso: "13/04/2026 07:50", carteiraTotal: 15, clientesAtivos: 10, clientesEmRisco: 1, clientesReativacao: 0, oportunidadesAbertas: 7, taxaConversao: 75, tarefasPendentes: 6, faturamentoMes: 64000, faturamentoAno: 580000, metaMensal: 55000 },
  { id: "rep5", nome: "Carlos Mendes", email: "carlos@nextil.com.br", telefone: "(51) 99905-0005", regiao: "Sul", estado: "RS", status: "ativo", dataEntrada: "05/01/2023", ultimoAcesso: "11/04/2026 16:20", carteiraTotal: 9, clientesAtivos: 5, clientesEmRisco: 2, clientesReativacao: 1, oportunidadesAbertas: 3, taxaConversao: 60, tarefasPendentes: 4, faturamentoMes: 28000, faturamentoAno: 245000, metaMensal: 40000 },
  { id: "rep6", nome: "Ana Beatriz Souza", email: "ana@nextil.com.br", telefone: "(61) 99906-0006", regiao: "Centro-Oeste", estado: "DF", status: "ferias", dataEntrada: "10/11/2023", ultimoAcesso: "05/04/2026 11:00", carteiraTotal: 7, clientesAtivos: 4, clientesEmRisco: 1, clientesReativacao: 0, oportunidadesAbertas: 2, taxaConversao: 63, tarefasPendentes: 0, faturamentoMes: 0, faturamentoAno: 198000, metaMensal: 35000 },
  { id: "rep7", nome: "João Pedro Oliveira", email: "joao@nextil.com.br", telefone: "(71) 99907-0007", regiao: "Nordeste", estado: "BA", status: "ativo", dataEntrada: "15/05/2024", ultimoAcesso: "13/04/2026 10:10", carteiraTotal: 12, clientesAtivos: 7, clientesEmRisco: 3, clientesReativacao: 2, oportunidadesAbertas: 5, taxaConversao: 50, tarefasPendentes: 9, faturamentoMes: 35000, faturamentoAno: 310000, metaMensal: 45000 },
];

export const mockSegmentacoes: SegmentacaoSalva[] = [
  { id: "seg1", nome: "Clientes fitness ativos", filtros: { nicho: "fitness", status: "ativo" }, criadoPor: "Paulo Bardini", dataCriacao: "10/04/2026", totalClientes: 3 },
  { id: "seg2", nome: "Infantis em risco", filtros: { nicho: "infantil", status: "em_risco" }, criadoPor: "Paulo Bardini", dataCriacao: "08/04/2026", totalClientes: 1 },
  { id: "seg3", nome: "Clientes adultos sem contato", filtros: { nicho: "adulto", semContato: "30" }, criadoPor: "Paulo Bardini", dataCriacao: "05/04/2026", totalClientes: 2 },
  { id: "seg4", nome: "Alto potencial sem oportunidade", filtros: { tag: "alto_potencial", oportunidades: "0" }, criadoPor: "Paulo Bardini", dataCriacao: "01/04/2026", totalClientes: 1 },
  { id: "seg5", nome: "Clientes estratégicos", filtros: { tag: "recorrente" }, criadoPor: "Mariana Costa", dataCriacao: "28/03/2026", totalClientes: 5 },
  { id: "seg6", nome: "Multimarcas região Sul", filtros: { nicho: "multimarcas", regiao: "Sul" }, criadoPor: "Carlos Mendes", dataCriacao: "25/03/2026", totalClientes: 2 },
];
