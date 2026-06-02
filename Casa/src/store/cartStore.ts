import { create } from 'zustand';
import { Furniture } from '../types/database';

export interface CartItem {
  product: Furniture;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Furniture) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addItem: (product) => {
    const currentItems = get().items;
    const existingIndex = currentItems.findIndex((item) => item.product.id === product.id);

    if (existingIndex > -1) {
      // Item exists, increment quantity
      const updatedItems = [...currentItems];
      updatedItems[existingIndex].quantity += 1;
      set({ items: updatedItems });
    } else {
      // Item is new, append to cart
      set({ items: [...currentItems, { product, quantity: 1 }] });
    }
  },

  removeItem: (productId) => {
    set({
      items: get().items.filter((item) => item.product.id !== productId),
    });
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }

    set({
      items: get().items.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      ),
    });
  },

  clearCart: () => {
    set({ items: [] });
  },

  getTotalItems: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0);
  },

  getTotalPrice: () => {
    return get().items.reduce((total, item) => total + item.product.price * item.quantity, 0);
  },
}));

export default useCartStore;
