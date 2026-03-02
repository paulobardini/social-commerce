import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { Product, Brand } from "@/data/mockProducts";

export interface CartItem {
  product: Product;
  brandSlug: string;
  brandName: string;
  quantities: Record<string, number>;
  selectedColors: string[];
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateItem: (productId: string, updates: Partial<Pick<CartItem, "quantities" | "selectedColors">>) => void;
  clearCart: () => void;
  totalPieces: number;
  totalPrice: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

function calcPieces(item: CartItem): number {
  return Object.values(item.quantities).reduce((a, b) => a + b, 0) * item.selectedColors.length;
}

function calcPrice(item: CartItem): number {
  return calcPieces(item) * item.product.price;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.product.id === item.product.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = item;
        return next;
      }
      return [...prev, item];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  }, []);

  const updateItem = useCallback((productId: string, updates: Partial<Pick<CartItem, "quantities" | "selectedColors">>) => {
    setItems((prev) =>
      prev.map((i) => (i.product.id === productId ? { ...i, ...updates } : i))
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalPieces = items.reduce((a, i) => a + calcPieces(i), 0);
  const totalPrice = items.reduce((a, i) => a + calcPrice(i), 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateItem, clearCart, totalPieces, totalPrice, isOpen, setIsOpen }}>
      {children}
    </CartContext.Provider>
  );
}
