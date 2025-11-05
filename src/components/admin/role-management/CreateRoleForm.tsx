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
import { createRoleSchema, type CreateRoleFormData } from '@/schemas/role.schema';
import { roleService } from '@/services/role.service';
import { extractFieldErrors, getServerErrorMessage } from '@/lib/errorHandler';
import { PermissionsSection } from './PermissionsSection';
import type { Permission } from '@/types/role';

type PermissionGroup = {
  group: string;
  permissions: Permission[];
};

export function CreateRoleForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingPermissions, setIsFetchingPermissions] = useState(true);
  const [serverError, setServerError] = useState('');
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>([]);

  // Form validation and state management
  const { values, errors, touched, handleChange, handleBlur, handleSubmit, setFieldErrors, setFieldValue } =
    useFormValidation<CreateRoleFormData>(
      createRoleSchema,
      async (data: CreateRoleFormData) => {
        setIsLoading(true);
        setServerError('');

        try {
          await roleService.createRole(data);
          toast.success('Tạo vai trò thành công');
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

  // Fetch permissions khi component mount
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        setIsFetchingPermissions(true);
        const response = await roleService.getPermissions();
        
        // Nhóm permissions theo resource (phần đầu của key, ví dụ: "warehouse")
        const grouped = response.data.reduce((acc, permission) => {
          // Tách group từ key (vd: "warehouse:view_list" -> "warehouse")
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

        // Sắp xếp mỗi group theo key
        grouped.forEach(group => {
          group.permissions.sort((a, b) => a.key.localeCompare(b.key));
        });

        // Sắp xếp các group
        grouped.sort((a, b) => a.group.localeCompare(b.group));

        setPermissionGroups(grouped);
      } catch (err) {
        const message = getServerErrorMessage(err);
        setServerError(message || 'Không thể lấy danh sách quyền');
        toast.error(message || 'Không thể lấy danh sách quyền');
      } finally {
        setIsFetchingPermissions(false);
      }
    };

    fetchPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGoBack = () => {
    router.push('/admin/roles');
  };

  const togglePermission = (permissionId: number) => {
    const current = values.permissions || [];
    const updated = current.includes(permissionId)
      ? current.filter(id => id !== permissionId)
      : [...current, permissionId];
    
    setFieldValue('permissions', updated);
  };

  const toggleGroupPermissions = (group: PermissionGroup) => {
    const current = values.permissions || [];
    const groupPermissionIds = group.permissions.map(p => p.id);
    const allGroupSelected = groupPermissionIds.every(id => current.includes(id));
    
    if (allGroupSelected) {
      // Deselect all in group
      const updated = current.filter(id => !groupPermissionIds.includes(id));
      setFieldValue('permissions', updated);
    } else {
      // Select all in group
      const updated = [...new Set([...current, ...groupPermissionIds])];
      setFieldValue('permissions', updated);
    }
  };

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
          <h1 className="text-3xl font-bold tracking-tight">Tạo vai trò mới</h1>
          <p className="text-muted-foreground mt-1">
            Tạo một vai trò mới và gán quyền cho nó
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
            <CardTitle>Thông tin cơ bản</CardTitle>
            <CardDescription>Nhập tên và mô tả cho vai trò mới</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Tên vai trò <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="vd: Manager, Editor, Viewer"
                value={values.name ?? ''}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isLoading || isFetchingPermissions}
                className={errors.name && touched.name ? 'border-destructive' : ''}
              />
              {errors.name && touched.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName">
                Tên đầy đủ <span className="text-destructive">*</span>
              </Label>
              <Input
                id="fullName"
                name="fullName"
                placeholder="vd: Quản lý, Biên tập viên, Xem xét"
                value={values.fullName ?? ''}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isLoading || isFetchingPermissions}
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
                disabled={isLoading || isFetchingPermissions}
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
          isFetching={isFetchingPermissions}
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
            disabled={isLoading || isFetchingPermissions}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            disabled={isLoading || isFetchingPermissions}
          >
            {isLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Đang tạo...' : 'Tạo vai trò'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default CreateRoleForm;
