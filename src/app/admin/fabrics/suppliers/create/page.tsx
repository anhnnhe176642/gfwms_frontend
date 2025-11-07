import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { CreateSupplierForm } from '@/components/admin/supplier-management';
import { ROUTES } from '@/config/routes';

export const metadata = {
  title: 'Tạo nhà cung cấp | GFWMS',
  description: 'Tạo nhà cung cấp mới trong hệ thống',
};

export default function CreateSupplierPage() {
  return (
    <ProtectedRoute routeConfig={ROUTES.ADMIN.FABRICS.SUPPLIERS}>
      <div className="container mx-auto py-8 px-4">
        <CreateSupplierForm />
      </div>
    </ProtectedRoute>
  );
}
