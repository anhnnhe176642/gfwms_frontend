'use client';

import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { RouteConfig } from '@/config/routes';
import { ROUTES } from '@/config/routes';

export type UseRouteAccessResult = {
  canAccess: (routeConfig: RouteConfig) => boolean;
  canAccessPath: (path: string) => boolean;
  getAccessibleRoutes: (routeGroup: any) => RouteConfig[];
};

/**
 * Hook để kiểm tra quyền truy cập routes
 * 
 * @example
 * const { canAccess, getAccessibleRoutes } = useRouteAccess();
 * 
 * if (canAccess(ROUTES.ADMIN.USERS.LIST)) {
 *   // User có quyền truy cập
 * }
 * 
 * const adminRoutes = getAccessibleRoutes(ROUTES.ADMIN);
 */
export function useRouteAccess(): UseRouteAccessResult {
  const { hasPermission, isAuthenticated } = useAuth();

  const canAccess = useMemo(() => {
    return (routeConfig: RouteConfig): boolean => {
      // Public routes always accessible
      if (routeConfig.isPublic) {
        return true;
      }

      // Must be authenticated for protected routes
      if (!isAuthenticated) {
        return false;
      }

      // No permission required, just auth
      if (
        !routeConfig.requiredPermission &&
        !routeConfig.requiredPermissions &&
        !routeConfig.anyPermissions
      ) {
        return true;
      }

      // Check single permission
      if (routeConfig.requiredPermission) {
        return hasPermission(routeConfig.requiredPermission);
      }

      // Check multiple permissions (AND)
      if (routeConfig.requiredPermissions) {
        return routeConfig.requiredPermissions.every(p => hasPermission(p));
      }

      // Check any permissions (OR)
      if (routeConfig.anyPermissions) {
        return routeConfig.anyPermissions.some(p => hasPermission(p));
      }

      return false;
    };
  }, [hasPermission, isAuthenticated]);

  const canAccessPath = useMemo(() => {
    return (path: string): boolean => {
      // Simple implementation - you can enhance with route matching
      const allRoutes = getAllRoutesFlat(ROUTES);
      const route = allRoutes.find(r => r.path === path);
      if (!route) return false;
      return canAccess(route);
    };
  }, [canAccess]);

  const getAccessibleRoutes = useMemo(() => {
    return (routeGroup: any): RouteConfig[] => {
      const routes = getAllRoutesFlat(routeGroup);
      return routes.filter(route => canAccess(route));
    };
  }, [canAccess]);

  return {
    canAccess,
    canAccessPath,
    getAccessibleRoutes,
  };
}

// Helper function
function getAllRoutesFlat(obj: any): RouteConfig[] {
  const routes: RouteConfig[] = [];
  
  const extract = (o: any) => {
    for (const value of Object.values(o)) {
      if (value && typeof value === 'object') {
        if ('path' in value && 'name' in value) {
          routes.push(value as RouteConfig);
        } else {
          extract(value);
        }
      }
    }
  };
  
  extract(obj);
  return routes;
}

export default useRouteAccess;
