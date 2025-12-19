'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { invoiceService } from '@/services/invoice.service';
import { getServerErrorMessage } from '@/lib/errorHandler';
import { Loader2, CheckCircle2 } from 'lucide-react';
import type { InvoiceDetail } from '@/types/invoice';

interface ConfirmOfflinePaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: InvoiceDetail;
  onSuccess: () => void;
}

export function ConfirmOfflinePaymentDialog({
  open,
  onOpenChange,
  invoice,
  onSuccess,
}: ConfirmOfflinePaymentDialogProps) {
  const creditAmount = invoice.creditAmount || 0;
  const amountToPay = invoice.totalAmount - creditAmount;
  const [amountPaid, setAmountPaid] = useState<string>(String(amountToPay));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    const amount = parseInt(amountPaid);

    if (!amountPaid.trim()) {
      toast.error('Vui lòng nhập số tiền thanh toán');
      return;
    }

    if (isNaN(amount) || amount <= 0) {
      toast.error('Số tiền phải là số dương');
      return;
    }

    if (amount > amountToPay) {
      toast.error(`Số tiền không được vượt quá ${amountToPay.toLocaleString()}đ`);
      return;
    }

    setIsSubmitting(true);
    try {
      await invoiceService.confirmOfflinePayment(invoice.id, amount);
      toast.success(`Xác nhận thanh toán ${amount.toLocaleString()}đ thành công`);
      onOpenChange(false);
      setAmountPaid(String(amountToPay));
      onSuccess();
    } catch (error) {
      const message = getServerErrorMessage(error) || 'Không thể xác nhận thanh toán';
      toast.error(message);
      console.error('Confirm payment error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <DialogTitle>Xác nhận thanh toán tiền mặt</DialogTitle>
          </div>
          <DialogDescription>
            Xác nhận đã nhận tiền mặt từ khách hàng cho hóa đơn #{invoice.id}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Total Amount */}
          <div className="p-3 bg-accent rounded-lg border">
            <p className="text-xs text-muted-foreground mb-1">Tổng tiền hóa đơn</p>
            <p className="text-lg font-semibold">
              {invoice.totalAmount.toLocaleString()}đ
            </p>
          </div>

          {/* Credit Amount - if exists */}
          {creditAmount > 0 && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-xs text-blue-700 dark:text-blue-200 mb-1">Công nợ được sử dụng</p>
              <p className="text-lg font-semibold text-blue-600 dark:text-blue-300">
                -{creditAmount.toLocaleString()}đ
              </p>
            </div>
          )}

          {/* Amount Paid */}
          <div className="space-y-2">
            <Label htmlFor="amountPaid" className="text-sm font-medium">
              Số tiền cần thanh toán {creditAmount > 0 && '(sau khi trừ công nợ)'}
            </Label>
            <Input
              id="amountPaid"
              type="number"
              placeholder="Nhập số tiền"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              disabled={isSubmitting}
              min="1"
              max={amountToPay}
              maxLength={10}
            />
            <p className="text-xs text-muted-foreground">
              Tối đa: {amountToPay.toLocaleString()}đ
            </p>
          </div>

          {/* Difference */}
          {amountPaid && parseInt(amountPaid) !== amountToPay && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-xs text-yellow-700 dark:text-yellow-200">
                Chênh lệch: {(amountToPay - parseInt(amountPaid)).toLocaleString()}đ
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang xác nhận...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Xác nhận thanh toán
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
