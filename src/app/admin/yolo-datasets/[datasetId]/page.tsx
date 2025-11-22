import { Metadata } from 'next';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { DatasetDetailView } from '@/components/admin/yolo-dataset-management';
import { ROUTES } from '@/config/routes';

export const metadata: Metadata = {
  title: 'Chi tiết dataset | GFWMS',
  description: 'Xem thông tin chi tiết dataset',
};

export default async function DatasetDetailPage({
  params,
}: {
  params: Promise<{ datasetId: string }>;
}) {
  const { datasetId } = await params;

  return (
    <ProtectedRoute routeConfig={ROUTES.ADMIN.YOLO_DATASETS.DETAIL}>
      <DatasetDetailView datasetId={datasetId} />
    </ProtectedRoute>
  );
}
