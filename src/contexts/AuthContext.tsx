import { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = "lojista" | "fabrica" | "criador";

export interface ConnectedBrand {
  slug: string;
  name: string;
  logo: string;
}

export interface UserProfile {
  name: string;
  phone: string;
  email: string;
  role?: UserRole;
  connectedBrands?: ConnectedBrand[];
  // Onboarding data
  segmento?: string;
  porte?: string;
  interesses?: string[];
  regiao?: string;
  marcasConhecidas?: string[];
  faixaInvestimento?: string;
  // PJ data (filled later)
  pjCompleted?: boolean;
  cpfCnpj?: string;
  nomeFantasia?: string;
  razaoSocial?: string;
  tipoCliente?: string;
  endereco?: {
    cep: string;
    uf: string;
    cidade: string;
    bairro: string;
    rua: string;
    numero: string;
  };
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserProfile | null;
  login: (email: string, password: string) => void;
  signup: (data: { name: string; phone: string; email: string; password: string }) => void;
  logout: () => void;
  completeOnboarding: (data: { segmento: string; porte: string; interesses: string[]; regiao?: string; marcasConhecidas?: string[]; faixaInvestimento?: string }) => void;
  completePJ: (data: Partial<UserProfile>) => void;
  onboardingCompleted: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const DEFAULT_CONNECTED_BRANDS: ConnectedBrand[] = [
  { slug: "brandili", name: "Brandili", logo: "" },
  { slug: "kyly", name: "Kyly", logo: "" },
  { slug: "hering", name: "Hering", logo: "" },
  { slug: "malwee", name: "Malwee", logo: "" },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem("nextil_user");
    if (!saved) return null;
    const parsed = JSON.parse(saved) as UserProfile;
    // Ensure criadores always have connectedBrands
    if (parsed.role === "criador" && (!parsed.connectedBrands || parsed.connectedBrands.length === 0)) {
      parsed.connectedBrands = DEFAULT_CONNECTED_BRANDS;
    }
    return parsed;
  });
  const [onboardingCompleted, setOnboardingCompleted] = useState(() => {
    return localStorage.getItem("nextil_onboarding") === "true";
  });

  const persist = (u: UserProfile | null) => {
    if (u) localStorage.setItem("nextil_user", JSON.stringify(u));
    else localStorage.removeItem("nextil_user");
    setUser(u);
  };

  const login = (email: string, _password: string) => {
    const mockUser: UserProfile = { name: "Usuário", phone: "(00) 0 0000-0000", email };
    persist(mockUser);
    setOnboardingCompleted(true);
    localStorage.setItem("nextil_onboarding", "true");
  };

  const signup = (data: { name: string; phone: string; email: string; password: string }) => {
    const newUser: UserProfile = { name: data.name, phone: data.phone, email: data.email };
    persist(newUser);
  };

  const logout = () => {
    persist(null);
    setOnboardingCompleted(false);
    localStorage.removeItem("nextil_onboarding");
  };

  const completeOnboarding = (data: { segmento: string; porte: string; interesses: string[]; regiao?: string; marcasConhecidas?: string[]; faixaInvestimento?: string }) => {
    if (user) {
      // Derive role from segmento
      let role: UserRole = "lojista";
      if (data.segmento === "influencer") role = "criador";

      // Mock connected brands for criadores
      const connectedBrands: ConnectedBrand[] = role === "criador" ? DEFAULT_CONNECTED_BRANDS : [];

      const updated = { ...user, ...data, role, connectedBrands };
      persist(updated);
    }
    setOnboardingCompleted(true);
    localStorage.setItem("nextil_onboarding", "true");
  };

  const completePJ = (data: Partial<UserProfile>) => {
    if (user) {
      const updated = { ...user, ...data, pjCompleted: true };
      persist(updated);
    }
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated: !!user,
      user,
      login,
      signup,
      logout,
      completeOnboarding,
      completePJ,
      onboardingCompleted,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
