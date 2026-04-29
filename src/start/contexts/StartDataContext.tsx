import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import {
  PRODUTOS_INICIAIS, COMPRADORES_INICIAIS, PEDIDOS_INICIAIS,
  StartProduto, StartComprador, StartPedido, StartPedidoStatus,
} from "../data/mockStart";

interface StartDataCtx {
  produtos: StartProduto[];
  compradores: StartComprador[];
  pedidos: StartPedido[];
  saveProduto: (p: StartProduto) => void;
  deleteProduto: (id: string) => void;
  saveComprador: (c: StartComprador) => void;
  changePedidoStatus: (id: string, status: StartPedidoStatus) => void;
  updatePedido: (id: string, patch: Partial<StartPedido>) => void;
  addPedido: (p: Omit<StartPedido, "id" | "historico">) => StartPedido;
}

const Ctx = createContext<StartDataCtx>({} as StartDataCtx);

const KEY_PROD = "nextil_start_produtos";
const KEY_COMP = "nextil_start_compradores";
const KEY_PED = "nextil_start_pedidos";

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function StartDataProvider({ children }: { children: ReactNode }) {
  // hidrata fotoUrl a partir do mock atual (assets podem mudar entre builds)
  const hydrateProdutos = (list: StartProduto[]): StartProduto[] => {
    const fotoMap = new Map(PRODUTOS_INICIAIS.map(p => [p.id, p.fotoUrl]));
    return list.map(p => ({ ...p, fotoUrl: p.fotoUrl || fotoMap.get(p.id) }));
  };
  const [produtos, setProdutos] = useState<StartProduto[]>(() => hydrateProdutos(load(KEY_PROD, PRODUTOS_INICIAIS)));
  const [compradores, setCompradores] = useState<StartComprador[]>(() => load(KEY_COMP, COMPRADORES_INICIAIS));
  const [pedidos, setPedidos] = useState<StartPedido[]>(() => load(KEY_PED, PEDIDOS_INICIAIS));

  useEffect(() => { localStorage.setItem(KEY_PROD, JSON.stringify(produtos)); }, [produtos]);
  useEffect(() => { localStorage.setItem(KEY_COMP, JSON.stringify(compradores)); }, [compradores]);
  useEffect(() => { localStorage.setItem(KEY_PED, JSON.stringify(pedidos)); }, [pedidos]);

  const saveProduto = (p: StartProduto) => {
    setProdutos(prev => {
      const idx = prev.findIndex(x => x.id === p.id);
      if (idx === -1) return [...prev, p];
      const next = [...prev];
      next[idx] = p;
      return next;
    });
  };

  const deleteProduto = (id: string) => setProdutos(prev => prev.filter(p => p.id !== id));

  const saveComprador = (c: StartComprador) => {
    setCompradores(prev => {
      const idx = prev.findIndex(x => x.id === c.id);
      if (idx === -1) return [...prev, c];
      const next = [...prev];
      next[idx] = c;
      return next;
    });
  };

  const changePedidoStatus = (id: string, status: StartPedidoStatus) => {
    setPedidos(prev => prev.map(p => {
      if (p.id !== id) return p;
      const historico = [...(p.historico || []), { status, data: new Date().toISOString() }];
      return { ...p, status, historico };
    }));
  };

  const updatePedido = (id: string, patch: Partial<StartPedido>) => {
    setPedidos(prev => prev.map(p => p.id === id ? { ...p, ...patch } : p));
  };

  const addPedido = (data: Omit<StartPedido, "id" | "historico">) => {
    const nextNum = pedidos.length + 1;
    const id = `P${String(nextNum).padStart(3, "0")}`;
    const novo: StartPedido = {
      ...data,
      id,
      historico: [{ status: data.status, data: data.data }],
    };
    setPedidos(prev => [novo, ...prev]);
    return novo;
  };

  return (
    <Ctx.Provider value={{ produtos, compradores, pedidos, saveProduto, deleteProduto, saveComprador, changePedidoStatus, updatePedido, addPedido }}>
      {children}
    </Ctx.Provider>
  );
}

export const useStartData = () => useContext(Ctx);
