'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFormValidation } from '@/hooks/useFormValidation';
import { useNavigation } from '@/hooks/useNavigation';
import { updateDatasetSchema, type UpdateDatasetFormData } from '@/schemas/yolo-dataset.schema';
import { yoloDatasetService } from '@/services/yolo-dataset.service';
import { extractFieldErrors, getServerErrorMessage } from '@/lib/errorHandler';
import { ArrowLeft, Loader, Plus, Trash2 } from 'lucide-react';

export function UpdateDatasetForm() {
  const router = useRouter();
  const { datasetId } = useParams();
  const { handleGoBack } = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDataset, setIsLoadingDataset] = useState(true);
  const [serverError, setServerError] = useState('');
  const [currentClasses, setCurrentClasses] = useState<string[]>([]);
  const [newClassName, setNewClassName] = useState('');
  const [classNameError, setClassNameError] = useState('');

  // Form validation and state management
  const { values, errors, handleChange, handleBlur, handleSubmit, setFieldErrors, setFieldValue, setTouched } =
    useFormValidation<UpdateDatasetFormData>(updateDatasetSchema, async (data: UpdateDatasetFormData) => {
      setIsLoading(true);
      setServerError('');

      try {
        const payload = {
          name: data.name,
          description: data.description,
          status: data.status as any,
          classes: currentClasses,
        };
        await yoloDatasetService.updateDataset(datasetId as string, payload);
        toast.success('Cập nhật dataset thành công');
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

  // Load dataset data on mount
  useEffect(() => {
    const loadDataset = async () => {
      try {
        const dataset = await yoloDatasetService.getDatasetById(datasetId as string);
        // Set form values
        setFieldValue('name', dataset.name);
        setFieldValue('description', dataset.description || '');
        setFieldValue('status', dataset.status);
        // Set classes separately
        setCurrentClasses(dataset.classes || []);
      } catch (err) {
        const message = getServerErrorMessage(err);
        setServerError(message || 'Không thể tải dataset');
        toast.error(message || 'Không thể tải dataset');
      } finally {
        setIsLoadingDataset(false);
      }
    };

    if (datasetId) {
      loadDataset();
    }
  }, [datasetId, setFieldValue]);

  /**
   * Wrap handleSubmit để mark required fields as touched
   */
  const handleSubmitWithTouched = async (e: React.FormEvent<HTMLFormElement>) => {
    setTouched((prev) => ({ ...prev, name: true }));
    return handleSubmit(e);
  };

  /**
   * Validate and add new class
   */
  const handleAddClass = () => {
    setClassNameError('');
    
    // Trim whitespace
    const trimmedName = newClassName.trim();
    
    if (!trimmedName) {
      setClassNameError('Tên lớp không được để trống');
      return;
    }

    // Check if class already exists
    if (currentClasses.includes(trimmedName)) {
      setClassNameError('Lớp này đã tồn tại');
      return;
    }

    // Validate class name (alphanumeric, underscore, hyphen)
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmedName)) {
      setClassNameError('Tên lớp chỉ được chứa chữ, số, gạch dưới (_) và gạch ngang (-)');
      return;
    }

    // Add to classes
    setCurrentClasses([...currentClasses, trimmedName]);
    setNewClassName('');
    toast.success(`Đã thêm lớp: ${trimmedName}`);
  };

  /**
   * Remove class by index
   */
  const handleRemoveClass = (index: number) => {
    const removedClass = currentClasses[index];
    setCurrentClasses(currentClasses.filter((_, i) => i !== index));
    toast.success(`Đã xóa lớp: ${removedClass}`);
  };

  /**
   * Handle Enter key in class input
   */
  const handleClassInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddClass();
    }
  };

  if (isLoadingDataset) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold tracking-tight">Chỉnh sửa Dataset YOLO</h1>
          <p className="text-muted-foreground mt-1">
            Cập nhật thông tin dataset
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
            <CardDescription>Cập nhật thông tin cơ bản của dataset</CardDescription>
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
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
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
                className={errors.description ? 'border-destructive' : ''}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description}</p>
              )}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Trạng thái</Label>
              <Select
                value={values.status ?? ''}
                onValueChange={(value) => setFieldValue('status', value)}
                disabled={isLoading}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                  <SelectItem value="ARCHIVED">Lưu trữ</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-sm text-destructive">{errors.status}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Classes Card - Read Only */}
        <Card>
          <CardHeader>
            <CardTitle>Các lớp (Classes)</CardTitle>
            <CardDescription>
              Quản lý các lớp đối tượng trong dataset
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add New Class Input */}
            <div className="space-y-2">
              <Label htmlFor="newClass">Thêm lớp mới</Label>
              <div className="flex gap-2">
                <Input
                  id="newClass"
                  placeholder="fabric_defect"
                  value={newClassName}
                  onChange={(e) => {
                    setNewClassName(e.target.value);
                    setClassNameError('');
                  }}
                  onKeyDown={handleClassInputKeyDown}
                  disabled={isLoading}
                  className={classNameError ? 'border-destructive' : ''}
                />
                <Button
                  type="button"
                  onClick={handleAddClass}
                  disabled={isLoading || !newClassName.trim()}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Thêm
                </Button>
              </div>
              {classNameError && (
                <p className="text-sm text-destructive">{classNameError}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Chỉ được chứa chữ, số, gạch dưới (_) và gạch ngang (-). Nhấn Enter hoặc click "Thêm"
              </p>
            </div>

            {/* Classes List */}
            <div className="space-y-2">
              <Label>Danh sách các lớp</Label>
              {currentClasses.length === 0 ? (
                <div className="p-4 border-2 border-dashed rounded-lg text-center text-muted-foreground">
                  Chưa có lớp nào. Thêm lớp phía trên để bắt đầu.
                </div>
              ) : (
                <div className="space-y-2">
                  {currentClasses.map((cls, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-muted-foreground">
                          #{index + 1}
                        </span>
                        <span className="font-medium text-sm">{cls}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveClass(index)}
                        disabled={isLoading}
                        className="h-8 w-8 p-0 hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
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
          <Button type="submit" disabled={isLoading || !!errors.name || !!errors.description || !!errors.status}>
            {isLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Đang cập nhật...' : 'Cập nhật Dataset'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default UpdateDatasetForm;
