'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trash2, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useCartStore } from '@/store/useCartStore';
import { useCartCheckoutStore } from '@/store/useCartCheckoutStore';
import { useAuthStore } from '@/store/useAuthStore';
import { IsLoading } from '@/components/common';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import StoreSelection from '@/components/shop/StoreSelection';
import CheckoutHandler from '@/components/shop/CheckoutHandler';
import PaymentDisplay from '@/components/shop/PaymentDisplay';
import type { CartItem } from '@/types/cart';

export default function CartPage() {
  const [isClient, setIsClient] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [paymentData, setPaymentData] = useState<{
    invoiceId: number | string;
    paymentAmount: number;
    deadline: string;
    qrCodeUrl: string;
    qrCodeBase64: string;
    accountName?: string;
  } | null>(null);

  const cart = useCartStore((state) => state.cart);
  const isInitialized = useCartStore((state) => state.isInitialized);
  const initCart = useCartStore((state) => state.initCart);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateItemQuantity = useCartStore((state) => state.updateItemQuantity);
  const updateItemUnit = useCartStore((state) => state.updateItemUnit);
  const clearCart = useCartStore((state) => state.clearCart);
  const getCartSummary = useCartStore((state) => state.getCartSummary);

  const selectedStoreId = useCartCheckoutStore((state) => state.selectedStoreId);
  const setSelectedStore = useCartCheckoutStore((state) => state.setSelectedStore);

  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && user?.id) {
      if (!isInitialized) {
        initCart(String(user.id));
      }
      setIsInitializing(false);
    }
  }, [isClient, user?.id, isInitialized, initCart]);

  if (!isClient || isInitializing) {
    return <IsLoading />;
  }

  if (!user) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-white dark:bg-slate-900 py-12">
          <div className="container mx-auto">
            <div className="text-center">
              <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-2xl font-bold mb-4">Vui lòng đăng nhập</h2>
              <p className="text-muted-foreground mb-6">Bạn cần đăng nhập để xem giỏ hàng của mình</p>
              <Button asChild>
                <Link href="/auth/login">Đăng nhập</Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const cartItems = cart?.items || [];
  const summary = getCartSummary();
  const isEmpty = cartItems.length === 0;

  const handleQuantityChange = (itemId: string, value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num > 0) {
      updateItemQuantity(itemId, num);
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white dark:bg-slate-900 py-8">
        <div className="container mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/shop">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Tiếp tục mua hàng
              </Link>
            </Button>
            <h1 className="text-4xl font-bold">Giỏ hàng của bạn</h1>
          </div>

          {isEmpty ? (
            <Card>
              <CardContent className="py-12 text-center">
                <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-bold mb-2">Giỏ hàng trống</h2>
                <p className="text-muted-foreground mb-6">Hãy thêm một số sản phẩm vào giỏ hàng</p>
                <Button asChild>
                  <Link href="/shop">Xem sản phẩm</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Sản phẩm trong giỏ hàng ({cartItems.length})</CardTitle>
                    <CardDescription>Quản lý các sản phẩm của bạn</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {cartItems.map((item) => (
                        <CartItemRow
                          key={item.id}
                          item={item}
                          onQuantityChange={(value) => handleQuantityChange(item.id, value)}
                          onUnitChange={(unit) => updateItemUnit(item.id, unit)}
                          onRemove={() => removeItem(item.id)}
                          selectedStoreId={selectedStoreId}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Sidebar */}
              <div className="space-y-6">
                {/* Store Selection */}
                <StoreSelection
                  cartItems={cartItems}
                  selectedStoreId={selectedStoreId}
                  onStoreChange={setSelectedStore}
                />

                {/* Cart Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>Tổng cộng</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tổng số mét:</span>
                        <span className="font-medium">{summary.totalMeter} m</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tổng số cuộn:</span>
                        <span className="font-medium">{summary.totalRoll} cuộn</span>
                      </div>
                      <div className="border-t pt-2 mt-2 flex justify-between text-lg font-bold">
                        <span>Thành tiền:</span>
                        <span className="text-primary">
                          {summary.totalPrice.toLocaleString('vi-VN')} ₫
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-4">
                      <CheckoutHandler 
                        disabled={!selectedStoreId || cartItems.length === 0}
                        onPaymentStart={(data) => {
                          setPaymentData(data);
                          // Scroll to bottom
                          setTimeout(() => {
                            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                          }, 100);
                        }}
                      />
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={clearCart}
                      >
                        Xóa tất cả
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>

        {/* Payment Display - at bottom of page */}
        {paymentData && (
          <div className="mt-12 pt-12 border-t">
            <h2 className="text-2xl font-bold mb-8">Thanh toán</h2>
            <div className="max-w-5xl mx-auto">
              <PaymentDisplay
                invoiceId={paymentData.invoiceId}
                paymentAmount={paymentData.paymentAmount}
                deadline={paymentData.deadline}
                qrCodeUrl={paymentData.qrCodeUrl}
                qrCodeBase64={paymentData.qrCodeBase64}
                accountName={paymentData.accountName}
                onPaymentSuccess={() => {
                  setPaymentData(null);
                }}
              />
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

// Cart Item Row Component
interface CartItemRowProps {
  item: CartItem;
  onQuantityChange: (value: string) => void;
  onUnitChange: (unit: 'meter' | 'roll') => void;
  onRemove: () => void;
  selectedStoreId?: string | number | null;
}

function CartItemRow({ 
  item, 
  onQuantityChange, 
  onUnitChange, 
  onRemove,
  selectedStoreId 
}: CartItemRowProps) {
  const [availableQuantity, setAvailableQuantity] = React.useState<number | null>(null);
  const [loadingInventory, setLoadingInventory] = React.useState(false);
  const [inventoryError, setInventoryError] = React.useState<string | null>(null);

  const { fabric, quantity, unit } = item;
  const pricePerUnit = unit === 'meter' ? fabric.sellingPrice : fabric.sellingPrice * fabric.length;
  const totalPrice = pricePerUnit * quantity;

  // Fetch available inventory when store changes
  React.useEffect(() => {
    if (!selectedStoreId) {
      setAvailableQuantity(null);
      setInventoryError(null);
      return;
    }

    const fetchInventory = async () => {
      try {
        setLoadingInventory(true);
        setInventoryError(null);
        const createService = (await import('@/services/storeFabric.service')).default;
        const storeFabricService = createService(selectedStoreId);
        const storeFabric = await storeFabricService.getById(fabric.id);
        setAvailableQuantity(storeFabric.inventory.totalMeters);
      } catch (error: any) {
        // Handle 404 specifically - product not found in store
        const isNotFound = error?.response?.status === 404 || error?.status === 404;
        if (isNotFound) {
          setInventoryError('Sản phẩm không có trong cửa hàng');
          setAvailableQuantity(null);
        } else {
          console.error('Failed to fetch inventory:', error);
          setInventoryError('Không thể kiểm tra tồn kho');
          setAvailableQuantity(null);
        }
      } finally {
        setLoadingInventory(false);
      }
    };

    fetchInventory();
  }, [selectedStoreId, fabric.id]);

  // Calculate available quantity in user's requested unit
  const availableInRequestedUnit = availableQuantity
    ? unit === 'meter'
      ? availableQuantity
      : Math.floor(availableQuantity / fabric.length)
    : null;

  const hasEnoughStock =
    availableInRequestedUnit !== null && availableInRequestedUnit >= quantity;

  return (
    <div className={`border rounded-lg p-4 transition ${
      selectedStoreId && availableInRequestedUnit !== null
        ? hasEnoughStock
          ? 'hover:bg-muted/50 border-green-200 bg-green-50/30'
          : 'hover:bg-muted/50 border-red-200 bg-red-50/30'
        : 'hover:bg-muted/50'
    }`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Product Info */}
        <div className="space-y-2">
          <h3 className="font-semibold">{fabric.category.name}</h3>
          <p className="text-sm text-muted-foreground">
            Màu: <span className="text-foreground">{fabric.color.name}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Bề mặt: <span className="text-foreground">{fabric.gloss.description}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Nhà cung cấp: <span className="text-foreground">{fabric.supplier.name}</span>
          </p>

          {/* Available Inventory Display */}
          {selectedStoreId && (
            <div className="mt-3 pt-3 border-t space-y-1">
              {loadingInventory ? (
                <p className="text-xs text-muted-foreground">Đang kiểm tra tồn kho...</p>
              ) : inventoryError ? (
                <p className={`text-xs font-medium ${
                  inventoryError.includes('không có')
                    ? 'text-orange-600'
                    : 'text-red-600'
                }`}>
                  {inventoryError}
                </p>
              ) : availableQuantity !== null ? (
                <>
                  <p className="text-xs font-medium">Tồn kho cửa hàng:</p>
                  <p className={`text-sm font-semibold ${
                    availableQuantity >= (unit === 'meter' ? quantity : quantity * fabric.length)
                      ? 'text-green-700'
                      : 'text-red-700'
                  }`}>
                    {unit === 'meter'
                      ? availableQuantity
                      : Math.floor(availableQuantity / fabric.length)
                    } {unit === 'meter' ? 'mét' : 'cuộn'}
                    {availableQuantity < (unit === 'meter' ? quantity : quantity * fabric.length) &&
                      ` (thiếu ${
                        (unit === 'meter' ? quantity : quantity * fabric.length) - availableQuantity
                      })`
                    }
                  </p>
                </>
              ) : null}
            </div>
          )}
        </div>

        {/* Quantity & Price */}
        <div className="space-y-3">
          <div className="flex gap-2">
            {/* Quantity Input */}
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground">Số lượng</label>
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => onQuantityChange(e.target.value)}
                className="h-8 mt-1"
              />
            </div>

            {/* Unit Select */}
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground">Đơn vị</label>
              <Select value={unit} onValueChange={onUnitChange}>
                <SelectTrigger className="h-8 mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="meter">Mét</SelectItem>
                  <SelectItem value="roll">Cuộn</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Remove Button */}
            <div className="flex items-end">
              <Button
                variant="ghost"
                size="icon"
                onClick={onRemove}
                className="h-8 w-8"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>

          {/* Price Info */}
          <div className="text-right pt-2 border-t">
            <p className="text-xs text-muted-foreground mb-1">
              {pricePerUnit.toLocaleString('vi-VN')} ₫ / {unit === 'meter' ? 'mét' : 'cuộn'}
            </p>
            <p className="font-bold text-lg text-primary">
              {totalPrice.toLocaleString('vi-VN')} ₫
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
