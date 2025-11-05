'use client';

import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { RoleManagementTable } from '@/components/admin/role-management';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/config/routes';
import { useRouteAccess } from '@/hooks/useRouteAccess';
import { Plus } from 'lucide-react';

export default function RolesPage() {
  const router = useRouter();
  const { canAccess } = useRouteAccess();

  const handleCreateRole = () => {
    router.push('/admin/roles/create');
  };

  return (
    <ProtectedRoute routeConfig={ROUTES.ADMIN.ROLES.LIST}>
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="space-y-1">
              <CardTitle>Quản lý vai trò</CardTitle>
              <CardDescription>
                Quản lý vai trò và quyền hạn trong hệ thống
              </CardDescription>
            </div>
            {canAccess(ROUTES.ADMIN.ROLES.CREATE) && (
              <Button onClick={handleCreateRole} className="gap-2">
                <Plus className="h-4 w-4" />
                Tạo vai trò
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <RoleManagementTable />
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
