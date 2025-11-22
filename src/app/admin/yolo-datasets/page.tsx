'use client';

import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { DatasetManagementTable } from '@/components/admin/yolo-dataset-management';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/config/routes';
import { useRouteAccess } from '@/hooks/useRouteAccess';
import { Plus } from 'lucide-react';

export default function YoloDatasetPage() {
  const router = useRouter();
  const { canAccess } = useRouteAccess();

  const handleCreateDataset = () => {
    router.push('/admin/yolo-datasets/create');
  };

  return (
    <ProtectedRoute routeConfig={ROUTES.ADMIN.YOLO_DATASETS.LIST}>
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="space-y-1">
              <CardTitle>Quản lý Dataset YOLO</CardTitle>
              <CardDescription>
                Quản lý các dataset YOLO để huấn luyện mô hình phát hiện vải
              </CardDescription>
            </div>
            {canAccess(ROUTES.ADMIN.YOLO_DATASETS.CREATE) && (
              <Button onClick={handleCreateDataset} className="gap-2">
                <Plus className="h-4 w-4" />
                Tạo dataset mới
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <DatasetManagementTable initialParams={{
              page: 1,
              limit: 10,
            }} />
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
