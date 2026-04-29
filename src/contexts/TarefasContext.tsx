// MOCK: Centraliza tarefas e compromissos com recorrência e sincronização bidirecional
import { createContext, useContext, useState, useCallback, ReactNode, useMemo } from "react";
import {
  mockTarefas360,
  mockCompromissos,
  type TarefaCRM360,
  type Compromisso,
} from "@/data/mockCRM360";

export type Recorrencia = "nenhuma" | "diaria" | "semanal" | "mensal" | "personalizada";

export interface TarefaExt extends TarefaCRM360 {
  recorrencia?: Recorrencia;
  recorrenciaIntervaloDias?: number; // usado quando "personalizada"
  compromissoId?: string; // vínculo bidirecional com a Agenda
  recorrenciaPaiId?: string; // referência à tarefa original (quando regenerada)
}

export interface CompromissoExt extends Compromisso {
  origem?: "manual" | "tarefa";
  tarefaId?: string;
  lembrete?: number; // minutos antes (0 = sem lembrete)
}

interface TarefasContextType {
  tarefas: TarefaExt[];
  compromissos: CompromissoExt[];
  addTarefa: (t: Omit<TarefaExt, "id">) => TarefaExt;
  updateTarefa: (id: string, patch: Partial<TarefaExt>) => void;
  toggleConcluida: (id: string) => void;
  updateCompromisso: (id: string, patch: Partial<CompromissoExt>) => void;
}

const TarefasContext = createContext<TarefasContextType | undefined>(undefined);

// ---- date helpers (formato "DD/MM/YYYY") ----
function parseBR(d: string): Date | null {
  const m = d?.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
}
function formatBR(d: Date): string {
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}
function nextDate(base: string, rec: Recorrencia, custom?: number): string | null {
  const d = parseBR(base);
  if (!d) return null;
  switch (rec) {
    case "diaria": d.setDate(d.getDate() + 1); break;
    case "semanal": d.setDate(d.getDate() + 7); break;
    case "mensal": d.setMonth(d.getMonth() + 1); break;
    case "personalizada": d.setDate(d.getDate() + (custom || 1)); break;
    default: return null;
  }
  return formatBR(d);
}

// Hidrata mocks iniciais convertendo tarefas com hora em compromissos sincronizados
function hydrateInitial(): { tarefas: TarefaExt[]; compromissos: CompromissoExt[] } {
  const tarefas: TarefaExt[] = mockTarefas360.map(t => ({ ...t, recorrencia: "nenhuma" }));
  const compromissos: CompromissoExt[] = mockCompromissos.map(c => ({ ...c, origem: "manual" }));

  // Sincroniza tarefas com horário -> Agenda
  tarefas.forEach(t => {
    if (t.hora && t.vencimento && t.status !== "concluida" && t.status !== "cancelada") {
      const jaExiste = compromissos.find(
        c => c.origem === "tarefa" && c.tarefaId === t.id,
      );
      if (!jaExiste) {
        const compId = `agt-${t.id}`;
        compromissos.push({
          id: compId,
          titulo: t.titulo,
          clienteId: t.clienteId,
          clienteNome: t.clienteNome,
          oportunidadeId: t.oportunidadeId,
          tipo: "follow_up",
          data: t.vencimento,
          hora: t.hora,
          duracao: "30min",
          responsavel: t.responsavel,
          descricao: t.descricao,
          status: "agendado",
          origem: "tarefa",
          tarefaId: t.id,
        });
        t.compromissoId = compId;
      }
    }
  });

  return { tarefas, compromissos };
}

