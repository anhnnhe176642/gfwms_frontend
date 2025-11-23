'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { updateImageStatusSchema, type UpdateImageStatusFormData } from '@/schemas/yolo-image.schema';
import { yoloDatasetService } from '@/services/yolo-dataset.service';
import { getServerErrorMessage } from '@/lib/errorHandler';
import { useFormValidation } from '@/hooks/useFormValidation';

interface EditImageStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageId: string;
  onSuccess?: () => void;
}

export function EditImageStatusDialog({
  open,
  onOpenChange,
  imageId,
  onSuccess,
}: EditImageStatusDialogProps) {
  const [loadingImage, setLoadingImage] = useState(false);
  const { values, errors, touched, isLoading, handleChange, handleBlur, handleSubmit, setFieldValue } =
    useFormValidation<UpdateImageStatusFormData>(updateImageStatusSchema, async (data) => {
      try {
        await yoloDatasetService.updateImage(imageId, {
          status: data.status as any,
          notes: data.notes || undefined,
        });
        toast.success('Cập nhật trạng thái ảnh thành công');
        onOpenChange(false);
        onSuccess?.();
      } catch (err) {
        const message = getServerErrorMessage(err) || 'Không thể cập nhật trạng thái ảnh';
        toast.error(message);
      }
    });

  // Load image data when dialog opens
  useEffect(() => {
    if (open && imageId) {
      setLoadingImage(true);
      yoloDatasetService.getImageById(imageId)
        .then((image) => {
          setFieldValue('status', image.status || 'PENDING');
          setFieldValue('notes', image.notes || '');
        })
        .catch((err) => {
          console.error('Failed to load image:', err);
          toast.error('Không thể tải thông tin ảnh');
        })
        .finally(() => {
          setLoadingImage(false);
        });
    }
  }, [open, imageId, setFieldValue]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Cập nhật trạng thái ảnh</DialogTitle>
        </DialogHeader>

        {loadingImage ? (
          <div className="flex justify-center py-4">
            <div className="text-muted-foreground">Đang tải thông tin ảnh...</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">Trạng thái</Label>
              <Select value={values.status || 'PENDING'} onValueChange={(value) => {
                const event = {
                  target: {
                    name: 'status',
                    value,
                  },
                } as React.ChangeEvent<HTMLSelectElement>;
                handleChange(event);
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Chờ xử lý</SelectItem>
                  <SelectItem value="PROCESSING">Đang xử lý</SelectItem>
                  <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
                  <SelectItem value="FAILED">Thất bại</SelectItem>
                </SelectContent>
              </Select>
              {touched.status && errors.status && (
                <p className="text-sm text-red-600">{errors.status}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Ghi chú</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Nhập ghi chú"
                value={values.notes || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isLoading}
              />
              {touched.notes && errors.notes && (
                <p className="text-sm text-red-600">{errors.notes}</p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Đang cập nhật...' : 'Cập nhật'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
