import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartCheckoutStore {
  selectedStoreId: number | null;
  
  // Actions
  setSelectedStore: (storeId: number) => void;
  clearSelectedStore: () => void;
}

export const useCartCheckoutStore = create<CartCheckoutStore>()(
  persist(
    (set) => ({
      selectedStoreId: null,

      setSelectedStore: (storeId: number) => {
        set({ selectedStoreId: storeId });
      },

      clearSelectedStore: () => {
        set({ selectedStoreId: null });
      },
    }),
    {
      name: 'gfwms-cart-checkout-storage',
    }
  )
);