export function TarefasProvider({ children }: { children: ReactNode }) {
  const initial = useMemo(() => hydrateInitial(), []);
  const [tarefas, setTarefas] = useState<TarefaExt[]>(initial.tarefas);
  const [compromissos, setCompromissos] = useState<CompromissoExt[]>(initial.compromissos);

  const syncCompromissoFromTarefa = useCallback((t: TarefaExt) => {
    setCompromissos(prev => {
      const existing = prev.find(c => c.tarefaId === t.id);
      // Se não tem hora ou foi concluída/cancelada -> remove compromisso atrelado
      if (!t.hora || !t.vencimento || t.status === "concluida" || t.status === "cancelada") {
        return existing ? prev.filter(c => c.id !== existing.id) : prev;
      }
      if (existing) {
        return prev.map(c => c.id === existing.id ? {
          ...c, titulo: t.titulo, data: t.vencimento, hora: t.hora,
          clienteId: t.clienteId, clienteNome: t.clienteNome,
          oportunidadeId: t.oportunidadeId, descricao: t.descricao,
        } : c);
      }
      const compId = `agt-${t.id}-${Date.now()}`;
      return [...prev, {
        id: compId, titulo: t.titulo, clienteId: t.clienteId, clienteNome: t.clienteNome,
        oportunidadeId: t.oportunidadeId, tipo: "follow_up", data: t.vencimento, hora: t.hora,
        duracao: "30min", responsavel: t.responsavel, descricao: t.descricao,
        status: "agendado", origem: "tarefa", tarefaId: t.id,
      }];
    });
  }, []);

  const addTarefa = useCallback((t: Omit<TarefaExt, "id">) => {
    const nova: TarefaExt = { ...t, id: `t-${Date.now()}` };
    setTarefas(prev => [...prev, nova]);
    syncCompromissoFromTarefa(nova);
    return nova;
  }, [syncCompromissoFromTarefa]);

  const updateTarefa = useCallback((id: string, patch: Partial<TarefaExt>) => {
    setTarefas(prev => {
      const updated = prev.map(t => t.id === id ? { ...t, ...patch } : t);
      const target = updated.find(t => t.id === id);
      if (target) syncCompromissoFromTarefa(target);
      return updated;
    });
  }, [syncCompromissoFromTarefa]);

  const toggleConcluida = useCallback((id: string) => {
    setTarefas(prev => {
      const target = prev.find(t => t.id === id);
      if (!target) return prev;
      const novoStatus = target.status === "concluida" ? "pendente" : "concluida";
      const updated = prev.map(t => t.id === id ? { ...t, status: novoStatus as TarefaCRM360["status"] } : t);

      // Se concluída e recorrente -> gera próxima ocorrência
      if (novoStatus === "concluida" && target.recorrencia && target.recorrencia !== "nenhuma") {
        const proximaData = nextDate(target.vencimento, target.recorrencia, target.recorrenciaIntervaloDias);
        if (proximaData) {
          const nova: TarefaExt = {
            ...target,
            id: `t-${Date.now()}`,
            vencimento: proximaData,
            status: "pendente",
            compromissoId: undefined,
            recorrenciaPaiId: target.recorrenciaPaiId || target.id,
          };
          updated.push(nova);
          // sync da nova ocorrência
          setTimeout(() => syncCompromissoFromTarefa(nova), 0);
        }
      }

      // Sincroniza compromisso da tarefa atual (status concluida -> remove da agenda)
      const cur = updated.find(t => t.id === id)!;
      syncCompromissoFromTarefa(cur);
      return updated;
    });
  }, [syncCompromissoFromTarefa]);

  // Atualização vinda da Agenda (ex: marcar compromisso concluído reflete na tarefa)
  const updateCompromisso = useCallback((id: string, patch: Partial<CompromissoExt>) => {
    setCompromissos(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c));
    if (patch.status) {
      const comp = compromissos.find(c => c.id === id);
      if (comp?.tarefaId) {
        const novoStatus = patch.status === "concluido" ? "concluida" : "pendente";
        setTarefas(prev => prev.map(t => t.id === comp.tarefaId ? { ...t, status: novoStatus as TarefaCRM360["status"] } : t));
      }
    }
  }, [compromissos]);

  return (
    <TarefasContext.Provider value={{ tarefas, compromissos, addTarefa, updateTarefa, toggleConcluida, updateCompromisso }}>
      {children}
    </TarefasContext.Provider>
  );
}

export function useTarefas() {
  const ctx = useContext(TarefasContext);
  if (!ctx) throw new Error("useTarefas must be used within TarefasProvider");
  return ctx;
}
