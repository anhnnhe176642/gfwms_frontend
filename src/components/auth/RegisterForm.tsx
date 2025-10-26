import React, { useState } from 'react';
import { Loader2, UserPlus } from 'lucide-react';
import useFormValidation from '../../hooks/useFormValidation';
import { registerSchema, type RegisterFormData } from '../../schemas/auth.schema';
import authService, { type RegisterPayload } from '../../services/auth.service';
import { extractFieldErrors, getServerErrorMessage } from '../../lib/errorHandler';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Props = {
  onSuccess?: () => void;
};

export const RegisterForm: React.FC<Props> = ({ onSuccess }) => {
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
    setFieldErrors,
  } = useFormValidation<RegisterFormData>(registerSchema, async (formData) => {
    setServerError(null);
    setSuccessMessage(null);
    try {
      const payload: RegisterPayload = {
        username: formData.username,
        password: formData.password,
        email: formData.email,
        phone: formData.phone || '',
        fullname: formData.fullname || '',
        gender: (formData.gender as 'MALE' | 'FEMALE' | 'OTHER') || 'OTHER',
        address: formData.address || '',
        dob: formData.dob || '',
      };

      await authService.register(payload);
      setSuccessMessage('Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.');
      onSuccess?.();
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
        setServerError('Đăng ký thất bại');
      }
    }
  });

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
          <UserPlus className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-2xl">Đăng ký tài khoản</CardTitle>
        <CardDescription>Tạo tài khoản mới để sử dụng hệ thống</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username & Email - Row 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                value={values.username || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="username"
                className={touched.username && errors.username ? 'border-destructive' : ''}
              />
              {touched.username && errors.username && (
                <p className="text-sm text-destructive">{errors.username}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                name="email"
                value={values.email || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="email@example.com"
                className={touched.email && errors.email ? 'border-destructive' : ''}
              />
              {touched.email && errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>
          </div>

          {/* Password & Phone - Row 2 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                name="password"
                value={values.password || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="••••••••"
                className={touched.password && errors.password ? 'border-destructive' : ''}
              />
              {touched.password && errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input
                id="phone"
                type="tel"
                name="phone"
                value={values.phone || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="0123456789"
                className={touched.phone && errors.phone ? 'border-destructive' : ''}
              />
              {touched.phone && errors.phone && (
                <p className="text-sm text-destructive">{errors.phone}</p>
              )}
            </div>
          </div>

          {/* Fullname & Gender - Row 3 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullname">Họ và tên</Label>
              <Input
                id="fullname"
                name="fullname"
                value={values.fullname || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Nguyễn Văn A"
                className={touched.fullname && errors.fullname ? 'border-destructive' : ''}
              />
              {touched.fullname && errors.fullname && (
                <p className="text-sm text-destructive">{errors.fullname}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Giới tính</Label>
              <Select
                name="gender"
                value={values.gender || ''}
                onValueChange={(value: string) => {
                  const event = { target: { name: 'gender', value } } as React.ChangeEvent<HTMLInputElement>;
                  handleChange(event);
                }}
              >
                <SelectTrigger className={touched.gender && errors.gender ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Chọn giới tính" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Nam</SelectItem>
                  <SelectItem value="FEMALE">Nữ</SelectItem>
                  <SelectItem value="OTHER">Khác</SelectItem>
                </SelectContent>
              </Select>
              {touched.gender && errors.gender && (
                <p className="text-sm text-destructive">{errors.gender}</p>
              )}
            </div>
          </div>

          {/* Date of Birth & Address - Row 4 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dob">Ngày sinh</Label>
              <Input
                id="dob"
                type="date"
                name="dob"
                value={values.dob || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                className={touched.dob && errors.dob ? 'border-destructive' : ''}
              />
              {touched.dob && errors.dob && (
                <p className="text-sm text-destructive">{errors.dob}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Địa chỉ</Label>
              <Input
                id="address"
                name="address"
                value={values.address || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="123 Đường ABC"
                className={touched.address && errors.address ? 'border-destructive' : ''}
              />
              {touched.address && errors.address && (
                <p className="text-sm text-destructive">{errors.address}</p>
              )}
            </div>
          </div>

          {/* Error Alert */}
          {serverError && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {serverError}
            </div>
          )}

          {/* Success Alert */}
          {successMessage && (
            <div className="p-3 text-sm text-green-700 bg-green-50 rounded-md">
              {successMessage}
            </div>
          )}

          {/* Submit Button */}
          <Button type="submit" className="w-full cursor-pointer" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Đang đăng ký...' : 'Đăng Ký'}
          </Button>

          {/* Login Link */}
          <div className="text-center text-sm text-muted-foreground">
            <span>Đã có tài khoản? </span>
            <a href="/login" className="text-primary hover:underline font-medium">
              Đăng nhập
            </a>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default RegisterForm;
