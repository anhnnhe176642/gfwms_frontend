import React, { useState } from 'react';
import { Eye, EyeOff, Loader2, Lock } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import useFormValidation from '../../hooks/useFormValidation';
import { loginSchema, type LoginFormData } from '../../schemas/auth.schema';
import { extractFieldErrors, getServerErrorMessage } from '../../lib/errorHandler';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type Props = {
  onSuccess?: () => void;
};

export const LoginForm: React.FC<Props> = ({ onSuccess }) => {
  const { login } = useAuth();
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    values,
    errors,
    touched,
    isLoading,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldErrors,
  } = useFormValidation<LoginFormData>(loginSchema, async (formData) => {
    setServerError(null);
    try {
      await login(formData.usernameOrEmail, formData.password);
      onSuccess?.();
    } catch (err: unknown) {
      const fieldErrors = extractFieldErrors(err);
      if (Object.keys(fieldErrors).length > 0) {
        setFieldErrors(fieldErrors);
      }

      const message = getServerErrorMessage(err);
      if (message && Object.keys(fieldErrors).length === 0) {
        setServerError(message);
      }

      if (Object.keys(fieldErrors).length === 0 && !message) {
        setServerError('Đăng nhập thất bại');
      }
    }
  });

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
          <Lock className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-2xl">Đăng nhập vào hệ thống</CardTitle>
        <CardDescription>Nhập tài khoản của bạn để tiếp tục</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4" aria-live="polite">
          <div className="space-y-2">
            <Label htmlFor="usernameOrEmail">Username hoặc Email</Label>
            <Input
              id="usernameOrEmail"
              name="usernameOrEmail"
              value={values.usernameOrEmail || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              type="text"
              autoComplete="username"
              placeholder="Nhập username hoặc email"
              className={touched.usernameOrEmail && errors.usernameOrEmail ? 'border-destructive' : ''}
            />
            {touched.usernameOrEmail && errors.usernameOrEmail && (
              <p className="text-sm text-destructive">{errors.usernameOrEmail}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mật khẩu</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                value={values.password || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                className={touched.password && errors.password ? 'border-destructive pr-10' : 'pr-10'}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            {touched.password && errors.password && (
              <p className="text-sm text-destructive">{errors.password}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={remember}
                onCheckedChange={(checked: boolean) => setRemember(checked)}
              />
              <Label
                htmlFor="remember"
                className="text-sm font-normal cursor-pointer"
              >
                Ghi nhớ đăng nhập
              </Label>
            </div>
            <a className="text-sm text-primary hover:underline" href="/forgot-password">
              Quên mật khẩu?
            </a>
          </div>

          {serverError && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md" role="alert">
              {serverError}
            </div>
          )}

          <Button type="submit" className="w-full cursor-pointer" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            <span>Chưa có tài khoản? </span>
            <a href="/register" className="text-primary hover:underline font-medium">
              Đăng ký
            </a>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default LoginForm;

