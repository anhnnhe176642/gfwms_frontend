'use client';

import { useState, useEffect } from 'react';
import { useFormValidation } from '@/hooks/useFormValidation';
import { updateProfileSchema, type UpdateProfileFormData } from '@/schemas/profile.schema';
import { profileService } from '@/services/profile.service';
import { extractFieldErrors, getServerErrorMessage } from '@/lib/errorHandler';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import type { ProfileUser } from '@/types/user';

interface ProfileFormProps {
  user: ProfileUser;
  onSuccess?: (updatedUser: ProfileUser) => void;
}

export function ProfileForm({ user, onSuccess }: ProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string>('');

  // Format dob for input (YYYY-MM-DD)
  const formatDateForInput = (dateString: string | null): string => {
    if (!dateString) return '';
    try {
      return dateString.split('T')[0];
    } catch {
      return '';
    }
  };

  const { values, errors, touched, handleChange, handleBlur, handleSubmit, setFieldErrors, setFieldValue, resetForm } =
    useFormValidation<UpdateProfileFormData>(updateProfileSchema, async (data) => {
      setIsSubmitting(true);
      setServerError('');

      try {
        // Convert date string to proper format and remove empty values
        const payload: any = {};
        
        if (data.fullname) payload.fullname = data.fullname;
        if (data.phone) payload.phone = data.phone;
        if (data.gender) payload.gender = data.gender;
        if (data.address) payload.address = data.address;
        if (data.dob) {
          // dob is already a Date from yup transform, convert to string
          const dobDate = data.dob as unknown as Date;
          payload.dob = dobDate.toISOString().split('T')[0];
        }

        const response = await profileService.updateProfile(payload);
        
        toast.success(response.message || 'Cập nhật profile thành công');
        
        if (onSuccess) {
          onSuccess(response.user);
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

  // Initialize form with user data
  useEffect(() => {
    resetForm({
      fullname: user.fullname || '',
      phone: user.phone || '',
      gender: user.gender || undefined,
      address: user.address || '',
      dob: user.dob ? (new Date(user.dob) as any) : undefined,
    });
  }, [user, resetForm]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin cá nhân</CardTitle>
        <CardDescription>
          Cập nhật thông tin cá nhân của bạn. Username và email không thể thay đổi.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username (read-only) */}
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={user.username}
              disabled
              className="bg-muted"
            />
          </div>

          {/* Email (read-only) */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={user.email}
              disabled
              className="bg-muted"
            />
          </div>

          {/* Fullname */}
          <div className="space-y-2">
            <Label htmlFor="fullname">Họ và tên</Label>
            <Input
              id="fullname"
              name="fullname"
              value={values.fullname || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Nhập họ và tên"
            />
            {touched.fullname && errors.fullname && (
              <p className="text-sm text-destructive">{errors.fullname}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Số điện thoại</Label>
            <Input
              id="phone"
              name="phone"
              value={values.phone || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="+84123456789"
            />
            {touched.phone && errors.phone && (
              <p className="text-sm text-destructive">{errors.phone}</p>
            )}
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <Label htmlFor="gender">Giới tính</Label>
            <Select
              name="gender"
              value={values.gender || ''}
              onValueChange={(value) => {
                setFieldValue('gender', value as 'MALE' | 'FEMALE');
              }}
            >
              <SelectTrigger id="gender">
                <SelectValue placeholder="Chọn giới tính" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MALE">Nam</SelectItem>
                <SelectItem value="FEMALE">Nữ</SelectItem>
              </SelectContent>
            </Select>
            {touched.gender && errors.gender && (
              <p className="text-sm text-destructive">{errors.gender}</p>
            )}
          </div>

          {/* Date of Birth */}
          <div className="space-y-2">
            <Label htmlFor="dob">Ngày sinh</Label>
            <Input
              id="dob"
              name="dob"
              type="date"
              value={
                values.dob 
                  ? values.dob instanceof Date 
                    ? values.dob.toISOString().split('T')[0] 
                    : ''
                  : ''
              }
              onChange={(e) => {
                const dateValue = e.target.value ? new Date(e.target.value) : null;
                setFieldValue('dob', dateValue);
              }}
              onBlur={handleBlur}
              max={new Date().toISOString().split('T')[0]}
            />
            {touched.dob && errors.dob && (
              <p className="text-sm text-destructive">{errors.dob}</p>
            )}
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Địa chỉ</Label>
            <Input
              id="address"
              name="address"
              value={values.address || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Nhập địa chỉ"
            />
            {touched.address && errors.address && (
              <p className="text-sm text-destructive">{errors.address}</p>
            )}
          </div>

          {/* Server Error */}
          {serverError && (
            <div className="rounded-md bg-destructive/15 p-3">
              <p className="text-sm text-destructive">{serverError}</p>
            </div>
          )}

          {/* Submit Button */}
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật thông tin'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
