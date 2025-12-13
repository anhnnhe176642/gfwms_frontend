import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Cart, CartSummary } from '@/types/cart';
import type { FabricListItem } from '@/types/fabric';

interface CartStore {
  cart: Cart | null;
  isInitialized: boolean;

  // Actions
  initCart: (userId: string | number) => void;
  addItem: (
    fabric: FabricListItem,
    quantity: number,
    unit: 'meter' | 'roll',
    options?: {
      categoryId?: number;
      categoryName?: string;
      glossId?: number;
      glossDescription?: string;
      thickness?: number;
      thicknessLabel?: string;
      width?: number;
      widthLabel?: string;
      length?: number;
      lengthLabel?: string;
      storeId?: number;
      storeName?: string;
    }
  ) => void;
  removeItem: (itemId: string) => void;
  updateItemQuantity: (itemId: string, quantity: number) => void;
  updateItemUnit: (itemId: string, unit: 'meter' | 'roll') => void;
  updateItemStore: (itemId: string, storeId: number, storeName?: string) => void;
  clearCart: () => void;
  
  // Getters
  getCartSummary: () => CartSummary;
  getCartItems: () => CartItem[];
  getTotalItems: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cart: null,
      isInitialized: false,

      initCart: (userId: string | number) => {
        const { cart } = get();
        const userIdStr = String(userId);
        if (!cart || cart.userId !== userIdStr) {
          set({
            cart: {
              userId: userIdStr,
              items: [],
              updatedAt: new Date().toISOString(),
            },
            isInitialized: true,
          });
        } else {
          set({ isInitialized: true });
        }
      },

      addItem: (
        fabric: FabricListItem,
        quantity: number,
        unit: 'meter' | 'roll',
        options?: {
          categoryId?: number;
          categoryName?: string;
          glossId?: number;
          glossDescription?: string;
          thickness?: number;
          thicknessLabel?: string;
          width?: number;
          widthLabel?: string;
          length?: number;
          lengthLabel?: string;
          storeId?: number;
          storeName?: string;
        }
      ) => {
        set((state) => {
          if (!state.cart) return state;

          const itemId = `${fabric.id}_${Date.now()}`;
          const newItem: CartItem = {
            id: itemId,
            fabricId: fabric.id,
            quantity,
            unit,
            addedAt: new Date().toISOString(),
            fabric,
            // Add filter values and store info
            categoryId: options?.categoryId,
            categoryName: options?.categoryName,
            glossId: options?.glossId,
            glossDescription: options?.glossDescription,
            thickness: options?.thickness,
            thicknessLabel: options?.thicknessLabel,
            width: options?.width,
            widthLabel: options?.widthLabel,
            length: options?.length,
            lengthLabel: options?.lengthLabel,
            storeId: options?.storeId,
            storeName: options?.storeName,
          };

          return {
            cart: {
              ...state.cart,
              items: [...state.cart.items, newItem],
              updatedAt: new Date().toISOString(),
            },
          };
        });
      },

      removeItem: (itemId: string) => {
        set((state) => {
          if (!state.cart) return state;

          return {
            cart: {
              ...state.cart,
              items: state.cart.items.filter((item) => item.id !== itemId),
              updatedAt: new Date().toISOString(),
            },
          };
        });
      },

      updateItemQuantity: (itemId: string, quantity: number) => {
        set((state) => {
          if (!state.cart) return state;

          return {
            cart: {
              ...state.cart,
              items: state.cart.items.map((item) =>
                item.id === itemId ? { ...item, quantity } : item
              ),
              updatedAt: new Date().toISOString(),
            },
          };
        });
      },

      updateItemUnit: (itemId: string, unit: 'meter' | 'roll') => {
        set((state) => {
          if (!state.cart) return state;

          return {
            cart: {
              ...state.cart,
              items: state.cart.items.map((item) =>
                item.id === itemId ? { ...item, unit } : item
              ),
              updatedAt: new Date().toISOString(),
            },
          };
        });
      },

      updateItemStore: (itemId: string, storeId: number, storeName?: string) => {
        set((state) => {
          if (!state.cart) return state;

          return {
            cart: {
              ...state.cart,
              items: state.cart.items.map((item) =>
                item.id === itemId ? { ...item, storeId, storeName } : item
              ),
              updatedAt: new Date().toISOString(),
            },
          };
        });
      },

      clearCart: () => {
        set((state) => {
          if (!state.cart) return state;

          return {
            cart: {
              ...state.cart,
              items: [],
              updatedAt: new Date().toISOString(),
            },
          };
        });
      },

      getCartSummary: (): CartSummary => {
        const { cart } = get();
        if (!cart || cart.items.length === 0) {
          return {
            totalItems: 0,
            totalPrice: 0,
            totalMeter: 0,
            totalRoll: 0,
          };
        }

        let totalPrice = 0;
        let totalMeter = 0;
        let totalRoll = 0;

        cart.items.forEach((item) => {
          const price = item.unit === 'meter' 
            ? item.fabric.sellingPrice 
            : item.fabric.sellingPrice * item.fabric.length; // Assuming length is meters per roll

          totalPrice += price * item.quantity;

          if (item.unit === 'meter') {
            totalMeter += item.quantity;
          } else {
            totalRoll += item.quantity;
          }
        });

        return {
          totalItems: cart.items.length,
          totalPrice,
          totalMeter,
          totalRoll,
        };
      },

      getCartItems: (): CartItem[] => {
        const { cart } = get();
        return cart?.items || [];
      },

      getTotalItems: (): number => {
        const { cart } = get();
        return cart?.items.length || 0;
      },
    }),
    {
      name: 'gfwms-cart-storage', // localStorage key
    }
  )
);
