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
import { useRolePermissions } from '@/hooks/useRolePermissions';
import { createRoleSchema, type CreateRoleFormData } from '@/schemas/role.schema';
import { roleService } from '@/services/role.service';
import { extractFieldErrors, getServerErrorMessage } from '@/lib/errorHandler';
import { PermissionTree } from './PermissionTree';
import { addParentPermissions } from '@/constants/permissions';

export function CreateRoleForm() {
  const router = useRouter();
  const { handleGoBack } = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [serverError, setServerError] = useState('');

  // Form validation and state management
  const { values, errors, touched, handleChange, handleBlur, handleSubmit, setFieldErrors, setFieldValue } =
    useFormValidation<CreateRoleFormData>(
      createRoleSchema,
      async (data: CreateRoleFormData) => {
        setIsLoading(true);
        setServerError('');

        try {
          // Auto-add parent permissions to ensure hierarchy is valid
          const validPermissions = addParentPermissions(data.permissions);
          await roleService.createRole({ ...data, permissions: validPermissions });
          toast.success('Tạo vai trò thành công');
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

  // Use role permissions hook
  const { togglePermission: handleTogglePermission, toggleGroupPermissions: handleToggleGroupPermissions, generateDescriptionFromPermissions } =
    useRolePermissions(setFieldValue);

  const togglePermission = (permissionKey: string) => {
    handleTogglePermission(permissionKey, values.permissions || []);
  };

  const toggleGroupPermissions = (groupNodes: any[]) => {
    handleToggleGroupPermissions(groupNodes, values.permissions || []);
  };

  const handleGenerateSummary = async () => {
    setIsGeneratingSummary(true);
    try {
      const success = await generateDescriptionFromPermissions(values.permissions || []);
      if (!success) {
        // Error already toasted in hook
      }
    } finally {
      setIsGeneratingSummary(false);
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
                disabled={isLoading}
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
                disabled={isLoading}
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
                  disabled={isLoading || isGeneratingSummary || (values.permissions?.length ?? 0) === 0}
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
                disabled={isLoading}
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
          isFetching={false}
          errors={errors.permissions}
          touched={touched.permissions}
          onTogglePermission={togglePermission}
          onToggleGroupPermissions={toggleGroupPermissions}
        />

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={handleGoBack}
            disabled={isLoading}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
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
