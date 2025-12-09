'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import {
  UserProfileHeader,
  UserStatsOverview,
  ActivityMetrics,
  ActivityTimeline,
  UserStoresSelect,
  UserWarehousesSelect,
} from '@/components/admin/user-detail';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/config/routes';
import { PERMISSIONS } from '@/constants/permissions';
import { userService } from '@/services/user.service';
import { useAuth } from '@/hooks/useAuth';
import { UserListItem, UserStatsData, UserActivityDashboard, UserPermissionsData } from '@/types/user';
import { getServerErrorMessage, getErrorStatus } from '@/lib/errorHandler';
import { toast } from 'sonner';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { hasPermission } = useAuth();
  const userId = params.id as string;

  const [user, setUser] = useState<UserListItem | null>(null);
  const [stats, setStats] = useState<UserStatsData | null>(null);
  const [activities, setActivities] = useState<UserActivityDashboard | null>(null);
  const [userPermissions, setUserPermissions] = useState<UserPermissionsData | null>(null);

  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(true);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingUser(true);
        setError(null);

        // Fetch user details
        const response = await userService.getUserById(userId);
        // Transform API response to UserListItem format for compatibility
        const userData: UserListItem = {
          id: response.user.id,
          username: response.user.username,
          email: response.user.email,
          phone: response.user.phone,
          avatar: response.user.avatar,
          gender: response.user.gender,
          address: response.user.address,
          dob: response.user.dob,
          fullname: response.user.fullname,
          status: response.user.status,
          emailVerified: response.user.emailVerified,
          emailVerifiedAt: response.user.emailVerifiedAt,
          createdAt: response.user.createdAt,
          updatedAt: response.user.updatedAt,
          role: {
            name: response.user.role,
          },
          creditRegistration: response.user.creditRegistration,
          lastLogin: undefined,
        };
        setUser(userData);
      } catch (err) {
        const message = getServerErrorMessage(err);
        setError(message || 'Không thể tải thông tin người dùng');
        toast.error(message || 'Lỗi khi tải thông tin người dùng');
        
        // Redirect if user not found
        if (getErrorStatus(err) === 404) {
          setTimeout(() => router.push('/admin/users'), 2000);
        }
      } finally {
        setIsLoadingUser(false);
      }
    };

    fetchData();
  }, [userId, router]);

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      try {
        setIsLoadingStats(true);
        const statsData = await userService.getUserStats(userId);
        setStats(statsData.data);
      } catch (err) {
        console.error('Failed to fetch user stats:', err);
        toast.error('Không thể tải thống kê người dùng');
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchStats();
  }, [user, userId]);

  useEffect(() => {
    if (!user) return;

    const fetchActivities = async () => {
      try {
        setIsLoadingActivities(true);
        const activitiesData = await userService.getUserActivityDashboard(userId);
        setActivities(activitiesData.data);
      } catch (err) {
        console.error('Failed to fetch user activities:', err);
        toast.error('Không thể tải hoạt động người dùng');
      } finally {
        setIsLoadingActivities(false);
      }
    };

    fetchActivities();
  }, [user, userId]);

  useEffect(() => {
    if (!user) return;

    const fetchPermissions = async () => {
      try {
        setIsLoadingPermissions(true);
        const permissionsData = await userService.getUserPermissions(userId);
        setUserPermissions(permissionsData.data);
      } catch (err) {
        console.error('Failed to fetch user permissions:', err);
        toast.error('Không thể tải quyền của người dùng');
      } finally {
        setIsLoadingPermissions(false);
      }
    };

    fetchPermissions();
  }, [user, userId]);

  const handleGoBack = () => {
    router.back();
  };

  if (error && isLoadingUser) {
    return (
      <ProtectedRoute routeConfig={ROUTES.ADMIN.USERS.DETAIL}>
        <div className="container mx-auto py-8 px-4">
          <Card className="border-red-500">
            <CardHeader>
              <CardTitle className="text-red-600">Lỗi</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <Button onClick={handleGoBack}>Quay lại</Button>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute routeConfig={ROUTES.ADMIN.USERS.DETAIL}>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGoBack}
            className="gap-2 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Chi tiết người dùng</h1>
        </div>

        {/* Loading State */}
        {isLoadingUser && (
          <Card>
            <CardContent className="py-8 flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-muted-foreground">Đang tải thông tin...</p>
            </CardContent>
          </Card>
        )}

        {/* User Profile Header */}
        {user && <UserProfileHeader user={user} isLoading={isLoadingUser} />}

        {/* User Stores Select & User Warehouses Select - Hiển thị cạnh nhau */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Stores Select - Hiển thị nếu:
              1. User hiện tại có quyền MANAGE_MANAGERS của STORES
              2. User được xem có quyền MANAGER của STORES
          */}
          {user && 
            hasPermission(PERMISSIONS.STORES.MANAGE_MANAGERS.key) && 
            userPermissions?.permissions?.some((p) => p.key === PERMISSIONS.STORES.MANAGER.key) && (
            <UserStoresSelect userId={userId} />
          )}

          {/* User Warehouses Select - Hiển thị nếu:
              1. User hiện tại có quyền MANAGE_MANAGERS của WAREHOUSES
              2. User được xem có quyền MANAGER của WAREHOUSES
          */}
          {user && 
            hasPermission(PERMISSIONS.WAREHOUSES.MANAGE_MANAGERS.key) && 
            userPermissions?.permissions?.some((p) => p.key === PERMISSIONS.WAREHOUSES.MANAGER.key) && (
            <UserWarehousesSelect userId={userId} />
          )}
        </div>

        {/* User Stats Overview */}
        {stats && (
          <div className="mt-8">
            <UserStatsOverview stats={stats} isLoading={isLoadingStats} />
          </div>
        )}

        {/* Activity Metrics & Timeline */}
        {activities && (
          <div className="mt-8 space-y-6">
            <ActivityMetrics dashboard={activities} isLoading={isLoadingActivities} />
            <ActivityTimeline
              activities={activities.activityTimeline.recentActivities || []}
              isLoading={isLoadingActivities}
            />
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
