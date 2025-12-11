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
import { useCartStore } from '@/store/useCartStore';
import { useCartCheckoutStore } from '@/store/useCartCheckoutStore';
import { useAuthStore } from '@/store/useAuthStore';
import type { CreateOrderPayload } from '@/types/order';

interface CheckoutHandlerProps {
  disabled?: boolean;
  onPaymentStart?: (paymentData: {
    invoiceId: number | string;
    paymentAmount: number;
    deadline: string;
    qrCodeUrl: string;
    qrCodeBase64: string;
    accountName?: string;
  }) => void;
}

export default function CheckoutHandler({ disabled = false, onPaymentStart }: CheckoutHandlerProps) {
  const router = useRouter();
  const { cart, getCartSummary } = useCartStore();
  const { selectedStoreId } = useCartCheckoutStore();
  const { user } = useAuthStore();

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  const summary = getCartSummary();

  const handleCheckout = async () => {
    setShowConfirmDialog(false);

    if (!user?.id) {
      toast.error('Vui lòng đăng nhập để thanh toán');
      router.push('/auth/login');
      return;
    }

    if (!selectedStoreId) {
      toast.error('Vui lòng chọn cửa hàng để thanh toán');
      return;
    }

    if (!cart || cart.items.length === 0) {
      toast.error('Giỏ hàng trống');
      return;
    }

    try {
      setIsCreatingOrder(true);

      // 1. Convert cart items to order items format
      const orderItems = cart.items.map((item) => ({
        fabricId: item.fabricId,
        quantity: item.quantity,
        saleUnit: item.unit.toUpperCase() as 'METER' | 'ROLL',
      }));

      // 2. Create order
      const createOrderPayload: CreateOrderPayload = {
        storeId: selectedStoreId,
        orderItems,
        paymentType: 'CASH', // Default to CASH for PayOS QR
        notes: `Đơn hàng từ khách hàng ${user.fullname || user.username}`,
      };

      const orderResponse = await orderService.create(createOrderPayload);

      toast.success('Tạo đơn hàng thành công!');

      // 3. Create payment QR code
      const invoiceId = orderResponse.data.order.invoice?.id;
      if (!invoiceId) {
        throw new Error('Không thể lấy ID hóa đơn từ đơn hàng');
      }
      const paymentQRResponse = await invoiceService.createPaymentQR(invoiceId);

      // 4. Return payment data to parent component
      const paymentInfo = {
        invoiceId: paymentQRResponse.invoiceId,
        paymentAmount: paymentQRResponse.amount,
        deadline: paymentQRResponse.expiresAt,
        qrCodeUrl: paymentQRResponse.qrCodeUrl,
        qrCodeBase64: paymentQRResponse.qrCodeBase64,
        accountName: paymentQRResponse.accountName,
      };
      
      if (onPaymentStart) {
        onPaymentStart(paymentInfo);
      }
    } catch (error: any) {
      console.error('Lỗi khi tạo đơn hàng:', error);
      const message =
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
                      Số sản phẩm: <span className="font-semibold">{cart?.items.length}</span>
                    </li>
                    <li>
                      Tổng tiền:{' '}
                      <span className="font-semibold">
                        {summary.totalPrice.toLocaleString('vi-VN')} ₫
                      </span>
                    </li>
                    <li>
                      Cửa hàng: <span className="font-semibold">{selectedStoreId}</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded p-2 flex gap-2 text-xs">
                  <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <span>
                    Bạn sẽ được chuyển đến màn hình thanh toán QR Code. Vui lòng quét mã
                    bằng ứng dụng ngân hàng của bạn.
                  </span>
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
