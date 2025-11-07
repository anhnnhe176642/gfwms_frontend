"use client";

import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { FabricColorDetailView } from "@/components/admin/fabric-color-management";
import { ROUTES } from "@/config/routes";
import { useParams } from "next/navigation";

export default function FabricColorDetailPage() {
  const params = useParams();
  const colorId = params?.id as string;

  return (
    <ProtectedRoute routeConfig={ROUTES.ADMIN.FABRICS.COLORS}>
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <FabricColorDetailView colorId={colorId} />
      </div>
    </ProtectedRoute>
  );
}
