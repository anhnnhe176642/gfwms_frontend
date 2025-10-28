'use client';

import { UnauthorizedPage } from '@/components/common/UnauthorizedPage';

/**
 * Trang 403 - Forbidden
 * Hiển thị khi user không có quyền truy cập
 */
export default function ForbiddenPage() {
  return (
    <UnauthorizedPage
      title="403 - Truy cập bị từ chối"
      message="Bạn không có quyền truy cập tài nguyên này. Vui lòng liên hệ quản trị viên nếu bạn cho rằng đây là lỗi."
      showBackButton={true}
      showHomeButton={true}
    />
  );
}
