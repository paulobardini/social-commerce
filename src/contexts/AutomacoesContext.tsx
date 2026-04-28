import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import {
  mockAutomacoes, mockAutomacoesAplicadas,
  type Automacao, type AutomacaoAplicada, type AutomacaoTipoTarefa,
} from "@/data/mockAutomacoes";
import { mockTarefas, type TarefaCRM, type OportunidadeEtapa } from "@/data/mockCRM";

export interface TarefaCRMExt extends Omit<TarefaCRM, "status"> {
  status: "pendente" | "concluida" | "atrasada" | "cancelada";
  tipo?: AutomacaoTipoTarefa;
  automacaoId?: string;
  automacaoNome?: string;
}

interface Ctx {
  automacoes: Automacao[];
  aplicadas: AutomacaoAplicada[];
  tarefas: TarefaCRMExt[];
  saveAutomacao: (a: Automacao) => void;
  deleteAutomacao: (id: string) => void;
  duplicateAutomacao: (id: string) => void;
  getAutomacoesParaEtapa: (etapa: OportunidadeEtapa) => Automacao[];
  getPosVenda: () => Automacao | undefined;
  cancelarTarefasPendentes: (oportunidadeId: string) => number;
  aplicarAutomacao: (oportunidadeId: string, automacaoId: string, dataInicialISO: string, aplicadaPor?: string) => void;
  concluirTarefa: (id: string) => void;
  editarTarefa: (id: string, patch: Partial<TarefaCRMExt>) => void;
}

const AutomacoesContext = createContext<Ctx | null>(null);

function formatDate(d: Date): string {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}
function formatDateTime(d: Date): string {
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${formatDate(d)} ${hh}:${mi}`;
}

export function AutomacoesProvider({ children }: { children: React.ReactNode }) {
  const [automacoes, setAutomacoes] = useState<Automacao[]>(mockAutomacoes);
  const [aplicadas, setAplicadas] = useState<AutomacaoAplicada[]>(mockAutomacoesAplicadas);
  const [tarefas, setTarefas] = useState<TarefaCRMExt[]>(mockTarefas as TarefaCRMExt[]);

  const saveAutomacao = useCallback((a: Automacao) => {
    setAutomacoes(prev => {
      const exists = prev.find(x => x.id === a.id);
      return exists ? prev.map(x => x.id === a.id ? a : x) : [...prev, a];
    });
  }, []);

  const deleteAutomacao = useCallback((id: string) => {
    setAutomacoes(prev => prev.filter(a => a.id !== id));
  }, []);

  const duplicateAutomacao = useCallback((id: string) => {
    setAutomacoes(prev => {
      const orig = prev.find(a => a.id === id);
      if (!orig) return prev;
      const copy: Automacao = {
        ...orig,
        id: `auto_${Date.now()}`,
        nome: `${orig.nome} (cópia)`,
        tarefas: orig.tarefas.map((t, i) => ({ ...t, id: `at_${Date.now()}_${i}` })),
        createdAt: formatDate(new Date()),
      };
      return [...prev, copy];
    });
  }, []);

  const getAutomacoesParaEtapa = useCallback(
    (etapa: OportunidadeEtapa) => automacoes.filter(a => a.etapasVinculadas.includes(etapa) && !a.isPosVenda),
    [automacoes]
  );

  const getPosVenda = useCallback(
    () => automacoes.find(a => a.isPosVenda),
    [automacoes]
  );

  const cancelarTarefasPendentes = useCallback((oportunidadeId: string) => {
    let count = 0;
    setTarefas(prev => prev.map(t => {
      if (t.oportunidadeId === oportunidadeId && (t.status === "pendente" || t.status === "atrasada") && t.automacaoId) {
        count++;
        return { ...t, status: "cancelada" };
      }
      return t;
    }));
    setAplicadas(prev => prev.map(a =>
      a.oportunidadeId === oportunidadeId && !a.encerradaEm
        ? { ...a, encerradaEm: formatDateTime(new Date()) }
        : a
    ));
    return count;
  }, []);

  const aplicarAutomacao = useCallback((oportunidadeId: string, automacaoId: string, dataInicialISO: string, aplicadaPor = "Paulo Bardini") => {
    const auto = automacoes.find(a => a.id === automacaoId);
    if (!auto) return;
    const dataInicial = new Date(dataInicialISO + "T00:00:00");
    let cumDias = 0;
    const novas: TarefaCRMExt[] = auto.tarefas.map((t, idx) => {
      cumDias += t.intervaloDias;
      const venc = new Date(dataInicial);
      venc.setDate(venc.getDate() + cumDias);
      return {
        id: `t_${Date.now()}_${idx}`,
        oportunidadeId,
        titulo: t.nome,
        descricao: `Tarefa gerada pela automação "${auto.nome}"`,
        status: "pendente",
        prioridade: "media",
        vencimento: formatDate(venc),
        responsavel: t.responsavelPadrao || aplicadaPor,
        tipo: t.tipo,
        automacaoId: auto.id,
        automacaoNome: auto.nome,
      };
    });
    setTarefas(prev => [...prev, ...novas]);
    setAplicadas(prev => [...prev, {
      id: `aa_${Date.now()}`,
      oportunidadeId,
      automacaoId: auto.id,
      automacaoNome: auto.nome,
      dataAplicacao: formatDateTime(new Date()),
      aplicadaPor,
    }]);
  }, [automacoes]);

  const concluirTarefa = useCallback((id: string) => {
    setTarefas(prev => prev.map(t => t.id === id ? { ...t, status: "concluida" } : t));
  }, []);

  const editarTarefa = useCallback((id: string, patch: Partial<TarefaCRMExt>) => {
    setTarefas(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t));
  }, []);

  const value = useMemo(() => ({
    automacoes, aplicadas, tarefas,
    saveAutomacao, deleteAutomacao, duplicateAutomacao,
    getAutomacoesParaEtapa, getPosVenda,
    cancelarTarefasPendentes, aplicarAutomacao,
    concluirTarefa, editarTarefa,
  }), [automacoes, aplicadas, tarefas, saveAutomacao, deleteAutomacao, duplicateAutomacao, getAutomacoesParaEtapa, getPosVenda, cancelarTarefasPendentes, aplicarAutomacao, concluirTarefa, editarTarefa]);

  return <AutomacoesContext.Provider value={value}>{children}</AutomacoesContext.Provider>;
}

export function useAutomacoes() {
  const ctx = useContext(AutomacoesContext);
  if (!ctx) throw new Error("useAutomacoes must be used within AutomacoesProvider");
  return ctx;
}
