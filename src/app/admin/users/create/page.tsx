import { Metadata } from 'next';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { CreateUserForm } from '@/components/admin/user-management/CreateUserForm';
import { ROUTES } from '@/config/routes';

export const metadata: Metadata = {
  title: 'Tạo người dùng mới | GFWMS',
  description: 'Tạo một tài khoản người dùng mới trong hệ thống',
};

export default function CreateUserPage() {
  return (
    <ProtectedRoute routeConfig={ROUTES.ADMIN.USERS.CREATE}>
      <CreateUserForm />
    </ProtectedRoute>
  );
}
