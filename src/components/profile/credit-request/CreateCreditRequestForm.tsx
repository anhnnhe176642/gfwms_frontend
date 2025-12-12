'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { creditRequestService } from '@/services/creditRequest.service';
import { getServerErrorMessage, extractFieldErrors } from '@/lib/errorHandler';
import { ROUTES } from '@/config/routes';
import { Loader2 } from 'lucide-react';

interface CreateCreditRequestFormInput {
  requestLimit: string;
  note: string;
}

interface CreateCreditRequestFormProps {
  isCustomerForm?: boolean;
}

export function CreateCreditRequestForm({ isCustomerForm = false }: CreateCreditRequestFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<CreateCreditRequestFormInput>({
    defaultValues: {
      requestLimit: '',
      note: '',
    },
  });

  const validateForm = (data: CreateCreditRequestFormInput): boolean => {
    let hasError = false;

    // Validate requestLimit
    if (!data.requestLimit || data.requestLimit.trim() === '') {
      setError('requestLimit', { message: 'Hạn mức là bắt buộc' });
      hasError = true;
    } else {
      const limit = Number(data.requestLimit);
      if (isNaN(limit)) {
        setError('requestLimit', { message: 'Hạn mức phải là số' });
        hasError = true;
      } else if (limit <= 0) {
        setError('requestLimit', { message: 'Hạn mức phải lớn hơn 0' });
        hasError = true;
      }
    }

    // Validate note
    if (data.note && data.note.length > 500) {
      setError('note', { message: 'Ghi chú không được vượt quá 500 ký tự' });
      hasError = true;
    }

    return !hasError;
  };

  const onSubmit = async (data: CreateCreditRequestFormInput) => {
    if (!validateForm(data)) {
      return;
    }

    setIsSubmitting(true);
    try {
      await creditRequestService.createInitialRequest({
        requestLimit: Number(data.requestLimit),
        ...(data.note && { note: data.note }),
      });
      
      toast.success('Tạo đơn đăng ký hạn mức thành công. Vui lòng chờ duyệt.');
      
      if (isCustomerForm) {
        router.push('/');
      } else {
        router.push(ROUTES.ADMIN.CREDIT_REQUESTS.LIST.path);
      }
    } catch (error) {
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
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-0 shadow-none bg-transparent">
      <CardContent className="px-0">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Request Limit */}
          <div className="space-y-2">
            <label htmlFor="requestLimit" className="block text-sm font-medium">
              Hạn mức mong muốn <span className="text-red-500">*</span>
            </label>
            <Controller
              control={control}
              name="requestLimit"
              render={({ field }) => (
                <Input
                  {...field}
                  id="requestLimit"
                  type="number"
                  placeholder="Nhập hạn mức (VND)"
                  disabled={isSubmitting}
                  className="text-base"
                />
              )}
            />
            {errors.requestLimit && (
              <p className="text-sm text-red-500">{errors.requestLimit.message}</p>
            )}
          </div>

          {/* Note */}
          <div className="space-y-2">
            <label htmlFor="note" className="block text-sm font-medium">
              Ghi chú (không bắt buộc)
            </label>
            <Controller
              control={control}
              name="note"
              render={({ field }) => (
                <Textarea
                  {...field}
                  id="note"
                  placeholder="Nhập ghi chú thêm về yêu cầu của bạn..."
                  disabled={isSubmitting}
                  className="min-h-32 resize-none"
                />
              )}
            />
            {errors.note && (
              <p className="text-sm text-red-500">{errors.note.message}</p>
            )}
            {!errors.note && (
              <p className="text-xs text-muted-foreground">
                Tối đa 500 ký tự
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full"
            size="lg"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
