'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { fabricColorService } from '@/services/fabricColor.service';
import { getServerErrorMessage } from '@/lib/errorHandler';
import { ArrowLeft, RefreshCw, Edit } from 'lucide-react';
import { useNavigation } from '@/hooks/useNavigation';
import type { FabricColorListItem } from '@/types/fabricColor';

export interface FabricColorDetailViewProps {
  colorId: string;
  onEdit?: (colorId: string) => void;
}

export function FabricColorDetailView({ colorId, onEdit }: FabricColorDetailViewProps) {
  const router = useRouter();
  const { handleGoBack } = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [color, setColor] = useState<FabricColorListItem | null>(null);
  const [error, setError] = useState('');

  // Fetch color data
  useEffect(() => {
    const fetchColor = async () => {
      try {
        setIsLoading(true);
        setError('');
        const data = await fabricColorService.getFabricColorById(colorId);
        setColor(data);
      } catch (err) {
        const message = getServerErrorMessage(err) || 'Không thể tải dữ liệu màu vải';
        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchColor();
  }, [colorId]);


  const handleEdit = () => {
    if (onEdit) {
      onEdit(colorId);
    } else {
      router.push(`/admin/fabrics/colors/${colorId}/edit`);
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

  if (error || !color) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <p className="text-red-500 mb-2">{error || 'Không tìm thấy màu vải'}</p>
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
            <h1 className="text-3xl font-bold tracking-tight">{color.name}</h1>
            <p className="text-muted-foreground mt-1">
              Chi tiết màu vải
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
          <CardDescription>Thông tin chung của màu vải</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Name */}
          <div>
            <p className="text-sm font-medium text-muted-foreground">Tên màu vải</p>
            <p className="text-base font-semibold">{color.name}</p>
          </div>

          {/* ID */}
          <Separator />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Mã màu vải</p>
            <p className="text-base font-mono">{color.id}</p>
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
              {new Date(color.createdAt).toLocaleString('vi-VN')}
            </p>
          </div>

          {/* Updated At */}
          <Separator />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Ngày cập nhật lần cuối</p>
            <p className="text-base font-semibold">
              {new Date(color.updatedAt).toLocaleString('vi-VN')}
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
          Chỉnh sửa màu vải
        </Button>
      </div>
    </div>
  );
}

export default FabricColorDetailView;
