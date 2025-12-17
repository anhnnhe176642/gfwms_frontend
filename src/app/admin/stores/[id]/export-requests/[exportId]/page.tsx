'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { ROUTES } from '@/config/routes';
import { ExportFabricDetailView } from '@/components/admin/store-management/ExportFabricDetail/ExportFabricDetailView';

export default function StoreExportRequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const storeId = params.id as string;
  const exportId = params.exportId as string;

  const handleGoBack = () => {
    router.push(`/admin/stores/${storeId}/export-requests`);
  };

  return (
    <ProtectedRoute routeConfig={ROUTES.ADMIN.STORES.LIST}>
      <div className="max-w-4xl mx-auto space-y-6 pt-5">
        {/* Export Fabric Detail */}
        <ExportFabricDetailView
          warehouseId={0}
          exportFabricId={exportId}
        />
      </div>
    </ProtectedRoute>
  );
}
