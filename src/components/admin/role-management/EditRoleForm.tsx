'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Loader, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useFormValidation } from '@/hooks/useFormValidation';
import { useNavigation } from '@/hooks/useNavigation';
import { updateRoleSchema, type UpdateRoleFormData } from '@/schemas/role.schema';
import { roleService } from '@/services/role.service';
import { geminiService } from '@/services/gemini.service';
import { extractFieldErrors, getServerErrorMessage } from '@/lib/errorHandler';
import { PermissionTree } from './PermissionTree';
import { getAllPermissions, addParentPermissions, getAllDescendants } from '@/constants/permissions';
import type { RoleDetail } from '@/types/role';

export type EditRoleFormProps = {
  roleId: number | string;
};

export function EditRoleForm({ roleId }: EditRoleFormProps) {
  const router = useRouter();
  const { handleGoBack } = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [serverError, setServerError] = useState('');
  const [roleDetail, setRoleDetail] = useState<RoleDetail | null>(null);
  const [initialPermissions, setInitialPermissions] = useState<string[]>([]);

  // Form validation and state management
  const { values, errors, touched, handleChange, handleBlur, handleSubmit, setFieldErrors, setFieldValue } =
    useFormValidation<UpdateRoleFormData>(
      updateRoleSchema,
      async (data: UpdateRoleFormData) => {
        setIsLoading(true);
        setServerError('');

        try {
          // Auto-add parent permissions to ensure hierarchy is valid
          const validPermissions = addParentPermissions(data.permissions);
          await roleService.updateRole(roleId, { ...data, permissions: validPermissions });
          toast.success('Cập nhật vai trò thành công');
          handleGoBack();
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

  // Fetch role details khi component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsFetchingData(true);
        
        // Fetch role detail
        const roleResponse = await roleService.getRoleDetail(roleId);
        setRoleDetail(roleResponse.data);

        // Set form values - extract permission keys từ rolePermissions
        const rolePermissionKeys = roleResponse.data.rolePermissions?.map(rp => rp.permission.key) || [];
        setInitialPermissions(rolePermissionKeys);
        setFieldValue('name', roleResponse.data.name);
        setFieldValue('fullName', roleResponse.data.fullName);
        setFieldValue('description', roleResponse.data.description || '');
        setFieldValue('permissions', rolePermissionKeys);
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

  const togglePermission = (permissionKey: string) => {
    const current = values.permissions || [];
    const allPermissions = getAllPermissions();
    
    // If currently selected, we're toggling OFF
    if (current.includes(permissionKey)) {
      // Get ALL descendants of this permission
      const descendantsToRemove = getAllDescendants(permissionKey);
      const descendantKeys = new Set(descendantsToRemove.map((p) => p.key));
      
      // Remove the parent and all its descendants
      const updated = current.filter(
        (key: string) => key !== permissionKey && !descendantKeys.has(key)
      );
      
      setFieldValue('permissions', updated);
    } else {
      // If toggling ON, check if parent exists and auto-add if needed
      const perm = allPermissions.find(p => p.key === permissionKey);
      if (perm?.parentPermissionKey && !current.includes(perm.parentPermissionKey)) {
        // Auto-add all parent permissions
        const withParents = addParentPermissions([...current, permissionKey]);
        setFieldValue('permissions', withParents);
      } else {
        // Just add it
        setFieldValue('permissions', [...current, permissionKey]);
      }
    }
  };

  const handleGenerateSummary = async () => {
    const selectedPermissionKeys = values.permissions || [];
    if (selectedPermissionKeys.length === 0) {
      toast.error('Vui lòng chọn ít nhất một quyền để tóm tắt');
      return;
    }

    // Lấy các permission descriptions từ các permissions được chọn
    const allPerms = getAllPermissions();
    const permissionDescriptions = selectedPermissionKeys
      .map((key: string) => allPerms.find(p => p.key === key)?.description)
      .filter(Boolean);

    const permissionsText = permissionDescriptions.join(', ');

    const prompt = `Vai trò có các quyền: ${permissionsText}. Hãy giải thích vai trò này có thể làm được những gì, dựa trên các quyền được liệt kê ở trên. Tóm tắt dưới 255 kí tự.`;

    try {
      setIsGeneratingSummary(true);
      const response = await geminiService.prompt({
        prompt,
        model: 'gemini-2.5-flash',
        temperature: 0.7,
        maxTokens: 2000,
      });

      setFieldValue('description', response.data.text);
      toast.success('Tóm tắt mô tả thành công');
    } catch (err) {
      const message = getServerErrorMessage(err);
      toast.error(message || 'Không thể tóm tắt mô tả');
    } finally {
      setIsGeneratingSummary(false);
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
              <div className="flex items-center justify-between">
                <Label htmlFor="description">
                  Mô tả <span className="text-destructive">*</span>
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateSummary}
                  disabled={isLoading || isFetchingData || isGeneratingSummary || (values.permissions?.length ?? 0) === 0}
                  className="gap-2"
                >
                  {isGeneratingSummary ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      Đang tóm tắt...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4" />
                      Tóm tắt với AI
                    </>
                  )}
                </Button>
              </div>
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
        <PermissionTree
          selectedPermissions={values.permissions || []}
          isFetching={isFetchingData}
          errors={errors.permissions}
          touched={touched.permissions}
          onTogglePermission={togglePermission}
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
