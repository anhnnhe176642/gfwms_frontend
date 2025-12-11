'use client';

import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { AdjustFabricHistoryTable } from '@/components/admin/warehouse-management/AdjustFabricHistoryTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ROUTES } from '@/config/routes';

export default function AdjustFabricHistoryPage() {
  return (
    <ProtectedRoute routeConfig={ROUTES.ADMIN.WAREHOUSES.ADJUST_FABRIC_HISTORY}>
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Lịch sử điều chỉnh vải</CardTitle>
            <CardDescription>
              Danh sách lịch sử điều chỉnh số lượng vải trên kệ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AdjustFabricHistoryTable />
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
