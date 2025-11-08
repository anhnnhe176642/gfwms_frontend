'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

/**
 * Hook để quản lý navigation đơn giản
 * - Quay lại parent path (xóa segment cuối cùng)
 * Ví dụ:
 *   /a/b/c → back → /a/b → back → /a
 */
export const useNavigation = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  /**
   * Tính toán parent path bằng cách xóa segment cuối cùng
   * VD: /admin/warehouses/123/shelves/456 → /admin/warehouses/123/shelves
   * VD: /admin/warehouses/123/shelves → /admin/warehouses/123
   * VD: /admin/warehouses/123 → /admin/warehouses
   */
  const getParentPath = useCallback((path: string): string => {
    const segments = path.split('/').filter(Boolean);
    if (segments.length <= 1) {
      return '/admin/dashboard'; // Fallback cuối cùng
    }
    segments.pop();
    return '/' + segments.join('/');
  }, []);

  /**
   * Quay lại: thử back trước, nếu fail (không có history) thì về parent path
   */
  const handleGoBack = useCallback(() => {
    if (!isClient) return;

    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(getParentPath(pathname));
    }
  }, [router, pathname, isClient, getParentPath]);

  /**
   * Điều hướng đến một đường dẫn cụ thể
   */
  const navigateTo = useCallback((path: string) => {
    router.push(path);
  }, [router]);

  return {
    handleGoBack,
    navigateTo,
    getParentPath,
    currentPath: pathname,
  };
};
