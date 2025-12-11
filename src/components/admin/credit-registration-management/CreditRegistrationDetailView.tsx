'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { creditRegistrationService } from '@/services/creditRegistration.service';
import { getServerErrorMessage } from '@/lib/errorHandler';
import { CreditRegistrationStatusBadge } from '@/components/admin/table/Badges';
import { ArrowLeft, RefreshCw, Lock, LockOpen } from 'lucide-react';
import { useNavigation } from '@/hooks/useNavigation';
import type { CreditRegistration } from '@/types/creditRegistration';

export interface CreditRegistrationDetailViewProps {
  registrationId: string | number;
}

export function CreditRegistrationDetailView({ registrationId }: CreditRegistrationDetailViewProps) {
  const { handleGoBack } = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [registration, setRegistration] = useState<CreditRegistration | null>(null);
  const [error, setError] = useState('');

  // Fetch registration data
  useEffect(() => {
    const fetchRegistration = async () => {
      try {
        setIsLoading(true);
        setError('');
        const data = await creditRegistrationService.getById(registrationId);
        setRegistration(data);
      } catch (err) {
        const message = getServerErrorMessage(err) || 'Không thể tải dữ liệu đăng ký Công nợ';
        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRegistration();
  }, [registrationId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          <p className="text-gray-500">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error || !registration) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <p className="text-red-500 mb-2">{error || 'Không tìm thấy đăng ký Công nợ'}</p>
          <Button onClick={handleGoBack} variant="outline">
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleGoBack}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Chi tiết đăng ký Công nợ</h1>
            <p className="text-muted-foreground mt-1">
              Thông tin chi tiết về đơn đăng ký hạn mức Công nợ
            </p>
          </div>
        </div>
      </div>

      {/* Main Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin chung</CardTitle>
          <CardDescription>Thông tin khách hàng, Công nợ và trạng thái</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* User Information Section */}
          <div>
            <h3 className="font-semibold text-sm mb-4">Thông tin khách hàng</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-2">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Tên người dùng</p>
                <p className="text-sm font-semibold mt-1">{registration.user.username}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Họ tên</p>
                <p className="text-sm font-semibold mt-1">{registration.user.fullname}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs font-medium text-muted-foreground">Email</p>
                <p className="text-sm font-semibold mt-1">{registration.user.email}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Credit Information Section */}
          <div>
            <h3 className="font-semibold text-sm mb-4">Thông tin Công nợ</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ml-2">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Hạn mức</p>
                <p className="text-sm font-semibold mt-1">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(registration.creditLimit)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Đã sử dụng</p>
                <p className="text-sm font-semibold mt-1">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(registration.creditUsed)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Còn lại</p>
                <p className="text-sm font-semibold mt-1">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(registration.creditLimit - registration.creditUsed)}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Status Section */}
          <div>
            <h3 className="font-semibold text-sm mb-4">Trạng thái</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-2">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Trạng thái duyệt</p>
                <div className="mt-2">
                  {registration.status ? (
                    <CreditRegistrationStatusBadge status={registration.status} />
                  ) : (
                    <span className="text-gray-500 text-sm">-</span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Trạng thái khóa</p>
                <div className="mt-2 flex items-center gap-2">
                  {registration.isLocked ? (
                    <>
                      <Lock className="h-4 w-4" />
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                        Khóa
                      </span>
                    </>
                  ) : (
                    <>
                      <LockOpen className="h-4 w-4" />
                      <span className="px-2 py-1 rounded-full text-xs font-medium border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300">
                        Mở
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Note Section */}
          {registration.note && (
            <>
              <Separator />
              <div>
                <p className="text-xs font-medium text-muted-foreground">Ghi chú</p>
                <p className="text-sm mt-2 whitespace-pre-wrap break-words">{registration.note}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Approval & Timeline Card */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin duyệt & thời gian</CardTitle>
          <CardDescription>Người duyệt, ngày duyệt và lịch sử thay đổi</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Approval Section */}
          {registration.approver && (
            <div>
              <h3 className="font-semibold text-sm mb-4">Thông tin duyệt</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-2">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Người duyệt</p>
                  <p className="text-sm font-semibold mt-1">{registration.approver.fullname}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Tên đăng nhập</p>
                  <p className="text-sm font-semibold mt-1">{registration.approver.username}</p>
                </div>
                {registration.approvalDate && (
                  <div className="md:col-span-2">
                    <p className="text-xs font-medium text-muted-foreground">Ngày duyệt</p>
                    <p className="text-sm font-semibold mt-1">
                      {new Date(registration.approvalDate).toLocaleString('vi-VN')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <Separator />

          {/* Timeline Section */}
          <div>
            <h3 className="font-semibold text-sm mb-4">Lịch sử</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-2">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Ngày tạo</p>
                <p className="text-sm font-semibold mt-1">
                  {new Date(registration.createdAt).toLocaleString('vi-VN')}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Ngày cập nhật</p>
                <p className="text-sm font-semibold mt-1">
                  {new Date(registration.updatedAt).toLocaleString('vi-VN')}
                </p>
              </div>
            </div>
          </div>

          {/* IDs Section */}
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground">ID Đăng ký</p>
              <p className="text-xs font-mono mt-1">{registration.id}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">ID Người dùng</p>
              <p className="text-xs font-mono mt-1">{registration.userId}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-end pb-8">
        <Button variant="outline" onClick={handleGoBack}>
          Quay lại
        </Button>
      </div>
    </div>
  );
}

export default CreditRegistrationDetailView;
