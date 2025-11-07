'use client';

import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { FabricGlossManagementTable } from '@/components/admin/fabric-gloss-management';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/config/routes';
import { useRouteAccess } from '@/hooks/useRouteAccess';
import { Plus } from 'lucide-react';

export default function FabricGlossesPage() {
  const router = useRouter();
  const { canAccess } = useRouteAccess();

  const handleCreateGloss = () => {
    router.push('/admin/fabrics/gloss/create');
  };

  return (
    <ProtectedRoute routeConfig={ROUTES.ADMIN.FABRICS.GLOSS}>
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="space-y-1">
              <CardTitle>Quản lý độ bóng</CardTitle>
              <CardDescription>
                Quản lý thông tin độ bóng của vải
              </CardDescription>
            </div>
            {canAccess(ROUTES.ADMIN.FABRICS.GLOSS_CREATE) && (
              <Button onClick={handleCreateGloss} className="gap-2">
                <Plus className="h-4 w-4" />
                Tạo độ bóng mới
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <FabricGlossManagementTable initialParams={{
              page: 1,
              limit: 10,
            }} />
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
