import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { toast } from "sonner";

interface NotifCtx {
  filaNaoVisualizada: Set<string>;
  marcarVisualizado: (leadId: string) => void;
  notificarNovoQuente: (leadId: string, nome: string, onAbrir: () => void) => void;
  abrirLeadAcao: ((leadId: string) => void) | null;
  setAbrirLeadAcao: (fn: ((leadId: string) => void) | null) => void;
}

const Ctx = createContext<NotifCtx | null>(null);
const KEY = "nextil_mkt_state_v1_fila_visualizada";

export function MarketingNotificationsProvider({ children, leadsQuentes }: { children: ReactNode; leadsQuentes: { id: string; clienteNome: string }[] }) {
  const [visualizados, setVisualizados] = useState<Set<string>>(() => {
    try { const raw = localStorage.getItem(KEY); if (raw) return new Set(JSON.parse(raw)); } catch { /* */ }
    return new Set();
  });
  const [abrirLeadAcao, setAbrirLeadAcao] = useState<((leadId: string) => void) | null>(null);

  useEffect(() => { localStorage.setItem(KEY, JSON.stringify([...visualizados])); }, [visualizados]);

  const filaNaoVisualizada = new Set(leadsQuentes.filter(l => !visualizados.has(l.id)).map(l => l.id));

  const marcarVisualizado = useCallback((leadId: string) => {
    setVisualizados(prev => { const n = new Set(prev); n.add(leadId); return n; });
  }, []);

  const notificarNovoQuente = useCallback((leadId: string, nome: string, onAbrir: () => void) => {
    toast(`🔥 ${nome} acabou de atingir score quente`, {
      description: "Lead pronto para abordagem comercial",
      action: { label: "Ver lead →", onClick: onAbrir },
      duration: 8000,
    });
  }, []);

  // Simula leads que "acabaram" de ficar quentes ao montar (5s, 15s, 30s)
  useEffect(() => {
    if (leadsQuentes.length === 0) return;
    const naoVistos = leadsQuentes.filter(l => !visualizados.has(l.id));
    const amostras = naoVistos.slice(0, 3);
    const timers: ReturnType<typeof setTimeout>[] = [];
    amostras.forEach((lead, idx) => {
      const delay = [5000, 15000, 30000][idx];
      timers.push(setTimeout(() => {
        notificarNovoQuente(lead.id, lead.clienteNome, () => {
          if (abrirLeadAcao) abrirLeadAcao(lead.id);
        });
      }, delay));
    });
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Ctx.Provider value={{ filaNaoVisualizada, marcarVisualizado, notificarNovoQuente, abrirLeadAcao, setAbrirLeadAcao }}>
      {children}
    </Ctx.Provider>
  );
}

export function useNotifications() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useNotifications must be inside MarketingNotificationsProvider");
  return c;
}
