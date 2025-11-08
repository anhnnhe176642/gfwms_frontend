'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { supplierService } from '@/services/supplier.service';
import { getServerErrorMessage } from '@/lib/errorHandler';
import { ArrowLeft, RefreshCw, Edit } from 'lucide-react';
import { useNavigation } from '@/hooks/useNavigation';
import type { SupplierListItem } from '@/types/supplier';

export interface SupplierDetailViewProps {
  supplierId: string | number;
  onEdit?: (supplierId: number) => void;
}

export function SupplierDetailView({ supplierId, onEdit }: SupplierDetailViewProps) {
  const router = useRouter();
  const { handleGoBack } = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [supplier, setSupplier] = useState<SupplierListItem | null>(null);
  const [error, setError] = useState('');

  // Fetch supplier data
  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        setIsLoading(true);
        setError('');
        const data = await supplierService.getSupplierById(supplierId);
        setSupplier(data);
      } catch (err) {
        const message = getServerErrorMessage(err) || 'Không thể tải dữ liệu nhà cung cấp';
        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSupplier();
  }, [supplierId]);


  const handleEdit = () => {
    const numId = typeof supplierId === 'string' ? parseInt(supplierId, 10) : supplierId;
    if (onEdit) {
      onEdit(numId);
    } else {
      router.push(`/admin/fabrics/suppliers/${supplierId}/edit`);
    }
  };

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

  if (error || !supplier) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <p className="text-red-500 mb-2">{error || 'Không tìm thấy nhà cung cấp'}</p>
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
            <h1 className="text-3xl font-bold tracking-tight">{supplier.name}</h1>
            <p className="text-muted-foreground mt-1">
              Chi tiết nhà cung cấp
            </p>
          </div>
        </div>
        <Button onClick={handleEdit} className="gap-2">
          <Edit className="h-4 w-4" />
          Chỉnh sửa
        </Button>
      </div>

      {/* Basic Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin cơ bản</CardTitle>
          <CardDescription>Thông tin chung của nhà cung cấp</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Name */}
          <div>
            <p className="text-sm font-medium text-muted-foreground">Tên nhà cung cấp</p>
            <p className="text-base font-semibold">{supplier.name}</p>
          </div>

          {/* Address */}
          <Separator />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Địa chỉ</p>
            <p className="text-base">{supplier.address}</p>
          </div>

          {/* Phone */}
          <Separator />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Số điện thoại</p>
            <p className="text-base font-mono">{supplier.phone}</p>
          </div>

          {/* Is Active */}
          <Separator />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Trạng thái</p>
            <span
              className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                supplier.isActive 
                  ? "bg-green-100 text-green-700" 
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {supplier.isActive ? "Hoạt động" : "Ngừng hoạt động"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Timeline Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin thời gian</CardTitle>
          <CardDescription>Ngày tạo và cập nhật</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Created At */}
          <div>
            <p className="text-sm font-medium text-muted-foreground">Ngày tạo</p>
            <p className="text-base font-semibold">
              {new Date(supplier.createdAt).toLocaleString('vi-VN')}
            </p>
          </div>

          {/* Updated At */}
          <Separator />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Ngày cập nhật lần cuối</p>
            <p className="text-base font-semibold">
              {new Date(supplier.updatedAt).toLocaleString('vi-VN')}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-end pb-8">
        <Button variant="outline" onClick={handleGoBack}>
          Quay lại
        </Button>
        <Button onClick={handleEdit} className="gap-2">
          <Edit className="h-4 w-4" />
          Chỉnh sửa nhà cung cấp
        </Button>
      </div>
    </div>
  );
}

export default SupplierDetailView;
