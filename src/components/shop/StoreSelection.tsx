'use client';

import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Truck } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import storeService from '@/services/store.service';
import createStoreFabricService from '@/services/storeFabric.service';
import type { StoreListItem } from '@/types/store';
import type { CartItem } from '@/types/cart';

interface StoreSelectionProps {
  cartItems: CartItem[];
  selectedStoreId: string | number | null;
  onStoreChange: (storeId: number) => void;
}

interface InventoryStatus {
  [itemId: string]: {
    isAvailable: boolean;
    quantity: number;
    requiredQuantity: number;
    error?: string;
  };
}

export default function StoreSelection({
  cartItems,
  selectedStoreId,
  onStoreChange,
}: StoreSelectionProps) {
  const [stores, setStores] = useState<StoreListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [inventoryStatus, setInventoryStatus] = useState<InventoryStatus>({});
  const [checkingInventory, setCheckingInventory] = useState(false);

  // Fetch stores
  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        const response = await storeService.getStores({ limit: 100 });
        setStores(response.data);
      } catch (error) {
        console.error('Failed to fetch stores:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, []);

  // Check inventory when store or cart items change
  useEffect(() => {
    if (!selectedStoreId || cartItems.length === 0) {
      setInventoryStatus({});
      return;
    }

    const checkInventory = async () => {
      setCheckingInventory(true);
      try {
        const storeFabricService = createStoreFabricService(selectedStoreId);
        const status: InventoryStatus = {};

        for (const item of cartItems) {
          try {
            const storeFabric = await storeFabricService.getById(item.fabricId);

            // Convert requested quantity to consistent unit (meters for comparison)
            let requestedMeters = 0;
            if (item.unit === 'meter') {
              requestedMeters = item.quantity;
            } else {
              // Convert rolls to meters (using the fabric's length)
              requestedMeters = item.quantity * item.fabric.length;
            }

            // Get available inventory in meters
            const availableMeters = storeFabric.inventory.totalMeters;

            status[item.id] = {
              isAvailable: availableMeters >= requestedMeters,
              quantity: availableMeters,
              requiredQuantity: requestedMeters,
            };
          } catch (error: any) {
            // Handle 404 error (product not found in store) vs other errors
            const isNotFound = error?.response?.status === 404 || error?.status === 404;
            const errorMessage = isNotFound
              ? 'Sản phẩm không có trong cửa hàng'
              : 'Không thể kiểm tra tồn kho';

            status[item.id] = {
              isAvailable: false,
              quantity: 0,
              requiredQuantity: 0,
              error: errorMessage,
            };
          }
        }

        setInventoryStatus(status);
      } finally {
        setCheckingInventory(false);
      }
    };

    checkInventory();
  }, [selectedStoreId, cartItems]);

  const allItemsAvailable = cartItems.length > 0 && 
    cartItems.every((item) => inventoryStatus[item.id]?.isAvailable);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Chọn cửa hàng để thanh toán
        </CardTitle>
        <CardDescription>
          Kiểm tra tồn kho trước khi thanh toán
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Store Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Cửa hàng</label>
          <Select
            value={selectedStoreId?.toString() || ''}
            onValueChange={(value) => onStoreChange(Number(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn cửa hàng" />
            </SelectTrigger>
            <SelectContent>
              {stores.length === 0 ? (
                <div className="p-2 text-sm text-muted-foreground">Không có cửa hàng nào</div>
              ) : (
                stores.map((store) => (
                  <SelectItem key={store.id} value={store.id.toString()}>
                    <div className="flex flex-col">
                      <span>{store.name}</span>
                      <span className="text-xs text-muted-foreground">{store.address}</span>
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
