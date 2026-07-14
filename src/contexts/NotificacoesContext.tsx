import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";

export type TipoNotif =
  | "lead_distribuido"
  | "sla_estourado"
  | "estagnacao"
  | "conflito_resolvido"
  | "card_reaberto"
  | "conflito_novo";

export interface Notificacao {
  id: string;
  tipo: TipoNotif;
  titulo: string;
  msg: string;
  cardId?: string;
  conversaId?: string;
  vendedorId?: string;
  at: string;
  lida: boolean;
}

interface Ctx {
  notificacoes: Notificacao[];
  naoLidas: number;
  push: (n: Omit<Notificacao, "id" | "at" | "lida">) => void;
  marcarLida: (id: string) => void;
  marcarTodasLidas: () => void;
  limpar: () => void;
}

const NotificacoesContext = createContext<Ctx | null>(null);
const LS = "nextil_notificacoes_v1";

export function NotificacoesProvider({ children }: { children: ReactNode }) {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>(() => {
    try { const raw = localStorage.getItem(LS); if (raw) return JSON.parse(raw); } catch {}
    return [];
  });
  useEffect(() => { try { localStorage.setItem(LS, JSON.stringify(notificacoes.slice(0, 60))); } catch {} }, [notificacoes]);

  const push: Ctx["push"] = useCallback((n) => {
    setNotificacoes(prev => {
      // dedup por (tipo + cardId) recente (10min) para não spammar SLA/estagnação
      const dedupKey = `${n.tipo}|${n.cardId ?? ""}`;
      const agora = Date.now();
      const recente = prev.find(x => `${x.tipo}|${x.cardId ?? ""}` === dedupKey && agora - new Date(x.at).getTime() < 10 * 60 * 1000);
      if (recente) return prev;
      return [{ ...n, id: `notif_${agora}_${Math.random().toString(36).slice(2, 6)}`, at: new Date().toISOString(), lida: false }, ...prev].slice(0, 60);
    });
  }, []);

  const marcarLida: Ctx["marcarLida"] = (id) => setNotificacoes(prev => prev.map(n => n.id === id ? { ...n, lida: true } : n));
  const marcarTodasLidas: Ctx["marcarTodasLidas"] = () => setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })));
  const limpar: Ctx["limpar"] = () => setNotificacoes([]);

  const naoLidas = notificacoes.filter(n => !n.lida).length;

  return (
    <NotificacoesContext.Provider value={{ notificacoes, naoLidas, push, marcarLida, marcarTodasLidas, limpar }}>
      {children}
    </NotificacoesContext.Provider>
  );
}

export function useNotificacoes() {
  const ctx = useContext(NotificacoesContext);
  if (!ctx) throw new Error("useNotificacoes fora do provider");
  return ctx;
}

export const tipoNotifLabel: Record<TipoNotif, string> = {
  lead_distribuido: "Novo lead",
  sla_estourado: "SLA estourado",
  estagnacao: "Card estagnado",
  conflito_resolvido: "Conflito resolvido",
  card_reaberto: "Card reaberto",
  conflito_novo: "Conflito de lead",
};

export const tipoNotifCor: Record<TipoNotif, string> = {
  lead_distribuido: "text-sky-600",
  sla_estourado: "text-rose-600",
  estagnacao: "text-amber-600",
  conflito_resolvido: "text-emerald-600",
  card_reaberto: "text-indigo-600",
  conflito_novo: "text-amber-700",
};

export function tempoRelativo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "agora";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}
