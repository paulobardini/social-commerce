// PlanosContext — persistência local + operações do loop gestor↔rep.
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  addBusinessHours, deveEscalar, progressoCompromisso, progressoPlano,
  type Compromisso, type PlanoRecuperacao, type PlanoTipo,
} from "@/lib/planos";
import { useTarefas } from "@/contexts/TarefasContext";

const STORAGE = "planos:v1";

interface Ctx {
  planos: PlanoRecuperacao[];
  criarPlano: (payload: {
    repId: string; repNome: string; tipo: PlanoTipo;
    contexto: PlanoRecuperacao["contexto"]; notaGestor: string;
  }) => PlanoRecuperacao;
  responderPlano: (planoId: string, payload: {
    diagnostico: string;
    compromissos: Omit<Compromisso, "id" | "concluido">[];
  }) => void;
  encerrarPlano: (planoId: string, nota: string, motivo?: "manual" | "auto") => void;
  reforcarPlano: (planoId: string) => void;
  getPlanosDoRep: (repId: string) => PlanoRecuperacao[];
  getPlanosDoCliente: (clienteId: string) => PlanoRecuperacao[];
  getProgresso: (plano: PlanoRecuperacao) => number;
  getCompromissoProgresso: (plano: PlanoRecuperacao, c: Compromisso) => number;
}

const PlanosCtx = createContext<Ctx | null>(null);

function load(): PlanoRecuperacao[] {
  try { return JSON.parse(localStorage.getItem(STORAGE) ?? "[]"); } catch { return []; }
}
function save(p: PlanoRecuperacao[]) {
  try { localStorage.setItem(STORAGE, JSON.stringify(p)); } catch { /* noop */ }
}

