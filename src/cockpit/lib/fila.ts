import { differenceInDays } from "date-fns";
import type { Seed } from "../data/seed";
import { classificarTudo } from "./classificar";
import { ETAPAS_FUNIL } from "./funis";

export interface FilaItem {
  contaId: string;
  razao: string;
  status: string;
  motivo: string;
  diasRestantes?: number;
  diasSemAcao?: number;
  valor?: number;
  ultimaInteracao?: Date;
  repId: string;
}

export interface FilaAcao {
  inativosEmRisco: FilaItem[];
  leadsQuentesParados: FilaItem[];
  ativosSemCobertura: FilaItem[];
  total: number;
}

export function filaAcaoVendedor(
  seed: Seed,
  repId: string,
  diasAtivo: number,
  diasPerdido: number,
  diasSemAcaoLead = 5,
  janelaSemCoberturaDias = 30
): FilaAcao {
  const contas = seed.contas.filter(c => c.repId === repId);
  const pedidos = seed.pedidos.filter(p => p.repId === repId);
  const atendimentos = seed.atendimentos.filter(a => a.repId === repId);
  const ops = seed.oportunidades.filter(o => o.repId === repId);

  const cortePeriodo = new Date(seed.hoje); cortePeriodo.setDate(cortePeriodo.getDate() - janelaSemCoberturaDias);

  const classificadas = classificarTudo(contas, pedidos, { from: cortePeriodo, to: seed.hoje }, diasAtivo, diasPerdido, seed.hoje);

  // 1) Inativos prestes a virar perdidos (faltam ≤15 dias)
  const inativosEmRisco: FilaItem[] = classificadas
    .filter(c => c.status === "inativo")
    .map(c => ({
      diasRestantes: diasPerdido - c.recencia,
      conta: c,
    }))
    .filter(x => x.diasRestantes <= 15)
    .sort((a, b) => a.diasRestantes - b.diasRestantes)
    .map(({ conta: c, diasRestantes }) => ({
      contaId: c.conta.id,
      razao: c.conta.razao,
      status: "Inativo",
      motivo: `Sem compra há ${c.recencia} dias`,
      diasRestantes,
      valor: c.valor12m,
      ultimaInteracao: c.ultimoPedido,
      repId,
    }));

  // 2) Leads/oportunidades quentes paradas (sem movimento há ≥N dias)
  const leadsQuentesParados: FilaItem[] = ops
    .filter(o => ETAPAS_FUNIL.includes(o.etapa))
    .map(o => ({ op: o, dias: differenceInDays(seed.hoje, o.ultimaMov) }))
    .filter(x => x.dias >= diasSemAcaoLead)
    .sort((a, b) => b.dias - a.dias)
    .slice(0, 20)
    .map(({ op, dias }) => {
      const c = contas.find(x => x.id === op.contaId);
      return {
        contaId: op.contaId,
        razao: c?.razao ?? op.contaId,
        status: `Oportunidade · ${op.etapa.replace("_", " ")}`,
        motivo: `Sem movimento há ${dias} dias`,
        diasSemAcao: dias,
        valor: op.valor,
        ultimaInteracao: op.ultimaMov,
        repId,
      };
    });

  // 3) Ativos sem cobertura no período (sem atendimento nos últimos N dias)
  const contatadosRecentemente = new Set(
    atendimentos.filter(a => a.data >= cortePeriodo).map(a => a.contaId)
  );
  const ativosSemCobertura: FilaItem[] = classificadas
    .filter(c => c.status === "ativo" && !contatadosRecentemente.has(c.conta.id))
    .sort((a, b) => b.recencia - a.recencia)
    .slice(0, 30)
    .map(c => ({
      contaId: c.conta.id,
      razao: c.conta.razao,
      status: "Ativo · sem cobertura",
      motivo: `Sem contato há ${janelaSemCoberturaDias}+ dias`,
      valor: c.valor12m,
      ultimaInteracao: c.ultimoPedido,
      repId,
    }));

  return {
    inativosEmRisco,
    leadsQuentesParados,
    ativosSemCobertura,
    total: inativosEmRisco.length + leadsQuentesParados.length + ativosSemCobertura.length,
  };
}
