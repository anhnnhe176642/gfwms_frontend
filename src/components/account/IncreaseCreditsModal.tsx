'use client';

import { useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { creditRequestService } from '@/services/creditRequest.service';
import { extractFieldErrors, getServerErrorMessage } from '@/lib/errorHandler';
import { formatCurrency } from '@/lib/formatters';
import { Loader2 } from 'lucide-react';

interface IncreaseCreditsFormInput {
  requestLimit: number | '';
  note: string;
}

interface IncreaseCreditsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentLimit?: number;
  onSuccess?: () => void;
}

export function IncreaseCreditsModal({ open, onOpenChange, currentLimit = 0, onSuccess }: IncreaseCreditsModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [displayValue, setDisplayValue] = useState('');

  // Format number to currency display (1000000 -> "1.000.000")
  const formatCurrencyDisplay = useCallback((value: number | string): string => {
    const num = typeof value === 'string' ? value.replace(/\D/g, '') : String(value);
    if (!num) return '';
    return Number(num).toLocaleString('vi-VN');
  }, []);

  // Parse currency display back to number ("1.000.000" -> 1000000)
  const parseCurrencyDisplay = useCallback((value: string): number => {
    return parseInt(value.replace(/\D/g, ''), 10) || 0;
  }, []);

  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
    setError,
  } = useForm<IncreaseCreditsFormInput>({
    defaultValues: {
      requestLimit: '',
      note: '',
    },
  });

  const validateForm = (data: IncreaseCreditsFormInput): boolean => {
    let hasError = false;

    // Validate requestLimit
    if (data.requestLimit === '' || data.requestLimit === null || data.requestLimit === undefined) {
      setError('requestLimit', { message: 'Hạn mức là bắt buộc' });
      hasError = true;
    } else if (typeof data.requestLimit === 'number' && data.requestLimit <= 0) {
      setError('requestLimit', { message: 'Hạn mức phải lớn hơn 0' });
      hasError = true;
    }

    // Validate note
    if (data.note && data.note.length > 500) {
      setError('note', { message: 'Ghi chú không được vượt quá 500 ký tự' });
      hasError = true;
    }

    return !hasError;
  };

  const onSubmit = async (data: IncreaseCreditsFormInput) => {
    if (!validateForm(data)) {
      return;
    }

    setIsSubmitting(true);
    try {
      await creditRequestService.increaseCredit({
        requestLimit: typeof data.requestLimit === 'number' ? data.requestLimit : Number(data.requestLimit),
        ...(data.note && { note: data.note }),
      });
      toast.success('Đơn tăng hạn mức công nợ đã được gửi thành công!');
      reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      const fieldErrors = extractFieldErrors(error);
      const message = getServerErrorMessage(error);

      if (fieldErrors.requestLimit) {
        setError('requestLimit', { message: fieldErrors.requestLimit });
      }
      if (fieldErrors.note) {
        setError('note', { message: fieldErrors.note });
      }

      if (message) {
        toast.error(message);
      } else {
        toast.error('Đã xảy ra lỗi khi tạo đơn tăng hạn mức');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tăng hạn mức công nợ</DialogTitle>
          <DialogDescription>
            Vui lòng nhập hạn mức công nợ mà bạn muốn tăng lên
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {currentLimit > 0 && (
            <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg">
              <p className="text-sm text-blue-600 dark:text-blue-400">
                Hạn mức hiện tại: <span className="font-semibold">{currentLimit.toLocaleString('vi-VN')} ₫</span>
              </p>
            </div>
          )}

          {/* Request Limit */}
          <div className="space-y-2">
            <label htmlFor="requestLimit" className="block text-sm font-medium">
              Hạn mức mới (₫) <span className="text-red-500">*</span>
            </label>
            <Controller
              control={control}
              name="requestLimit"
              render={({ field }) => (
                <div className="space-y-1">
                  <Input
                    id="requestLimit"
                    type="text"
                    inputMode="numeric"
                    placeholder="Nhập hạn mức mới"
                    disabled={isSubmitting}
                    maxLength={String(Number.MAX_SAFE_INTEGER).length}
                    value={displayValue}
                    onChange={(e) => {
                      const inputValue = e.target.value.replace(/\D/g, '');
                      // Limit to MAX_SAFE_INTEGER
                      if (inputValue && parseInt(inputValue, 10) > Number.MAX_SAFE_INTEGER) {
                        return;
                      }
                      setDisplayValue(inputValue ? formatCurrencyDisplay(inputValue) : '');
                      field.onChange(inputValue ? parseInt(inputValue, 10) : '');
                    }}
                  />
                  {displayValue && (
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(parseCurrencyDisplay(displayValue))}
                    </p>
                  )}
                </div>
              )}
            />
            {errors.requestLimit && (
              <p className="text-sm text-red-500">{errors.requestLimit.message}</p>
            )}
          </div>

          {/* Note */}
          <div className="space-y-2">
            <label htmlFor="note" className="block text-sm font-medium">
              Ghi chú (Tùy chọn)
            </label>
            <Controller
              control={control}
              name="note"
              render={({ field }) => (
                <Textarea
                  {...field}
                  id="note"
                  placeholder="Nhập ghi chú"
                  disabled={isSubmitting}
                  rows={3}
                />
              )}
            />
            {errors.note && (
              <p className="text-sm text-red-500">{errors.note.message}</p>
            )}
            {!errors.note && (
              <p className="text-xs text-muted-foreground">Tối đa 500 ký tự</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isSubmitting ? 'Đang gửi...' : 'Gửi đơn'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
