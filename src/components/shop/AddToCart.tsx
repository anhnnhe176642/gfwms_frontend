'use client';

import React, { useState } from 'react';
import { Plus, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';
import type { FabricListItem } from '@/types/fabric';

interface AddToCartProps {
  fabric: FabricListItem;
  variant?: 'default' | 'outline' | 'ghost';
  showLabel?: boolean;
}

export default function AddToCart({ fabric, variant = 'default', showLabel = true }: AddToCartProps) {
  const [quantity, setQuantity] = useState<number>(1);
  const [unit, setUnit] = useState<'meter' | 'roll'>('meter');
  const [isAdding, setIsAdding] = useState(false);

  const addItem = useCartStore((state) => state.addItem);
  const initCart = useCartStore((state) => state.initCart);
  const user = useAuthStore((state) => state.user);

  const handleAddToCart = () => {
    if (!user?.id) {
      toast.error('Vui lòng đăng nhập để sử dụng giỏ hàng');
      return;
    }

    if (!useCartStore.getState().cart) {
      initCart(String(user.id));
    }

    setIsAdding(true);
    try {
      addItem(fabric, quantity, unit);
      toast.success(`Đã thêm ${quantity} ${unit === 'meter' ? 'mét' : 'cuộn'} vào giỏ hàng`);
      // Reset form
      setQuantity(1);
      setUnit('meter');
    } finally {
      setIsAdding(false);
    }
  };

  const handleQuantityChange = (value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num > 0) {
      setQuantity(num);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-2">
        {/* Quantity Input */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">Số lượng</label>
          <Input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => handleQuantityChange(e.target.value)}
            className="h-8"
          />
        </div>

        {/* Unit Select */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">Đơn vị</label>
          <Select value={unit} onValueChange={(value) => setUnit(value as 'meter' | 'roll')}>
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="meter">Mét</SelectItem>
              <SelectItem value="roll">Cuộn</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Price Display */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">Giá</label>
          <div className="h-8 flex items-center text-sm font-semibold text-primary">
            {(
              (unit === 'meter' ? fabric.sellingPrice : fabric.sellingPrice * fabric.length) *
              quantity
            ).toLocaleString('vi-VN')}
            ₫
          </div>
        </div>
      </div>

      {/* Add to Cart Button */}
      <Button
        onClick={handleAddToCart}
        disabled={isAdding || quantity < 1}
        variant={variant}
        className="w-full"
      >
        <ShoppingCart className="mr-2 h-4 w-4" />
        {showLabel ? 'Thêm vào giỏ hàng' : <Plus className="h-4 w-4" />}
      </Button>
    </div>
  );
}
