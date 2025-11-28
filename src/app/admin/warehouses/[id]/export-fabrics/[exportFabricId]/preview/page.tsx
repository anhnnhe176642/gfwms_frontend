import { notFound } from 'next/navigation';
import { ExportFabricPreviewDetail } from '@/components/admin/store-management/ExportFabricDetail/ExportFabricPreviewDetail';

interface PageProps {
  params: Promise<{
    id: string;
    exportFabricId: string;
  }>;
}

export default async function ExportFabricPreviewPage({ params }: PageProps) {
  const { id: warehouseId, exportFabricId } = await params;

  if (!warehouseId || !exportFabricId) {
    return notFound();
  }

  return (
    <div className="p-4">
      <ExportFabricPreviewDetail warehouseId={warehouseId} exportFabricId={exportFabricId} />
    </div>
  );
}
