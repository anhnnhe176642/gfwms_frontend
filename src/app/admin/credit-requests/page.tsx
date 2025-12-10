'use client';

import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { CreditRequestTable } from '@/components/admin/credit-request-management';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ROUTES } from '@/config/routes';

export default function CreditRequestsPage() {
  return (
    <ProtectedRoute routeConfig={ROUTES.ADMIN.CREDIT_REQUESTS.LIST}>
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <div className="space-y-1">
              <CardTitle>Quản lý đơn hạn mức</CardTitle>
              <CardDescription>
                Quản lý danh sách lịch sử đơn đăng ký hạn mức của khách hàng
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <CreditRequestTable />
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
