import { RoleDetailView } from '@/components/admin/role-management/RoleDetailView';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { ROUTES } from '@/config/routes';

export const metadata = {
  title: 'Chi tiết vai trò | GFWMS',
  description: 'Xem chi tiết và quyền hạn của vai trò',
};

type RoleDetailPageProps = {
  params: Promise<{
    name: string;
  }>;
};

export default async function RoleDetailPage({ params }: RoleDetailPageProps) {
  const { name } = await params;

  return (
    <ProtectedRoute routeConfig={ROUTES.ADMIN.ROLES.DETAIL}>
      <RoleDetailView roleName={name} />
    </ProtectedRoute>
  );
}
