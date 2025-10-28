'use client';

import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { UserManagementTable } from '@/components/admin/UserManagementTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ROUTES } from '@/config/routes';

export default function UsersPage() {
  return (
    <ProtectedRoute routeConfig={ROUTES.ADMIN.USERS.LIST}>
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Quản lý người dùng</CardTitle>
            <CardDescription>
              Quản lý tài khoản người dùng trong hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UserManagementTable />
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
