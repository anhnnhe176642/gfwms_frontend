'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { UnauthorizedPage } from './UnauthorizedPage';
import type { RouteConfig } from '@/config/routes';

export type ProtectedRouteProps = {
  children: React.ReactNode;
  routeConfig?: RouteConfig;
  requiredPermission?: string;
  requiredPermissions?: string[];
  anyPermissions?: string[];
  fallbackPath?: string;
  showUnauthorizedPage?: boolean; // Hiển thị trang "Không có quyền" thay vì redirect
  unauthorizedMessage?: string;
};

/**
 * Component bảo vệ route với kiểm tra quyền
 * 
 * @example
 * // Sử dụng với routeConfig
 * <ProtectedRoute routeConfig={ROUTES.ADMIN.USERS.LIST}>
 *   <UserListPage />
 * </ProtectedRoute>
 * 
 * @example
 * // Sử dụng với permission cụ thể
 * <ProtectedRoute requiredPermission={PERMISSIONS.USERS.VIEW_LIST.key}>
 *   <UserListPage />
 * </ProtectedRoute>
 * 
 * @example
 * // Yêu cầu nhiều permissions (AND)
 * <ProtectedRoute requiredPermissions={[PERMISSIONS.USERS.VIEW_LIST.key, PERMISSIONS.USERS.UPDATE.key]}>
 *   <UserEditPage />
 * </ProtectedRoute>
 * 
 * @example
 * // Yêu cầu bất kỳ permission nào (OR)
 * <ProtectedRoute anyPermissions={[PERMISSIONS.CREDITS.VIEW_LIST.key, PERMISSIONS.CREDITS.VIEW_OWN.key]}>
 *   <CreditListPage />
 * </ProtectedRoute>
 * 
 * @example
 * // Hiển thị trang "Không có quyền" thay vì redirect
 * <ProtectedRoute 
 *   routeConfig={ROUTES.ADMIN.USERS.LIST}
 *   showUnauthorizedPage={true}
 *   unauthorizedMessage="Bạn cần quyền quản trị viên để truy cập trang này"
 * >
 *   <UserListPage />
 * </ProtectedRoute>
 */
export function ProtectedRoute({
  children,
  routeConfig,
  requiredPermission,
  requiredPermissions,
  anyPermissions,
  fallbackPath = '/admin/dashboard',
  showUnauthorizedPage = true, // Mặc định hiển thị trang "Không có quyền"
  unauthorizedMessage,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, hasPermission, isReady } = useAuth();

  useEffect(() => {
    if (!isReady) return;

    // Check authentication first
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
  }, [isAuthenticated, isReady, router]);

  // Show loading while checking
  if (!isReady) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-500">Đang tải...</p>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // If route is public, render children
  if (routeConfig?.isPublic) {
    return <>{children}</>;
  }

  // Determine which permissions to check
  const permToCheck = routeConfig?.requiredPermission || requiredPermission;
  const permsToCheck = routeConfig?.requiredPermissions || requiredPermissions;
  const anyPermsToCheck = routeConfig?.anyPermissions || anyPermissions;

  // No permission required, just authenticated
  if (!permToCheck && !permsToCheck && !anyPermsToCheck) {
    return <>{children}</>;
  }

  let hasAccess = true;
  let deniedPermission: string | undefined;

  // Check single permission
  if (permToCheck) {
    hasAccess = hasPermission(permToCheck);
    if (!hasAccess) deniedPermission = permToCheck;
  }

  // Check multiple permissions (AND logic)
  if (permsToCheck && permsToCheck.length > 0) {
    hasAccess = permsToCheck.every(p => hasPermission(p));
    if (!hasAccess) deniedPermission = permsToCheck.join(', ');
  }

  // Check any permissions (OR logic)
  if (anyPermsToCheck && anyPermsToCheck.length > 0) {
    hasAccess = anyPermsToCheck.some(p => hasPermission(p));
    if (!hasAccess) deniedPermission = anyPermsToCheck.join(' hoặc ');
  }

  // User has access, render children
  if (hasAccess) {
    return <>{children}</>;
  }

  // User doesn't have access
  if (showUnauthorizedPage) {
    const defaultMessage = 'Bạn không có quyền truy cập trang này. Vui lòng liên hệ quản trị viên để được cấp quyền.';
    const descriptionMessage = routeConfig?.description
      ? `Bạn không có quyền truy cập "${routeConfig.description}". Vui lòng liên hệ quản trị viên để được cấp quyền.`
      : defaultMessage;

    return (
      <UnauthorizedPage
        title="Không có quyền truy cập"
        message={unauthorizedMessage || descriptionMessage}
        requiredPermission={deniedPermission}
      />
    );
  }

  // Fallback: redirect (legacy behavior)
  router.push(fallbackPath);
  return null;
}

export default ProtectedRoute;
