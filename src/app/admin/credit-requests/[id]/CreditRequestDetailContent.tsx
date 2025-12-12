'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { CreditRequestStatusBadge, CreditRequestTypeBadge } from '@/components/admin/table/Badges';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { creditRequestService } from '@/services/creditRequest.service';
import { getServerErrorMessage } from '@/lib/errorHandler';
import { ROUTES } from '@/config/routes';
import type { CreditRequest } from '@/types/creditRequest';
import { ArrowLeft, Check, X, Loader2 } from 'lucide-react';

interface CreditRequestDetailContentProps {
  id: string;
}

export function CreditRequestDetailContent({ id }: CreditRequestDetailContentProps) {
  const router = useRouter();
  const [request, setRequest] = useState<CreditRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    requestLimit: '',
    note: '',
  });

  // Fetch credit request detail
  useEffect(() => {
    const fetchRequest = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await creditRequestService.getRequestById(Number(id));
        setRequest(data);
      } catch (err) {
        const message = getServerErrorMessage(err) || 'Không thể lấy thông tin đơn hạn mức';
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [id]);

  const handleApproveClick = () => {
    setFormData({
      requestLimit: request?.requestLimit.toString() || '',
      note: '',
    });
    setActionType('approve');
    setActionDialogOpen(true);
  };

  const handleRejectClick = () => {
    setFormData({
      requestLimit: '',
      note: '',
    });
    setActionType('reject');
    setActionDialogOpen(true);
  };

  const confirmApprove = async () => {
    if (!request) return;

    setActionLoading(true);
    try {
      await creditRequestService.approveCreditRequest({
        requestId: request.id,
        status: 'APPROVED',
        ...(formData.requestLimit && { requestLimit: Number(formData.requestLimit) }),
        ...(formData.note && { note: formData.note }),
      });
      toast.success('Phê duyệt đơn hạn mức thành công');
      setActionDialogOpen(false);
      router.push(ROUTES.ADMIN.CREDIT_REQUESTS.LIST.path);
    } catch (err) {
      const message = getServerErrorMessage(err) || 'Không thể phê duyệt đơn hạn mức';
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  const confirmReject = async () => {
    if (!request) return;

    setActionLoading(true);
    try {
      await creditRequestService.rejectCreditRequest({
        requestId: request.id,
        status: 'REJECTED',
        ...(formData.note && { note: formData.note }),
      });
      toast.success('Từ chối đơn hạn mức thành công');
      setActionDialogOpen(false);
      router.push(ROUTES.ADMIN.CREDIT_REQUESTS.LIST.path);
    } catch (err) {
      const message = getServerErrorMessage(err) || 'Không thể từ chối đơn hạn mức';
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute routeConfig={ROUTES.ADMIN.CREDIT_REQUESTS.DETAIL}>
        <div className="container mx-auto py-8 px-4">
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              <p className="text-gray-500">Đang tải...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !request) {
    return (
      <ProtectedRoute routeConfig={ROUTES.ADMIN.CREDIT_REQUESTS.DETAIL}>
        <div className="container mx-auto py-8 px-4">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <p className="text-red-500 mb-2">{error || 'Không tìm thấy đơn hạn mức'}</p>
              <Button onClick={() => router.push(ROUTES.ADMIN.CREDIT_REQUESTS.LIST.path)} variant="outline">
                Quay lại
              </Button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const isPending = request.status === 'PENDING';

  return (
    <ProtectedRoute routeConfig={ROUTES.ADMIN.CREDIT_REQUESTS.DETAIL}>
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(ROUTES.ADMIN.CREDIT_REQUESTS.LIST.path)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Chi tiết đơn hạn mức #{request.id}</h1>
              <p className="text-muted-foreground">Xem và quản lý thông tin đơn hạn mức</p>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left side - Main info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Request Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>Thông tin đơn hạn mức</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Loại yêu cầu</label>
                    <div className="mt-2">
                      <CreditRequestTypeBadge type={request.type} />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Trạng thái</label>
                    <div className="mt-2">
                      <CreditRequestStatusBadge status={request.status} />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <label className="text-sm font-medium text-muted-foreground">Hạn mức mong muốn</label>
                  <p className="text-2xl font-bold text-green-600 mt-2">
                    {request.requestLimit.toLocaleString('vi-VN')} VND
                  </p>
                </div>

                {request.note && (
                  <div className="border-t pt-6">
                    <label className="text-sm font-medium text-muted-foreground">Ghi chú</label>
                    <p className="mt-2 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {request.note}
                    </p>
                  </div>
                )}

                <div className="border-t pt-6 grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Ngày tạo</label>
                    <p className="mt-2">{new Date(request.createdAt).toLocaleString('vi-VN')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Cập nhật lần cuối</label>
                    <p className="mt-2">{new Date(request.updatedAt).toLocaleString('vi-VN')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* User Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>Thông tin người dùng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Tên người dùng</label>
                    <p className="mt-2 font-medium">{request.user.username}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Họ và tên</label>
                    <p className="mt-2">{request.user.fullname || '-'}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="mt-2">{request.user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">ID</label>
                  <p className="mt-2 font-mono text-sm text-gray-500">{request.user.id}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right side - Actions */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Hành động</CardTitle>
                <CardDescription>
                  {isPending
                    ? 'Phê duyệt hoặc từ chối đơn hạn mức này'
                    : `Đơn đã ${request.status === 'APPROVED' ? 'phê duyệt' : 'từ chối'}`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {isPending ? (
                  <>
                    <Button
                      className="w-full gap-2 bg-green-600 hover:bg-green-700"
                      onClick={handleApproveClick}
                      disabled={actionLoading}
                    >
                      <Check className="h-4 w-4" />
                      Phê duyệt
                    </Button>
                    <Button
                      className="w-full gap-2"
                      variant="destructive"
                      onClick={handleRejectClick}
                      disabled={actionLoading}
                    >
                      <X className="h-4 w-4" />
                      Từ chối
                    </Button>
                  </>
                ) : (
                  <Button className="w-full" variant="outline" disabled>
                    Không thể thay đổi trạng thái
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action confirmation dialog */}
        <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {actionType === 'approve' ? 'Phê duyệt đơn hạn mức' : 'Từ chối đơn hạn mức'}
              </DialogTitle>
              <DialogDescription>
                {actionType === 'approve'
                  ? `Phê duyệt đơn hạn mức cho ${request.user.username}`
                  : `Từ chối đơn hạn mức của ${request.user.username}`}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {actionType === 'approve' && (
                <div>
                  <label className="text-sm font-medium">Hạn mức (VND)</label>
                  <Input
                    type="number"
                    value={formData.requestLimit}
                    onChange={(e) => setFormData({ ...formData, requestLimit: e.target.value })}
                    placeholder={request.requestLimit.toString()}
                    disabled={actionLoading}
                    min="0"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Để trống để giữ Hạn mức mong muốn: {request.requestLimit.toLocaleString('vi-VN')} VND
                  </p>
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium">Ghi chú</label>
                <Textarea
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  placeholder="Nhập ghi chú (tuỳ chọn)..."
                  disabled={actionLoading}
                  rows={3}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setActionDialogOpen(false)}
                disabled={actionLoading}
              >
                Hủy
              </Button>
              <Button
                variant={actionType === 'approve' ? 'default' : 'destructive'}
                onClick={actionType === 'approve' ? confirmApprove : confirmReject}
                disabled={actionLoading}
              >
                {actionLoading
                  ? actionType === 'approve'
                    ? 'Đang phê duyệt...'
                    : 'Đang từ chối...'
                  : actionType === 'approve'
                    ? 'Phê duyệt'
                    : 'Từ chối'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}
