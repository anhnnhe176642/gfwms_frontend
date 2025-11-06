'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useFormValidation } from '@/hooks/useFormValidation';
import { updateShelfSchema, type UpdateShelfFormData } from '@/schemas/shelf.schema';
import { warehouseService } from '@/services/warehouse.service';
import { extractFieldErrors, getServerErrorMessage } from '@/lib/errorHandler';
import type { ShelfListItem } from '@/types/warehouse';

export interface EditShelfFormProps {
  shelf: ShelfListItem | null;
  warehouseId: number;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditShelfForm({
  shelf,
  warehouseId,
  open = false,
  onOpenChange,
  onSuccess,
}: EditShelfFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  // Form validation
  const { values, errors, touched, handleChange, handleBlur, handleSubmit, resetForm, setFieldErrors, setFieldValue } =
    useFormValidation<UpdateShelfFormData>(updateShelfSchema, async (data) => {
      if (!shelf) return;

      setIsSubmitting(true);
      setServerError('');

      try {
        await warehouseService.updateShelf(shelf.id, {
          code: data.code,
          maxQuantity: data.maxQuantity,
          warehouseId,
          currentQuantity: shelf.currentQuantity,
        });
        toast.success('Cập nhật kệ thành công');
        resetForm();
        onOpenChange?.(false);
        onSuccess?.();
      } catch (err) {
        const fieldErrors = extractFieldErrors(err);
        if (Object.keys(fieldErrors).length > 0) {
          setFieldErrors(fieldErrors);
        }
        const message = getServerErrorMessage(err);
        setServerError(message || 'Có lỗi xảy ra khi cập nhật kệ');
        toast.error(message || 'Có lỗi xảy ra');
      } finally {
        setIsSubmitting(false);
      }
    });

  // Initialize form with shelf data when modal opens
  useEffect(() => {
    if (open && shelf) {
      setServerError('');
      setFieldValue('code', shelf.code);
      setFieldValue('maxQuantity', shelf.maxQuantity);
    }
  }, [open, shelf, setFieldValue]);

  const handleClose = () => {
    resetForm();
    setServerError('');
    onOpenChange?.(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Chỉnh sửa kệ</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin chi tiết của kệ
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {serverError && (
            <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-2 rounded-md text-sm">
              {serverError}
            </div>
          )}

          {/* Mã kệ */}
          <div className="space-y-2">
            <Label htmlFor="code">
              Mã kệ <span className="text-destructive">*</span>
            </Label>
            <Input
              id="code"
              name="code"
              placeholder="Ví dụ: K001, K002"
              value={values.code ?? ''}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isSubmitting}
              className={touched.code && errors.code ? 'border-destructive' : ''}
            />
            {touched.code && errors.code && (
              <p className="text-sm text-destructive">{errors.code}</p>
            )}
          </div>

          {/* Sức chứa tối đa */}
          <div className="space-y-2">
            <Label htmlFor="maxQuantity">
              Sức chứa tối đa <span className="text-destructive">*</span>
            </Label>
            <Input
              id="maxQuantity"
              name="maxQuantity"
              type="number"
              placeholder="Ví dụ: 100"
              value={values.maxQuantity ?? ''}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isSubmitting}
              className={touched.maxQuantity && errors.maxQuantity ? 'border-destructive' : ''}
            />
            {touched.maxQuantity && errors.maxQuantity && (
              <p className="text-sm text-destructive">{errors.maxQuantity}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default EditShelfForm;
