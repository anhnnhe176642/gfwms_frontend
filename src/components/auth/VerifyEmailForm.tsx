'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import useFormValidation from '../../hooks/useFormValidation';
import { verifyEmailSchema, type VerifyEmailData } from '../../schemas/auth.schema';
import authService from '../../services/auth.service';
import { extractFieldErrors, getServerErrorMessage } from '../../lib/errorHandler';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { useAuth } from '@/hooks/useAuth';

const RESEND_COOLDOWN = parseInt(process.env.NEXT_PUBLIC_VERIFY_PIN_RESEND_COOLDOWN_SECONDS || '60', 10);

type Props = {
  className?: string;
  defaultEmail?: string;
} & React.ComponentProps<'div'>;

export const VerifyEmailForm: React.FC<Props> = ({ className, defaultEmail, ...props }) => {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const router = useRouter();
  const { setAuthData } = useAuth();

  const {
    values,
    errors,
    touched,
    isLoading,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldErrors,
    setFieldValue,
  } = useFormValidation<VerifyEmailData>(
    verifyEmailSchema, 
    async (formData) => {
      setServerError(null);
      try {
        const response = await authService.verifyEmail(formData.email, formData.pin);
        
        // Lưu token và user vào store
        if (response.token && response.user) {
          setAuthData(response.user, response.token);
        }
        
        router.push('/');
      } catch (err: unknown) {
        const message = getServerErrorMessage(err);
        const fieldErrors = extractFieldErrors(err);

        if (Object.keys(fieldErrors).length > 0) {
          setFieldErrors(fieldErrors);
        }

        if (message && Object.keys(fieldErrors).length === 0) {
          setServerError(message);
        }

        if (Object.keys(fieldErrors).length === 0 && !message) {
          setServerError('Xác thực thất bại');
        }
      }
    }
  );

  // Set email mặc định nếu có và bắt đầu cooldown lần đầu
  React.useEffect(() => {
    if (defaultEmail) {
      setFieldValue('email', defaultEmail);
      // Bắt đầu cooldown lần đầu tiên nếu email từ params
      setCooldownSeconds(RESEND_COOLDOWN);
    }
  }, [defaultEmail, setFieldValue]);

  // Countdown timer cho cooldown
  useEffect(() => {
    if (cooldownSeconds <= 0) return;

    const timer = setInterval(() => {
      setCooldownSeconds(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  const handleResendPin = async () => {
    if (!values.email) {
      setServerError('Vui lòng nhập email');
      return;
    }

    setIsResending(true);
    setResendSuccess(false);
    setServerError(null);

    try {
      await authService.resendVerification(values.email);
      setResendSuccess(true);
      
      // Bắt đầu cooldown
      setCooldownSeconds(RESEND_COOLDOWN);
      
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (err: unknown) {
      const message = getServerErrorMessage(err);
      setServerError(message || 'Gửi lại mã thất bại');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className="overflow-hidden">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-4">
              <Mail className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">Xác thực Email</h1>
          <p className="text-muted-foreground text-balance">
            Nhập mã xác thực 6 chữ số đã được gửi đến email của bạn
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  value={values.email || ''}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="email@example.com"
                  className={touched.email && errors.email ? 'border-destructive' : ''}
                  disabled={!!defaultEmail}
                />
                {touched.email && errors.email && (
                  <p className="text-sm text-destructive mt-1">{errors.email}</p>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="pin">Mã xác thực</FieldLabel>
                <Input
                  id="pin"
                  type="text"
                  name="pin"
                  value={values.pin || ''}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="123456"
                  maxLength={6}
                  className={cn(
                    'text-center text-2xl tracking-widest font-mono',
                    touched.pin && errors.pin ? 'border-destructive' : ''
                  )}
                />
                {touched.pin && errors.pin && (
                  <p className="text-sm text-destructive mt-1">{errors.pin}</p>
                )}
                <FieldDescription>
                  Mã xác thực gồm 6 chữ số
                </FieldDescription>
              </Field>

              {/* Error Alert */}
              {serverError && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md" role="alert">
                  {serverError}
                </div>
              )}

              {/* Success Alert */}
              {resendSuccess && (
                <div className="p-3 text-sm text-green-700 bg-green-50 dark:bg-green-950 dark:text-green-300 rounded-md">
                  Mã xác thực mới đã được gửi đến email của bạn
                </div>
              )}

              <Field>
                <Button type="submit" className="w-full cursor-pointer" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isLoading ? 'Đang xác thực...' : 'Xác Thực Email'}
                </Button>
              </Field>

              <Field>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full cursor-pointer"
                  onClick={handleResendPin}
                  disabled={isResending || !values.email || cooldownSeconds > 0}
                >
                  {isResending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {cooldownSeconds > 0 
                    ? `Gửi lại mã trong ${cooldownSeconds}s`
                    : (isResending ? 'Đang gửi...' : 'Gửi lại mã xác thực')
                  }
                </Button>
              </Field>

              <FieldDescription className="text-center">
                Quay lại{' '}
                <a href="/auth/login" className="text-primary hover:underline font-medium">
                  Đăng nhập
                </a>
              </FieldDescription>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      <FieldDescription className="px-6 text-center text-muted-foreground">
        Không nhận được mã? Kiểm tra hộp thư spam hoặc nhấn "Gửi lại mã xác thực"
      </FieldDescription>
    </div>
  );
};

export default VerifyEmailForm;
