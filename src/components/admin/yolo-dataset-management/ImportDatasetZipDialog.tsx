'use client';

import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { importDatasetZipSchema, type ImportDatasetZipFormData } from '@/schemas/yolo-dataset.schema';
import { yoloDatasetService } from '@/services/yolo-dataset.service';
import { getServerErrorMessage, extractFieldErrors } from '@/lib/errorHandler';
import { useFormValidation } from '@/hooks/useFormValidation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { IMAGE_STATUS_CONFIG } from '@/constants/yolo-dataset';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FileUp, Upload } from 'lucide-react';

export type ImportDatasetZipDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void | Promise<void>;
};

export function ImportDatasetZipDialog({
  open,
  onOpenChange,
  onSuccess,
}: ImportDatasetZipDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [serverError, setServerError] = useState('');

  // Form validation and state management
  const { values, errors, touched, isLoading, handleChange, handleBlur, handleSubmit, setFieldValue, setTouched, resetForm } =
    useFormValidation<ImportDatasetZipFormData>(importDatasetZipSchema, async (data: ImportDatasetZipFormData) => {
      try {
        const result = await yoloDatasetService.importZipDataset(
          data.zipFile,
          data.name,
          data.description,
          data.imageStatus
        );

        toast.success(result.message || `Dataset "${data.name}" được import thành công`);

        // Show import statistics
        if (result.data) {
          const { importedCount, failedCount } = result.data;
          if (importedCount > 0) {
            toast.success(
              `Đã import ${importedCount} ảnh${failedCount > 0 ? `, thất bại ${failedCount} ảnh` : ''}`
            );
          }

          if (result.data.errors && result.data.errors.length > 0) {
            const errorMessages = result.data.errors
              .slice(0, 3)
              .map((err) => `• ${err.filename || 'Không rõ'}: ${err.error}`)
              .join('\n');
            toast.error(`Lỗi import:\n${errorMessages}${result.data.errors.length > 3 ? `\n... và ${result.data.errors.length - 3} lỗi khác` : ''}`);
          }
        }

        resetForm();
        setFileName('');
        setSelectedFile(null);
        setServerError('');
        onOpenChange(false);
        await onSuccess?.();
      } catch (err) {
        const message = getServerErrorMessage(err) || 'Không thể import dataset';
        const fieldErrors = extractFieldErrors(err);

        if (Object.keys(fieldErrors).length > 0) {
          setFieldValue('errors', fieldErrors);
        }
        setServerError(message);
        toast.error(message);
      }
    });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setSelectedFile(file);
      setFieldValue('zipFile', file);
      setTouched((prev) => ({ ...prev, zipFile: true }));
      setServerError('');
    }
  };

  const handleFileBrowserClick = () => {
    fileInputRef.current?.click();
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
      setFileName('');
      setSelectedFile(null);
      setServerError('');
    }
    onOpenChange(newOpen);
  };

  const handleSubmitWithTouched = async (e: React.FormEvent<HTMLFormElement>) => {
    setTouched((prev) => ({
      ...prev,
      zipFile: true,
      name: true,
      description: true,
      imageStatus: true,
    }));
    return handleSubmit(e);
  };

  const zipFileError = touched.zipFile ? (errors.zipFile as string) : undefined;
  const nameError = touched.name ? (errors.name as string) : undefined;
  const descriptionError = touched.description ? (errors.description as string) : undefined;
  const statusError = touched.imageStatus ? (errors.imageStatus as string) : undefined;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Dataset từ ZIP
          </DialogTitle>
          <DialogDescription>
            Tải lên file ZIP chứa dataset YOLO để import vào hệ thống. Tên dataset là bắt buộc.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmitWithTouched} className="space-y-4">
          {/* Error message */}
          {serverError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{serverError}</p>
            </div>
          )}

          {/* File Input */}
          <div className="space-y-2">
            <Label htmlFor="zipFile">File ZIP *</Label>
            <button
              type="button"
              onClick={handleFileBrowserClick}
              className={`w-full px-4 py-3 border-2 border-dashed rounded-lg hover:border-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                zipFileError ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <FileUp className="h-4 w-4" />
              <span className="text-sm">
                {fileName || 'Nhấp để chọn file ZIP'}
              </span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              id="zipFile"
              name="zipFile"
              accept=".zip"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isLoading}
            />
            {zipFileError && (
              <p className="text-sm text-red-600">{zipFileError}</p>
            )}
          </div>

          {/* Name Input */}
          <div className="space-y-2">
            <Label htmlFor="name">Tên Dataset *</Label>
            <Input
              id="name"
              name="name"
              value={values.name || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="ví dụ: fabric_counter_v2"
              disabled={isLoading}
              className={nameError ? 'border-red-500' : ''}
            />
            {nameError && (
              <p className="text-sm text-red-600">{nameError}</p>
            )}
          </div>

          {/* Description Input */}
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả (tùy chọn)</Label>
            <Textarea
              id="description"
              name="description"
              value={values.description || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="ví dụ: nhập từ label studio"
              disabled={isLoading}
              className={`resize-none ${descriptionError ? 'border-red-500' : ''}`}
              rows={2}
            />
            {descriptionError && (
              <p className="text-sm text-red-600">{descriptionError}</p>
            )}
          </div>

          {/* Status Input */}
          <div className="space-y-2">
            <Label htmlFor="imageStatus">Trạng thái ảnh khi import</Label>
            <Select
              value={(values.imageStatus as string) || 'PENDING'}
              onValueChange={(val: string) => {
                setFieldValue('imageStatus', val as any);
                setTouched((prev) => ({ ...prev, imageStatus: true }));
                // Validate field explicitly
              }}
            >
              <SelectTrigger id="imageStatus" className={`w-full ${statusError ? 'border-red-500' : ''}`}>
                <SelectValue placeholder="PENDING" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(IMAGE_STATUS_CONFIG).map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {statusError && (
              <p className="text-sm text-red-600">{statusError}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="animate-spin mr-2">⌛</span>
                  Đang import...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Import Dataset
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
