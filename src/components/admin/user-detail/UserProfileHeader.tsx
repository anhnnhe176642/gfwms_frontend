'use client';

import { UserListItem } from '@/types/user';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatters } from '@/lib/formatters';
import { Mail, Phone, MapPin, Calendar, User, Shield } from 'lucide-react';
import { USER_STATUS_CONFIG } from '@/constants/user';
import Image from 'next/image';

interface UserProfileHeaderProps {
  user: UserListItem;
  isLoading?: boolean;
}

const genderLabels: Record<string, string> = {
  MALE: 'Nam',
  FEMALE: 'Nữ',
};

export function UserProfileHeader({ user, isLoading }: UserProfileHeaderProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="space-y-4">
            <div className="h-32 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
            <div className="h-4 bg-muted rounded animate-pulse w-1/3" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const emailVerifiedLabel = user.emailVerified ? 'Đã xác thực' : 'Chưa xác thực';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin người dùng</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Header Section with Avatar */}
          <div className="flex flex-col sm:flex-row gap-6 pb-6 border-b">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {user.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.fullname || user.username}
                  width={120}
                  height={120}
                  className="h-32 w-32 rounded-lg object-cover border"
                />
              ) : (
                <div className="h-32 w-32 rounded-lg bg-muted flex items-center justify-center border">
                  <User className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="flex-1">
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-foreground">
                  {user.fullname || user.username}
                </h2>
                <p className="text-sm text-muted-foreground">@{user.username}</p>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <Badge value={user.status} config={USER_STATUS_CONFIG as any} />
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                  Email: {emailVerifiedLabel}
                </span>
                {user.role && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium border bg-transparent flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    {user.role.name}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                {user.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4 flex-shrink-0" />
                    <span>{user.phone}</span>
                  </div>
                )}
                {user.address && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span>{user.address}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Detailed Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Liên hệ
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium break-all">{user.email}</p>
                </div>
                {user.phone && (
                  <div>
                    <p className="text-xs text-muted-foreground">Điện thoại</p>
                    <p className="font-medium">{user.phone}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <User className="h-4 w-4" />
                Thông tin cá nhân
              </h3>
              <div className="space-y-3">
                {user.gender && (
                  <div>
                    <p className="text-xs text-muted-foreground">Giới tính</p>
                    <p className="font-medium">{genderLabels[user.gender] || user.gender}</p>
                  </div>
                )}
                {user.dob && (
                  <div>
                    <p className="text-xs text-muted-foreground">Ngày sinh</p>
                    <p className="font-medium">{formatters.formatDate(user.dob)}</p>
                  </div>
                )}
                {user.address && (
                  <div>
                    <p className="text-xs text-muted-foreground">Địa chỉ</p>
                    <p className="font-medium">{user.address}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span>Tạo: {formatters.formatDate(user.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span>Cập nhật: {formatters.formatDate(user.updatedAt)}</span>
            </div>
            {user.emailVerifiedAt && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 flex-shrink-0" />
                <span>Email xác thực: {formatters.formatDate(user.emailVerifiedAt)}</span>
              </div>
            )}
            {user.lastLogin && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 flex-shrink-0" />
                <span>Đăng nhập cuối: {formatters.formatDate(user.lastLogin)}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}