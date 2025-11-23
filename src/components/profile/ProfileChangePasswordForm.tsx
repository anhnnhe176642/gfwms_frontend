'use client';

import { useState } from 'react';
import { useFormValidation } from '@/hooks/useFormValidation';
import { changePasswordSchema, type ChangePasswordFormData } from '@/schemas/profile.schema';
import { profileService } from '@/services/profile.service';
import { extractFieldErrors, getServerErrorMessage } from '@/lib/errorHandler';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Eye, EyeOff, KeyRound, Lightbulb } from 'lucide-react';

interface ChangePasswordFormProps {
  onSuccess?: () => void;
}

export function ProfileChangePasswordForm({ onSuccess }: ChangePasswordFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string>('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { values, errors, touched, handleChange, handleBlur, handleSubmit, setFieldErrors, resetForm } =
    useFormValidation<ChangePasswordFormData>(changePasswordSchema, async (data) => {
      setIsSubmitting(true);
      setServerError('');

      try {
        const response = await profileService.changePassword({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        });
        
        toast.success(response.message || 'Đổi password thành công');
        resetForm();
        
        // Reset password visibility
        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
        
        if (onSuccess) {
          onSuccess();
        }
      } catch (err: any) {
        const fieldErrors = extractFieldErrors(err);
        if (fieldErrors) {
          setFieldErrors(fieldErrors);
        }
        
        const errorMsg = getServerErrorMessage(err) || 'Có lỗi xảy ra';
        setServerError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setIsSubmitting(false);
      }
    });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-primary/10 p-2">
            <KeyRound className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Đổi mật khẩu</CardTitle>
            <CardDescription>
              Cập nhật mật khẩu của bạn để bảo mật tài khoản
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Password */}
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                name="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                value={values.currentPassword || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Nhập mật khẩu hiện tại"
                autoComplete="current-password"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                tabIndex={-1}
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            {touched.currentPassword && errors.currentPassword && (
              <p className="text-sm text-destructive">{errors.currentPassword}</p>
            )}
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <Label htmlFor="newPassword">Mật khẩu mới</Label>
            <div className="relative">
              <Input
                id="newPassword"
                name="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                value={values.newPassword || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Nhập mật khẩu mới"
                autoComplete="new-password"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowNewPassword(!showNewPassword)}
                tabIndex={-1}
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            {touched.newPassword && errors.newPassword && (
              <p className="text-sm text-destructive">{errors.newPassword}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={values.confirmPassword || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Nhập lại mật khẩu mới"
                autoComplete="new-password"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            {touched.confirmPassword && errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Server Error */}
          {serverError && (
            <div className="rounded-md bg-destructive/15 p-3">
              <p className="text-sm text-destructive">{serverError}</p>
            </div>
          )}

          {/* Info */}
          <div className="rounded-md border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950 flex gap-2 items-start">
            <Lightbulb className="w-4 h-4 shrink-0 mt-0.5 text-blue-800 dark:text-blue-200" />
            <p className="text-xs text-blue-800 dark:text-blue-200">
              Sau khi đổi password thành công, bạn không cần đăng nhập lại. Token hiện tại vẫn còn hiệu lực.
            </p>
          </div>

          {/* Submit Button */}
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
