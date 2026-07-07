// Decisões do gestor: aprovações, time fora do ritmo, clientes-chave em risco, negócios parados.
// Cada função retorna itens com motivo explícito + valor em jogo, prontos para render.
import { differenceInDays } from "date-fns";
import type { Seed, OrcamentoPendente, Representante, Oportunidade, MotivoAprovacao } from "../data/seed";
import type { ContaClassificada } from "./classificar";
import { curvaAbc } from "./abc";
import type { Escopo } from "./escopo";
import { repIdsNoEscopo } from "./escopo";

// ============ APROVAÇÕES ============
export interface AprovacaoItem extends OrcamentoPendente {
  clienteNome: string;
  repNome: string;
}

export function filaAprovacoes(seed: Seed, escopo: Escopo): AprovacaoItem[] {
  const reps = repIdsNoEscopo(seed, escopo);
  return seed.orcamentosPendentes
    .filter(o => reps.has(o.repId))
    .map(o => ({
      ...o,
      clienteNome: seed.contas.find(c => c.id === o.contaId)?.razao ?? "—",
      repNome: seed.representantes.find(r => r.id === o.repId)?.nome ?? "—",
    }))
    .sort((a, b) => b.valor - a.valor);
}

export const motivoAprovacaoLabel: Record<MotivoAprovacao, string> = {
  fora_da_politica: "Fora da política",
  credito_cliente_novo: "Análise de crédito",
  aguardando_estoque: "Aguardando estoque",
};

export const motivoAprovacaoBadge: Record<MotivoAprovacao, string> = {
  fora_da_politica: "bg-amber-100 text-amber-800 border-amber-300",
  credito_cliente_novo: "bg-sky-100 text-sky-800 border-sky-300",
  aguardando_estoque: "bg-violet-100 text-violet-800 border-violet-300",
};

// ============ TIME FORA DO RITMO ============
export interface RepForaRitmoItem {
  rep: Representante;
  motivo: string;
  severidade: "alerta" | "critico";
}

export function repsForaRitmo(seed: Seed, escopo: Escopo): RepForaRitmoItem[] {
  const reps = repIdsNoEscopo(seed, escopo);
  const out: RepForaRitmoItem[] = [];
  for (const r of seed.representantes) {
    if (!reps.has(r.id)) continue;
    const motivos: string[] = [];
    if (r.pace < 80) motivos.push(`Pace ${r.pace}% (meta 100%)`);
    if (r.coberturaDelta <= -10) motivos.push(`Cobertura caindo ${r.coberturaDelta}pp vs mês anterior`);
    if (r.ultimoAcessoDias >= 7) motivos.push(`Sem acesso há ${r.ultimoAcessoDias}d`);
    if (!motivos.length) continue;
    const critico = r.pace < 60 || r.ultimoAcessoDias >= 10;
    out.push({ rep: r, motivo: motivos.join(" · "), severidade: critico ? "critico" : "alerta" });
  }
  return out.sort((a, b) => a.rep.pace - b.rep.pace);
}

// ============ CLIENTES-CHAVE EM RISCO ============
export interface ClienteChaveRiscoItem {
  cliente: ContaClassificada;
  repNome: string;
  valor12m: number;
  diasRestantes: number;
}

export function clientesChaveRisco(
  classificadas: ContaClassificada[],
  seed: Seed,
  escopo: Escopo,
  diasPerdido: number,
): ClienteChaveRiscoItem[] {
  const reps = repIdsNoEscopo(seed, escopo);
  const noEscopo = classificadas.filter(c => reps.has(c.conta.repId));
  const abc = curvaAbc(
    noEscopo.filter(c => c.valor12m > 0).map(c => ({ item: c, valor: c.valor12m })),
  );
  const idsA = new Set(abc.filter(r => r.classe === "A").map(r => (r.item as ContaClassificada).conta.id));

  return noEscopo
    .filter(c => idsA.has(c.conta.id) && c.status === "inativo")
    .map(c => ({
      cliente: c,
      repNome: seed.representantes.find(r => r.id === c.conta.repId)?.nome ?? "—",
      valor12m: c.valor12m,
      diasRestantes: Math.max(0, diasPerdido - c.recencia),
    }))
    .filter(x => x.diasRestantes <= 30)
    .sort((a, b) => a.diasRestantes - b.diasRestantes)
    .slice(0, 12);
}

