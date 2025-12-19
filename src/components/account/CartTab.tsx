'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Trash2, ShoppingCart, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useCartStore } from '@/store/useCartStore';
import { IsLoading } from '@/components/common';
import CheckoutHandler from '@/components/shop/CheckoutHandler';
import PaymentDisplay from '@/components/shop/PaymentDisplay';
import { useAuth } from '@/hooks/useAuth';
import type { CartItem } from '@/types/cart';
import type { AllocationItem, AllocationResult } from '@/services/fabric-store.service';
import CartItemRow from '@/components/shop/CartItemRow';
import fabricStoreService from '@/services/fabric-store.service';
import { toast } from 'sonner';

export function CartTab() {
  const [isClient, setIsClient] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [activeTab, setActiveTab] = useState<'cart' | 'payment'>('cart');
  const [paymentData, setPaymentData] = useState<{
    invoiceId: number | string;
    paymentAmount: number;
    deadline: string;
    qrCodeUrl?: string;
    qrCodeBase64?: string;
    accountName?: string;
    invoiceStatus?: string;
    creditAmount?: number;
  } | null>(null);
  const [allocationsMap, setAllocationsMap] = useState<Record<string, { allocations: AllocationItem[]; totalValue: number }>>({});
  const [itemErrors, setItemErrors] = useState<Record<string, string>>({});
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
  const debounceTimersRef = useRef<Record<number, NodeJS.Timeout | null>>({});
  const prevCartItemsRef = useRef<CartItem[] | null>(null);

  const cart = useCartStore((state) => state.cart);
  const isInitialized = useCartStore((state) => state.isInitialized);
  const initCart = useCartStore((state) => state.initCart);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateItemQuantity = useCartStore((state) => state.updateItemQuantity);
  const updateItemUnit = useCartStore((state) => state.updateItemUnit);
  const clearCart = useCartStore((state) => state.clearCart);
  const getCartSummary = useCartStore((state) => state.getCartSummary);

  const { user, isReady: isAuthReady } = useAuth();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && isAuthReady && user?.id) {
      const userIdStr = String(user.id);
      if (!cart || cart.userId !== userIdStr) {
        initCart(userIdStr);
      }
      setIsInitializing(false);
    } else if (isClient && isAuthReady && !user) {
      setIsInitializing(false);
    }
  }, [isClient, isAuthReady, user?.id, cart, initCart]);

  // Fetch allocations for all items grouped by storeId (with debounce)
  useEffect(() => {
    if (!isClient || !cart?.items || cart.items.length === 0) {
      setAllocationsMap({});
      setItemErrors({});
      prevCartItemsRef.current = null;
      return;
    }

    // Detect which stores have changed items
    const getStoresWithChanges = (): Set<number> => {
      const changedStores = new Set<number>();
      const prevItems = prevCartItemsRef.current || [];

      // If first time or count differs, all stores changed
      if (prevItems.length !== cart.items.length) {
        cart.items.forEach((item) => {
          if (item.storeId) changedStores.add(item.storeId);
        });
        return changedStores;
      }

      // Check each item for changes
      cart.items.forEach((currentItem, index) => {
        const prevItem = prevItems[index];

        // If item is new or properties changed
        if (
          !prevItem ||
          prevItem.id !== currentItem.id ||
          prevItem.quantity !== currentItem.quantity ||
          prevItem.unit !== currentItem.unit ||
          prevItem.categoryId !== currentItem.categoryId ||
          prevItem.glossId !== currentItem.glossId ||
          prevItem.thickness !== currentItem.thickness ||
          prevItem.width !== currentItem.width ||
          prevItem.length !== currentItem.length ||
          prevItem.storeId !== currentItem.storeId
        ) {
          if (currentItem.storeId) {
            changedStores.add(currentItem.storeId);
          }
        }
      });

      return changedStores;
    };

    const changedStoreIds = getStoresWithChanges();

    // Only proceed if there are changed stores
    if (changedStoreIds.size === 0) {
      prevCartItemsRef.current = cart.items;
      return;
    }

    // Clear previous timeouts for changed stores only
    changedStoreIds.forEach((storeId) => {
      if (debounceTimersRef.current[storeId]) {
        clearTimeout(debounceTimersRef.current[storeId]!);
      }
    });

    // Set new debounce timeouts for changed stores (300ms delay)
    changedStoreIds.forEach((storeId) => {
      debounceTimersRef.current[storeId] = setTimeout(async () => {
        try {
          // Group items by storeId
          const groupedByStore = cart.items.reduce(
            (acc, item) => {
              if (!item.storeId) return acc;
              if (!acc[item.storeId]) {
                acc[item.storeId] = [];
              }
              acc[item.storeId].push(item);
              return acc;
            },
            {} as Record<number, CartItem[]>
          );

          // Only process the store that changed
          const items = groupedByStore[storeId];
          if (!items || items.length === 0) return;

          const batchRequest = {
            storeId,
            allocations: items.map((item) => ({
              categoryId: item.categoryId!,
              quantity: item.quantity,
              unit: item.unit === 'meter' ? 'METER' as const : 'ROLL' as const,
              colorId: item.fabric.color?.id,
              glossId: item.glossId,
              thickness: item.thickness,
              width: item.width,
              length: item.length,
            })),
          };

          try {
            const response = await fabricStoreService.batchAllocate(batchRequest);

            // Update allocations for this store only
            setAllocationsMap((prev) => {
              const updated = { ...prev };
              response.allocations.forEach((allocation: AllocationResult, index: number) => {
                const cartItem = items[index];
                updated[cartItem.id] = {
                  allocations: allocation.items,
                  totalValue: allocation.totalValue,
                };
              });
              return updated;
            });

            // Clear errors for items in this store if allocation succeeded
            setItemErrors((prev) => {
              const updated = { ...prev };
              items.forEach((item) => {
                delete updated[item.id];
              });
              return updated;
            });
          } catch (storeError) {
            // Handle 400 errors with field-level error messages
            const errorObj = storeError as { response?: { status?: number; data?: { errors?: Array<{ field: string; message: string }> } } };

            if (errorObj?.response?.status === 400 && errorObj?.response?.data?.errors) {
              // Map field errors to cart items
              const newItemErrors: Record<string, string> = {};
              errorObj.response.data.errors.forEach((err) => {
                const match = err.field?.match(/allocations\.(\d+)/);
                if (match) {
                  const index = parseInt(match[1]);
                  const cartItem = items[index];
                  if (cartItem) {
                    newItemErrors[cartItem.id] = err.message;
                  }
                }
              });
              setItemErrors((prev) => ({ ...prev, ...newItemErrors }));
            } else {
              toast.error('Không thể tải thông tin phân bổ vải');
              console.error('Failed to fetch allocations for store', storeId, storeError);
            }
          }
        } catch (error) {
          console.error('Failed to fetch allocations:', error);
          toast.error('Không thể tải thông tin phân bổ vải');
        }
      }, 300);
    });

    // Update prev items ref
    prevCartItemsRef.current = cart.items;

    // Cleanup timeouts on unmount
    return () => {
      changedStoreIds.forEach((storeId) => {
        if (debounceTimersRef.current[storeId]) {
          clearTimeout(debounceTimersRef.current[storeId]!);
        }
      });
    };
  }, [isClient, cart?.items]);

  if (!isClient || isInitializing) {
    return <IsLoading />;
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-4">Vui lòng đăng nhập</h2>
        <p className="text-muted-foreground mb-6">Bạn cần đăng nhập để xem giỏ hàng của mình</p>
        <Button asChild>
          <Link href="/auth/login">Đăng nhập</Link>
        </Button>
      </div>
    );
  }

  const cartItems = cart?.items || [];
  const summary = getCartSummary();
  const isEmpty = cartItems.length === 0;

  // Calculate selected items totals
  const selectedItemsTotals = cartItems.reduce(
    (acc, item) => {
      if (!selectedItemIds.has(item.id)) return acc;
      
      const allocation = allocationsMap[item.id];
      if (!allocation) return acc;

      // Count selected items by unit
      if (item.unit === 'meter') {
        acc.meter += item.quantity;
      } else {
        acc.roll += item.quantity;
      }
      
      acc.totalValue += allocation.totalValue;
      return acc;
    },
    { meter: 0, roll: 0, totalValue: 0 }
  );

  const handleQuantityChange = (itemId: string, value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num > 0) {
      updateItemQuantity(itemId, num);
    }
  };

  const handleUnitChange = (itemId: string, unit: 'meter' | 'roll') => {
    updateItemUnit(itemId, unit);
  };

  if (isEmpty) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Giỏ hàng trống</h2>
          <p className="text-muted-foreground mb-6">Hãy thêm một số sản phẩm vào giỏ hàng</p>
          <Button asChild>
            <Link href="/shop/fabrics">Xem sản phẩm</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Handle payment start - switch to payment tab
  const handlePaymentStart = (data: any) => {
    setPaymentData(data);
    setActiveTab('payment');
  };

  // Handle payment success - clear and go back to cart
  const handlePaymentSuccess = () => {
    setPaymentData(null);
    setActiveTab('cart');
  };

  return (
    <div className="space-y-6">
      {/* Cart Tab */}
      {activeTab === 'cart' && (
        <>
          {/* Cart Items */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Sản phẩm trong giỏ hàng ({cartItems.length})</CardTitle>
              <CardDescription>Quản lý các sản phẩm của bạn</CardDescription>
            </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Group items by store */}
              {Object.entries(
                cartItems.reduce(
                  (acc, item) => {
                    const storeId = item.storeId || 0;
                    if (!acc[storeId]) {
                      acc[storeId] = [];
                    }
                    acc[storeId].push(item);
                    return acc;
                  },
                  {} as Record<number, CartItem[]>
                )
              ).map(([storeIdStr, storeItems]) => {
                const storeId = parseInt(storeIdStr);
                const storeName = storeItems[0]?.storeName || `Cửa hàng ${storeId}`;

                return (
                  <div key={storeId} className="border rounded-lg p-4 bg-muted/30">
                    {/* Store Header */}
                    <div className="mb-4 pb-3 border-b">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-base flex items-center gap-2">
                          <Store className="h-5 w-5" />
                          {storeName}
                        </h3>
                        <label className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                          <Checkbox
                            checked={storeItems.length > 0 && storeItems.every((item) => selectedItemIds.has(item.id))}
                            onCheckedChange={(checked) => {
                              setSelectedItemIds((prev) => {
                                const newSet = new Set(prev);
                                if (checked) {
                                  storeItems.forEach((item) => newSet.add(item.id));
                                } else {
                                  storeItems.forEach((item) => newSet.delete(item.id));
                                }
                                return newSet;
                              });
                            }}
                          />
                          Chọn tất cả
                        </label>
                      </div>
                    </div>

                    {/* Store Items */}
                    <div className="space-y-4">
                      {storeItems.map((item) => {
                        const allocations = allocationsMap[item.id]?.allocations || [];
                        const maxAvailable = allocations.length > 0 ? allocations[0]?.available || 0 : 0;
                        const error = itemErrors[item.id];

                        return (
                          <CartItemRow
                            key={item.id}
                            item={item}
                            onQuantityChange={(value: string) => handleQuantityChange(item.id, value)}
                            onUnitChange={(unit: 'meter' | 'roll') => handleUnitChange(item.id, unit)}
                            onRemove={() => removeItem(item.id)}
                            allocations={allocations}
                            totalValue={allocationsMap[item.id]?.totalValue || 0}
                            maxAvailable={maxAvailable}
                            error={error}
                            isSelected={selectedItemIds.has(item.id)}
                            onSelectChange={(selected) => {
                              setSelectedItemIds((prev) => {
                                const newSet = new Set(prev);
                                if (selected) {
                                  newSet.add(item.id);
                                } else {
                                  newSet.delete(item.id);
                                }
                                return newSet;
                              });
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
        </div>

        {/* Right Sidebar - Cart Summary */}
        <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Thanh toán ({selectedItemIds.size})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 p-3 bg-blue-50 dark:bg-blue-950 rounded">
              <p className="text-xs text-blue-600 dark:text-blue-400 mb-2">
                Tổng cộng các sản phẩm được chọn
              </p>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tổng số mét:</span>
                <span className="font-medium">{selectedItemsTotals.meter} m</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tổng số cuộn:</span>
                <span className="font-medium">{selectedItemsTotals.roll} cuộn</span>
              </div>
              <div className="border-t pt-2 mt-2 flex justify-between text-lg font-bold">
                <span>Thành tiền:</span>
                <span className="text-primary">
                  {selectedItemsTotals.totalValue.toLocaleString('vi-VN')} ₫
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-4">
              <CheckoutHandler 
                disabled={selectedItemIds.size === 0 || Object.keys(allocationsMap).length === 0}
                allocationsMap={allocationsMap}
                cartItems={Array.from(selectedItemIds).map((id) => cartItems.find((item) => item.id === id)!).filter(Boolean)}
                selectedItemIds={selectedItemIds}
                onPaymentStart={handlePaymentStart}
                onAllocationValidationError={(itemErrors) => {
                  setItemErrors(itemErrors);
                }}
              />
              <Button
                variant="outline"
                className="w-full"
                onClick={clearCart}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Xóa tất cả
              </Button>
            </div>
          </CardContent>
        </Card>
            </div>
          </div>
        </>
      )}

      {/* Payment Tab */}
      {activeTab === ('payment' as const) && paymentData && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Thanh toán</CardTitle>
            <Button variant="outline" onClick={() => setActiveTab('cart')}>
              ← Quay lại giỏ hàng
            </Button>
          </CardHeader>
          <CardContent>
            <PaymentDisplay
              invoiceId={paymentData.invoiceId}
              paymentAmount={paymentData.paymentAmount}
              deadline={paymentData.deadline}
              qrCodeUrl={paymentData.qrCodeUrl}
              qrCodeBase64={paymentData.qrCodeBase64}
              accountName={paymentData.accountName}
              invoiceStatus={paymentData.invoiceStatus}
              creditAmount={paymentData.creditAmount}
              onPaymentSuccess={handlePaymentSuccess}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
