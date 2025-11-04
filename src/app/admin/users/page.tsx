'use client';

import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { UserManagementTable } from '@/components/admin/UserManagementTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/config/routes';
import { useRouteAccess } from '@/hooks/useRouteAccess';
import { Plus } from 'lucide-react';

export default function UsersPage() {
  const router = useRouter();
  const { canAccess } = useRouteAccess();

  const handleCreateUser = () => {
    router.push('/admin/users/create');
  };

  return (
    <ProtectedRoute routeConfig={ROUTES.ADMIN.USERS.LIST}>
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="space-y-1">
              <CardTitle>Quản lý người dùng</CardTitle>
              <CardDescription>
                Quản lý tài khoản người dùng trong hệ thống
              </CardDescription>
            </div>
            {canAccess(ROUTES.ADMIN.USERS.CREATE) && (
              <Button onClick={handleCreateUser} className="gap-2">
                <Plus className="h-4 w-4" />
                Tạo người dùng
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <UserManagementTable />
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
