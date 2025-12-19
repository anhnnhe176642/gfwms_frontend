'use client';

import { useState, useEffect, useRef } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCreateOrderStore } from '@/store/useCreateOrderStore';
import { orderService, type PaymentMethod } from '@/services/order.service';
import { invoiceService } from '@/services/invoice.service';
import { userService } from '@/services/user.service';
import { getServerErrorMessage, extractFieldErrors } from '@/lib/errorHandler';
import { cn } from '@/lib/utils';
import { ArrowLeft, Send, ShoppingCart, QrCode, Banknote, Copy, Check, Clock, CheckCircle, AlertCircle, Search, X } from 'lucide-react';
import { decodeVietQR } from '@/lib/vietqr-parser';
import type { PaymentQRResponse, PaymentStatusResponse } from '@/types/payment';
import type { UserListItem } from '@/types/user';

export function CreateOrderForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  
  // User search state
  const [phoneInput, setPhoneInput] = useState<string>('');
  const [searchResults, setSearchResults] = useState<UserListItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Credit info state (from selected user)
  const [creditLimit, setCreditLimit] = useState<number>(0);
  const [creditUsed, setCreditUsed] = useState<number>(0);
  const [creditStatus, setCreditStatus] = useState<'APPROVED' | 'PENDING' | 'REJECTED' | null>(null);
  const [isCreditLocked, setIsCreditLocked] = useState(false);
  
  // QR Payment Modal State
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrData, setQrData] = useState<PaymentQRResponse | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusResponse | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [decodedQrInfo, setDecodedQrInfo] = useState<{
    bankBeneficiary?: string;
    bankAccount?: string;
    description?: string;
    bankCode?: string;
  } | null>(null);

  const {
    storeId,
    storeName,
    selectedItems,
    customerPhone,
    paymentType,
    paymentMethod,
    notes,
    goToStep1,
    setCustomerPhone,
    setPaymentType,
    setPaymentMethod,
    setNotes,
    getOrderData,
    reset,
    setIsSubmitting: setStoreIsSubmitting,
  } = useCreateOrderStore();

  // Debounced search for users by phone
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!phoneInput.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await userService.searchByPhone(phoneInput);
        setSearchResults(response.data);
      } catch (error) {
        console.error('Lỗi tìm kiếm user:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [phoneInput]);

  if (!storeId) {
    return <div>Lỗi: Không tìm thấy cửa hàng</div>;
  }

  const handleGoBack = () => {
    goToStep1();
  };

  const handleSelectUser = (user: UserListItem) => {
    setSelectedUser(user);
    setPhoneInput('');
    setSearchResults([]);
    
    // Set customer phone
    setCustomerPhone(user.phone || '');
    
    // Update credit info from creditRegistration
    if (user.creditRegistration) {
      setCreditLimit(user.creditRegistration.creditLimit || 0);
      setCreditUsed(user.creditRegistration.creditUsed || 0);
      setCreditStatus(user.creditRegistration.status as any);
      setIsCreditLocked(user.creditRegistration.isLocked || false);
    } else {
      setCreditLimit(0);
      setCreditUsed(0);
      setCreditStatus(null);
      setIsCreditLocked(false);
    }
  };

  const handleClearUser = () => {
    setSelectedUser(null);
    setPhoneInput('');
    setSearchResults([]);
    setCustomerPhone('');
    setCreditLimit(0);
    setCreditUsed(0);
    setCreditStatus(null);
    setIsCreditLocked(false);
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Format remaining time
  const formatTimeRemaining = (deadlineStr: string) => {
    const deadline = new Date(deadlineStr).getTime();
    const now = new Date().getTime();
    const remaining = deadline - now;

    if (remaining <= 0) {
      return 'Hết hạn';
    }

    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
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
      const response = await orderService.createOfflineOrder(orderData);
      const result = response.data;

      if (paymentMethod === 'QR') {
        // QR Payment: Generate QR code and show modal
        const invoiceId = result.invoice?.id;
        if (!invoiceId) {
          toast.error('Không thể lấy ID hóa đơn');
          return;
        }

        try {
          const qrResponse = await invoiceService.createPaymentQR(invoiceId);
          setQrData(qrResponse);
          
          // Decode QR to get bank info
          try {
            const parsedData = decodeVietQR(qrResponse.qrCodeUrl);
            if (parsedData && Object.keys(parsedData).length > 0) {
              setDecodedQrInfo({
                bankBeneficiary: parsedData.bankBeneficiary ? String(parsedData.bankBeneficiary) : undefined,
                bankAccount: parsedData.bankAccount ? String(parsedData.bankAccount) : undefined,
                description: parsedData.description ? String(parsedData.description) : `Thanh toán hóa đơn #${invoiceId}`,
                bankCode: parsedData.bankCode ? String(parsedData.bankCode) : undefined,
              });
            }
          } catch (decodeErr) {
            console.error('Lỗi decode QR:', decodeErr);
          }

          setQrModalOpen(true);
          setTimeRemaining(formatTimeRemaining(qrResponse.expiresAt));
          startPaymentPolling(invoiceId, qrResponse.expiresAt);
          
          toast.success('Đã tạo đơn hàng, vui lòng thanh toán bằng QR');
        } catch (qrError) {
          console.error('Lỗi tạo QR:', qrError);
          toast.error('Không thể tạo mã QR. Đơn hàng đã được tạo.');
          // Still redirect to invoice
          reset();
          router.push(`/admin/invoices/${invoiceId}`);
        }
      } else {
        // DIRECT Payment: Immediate success
        toast.success('Tạo đơn hàng thành công');

        // Reset store and redirect to invoice detail or order detail
        reset();
        if (result.invoice) {
          router.push(`/admin/invoices/${result.invoice.id}`);
        } else {
          // Fallback to order detail page if invoice not created
          router.push(`/admin/orders/${result.id}`);
        }
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

  const startPaymentPolling = (invoiceId: number, expiresAt: string) => {
    setIsPolling(true);
    setPaymentStatus(null);

    const countdownInterval = setInterval(() => {
      setTimeRemaining(formatTimeRemaining(expiresAt));
    }, 1000);

    const pollStatus = async () => {
      // Check deadline
      if (new Date() > new Date(expiresAt)) {
        clearInterval(countdownInterval);
        clearInterval(pollInterval);
        setIsPolling(false);
        toast.error('Hết hạn thanh toán');
        return;
      }

      try {
        const status = await invoiceService.getPaymentStatus(invoiceId);
        setPaymentStatus(status);

        if (status.status === 'SUCCESS') {
          clearInterval(countdownInterval);
          clearInterval(pollInterval);
          setIsPolling(false);
          toast.success('Thanh toán thành công!');
          
          // Redirect after 2 seconds
          setTimeout(() => {
            setQrModalOpen(false);
            reset();
            router.push(`/admin/invoices/${invoiceId}`);
          }, 2000);
        } else if (status.status === 'FAILED' || status.status === 'EXPIRED') {
          clearInterval(countdownInterval);
          clearInterval(pollInterval);
          setIsPolling(false);
          toast.error(status.status === 'FAILED' ? 'Thanh toán thất bại' : 'Hết hạn thanh toán');
        }
      } catch (err) {
        console.error('Lỗi kiểm tra trạng thái:', err);
      }
    };

    const pollInterval = setInterval(pollStatus, 3000);
    pollStatus(); // Initial check
  };

  const handleCloseQrModal = () => {
    setQrModalOpen(false);
    setIsPolling(false);
    setQrData(null);
    setPaymentStatus(null);
    setDecodedQrInfo(null);
    
    // Redirect to invoices list
    reset();
    router.push('/admin/invoices');
  };

  // Calculate summary
  const totalItems = selectedItems.size;
  const totalMeter = Array.from(selectedItems.values()).reduce(
    (sum, item) => sum + (item.saleUnit === 'METER' ? item.quantity : 0),
    0
  );
  const totalRoll = Array.from(selectedItems.values()).reduce(
    (sum, item) => sum + (item.saleUnit === 'ROLL' ? item.quantity : 0),
    0
  );
  const totalAmount = Array.from(selectedItems.values()).reduce((sum, item) => {
    const price = item.saleUnit === 'METER' 
      ? item.fabric.fabricInfo.sellingPricePerMeter 
      : item.fabric.fabricInfo.sellingPricePerRoll;
    return sum + (price * item.quantity);
  }, 0);

  // Calculate credit availability
  const creditAvailable = creditLimit - creditUsed;
  const creditExceeded = paymentType === 'CREDIT' && totalAmount > creditAvailable;

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
            {storeName} • {totalItems} loại vải {totalMeter > 0 && `• ${totalMeter.toLocaleString()} mét`} {totalRoll > 0 && `• ${totalRoll.toLocaleString()} cuộn`}
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
                {/* Customer Search */}
                <div className="space-y-2">
                  <Label htmlFor="customerPhone" className="text-sm font-medium">
                    Khách hàng
                  </Label>
                  {selectedUser ? (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 flex justify-between items-center">
                      <div>
                        <p className="font-medium text-sm">{selectedUser.fullname || selectedUser.username}</p>
                        <p className="text-xs text-muted-foreground">{selectedUser.phone}</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleClearUser}
                        disabled={isSubmitting}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="flex gap-2">
                        <div className="flex-1 relative">
                          <Input
                            id="customerPhone"
                            placeholder="Nhập số điện thoại..."
                            value={phoneInput}
                            onChange={(e) => setPhoneInput(e.target.value)}
                            type="tel"
                            disabled={isSubmitting}
                            className="pl-10"
                          />
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                      
                      {/* Search Results Dropdown */}
                      {phoneInput && (searchResults.length > 0 || isSearching) && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border rounded-lg shadow-lg z-10">
                          {isSearching ? (
                            <div className="p-3 text-center text-sm text-muted-foreground">
                              Đang tìm kiếm...
                            </div>
                          ) : searchResults.length === 0 ? (
                            <div className="p-3 text-center text-sm text-muted-foreground">
                              Không tìm thấy khách hàng
                            </div>
                          ) : (
                            <div className="max-h-64 overflow-y-auto">
                              {searchResults.map((u) => (
                                <button
                                  key={u.id}
                                  type="button"
                                  onClick={() => handleSelectUser(u)}
                                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-slate-800 flex justify-between items-center border-b last:border-b-0"
                                >
                                  <div>
                                    <p className="font-medium">{u.fullname || u.username}</p>
                                    <p className="text-xs text-muted-foreground">{u.phone}</p>
                                  </div>
                                  {u.creditRegistration && (
                                    <span className={`text-xs px-2 py-1 rounded ${u.creditRegistration.isLocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                      {!u.creditRegistration.isLocked && 'Được ghi nợ'}
                                    </span>
                                  )}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  {fieldErrors.customerPhone && (
                    <p className="text-xs text-destructive">{fieldErrors.customerPhone}</p>
                  )}
                </div>

                {/* Payment Type Selection */}
                <div className="space-y-2">
                  <Label htmlFor="paymentType" className="text-sm font-medium">
                    Phương thức thanh toán
                  </Label>
                  <Select
                    value={paymentType}
                    onValueChange={(value: any) => {
                      setPaymentType(value);
                      // Reset payment method when changing payment type
                      if (value === 'CASH') {
                        setPaymentMethod('DIRECT');
                      }
                    }}
                    disabled={isSubmitting || (paymentType === 'CREDIT' && !selectedUser)}
                  >
                    <SelectTrigger id="paymentType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CASH">Tiền mặt</SelectItem>
                      <SelectItem value="CREDIT" disabled={!selectedUser || !selectedUser.creditRegistration || isCreditLocked || creditStatus !== 'APPROVED'}>
                        Công nợ {!selectedUser && '(Chọn khách hàng)'}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {paymentType === 'CREDIT' && (!selectedUser || !selectedUser.creditRegistration || isCreditLocked || creditStatus !== 'APPROVED') && (
                    <p className="text-xs text-destructive">
                      {!selectedUser ? 'Vui lòng chọn khách hàng trước' : isCreditLocked ? 'Tài khoản công nợ đã bị khoá' : creditStatus !== 'APPROVED' ? 'Công nợ chưa được phê duyệt' : 'Khách hàng không có công nợ'}
                    </p>
                  )}
                </div>

                {/* Credit Info */}
                {paymentType === 'CREDIT' && selectedUser && selectedUser.creditRegistration && (
                  <div className="space-y-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Hạn mức công nợ</p>
                        <p className="font-semibold">{creditLimit.toLocaleString()}đ</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Đã sử dụng</p>
                        <p className="font-semibold">{creditUsed.toLocaleString()}đ</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Khả dụng</p>
                        <p className={`font-semibold ${creditAvailable < 0 ? 'text-destructive' : 'text-green-600'}`}>
                          {Math.max(0, creditAvailable).toLocaleString()}đ
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Tổng tiền đơn</p>
                        <p className={`font-semibold ${creditExceeded ? 'text-destructive' : ''}`}>
                          {totalAmount.toLocaleString()}đ
                        </p>
                      </div>
                    </div>
                    
                    {creditExceeded && (
                      <div className="rounded-lg bg-red-100 dark:bg-red-900/30 p-2 border border-red-300 dark:border-red-700">
                        <p className="text-sm text-red-800 dark:text-red-400 font-medium">
                          ⚠️ Tổng tiền ({totalAmount.toLocaleString()}đ) vượt mức khả dụng ({creditAvailable.toLocaleString()}đ)
                        </p>
                        <p className="text-xs text-red-700 dark:text-red-500 mt-1">
                          Vui lòng chọn hình thức thanh toán bổ sung bên dưới
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Payment Method */}
                {(paymentType === 'CASH' || creditExceeded) && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      {paymentType === 'CREDIT' ? 'Hình thức thanh toán bổ sung' : 'Hình thức thanh toán'}
                    </Label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="DIRECT"
                          checked={paymentMethod === 'DIRECT'}
                          onChange={() => setPaymentMethod('DIRECT')}
                          disabled={isSubmitting}
                          className="h-4 w-4 text-primary"
                        />
                        <div className="flex items-center gap-1.5">
                          <Banknote className="h-4 w-4" />
                          <span className="text-sm">Tiền mặt</span>
                        </div>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="QR"
                          checked={paymentMethod === 'QR'}
                          onChange={() => setPaymentMethod('QR')}
                          disabled={isSubmitting}
                          className="h-4 w-4 text-primary"
                        />
                        <div className="flex items-center gap-1.5">
                          <QrCode className="h-4 w-4" />
                          <span className="text-sm">QR Code</span>
                        </div>
                      </label>
                    </div>
                  </div>
                )}

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
                {Array.from(selectedItems.values()).map((item) => {
                  const unitPrice = item.saleUnit === 'METER' 
                    ? item.fabric.fabricInfo.sellingPricePerMeter 
                    : item.fabric.fabricInfo.sellingPricePerRoll;
                  const itemTotal = unitPrice * item.quantity;
                  
                  return (
                    <div
                      key={item.fabricId}
                      className="pb-2 border-b text-sm last:border-b-0"
                    >
                      <div className="font-medium truncate">
                        {item.fabric.fabricInfo.category} ({item.fabric.fabricInfo.color})
                      </div>
                      <div className="flex justify-between items-center text-xs text-muted-foreground mt-1">
                        <span>
                          {item.quantity} {item.saleUnit === 'METER' ? 'mét' : 'cuộn'} × {unitPrice.toLocaleString()}đ
                        </span>
                        <span className="font-medium text-foreground">
                          {itemTotal.toLocaleString()}đ
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary */}
              <div className="space-y-2 pt-4 border-t">
                {selectedUser && (
                  <div className="pb-3 border-b">
                    <p className="text-xs text-muted-foreground mb-1">Khách hàng</p>
                    <p className="font-medium text-sm">{selectedUser.fullname || selectedUser.username}</p>
                    <p className="text-xs text-muted-foreground">{selectedUser.phone}</p>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>Loại vải:</span>
                  <span className="font-medium">{totalItems}</span>
                </div>
                {totalMeter > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Tổng mét:</span>
                    <span className="font-medium">{totalMeter.toLocaleString()} m</span>
                  </div>
                )}
                {totalRoll > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Tổng cuộn:</span>
                    <span className="font-medium">{totalRoll.toLocaleString()} cuộn</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-semibold pt-2 border-t">
                  <span>Tổng tiền:</span>
                  <span className="text-primary">{totalAmount.toLocaleString()}đ</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t">
                  <span>Loại thanh toán:</span>
                  <span className="font-medium">
                    {paymentType === 'CASH' ? 'Tiền mặt' : 'Công nợ'}
                  </span>
                </div>
                {paymentType === 'CREDIT' && selectedUser?.creditRegistration && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span>Khả dụng:</span>
                      <span className={`font-medium ${creditAvailable < 0 ? 'text-destructive' : 'text-green-600'}`}>
                        {Math.max(0, creditAvailable).toLocaleString()}đ
                      </span>
                    </div>
                    {creditExceeded && (
                      <div className="flex justify-between text-sm">
                        <span>Hình thức bổ sung:</span>
                        <span className="font-medium flex items-center gap-1">
                          {paymentMethod === 'QR' ? (
                            <>
                              <QrCode className="h-3 w-3" />
                              QR Code
                            </>
                          ) : (
                            <>
                              <Banknote className="h-3 w-3" />
                              Tiền mặt
                            </>
                          )}
                        </span>
                      </div>
                    )}
                  </>
                )}
                {paymentType === 'CASH' && (
                  <div className="flex justify-between text-sm">
                    <span>Hình thức:</span>
                    <span className="font-medium flex items-center gap-1">
                      {paymentMethod === 'QR' ? (
                        <>
                          <QrCode className="h-3 w-3" />
                          QR Code
                        </>
                      ) : (
                        <>
                          <Banknote className="h-3 w-3" />
                          Tiền mặt
                        </>
                      )}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* QR Payment Modal */}
      <Dialog open={qrModalOpen} onOpenChange={(open) => !open && handleCloseQrModal()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Thanh toán QR
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Payment Status */}
            {paymentStatus?.status === 'SUCCESS' ? (
              <div className="flex flex-col items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <CheckCircle className="h-12 w-12 text-green-600" />
                <p className="font-semibold text-green-700 dark:text-green-400">Thanh toán thành công!</p>
                <p className="text-sm text-muted-foreground">Đang chuyển hướng...</p>
              </div>
            ) : paymentStatus?.status === 'FAILED' || paymentStatus?.status === 'EXPIRED' ? (
              <div className="flex flex-col items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <AlertCircle className="h-12 w-12 text-red-600" />
                <p className="font-semibold text-red-700 dark:text-red-400">
                  {paymentStatus.status === 'FAILED' ? 'Thanh toán thất bại' : 'Hết hạn thanh toán'}
                </p>
              </div>
            ) : (
              <>
                {/* QR Code */}
                {qrData && (
                  <div className="flex flex-col items-center gap-3">
                    <div className="bg-white p-3 rounded-lg border">
                      <img
                        src={qrData.qrCodeBase64}
                        alt="QR Code"
                        className="w-48 h-48"
                      />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Còn lại: {timeRemaining}</span>
                    </div>
                    <p className="text-lg font-semibold">
                      {qrData.amount.toLocaleString()} VND
                    </p>
                  </div>
                )}

                {/* Bank Transfer Info */}
                {decodedQrInfo && (
                  <div className="space-y-2 p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium">Thông tin chuyển khoản:</p>
                    {decodedQrInfo.bankBeneficiary && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Chủ TK:</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(decodedQrInfo.bankBeneficiary!, 'beneficiary')}
                          className="flex items-center gap-1 hover:text-primary"
                        >
                          <span className="font-medium">{decodedQrInfo.bankBeneficiary}</span>
                          {copiedField === 'beneficiary' ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                        </button>
                      </div>
                    )}
                    {decodedQrInfo.bankAccount && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Số TK:</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(decodedQrInfo.bankAccount!, 'account')}
                          className="flex items-center gap-1 hover:text-primary"
                        >
                          <span className="font-medium">{decodedQrInfo.bankAccount}</span>
                          {copiedField === 'account' ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                        </button>
                      </div>
                    )}
                    {decodedQrInfo.bankCode && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Ngân hàng:</span>
                        <span className="font-medium">{decodedQrInfo.bankCode}</span>
                      </div>
                    )}
                    {qrData && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Số tiền:</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(qrData.amount.toString(), 'amount')}
                          className="flex items-center gap-1 hover:text-primary"
                        >
                          <span className="font-medium">{qrData.amount.toLocaleString()} VND</span>
                          {copiedField === 'amount' ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                        </button>
                      </div>
                    )}
                    {decodedQrInfo.description && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Nội dung:</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(decodedQrInfo.description!, 'description')}
                          className="flex items-center gap-1 hover:text-primary"
                        >
                          <span className="font-medium truncate max-w-[180px]">{decodedQrInfo.description}</span>
                          {copiedField === 'description' ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Polling indicator */}
                {isPolling && (
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span>Đang chờ thanh toán...</span>
                  </div>
                )}
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseQrModal}>
              {paymentStatus?.status === 'SUCCESS' ? 'Đóng' : 'Huỷ thanh toán'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CreateOrderForm;
