// Selectors puros para PlanoRecuperacao — progresso, escalada e métricas.
import type { TarefaExt } from "@/contexts/TarefasContext";
import { HOJE_ANCHOR, parseBR } from "@/lib/acoes";

export type PlanoTipo = "cliente_risco" | "ritmo";
export type PlanoStatus = "aguardando_resposta" | "ativo" | "concluido" | "escalado" | "cancelado";
export type CompromissoTipo = "cobrir_clientes" | "resgatar_cliente" | "enviar_proposta" | "visita";

export interface Compromisso {
  id: string;
  tipo: CompromissoTipo;
  descricao: string;
  alvo?: number;
  clienteId?: string;
  clienteNome?: string;
  prazo: string;      // DD/MM/YYYY
  concluido: boolean; // manual OU auto
}

export interface PlanoLog {
  ts: string;
  autor: "gestor" | "rep" | "sistema";
  texto: string;
}

export interface PlanoRecuperacao {
  id: string;
  repId: string;
  repNome: string;
  tipo: PlanoTipo;
  contexto: {
    clienteId?: string;
    clienteNome?: string;
    valor?: number;
    pace?: number;
    coberturaDelta?: number;
  };
  notaGestor: string;
  gestorId: string;
  solicitadoEm: string;  // ISO
  prazoResposta: string; // ISO
  respondidoEm?: string;
  diagnostico?: string;
  status: PlanoStatus;
  compromissos: Compromisso[];
  log: PlanoLog[];
  encerradoEm?: string;
  notaEncerramento?: string;
  encerradoAuto?: boolean;
}

// ---------- SLA (24h úteis) ----------
export function addBusinessHours(iso: string, hours: number): string {
  const d = new Date(iso);
  let remaining = hours;
  while (remaining > 0) {
    d.setHours(d.getHours() + 1);
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) remaining -= 1;
  }
  return d.toISOString();
}

// ---------- Progresso automático por ações reais ----------
// Considera concluídas: atendimentos (tarefas concluídas com clienteId após solicitadoEm).
export function progressoCompromisso(
  c: Compromisso,
  plano: PlanoRecuperacao,
  tarefasDoRep: TarefaExt[],
): number {
  if (c.concluido) return 1;
  const desde = new Date(plano.solicitadoEm);
  const concluidasDepois = tarefasDoRep.filter(t => {
    if (t.status !== "concluida") return false;
    // vencimento é DD/MM/YYYY — aproximamos "conclusão" pela data de vencimento
    const d = parseBR(t.vencimento);
    return d ? d.getTime() >= new Date(desde.getFullYear(), desde.getMonth(), desde.getDate()).getTime() : true;
  });

  switch (c.tipo) {
    case "cobrir_clientes": {
      const alvo = c.alvo ?? 10;
      const distintos = new Set(concluidasDepois.map(t => t.clienteId).filter(Boolean));
      return Math.min(1, distintos.size / alvo);
    }
    case "resgatar_cliente": {
      if (!c.clienteId) return 0;
      return concluidasDepois.some(t => t.clienteId === c.clienteId) ? 1 : 0;
    }
    case "enviar_proposta": {
      if (!c.clienteId) return 0;
      return concluidasDepois.some(t => t.clienteId === c.clienteId && (t.tipo === "follow_up" || t.tipo === "outros")) ? 1 : 0;
    }
    case "visita": {
      if (!c.clienteId) return 0;
      return concluidasDepois.some(t => t.clienteId === c.clienteId && t.tipo === "visita") ? 1 : 0;
    }
  }
}

export function progressoPlano(plano: PlanoRecuperacao, tarefasDoRep: TarefaExt[]): number {
  if (!plano.compromissos.length) return 0;
  const soma = plano.compromissos.reduce((s, c) => s + progressoCompromisso(c, plano, tarefasDoRep), 0);
  return soma / plano.compromissos.length;
}

export function compromissosAtrasados(plano: PlanoRecuperacao, tarefasDoRep: TarefaExt[]): number {
  return plano.compromissos.filter(c => {
    if (progressoCompromisso(c, plano, tarefasDoRep) >= 1) return false;
    const d = parseBR(c.prazo);
    return d ? d.getTime() < HOJE_ANCHOR.getTime() : false;
  }).length;
}

// ---------- Escalada por SLA ----------
export function deveEscalar(plano: PlanoRecuperacao, agora: Date = new Date()): boolean {
  if (plano.status !== "aguardando_resposta") return false;
  return agora.getTime() > new Date(plano.prazoResposta).getTime();
}

export function horasDesdePrazo(plano: PlanoRecuperacao, agora: Date = new Date()): number {
  return Math.max(0, (agora.getTime() - new Date(plano.prazoResposta).getTime()) / 3600000);
}

// ---------- Sugestões automáticas de compromissos ----------
export function sugerirCompromissos(plano: PlanoRecuperacao): Omit<Compromisso, "id" | "concluido">[] {
  const hoje = new Date(HOJE_ANCHOR);
  const addDias = (n: number) => {
    const d = new Date(hoje); d.setDate(d.getDate() + n);
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  };
  if (plano.tipo === "cliente_risco" && plano.contexto.clienteId) {
    return [
      { tipo: "resgatar_cliente", descricao: `Resgatar ${plano.contexto.clienteNome ?? "cliente"} — atendimento imediato`, clienteId: plano.contexto.clienteId, clienteNome: plano.contexto.clienteNome, prazo: addDias(2) },
      { tipo: "visita", descricao: `Visita presencial em até 7 dias`, clienteId: plano.contexto.clienteId, clienteNome: plano.contexto.clienteNome, prazo: addDias(7) },
    ];
  }
  return [
    { tipo: "cobrir_clientes", descricao: `Cobrir 15 clientes da carteira em 5 dias`, alvo: 15, prazo: addDias(5) },
    { tipo: "enviar_proposta", descricao: `Enviar proposta a cliente-chave`, prazo: addDias(3) },
  ];
}

// ---------- Métricas do loop ----------
export interface MetricasLoop {
  tempoMedioRespostaHoras: number | null;
  cumpridos: number;
  total: number;
}

export function metricasLoop(planos: PlanoRecuperacao[]): MetricasLoop {
  const respondidos = planos.filter(p => p.respondidoEm);
  const tempos = respondidos.map(p => (new Date(p.respondidoEm!).getTime() - new Date(p.solicitadoEm).getTime()) / 3600000);
  const media = tempos.length ? tempos.reduce((s, x) => s + x, 0) / tempos.length : null;
  const encerrados = planos.filter(p => p.status === "concluido" || p.status === "cancelado" || p.status === "escalado");
  const cumpridos = planos.filter(p => p.status === "concluido").length;
  return { tempoMedioRespostaHoras: media, cumpridos, total: encerrados.length };
}
