import { EditRoleForm } from '@/components/admin/role-management/EditRoleForm';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { ROUTES } from '@/config/routes';

export const metadata = {
  title: 'Cập nhật vai trò | GFWMS',
  description: 'Cập nhật thông tin và quyền của vai trò',
};

type EditRolePageProps = {
  params: Promise<{
    name: string;
  }>;
};

export default async function EditRolePage({ params }: EditRolePageProps) {
  const { name } = await params;

  return (
    <ProtectedRoute routeConfig={ROUTES.ADMIN.ROLES.EDIT}>
      <EditRoleForm roleId={name} />
    </ProtectedRoute>
  );
}
