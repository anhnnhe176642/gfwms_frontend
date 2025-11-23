'use client';

import { useState, useRef } from 'react';
import { profileService } from '@/services/profile.service';
import { validateAvatarFile } from '@/schemas/profile.schema';
import { getServerErrorMessage } from '@/lib/errorHandler';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Upload, User, Lightbulb } from 'lucide-react';
import Image from 'next/image';
import type { ProfileUser } from '@/types/user';

interface AvatarUploadProps {
  user: ProfileUser;
  onSuccess?: (avatarUrl: string) => void;
}

export function AvatarUpload({ user, onSuccess }: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(user.avatar);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validation
    const error = validateAvatarFile(file);
    if (error) {
      toast.error(error);
      return;
    }

    setSelectedFile(file);

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Vui lòng chọn file ảnh');
      return;
    }

    setIsUploading(true);

    try {
      const response = await profileService.updateAvatar(selectedFile);
      
      toast.success(response.message || 'Cập nhật avatar thành công');
      setPreviewUrl(response.user.avatar);
      setSelectedFile(null);
      
      if (onSuccess) {
        onSuccess(response.user.avatar);
      }
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      const errorMsg = getServerErrorMessage(err) || 'Có lỗi xảy ra khi upload avatar';
      toast.error(errorMsg);
      
      // Revert preview on error
      setPreviewUrl(user.avatar);
      setSelectedFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreviewUrl(user.avatar);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Avatar</CardTitle>
        <CardDescription>
          Upload ảnh đại diện của bạn. Chỉ chấp nhận JPEG, PNG, GIF, WEBP (tối đa 5MB).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Avatar Preview */}
        <div className="flex justify-center">
          <div className="relative h-40 w-40 overflow-hidden rounded-full border-4 border-muted">
            {previewUrl ? (
              <Image
                src={previewUrl}
                alt="Avatar"
                fill
                className="object-cover"
                unoptimized={previewUrl.startsWith('data:')}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted">
                <User className="h-20 w-20 text-muted-foreground" />
              </div>
            )}
          </div>
        </div>

        {/* File Input (Hidden) */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Action Buttons */}
        <div className="space-y-2">
          {!selectedFile ? (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={triggerFileInput}
              disabled={isUploading}
            >
              <Upload className="mr-2 h-4 w-4" />
              Chọn ảnh mới
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                type="button"
                className="flex-1"
                onClick={handleUpload}
                disabled={isUploading}
              >
                {isUploading ? 'Đang upload...' : 'Upload'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleCancel}
                disabled={isUploading}
              >
                Hủy
              </Button>
            </div>
          )}
        </div>

        {/* File Info */}
        {selectedFile && (
          <div className="rounded-md bg-muted p-3">
            <p className="text-sm">
              <span className="font-medium">File đã chọn:</span> {selectedFile.name}
            </p>
            <p className="text-sm text-muted-foreground">
              Kích thước: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        )}

        {/* Info */}
        <div className="rounded-md border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950 flex gap-2 items-start">
          <Lightbulb className="w-4 h-4 shrink-0 mt-0.5 text-blue-800 dark:text-blue-200" />
          <p className="text-xs text-blue-800 dark:text-blue-200">
            Avatar cũ sẽ tự động bị xóa khỏi server khi bạn upload ảnh mới.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
