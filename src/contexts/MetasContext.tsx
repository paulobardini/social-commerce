import { createContext, useContext, useEffect, useState, ReactNode } from "react";

// Mock: meta de vendas mensal persistida em localStorage
interface MetasContextType {
  metaMensal: number;
  realizadoMes: number; // mock: virá do backend futuramente
  setMetaMensal: (v: number) => void;
}

const STORAGE_KEY = "nextil:meta-mensal";
const DEFAULT_META = 80000;
const DEFAULT_REALIZADO = 45000; // mock

const MetasContext = createContext<MetasContextType | undefined>(undefined);

export function MetasProvider({ children }: { children: ReactNode }) {
  const [metaMensal, setMetaMensalState] = useState<number>(DEFAULT_META);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setMetaMensalState(Number(saved) || DEFAULT_META);
    } catch {}
  }, []);

  const setMetaMensal = (v: number) => {
    setMetaMensalState(v);
    try { localStorage.setItem(STORAGE_KEY, String(v)); } catch {}
  };

  return (
    <MetasContext.Provider value={{ metaMensal, realizadoMes: DEFAULT_REALIZADO, setMetaMensal }}>
      {children}
    </MetasContext.Provider>
  );
}

export function useMetas() {
  const ctx = useContext(MetasContext);
  if (!ctx) throw new Error("useMetas must be used within MetasProvider");
  return ctx;
}
