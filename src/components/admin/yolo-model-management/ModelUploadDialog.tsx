'use client';

import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, AlertCircle } from 'lucide-react';
import { yoloModelService } from '@/services/yolo-model.service';
import {
  getServerErrorMessage,
  extractFieldErrors,
  getErrorStatus,
} from '@/lib/errorHandler';

export type ModelUploadDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

export function ModelUploadDialog({ open, onOpenChange, onSuccess }: ModelUploadDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [modelName, setModelName] = useState('');
  const [description, setDescription] = useState('');
  const [version, setVersion] = useState('');
  const [uploading, setUploading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  /**
   * Handle file selection
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // Validate file extension
      if (!file.name.endsWith('.pt')) {
        toast.error('Vui lòng chọn file .pt');
        setSelectedFile(null);
        return;
      }

      // Optional: Validate file size (e.g., max 500MB)
      const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
      if (file.size > MAX_FILE_SIZE) {
        toast.error('File quá lớn. Kích thước tối đa là 500MB');
        setSelectedFile(null);
        return;
      }
      
      setSelectedFile(file);
      // Clear previous field errors when file is selected
      setFieldErrors({});
    }
  };

  /**
   * Handle file input click
   */
  const handleFileInputClick = () => {
    fileInputRef.current?.click();
  };

  /**
   * Handle upload
   */
  const handleUpload = async () => {
    // Clear previous errors
    setFieldErrors({});

    if (!selectedFile) {
      toast.error('Vui lòng chọn file model');
      return;
    }

    setUploading(true);
    try {
      await yoloModelService.uploadModel(
        selectedFile,
        modelName || undefined,
        description || undefined,
        version || undefined
      );
      
      toast.success('Tải lên model thành công');
      
      // Reset form
      setSelectedFile(null);
      setModelName('');
      setDescription('');
      setVersion('');
      setFieldErrors({});
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      // Get HTTP status code
      const statusCode = getErrorStatus(err);
      
      // Extract field-level errors if they exist
      const errors = extractFieldErrors(err);
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        // Show first field error as toast
        const firstError = Object.values(errors)[0];
        toast.error(firstError);
      } else {
        // Show general error message
        const errorMessage =
          getServerErrorMessage(err) || 'Không thể tải lên model';
        toast.error(errorMessage);
      }

      // Log error details for debugging
      console.error('Upload error:', {
        statusCode,
        fieldErrors: errors,
        message: getServerErrorMessage(err),
      });
    } finally {
      setUploading(false);
    }
  };

  /**
   * Handle dialog close
   */
  const handleOpenChange = (newOpen: boolean) => {
    if (!uploading) {
      onOpenChange(newOpen);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Tải lên Model YOLO</DialogTitle>
          <DialogDescription>
            Chọn file .pt model để tải lên
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Input */}
          <div className="space-y-2">
            <Label>File Model (.pt) *</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pt"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleFileInputClick}
              disabled={uploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              {selectedFile ? selectedFile.name : 'Chọn file'}
            </Button>
            {fieldErrors.model && (
              <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{fieldErrors.model}</span>
              </div>
            )}
          </div>

          {/* Model Name */}
          <div className="space-y-2">
            <Label htmlFor="model-name">Tên Model (tuỳ chọn)</Label>
            <Input
              id="model-name"
              placeholder="Nhập tên model..."
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              disabled={uploading}
              className={fieldErrors.name ? 'border-red-500' : ''}
            />
            {fieldErrors.name && (
              <p className="text-sm text-red-600">{fieldErrors.name}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Mô Tả (tuỳ chọn)</Label>
            <Textarea
              id="description"
              placeholder="Nhập mô tả model..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={uploading}
              rows={3}
              className={fieldErrors.description ? 'border-red-500' : ''}
            />
            {fieldErrors.description && (
              <p className="text-sm text-red-600">{fieldErrors.description}</p>
            )}
          </div>

          {/* Version */}
          <div className="space-y-2">
            <Label htmlFor="version">Phiên Bản (tuỳ chọn)</Label>
            <Input
              id="version"
              placeholder="Nhập phiên bản (vd: 1.0.0)..."
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              disabled={uploading}
              className={fieldErrors.version ? 'border-red-500' : ''}
            />
            {fieldErrors.version && (
              <p className="text-sm text-red-600">{fieldErrors.version}</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={uploading}
          >
            Hủy
          </Button>
          <Button
            onClick={handleUpload}
            disabled={uploading || !selectedFile}
          >
            {uploading ? 'Đang tải lên...' : 'Tải lên'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ModelUploadDialog;
