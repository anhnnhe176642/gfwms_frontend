'use client';

import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { yoloDatasetService } from '@/services/yolo-dataset.service';
import { getServerErrorMessage } from '@/lib/errorHandler';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { FileUp, Upload } from 'lucide-react';

export type ImportDatasetToExistingDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  datasetId: string | number;
  datasetName?: string;
  onSuccess?: () => void | Promise<void>;
};

export function ImportDatasetToExistingDialog({
  open,
  onOpenChange,
  datasetId,
  datasetName,
  onSuccess,
}: ImportDatasetToExistingDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.zip')) {
        toast.error('Vui lòng chọn file ZIP');
        return;
      }
      setFileName(file.name);
      setSelectedFile(file);
      setServerError('');
    }
  };

  const handleFileBrowserClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast.error('Vui lòng chọn file ZIP');
      return;
    }

    setIsLoading(true);
    try {
      const result = await yoloDatasetService.importDatasetToExisting(datasetId, selectedFile);

      toast.success(result.message || 'Import thành công');

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

      setFileName('');
      setSelectedFile(null);
      setServerError('');
      onOpenChange(false);
      await onSuccess?.();
    } catch (err) {
      const message = getServerErrorMessage(err) || 'Không thể import dataset';
      setServerError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setFileName('');
      setSelectedFile(null);
      setServerError('');
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import ảnh vào Dataset
          </DialogTitle>
          <DialogDescription>
            {datasetName ? `Import ảnh vào dataset "${datasetName}"` : 'Import ảnh vào dataset này'}. 
            Chọn file ZIP chứa ảnh để thêm vào dataset.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
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
              disabled={isLoading}
              className={`w-full px-4 py-3 border-2 border-dashed rounded-lg hover:border-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                serverError ? 'border-red-300' : 'border-gray-300'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
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
          </div>
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
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || !selectedFile}
          >
            {isLoading ? (
              <>
                <span className="animate-spin mr-2">⌛</span>
                Đang import...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Import ảnh
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
