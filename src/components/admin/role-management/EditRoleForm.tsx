'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useFormValidation } from '@/hooks/useFormValidation';
import { updateRoleSchema, type UpdateRoleFormData } from '@/schemas/role.schema';
import { roleService } from '@/services/role.service';
import { extractFieldErrors, getServerErrorMessage } from '@/lib/errorHandler';
import { PermissionsSection } from './PermissionsSection';
import type { Permission, RoleDetail } from '@/types/role';

type PermissionGroup = {
  group: string;
  permissions: Permission[];
};

export type EditRoleFormProps = {
  roleId: number | string;
};

export function EditRoleForm({ roleId }: EditRoleFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [serverError, setServerError] = useState('');
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>([]);
  const [roleDetail, setRoleDetail] = useState<RoleDetail | null>(null);

  // Form validation and state management
  const { values, errors, touched, handleChange, handleBlur, handleSubmit, setFieldErrors, setFieldValue } =
    useFormValidation<UpdateRoleFormData>(
      updateRoleSchema,
      async (data: UpdateRoleFormData) => {
        setIsLoading(true);
        setServerError('');

        try {
          await roleService.updateRole(roleId, data);
          toast.success('Cập nhật vai trò thành công');
          router.push('/admin/roles');
        } catch (err) {
          const fieldErrors = extractFieldErrors(err);
          if (Object.keys(fieldErrors).length > 0) {
            setFieldErrors(fieldErrors);
          }
          const message = getServerErrorMessage(err);
          setServerError(message || 'Có lỗi xảy ra');
          toast.error(message || 'Có lỗi xảy ra');
        } finally {
          setIsLoading(false);
        }
      }
    );

  // Fetch role details and permissions khi component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsFetchingData(true);
        
        // Fetch role detail
        const roleResponse = await roleService.getRoleDetail(roleId);
        setRoleDetail(roleResponse.data);

        // Fetch permissions
        const permissionsResponse = await roleService.getPermissions();
        
        // Nhóm permissions theo resource
        const grouped = permissionsResponse.data.reduce((acc, permission) => {
          const [group] = permission.key.split(':');
          const groupName = group.charAt(0).toUpperCase() + group.slice(1);
          
          const existingGroup = acc.find(g => g.group === groupName);
          if (existingGroup) {
            existingGroup.permissions.push(permission);
          } else {
            acc.push({
              group: groupName,
              permissions: [permission],
            });
          }
          
          return acc;
        }, [] as PermissionGroup[]);

        // Sắp xếp
        grouped.forEach(group => {
          group.permissions.sort((a, b) => a.key.localeCompare(b.key));
        });
        grouped.sort((a, b) => a.group.localeCompare(b.group));

        setPermissionGroups(grouped);

        // Set form values - extract permission IDs từ rolePermissions
        const rolePermissionIds = roleResponse.data.rolePermissions?.map(rp => rp.permission.id) || [];
        setFieldValue('name', roleResponse.data.name);
        setFieldValue('fullName', roleResponse.data.fullName);
        setFieldValue('description', roleResponse.data.description || '');
        setFieldValue('permissions', rolePermissionIds);
      } catch (err) {
        const message = getServerErrorMessage(err);
        setServerError(message || 'Không thể tải dữ liệu');
        toast.error(message || 'Không thể tải dữ liệu');
      } finally {
        setIsFetchingData(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleId]);

  const handleGoBack = () => {
    router.push('/admin/roles');
  };

  const togglePermission = (permissionId: number) => {
    const current = values.permissions || [];
    const updated = current.includes(permissionId)
      ? current.filter((id: number) => id !== permissionId)
      : [...current, permissionId];
    
    setFieldValue('permissions', updated);
  };

  const toggleGroupPermissions = (group: PermissionGroup) => {
    const current = values.permissions || [];
    const groupPermissionIds = group.permissions.map(p => p.id);
    const allGroupSelected = groupPermissionIds.every(id => current.includes(id));
    
    if (allGroupSelected) {
      const updated = current.filter((id: number) => !groupPermissionIds.includes(id));
      setFieldValue('permissions', updated);
    } else {
      const updated = [...new Set([...current, ...groupPermissionIds])];
      setFieldValue('permissions', updated);
    }
  };

  if (isFetchingData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-2">
          <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleGoBack}
          disabled={isLoading}
          className="h-9 w-9"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cập nhật vai trò</h1>
          <p className="text-muted-foreground mt-1">
            Chỉnh sửa thông tin và quyền của vai trò
          </p>
        </div>
      </div>

      {/* Error message */}
      {serverError && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md">
          {serverError}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin vai trò</CardTitle>
            <CardDescription>Cập nhật mô tả cho vai trò</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Role Name - Display only */}
            <div className="space-y-2">
              <Label className="text-base font-medium">
                Tên vai trò
              </Label>
              <div className="p-3 bg-muted rounded-md border border-border">
                <p className="text-sm font-medium">{roleDetail?.name}</p>
              </div>
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName">
                Tên đầy đủ <span className="text-destructive">*</span>
              </Label>
              <Input
                id="fullName"
                name="fullName"
                placeholder="vd: Quản lý, Nhân viên, Kế toán,..."
                value={values.fullName ?? ''}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isLoading || isFetchingData}
                className={errors.fullName && touched.fullName ? 'border-destructive' : ''}
              />
              {errors.fullName && touched.fullName && (
                <p className="text-sm text-destructive">{errors.fullName}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Mô tả <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Nhập mô tả chi tiết cho vai trò này"
                value={values.description ?? ''}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isLoading || isFetchingData}
                className={errors.description && touched.description ? 'border-destructive' : ''}
                rows={3}
              />
              {errors.description && touched.description && (
                <p className="text-sm text-destructive">{errors.description}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Permissions Section */}
        <PermissionsSection
          permissionGroups={permissionGroups}
          selectedPermissions={values.permissions || []}
          isFetching={false}
          errors={errors.permissions}
          touched={touched.permissions}
          onTogglePermission={togglePermission}
          onToggleGroup={toggleGroupPermissions}
        />

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={handleGoBack}
            disabled={isLoading || isFetchingData}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            disabled={isLoading || isFetchingData}
          >
            {isLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Đang cập nhật...' : 'Cập nhật vai trò'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default EditRoleForm;
