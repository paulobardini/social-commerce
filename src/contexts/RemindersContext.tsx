// MOCK: Dispara lembretes in-app (toast) X minutos antes de cada compromisso
import { createContext, useContext, useEffect, useRef, ReactNode } from "react";
import { toast } from "sonner";
import { useTarefas } from "./TarefasContext";
import { tipoCompromissoLabels } from "@/data/mockCRM360";

const RemindersContext = createContext<{ enabled: boolean }>({ enabled: true });

// Converte "DD/MM/YYYY" + "HH:MM" em Date
function toDate(data: string, hora: string): Date | null {
  const dm = data?.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  const hm = hora?.match(/^(\d{2}):(\d{2})$/);
  if (!dm || !hm) return null;
  return new Date(+dm[3], +dm[2] - 1, +dm[1], +hm[1], +hm[2]);
}

export function RemindersProvider({ children }: { children: ReactNode }) {
  const { compromissos } = useTarefas();
  const fired = useRef<Set<string>>(new Set());

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      compromissos.forEach(c => {
        if (c.status !== "agendado") return;
        const lembrete = (c as any).lembrete as number | undefined; // minutos antes
        if (!lembrete || lembrete <= 0) return;
        const start = toDate(c.data, c.hora);
        if (!start) return;
        const triggerAt = start.getTime() - lembrete * 60 * 1000;
        const key = `${c.id}-${lembrete}`;
        // Janela de 60s para considerar o evento "iminente"
        if (now >= triggerAt && now <= triggerAt + 60_000 && !fired.current.has(key)) {
          fired.current.add(key);
          const tipoLabel = tipoCompromissoLabels[c.tipo as keyof typeof tipoCompromissoLabels] || "Compromisso";
          toast(`${tipoLabel} em ${lembrete} min`, {
            description: `${c.clienteNome ? c.clienteNome + " · " : ""}${c.titulo} às ${c.hora}`,
            action: c.clienteId
              ? {
                  label: "Abrir",
                  onClick: () => { window.location.href = `/vendedor/360/${c.clienteId}`; },
                }
              : undefined,
            duration: 10_000,
          });
        }
      });
    }, 30_000); // checa a cada 30s
    return () => clearInterval(interval);
  }, [compromissos]);

  return <RemindersContext.Provider value={{ enabled: true }}>{children}</RemindersContext.Provider>;
}

export function useReminders() { return useContext(RemindersContext); }
