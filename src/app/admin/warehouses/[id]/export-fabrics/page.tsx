import { notFound } from "next/navigation";
import { ExportFabricListTable } from "@/components/admin/store-management/ExportFabricListTable";

interface PageProps {
  params: { id: string };
  searchParams: Record<string, string | string[]>;
}

export default async function WarehouseExportFabricsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: warehouseId } = await params;
  if (!warehouseId) return notFound();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Danh sách phiếu xuất vải của kho</h1>
      <ExportFabricListTable initialParams={{ warehouseId }} hideWarehouseColumn={true} warehouseId={warehouseId} />
    </div>
  );
}
