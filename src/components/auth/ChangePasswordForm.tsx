import React, { useState } from 'react';
import { Eye, EyeOff, Loader2, KeyRound } from 'lucide-react';
import useFormValidation from '../../hooks/useFormValidation';
import { changePasswordSchema, type ChangePasswordData } from '../../schemas/auth.schema';
import authService from '../../services/auth.service';
import { extractFieldErrors, getServerErrorMessage } from '../../lib/errorHandler';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type Props = {
  onSuccess?: () => void;
};

export const ChangePasswordForm: React.FC<Props> = ({ onSuccess }) => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    values,
    errors,
    touched,
    isLoading,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFieldErrors,
  } = useFormValidation<ChangePasswordData>(changePasswordSchema, async (formData) => {
    setServerError(null);
    setSuccessMessage(null);
    try {
      await authService.changePassword(formData.currentPassword, formData.newPassword);
      setSuccessMessage('Đổi mật khẩu thành công!');
      resetForm();
      onSuccess?.();
    } catch (err: unknown) {
      // Extract field errors from backend validation response (400)
      const fieldErrors = extractFieldErrors(err);
      if (Object.keys(fieldErrors).length > 0) {
        setFieldErrors(fieldErrors);
      }

      // Get server error message (409, 500, etc.)
      const message = getServerErrorMessage(err);
      if (message && Object.keys(fieldErrors).length === 0) {
        setServerError(message);
      }

      // Fallback error message
      if (Object.keys(fieldErrors).length === 0 && !message) {
        setServerError('Đổi mật khẩu thất bại');
      }
    }
  });

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
          <KeyRound className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-2xl">Đổi mật khẩu</CardTitle>
        <CardDescription>Cập nhật mật khẩu của bạn để bảo mật tài khoản</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4" aria-live="polite">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                name="currentPassword"
                value={values.currentPassword || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                type={showCurrentPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Nhập mật khẩu hiện tại"
                className={touched.currentPassword && errors.currentPassword ? 'border-destructive pr-10' : 'pr-10'}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowCurrentPassword((s) => !s)}
                aria-label={showCurrentPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
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

          <div className="space-y-2">
            <Label htmlFor="newPassword">Mật khẩu mới</Label>
            <div className="relative">
              <Input
                id="newPassword"
                name="newPassword"
                value={values.newPassword || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                type={showNewPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Nhập mật khẩu mới"
                className={touched.newPassword && errors.newPassword ? 'border-destructive pr-10' : 'pr-10'}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowNewPassword((s) => !s)}
                aria-label={showNewPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
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

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                value={values.confirmPassword || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Nhập lại mật khẩu mới"
                className={touched.confirmPassword && errors.confirmPassword ? 'border-destructive pr-10' : 'pr-10'}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowConfirmPassword((s) => !s)}
                aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
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

          {serverError && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md" role="alert">
              {serverError}
            </div>
          )}

          {successMessage && (
            <div className="p-3 text-sm text-green-700 bg-green-50 rounded-md" role="alert">
              {successMessage}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ChangePasswordForm;
