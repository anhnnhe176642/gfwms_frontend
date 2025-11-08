'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { fabricGlossService } from '@/services/fabricGloss.service';
import { getServerErrorMessage } from '@/lib/errorHandler';
import { ArrowLeft, RefreshCw, Edit } from 'lucide-react';
import { useNavigation } from '@/hooks/useNavigation';
import type { FabricGlossListItem } from '@/types/fabricGloss';

export interface FabricGlossDetailViewProps {
  glossId: string | number;
  onEdit?: (glossId: number) => void;
}

export function FabricGlossDetailView({ glossId, onEdit }: FabricGlossDetailViewProps) {
  const router = useRouter();
  const { handleGoBack } = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [gloss, setGloss] = useState<FabricGlossListItem | null>(null);
  const [error, setError] = useState('');

  // Fetch gloss data
  useEffect(() => {
    const fetchGloss = async () => {
      try {
        setIsLoading(true);
        setError('');
        const data = await fabricGlossService.getFabricGlossById(glossId);
        setGloss(data);
      } catch (err) {
        const message = getServerErrorMessage(err) || 'Không thể tải dữ liệu độ bóng';
        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGloss();
  }, [glossId]);


  const handleEdit = () => {
    if (onEdit && gloss) {
      onEdit(gloss.id);
    } else if (gloss) {
      router.push(`/admin/fabrics/gloss/${gloss.id}/edit`);
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

  if (error || !gloss) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <p className="text-red-500 mb-2">{error || 'Không tìm thấy độ bóng'}</p>
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
            <h1 className="text-3xl font-bold tracking-tight">Chi tiết độ bóng</h1>
            <p className="text-muted-foreground mt-1">
              Thông tin chi tiết về độ bóng
            </p>
          </div>
        </div>
        <Button onClick={handleEdit} className="gap-2">
          <Edit className="h-4 w-4" />
          Chỉnh sửa
        </Button>
      </div>

      {/* Gloss Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin độ bóng</CardTitle>
          <CardDescription>Thông tin cơ bản của độ bóng</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Description */}
          <div>
            <p className="text-sm font-medium text-muted-foreground">Mô tả độ bóng</p>
            <p className="text-base font-semibold">{gloss.description}</p>
          </div>

          {/* ID */}
          <Separator />
          <div>
            <p className="text-sm font-medium text-muted-foreground">ID</p>
            <p className="text-base font-mono">{gloss.id}</p>
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
              {new Date(gloss.createdAt).toLocaleString('vi-VN')}
            </p>
          </div>

          {/* Updated At */}
          <Separator />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Ngày cập nhật lần cuối</p>
            <p className="text-base font-semibold">
              {new Date(gloss.updatedAt).toLocaleString('vi-VN')}
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
          Chỉnh sửa độ bóng
        </Button>
      </div>
    </div>
  );
}

export default FabricGlossDetailView;
