import type { FabricListItem } from './fabric';

export type CartItem = {
  id: string; // unique identifier: fabricId_timestamp
  fabricId: number;
  quantity: number;
  unit: 'meter' | 'roll'; // mét hoặc cuộn
  addedAt: string; // ISO timestamp
  fabric: FabricListItem;
  // Attributes with names/descriptions
  categoryId?: number;
  categoryName?: string;
  glossId?: number;
  glossDescription?: string;
  thickness?: number;
  thicknessLabel?: string; // e.g., "0.5mm"
  width?: number;
  widthLabel?: string; // e.g., "1.5m"
  length?: number;
  lengthLabel?: string; // e.g., "2m"
  // Store info
  storeId?: number;
  storeName?: string;
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
