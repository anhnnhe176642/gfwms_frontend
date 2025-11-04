'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFormValidation } from '@/hooks/useFormValidation';
import {
  requestPasswordResetSchema,
  verifyResetPinSchema,
  setNewPasswordSchema,
  type RequestPasswordResetData,
  type VerifyResetPinData,
  type SetNewPasswordData,
} from '@/schemas/auth.schema';
import authService from '@/services/auth.service';
import { extractFieldErrors, getServerErrorMessage } from '@/lib/errorHandler';
import { toast } from 'sonner';
import Link from 'next/link';

type Step = 'email' | 'verify-pin' | 'new-password';

interface ForgotPasswordState {
  email: string;
  pin: string;
}

export function ForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('email');
  const [formState, setFormState] = useState<ForgotPasswordState>({ email: '', pin: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [resendCountdown, setResendCountdown] = useState(0);

  // Countdown timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  // Handle resend PIN
  const handleResendPin = async () => {
    setIsLoading(true);
    try {
      await authService.requestPasswordReset(formState.email);
      setResendCountdown(30);
      setServerError(null);
      toast.success('Mã PIN mới đã được gửi đến email của bạn');
    } catch (err) {
      const fieldErrors = extractFieldErrors(err);
      if (Object.keys(fieldErrors).length === 0) {
        const msg = getServerErrorMessage(err);
        setServerError(msg);
      }
      toast.error(getServerErrorMessage(err) || 'Gửi lại mã PIN thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 1: Request password reset (email)
  const emailForm = useFormValidation<RequestPasswordResetData>(
    requestPasswordResetSchema,
    async (data) => {
      setIsLoading(true);
      try {
        await authService.requestPasswordReset(data.email);
        setFormState({ email: data.email, pin: '' });
        setStep('verify-pin');
        setResendCountdown(30);
        setServerError(null);
        toast.success('Mã PIN đã được gửi đến email của bạn');
      } catch (err) {
        // Extract field-level errors từ backend
        const fieldErrors = extractFieldErrors(err);
        if (Object.keys(fieldErrors).length > 0) {
          emailForm.setFieldErrors(fieldErrors);
          // Chỉ hiển thị server error nếu không có field errors
          setServerError(null);
        } else {
          const msg = getServerErrorMessage(err);
          setServerError(msg);
        }
        toast.error(fieldErrors.email || getServerErrorMessage(err) || 'Gửi mã xác thực thất bại');
      } finally {
        setIsLoading(false);
      }
    }
  );

  // Step 2: Verify PIN - only PIN field
  const verifyPinForm = useFormValidation<VerifyResetPinData>(
    verifyResetPinSchema,
    async (data) => {
      setIsLoading(true);
      try {
        await authService.verifyResetPin(formState.email, data.pin);
        setFormState({ ...formState, pin: data.pin });
        setStep('new-password');
        setServerError(null);
        toast.success('Mã PIN đã được xác thực');
      } catch (err) {
        // Extract field-level errors từ backend
        const fieldErrors = extractFieldErrors(err);
        if (Object.keys(fieldErrors).length > 0) {
          verifyPinForm.setFieldErrors(fieldErrors);
          // Chỉ hiển thị server error nếu không có field errors
          setServerError(null);
        } else {
          const msg = getServerErrorMessage(err);
          setServerError(msg);
        }
        toast.error(fieldErrors.pin || getServerErrorMessage(err) || 'Xác thực mã PIN thất bại');
      } finally {
        setIsLoading(false);
      }
    }
  );

  // Step 3: Set new password
  const newPasswordForm = useFormValidation<SetNewPasswordData>(
    setNewPasswordSchema,
    async (data) => {
      setIsLoading(true);
      try {
        await authService.setNewPassword(formState.email, formState.pin, data.newPassword);
        toast.success('Mật khẩu đã được đặt lại thành công');
        router.push('/login');
      } catch (err) {
        // Extract field-level errors từ backend
        const fieldErrors = extractFieldErrors(err);
        if (Object.keys(fieldErrors).length > 0) {
          newPasswordForm.setFieldErrors(fieldErrors);
          // Chỉ hiển thị server error nếu không có field errors
          setServerError(null);
        } else {
          const msg = getServerErrorMessage(err);
          setServerError(msg);
        }
        toast.error(fieldErrors.newPassword || getServerErrorMessage(err) || 'Đặt mật khẩu mới thất bại');
      } finally {
        setIsLoading(false);
      }
    }
  );

  // Step 1: Email input
  if (step === 'email') {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Quên mật khẩu</CardTitle>
          <CardDescription>
            Nhập email của bạn để nhận mã xác thực
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={emailForm.handleSubmit} className="space-y-4">
            {serverError && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-200">
                {serverError}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="text"
                placeholder="your@email.com"
                value={emailForm.values.email || ''}
                onChange={emailForm.handleChange}
                onBlur={emailForm.handleBlur}
                disabled={isLoading}
                className={emailForm.touched.email && emailForm.errors.email ? 'border-red-500' : ''}
              />
              {emailForm.touched.email && emailForm.errors.email && (
                <p className="text-xs text-red-500">{emailForm.errors.email}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Đang gửi...' : 'Gửi mã xác thực'}
            </Button>

            <div className="text-center text-sm">
              <Link href="/login" className="text-blue-600 hover:underline dark:text-blue-400">
                Quay lại đăng nhập
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  // Step 2: Verify PIN
  if (step === 'verify-pin') {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Xác thực mã PIN</CardTitle>
          <CardDescription>
            Nhập mã PIN 6 ký tự đã được gửi đến email <span className="font-medium">{formState.email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={verifyPinForm.handleSubmit} className="space-y-4">
            {serverError && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-200">
                {serverError}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="pin" className="text-sm font-medium">
                Mã PIN
              </label>
              <Input
                id="pin"
                name="pin"
                type="text"
                inputMode="numeric"
                placeholder="000000"
                maxLength={6}
                value={verifyPinForm.values.pin || ''}
                onChange={verifyPinForm.handleChange}
                onBlur={verifyPinForm.handleBlur}
                disabled={isLoading}
                className={verifyPinForm.touched.pin && verifyPinForm.errors.pin ? 'border-red-500' : ''}
              />
              {verifyPinForm.touched.pin && verifyPinForm.errors.pin && (
                <p className="text-xs text-red-500">{verifyPinForm.errors.pin}</p>
              )}
            </div>

            <div className="text-center">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleResendPin}
                disabled={resendCountdown > 0 || isLoading}
                className="text-xs"
              >
                {resendCountdown > 0
                  ? `Gửi lại mã sau ${resendCountdown}s`
                  : 'Gửi lại mã PIN'}
              </Button>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Đang xác thực...' : 'Xác thực mã PIN'}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                setStep('email');
                setServerError(null);
              }}
              disabled={isLoading}
            >
              Quay lại
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  // Step 3: New password
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Đặt mật khẩu mới</CardTitle>
        <CardDescription>
          Nhập mật khẩu mới của bạn
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={newPasswordForm.handleSubmit} className="space-y-4">
          {serverError && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-200">
              {serverError}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="newPassword" className="text-sm font-medium">
              Mật khẩu mới
            </label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              placeholder="Nhập mật khẩu mới"
              value={newPasswordForm.values.newPassword}
              onChange={newPasswordForm.handleChange}
              onBlur={newPasswordForm.handleBlur}
              disabled={isLoading}
              className={newPasswordForm.touched.newPassword && newPasswordForm.errors.newPassword ? 'border-red-500' : ''}
            />
            {newPasswordForm.touched.newPassword && newPasswordForm.errors.newPassword && (
              <p className="text-xs text-red-500">{newPasswordForm.errors.newPassword}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Đang cập nhật...' : 'Đặt mật khẩu mới'}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => {
              setStep('verify-pin');
              setServerError(null);
            }}
            disabled={isLoading}
          >
            Quay lại
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
