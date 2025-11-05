import { CreateRoleForm } from '@/components/admin/role-management/CreateRoleForm';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { ROUTES } from '@/config/routes';

export const metadata = {
  title: 'Tạo vai trò mới | GFWMS',
  description: 'Tạo một vai trò mới trong hệ thống quản lý kho',
};

export default function CreateRolePage() {
  return (
    <ProtectedRoute routeConfig={ROUTES.ADMIN.ROLES.CREATE}>
      <CreateRoleForm />
    </ProtectedRoute>
  );
}
