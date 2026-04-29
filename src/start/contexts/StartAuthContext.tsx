import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { FORNECEDOR_INICIAL, StartFornecedor } from "../data/mockStart";

interface StartAuthCtx {
  isAuth: boolean;
  fornecedor: StartFornecedor;
  onboardingDone: boolean;
  login: () => void;
  logout: () => void;
  signup: (data: { nome: string; nomeFabrica: string; email: string; whatsapp: string }) => void;
  completeOnboarding: () => void;
  updateFornecedor: (patch: Partial<StartFornecedor>) => void;
}

const Ctx = createContext<StartAuthCtx>({} as StartAuthCtx);

const KEY_AUTH = "nextil_start_auth";
const KEY_ONB = "nextil_start_onboarding";
const KEY_FORN = "nextil_start_fornecedor";

export function StartAuthProvider({ children }: { children: ReactNode }) {
  const [isAuth, setIsAuth] = useState(() => localStorage.getItem(KEY_AUTH) === "1");
  const [onboardingDone, setOnbDone] = useState(() => localStorage.getItem(KEY_ONB) === "1");
  const [fornecedor, setFornecedor] = useState<StartFornecedor>(() => {
    const saved = localStorage.getItem(KEY_FORN);
    return saved ? JSON.parse(saved) : FORNECEDOR_INICIAL;
  });

  useEffect(() => {
    localStorage.setItem(KEY_FORN, JSON.stringify(fornecedor));
  }, [fornecedor]);

  const login = () => {
    setIsAuth(true);
    localStorage.setItem(KEY_AUTH, "1");
    setOnbDone(true);
    localStorage.setItem(KEY_ONB, "1");
  };

  const signup = (data: { nome: string; nomeFabrica: string; email: string; whatsapp: string }) => {
    setIsAuth(true);
    localStorage.setItem(KEY_AUTH, "1");
    setOnbDone(false);
    localStorage.removeItem(KEY_ONB);
    setFornecedor(prev => ({
      ...prev,
      nome: data.nomeFabrica || prev.nome,
      whatsapp: data.whatsapp || prev.whatsapp,
      iniciais: (data.nomeFabrica || prev.nome).split(" ").map(s => s[0]).slice(0, 2).join("").toUpperCase(),
    }));
  };

  const logout = () => {
    setIsAuth(false);
    localStorage.removeItem(KEY_AUTH);
  };

  const completeOnboarding = () => {
    setOnbDone(true);
    localStorage.setItem(KEY_ONB, "1");
  };

  const updateFornecedor = (patch: Partial<StartFornecedor>) => {
    setFornecedor(prev => ({ ...prev, ...patch }));
  };

  return (
    <Ctx.Provider value={{ isAuth, fornecedor, onboardingDone, login, logout, signup, completeOnboarding, updateFornecedor }}>
      {children}
    </Ctx.Provider>
  );
}

export const useStartAuth = () => useContext(Ctx);
