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
        router.push('/login');
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
      <div className="container mx-auto max-w-5xl py-8">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Hồ sơ cá nhân</h1>
          <p className="text-muted-foreground">
            Quản lý thông tin cá nhân, avatar và mật khẩu của bạn
          </p>
        </div>

        {/* Profile Info Banner */}
        <div className="mb-6 rounded-lg border bg-card p-6">
          <div className="flex items-start gap-4">
            <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-muted">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt="Avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted">
                  <User className="h-10 w-10 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold">{profile.fullname || profile.username}</h2>
              <p className="text-sm text-muted-foreground">@{profile.username}</p>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  profile.status === 'ACTIVE' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                }`}>
                  {profile.status === 'ACTIVE' ? 'Hoạt động' : profile.status}
                </span>
                <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {profile.role.name}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
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

          <TabsContent value="info">
            <ProfileForm user={profile} onSuccess={handleProfileUpdate} />
          </TabsContent>

          <TabsContent value="avatar">
            <AvatarUpload user={profile} onSuccess={handleAvatarUpdate} />
          </TabsContent>

          <TabsContent value="password">
            <ProfileChangePasswordForm />
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
}
