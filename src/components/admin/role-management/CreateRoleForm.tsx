'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Loader, Wand2, Lightbulb, Trash2 } from 'lucide-react';
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
import { useDuplicateRoleStore } from '@/store/useDuplicateRoleStore';

export function CreateRoleForm() {
  const router = useRouter();
  const { handleGoBack } = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isGeneratingName, setIsGeneratingName] = useState(false);
  const [serverError, setServerError] = useState('');
  const [isNameEditable, setIsNameEditable] = useState(true);
  const generateNameTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { duplicateData, clearDuplicateData } = useDuplicateRoleStore();

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

  // Load duplicate data if available
  useEffect(() => {
    if (duplicateData) {
      if (duplicateData.fullName) setFieldValue('fullName', duplicateData.fullName);
      if (duplicateData.description) setFieldValue('description', duplicateData.description);
      if (duplicateData.permissions) setFieldValue('permissions', duplicateData.permissions);
      clearDuplicateData(); // Clear after loading
    }
  }, [duplicateData, setFieldValue, clearDuplicateData]);

  // Auto-generate role name from fullName with debounce (300ms)
  useEffect(() => {
    if (generateNameTimeoutRef.current) {
      clearTimeout(generateNameTimeoutRef.current);
    }

    const fullName = values.fullName?.trim();
    if (!fullName) {
      return;
    }

    setIsGeneratingName(true);

    generateNameTimeoutRef.current = setTimeout(async () => {
      try {
        const result = await roleService.generateRoleName(fullName);
        setFieldValue('name', result.data.suggestion);
        setIsNameEditable(true); // Allow user to edit after generation
      } catch (err) {
        // Silent fail on generate name error
        console.error('Error generating role name:', err);
      } finally {
        setIsGeneratingName(false);
      }
    }, 300);

    return () => {
      if (generateNameTimeoutRef.current) {
        clearTimeout(generateNameTimeoutRef.current);
      }
    };
  }, [values.fullName, setFieldValue]);

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

  const handleClearName = () => {
    setFieldValue('name', '');
    setIsNameEditable(true);
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
            {/* Name - Auto-generated */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="name">
                  Tên vai trò <span className="text-destructive">*</span>
                </Label>
                <div className="flex items-center gap-2">
                  {isGeneratingName && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Loader className="h-3 w-3 animate-spin" />
                      Đang tạo...
                    </span>
                  )}
                  {!isGeneratingName && values.name && (
                    <>
                      <span className="text-xs text-amber-600 dark:text-amber-500 flex items-center gap-1 bg-amber-50 dark:bg-amber-950/30 px-2 py-1 rounded">
                        <Lightbulb className="h-3 w-3" />
                        Gợi ý
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleClearName}
                        disabled={isLoading}
                        className="h-8 w-8 p-0"
                        title="Xóa gợi ý"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
              <Input
                id="name"
                name="name"
                placeholder="Sẽ tự động tạo từ tên đầy đủ"
                value={values.name ?? ''}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isLoading}
                readOnly={!isNameEditable && !!values.name}
                className={`${
                  errors.name && touched.name ? 'border-destructive' : ''
                } ${!isNameEditable && values.name ? 'bg-muted cursor-not-allowed' : ''}`}
              />
              {errors.name && touched.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
              {values.name && !errors.name && (
                <p className="text-xs text-muted-foreground">Bạn có thể chỉnh sửa tên này</p>
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
