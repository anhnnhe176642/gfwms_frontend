'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle, ArrowLeft, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/useAuthStore';
import { IsLoading } from '@/components/common';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { invoiceService } from '@/services/invoice.service';
import type { InvoiceDetail } from '@/types/invoice';

interface OrderSuccessPageProps {
  params: Promise<{
    orderId: string;
  }>;
}

export default function OrderSuccessPage({ params: paramsProm }: OrderSuccessPageProps) {
  const params = use(paramsProm);
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    const fetchInvoice = async () => {
      try {
        setIsLoading(true);
        const data = await invoiceService.getDetail(params.orderId);
        setInvoice(data);
      } catch (err: any) {
        console.error('Lỗi tải hóa đơn:', err);
        setError(
          err?.response?.data?.message ||
          'Không thể tải thông tin hóa đơn. Vui lòng thử lại.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoice();
  }, [user, params.orderId, router]);

  if (isLoading) {
    return <IsLoading />;
  }

  if (error || !invoice) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-white dark:bg-slate-900 py-12">
          <div className="container mx-auto max-w-2xl">
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-red-100 dark:bg-red-950 p-6">
                  <Package className="h-12 w-12 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-4">Không tìm thấy đơn hàng</h2>
              <p className="text-muted-foreground mb-6">{error}</p>
              <div className="space-x-3">
                <Button asChild>
                  <Link href="/shop/cart">Quay lại giỏ hàng</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/shop">Tiếp tục mua sắm</Link>
                </Button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white dark:bg-slate-900 py-12">
        <div className="container mx-auto max-w-2xl">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-green-100 dark:bg-green-950 p-6">
                <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2">Thanh toán thành công!</h1>
            <p className="text-muted-foreground text-lg">
              Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đang được xử lý.
            </p>
          </div>

          {/* Order Details */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Chi tiết hóa đơn</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Invoice Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Mã hóa đơn</p>
                  <p className="font-bold text-lg"># {invoice.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Ngày lập</p>
                  <p className="font-medium">
                    {new Date(invoice.invoiceDate).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Trạng thái</p>
                  <div className="inline-block">
                    <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-950 px-3 py-1 text-sm font-medium text-green-700 dark:text-green-300">
                      ✓ {invoice.invoiceStatus === 'PAID' ? 'Đã thanh toán' : 'Chờ thanh toán'}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Khách hàng</p>
                  <p className="font-medium">
                    {invoice.order?.user?.username || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Items */}
              {invoice.order?.orderItems && invoice.order.orderItems.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-4">Sản phẩm đã đặt</h3>
                  <div className="space-y-3 border-t pt-4">
                    {invoice.order.orderItems.map((item, index) => (
                      <div key={index} className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium">
                            {item.fabric?.category?.name || 'Không rõ'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {item.quantity} {item.saleUnit?.toLowerCase() === 'meter' ? 'mét' : 'cuộn'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">
                            {(item.quantity * item.price).toLocaleString('vi-VN')} ₫
                          </p>
                          <p className="text-sm text-muted-foreground">
                            x {item.price.toLocaleString('vi-VN')} ₫
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Totals */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-lg font-bold">
                  <span>Tổng cộng:</span>
                  <span className="text-primary">
                    {invoice.totalAmount.toLocaleString('vi-VN')} ₫
                  </span>
                </div>
                {invoice.paymentType && invoice.paymentType === 'CREDIT' && invoice.paidAmount !== undefined && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Đã thanh toán:</span>
                    <span className="text-green-600">{invoice.paidAmount.toLocaleString('vi-VN')} ₫</span>
                  </div>
                )}
                {invoice.paymentType && invoice.paymentType === 'CREDIT' && invoice.creditAmount && invoice.creditAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Công nợ còn lại:</span>
                    <span className="text-orange-600">{invoice.creditAmount.toLocaleString('vi-VN')} ₫</span>
                  </div>
                )}
              </div>

              {/* Payment Info */}
              {invoice.payment && (
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Thông tin thanh toán</h3>
                  <div className="text-sm space-y-1">
                    <p>
                      <span className="text-muted-foreground">Phương thức:</span>{' '}
                      <span className="font-medium">{invoice.payment.paymentMethod}</span>
                    </p>
                    {invoice.payment.transactionId && (
                      <p>
                        <span className="text-muted-foreground">Mã giao dịch:</span>{' '}
                        <span className="font-medium">{invoice.payment.transactionId}</span>
                      </p>
                    )}
                    <p>
                      <span className="text-muted-foreground">Ngày thanh toán:</span>{' '}
                      <span className="font-medium">
                        {new Date(invoice.payment.paymentDate).toLocaleString('vi-VN')}
                      </span>
                    </p>
                    <p>
                      <span className="text-muted-foreground">Số tiền:</span>{' '}
                      <span className="font-medium">{invoice.payment.amount.toLocaleString('vi-VN')} ₫</span>
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Info */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Thông tin đơn hàng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Mã đơn hàng</p>
                  <p className="font-medium">#{invoice.order?.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Trạng thái đơn hàng</p>
                  <p className="font-medium">{invoice.order?.status}</p>
                </div>
                {invoice.order?.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Ghi chú</p>
                    <p className="font-medium">{invoice.order.notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild variant="outline" className="flex items-center gap-2">
              <Link href="/shop">
                <ArrowLeft className="w-4 h-4" />
                Tiếp tục mua sắm
              </Link>
            </Button>
            <Button asChild className="flex items-center gap-2">
              <Link href={`/orders`}>
                <Package className="w-4 h-4" />
                Xem đơn hàng của tôi
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
