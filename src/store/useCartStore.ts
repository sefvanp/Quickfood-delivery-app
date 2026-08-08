import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CartItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  image?: any;
}

interface CartStore {
  cart: CartItem[];
  addToCart: (item: any) => void;
  updateQuantity: (_id: string, delta: number) => void;
  removeFromCart: (_id: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      cart: [],
      addToCart: (item) =>
        set((state) => {
          const existingIndex = state.cart.findIndex((i) => i._id === item._id);
          if (existingIndex > -1) {
            const updated = [...state.cart];
            updated[existingIndex].quantity += 1;
            return { cart: updated };
          }
          return { cart: [...state.cart, { ...item, quantity: 1 }] };
        }),
      updateQuantity: (_id, delta) =>
        set((state) => {
          const updated = state.cart
            .map((item) => {
              if (item._id === _id) {
                const newQty = item.quantity + delta;
                return newQty > 0 ? { ...item, quantity: newQty } : null;
              }
              return item;
            })
            .filter(Boolean) as CartItem[];
          return { cart: updated };
        }),
      removeFromCart: (_id) =>
        set((state) => ({
          cart: state.cart.filter((item) => item._id !== _id),
        })),
      clearCart: () => set({ cart: [] }),
    }),
    { name: "cart-storage" }
  )
);