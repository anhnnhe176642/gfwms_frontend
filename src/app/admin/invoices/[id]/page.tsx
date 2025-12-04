import { Metadata } from 'next';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { InvoiceDetailView } from '@/components/admin/invoice-management';
import { ROUTES } from '@/config/routes';

export const metadata: Metadata = {
  title: 'Chi tiết hóa đơn | GFWMS',
  description: 'Xem thông tin chi tiết hóa đơn',
};

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <ProtectedRoute routeConfig={ROUTES.ADMIN.INVOICES.DETAIL}>
      <InvoiceDetailView invoiceId={id} />
    </ProtectedRoute>
  );
}
