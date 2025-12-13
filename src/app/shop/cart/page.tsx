'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trash2, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { IsLoading } from '@/components/common';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CheckoutHandler from '@/components/shop/CheckoutHandler';
import PaymentDisplay from '@/components/shop/PaymentDisplay';
import { useAuth } from '@/hooks/useAuth';
import type { CartItem } from '@/types/cart';
import CartItemRow from '@/components/shop/CartItemRow';

export default function CartPage() {
  const [isClient, setIsClient] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
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
  const updateItemStore = useCartStore((state) => state.updateItemStore);
  const clearCart = useCartStore((state) => state.clearCart);
  const getCartSummary = useCartStore((state) => state.getCartSummary);

  const { user, isReady: isAuthReady } = useAuth();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && isAuthReady && user?.id) {
      const userIdStr = String(user.id);
      // Check if cart belongs to current user, if not reinitialize
      if (!cart || cart.userId !== userIdStr) {
        initCart(userIdStr);
      }
      setIsInitializing(false);
    } else if (isClient && isAuthReady && !user) {
      // User is authenticated but logged out
      setIsInitializing(false);
    }
  }, [isClient, isAuthReady, user?.id]);

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
                          onQuantityChange={(value: string) => handleQuantityChange(item.id, value)}
                          onUnitChange={(unit: 'meter' | 'roll') => updateItemUnit(item.id, unit)}
                          onStoreChange={(storeId: number, storeName?: string) => {
                            updateItemStore(item.id, storeId, storeName);
                          }}
                          onRemove={() => removeItem(item.id)}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Sidebar - Cart Summary */}
              <div className="space-y-6">
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
                        disabled={cartItems.length === 0}
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

