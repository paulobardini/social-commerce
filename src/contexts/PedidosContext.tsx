import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { toast } from "sonner";
import {
  mockPedidos,
  type Pedido,
  type PedidoStatus,
  type PedidoItem,
  type PagamentoStatus,
} from "@/data/mockCRM360";

const KEY = "nextil_vendedor_pedidos_v1";

const STATUS_FLOW: PedidoStatus[] = ["confirmado", "em_producao", "faturado", "em_transporte", "entregue"];

interface Ctx {
  pedidos: Pedido[];
  getById: (id: string) => Pedido | undefined;
  updateStatus: (id: string, status: PedidoStatus) => void;
  avancarStatus: (id: string) => void;
  cancelar: (id: string) => void;
  updateItens: (id: string, itens: PedidoItem[]) => void;
  updatePagamento: (id: string, patch: Partial<NonNullable<Pedido["pagamento"]>>) => void;
  gerarBoleto: (id: string) => void;
  gerarLinkPagamento: (id: string) => void;
  anexarNF: (id: string, numero: string) => void;
}

const PedidosCtx = createContext<Ctx>({} as Ctx);

function load(): Pedido[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return mockPedidos;
    const parsed = JSON.parse(raw) as Pedido[];
    // hidrata com novos campos do mock se id existir
    return parsed.map((p) => ({ ...mockPedidos.find((m) => m.id === p.id), ...p }));
  } catch {
    return mockPedidos;
  }
}

export function PedidosProvider({ children }: { children: ReactNode }) {
  const [pedidos, setPedidos] = useState<Pedido[]>(() => load());

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(pedidos));
  }, [pedidos]);

  const update = (id: string, patch: Partial<Pedido>) =>
    setPedidos((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  const value: Ctx = useMemo(
    () => ({
      pedidos,
      getById: (id) => pedidos.find((p) => p.id === id),
      updateStatus: (id, status) => {
        const today = new Date().toLocaleDateString("pt-BR");
        setPedidos((prev) =>
          prev.map((p) => {
            if (p.id !== id) return p;
            const historico = [...(p.historico ?? []), { status, data: today, autor: "Paulo Bardini" }];
            return { ...p, status, historico };
          })
        );
        toast.success(`Status alterado para "${status.replace("_", " ")}"`);
      },
      avancarStatus: (id) => {
        const ped = pedidos.find((p) => p.id === id);
        if (!ped) return;
        const idx = STATUS_FLOW.indexOf(ped.status as PedidoStatus);
        if (idx < 0 || idx >= STATUS_FLOW.length - 1) {
          toast.info("Pedido já está no status final");
          return;
        }
        value.updateStatus(id, STATUS_FLOW[idx + 1]);
      },
      cancelar: (id) => {
        value.updateStatus(id, "cancelado");
      },
      updateItens: (id, itens) => {
        const valor = itens.reduce((s, i) => s + i.qtd * i.precoUnit, 0);
        const pecas = itens.reduce((s, i) => s + i.qtd, 0);
        update(id, { itens, valor, pecas });
        toast.success("Grade atualizada");
      },
      updatePagamento: (id, patch) => {
        setPedidos((prev) =>
          prev.map((p) => (p.id === id ? { ...p, pagamento: { status: "pendente" as PagamentoStatus, ...(p.pagamento ?? {}), ...patch } } : p))
        );
      },
      gerarBoleto: (id) => {
        const link = `https://pag.nextil.com.br/boleto/${id}`;
        value.updatePagamento(id, { linkBoleto: link, metodo: "Boleto" });
        toast.success("Boleto gerado", { description: link });
      },
      gerarLinkPagamento: (id) => {
        const link = `https://pag.nextil.com.br/checkout/${id}`;
        value.updatePagamento(id, { linkPagamento: link });
        navigator.clipboard?.writeText(link).catch(() => {});
        toast.success("Link de pagamento copiado", { description: link });
      },
      anexarNF: (id, numero) => {
        value.updatePagamento(id, { notaFiscal: numero });
        toast.success(`NF ${numero} anexada`);
      },
    }),
    [pedidos]
  );

  return <PedidosCtx.Provider value={value}>{children}</PedidosCtx.Provider>;
}

export const usePedidos = () => useContext(PedidosCtx);
