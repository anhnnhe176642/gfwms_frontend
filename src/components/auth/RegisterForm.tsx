'use client';

import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import useFormValidation from '../../hooks/useFormValidation';
import { registerSchema, type RegisterFormData } from '../../schemas/auth.schema';
import authService, { type RegisterPayload } from '../../services/auth.service';
import { extractFieldErrors, getServerErrorMessage } from '../../lib/errorHandler';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field';

type Props = {
  className?: string;
  onSuccess?: (email: string) => void;
} & React.ComponentProps<'div'>;

export const RegisterForm: React.FC<Props> = ({ className, onSuccess, ...props }) => {
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
  } = useFormValidation<RegisterFormData>(registerSchema, async (formData) => {
    setServerError(null);
    try {
      const payload: RegisterPayload = {
        username: formData.username,
        password: formData.password,
        email: formData.email,
        phone: formData.phone || '',
        fullname: formData.fullname || '',
        gender: (formData.gender as 'MALE' | 'FEMALE'),
        address: formData.address || '',
        dob: formData.dob || '',
      };

      const response = await authService.register(payload);
      
      // Gọi callback (được truyền từ page)
      if (onSuccess) {
        onSuccess(response.user.email);
      }
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
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form onSubmit={handleSubmit} className="p-6 md:p-8">
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Tạo tài khoản mới</h1>
                <p className="text-muted-foreground text-balance">
                  Đăng ký tài khoản GFWMS để bắt đầu
                </p>
              </div>

              {/* Username & Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="username">Username</FieldLabel>
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
                    <p className="text-sm text-destructive mt-1">{errors.username}</p>
                  )}
                </Field>

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
                  />
                  {touched.email && errors.email && (
                    <p className="text-sm text-destructive mt-1">{errors.email}</p>
                  )}
                </Field>
              </div>

              {/* Password & Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="password">Mật khẩu</FieldLabel>
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
                    <p className="text-sm text-destructive mt-1">{errors.password}</p>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="phone">Số điện thoại</FieldLabel>
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
                    <p className="text-sm text-destructive mt-1">{errors.phone}</p>
                  )}
                </Field>
              </div>

              {/* Fullname & Gender */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="fullname">Họ và tên</FieldLabel>
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
                    <p className="text-sm text-destructive mt-1">{errors.fullname}</p>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="gender">Giới tính</FieldLabel>
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
                    </SelectContent>
                  </Select>
                  {touched.gender && errors.gender && (
                    <p className="text-sm text-destructive mt-1">{errors.gender}</p>
                  )}
                </Field>
              </div>

              {/* Date of Birth & Address */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="dob">Ngày sinh</FieldLabel>
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
                    <p className="text-sm text-destructive mt-1">{errors.dob}</p>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="address">Địa chỉ</FieldLabel>
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
                    <p className="text-sm text-destructive mt-1">{errors.address}</p>
                  )}
                </Field>
              </div>

              {/* Error Alert */}
              {serverError && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md" role="alert">
                  {serverError}
                </div>
              )}

              <Field>
                <Button type="submit" className="w-full cursor-pointer" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isLoading ? 'Đang đăng ký...' : 'Đăng Ký'}
                </Button>
              </Field>

              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Hoặc đăng ký với
              </FieldSeparator>

              <Field className="grid grid-cols-3 gap-4">
                <Button variant="outline" type="button">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                      fill="currentColor"
                    />
                  </svg>
                  <span className="sr-only">Đăng ký với Apple</span>
                </Button>
                <Button variant="outline" type="button">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  <span className="sr-only">Đăng ký với Google</span>
                </Button>
                <Button variant="outline" type="button">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M6.915 4.03c-1.968 0-3.683 1.28-4.871 3.113C.704 9.208 0 11.883 0 14.449c0 .706.07 1.369.21 1.973a6.624 6.624 0 0 0 .265.86 5.297 5.297 0 0 0 .371.761c.696 1.159 1.818 1.927 3.593 1.927 1.497 0 2.633-.671 3.965-2.444.76-1.012 1.144-1.626 2.663-4.32l.756-1.339.186-.325c.061.1.121.196.183.3l2.152 3.595c.724 1.21 1.665 2.556 2.47 3.314 1.046.987 1.992 1.22 3.06 1.22 1.075 0 1.876-.355 2.455-.843a3.743 3.743 0 0 0 .81-.973c.542-.939.861-2.127.861-3.745 0-2.72-.681-5.357-2.084-7.45-1.282-1.912-2.957-2.93-4.716-2.93-1.047 0-2.088.467-3.053 1.308-.652.57-1.257 1.29-1.82 2.05-.69-.875-1.335-1.547-1.958-2.056-1.182-.966-2.315-1.303-3.454-1.303zm10.16 2.053c1.147 0 2.188.758 2.992 1.999 1.132 1.748 1.647 4.195 1.647 6.4 0 1.548-.368 2.9-1.839 2.9-.58 0-1.027-.23-1.664-1.004-.496-.601-1.343-1.878-2.832-4.358l-.617-1.028a44.908 44.908 0 0 0-1.255-1.98c.07-.109.141-.224.211-.327 1.12-1.667 2.118-2.602 3.358-2.602zm-10.201.553c1.265 0 2.058.791 2.675 1.446.307.327.737.871 1.234 1.579l-1.02 1.566c-.757 1.163-1.882 3.017-2.837 4.338-1.191 1.649-1.81 1.817-2.486 1.817-.524 0-1.038-.237-1.383-.794-.263-.426-.464-1.13-.464-2.046 0-2.221.63-4.535 1.66-6.088.454-.687.964-1.226 1.533-1.533a2.264 2.264 0 0 1 1.088-.285z"
                      fill="currentColor"
                    />
                  </svg>
                  <span className="sr-only">Đăng ký với Meta</span>
                </Button>
              </Field>

              <FieldDescription className="text-center">
                Đã có tài khoản? <a href="/login" className="text-primary hover:underline font-medium">Đăng nhập</a>
              </FieldDescription>
            </FieldGroup>
          </form>
          <div className="bg-muted relative hidden md:block">
            <img
              src="fabric.jpg"
              alt="Register background"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        Bằng cách đăng ký, bạn đồng ý với <a href="/terms" className="underline">Điều khoản dịch vụ</a>{' '}
        và <a href="/privacy" className="underline">Chính sách bảo mật</a>.
      </FieldDescription>
    </div>
  );
};

export default RegisterForm;
