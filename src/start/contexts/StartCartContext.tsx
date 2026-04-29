import { createContext, useContext, useState, ReactNode, useMemo, useEffect } from "react";

export interface VitrineCartItem {
  produtoId: string;
  produtoNome: string;
  precoUnit: number;
  fotoCor?: string;
  // quantidades por tamanho (pode haver mais de uma variação no mesmo produto)
  porTamanho: Record<string, number>;
}

interface StartCartCtx {
  slug: string | null;
  itens: VitrineCartItem[];
  setSlug: (s: string) => void;
  addItem: (item: Omit<VitrineCartItem, "porTamanho"> & { porTamanho: Record<string, number> }) => void;
  updateItem: (produtoId: string, porTamanho: Record<string, number>) => void;
  removeItem: (produtoId: string) => void;
  clear: () => void;
  totalPecas: number;
  totalValor: number;
}

const Ctx = createContext<StartCartCtx>({} as StartCartCtx);

const KEY = "nextil_start_cart";

export function StartCartProvider({ children }: { children: ReactNode }) {
  const [slug, setSlug] = useState<string | null>(null);
  const [itens, setItens] = useState<VitrineCartItem[]>(() => {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw).itens || [] : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify({ itens }));
  }, [itens]);

  const addItem: StartCartCtx["addItem"] = (item) => {
    setItens(prev => {
      const idx = prev.findIndex(x => x.produtoId === item.produtoId);
      const totalQt = Object.values(item.porTamanho).reduce((a, b) => a + b, 0);
      if (totalQt === 0) {
        // se zero, remover
        if (idx === -1) return prev;
        return prev.filter(x => x.produtoId !== item.produtoId);
      }
      if (idx === -1) return [...prev, item];
      const next = [...prev];
      // soma quantidades
      const merged: Record<string, number> = { ...next[idx].porTamanho };
      for (const [t, q] of Object.entries(item.porTamanho)) {
        merged[t] = (merged[t] || 0) + q;
      }
      next[idx] = { ...next[idx], porTamanho: merged };
      return next;
    });
  };

  const updateItem = (produtoId: string, porTamanho: Record<string, number>) => {
    setItens(prev => {
      const totalQt = Object.values(porTamanho).reduce((a, b) => a + b, 0);
      if (totalQt === 0) return prev.filter(x => x.produtoId !== produtoId);
      return prev.map(x => x.produtoId === produtoId ? { ...x, porTamanho } : x);
    });
  };

  const removeItem = (produtoId: string) => setItens(prev => prev.filter(x => x.produtoId !== produtoId));
  const clear = () => setItens([]);

  const totalPecas = useMemo(
    () => itens.reduce((sum, it) => sum + Object.values(it.porTamanho).reduce((a, b) => a + b, 0), 0),
    [itens]
  );
  const totalValor = useMemo(
    () => itens.reduce((sum, it) => {
      const q = Object.values(it.porTamanho).reduce((a, b) => a + b, 0);
      return sum + q * it.precoUnit;
    }, 0),
    [itens]
  );

  return (
    <Ctx.Provider value={{ slug, itens, setSlug, addItem, updateItem, removeItem, clear, totalPecas, totalValor }}>
      {children}
    </Ctx.Provider>
  );
}

export const useStartCart = () => useContext(Ctx);
