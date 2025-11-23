'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { yoloDatasetService } from '@/services/yolo-dataset.service';
import { getServerErrorMessage } from '@/lib/errorHandler';
import { toast } from 'sonner';
import { Loader, Upload, X } from 'lucide-react';

export interface UploadImageFormProps {
  datasetId: string | number;
  onSuccess?: (imageId: string) => void;
  onClose?: () => void;
}

export function UploadImageForm({ datasetId, onSuccess, onClose }: UploadImageFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [fileError, setFileError] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError('');

    if (!file) {
      setSelectedFile(null);
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setFileError('Vui lòng chọn file ảnh hợp lệ (JPG, PNG, WebP)');
      setSelectedFile(null);
      return;
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      setFileError('Kích thước file không được vượt quá 50MB');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      setFileError('Vui lòng chọn ảnh để tải lên');
      return;
    }

    setIsLoading(true);
    try {
      const response = await yoloDatasetService.uploadImage(
        datasetId,
        selectedFile,
        notes || undefined
      );

      toast.success('Tải ảnh lên thành công');
      onSuccess?.(response.data?.id);
      
      // Reset form
      setSelectedFile(null);
      setNotes('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      onClose?.();
    } catch (err) {
      const message = getServerErrorMessage(err) || 'Không thể tải ảnh lên';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setFileError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* File Input */}
      <div className="space-y-2">
        <Label htmlFor="image">Ảnh <span className="text-red-500">*</span></Label>
        
        {selectedFile ? (
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg border">
            <div className="flex items-center gap-2">
              <Upload className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearFile}
              disabled={isLoading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div
            className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm font-medium">Nhấp để chọn ảnh hoặc kéo thả</p>
            <p className="text-xs text-muted-foreground mt-1">
              JPG, PNG, GIF, WebP (tối đa 50MB)
            </p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          id="image"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={isLoading}
        />

        {fileError && (
          <p className="text-sm text-red-500">{fileError}</p>
        )}
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Ghi chú (tuỳ chọn)</Label>
        <Textarea
          id="notes"
          placeholder="Nhập ghi chú về ảnh này..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={isLoading}
          rows={3}
        />
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-2 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            onClose?.();
            setNotes('');
            handleClearFile();
          }}
          disabled={isLoading}
        >
          Huỷ
        </Button>
        <Button type="submit" disabled={isLoading || !selectedFile}>
          {isLoading ? (
            <>
              <Loader className="h-4 w-4 mr-2 animate-spin" />
              Đang tải...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Tải lên
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
