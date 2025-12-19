'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { orderService } from '@/services/order.service';
import { invoiceService } from '@/services/invoice.service';
import fabricStoreService from '@/services/fabric-store.service';
import { getServerErrorMessage, getErrorStatus } from '@/lib/errorHandler';
import { useCartStore } from '@/store/useCartStore';
import { useCartCheckoutStore } from '@/store/useCartCheckoutStore';
import { useAuthStore } from '@/store/useAuthStore';
import type { CreateOrderPayload } from '@/types/order';
import type { CartItem } from '@/types/cart';
import type { AllocationItem } from '@/services/fabric-store.service';

interface CheckoutHandlerProps {
  disabled?: boolean;
  allocationsMap?: Record<string, { allocations: AllocationItem[]; totalValue: number }>;
  cartItems?: CartItem[];
  selectedItemIds?: Set<string>;
  paymentType?: 'CASH' | 'CREDIT';
  onPaymentStart?: (paymentData: {
    invoiceId: number | string;
    paymentAmount: number;
    deadline: string;
    qrCodeUrl?: string;
    qrCodeBase64?: string;
    accountName?: string;
    invoiceStatus?: string;
    creditAmount?: number;
  }) => void;
  onAllocationValidationError?: (itemErrors: Record<string, string>) => void;
}

