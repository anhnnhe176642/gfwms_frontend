'use client';

import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { EditFabricColorForm } from '@/components/admin/fabric-color-management';
import { ROUTES } from '@/config/routes';
import { useParams } from 'next/navigation';

export default function EditFabricColorPage() {
  const params = useParams();
  const colorId = params?.id as string;

  return (
    <ProtectedRoute routeConfig={ROUTES.ADMIN.FABRICS.COLORS}>
      <EditFabricColorForm colorId={colorId} />
    </ProtectedRoute>
  );
}
