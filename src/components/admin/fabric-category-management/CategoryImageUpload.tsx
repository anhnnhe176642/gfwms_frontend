'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { fabricCategoryService } from '@/services/fabricCategory.service';
import { getServerErrorMessage } from '@/lib/errorHandler';
import { toast } from 'sonner';
import { Loader2, Upload, X, Image as ImageIcon } from 'lucide-react';
import type { FabricCategoryListItem } from '@/types/fabricCategory';

interface CategoryImageUploadProps {
  categoryId: string | number;
  currentCategory?: FabricCategoryListItem;
  onSuccess?: (updatedCategory: FabricCategoryListItem) => void;
}

export function CategoryImageUpload({
  categoryId,
  currentCategory,
  onSuccess,
}: CategoryImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fileError, setFileError] = useState<string>('');
  const [preview, setPreview] = useState<string | null>(currentCategory?.image || null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError('');

    if (!file) {
      setSelectedFile(null);
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setFileError('Vui lòng chọn file ảnh hợp lệ (JPG, PNG, GIF, WebP)');
      setSelectedFile(null);
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setFileError('Kích thước file không được vượt quá 10MB');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setFileError('Vui lòng chọn ảnh để tải lên');
      return;
    }

    setIsLoading(true);
    try {
      const updatedCategory = await fabricCategoryService.uploadFabricCategoryImage(
        categoryId,
        selectedFile
      );
      toast.success('Cập nhật ảnh loại vải thành công');
      onSuccess?.(updatedCategory);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      const message = getServerErrorMessage(error) || 'Không thể tải ảnh lên';
      toast.error(message);
      setFileError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setPreview(currentCategory?.image || null);
    setFileError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <Label htmlFor="category-image" className="text-base font-semibold">
        Ảnh đại diện loại vải
      </Label>
      <p className="text-sm text-muted-foreground">
        Tải ảnh đại diện cho loại vải (tối đa 10MB, định dạng: JPEG/PNG/GIF/WEBP)
      </p>

      {/* Current Image Display */}
      {preview && !selectedFile && (
        <div className="relative w-full h-64 bg-muted rounded-lg overflow-hidden border border-border">
          <img
            src={preview}
            alt="Category preview"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Preview of Selected File */}
      {selectedFile && preview ? (
        <div className="relative w-full h-64 bg-muted rounded-lg overflow-hidden border border-border">
          <img
            src={preview}
            alt="Selected preview"
            className="w-full h-full object-cover"
          />
        </div>
      ) : null}

      {/* File Input Section */}
      <div className="space-y-2">
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
            <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm font-medium">Nhấp để chọn ảnh hoặc kéo thả</p>
            <p className="text-xs text-muted-foreground mt-1">
              JPEG, PNG, GIF, WebP (tối đa 10MB)
            </p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          id="category-image"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleFileChange}
          className="hidden"
          disabled={isLoading}
        />

        {fileError && <p className="text-sm text-red-500">{fileError}</p>}
      </div>

      {/* Action Buttons */}
      {selectedFile && (
        <div className="flex gap-2 justify-end pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleClearFile}
            disabled={isLoading}
          >
            Huỷ
          </Button>
          <Button
            type="button"
            onClick={handleUpload}
            disabled={isLoading || !selectedFile}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang tải...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Tải ảnh lên
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

export default CategoryImageUpload;
