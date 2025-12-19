'use client';

import { create } from 'zustand';
import type { StoreFabricListItem } from '@/types/storeFabric';
import type { PaymentType, SaleUnit } from '@/types/order';
import type { PaymentMethod } from '@/services/order.service';

export type CreateOrderItem = {
  fabricId: number;
  quantity: number;
  saleUnit: SaleUnit;
  fabric: StoreFabricListItem;
};

type CreateOrderState = {
  // Step 1 state - fabric selection
  storeId: number | null;
  storeName: string;
  selectedItems: Map<number, CreateOrderItem>;
  quantityInputs: Map<number, string>;
  unitInputs: Map<number, SaleUnit>;
  
  // Step 2 state - order form
  currentStep: 1 | 2;
  customerPhone: string;
  paymentType: PaymentType;
  paymentMethod: PaymentMethod;
  notes: string;
  
  // Submission state
  isSubmitting: boolean;
  
  // Actions
  setStoreInfo: (storeId: number, storeName: string) => void;
  setSelectedItems: (items: Map<number, CreateOrderItem>) => void;
  setQuantityInputs: (inputs: Map<number, string>) => void;
  setUnitInputs: (inputs: Map<number, SaleUnit>) => void;
  setCustomerPhone: (phone: string) => void;
  setPaymentType: (type: PaymentType) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setNotes: (notes: string) => void;
  
  // Step navigation
  goToStep2: () => void;
  goToStep1: () => void;
  
  // Submission
  setIsSubmitting: (submitting: boolean) => void;
  
  // Reset all
  reset: () => void;
  
  // Get final order data
  getOrderData: () => {
    storeId: number;
    customerPhone?: string;
    paymentType: PaymentType;
    paymentMethod: PaymentMethod;
    notes?: string;
    orderItems: Array<{
      fabricId: number;
      quantity: number;
      saleUnit: SaleUnit;
    }>;
  } | null;
};

export const useCreateOrderStore = create<CreateOrderState>((set, get) => ({
  // Initial state
  storeId: null,
  storeName: '',
  selectedItems: new Map(),
  quantityInputs: new Map(),
  unitInputs: new Map(),
  currentStep: 1,
  customerPhone: '',
  paymentType: 'CASH',
  paymentMethod: 'DIRECT',
  notes: '',
  isSubmitting: false,

  // Actions
  setStoreInfo: (storeId, storeName) => set({ storeId, storeName }),

  setSelectedItems: (items) => set({ selectedItems: new Map(items) }),

  setQuantityInputs: (inputs) => set({ quantityInputs: new Map(inputs) }),

  setUnitInputs: (inputs) => set({ unitInputs: new Map(inputs) }),

  setCustomerPhone: (phone) => set({ customerPhone: phone }),

  setPaymentType: (type) => set({ paymentType: type }),

  setPaymentMethod: (method) => set({ paymentMethod: method }),

  setNotes: (notes) => set({ notes }),

  goToStep2: () => set({ currentStep: 2 }),

  goToStep1: () => set({ currentStep: 1 }),

  setIsSubmitting: (submitting) => set({ isSubmitting: submitting }),

  reset: () =>
    set({
      storeId: null,
      storeName: '',
      selectedItems: new Map(),
      quantityInputs: new Map(),
      unitInputs: new Map(),
      currentStep: 1,
      customerPhone: '',
      paymentType: 'CASH',
      paymentMethod: 'DIRECT',
      notes: '',
      isSubmitting: false,
    }),

  getOrderData: () => {
    const state = get();
    if (!state.storeId || state.selectedItems.size === 0) {
      return null;
    }

    return {
      storeId: state.storeId,
      customerPhone: state.customerPhone || undefined,
      paymentType: state.paymentType,
      paymentMethod: state.paymentMethod,
      notes: state.notes || undefined,
      orderItems: Array.from(state.selectedItems.values()).map((item) => ({
        fabricId: item.fabricId,
        quantity: item.quantity,
        saleUnit: item.saleUnit,
      })),
    };
  },
}));

export default useCreateOrderStore;
