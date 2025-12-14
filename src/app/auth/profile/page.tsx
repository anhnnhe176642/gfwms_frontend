'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { IsLoading } from '@/components/common/IsLoading';
import { ROUTES } from '@/config/routes';
import { profileService } from '@/services/profile.service';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { AvatarUpload } from '@/components/profile/AvatarUpload';
import { ProfileChangePasswordForm } from '@/components/profile/ProfileChangePasswordForm';
import { getServerErrorMessage } from '@/lib/errorHandler';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { User, Lock, Image as ImageIcon } from 'lucide-react';
import type { ProfileUser } from '@/types/user';
import { useAuth } from '@/hooks/useAuth';

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');
  const router = useRouter();
  const { user: authUser } = useAuth();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const response = await profileService.getProfile();
      setProfile(response.user);
    } catch (err: any) {
      const errorMsg = getServerErrorMessage(err) || 'Không thể tải thông tin profile';
      toast.error(errorMsg);
      
      // If 401, redirect to login
      if (err.response?.status === 401) {
        router.push('/auth/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = (updatedUser: ProfileUser) => {
    setProfile(updatedUser);
  };

  const handleAvatarUpdate = (avatarUrl: string) => {
    if (profile) {
      setProfile({ ...profile, avatar: avatarUrl });
    }
  };

  if (isLoading) {
    return <IsLoading />;
  }

  if (!profile) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-muted-foreground">
            Không thể tải thông tin profile
          </p>
          <button
            onClick={fetchProfile}
            className="mt-4 text-primary hover:underline"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute routeConfig={ROUTES.PROFILE.VIEW}>
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Hồ sơ cá nhân</h1>
            <p className="text-muted-foreground">
              Quản lý thông tin cá nhân và các cài đặt khác
            </p>
          </div>

          {/* Main Layout: Avatar/Info on left, Tabs on right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Sidebar - Profile Info */}
            <div className="lg:col-span-3">
              <Card>
                <CardContent className="pt-6">
                  {/* Avatar */}
                  <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-muted mx-auto mb-4">
                    {profile.avatar ? (
                      <img
                        src={profile.avatar}
                        alt="Avatar"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted">
                        <User className="h-16 w-16 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Profile Info */}
                  <div className="text-center space-y-3">
                    <div>
                      <h2 className="text-xl font-semibold">{profile.fullname || profile.username}</h2>
                      <p className="text-sm text-muted-foreground">@{profile.username}</p>
                    </div>

                    <p className="text-sm text-muted-foreground wrap-break-word">{profile.email}</p>

                    {/* Status Badges */}
                    <div className="flex flex-col gap-2 pt-2">
                      <span className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium ${
                        profile.status === 'ACTIVE' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                      }`}>
                        {profile.status === 'ACTIVE' ? 'Hoạt động' : profile.status}
                      </span>
                      <span className="inline-flex items-center justify-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {profile.role.name}
                      </span>
                    </div>

                    {/* Profile Stats */}
                    <div className="border-t pt-4 space-y-2 text-sm">
                      {profile.phone && (
                        <div>
                          <p className="text-muted-foreground text-xs">Số điện thoại</p>
                          <p className="font-medium">{profile.phone}</p>
                        </div>
                      )}
                      {profile.address && (
                        <div>
                          <p className="text-muted-foreground text-xs">Địa chỉ</p>
                          <p className="font-medium">{profile.address}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Content - Tabs */}
            <div className="lg:col-span-9">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-3 lg:grid-cols-3">
                  <TabsTrigger value="info" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">Thông tin</span>
                  </TabsTrigger>
                  <TabsTrigger value="avatar" className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">Avatar</span>
                  </TabsTrigger>
                  <TabsTrigger value="password" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    <span className="hidden sm:inline">Mật khẩu</span>
                  </TabsTrigger>
                </TabsList>

                {/* Tab: Personal Info */}
                <TabsContent value="info">
                  <ProfileForm user={profile} onSuccess={handleProfileUpdate} />
                </TabsContent>

                {/* Tab: Avatar */}
                <TabsContent value="avatar">
                  <AvatarUpload user={profile} onSuccess={handleAvatarUpdate} />
                </TabsContent>

                {/* Tab: Password */}
                <TabsContent value="password">
                  <ProfileChangePasswordForm />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
