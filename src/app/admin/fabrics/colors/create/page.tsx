import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { CreateFabricColorForm } from '@/components/admin/fabric-color-management';
import { ROUTES } from '@/config/routes';

export const metadata = {
  title: 'Tạo màu vải | GFWMS',
  description: 'Tạo màu vải mới trong hệ thống',
};

export default function CreateFabricColorPage() {
  return (
    <ProtectedRoute routeConfig={ROUTES.ADMIN.FABRICS.COLORS}>
      <CreateFabricColorForm />
    </ProtectedRoute>
  );
}
