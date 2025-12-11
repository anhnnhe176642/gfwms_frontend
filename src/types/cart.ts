import type { FabricListItem } from './fabric';

export type CartItem = {
  id: string; // unique identifier: fabricId_timestamp
  fabricId: number;
  quantity: number;
  unit: 'meter' | 'roll'; // mét hoặc cuộn
  addedAt: string; // ISO timestamp
  fabric: FabricListItem;
};

export type Cart = {
  userId: string;
  items: CartItem[];
  updatedAt: string;
};

export type CartSummary = {
  totalItems: number;
  totalPrice: number;
  totalMeter: number;
  totalRoll: number;
};
