import { Metadata } from 'next';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { CreateDatasetForm } from '@/components/admin/yolo-dataset-management';
import { ROUTES } from '@/config/routes';

export const metadata: Metadata = {
  title: 'Tạo Dataset YOLO mới | GFWMS',
  description: 'Tạo một dataset YOLO mới để huấn luyện mô hình',
};

export default function CreateDatasetPage() {
  return (
    <ProtectedRoute routeConfig={ROUTES.ADMIN.YOLO_DATASETS.CREATE}>
      <CreateDatasetForm />
    </ProtectedRoute>
  );
}
