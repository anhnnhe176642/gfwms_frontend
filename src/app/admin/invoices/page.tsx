import { Metadata } from 'next';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { InvoiceListTable } from '@/components/admin/invoice-management';
import { ROUTES } from '@/config/routes';

export const metadata: Metadata = {
  title: 'Quản lý hóa đơn | GFWMS',
  description: 'Danh sách hóa đơn',
};

export default function InvoicesPage() {
  return (
    <ProtectedRoute routeConfig={ROUTES.ADMIN.INVOICES.LIST}>
      <div className="container mx-auto py-8 px-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý hóa đơn</h1>
          <p className="text-muted-foreground mt-1">
            Xem và quản lý các hóa đơn trong hệ thống
          </p>
        </div>

        <InvoiceListTable />
      </div>
    </ProtectedRoute>
  );
}
