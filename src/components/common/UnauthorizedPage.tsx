'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';

export type UnauthorizedPageProps = {
  title?: string;
  message?: string;
  showBackButton?: boolean;
  showHomeButton?: boolean;
  requiredPermission?: string;
};

/**
 * Component hiển thị trang "Không có quyền truy cập"
 */
export function UnauthorizedPage({
  title = 'Không có quyền truy cập',
  message = 'Bạn không có quyền truy cập trang này. Vui lòng liên hệ quản trị viên để được cấp quyền.',
  showBackButton = true,
  showHomeButton = true,
  requiredPermission,
}: UnauthorizedPageProps) {
  const router = useRouter();

  return (
    <div className="fixed inset-0 w-full h-full flex items-center justify-center p-4 bg-linear-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 z-50">
      <Card className="max-w-2xl w-full shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-6 shadow-lg">
              <ShieldAlert className="h-16 w-16 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">{title}</CardTitle>
          <CardDescription className="text-base mt-2">
            Trang này yêu cầu quyền truy cập đặc biệt
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="p-4 border border-destructive/50 bg-destructive/10 rounded-md">
            <div className="flex gap-3">
              <ShieldAlert className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-destructive mb-1">Truy cập bị từ chối</p>
                <p className="text-sm text-destructive/90">
                  {message}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            {showBackButton && (
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="flex-1"
                size="lg"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
              </Button>
            )}
            {showHomeButton && (
              <Button
                onClick={() => router.push('/admin/dashboard')}
                className="flex-1"
                size="lg"
              >
                <Home className="h-4 w-4 mr-2" />
                Về trang chủ
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default UnauthorizedPage;

