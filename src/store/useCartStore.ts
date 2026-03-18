// src/store/useCartStore.ts
import { create } from "zustand";

export interface Product {
  id: string;
  name: string;
  price: number;
  categoryId: string;
}

export interface CartItem extends Product {
  quantity: number;
  cartItemId: string; // เอาไว้แยก item ที่เป็นสินค้าเดียวกันแต่เลือกวิธีชงต่างกัน
  brewMethod?: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, brewMethod?: string) => void;
  removeItem: (cartItemId: string) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  addItem: (product, brewMethod) => {
    set((state) => {
      // สร้าง ID เฉพาะสำหรับรายการในตะกร้า (เผื่อสั่งกาแฟตัวเดียวกัน แต่แก้วแรกดริป แก้วสอง AeroPress)
      const cartItemId = `${product.id}-${brewMethod || "standard"}`;
      const existingItem = state.items.find(
        (item) => item.cartItemId === cartItemId,
      );

      if (existingItem) {
        return {
          items: state.items.map((item) =>
            item.cartItemId === cartItemId
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          ),
        };
      }
      return {
        items: [
          ...state.items,
          { ...product, quantity: 1, cartItemId, brewMethod },
        ],
      };
    });
  },
  removeItem: (cartItemId) => {
    set((state) => ({
      items: state.items.filter((item) => item.cartItemId !== cartItemId),
    }));
  },
  clearCart: () => set({ items: [] }),
  getTotal: () =>
    get().items.reduce((total, item) => total + item.price * item.quantity, 0),
}));
