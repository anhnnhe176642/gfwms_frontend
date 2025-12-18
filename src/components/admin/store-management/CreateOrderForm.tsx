'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateOrderStore } from '@/store/useCreateOrderStore';
import { orderService } from '@/services/order.service';
import { getServerErrorMessage, extractFieldErrors } from '@/lib/errorHandler';
import { cn } from '@/lib/utils';
import { ArrowLeft, Send, ShoppingCart } from 'lucide-react';

export function CreateOrderForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const {
    storeId,
    storeName,
    selectedItems,
    customerPhone,
    paymentType,
    notes,
    goToStep1,
    setCustomerPhone,
    setPaymentType,
    setNotes,
    getOrderData,
    reset,
    setIsSubmitting: setStoreIsSubmitting,
  } = useCreateOrderStore();

  if (!storeId) {
    return <div>Lỗi: Không tìm thấy cửa hàng</div>;
  }

  const handleGoBack = () => {
    goToStep1();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setFieldErrors({});

    const orderData = getOrderData();
    if (!orderData) {
      toast.error('Dữ liệu đơn hàng không hợp lệ');
      return;
    }

    setIsSubmitting(true);
    setStoreIsSubmitting(true);

    try {
      const result = await orderService.createOfflineOrder(orderData);

      toast.success('Tạo đơn hàng thành công');

      // Reset store and redirect to invoice detail or order detail
      reset();
      if (result.invoice) {
        router.push(`/admin/invoices/${result.invoice.id}`);
      } else {
        // Fallback to order detail page if invoice not created
        router.push(`/admin/orders/${result.id}`);
      }
    } catch (error) {
      const errors = extractFieldErrors(error);
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
      }
      
      const message = getServerErrorMessage(error) || 'Không thể tạo đơn hàng';
      toast.error(message);
      console.error('Create order error:', error);
    } finally {
      setIsSubmitting(false);
      setStoreIsSubmitting(false);
    }
  };

  // Calculate summary
  const totalItems = selectedItems.size;
  const totalQuantity = Array.from(selectedItems.values()).reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleGoBack}
          disabled={isSubmitting}
          className="h-9 w-9"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tạo đơn hàng</h1>
          <p className="text-muted-foreground mt-1">
            {storeName} • {totalItems} loại vải • {totalQuantity.toLocaleString()} cái
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Form */}
        <div className="col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin đơn hàng</CardTitle>
              <CardDescription>
                Nhập thông tin khách hàng và phương thức thanh toán
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Customer Phone */}
                <div className="space-y-2">
                  <Label htmlFor="customerPhone" className="text-sm font-medium">
                    Số điện thoại khách
                  </Label>
                  <Input
                    id="customerPhone"
                    placeholder="0123456789"
                    value={customerPhone}
                    onChange={(e) => {
                      setCustomerPhone(e.target.value);
                      // Clear error when user starts typing
                      if (fieldErrors.customerPhone) {
                        setFieldErrors(prev => {
                          const newErrors = { ...prev };
                          delete newErrors.customerPhone;
                          return newErrors;
                        });
                      }
                    }}
                    type="tel"
                    disabled={isSubmitting}
                    className={fieldErrors.customerPhone ? 'border-destructive focus-visible:ring-destructive' : ''}
                  />
                  {fieldErrors.customerPhone && (
                    <p className="text-xs text-destructive">{fieldErrors.customerPhone}</p>
                  )}
                </div>

                {/* Payment Type */}
                <div className="space-y-2">
                  <Label htmlFor="paymentType" className="text-sm font-medium">
                    Phương thức thanh toán
                  </Label>
                  <Select
                    value={paymentType}
                    onValueChange={(value: any) => setPaymentType(value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="paymentType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CASH">Tiền mặt</SelectItem>
                      <SelectItem value="CREDIT">Công nợ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-sm font-medium">
                    Ghi chú (tuỳ chọn)
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Ghi chú thêm về đơn hàng..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    disabled={isSubmitting}
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGoBack}
                    disabled={isSubmitting}
                  >
                    Quay lại
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="gap-2">
                    {isSubmitting ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Đang tạo...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Tạo đơn hàng
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShoppingCart className="h-5 w-5" />
                Tóm tắt
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Selected Items */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {Array.from(selectedItems.values()).map((item) => (
                  <div
                    key={item.fabricId}
                    className="pb-2 border-b text-sm last:border-b-0"
                  >
                    <div className="font-medium truncate">
                      {item.fabric.fabricInfo.category} ({item.fabric.fabricInfo.color})
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {item.quantity} {item.saleUnit === 'METER' ? 'meter' : 'roll'}
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span>Loại vải:</span>
                  <span className="font-medium">{totalItems}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tổng số lượng:</span>
                  <span className="font-medium">{totalQuantity.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t">
                  <span>Phương thức:</span>
                  <span className="font-medium">
                    {paymentType === 'CASH' ? 'Tiền mặt' : 'Công nợ'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default CreateOrderForm;
