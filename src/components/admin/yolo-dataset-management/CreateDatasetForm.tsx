'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFormValidation } from '@/hooks/useFormValidation';
import { useNavigation } from '@/hooks/useNavigation';
import { createDatasetSchema, type CreateDatasetFormData } from '@/schemas/yolo-dataset.schema';
import { yoloDatasetService } from '@/services/yolo-dataset.service';
import { extractFieldErrors, getServerErrorMessage } from '@/lib/errorHandler';
import { ArrowLeft, Loader, Plus, Trash2 } from 'lucide-react';

export function CreateDatasetForm() {
  const router = useRouter();
  const { handleGoBack } = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [classInput, setClassInput] = useState('');
  const [classErrors, setClassErrors] = useState<Record<number, string>>({});

  // Form validation and state management
  const { values, errors, touched, handleChange, handleBlur, handleSubmit, setFieldErrors, setFieldValue, setTouched } =
    useFormValidation<CreateDatasetFormData>(createDatasetSchema, async (data: CreateDatasetFormData) => {
      setIsLoading(true);
      setServerError('');

      try {
        await yoloDatasetService.createDataset(data);
        toast.success('Tạo dataset thành công');
        router.push('/admin/yolo-datasets');
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
    });

  /**
   * Wrap handleSubmit để mark classes as touched
   */
  const handleSubmitWithTouched = async (e: React.FormEvent<HTMLFormElement>) => {
    // Merge với touched hiện tại, không thay thế
    setTouched((prev) => ({ ...prev, name: true, classes: true }));
    return handleSubmit(e);
  };

  /**
   * Get error cho một item cụ thể trong mảng classes
   */
  const getClassItemError = (index: number): string | undefined => {
    return classErrors[index];
  };

  /**
   * Add a new class to the list
   */
  const handleAddClass = () => {
    if (!classInput.trim()) {
      toast.error('Vui lòng nhập tên lớp');
      return;
    }

    const trimmedInput = classInput.trim();

    // Check if class already exists
    const currentClasses = values.classes ?? [];
    if (currentClasses.includes(trimmedInput)) {
      toast.error('Lớp này đã tồn tại');
      return;
    }

    // Validate format
    const classNameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!classNameRegex.test(trimmedInput)) {
      toast.error('Tên lớp chỉ được chứa chữ, số, gạch dưới (_) và gạch ngang (-)');
      return;
    }

    const newClasses = [...currentClasses, trimmedInput];
    setFieldValue('classes', newClasses);
    setClassInput('');
    
    // Clear error của item mới thêm
    setClassErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[newClasses.length - 1];
      return newErrors;
    });
  };

  /**
   * Remove a class from the list
   */
  const handleRemoveClass = (index: number) => {
    const currentClasses = values.classes ?? [];
    const newClasses = currentClasses.filter((_, i) => i !== index);
    setFieldValue('classes', newClasses);
    
    // Re-index classErrors
    setClassErrors((prev) => {
      const newErrors: Record<number, string> = {};
      Object.entries(prev).forEach(([idx, error]) => {
        const numIdx = parseInt(idx, 10);
        if (numIdx < index) {
          newErrors[numIdx] = error;
        } else if (numIdx > index) {
          newErrors[numIdx - 1] = error;
        }
      });
      return newErrors;
    });
  };

  /**
   * Handle Enter key in class input
   */
  const handleClassKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddClass();
    }
  };

  const currentClasses = values.classes ?? [];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
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
          <h1 className="text-3xl font-bold tracking-tight">Tạo Dataset YOLO mới</h1>
          <p className="text-muted-foreground mt-1">
            Điền thông tin để tạo một dataset mới để huấn luyện mô hình
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
      <form onSubmit={handleSubmitWithTouched} className="space-y-6">
        {/* Dataset Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin Dataset</CardTitle>
            <CardDescription>Nhập thông tin cơ bản của dataset</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Dataset Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Tên Dataset <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="fabric_defects_v1"
                value={values.name ?? ''}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isLoading}
                className={errors.name && touched.name ? 'border-destructive' : ''}
              />
              {errors.name && touched.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Chỉ được chứa chữ, số, gạch dưới (_) và gạch ngang (-)
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Mô tả về dataset này (tùy chọn)"
                value={values.description ?? ''}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isLoading}
                rows={4}
                className={errors.description && touched.description ? 'border-destructive' : ''}
              />
              {errors.description && touched.description && (
                <p className="text-sm text-destructive">{errors.description}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Classes Card */}
        <Card>
          <CardHeader>
            <CardTitle>Các lớp (Classes)</CardTitle>
            <CardDescription>
              Thêm các lớp đối tượng mà mô hình sẽ nhận diện (ví dụ: lỗi, vết bẩn, rách)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Class Input */}
            <div className="flex gap-2">
              <div className="flex-1 space-y-2">
                <Label htmlFor="classInput" className="text-sm">
                  Thêm lớp mới
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="classInput"
                    placeholder="Nhập tên lớp (ví dụ: defect)"
                    value={classInput}
                    onChange={(e) => setClassInput(e.target.value)}
                    onKeyDown={handleClassKeyDown}
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    onClick={handleAddClass}
                    disabled={isLoading || !classInput.trim()}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Thêm
                  </Button>
                </div>
              </div>
            </div>

            {/* Classes List */}
            <div className="space-y-2">
              <Label>
                Danh sách các lớp <span className="text-destructive">*</span>
              </Label>
              {currentClasses.length === 0 ? (
                <div className="p-4 border-2 border-dashed rounded-lg text-center text-muted-foreground">
                  Chưa có lớp nào. Thêm ít nhất một lớp để tiếp tục.
                </div>
              ) : (
                <div className="space-y-2">
                  {currentClasses.map((cls, index) => {
                    const itemError = getClassItemError(index);
                    return (
                      <div key={index} className="space-y-1">
                        <div
                          className={`flex items-center justify-between p-3 border rounded-lg bg-muted/30 ${
                            itemError ? 'border-destructive bg-destructive/5' : ''
                          }`}
                        >
                          <span className={`font-medium text-sm ${itemError ? 'text-destructive' : ''}`}>
                            {cls}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveClass(index)}
                            disabled={isLoading}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        {itemError && (
                          <p className="text-sm text-destructive px-1">{itemError}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              {errors.classes && typeof errors.classes === 'string' && (
                <p className="text-sm text-destructive">{errors.classes}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Tổng: <span className="font-medium">{currentClasses.length}</span> lớp
              </p>
            </div>
          </CardContent>
        </Card>

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
          <Button type="submit" disabled={isLoading || currentClasses.length === 0 || !!errors.name || !!errors.classes}>
            {isLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Đang tạo...' : 'Tạo Dataset'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default CreateDatasetForm;