export function PlanosProvider({ children }: { children: ReactNode }) {
  const [planos, setPlanos] = useState<PlanoRecuperacao[]>(() => load());
  const { tarefas, addTarefa } = useTarefas();

  useEffect(() => { save(planos); }, [planos]);

  // Escalada automática por SLA (a cada mount + a cada 60s)
  useEffect(() => {
    const check = () => setPlanos(prev => prev.map(p => {
      if (deveEscalar(p)) {
        return {
          ...p,
          status: "escalado",
          log: [...p.log, { ts: new Date().toISOString(), autor: "sistema", texto: `Sem resposta do rep no prazo (24h úteis) — escalado.` }],
        };
      }
      return p;
    }));
    check();
    const t = setInterval(check, 60000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const criarPlano: Ctx["criarPlano"] = useCallback((payload) => {
    const agora = new Date().toISOString();
    const novo: PlanoRecuperacao = {
      id: `plano-${Date.now()}`,
      repId: payload.repId,
      repNome: payload.repNome,
      tipo: payload.tipo,
      contexto: payload.contexto,
      notaGestor: payload.notaGestor,
      gestorId: "gestor-atual",
      solicitadoEm: agora,
      prazoResposta: addBusinessHours(agora, 24),
      status: "aguardando_resposta",
      compromissos: [],
      log: [{ ts: agora, autor: "gestor", texto: `Plano solicitado: ${payload.notaGestor}` }],
    };
    setPlanos(prev => [...prev, novo]);

    // Ação destacada na fila do rep
    const hoje = new Date();
    const venc = `${String(hoje.getDate()).padStart(2, "0")}/${String(hoje.getMonth() + 1).padStart(2, "0")}/${hoje.getFullYear()}`;
    addTarefa({
      titulo: payload.tipo === "cliente_risco"
        ? `Responder plano do gestor: ${payload.contexto.clienteNome ?? "cliente-chave"}`
        : `Responder plano de recuperação do gestor`,
      descricao: payload.notaGestor,
      tipo: "outros",
      clienteId: payload.contexto.clienteId,
      clienteNome: payload.contexto.clienteNome,
      prioridade: "alta",
      vencimento: venc,
      responsavel: payload.repNome,
      status: "pendente",
      origem: "sistema",
      recorrencia: "nenhuma",
      planoId: novo.id,
      solicitadoPor: "Gestor",
    });
    return novo;
  }, [addTarefa]);

  const responderPlano: Ctx["responderPlano"] = useCallback((planoId, payload) => {
    const agora = new Date().toISOString();
    setPlanos(prev => prev.map(p => {
      if (p.id !== planoId) return p;
      const compromissos: Compromisso[] = payload.compromissos.map((c, i) => ({
        ...c, id: `${planoId}-c-${i}-${Date.now()}`, concluido: false,
      }));
      // gerar tarefas encadeadas
      compromissos.forEach(c => {
        addTarefa({
          titulo: c.descricao,
          descricao: `Compromisso do plano (${payload.diagnostico})`,
          tipo: c.tipo === "visita" ? "visita" : c.tipo === "enviar_proposta" ? "follow_up" : "outros",
          clienteId: c.clienteId,
          clienteNome: c.clienteNome,
          prioridade: "alta",
          vencimento: c.prazo,
          responsavel: p.repNome,
          status: "pendente",
          origem: "sistema",
          recorrencia: "nenhuma",
          planoId: p.id,
          planoCompromissoId: c.id,
        });
      });
      return {
        ...p,
        status: "ativo",
        respondidoEm: agora,
        diagnostico: payload.diagnostico,
        compromissos,
        log: [...p.log, { ts: agora, autor: "rep", texto: `Plano respondido: ${payload.diagnostico}` }],
      };
    }));
  }, [addTarefa]);

  const encerrarPlano: Ctx["encerrarPlano"] = useCallback((planoId, nota, motivo = "manual") => {
    const agora = new Date().toISOString();
    setPlanos(prev => prev.map(p => p.id === planoId ? {
      ...p,
      status: "concluido",
      encerradoEm: agora,
      notaEncerramento: nota,
      encerradoAuto: motivo === "auto",
      log: [...p.log, { ts: agora, autor: motivo === "auto" ? "sistema" : "gestor", texto: `Encerrado (${motivo}): ${nota}` }],
    } : p));
  }, []);

  const reforcarPlano: Ctx["reforcarPlano"] = useCallback((planoId) => {
    const agora = new Date().toISOString();
    setPlanos(prev => prev.map(p => p.id === planoId ? {
      ...p, log: [...p.log, { ts: agora, autor: "gestor", texto: "Reforço enviado via WhatsApp" }],
    } : p));
  }, []);

  // Auto-encerramento por critério real (checa quando planos/tarefas mudam)
  useEffect(() => {
    setPlanos(prev => prev.map(p => {
      if (p.status !== "ativo") return p;
      const tarefasDoRep = tarefas.filter(t => t.responsavel === p.repNome);
      const todosOk = p.compromissos.length > 0 && p.compromissos.every(c => progressoCompromisso(c, p, tarefasDoRep) >= 1);
      if (todosOk) {
        return {
          ...p, status: "concluido", encerradoEm: new Date().toISOString(),
          notaEncerramento: "Todos os compromissos concluídos", encerradoAuto: true,
          log: [...p.log, { ts: new Date().toISOString(), autor: "sistema", texto: "Encerrado automaticamente — todos os compromissos concluídos." }],
        };
      }
      return p;
    }));
  }, [tarefas]);

  const value: Ctx = useMemo(() => ({
    planos,
    criarPlano, responderPlano, encerrarPlano, reforcarPlano,
    getPlanosDoRep: (repId) => planos.filter(p => p.repId === repId),
    getPlanosDoCliente: (clienteId) => planos.filter(p => p.contexto.clienteId === clienteId),
    getProgresso: (plano) => progressoPlano(plano, tarefas.filter(t => t.responsavel === plano.repNome)),
    getCompromissoProgresso: (plano, c) => progressoCompromisso(c, plano, tarefas.filter(t => t.responsavel === plano.repNome)),
  }), [planos, tarefas, criarPlano, responderPlano, encerrarPlano, reforcarPlano]);

  return <PlanosCtx.Provider value={value}>{children}</PlanosCtx.Provider>;
}

export function usePlanos() {
  const ctx = useContext(PlanosCtx);
  if (!ctx) throw new Error("usePlanos precisa de <PlanosProvider>");
  return ctx;
}
