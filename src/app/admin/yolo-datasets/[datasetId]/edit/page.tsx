import { Metadata } from 'next';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { UpdateDatasetForm } from '@/components/admin/yolo-dataset-management/UpdateDatasetForm';
import { PERMISSIONS } from '@/constants/permissions';

export const metadata: Metadata = {
  title: 'Chỉnh sửa Dataset YOLO',
  description: 'Cập nhật thông tin dataset YOLO',
};

export default function EditDatasetPage() {
  return (
    <ProtectedRoute requiredPermission={PERMISSIONS.YOLO.MANAGE_DATASET.key}>
      <UpdateDatasetForm />
    </ProtectedRoute>
  );
}
