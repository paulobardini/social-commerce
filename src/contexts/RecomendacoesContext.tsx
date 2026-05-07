import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type RecomendacaoStatus = "pendente" | "aceita" | "ignorada";

export interface RecomendacaoEstado {
  status: RecomendacaoStatus;
  responsavel?: string;
  atualizadoEm?: string;
}

interface Ctx {
  estados: Record<string, RecomendacaoEstado>;
  getStatus: (id: string) => RecomendacaoStatus;
  aceitar: (id: string) => void;
  ignorar: (id: string) => void;
  reabrir: (id: string) => void;
  atribuir: (id: string, responsavel: string) => void;
}

const STORAGE_KEY = "im:recomendacoes:v1";
const RecomendacoesContext = createContext<Ctx | undefined>(undefined);

export function RecomendacoesProvider({ children }: { children: ReactNode }) {
  const [estados, setEstados] = useState<Record<string, RecomendacaoEstado>>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(estados));
  }, [estados]);

  const update = (id: string, partial: Partial<RecomendacaoEstado>) =>
    setEstados((prev) => ({
      ...prev,
      [id]: { status: "pendente", ...prev[id], ...partial, atualizadoEm: new Date().toISOString() },
    }));

  const value: Ctx = {
    estados,
    getStatus: (id) => estados[id]?.status ?? "pendente",
    aceitar: (id) => update(id, { status: "aceita" }),
    ignorar: (id) => update(id, { status: "ignorada" }),
    reabrir: (id) => update(id, { status: "pendente" }),
    atribuir: (id, responsavel) => update(id, { responsavel }),
  };

  return <RecomendacoesContext.Provider value={value}>{children}</RecomendacoesContext.Provider>;
}

export function useRecomendacoes() {
  const ctx = useContext(RecomendacoesContext);
  if (!ctx) throw new Error("useRecomendacoes must be used within RecomendacoesProvider");
  return ctx;
}