// ============ NEGÓCIOS GRANDES PARADOS ============
export interface NegocioParadoItem {
  op: Oportunidade;
  clienteNome: string;
  repNome: string;
  diasParado: number;
}

export function negociosGrandesParados(
  seed: Seed,
  escopo: Escopo,
  minValor = 20000,
  minDias = 7,
): NegocioParadoItem[] {
  const reps = repIdsNoEscopo(seed, escopo);
  const abertas = ["novo_lead", "em_negociacao", "proposta_enviada", "orcamento_aprovado"];
  return seed.oportunidades
    .filter(o => reps.has(o.repId) && abertas.includes(o.etapa) && o.valor >= minValor)
    .map(o => ({
      op: o,
      clienteNome: seed.contas.find(c => c.id === o.contaId)?.razao ?? "—",
      repNome: seed.representantes.find(r => r.id === o.repId)?.nome ?? "—",
      diasParado: differenceInDays(seed.hoje, o.ultimaMov),
    }))
    .filter(x => x.diasParado >= minDias)
    .sort((a, b) => b.op.valor - a.op.valor)
    .slice(0, 10);
}

// ============ AGREGAR ALERTAS ESTRUTURAIS ============
// Se ≥60% dos reps disparam o mesmo alerta, colapsa em 1 insight estrutural.
export interface AlertaEstrutural { titulo: string; descricao: string; }

export function insightsEstruturais(
  seed: Seed,
  escopo: Escopo,
  classificadas: ContaClassificada[],
): AlertaEstrutural[] {
  const reps = Array.from(repIdsNoEscopo(seed, escopo));
  if (!reps.length) return [];
  const out: AlertaEstrutural[] = [];

  // % inativos por rep
  const pctsInativos = reps.map(rid => {
    const arr = classificadas.filter(c => c.conta.repId === rid && c.status !== "lead");
    const inat = arr.filter(c => c.status === "inativo").length;
    return arr.length ? (inat / arr.length) * 100 : 0;
  });
  const altos = pctsInativos.filter(p => p > 30).length;
  if (altos / reps.length >= 0.6) {
    const media = Math.round(pctsInativos.reduce((s, x) => s + x, 0) / pctsInativos.length);
    out.push({
      titulo: `Carteira inativa média do time em ${media}%`,
      descricao: `${altos} de ${reps.length} representantes acima de 30% de inatividade — problema estrutural, não pontual.`,
    });
  }

  // Pace baixo generalizado
  const paces = reps.map(rid => seed.representantes.find(r => r.id === rid)?.pace ?? 0);
  const paceBaixo = paces.filter(p => p < 80).length;
  if (paceBaixo / reps.length >= 0.6) {
    const media = Math.round(paces.reduce((s, x) => s + x, 0) / paces.length);
    out.push({
      titulo: `Pace médio do time em ${media}%`,
      descricao: `${paceBaixo} de ${reps.length} representantes abaixo de 80% da meta — revisar meta agregada ou plano de ação coletivo.`,
    });
  }

  return out;
}

// ============ AUDITORIA ============
export interface AprovacaoLog {
  id: string;
  orcamentoId: string;
  motivo: MotivoAprovacao;
  decisao: "aprovado" | "reprovado" | "devolvido" | "notificar_estoque" | "solicitar_docs" | "cancelado";
  gestorId: string;
  timestamp: string;
  nota?: string;
}

export interface MetaLog {
  id: string;
  mes: string;
  escopo: string;
  totalMeta: number;
  gestorId: string;
  timestamp: string;
  mudancaMesCorrente: boolean;
  detalhesReps: { repId: string; valor: number }[];
}
