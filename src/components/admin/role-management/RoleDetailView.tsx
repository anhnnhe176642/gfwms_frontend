'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Loader, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouteAccess } from '@/hooks/useRouteAccess';
import { useNavigation } from '@/hooks/useNavigation';
import { roleService } from '@/services/role.service';
import { getServerErrorMessage } from '@/lib/errorHandler';
import { ROUTES } from '@/config/routes';
import { PermissionTree } from './PermissionTree';
import type { RoleDetail } from '@/types/role';

export type RoleDetailViewProps = {
  roleName: string;
};

export function RoleDetailView({ roleName }: RoleDetailViewProps) {
  const router = useRouter();
  const { canAccess } = useRouteAccess();
  const { handleGoBack } = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [serverError, setServerError] = useState('');
  const [roleDetail, setRoleDetail] = useState<RoleDetail | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  // Fetch role details khi component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const roleResponse = await roleService.getRoleDetail(roleName);
        setRoleDetail(roleResponse.data);

        // Lấy danh sách permission keys từ rolePermissions
        const permissionKeys = roleResponse.data.rolePermissions?.map(rp => rp.permission.key) || [];
        setSelectedPermissions(permissionKeys);
      } catch (err) {
        const message = getServerErrorMessage(err);
        setServerError(message || 'Không thể tải dữ liệu');
        toast.error(message || 'Không thể tải dữ liệu');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [roleName]);


  const handleEdit = () => {
    router.push(`/admin/roles/${roleName}/edit`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-2">
          <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (serverError || !roleDetail) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleGoBack}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Chi tiết vai trò</h1>
          </div>
        </div>

        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md">
          {serverError || 'Không tìm thấy vai trò'}
        </div>

        <Button onClick={handleGoBack} variant="outline">
          Quay lại
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleGoBack}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{roleDetail.name}</h1>
            <p className="text-muted-foreground mt-1">
              Chi tiết vai trò và quyền hạn
            </p>
          </div>
        </div>
        {canAccess(ROUTES.ADMIN.ROLES.EDIT) && (
          <Button onClick={handleEdit} className="gap-2">
            <Edit className="h-4 w-4" />
            Chỉnh sửa
          </Button>
        )}
      </div>

      {/* Basic Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin vai trò</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Name */}
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Tên vai trò</p>
            <p className="text-base font-semibold">{roleDetail.name}</p>
          </div>

          {/* Full Name */}
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Tên đầy đủ</p>
            <p className="text-base font-semibold">{roleDetail.fullName}</p>
          </div>

          {/* Description */}
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Mô tả</p>
            <p className="text-base">
              {roleDetail.description || <span className="text-muted-foreground italic">Chưa có mô tả</span>}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Permissions Card */}
      <PermissionTree
        selectedPermissions={selectedPermissions}
        isFetching={false}
        onTogglePermission={() => {}} // Read-only mode, no toggle allowed
      />

      {/* Action Buttons */}
      <div className="flex gap-4 justify-end pb-8">
        <Button variant="outline" onClick={handleGoBack}>
          Quay lại
        </Button>
        {canAccess(ROUTES.ADMIN.ROLES.EDIT) && (
          <Button onClick={handleEdit} className="gap-2">
            <Edit className="h-4 w-4" />
            Chỉnh sửa vai trò
          </Button>
        )}
      </div>
    </div>
  );
}

export default RoleDetailView;