export default function CheckoutHandler({ 
  disabled = false, 
  allocationsMap,
  cartItems,
  selectedItemIds,
  paymentType = 'CASH',
  onPaymentStart,
  onAllocationValidationError,
}: CheckoutHandlerProps) {
  const router = useRouter();
  const { cart, getCartSummary } = useCartStore();
  const { selectedStoreId } = useCartCheckoutStore();
  const { user } = useAuthStore();

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [selectedPaymentType, setSelectedPaymentType] = useState<'CASH' | 'CREDIT'>(paymentType);

  const summary = getCartSummary();

  const handleCheckout = async () => {
    setShowConfirmDialog(false);

    if (!user?.id) {
      toast.error('Vui lòng đăng nhập để thanh toán');
      router.push('/auth/login');
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      toast.error('Giỏ hàng trống');
      return;
    }

    // Filter to only selected items
    const itemsToProcess = selectedItemIds && selectedItemIds.size > 0 
      ? cartItems.filter(item => selectedItemIds.has(item.id))
      : cartItems;

    if (itemsToProcess.length === 0) {
      toast.error('Chọn sản phẩm để thanh toán');
      return;
    }

    if (!allocationsMap || Object.keys(allocationsMap).length === 0) {
      toast.error('Vui lòng đảm bảo tất cả sản phẩm đã được phân bổ');
      return;
    }

    try {
      setIsCreatingOrder(true);

      // Re-validate allocations before checkout
      // Group items by storeId
      const groupedByStore = itemsToProcess.reduce(
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

      // Validate allocations for each store
      for (const [storeIdStr, items] of Object.entries(groupedByStore)) {
        const storeId = parseInt(storeIdStr);

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
          await fabricStoreService.batchAllocate(batchRequest);
        } catch (allocationError) {
          // Check if it's a 400 validation error
          const errorObj = allocationError as { response?: { status?: number; data?: { message?: string; errors?: Array<{ field: string; message: string }> } } };
          
          if (errorObj?.response?.status === 400) {
            // Map field errors to cart items (field format: "allocations.0", "allocations.1", etc.)
            const newItemErrors: Record<string, string> = {};
            
            errorObj?.response?.data?.errors?.forEach((err) => {
              const match = err.field?.match(/allocations\.(\d+)/);
              if (match) {
                const index = parseInt(match[1]);
                const cartItem = items[index];
                if (cartItem) {
                  newItemErrors[cartItem.id] = err.message;
                }
              }
            });
            
            // Call callback to update itemErrors in parent component
            if (onAllocationValidationError) {
              onAllocationValidationError(newItemErrors);
            }
            
            const displayMessage = Object.values(newItemErrors).join('; ') || 
              errorObj?.response?.data?.message || 'Thông tin phân bổ không còn hợp lệ';
            
            toast.error(`Không thể thanh toán: ${displayMessage}`);
            setIsCreatingOrder(false);
            return;
          }
          
          // For other errors, throw to be caught by outer catch
          throw allocationError;
        }
      }

      // All allocations are valid, proceed with order creation


      // 1. Build order items from allocations, grouped by store
      const ordersByStore: Record<number, Array<{ fabricId: number; quantity: number; saleUnit: 'ROLL' | 'METER' }>> = {};

      cartItems.forEach((item) => {
        if (!allocationsMap[item.id]) {
          console.warn('Item missing allocations:', item.id);
          return;
        }

        const storeId = item.storeId;
        if (!storeId) {
          throw new Error(`Mục ${item.fabric.category.name} không có cửa hàng được gán. Vui lòng thêm lại sản phẩm.`);
        }

        if (!ordersByStore[storeId]) {
          ordersByStore[storeId] = [];
        }

        const { allocations } = allocationsMap[item.id];
        allocations.forEach((allocation) => {
          const storeOrders = ordersByStore[storeId];
          if (storeOrders) {
            storeOrders.push({
              fabricId: allocation.fabricId,
              quantity: allocation.quantity,
              saleUnit: allocation.unit,
            });
          }
        });
      });

      const storeIds = Object.keys(ordersByStore).map(Number);
      if (storeIds.length === 0) {
        toast.error('Không có chi tiết phân bổ nào có sẵn. Vui lòng chọn lại cửa hàng.');
        return;
      }

      // Create orders for each store
      const invoiceIds: string[] = [];
      let totalPaymentAmount = 0;
      let totalCreditAmount = 0;
      let latestDeadline = '';
      let latestQrCode = '';
      let latestQrCodeBase64 = '';
      let accountName = '';

      for (const storeId of storeIds) {
        const orderItems = ordersByStore[storeId];

        // 2. Create order
        const createOrderPayload: CreateOrderPayload = {
          storeId,
          orderItems,
          paymentType: selectedPaymentType,
          notes: `Đơn hàng từ khách hàng ${user.fullname || user.username}`,
        };

        let orderResponse;
        try {
          orderResponse = await orderService.create(createOrderPayload);
          toast.success(`Tạo đơn hàng thành công cho cửa hàng ${storeId}!`);
        } catch (orderError: any) {
          const statusCode = getErrorStatus(orderError);
          const errorMessage = getServerErrorMessage(orderError);
          
          if (statusCode === 400) {
            toast.error(`Lỗi: ${errorMessage || 'Yêu cầu không hợp lệ'}`);
          } else {
            throw orderError;
          }
          setIsCreatingOrder(false);
          return;
        }

        // 3. Create payment QR code (for CASH) or extract credit info (for CREDIT)
        const invoiceId = orderResponse.data.order.invoice?.id;
        if (!invoiceId) {
          throw new Error('Không thể lấy ID hóa đơn từ đơn hàng');
        }
        invoiceIds.push(String(invoiceId));
        
        if (selectedPaymentType === 'CREDIT') {
          // For CREDIT payments, extract info from invoice in order response
          const invoice = orderResponse.data.order.invoice;
          const paymentInstructions = orderResponse.data.paymentInstructions;
          const creditAmount = invoice.creditAmount || 0; // Amount being credited
          const paymentAmount = paymentInstructions?.amount || 0; // Amount to pay immediately
          
          // Accumulate credit amount
          totalCreditAmount += creditAmount;
          
          // Check if this is a mixed payment (partial credit + partial payment)
          // invoiceStatus UNPAID means credit was not enough, need to pay the difference
          if (invoice.invoiceStatus === 'UNPAID' && paymentAmount > 0) {
            // Mixed payment: partial credit + partial payment required
            // Create QR code for the remaining amount
            const paymentQRResponse = await invoiceService.createPaymentQR(invoiceId);
            
            totalPaymentAmount += paymentAmount; // Add immediate payment amount
            latestDeadline = invoice.paymentDeadline || '';
            latestQrCode = paymentQRResponse.qrCodeUrl;
            latestQrCodeBase64 = paymentQRResponse.qrCodeBase64;
            accountName = paymentQRResponse.accountName || '';
          } else {
            // Pure credit payment (credit is sufficient)
            latestDeadline = invoice.paymentDeadline || '';
            // No QR code for pure credit payments
            latestQrCode = '';
            latestQrCodeBase64 = '';
            accountName = '';
          }
        } else {
          // For CASH payments, create payment QR code
          const paymentQRResponse = await invoiceService.createPaymentQR(invoiceId);
          
          // Accumulate payment details
          totalPaymentAmount += paymentQRResponse.amount;
          latestDeadline = paymentQRResponse.expiresAt || '';
          latestQrCode = paymentQRResponse.qrCodeUrl;
          latestQrCodeBase64 = paymentQRResponse.qrCodeBase64;
          accountName = paymentQRResponse.accountName || '';
        }
      }

      // 4. Return payment data to parent component
      const paymentInfo = {
        invoiceId: invoiceIds.join(', '),
        paymentAmount: selectedPaymentType === 'CREDIT' ? totalPaymentAmount : totalPaymentAmount,
        deadline: latestDeadline,
        ...(selectedPaymentType === 'CASH' ? {
          qrCodeUrl: latestQrCode,
          qrCodeBase64: latestQrCodeBase64,
          accountName: accountName,
        } : {
          invoiceStatus: 'CREDIT' as const,
          creditAmount: totalCreditAmount,
          qrCodeUrl: latestQrCode,
          qrCodeBase64: latestQrCodeBase64,
          accountName: accountName,
        }),
      };
      
      if (onPaymentStart) {
        onPaymentStart(paymentInfo);
      }
    } catch (error: any) {
      console.error('Lỗi khi tạo đơn hàng:', error);
      const message =
        error?.message ||
        error?.response?.data?.message ||
        'Không thể tạo đơn hàng. Vui lòng thử lại.';
      toast.error(message);
    } finally {
      setIsCreatingOrder(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setShowConfirmDialog(true)}
        disabled={disabled || isCreatingOrder}
        className="w-full h-12 text-base"
        size="lg"
      >
        {isCreatingOrder ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Đang xử lý...
          </>
        ) : (
          'Tiến hành thanh toán'
        )}
      </Button>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận thanh toán</DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-4 text-left">
                <div>
                  <p className="font-semibold mb-2">Kiểm tra thông tin đơn hàng:</p>
                  <ul className="text-sm space-y-1 list-disc list-inside">
                    <li>
                      Số sản phẩm: <span className="font-semibold">{cartItems?.length || 0}</span>
                    </li>
                    <li>
                      Tổng tiền:{' '}
                      <span className="font-semibold text-base text-primary">
                        {cartItems?.reduce((sum, item) => sum + (allocationsMap?.[item.id]?.totalValue || 0), 0).toLocaleString('vi-VN')} ₫
                      </span>
                    </li>
                    {cartItems && cartItems.length > 0 && (
                      <li>
                        Cửa hàng:{' '}
                        <span className="font-semibold">
                          {[...new Set(cartItems.map(item => item.storeId))].map(storeId => {
                            const store = cartItems.find(item => item.storeId === storeId);
                            return store?.storeName || `ID: ${storeId}`;
                          }).join(', ')}
                        </span>
                      </li>
                    )}
                  </ul>
                </div>
                {cartItems && cartItems.length > 0 && allocationsMap && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded p-3 space-y-2 max-h-48 overflow-y-auto">
                    <p className="font-semibold text-sm">Chi tiết đơn hàng:</p>
                    <div className="space-y-1">
                      {cartItems.map((item) => {
                        const data = allocationsMap[item.id];
                        if (!data) return null;
                        return (
                          <div key={item.id} className="text-xs space-y-1">
                            {data.allocations.map((alloc, idx) => (
                              <div key={idx} className="flex justify-between gap-2">
                                <span className="flex-1">
                                  {alloc.fabricInfo.category} - {alloc.fabricInfo.color} ({alloc.quantity} {alloc.unit === 'ROLL' ? 'cuộn' : 'mét'})
                                </span>
                                <span className="font-semibold shrink-0">
                                  {alloc.pricing.estimatedValue.toLocaleString('vi-VN')} ₫
                                </span>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                <div className="border-t pt-4 space-y-3">
                  <div>
                    <p className="font-semibold text-sm mb-3">Phương thức thanh toán:</p>
                    <div className="flex gap-3">
                      <label className="flex items-center gap-2 p-3 border rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800" style={{ borderColor: selectedPaymentType === 'CASH' ? 'var(--primary)' : 'var(--border)' }}>
                        <input
                          type="radio"
                          name="paymentType"
                          value="CASH"
                          checked={selectedPaymentType === 'CASH'}
                          onChange={(e) => setSelectedPaymentType(e.target.value as 'CASH' | 'CREDIT')}
                          disabled={isCreatingOrder}
                        />
                        <span className="text-sm font-medium">Thanh toán ngay (QR Code)</span>
                      </label>
                      <label className="flex items-center gap-2 p-3 border rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800" style={{ borderColor: selectedPaymentType === 'CREDIT' ? 'var(--primary)' : 'var(--border)' }}>
                        <input
                          type="radio"
                          name="paymentType"
                          value="CREDIT"
                          checked={selectedPaymentType === 'CREDIT'}
                          onChange={(e) => setSelectedPaymentType(e.target.value as 'CASH' | 'CREDIT')}
                          disabled={isCreatingOrder}
                        />
                        <span className="text-sm font-medium">Ghi nợ</span>
                      </label>
                    </div>
                  </div>
                  {selectedPaymentType === 'CASH' && (
                    <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded p-2 flex gap-2 text-xs">
                      <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                      <span>
                        Bạn sẽ được chuyển đến màn hình thanh toán QR Code. Vui lòng quét mã
                        bằng ứng dụng ngân hàng của bạn.
                      </span>
                    </div>
                  )}
                  {selectedPaymentType === 'CREDIT' && (
                    <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded p-2 flex gap-2 text-xs">
                      <AlertCircle className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                      <span>
                        Đơn hàng sẽ được tạo với trạng thái ghi nợ. Bạn sẽ thanh toán vào ngày
                        cuối cùng của tháng.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isCreatingOrder}
            >
              Hủy
            </Button>
            <Button onClick={handleCheckout} disabled={isCreatingOrder}>
              {isCreatingOrder ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                'Xác nhận'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
