'use client';

import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { ModelManagementTable } from '@/components/admin/yolo-model-management';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ROUTES } from '@/config/routes';

export default function YoloModelsPage() {
  const router = useRouter();

  return (
    <ProtectedRoute routeConfig={ROUTES.ADMIN.YOLO_MODELS.LIST}>
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="space-y-1">
              <CardTitle>Quản lý Model YOLO</CardTitle>
              <CardDescription>
                Quản lý các mô hình YOLO được huấn luyện từ dataset
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <ModelManagementTable initialParams={{
              page: 1,
              limit: 10,
            }} />
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
