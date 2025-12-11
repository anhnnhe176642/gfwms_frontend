import { Suspense } from "react";
import { CreditRegistrationTable } from "@/components/admin/credit-registration-management";
import { IsLoading } from "@/components/common";

export const metadata = {
  title: "Quản lý Công nợ - Đã Đăng ký",
  description: "Danh sách các đơn đăng ký Công nợ đã được phê duyệt",
};

export default function CreditsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Quản lý Công nợ - Đã Đăng ký
          </h1>
          <p className="text-muted-foreground mt-1">
            Danh sách các đơn đăng ký Công nợ đã được phê duyệt
          </p>
        </div>

        <Suspense fallback={<IsLoading />}>
          <CreditRegistrationTable />
        </Suspense>
      </div>
    </div>
  );
}
