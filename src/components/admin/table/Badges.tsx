import type { UserStatus, UserRole } from '@/types/user';
import { Badge } from '@/components/ui/badge';
import { USER_STATUS_CONFIG, USER_ROLE_CONFIG } from '@/constants/user';

type StatusBadgeProps = {
  status: UserStatus;
};

/**
 * Status badge component for users
 * Uses generic Badge component with user status config
 */
export function StatusBadge({ status }: StatusBadgeProps) {
  return <Badge value={status} config={USER_STATUS_CONFIG} />;
}

type RoleBadgeProps = {
  role: UserRole;
};

/**
 * Role badge component for users
 * Uses generic Badge component with user role config
 */
export function RoleBadge({ role }: RoleBadgeProps) {
  return <Badge value={role} config={USER_ROLE_CONFIG} />;
}
